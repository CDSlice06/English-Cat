const { loadStudy, updateStudy, saveResume, resumeInfo } = require('../../services/study')
const grammarbook = require('../../services/grammarbook')
const { errorMessage } = require('../../utils/error')

function fingerprint(articleId, key, sentence) {
  const normalizedKey = String(key || '').trim().toLowerCase()
  const normalizedSentence = String(sentence || '').trim().toLowerCase().replace(/\s+/g, ' ')
  return `${articleId}:${normalizedKey}:${normalizedSentence}`
}

// 精讲生成期间每隔 6 秒刷新一次，最多刷 20 次（约两分钟），覆盖两阶段模型调用耗时
const MAX_AI_POLLS = 20

Page({
  data: {
    loading: true,
    error: '',
    article: null,
    unit: null,
    points: [],
    viewedCount: 0,
    drillTotal: 0,
    percent: 0,
    nextReady: false,
    aiPending: false,
    expanded: {},
    saving: false,
    savingId: '',
    // 原文抽屉：纯前端展示，不发请求
    originOpen: false,
    originText: '',
    originHighlight: ''
  },

  onLoad(options) {
    // 从工作台「继续上次」进来：渲染完滚回上次展开的那张语法卡
    this.resumeFlag = !!(options && options.resume)
  },

  onShow() {
    this.loadPage()
  },

  onHide() {
    this.clearAiTimer()
  },

  onUnload() {
    this.clearAiTimer()
  },

  loadPage() {
    this.setData({ loading: true, error: '' })
    this.aiPolls = 0
    loadStudy(true)
      .then((study) => {
        this.applyStudy(study)
        this.syncGrammarbook()
      })
      .catch((error) => {
        this.setData({ loading: false, error: errorMessage(error) })
      })
  },

  openOrigin() {
    const article = this.data.article || {}
    // 正在展开哪张语法卡，就高亮它在原文里的那一句
    const active = (this.data.points || []).filter((item) => item.expanded).pop()
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
    const source = Array.isArray(unitData.grammarPoints) ? unitData.grammarPoints : []
    const viewed = unit.grammarViewed || []
    const expanded = Object.assign({}, this.data.expanded)
    // 和练习页同一口径：同方向 + 同题干只算一道，避免两页题数对不上
    const drillKeys = new Set()

    const points = source.map((point, index) => {
      const drills = point.drills || []
      drills.forEach((drill) => {
        if (!drill.id) return
        drillKeys.add(`${drill.mode || ''}|${String(drill.prompt || '').trim().toLowerCase()}`)
      })
      const isViewed = viewed.indexOf(point.id) >= 0
      if (expanded[point.id] === undefined) expanded[point.id] = isViewed
      return Object.assign({}, point, {
        label: index + 1 < 10 ? `0${index + 1}` : String(index + 1),
        number: index + 1,
        viewed: isViewed,
        expanded: !!expanded[point.id],
        steps: Array.isArray(point.steps) ? point.steps : [],
        chunks: Array.isArray(point.chunks) ? point.chunks : [],
        examples: point.examples || [],
        drillCount: drills.length,
        saved: !!(this.savedGrammar && this.savedGrammar.has(fingerprint(article._id, point.key, point.sentence)))
      })
    })

    const viewedCount = viewed.filter((id) => source.some((point) => point.id === id)).length
    const aiPending = article.aiStatus === 'pending' || article.aiStatus === 'running'

    this.setData({
      loading: false,
      article,
      unit,
      points,
      viewedCount,
      drillTotal: drillKeys.size,
      percent: points.length ? Math.round((viewedCount / points.length) * 100) : 0,
      nextReady: !points.length || viewedCount === points.length,
      aiPending,
      expanded
    }, () => this.scrollToResume())

    if (aiPending) this.scheduleAiRefresh()
  },

  scrollToResume() {
    if (!this.resumeFlag) return
    this.resumeFlag = false
    const article = this.data.article || {}
    const saved = resumeInfo(article._id)
    if (!saved || saved.station !== 3 || !saved.id) return
    setTimeout(() => {
      wx.pageScrollTo({
        selector: '#grammar-' + saved.id,
        offsetTop: -140,
        duration: 260,
        fail: () => {}
      })
    }, 120)
  },

  scheduleAiRefresh() {
    this.clearAiTimer()
    if ((this.aiPolls || 0) >= MAX_AI_POLLS) return
    this.aiPolls = (this.aiPolls || 0) + 1
    this.aiTimer = setTimeout(() => {
      this.aiTimer = null
      loadStudy(true).then((study) => this.applyStudy(study)).catch(() => {})
    }, 6000)
  },

  clearAiTimer() {
    if (this.aiTimer) {
      clearTimeout(this.aiTimer)
      this.aiTimer = null
    }
  },

  togglePoint(event) {
    const id = event.currentTarget.dataset.id
    if (!id) return
    const points = this.data.points.map((point) => (
      point.id === id ? Object.assign({}, point, { expanded: !point.expanded }) : point
    ))
    const target = points.find((point) => point.id === id)
    const expanded = Object.assign({}, this.data.expanded, { [id]: target.expanded })
    this.setData({ points, expanded })
    if (target.expanded) saveResume(3, id)
    if (target.expanded && !target.viewed) this.markViewed(id)
  },

  markViewed(id) {
    const viewed = (this.data.unit && this.data.unit.grammarViewed) || []
    if (viewed.indexOf(id) >= 0) return
    if (this.data.saving) {
      this.queue = (this.queue || []).concat(id)
      return
    }
    this.commitViewed(viewed.concat(id))
  },

  commitViewed(nextViewed) {
    this.setData({ saving: true })
    updateStudy({ grammarViewed: nextViewed })
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

  syncGrammarbook() {
    grammarbook.list(true).then((data) => {
      this.savedGrammar = new Set((data.items || []).map((item) => (
        fingerprint(item.articleId, item.key, item.sentence)
      )))
      const articleId = this.data.article ? this.data.article._id : ''
      const points = this.data.points.map((point) => Object.assign({}, point, {
        saved: this.savedGrammar.has(fingerprint(articleId, point.key, point.sentence))
      }))
      this.setData({ points })
    }).catch(() => {})
  },

  addToGrammarbook(event) {
    const id = event.currentTarget.dataset.id
    const point = this.data.points.find((item) => item.id === id)
    if (!point || this.data.savingId) return
    if (point.saved) {
      wx.showToast({ title: '已在语法本里了', icon: 'none' })
      return
    }

    const articleId = this.data.article ? this.data.article._id : ''
    this.setData({ savingId: id })
    grammarbook.addPoint(articleId, id).then((data) => {
      this.savedGrammar = this.savedGrammar || new Set()
      this.savedGrammar.add(fingerprint(articleId, point.key, point.sentence))
      const points = this.data.points.map((item) => (
        item.id === id ? Object.assign({}, item, { saved: true }) : item
      ))
      this.setData({ points, savingId: '' })
      wx.showToast({ title: data.existed ? '已在语法本里了' : '已收藏到语法本', icon: data.existed ? 'none' : 'success' })
    }).catch((error) => {
      this.setData({ savingId: '' })
      wx.showToast({ title: errorMessage(error), icon: 'none' })
    })
  },

  goPractice() {
    wx.navigateTo({ url: '/pages/practice/index' })
  },

  goPhrases() {
    wx.navigateTo({ url: '/pages/phrases/index' })
  }
})
