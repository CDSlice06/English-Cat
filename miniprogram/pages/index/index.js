const { loadStudy, getProgress, vocabStats, readStudySnapshot, isReadingArticle, readReadingSeconds, READING_TARGET_SECONDS } = require('../../services/study')
const wordbook = require('../../services/wordbook')
const grammarbook = require('../../services/grammarbook')
const review = require('../../services/review')
const checkin = require('../../services/checkin')
const starter = require('../../services/starter')

// 语法卡的排期只存本地，和单词的 reviewLog 分开，首页计划要用同一份口径
const GRAMMAR_OPTIONS = { logKey: 'grammarReviewLog', sync: false }

// 点猫时的随机回应，连点三次触发一句彩蛋
const CAT_LINES = ['喵~', '摸摸头，继续读吧', '今天也要读懂一点点', '我在这儿陪着你']
const CAT_SECRET = '呼噜呼噜…好舒服'
// 首次进首页的轻提示：只出现一次，用户点过或看过都记住，之后不再打扰
const CAT_HINT = '戳戳我'
const CAT_HINT_KEY = 'miao_cat_hint_done'

// 点猫音效：只服务于「戳一下猫咪」，单独一个实例，避免和单词朗读互相打断
const CAT_SOUND = '/assets/audio/cat-pet.mp3'
let catAudio = null

function playCatSound() {
  if (!catAudio) {
    catAudio = wx.createInnerAudioContext()
    // 跟随系统静音键，上课/开会时不会突然出声
    catAudio.obeyMuteSwitch = true
    catAudio.onError(() => {})
  }
  catAudio.stop()
  catAudio.src = CAT_SOUND
  catAudio.play()
}

// 按学习动线找出第一站没完成的单元，作为首页「继续学习」的唯一主行动
function resolveNextUnit(unit, progress, unitData) {
  // 词汇站要求本篇单词全部掌握
  const vocab = vocabStats(unit, unitData)
  const phraseTotal = (unitData.phrases || []).length
  const grammarTotal = (unitData.grammarPoints || []).length
  const stations = [
    {
      done: vocab.mastered >= vocab.total,
      label: '第 1 站 · 词汇',
      url: '/pkgWords/pages/vocabulary/index',
      hint: vocab.mastered >= vocab.total ? '' : `单词 ${vocab.mastered}/${vocab.total}，先把这篇的词全过一遍`
    },
    {
      // 这篇没抽到固定搭配时跳过本站，不让流程卡死
      done: !phraseTotal || progress.phrasesViewed >= phraseTotal,
      label: '第 2 站 · 词组',
      url: '/pages/phrases/index',
      hint: `已看 ${progress.phrasesViewed}/${phraseTotal} 个固定搭配`
    },
    {
      done: !grammarTotal || progress.grammarViewed >= grammarTotal,
      label: '第 3 站 · 语法',
      url: '/pages/analysis/index',
      hint: `已看 ${progress.grammarViewed}/${grammarTotal} 个语法点`
    },
    {
      done: !progress.drillTotal || progress.practicePassed >= progress.drillTotal,
      label: '第 4 站 · 输出',
      url: '/pages/practice/index',
      hint: `已通过 ${progress.practicePassed}/${progress.drillTotal} 道英译汉`
    }
  ]
  const next = stations.find((station) => !station.done)
  if (!next) {
    return { label: '本篇学习报告', url: '/pages/summary/index', hint: '四站已全部通关，去看看这篇的完整报告' }
  }
  return { label: next.label, url: next.url, hint: next.hint }
}

