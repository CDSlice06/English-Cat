const drills = require('../../services/drills')
const checkin = require('../../services/checkin')

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'fail', label: '待改进' },
  { key: 'pass', label: '已通过' }
]

const MODE_LABEL = {
  zh2en: '中译英',
  en2zh: '英译中'
}

function dayLabel(ts) {
  if (!ts) return ''
  const date = new Date(ts)
  const now = new Date()
  const startOf = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diff = Math.round((startOf(now) - startOf(date)) / 86400000)
  const hm = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  if (diff === 0) return `今天 ${hm}`
  if (diff === 1) return `昨天 ${hm}`
  if (diff > 1 && diff < 7) return `${diff} 天前`
  if (date.getFullYear() === now.getFullYear()) return `${date.getMonth() + 1} 月 ${date.getDate()} 日`
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`
}

// 云函数只回原始数据，展示用的标签在页面里算，避免云端为中文字符串做格式化
function decorate(item) {
  return Object.assign({}, item, {
    modeLabel: MODE_LABEL[item.mode] || '翻译',
    latestLabel: dayLabel(item.latestAt),
    attempts: (item.attempts || []).map((item2) => Object.assign({}, item2, {
      label: dayLabel(item2.at)
    }))
  })
}

Page({
  data: {
    loading: true,
    error: '',
    filters: FILTERS,
    filter: 'all',
    all: [],
    items: [],
    total: 0,
    passed: 0,
    openKey: '',
    versionsKey: '',
    // 错题重练：一次只展开一道题的重写框
    retryKey: '',
    retryAnswer: '',
    retryBusy: false,
    retryFeedback: '',
    retryPassed: false
  },

  onLoad(options) {
    // 从练习入口带着筛选进来
    const filter = options && (options.filter === 'fail' || options.filter === 'pass')
      ? options.filter
      : 'all'
    if (filter !== this.data.filter) this.setData({ filter })
    this.load()
  },

  onShow() {
    // 首次进入由 onLoad 拉取；重练返回时强制刷新，通过状态要立刻更新
    if (this.shown) this.load(true)
    this.shown = true
  },

  onPullDownRefresh() {
    this.load(true)
  },

  load(force) {
    this.setData({ loading: !this.data.all.length, error: '' })
    drills.list(force)
      .then((data) => {
        const all = (Array.isArray(data.items) ? data.items : []).map(decorate)
        this.setData({
          loading: false,
          all,
          total: Number(data.total) || all.length,
          passed: Number(data.passed) || 0
        }, () => this.applyFilter(this.data.filter))
        this.stopRefresh()
      })
      .catch((error) => {
        this.setData({ loading: false, error: error.message || '练习记录读取失败' })
        this.stopRefresh()
      })
  },

  stopRefresh() {
    if (typeof wx.stopPullDownRefresh === 'function') wx.stopPullDownRefresh()
  },

  switchFilter(event) {
    const filter = event.currentTarget.dataset.key
    if (!filter || filter === this.data.filter) return
    this.setData({ filter }, () => this.applyFilter(filter))
  },

  applyFilter(filter) {
    const all = this.data.all
    const items = all.filter((item) => {
      if (filter === 'pass') return item.passed
      if (filter === 'fail') return !item.passed
      return true
    })
    this.setData({ items })
  },

  // 一次只展开一道题，避免长列表里到处是展开的译文
  toggleItem(event) {
    const key = event.currentTarget.dataset.key
    const open = this.data.openKey === key ? '' : key
    this.setData({
      openKey: open,
      versionsKey: '',
      retryKey: '',
      retryAnswer: '',
      retryFeedback: '',
      retryPassed: false,
      retryBusy: false
    })
  },

  // 历史版本只在展开的卡片里出现，切到别的题时自动收起
  toggleVersions(event) {
    const key = event.currentTarget.dataset.key
    this.setData({ versionsKey: this.data.versionsKey === key ? '' : key })
  },

  noop() {},

  startRetry(event) {
    const key = event.currentTarget.dataset.key
    const group = this.data.all.find((item) => item.key === key)
    if (!group) return
    this.setData({
      retryKey: key,
      // 从上一版译文改起，和练习页回填答案的习惯保持一致
      retryAnswer: group.latestAnswer || '',
      retryBusy: false,
      retryFeedback: '',
      retryPassed: false
    })
  },

  cancelRetry() {
    this.setData({
      retryKey: '',
      retryAnswer: '',
      retryFeedback: '',
      retryPassed: false,
      retryBusy: false
    })
  },

  onRetryInput(event) {
    this.setData({ retryAnswer: event.detail.value })
  },

  // 直接带着原文章 ID 判题：不切换当前文章，也不离开历史列表
  submitRetry() {
    if (this.data.retryBusy) return
    const key = this.data.retryKey
    const group = this.data.all.find((item) => item.key === key)
    if (!group) return
    const answer = String(this.data.retryAnswer || '').trim()
    if (!answer) {
      wx.showToast({ title: '先写下你的译文', icon: 'none' })
      return
    }
    this.setData({ retryBusy: true })
    drills.retry({
      articleId: group.articleId,
      questionId: group.questionId,
      answer,
      attempt: (Number(group.count) || 0) + 1
    }).then((data) => {
      const record = (data && data.record) || {}
      const at = Date.now()
      const passed = record.result === 'pass'
      const next = Object.assign({}, group, {
        count: (Number(group.count) || 0) + 1,
        latestAnswer: answer,
        latestAt: at,
        latestLabel: dayLabel(at),
        passed,
        attempts: [{
          answer,
          result: passed ? 'pass' : 'fail',
          feedback: record.feedback || '',
          at,
          label: dayLabel(at)
        }].concat(group.attempts || [])
      })
      const all = this.data.all.map((item) => (item.key === key ? next : item))
      // 保持当前筛选下的卡片不消失，让用户先看到这次的结果
      const items = this.data.items.map((item) => (item.key === key ? next : item))
      this.setData({
        all,
        items,
        passed: all.filter((item) => item.passed).length,
        retryBusy: false,
        retryPassed: passed,
        retryFeedback: passed
          ? '这次通过了，正确率会跟着更新。'
          : (record.feedback || '这次还没通过，按反馈再改一版。')
      })
      if (passed) {
        checkin.mark('drill')
        wx.showToast({ title: '这道通过了', icon: 'success' })
      }
    }).catch((error) => {
      this.setData({ retryBusy: false })
      wx.showToast({ title: error.message || '评估服务响应慢，请再点一次提交', icon: 'none', duration: 2500 })
    })
  },

  goStudy() {
    wx.switchTab({ url: '/pages/workbench/index' })
  }
})
