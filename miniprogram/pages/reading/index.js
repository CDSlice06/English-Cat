const study = require('../../services/study')
const wordbook = require('../../services/wordbook')
const grammarbook = require('../../services/grammarbook')
const checkin = require('../../services/checkin')
const journals = require('../../services/journals')
const shareCard = require('../../services/shareCard')
const { startReadingArticle } = require('../../services/article')
const { DICT_CACHE_VERSION } = require('../../config/version')
const { errorMessage } = require('../../utils/error')

const TARGET = study.READING_TARGET_SECONDS
// 连续这么久没碰屏幕就算走神，计时暂停，动一下再继续
const IDLE_LIMIT = 60 * 1000
const CLOUD_SYNC_EVERY = 30
// 长难句只收够长的句子；太短的句子不参与标注
const GRAMMAR_MIN_WORDS = 14
// 词组标注的最长词数，超过就认为匹配不可信，不标正文
const PHRASE_MAX_WORDS = 8
// 正文词典预取：进页面就批量查一次，点词时直接出释义
// 缓存键带词库版本：词库释义修正后旧缓存自动失效，不会一直显示旧释义
const DICT_CACHE_PREFIX = `readingDict_${DICT_CACHE_VERSION}_`
const DICT_PREFETCH_LIMIT = 300
// 阅读位置记住，下次打开直接回到上次读到的位置
const READ_POS_PREFIX = 'readingPos_'
// 每日计划的阅读任务：今天累计读外刊满 15 分钟自动打勾（跨文章累加）
const JOURNAL_CHECKIN_SECONDS = TARGET
const JOURNAL_DAY_KEY = 'journalDaySeconds'

