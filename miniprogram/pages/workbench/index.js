const { loadStudy, getProgress, vocabStats, triggerEnhance, analyzeText, saveUnit, loadRemembered, readStudySnapshot, resumeInfo, isReadingArticle, readReadingSeconds, READING_TARGET_SECONDS } = require('../../services/study')

// 精讲要串两次模型调用（选点 + 讲解），最长接近一分钟，
// 刷新窗口必须覆盖这段耗时，否则提示会一直挂着不动
const MAX_AI_POLLS = 20
// 精讲版本：5 表示讲解术语必须与原句一致，旧卡片需要重新精讲
const DRILL_VERSION = 5

Page({
  data: { loading: true, error: '', title: '', progress: {}, units: [], readingMode: false, readingMinutes: 0, aiPending: false, aiFailed: false, aiStalled: false, repairing: false, resume: null },

  onShow() {
    const tabBar = typeof this.getTabBar === 'function' && this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 1 })
    this.renderSnapshot()
    this.load()
  },

  // 本地快照先铺首屏；快照只负责画面，不触发精讲和补解析
  renderSnapshot() {
    if (this.data.title) return
    const snapshot = readStudySnapshot()
    if (!snapshot) return
    this.applyStudy(snapshot, true)
  },

  onHide() {
    this.clearAiTimer()
  },

  onUnload() {
    this.clearAiTimer()
  },

  load() {
    if (!this.data.title) this.setData({ loading: true })
    this.setData({ error: '', aiStalled: false })
    this.aiPolls = 0
    loadStudy()
      .then((study) => this.applyStudy(study))
      .catch((error) => {
        // 快照已经铺满页面时，刷新失败保留旧画面，不把用户跳到错误页
        if (this.data.title) return
        this.setData({ loading: false, error: error.message })
      })
  },

  applyStudy(study, fromSnapshot) {
    const article = study.article || {}
    const unit = study.unit || {}
    const unitData = article.unitData || {}
    // 外刊只保留「阅读」一个入口，进度按累计活跃阅读时长算
    const readingMode = isReadingArticle(article)
    const readingSeconds = readingMode ? readReadingSeconds(article._id, unit) : 0
    const readingDone = readingSeconds >= READING_TARGET_SECONDS
    const progress = readingMode
      ? Object.assign({}, getProgress(unit, unitData), {
        completed: readingDone ? 1 : 0,
        total: 1,
        percent: readingDone ? 100 : Math.min(99, Math.floor((readingSeconds / READING_TARGET_SECONDS) * 100))
      })
      : getProgress(unit, unitData)
    const grammarTotal = (unitData.grammarPoints || []).length
    const phraseTotal = (unitData.phrases || []).length
    const vocabTotal = (unitData.vocabulary || []).length
    // 词汇站要求本篇单词全部掌握
    const vocab = vocabStats(unit, unitData)
    const grammarDone = !grammarTotal || progress.grammarViewed >= grammarTotal
    const phraseDone = !phraseTotal || progress.phrasesViewed >= phraseTotal
    const practiceDone = !progress.drillTotal || progress.practicePassed >= progress.drillTotal

    // 新文章保存后是 pending、旧文章可能是空状态、失败过的允许重试，这三种都由这里真正启动增强
    // 云函数被 60s 上限杀掉时状态会卡在 running，超过 2 分钟也视为可重试
    // 云端有 running / 刚失败 的节流，重复进入页面不会重复计费
    const aiAt = article.aiAt ? new Date(article.aiAt).getTime() || 0 : 0
    // 精讲被云函数超时杀掉时会停在 running，超过 2 分钟就允许重新触发
    const staleRunning = article.aiStatus === 'running' && aiAt > 0 && Date.now() - aiAt > 2 * 60 * 1000
    // 语法点还没按新版重写（旧版直接用文章原句当题目、句型名可能和句子对不上）
    const grammarPoints = Array.isArray(unitData.grammarPoints) ? unitData.grammarPoints : []
    // 旧数据可能没有版本号，同样视为过期，立即重做（否则会一直显示错配的旧卡片）
    const versionOutdated = grammarPoints.some((point) => point
      && point.drillVersion !== DRILL_VERSION)
    const grammarStuck = article.aiStatus === 'ready' && grammarPoints.length > 0
      && !grammarPoints.some((point) => point
        && point.aiEnhanced === true
        && point.drillVersion === DRILL_VERSION)
      // 版本不一致立即重做；同版本但语法没增强成功的才等十分钟
      && (versionOutdated || !aiAt || Date.now() - aiAt > 10 * 60 * 1000)
    let aiPending = !article.isDemo && (article.aiStatus === 'pending' || article.aiStatus === 'running')
    // 精讲失败时不能继续显示「正在补充」，否则会一直挂着像卡死
    const aiFailed = !article.isDemo && article.aiStatus === 'failed'
    // 语法已经讲完，但还有超纲词没拿到释义：只补词，不重跑语法。
    // 老文章没有 wordsPending 标记，按「还有词没释义」补判，否则永远补不上
    const missingWords = (unitData.vocabulary || [])
      .filter((item) => !(item && item.meanings && item.meanings.length)).length
    const wordsPending = !article.isDemo && (article.wordsPending === true
      || (article.aiStatus === 'ready' && missingWords > 0))
    const waiting = !article.aiStatus || article.aiStatus === 'pending' || article.aiStatus === 'failed' || staleRunning || wordsPending
    // 规则结果都没有时先补解析，不去调模型精讲（没有可增强的内容）
    const emptyUnit = !article.isDemo && !vocabTotal
    // 单词补全一分钟内不重复触发，避免刚补过又立刻再烧一次额度
    const wordsRetry = wordsPending && (!aiAt || Date.now() - aiAt > 60 * 1000)
    if (!article.isDemo && !emptyUnit && (waiting && (!wordsPending || wordsRetry) || grammarStuck)) {
      // 命中共享缓存时精讲几秒内就写完，回来立刻刷新；冷启动仍由下面的轮询兜底
      triggerEnhance(article._id).then(() => {
        if (!aiPending || aiFailed) return
        loadStudy(true).then((study) => this.applyStudy(study)).catch(() => {})
      })
      if (!aiFailed) aiPending = true
    }

    // 断点续接：上次停在哪一站、那一站还没学完，就给一个一键回到原位的入口
    const saved = article.isDemo ? null : resumeInfo(article._id)
    const stationDone = [vocab.mastered >= vocab.total, phraseDone, grammarDone, practiceDone]
    const resume = readingMode ? null : (saved && !stationDone[saved.station - 1] ? saved : null)

    this.setData({
      loading: false,
      title: article.title,
      progress,
      readingMode,
      readingMinutes: Math.floor(readingSeconds / 60),
      aiPending,
      aiFailed,
      resume,
      units: readingMode ? [
        {
          title: '阅读全文',
          desc: `已读 ${Math.floor(readingSeconds / 60)} 分钟 · 累计读满 15 分钟算学完`,
          done: readingDone,
          url: '/pages/reading/index',
          cat: 'reading-highlight',
          tone: 'sky'
        }
      ] : [
        { title: '词汇', desc: `单词 ${vocab.mastered}/${vocab.total} 已掌握`, done: vocab.mastered >= vocab.total, url: '/pkgWords/pages/vocabulary/index', cat: 'vocab-magnifier', tone: 'sun' },
        { title: '词组搭配', desc: `已看 ${progress.phrasesViewed}/${phraseTotal} 个固定搭配`, done: phraseDone, url: '/pages/phrases/index', cat: 'reading-highlight', tone: 'sky' },
        { title: '语法与句式', desc: `已看 ${progress.grammarViewed}/${grammarTotal} 个语法点`, done: grammarDone, url: '/pages/analysis/index', cat: 'idea-bulb', tone: 'mint' },
        { title: '输出练习', desc: `已通过 ${progress.practicePassed}/${progress.drillTotal} 道英译汉`, done: practiceDone, url: '/pages/practice/index', cat: 'practice-writing', tone: 'coral' }
      ]
    })

    // 快照只负责首屏画面，不触发补解析与精讲，等云端真实数据回来再判断
    if (fromSnapshot) return

    // 正文还没解析过（导入只入库、或解析失败过）：客户端直接补一次解析，避免页面停在空文章上
    if (emptyUnit && article.ocrText && !this.repairing) {
      this.repair(article)
      return
    }

    if (aiPending) this.scheduleAiRefresh()
  },

  // 客户端直接调 analyzeArticle 解析正文，成功后回传落库并重新加载本页
  repair(article) {
    this.repairing = true
    this.setData({ repairing: true, error: '' })
    // 已记住的词/词组/语法要一起带上，否则兜底解析会把它们又抽出来
    loadRemembered()
      .catch(() => null)
      .then((remembered) => analyzeText(article.ocrText, article.level, remembered))
      .then((unitData) => saveUnit(article._id, unitData))
      .then(() => {
        this.repairing = false
        this.setData({ repairing: false })
        this.load()
      })
      .catch((error) => {
        this.repairing = false
        this.setData({ repairing: false, error: (error && error.message) || '这篇正文没能解析出来，稍后再试' })
      })
  },

  scheduleAiRefresh() {
    this.clearAiTimer()
    // 轮询到上限还没结束：不再转圈，改成静态提示，避免看起来永远卡住
    if ((this.aiPolls || 0) >= MAX_AI_POLLS) {
      this.setData({ aiPending: false, aiStalled: true })
      return
    }
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

  go(event) {
    wx.navigateTo({ url: event.currentTarget.dataset.url })
  }
})
