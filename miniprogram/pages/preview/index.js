const {
  loadRemembered, analyzeText, translateText, importArticle, loadFullTranslation, openArticle, saveUnit, isReadingArticle
} = require('../../services/study')
const { errorMessage: baseErrorMessage } = require('../../utils/error')

const LEVEL_LABEL = { cet4: '四级', cet6: '六级' }

// 导入成功后回题库：栈里已经有题库页就直接退回它，把导入页、校对页、本页一起出栈，
// 否则退回最底层页面。避免用户按返回时又落回校对页，被反复要求「选择导入」
function backToLibrary() {
  const pages = getCurrentPages()
  const target = pages.findIndex((page) => page.route === 'pages/library/index')
  const delta = target >= 0 ? pages.length - 1 - target : pages.length - 1
  if (delta > 0) {
    wx.navigateBack({ delta })
    return
  }
  // 兜底：栈里没有上一页时直接顶替当前页，保证不会又落回解析预览
  wx.redirectTo({ url: '/pages/library/index' })
}

// 预览页兜底文案：其余错误处理逻辑统一走 utils/error
const errorMessage = (error) => baseErrorMessage(error, '预览没有完成，请稍后重试')

function metaLine(meta) {
  const parts = [LEVEL_LABEL[meta && meta.level] || '四级']
  if (meta && meta.year) parts.push(`${meta.year}年`)
  if (meta && meta.month) parts.push(`${meta.month}月`)
  if (meta && meta.paper) parts.push(`第${meta.paper}套`)
  if (meta && meta.passage) parts.push(`Passage ${meta.passage}`)
  return parts.join(' · ')
}

