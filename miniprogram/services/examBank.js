// 内置题库：清单常驻内存，正文按需拉取。
// 云函数 examBank 打包了全部真题原文与合规外刊，用户不用自己上传
function call(action, data) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud || !wx.cloud.callFunction) {
      reject(new Error('云开发还没有初始化'))
      return
    }
    wx.cloud.callFunction({
      name: 'examBank',
      data: Object.assign({ action }, data),
      success(res) {
        const result = (res && res.result) || {}
        if (result.code === 0) resolve(result.data)
        else reject(new Error(result.message || '题库暂时打不开'))
      },
      fail(err) { reject(new Error((err && err.errMsg) || '无法连接云开发环境')) }
    })
  })
}

let listCache = null
let pending = null

function fetchList() {
  if (listCache) return Promise.resolve(listCache)
  if (pending) return pending
  pending = call('list')
    .then((data) => {
      listCache = {
        list: (data && data.list) || [],
        counts: (data && data.counts) || {}
      }
      pending = null
      return listCache
    })
    .catch((error) => {
      pending = null
      throw error
    })
  return pending
}

function listExams(level) {
  return fetchList().then((data) => data.list.filter((item) => !level || item.level === level))
}

function getExam(id) {
  if (!id) return Promise.reject(new Error('这篇真题不存在'))
  return call('get', { id })
}

module.exports = { listExams, getExam }
