const cloud = require('wx-server-sdk')
const crypto = require('crypto')
const { evaluate, RULE_TIPS } = require('./evaluator')
const { judgeTranslation } = require('./llm')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 同一答案正在判题中的请求：并发时共用同一次模型调用
const judging = new Map()

function hashAnswer(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24)
}

// 完全相同的答案判题结果是确定的，直接复用历史记录，不再调用模型
async function findReusableAttempt(openid, articleId, questionId, mode, answerHash) {
  const result = await db.collection('attempts').where({
    openid,
    articleId,
    questionId,
    mode,
    answerHash
  }).limit(1).get()
  return result.data[0] || null
}

// 同实例内并发判同一答案时只跑一次模型，其余请求等这个结果
function judgeOnce(key, task) {
  const running = judging.get(key)
  if (running) return running
  const job = task().finally(() => { judging.delete(key) })
  judging.set(key, job)
  return job
}

function success(data) {
  return { code: 0, message: 'ok', data }
}

function failure(code, message) {
  return { code, message, data: null }
}

// 语言与篇幅的硬门槛：这类问题不需要模型判断，也能防止堆几个词就蒙混过关
function precheck(question, answer) {
  const mode = question.mode === 'en2zh' ? 'en2zh' : 'zh2en'
  const reference = typeof question.reference === 'string' ? question.reference : ''

  if (mode === 'en2zh') {
    const cjk = (answer.match(/[\u4e00-\u9fa5]/g) || []).length
    const letters = (answer.match(/[A-Za-z]/g) || []).length
    const refCjk = (reference.match(/[\u4e00-\u9fa5]/g) || []).length
    if (cjk < 4 || letters > cjk) {
      return { result: 'fail', feedback: '请用中文写出译文，不要直接抄英文原句。', tip: '', rule: '', mode, precheck: true }
    }
    if (refCjk && cjk < Math.ceil(refCjk * 0.35)) {
      return { result: 'fail', feedback: '译文信息太少，原句里的内容还没有译完整。', tip: '', rule: '', mode, precheck: true }
    }
    return null
  }

  const words = answer.match(/[A-Za-z][A-Za-z'-]*/g) || []
  const cjk = (answer.match(/[\u4e00-\u9fa5]/g) || []).length
  if (words.length < 3 || cjk > words.length) {
    return { result: 'fail', feedback: '请用英文写出译文，不要用中文作答。', tip: '', rule: '', mode }
  }
  const refWords = reference.match(/[A-Za-z][A-Za-z'-]*/g) || []
  if (refWords.length && words.length < Math.ceil(refWords.length * 0.4)) {
    return {
      result: 'fail',
      feedback: '句子只写了一半，题目里的信息还没有译完整。',
      tip: RULE_TIPS.tail,
      rule: 'tail',
      mode
    }
  }
  return null
}

// 英译汉不附「正确用法」示例，避免把英文句式直接当答案给出；在反馈里说明原因
const EN2ZH_NO_TIP_HINT = '英译汉不附「正确用法」示例：示例本身就是英文句式，等于提前给出答案；请对照语法卡和原句结构再改一遍。'

function withEn2zhHint(mode, outcome) {
  if (!outcome || mode !== 'en2zh' || outcome.result !== 'fail' || outcome.tip || outcome.precheck) {
    return outcome
  }
  const feedback = String(outcome.feedback || '').trim()
  if (!feedback || feedback.indexOf('不附「正确用法」') >= 0) return outcome
  return Object.assign({}, outcome, { feedback: `${feedback} ${EN2ZH_NO_TIP_HINT}` })
}

async function findOne(collection, condition) {
  const result = await db.collection(collection).where(condition).limit(1).get()
  return result.data[0] || null
}

// 存量失败记录缺少 rule 字段：按当时保存的答案重算一次错误类型，避免报告把“无数据”显示成“没有失败”
async function backfillRules(openid, articleId) {
  const id = typeof articleId === 'string' ? articleId.trim() : ''
  if (!id) return failure(400, 'articleId 不能为空')

  const article = await findOne('articles', { _id: id, openid })
  if (!article) return failure(404, '文章不存在或无权访问')
  const unit = await findOne('article_units', { articleId: id, openid })
  if (!unit) return failure(404, '学习单元不存在')

  const unitData = article.unitData || {}
  const drills = []
  ;(Array.isArray(unitData.grammarPoints) ? unitData.grammarPoints : []).forEach((point) => {
    ;(point.drills || []).forEach((drill) => drills.push(drill))
  })
  const legacyItems = Array.isArray(unitData.practiceItems) ? unitData.practiceItems : []
  const questionMap = {}
  drills.concat(legacyItems).forEach((question) => { questionMap[question.id] = question })

  const records = unit.practiceRecords || {}
  const nextRecords = Object.assign({}, records)
  let updated = 0

  Object.keys(records).forEach((key) => {
    const record = records[key]
    if (!record || record.result !== 'fail' || record.rule) return
    const question = questionMap[key]
    if (!question || typeof record.answer !== 'string' || !record.answer.trim()) return
    const outcome = evaluate(question, record.answer)
    if (!outcome.rule) return
    nextRecords[key] = Object.assign({}, record, {
      rule: outcome.rule,
      feedback: outcome.feedback,
      tip: outcome.tip || record.tip || ''
    })
    updated += 1
  })

  if (!updated) return success({ updated: 0 })

  await db.collection('article_units').where({ _id: unit._id, articleId: id, openid }).update({
    data: {
      practiceRecords: nextRecords,
      version: _.inc(1),
      updatedAt: db.serverDate()
    }
  })

  return success({ updated })
}

exports.main = async (event = {}) => {
  try {
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return failure(401, '无法确认用户身份')

    if (event.action === 'backfill') return await backfillRules(OPENID, event.articleId)

    const articleId = typeof event.articleId === 'string' ? event.articleId.trim() : ''
    const questionId = typeof event.id === 'string' ? event.id.trim() : ''
    if (!articleId) return failure(400, 'articleId 不能为空')
    if (!questionId) return failure(400, '练习 ID 不能为空')
    if (typeof event.answer !== 'string') return failure(400, 'answer 必须是字符串')
    if (event.answer.length > 5000) return failure(400, '答案不能超过 5000 个字符')

    const article = await findOne('articles', { _id: articleId, openid: OPENID })
    if (!article) return failure(404, '文章不存在或无权访问')

    const unitData = article.unitData || {}
    const drills = []
    ;(Array.isArray(unitData.grammarPoints) ? unitData.grammarPoints : []).forEach((point) => {
      ;(point.drills || []).forEach((drill) => drills.push(drill))
    })
    // 兼容旧文章：早期版本的练习题存在 practiceItems 里
    const legacyItems = Array.isArray(unitData.practiceItems) ? unitData.practiceItems : []
    const question = drills.find((item) => item.id === questionId)
      || legacyItems.find((item) => item.id === questionId)
    if (!question) return failure(404, '练习不存在或不属于当前文章')

    const unit = await findOne('article_units', { articleId, openid: OPENID })
    if (!unit) return failure(404, '学习单元不存在')

    const normalizedAnswer = event.answer.trim()
    const mode = question.mode === 'en2zh' ? 'en2zh' : 'zh2en'
    const answerHash = hashAnswer(normalizedAnswer)
    // 第几次提交：前端按同一题的历史记录递增，用于「讲解后重写」循环
    const attempt = Number.isInteger(event.attempt) && event.attempt > 0
      ? Math.min(event.attempt, 99)
      : 1
    let result = 'pending'
    let feedback = '暂未判定：请先写下你的翻译。'
    let tip = ''
    let rule = ''
    let source = 'rules'
    let duplicated = false

    if (normalizedAnswer) {
      // 同题同答案重复提交直接复用上次判定：判题结果确定，再调一次模型只会重复计费
      const reused = await findReusableAttempt(OPENID, articleId, questionId, mode, answerHash)
      if (reused) {
        result = reused.result
        feedback = reused.feedback
        tip = reused.tip || ''
        rule = reused.rule || ''
        source = reused.source || 'rules'
        duplicated = true
      } else {
        // 先过语言/篇幅硬门槛，再交给大模型判分；模型不可用时回落到本地规则
        const judgeKey = `${OPENID}:${articleId}:${questionId}:${mode}:${answerHash}`
        const outcome = await judgeOnce(judgeKey, async () => {
          const prechecked = precheck(question, normalizedAnswer)
          if (prechecked) return Object.assign({ source: 'rules' }, prechecked)
          const judged = await judgeTranslation(question, normalizedAnswer)
          if (judged) return Object.assign({ source: 'ai' }, judged)
          return Object.assign({ source: 'rules' }, evaluate(question, normalizedAnswer))
        })
        const finalOutcome = withEn2zhHint(mode, outcome)
        result = finalOutcome.result
        feedback = finalOutcome.feedback
        tip = finalOutcome.tip || ''
        rule = finalOutcome.rule || ''
        source = outcome.source || 'rules'
      }
    }

    const record = { answer: event.answer, result, feedback, tip, rule, attempt, mode, source }
    // 复用的重复提交不再新增 attempt 记录，避免同一条答案在库里堆多份
    if (!duplicated) {
      await db.collection('attempts').add({
        data: {
          openid: OPENID,
          articleId,
          questionId,
          mode,
          answer: record.answer,
          answerHash,
          result,
          feedback,
          tip,
          rule,
          attempt,
          source,
          createdAt: db.serverDate()
        }
      })
    }

    const updateResult = await db.collection('article_units').where({
      _id: unit._id,
      articleId,
      openid: OPENID
    }).update({
      data: {
        [`practiceRecords.${questionId}`]: record,
        version: _.inc(1),
        updatedAt: db.serverDate()
      }
    })

    if (!updateResult.stats || updateResult.stats.updated !== 1) {
      return failure(409, '练习记录保存失败，请刷新后重试')
    }

    const updatedUnit = await findOne('article_units', { _id: unit._id, articleId, openid: OPENID })
    if (!updatedUnit) return failure(500, '无法读取更新后的学习进度')

    return success({ record, version: updatedUnit.version })
  } catch (error) {
    return failure(500, '翻译评估服务暂时不可用')
  }
}
