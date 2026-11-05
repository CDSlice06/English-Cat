const cloud = require('wx-server-sdk')
const crypto = require('crypto')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const COLLECTION = 'wordbooks'
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

// 旧版 ID 保留用于兼容；新 ID 加入条目类型，允许同文本分别收藏为单词和词组
function wordId(openid, word) {
  const hash = crypto.createHash('sha256').update(`${openid}:${word}`).digest('hex').slice(0, 24)
  return `wb_${hash}`
}

function entryId(openid, entryType, word) {
  const hash = crypto.createHash('sha256').update(`${openid}:${entryType}:${word}`).digest('hex').slice(0, 24)
  return `wb_${hash}`
}

function getEntryType(item) {
  if (item.entryType === 'word' || item.entryType === 'phrase') return item.entryType
  const meanings = Array.isArray(item.meanings) ? item.meanings : []
  return meanings.some((meaning) => meaning && meaning.pos === 'phr.') ? 'phrase' : 'word'
}

function recount(items) {
  return {
    total: items.length,
    known: items.filter((item) => item.state === 'known').length,
    unknown: items.filter((item) => item.state !== 'known').length
  }
}

function sanitizeText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function normalizeWord(raw) {
  const word = String(raw || '').trim().toLowerCase().replace(/\s+/g, ' ')
  if (!word) return { message: '请输入一个单词' }
  if (word.length > 40) return { message: '单词太长了' }
  if (!/^[a-z][a-z' -]*$/.test(word)) return { message: '只支持英文单词' }
  return { word }
}

function sanitizeMeanings(list) {
  if (!Array.isArray(list)) return []
  return list
    .slice(0, 4)
    .map((item) => ({
      pos: String((item && item.pos) || '').slice(0, 8),
      definition: String((item && item.definition) || '').slice(0, 80)
    }))
    .filter((item) => item.definition)
}

async function findById(id) {
  const result = await db.collection(COLLECTION).where({ _id: id }).limit(1).get()
  return result.data[0] || null
}

async function lookUp(word) {
  try {
    const res = await cloud.callFunction({ name: 'analyzeArticle', data: { action: 'lookup', word } })
    const result = (res && res.result) || {}
    return result.code === 0 ? result.data : null
  } catch (error) {
    return null
  }
}

function decorate(item) {
  return {
    id: item._id,
    entryType: getEntryType(item),
    word: item.word,
    phonetic: item.phonetic || '',
    meanings: item.meanings || [],
    matched: item.matched || '',
    note: item.note || '',
    sentence: item.sentence || '',
    articleId: item.articleId || '',
    articleTitle: item.articleTitle || '',
    state: item.state,
    source: item.source || 'manual',
    createdAt: item.createdAt,
    knownAt: item.knownAt || null
  }
}

async function list(openid) {
  const result = await db.collection(COLLECTION)
    .where({ openid })
    .orderBy('createdAt', 'desc')
    .limit(500)
    .get()
  const allItems = (result.data || []).map(decorate)
  const items = allItems.filter((item) => item.entryType === 'word')
  const phraseItems = allItems.filter((item) => item.entryType === 'phrase')
  return success({
    items,
    counts: recount(items),
    phraseItems,
    phraseCounts: recount(phraseItems)
  })
}

async function add(openid, event) {
  const normalized = normalizeWord(event.word)
  if (normalized.message) return failure(400, normalized.message)

  const entryType = event.entryType === 'phrase' ? 'phrase' : 'word'
  const word = normalized.word
  const id = entryId(openid, entryType, word)
  const existing = await findById(id)
  if (existing) return success({ item: decorate(existing), existed: true })

  // 老数据没有类型和新 ID，只有推断类型一致时才视为重复
  const legacy = await findById(wordId(openid, word))
  if (legacy && getEntryType(legacy) === entryType) {
    return success({ item: decorate(legacy), existed: true })
  }

  let meanings = sanitizeMeanings(event.meanings)
  let phonetic = entryType === 'word' ? sanitizeText(event.phonetic, 40) : ''
  if (entryType === 'word' && !meanings.length) {
    const entry = await lookUp(word)
    if (entry) {
      meanings = sanitizeMeanings(entry.meanings)
      phonetic = phonetic || entry.phonetic || ''
    }
  }

  const data = {
    _id: id,
    openid,
    entryType,
    word,
    phonetic,
    meanings,
    state: 'unknown',
    source: event.source === 'article' ? 'article' : 'manual',
    articleId: sanitizeText(event.articleId, 64),
    articleTitle: entryType === 'phrase' ? sanitizeText(event.articleTitle, 160) : '',
    matched: entryType === 'phrase' ? sanitizeText(event.matched, 80) : '',
    note: entryType === 'phrase' ? sanitizeText(event.note, 500) : '',
    sentence: entryType === 'phrase' ? sanitizeText(event.sentence, 1000) : '',
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

async function markKnown(openid, event) {
  const id = typeof event.id === 'string' ? event.id.trim() : ''
  if (!id) return failure(400, '缺少词条 id')
  const result = await db.collection(COLLECTION).where({ _id: id, openid }).update({
    data: { state: 'known', knownAt: db.serverDate(), updatedAt: db.serverDate() }
  })
  if (!result.stats || !result.stats.updated) return failure(404, '词条不存在')
  const item = await findById(id)
  return success({ item: decorate(item) })
}

async function remove(openid, event) {
  const id = typeof event.id === 'string' ? event.id.trim() : ''
  if (!id) return failure(400, '缺少词条 id')
  const result = await db.collection(COLLECTION).where({ _id: id, openid }).remove()
  if (!result.stats || !result.stats.removed) return failure(404, '词条不存在')
  return success({ removed: result.stats.removed })
}

exports.main = async (event = {}) => {
  try {
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return failure(401, '无法确认用户身份')
    await ensureCollection()

    switch (event.action) {
      case 'list':
        return await list(OPENID)
      case 'add':
        return await add(OPENID, event)
      case 'known':
        return await markKnown(OPENID, event)
      case 'remove':
        return await remove(OPENID, event)
      default:
        return failure(400, '不支持的操作')
    }
  } catch (error) {
    console.error('wordbook failed', error)
    return failure(500, '词库服务暂时不可用')
  }
}
