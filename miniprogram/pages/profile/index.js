const { resetStudy, loadOverview } = require('../../services/study')
const wordbook = require('../../services/wordbook')
const grammarbook = require('../../services/grammarbook')
const review = require('../../services/review')
const remind = require('../../services/remind')
const { VERSION } = require('../../config/version')
const { playTapSound } = require('../../utils/sound')

const EMPTY_COUNTS = { total: 0, known: 0, unknown: 0 }
const EMPTY_OVERVIEW = { articleTotal: 0, masteredArticles: 0, passedDrills: 0, drillTotal: 0 }
// 语法卡的排期只存本地，和单词的复习日志分开
const GRAMMAR_OPTIONS = { logKey: 'grammarReviewLog', sync: false }

// 汇总数字单独存一份：进页面先用上次的结果渲染，30 秒内不重复请求
const OVERVIEW_KEY = 'profileOverview'
const OVERVIEW_TTL = 30 * 1000

function readOverviewCache() {
  try {
    const saved = wx.getStorageSync(OVERVIEW_KEY)
    if (!saved || !saved.at || !saved.data) return null
    if (Date.now() - saved.at > OVERVIEW_TTL) return null
    return saved.data
  } catch (error) {
    return null
  }
}

function rememberOverview(overview) {
  try {
    wx.setStorageSync(OVERVIEW_KEY, { at: Date.now(), data: overview })
  } catch (error) {}
  return overview
}

// 语法卡来自几篇文章：补上第二个数，和生词本 / 词组本的「两个数」对齐
function countArticles(items) {
  const seen = {}
  let total = 0
  ;(items || []).forEach((item) => {
    const key = item && (item.articleId || item.article_id)
    if (!key || seen[key]) return
    seen[key] = true
    total += 1
  })
  return total
}

