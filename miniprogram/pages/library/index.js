const { LEVELS, listOf, findById } = require('../../content/bank')
const { prepareBankArticle } = require('../../services/article')
const { listArticles, previewArticle, deleteArticle, setArticleYear } = require('../../services/study')
const { listExams, getExam } = require('../../services/examBank')
const { playTapSound } = require('../../utils/sound')

// 列表已经按年份分组，单条出处不再重复年份，只留「6月 · 第2套 · Passage 1」
function issueShort(item) {
  const parts = []
  if (item.month) parts.push(`${item.month}月`)
  if (item.paper) parts.push(`第${item.paper}套`)
  if (item.passage) parts.push(`Passage ${item.passage}`)
  return parts.join(' · ') || '真题'
}

// 学过的篇章在列表里留个标记：下次挑文章时不用逐篇点开确认
function markProgress(item) {
  // 外刊与用户导入按阅读时长记进度，显示「已读 x 分钟」而不是四站百分比
  if (item.readingMode) {
    const seconds = Math.max(0, Number(item.readingSeconds) || 0)
    const done = seconds >= 15 * 60
    let label = ''
    if (done) label = '已学完'
    else if (seconds > 0) label = `已读 ${Math.max(1, Math.floor(seconds / 60))} 分钟`
    return Object.assign({}, item, { progressLabel: label, progressDone: done })
  }
  const studied = item.studied === true
  const percent = Number(item.percent)
  let label = ''
  let done = false
  if (studied) {
    if (percent >= 100) {
      label = '已学完'
      done = true
    } else {
      label = percent > 0 ? `学了 ${percent}%` : '已开始'
    }
  }
  return Object.assign({}, item, { progressLabel: label, progressDone: done })
}

// 真题按年份归档：年份倒序，年内按月份、套数、篇号排，没填年份的收在最后一组
function groupByYear(list) {
  const buckets = new Map()
  list.forEach((item) => {
    const year = Number(item.year) || 0
    const key = String(year)
    if (!buckets.has(key)) buckets.set(key, { key, year, items: [] })
    buckets.get(key).items.push(item)
  })
  const groups = Array.from(buckets.values()).sort((a, b) => b.year - a.year)
  groups.forEach((group) => {
    group.items.sort((a, b) => (b.month || 0) - (a.month || 0)
      || (a.paper || 0) - (b.paper || 0)
      || (a.passage || 0) - (b.passage || 0))
    group.count = group.items.length
    group.yearLabel = group.year ? String(group.year) : '未标年份'
  })
  return groups
}

// 年份筛选条：全部 + 每个有文章的年份
function yearChips(groups) {
  const total = groups.reduce((sum, group) => sum + group.count, 0)
  const chips = [{ key: 'all', label: '全部', count: total }]
  groups.forEach((group) => {
    chips.push({ key: group.key, label: group.year ? String(group.year) : '未标', count: group.count })
  })
  return chips
}

function pickGroups(groups, filter) {
  if (!filter || filter === 'all') return groups
  return groups.filter((group) => group.key === filter)
}

// 真题库进度：学过的内置真题按同样的钥匙对齐，列表里也显示「已学完 / 学了 x%」
function examKey(item) {
  return [item.level, item.year, item.month, item.paper, item.passage].join('-')
}

