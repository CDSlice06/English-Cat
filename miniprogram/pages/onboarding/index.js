const { LEVELS, findByLevel } = require('../../content/bank')
const { startBankArticle } = require('../../services/article')

const LEVEL_KEY = 'userLevel'
const SKIP_KEY = 'onboardingSkipped'

Page({
  data: {
    levels: LEVELS,
    step: 1,
    level: '',
    levelLabel: '',
    starting: false,
    startingTitle: '',
    error: ''
  },

  chooseLevel(event) {
    const level = event.currentTarget.dataset.level
    const hit = LEVELS.find((item) => item.key === level)
    wx.setStorageSync(LEVEL_KEY, level)
    this.setData({ level, levelLabel: hit ? hit.label : '四级', step: 2, error: '' })
  },

  backToLevel() {
    if (this.data.starting) return
    this.setData({ step: 1 })
  },

  skip() {
    wx.setStorageSync(SKIP_KEY, true)
    if (getCurrentPages().length > 1) wx.navigateBack()
    else wx.switchTab({ url: '/pages/index/index' })
  },

  draw() {
    if (this.data.starting) return
    const article = findByLevel(this.data.level || 'cet4')
    this.start(article)
  },

  start(article) {
    if (!article) return
    this.setData({ starting: true, startingTitle: article.title, error: '' })
    startBankArticle(article)
      .then(() => {
        this.setData({ starting: false })
        wx.switchTab({ url: '/pages/workbench/index' })
      })
      .catch((error) => {
        this.setData({
          starting: false,
          error: (error && error.message) || '这篇文章没能准备好，换一篇试试'
        })
      })
  },

  goImport() {
    wx.navigateTo({ url: '/pages/import/index' })
  },

  goLibrary() {
    wx.navigateTo({ url: '/pages/library/index' })
  }
})
