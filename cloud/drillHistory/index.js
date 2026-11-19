const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 一次读回最近 300 次提交，按题聚合后返回；写译题库挂在虚拟文章下，不在本页范围
const WRITING_ARTICLE_ID = 'writing-bank'
const MAX_ATTEMPTS = 300
const MAX_GROUPS = 80
const LEVEL_LABEL = { cet4: '四级', cet6: '六级' }
// 真题导入后标题通常只叫 Passage 1 / Passage 2，单看标题分不清是哪套卷
const GENERIC_TITLE = /^passage\s*[0-9]+$/i

function success(data) {
  return { code: 0, message: 'ok', data }
}

function failure(code, message) {
  return { code, message, data: null }
}

// 提交记录在 attempts 集合里，一条答案一条，天生就是时间序
async function readAttempts(openid) {
  try {
    const res = await db.collection('attempts')
      .where({ openid })
      .orderBy('createdAt', 'desc')
      .limit(MAX_ATTEMPTS)
      .get()
    return res.data || []
  } catch (error) {
    // 还没做过输出练习时集合可能不存在，按空历史处理
    console.log('[drills] read attempts failed', error && error.message)
    return []
  }
}

// attempts 里只存答案，原题与参考译文要回文章的学习单元里找
async function readDrillIndex(openid, articleIds) {
  const index = {}
  const labels = {}
  if (!articleIds.length) return { index, titles: labels }
  try {
    const res = await db.collection('articles')
      .where({ openid, _id: _.in(articleIds) })
      .field({
        title: true,
        unitData: true,
        level: true,
        kind: true,
        year: true,
        month: true,
        paper: true,
        passage: true,
        createdAt: true
      })
      .get()
    ;(res.data || []).forEach((article) => {
      labels[article._id] = labelOf(article)
      const unitData = article.unitData || {}
      const drills = []
      ;(Array.isArray(unitData.grammarPoints) ? unitData.grammarPoints : []).forEach((point) => {
        ;(point.drills || []).forEach((drill) => drills.push(drill))
      })
      // 兼容早期版本把练习题存在 practiceItems 的文章
      ;(Array.isArray(unitData.practiceItems) ? unitData.practiceItems : []).forEach((item) => drills.push(item))
      drills.forEach((drill) => {
        if (!drill || !drill.id) return
        index[`${article._id}:${drill.id}`] = {
          prompt: drill.prompt || '',
          reference: drill.reference || '',
          mode: drill.mode === 'en2zh' ? 'en2zh' : 'zh2en'
        }
      })
    })
  } catch (error) {
    console.log('[drills] read articles failed', error && error.message)
  }
  return { index, titles: labels }
}

function timeOf(value) {
  if (!value) return 0
  const at = value instanceof Date ? value.getTime() : new Date(value).getTime()
  return Number.isFinite(at) ? at : 0
}

function monthDay(value) {
  const at = value instanceof Date ? value : new Date(value)
  if (!at || Number.isNaN(at.getTime())) return ''
  return `${at.getMonth() + 1} 月 ${at.getDate()} 日`
}

// 卡片上要能一眼分清是哪一天哪一套：真题统一标「2026年6月 · 四级 · 第1套 · Passage 2」，
// 模拟篇和自建文章标题本身就有区分度，照常显示标题
function labelOf(article) {
  const title = (article.title || '').trim()
  const year = Number(article.year) || 0
  const isExam = article.kind === 'real' || (!article.kind && year > 0)
  if (isExam) {
    const parts = []
    if (year) parts.push(`${year}年${article.month ? `${article.month}月` : ''}`)
    parts.push(LEVEL_LABEL[article.level] || '四级')
    if (article.paper) parts.push(`第${article.paper}套`)
    if (article.passage) parts.push(`Passage ${article.passage}`)
    return parts.join(' · ')
  }
  if (article.kind === 'mock') {
    return `${LEVEL_LABEL[article.level] || '四级'}模拟篇${title ? ` · ${title}` : ''}`
  }
  // 没有出处信息的导入：标题若只是 Passage N，用导入日期补一个区分
  if (title && GENERIC_TITLE.test(title)) {
    const day = monthDay(article.createdAt)
    return day ? `${title} · 导入于 ${day}` : title
  }
  return title || '未命名文章'
}

exports.main = async (event = {}) => {
  try {
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return failure(401, '无法确认用户身份')
    if (event.action && event.action !== 'list') return failure(400, '未知操作')

    const attempts = (await readAttempts(OPENID)).filter((item) => (
      item && item.articleId && item.questionId && item.articleId !== WRITING_ARTICLE_ID
    ))
    const articleIds = Array.from(new Set(attempts.map((item) => item.articleId)))
    const { index, titles } = await readDrillIndex(OPENID, articleIds)

    const groups = {}
    attempts.forEach((item) => {
      const key = `${item.articleId}:${item.questionId}`
      const meta = index[key] || {}
      const at = timeOf(item.createdAt)
      if (!groups[key]) {
        groups[key] = {
          key,
          articleId: item.articleId,
          articleTitle: titles[item.articleId] || '文章已删除',
          questionId: item.questionId,
          prompt: meta.prompt || '',
          reference: meta.reference || '',
          mode: item.mode === 'en2zh' ? 'en2zh' : (meta.mode || 'zh2en'),
          passed: false,
          count: 0,
          latestAt: at,
          latestAnswer: item.answer || '',
          attempts: []
        }
      }
      const group = groups[key]
      group.count += 1
      if (at > group.latestAt) {
        group.latestAt = at
        group.latestAnswer = item.answer || ''
      }
      group.attempts.push({
        answer: item.answer || '',
        result: item.result === 'pass' ? 'pass' : 'fail',
        feedback: item.feedback || '',
        at
      })
    })

    const items = Object.keys(groups)
      .map((key) => groups[key])
      .sort((a, b) => b.latestAt - a.latestAt)
      .slice(0, MAX_GROUPS)
    // 历史版本按时间倒序，最近一次在最上面
    items.forEach((group) => {
      group.attempts.sort((a, b) => b.at - a.at)
      // 通过状态取最近一次提交，与「我的」页累计通过题数的口径对得上
      group.passed = !!(group.attempts[0] && group.attempts[0].result === 'pass')
    })

    return success({
      items,
      total: items.length,
      passed: items.filter((item) => item.passed).length
    })
  } catch (error) {
    console.log('[drills] failed', error && error.message)
    return failure(500, '练习记录读取失败，请稍后重试')
  }
}
