// 翻译判分的 AI 层：只做「通过 / 不通过 + 错误类型」，失败一律回落到 evaluator.js
const cloud = require('wx-server-sdk')
const { RULE_TIPS } = require('./evaluator')

const RULE_KEYS = new Set(Object.keys(RULE_TIPS))
const GENERIC_FAIL = '这次没有通过，问题出在句子结构和表达上，回到语法卡对照后再改一遍。'

// 连续失败时熔断，避免每次提交都白等十几秒
let disabledUntil = 0

function clip(value, max) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : ''
}

function raceTimeout(promise, ms) {
  let timer = null
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve(null), ms)
  })
  return Promise.race([promise, timeout]).then((value) => {
    if (timer) clearTimeout(timer)
    return value
  })
}

// 防止模型把参考译文里的连续片段写进反馈，学生直接照抄就能通过
function leaksReference(feedback, reference) {
  const refWords = (String(reference).toLowerCase().match(/[a-z']+/g) || [])
  if (refWords.length < 8) return false
  const lower = String(feedback).toLowerCase()
  for (let i = 0; i + 6 <= refWords.length; i += 1) {
    if (lower.indexOf(refWords.slice(i, i + 6).join(' ')) >= 0) return true
  }
  return false
}

// usage 里模型新造的英文例句/改写，只要和参考译文有连续 5 个词重合，就等于泄题，直接丢弃
function overlapsReference(reference, text) {
  const ref = String(reference).toLowerCase().match(/[a-z']+/g) || []
  const words = String(text).toLowerCase().match(/[a-z']+/g) || []
  if (ref.length < 5 || words.length < 5) return false
  const windows = new Set()
  for (let i = 0; i + 5 <= ref.length; i += 1) windows.add(ref.slice(i, i + 5).join(' '))
  for (let i = 0; i + 5 <= words.length; i += 1) {
    if (windows.has(words.slice(i, i + 5).join(' '))) return true
  }
  return false
}

// 模型的「正确用法」讲解：字段做长度收敛 + 泄题硬校验，不合格整体丢弃回落到静态提示
function sanitizeUsage(raw, question) {
  if (!raw || typeof raw !== 'object') return null
  const point = clip(raw.point, 90)
  const wrong = clip(raw.wrong, 90)
  const correct = clip(raw.correct, 90)
  const example = clip(raw.example, 130)
  const exampleZh = clip(raw.exampleZh, 90)
  if (!point && !correct) return null
  if (!/[\u4e00-\u9fa5]/.test(point)) return null
  const reference = String(question.reference || '')
  if (overlapsReference(reference, correct) || overlapsReference(reference, example)) return null
  return { point, wrong, correct, example, exampleZh }
}

// 改善建议：句子没错也要告诉学生「可以写得更好」的那几条，与 usage 同一套泄题与去重护栏
function sanitizeImprovements(raw, question, usage) {
  if (!Array.isArray(raw)) return []
  const reference = String(question.reference || '')
  const seen = new Set()
  if (usage && usage.wrong) seen.add(String(usage.wrong).toLowerCase())
  const list = []
  for (let i = 0; i < raw.length && list.length < 3; i += 1) {
    const item = raw[i]
    if (!item || typeof item !== 'object') continue
    const point = clip(item.point, 60)
    const wrong = clip(item.wrong, 90)
    const correct = clip(item.correct, 90)
    if (!point || !correct || !wrong) continue
    if (!/[\u4e00-\u9fa5]/.test(point)) continue
    if (correct.toLowerCase() === wrong.toLowerCase()) continue
    // 与参考译文连续 5 词重合 = 泄题；与 usage 讲过的原写法重复 = 冗余，都直接丢弃
    if (overlapsReference(reference, correct)) continue
    if (seen.has(wrong.toLowerCase())) continue
    seen.add(wrong.toLowerCase())
    list.push({ point, wrong, correct })
  }
  return list
}

// 「逐点核对」：把题目的信息点逐条对照学生答案，让学生看清哪块信息写到了、哪块没写到。
// 每个信息点必须有中文描述；note 是给学生的针对性说明，含英文时按同一套泄题护栏处理
function sanitizeChecklist(raw, question) {
  if (!Array.isArray(raw)) return []
  const reference = String(question.reference || '')
  const list = []
  for (let i = 0; i < raw.length && list.length < 6; i += 1) {
    const item = raw[i]
    if (!item || typeof item !== 'object') continue
    const zh = clip(item.zh, 60)
    if (!zh || !/[\u4e00-\u9fa5]/.test(zh)) continue
    if (overlapsReference(reference, zh)) continue
    let note = clip(item.note, 100)
    if (note && (!/[\u4e00-\u9fa5]/.test(note) || overlapsReference(reference, note))) note = ''
    list.push({ zh, ok: item.ok === true, note })
  }
  return list.length >= 2 ? list : []
}

// 核对表里有整块没写到的信息点时，用它拼出比模型反馈更准确的漏译说明（只点中文信息点，不泄露英文表达）
function missingFeedback(checklist) {
  const missing = checklist.filter((item) => !item.ok).map((item) => item.zh)
  return clip(`这次没有通过：题目里的信息还没译全——${missing.slice(0, 3).join('、')}在学生答案里找不到对应表达，补上这几处再提交。`, 130)
}

function format(question, answer, content) {
  if (!content || typeof content.pass !== 'boolean') return null
  const mode = question.mode === 'en2zh' ? 'en2zh' : 'zh2en'
  const feedback = clip(content.feedback, 160)
  if (!feedback || !/[\u4e00-\u9fa5]/.test(feedback)) return null
  const checklist = mode === 'zh2en' ? sanitizeChecklist(content.checklist, question) : []

  if (content.pass) {
    // 模型说通过、核对表里却有整块没写到的信息点：以核对表为准改判不通过，漏译不能被放过
    if (checklist.some((item) => !item.ok)) {
      return {
        result: 'fail',
        feedback: missingFeedback(checklist),
        tip: RULE_TIPS.info,
        rule: 'info',
        usage: sanitizeUsage(content.usage, question),
        improvements: sanitizeImprovements(content.improvements, question, null),
        checklist,
        mode,
        source: 'ai'
      }
    }
    const usage = mode === 'zh2en' ? sanitizeUsage(content.usage, question) : null
    return {
      result: 'pass',
      feedback,
      tip: '',
      rule: '',
      // 通过但有小瑕疵时也附正确用法，让学生知道更地道的写法；英译汉不给，避免泄露英文句式
      usage,
      // 通过时也给「可以写得更好」的改善建议：更简洁、作文更推荐的写法
      improvements: mode === 'zh2en' ? sanitizeImprovements(content.improvements, question, usage) : [],
      checklist,
      mode,
      source: 'ai'
    }
  }

  let rule = ''
  if (mode === 'zh2en') {
    rule = clip(content.rule, 30)
    if (!RULE_KEYS.has(rule)) rule = 'info'
  }
  const safeFeedback = leaksReference(feedback, question.reference) ? GENERIC_FAIL : feedback
  const picked = mode === 'zh2en' ? pickTip(question, rule, answer) : { rule: '', tip: '' }
  // 护栏把错误类型修正过时，模型给的讲解多半也跟着张冠李戴，usage 与改善建议一起丢弃
  const trusted = mode === 'zh2en' && picked.rule === rule
  const usage = trusted ? sanitizeUsage(content.usage, question) : null
  return {
    result: 'fail',
    feedback: safeFeedback,
    tip: picked.tip,
    usage,
    improvements: trusted ? sanitizeImprovements(content.improvements, question, usage) : [],
    checklist,
    rule: mode === 'zh2en' ? picked.rule : '',
    mode,
    source: 'ai'
  }
}

// 提示和句型对不上，是用户一眼就能看出来的错误：模型给的错误类型常常笼统地落到
// clause / order 上，弹出 whether、if 的说明，而题目考的是比较级或状语从句。
// 两层护栏：① 结构类提示要求句子里真的出现该结构；② 被拦下时改用这道题「句型要点」
// 对应的说明；两者都不成立时只给不涉及具体结构的通用提示，绝不弹不相干的解释。
const TIP_GUARDS = {
  clause: /\b(whether|if)\b/i,
  'clause-predicate': /\b(whether|if)\b/i,
  'clause-subject': /\b(whether|if)\b/i,
  soThat: /\bso\b[^.]{0,40}\bthat\b/i,
  inversion: /\b(not|only|hardly|seldom|never|no sooner|nor)\b/i,
  // prep 的提示讲的是「介词后面不能直接跟句子」：只有句子里真的出现
  // 「介词 + 名词或代词 + 谓语」，这条提示才贴切，否则就是张冠李戴
  prep: /\b(?:of|to|in|on|at|for|with|from|about|into|by|without|despite|during|against|among|between|through|over|under|after|before|beyond|besides)\s+(?:the\s+|a\s+|an\s+|his\s+|her\s+|their\s+|our\s+|its\s+|my\s+|your\s+)?(?:he|she|it|they|we|i|you|there|[a-z]{2,})\s+(?:is|are|was|were|am|be|been|being|do|does|did|will|would|can|could|should|may|might|must|has|have|had)\b/i,
  // 其余结构类提示同理：句中连该结构的标志词都没有，弹出来就是不相干的解释
  relative: /\b(who|whom|whose|which|that)\b/i,
  parallel: /\b(not only|not just|both|either|neither|as well as)\b/i,
  comparison: /\b(than|more|less|fewer|most|least)\b/i,
  adverbial: /\b(when|whenever|while|because|since|although|though|unless|until|before|after|so that|in order to|even if|even though|as if|as though|as long as)\b/i,
  nonfinite: /\b\w+ing\b|\bto\s+[a-z]+\b/i,
  passive: /\b(is|are|was|were|be|been|being|get|got|gets)\s+[a-z]+(?:ed|en)\b/i,
  subjunctive: /\b(wish|if only|would rather|were|as if|suggest|demand|insist|require|recommend|should)\b/i,
  formalIt: /\bit\b/i,
  thereBe: /\bthere\b/i
}

// 句型要点（语法卡标题）→ 错误类型：报告里的错误类型要和提示同源，不能各说各的
const PATTERN_RULES = [
  [/比较级|more\s+\S+\s+than|than\s*(结构|从句|后)/i, 'comparison'],
  // 时态 / 情态 / 被动要排在「非谓语|分词」前面：「过去分词」里也含「分词」，顺序反了会串到非谓语提示
  [/完成时|进行时|将来时|时态/, 'tense'],
  [/情态动词/, 'modal'],
  [/被动/, 'passive'],
  [/状语从句|时间状语|原因状语|条件状语|让步状语|目的状语|地点状语/, 'adverbial'],
  [/定语从句|关系代词|关系副词/, 'relative'],
  [/虚拟语气/, 'subjunctive'],
  [/非谓语|分词|动名词|不定式/, 'nonfinite'],
  [/形式主语|形式宾语|it\s*作/, 'formalIt'],
  [/there\s*be/i, 'thereBe'],
  [/not only|both|either|neither|关联连词/, 'parallel'],
  [/倒装/, 'inversion'],
  [/whether|if\s*引导/, 'clause'],
  [/介词/, 'prep']
]

function patternRuleOf(pattern) {
  const title = String(pattern || '')
  for (let i = 0; i < PATTERN_RULES.length; i += 1) {
    if (PATTERN_RULES[i][0].test(title)) return PATTERN_RULES[i][1]
  }
  return ''
}

function pickTip(question, rule, answer) {
  const corpus = `${answer || ''} ${question.pattern || ''}`
  const guard = TIP_GUARDS[rule]
  if (!guard || guard.test(corpus)) return { rule, tip: RULE_TIPS[rule] || '' }
  const patternRule = patternRuleOf(question.pattern)
  if (patternRule && RULE_TIPS[patternRule]) return { rule: patternRule, tip: RULE_TIPS[patternRule] }
  return { rule: 'order', tip: RULE_TIPS.order }
}

// 判题最多等模型 10 秒：判题链路后面还有写库与回读，整条链路要压在平台的等待上限
// （约 15-20 秒）以内，超一点就会表现成「第一次提交报网络错误、再点一次才成功」。
// 等不到模型就回落到本地规则判定（结果同样确定），不让学生对着超时按钮干等
const JUDGE_WAIT_MS = 10000

function judgeTranslation(question, answer, timeoutMs, task) {
  if (Date.now() < disabledUntil) return Promise.resolve(null)
  const reference = typeof question.reference === 'string' ? question.reference.trim() : ''
  if (!reference || !answer) return Promise.resolve(null)
  // 写译是整段翻译，参考译文和学生答案都要保留完整篇幅，不能按单句的上限截断
  const judgeTask = task === 'writing' ? 'writing' : 'judge'
  const referenceLimit = judgeTask === 'writing' ? 2000 : 800
  const answerLimit = judgeTask === 'writing' ? 2000 : 1200

  const pending = cloud.callFunction({
    name: 'llm',
    data: {
      task: judgeTask,
      mode: question.mode === 'en2zh' ? 'en2zh' : 'zh2en',
      pattern: clip(question.pattern, 80),
      prompt: clip(question.prompt, judgeTask === 'writing' ? 1200 : 800),
      reference: clip(reference, referenceLimit),
      answer: clip(answer, answerLimit)
    }
  }).then((res) => {
    const result = (res && res.result) || {}
    if (result.code === 0 && result.data && result.data.content) {
      const formatted = format(question, answer, result.data.content)
      if (formatted) {
        console.log('[ai-judge] ok', { id: question.id || '', pass: formatted.result === 'pass', ms: result.data.ms || 0 })
        return formatted
      }
      console.log('[ai-judge] invalid content', { id: question.id || '' })
      return null
    }
    if (result.code === 503) disabledUntil = Date.now() + 10 * 60 * 1000
    else if (result.code === 502 || result.code === 504) disabledUntil = Date.now() + 3 * 60 * 1000
    console.log('[ai-judge] failed', { id: question.id || '', code: result.code || 0, message: result.message || '' })
    return null
  }).catch((error) => {
    disabledUntil = Date.now() + 3 * 60 * 1000
    console.log('[ai-judge] error', { id: question.id || '', message: error && error.message ? error.message : '' })
    return null
  })

  return raceTimeout(pending, timeoutMs || JUDGE_WAIT_MS).then((value) => {
    if (!value) disabledUntil = Date.now() + 3 * 60 * 1000
    return value
  })
}

// format / sanitizeUsage / sanitizeChecklist 一并导出，供本地回归脚本直接验证判题结果（云函数运行时不受影响）
module.exports = { judgeTranslation, pickTip, format, sanitizeUsage, sanitizeImprovements, sanitizeChecklist }
