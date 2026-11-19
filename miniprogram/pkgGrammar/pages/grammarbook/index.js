const grammarbook = require('../../../services/grammarbook')
const review = require('../../../services/review')
const { USAGE_NOTES } = require('../../content/usage-notes')
const { SYLLABUS, LONG_METHOD, KEY_MODULE, KEY_CATEGORY, MODULE_MAP } = require('../../content/grammar-syllabus')
const KB = require('../../content/grammar-kb')

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'word', label: '词法' },
  { key: 'syntax', label: '句法' },
  { key: 'long', label: '长难句' }
]

// 复习页的三档自评只记在本地 grammarReviewLog，这里按最近一次自评给收藏卡分类
const GRAMMAR_LOG = 'grammarReviewLog'
const STATE_FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'new', label: '待复习' },
  { key: 'unknown', label: '不认识' },
  { key: 'fuzzy', label: '模糊' },
  { key: 'known', label: '认识' }
]
const STATE_TEXT = { new: '待复习', unknown: '不认识', fuzzy: '模糊', known: '认识' }

// 全量语法知识点：搜索要能搜到没收藏的，也能点开看讲解
const KB_MAP = {}
const KB_LIST = KB.map((point) => {
  const moduleId = KEY_MODULE[point.key] || ''
  const module = MODULE_MAP[moduleId]
  const definition = point.definition || point.understanding || ''
  KB_MAP[point.key] = point
  return {
    key: point.key,
    label: point.label,
    category: KEY_CATEGORY[point.key] || 'syntax',
    moduleId,
    moduleTitle: module ? module.title : '',
    excerpt: definition.length > 52 ? definition.slice(0, 52) + '…' : definition,
    hay: [
      point.key,
      point.label,
      definition,
      point.identify,
      point.usage,
      point.translate || point.translation,
      point.trap ? `${point.trap.wrong} ${point.trap.right} ${point.trap.note}` : '',
      (point.examples || []).map((example) => `${example.en || ''} ${example.zh || ''}`).join(' ')
    ].join(' ').toLowerCase()
  }
})

