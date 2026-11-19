const checkin = require('./checkin')

function callFunction(name, data) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success(res) {
        const result = res.result || {}
        if (result.code === 0) resolve(result.data)
        else reject(new Error(result.message || '云服务请求失败'))
      },
      fail(err) { reject(new Error(err.errMsg || '无法连接云开发环境')) }
    })
  })
}

// 本地缓存单词与词组，页面间共享收录状态和记得状态
let cache = null

// 首屏快照：生词本打开时先用本地这份渲染，云端结果回来再替换
const SNAPSHOT_KEY = 'wordbookSnapshot'
const SNAPSHOT_TTL = 24 * 60 * 60 * 1000
// 首屏垫底可以用的旧快照上限
const STALE_TTL = 30 * 24 * 60 * 60 * 1000

function remember(data) {
  if (!data) return data
  try {
    wx.setStorageSync(SNAPSHOT_KEY, { at: Date.now(), data })
  } catch (error) {}
  return data
}

// allowStale：首屏渲染允许用旧快照先铺画面，云端回来再静默替换
function readWordbookSnapshot(allowStale) {
  try {
    const saved = wx.getStorageSync(SNAPSHOT_KEY)
    if (!saved || !saved.at || !saved.data) return null
    const maxAge = allowStale ? STALE_TTL : SNAPSHOT_TTL
    if (Date.now() - saved.at > maxAge) return null
    return normalizeCache(saved.data)
  } catch (error) {
    return null
  }
}

function normalizeCache(data) {
  const items = Array.isArray(data.items) ? data.items : []
  const phraseItems = Array.isArray(data.phraseItems) ? data.phraseItems : []
  return Object.assign({}, data, {
    items,
    counts: data.counts || recount(items),
    phraseItems,
    phraseCounts: data.phraseCounts || recount(phraseItems)
  })
}

function list(force = false) {
  if (cache && !force) return Promise.resolve(cache)
  return callFunction('wordbook', { action: 'list' }).then((data) => {
    cache = remember(normalizeCache(data))
    return cache
  })
}

// 释义刷新拆成单独动作：页面先渲染，再在后台补一次，失败也不影响阅读
function refreshMeanings() {
  return callFunction('wordbook', { action: 'refresh' }).catch(() => null)
}

// 个人中心只要数字：优先用内存缓存，其次走轻量 counts 接口，不拉整包词条
let countsCache = null

function counts(force = false) {
  if (countsCache && !force) return Promise.resolve(countsCache)
  if (cache && !force) {
    countsCache = { counts: cache.counts, phraseCounts: cache.phraseCounts }
    return Promise.resolve(countsCache)
  }
  return callFunction('wordbook', { action: 'counts' }).then((data) => {
    countsCache = {
      counts: data.counts || { total: 0, known: 0, unknown: 0 },
      phraseCounts: data.phraseCounts || { total: 0, known: 0, unknown: 0 }
    }
    // 顺手把数字写回快照，下次冷启动首屏就能直接用
    try {
      const saved = wx.getStorageSync(SNAPSHOT_KEY)
      if (saved && saved.data) {
        saved.data.counts = countsCache.counts
        saved.data.phraseCounts = countsCache.phraseCounts
        wx.setStorageSync(SNAPSHOT_KEY, saved)
      }
    } catch (error) {}
    return countsCache
  })
}

function addToCache(entryType, item) {
  countsCache = null
  if (!cache) return
  const key = entryType === 'phrase' ? 'phraseItems' : 'items'
  const countKey = entryType === 'phrase' ? 'phraseCounts' : 'counts'
  const exists = cache[key].some((entry) => entry.id === item.id)
  if (!exists) cache[key] = [item].concat(cache[key])
  cache[countKey] = recount(cache[key])
  remember(cache)
}

function addWord(payload) {
  return callFunction('wordbook', {
    action: 'add',
    entryType: 'word',
    word: payload.word,
    phonetic: payload.phonetic || '',
    meanings: payload.meanings || [],
    source: payload.source || 'manual',
    articleId: payload.articleId || ''
  }).then((data) => {
    addToCache('word', data.item)
    return data
  })
}

function addPhrase(payload) {
  return callFunction('wordbook', {
    action: 'add',
    entryType: 'phrase',
    word: payload.phrase,
    // 词表里查不到的词组允许先收进来，没有释义就不带空义项
    meanings: payload.meaning ? [{ pos: 'phr.', definition: payload.meaning }] : [],
    matched: payload.matched || '',
    note: payload.note || '',
    sentence: payload.sentence || '',
    source: payload.source === 'manual' ? 'manual' : 'article',
    articleId: payload.articleId || '',
    articleTitle: payload.articleTitle || ''
  }).then((data) => {
    addToCache('phrase', data.item)
    return data
  })
}

function markKnown(id) {
  return callFunction('wordbook', { action: 'known', id }).then((data) => {
    countsCache = null
    // 真正把一个词记牢，才算今天的学习打卡
    checkin.mark('word')
    if (cache) {
      cache.items = cache.items.map((item) => (item.id === id ? data.item : item))
      cache.phraseItems = cache.phraseItems.map((item) => (item.id === id ? data.item : item))
      cache.counts = recount(cache.items)
      cache.phraseCounts = recount(cache.phraseItems)
      remember(cache)
    }
    return data.item
  })
}

