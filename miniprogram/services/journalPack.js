// 外刊内容包：清单缓存在本地，正文按 id 取回后也缓存，云端没更新时零请求。
// 与内置的 38 篇互补：内置清单先铺满页面，云端清单回来再按 id 合并，
// 这样加新外刊不用重新提交小程序版本。
const CACHE_KEY = 'journalPack'
const TEXT_PREFIX = 'journalPackText_'
const FRESH = 6 * 60 * 60 * 1000

let fetchedAt = 0

function readCache() {
  try {
    const saved = wx.getStorageSync(CACHE_KEY)
    return saved && Array.isArray(saved.items) ? saved : null
  } catch (error) {
    return null
  }
}

function cachedItems() {
  const cache = readCache()
  return cache ? cache.items : []
}

function callJournal(data) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'journal',
      data,
      success(res) { resolve(res && res.result) },
      fail(error) { reject(new Error((error && error.errMsg) || '外刊服务暂时不可用')) }
    })
  })
}

// 有新清单就写进缓存并返回 items；没更新、或云端不可用时返回 null，绝不抛错
function refresh(force) {
  if (!force && fetchedAt && Date.now() - fetchedAt < FRESH) return Promise.resolve(null)
  const cache = readCache()
  return callJournal({ action: 'manifest' }).then((result) => {
    fetchedAt = Date.now()
    if (!result || result.code !== 0 || !result.data) return null
    const data = result.data
    if (cache && cache.version === data.version) return null
    const items = Array.isArray(data.items) ? data.items : []
    try {
      wx.setStorageSync(CACHE_KEY, { version: data.version, at: Date.now(), items })
    } catch (error) {}
    return items
  }).catch(() => null)
}

function readText(id, version) {
  try {
    const saved = wx.getStorageSync(TEXT_PREFIX + id)
    if (saved && saved.item && (!version || saved.version === version)) return saved.item
  } catch (error) {}
  return null
}

// 内置文章自带正文，不会走这里；云端新增的文章点开时才取一次，之后离线也能读
function article(id) {
  const cache = readCache()
  const version = cache ? cache.version : ''
  const local = readText(id, version)
  if (local) return Promise.resolve(local)
  return callJournal({ action: 'article', id }).then((result) => {
    if (!result || result.code !== 0 || !result.data) return null
    try {
      wx.setStorageSync(TEXT_PREFIX + id, { version, item: result.data })
    } catch (error) {}
    return result.data
  }).catch(() => null)
}

module.exports = { cachedItems, refresh, article }
