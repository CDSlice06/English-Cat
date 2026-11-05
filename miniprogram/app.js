App({
  onLaunch() {
    if (!wx.cloud) {
      wx.showModal({ title: '基础库版本过低', content: '请升级微信后使用云开发能力。', showCancel: false })
      return
    }
    wx.cloud.init({ env: 'cloud1-d6gaxobvw48339447', traceUser: true })
  }
})
