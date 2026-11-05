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

function format(question, content) {
  if (!content || typeof content.pass !== 'boolean') return null
  const mode = question.mode === 'en2zh' ? 'en2zh' : 'zh2en'
  const feedback = clip(content.feedback, 160)
  if (!feedback || !/[\u4e00-\u9fa5]/.test(feedback)) return null

  if (content.pass) {
    return { result: 'pass', feedback, tip: '', rule: '', mode, source: 'ai' }
  }

  let rule = ''
  if (mode === 'zh2en') {
    rule = clip(content.rule, 30)
    if (!RULE_KEYS.has(rule)) rule = 'info'
  }
  const safeFeedback = leaksReference(feedback, question.reference) ? GENERIC_FAIL : feedback
  return {
    result: 'fail',
    feedback: safeFeedback,
    tip: mode === 'zh2en' ? (RULE_TIPS[rule] || '') : '',
    rule: mode === 'zh2en' ? rule : '',
    mode,
    source: 'ai'
  }
}

function judgeTranslation(question, answer, timeoutMs) {
  if (Date.now() < disabledUntil) return Promise.resolve(null)
  const reference = typeof question.reference === 'string' ? question.reference.trim() : ''
  if (!reference || !answer) return Promise.resolve(null)

  const pending = cloud.callFunction({
    name: 'llm',
    data: {
      task: 'judge',
      mode: question.mode === 'en2zh' ? 'en2zh' : 'zh2en',
      pattern: clip(question.pattern, 80),
      prompt: clip(question.prompt, 800),
      reference: clip(reference, 800),
      answer: clip(answer, 1200)
    }
  }).then((res) => {
    const result = (res && res.result) || {}
    if (result.code === 0 && result.data && result.data.content) {
      const formatted = format(question, result.data.content)
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

  return raceTimeout(pending, timeoutMs || 15000).then((value) => {
    if (!value) disabledUntil = Date.now() + 3 * 60 * 1000
    return value
  })
}

module.exports = { judgeTranslation }
