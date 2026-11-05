const { LEVELS, listOf, findByLevel, findById } = require('../../content/bank')
const { startBankArticle } = require('../../services/article')
const { listArticles, previewArticle, deleteArticle, setArticleYear } = require('../../services/study')

// 列表已经按年份分组，单条出处不再重复年份，只留「6月 · 第2套 · Passage 1」
function issueShort(item) {
  const parts = []
  if (item.month) parts.push(`${item.month}月`)
  if (item.paper) parts.push(`第${item.paper}套`)
  if (item.passage) parts.push(`Passage ${item.passage}`)
  return parts.join(' · ') || '真题'
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

Page({
  data: {
    levels: LEVELS,
    level: 'cet4',
    source: 'bank', // bank = 内置模拟篇，real = 我的真题，imported = 我的导入
    list: [],
    real: [],
    imported: [],
    mineView: [],
    mineAll: [],
    realGroups: [],
    years: [],
    yearFilter: 'all',
    mineLoading: false,
    starting: false,
    startingTitle: '',
    error: ''
  },

  onLoad() {
    const level = wx.getStorageSync('userLevel') === 'cet6' ? 'cet6' : 'cet4'
    this.setData({ level, list: listOf(level) })
    this.loadMine()
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
  },

  // 当前来源对应的列表：真题与导入分开渲染
  viewOf(source) {
    if (source === 'real') return this.data.real
    if (source === 'imported') return this.data.imported
    return []
  },

  // 我的真题：只取摘要，按当前级别过滤
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
    const scoped = this.mineAll.filter((item) => item.level === level)
    // 归档归属以用户导入时的选择为准；旧数据没有 kind 时按年份兜底
    const isReal = (item) => item.kind === 'real' || (!item.kind && item.year > 0)
    const real = scoped.filter(isReal).map((item) => Object.assign({}, item, { issue: issueShort(item) }))
    const imported = scoped.filter((item) => !isReal(item))
    const groups = groupByYear(real)
    const years = yearChips(groups)
    // 切级别或删文章后，原来选中的年份可能已经空了，退回「全部」
    const yearFilter = years.some((chip) => chip.key === this.data.yearFilter) ? this.data.yearFilter : 'all'
    const realGroups = pickGroups(groups, yearFilter)
    this.realGroupsAll = groups
    const source = this.data.source
    this.setData({
      mineAll: this.mineAll,
      real,
      imported,
      realGroups,
      years,
      yearFilter,
      mineView: source === 'real' ? real : (source === 'imported' ? imported : [])
    })
  },

  pickYear(event) {
    const key = event.currentTarget.dataset.key
    if (!key || key === this.data.yearFilter) return
    this.setData({
      yearFilter: key,
      realGroups: pickGroups(this.realGroupsAll || [], key)
    })
  },

  draw() {
    if (this.data.starting) return
    if (this.data.source !== 'bank') {
      const real = this.data.source === 'real'
      // 真题从当前筛选出的年份里抽，抽到的就是眼前这一屏
      const pool = real ? this.currentReal() : this.data.imported
      if (!pool.length) {
        wx.showToast({ title: real ? '这个级别还没有你导入的真题' : '这个级别还没有你录入的文章', icon: 'none' })
        return
      }
      this.open(pool[Math.floor(Math.random() * pool.length)]._id)
      return
    }
    this.start(findByLevel(this.data.level))
  },

  // 当前年份筛选下的所有真题
  currentReal() {
    const pool = []
    ;(this.data.realGroups || []).forEach((group) => {
      group.items.forEach((item) => pool.push(item))
    })
    return pool
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
    startBankArticle(article)
      .then(() => {
        this.setData({ starting: false })
        wx.switchTab({ url: '/pages/workbench/index' })
      })
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
    previewArticle(articleId)
      .then((data) => {
        this.setData({ starting: false })
        wx.setStorageSync('articlePreview', data)
        wx.navigateTo({ url: '/pages/preview/index?mode=article' })
      })
      .catch((error) => {
        this.setData({ starting: false, error: (error && error.message) || '这篇文章打不开，再试一次' })
      })
  },

  goImport() {
    // 带上当前分类，导入页据此预选归档位置，导入完还能回到同一分类
    const archive = this.data.source === 'real' ? '&archive=real'
      : (this.data.source === 'imported' ? '&archive=custom' : '')
    wx.navigateTo({ url: `/pages/import/index?from=library${archive}` })
  }
})
