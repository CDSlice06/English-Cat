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

function remember(data) {
  if (!data) return data
  try {
    wx.setStorageSync(SNAPSHOT_KEY, { at: Date.now(), data })
  } catch (error) {}
  return data
}

function readWordbookSnapshot() {
  try {
    const saved = wx.getStorageSync(SNAPSHOT_KEY)
    if (!saved || !saved.at || !saved.data) return null
    if (Date.now() - saved.at > SNAPSHOT_TTL) return null
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

function addToCache(entryType, item) {
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
    meanings: [{ pos: 'phr.', definition: payload.meaning || '' }],
    matched: payload.matched || '',
    note: payload.note || '',
    sentence: payload.sentence || '',
    source: 'article',
    articleId: payload.articleId || '',
    articleTitle: payload.articleTitle || ''
  }).then((data) => {
    addToCache('phrase', data.item)
    return data
  })
}

function markKnown(id) {
  return callFunction('wordbook', { action: 'known', id }).then((data) => {
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

function removeWord(id) {
  return callFunction('wordbook', { action: 'remove', id }).then(() => {
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

// 查询建议：按前缀从词库补全单词，点一下直接填进输入框
function suggest(prefix, limit) {
  const text = String(prefix || '').trim()
  if (text.length < 2) return Promise.resolve([])
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

module.exports = { list, addWord, addPhrase, markKnown, removeWord, suggest, freqsOf, readWordbookSnapshot }
