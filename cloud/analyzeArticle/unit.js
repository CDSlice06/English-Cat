// 学习单元构建：语法点（含双向练习）与词组固定搭配
const { RULES, FALLBACK, matchRules, clauseCount } = require('./grammar')
const { findPhrases } = require('./phrases')

function tokenCount(sentence) {
  return (String(sentence).toLowerCase().match(/[a-z][a-z']*/g) || []).length
}

function clipText(value, max) {
  return String(value || '').trim().slice(0, max)
}

// 规则兜底卡也要有分步讲解：AI 还没就绪时，用户同样能一步步把句子拆开看懂
function ruleSteps(rule, sentence) {
  const words = tokenCount(sentence)
  const head = (String(sentence).match(/[A-Za-z][A-Za-z'’]*/g) || []).slice(0, 8).join(' ')
  return [
    {
      title: '先断开长句',
      detail: `全句 ${words} 个词。先按逗号、分号和 that / which / who / whether / if 这类引导词把句子切成两截：一截是主干，一截是修饰成分，不要一上来就逐词翻译。`
    },
    {
      title: '找出主干主谓',
      detail: `在主干里找谁在做动作。先看句首「${head}…」：如果它本身就是一个完整的主谓，它就是主干；如果只是时间、条件或介词短语，真正的主语和谓语通常跟在它后面。`
    },
    {
      title: '认出这个结构',
      detail: `判断这句属于「${rule.label}」，再从原句里把标志性的引导词或结构圈出来，确认它确实是这个结构，而不是碰巧长得像。`
    },
    {
      title: '换成中文语序',
      detail: clipText(rule.translation, 150)
    },
    {
      title: '连成一句话',
      detail: '按中文习惯重新排：先交代时间、条件、对象，再说动作和结论；从句拆成短句，定语放到名词前面，连起来读一遍看是否通顺。'
    }
  ]
}

function toGrammarPoint(rule, sentence, index) {
  const id = `g${index + 1}`
  const drills = []
  if (rule.en2zh) {
    drills.push({
      id: `${id}d1`,
      kind: 'grammar',
      mode: 'en2zh',
      modeLabel: '英译汉',
      pattern: rule.label,
      prompt: rule.en2zh.prompt,
      reference: rule.en2zh.reference,
      keywords: rule.en2zh.keywords || [],
      hint: `先认出「${rule.label}」，再按中文语序重组，不要逐词硬译。`
    })
  }
  if (rule.zh2en) {
    drills.push({
      id: `${id}d2`,
      kind: 'grammar',
      mode: 'zh2en',
      modeLabel: '汉译英',
      pattern: rule.label,
      prompt: rule.zh2en.prompt,
      reference: rule.zh2en.reference,
      keywords: rule.zh2en.keywords || [],
      hint: `用「${rule.label}」的结构写，把主语、谓语和结构成分都按顺序写全。`
    })
  }
  return {
    id,
    key: rule.key,
    pattern: rule.label,
    sentence,
    words: tokenCount(sentence),
    understanding: rule.understanding,
    steps: ruleSteps(rule, sentence).filter((step) => step.detail),
    translation: rule.translation,
    examples: (rule.examples || []).slice(0, 2),
    drills
  }
}

// 逐句扫描：命中规则的句子生成语法点；同一句型只讲一次，同一句子只出一组题
// 第二遍再补：仍未被任何卡片覆盖的长句，给一张嵌套从句拆解
// skipKeys：语法本里已经收藏过的语法点，不再重复出现
function normGrammarKey(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '')
}

function buildGrammarPoints(sentences, maxPoints = 16, skipKeys) {
  const skip = skipKeys instanceof Set ? skipKeys : new Set()
  const NESTED = RULES.find((rule) => rule.key === 'nested-clauses')
  // 已经收藏过的句型直接跳过，连兜底的长句拆解也不再重复讲
  const usable = RULES.filter((rule) => !skip.has(normGrammarKey(rule.key))
    && !skip.has(normGrammarKey(rule.label)))
  const skippedNested = !usable.some((rule) => rule.key === 'nested-clauses')
  const MAX_PER_RULE = 1
  const points = []
  const ruleUses = new Map()
  const covered = new Set()
  const seenPairs = new Set()
  const usedSentences = new Set()
  const candidates = sentences
    .map((sentence) => String(sentence).trim())
    .filter((sentence) => sentence)
    .map((sentence) => ({ sentence, words: tokenCount(sentence), clauses: clauseCount(sentence) }))
    .filter((item) => item.words >= 10)
    .sort((a, b) => b.words - a.words)

  const pushPoint = (rule, sentence) => {
    const pair = `${rule.key}|${sentence}`
    if (seenPairs.has(pair)) return
    if (usedSentences.has(sentence)) return
    seenPairs.add(pair)
    usedSentences.add(sentence)
    ruleUses.set(rule.key, (ruleUses.get(rule.key) || 0) + 1)
    covered.add(sentence)
    points.push(toGrammarPoint(rule, sentence, points.length))
  }

  const items = candidates.map((item) => ({ ...item, hits: matchRules(item.sentence, usable) }))

  // 第一遍：先把每种结构都讲到（广度优先）
  for (const item of items) {
    for (const rule of item.hits) {
      if (points.length >= maxPoints) break
      if (ruleUses.has(rule.key)) continue
      pushPoint(rule, item.sentence)
    }
  }

  for (const item of candidates) {
    if (!NESTED || skippedNested) break
    if (points.length >= maxPoints) break
    if (covered.has(item.sentence)) continue
    if (item.clauses < 2 || item.words < 16) continue
    if ((ruleUses.get(NESTED.key) || 0) >= MAX_PER_RULE) break
    pushPoint(NESTED, item.sentence)
  }

  // 兜底：整篇没有命中任何句型时，至少给一条长句拆解
  if (!points.length && candidates.length) {
    points.push(toGrammarPoint(FALLBACK, candidates[0].sentence, 0))
  }
  return points
}

// 词组按原文出现顺序全量收录，只跳过词组本里已经记住的搭配
function buildPhrases(text, limit = 60, skipKeys) {
  const skip = skipKeys instanceof Set ? skipKeys : new Set()
  const norm = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim()
  return findPhrases(text)
    .filter((item) => !skip.has(norm(item.canonical)) && !skip.has(norm(item.phrase)))
    .slice(0, limit)
    .map((item, index) => ({
      id: `ph${index + 1}`,
      phrase: item.canonical,
      matched: item.phrase,
      pos: 'phr.',
      meaning: item.meaning,
      note: item.note,
      sentence: item.sentence
    }))
}

function escapeWord(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 词条必须真的在正文里以整词（或词表里登记的变形）出现：
// 词形还原偶尔把 rates 还原成 rat，这种词条释义和原文完全对不上。
// 没有登记变形的词条（基础词库）无法证伪，原样保留，避免误删正常词
function appearsInText(word, forms, text) {
  const head = String(word || '').trim().toLowerCase()
  const body = String(text || '')
  if (!head || !body) return true
  const list = [head]
  if (forms && typeof forms === 'object') {
    Object.keys(forms).forEach((key) => {
      const value = forms[key]
      if (typeof value === 'string' && value.trim()) list.push(value.trim().toLowerCase())
    })
  }
  // 只有词条本身、没有任何变形可对照时无法判断，保留
  if (list.length < 2) return true
  const unique = Array.from(new Set(list))
  const pattern = new RegExp(`(^|[^a-z])(${unique.map(escapeWord).join('|')})([^a-z]|$)`, 'i')
  return pattern.test(body)
}

// 丢掉正文里根本没出现过的词条
function pruneVocabulary(vocabulary, text) {
  const list = Array.isArray(vocabulary) ? vocabulary : []
  return list.filter((item) => appearsInText(item && item.word, item && item.forms, text))
}

module.exports = { buildGrammarPoints, buildPhrases, toGrammarPoint, appearsInText, pruneVocabulary }
