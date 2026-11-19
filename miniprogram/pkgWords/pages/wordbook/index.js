const wordbook = require('../../../services/wordbook')
const drawings = require('../../../services/drawings')
const cet = require('../../../utils/cet')
const localWords = require('../../utils/localWords')
const wordPatterns = require('../../utils/wordPatterns')
const wordExtras = require('../../utils/wordExtras')
const { DICT_CACHE_VERSION } = require('../../../config/version')

const SOURCE_LABELS = {
  article: '来自文章精读',
  manual: '手动收录'
}

// 本地和云端的联想结果字段不同：本地是现成的 meaningText，云端是一组义项
function toSuggestion(item) {
  const text = item.meaningText || (item.meanings || [])
    .map((meaning) => `${meaning.pos || ''} ${meaning.definition || meaning.def || ''}`.trim())
    .filter(Boolean)
    .join('；')
  return { word: item.word, phonetic: item.phonetic || '', meaningText: text }
}

// 搜索同时匹配单词和中文释义：记得意思、忘了拼写的人也能找回来
function itemMatches(item, query) {
  if (String(item.word || '').toLowerCase().indexOf(query) >= 0) return true
  return (item.meanings || []).some((meaning) => (
    String(meaning && meaning.definition || '').toLowerCase().indexOf(query) >= 0
  ))
}

// createdAt 可能是日期对象、时间戳或 ISO 字符串，统一转成时间再排序
function timeOf(value) {
  if (!value) return 0
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  if (typeof value === 'object' && value.$date) return Number(value.$date) || 0
  return 0
}

// 排序：最近收录 / 最久没看 / A-Z；最久没看把从没复习过的排最前
function sortItems(items, sort) {
  const list = items.slice()
  if (sort === 'az') {
    return list.sort((a, b) => String(a.word || '').localeCompare(String(b.word || '')))
  }
  if (sort === 'due') {
    return list.sort((a, b) => {
      const aAt = Number(a.reviewAt) || 0
      const bAt = Number(b.reviewAt) || 0
      if (!aAt || !bAt) return (aAt ? 1 : 0) - (bAt ? 1 : 0) || (Number(a.reviewDue) || 0) - (Number(b.reviewDue) || 0)
      return aAt - bAt
    })
  }
  return list.sort((a, b) => timeOf(b.createdAt) - timeOf(a.createdAt))
}

