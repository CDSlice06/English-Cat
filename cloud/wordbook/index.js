const cloud = require('wx-server-sdk')
const crypto = require('crypto')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

const COLLECTION = 'wordbooks'
let ready = false

// 复习曲线：记住后第 1 / 3 / 7 / 15 / 30 / 90 / 180 天各复习一次
const REVIEW_DAYS = [1, 3, 7, 15, 30, 90, 180]
const DAY = 24 * 60 * 60 * 1000
// 复习进度跟客户端一样按东八区自然日结算
const TZ_OFFSET = 8 * 60 * 60 * 1000

function dayStart(time) {
  const at = Number(time) || Date.now()
  return Math.floor((at + TZ_OFFSET) / DAY) * DAY - TZ_OFFSET
}

function clampStage(value) {
  return Math.min(Math.max(Number(value) || 0, 0), REVIEW_DAYS.length - 1)
}

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

// 词组校验：省略号（so … that / not only … but also）和点号是词组本身的一部分，
// 单词仍只收纯英文，避免把句子或符号塞进词库
function normalizeWord(raw, entryType) {
  const phrase = entryType === 'phrase'
  const word = String(raw || '').trim().toLowerCase().replace(/\s+/g, ' ')
  if (!word) return { message: phrase ? '请输入一个词组' : '请输入一个单词' }
  if (word.length > 40) return { message: phrase ? '词组太长了' : '单词太长了' }
  const pattern = phrase ? /^[a-z][a-z' .\u2026-]*$/ : /^[a-z][a-z' -]*$/
  if (!pattern.test(word)) return { message: phrase ? '只支持英文词组' : '只支持英文单词' }
  return { word }
}

