const { listJournals, getJournal, pickDaily, refreshManifest } = require('../../services/journals')
const { startReadingArticle } = require('../../services/article')
const { listArticles, readingMinutesOf, READING_TARGET_SECONDS } = require('../../services/study')
const shareCard = require('../../services/shareCard')
const checkin = require('../../services/checkin')

// 卡片上的「约 X 分钟」是预计阅读时长；完成门槛固定为累计 15 分钟
function minutesOf(words) {
  return readingMinutesOf(words)
}

const LEVELS = [
  { key: 'all', label: '全部' },
  { key: 'cet4', label: '四级' },
  { key: 'cet6', label: '六级' },
  { key: 'tem4', label: '专四' },
  { key: 'tem8', label: '专八' }
]

function levelLabelOf(level) {
  const hit = LEVELS.find((item) => item.key === level)
  return hit ? hit.label : ''
}

function timeOf(value) {
  if (!value) return 0
  if (value instanceof Date) return value.getTime()
  const parsed = new Date(value).getTime()
  return Number.isNaN(parsed) ? 0 : parsed
}

// 出处与日期拼出的 key，和入库时写的 source 完全一致，用来对齐已读进度
function sourceKey(item) {
  return `${item.source} · ${item.date}`
}

// 同一家媒体同一天可能有好几篇外刊，出处+日期并不唯一：
// 进度一律按文章入库时带的 bankId（就是外刊 id）对齐，老数据没有 bankId 才退回出处键
function progressKeyOf(id) {
  return `journal:${id}`
}

function legacyKeyOf(source) {
  return `legacy:${source}`
}

function decorate(item, progressMap) {
  const parts = String(item.date || '').split('-')
  const dateLabel = parts.length === 3 ? `${Number(parts[1])} 月 ${Number(parts[2])} 日` : (item.date || '')
  const hit = progressMap[progressKeyOf(item.id)] || progressMap[legacyKeyOf(sourceKey(item))]
  const target = READING_TARGET_SECONDS
  let seconds = 0
  let progressLabel = ''
  let progressDone = false
  let progressPercent = 0
  if (hit) {
    seconds = Math.max(0, Number(hit.readingSeconds) || 0)
    progressPercent = Math.min(100, Math.round(seconds / target * 100))
    progressDone = seconds >= target
    if (progressDone) progressLabel = '已学完'
    // 时长口径：不到 1 分钟就按秒显示，免得刚打开就写「已学 1 分钟」
    else if (seconds > 0) progressLabel = seconds < 60 ? `已学 ${Math.round(seconds)} 秒` : `已学 ${Math.floor(seconds / 60)} 分钟`
    else progressLabel = '在读'
  }
  return Object.assign({}, item, {
    dateLabel,
    levelLabel: levelLabelOf(item.level),
    minutes: minutesOf(item.words),
    progressLabel,
    progressDone,
    progressPercent,
    seconds,
    target,
    updatedAt: timeOf(hit && hit.updatedAt)
  })
}