Page({
  data: {
    loading: true,
    error: '',
    tab: 'unknown',
    counts: { total: 0, known: 0, unknown: 0 },
    items: [],
    words: [],
    query: '',
    otherMatches: 0,
    searchEmptyText: '',
    draft: '',
    suggestions: [],
    // 联想列表的最大高度：跟着屏幕高度走，避免展开后被输入法挡住
    suggestMax: 200,
    adding: false,
    busyId: '',
    // 点派生 / 形近词弹出的小面板：{ word, phonetic, meanings, loading, error }
    related: null,
    // 词库管理：排序、来源筛选、批量勾选
    sort: 'new',
    source: 'all',
    sortOptions: [
      { key: 'new', label: '最近收录' },
      { key: 'due', label: '最久没看' },
      { key: 'az', label: 'A-Z' }
    ],
    sourceOptions: [
      { key: 'all', label: '全部' },
      { key: 'article', label: '文章' },
      { key: 'manual', label: '手动' }
    ],
    managing: false,
    selectedCount: 0,
    allSelected: false
  },

  onLoad(options) {
    let info = {}
    try {
      info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
    } catch (error) {
      info = {}
    }
    const height = Number(info && info.windowHeight) || 600
    const patch = {
      suggestMax: Math.max(160, Math.round(height * 0.36))
    }
    // 从「我的」页的「已掌握词汇」进来时，直接落在对应分组
    if (options && (options.tab === 'known' || options.tab === 'unknown')) patch.tab = options.tab
    this.setData(patch)
    this.keyboardHeight = 0
    // 派生 / 形近词只查一次，本次会话内复用
    this.freqMap = {}
    // 云端联想结果按前缀缓存，删改重输时不再重新等网络
    this.suggestCache = {}
    this.suggestKey = ''
    // 派生 / 形近词的释义查过一次就记住，反复点不再等网络
    this.relatedCache = {}
    // 批量勾选的 id 放在实例上，不参与渲染数据，列表里只带 picked 标记
    this.selectedIds = []
  },

  onShow() {
    this.renderSnapshot()
    this.syncDrawings()
    this.load(true)
  },

  // 从画板回来后，把列表里的草图路径刷新一遍（重画、删除都会变）
  syncDrawings() {
    const items = this.data.items || []
    if (!items.length) return
    let changed = false
    const next = items.map((item) => {
      const path = drawings.pathOf(item.id)
      if (path === item.drawingPath) return item
      changed = true
      return Object.assign({}, item, { drawingPath: path })
    })
    if (changed) this.setData({ items: next }, () => this.applyTab())
  },

  // 先用手上的快照铺列表，云端结果回来再替换，打开生词本不再白屏
  renderSnapshot() {
    if (this.data.items.length) return
    const snapshot = wordbook.readWordbookSnapshot()
    if (!snapshot) return
    this.applyData(snapshot.items || [], snapshot.counts || { total: 0, known: 0, unknown: 0 })
  },

  onHide() {
    this.clearTimers()
  },

  onUnload() {
    this.clearTimers()
  },

  // 页面离开后定时器和在途联想请求都要停掉，否则会对已卸载页面 setData
  clearTimers() {
    if (this.suggestTimer) {
      clearTimeout(this.suggestTimer)
      this.suggestTimer = null
    }
    this.suggestSeq = (this.suggestSeq || 0) + 1
  },

  reload() {
    this.load(true)
  },

  // 看自己画的记忆草图，点开用系统图片查看器放大
  previewDrawing(e) {
    const path = (e && e.currentTarget && e.currentTarget.dataset.path) || ''
    if (!path) return
    wx.previewImage({ urls: [path] })
  },

  // 重新画一张：进画板重画，保存后覆盖旧图
  redraw(e) {
    const id = (e && e.currentTarget && e.currentTarget.dataset.id) || ''
    const item = (this.data.items || []).find((entry) => entry.id === id)
    if (!item) return
    const meaning = (item.meanings || [])
      .map((entry) => entry && entry.definition)
      .filter(Boolean)
      .join('；')
      .slice(0, 40)
    wx.navigateTo({
      url: `/pkgWords/pages/draw/index?id=${encodeURIComponent(item.id)}&word=${encodeURIComponent(item.word)}&meaning=${encodeURIComponent(meaning)}`
    })
  },

  // 删掉草图，之后可以重新画；只动画，不动词条
  removeDrawing(e) {
    const id = (e && e.currentTarget && e.currentTarget.dataset.id) || ''
    if (!id) return
    wx.showModal({
      title: '删掉这张画？',
      content: '只删除这张草图，单词还留在生词本里。',
      confirmText: '删掉',
      confirmColor: '#b23b30',
      success: (res) => {
        if (!res.confirm) return
        drawings.remove(id)
        const items = (this.data.items || []).map((item) => (
          item.id === id ? Object.assign({}, item, { drawingPath: '' }) : item
        ))
        this.setData({ items }, () => this.applyTab())
        wx.showToast({ title: '已删掉', icon: 'none' })
      }
    })
  },

  // 点派生 / 形近词：先用手上的一小段释义把面板撑开，再查完整释义补进去
  openRelated(e) {
    const ds = (e && e.currentTarget && e.currentTarget.dataset) || {}
    const word = String(ds.word || '').trim()
    if (!word) return
    const key = word.toLowerCase()
    const cached = this.relatedCache && this.relatedCache[key]
    if (cached) {
      this.setData({ related: cached })
      return
    }
    const shortDef = String(ds.def || '').trim()
    const fallback = shortDef
      ? [{ pos: String(ds.pos || ''), def: shortDef, key: 0 }]
      : []
    this.setData({
      related: {
        word,
        phonetic: '',
        meanings: fallback,
        loading: true,
        error: '',
        root: null,
        confusables: [],
        synonyms: []
      }
    })
    wordbook.lookup(word).then((entry) => {
      // 面板已经关掉或换成了别的词，就别再写回去
      if (!this.data.related || String(this.data.related.word).toLowerCase() !== key) return
      const meanings = ((entry && entry.meanings) || [])
        .map((meaning) => ({ pos: meaning.pos || '', def: meaning.definition || meaning.def || '' }))
        .filter((meaning) => meaning.def)
        .map((meaning, index) => Object.assign(meaning, { key: index }))
      const panel = {
        word: (entry && entry.word) || word,
        phonetic: (entry && entry.phonetic) || '',
        meanings: meanings.length ? meanings : fallback,
        loading: false,
        error: '',
        // 词根拆解与易混辨析由云端词库直接带回，查词面板也能看到
        root: (entry && entry.root) || null,
        confusables: (entry && Array.isArray(entry.confusables)) ? entry.confusables : [],
        // 近义词来自 WordNet 同义集，同样是云端词库直接带回
        synonyms: (entry && Array.isArray(entry.synonyms)) ? entry.synonyms : []
      }
      if (!panel.meanings.length) panel.error = '词库暂未收录这个词'
      else this.relatedCache[key] = panel
      this.setData({ related: panel })
    }).catch(() => {
      if (!this.data.related || String(this.data.related.word).toLowerCase() !== key) return
      this.setData({
        related: {
          word,
          phonetic: '',
          meanings: fallback,
          loading: false,
          error: fallback.length ? '' : '词库暂未收录这个词',
          root: null,
          confusables: [],
          synonyms: []
        }
      })
    })
  },

  closeRelated() {
    this.setData({ related: null })
  },

  // 面板内部点击不关闭
  noop() {},

  load(force) {
    if (!this.data.items.length) this.setData({ loading: true })
    this.setData({ error: '' })
    wordbook.list(force)
      .then((data) => {
        const items = data.items || []
        this.applyData(items, data.counts || { total: 0, known: 0, unknown: 0 })
        // 只要还有缺释义的词，就立刻补一次，不再被 24 小时节流挡住
        const hasEmpty = items.some((item) => item && (!Array.isArray(item.meanings) || !item.meanings.length))
        // 缺释义的词先直接查一次词库，页面马上能显示，不用等后台批量刷新
        this.fillMissingMeanings()
        this.refreshMeaningsOnce(hasEmpty)
      })
      .catch((error) => {
        // 快照里已经有词时保留列表，刷新失败不打断浏览
        if (this.data.items.length) return
        this.setData({ loading: false, error: error.message || '词库加载失败，请重试' })
      })
  },

  // 释义刷新要批量查词库，放在列表渲染之后悄悄跑；有缺释义的词时强制补一次
  refreshMeaningsOnce(force) {
    const KEY = 'wordbookRefreshAt'
    const FORCE_KEY = 'wordbookForceRefreshAt'
    const VERSION_KEY = 'wordbookMeaningVersion'
    const now = Date.now()
    let versionStale = false
    try {
      // 词库释义版本变了（修正过错义），跳过节流强制按新词库刷新一次
      versionStale = wx.getStorageSync(VERSION_KEY) !== DICT_CACHE_VERSION
    } catch (error) {}
    if (versionStale) force = true
    try {
      // 常规刷新一天一次；缺释义的强制刷新单独计时，避免每次进页面都全量查一遍
      const last = wx.getStorageSync(force ? FORCE_KEY : KEY) || 0
      const gap = force ? 10 * 60 * 1000 : 24 * 60 * 60 * 1000
      if (!versionStale && now - last < gap) return
    } catch (error) {
      return
    }
    wordbook.refreshMeanings().then((res) => {
      // 云函数没部署或网络失败时 res 为 null，不写时间戳，下次进页面还能再试
      if (!res) return
      try {
        wx.setStorageSync(KEY, Date.now())
        if (force) wx.setStorageSync(FORCE_KEY, Date.now())
        wx.setStorageSync(VERSION_KEY, DICT_CACHE_VERSION)
      } catch (error) {}
      // 没补到任何东西就不用再拉一遍列表
      if (!Number(res.refreshed)) return
      // 补到释义后重新拉一次：既显示新释义，也把 popularizaion 这类旧词形纠正成词库原形
      return wordbook.list(true).then((data) => {
        this.applyData(data.items || [], data.counts || { total: 0, known: 0, unknown: 0 })
      })
    }).catch(() => {})
  },

  // 列表里已经渲染出来的缺释义词，直接批量查一次并就地补上；
  // 这样不用等后台 refresh 的节流周期，错拼词也能立刻按纠正后的原形显示释义
  fillMissingMeanings() {
    const items = this.data.items || []
    const missing = []
    items.forEach((item) => {
      if (!item || !item.word) return
      if (Array.isArray(item.meanings) && item.meanings.length) return
      const key = String(item.word).toLowerCase()
      if (missing.indexOf(key) < 0) missing.push(key)
    })
    if (!missing.length) return
    wordbook.lookupBatch(missing).then((map) => {
      if (!map) return
      let changed = false
      const next = (this.data.items || []).map((item) => {
        if (!item || !item.word) return item
        if (Array.isArray(item.meanings) && item.meanings.length) return item
        const hit = map[String(item.word).toLowerCase()]
        if (!hit || !Array.isArray(hit.meanings) || !hit.meanings.length) return item
        changed = true
        return Object.assign({}, item, {
          word: hit.word || item.word,
          phonetic: hit.phonetic || item.phonetic,
          meanings: hit.meanings
        })
      })
      if (changed) this.setData({ items: next })
    }).catch(() => {})
  },

  applyData(rawItems, counts) {
    this.freqMap = this.freqMap || {}
    const items = rawItems.map((item) => {
      // 生词本只存词条，派生/形近靠云函数补：本次会话查过的先从 freqMap 里贴上，不闪
      const held = this.freqMap[String(item.word || '').toLowerCase()] || {}
      const extra = wordExtras.extrasOf(item.word)
      return {
        id: item.id,
        word: item.word,
        phonetic: item.phonetic || '',
        meanings: item.meanings || [],
        state: item.state,
        // 星级取四级/六级里较高的一档，生词本不再区分备考级别
        star: Number(held.star) || 0,
        starLabel: cet.starLabel(Number(held.star) || 0),
        // 这个词的常用句型跟词条一起渲染，比如 strive 会带出 strive to do sth
        patterns: wordPatterns.patternsOf(item.word),
        patternExample: wordPatterns.exampleOf(item.word),
        synonyms: extra.synonyms,
        family: held.family || [],
        similar: held.similar || [],
        // 背诵时自己画的记忆草图：记住之后也留在这里，随时能回看
        drawingPath: drawings.pathOf(item.id),
        // 管理页排序和来源筛选要用到，原样带过来
        source: item.source || 'manual',
        createdAt: item.createdAt,
        reviewAt: item.reviewAt,
        reviewDue: item.reviewDue,
        sourceLabel: SOURCE_LABELS[item.source] || SOURCE_LABELS.manual
      }
    })
    // 词条被删或刷新后消失时，勾选里不能留下已不存在的 id
    const alive = {}
    items.forEach((item) => { alive[item.id] = true })
    this.selectedIds = (this.selectedIds || []).filter((id) => alive[id])
    this.setData({ loading: false, items, counts }, () => {
      this.applyTab()
      this.loadFreqs()
    })
  },

  // 词频星级：手上的词还没查过两套星级的批量补一次，失败就安静地不显示，不打扰用户
  loadFreqs() {
    this.freqMap = this.freqMap || {}
    const missing = []
    ;(this.data.items || []).forEach((item) => {
      const key = String(item.word || '').toLowerCase()
      if (!key || this.freqMap[key] !== undefined || missing.indexOf(key) >= 0) return
      missing.push(key)
    })
    if (!missing.length) return
    wordbook.freqsOf(missing).then((map) => {
      // 网络失败不写缓存，保留页面上已有的派生 / 形近词
      if (!map) return
      const fresh = map
      // 词库里确实没有依据的词也记成空结果，下次不再重复查
      missing.forEach((key) => {
        const hit = fresh[key]
        this.freqMap[key] = hit && typeof hit === 'object'
          ? {
            // 两套标尺取更高的一档，避免用户以为要分开背两套词
            star: Math.max(Number(hit.freq4) || 0, Number(hit.freq6) || 0),
            family: Array.isArray(hit.family) ? hit.family : [],
            similar: Array.isArray(hit.similar) ? hit.similar : []
          }
          : { star: 0, family: [], similar: [] }
      })
      const items = (this.data.items || []).map((item) => {
        const hit = this.freqMap[String(item.word || '').toLowerCase()]
        if (!hit) return item
        return Object.assign({}, item, hit, { starLabel: cet.starLabel(hit.star) })
      })
      this.setData({ items }, () => this.applyTab())
    }).catch(() => {})
  },

  // 分段、来源和搜索一起生效：先分组和筛来源，再按关键词过滤，最后按当前排序展示
  applyTab() {
    const tab = this.data.tab
    const query = String(this.data.query || '').trim().toLowerCase()
    const source = this.data.source
    const inTab = (item, name) => (name === 'known' ? item.state === 'known' : item.state !== 'known')
    const inSource = (item) => source === 'all' || item.source === source
    const base = this.data.items.filter((item) => inTab(item, tab) && inSource(item))
    const matched = query ? base.filter((item) => itemMatches(item, query)) : base
    const selected = {}
    ;(this.selectedIds || []).forEach((id) => { selected[id] = true })
    const words = sortItems(matched, this.data.sort).map((item) => (
      Object.assign({}, item, { picked: !!selected[item.id] })
    ))
    // 搜不到时提示另一个分段还有多少匹配，避免用户以为词丢了
    const otherTab = tab === 'known' ? 'unknown' : 'known'
    const otherMatches = query
      ? this.data.items.filter((item) => inTab(item, otherTab) && inSource(item) && itemMatches(item, query)).length
      : 0
    const otherLabel = otherTab === 'known' ? '记得' : '不记得'
    this.setData({
      words,
      otherMatches,
      selectedCount: (this.selectedIds || []).length,
      allSelected: words.length > 0 && words.every((item) => item.picked),
      searchEmptyText: otherMatches
        ? `在「${otherLabel}」里还有 ${otherMatches} 个匹配，点上面的分段去看看。`
        : '试试只输入前几个字母，或者换一个中文释义关键词。'
    })
  },

  selectSort(event) {
    const sort = event.currentTarget.dataset.sort
    if (!sort || sort === this.data.sort) return
    this.setData({ sort }, () => this.applyTab())
  },

  // 来源筛选会隐藏部分词，切换时清空勾选，避免把看不见的词一起删掉
  selectSource(event) {
    const source = event.currentTarget.dataset.source
    if (!source || source === this.data.source) return
    this.selectedIds = []
    this.setData({ source }, () => this.applyTab())
  },

  toggleManage() {
    if (this.data.busyId === 'batch') return
    this.selectedIds = []
    this.setData({ managing: !this.data.managing }, () => this.applyTab())
  },

  toggleSelect(event) {
    const id = event.currentTarget.dataset.id
    if (!id) return
    const ids = this.selectedIds || []
    const index = ids.indexOf(id)
    if (index >= 0) ids.splice(index, 1)
    else ids.push(id)
    this.selectedIds = ids
    this.applyTab()
  },

  // 全选只作用于当前筛选后的列表，所见即所选
  toggleSelectAll() {
    this.selectedIds = this.data.allSelected
      ? []
      : (this.data.words || []).map((item) => item.id)
    this.applyTab()
  },

  removeSelected() {
    const ids = (this.selectedIds || []).slice()
    if (!ids.length) {
      wx.showToast({ title: '先勾选要移除的词', icon: 'none' })
      return
    }
    if (this.data.busyId) return
    wx.showModal({
      title: `移除 ${ids.length} 个词？`,
      content: '移除后可以随时重新收录，但记得状态和复习进度不会保留。',
      confirmText: '确认移除',
      confirmColor: '#c95b52',
      success: (res) => {
        if (!res.confirm) return
        this.setData({ busyId: 'batch' })
        wordbook.removeMany(ids)
          .then((removed) => {
            this.selectedIds = []
            this.setData({ busyId: '', managing: false })
            wx.showToast({ title: `已移除 ${removed} 个词`, icon: 'success' })
            return this.load(true)
          })
          .catch((error) => {
            this.setData({ busyId: '' })
            wx.showToast({ title: error.message || '移除失败，请重试', icon: 'none' })
          })
      }
    })
  },

  onSearchInput(event) {
    // 搜索会隐藏部分词，勾选一并清空
    if (this.data.managing) this.selectedIds = []
    this.setData({ query: event.detail.value }, () => this.applyTab())
  },

  clearSearch() {
    if (!this.data.query) return
    if (this.data.managing) this.selectedIds = []
    this.setData({ query: '' }, () => this.applyTab())
  },

  switchTab(event) {
    const tab = event.currentTarget.dataset.tab
    if (tab === this.data.tab) return
    if (this.data.managing) this.selectedIds = []
    this.setData({ tab }, () => this.applyTab())
  },

  onInput(event) {
    const draft = event.detail.value
    this.setData({ draft })
    this.fetchSuggest(draft)
  },

  // 输入时先在本地词表里匹配，打完字立刻出候选；云端联想只补生僻词和完整释义，
  // 回来后再静默替换。本地匹配不走网络，所以每敲一个字母都能马上收窄。
  fetchSuggest(value) {
    const text = String(value || '').trim()
    if (this.suggestTimer) clearTimeout(this.suggestTimer)
    if (!text) {
      this.suggestSeq = (this.suggestSeq || 0) + 1
      this.suggestKey = ''
      if (this.data.suggestions.length) this.setData({ suggestions: [] })
      return
    }
    this.suggestSeq = (this.suggestSeq || 0) + 1
    const seq = this.suggestSeq
    const isChinese = /[\u4e00-\u9fff]/.test(text)
    // 字母越少候选越多，打全以后自然收窄
    const limit = isChinese ? 8 : (text.length === 1 ? 10 : (text.length === 2 ? 8 : 6))
    const cacheKey = `${isChinese ? 'zh' : 'en'}:${text}`
    const cached = this.suggestCache[cacheKey]
    if (cached) {
      this.applySuggestions(cached.map(toSuggestion))
      return
    }
    this.applySuggestions((isChinese ? localWords.search(text, limit) : localWords.suggest(text, limit)))
    this.suggestTimer = setTimeout(() => {
      const request = isChinese ? wordbook.search(text, limit) : wordbook.suggest(text, limit)
      request.then((list) => {
        // 只接受最后一次请求的结果，避免慢返回把新输入的建议盖掉
        if (seq !== this.suggestSeq) return
        if (String(this.data.draft || '').trim() !== text) return
        this.suggestCache[cacheKey] = list
        // 云端没查到就保留本地的候选，别闪一下清空
        if (!list.length) return
        this.applySuggestions(list.map(toSuggestion))
      })
    }, 120)
  },

  // 内容没变就不 setData，避免本地结果被云端结果替换时列表闪动
  applySuggestions(suggestions) {
    const key = suggestions.map((item) => `${item.word}|${item.meaningText}`).join(',')
    if (key === this.suggestKey) return
    this.suggestKey = key
    this.setData({ suggestions }, () => this.ensureSuggestVisible())
  },

  // 点建议直接补全拼写，再去点「收进词库」就是一个完整单词了
  pickSuggest(event) {
    const word = event.currentTarget.dataset.word
    if (!word) return
    if (this.suggestTimer) clearTimeout(this.suggestTimer)
    this.suggestSeq = (this.suggestSeq || 0) + 1
    this.suggestKey = ''
    this.setData({ draft: word, suggestions: [] })
  },

  // 点页面空白处才收起联想；失焦后列表保留，用户可以先滑动挑选再回来点
  closeSuggest() {
    if (!this.data.suggestions.length) return
    this.suggestKey = ''
    this.setData({ suggestions: [] })
  },

  noop() {},

  onFocus() {
    if (this.data.suggestions.length) return
    const text = String(this.data.draft || '').trim()
    if (text) this.fetchSuggest(text)
  },

  // 键盘弹起后把输入卡片滚到顶部，让联想列表整体落在键盘上方的可视区
  onKeyboardHeightChange(event) {
    this.keyboardHeight = Number(event && event.detail && event.detail.height) || 0
    if (this.keyboardHeight > 0) this.ensureSuggestVisible()
  },

  ensureSuggestVisible() {
    if (!(this.keyboardHeight > 0)) return
    if (!this.data.suggestions.length) return
    if (typeof wx.pageScrollTo !== 'function') return
    wx.pageScrollTo({
      selector: '.add-card',
      offsetTop: -16,
      duration: 180,
      fail: () => {}
    })
  },

  submitWord() {
    const word = String(this.data.draft || '').trim()
    if (!word || this.data.adding) return
    if (!/^[a-zA-Z][a-zA-Z' -]*$/.test(word)) {
      wx.showToast({ title: '请输入英文单词', icon: 'none' })
      return
    }

    this.setData({ adding: true })
    wordbook.addWord({ word, source: 'manual' })
      .then((data) => {
        this.setData({ adding: false, draft: '', suggestions: [] })
        wx.showToast({ title: data.existed ? '这个词已在词库' : '已收进词库', icon: data.existed ? 'none' : 'success' })
        return this.load(true)
      })
      .catch((error) => {
        this.setData({ adding: false })
        wx.showToast({ title: error.message || '添加失败，请重试', icon: 'none' })
      })
  },

  tapKnown(event) {
    const id = event.currentTarget.dataset.id
    if (this.data.busyId) return
    this.setData({ busyId: id })
    wordbook.markKnown(id)
      .then(() => {
        wx.showToast({ title: '已转为「记得」', icon: 'success' })
        return this.load(true)
      })
      .then(() => this.setData({ busyId: '' }))
      .catch((error) => {
        this.setData({ busyId: '' })
        wx.showToast({ title: error.message || '状态保存失败', icon: 'none' })
      })
  },

  removeItem(event) {
    const id = event.currentTarget.dataset.id
    wx.showModal({
      title: '移出词库？',
      content: '移除后可以随时重新收录，但记得状态不会保留。',
      confirmText: '确认移除',
      confirmColor: '#c95b52',
      success: (res) => {
        if (!res.confirm) return
        wordbook.removeWord(id)
          .then(() => this.load(true))
          .catch((error) => wx.showToast({ title: error.message || '移除失败', icon: 'none' }))
      }
    })
  }
})