// 复习时系统自动升降「已掌握 / 学习中」标签，不动复习排期，也不算打卡
function setState(id, state) {
  return callFunction('wordbook', { action: 'state', id, state }).then((data) => {
    countsCache = null
    if (cache) {
      cache.items = cache.items.map((item) => (item.id === id ? data.item : item))
      cache.phraseItems = cache.phraseItems.map((item) => (item.id === id ? data.item : item))
      cache.counts = recount(cache.items)
      cache.phraseCounts = recount(cache.phraseItems)
      remember(cache)
    }
    return data.item
  })
}

// 复习进度合并上云：服务端只接受比云端更新的记录，不会覆盖另一台设备上的进度
function syncReview(log) {
  return callFunction('wordbook', { action: 'syncReview', log })
}

function removeWord(id) {
  return callFunction('wordbook', { action: 'remove', id }).then(() => {
    countsCache = null
    if (cache) {
      cache.items = cache.items.filter((item) => item.id !== id)
      cache.phraseItems = cache.phraseItems.filter((item) => item.id !== id)
      cache.counts = recount(cache.items)
      cache.phraseCounts = recount(cache.phraseItems)
      remember(cache)
    }
    return true
  })
}

// 批量移除：管理模式下勾选多个词一次删掉，本地缓存同步清理
function removeMany(ids) {
  const list = (Array.isArray(ids) ? ids : []).filter((id) => typeof id === 'string' && id)
  if (!list.length) return Promise.resolve(0)
  return callFunction('wordbook', { action: 'removeMany', ids: list }).then((data) => {
    countsCache = null
    if (cache) {
      const removed = {}
      list.forEach((id) => { removed[id] = true })
      cache.items = cache.items.filter((item) => !removed[item.id])
      cache.phraseItems = cache.phraseItems.filter((item) => !removed[item.id])
      cache.counts = recount(cache.items)
      cache.phraseCounts = recount(cache.phraseItems)
      remember(cache)
    }
    return (data && data.removed) || list.length
  })
}

// 查询建议：按前缀从词库补全单词，点一下直接填进输入框
function suggest(prefix, limit) {
  const text = String(prefix || '').trim()
  if (text.length < 1) return Promise.resolve([])
  return new Promise((resolve) => {
    wx.cloud.callFunction({
      name: 'analyzeArticle',
      data: { action: 'suggest', prefix: text, limit: limit || 6 },
      success(res) {
        const result = (res && res.result) || {}
        resolve(result.code === 0 && Array.isArray(result.data) ? result.data : [])
      },
      fail() { resolve([]) }
    })
  })
}

// 中文反查英文：输入「困惑」返回 confusion / puzzle 这类词条
function search(query, limit) {
  const text = String(query || '').trim()
  if (!text) return Promise.resolve([])
  return new Promise((resolve) => {
    wx.cloud.callFunction({
      name: 'analyzeArticle',
      data: { action: 'search', query: text, limit: limit || 8 },
      success(res) {
        const result = (res && res.result) || {}
        resolve(result.code === 0 && Array.isArray(result.data) ? result.data : [])
      },
      fail() { resolve([]) }
    })
  })
}

// 查单个词的音标与完整释义：点开派生 / 形近词的小面板时用，失败返回 null
function lookup(word) {
  const text = String(word || '').trim()
  if (!text) return Promise.resolve(null)
  return callFunction('analyzeArticle', { action: 'lookup', word: text }).catch(() => null)
}

// 批量查词：阅读页进页面时一次性预取正文词义，点词就不用再等云端。
// 返回 { [word]: { word, phonetic, meanings } }，查不到的词直接不返回
function lookupBatch(words) {
  const list = (Array.isArray(words) ? words : [])
    .map((word) => String(word || '').trim().toLowerCase())
    .filter(Boolean)
  const unique = Array.from(new Set(list)).slice(0, 300)
  if (!unique.length) return Promise.resolve({})
  return callFunction('analyzeArticle', { action: 'lookupBatch', words: unique }).catch(() => ({}))
}

// 星级：只读词库、不调模型，返回四级 / 六级两套星级 { [word]: { freq4, freq6 } }，
// 页面按用户当前选的备考标尺取用；生词本只存词条，进页面时批量补一次
function freqsOf(words) {
  const list = (Array.isArray(words) ? words : []).filter(Boolean).slice(0, 200)
  if (!list.length) return Promise.resolve({})
  return new Promise((resolve) => {
    wx.cloud.callFunction({
      name: 'analyzeArticle',
      data: { action: 'freqs', words: list },
      success(res) {
        const result = (res && res.result) || {}
        // 请求失败返回 null，页面不要把星级缓存成 0（那会把已有星星抹掉）
        resolve(result.code === 0 && result.data ? result.data : null)
      },
      fail() { resolve(null) }
    })
  })
}

function recount(items) {
  return {
    total: items.length,
    known: items.filter((item) => item.state === 'known').length,
    unknown: items.filter((item) => item.state !== 'known').length
  }
}

module.exports = { list, counts, refreshMeanings, syncReview, addWord, addPhrase, markKnown, setState, removeWord, removeMany, suggest, search, lookup, lookupBatch, freqsOf, readWordbookSnapshot }
