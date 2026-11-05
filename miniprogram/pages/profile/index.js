const { loadStudy, resetStudy, loadOverview } = require('../../services/study')
const wordbook = require('../../services/wordbook')
const grammarbook = require('../../services/grammarbook')

const EMPTY_COUNTS = { total: 0, known: 0, unknown: 0 }

Page({
  data: {
    loading: true,
    error: '',
    mastered: 0,
    overview: { articleTotal: 0, masteredArticles: 0, passedDrills: 0, drillTotal: 0 },
    resetting: false,
    book: EMPTY_COUNTS,
    phraseBook: EMPTY_COUNTS,
    grammarBook: { total: 0 }
  },
  onShow() {
    const tabBar = typeof this.getTabBar === 'function' && this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 2 })
    this.load()
  },
  load() {
    this.setData({ loading: true, error: '' })
    Promise.all([
      loadStudy(),
      wordbook.list(true).catch(() => null),
      grammarbook.list(true).catch(() => null),
      loadOverview().catch(() => null)
    ])
      .then(([study, book, grammar, overview]) => this.setData({
        loading: false,
        mastered: study.unit.masteredWords.length,
        overview: overview || { articleTotal: 0, masteredArticles: 0, passedDrills: 0, drillTotal: 0 },
        book: book ? book.counts : EMPTY_COUNTS,
        phraseBook: book ? book.phraseCounts : EMPTY_COUNTS,
        grammarBook: grammar ? grammar.counts : { total: 0 }
      }))
      .catch((error) => this.setData({ loading: false, error: error.message }))
  },
  goWordbook() {
    wx.navigateTo({ url: '/pages/wordbook/index' })
  },
  goPhrasebook() {
    wx.navigateTo({ url: '/pages/phrasebook/index' })
  },
  goGrammarbook() {
    wx.navigateTo({ url: '/pages/grammarbook/index' })
  },
  reset() {
    wx.showModal({
      title: '清除学习记录？', content: '将清空词汇、解析和练习的进度，此操作不可撤销。', confirmText: '确认清除', confirmColor: '#c95b52',
      success: (res) => {
        if (!res.confirm) return
        this.setData({ resetting: true })
        resetStudy().then(({ unit }) => {
          this.setData({ resetting: false, mastered: 0 })
          wx.showToast({ title: '云端进度已重置', icon: 'success' })
          // 重置只清当前这篇，汇总数字需要按最新单元重算
          loadOverview().then((overview) => this.setData({ overview })).catch(() => {})
        }).catch((error) => { this.setData({ resetting: false }); wx.showToast({ title: error.message, icon: 'none' }) })
      }
    })
  }
})
