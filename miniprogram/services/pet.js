// 电子宠物：所有数值都由云函数结算，这里只负责请求与错误转换
function call(data) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'pet',
      data,
      success(res) {
        const result = res.result || {}
        if (result.code === 0) resolve(result.data)
        else {
          const error = new Error(result.message || '宠物服务请求失败')
          error.code = result.code
          reject(error)
        }
      },
      fail(err) { reject(new Error(err.errMsg || '无法连接云开发环境')) }
    })
  })
}

function getPet() {
  return call({ action: 'getPet' })
}

function interact(act) {
  return call({ action: 'interact', act })
}

function claimQuest() {
  return call({ action: 'claimQuest' })
}

module.exports = { getPet, interact, claimQuest }