Page({
  data: {
    loading: true,
    error: '',
    today: null,
    continueArticle: null,
    journals: [],
    levels: LEVELS,
    level: 'all',
    topics: [],
    topic: 'all',
    starting: false,
    startingTitle: '',
    startError: '',
    startErrorId: '',
    streak: 0
  },

  onLoad(options) {
    this.all = []
    this.progressMap = {}
    // 分享出去的链接带 journal=<id>，清单加载完直接打开这一篇
    this.pendingJournalId = (options && options.journal) ? String(options.journal) : ''
    // tab 页默认不展示朋友圈入口，这里显式打开
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  onShow() {
    const tabBar = typeof this.getTabBar === 'function' && this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 2 })
    this.loadStreak()
    this.load()
  },

  // 连续学习天数直接读本地打卡记录，不额外请求云端
  loadStreak() {
    try {
      const summary = checkin.summary()
      this.setData({ streak: Math.max(0, Number(summary && summary.streak) || 0) })
    } catch (error) {
      // 本地记录读不出来时就不显示，不影响外刊列表
    }
  },

  // 外刊清单随包内置，先渲染清单；已读进度来自文章列表，回来了再补，网络慢也不挡着读
  load() {
    if (!this.data.journals.length) this.setData({ loading: true, error: '' })
    listJournals()
      .then((items) => {
        this.all = items || []
        this.apply()
      })
      .catch((error) => {
        this.setData({
          loading: false,
          error: (error && error.message) || '外刊加载失败，稍后再试'
        })
      })
    listArticles()
      .then((mine) => {
        const map = {}
        const legacyCount = {}
        ;(mine || []).forEach((article) => {
          if (article.origin !== 'journal' || !article.source) return
          if (article.bankId) {
            // 同一篇外刊更新过正文时，旧文章还在库里：按 createdAt 倒序取最新的一份
            if (!map[progressKeyOf(article.bankId)]) map[progressKeyOf(article.bankId)] = article
            return
          }
          legacyCount[article.source] = (legacyCount[article.source] || 0) + 1
        })
        // 老数据没存外刊 id：只有这个出处唯一对应一篇时才拿来对齐，避免多篇共用一份进度
        ;(mine || []).forEach((article) => {
          if (article.origin !== 'journal' || !article.source || article.bankId) return
          if (legacyCount[article.source] === 1) map[legacyKeyOf(article.source)] = article
        })
        this.progressMap = map
        if (this.all.length) this.apply()
      })
      .catch(() => {
        // 进度拿不到就只显示清单，不影响打开外刊
      })
    // 云端内容包有新版本时静默刷新列表，不打断当前浏览；6 小时内只查一次
    refreshManifest().then((changed) => {
      if (!changed) return
      listJournals().then((items) => {
        this.all = items || []
        this.apply()
      })
    })
  },

  // 外刊不按四六级分栏：全部混排，今日推荐从同一份清单里按日期取
  apply() {
    const all = (this.all || []).map((item) => decorate(item, this.progressMap))
    const daily = pickDaily(all)
    // 题材筛选条按清单里实际出现的题材生成
    const topics = []
    all.forEach((item) => {
      if (item.topic && topics.indexOf(item.topic) < 0) topics.push(item.topic)
    })
    // 筛选只作用在往期列表：今日推荐和「接着读」始终留在最上面
    const list = all.filter((item) => {
      if (daily && item.id === daily.id) return false
      if (this.data.level !== 'all' && item.level !== this.data.level) return false
      if (this.data.topic !== 'all' && item.topic !== this.data.topic) return false
      return true
    })
    // 有读到一半的，就在顶部给一个「接着读」；今日推荐已经在最上面，不重复
    const reading = all
      .filter((item) => item.seconds > 0 && !item.progressDone && (!daily || item.id !== daily.id))
      .sort((a, b) => b.updatedAt - a.updatedAt)
    const resume = reading[0] || null
    this.setData({
      loading: false,
      error: '',
      topics,
      // 今日推荐已经在最上面，列表里不再重复出现同一篇
      journals: list,
      today: daily || null,
      continueArticle: resume ? {
        id: resume.id,
        zhTitle: resume.zhTitle || resume.title,
        percent: resume.progressPercent,
        minutes: resume.minutes
      } : null
    })
    // 先把封面换成 https 存着，用户点分享时不用等图片
    shareCard.prefetch(this.all)
    this.openPending()
  },

  // 分享链接进来：清单一出来就直接打开这篇，不再额外等一段延时
  openPending() {
    const id = this.pendingJournalId
    if (!id) return
    this.pendingJournalId = ''
    if ((this.all || []).some((item) => item.id === id)) {
      this.beginOpen(id)
      return
    }
    // 分享的是刚发布的外刊、本地清单还没合并时，强制拉一次再找
    refreshManifest(true).then((changed) => {
      if (changed) this.apply()
      if (!(this.all || []).some((item) => item.id === id)) {
        wx.showToast({ title: '这篇外刊暂时打不开，先看看别的', icon: 'none' })
        return
      }
      this.beginOpen(id)
    })
  },

  beginOpen(id) {
    // 等本帧列表渲染完再盖遮罩，避免刚落地就闪一下空白
    if (typeof wx.nextTick === 'function') wx.nextTick(() => this.open(id))
    else this.open(id)
  },

  openContinue() {
    const item = this.data.continueArticle
    if (item) this.open(item.id)
  },

  pickLevel(event) {
    const level = event.currentTarget.dataset.level
    if (!level || level === this.data.level) return
    this.setData({ level })
    this.apply()
  },

  pickTopic(event) {
    const topic = event.currentTarget.dataset.topic
    if (!topic || topic === this.data.topic) return
    this.setData({ topic })
    this.apply()
  },

  // 云存储封面加载失败时换回内置主题图，列表里不至于出现空封面
  onCoverError(event) {
    const { scope, id } = event.currentTarget.dataset
    if (scope === 'today') {
      const today = this.data.today
      if (!today || !today.fallbackCover || today.cover === today.fallbackCover) return
      this.setData({ 'today.cover': today.fallbackCover })
      return
    }
    const index = (this.data.journals || []).findIndex((item) => item.id === id)
    const hit = index >= 0 ? this.data.journals[index] : null
    if (!hit || !hit.fallbackCover || hit.cover === hit.fallbackCover) return
    this.setData({ [`journals[${index}].cover`]: hit.fallbackCover })
  },

  openToday() {
    if (!this.data.today) return
    this.open(this.data.today.id)
  },

  pick(event) {
    this.open(event.currentTarget.dataset.id)
  },

  // 点开外刊：独立阅读轨道，入库解析后带 id 进阅读页，不动当前主线文章
  open(id) {
    if (!id || this.data.starting) return
    const hit = (this.all || []).find((item) => item.id === id)
    this.setData({
      starting: true,
      startingTitle: hit ? (hit.zhTitle || hit.title) : '',
      startError: '',
      startErrorId: ''
    })
    getJournal(id)
      .then((item) => startReadingArticle(Object.assign({}, item, {
        kind: 'journal',
        origin: 'journal',
        source: sourceKey(item)
      })))
      .then((articleId) => {
        this.setData({ starting: false })
        wx.navigateTo({ url: `/pages/reading/index?id=${articleId}` })
      })
      .catch((error) => {
        // 打不开时停在卡片上给重试入口，别让分享进来的用户空手回到列表
        this.setData({
          startError: (error && error.message) || '这篇外刊没打开，稍后再试',
          startErrorId: id
        })
      })
  },

  retryStart() {
    const id = this.data.startErrorId
    this.setData({ starting: false, startError: '', startErrorId: '' })
    if (id) this.open(id)
  },

  closeStartError() {
    this.setData({ starting: false, startError: '', startErrorId: '' })
  },

  // 卡片上的分享按钮嵌在可点击卡片里，阻止冒泡，别顺带把文章点开
  noop() {},

  // 分享出去只带外刊 id：好友打开会走自己的入库流程，不会撞到我的文章权限
  onShareAppMessage(event) {
    const dataset = event && event.target && event.target.dataset
    const id = dataset ? dataset.id : ''
    const hit = id ? (this.all || []).find((item) => item.id === id) : null
    return shareCard.shareOf(hit || this.data.today)
  },

  onShareTimeline() {
    return shareCard.timelineOf(this.data.today)
  }
})
