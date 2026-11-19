const { loadStudy, updateStudy, triggerEnhance, saveResume, resumeInfo } = require('../../../services/study')
const wordbook = require('../../../services/wordbook')
const cet = require('../../../utils/cet')
const wordPatterns = require('../../utils/wordPatterns')
const wordExtras = require('../../utils/wordExtras')

// 变形词展示顺序与中文标签
const FORM_LABELS = {
  plural: '复数',
  third: '三单',
  past: '过去式',
  pp: '过去分词',
  ing: '现在分词',
  comp: '比较级',
  sup: '最高级'
}

// 五类词的卡片色调，避免整页单一色块
const TONE_BY_CATEGORY = {
  cet4: 'sun',
  cet6: 'sky',
  familiar: 'coral',
  difficult: 'violet',
  frequent: 'mint'
}

function toFormList(forms) {
  if (!forms) return []
  return Object.keys(FORM_LABELS)
    .filter((key) => forms[key])
    .map((key) => ({ label: FORM_LABELS[key], value: forms[key] }))
}

// 派生词合并：解析时存的自带一份，云端补查回来的同根词再补进去，
// 老文章靠后者也有内容；按拼写去重，最多留 4 条
function mergeRelated(own, extra) {
  const list = []
  const seen = new Set()
  ;(Array.isArray(own) ? own : []).concat(Array.isArray(extra) ? extra : []).forEach((item) => {
    const word = String((item && item.w) || '').toLowerCase()
    if (!word || seen.has(word)) return
    seen.add(word)
    list.push(item)
  })
  return list.slice(0, 4)
}

// 重绘签名：回页刷新时先比对关键字段，一致就不 setData，避免整页重建造成闪动
function renderSignature(payload) {
  const article = payload.article || {}
  // 前 4 项是文章级版本信息；词条只比 id、掌握态和整条序列化长度（长度变了就是内容变了）
  return JSON.stringify([
    article._id,
    article.aiStatus || '',
    article.extractVersion || 0,
    article.updatedAt || 0,
    (payload.words || []).map((word) => `${word.id}:${word.mastered ? 1 : 0}:${JSON.stringify(word).length}`),
    (payload.filters || []).map((filter) => `${filter.key}:${filter.count}`),
    payload.activeCategory,
    payload.masteredCount,
    payload.vocabularyCount,
    payload.aiBusy ? 1 : 0
  ])
}

