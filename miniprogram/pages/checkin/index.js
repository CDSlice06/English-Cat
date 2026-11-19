const checkin = require('../../services/checkin')

Page({
  data: {
    weekdays: ['一', '二', '三', '四', '五', '六', '日'],
    summary: {
      streak: 0,
      best: 0,
      total: 0,
      monthDays: 0,
      checkedToday: false,
      week: []
    },
    calendar: { title: '', cells: [], canNext: false }
  },

  onLoad() {
    this.monthOffset = 0
  },

  onShow() {
    this.refresh()
    // 本地是快照：进页面时再对一次云端，换手机或清过缓存后第一次打开就能看到完整日历
    checkin.sync().then((log) => {
      if (log) this.refresh()
    })
  },

  refresh() {
    const summary = checkin.summary()
    this.setData({
      summary,
      // 回到本月时用 summary 里的那份，切到历史月份时单独取
      calendar: this.monthOffset ? checkin.monthAt(this.monthOffset) : summary.calendar
    })
  },

  applyMonth() {
    this.setData({ calendar: checkin.monthAt(this.monthOffset) })
  },

  prevMonth() {
    this.monthOffset -= 1
    this.applyMonth()
  },

  nextMonth() {
    if (this.monthOffset >= 0) return
    this.monthOffset += 1
    this.applyMonth()
  },

  // 今天还没盖章时，给一个最近的学习入口：有到期词去复习，否则去学习页
  goStudy() {
    wx.switchTab({ url: '/pages/workbench/index' })
  }
})