Page({
  data: {
    loading: true,
    error: '',
    title: '',
    progress: { completed: 0, total: 4, percent: 0, practicePassed: 0, drillTotal: 0, grammarViewed: 0, grammarTotal: 0, phrasesViewed: 0, phraseTotal: 0 },
    mastered: 0,
    hasProgress: false,
    readingMode: false,
    readingMinutes: 0,
    pointsCount: 0,
    nextUnit: { label: '第 1 站 · 词汇', url: '/pkgWords/pages/vocabulary/index', hint: '' },
    stations: [],
    // 每日打卡：连续天数 + 最近七天，让用户每天都能看到自己的节奏
    checkin: { streak: 0, total: 0, monthDays: 0, checkedToday: false, week: [], hint: '' },
    // 首周任务：新用户的三件小事，完成后可收起
    starter: null,
    // 今日计划固定四件：复习 → 学习一篇文章 → 阅读一篇外刊 → 背诵生词
    plan: { visible: false, done: 0, total: 4, tasks: [] },
    // 默认收起，进页面或跳转回来都保持收起，避免整屏都是计划
    planExpanded: false,
    catName: 'welcome-wave',
    catBubble: '',
    catTapped: false
  },
  onLoad() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },
  onShareAppMessage() {
    return {
      title: '英语精读喵 · 每一次精读都有回响',
      path: '/pages/index/index',
      imageUrl: '/assets/share/cover-5x4.jpg'
    }
  },
  onShareTimeline() {
    return {
      title: '英语精读喵 · 每一次精读都有回响',
      imageUrl: '/assets/share/cover-1x1.jpg'
    }
  },
  onShow() {
    this.pageActive = true
    const tabBar = typeof this.getTabBar === 'function' && this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 0 })
    // 去别的页面再回来时收起计划，不让它一直占着屏幕
    if (this.data.planExpanded) this.setData({ planExpanded: false })
    this.guideIfNeeded()
    this.renderSnapshot()
    this.load()
    // 复习与打卡的数据在首帧渲染之后再拉，先让首页尽快出图，减少启动耗时
    wx.nextTick(() => {
      this.loadReview()
      this.loadCheckin()
    })
  },

  // 今日复习入口：先用生词本快照把入口铺出来，再拉云端刷新；复习回来 onShow 会自动重算
  loadReview() {
    const snapshot = wordbook.readWordbookSnapshot(true)
    if (snapshot) this.renderReview(this.vocabItems(snapshot), [])
    // 词汇和语法各有一份排期日志，首页要把两边到期数合起来看
    Promise.all([
      wordbook.list(),
      grammarbook.list().catch(() => ({ items: [] }))
    ]).then(([data, grammar]) => {
      const items = this.vocabItems(data)
      this.renderReview(items, grammar.items || [])
      this.loadStarter(items)
    }).catch(() => {
      // 生词本读取失败不影响首页，入口先不显示；首周任务仍可用空记录判定
      this.loadStarter([])
    })
  },

  vocabItems(data) {
    return ((data && data.items) || []).concat((data && data.phraseItems) || [])
  },

  // 首周任务：首次进入给三件小事，全部完成后允许收起，之后不再打扰
  loadStarter(items) {
    starter.resolve(review.reviewedTotal(items)).then((state) => {
      // undefined 是这次没拿到汇总，保留已有卡片，避免网络抖动时卡片闪没
      if (state === undefined) return
      this.setData({ starter: state })
    })
  },

  dismissStarter() {
    starter.dismiss()
    this.setData({ starter: null })
  },

  renderReview(items, grammarItems) {
    const words = items.filter((item) => !item || item.entryType !== 'phrase')
    const phrases = items.filter((item) => item && item.entryType === 'phrase')
    const vocabStats = review.todayStats(items)
    const grammarStats = review.todayStats(grammarItems || [], undefined, GRAMMAR_OPTIONS)
    const stats = review.combineStats([vocabStats, grammarStats])
    // 复习页把单词、词组、语法分成三个标签，各有一份目标，这里把三份到期数合起来
    const wordPlan = review.planOf(words, 'vocab')
    const phrasePlan = review.planOf(phrases, 'phrase')
    const grammarPlan = review.planOf(grammarItems || [], 'grammar', undefined, GRAMMAR_OPTIONS)
    this.reviewStats = stats
    // 今日计划固定四件：复习、学习一篇、读一篇外刊、背三类内容，这里把复习口径一起存下来
    this.planReview = {
      due: stats.due,
      more: wordPlan.more + phrasePlan.more + grammarPlan.more,
      doneToday: stats.doneToday,
      nextCount: stats.nextCount,
      nextLabel: stats.nextLabel
    }
    this.updatePlan()
  },

  // 今日计划固定四件：复习 → 学习一篇文章 → 阅读一篇外刊 → 背诵生词。
  // 只展示完成情况，不承担跳转；做完由打卡自动打勾
  updatePlan() {
    const stats = this.reviewStats
    const planReview = this.planReview
    if (!stats || !planReview || !this.data.hasProgress) {
      if (this.data.plan.visible) this.setData({ plan: { visible: false, done: 0, tasks: [] } })
      return
    }

    // 复习只看真实到期的条数：不够时会提前补足，但计划里不把补足的量算成「今天该复习」
    const dueCount = Math.max(0, Number(planReview.due) || 0)
    const reviewDone = dueCount === 0
    const reviewTitle = reviewDone
      ? (planReview.doneToday ? '今天的复习已完成' : '今天暂无复习')
      : `复习 ${dueCount} 条`
    const reviewDesc = reviewDone
      ? (planReview.nextCount
        ? `${planReview.nextLabel}还有 ${planReview.nextCount} 条到期`
        : '到期内容会自动排进这里')
      : `去「我的」页复习，${dueCount} 条到期${planReview.more ? `（另有 ${planReview.more} 条留到明天）` : ''}`

    const studyDone = checkin.didToday('study')
    const journalDone = checkin.didToday('journal')
    // 背诵任务要两类都完成：单词、词组
    const memorizeKinds = ['memorize_word', 'memorize_phrase']
    const memorizeDoneCount = memorizeKinds.filter((kind) => checkin.didToday(kind)).length
    const memorizeDone = memorizeDoneCount >= memorizeKinds.length
    const studyDesc = studyDone
      ? '今天已经推进过一站'
      : (this.data.readingMode
        ? '从题库挑一篇，推进任意一站都算'
        : (this.data.nextUnit.hint || '推进任意一站都算'))

    const tasks = [
      { key: 'review', title: reviewTitle, desc: reviewDesc, done: reviewDone },
      { key: 'study', title: '学习一篇文章', desc: studyDesc, done: studyDone },
      {
        key: 'read',
        title: '阅读一篇外刊',
        desc: journalDone ? '今天已经读过外刊了' : '今天读外刊累计满 15 分钟自动打勾',
        done: journalDone
      },
      {
        key: 'recite',
        title: '今日背诵',
        desc: memorizeDone
          ? '单词、词组都完成了'
          : `去「我的」页开始 · 已完成 ${memorizeDoneCount}/2 类`,
        done: memorizeDone
      }
    ]
    this.setData({
      plan: {
        visible: true,
        done: tasks.filter((task) => task.done).length,
        total: tasks.length,
        tasks
      }
    })
  },

  togglePlan() {
    this.setData({ planExpanded: !this.data.planExpanded })
  },

  // 复习和背诵都收在「我的」页，计划里给一个明确的去处
  goProfile() {
    wx.switchTab({ url: '/pages/profile/index' })
  },

  // 打卡是纯本地记录，同步算完就能渲染，不依赖云端请求
  loadCheckin() {
    const summary = checkin.summary()
    this.setData({
      checkin: {
        streak: summary.streak,
        total: summary.total,
        monthDays: summary.monthDays,
        checkedToday: summary.checkedToday,
        week: summary.week,
        hint: summary.checkedToday
          ? `累计 ${summary.total} 天 · 本月 ${summary.monthDays} 天`
          : (summary.streak
            ? `已连续 ${summary.streak} 天，学一个词就把今天续上`
            : '学一个词，就能盖下第一枚章')
      }
    })
  },

  // 有本地快照就先铺首屏，云函数回来再静默替换，避免每次冷启动都白屏
  renderSnapshot() {
    if (this.data.title) return
    const snapshot = readStudySnapshot(true)
    if (!snapshot) return
    this.applyStudy(snapshot.article, snapshot.unit)
  },
  // 首次进入先问清四级还是六级，否则选词和语法点的难度没有基准
  guideIfNeeded() {
    if (this.guided) return
    if (wx.getStorageSync('userLevel') || wx.getStorageSync('onboardingSkipped')) return
    this.guided = true
    wx.navigateTo({ url: '/pages/onboarding/index' })
  },
  load() {
    // 已经有快照铺着画面时不再切回加载态，只静默刷新
    if (!this.data.title) this.setData({ loading: true, error: '' })
    else this.setData({ error: '' })
    loadStudy().then(({ article, unit }) => {
      this.applyStudy(article, unit)
    }).catch((error) => {
      // 已经有快照铺着画面时，刷新失败就不再打断用户
      if (this.data.title) return
      this.setData({ loading: false, error: error.message })
    })
  },
  applyStudy(article, unit) {
    const unitData = article.unitData || {}
    // 外刊是「阅读优先」：进度只看累计活跃阅读时长；用户导入的文章按四站推进
    const readingMode = isReadingArticle(article)
    const readingSeconds = readingMode ? readReadingSeconds(article._id, unit) : 0
    const readingMinutes = Math.floor(readingSeconds / 60)
    const readingDone = readingSeconds >= READING_TARGET_SECONDS
    const baseProgress = getProgress(unit, unitData)
    const progress = readingMode
      ? Object.assign({}, baseProgress, {
        completed: readingDone ? 1 : 0,
        total: 1,
        percent: readingDone ? 100 : Math.min(99, Math.floor((readingSeconds / READING_TARGET_SECONDS) * 100))
      })
      : baseProgress
    const grammarTotal = (unitData.grammarPoints || []).length
    const vocab = vocabStats(unit, unitData)
    const pointsCount = (unitData.vocabulary || []).length + (unitData.phrases || []).length + grammarTotal
    this.setData({
      loading: false,
      title: article.title,
      progress,
      readingMode,
      readingMinutes,
      pointsCount,
      // 与词汇页同口径：只统计本篇词表里真实存在的已掌握词
      mastered: vocab.mastered,
      // 有真实文章，或任何一处已有动作，就不再是「还没有开始」
      hasProgress: !article.isDemo || unit.masteredWords.length > 0 || progress.completed > 0 || progress.practicePassed > 0,
      nextUnit: readingMode
        ? {
          label: '阅读全文',
          url: '/pages/reading/index',
          hint: readingDone ? '这篇已经读满 15 分钟' : `已读 ${readingMinutes} 分钟，满 15 分钟算学完`
        }
        : resolveNextUnit(unit, progress, unitData),
      // 四个站点各自通关才亮，不再按顺序假装（先做完词组不该把「词汇」点亮）
      stations: readingMode ? [
        { label: '阅读', done: readingDone }
      ] : [
        { label: '词汇', done: vocab.mastered >= vocab.total },
        { label: '词组', done: progress.phrasesViewed >= progress.phraseTotal },
        { label: '语法', done: progress.grammarViewed >= grammarTotal },
        { label: '输出', done: progress.practicePassed >= progress.drillTotal }
      ]
    }, () => {
      this.maybeShowCatHint()
      this.updatePlan()
    })
  },
  // 首次进入首页时，用猫猫气泡轻轻提示一次
  maybeShowCatHint() {
    // 页面已隐藏或已卸载时不再提示，避免异步加载回来后误占提示机会
    if (!this.pageActive || wx.getStorageSync(CAT_HINT_KEY)) return
    clearTimeout(this.catHintTimer)
    this.catHintTimer = setTimeout(() => {
      if (!this.pageActive || this.data.catBubble || wx.getStorageSync(CAT_HINT_KEY)) return
      wx.setStorageSync(CAT_HINT_KEY, 1)
      this.setData({ catBubble: CAT_HINT })
      this.bubbleTimer = setTimeout(() => this.setData({ catBubble: '' }), 2000)
    }, 600)
  },
  // 点猫互动：换表情 + 冒气泡 + 轻震动，冷却 1.5 秒，连点三次有彩蛋
  tapCat() {
    const now = Date.now()
    if (now - (this.lastCatTap || 0) < 1500) return
    clearTimeout(this.catHintTimer)
    if (!wx.getStorageSync(CAT_HINT_KEY)) wx.setStorageSync(CAT_HINT_KEY, 1)
    if (now - (this.lastCatTap || 0) > 4000) this.catTaps = 0
    this.lastCatTap = now
    this.catTaps = (this.catTaps || 0) + 1
    const secret = this.catTaps >= 3
    if (secret) this.catTaps = 0
    const line = secret ? CAT_SECRET : CAT_LINES[Math.floor(Math.random() * CAT_LINES.length)]
    wx.vibrateShort({ type: 'light', fail: () => {} })
    playCatSound()
    clearTimeout(this.catTimer)
    clearTimeout(this.bubbleTimer)
    this.setData({ catName: 'pet-me', catBubble: line, catTapped: true })
    this.catTimer = setTimeout(() => this.setData({ catName: 'welcome-wave', catTapped: false }), 1100)
    this.bubbleTimer = setTimeout(() => this.setData({ catBubble: '' }), 2000)
  },
  onHide() {
    this.pageActive = false
    clearTimeout(this.catTimer)
    clearTimeout(this.bubbleTimer)
    clearTimeout(this.catHintTimer)
    if (catAudio) catAudio.stop()
    this.setData({ catName: 'welcome-wave', catBubble: '', catTapped: false })
  },
  onUnload() {
    this.pageActive = false
    clearTimeout(this.catTimer)
    clearTimeout(this.bubbleTimer)
    clearTimeout(this.catHintTimer)
    if (catAudio) {
      catAudio.stop()
      catAudio.destroy()
      catAudio = null
    }
  },
  // tabBar 页面必须用 switchTab，navigateTo 会静默失败
  go(event) {
    const url = event.currentTarget.dataset.url
    // 已完成的首周任务不再给跳转地址，点了保持原地
    if (!url) return
    const tabPages = ['/pages/index/index', '/pages/workbench/index', '/pages/journal/index', '/pages/profile/index']
    if (tabPages.indexOf(url) >= 0) wx.switchTab({ url })
    else wx.navigateTo({ url })
  }
})
