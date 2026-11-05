const grammarbook = require('../../services/grammarbook')
const { USAGE_NOTES } = require('../../content/usage-notes')

Page({
  data: {
    loading: true,
    error: '',
    counts: { total: 0 },
    items: [],
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
    return grammarbook.list(force)
      .then((data) => {
        const items = (data.items || []).map((item) => ({
          id: item.id,
          key: item.key || '语法与句式',
          title: item.pattern || item.key || '语法与句式',
          sentence: item.sentence || '',
          understanding: item.understanding || '',
          steps: Array.isArray(item.steps) ? item.steps : [],
          translation: item.translation || '',
          chunks: Array.isArray(item.chunks) ? item.chunks : [],
          usageTip: item.usageTip || '',
          examples: item.examples || [],
          usage: USAGE_NOTES[item.key] || null,
          sourceLabel: item.articleTitle ? `来自《${item.articleTitle}》` : '来自文章精读'
        }))
        this.setData({
          loading: false,
          items,
          counts: data.counts || { total: items.length }
        })
      })
      .catch((error) => {
        this.setData({ loading: false, error: error.message || '语法本加载失败，请重试' })
      })
  },

  removeItem(event) {
    const id = event.currentTarget.dataset.id
    if (this.data.removingId) return
    wx.showModal({
      title: '移出语法本？',
      content: '只会删除这张语法收藏卡，不影响原文章、已看进度和练习记录。',
      confirmText: '确认移除',
      confirmColor: '#c95b52',
      success: (res) => {
        if (!res.confirm) return
        this.setData({ removingId: id })
        grammarbook.removePoint(id)
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
