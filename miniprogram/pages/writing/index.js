const LEVELS = [
  { key: 'all', label: '全部' },
  { key: 'cet4', label: '四级' },
  { key: 'cet6', label: '六级' }
]

Page({
  data: {
    loading: true,
    error: '',
    filter: 'all',
    levels: LEVELS,
    all: [],
    questions: [],
    passed: 0,
    total: 0
  },

  onLoad() {
    this.load()
  },

  onShow() {
    // 从做题页返回时刷新进度，不重复显示骨架屏
    if (this.loaded) this.load(true)
  },

  onPullDownRefresh() {
    this.load(true).then(() => wx.stopPullDownRefresh())
  },

  async load(silent) {
    if (!silent) this.setData({ loading: true, error: '' })
    try {
      const res = await wx.cloud.callFunction({
        name: 'evaluateTranslation',
        data: { action: 'writing', writingAction: 'list' }
      })
      const payload = (res && res.result) || {}
      if (payload.code !== 0) throw new Error(payload.message || '题库加载失败')
      const all = ((payload.data && payload.data.questions) || []).map((item) => Object.assign({}, item, {
        statusText: item.passed ? '已通过' : (item.attempts ? `练过 ${item.attempts} 次` : '未开始')
      }))
      this.loaded = true
      this.setData({
        loading: false,
        error: '',
        all,
        passed: all.filter((item) => item.passed).length,
        total: all.length
      })
      this.applyFilter(this.data.filter)
    } catch (error) {
      console.log('writing list failed', error)
      this.setData({
        loading: false,
        error: (error && error.message) || '题库加载失败，请下拉重试'
      })
    }
  },

  applyFilter(filter) {
    const all = this.data.all
    this.setData({
      filter,
      questions: filter === 'all' ? all : all.filter((item) => item.level === filter)
    })
  },

  chooseLevel(event) {
    this.applyFilter(event.currentTarget.dataset.level)
  },

  openQuestion(event) {
    const id = event.currentTarget.dataset.id
    if (!id) return
    wx.navigateTo({ url: `/pages/writing/detail/index?id=${id}` })
  }
})
