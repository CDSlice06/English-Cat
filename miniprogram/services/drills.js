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

// 页面来回切换时复用上一次结果；下拉刷新传 force 重新拉
let cache = null
let cachedAt = 0
// 练完一道题再回来时数字要跟着变，缓存只在一分钟内有效
const CACHE_TTL = 60 * 1000

function list(force) {
  if (cache && !force && Date.now() - cachedAt < CACHE_TTL) return Promise.resolve(cache)
  return callFunction('drillHistory', { action: 'list' }).then((data) => {
    cache = data
    cachedAt = Date.now()
    return data
  })
}

function clear() {
  cache = null
  cachedAt = 0
}

// 在历史页里直接重练某道题：带上原文章与题目 ID 判题，不需要切换当前文章
function retry(payload) {
  return callFunction('evaluateTranslation', {
    articleId: payload.articleId,
    id: payload.questionId,
    answer: payload.answer,
    attempt: payload.attempt
  }).then((data) => {
    // 重练会新增一条提交，旧列表缓存（通过状态、时间）立即作废
    clear()
    return data
  })
}

module.exports = { list, clear, retry }
