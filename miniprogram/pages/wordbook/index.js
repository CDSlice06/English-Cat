const wordbook = require('../../services/wordbook')
const cet = require('../../utils/cet')

// 当前标尺下要显示的星数与档位名（0 星表示词表与语料都查不到，不显示）
function decorate(item, target) {
  const star = Number(target === 'cet6' ? item.freq6 : item.freq4) || 0
  return Object.assign({}, item, { star, starLabel: cet.starLabel(star) })
}

const SOURCE_LABELS = {
  article: '来自文章精读',
  manual: '手动收录'
}

Page({
  data: {
    loading: true,
    error: '',
    tab: 'unknown',
    counts: { total: 0, known: 0, unknown: 0 },
    items: [],
    words: [],
    draft: '',
    suggestions: [],
    // 联想列表的最大高度：跟着屏幕高度走，避免展开后被输入法挡住
    suggestMax: 200,
    adding: false,
    busyId: '',
    // 备考标尺：四级 / 六级两套星级，切换后同一个词的星级会变
    cetTarget: 'cet4',
    cetLabel: '四级'
  },

  onLoad() {
    let info = {}
    try {
      info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
    } catch (error) {
      info = {}
    }
    const height = Number(info && info.windowHeight) || 600
    // 星级标尺跟随上次选择（没选过就用备考级别 userLevel），进页面就按它显示
    const target = cet.getTarget()
    this.setData({
      suggestMax: Math.max(160, Math.round(height * 0.36)),
      cetTarget: target,
      cetLabel: cet.targetLabel(target)
    })
    this.keyboardHeight = 0
    // 每个词的两套星级只查一次，本次会话内复用
    this.freqMap = {}
  },

  onShow() {
    this.renderSnapshot()
    this.load(true)
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

  load(force) {
    if (!this.data.items.length) this.setData({ loading: true })
    this.setData({ error: '' })
    wordbook.list(force)
      .then((data) => this.applyData(data.items || [], data.counts || { total: 0, known: 0, unknown: 0 }))
      .catch((error) => {
        // 快照里已经有词时保留列表，刷新失败不打断浏览
        if (this.data.items.length) return
        this.setData({ loading: false, error: error.message || '词库加载失败，请重试' })
      })
  },

  applyData(rawItems, counts) {
    const target = this.data.cetTarget
    this.freqMap = this.freqMap || {}
    const items = rawItems.map((item) => {
      // 生词本只存词条，星级靠云函数补：本次会话查过的先从 freqMap 里贴上，不闪
      const held = this.freqMap[String(item.word || '').toLowerCase()] || {}
      return decorate({
        id: item.id,
        word: item.word,
        phonetic: item.phonetic || '',
        meanings: item.meanings || [],
        state: item.state,
        freq4: held.freq4 || 0,
        freq6: held.freq6 || 0,
        sourceLabel: SOURCE_LABELS[item.source] || SOURCE_LABELS.manual
      }, target)
    })
    this.setData({ loading: false, items, counts }, () => {
      this.applyTab()
      this.loadFreqs()
    })
  },

  // 今日复习：重算「不记得」里最久没复习的那批词
  goReview() {
    wx.navigateTo({ url: '/pages/review/index' })
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
      // 网络失败不写缓存，保留页面上已有的星级
      if (!map) return
      const fresh = map
      // 词库里确实没有依据的词也记成 0 星，下次不再重复查
      missing.forEach((key) => {
        const hit = fresh[key]
        this.freqMap[key] = hit && typeof hit === 'object'
          ? { freq4: Number(hit.freq4) || 0, freq6: Number(hit.freq6) || 0 }
          : { freq4: 0, freq6: 0 }
      })
      const target = this.data.cetTarget
      const items = (this.data.items || []).map((item) => {
        const hit = this.freqMap[String(item.word || '').toLowerCase()]
        if (!hit) return item
        return decorate(Object.assign({}, item, hit), target)
      })
      this.setData({ items }, () => this.applyTab())
    }).catch(() => {})
  },

  // 切换备考标尺：两套星级都已经拿到，直接换显示，不需要重新请求
  selectCetTarget(event) {
    const target = cet.saveTarget(event.currentTarget.dataset.target)
    if (target === this.data.cetTarget) return
    const items = (this.data.items || []).map((item) => decorate(item, target))
    this.setData({ cetTarget: target, cetLabel: cet.targetLabel(target), items }, () => this.applyTab())
  },

  // 星级说明：文案跟着当前标尺走，讲清四六级两套标尺的关系，没有依据的词不显示星星
  showFreqHelp() {
    wx.showModal({
      title: `星级怎么算 · ${this.data.cetLabel}标尺`,
      content: cet.freqHelp(this.data.cetTarget),
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#a86a11'
    })
  },

  applyTab() {
    const tab = this.data.tab
    const words = this.data.items.filter((item) => (
      tab === 'known' ? item.state === 'known' : item.state !== 'known'
    ))
    this.setData({ words })
  },

  switchTab(event) {
    const tab = event.currentTarget.dataset.tab
    if (tab === this.data.tab) return
    this.setData({ tab }, () => this.applyTab())
  },

  onInput(event) {
    const draft = event.detail.value
    this.setData({ draft })
    this.fetchSuggest(draft)
  },

  // 输入停顿后再请求联想：每敲一个字母都打一次云函数太浪费
  fetchSuggest(value) {
    const text = String(value || '').trim()
    if (this.suggestTimer) clearTimeout(this.suggestTimer)
    if (text.length < 2) {
      this.suggestSeq = (this.suggestSeq || 0) + 1
      if (this.data.suggestions.length) this.setData({ suggestions: [] })
      return
    }
    this.suggestSeq = (this.suggestSeq || 0) + 1
    const seq = this.suggestSeq
    this.suggestTimer = setTimeout(() => {
      wordbook.suggest(text).then((list) => {
        // 只接受最后一次请求的结果，避免慢返回把新输入的建议盖掉
        if (seq !== this.suggestSeq) return
        if (String(this.data.draft || '').trim() !== text) return
        this.setData({
          suggestions: list.map((item) => ({
            word: item.word,
            phonetic: item.phonetic || '',
            meaningText: (item.meanings || [])
              .map((meaning) => `${meaning.pos || ''} ${meaning.definition || ''}`.trim())
              .filter(Boolean)
              .join('；')
          }))
        }, () => this.ensureSuggestVisible())
      })
    }, 260)
  },

  // 点建议直接补全拼写，再去点「收进词库」就是一个完整单词了
  pickSuggest(event) {
    const word = event.currentTarget.dataset.word
    if (!word) return
    if (this.suggestTimer) clearTimeout(this.suggestTimer)
    this.suggestSeq = (this.suggestSeq || 0) + 1
    this.setData({ draft: word, suggestions: [] })
  },

  // 点页面空白处才收起联想；失焦后列表保留，用户可以先滑动挑选再回来点
  closeSuggest() {
    if (this.data.suggestions.length) this.setData({ suggestions: [] })
  },

  noop() {},

  onFocus() {
    if (this.data.suggestions.length) return
    const text = String(this.data.draft || '').trim()
    if (text.length >= 2) this.fetchSuggest(text)
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