Page({
  data: {
    loading: true,
    error: '',
    counts: { total: 0 },
    removingId: '',
    // 两页：自己的收藏卡 / 系统语法大纲
    tab: 'cards',
    filters: FILTERS,
    filter: 'all',
    stateFilters: STATE_FILTERS,
    stateFilter: 'all',
    keyword: '',
    moduleFilter: '',
    moduleTitle: '',
    shownTotal: 0,
    kbResults: [],
    kbVisible: [],
    kbExpanded: false,
    kbTotal: KB_LIST.length,
    cardsEmpty: '',
    allItems: [],
    items: [],
    syllabus: [],
    method: LONG_METHOD
  },

  onShow() {
    this.load(true)
  },

  reload() {
    this.load(true)
  },

  load(force) {
    this.setData({ loading: true, error: '' })
    return grammarbook.list(force)
      .then((data) => {
        const items = (data.items || []).map((item) => {
          const key = item.key || ''
          const sentence = item.sentence || ''
          const understanding = item.understanding || ''
          const translation = item.translation || ''
          const examples = item.examples || []
          // 复习页点过的三档自评存在本地，卡片上要能直接看到
          const stateKey = review.stateOf(item.id, { logKey: GRAMMAR_LOG }) || 'new'
          return {
            id: item.id,
            key: key || '语法与句式',
            title: item.pattern || key || '语法与句式',
            stateKey,
            stateText: STATE_TEXT[stateKey],
            sentence,
            understanding,
            steps: Array.isArray(item.steps) ? item.steps : [],
            translation,
            chunks: Array.isArray(item.chunks) ? item.chunks : [],
            usageTip: item.usageTip || '',
            examples,
            usage: USAGE_NOTES[key] || null,
            sourceLabel: item.articleTitle ? `来自《${item.articleTitle}》` : '来自文章精读',
            // key 对不上大纲里的语法点就归到句法，至少不会漏出筛选
            moduleId: KEY_MODULE[key] || '',
            category: KEY_CATEGORY[key] || 'syntax',
            hay: [
              key,
              item.pattern,
              sentence,
              understanding,
              translation,
              item.usageTip,
              examples.map((example) => `${example.en || ''} ${example.zh || ''}`).join(' ')
            ].join(' ').toLowerCase()
          }
        })

        // 每个模块收藏了几张卡，大纲里直接显示；再按知识点标记是否已收藏
        const countByModule = {}
        const countByKey = {}
        items.forEach((item) => {
          if (item.moduleId) countByModule[item.moduleId] = (countByModule[item.moduleId] || 0) + 1
          if (item.key) countByKey[item.key] = (countByKey[item.key] || 0) + 1
        })
        const syllabus = SYLLABUS.map((group) => ({
          id: group.id,
          name: group.name,
          intro: group.intro,
          modules: group.modules.map((module) => ({
            id: module.id,
            order: (MODULE_MAP[module.id] || {}).order || 0,
            title: module.title,
            guide: module.guide,
            goal: module.goal,
            exam: module.exam,
            traps: module.traps,
            count: countByModule[module.id] || 0,
            points: module.keys.map((key, index) => ({
              key,
              index: index + 1,
              label: (KB_MAP[key] && KB_MAP[key].label) || key,
              owned: countByKey[key] || 0
            }))
          }))
        }))

        this.setData(
          {
            loading: false,
            allItems: items,
            syllabus,
            counts: data.counts || { total: items.length }
          },
          () => this.applyFilter()
        )
      })
      .catch((error) => {
        this.setData({ loading: false, error: error.message || '语法本加载失败，请重试' })
      })
  },

  // 关键词、分类、模块三个条件对「我的收藏」和「语法知识库」同时生效，口径一致
  applyFilter() {
    const keyword = String(this.data.keyword || '').trim().toLowerCase()
    const filter = this.data.filter
    const moduleId = this.data.moduleFilter
    const stateFilter = this.data.stateFilter
    const all = this.data.allItems || []
    const items = all.filter((item) => {
      if (filter !== 'all' && item.category !== filter) return false
      if (moduleId && item.moduleId !== moduleId) return false
      if (stateFilter !== 'all' && item.stateKey !== stateFilter) return false
      if (keyword && item.hay.indexOf(keyword) < 0) return false
      return true
    })

    const owned = {}
    all.forEach((item) => {
      if (item.key) owned[item.key] = (owned[item.key] || 0) + 1
    })

    const kbResults = KB_LIST.filter((point) => {
      if (filter !== 'all' && point.category !== filter) return false
      if (moduleId && point.moduleId !== moduleId) return false
      if (keyword && point.hay.indexOf(keyword) < 0) return false
      return true
    }).map((point) => ({ ...point, owned: owned[point.key] || 0 }))

    // 没有关键词时只露一小段，避免一屏全是知识库；搜索时最多先给 20 条
    const previewCount = keyword ? 20 : 6
    const kbVisible = this.data.kbExpanded ? kbResults : kbResults.slice(0, previewCount)

    let cardsEmpty = '还没收藏卡片，去精读页把难懂的结构收进来'
    if (keyword) cardsEmpty = '收藏里没有匹配的卡片'
    else if (stateFilter !== 'all') cardsEmpty = `还没有标成「${STATE_TEXT[stateFilter]}」的卡片`
    else if (moduleId) cardsEmpty = '这个模块还没收藏卡片'
    else if (filter !== 'all') cardsEmpty = '这一类还没收藏卡片'

    this.setData({
      items,
      kbResults,
      kbVisible,
      shownTotal: items.length,
      cardsEmpty
    })
  },

  toggleKb() {
    this.setData({ kbExpanded: !this.data.kbExpanded }, () => this.applyFilter())
  },

  switchTab(event) {
    const tab = event.currentTarget.dataset.tab
    if (tab === this.data.tab) return
    this.setData({ tab })
  },

  pickFilter(event) {
    const filter = event.currentTarget.dataset.key
    if (filter === this.data.filter) return
    this.setData({ filter, moduleFilter: '', moduleTitle: '', kbExpanded: false }, () => this.applyFilter())
  },

  // 按最近一次自评筛收藏卡：不认识 / 模糊 / 认识 / 待复习
  pickState(event) {
    const stateFilter = event.currentTarget.dataset.key
    if (stateFilter === this.data.stateFilter) return
    this.setData({ stateFilter }, () => this.applyFilter())
  },

  onSearch(event) {
    this.setData(
      { keyword: event.detail.value, moduleFilter: '', moduleTitle: '', kbExpanded: false },
      () => this.applyFilter()
    )
  },

  clearSearch() {
    this.setData({ keyword: '', kbExpanded: false }, () => this.applyFilter())
  },

  // 大纲里点模块：跳到卡片页，按这个模块筛
  pickModule(event) {
    const module = MODULE_MAP[event.currentTarget.dataset.id]
    if (!module) return
    this.setData(
      {
        tab: 'cards',
        filter: module.category,
        moduleFilter: module.id,
        moduleTitle: module.categoryName + ' · ' + module.title,
        keyword: '',
        kbExpanded: false
      },
      () => this.applyFilter()
    )
  },

  clearModule() {
    this.setData({ moduleFilter: '', moduleTitle: '' }, () => this.applyFilter())
  },

  // 从大纲或搜索结果点知识点，进详情页看完整讲解
  openPoint(event) {
    const key = event.currentTarget.dataset.key
    if (!key) return
    wx.navigateTo({ url: '/pkgGrammar/pages/grammarpoint/index?key=' + encodeURIComponent(key) })
  },

  removeItem(event) {
    const id = event.currentTarget.dataset.id
    if (this.data.removingId) return
    wx.showModal({
      title: '移出语法本？',
      content: '只会删除这张语法收藏卡，不影响原文章、已看进度和练习记录。',
      confirmText: '确认移除',
      confirmColor: '#c95b52',
      success: (res) => {
        if (!res.confirm) return
        this.setData({ removingId: id })
        grammarbook.removePoint(id)
          .then(() => this.load(true))
          .then(() => this.setData({ removingId: '' }))
          .catch((error) => {
            this.setData({ removingId: '' })
            wx.showToast({ title: error.message || '移除失败', icon: 'none' })
          })
      }
    })
  }
})