function dayKeyOf(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function readJournalDaySeconds() {
  try {
    const saved = wx.getStorageSync(JOURNAL_DAY_KEY)
    if (!saved || saved.key !== dayKeyOf(new Date())) return 0
    return Math.max(0, Number(saved.seconds) || 0)
  } catch (error) {
    return 0
  }
}

function storeJournalDaySeconds(seconds) {
  try {
    wx.setStorageSync(JOURNAL_DAY_KEY, {
      key: dayKeyOf(new Date()),
      seconds: Math.max(0, Math.floor(seconds) || 0)
    })
  } catch (error) {}
}

// 三遍阅读：纯读 → 精读 → 复盘
const READING_MODES = {
  plain: {
    showTranslation: false,
    showPhrases: false,
    showGrammar: false,
    hint: '纯读：先读英文，生词点一下'
  },
  study: {
    showTranslation: false,
    showPhrases: true,
    showGrammar: true,
    hint: '精读：拆词组和长难句'
  },
  review: {
    showTranslation: true,
    showPhrases: false,
    showGrammar: false,
    hint: '复盘：对照中文检查理解'
  }
}
const READING_MODE_KEY = 'readingMode'
const READING_DISPLAY_KEY = 'readingDisplay'
const FONT_SIZES = ['sm', 'md', 'lg']
const DEFAULT_DISPLAY = { fontSize: 'md', lineHeight: 'normal', night: false }

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 与预览页、云端同一套切段规则：空行分段，段内折行合并
function splitParagraphs(text) {
  return String(text || '')
    .split(/\n{2,}/)
    .map((block) => block.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function normalizeWord(value) {
  return String(value || '').trim().toLowerCase().replace(/[’]/g, "'")
}

function countWords(text) {
  return (String(text || '').match(/[A-Za-z][A-Za-z'-]*/g) || []).length
}

function formatTime(seconds) {
  const safe = Math.max(0, Math.floor(seconds) || 0)
  const mm = Math.floor(safe / 60)
  const ss = safe % 60
  return `${mm < 10 ? '0' : ''}${mm}:${ss < 10 ? '0' : ''}${ss}`
}

function metaLine(article) {
  const label = article.origin === 'journal' ? '英语外刊' : '我的导入'
  const source = article.source ? ` · ${article.source}` : ''
  const words = article.wordCount || countWords(article.ocrText)
  return `${label}${source} · ${words} 词`
}

// 一段一段收起译文：fullTranslation 里每句带 para，按段落拼接
function translationOf(sentences) {
  const buckets = []
  ;(Array.isArray(sentences) ? sentences : []).forEach((item) => {
    const index = Number(item && item.para) || 0
    if (!buckets[index]) buckets[index] = []
    if (item && item.zh) buckets[index].push(item.zh)
  })
  return buckets.map((list) => (list || []).join(''))
}

// 词组只标真正的短语本体：
// 关联连词（not only … but also）的 matched 会跨掉半句话，只取首尾两小段；
// 其它含省略号、或匹配长度离谱的搭配不标正文，避免整句被涂色
function phraseAnchors(item) {
  const canonical = String((item && (item.phrase || item.canonical)) || '').trim()
  const matched = String((item && item.matched) || '').trim()
  if (canonical.indexOf('…') >= 0) {
    return canonical.split('…')
      .map((part) => part.trim())
      .filter((part) => countWords(part) >= 2)
  }
  if (!matched || countWords(matched) > PHRASE_MAX_WORDS) return []
  return [matched]
}

// 句尾标签只显示最核心的句型名，太长会把正文挤乱
const GRAMMAR_LABELS = [
  ['定语从句', /定语从句|relative/i],
  ['名词从句', /名词性从句|主语从句|表语从句|宾语从句|同位语从句/],
  ['状语从句', /状语从句/],
  ['并列句', /并列/],
  ['倒装', /倒装/],
  ['强调句', /强调/],
  ['被动', /被动/],
  ['虚拟', /虚拟/],
  ['完成时', /完成时|完成进行/],
  ['进行时', /进行时/],
  ['将来时', /将来/],
  ['比较', /比较级|最高级|比较/],
  ['非谓语', /分词|动名词|不定式/],
  ['插入语', /插入语/],
  ['省略', /省略/],
  ['独立主格', /独立主格|absolute/i],
  ['There be', /there\s*be/i],
  ['形式主语', /形式主语|形式宾语/],
  ['情态', /情态/],
  ['让步', /让步/],
  ['条件', /条件/],
  ['目的', /目的/],
  ['原因', /原因/],
  ['时间', /时间/],
  ['主谓一致', /主谓一致/]
]

function grammarShortLabel(point) {
  if (!point) return '长句'
  const text = `${point.pattern || ''} ${point.label || ''} ${point.key || ''}`
  for (let i = 0; i < GRAMMAR_LABELS.length; i += 1) {
    if (GRAMMAR_LABELS[i][1].test(text)) return GRAMMAR_LABELS[i][0]
  }
  const raw = String(point.pattern || '').replace(/[（(].*?[）)]/g, '').trim()
  return raw.slice(0, 6) || '长句'
}

// 短句不参与长难句标注，同一句只保留一个语法点
function grammarPointsOf(list) {
  const seen = new Set()
  return (Array.isArray(list) ? list : []).filter((item) => {
    if (!item || !item.id || !item.sentence) return false
    if (countWords(item.sentence) < GRAMMAR_MIN_WORDS) return false
    const key = String(item.sentence).replace(/\s+/g, ' ').trim().toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function modeState(mode) {
  const key = READING_MODES[mode] ? mode : 'study'
  const config = READING_MODES[key]
  return {
    mode: key,
    showTranslation: config.showTranslation,
    showPhrases: config.showPhrases,
    showGrammar: config.showGrammar
  }
}

function displayClassOf(display) {
  const config = display || DEFAULT_DISPLAY
  return `fs-${config.fontSize} lh-${config.lineHeight}${config.night ? ' is-night' : ''}`
}

function readDisplaySettings() {
  try {
    const saved = wx.getStorageSync(READING_DISPLAY_KEY)
    if (saved && typeof saved === 'object') {
      return {
        fontSize: FONT_SIZES.indexOf(saved.fontSize) >= 0 ? saved.fontSize : DEFAULT_DISPLAY.fontSize,
        lineHeight: saved.lineHeight === 'loose' ? 'loose' : 'normal',
        night: !!saved.night
      }
    }
  } catch (error) {}
  return Object.assign({}, DEFAULT_DISPLAY)
}

function savedMode() {
  try {
    const saved = wx.getStorageSync(READING_MODE_KEY)
    if (READING_MODES[saved]) return saved
  } catch (error) {}
  return ''
}

// 在段落里找词组的真实出现位置，标在字符上，渲染时按 token 上色
function markRanges(text, source, id, marks) {
  const needle = String(source || '').trim()
  if (!needle || !text) return []
  const pattern = escapeRegExp(needle).replace(/\\?\s+/g, '\\s+')
  const reg = new RegExp(`(^|[^A-Za-z])(${pattern})(?=[^A-Za-z]|$)`, 'gi')
  const found = []
  let match = reg.exec(text)
  while (match) {
    const start = match.index + match[1].length
    const end = start + match[2].length
    let free = true
    for (let i = start; i < end; i += 1) {
      if (marks[i]) { free = false; break }
    }
    if (free) {
      for (let i = start; i < end; i += 1) marks[i] = id
      found.push({ start, end })
    }
    reg.lastIndex = Math.max(reg.lastIndex, end)
    match = reg.exec(text)
  }
  return found
}

Page({
  data: {
    loading: true,
    error: '',
    title: '',
    metaLine: '',
    paragraphs: [],
    elapsedText: '00:00',
    percent: 0,
    positionPercent: 0,
    targetText: '15:00',
    targetMinutes: 15,
    finished: false,
    paused: false,
    pauseReason: '',
    mode: 'study',
    modeHint: READING_MODES.study.hint,
    showTranslation: false,
    showPhrases: true,
    showGrammar: true,
    translationLoading: false,
    translationError: '',
    display: DEFAULT_DISPLAY,
    displayClass: displayClassOf(DEFAULT_DISPLAY),
    showSummary: false,
    summary: null,
    guide: null,
    guideOpen: false,
    nextArticle: null,
    nexting: false,
    panel: null,
    panelSaving: false
  },

  onLoad(options) {
    this.seconds = 0
    this.timer = null
    this.idleTimer = null
    this.syncing = false
    this.lastSynced = 0
    this.lookupSeq = 0
    this.loaded = false
    this.dictMap = {}
    this.scrollTop = 0
    this.scrollTimer = null
    this.journalMarked = checkin.didToday('journal')
    // 今天已经在外刊里读过的秒数，跨文章累加，满 15 分钟给每日计划打勾
    this.dayKey = dayKeyOf(new Date())
    this.daySeconds = readJournalDaySeconds()
    // 从外刊栏点进来时带 id：只读这篇，不改动当前文章
    this.readId = (options && options.id) ? String(options.id) : ''
    this.unitVersion = 0

    // 用户手动切过模式就记住；没切过时外刊默认纯读、真题默认精读
    this.modeChosen = savedMode()
    const mode = this.modeChosen || 'study'
    const display = readDisplaySettings()
    this.setData(Object.assign({
      modeHint: READING_MODES[mode].hint,
      display,
      displayClass: displayClassOf(display)
    }, modeState(mode)))
    this.loadPage()
  },

  onShow() {
    if (this.loaded && !this.data.finished) this.resume()
  },

  onPageScroll(event) {
    this.scrollTop = Math.max(0, Number(event && event.scrollTop) || 0)
    this.updatePosition()
    if (this.scrollTimer) return
    this.scrollTimer = setTimeout(() => {
      this.scrollTimer = null
      this.persistScroll()
    }, 400)
  },

  onHide() {
    this.pause('hidden')
    this.flushReading()
    this.persistScroll()
  },

  onUnload() {
    this.pause('hidden')
    this.flushReading()
    this.persistScroll()
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer)
      this.scrollTimer = null
    }
  },

  persistScroll() {
    if (!this.article || !this.article._id) return
    try {
      wx.setStorageSync(`${READ_POS_PREFIX}${this.article._id}`, Math.max(0, Math.round(this.scrollTop || 0)))
    } catch (error) {}
  },

  restoreScroll() {
    if (!this.article || !this.article._id) return
    let saved = 0
    try {
      saved = Number(wx.getStorageSync(`${READ_POS_PREFIX}${this.article._id}`)) || 0
    } catch (error) {}
    if (saved < 80) return
    wx.pageScrollTo({ scrollTop: saved, duration: 0 })
  },

  // 量一次正文总高：页面滚动没法直接拿到总高度，用根节点高度减视口高度
  measureScroll() {
    const query = wx.createSelectorQuery()
    query.select('.reading-page').boundingClientRect()
    query.selectViewport().height()
    query.exec((res) => {
      const rect = res && res[0]
      this.contentHeight = Math.max(0, (rect && rect.height) || 0)
      this.viewHeight = Math.max(0, Number(res && res[1]) || 0)
      this.updatePosition()
    })
  },

  // 顶部进度按「读到文章哪儿」算，比纯计时更符合直觉
  updatePosition() {
    if (!this.contentHeight || !this.viewHeight) return
    const max = this.contentHeight - this.viewHeight
    const percent = max <= 0
      ? 0
      : Math.max(0, Math.min(100, Math.round((this.scrollTop || 0) / max * 100)))
    if (percent === this.data.positionPercent) return
    this.setData({ positionPercent: percent })
  },

  loadPage() {
    this.setData({ loading: true, error: '' })
    // 带 id 进来时按 id 读这篇外刊：不切换当前文章，也不动主线
    const loader = this.readId ? study.readReadingArticle(this.readId) : study.loadStudy()
    loader.then((state) => {
      const article = state && state.article
      const unit = (state && state.unit) || {}
      if (!article) throw new Error('还没选中要读的文章')
      // 四六级题库文章仍走四站，这里只负责外刊与用户导入
      if (!study.isReadingArticle(article)) {
        wx.switchTab({ url: '/pages/workbench/index' })
        return
      }
      if (!String(article.ocrText || '').trim()) throw new Error('这篇文章还没有正文')

      this.article = article
      this.unitData = article.unitData || {}
      this.loaded = true
      this.seconds = study.readReadingSeconds(article._id, unit)
      this.unitVersion = Math.max(0, Number(unit.version) || 0)
      this.lastSynced = Math.max(0, Number(unit.readingSeconds) || 0)
      this.translationApplied = false
      this.lookupSeq = 0
      this.vocabMap = this.buildVocabMap()
      this.dictMap = this.readDictCache(article._id)
      this.phraseById = this.indexById(this.unitData.phrases)
      this.grammarById = this.indexById(this.unitData.grammarPoints)
      this.grammarList = grammarPointsOf(this.unitData.grammarPoints)
      this.translation = translationOf(this.unitData.fullTranslation)

      // 外刊读完可以顺着往下读，不用退回列表再找
      this.nextJournal = null
      if (article.origin === 'journal' && article.source) {
        const current = journals.findById(article.bankId) || journals.findBySource(article.source)
        this.nextJournal = current ? journals.nextOf(current.id) : null
      }

      // 读前导读：中文摘要 + 一个带着读的问题
      const meta = article.origin === 'journal' && article.source
        ? (journals.findById(article.bankId) || journals.findBySource(article.source))
        : null
      // 先把这篇的封面换成 https，分享时直接用
      if (meta) shareCard.prefetch([meta])
      const guide = meta && meta.summary ? {
        zhTitle: meta.zhTitle || '',
        summary: meta.summary || '',
        question: meta.topic
          ? `读之前先想一想：作者会从哪个角度谈「${meta.topic}」？读完后回来对一下。`
          : ''
      } : null

      // 计时目标固定 15 分钟；卡片上的「约 X 分钟」只是阅读时长预期
      this.target = TARGET
      const finished = this.seconds >= this.target
      // 外刊默认纯读；用户手动切过就按用户的选择
      const mode = this.modeChosen || (article.origin === 'journal' ? 'plain' : 'study')
      this.modeChosen = mode
      const modeData = modeState(mode)
      this.setData(Object.assign({
        loading: false,
        title: article.title || '未命名文章',
        metaLine: metaLine(article),
        paragraphs: this.buildParagraphs(),
        modeHint: READING_MODES[modeData.mode].hint,
        finished,
        targetText: formatTime(this.target),
        targetMinutes: Math.max(1, Math.round(this.target / 60)),
        positionPercent: 0,
        nextArticle: this.nextJournal ? {
          id: this.nextJournal.id,
          zhTitle: this.nextJournal.zhTitle || this.nextJournal.title,
          minutes: Math.max(1, Math.round((Number(this.nextJournal.words) || 0) / 180))
        } : null,
        guide,
        guideOpen: !!guide,
        nexting: false,
        panel: null
      }, modeData, this.timerView(this.seconds)), () => {
        // 等正文铺开后再回到上次读到的位置，顺便量一次页面高度
        setTimeout(() => {
          this.restoreScroll()
          this.measureScroll()
        }, 60)
      })

      this.prefetchDict()
      if (modeData.showTranslation) this.ensureTranslation()
      // 上次离线读的时间可能还没进云端，打开时补一次
      if (this.seconds > this.lastSynced) this.syncCloud(true)
      if (!finished) {
        this.resume()
        this.resetIdle()
      }
    }).catch((error) => {
      this.setData({ loading: false, error: errorMessage(error) })
    })
  },

  retry() {
    this.loadPage()
  },

  buildVocabMap() {
    const map = {}
    ;(this.unitData.vocabulary || []).forEach((item) => {
      if (!item) return
      const forms = item.forms && typeof item.forms === 'object' ? Object.keys(item.forms).map((key) => item.forms[key]) : []
      ;[item.word].concat(forms).forEach((form) => {
        const key = normalizeWord(form)
        if (key && !map[key]) map[key] = item
      })
    })
    return map
  },

  indexById(list) {
    const map = {}
    ;(Array.isArray(list) ? list : []).forEach((item) => {
      if (item && item.id) map[item.id] = item
    })
    return map
  },

  buildParagraphs() {
    const text = String(this.article.ocrText || '')
    const phrases = this.unitData.phrases || []
    const grammarPoints = this.grammarList || grammarPointsOf(this.unitData.grammarPoints)
    return splitParagraphs(text).map((block, index) => {
      const phraseAt = new Array(block.length).fill('')
      phrases.forEach((item) => {
        if (!item || !item.id) return
        phraseAnchors(item).forEach((anchor) => {
          markRanges(block, anchor, item.id, phraseAt)
        })
      })

      // 长难句用「句下细线 + 句尾句型标签」标注：
      // 细线只画出句子范围，不铺背景；标签写清是什么结构，比一个「语」字更有信息量
      const grammarAt = new Array(block.length).fill('')
      const grammarSpan = new Array(block.length).fill('')
      grammarPoints.forEach((item) => {
        const marks = new Array(block.length).fill('')
        markRanges(block, item.sentence, item.id, marks).forEach((range) => {
          for (let i = range.start; i < range.end; i += 1) {
            if (!grammarSpan[i]) grammarSpan[i] = item.id
          }
          // 标在句末最后一个字符上，避免句号和空格被合并成一个 token 时找不到落点
          if (!grammarAt[range.end - 1]) grammarAt[range.end - 1] = item.id
        })
      })

      const tokens = []
      const reg = /([A-Za-z][A-Za-z'’-]*)|([^A-Za-z]+)/g
      let match = reg.exec(block)
      while (match) {
        const value = match[0]
        const start = match.index
        const end = start + value.length
        const isWord = !!match[1]
        let badge = ''
        let inGrammar = false
        for (let i = start; i < end; i += 1) {
          if (grammarAt[i]) badge = grammarAt[i]
          if (grammarSpan[i]) inGrammar = true
        }
        const point = badge ? (this.grammarById || {})[badge] : null
        tokens.push({
          text: value,
          isWord,
          phraseId: phraseAt[start] || '',
          inGrammar,
          badge,
          badgeLabel: badge ? grammarShortLabel(point) : ''
        })
        match = reg.exec(block)
      }
      return { tokens, zh: (this.translation || [])[index] || '' }
    })
  },

  readDictCache(articleId) {
    if (!articleId) return {}
    try {
      const saved = wx.getStorageSync(`${DICT_CACHE_PREFIX}${articleId}`)
      if (saved && saved.map && typeof saved.map === 'object') return saved.map
    } catch (error) {}
    return {}
  },

  storeDictCache() {
    if (!this.article || !this.article._id) return
    try {
      const map = {}
      Object.keys(this.dictMap || {}).slice(0, 400).forEach((key) => {
        const entry = this.dictMap[key]
        if (!entry || !Array.isArray(entry.meanings) || !entry.meanings.length) return
        map[key] = {
          word: entry.word || key,
          phonetic: entry.phonetic || '',
          meanings: entry.meanings.slice(0, 3)
        }
      })
      wx.setStorageSync(`${DICT_CACHE_PREFIX}${this.article._id}`, { at: Date.now(), map })
      // 只留最近 20 篇的词典缓存，避免读得越多本地存储越胀
      const keys = (wx.getStorageInfoSync().keys || []).filter((key) => key.indexOf(DICT_CACHE_PREFIX) === 0)
      if (keys.length > 20) {
        keys.map((key) => {
          const saved = wx.getStorageSync(key) || {}
          return { key, at: Number(saved.at) || 0 }
        }).sort((a, b) => a.at - b.at)
          .slice(0, keys.length - 20)
          .forEach((item) => wx.removeStorageSync(item.key))
      }
    } catch (error) {}
  },

  // 正文里没被解析成生词的词，进页面就批量查一次，点词时直接出释义，不再等云端
  prefetchDict() {
    if (!this.article) return
    const base = this.dictMap || {}
    const seen = new Set()
    const batch = []
    splitParagraphs(this.article.ocrText || '').forEach((block) => {
      ;(block.match(/[A-Za-z][A-Za-z'’-]*/g) || []).forEach((raw) => {
        const key = normalizeWord(raw)
        if (!key || seen.has(key) || this.vocabMap[key] || base[key]) return
        seen.add(key)
        if (batch.length < DICT_PREFETCH_LIMIT) batch.push(key)
      })
    })
    if (!batch.length) return
    wordbook.lookupBatch(batch).then((map) => {
      if (!map || !this.loaded) return
      Object.keys(map).forEach((key) => {
        if (map[key] && !this.dictMap[key]) this.dictMap[key] = map[key]
      })
      this.storeDictCache()
    })
  },

  timerView(seconds) {
    const target = this.target || TARGET
    const percent = seconds >= target ? 100 : Math.min(99, Math.floor((seconds / target) * 100))
    return {
      elapsedText: formatTime(Math.min(seconds, target)),
      percent
    }
  },

  // ---------- 计时 ----------
  // 今天累计读外刊满 15 分钟就给首页今日计划打勾；读几篇都算，同一篇读多久也只算一次。
  // 这里不记「study」，否则读外刊会把四站式精读任务误勾上
  markJournalRead() {
    if (this.journalMarked) return
    if (!this.article || this.article.origin !== 'journal') return
    if (this.daySeconds < JOURNAL_CHECKIN_SECONDS) return
    this.journalMarked = true
    checkin.mark('journal')
  },

  tick() {
    if (this.data.finished) return
    this.seconds += 1
    // 跨过零点就重新开始算今天：昨日累计清零，打卡也重新判一次
    const today = dayKeyOf(new Date())
    if (today !== this.dayKey) {
      this.dayKey = today
      this.daySeconds = 0
      this.journalMarked = checkin.didToday('journal')
    }
    const isJournal = !!(this.article && this.article.origin === 'journal')
    if (isJournal) this.daySeconds += 1
    this.markJournalRead()
    if (this.seconds % 5 === 0) {
      study.storeReadingSeconds(this.article._id, this.seconds)
      if (isJournal) storeJournalDaySeconds(this.daySeconds)
    }
    if (this.seconds % CLOUD_SYNC_EVERY === 0) this.syncCloud(false)
    this.setData(this.timerView(this.seconds))
    if (this.seconds >= (this.target || TARGET)) this.finish()
  },

  resume() {
    if (!this.loaded || this.data.finished) return
    if (!this.timer) this.timer = setInterval(() => this.tick(), 1000)
    if (this.data.paused || this.data.pauseReason) {
      this.setData({ paused: false, pauseReason: '' })
    }
    this.resetIdle()
  },

  pause(reason) {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    if (this.idleTimer) {
      clearTimeout(this.idleTimer)
      this.idleTimer = null
    }
    if (this.data.pauseReason === reason) return
    this.setData({ paused: true, pauseReason: reason || 'idle' })
  },

  resetIdle() {
    if (this.idleTimer) clearTimeout(this.idleTimer)
    this.idleTimer = null
    if (!this.loaded || this.data.finished || this.data.paused) return
    this.idleTimer = setTimeout(() => {
      this.pause('idle')
    }, IDLE_LIMIT)
  },

  onUserTouch() {
    if (!this.loaded || this.data.finished) return
    if (this.data.paused && this.data.pauseReason === 'idle') this.resume()
    else this.resetIdle()
  },

  buildSummary() {
    return {
      vocab: (this.unitData.vocabulary || []).length,
      phrases: (this.unitData.phrases || []).length,
      grammar: (this.grammarList || grammarPointsOf(this.unitData.grammarPoints)).length
    }
  },

  finish() {
    if (!this.article || this.data.finished) return
    this.pause('finished')
    study.storeReadingSeconds(this.article._id, this.seconds)
    if (this.article.origin === 'journal') storeJournalDaySeconds(this.daySeconds)
    this.setData({
      finished: true,
      paused: false,
      pauseReason: '',
      percent: 100,
      elapsedText: formatTime(this.target || TARGET),
      showSummary: true,
      summary: this.buildSummary()
    })
    this.syncCloud(true)
    wx.showToast({ title: `读满 ${this.data.targetMinutes} 分钟，这篇学完啦`, icon: 'none' })
  },

  closeSummary() {
    this.setData({ showSummary: false })
  },

  toggleGuide() {
    this.setData({ guideOpen: !this.data.guideOpen })
  },

  // 读完后直接切到复盘模式，从开头对照中文再过一遍
  reviewAfterDone() {
    this.setData({ showSummary: false })
    this.applyMode('review', false)
    wx.pageScrollTo({ scrollTop: 0, duration: 0 })
  },

  flushReading() {
    if (!this.article) return
    study.storeReadingSeconds(this.article._id, this.seconds)
    if (this.article.origin === 'journal') storeJournalDaySeconds(this.daySeconds)
    this.syncCloud(true)
  },

  syncCloud(force) {
    if (!this.article || this.syncing) return
    const target = Math.min(86400, this.seconds)
    if (!force && target - this.lastSynced < CLOUD_SYNC_EVERY) return
    if (target <= this.lastSynced) return
    this.syncing = true
    const ok = () => {
      this.lastSynced = target
      this.syncing = false
    }
    const fail = (error) => {
      if (error && error.code === 409 && this.readId) {
        // 外刊按 id 读：版本对不上就重新取一次单元版本再写
        study.readReadingArticle(this.readId)
          .then((state) => {
            this.unitVersion = Number(state && state.unit && state.unit.version) || this.unitVersion
            return study.updateReading(this.readId, this.unitVersion, { readingSeconds: target })
          })
          .then(ok, () => { this.syncing = false })
        return
      }
      if (error && error.code === 409) {
        // 云端进度被别的页面更新过：拉一次最新版本再写，失败也不影响阅读
        study.loadStudy(true)
          .then(() => study.updateStudy({ readingSeconds: target }))
          .then(ok, () => { this.syncing = false })
        return
      }
      this.syncing = false
    }
    if (this.readId) {
      study.updateReading(this.readId, this.unitVersion, { readingSeconds: target }).then(ok, fail)
      return
    }
    study.updateStudy({ readingSeconds: target }).then(ok, fail)
  },

  // ---------- 三遍阅读 / 显示设置 ----------
  setMode(e) {
    this.applyMode(e.currentTarget.dataset.mode, true)
  },

  applyMode(mode, notify) {
    const key = READING_MODES[mode] ? mode : 'study'
    const config = READING_MODES[key]
    // 手动切过就不再按文章类型给默认值
    this.modeChosen = key
    this.setData(Object.assign({ modeHint: config.hint }, modeState(key)))
    try {
      wx.setStorageSync(READING_MODE_KEY, key)
    } catch (error) {}
    if (config.showTranslation) this.ensureTranslation()
    this.onUserTouch()
    if (notify && wx.showToast) wx.showToast({ title: config.hint, icon: 'none' })
  },

  openDisplay() {
    this.onUserTouch()
    this.setData({ panel: { type: 'display', title: '阅读显示' }, panelSaving: false })
  },

  updateDisplay(patch) {
    const display = Object.assign({}, this.data.display, patch)
    this.setData({ display, displayClass: displayClassOf(display) })
    try {
      wx.setStorageSync(READING_DISPLAY_KEY, display)
    } catch (error) {}
    // 字号/行距一变，正文高度就变了，进度要重新量
    setTimeout(() => this.measureScroll(), 60)
  },

  setFontSize(e) {
    const value = e.currentTarget.dataset.v
    if (FONT_SIZES.indexOf(value) >= 0) this.updateDisplay({ fontSize: value })
  },

  setLineHeight(e) {
    this.updateDisplay({ lineHeight: e.currentTarget.dataset.v === 'loose' ? 'loose' : 'normal' })
  },

  toggleNight() {
    this.updateDisplay({ night: !this.data.display.night })
  },

  ensureTranslation() {
    if (this.data.translationLoading) return
    if (this.translationApplied) return
    const cached = this.unitData.fullTranslation
    // 旧译文没有段落序号时，多段文章交给云端重新分段翻译，避免整篇中文挤在第一段
    const hasParagraph = Array.isArray(cached) && cached.some((item) => item && typeof item.para === 'number')
    if (Array.isArray(cached) && cached.length && (hasParagraph || this.data.paragraphs.length <= 1)) {
      this.applyTranslation(cached)
      // 本地这份可能是早先只翻译了一半的旧版本：后台问一次云端，更全就替换
      this.refreshTranslation(cached)
      return
    }
    this.setData({ translationLoading: true, translationError: '' })
    study.loadFullTranslation(this.article._id).then((data) => {
      const sentences = Array.isArray(data && data.sentences) ? data.sentences : []
      if (!sentences.length) throw new Error('这篇暂时没有生成译文')
      this.unitData.fullTranslation = sentences
      this.applyTranslation(sentences)
    }).catch((error) => {
      this.setData({ translationLoading: false, translationError: errorMessage(error) })
    })
  },

  // 静默补全：本地译文先铺画面，云端有更完整的版本时无感替换，不打扰阅读
  refreshTranslation(local) {
    if (this.translationRefreshing) return
    this.translationRefreshing = true
    const localList = Array.isArray(local) ? local : []
    const localChars = localList.reduce((sum, item) => sum + String((item && item.zh) || '').length, 0)
    study.loadFullTranslation(this.article._id).then((data) => {
      const sentences = Array.isArray(data && data.sentences) ? data.sentences : []
      const chars = sentences.reduce((sum, item) => sum + String((item && item.zh) || '').length, 0)
      // 旧版长句会被截成半句：句数没少、但中文明显更全时也要替换
      if (sentences.length > localList.length
        || (sentences.length === localList.length && chars > localChars)) {
        this.unitData.fullTranslation = sentences
        this.applyTranslation(sentences)
      }
    }).catch(() => {})
  },

  loadTranslation() {
    this.setData({ translationError: '' })
    this.ensureTranslation()
  },

  applyTranslation(sentences) {
    this.translation = translationOf(sentences)
    this.translationApplied = true
    const paragraphs = (this.data.paragraphs || []).map((para, index) => Object.assign({}, para, {
      zh: this.translation[index] || ''
    }))
    this.setData({ paragraphs, translationLoading: false, translationError: '' })
    // 译文展开后页面变长，重新量一次，位置进度才不会虚高
    setTimeout(() => this.measureScroll(), 60)
  },

  // ---------- 点词 / 词组 / 长难句 ----------
  tapToken(e) {
    const pi = Number(e.currentTarget.dataset.p)
    const ti = Number(e.currentTarget.dataset.t)
    const para = (this.data.paragraphs || [])[pi]
    const token = para && para.tokens && para.tokens[ti]
    if (!token) return
    if (token.isWord) return this.openWord(token.text, token.phraseId)
    if (token.phraseId && this.data.showPhrases) return this.openPhrase(token.phraseId)
  },

  openWord(surface, phraseId) {
    const key = normalizeWord(surface)
    const item = this.vocabMap[key] || (this.dictMap || {})[key] || null
    const related = phraseId ? this.phraseById[phraseId] : null
    this.lookupSeq += 1
    const seq = this.lookupSeq
    const panel = {
      type: 'word',
      title: item ? item.word : String(surface || '').replace(/[’']s$/i, ''),
      phonetic: item ? item.phonetic || '' : '',
      meanings: item && Array.isArray(item.meanings) ? item.meanings.slice(0, 5) : [],
      // 近义：预取接口给的是单词数组，单查接口给的是 { w, pos, def }，这里统一成单词
      synonyms: (item && Array.isArray(item.synonyms) ? item.synonyms : [])
        .map((syn) => (typeof syn === 'string' ? syn : (syn && syn.w)))
        .filter(Boolean),
      loading: !item,
      empty: false,
      phrase: related ? {
        phrase: related.phrase || '',
        meaning: related.meaning || '',
        // 关联连词的 matched 可能横跨半句，收藏时只留短的本体
        matched: countWords(related.matched) <= PHRASE_MAX_WORDS ? related.matched || '' : '',
        added: false
      } : null,
      added: false
    }
    this.setData({ panel, panelSaving: false })
    if (item) return
    wordbook.lookup(surface).then((entry) => {
      if (seq !== this.lookupSeq || !this.data.panel) return
      if (!entry) {
        this.patchPanel({ loading: false, empty: true, meanings: [] })
        return
      }
      this.patchPanel({
        loading: false,
        empty: false,
        title: entry.word || panel.title,
        phonetic: entry.phonetic || '',
        meanings: Array.isArray(entry.meanings) ? entry.meanings.slice(0, 5) : [],
        synonyms: (Array.isArray(entry.synonyms) ? entry.synonyms : [])
          .map((syn) => (typeof syn === 'string' ? syn : (syn && syn.w)))
          .filter(Boolean)
      })
    })
  },

  // 点词卡上的近义词：直接换成那个词的词卡
  tapSynonym(e) {
    const word = String((e && e.currentTarget && e.currentTarget.dataset.word) || '').trim()
    if (word) this.openWord(word)
  },

  openPhrase(id) {
    const item = this.phraseById[id]
    if (!item) return
    this.lookupSeq += 1
    this.setData({
      panel: {
        type: 'phrase',
        title: item.phrase || '',
        meaning: item.meaning || '',
        note: item.note || '',
        sentence: item.sentence || item.matched || '',
        added: false
      },
      panelSaving: false
    })
  },

  openGrammar(e) {
    const point = this.grammarById[e.currentTarget.dataset.gid]
    if (!point) return
    this.lookupSeq += 1
    this.setData({
      panel: {
        type: 'grammar',
        gid: point.id,
        title: point.pattern || point.label || '长难句',
        meaning: point.understanding || '',
        translation: point.translation || '',
        sentence: point.sentence || '',
        chunks: Array.isArray(point.chunks) ? point.chunks.slice(0, 4) : [],
        steps: Array.isArray(point.steps) ? point.steps : [],
        added: false
      },
      panelSaving: false
    })
  },

  patchPanel(patch) {
    if (!this.data.panel) return
    this.setData({ panel: Object.assign({}, this.data.panel, patch) })
  },

  closePanel() {
    this.lookupSeq += 1
    this.setData({ panel: null, panelSaving: false })
  },

  // 读完直接接着下一篇：入库后原地 redirect，不把阅读页越堆越多
  openNext() {
    const next = this.nextJournal
    if (!next || this.data.nexting) return
    this.setData({ nexting: true })
    startReadingArticle(Object.assign({}, next, {
      kind: 'journal',
      origin: 'journal',
      source: `${next.source} · ${next.date}`
    })).then((id) => {
      wx.redirectTo({ url: `/pages/reading/index?id=${id}` })
    }).catch((error) => {
      this.setData({ nexting: false })
      wx.showToast({ title: errorMessage(error) || '下一篇没打开，稍后再试', icon: 'none' })
    })
  },

  noop() {},

  addPanel() {
    const panel = this.data.panel
    if (!panel || this.data.panelSaving || panel.added) return
    this.setData({ panelSaving: true })
    let task
    if (panel.type === 'word') {
      task = wordbook.addWord({
        word: panel.title,
        phonetic: panel.phonetic,
        meanings: panel.meanings,
        source: 'article',
        articleId: this.article._id
      })
    } else if (panel.type === 'phrase') {
      task = wordbook.addPhrase({
        phrase: panel.title,
        meaning: panel.meaning,
        matched: panel.sentence,
        note: panel.note,
        sentence: panel.sentence,
        source: 'article',
        articleId: this.article._id,
        articleTitle: this.article.title || ''
      })
    } else {
      task = grammarbook.addPoint(this.article._id, panel.gid)
    }
    task.then((result) => {
      this.setData({ panelSaving: false })
      this.patchPanel({ added: true })
      // 收进本子的生词计入今日计划「收 3 个生词」
      if (panel.type === 'word' && !(result && result.existed)) checkin.mark('collect')
      wx.showToast({ title: result && result.existed ? '已经在你的本子里了' : '已加入本子', icon: 'none' })
    }).catch((error) => {
      this.setData({ panelSaving: false })
      wx.showToast({ title: errorMessage(error), icon: 'none' })
    })
  },

  addRelatedPhrase() {
    const panel = this.data.panel
    if (!panel || !panel.phrase || panel.phrase.added) return
    const phrase = panel.phrase
    this.setData({ panelSaving: true })
    wordbook.addPhrase({
      phrase: phrase.phrase,
      meaning: phrase.meaning,
      matched: phrase.matched,
      source: 'article',
      articleId: this.article._id,
      articleTitle: this.article.title || ''
    }).then((result) => {
      this.setData({ panelSaving: false })
      this.patchPanel({ phrase: Object.assign({}, phrase, { added: true }) })
      wx.showToast({ title: result && result.existed ? '已经在词组本里了' : '已加入词组本', icon: 'none' })
    }).catch((error) => {
      this.setData({ panelSaving: false })
      wx.showToast({ title: errorMessage(error), icon: 'none' })
    })
  },

  // 分享走外刊 id：文章本身是按 openid 隔离的，把文章 id 发给别人会打不开
  journalShare() {
    const article = this.article
    return article && article.origin === 'journal'
      ? (journals.findById(article.bankId) || journals.findBySource(article.source))
      : null
  },

  onShareAppMessage() {
    const current = this.journalShare()
    if (current) return shareCard.shareOf(current)
    return {
      title: this.data.title || '每天读一篇外刊',
      path: '/pages/journal/index'
    }
  },

  onShareTimeline() {
    const current = this.journalShare()
    if (current) return shareCard.timelineOf(current)
    return {
      title: this.data.title || '每天读一篇外刊',
      query: ''
    }
  }
})
