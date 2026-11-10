const { loadStudy, getProgress, vocabStats, readStudySnapshot } = require('../../services/study')
const wordbook = require('../../services/wordbook')
const review = require('../../services/review')
const checkin = require('../../services/checkin')

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
      url: '/pages/vocabulary/index',
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
      hint: `已通过 ${progress.practicePassed}/${progress.drillTotal} 道双向翻译`
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
    nextUnit: { label: '第 1 站 · 词汇', url: '/pages/vocabulary/index', hint: '' },
    stations: [],
    features: [],
    // 今日复习：只统计生词本里「不记得」的词，本地记录决定今天是否已复习过
    review: { visible: false, finished: false, goReview: false, title: '', desc: '', action: '' },
    // 每日打卡：连续天数 + 最近七天，让用户每天都能看到自己的节奏
    checkin: { streak: 0, total: 0, monthDays: 0, checkedToday: false, week: [], hint: '' },
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
    this.guideIfNeeded()
    this.renderSnapshot()
    this.load()
    this.loadReview()
    this.loadCheckin()
  },

  // 今日复习入口：先用生词本快照把入口铺出来，再拉云端刷新；复习回来 onShow 会自动重算
  loadReview() {
    const snapshot = wordbook.readWordbookSnapshot()
    if (snapshot) this.renderReview(snapshot.items)
    wordbook.list().then((data) => {
      this.renderReview(data.items)
    }).catch(() => {
      // 生词本读取失败不影响首页，入口先不显示
    })
  },

  renderReview(items) {
    const stats = review.todayStats(items)
    const finished = stats.due === 0 && stats.doneToday > 0
    // 今天没有到期词，但曲线里还有下一次：给个安静的预告，不催用户
    const upcoming = stats.due === 0 && !finished && stats.nextCount > 0
    this.setData({
      review: {
        visible: stats.total > 0 || upcoming,
        finished,
        // 只有真的今天到期才进复习页，其余都是去看词库
        goReview: stats.due > 0,
        title: finished
          ? '今天的复习已完成'
          : (upcoming ? `${stats.nextLabel}有 ${stats.nextCount} 个词到期` : `今天要复习 ${stats.due} 个词`),
        desc: finished
          ? (stats.nextLabel
            ? `今天复习了 ${stats.doneToday} 个词，下一批${stats.nextLabel}到期`
            : `今天复习了 ${stats.doneToday} 个词，暂时没有待复习的词`)
          : (upcoming
            ? '按 1/3/7/15/30/180 天曲线，到期当天会自动出现在这里'
            : (stats.doneToday
              ? `已完成 ${stats.doneToday} 个 · 按 1/3/7/15/30/180 天到期`
              : '按 1/3/7/15/30/180 天的间隔到期，先看最早到期的')),
        action: stats.due > 0 ? '开始' : (finished ? '已完成' : '看词库')
      }
    })
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
    const snapshot = readStudySnapshot()
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
    const progress = getProgress(unit, unitData)
    const grammarTotal = (unitData.grammarPoints || []).length
    const vocab = vocabStats(unit, unitData)
    this.setData({
      loading: false,
      title: article.title,
      progress,
      // 与词汇页同口径：只统计本篇词表里真实存在的已掌握词
      mastered: vocab.mastered,
      // 有真实文章，或任何一处已有动作，就不再是「还没有开始」
      hasProgress: !article.isDemo || unit.masteredWords.length > 0 || progress.completed > 0 || progress.practicePassed > 0,
      nextUnit: resolveNextUnit(unit, progress, unitData),
      // 四个站点各自通关才亮，不再按顺序假装（先做完词组不该把「词汇」点亮）
      stations: [
        { label: '词汇', done: vocab.mastered >= vocab.total },
        { label: '词组', done: progress.phrasesViewed >= progress.phraseTotal },
        { label: '语法', done: progress.grammarViewed >= grammarTotal },
        { label: '输出', done: progress.practicePassed >= progress.drillTotal }
      ],
      features: [
        { name: '词汇筛选', desc: '五类重点词，一屏释义', url: '/pages/vocabulary/index', tag: `${vocab.mastered}/${vocab.total}`, cat: 'vocab-magnifier', tone: 'sun' },
        { name: '语法与句式', desc: '逐点讲透，配双向翻译', url: '/pages/analysis/index', tag: `${unit.grammarViewed.length}/${grammarTotal}`, cat: 'idea-bulb', tone: 'mint' }
      ]
    }, () => this.maybeShowCatHint())
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
    const tabPages = ['/pages/index/index', '/pages/workbench/index', '/pages/profile/index']
    if (tabPages.indexOf(url) >= 0) wx.switchTab({ url })
    else wx.navigateTo({ url })
  }
})
