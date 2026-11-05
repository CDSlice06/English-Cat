const { loadStudy, getProgress, vocabStats, readStudySnapshot } = require('../../services/study')

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
    progress: { completed: 0, total: 4, percent: 0, practicePassed: 0, drillTotal: 0, grammarViewed: 0, phrasesViewed: 0 },
    mastered: 0,
    hasProgress: false,
    nextUnit: { label: '第 1 站 · 词汇', url: '/pages/vocabulary/index', hint: '' },
    features: [],
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
      mastered: unit.masteredWords.length,
      // 有真实文章，或任何一处已有动作，就不再是「还没有开始」
      hasProgress: !article.isDemo || unit.masteredWords.length > 0 || progress.completed > 0 || progress.practicePassed > 0,
      nextUnit: resolveNextUnit(unit, progress, unitData),
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