function countWords(text) {
  return (String(text || '').match(/[A-Za-z][A-Za-z'-]*/g) || []).length
}

// 原文按空行切自然段；整篇没有空行时就当作一段
function splitParagraphs(text) {
  return String(text || '')
    .split(/\n{2,}/)
    .map((block) => block.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

// 译文每句都带段落序号，按序号拼回去就是和原文一致的分段
function groupTranslation(items) {
  const groups = []
  ;(Array.isArray(items) ? items : []).forEach((item) => {
    const zh = String((item && item.zh) || '').trim()
    if (!zh) return
    const index = Number(item && item.para) >= 0 ? Number(item.para) : 0
    groups[index] = (groups[index] || '') + zh
  })
  return groups.filter(Boolean)
}

// 词条可能带多条义项，预览里只展示第一条最常用的
const COUNT_LABELS = { C: '可数', U: '不可数', 'C/U': '可数/不可数' }

function firstMeaning(item) {
  if (typeof item.meaning === 'string' && item.meaning) return item.meaning
  const list = Array.isArray(item.meanings) ? item.meanings : []
  const first = list[0] || {}
  const pos = first.pos ? `${first.pos} ` : ''
  const count = COUNT_LABELS[first.count] ? `（${COUNT_LABELS[first.count]}）` : ''
  return `${pos}${first.definition || first.cn || ''}${count}`.trim()
}

Page({
  data: {
    mode: 'import',
    readingMode: false,
    kicker: 'IMPORT PREVIEW',
    headTitle: '先看一眼这篇要学什么',
    actionText: '确认导入',
    busyText: '正在存入…',
    backText: '返回校对页',
    loading: true,
    error: '',
    importing: false,
    title: '',
    metaLine: '',
    wordCount: 0,
    articleParagraphs: [],
    total: 1,
    translationParagraphs: [],
    translationLoading: false,
    translationError: '',
    goals: [],
    wordList: [],
    phraseList: [],
    grammarList: []
  },

  onUnload() {
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer)
      this.redirectTimer = null
    }
  },

  onLoad(options) {
    const mode = options && options.mode === 'article' ? 'article' : 'import'
    this.mode = mode
    if (mode === 'article') {
      this.setData({
        mode,
        kicker: 'BEFORE YOU START',
        headTitle: '开始这篇之前，先看一眼',
        actionText: '开始学习',
        busyText: '正在打开…',
        backText: '返回题库'
      })
      this.loadArticle()
      return
    }
    const payload = wx.getStorageSync('importPreview')
    if (!payload || !Array.isArray(payload.batches) || !payload.batches.length) {
      this.setData({ loading: false, error: '没有待导入的文章，请返回重新上传' })
      return
    }
    this.payload = payload
    this.batch = payload.batches[0]
    this.meta = (payload.meta && payload.meta[0]) || {}
    this.setData({
      title: this.batch.title || this.meta.title || '这篇要学什么',
      metaLine: metaLine(this.meta),
      wordCount: countWords(this.batch.text),
      articleParagraphs: splitParagraphs(this.batch.text),
      total: payload.batches.length
    })
    this.preview()
  },

  // 题库点开文章：已解析过的直接复用云端结果，没解析过的在这里解析并翻译
  loadArticle() {
    const payload = wx.getStorageSync('articlePreview')
    if (!payload || !payload.articleId) {
      this.setData({ loading: false, error: '这篇文章的信息没取到，请返回题库重试' })
      return
    }
    this.article = payload
    // 外刊与用户导入的文章按阅读优先学：确认后直接进阅读页，不拆四站
    this.readingMode = isReadingArticle(payload)
    this.batch = { text: payload.text || '' }
    this.meta = {
      level: payload.level,
      year: payload.year,
      month: payload.month,
      paper: payload.paper,
      passage: payload.passage
    }
    this.setData({
      readingMode: this.readingMode,
      title: payload.title || '这篇要学什么',
      metaLine: metaLine(this.meta),
      wordCount: payload.wordCount || countWords(payload.text),
      articleParagraphs: splitParagraphs(payload.text),
      kicker: this.readingMode ? 'READING MODE' : 'BEFORE YOU START',
      headTitle: this.readingMode ? '先读一遍，再拆知识点' : '开始这篇之前，先看一眼',
      actionText: this.readingMode ? '开始阅读' : '开始学习'
    })

    if (payload.ready) {
      const cached = payload.cached || {}
      const goals = this.buildGoals(cached)
      if (!this.readingMode && !goals.goals.some((item) => item.count > 0)) {
        this.setData({ loading: false, error: '这篇没有可学习的内容，换一篇试试' })
        return
      }
      this.unitData = null
      this.setData(Object.assign({ loading: false }, goals))
      const translation = Array.isArray(cached.translation) ? cached.translation : []
      if (translation.length) {
        this.setData({ translationParagraphs: groupTranslation(translation) })
      } else {
        this.fetchCachedTranslation(payload.articleId)
      }
      return
    }
    this.preview()
  },

  // 解析学习单元与整篇译文并行跑，任何一个失败都能单独重试
  preview() {
    this.setData({ loading: true, error: '' })
    this.unitData = null
    const analysis = loadRemembered()
      .catch(() => ({}))
      .then((remembered) => analyzeText(this.batch.text, this.meta.level, remembered))

    Promise.all([
      analysis.then((unit) => ({ unit })).catch((error) => ({ error })),
      this.fetchTranslation()
    ]).then(([result, translation]) => {
      if (result.error) {
        this.setData({ loading: false, error: errorMessage(result.error) })
        return
      }
      const goals = this.buildGoals(result.unit)
      if (!this.readingMode && !goals.goals.some((item) => item.count > 0)) {
        this.setData({ loading: false, error: '这篇没有解析出可学习的内容，换一篇试试' })
        return
      }
      this.unitData = result.unit
      this.setData(Object.assign({ loading: false }, goals, translation))
    })
  },

  fetchTranslation() {
    this.setData({ translationLoading: true, translationError: '' })
    return translateText(this.batch.text, this.meta.level)
      .then((data) => {
        const sentences = Array.isArray(data.sentences) ? data.sentences : []
        // 确认后随学习单元一起落库，报告页的全文对照就不用再翻译一次
        this.translationSentences = sentences
        return {
          translationParagraphs: groupTranslation(sentences),
          translationLoading: false,
          translationError: ''
        }
      })
      .catch((error) => ({
        translationParagraphs: [],
        translationLoading: false,
        translationError: errorMessage(error)
      }))
  },

  // 已解析过的文章：全文对照由云端按 articleId 缓存，生成一次后不再调用模型
  fetchCachedTranslation(articleId) {
    this.setData({ translationLoading: true, translationError: '' })
    return loadFullTranslation(articleId)
      .then((data) => {
        const sentences = Array.isArray(data.sentences) ? data.sentences : []
        this.setData({
          translationParagraphs: groupTranslation(sentences),
          translationLoading: false,
          translationError: ''
        })
      })
      .catch((error) => this.setData({ translationLoading: false, translationError: errorMessage(error) }))
  },

  buildGoals(unit) {
    const vocabulary = Array.isArray(unit && unit.vocabulary) ? unit.vocabulary : []
    const phrases = Array.isArray(unit && unit.phrases) ? unit.phrases : []
    const grammarPoints = Array.isArray(unit && unit.grammarPoints) ? unit.grammarPoints : []
    return {
      goals: [
        { key: 'words', label: '单词', count: vocabulary.length },
        { key: 'phrases', label: '词组', count: phrases.length },
        { key: 'grammar', label: '语法与句式', count: grammarPoints.length }
      ],
      wordList: vocabulary.map((item) => ({
        word: item.word,
        meaning: firstMeaning(item)
      })).filter((item) => item.word),
      phraseList: phrases.map((item) => ({
        phrase: item.phrase,
        meaning: item.meaning || ''
      })).filter((item) => item.phrase),
      grammarList: grammarPoints.map((item) => ({
        pattern: item.pattern || '',
        sentence: item.sentence || ''
      })).filter((item) => item.pattern)
    }
  },

  retry() {
    if (this.mode === 'article') {
      this.loadArticle()
      return
    }
    this.preview()
  },

  retryTranslation() {
    if (this.data.translationLoading) return
    if (this.mode === 'article' && this.article && this.article.ready) {
      this.fetchCachedTranslation(this.article.articleId)
      return
    }
    this.fetchTranslation().then((patch) => this.setData(patch))
  },

  cancel() {
    wx.navigateBack()
  },

  confirm() {
    if (this.data.importing) return
    if (this.mode === 'article') {
      this.confirmArticle()
      return
    }
    if (!this.unitData) {
      wx.showToast({ title: '这篇还没预览完成', icon: 'none' })
      return
    }
    const payload = this.payload
    this.setData({ importing: true })
    wx.showLoading({ title: '正在存入题库…', mask: true })
    // 预览时已经翻译过整篇，一起落库，报告页的全文对照不用再翻译一次
    const unitData = Object.assign({}, this.unitData)
    if (Array.isArray(this.translationSentences) && this.translationSentences.length) {
      unitData.fullTranslation = this.translationSentences
    }
    importArticle(payload.batches[0].text, payload.meta[0], unitData)
      .then(() => {
        const rest = payload.batches.slice(1)
        return rest.reduce((chain, batch, index) => chain.then(() => importArticle(
          batch.text,
          payload.meta[index + 1]
        ).catch((error) => {
          // 排队篇失败不打断第一篇已经成功的入库
          console.error('排队文章导入失败', error)
        })), Promise.resolve())
      })
      .then(() => {
        wx.hideLoading()
        this.setData({ importing: false })
        wx.removeStorageSync('importPreview')
        wx.removeStorageSync('docDraft')
        wx.showToast({ title: '已存入题库', icon: 'success', duration: 900 })
        this.redirectTimer = setTimeout(() => {
          this.redirectTimer = null
          backToLibrary()
        }, 900)
      })
      .catch((error) => {
        wx.hideLoading()
        this.setData({ importing: false })
        wx.showModal({
          title: '没存进题库',
          content: errorMessage(error),
          showCancel: false
        })
      })
  },

  // 确认学习：已解析的直接切换文章；没解析的把预览结果落库后再切换
  confirmArticle() {
    const payload = this.article
    if (!payload) return
    const finish = () => {
      wx.hideLoading()
      this.setData({ importing: false })
      wx.removeStorageSync('articlePreview')
      if (this.readingMode) {
        wx.redirectTo({ url: '/pages/reading/index' })
        return
      }
      wx.switchTab({ url: '/pages/workbench/index' })
    }
    const fail = (error) => {
      wx.hideLoading()
      this.setData({ importing: false })
      // 35% 换文章门槛这类业务限制要弹窗说明，toast 一闪而过看不清
      wx.showModal({ title: '这篇现在打不开', content: errorMessage(error), showCancel: false })
    }
    this.setData({ importing: true })
    wx.showLoading({ title: '猫正在打开这篇…', mask: true })

    if (payload.ready) {
      openArticle(payload.articleId).then((data) => {
        // 极端情况下云端仍判定需要解析（例如刚升级了抽取规则），不要静默进空工作台
        if (data && data.needsAnalysis) throw new Error('这篇需要重新解析，请返回题库重新打开一次')
        finish()
      }).catch(fail)
      return
    }
    if (!this.unitData) {
      wx.hideLoading()
      this.setData({ importing: false })
      wx.showToast({ title: '这篇还没预览完成', icon: 'none' })
      return
    }
    const unitData = Object.assign({}, this.unitData)
    if (Array.isArray(this.translationSentences) && this.translationSentences.length) {
      unitData.fullTranslation = this.translationSentences
    }
    saveUnit(payload.articleId, unitData).then(finish).catch(fail)
  }
})
