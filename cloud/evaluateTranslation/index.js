const cloud = require('wx-server-sdk')
const crypto = require('crypto')
const { evaluate, RULE_TIPS } = require('./evaluator')
const { judgeTranslation } = require('./llm')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 判题口径版本：判分标准或提示护栏调整后旧判定作废，同一答案重新提交会按新口径重判
// 5：汉译英新增「逐点核对」checklist，整块信息点漏译改判不通过
const JUDGE_VERSION = 5

// 同一答案正在判题中的请求：并发时共用同一次模型调用
const judging = new Map()

function hashAnswer(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24)
}

// 同口径、同答案的判题结果是确定的，直接复用历史记录，不再调用模型
async function findReusableAttempt(openid, articleId, questionId, mode, answerHash) {
  const result = await db.collection('attempts').where({
    openid,
    articleId,
    questionId,
    mode,
    answerHash,
    judgeVersion: JUDGE_VERSION
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

    // 文章与学习单元互不依赖：并行查询，省下一个来回留给判题和写库
    const [article, unit] = await Promise.all([
      findOne('articles', { _id: articleId, openid: OPENID }),
      findOne('article_units', { articleId, openid: OPENID })
    ])
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
    let usage = null
    let improvements = []
    let checklist = []
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
        usage = reused.usage || null
        improvements = reused.improvements || []
        checklist = reused.checklist || []
        source = reused.source || 'rules'
        duplicated = true
      } else {
        // 先过语言/篇幅硬门槛，再交给大模型判分；模型不可用时回落到本地规则
        const judgeKey = `${OPENID}:${articleId}:${questionId}:${mode}:${answerHash}`
        const outcome = await judgeOnce(judgeKey, async () => {
          // 判题层任何意外异常都回落到本地规则：绝不能因为判题异常让学生提交不了
          try {
            const prechecked = precheck(question, normalizedAnswer)
            if (prechecked) return Object.assign({ source: 'rules' }, prechecked)
            const judged = await judgeTranslation(question, normalizedAnswer)
            if (judged) return Object.assign({ source: 'ai' }, judged)
          } catch (error) {
            console.log('[evaluate] judge fallback', { id: questionId, message: error && error.message ? error.message : String(error) })
          }
          return Object.assign({ source: 'rules' }, evaluate(question, normalizedAnswer))
        })
        const finalOutcome = withEn2zhHint(mode, outcome)
        result = finalOutcome.result
        feedback = finalOutcome.feedback
        tip = finalOutcome.tip || ''
        rule = finalOutcome.rule || ''
        usage = finalOutcome.usage || null
        improvements = finalOutcome.improvements || []
        checklist = finalOutcome.checklist || []
        source = outcome.source || 'rules'
      }
    }

    const record = { answer: event.answer, result, feedback, tip, usage, improvements, checklist, rule, attempt, mode, source }
    // 复用的重复提交不再新增 attempt 记录，避免同一条答案在库里堆多份
    if (!duplicated) {
      try {
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
            usage,
            improvements,
            checklist,
            rule,
            attempt,
            source,
            judgeVersion: JUDGE_VERSION,
            createdAt: db.serverDate()
          }
        })
      } catch (error) {
        // 判题缓存写失败不影响这次评估，只影响以后同答案的复用，记日志继续
        console.log('[evaluate] attempts.add failed', { id: questionId, message: error && error.message ? error.message : String(error) })
      }
    }

    // 判定结果写进 article_units.practiceRecords。
    // 写库成败不看 SDK 的 stats（不同运行时的 updated 口径不完全一致，曾出现已写入却报 0 的误判），
    // 一律以「写后回读」为准：读到本次答案与次数才算存上；没读到就换写法重试，最后降级只写核心字段，
    // 仍写不进时才如实返回 saved:false，并把真实错误留在日志里。
    const recordKey = String(questionId)
    // 第一轮沿用 _.inc（和 study 的版本语义一致，并发下也不回退）；
    // 重试与降级轮改成「读到的值 +1」直接赋值，万一 $inc 在某些文档上失手也能把版本推上去
    const nextVersion = (Number(unit.version) || 0) + 1
    const fullPatch = {
      [`practiceRecords.${recordKey}`]: record,
      version: _.inc(1),
      updatedAt: db.serverDate()
    }
    const retryPatch = {
      [`practiceRecords.${recordKey}`]: record,
      version: nextVersion,
      updatedAt: db.serverDate()
    }
    // 回读核对：答案是本次提交、次数也是本次次数，才算真的写进去了
    const readBackSaved = async () => {
      try {
        const fresh = await findOne('article_units', { _id: unit._id, articleId, openid: OPENID })
        if (!fresh) return null
        const stored = (fresh.practiceRecords || {})[recordKey]
        if (stored && stored.answer === event.answer && Number(stored.attempt) === attempt) return fresh
        return null
      } catch (error) {
        console.log('[evaluate] unit read back failed', {
          id: recordKey,
          message: error && error.message ? error.message : String(error)
        })
        return null
      }
    }

    let savedUnit = null
    for (let round = 0; round < 3 && !savedUnit; round += 1) {
      try {
        if (round === 0) {
          const updateResult = await db.collection('article_units').where({
            _id: unit._id,
            articleId,
            openid: OPENID
          }).update({ data: fullPatch })
          console.log('[evaluate] unit update', {
            id: recordKey,
            round,
            stats: (updateResult && updateResult.stats) || null,
            errMsg: (updateResult && updateResult.errMsg) || ''
          })
        } else if (round === 1) {
          // 换 doc().update() 再试一次：排除 where 组合条件匹配不上的可能
          await db.collection('article_units').doc(unit._id).update({ data: retryPatch })
        } else {
          // 最后一轮降级：只写核心字段，保证「答案 + 通过状态 + 次数」不丢；
          // 讲解类字段（usage / 改善建议 / 逐点核对）缺失只影响展示，不影响进度
          await db.collection('article_units').doc(unit._id).update({
            data: {
              [`practiceRecords.${recordKey}.answer`]: event.answer,
              [`practiceRecords.${recordKey}.result`]: result,
              [`practiceRecords.${recordKey}.feedback`]: String(feedback || ''),
              [`practiceRecords.${recordKey}.tip`]: String(tip || ''),
              [`practiceRecords.${recordKey}.rule`]: String(rule || ''),
              [`practiceRecords.${recordKey}.attempt`]: attempt,
              [`practiceRecords.${recordKey}.mode`]: mode,
              [`practiceRecords.${recordKey}.source`]: source,
              version: nextVersion,
              updatedAt: db.serverDate()
            }
          })
        }
      } catch (error) {
        console.log('[evaluate] unit update failed', {
          id: recordKey,
          round,
          errCode: error && error.errCode,
          errMsg: error && (error.errMsg || error.message) ? (error.errMsg || error.message) : String(error)
        })
      }
      savedUnit = await readBackSaved()
      if (!savedUnit) console.log('[evaluate] unit update not applied', { id: recordKey, round })
    }

    // 真的没能写进库时，先把这次的判定返回给学生，别让人对着「服务不可用」无路可走；
    // 进度没落库属于异常情况，上面的日志里带着每一轮的返回与错误，可直接定位
    if (!savedUnit) return success({ record, version: unit.version || 0, saved: false })

    return success({ record, version: savedUnit.version, saved: true })
  } catch (error) {
    // 这条日志是排查「评估服务不可用」的唯一线索，务必带上具体错误
    // 用 event 里的原始值，避免抛错发生在局部变量声明之前时日志自己再报错
    console.log('[evaluate] failed', {
      id: event && event.id,
      articleId: event && event.articleId,
      message: error && error.message ? error.message : String(error),
      stack: String((error && error.stack) || '').slice(0, 600)
    })
    return failure(500, '翻译评估服务暂时不可用，请再点一次提交')
  }
}
