const wordbook = require('../../services/wordbook')
const grammarbook = require('../../services/grammarbook')
const review = require('../../services/review')
const drawings = require('../../services/drawings')
const sentences = require('../../services/sentences')

// 语法卡的排期只存本地，和单词的 reviewLog 分开，互不覆盖
const GRAMMAR_LOG = 'grammarReviewLog'
const GRAMMAR_OPTIONS = { logKey: GRAMMAR_LOG, sync: false }

Page({
  data: {
    loading: true,
    error: '',
    // 和背诵模式对齐：单词、词组、语法各一个标签，各排各的队
    tab: 'word',
    desc: '快速回忆以前记过的单词，只回忆意思，无需拼写；忘了也不会清零。',
    queue: [],
    index: 0,
    total: 0,
    doneCount: 0,
    percent: 0,
    // 每日复习目标：默认词汇 30 条、语法 10 条，顶部可以直接改
    target: review.targetOf('vocab'),
    targetBase: review.baseTarget('vocab'),
    targetOptions: review.TARGET_OPTIONS.vocab,
    batch: review.baseTarget('vocab'),
    moreCount: 0,
    restCount: 0,
    current: null,
    done: false,
    doneTitle: '',
    doneText: '',
    // 语法本单独读失败时，不能把页面说成「语法本是空的」
    grammarError: '',
    busy: false,
    // 先回忆再对答案：没点「显示释义」前不展示释义和自评按钮
    revealed: false,
    // 默认只看「第几档」，七点曲线按需展开
    curveOpen: false,
    // 显示答案后补的例句和中文
    sentence: '',
    sentenceZh: ''
  },

  onLoad(options) {
    // 首页按「哪一类先有到期内容」带着 tab 进来
    const tab = options && options.tab
    if (tab === 'word' || tab === 'phrase' || tab === 'grammar') this.setData({ tab })
    // 先把本地攒的复习进度补推上云，再拉词库
    review.syncOnce()
    this.load()
  },

  // 从画板回来时刷新当前卡片的草图
  onShow() {
    const current = this.data.current
    if (!current || this.data.tab === 'grammar') return
    const path = drawings.pathOf(current.id)
    if (path !== current.drawingPath) this.setData({ 'current.drawingPath': path })
  },

  load() {
    this.setData({ loading: true, error: '' })
    // 强制拉一次云端：复习要看到别的页面刚改过的状态；语法本读失败不影响词汇复习
    Promise.all([
      wordbook.list(true),
      grammarbook.list(true)
        .then((grammar) => ({ items: grammar.items || [], error: '' }))
        .catch((error) => ({
          items: [],
          error: (error && error.message) || '语法本读取失败，请重试'
        }))
    ])
      .then(([data, grammar]) => {
        this.sources = {
          word: data.items || [],
          phrase: data.phraseItems || [],
          grammar: (grammar.items || []).map((item) => Object.assign({}, item, {
            kind: 'grammar',
            // key 是规则库的内部标识，展示用句型名
            word: item.pattern || '语法点'
          }))
        }
        this.setData({ loading: false, grammarError: grammar.error || '' }, () => this.buildQueue())
      })
      .catch((error) => this.setData({ loading: false, error: error.message || '词库读取失败，请重试' }))
  },

  // 三个标签各自用一份队列和目标，切换时重算，今天已经复习过的不会重复出现
  buildQueue() {
    const tab = this.data.tab
    const grammar = tab === 'grammar'
    const items = (this.sources && this.sources[tab]) || []
    const options = grammar ? GRAMMAR_OPTIONS : undefined
    const kind = grammar ? 'grammar' : (tab === 'phrase' ? 'phrase' : 'vocab')
    const plan = review.planOf(items, kind, undefined, options)
    // 每张卡带上自己画的草图；语法卡没有画板，跳过
    const queue = plan.queue.map((item) => (grammar ? item : Object.assign({}, item, {
      drawingPath: drawings.pathOf(item.id)
    })))
    const stats = review.todayStats(items, undefined, options)
    // 今天已经复习过的也要算进总数，否则切标签或重新进页面会显示成 0 / 剩余数
    const doneCount = plan.doneToday
    const total = plan.total
    let doneText = ''
    if (grammar && this.data.grammarError) {
      doneText = '语法本这次没加载出来，点下面重新加载。'
    } else if (!items.length) {
      doneText = grammar
        ? '语法本还是空的。在文章的精读页收藏几个语法点，之后会按节奏出现在这里。'
        : (tab === 'phrase'
          ? '词组本还是空的。在文章的精读页收藏几个词组，之后会按节奏出现在这里。'
          : '生词本还是空的，先去文章里收录一些词。')
    } else if (plan.more) {
      doneText = `今天已完成 ${doneCount} 条，达到每日目标；还有 ${plan.more} 条到期内容留到明天。`
    } else if (plan.rest) {
      doneText = `今天的目标完成了。还想多练一点，可以再复习一批。`
    } else if (stats.nextCount) {
      doneText = `按 1 / 3 / 7 / 15 / 30 / 90 / 180 天的曲线，${stats.nextLabel}有 ${stats.nextCount} 条到期。`
    } else {
      doneText = '新收录的条目会在明天进入第一次复习，还没到期就先不用管它。'
    }
    this.setData({
      queue,
      total,
      index: 0,
      doneCount,
      target: plan.target,
      targetBase: plan.batch,
      targetOptions: review.TARGET_OPTIONS[kind],
      batch: plan.batch,
      moreCount: plan.more,
      restCount: plan.rest,
      percent: total ? Math.round((doneCount / total) * 100) : 0,
      current: queue[0] || null,
      revealed: false,
      sentence: '',
      sentenceZh: '',
      curveOpen: false,
      done: !queue.length,
      desc: grammar
        ? '只快速过一遍讲解：先读原句，再点「显示讲解」回忆句型和用法；不考书写，忘了也不会清零。'
        : (tab === 'phrase'
          ? '快速回忆以前记过的词组，只回忆意思，无需拼写；忘了也不会清零。'
          : '快速回忆以前记过的单词，只回忆意思，无需拼写；忘了也不会清零。'),
      doneTitle: (grammar && this.data.grammarError)
        ? '语法本没加载出来'
        : (plan.more
          ? '今天的复习目标完成了'
          : (grammar
            ? '今天到期的语法都复习完了'
            : (tab === 'phrase' ? '今天到期的词组都复习完了' : '今天到期的词汇都复习完了'))),
      doneText
    }, () => this.scrollTop())
  },

  // 顶部直接改每日复习量：单词、词组、语法各记各的，改完立刻按新目标重排
  pickTarget(event) {
    const value = Number(event.currentTarget.dataset.value)
    review.setTarget(this.data.tab, value)
    this.buildQueue()
  },

  // 选了大数字却不满时不是 bug：词库总量不够、今天已复习过一部分，都会让实际条数变少
  showTargetHelp() {
    const book = this.data.tab === 'grammar'
      ? '语法本'
      : (this.data.tab === 'phrase' ? '词组本' : '生词本')
    wx.showModal({
      title: `每日 ${this.data.targetBase} 条怎么来的`,
      content: `这里设置的是每天的复习目标。如果${book}里可复习的内容不足 ${this.data.targetBase} 条，或今天已经复习过一部分，实际数量就会少于目标；还没到期的内容会按最近的先补上，新收录的内容第二天才进入复习。`,
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 今天还想多复习一点：只给今天加一批额度，不改变平时设置的目标
  boost() {
    review.boostCap(this.data.tab)
    this.buildQueue()
  },

  switchTab(event) {
    const tab = event.currentTarget.dataset.tab
    if (tab === this.data.tab || ['word', 'phrase', 'grammar'].indexOf(tab) < 0) return
    this.setData({ tab }, () => this.buildQueue())
  },

  // 换到下一张卡时回到页面顶部，卡片内容不会被上次的滚动位置截掉
  scrollTop() {
    if (typeof wx.pageScrollTo !== 'function') return
    wx.pageScrollTo({ scrollTop: 0, duration: 160, fail: () => {} })
  },

  // 先让用户自己回忆，点开释义后才出现自评按钮，避免瞄到答案误判「认识」
  reveal() {
    if (this.data.revealed || !this.data.current) return
    this.setData({ revealed: true }, () => this.loadSentence())
  },

  // 看答案后补例句：先用本地缓存，缺的再让模型写一条；只在单词卡上做
  loadSentence() {
    const current = this.data.current
    if (!current || this.data.tab !== 'word') return
    const word = current.word
    const sentence = sentences.get(word)
    const zh = sentences.getZh(word)
    this.setData({ sentence, sentenceZh: zh })
    if (sentence && zh) return
    sentences.prefetch([{ word }]).then(() => {
      const now = this.data.current
      if (!now || now.id !== current.id) return
      this.setData({ sentence: sentences.get(word), sentenceZh: sentences.getZh(word) })
    }).catch(() => {})
  },

  previewDrawing(event) {
    const path = (event && event.currentTarget && event.currentTarget.dataset.path) || ''
    if (!path) return
    wx.previewImage({ urls: [path] })
  },

  // 删掉当前卡片的草图，之后可以重新画
  removeDrawing() {
    const current = this.data.current
    if (!current || !current.id || this.data.tab === 'grammar') return
    wx.showModal({
      title: '删掉这张画？',
      content: '只删除这张草图，单词还留在词库里。',
      confirmText: '删掉',
      confirmColor: '#b23b30',
      success: (res) => {
        if (!res.confirm) return
        drawings.remove(current.id)
        const queue = (this.data.queue || []).map((item) => (
          item.id === current.id ? Object.assign({}, item, { drawingPath: '' }) : item
        ))
        this.setData({ queue, 'current.drawingPath': '' })
        wx.showToast({ title: '已删掉', icon: 'none' })
      }
    })
  },

  // 忘了的词当场画一笔，下次复习就能用自己的图回忆
  goDraw() {
    const current = this.data.current
    if (!current || !current.id || this.data.tab === 'grammar') return
    const meaning = (current.meanings || [])
      .map((item) => item && item.definition)
      .filter(Boolean)
      .join('；')
      .slice(0, 40)
    wx.navigateTo({
      url: `/pkgWords/pages/draw/index?id=${encodeURIComponent(current.id)}&word=${encodeURIComponent(current.word)}&meaning=${encodeURIComponent(meaning)}`
    })
  },

  toggleCurve() {
    this.setData({ curveOpen: !this.data.curveOpen })
  },

  // 三档复习：不认识 / 模糊 / 认识。
  // 档位由系统自动升降，用户不需要手动把词「搬进记得」，一直不点也不会卡死。
  mark(event) {
    if (this.data.busy || !this.data.current) return
    const result = event.currentTarget.dataset.result
    if (['unknown', 'fuzzy', 'known'].indexOf(result) < 0) return
    // 还没看答案时先展开释义，避免瞄一眼就自评；再点一次才真正记录
    if (!this.data.revealed) {
      this.setData({ revealed: true })
      wx.showToast({ title: '答案已展开，再点一次确认', icon: 'none' })
      return
    }
    const current = this.data.current
    this.setData({ busy: true })

    const outcome = review.advance(current.id, current, result, current.kind === 'grammar' ? GRAMMAR_OPTIONS : undefined)

    // 档位升到「已掌握」或掉回「学习中」时，同步词库标签，不同步排期；语法本没有状态标签
    if (current.kind !== 'grammar' && outcome.mastered !== (current.state === 'known')) {
      wordbook.setState(current.id, outcome.mastered ? 'known' : 'unknown').catch(() => {})
    }

    const finish = () => {
      const queue = this.data.queue.slice()
      let total = this.data.total
      // 不认识的词当天再出现一次，第二次就不再重复插队，避免死循环
      if (result === 'unknown' && !current.relearned) {
        const days = review.INTERVALS[outcome.stage]
        queue.push(Object.assign({}, current, {
          relearned: true,
          stage: outcome.stage,
          due: outcome.due,
          streak: outcome.streak,
          reviewNo: outcome.stage + 1,
          interval: days,
          intervalLabel: review.intervalLabel(days),
          when: review.whenLabel(days),
          curve: review.curveOf(outcome.stage)
        }))
        total += 1
      }
      const index = this.data.index + 1
      const nextWord = queue[index] || null
      const doneCount = this.data.doneCount + 1
      this.setData({
        busy: false,
        queue,
        total,
        index,
        doneCount,
        percent: total ? Math.round((doneCount / total) * 100) : 0,
        current: nextWord,
        revealed: false,
        sentence: '',
        sentenceZh: '',
        curveOpen: false,
        done: !nextWord
      }, () => this.scrollTop())
    }

    finish()
  },

  goWordbook() {
    const pages = getCurrentPages()
    if (pages.length > 1) wx.navigateBack()
    else if (this.data.tab === 'grammar') wx.redirectTo({ url: '/pkgGrammar/pages/grammarbook/index' })
    else if (this.data.tab === 'phrase') wx.redirectTo({ url: '/pages/phrasebook/index' })
    else wx.redirectTo({ url: '/pkgWords/pages/wordbook/index' })
  }
})