Page({
  data: {
    levels: LEVELS,
    level: 'cet4',
    source: 'bank', // bank = 内置模拟篇，exams = 真题库，imported = 我的导入
    list: [],
    imported: [],
    mineView: [],
    mineAll: [],
    examAll: [],
    examGroups: [],
    examYears: [],
    examYearFilter: 'all',
    examTotal: 0,
    examLoading: false,
    mineLoading: false,
    starting: false,
    startingTitle: '',
    error: ''
  },

  onLoad() {
    const level = wx.getStorageSync('userLevel') === 'cet6' ? 'cet6' : 'cet4'
    this.examAll = []
    this.setData({ level, list: listOf(level) })
    this.loadMine()
    this.loadExams()
  },

  onShow() {
    // 从导入页回来、或旧文章刚补上主题时，列表要跟着刷新
    if (this.mineAll) this.loadMine()
  },

  switchLevel(event) {
    if (this.data.starting) return
    const level = event.currentTarget.dataset.level
    if (level === this.data.level) return
    wx.setStorageSync('userLevel', level)
    this.setData({ level, list: listOf(level), error: '' })
    this.applyMine(level, this.data.mineAll)
  },

  switchSource(event) {
    if (this.data.starting) return
    const source = event.currentTarget.dataset.source
    if (source === this.data.source) return
    this.setData({ source, error: '', mineView: this.viewOf(source) })
    if (source === 'exams') this.loadExams()
  },

  // 当前来源对应的列表：真题与导入分开渲染
  viewOf(source) {
    if (source === 'imported') return this.data.imported
    return []
  },

  // 我的导入：只取摘要，按当前级别过滤
  loadMine() {
    this.setData({ mineLoading: true })
    listArticles()
      .then((items) => {
        this.setData({ mineLoading: false })
        this.applyMine(this.data.level, items || [])
      })
      .catch(() => this.setData({ mineLoading: false }))
  },

  applyMine(level, mineAll) {
    this.mineAll = mineAll || []
    // 外刊统一走「外刊」导航栏，不再混进「我的导入」
    const scoped = this.mineAll.filter((item) => item.level === level && item.origin !== 'journal')
    // 我导入的都收在「我的导入」里，真题和普通文章不再分栏
    const imported = scoped.map((item) => markProgress(Object.assign({}, item, {
      issue: issueShort(item)
    })))
    // 真题库共用这份进度：学过的内置真题在这里也能看到「已学完 / 学了 x%」
    // 外刊是阅读型，不参与真题库对齐，避免阅读时长误标内置真题
    this.realProgress = scoped
      .filter((item) => (item.kind === 'real' || (!item.kind && item.year > 0)) && !item.readingMode)
      .map((item) => markProgress(item))
    const source = this.data.source
    this.setData({
      mineAll: this.mineAll,
      imported,
      mineView: source === 'imported' ? imported : []
    })
    if (this.examAll && this.examAll.length) this.applyExams(level, this.examAll)
  },

  // 内置真题库：清单一次拉回，切级别只做本地过滤
  loadExams() {
    if (this.data.examLoading) return
    if (this.examAll && this.examAll.length) {
      this.applyExams(this.data.level, this.examAll)
      return
    }
    this.setData({ examLoading: true })
    listExams()
      .then((items) => {
        this.examAll = items || []
        this.setData({ examLoading: false, examTotal: this.examAll.length })
        this.applyExams(this.data.level, this.examAll)
      })
      .catch((error) => {
        this.setData({
          examLoading: false,
          error: (error && error.message) || '真题库加载失败，稍后再试'
        })
      })
  },

  applyExams(level, items) {
    const progress = {}
    ;(this.realProgress || []).forEach((item) => {
      if (item.progressLabel) progress[examKey(item)] = item
    })
    const scoped = (items || [])
      .filter((item) => item.level === level)
      .map((item) => {
        const done = progress[examKey(item)]
        return Object.assign({}, item, {
          issue: issueShort(item),
          progressLabel: done ? done.progressLabel : '',
          progressDone: done ? done.progressDone : false
        })
      })
    const groups = groupByYear(scoped)
    const years = yearChips(groups)
    // 切级别后原来选中的年份可能在这边不存在，退回「全部」
    const yearFilter = years.some((chip) => chip.key === this.data.examYearFilter) ? this.data.examYearFilter : 'all'
    this.examGroupsAll = groups
    this.setData({
      examGroups: pickGroups(groups, yearFilter),
      examYears: years,
      examYearFilter: yearFilter
    })
  },

  pickExamYear(event) {
    const key = event.currentTarget.dataset.key
    if (!key || key === this.data.examYearFilter) return
    this.setData({
      examYearFilter: key,
      examGroups: pickGroups(this.examGroupsAll || [], key)
    })
  },

  // 点开一篇内置真题：取正文 → 入库 → 进预览页看一眼要学什么，确认后再精读
  pickExam(event) {
    if (this.data.starting) return
    const id = event.currentTarget.dataset.id
    const hit = (this.examAll || []).find((item) => item.id === id)
    this.setData({ starting: true, startingTitle: hit ? hit.title : '', error: '' })
    getExam(id)
      .then((paper) => prepareBankArticle(Object.assign({}, paper, {
        kind: 'real',
        origin: 'exam',
        source: `${paper.year}.${paper.month} 真题`
      })))
      .then((articleId) => this.openPreview(articleId))
      .catch((error) => {
        this.setData({
          starting: false,
          error: (error && error.message) || '这篇真题没能准备好，换一篇试试'
        })
      })
  },

  pick(event) {
    if (this.data.starting) return
    this.start(findById(event.currentTarget.dataset.id))
  },

  pickMine(event) {
    if (this.data.starting) return
    this.open(event.currentTarget.dataset.id)
  },

  // 长按：补/改考试年份，或删除（内置模拟篇和示例文章不在这里）
  removeMine(event) {
    const id = event.currentTarget.dataset.id
    if (!id || this.data.starting) return
    const hit = this.mineAll.find((item) => item._id === id)
    wx.showActionSheet({
      itemList: [hit && hit.year ? '修改考试年份' : '补上考试年份', '删除这篇'],
      success: (res) => {
        if (res.tapIndex === 1) this.confirmRemove(hit)
        else this.pickYear(hit)
      }
    })
  },

  // 先选年份，再选月份：四六级一年两考，补齐后出处才能显示「2025年 · 12月」
  pickYear(hit) {
    if (!hit) return
    const years = [2026, 2025, 2024, 2023, 2022, 2021]
    if (hit.year && years.indexOf(hit.year) < 0) years.push(hit.year)
    wx.showActionSheet({
      itemList: years.map((year) => `${year} 年`),
      success: (res) => {
        const year = years[res.tapIndex]
        if (year) this.pickMonth(hit, year)
      }
    })
  },

  pickMonth(hit, year) {
    const months = [{ value: 12, label: '12 月' }, { value: 6, label: '6 月' }, { value: 0, label: '不标月份' }]
    wx.showActionSheet({
      itemList: months.map((item) => item.label),
      success: (res) => {
        const month = months[res.tapIndex].value
        setArticleYear(hit._id, year, month).then(() => {
          const next = this.mineAll.map((item) => (item._id === hit._id
            ? Object.assign({}, item, { year, month, kind: 'real' })
            : item))
          this.applyMine(this.data.level, next)
          wx.showToast({ title: `已归到 ${year} 年${month ? `${month}月` : ''}`, icon: 'none' })
        }).catch((error) => {
          wx.showToast({ title: (error && error.message) || '年份没保存上，稍后再试', icon: 'none' })
        })
      }
    })
  },

  confirmRemove(hit) {
    if (!hit) return
    wx.showModal({
      title: '删除这篇文章？',
      content: `${hit.title}的正文、学习进度和练习记录会一起删除，已收藏的生词和语法不受影响。`,
      confirmText: '删除',
      confirmColor: '#b4552d',
      success: (res) => {
        if (!res.confirm) return
        deleteArticle(hit._id).then(() => {
          this.applyMine(this.data.level, this.mineAll.filter((item) => item._id !== hit._id))
          wx.showToast({ title: '已删除', icon: 'none' })
        }).catch((error) => {
          wx.showToast({ title: (error && error.message) || '删除失败，稍后再试', icon: 'none' })
        })
      }
    })
  },

  start(article) {
    if (!article) return
    this.setData({ starting: true, startingTitle: article.title, error: '' })
    prepareBankArticle(article)
      .then((articleId) => this.openPreview(articleId))
      .catch((error) => {
        this.setData({
          starting: false,
          error: (error && error.message) || '这篇文章没能准备好，换一篇试试'
        })
      })
  },

  // 打开文章先给一眼过渡页：正文、译文和本篇学习目标，确认后才进入精读
  open(articleId) {
    if (!articleId) return
    const hit = this.mineAll.find((item) => item._id === articleId)
    this.setData({ starting: true, startingTitle: hit ? hit.title : '', error: '' })
    this.openPreview(articleId).catch((error) => {
      this.setData({ starting: false, error: (error && error.message) || '这篇文章打不开，再试一次' })
    })
  },

  // 预览页数据由题库页预先取好，缓存后交给预览页渲染
  openPreview(articleId) {
    return previewArticle(articleId).then((data) => {
      this.setData({ starting: false })
      wx.setStorageSync('articlePreview', data)
      wx.navigateTo({ url: '/pages/preview/index?mode=article' })
    })
  },

  // 导入入口：先出声再跳转，让「这里能点」有即时反馈
  goImport() {
    playTapSound()
    wx.navigateTo({ url: '/pages/import/index?from=library' })
  }
})