Page({
  data: {
    loading: true,
    error: '',
    article: null,
    unit: null,
    // 默认落在「全部词汇」：分类页会把列表切窄，用户容易误以为整篇只有这么多词
    activeCategory: 'all',
    activeLabel: '',
    filters: [],
    words: [],
    masteredCount: 0,
    masteredPercent: 0,
    nextReady: false,
    vocabularyCount: 0,
    saving: false,
    // 左滑露出的操作区总宽度（px），两个按钮各 ≥88rpx
    swipeWidth: 0,
    // 还有超纲词没拿到释义：页面要轮询刷新，不能一直停在「补全中」
    aiBusy: false,
    // 备考标尺：四级 / 六级两套星级，切换后同一个词的星级会变
    cetTarget: 'cet4',
    cetLabel: '四级',
    // 原文抽屉：纯前端展示，不发请求
    originOpen: false,
    originText: '',
    originHighlight: ''
  },

  onLoad(options) {
    // 从工作台「继续上次」进来：数据渲染完后滚回上次那个词
    this.resumeFlag = !!(options && options.resume)
    let info = {}
    try {
      info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
    } catch (error) {
      info = {}
    }
    const width = Number(info && info.windowWidth) || 375
    // 星级标尺跟随上次选择（没选过就用备考级别 userLevel），进页面就按它显示
    const target = cet.getTarget()
    this.setData({
      swipeWidth: Math.round((width / 750) * 200),
      cetTarget: target,
      cetLabel: cet.targetLabel(target)
    })
  },

  onShow() {
    this.aiPolls = 0
    this.loadPage()
  },

  onHide() {
    this.clearAiTimer()
  },

  onUnload() {
    this.clearAiTimer()
  },

  openOrigin() {
    const article = this.data.article || {}
    this.setData({
      originOpen: true,
      originText: article.ocrText || '',
      originHighlight: ''
    })
  },

  closeOrigin() {
    this.setData({ originOpen: false })
  },

  clearAiTimer() {
    if (this.aiTimer) {
      clearTimeout(this.aiTimer)
      this.aiTimer = null
    }
  },

  // 精讲在后台跑，页面按 5 秒一轮刷新，最多等 2 分钟
  scheduleAiRefresh() {
    this.clearAiTimer()
    if ((this.aiPolls || 0) >= 24) {
      // 等了两分钟还没补上：不再挂着「正在补全」，改成明确的失败兜底文案
      if (this.data.aiBusy) this.setData({ aiBusy: false })
      return
    }
    this.aiPolls = (this.aiPolls || 0) + 1
    this.aiTimer = setTimeout(() => {
      this.aiTimer = null
      loadStudy(true).then((study) => this.applyStudy(study, true)).catch(() => {})
    }, 5000)
  },

  // 补全可能被超时或额度中断：停在本页时也主动再触发一次，一分钟节流
  retryEnhance(article) {
    if (this.enhancing || !article || !article._id) return
    const aiAt = article.aiAt ? new Date(article.aiAt).getTime() || 0 : 0
    if (aiAt && Date.now() - aiAt < 60 * 1000) return
    // 本地也记一次：云端「仍在运行」时不会刷新 aiAt，否则轮询会每 5 秒打一次云函数
    if (Date.now() - (this.enhanceAt || 0) < 60 * 1000) return
    this.enhanceAt = Date.now()
    this.enhancing = true
    triggerEnhance(article._id).then(() => { this.enhancing = false }, () => { this.enhancing = false })
  },

  loadPage() {
    // 页面上已有内容时（从其它页面切回来）：不闪加载态，刷新结果没变化就不重建
    const warm = !!this.ready
    if (!warm) this.setData({ loading: true, error: '' })
    Promise.all([loadStudy(true), wordbook.list().catch(() => null)])
      .then(([study, book]) => {
        this.ready = true
        this.bookWords = new Set((book ? book.items : []).map((item) => item.word))
        this.applyStudy(study, warm)
      })
      .catch((error) => {
        // 回页刷新失败时保留已有内容，别把渲染好的页面换成错误页
        if (warm) return
        this.setData({
          loading: false,
          error: error.message || '学习数据加载失败，请重试'
        })
      })
  },

  applyStudy(study, quiet) {
    const article = study.article
    const unit = study.unit
    const unitData = article.unitData || {}
    const vocabulary = unitData.vocabulary || []
    const categoryOptions = unitData.categoryOptions || []
    const hasActiveCategory = this.data.activeCategory === 'all'
      || categoryOptions.some((category) => category.key === this.data.activeCategory)
    const activeCategory = hasActiveCategory
      ? this.data.activeCategory
      // 没有分类选项的旧文章也回到「全部」，否则筛选条件对不上会渲染出空列表
      : (categoryOptions[0] ? categoryOptions[0].key : 'all')
    const activeOption = categoryOptions.find((category) => category.key === activeCategory)
    const masteredWords = unit.masteredWords || []
    const expanded = this.expandedIds || new Set()
    // 口径：本篇全部单词都要掌握，不再区分核心/拓展
    const masteredCount = vocabulary.filter((word) => masteredWords.indexOf(word.id) >= 0).length
    // 「全部」固定在最前，其余分类横向滚动，避免五个标签挤在一行
    const filters = [
      { key: 'all', label: '全部词汇', shortLabel: '全部', count: vocabulary.length }
    ]
      .concat(categoryOptions.map((category) => ({
        key: category.key,
        label: category.label,
        shortLabel: category.shortLabel,
        count: vocabulary.filter((word) => (word.categories || []).indexOf(category.key) >= 0).length
      })))
      .map((category) => Object.assign({}, category, { active: category.key === activeCategory }))
    const words = vocabulary
      .filter((word) => {
        // 没有生效的分类时按「全部」处理，绝不能出现「有总数但列表为空」的死局
        if (activeCategory === 'all' || !activeCategory) return true
        return (word.categories || []).indexOf(activeCategory) >= 0
      })
      .map((word) => {
        const held = (this.freqMap || {})[String(word.word || '').toLowerCase()] || {}
        const extra = wordExtras.extrasOf(word.word)
        return Object.assign({}, word, this.starsOf(word), {
          mastered: masteredWords.indexOf(word.id) >= 0,
          inBook: !!(this.bookWords && this.bookWords.has(word.word)),
          // 解析时就认得这个词（生词本 / 其它文章掌握过），不再是「待补全」
          known: word.known === true,
          knownLabel: word.knownSource === 'mastered' ? '已掌握过' : '已在生词本',
          expanded: expanded.has(word.id),
          tone: TONE_BY_CATEGORY[(word.categories || [])[0]] || 'sun',
          formList: toFormList(word.forms),
          // 派生：解析时存的 + 云端补查的同根词（老文章靠后者补全）
          derivatives: mergeRelated(word.derivatives, held.family),
          // 形近：拼写只差一点的词，旧文章解析时没有，靠云端补查
          similar: Array.isArray(held.similar) ? held.similar.slice(0, 4) : [],
          // 词根拆解与易混辨析：同样来自云端补查，词库没有收录时为空
          root: held.root || null,
          confusables: Array.isArray(held.confusables) ? held.confusables.slice(0, 4) : [],
          // 用法、近义词：本地数据，展开就能看
          patterns: wordPatterns.patternsOf(word.word),
          patternExample: wordPatterns.exampleOf(word.word),
          synonyms: extra.synonyms,
          // 左滑位移（px）：0 表示收起，负值是露出的操作区宽度
          offset: 0
        })
      })

    // 有词条还没释义、且后台还在补全：保持轮询，补全后自动替换占位文案
    // 老文章没有 wordsPending 标记：只要还有词没释义，就当作待补全，让本页继续等
    // 已认识的词不会再走模型补全，不能算进「待补全」，否则本页会一直轮询
    const missing = vocabulary.filter((word) => word.known !== true && !(word.meanings || []).length).length
    const aiBusy = missing > 0 && !article.isDemo
      && (article.aiStatus === 'pending' || article.aiStatus === 'running'
        || article.wordsPending === true || article.aiStatus === 'ready')

    const payload = {
      loading: false,
      article,
      unit,
      activeCategory,
      activeLabel: activeOption ? activeOption.label : '全部词汇',
      filters,
      words,
      masteredCount,
      // 完成口径 = 本篇单词全部点亮
      masteredPercent: vocabulary.length ? Math.min(100, Math.round((masteredCount / vocabulary.length) * 100)) : 0,
      nextReady: masteredCount >= vocabulary.length,
      vocabularyCount: vocabulary.length,
      aiBusy
    }
    const signature = renderSignature(payload)
    // 回页静默刷新：和上次渲染完全一致就不碰界面（左滑、展开状态一并保留）
    if (quiet && signature === this.renderSignature) {
      if (aiBusy) {
        this.scheduleAiRefresh()
        this.retryEnhance(article)
      } else this.clearAiTimer()
      return
    }
    this.renderSignature = signature
    // 真正重建列表时才收回左滑状态，避免旧位移跟着新列表跑
    this.openSwipeId = ''
    this.swipe = null
    const wordIndex = {}
    words.forEach((word, index) => { wordIndex[word.id] = index })
    this.wordIndex = wordIndex
    this.setData(payload, () => this.scrollToResume())
    this.fillFreqs(words)

    if (aiBusy) {
      this.scheduleAiRefresh()
      this.retryEnhance(article)
    } else this.clearAiTimer()
  },

  // 星级：解析时按四级 / 六级两套标尺各存了一份（freq4 / freq6），这里挑出当前标尺那份。
  // 云函数补查回来的 freqMap 优先：真题词频更新后，老文章存的旧星级也能立刻换成新口径
  starsOf(word) {
    let freq4
    let freq6
    const held = (this.freqMap || {})[String(word.word || '').toLowerCase()]
    if (held) {
      freq4 = Number(held.freq4) || 0
      freq6 = Number(held.freq6) || 0
    } else if (word.freq4 !== undefined || word.freq6 !== undefined) {
      freq4 = Number(word.freq4) || 0
      freq6 = Number(word.freq6) || 0
    } else {
      // 极老的文章只存过一个 freq，先用它顶着，等 fillFreqs 拿到新星级再替换
      freq4 = Number(word.freq) || 0
      freq6 = freq4
    }
    const star = this.data.cetTarget === 'cet6' ? freq6 : freq4
    return { freq4, freq6, star, starLabel: cet.starLabel(star) }
  },

  // 切换备考标尺：两套星级解析时都已算好，直接换显示，不需要重新请求
  selectCetTarget(event) {
    const target = cet.saveTarget(event.currentTarget.dataset.target)
    if (target === this.data.cetTarget) return
    this.setData({ cetTarget: target, cetLabel: cet.targetLabel(target) })
    this.applyStudy({ article: this.data.article, unit: this.data.unit })
  },

  // 按词批量查一次词库（不调模型），把最新的真题星级贴到页面上。
  // 不能只查老文章：解析时存下的星级是旧口径，必须用云端的当前结果覆盖
  fillFreqs(words) {
    this.freqMap = this.freqMap || {}
    const missing = []
    ;(words || []).forEach((word) => {
      const key = String(word.word || '').toLowerCase()
      if (!key || this.freqMap[key] !== undefined || missing.indexOf(key) >= 0) return
      missing.push(key)
    })
    if (!missing.length) return
    const pendingKey = missing.slice().sort().join('|')
    // 同一批词只请求一次，筛选来回切换不会重复打云函数
    if (this.freqPending === pendingKey) return
    this.freqPending = pendingKey
    wordbook.freqsOf(missing).then((map) => {
      this.freqPending = ''
      // 网络失败不写缓存，保留页面已有星级
      if (!map) return
      const fresh = map
      // 词库里确实没有依据的词也记成 0 星，下次不再重复查
      missing.forEach((key) => {
        const hit = fresh[key]
        this.freqMap[key] = hit && typeof hit === 'object'
          ? {
              freq4: Number(hit.freq4) || 0,
              freq6: Number(hit.freq6) || 0,
              family: Array.isArray(hit.family) ? hit.family : [],
              similar: Array.isArray(hit.similar) ? hit.similar : [],
              root: hit.root || null,
              confusables: Array.isArray(hit.confusables) ? hit.confusables : []
            }
          : { freq4: 0, freq6: 0, family: [], similar: [], root: null, confusables: [] }
      })
      this.applyStudy({ article: this.data.article, unit: this.data.unit })
    })
  },

  // 从工作台「继续上次」进来时，把上次停下的那张卡滚到眼前
  scrollToResume() {
    if (!this.resumeFlag) return
    this.resumeFlag = false
    const article = this.data.article || {}
    const saved = resumeInfo(article._id)
    if (!saved || saved.station !== 1 || !saved.id) return
    setTimeout(() => {
      wx.pageScrollTo({
        selector: '#word-' + saved.id,
        offsetTop: -140,
        duration: 260,
        fail: () => {}
      })
    }, 120)
  },

  // 左滑露出快捷操作：横向手势才接管，纵向滚动立刻让位
  swipeStart(event) {
    const id = event.currentTarget.dataset.id
    const touch = event.touches && event.touches[0]
    if (!id || !touch) return
    this.swipe = {
      id,
      x: touch.clientX,
      y: touch.clientY,
      base: this.openSwipeId === id ? -this.data.swipeWidth : 0,
      moved: false,
      axis: ''
    }
    if (this.openSwipeId && this.openSwipeId !== id) this.closeSwipe()
  },

  swipeMove(event) {
    const swipe = this.swipe
    const touch = event.touches && event.touches[0]
    if (!swipe || !touch) return
    const dx = touch.clientX - swipe.x
    const dy = touch.clientY - swipe.y
    if (!swipe.axis) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
      swipe.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    }
    if (swipe.axis !== 'x') return
    swipe.moved = true
    const width = this.data.swipeWidth
    // 记下最新位移，setData 按帧节流，避免高频手势把渲染线程打满
    swipe.offset = Math.max(-width, Math.min(0, swipe.base + dx))
    const now = Date.now()
    if (now - (swipe.at || 0) < 16) return
    swipe.at = now
    this.setWordOffset(swipe.id, swipe.offset)
  },

  swipeEnd() {
    const swipe = this.swipe
    this.swipe = null
    if (!swipe) return
    const width = this.data.swipeWidth
    if (!swipe.moved) {
      if (this.openSwipeId) this.closeSwipe()
      return
    }
    // 节流可能吃掉最后一帧：以手指离开时的实际位移为准
    const offset = typeof swipe.offset === 'number'
      ? swipe.offset
      : (((this.data.words || []).find((word) => word.id === swipe.id) || {}).offset || 0)
    if (offset <= -width / 2) {
      this.setWordOffset(swipe.id, -width)
      this.openSwipeId = swipe.id
    } else {
      this.setWordOffset(swipe.id, 0)
      if (this.openSwipeId === swipe.id) this.openSwipeId = ''
    }
  },

  setWordOffset(id, offset) {
    // 索引在重建列表时一次算好，拖动过程中不再每帧全表 findIndex
    const index = this.wordIndex ? this.wordIndex[id] : undefined
    if (index === undefined) return
    this.setData({ [`words[${index}].offset`]: offset })
  },

  closeSwipe() {
    const id = this.openSwipeId
    this.openSwipeId = ''
    if (id) this.setWordOffset(id, 0)
  },

  selectCategory(event) {
    if (this.data.saving) return
    const activeCategory = event.currentTarget.dataset.key
    if (activeCategory === this.data.activeCategory) return
    this.setData({ activeCategory })
    this.applyStudy({ article: this.data.article, unit: this.data.unit })
  },

  // 星级说明：文案跟着当前标尺走，讲清四六级两套标尺的关系，没有依据的词不显示星星
  showFreqHelp() {
    wx.showModal({
      title: `星级怎么算 · ${this.data.cetLabel}标尺`,
      content: cet.freqHelp(this.data.cetTarget),
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#a86a11'
    })
  },

  // 变形与例句默认折叠，点一下展开，让一屏能多过几个词
  toggleMore(event) {
    const id = event.currentTarget.dataset.id
    if (!id) return
    if (!this.expandedIds) this.expandedIds = new Set()
    const opening = !this.expandedIds.has(id)
    if (opening) this.expandedIds.add(id)
    else this.expandedIds.delete(id)
    if (opening) saveResume(1, id)
    this.applyStudy({ article: this.data.article, unit: this.data.unit })
  },

  toggleWord(event) {
    if (this.data.saving) return
    const id = event.currentTarget.dataset.id
    const masteredWords = (this.data.unit.masteredWords || []).slice()
    const index = masteredWords.indexOf(id)
    if (index >= 0) masteredWords.splice(index, 1)
    else masteredWords.push(id)

    this.setData({ saving: true })
    updateStudy({ masteredWords })
      .then((study) => {
        saveResume(1, id)
        this.applyStudy(study)
        this.setData({ saving: false })
      })
      .catch((error) => {
        this.setData({ saving: false })
        wx.showToast({ title: error.message || '掌握状态保存失败', icon: 'none' })
      })
  },

  addToBook(event) {
    const id = event.currentTarget.dataset.id
    const word = (this.data.words || []).find((item) => item.id === id)
    if (!word || word.inBook) return
    if (this.addingBook) return
    this.addingBook = true

    wordbook.addWord({
      word: word.word,
      phonetic: word.phonetic,
      meanings: word.meanings,
      source: 'article',
      articleId: this.data.article ? this.data.article._id : ''
    }).then((data) => {
      this.addingBook = false
      if (this.bookWords) this.bookWords.add(word.word)
      this.applyStudy({ article: this.data.article, unit: this.data.unit })
      wx.showToast({ title: data.existed ? '这个词已在生词本' : '已加入生词本', icon: data.existed ? 'none' : 'success' })
    }).catch((error) => {
      this.addingBook = false
      wx.showToast({ title: error.message || '加入失败，请重试', icon: 'none' })
    })
  },

  goPhrases() {
    if (this.data.saving) return
    wx.navigateTo({ url: '/pages/phrases/index?source=vocabulary' })
  }
})