function sanitizeMeanings(list) {
  if (!Array.isArray(list)) return []
  return list
    .slice(0, 4)
    .map((item) => {
      const out = {
        pos: String((item && item.pos) || '').slice(0, 8),
        definition: String((item && item.definition) || '').slice(0, 80)
      }
      // 可数性跟着释义一起存，词库更新时才能同步刷新
      const count = String((item && item.count) || '').trim()
      if (/^(C\/U|C|U)$/.test(count)) out.count = count
      return out
    })
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

// 批量取最新音标与释义：词库升级后覆盖生词本中的旧快照，
// 用户不需要把词删掉再加一遍
async function lookUpBatch(words) {
  const list = Array.from(new Set((Array.isArray(words) ? words : [])
    .map((word) => String(word || '').trim().toLowerCase())
    .filter(Boolean))).slice(0, 500)
  if (!list.length) return {}
  try {
    const res = await cloud.callFunction({ name: 'analyzeArticle', data: { action: 'lookupBatch', words: list } })
    const result = (res && res.result) || {}
    return result.code === 0 && result.data ? result.data : {}
  } catch (error) {
    return {}
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
    knownAt: item.knownAt || null,
    // 复习曲线跟着词条存云上，换手机也不会丢
    reviewStage: clampStage(item.reviewStage),
    reviewBase: Number(item.reviewBase) || 0,
    reviewDue: Number(item.reviewDue) || 0,
    reviewStreak: Number(item.reviewStreak) || 0,
    reviewAt: Number(item.reviewAt) || 0
  }
}

async function list(openid, event) {
  const result = await db.collection(COLLECTION)
    .where({ openid })
    .orderBy('createdAt', 'desc')
    .limit(500)
    .get()
  const allItems = (result.data || []).map(decorate)
  // 释义刷新要批量查词库再回写，很容易把 list 拖过函数超时，
  // 拆到单独的 refresh 动作里，页面打开时只读不算
  if (event && event.refreshMeanings === true) await refreshMeanings(openid, allItems)
  const items = allItems.filter((item) => item.entryType === 'word')
  const phraseItems = allItems.filter((item) => item.entryType === 'phrase')
  return success({
    items,
    counts: recount(items),
    phraseItems,
    phraseCounts: recount(phraseItems)
  })
}

// 只要统计数字：个人中心用，不必把 500 条词条和释义整包传回去
async function counts(openid) {
  const result = await db.collection(COLLECTION)
    .where({ openid })
    .field({ entryType: true, state: true })
    .limit(500)
    .get()
  const all = result.data || []
  const items = all.filter((item) => (item.entryType || 'word') === 'word')
  const phraseItems = all.filter((item) => item.entryType === 'phrase')
  return success({ counts: recount(items), phraseCounts: recount(phraseItems) })
}

// 单独刷新释义与音标：生词本页面先渲染，再在后台补一次
async function refresh(openid) {
  const result = await db.collection(COLLECTION)
    .where({ openid })
    .limit(500)
    .get()
  const items = (result.data || []).map(decorate)
  await refreshMeanings(openid, items)
  return success({ refreshed: items.length })
}

// 用当前词库刷新生词本里的音标与释义：只更新内容有变化的词条，
// 老用户不用手动删词重加，打开生词本就能看到最新释义
async function refreshMeanings(openid, items) {
  const words = items.filter((item) => item.entryType === 'word').map((item) => item.word)
  const map = await lookUpBatch(words)
  const updates = []
  items.forEach((item) => {
    if (item.entryType !== 'word') return
    const hit = map[String(item.word || '').toLowerCase()]
    if (!hit) return
    const meanings = sanitizeMeanings(hit.meanings)
    const phonetic = String(hit.phonetic || '').trim().slice(0, 40)
    const canonical = String(hit.word || '').trim().toLowerCase()
    // 早期收进生词本的屈折形式（boundaries / corporations）在原形条目下重建，
    // 用户看到的词形统一是词库原形
    if (canonical && canonical !== String(item.word || '').toLowerCase()) {
      updates.push(() => migrateEntry(openid, item, canonical, meanings, phonetic))
      return
    }
    if (!meanings.length) return
    const sameMeanings = JSON.stringify(meanings) === JSON.stringify(sanitizeMeanings(item.meanings))
    const samePhonetic = !phonetic || phonetic === item.phonetic
    if (sameMeanings && samePhonetic) return
    item.meanings = meanings
    if (phonetic) item.phonetic = phonetic
    // 存成待执行函数，后面分批写，避免一次并发几百个写请求把云函数拖超时
    updates.push(() => db.collection(COLLECTION).doc(item.id).update({
      data: { meanings: item.meanings, phonetic: item.phonetic, updatedAt: db.serverDate() }
    }).catch(() => {}))
  })
  for (let i = 0; i < updates.length; i += 20) {
    await Promise.all(updates.slice(i, i + 20).map((run) => run()))
  }
}

// 复数 / 变形词条迁移成原形：新 ID 不存在就整条搬过去，
// 已存在原形词条则合并（保留已认识状态），最后删掉旧条目
async function migrateEntry(openid, item, canonical, meanings, phonetic) {
  const newId = entryId(openid, 'word', canonical)
  if (newId !== item.id) {
    const existing = await findById(newId)
    if (existing) {
      const patch = { updatedAt: db.serverDate() }
      if (meanings.length) patch.meanings = meanings
      if (phonetic) patch.phonetic = phonetic
      if (item.state === 'known' && existing.state !== 'known') {
        patch.state = 'known'
        patch.knownAt = db.serverDate()
      }
      await db.collection(COLLECTION).doc(newId).update({ data: patch }).catch(() => {})
    } else {
      const data = {
        _id: newId,
        openid,
        entryType: 'word',
        word: canonical,
        phonetic: phonetic || item.phonetic || '',
        meanings: meanings.length ? meanings : sanitizeMeanings(item.meanings),
        matched: '',
        note: '',
        sentence: item.sentence || '',
        articleId: item.articleId || '',
        articleTitle: '',
        state: item.state === 'known' ? 'known' : 'unknown',
        source: item.source || 'article',
        createdAt: item.createdAt || db.serverDate(),
        updatedAt: db.serverDate()
      }
      if (item.knownAt) data.knownAt = item.knownAt
      // 词语换成原形后 id 会变，复习排期要一起搬过来，否则等于从零开始
      if (Number(item.reviewDue) > 0) {
        data.reviewStage = clampStage(item.reviewStage)
        data.reviewDue = Number(item.reviewDue)
        data.reviewStreak = Math.max(0, Number(item.reviewStreak) || 0)
        data.reviewAt = Number(item.reviewAt) || 0
      } else {
        data.reviewStage = 0
        data.reviewDue = Date.now() + DAY
        data.reviewStreak = 0
        data.reviewAt = 0
      }
      await db.collection(COLLECTION).add({ data }).catch(() => {})
    }
    await db.collection(COLLECTION).where({ _id: item.id, openid }).remove().catch(() => {})
  }
  // 本次返回也直接按原形展示，不用等用户重进页面
  item.id = newId
  item.word = canonical
  if (meanings.length) item.meanings = meanings
  if (phonetic) item.phonetic = phonetic
}

async function add(openid, event) {
  const entryType = event.entryType === 'phrase' ? 'phrase' : 'word'
  const normalized = normalizeWord(event.word, entryType)
  if (normalized.message) return failure(400, normalized.message)

  let word = normalized.word
  let meanings = sanitizeMeanings(event.meanings)
  let phonetic = entryType === 'word' ? sanitizeText(event.phonetic, 40) : ''
  if (entryType === 'word') {
    // 以当前词库为准：从文章里带过来的旧释义可能已经过时，收录时直接换成最新版；
    // 复数 / 变形（boundaries）也统一存成原形
    const entry = await lookUp(word)
    if (entry) {
      if (entry.word) word = String(entry.word).trim().toLowerCase() || word
      const dictMeanings = sanitizeMeanings(entry.meanings)
      if (dictMeanings.length) meanings = dictMeanings
      if (entry.phonetic) phonetic = sanitizeText(entry.phonetic, 40)
    }
  }

  const id = entryId(openid, entryType, word)
  const existing = await findById(id)
  if (existing) return success({ item: decorate(existing), existed: true })

  // 老数据没有类型和新 ID，只有推断类型一致时才视为重复
  const legacy = await findById(wordId(openid, word))
  if (legacy && getEntryType(legacy) === entryType) {
    return success({ item: decorate(legacy), existed: true })
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
    updatedAt: db.serverDate(),
    // 收录当天就排好第一次复习：云端能算出「今天到期几个」，换机也能接着复习
    reviewStage: 0,
    reviewDue: Date.now() + DAY,
    reviewStreak: 0,
    reviewAt: 0
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

// 手动标「记得」= 直接进入已掌握档，半年后仍会回访一次，不是永久移除
async function markKnown(openid, event) {
  const id = typeof event.id === 'string' ? event.id.trim() : ''
  if (!id) return failure(400, '缺少词条 id')
  const stage = REVIEW_DAYS.length - 1
  const result = await db.collection(COLLECTION).where({ _id: id, openid }).update({
    data: {
      state: 'known',
      knownAt: db.serverDate(),
      reviewStage: stage,
      reviewDue: dayStart(Date.now()) + REVIEW_DAYS[stage] * DAY,
      reviewStreak: 0,
      reviewAt: Date.now(),
      updatedAt: db.serverDate()
    }
  })
  if (!result.stats || !result.stats.updated) return failure(404, '词条不存在')
  const item = await findById(id)
  return success({ item: decorate(item) })
}

// 复习时系统自动改状态：升到已掌握 / 掉回学习中都走这里，只改标签不动排期
async function setState(openid, event) {
  const id = typeof event.id === 'string' ? event.id.trim() : ''
  const state = event.state === 'known' ? 'known' : 'unknown'
  if (!id) return failure(400, '缺少词条 id')
  if (!['known', 'unknown'].includes(event.state)) return failure(400, '状态不合法')
  const data = state === 'known'
    ? { state, knownAt: db.serverDate(), updatedAt: db.serverDate() }
    : { state, knownAt: null, updatedAt: db.serverDate() }
  const result = await db.collection(COLLECTION).where({ _id: id, openid }).update({ data })
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

// 批量移除：管理模式下一次性删掉勾选的词。
// 只删属于当前 openid 的条目，id 去重并限流，防止误删别人的词库。
async function removeMany(openid, event) {
  const ids = Array.from(new Set((Array.isArray(event.ids) ? event.ids : [])
    .map((id) => (typeof id === 'string' ? id.trim() : ''))
    .filter(Boolean)
    .slice(0, 200)))
  if (!ids.length) return failure(400, '没有要移除的词')
  let removed = 0
  for (let index = 0; index < ids.length; index += 20) {
    const chunk = ids.slice(index, index + 20)
    const result = await db.collection(COLLECTION).where({ _id: _.in(chunk), openid }).remove()
    removed += (result.stats && result.stats.removed) || 0
  }
  if (!removed) return failure(404, '词条不存在')
  return success({ removed })
}

// 把本地攒下的复习进度合并上云：云端更新过就以云端为准，避免多端互相覆盖
async function syncReview(openid, event) {
  const log = event && event.log && typeof event.log === 'object' ? event.log : null
  if (!log) return failure(400, '缺少复习记录')

  const ids = Object.keys(log).slice(0, 300)
  let synced = 0
  const chunks = []
  for (let index = 0; index < ids.length; index += 10) {
    chunks.push(ids.slice(index, index + 10))
  }

  for (const chunk of chunks) {
    await Promise.all(chunk.map(async (id) => {
      const entry = log[id] || {}
      const lastAt = Number(entry.lastAt) || 0
      const stage = clampStage(entry.stage)
      const base = Number(entry.base) || 0
      const due = Number(entry.due) || (base ? base + REVIEW_DAYS[stage] * DAY : 0)
      if (!lastAt || !due) return
      const found = await db.collection(COLLECTION).where({ _id: id, openid }).limit(1).get()
      const item = (found.data || [])[0]
      if (!item) return
      if ((Number(item.reviewAt) || 0) >= lastAt) return
      await db.collection(COLLECTION).where({ _id: id, openid }).update({
        data: {
          reviewStage: stage,
          reviewDue: due,
          reviewStreak: Math.max(0, Number(entry.streak) || 0),
          reviewAt: lastAt,
          ...(base ? { reviewBase: base } : {}),
          updatedAt: db.serverDate()
        }
      })
      synced += 1
    }))
  }

  return success({ synced })
}

exports.main = async (event = {}) => {
  try {
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return failure(401, '无法确认用户身份')
    await ensureCollection()

    switch (event.action) {
      case 'list':
        return await list(OPENID, event)
      case 'counts':
        return await counts(OPENID)
      case 'refresh':
        return await refresh(OPENID)
      case 'add':
        return await add(OPENID, event)
      case 'known':
        return await markKnown(OPENID, event)
      case 'state':
        return await setState(OPENID, event)
      case 'syncReview':
        return await syncReview(OPENID, event)
      case 'remove':
        return await remove(OPENID, event)
      case 'removeMany':
        return await removeMany(OPENID, event)
      default:
        return failure(400, '不支持的操作')
    }
  } catch (error) {
    console.error('wordbook failed', error)
    return failure(500, '词库服务暂时不可用')
  }
}
