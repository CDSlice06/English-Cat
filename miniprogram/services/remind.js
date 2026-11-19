const { REMIND_TEMPLATE_ID } = require('../config/subscribe')

// 提醒偏好存在云端：换手机后仍然保留，定时任务也按这份数据发消息
function call(action, payload) {
  return wx.cloud
    .callFunction({ name: 'remind', data: Object.assign({ action }, payload || {}) })
    .then((res) => {
      const result = (res && res.result) || {}
      if (result.code !== 0) throw new Error(result.message || '提醒服务暂不可用')
      return result.data
    })
}

// 没填模板 ID 时整个功能不露出，避免出现点了没反应的开关
function available() {
  return !!REMIND_TEMPLATE_ID
}

function status() {
  return call('status').catch(() => ({ available: false, enabled: false }))
}

// requestSubscribeMessage 必须由用户点击直接触发，所以授权和上报写在同一个函数里。
// 用户勾了「总是保持以上选择」后，长期模板只需授权一次。
function enable() {
  if (!available()) return Promise.reject(new Error('提醒模板未配置'))
  return new Promise((resolve, reject) => {
    wx.requestSubscribeMessage({
      tmplIds: [REMIND_TEMPLATE_ID],
      success: (res) => {
        if (res[REMIND_TEMPLATE_ID] !== 'accept') {
          reject(new Error('未开启提醒'))
          return
        }
        call('subscribe').then(resolve).catch(reject)
      },
      fail: (error) => reject(new Error((error && error.errMsg) || '订阅失败，请稍后再试'))
    })
  })
}

function disable() {
  return call('unsubscribe')
}

module.exports = { available, status, enable, disable }
