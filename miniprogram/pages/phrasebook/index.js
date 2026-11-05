const wordbook = require('../../services/wordbook')

Page({
  data: {
    loading: true,
    error: '',
    tab: 'unknown',
    counts: { total: 0, known: 0, unknown: 0 },
    items: [],
    phrases: [],
    busyId: '',
    removingId: ''
  },

  onShow() {
    this.load(true)
  },

  reload() {
    this.load(true)
  },

  load(force) {
    this.setData({ loading: true, error: '' })
    return wordbook.list(force)
      .then((data) => {
        const items = (data.phraseItems || []).map((item) => ({
          id: item.id,
          word: item.word,
          meanings: item.meanings || [],
          matched: item.matched || '',
          note: item.note || '',
          sentence: item.sentence || '',
          state: item.state,
          sourceLabel: item.articleTitle ? `来自《${item.articleTitle}》` : '来自文章精读'
        }))
        this.setData({
          loading: false,
          items,
          counts: data.phraseCounts || { total: 0, known: 0, unknown: 0 }
        }, () => this.applyTab())
      })
      .catch((error) => {
        this.setData({ loading: false, error: error.message || '词组本加载失败，请重试' })
      })
  },

  applyTab() {
    const tab = this.data.tab
    const phrases = this.data.items.filter((item) => (
      tab === 'known' ? item.state === 'known' : item.state !== 'known'
    ))
    this.setData({ phrases })
  },

  switchTab(event) {
    const tab = event.currentTarget.dataset.tab
    if (tab === this.data.tab) return
    this.setData({ tab }, () => this.applyTab())
  },

  tapKnown(event) {
    const id = event.currentTarget.dataset.id
    if (this.data.busyId) return
    this.setData({ busyId: id })
    wordbook.markKnown(id)
      .then(() => {
        wx.showToast({ title: '已转为「记得」', icon: 'success' })
        return this.load(true)
      })
      .then(() => this.setData({ busyId: '' }))
      .catch((error) => {
        this.setData({ busyId: '' })
        wx.showToast({ title: error.message || '状态保存失败', icon: 'none' })
      })
  },

  removeItem(event) {
    const id = event.currentTarget.dataset.id
    if (this.data.removingId) return
    wx.showModal({
      title: '移出词组本？',
      content: '只会删除这条词组收藏，不影响原文章和学习进度。',
      confirmText: '确认移除',
      confirmColor: '#c95b52',
      success: (res) => {
        if (!res.confirm) return
        this.setData({ removingId: id })
        wordbook.removeWord(id)
          .then(() => this.load(true))
          .then(() => this.setData({ removingId: '' }))
          .catch((error) => {
            this.setData({ removingId: '' })
            wx.showToast({ title: error.message || '移除失败', icon: 'none' })
          })
      }
    })
  }
})
