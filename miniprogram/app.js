App({
  onLaunch() {
    if (!wx.cloud) {
      wx.showModal({ title: '基础库版本过低', content: '请升级微信后使用云开发能力。', showCancel: false })
      return
    }
    wx.cloud.init({ env: 'cloud1-d6gaxobvw48339447', traceUser: true })
    // 后台补推上次没发成功的复习进度：用户不一定马上进复习页，
    // 攒着的排期越早上去越好，换手机才不会丢。没有待同步记录时立即返回，不发请求
    require('./services/review').syncOnce()
    // 打卡记录本地是快照：启动时并一次云端的，换手机或清过缓存也能把日历接回来
    require('./services/checkin').sync()
  }
})
