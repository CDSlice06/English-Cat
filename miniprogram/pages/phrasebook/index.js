const wordbook = require('../../services/wordbook')
const localPhrases = require('../../utils/localPhrases')

// 词组搜索：词组本身、文中形式、用法小抄、原句和中文释义都能搜到
function phraseMatches(item, query) {
  const fields = [item.word, item.matched, item.note, item.sentence]
  if (fields.some((field) => String(field || '').toLowerCase().indexOf(query) >= 0)) return true
  return (item.meanings || []).some((meaning) => (
    String((meaning && (meaning.definition || meaning.def)) || '').toLowerCase().indexOf(query) >= 0
  ))
}

Page({
  data: {
    loading: true,
    error: '',
    tab: 'unknown',
    counts: { total: 0, known: 0, unknown: 0 },
    items: [],
    phrases: [],
    query: '',
    otherMatches: 0,
    searchEmptyText: '',
    draft: '',
    suggestions: [],
    // 联想列表的最大高度：跟着屏幕高度走，避免展开后被输入法挡住
    suggestMax: 200,
    adding: false,
    busyId: '',
    removingId: ''
  },

  onLoad() {
    let info = {}
    try {
      info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
    } catch (error) {
      info = {}
    }
    const height = Number(info && info.windowHeight) || 600
    this.setData({ suggestMax: Math.max(160, Math.round(height * 0.36)) })
    this.keyboardHeight = 0
    this.picked = null
    this.suggestKey = ''
  },

  onHide() {
    this.clearTimers()
  },

  onUnload() {
    this.clearTimers()
  },

  clearTimers() {
    if (this.suggestTimer) {
      clearTimeout(this.suggestTimer)
      this.suggestTimer = null
    }
  },

  onShow() {
    this.renderSnapshot()
    this.load(true)
  },

  // 先用手上的快照铺列表，云端结果回来再替换，进词组本不再白屏
  renderSnapshot() {
    if (this.data.items.length) return
    const snapshot = wordbook.readWordbookSnapshot()
    if (!snapshot || !(snapshot.phraseItems || []).length) return
    this.applyData(snapshot.phraseItems, snapshot.phraseCounts)
  },

  reload() {
    this.load(true)
  },

  load(force) {
    if (!this.data.items.length) this.setData({ loading: true })
    this.setData({ error: '' })
    return wordbook.list(force)
      .then((data) => this.applyData(data.phraseItems || [], data.phraseCounts))
      .catch((error) => {
        // 快照里已经有词组时保留列表，刷新失败不打断浏览
        if (this.data.items.length) return
        this.setData({ loading: false, error: error.message || '词组本加载失败，请重试' })
      })
  },

  applyData(rawItems, counts) {
    const items = (rawItems || []).map((item) => ({
      id: item.id,
      word: item.word,
      meanings: item.meanings || [],
      matched: item.matched || '',
      note: item.note || '',
      sentence: item.sentence || '',
      state: item.state,
      source: item.source || '',
      sourceLabel: item.articleTitle
        ? `来自《${item.articleTitle}》`
        : (item.source === 'manual' ? '手动收录' : '来自文章精读')
    }))
    this.setData({
      loading: false,
      items,
      counts: counts || { total: 0, known: 0, unknown: 0 }
    }, () => this.applyTab())
  },

  // 分段和搜索一起生效：先按「不记得 / 记得」分组，再按关键词过滤
  applyTab() {
    const tab = this.data.tab
    const query = String(this.data.query || '').trim().toLowerCase()
    const inTab = (item, name) => (name === 'known' ? item.state === 'known' : item.state !== 'known')
    const base = this.data.items.filter((item) => inTab(item, tab))
    const phrases = query ? base.filter((item) => phraseMatches(item, query)) : base
    // 搜不到时提示另一个分段还有多少匹配，避免用户以为词组丢了
    const otherTab = tab === 'known' ? 'unknown' : 'known'
    const otherMatches = query
      ? this.data.items.filter((item) => inTab(item, otherTab) && phraseMatches(item, query)).length
      : 0
    const otherLabel = otherTab === 'known' ? '记得' : '不记得'
    this.setData({
      phrases,
      otherMatches,
      searchEmptyText: otherMatches
        ? `在「${otherLabel}」里还有 ${otherMatches} 个匹配，点上面的分段去看看。`
        : '可以搜词组、文中形式、用法小抄或原句里的关键词。'
    })
  },

  onSearchInput(event) {
    this.setData({ query: event.detail.value }, () => this.applyTab())
  },

  clearSearch() {
    if (!this.data.query) return
    this.setData({ query: '' }, () => this.applyTab())
  },

  // 收词组：输入英文或中文，本地词组库即时联想，点候选或直接输入都能收进来
  onInput(event) {
    const draft = event.detail.value
    this.picked = null
    this.setData({ draft })
    this.showSuggest(draft)
  },

  showSuggest(value) {
    const text = String(value || '').trim()
    if (!text) {
      this.suggestKey = ''
      if (this.data.suggestions.length) this.setData({ suggestions: [] })
      return
    }
    const limit = /[\u4e00-\u9fff]/.test(text) ? 8 : (text.length <= 2 ? 8 : 6)
    const list = localPhrases.suggest(text, limit)
    const key = list.map((item) => item.phrase).join(',')
    // 内容没变就不 setData，连续输入时列表不闪
    if (key === this.suggestKey) return
    this.suggestKey = key
    this.setData({ suggestions: list }, () => this.ensureSuggestVisible())
  },

  pickSuggest(event) {
    const phrase = event.currentTarget.dataset.phrase
    if (!phrase) return
    const hit = this.data.suggestions.find((item) => item.phrase === phrase) || localPhrases.exact(phrase)
    this.picked = hit || null
    this.suggestKey = ''
    this.setData({ draft: phrase, suggestions: [] })
  },

  closeSuggest() {
    if (!this.data.suggestions.length) return
    this.suggestKey = ''
    this.setData({ suggestions: [] })
  },

  noop() {},

  onFocus() {
    if (this.data.suggestions.length) return
    const text = String(this.data.draft || '').trim()
    if (text) this.showSuggest(text)
  },

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

  submitPhrase() {
    const phrase = String(this.data.draft || '').trim().replace(/\s+/g, ' ')
    if (!phrase || this.data.adding) return
    if (!/^[a-zA-Z][a-zA-Z' .-]*$/.test(phrase)) {
      wx.showToast({ title: '请输入英文词组', icon: 'none' })
      return
    }
    // 点了候选就用候选的释义；直接敲完整的词组也能从词库里补上
    const hit = this.picked && this.picked.phrase === phrase
      ? this.picked
      : localPhrases.exact(phrase)
    this.setData({ adding: true })
    wordbook.addPhrase({
      phrase,
      meaning: hit ? hit.meaning : '',
      note: hit ? hit.note : '',
      matched: '',
      sentence: '',
      source: 'manual'
    })
      .then((data) => {
        this.picked = null
        this.suggestKey = ''
        this.setData({ adding: false, draft: '', suggestions: [] })
        wx.showToast({ title: data.existed ? '这个词组已在词组本' : '已收进词组本', icon: data.existed ? 'none' : 'success' })
        return this.load(true)
      })
      .catch((error) => {
        this.setData({ adding: false })
        wx.showToast({ title: error.message || '添加失败，请重试', icon: 'none' })
      })
  },

  switchTab(event) {
    const tab = event.currentTarget.dataset.tab
    if (tab === this.data.tab) return
    this.setData({ tab }, () => this.applyTab())
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
    if (this.data.removingId) return
    wx.showModal({
      title: '移出词组本？',
      content: '只会删除这条词组收藏，不影响原文章和学习进度。',
      confirmText: '确认移除',
      confirmColor: '#c95b52',
      success: (res) => {
        if (!res.confirm) return
        this.setData({ removingId: id })
        wordbook.removeWord(id)
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
