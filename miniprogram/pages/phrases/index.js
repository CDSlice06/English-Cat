const { loadStudy, updateStudy, saveResume, resumeInfo } = require('../../services/study')
const { addPhrase, list } = require('../../services/wordbook')
const { errorMessage } = require('../../utils/error')

Page({
  data: {
    loading: true,
    error: '',
    article: null,
    unit: null,
    phrases: [],
    viewedCount: 0,
    nextReady: false,
    expanded: {},
    addingId: '',
    saving: false,
    // 原文抽屉：纯前端展示，不发请求
    originOpen: false,
    originText: '',
    originHighlight: ''
  },

  onLoad(options) {
    // 从工作台「继续上次」进来：渲染完滚回上次看的那条搭配
    this.resumeFlag = !!(options && options.resume)
  },

  onShow() {
    this.loadPage()
  },

  loadPage() {
    this.setData({ loading: true, error: '' })
    loadStudy(true)
      .then((study) => {
        this.applyStudy(study)
        this.syncWordbook()
      })
      .catch((error) => {
        this.setData({ loading: false, error: errorMessage(error) })
      })
  },

  openOrigin() {
    const article = this.data.article || {}
    const active = (this.data.phrases || []).filter((item) => item.expanded).pop()
    this.setData({
      originOpen: true,
      originText: article.ocrText || '',
      originHighlight: active ? active.sentence || '' : ''
    })
  },

  closeOrigin() {
    this.setData({ originOpen: false })
  },

  applyStudy(study) {
    const article = study.article
    const unit = study.unit
    const unitData = article.unitData || {}
    const source = Array.isArray(unitData.phrases) ? unitData.phrases : []
    const viewed = unit.phrasesViewed || []
    const expanded = Object.assign({}, this.data.expanded)

    const phrases = source.map((item) => {
      const isViewed = viewed.indexOf(item.id) >= 0
      if (expanded[item.id] === undefined) expanded[item.id] = isViewed
      return Object.assign({}, item, {
        viewed: isViewed,
        expanded: !!expanded[item.id],
        added: !!(this.savedWords && this.savedWords.has(item.phrase.toLowerCase()))
      })
    })

    const viewedCount = phrases.filter((item) => item.viewed).length

    this.setData({
      loading: false,
      article,
      unit,
      phrases,
      viewedCount,
      nextReady: !phrases.length || viewedCount === phrases.length,
      expanded
    }, () => this.scrollToResume())
  },

  scrollToResume() {
    if (!this.resumeFlag) return
    this.resumeFlag = false
    const article = this.data.article || {}
    const saved = resumeInfo(article._id)
    if (!saved || saved.station !== 2 || !saved.id) return
    setTimeout(() => {
      wx.pageScrollTo({
        selector: '#phrase-' + saved.id,
        offsetTop: -140,
        duration: 260,
        fail: () => {}
      })
    }, 120)
  },

  syncWordbook() {
    list(true).then((data) => {
      this.savedWords = new Set((data.phraseItems || []).map((item) => item.word.toLowerCase()))
      const phrases = this.data.phrases.map((item) => Object.assign({}, item, {
        added: this.savedWords.has(item.phrase.toLowerCase())
      }))
      this.setData({ phrases })
    }).catch(() => {})
  },

  togglePhrase(event) {
    const id = event.currentTarget.dataset.id
    if (!id) return
    const phrases = this.data.phrases.map((item) => (
      item.id === id ? Object.assign({}, item, { expanded: !item.expanded }) : item
    ))
    const target = phrases.find((item) => item.id === id)
    const expanded = Object.assign({}, this.data.expanded, { [id]: target.expanded })
    this.setData({ phrases, expanded })
    if (target.expanded) saveResume(2, id)
    if (target.expanded && !target.viewed) this.markViewed(id)
  },

  markViewed(id) {
    const viewed = (this.data.unit && this.data.unit.phrasesViewed) || []
    if (viewed.indexOf(id) >= 0) return
    if (this.data.saving) {
      this.queue = (this.queue || []).concat(id)
      return
    }
    this.commitViewed(viewed.concat(id))
  },

  commitViewed(nextViewed) {
    this.setData({ saving: true })
    updateStudy({ phrasesViewed: nextViewed })
      .then((study) => {
        this.applyStudy(study)
        this.setData({ saving: false })
        const next = (this.queue || []).shift()
        if (next) this.markViewed(next)
      })
      .catch((error) => {
        this.queue = []
        this.setData({ saving: false })
        wx.showToast({ title: errorMessage(error), icon: 'none' })
      })
  },

  addToPhrasebook(event) {
    const id = event.currentTarget.dataset.id
    const item = this.data.phrases.find((phrase) => phrase.id === id)
    if (!item || this.data.addingId) return
    if (item.added) {
      wx.showToast({ title: '已在词组本里了', icon: 'none' })
      return
    }

    this.setData({ addingId: id })
    addPhrase({
      phrase: item.phrase,
      meaning: item.meaning,
      matched: item.matched,
      note: item.note,
      sentence: item.sentence,
      articleId: this.data.article ? this.data.article._id : '',
      articleTitle: this.data.article ? this.data.article.title : ''
    }).then((data) => {
      this.savedWords = this.savedWords || new Set()
      this.savedWords.add(item.phrase.toLowerCase())
      const phrases = this.data.phrases.map((phrase) => (
        phrase.id === id ? Object.assign({}, phrase, { added: true }) : phrase
      ))
      this.setData({ phrases, addingId: '' })
      wx.showToast({ title: data.existed ? '已在词组本里了' : '已加入词组本', icon: data.existed ? 'none' : 'success' })
    }).catch((error) => {
      this.setData({ addingId: '' })
      wx.showToast({ title: errorMessage(error), icon: 'none' })
    })
  },

  goGrammar() {
    wx.navigateTo({ url: '/pages/analysis/index' })
  },

  goSummary() {
    wx.navigateTo({ url: '/pages/summary/index' })
  }
})
