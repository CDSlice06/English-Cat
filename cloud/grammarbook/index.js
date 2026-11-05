const cloud = require('wx-server-sdk')
const crypto = require('crypto')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const COLLECTION = 'grammarbooks'
let ready = false

async function ensureCollection() {
  if (ready) return
  try {
    await db.createCollection(COLLECTION)
  } catch (error) {
    const message = String((error && (error.errMsg || error.message)) || '')
    if (!/exist|已存在/i.test(message)) throw error
  }
  ready = true
}

function success(data) {
  return { code: 0, message: 'ok', data }
}

function failure(code, message) {
  return { code, message, data: null }
}

function text(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function normalize(value) {
  return text(value, 1000).toLowerCase().replace(/\s+/g, ' ')
}

function grammarId(openid, articleId, key, sentence) {
  const fingerprint = `${openid}:${articleId}:${normalize(key)}:${normalize(sentence)}`
  const hash = crypto.createHash('sha256').update(fingerprint).digest('hex').slice(0, 24)
  return `gb_${hash}`
}

function sanitizeExamples(list) {
  if (!Array.isArray(list)) return []
  return list.slice(0, 2).map((item) => ({
    en: text(item && item.en, 500),
    zh: text(item && item.zh, 500)
  })).filter((item) => item.en || item.zh)
}

// 分步理解：标题 + 说明，最多 5 步
function sanitizeSteps(list) {
  if (!Array.isArray(list)) return []
  return list.slice(0, 5).map((item) => ({
    title: text(item && item.title, 40),
    detail: text(item && item.detail, 400)
  })).filter((item) => item.title && item.detail)
}

// 分块翻译：原句片段 + 对应中文
function sanitizeChunks(list) {
  if (!Array.isArray(list)) return []
  return list.slice(0, 4).map((item) => ({
    en: text(item && item.en, 400),
    zh: text(item && item.zh, 400)
  })).filter((item) => item.en && item.zh)
}

function decorate(item) {
  return {
    id: item._id,
    articleId: item.articleId || '',
    articleTitle: item.articleTitle || '',
    pointId: item.pointId || '',
    key: item.key || '',
    pattern: item.pattern || '',
    sentence: item.sentence || '',
    understanding: item.understanding || '',
    steps: Array.isArray(item.steps) ? item.steps : [],
    translation: item.translation || '',
    chunks: Array.isArray(item.chunks) ? item.chunks : [],
    usageTip: item.usageTip || '',
    examples: Array.isArray(item.examples) ? item.examples : [],
    createdAt: item.createdAt
  }
}

async function findById(id) {
  const result = await db.collection(COLLECTION).where({ _id: id }).limit(1).get()
  return result.data[0] || null
}

async function add(openid, event) {
  const articleId = text(event.articleId, 64)
  const pointId = text(event.pointId, 64)
  if (!articleId || !pointId) return failure(400, '缺少文章或语法点 id')

  const result = await db.collection('articles').where({ _id: articleId, openid }).limit(1).get()
  const article = result.data[0]
  if (!article) return failure(404, '来源文章不存在')
  const unitData = article.unitData || {}
  const points = Array.isArray(unitData.grammarPoints) ? unitData.grammarPoints : []
  const point = points.find((item) => item.id === pointId)
  if (!point) return failure(404, '语法点不存在或文章已重新解析')

  const key = text(point.key, 80)
  const sentence = text(point.sentence, 1000)
  const id = grammarId(openid, articleId, key, sentence)
  const existing = await findById(id)
  if (existing) return success({ item: decorate(existing), existed: true })

  const data = {
    _id: id,
    openid,
    articleId,
    articleTitle: text(article.title, 160),
    pointId,
    key,
    pattern: text(point.pattern, 300),
    sentence,
    understanding: text(point.understanding, 2000),
    steps: sanitizeSteps(point.steps),
    translation: text(point.translation, 2000),
    chunks: sanitizeChunks(point.chunks),
    usageTip: text(point.usageTip, 300),
    examples: sanitizeExamples(point.examples),
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  }

  try {
    await db.collection(COLLECTION).add({ data })
  } catch (error) {
    const concurrent = await findById(id)
    if (concurrent) return success({ item: decorate(concurrent), existed: true })
    throw error
  }

  return success({ item: decorate(Object.assign({}, data, { createdAt: Date.now() })), existed: false })
}

async function list(openid) {
  const result = await db.collection(COLLECTION)
    .where({ openid })
    .orderBy('createdAt', 'desc')
    .limit(500)
    .get()
  const items = (result.data || []).map(decorate)
  return success({ items, counts: { total: items.length } })
}

async function remove(openid, event) {
  const id = text(event.id, 64)
  if (!id) return failure(400, '缺少语法收藏 id')
  const result = await db.collection(COLLECTION).where({ _id: id, openid }).remove()
  if (!result.stats || !result.stats.removed) return failure(404, '语法收藏不存在')
  return success({ removed: result.stats.removed })
}

exports.main = async (event = {}) => {
  try {
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return failure(401, '无法确认用户身份')
    await ensureCollection()

    switch (event.action) {
      case 'add':
        return await add(OPENID, event)
      case 'list':
        return await list(OPENID)
      case 'remove':
        return await remove(OPENID, event)
      default:
        return failure(400, '不支持的操作')
    }
  } catch (error) {
    console.error('grammarbook failed', error)
    return failure(500, '语法本服务暂时不可用')
  }
}
