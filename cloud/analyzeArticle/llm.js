// 文章解析的 AI 增强层：只做「补充 / 纠错」，不改动既有 id
// 任何一步校验不通过或调用失败，都保留规则引擎的原结果
const cloud = require('wx-server-sdk')
const { pruneVocabulary } = require('./unit')

// 语法讲解缓存走云数据库；初始化不可用时自动跳过缓存，不影响解析主流程
if (typeof cloud.init === 'function') cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = typeof cloud.database === 'function' ? cloud.database() : null

const POS_ALIAS = {
  n: 'n.', v: 'v.', vt: 'v.', vi: 'v.', adj: 'adj.', adv: 'adv.',
  prep: 'prep.', conj: 'conj.', pron: 'pron.', num: 'num.', int: 'int.',
  phr: 'phr.', phrase: 'phr.', aux: 'aux.'
}

// 熔断按任务隔离：words 超时不应该连带把语法精讲也熔断，
// 否则一次词汇补全失败会让整篇文章退回规则示例题
const disabledUntil = {}

function disableTask(task, ms) {
  disabledUntil[task] = Date.now() + ms
}

function raceTimeout(promise, ms, task) {
  let timer = null
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => {
      // 只有真正超时才熔断；参数错误等 400 不应连带拖慢整篇文章
      disableTask(task, 3 * 60 * 1000)
      resolve(null)
    }, ms)
  })
  return Promise.race([promise, timeout]).then((value) => {
    if (timer) clearTimeout(timer)
    return value
  })
}

function call(task, payload, timeoutMs) {
  if (Date.now() < (disabledUntil[task] || 0)) return Promise.resolve(null)
  const started = Date.now()
  const pending = cloud.callFunction({
    name: 'llm',
    data: Object.assign({ task }, payload)
  }).then((res) => {
    const result = (res && res.result) || {}
    if (result.code === 0 && result.data && result.data.content) {
      console.log(`[ai-analyze][${task}] ok`, { ms: Date.now() - started })
      return result.data.content
    }
    if (result.code === 503) disableTask(task, 10 * 60 * 1000)
    else if (result.code === 502 || result.code === 504) disableTask(task, 3 * 60 * 1000)
    console.log(`[ai-analyze][${task}] failed`, { code: result.code || 0, message: result.message || '' })
    return null
  }).catch((error) => {
    disableTask(task, 3 * 60 * 1000)
    console.log(`[ai-analyze][${task}] error`, { message: error && error.message ? error.message : '' })
    return null
  })
  return raceTimeout(pending, timeoutMs, task)
}

