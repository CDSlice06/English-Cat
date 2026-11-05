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

function list(force = false) {
  if (cache && !force) return Promise.resolve(cache)
  return callFunction({ action: 'list' }).then((data) => {
    cache = {
      items: Array.isArray(data.items) ? data.items : [],
      counts: data.counts || { total: (data.items || []).length }
    }
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

module.exports = { list, addPoint, removePoint }