Page({
  data: {
    loading: true,
    ready: false,
    error: '',
    overview: EMPTY_OVERVIEW,
    resetting: false,
    book: EMPTY_COUNTS,
    phraseBook: EMPTY_COUNTS,
    grammarBook: { total: 0, articles: 0 },
    // 今日复习入口：复习和背诵都收在这一页，首页计划只做提醒
    reviewEntry: { visible: false, tab: 'word', meta: '', action: '' },
    remind: { available: false, enabled: false, busy: false },
    version: VERSION
  },
  onLoad() {
    this.hydrate()
  },
  onShow() {
    const tabBar = typeof this.getTabBar === 'function' && this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 3 })
    if (!this.data.ready) this.hydrate()
    this.load()
    this.loadReview()
    this.loadRemind()
  },
  // 同步读本地快照铺首屏：不用等云函数，数字随后再静默替换
  hydrate() {
    const book = wordbook.readWordbookSnapshot(true)
    const grammar = grammarbook.readGrammarSnapshot()
    const overview = readOverviewCache()
    const patch = {}
    if (book) {
      patch.book = book.counts || EMPTY_COUNTS
      patch.phraseBook = book.phraseCounts || EMPTY_COUNTS
    }
    if (grammar) {
      const counts = grammar.counts || { total: 0 }
      patch.grammarBook = { total: counts.total, articles: countArticles(grammar.items) }
    }
    if (overview) patch.overview = overview
    if (!Object.keys(patch).length) return
    patch.loading = false
    patch.ready = true
    this.setData(patch)
  },
  load() {
    if (!this.data.ready) this.setData({ loading: true, error: '' })
    // 汇总数字有 30 秒缓存，其它两份优先用服务层缓存，避免每次切页都打三个云函数
    const overviewTask = readOverviewCache()
      ? Promise.resolve(readOverviewCache())
      : loadOverview().then(rememberOverview).catch(() => null)
    Promise.all([
      wordbook.list().catch(() => null),
      grammarbook.list().catch(() => null),
      overviewTask
    ])
      .then(([book, grammar, overview]) => {
        this.setData({
          loading: false,
          ready: true,
          error: '',
          overview: overview || this.data.overview,
          book: book ? book.counts : this.data.book,
          phraseBook: book ? book.phraseCounts : this.data.phraseBook,
          grammarBook: grammar
            ? { total: grammar.counts.total, articles: countArticles(grammar.items) }
            : this.data.grammarBook
        })
        if (book || grammar) {
          this.applyReview(
            book ? (book.items || []).concat(book.phraseItems || []) : [],
            grammar ? grammar.items : []
          )
        }
      })
      .catch((error) => {
        // 已经有本地快照时不打断浏览，等下次进入再重试
        if (this.data.ready) return
        this.setData({ loading: false, error: error.message })
      })
  },

  // 首页把复习和背诵都引导到这一页，这里用本地快照先把入口铺出来
  loadReview() {
    const book = wordbook.readWordbookSnapshot(true)
    const grammar = grammarbook.readGrammarSnapshot()
    this.applyReview(
      book ? (book.items || []).concat(book.phraseItems || []) : [],
      grammar ? grammar.items : []
    )
  },

  applyReview(items, grammarItems) {
    const list = Array.isArray(items) ? items : []
    const grammarList = Array.isArray(grammarItems) ? grammarItems : []
    if (!list.length && !grammarList.length) {
      if (this.data.reviewEntry.visible) this.setData({ reviewEntry: { visible: false } })
      return
    }
    const words = list.filter((item) => !item || item.entryType !== 'phrase')
    const phrases = list.filter((item) => item && item.entryType === 'phrase')
    const vocabStats = review.todayStats(list)
    const grammarStats = review.todayStats(grammarList, undefined, GRAMMAR_OPTIONS)
    const stats = review.combineStats([vocabStats, grammarStats])
    // 复习卡的小字说明到期内容由几类组成，避免只看到一个总数
    const wordStats = review.todayStats(words)
    const phraseStats = review.todayStats(phrases)
    const dueParts = [
      wordStats.due ? `单词 ${wordStats.due}` : '',
      phraseStats.due ? `词组 ${phraseStats.due}` : '',
      grammarStats.due ? `语法 ${grammarStats.due}` : ''
    ].filter(Boolean)
    const dueDetail = dueParts.length > 1 ? ` · ${dueParts.join(' / ')}` : ''
    const wordPlan = review.planOf(words, 'vocab')
    const phrasePlan = review.planOf(phrases, 'phrase')
    const grammarPlan = review.planOf(grammarList, 'grammar', undefined, GRAMMAR_OPTIONS)
    const queueCount = wordPlan.queue.length + phrasePlan.queue.length + grammarPlan.queue.length
    const finished = stats.due === 0 && stats.doneToday > 0
    const upcoming = stats.due === 0 && !finished && stats.nextCount > 0
    // 直接落在最前面有内容的标签
    const tab = !queueCount
      ? 'word'
      : (wordPlan.queue.length ? 'word' : (phrasePlan.queue.length ? 'phrase' : 'grammar'))
    this.setData({
      reviewEntry: {
        visible: stats.total > 0 || upcoming,
        tab,
        // 复习卡的小字：到期总数 + 分类拆解，具体怎么复习交给复习页说明
        meta: finished
          ? '今天的复习已完成'
          : (upcoming
            ? `${stats.nextLabel}有 ${stats.nextCount} 条到期`
            : `${stats.due} 条到期${dueDetail}`),
        action: finished ? '已完成' : (queueCount > 0 ? '去复习' : '去看看')
      }
    })
  },

  goReview() {
    playTapSound()
    if (!this.data.reviewEntry.visible) {
      wx.navigateTo({ url: '/pkgWords/pages/wordbook/index' })
      return
    }
    wx.navigateTo({ url: `/pages/review/index?tab=${this.data.reviewEntry.tab || 'word'}` })
  },
  goWordbook() {
    playTapSound()
    wx.navigateTo({ url: '/pkgWords/pages/wordbook/index' })
  },
  goPhrasebook() {
    playTapSound()
    wx.navigateTo({ url: '/pages/phrasebook/index' })
  },
  goGrammarbook() {
    playTapSound()
    wx.navigateTo({ url: '/pkgGrammar/pages/grammarbook/index' })
  },
  // 「已掌握词汇」直接落到生词本的「记得」分组
  goKnownWords() {
    playTapSound()
    wx.navigateTo({ url: '/pkgWords/pages/wordbook/index?tab=known' })
  },
  goLibrary() {
    playTapSound()
    wx.navigateTo({ url: '/pages/library/index' })
  },
  // 「累计通过题数」进入输出练习回顾
  goDrills() {
    playTapSound()
    wx.navigateTo({ url: '/pages/drills/index' })
  },
  // 背诵模式：单词、词组选义拼写
  goRecite() {
    playTapSound()
    wx.navigateTo({ url: '/pkgWords/pages/memorize/index' })
  },
  // 模板 ID 没填时整行不露出，避免出现点了没反应的开关
  loadRemind() {
    if (!remind.available()) return
    remind.status().then((data) => {
      this.setData({
        remind: { available: !!data.available, enabled: !!data.enabled, busy: false }
      })
    })
  },
  toggleRemind() {
    const state = this.data.remind
    if (!state.available || state.busy) return
    playTapSound()
    this.setData({ 'remind.busy': true })
    const task = state.enabled ? remind.disable() : remind.enable()
    // 先算出目标状态：setData 会就地改写 this.data.remind，
    // 之后再读 state.enabled 拿到的已经是新值，提示语会反过来
    const next = !state.enabled
    task
      .then(() => {
        this.setData({ 'remind.enabled': next, 'remind.busy': false })
        wx.showToast({ title: next ? '已预约 1 次提醒' : '已关闭提醒', icon: 'none' })
      })
      .catch((error) => {
        this.setData({ 'remind.busy': false })
        wx.showToast({ title: error.message || '操作失败', icon: 'none' })
      })
  },
  // 数据与隐私说明放独立页面，弹窗放不下这么多内容
  openAbout() {
    playTapSound()
    wx.navigateTo({ url: '/pages/about/index' })
  },
  reset() {
    if (this.data.resetting) return
    wx.showModal({
      title: '清除学习记录？',
      content: '将清空本篇的解析与练习进度；生词本、词组本和语法本不受影响。此操作不可撤销。',
      confirmText: '确认清除',
      confirmColor: '#c95b52',
      success: (res) => {
        if (!res.confirm) return
        this.setData({ resetting: true })
        resetStudy().then(() => {
          this.setData({ resetting: false })
          wx.showToast({ title: '云端进度已重置', icon: 'success' })
          // 重置只清当前这篇，汇总数字需要按最新单元重算
          loadOverview().then((overview) => this.setData({ overview: rememberOverview(overview) })).catch(() => {})
        }).catch((error) => { this.setData({ resetting: false }); wx.showToast({ title: error.message, icon: 'none' }) })
      }
    })
  }
})