function clip(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function normalize(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function normalizeKey(value) {
  return normalize(value)
    .toLowerCase()
    .replace(/^[\s"'“”‘’（(]+/, '')
    .replace(/[\s"'“”‘’）).,;:!?]+$/, '')
}

function tokenCount(value) {
  return (String(value || '').toLowerCase().match(/[a-z][a-z']*/g) || []).length
}

function splitSentences(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 12 && /[a-zA-Z]/.test(item))
}

// 精讲版本：5 表示讲解里点名的术语必须真的出现在原句（旧卡会出现「没 whether 却讲 whether 语序」）
// 版本升级后，旧文章会在下次增强时整体重做，共享缓存也按版本号自动失效
const DRILL_VERSION = 5

function sanitizeExamples(value) {
  if (!Array.isArray(value)) return []
  return value.slice(0, 2).map((item) => ({
    en: clip(item && item.en, 240),
    zh: clip(item && item.zh, 160)
  })).filter((item) => item.en && item.zh)
}

// 只保留字母数字的归一化文本，用于校验分块是不是原文里的逐字片段
function lexKey(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim()
}

// 「怎么理解」的分步拆解：标题 + 说明，至少 2 步才展示
function sanitizeSteps(value) {
  if (!Array.isArray(value)) return []
  const list = value.slice(0, 5).map((item) => ({
    title: clip(item && item.title, 24),
    detail: clip(item && item.detail, 180)
  })).filter((item) => item.title && item.detail && cjkCount(item.detail) >= 6)
  return list.length >= 2 ? list : []
}

// 「怎么翻译」的分块对译：en 必须按原顺序出现在原句里，逐块能对上
function sanitizeChunks(value, sentence) {
  if (!Array.isArray(value)) return []
  const source = lexKey(sentence)
  if (!source) return []
  let cursor = 0
  const list = []
  value.slice(0, 4).forEach((item) => {
    if (list.length >= 4) return
    const en = clip(item && item.en, 160)
    const zh = clip(item && item.zh, 120)
    if (!en || !zh || cjkCount(zh) < 2) return
    const key = lexKey(en)
    if (!key) return
    const at = source.indexOf(key, cursor)
    if (at < 0) return
    cursor = at + key.length
    list.push({ en, zh })
  })
  return list.length >= 2 ? list : []
}

// 全文对照：按自然段分块，段内再按句翻译；译文带段落序号，
// 前端才能把中文还原成和原文一致的分段
const TRANSLATE_BATCH = 8

function splitParagraphs(text) {
  return String(text || '')
    .split(/\n{2,}/)
    .map((block) => block.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function sanitizeFullTranslation(value, entries) {
  if (!Array.isArray(value)) return []
  const byKey = new Map()
  value.forEach((item) => {
    const en = clip(item && item.en, 400)
    const zh = clip(item && item.zh, 400)
    if (!en || !zh || cjkCount(zh) < 2) return
    const key = lexKey(en)
    if (key && !byKey.has(key)) byKey.set(key, zh)
  })
  return entries.map((entry) => {
    const zh = byKey.get(lexKey(entry.sentence))
    return zh ? { en: entry.sentence, zh, para: entry.para } : null
  }).filter(Boolean)
}

async function translateFullText(text, level) {
  // 段落顺序就是原文顺序，para 从 0 开始；超过 100 句的极端长文后面不再翻译
  const entries = []
  splitParagraphs(text).forEach((block, para) => {
    splitSentences(block).forEach((sentence) => {
      if (entries.length < 100) entries.push({ sentence, para })
    })
  })
  if (!entries.length) return []

  // 分批时不跨自然段，避免把两段的句子混在一批里翻译导致段落错位
  const batches = []
  let batch = []
  let lastPara = entries[0].para
  entries.forEach((entry) => {
    if (entry.para !== lastPara || batch.length >= TRANSLATE_BATCH) {
      if (batch.length) batches.push(batch)
      batch = []
      lastPara = entry.para
    }
    batch.push(entry.sentence)
  })
  if (batch.length) batches.push(batch)

  const results = await Promise.all(batches.map((sentences) => call('translate', {
    sentences,
    level
  }, 45000)))
  const byKey = new Map()
  results.forEach((content) => {
    if (!content) return
    const list = Array.isArray(content) ? content : content.sentences
    sanitizeFullTranslation(list, entries).forEach((item) => {
      const key = lexKey(item.en)
      if (key && !byKey.has(key)) byKey.set(key, item)
    })
  })
  const list = entries.map((entry) => byKey.get(lexKey(entry.sentence))).filter(Boolean)
  // 覆盖率太低说明模型调用大面积失败，宁可不缓存也不给用户半篇残缺的对照
  return list.length >= Math.ceil(entries.length * 0.7) ? list : []
}

// 练习句必须是新造的：不能是文章里出现过的任何句子，也不能和语法卡上的例句重复
function sanitizePractice(value, sourceKey, sentenceKeys, exampleKeys) {
  if (!Array.isArray(value)) return []
  const seen = new Set()
  const list = []
  value.forEach((item) => {
    if (list.length >= 2) return
    const en = clip(item && item.en, 240)
    const zh = clip(item && item.zh, 160)
    if (!en || !zh) return
    if (tokenCount(en) < 8 || cjkCount(zh) < 4) return
    const key = normalizeKey(en)
    if (!key || key === sourceKey) return
    if (sentenceKeys.has(key) || exampleKeys.has(key) || seen.has(key)) return
    seen.add(key)
    list.push({ en, zh })
  })
  return list
}

function nextNumber(ids, prefix) {
  let max = 0
  ids.forEach((id) => {
    const match = String(id || '').match(new RegExp(`^${prefix}(\\d+)$`))
    if (match) max = Math.max(max, Number(match[1]) || 0)
  })
  return max + 1
}

// 语法点讲解按「句型」记录：同一个语法点下次出现时，把上次记录作为参考传给模型
const CACHE_COLLECTION = 'grammar_cache'
// 每片 2 条：讲解新增分步理解与分块翻译后单条输出变长，3 条容易超出输出上限
const GRAMMAR_BATCH = 2
const MAX_GRAMMAR = 14
let cacheReady = false

function cacheKey(value) {
  return normalize(value).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '')
}

function cjkCount(value) {
  return (String(value || '').match(/[\u4e00-\u9fa5]/g) || []).length
}

// 句型名里的英文关键词必须真的出现在句子中：
// 标题写「介词+which 定语从句」，句子却只有 that，就属于对不上
const PATTERN_KEYWORDS = new Set(['which', 'who', 'whom', 'whose', 'that', 'whether', 'if', 'where',
  'when', 'with', 'than', 'as', 'so', 'such', 'not', 'only', 'but', 'also', 'rather', 'instead',
  'it', 'what', 'more'])
const BE_FORMS = { be: 'be', am: 'be', is: 'be', are: 'be', was: 'be', were: 'be', been: 'be', being: 'be' }
const HAVE_FORMS = { have: 'have', has: 'have', had: 'have', having: 'have' }
const DO_FORMS = { do: 'do', does: 'do', did: 'do', done: 'do', doing: 'do' }

// 括号里是举例说明，不作为硬性要求；斜杠并列按「任一段命中」处理
function patternSegments(pattern) {
  const core = String(pattern || '').replace(/[（(][^）)]*[）)]/g, ' ').toLowerCase()
  return core.split(/[\/／|]/).map((segment) => {
    const keys = new Set()
    ;(segment.match(/[a-z]+/g) || []).forEach((word) => {
      const base = BE_FORMS[word] || HAVE_FORMS[word] || DO_FORMS[word] || word
      if (PATTERN_KEYWORDS.has(base)) keys.add(base)
    })
    return keys
  }).filter((keys) => keys.size)
}

function containsWord(text, key) {
  if (key === 'be') return /(^|[^a-z])(be|am|is|are|was|were|been|being)([^a-z]|$)/i.test(text)
  if (key === 'have') return /(^|[^a-z])(have|has|had|having)([^a-z]|$)/i.test(text)
  if (key === 'do') return /(^|[^a-z])(do|does|did|done|doing)([^a-z]|$)/i.test(text)
  return new RegExp(`(^|[^a-z])${key}([^a-z]|$)`, 'i').test(text)
}

function patternFitsSentence(pattern, sentence) {
  const text = String(sentence || '')
  const title = String(pattern || '')
  const core = title.replace(/[（(][^）)]*[）)]/g, ' ')
  const segments = patternSegments(title)
  const tokensOk = !segments.length
    || segments.some((keys) => Array.from(keys).every((key) => containsWord(text, key)))
  if (!tokensOk) return false
  // 介词 + which：必须真的是「介词 which」紧挨着出现
  if (/介词/.test(core) && /\bwhich\b/i.test(core)
    && !/\b(in|on|at|for|with|by|of|to|from|about|under|through|among|during|after|before|over|into|upon|within|without|against|beyond)\s+which\b/i.test(text)) {
    return false
  }
  // 非限制性定语从句：必须有逗号/破折号/括号引出的关系词
  if (/非限制/.test(core) && !/([,;]\s*|\s[—–-]\s*|\()\s*(which|who|whom|whose|where|when)\b/i.test(text)) {
    return false
  }
  // 同位语从句：必须有 that 引导
  if (/同位语/.test(core) && !containsWord(text, 'that')) return false
  return true
}

// 讲解正文里点名的引导词必须真的出现在原句里：句中没有 whether / if 却在讲它们的语序，
// 等于把别的句型的话术套到这一句上（翻译反馈里出现过同类问题，用户一眼就能看出对不上）。
// 「不是/并非 whether」这类对比说明不算。
const NEGATED_TERM = /(不是|并非|没有|不用|无需|不含|不涉及|区别于|不同于|而非)[^。；;,.，]{0,8}(whether|if|倒装)/
const EXPLAIN_TERMS = [
  [/whether|if\s*引导/i, /\b(whether|if)\b/i],
  [/倒装/, /\b(not|only|hardly|seldom|never|no sooner|nor)\b/i]
]

function explanationFitsSentence(body, sentence) {
  const text = String(body || '')
  if (!text) return true
  const corpus = String(sentence || '')
  return !EXPLAIN_TERMS.some((pair) => pair[0].test(text) && !pair[1].test(corpus) && !NEGATED_TERM.test(text))
}

async function ensureCacheCollection() {
  if (!db || cacheReady) return
  try {
    await db.createCollection(CACHE_COLLECTION)
  } catch (error) {
    // 集合已存在或当前环境不允许建表，后续读写会各自兜底
  }
  cacheReady = true
}

async function loadGrammarCache(level) {
  if (!db) return []
  try {
    await ensureCacheCollection()
    const res = await db.collection(CACHE_COLLECTION).where({ level }).limit(30).get()
    return (res.data || [])
      .slice()
      .sort((a, b) => (b.hits || 0) - (a.hits || 0))
      .slice(0, 12)
  } catch (error) {
    console.log('[ai-analyze][cache] load failed', { message: error && error.message ? error.message : '' })
    return []
  }
}

async function saveGrammarCache(level, points) {
  if (!db || !points.length) return
  await ensureCacheCollection()
  await Promise.all(points.map(async (point) => {
    const key = cacheKey(point.pattern)
    if (!key) return
    const data = {
      level,
      key,
      pattern: point.pattern,
      structure: point.structure || '',
      usageTip: point.usageTip || '',
      examples: (point.examples || []).slice(0, 1),
      en2zhHint: point.en2zhHint || '',
      zh2enHint: point.zh2enHint || '',
      updatedAt: db.serverDate()
    }
    try {
      let existing = null
      try {
        const found = await db.collection(CACHE_COLLECTION).where({ level, key }).limit(1).get()
        existing = (found.data && found.data[0]) || null
      } catch (error) {
        // 集合还不存在时读取会失败，继续走 add；add 会自动建集合
      }
      if (existing) {
        await db.collection(CACHE_COLLECTION).doc(existing._id).update({
          data: Object.assign({}, data, { hits: (existing.hits || 0) + 1 })
        })
      } else {
        await db.collection(CACHE_COLLECTION).add({
          data: Object.assign({}, data, { hits: 1, createdAt: db.serverDate() })
        })
      }
    } catch (error) {
      console.log('[ai-analyze][cache] save failed', { key, message: error && error.message ? error.message : '' })
    }
  }))
}

// 模型选出的句子必须逐字来自原文；同句、同句型都只保留一次
function pickPoints(content, text) {
  const sentences = splitSentences(text)
  const byKey = {}
  sentences.forEach((sentence) => { byKey[normalizeKey(sentence)] = sentence })
  const seenSentences = new Set()
  const seenPatterns = new Set()
  const picked = []
  const source = Array.isArray(content && content.points) ? content.points : []
  source.forEach((item) => {
    if (picked.length >= MAX_GRAMMAR) return
    const raw = clip(item && item.sentence, 400)
    const pattern = clip(item && item.pattern, 60)
    if (!raw || !pattern) return
    const key = normalizeKey(raw)
    const sentence = byKey[key] || sentences.find((line) => normalizeKey(line).indexOf(key) >= 0)
    if (!sentence || tokenCount(sentence) < 10) return
    const sentenceKey = normalizeKey(sentence)
    const patternKey = cacheKey(pattern)
    if (!patternKey || seenSentences.has(sentenceKey) || seenPatterns.has(patternKey)) return
    seenSentences.add(sentenceKey)
    seenPatterns.add(patternKey)
    picked.push({ pattern, sentence })
  })
  return picked
}

// 复用同句语法点的旧 id，避免重新增强后学习进度失效
function assignIds(existing, selection) {
  const used = new Set(existing.map((point) => point.id))
  const claimed = new Set()
  let serial = nextNumber(existing.map((point) => point.id), 'g')
  return selection.map((item) => {
    const hit = existing.find((point) => point.id
      && !claimed.has(point.id)
      && normalizeKey(point.sentence) === normalizeKey(item.sentence))
    if (hit) {
      claimed.add(hit.id)
      return Object.assign({}, item, { id: hit.id })
    }
    while (used.has(`g${serial}`)) serial += 1
    const id = `g${serial}`
    serial += 1
    used.add(id)
    return Object.assign({}, item, { id })
  })
}

function applyExplanation(item, point, sentenceKeys, previous) {
  if (!item) return null
  const understanding = clip(item.understanding, 240)
  const translation = clip(item.translation, 300)
  if (!understanding || !translation) return null
  if (cjkCount(translation) < 6) return null
  if (normalizeKey(translation) === normalizeKey(point.sentence)) return null
  // 句型名必须和句子对得上：优先用模型按实际结构修正后的名称，都不符就丢掉这张卡
  const declared = clip(item.pattern, 60)
  const pattern = [declared, point.pattern]
    .find((name) => name && patternFitsSentence(name, point.sentence))
  if (!pattern) {
    console.log('[ai-analyze][grammar] pattern mismatch', { id: point.id, declared: declared || '', selected: point.pattern })
    return null
  }
  const examples = sanitizeExamples(item.examples)
  const exampleKeys = new Set(examples.map((example) => normalizeKey(example.en)))
  // 模型没给出合格的分步/分块时，沿用上一次（规则兜底）的同句讲解，避免退回只有一段总述
  const steps = sanitizeSteps(item.steps)
  const chunks = sanitizeChunks(item.chunks, point.sentence)
  // 讲解和原句对不上就直接丢卡，宁可少一张，也不给用户看与句子无关的语法说明
  const explainBody = [
    understanding,
    clip(item.structure, 120),
    steps.map((step) => `${step.title || ''}${step.detail || ''}`).join(' ')
  ].join(' ')
  if (!explanationFitsSentence(explainBody, point.sentence)) {
    console.log('[ai-analyze][grammar] explanation mismatch', { id: point.id, pattern })
    return null
  }
  return {
    id: point.id,
    key: cacheKey(pattern),
    pattern,
    sentence: point.sentence,
    words: tokenCount(point.sentence),
    structure: clip(item.structure, 120),
    understanding,
    steps: steps.length ? steps : (Array.isArray(previous && previous.steps) ? previous.steps : []),
    translation,
    chunks: chunks.length ? chunks : (Array.isArray(previous && previous.chunks) ? previous.chunks : []),
    usageTip: clip(item.usageTip, 140),
    examples,
    // 练习句与讲解句分开：详情页给原文句子，练习页用模型新造的句子
    practice: sanitizePractice(item.practice, normalizeKey(point.sentence), sentenceKeys, exampleKeys),
    en2zhHint: clip(item.en2zhHint, 80),
    zh2enHint: clip(item.zh2enHint, 80),
    aiEnhanced: true,
    drillVersion: DRILL_VERSION
  }
}

function uniqueHint(value, fallback, seen) {
  const hint = normalize(value)
  if (hint && !seen.has(hint)) {
    seen.add(hint)
    return hint
  }
  let next = fallback
  if (seen.has(next)) next = `${fallback}（${seen.size + 1}）`
  seen.add(next)
  return next
}

// 练习题只用模型新造的 practice 句子：第一组做英译汉，第二组做汉译英
// 这样语法详情里展示的原文句子和翻译不会直接成为练习答案
function buildDrills(point, seenHints) {
  const practice = Array.isArray(point.practice) ? point.practice : []
  const drills = []
  const forEn2zh = practice[0]
  if (forEn2zh) {
    drills.push({
      id: `${point.id}d1`,
      kind: 'grammar',
      mode: 'en2zh',
      modeLabel: '英译汉',
      pattern: point.pattern,
      prompt: forEn2zh.en,
      reference: forEn2zh.zh,
      keywords: [],
      hint: uniqueHint(point.en2zhHint, `先找出「${point.pattern}」的主干，再按中文语序重组。`, seenHints)
    })
  }
  const forZh2en = practice[1]
  if (forZh2en) {
    drills.push({
      id: `${point.id}d2`,
      kind: 'grammar',
      mode: 'zh2en',
      modeLabel: '汉译英',
      pattern: point.pattern,
      prompt: forZh2en.zh,
      reference: forZh2en.en,
      keywords: [],
      hint: uniqueHint(point.zh2enHint, `用「${point.pattern}」的结构，把中文意思写完整。`, seenHints)
    })
  }
  return drills
}

// 语法：模型从原文挑点并写讲解/译文/练习提示，规则结果只在模型完全失败时兜底
// skipKeys：语法本里已经收藏过的语法点，不再重复挑、也不再重复讲
async function enhanceGrammar(text, level, points, skipKeys) {
  const skip = skipKeys instanceof Set ? skipKeys : new Set()
  const incoming = Array.isArray(points) ? points : []
  const list = incoming.filter((point) => !skip.has(cacheKey(point.key || point.pattern)))
  // 只是被「已记住」过滤掉时也要落库，否则旧卡片会一直留在文章里
  const filtered = list.length !== incoming.length
  // 规则结果为空也继续走模型：「by + 反身代词」「as + 主语 + do」这类词法点
  // 规则库认不出来，只能靠模型从原文里挑

  const cached = await loadGrammarCache(level)
  const cachedByKey = {}
  cached.forEach((item) => {
    const key = item.key || cacheKey(item.pattern)
    if (key) cachedByKey[key] = item
  })

  // 第一阶段：选点，只输出句型名与原文句子
  const selectContent = await call('grammar', {
    stage: 'select',
    text,
    level,
    maxPoints: MAX_GRAMMAR,
    knownPatterns: cached.map((item) => item.pattern).filter(Boolean),
    avoidPatterns: Array.from(skip).slice(0, 40)
  }, 18000)

  let selection = selectContent ? pickPoints(selectContent, text) : []
  selection = selection.filter((item) => !skip.has(cacheKey(item.pattern)))
  if (!selection.length) {
    // 选点失败时把规则结果当候选，仍然让模型写讲解，避免退回到模板文案
    selection = list.slice(0, MAX_GRAMMAR).map((point) => ({
      pattern: point.pattern,
      sentence: point.sentence
    }))
  }
  console.log('[ai-analyze][grammar] selection', { existing: list.length, picked: selection.length })
  if (!selection.length) return { points: list, changed: filtered, failed: true }

  // 第二阶段：分批讲解，每批 4 条，单片失败不影响其他片
  const assigned = assignIds(list, selection)
  const batches = []
  for (let index = 0; index < assigned.length; index += GRAMMAR_BATCH) {
    batches.push(assigned.slice(index, index + GRAMMAR_BATCH))
  }
  const contents = await Promise.all(batches.map((batch) => {
    const input = batch.map((point) => {
      const note = cachedByKey[cacheKey(point.pattern)]
      const parts = note
        ? [note.structure ? `结构：${note.structure}` : '', note.usageTip ? `用法：${note.usageTip}` : '']
        : []
      return {
        id: point.id,
        pattern: point.pattern,
        sentence: point.sentence,
        note: parts.filter(Boolean).join('；')
      }
    })
    return call('grammar', { stage: 'explain', text, level, points: input }, 34000)
  }))

  const patches = {}
  contents.filter(Boolean).forEach((content) => {
    ;(Array.isArray(content.points) ? content.points : []).forEach((item) => {
      const id = clip(item && item.id, 12)
      if (!id || patches[id]) return
      patches[id] = item
    })
  })

  // 讲解文本重复的直接丢弃，保证同一篇里看不到两张一样的卡
  const applied = []
  const seenUnderstanding = new Set()
  // 改名后可能出现两张同名卡片，同一篇里只留第一张
  const seenPatterns = new Set()
  // 练习句禁止与文章原句相同：先把全文句子归一化成集合
  const sentenceKeys = new Set(splitSentences(text).map((line) => normalizeKey(line)))
  // 同 id 的旧卡片（规则兜底）留着，模型这一步没给出分步讲解时可以沿用
  const previousById = {}
  list.forEach((point) => {
    if (point && point.id) previousById[point.id] = point
  })
  assigned.forEach((point) => {
    const built = applyExplanation(patches[point.id], point, sentenceKeys, previousById[point.id])
    if (!built) return
    // 语法本里已经收藏过的语法点（模型改名后也要再挡一次）
    if (skip.has(cacheKey(built.pattern))) return
    const noteKey = normalizeKey(built.understanding)
    if (seenUnderstanding.has(noteKey)) return
    const patternKey = cacheKey(built.pattern)
    if (seenPatterns.has(patternKey)) return
    seenUnderstanding.add(noteKey)
    seenPatterns.add(patternKey)
    applied.push(built)
  })
  if (!applied.length) return { points: list, changed: filtered, failed: true }

  const seenHints = new Set()
  const withDrills = applied.map((point) => Object.assign({}, point, {
    drills: buildDrills(point, seenHints)
  }))

  await saveGrammarCache(level, withDrills)
  console.log('[ai-analyze][grammar] applied', {
    selected: selection.length,
    applied: withDrills.length,
    cached: cached.length
  })
  return { points: withDrills, changed: true, failed: false }
}

function cleanCn(value) {
  const text = String(value || '')
    .replace(/^\s*(n|v|vt|vi|adj|adv|prep|conj|pron|num|int|phr|aux)\s*\.\s*/i, '')
    .trim()
  // 模型偶尔把「原文拼写有误，应为 rate」这类批注塞进释义，直接作废
  if (/原文|拼写|笔误|应为|更正/.test(text) || /[A-Za-z]{2,}/.test(text)) return ''
  return text.slice(0, 40)
}

function normalizePos(value) {
  const raw = String(value || '').trim().toLowerCase().replace(/[.。\s]/g, '')
  return POS_ALIAS[raw] || ''
}

// 音标只接受 IPA 字符，避免模型把中文或整句话塞进来
function normalizePhonetic(value) {
  const raw = String(value || '').replace(/[/[\]()]/g, '').trim()
  if (!raw || raw.length > 30) return ''
  if (!/^[a-zA-Zæɑɒɔəɜɛɪʊʌθðʃʒŋɡɐɘɨʉɤɵøœɶχʁʕʔβɸɣʋɹɻˈˌːɚɝ' -]+$/.test(raw)) return ''
  return raw
}

// 词汇：修正在本文语境里释义不准的词，并补全词库里没有的超纲词
// 超纲词按 14 个一批并行送模型，不限条数，保证「正在补全」的词真的能补完
const WORD_BATCH = 14

function wordKeyOf(value) {
  return String(value || '').toLowerCase().replace(/[^a-z' -]+/g, '').replace(/\s+/g, ' ').trim()
}

// 跨文章词义缓存：同一个词只让模型解释一次，后面的文章命中直接复用。
// 按词条全局共享（不含个人信息），版本号变化时旧缓存自动失效
const WORD_CACHE = 'word_cache'
// 2：释义改为「词库释义 + 模型补全」合并，旧的「模型整体替换」结果作废，需要重新问一遍
const WORD_CACHE_VERSION = 2
const cacheCommand = db && db.command ? db.command : null
let wordCacheReady = false

// 缓存集合可能还没建：第一次读写前补建，失败时整条缓存链路自动降级
async function ensureWordCache() {
  if (wordCacheReady || !db || typeof db.createCollection !== 'function') return
  try {
    await db.createCollection(WORD_CACHE)
  } catch (error) {
    const message = String((error && (error.errMsg || error.message)) || '')
    if (!/exist|已存在/i.test(message)) throw error
  }
  wordCacheReady = true
}

function cacheId(word) {
  return `wc_${wordKeyOf(word).replace(/\s+/g, '_').slice(0, 60)}`
}

async function readWordCache(words) {
  const out = {}
  if (!db || !cacheCommand || !words.length) return out
  try {
    await ensureWordCache()
  } catch (error) {
    return out
  }
  const ids = Array.from(new Set(words.map(cacheId).filter(Boolean)))
  for (let index = 0; index < ids.length; index += 40) {
    const chunk = ids.slice(index, index + 40)
    try {
      const res = await db.collection(WORD_CACHE).where({ _id: cacheCommand.in(chunk) }).limit(chunk.length).get()
      ;((res && res.data) || []).forEach((doc) => {
        if (!doc || doc.v !== WORD_CACHE_VERSION || !doc.word) return
        if (!Array.isArray(doc.senses) || !doc.senses.length) return
        out[doc.word] = { senses: doc.senses, ph: doc.ph || '', rare: doc.rare === true }
      })
    } catch (error) {
      // 缓存集合还没建：当作全部未命中
    }
  }
  return out
}

async function writeWordCache(entries) {
  if (!db || !entries.length) return
  try {
    await ensureWordCache()
  } catch (error) {
    return
  }
  await Promise.all(entries.map(async (entry) => {
    const id = cacheId(entry.word)
    if (!id) return
    const data = {
      word: entry.word,
      senses: entry.senses,
      ph: entry.ph || '',
      rare: entry.rare === true,
      v: WORD_CACHE_VERSION,
      at: db.serverDate()
    }
    try {
      const res = await db.collection(WORD_CACHE).doc(id).update({ data })
      if (res && res.stats && res.stats.updated) return
    } catch (error) {
      // 文档还不存在，走新增
    }
    try {
      await db.collection(WORD_CACHE).add({ data: Object.assign({ _id: id }, data) })
    } catch (error) {
      // 并发写入冲突：忽略这一次，后续文章还会重新写入
    }
  }))
}

// 释义合并：词库释义是准的，原样放在前面；模型只补词库没有的词性义项（补全释义、补原文语境义）。
// 早期版本是整体替换，出现过 leading 只剩「导致」、把「主要的」这类常用义丢掉的问题
function mergeSenses(base, extra, limit) {
  const out = []
  const all = (Array.isArray(base) ? base : []).concat(Array.isArray(extra) ? extra : [])
  all.forEach((sense) => {
    const pos = sense && sense.pos
    const definition = String((sense && sense.definition) || '').trim()
    if (!pos || !definition || out.length >= limit) return
    if (out.some((item) => item.pos === pos)) return
    const sense2 = { pos, definition, rare: !!(sense && sense.rare) }
    // 可数性来自词库，模型补的义项没有这个字段，能带就带上
    const count = String((sense && sense.count) || '').trim()
    if (/^(C\/U|C|U)$/.test(count)) sense2.count = count
    out.push(sense2)
  })
  return out
}

async function enhanceWords(text, level, vocabulary) {
  const list = Array.isArray(vocabulary) ? vocabulary : []
  if (!list.length) return { vocabulary: list, changed: false, failed: false, incomplete: false }

  const hasMeaning = (item) => Array.isArray(item.meanings) && item.meanings.length > 0
  const toInput = (batch) => batch.map((item) => ({
    word: item.word,
    sentence: clip(item.sentence, 220),
    meaning: (Array.isArray(item.meanings) ? item.meanings : [])
      .map((meaning) => `${meaning.pos} ${meaning.definition}`)
      .join('；'),
    from: item.baseWord || ''
  }))

  // 已认识的词（生词本 / 其它文章掌握过）不再送模型：释义沿用收藏时的结果
  const candidates = list.filter((item) => item.known !== true)
  // 待补全词优先，且不限批次；已收录的词也要过一遍书面语筛选（只做一次）
  const pendingList = candidates.filter((item) => !hasMeaning(item))
  const knownList = candidates.filter((item) => hasMeaning(item) && item.sensesCurated !== true)
  const askList = pendingList.concat(knownList)
  // 词都已按书面语筛过一遍：不再调用模型，避免把「没有待办」误判成失败
  if (!askList.length) return { vocabulary: list, changed: false, failed: false, incomplete: false }

  // 先查跨文章词义缓存：命中的词直接复用，只把没解释过的词发给模型
  const cached = await readWordCache(askList.map((item) => wordKeyOf(item.word)))
  const cachePatches = Object.assign({}, cached)
  const needAsk = askList.filter((item) => !cachePatches[wordKeyOf(item.word)])

  const batches = []
  for (let index = 0; index < needAsk.length; index += WORD_BATCH) {
    batches.push(needAsk.slice(index, index + WORD_BATCH))
  }

  let contents = []
  if (batches.length) {
    contents = await Promise.all(batches.map((batch) => call('words', {
      text,
      level,
      words: toInput(batch)
    }, 36000)))
    // 模型全挂、又没有缓存兜底：保留原结果，标记失败等下次重试
    if (!contents.some(Boolean) && !Object.keys(cachePatches).length) {
      return { vocabulary: list, changed: false, failed: true, incomplete: pendingList.length > 0 }
    }
  }

  const patches = {}
  contents.filter(Boolean).forEach((content) => {
    ;(Array.isArray(content.words) ? content.words : []).forEach((item) => {
      const word = wordKeyOf(clip(item && item.word, 40))
      if (!word) return
      const senses = []
      ;(Array.isArray(item.senses) ? item.senses : []).forEach((sense) => {
        const pos = normalizePos(sense && sense.pos)
        // 模型偶尔把「原文拼写有误」之类的批注塞进释义，cleanCn 会直接判空
        const cn = cleanCn(sense && sense.cn)
        if (!pos || !cn || senses.length >= 3) return
        if (senses.some((kept) => kept.pos === pos && kept.definition === cn)) return
        senses.push({ pos, definition: cn, rare: !!(sense && sense.rare) })
      })
      // 兼容旧格式：单个 pos + cn
      if (!senses.length) {
        const pos = normalizePos(item && item.pos)
        const cn = cleanCn(item && item.cn)
        if (pos && cn) senses.push({ pos, definition: cn, rare: item.rare === true })
      }
      if (!senses.length) return
      patches[word] = {
        senses,
        rare: item.rare === true || senses.some((sense) => sense.rare),
        ph: normalizePhonetic(item.ph)
      }
    })
  })

  // 写回缓存：后面文章遇到同一个词就不必再调模型
  const writes = Object.keys(patches).map((word) => Object.assign({ word }, patches[word]))
  if (writes.length) await writeWordCache(writes)

  let changed = false
  const next = list.map((item) => {
    // 缓存命中的词同样按「已解释过」处理
    const patch = patches[wordKeyOf(item.word)] || cachePatches[wordKeyOf(item.word)]
    if (!patch) return item
    const wasPending = !hasMeaning(item)
    const categories = Array.isArray(item.categories) ? item.categories.slice() : []
    // 熟词生义标签只对词库已有的常见词有意义，超纲词不标
    if (patch.rare && !wasPending && categories.indexOf('familiar') < 0) categories.push('familiar')
    changed = true
    return Object.assign({}, item, {
      // 词库释义在前、模型补全在后，两边合并；词库没收的待补全词直接用模型结果
      meanings: wasPending ? patch.senses : mergeSenses(item.meanings, patch.senses, 4),
      categories,
      phonetic: item.phonetic || (patch.ph ? `/${patch.ph}/` : ''),
      // 词库外的占位词补全释义后取消 pending
      pending: false,
      sensesCurated: true,
      aiEnhanced: true
    })
  })

  // 已认识的词不参与补全，不能算作「还没补完」
  const left = next.filter((item) => item.known !== true && !hasMeaning(item)).length
  return { vocabulary: next, changed, failed: false, incomplete: left > 0 }
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function phrasePattern(phrase) {
  const parts = String(phrase).trim().split(/\s+/).map(escapeRegExp)
  return new RegExp(parts.join('\\s+'), 'i')
}

// 系动词 + 形容词是语法结构，不是固定搭配（feel unwelcome、look happy）
const LINKING_VERBS = new Set([
  'feel', 'feels', 'felt', 'feeling',
  'seem', 'seems', 'seemed', 'seeming',
  'look', 'looks', 'looked', 'looking',
  'sound', 'sounds', 'sounded',
  'taste', 'tastes', 'tasted',
  'smell', 'smells', 'smelled',
  'become', 'becomes', 'became',
  'get', 'gets', 'got', 'grow', 'grows', 'grew',
  'turn', 'turns', 'turned', 'remain', 'remains', 'remained',
  'stay', 'stays', 'stayed'
])

// 介词/连词短语后面接 -ing 时，搭配本身到介词就结束了
const PREP_BASES = new Set([
  'rather than', 'instead of', 'apart from', 'aside from', 'as well as',
  'in spite of', 'regardless of', 'because of', 'due to', 'prior to',
  'according to', 'compared with', 'compared to', 'along with',
  'together with', 'without', 'before', 'after', 'while', 'when',
  'despite', 'besides', 'beyond'
])

// 小品词/介词：系动词只有和小品词组合才是短语（turn out、look into），否则多为系表结构
const PARTICLES = new Set([
  'up', 'out', 'off', 'on', 'in', 'into', 'onto', 'to', 'for', 'with',
  'at', 'about', 'over', 'through', 'away', 'down', 'back', 'forward',
  'from', 'by', 'of', 'like'
])

// 判断已经存进库里的词组是不是伪搭配，用于清掉历史脏数据
// 关联连词只收一半（单独一条 not only）也算脏数据：not only 必定配 but also，
// 单独收进来既不成句，也没法讲清用法
const PAIR_HEADS = new Set(['not only', 'not just', 'either', 'neither', 'both', 'hardly', 'no sooner', 'the more'])

// 旧数据里只收了前半截的关联连词：原文有后半截就补成完整结构，没有就丢掉
// 后半截允许省略 also（口语里常见），此时写成 not only … but
const PAIR_UPGRADES = [
  {
    head: 'not only',
    tail: /\bbut(?:\s+also)?\b/i,
    full: 'not only … but also',
    short: 'not only … but',
    meaning: '不仅……而且……',
    note: '前后连接的成分要对称；but also 的 also 常省略，只剩 but'
  },
  {
    head: 'not just',
    tail: /\bbut(?:\s+also)?\b/i,
    full: 'not just … but also',
    short: 'not just … but',
    meaning: '不仅……而且……',
    note: '和 not only … but also 同义，语气更口语'
  }
]

function upgradePairPhrase(item, text) {
  const key = normalizeKey(item.phrase)
  const fix = PAIR_UPGRADES.find((entry) => entry.head === key)
  if (!fix) return item
  const source = String(text || '')
  // 后半截必须出现在前半截之后，避免抓到句中更早位置的 but
  const head = source.toLowerCase().indexOf(key)
  const rest = head >= 0 ? source.slice(head) : source
  fix.tail.lastIndex = 0
  const tail = fix.tail.exec(rest)
  // 原文压根没有后半截：半截搭配不该留在词组本里
  if (!tail) return null
  const matched = head >= 0
    ? rest.slice(0, tail.index + tail[0].length).replace(/\s+/g, ' ').trim()
    : String(item.matched || '')
  return Object.assign({}, item, {
    phrase: /also/i.test(tail[0]) ? fix.full : fix.short,
    matched: matched.slice(0, 80) || item.matched,
    meaning: fix.meaning,
    note: fix.note,
    aiEnhanced: true
  })
}

function isBadStoredPhrase(phrase) {
  if (PAIR_HEADS.has(normalizeKey(phrase))) return true
  const words = normalizeKey(phrase).split(' ').filter(Boolean)
  if (words.length === 2 && LINKING_VERBS.has(words[0]) && !PARTICLES.has(words[1])) return true
  if (words.length >= 3 && /ing$/.test(words[words.length - 1])) {
    const head = words.slice(0, -1).join(' ')
    if (PREP_BASES.has(head)) return true
  }
  return false
}

// 模型补充的词组也要过一遍规则：临时的动词+形容词、介词+动名词、动词+副词都不算搭配
function worthKeepingPhrase(phrase, existingKeys) {
  const words = normalizeKey(phrase).split(' ').filter(Boolean)
  if (words.length < 2 || words.length > 5) return false
  if (PAIR_HEADS.has(words.join(' '))) return false
  if (words.length === 2 && LINKING_VERBS.has(words[0]) && !PARTICLES.has(words[1])) return false
  if (words.length === 2 && /ly$/.test(words[1])) return false
  // 介词/连词 + 动名词：rather than lingering 只该收录 rather than
  const last = words[words.length - 1]
  if (words.length >= 3 && /ing$/.test(last)) {
    const head = words.slice(0, -1).join(' ')
    if (PREP_BASES.has(head)) return false
  }
  // 已有短语后面硬带一个词
  const key = words.join(' ')
  if (existingKeys.some((base) => base && key.startsWith(`${base} `))) return false
  return true
}

// 词组：先更新已有词组的释义，再补原文里真实出现的新搭配。
// phrase 存规范形式（名词单数、动词原形），matched 存原文里的真实写法
// skipKeys：词组本里已经记住的搭配，不再出现；一篇文章的搭配尽量全部收进来
async function enhancePhrases(text, level, phrases, skipKeys) {
  const skip = skipKeys instanceof Set ? skipKeys : new Set()
  const incoming = Array.isArray(phrases) ? phrases : []
  let list = incoming.filter((item) => !skip.has(normalizeKey(item.phrase)))
  let changed = list.length !== incoming.length
  const content = await call('phrases', {
    text,
    level,
    phrases: list.map((item) => ({ phrase: item.phrase }))
  }, 36000)
  if (!content) return { phrases: list, changed, failed: true }

  const items = (Array.isArray(content.phrases) ? content.phrases : []).slice(0, 30)
  const haystack = ` ${normalize(text).toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ')} `
  const hayKey = (value) => normalize(value).toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim()
  const sentences = splitSentences(text)

  const patched = list.map((item) => {
    const key = normalizeKey(item.phrase)
    const patch = items.find((candidate) => normalizeKey(candidate.phrase) === key
      || normalizeKey(candidate.matched) === key)
    if (!patch) return item
    const meaning = clip(patch.meaning, 80)
    if (!meaning) return item
    changed = true
    return Object.assign({}, item, {
      meaning,
      note: clip(patch.note, 120) || item.note || '',
      aiEnhanced: true
    })
  })
  // 旧版本已经存进库里的伪搭配顺手清掉（feel unwelcome / rather than lingering）
  // 只收了前半截的关联连词（not only）优先补成完整结构，原文没有后半截才丢弃
  const next = patched.map((item) => {
    const fixed = upgradePairPhrase(item, text)
    if (fixed && fixed !== item) changed = true
    return fixed
  }).filter((item) => item && !isBadStoredPhrase(item.phrase))
  if (next.length !== patched.length) changed = true

  let added = 0
  let serial = nextNumber(next.map((item) => item.id), 'ph')
  const existingKeys = next.map((item) => normalizeKey(item.phrase)).filter(Boolean)
  items.forEach((item) => {
    const phrase = clip(item.phrase, 60)
    const meaning = clip(item.meaning, 80)
    // matched 是原文片段；模型没给时退回 phrase 本身
    const surface = clip(item.matched, 80) || phrase
    if (!phrase || !meaning || added >= 30 || next.length >= 60) return
    if (skip.has(normalizeKey(phrase))) return
    if (haystack.indexOf(` ${hayKey(surface)} `) < 0) return
    if (!worthKeepingPhrase(phrase, existingKeys)) return
    if (next.some((existing) => normalizeKey(existing.phrase) === normalizeKey(phrase)
      || normalizeKey(existing.matched) === normalizeKey(surface))) return
    const hit = text.match(phrasePattern(surface))
    const matched = hit ? hit[0] : surface
    const sentence = sentences.find((line) => normalizeKey(line).indexOf(normalizeKey(surface)) >= 0) || ''
    next.push({
      id: `ph${serial}`,
      phrase,
      matched,
      pos: 'phr.',
      meaning,
      note: clip(item.note, 120),
      sentence,
      aiEnhanced: true
    })
    serial += 1
    added += 1
    existingKeys.push(normalizeKey(phrase))
    changed = true
  })

  return { phrases: next, changed, failed: false }
}

async function enhanceUnit(text, level, unitData, options) {
  const base = unitData && typeof unitData === 'object' ? unitData : {}
  const wordsOnly = !!(options && options.wordsOnly)
  const learned = (options && options.learned) || {}
  const knownPhrases = learned.phrases instanceof Set ? learned.phrases : new Set()
  const knownGrammars = learned.grammars instanceof Set ? learned.grammars : new Set()
  let grammar
  let words
  let phrases
  if (wordsOnly) {
    // 语法已经讲完、只是还有超纲词没补全：只补词，不重复消耗语法两份调用
    grammar = { points: base.grammarPoints, changed: false, failed: false }
    phrases = { phrases: base.phrases, changed: false, failed: false }
    words = await enhanceWords(text, level, base.vocabulary)
  } else {
    const results = await Promise.all([
      enhanceGrammar(text, level, base.grammarPoints, knownGrammars),
      enhanceWords(text, level, base.vocabulary),
      enhancePhrases(text, level, base.phrases, knownPhrases)
    ])
    grammar = results[0]
    words = results[1]
    phrases = results[2]
  }

  const knownWords = learned.words instanceof Map ? learned.words : new Map()
  const vocabulary = pruneVocabulary(words.vocabulary, text)
    .filter((item) => !knownWords.has(String((item && item.word) || '').toLowerCase()))
  const next = Object.assign({}, base, {
    grammarPoints: grammar.points,
    // 正文里没出现过的词条（词形还原错误，如 rates → rat）直接清掉
    vocabulary,
    phrases: phrases.phrases
  })
  const pruned = vocabulary.length !== (words.vocabulary || []).length
  next.stats = {
    sentences: splitSentences(text).length,
    vocabulary: next.vocabulary.length,
    grammarPoints: next.grammarPoints.length,
    phrases: next.phrases.length
  }

  const failed = grammar.failed && words.failed && phrases.failed
  return {
    unitData: next,
    changed: grammar.changed || words.changed || phrases.changed || pruned,
    failed,
    // 语法精讲是练习题的唯一来源：只要它没成功，练习题就还是规则库的固定示例题
    grammarFailed: !!grammar.failed,
    // 还有超纲词没拿到释义：客户端要保留「补全中」并稍后重试（已记住的词不算）
    wordsIncomplete: vocabulary.some((item) => item && item.known !== true
      && !(Array.isArray(item.meanings) && item.meanings.length)),
    applied: {
      grammar: grammar.changed,
      vocabulary: words.changed,
      phrases: phrases.changed
    }
  }
}

module.exports = { enhanceUnit, translateFullText, DRILL_VERSION, explanationFitsSentence }
