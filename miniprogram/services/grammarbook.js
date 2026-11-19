function callFunction(data) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'grammarbook',
      data,
      success(res) {
        const result = res.result || {}
        if (result.code === 0) resolve(result.data)
        else reject(new Error(result.message || '语法本服务请求失败'))
      },
      fail(err) { reject(new Error(err.errMsg || '无法连接云开发环境')) }
    })
  })
}

let cache = null

// 首屏快照：语法本和个人中心先用本地缓存铺满，云端结果回来再替换
const SNAPSHOT_KEY = 'grammarSnapshot'
const SNAPSHOT_TTL = 24 * 60 * 60 * 1000

function readGrammarSnapshot() {
  try {
    const saved = wx.getStorageSync(SNAPSHOT_KEY)
    if (!saved || !saved.at || !saved.data) return null
    if (Date.now() - saved.at > SNAPSHOT_TTL) return null
    return saved.data
  } catch (error) {
    return null
  }
}

function remember(data) {
  try {
    wx.setStorageSync(SNAPSHOT_KEY, { at: Date.now(), data })
  } catch (error) {}
  return data
}

function list(force = false) {
  if (cache && !force) return Promise.resolve(cache)
  return callFunction({ action: 'list' }).then((data) => {
    cache = remember({
      items: Array.isArray(data.items) ? data.items : [],
      counts: data.counts || { total: (data.items || []).length }
    })
    return cache
  })
}

function addPoint(articleId, pointId) {
  return callFunction({ action: 'add', articleId, pointId }).then((data) => {
    if (cache && !cache.items.some((item) => item.id === data.item.id)) {
      cache.items = [data.item].concat(cache.items)
      cache.counts = { total: cache.items.length }
    }
    return data
  })
}

function removePoint(id) {
  return callFunction({ action: 'remove', id }).then(() => {
    if (cache) {
      cache.items = cache.items.filter((item) => item.id !== id)
      cache.counts = { total: cache.items.length }
    }
    return true
  })
}

module.exports = { list, addPoint, removePoint, readGrammarSnapshot }
