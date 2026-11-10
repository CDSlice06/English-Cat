const wordbook = require('../../services/wordbook')
const review = require('../../services/review')

Page({
  data: {
    loading: true,
    error: '',
    queue: [],
    index: 0,
    total: 0,
    doneCount: 0,
    percent: 0,
    left: 0,
    current: null,
    done: false,
    busy: false,
    // 今天没有到期词时，告诉用户下一批什么时候来
    nextTip: ''
  },

  onLoad() {
    this.load()
  },

  load() {
    this.setData({ loading: true, error: '' })
    // 强制拉一次云端：复习要看到别的页面刚改过的状态
    wordbook.list(true)
      .then((data) => {
        const queue = review.dueQueue(data.items)
        const stats = review.todayStats(data.items)
        this.setData({
          loading: false,
          queue,
          total: queue.length,
          index: 0,
          doneCount: 0,
          percent: 0,
          left: queue.length,
          current: queue[0] || null,
          done: !queue.length,
          nextTip: queue.length || !stats.nextCount ? '' : `${stats.nextLabel}有 ${stats.nextCount} 个词到期`
        }, () => this.scrollTop())
      })
      .catch((error) => this.setData({ loading: false, error: error.message || '词库读取失败，请重试' }))
  },

  // 换到下一张卡时回到页面顶部，卡片内容不会被上次的滚动位置截掉
  scrollTop() {
    if (typeof wx.pageScrollTo !== 'function') return
    wx.pageScrollTo({ scrollTop: 0, duration: 160, fail: () => {} })
  },

  // 「记得」才把词搬到「记得」；「不记得」只记复习时间，状态仍由用户自己决定
  mark(event) {
    if (this.data.busy || !this.data.current) return
    const remembered = event.currentTarget.dataset.result === 'known'
    const id = this.data.current.id
    this.setData({ busy: true })

    const finish = () => {
      // 推进复习曲线：下次到期日由 1/3/7/15/30/180 天决定
      review.advance(id, this.data.current.base, this.data.current.stage, remembered)
      const index = this.data.index + 1
      const nextWord = this.data.queue[index] || null
      const doneCount = this.data.doneCount + 1
      this.setData({
        busy: false,
        index,
        doneCount,
        percent: this.data.total ? Math.round((doneCount / this.data.total) * 100) : 0,
        left: Math.max(0, this.data.total - index),
        current: nextWord,
        done: !nextWord
      }, () => this.scrollTop())
    }

    if (remembered) {
      wordbook.markKnown(id)
        .then(finish)
        .catch((error) => {
          this.setData({ busy: false })
          wx.showToast({ title: error.message || '状态保存失败', icon: 'none' })
        })
      return
    }
    finish()
  },

  goWordbook() {
    const pages = getCurrentPages()
    if (pages.length > 1) wx.navigateBack()
    else wx.redirectTo({ url: '/pages/wordbook/index' })
  }
})
