// 语法知识点详情：从语法大纲或搜索结果进入，看一个知识点的完整讲解。
const KB = require('../../content/grammar-kb')
const { SYLLABUS, LONG_METHOD, KEY_MODULE, KEY_CATEGORY, MODULE_MAP } = require('../../content/grammar-syllabus')
const { USAGE_NOTES } = require('../../content/usage-notes')

const KB_MAP = {}
KB.forEach((point) => {
  KB_MAP[point.key] = point
})

// 学习顺序：大纲里的排列顺序就是建议学习顺序
const ORDER = []
SYLLABUS.forEach((group) => {
  group.modules.forEach((module) => {
    module.keys.forEach((key) => ORDER.push(key))
  })
})

Page({
  data: {
    missing: false,
    point: null,
    module: null,
    categoryName: '',
    orderText: '',
    prev: null,
    next: null,
    method: null
  },

  onLoad(query) {
    this.show((query && query.key) || '')
  },

  show(key) {
    const point = KB_MAP[key]
    if (!point) {
      this.setData({ missing: true, point: null })
      return
    }
    const moduleId = KEY_MODULE[key] || ''
    const module = MODULE_MAP[moduleId] || null
    const index = ORDER.indexOf(key)
    const prevKey = index > 0 ? ORDER[index - 1] : ''
    const nextKey = index >= 0 && index < ORDER.length - 1 ? ORDER[index + 1] : ''
    const category = KEY_CATEGORY[key] || ''

    wx.setNavigationBarTitle({ title: point.label })

    this.setData({
      missing: false,
      point: {
        key: point.key,
        label: point.label,
        definition: point.definition || point.understanding || '',
        identify: point.identify || '',
        usage: point.usage || '',
        translate: point.translate || point.translation || '',
        trap: point.trap || null,
        examples: point.examples || [],
        notes: USAGE_NOTES[key] || null
      },
      module: module
        ? {
            title: module.title,
            guide: module.guide,
            goal: module.goal,
            exam: module.exam,
            traps: module.traps,
            order: module.order
          }
        : null,
      categoryName: module ? module.categoryName : '',
      orderText: index >= 0 ? '第 ' + (index + 1) + ' / ' + ORDER.length + ' 个知识点' : '',
      prev: prevKey ? { key: prevKey, label: KB_MAP[prevKey] ? KB_MAP[prevKey].label : prevKey } : null,
      next: nextKey ? { key: nextKey, label: KB_MAP[nextKey] ? KB_MAP[nextKey].label : nextKey } : null,
      method: category === 'long' ? LONG_METHOD : null
    })
  },

  goPoint(event) {
    const key = event.currentTarget.dataset.key
    if (!key) return
    this.show(key)
    wx.pageScrollTo({ scrollTop: 0, duration: 0 })
  }
})
