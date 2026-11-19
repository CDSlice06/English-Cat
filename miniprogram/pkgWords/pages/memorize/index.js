const wordbook = require('../../../services/wordbook')
const checkin = require('../../../services/checkin')
const sentences = require('../../../services/sentences')
const drawings = require('../../../services/drawings')
const { playTapSound } = require('../../../utils/sound')
const { speakWord } = require('../../../utils/speech')

// 背诵模式：一个环节一个环节推进，顺序固定。
// 看词选义整组过完 → 听音选义 → 语境填词 → 看义拼写。
// 某个环节里答错的词，留到本环节最后再考一遍，直到这个环节全过才进下一个；
// 四个环节都通过了，这个词才从「不记得」变成「记得」。
const ROUND_SIZE = 20
// 每组数量可以自己填：最少 5 个，最多 100 个（也不超过「不记得」的总数）
const SIZE_MIN = 5
const SIZE_MAX = 100
const SIZE_KEY = 'memorizeSize'
const LOG_KEY = 'memorizeLog'
// 本轮进度：退出页面再回来能接着练，不用重新洗牌
const SESSION_KEY = 'memorizeSession'
// 题目结构变了就升版本，旧存档直接丢掉，避免按错误结构恢复
const SESSION_VERSION = 3

// 四个环节按固定顺序推进，每个环节都把整组词过一遍
const STAGES = [
  { key: 'read', label: '看词选义' },
  { key: 'listen', label: '听音选义' },
  { key: 'cloze', label: '语境填词' },
  { key: 'spell', label: '看义拼写' }
]

const STAGE_LABELS = STAGES.reduce((map, stage) => {
  map[stage.key] = stage.label
  return map
}, {})

// 一个环节的题目：整组词各一道，出场顺序打乱
function stageTasks(key, words) {
  return shuffle(words).map((item) => ({ item, key, done: false, wrong: false }))
}

// 四个环节依次排开：一个环节的词全过完了，才轮到下一个环节
function stagedTasks(words) {
  const tasks = []
  STAGES.forEach((stage) => {
    stageTasks(stage.key, words).forEach((task) => tasks.push(task))
  })
  return tasks
}

// 背诵模式分两类，环节一样，只是池子和文案不同
const TABS = [
  { key: 'word', label: '单词' },
  { key: 'phrase', label: '词组' }
]

// 拼写用自绘字母键盘，不挂系统输入框，真机上就不会有光标一闪一闪
const LETTER_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// 每组数量可以自己填：5–100，别处再按「不记得」的实际数量截断
function clampSize(value) {
  const size = Number(value)
  // 注意不能用 || ROUND_SIZE：减到 0 会被当成「没填」跳回 20
  if (!Number.isFinite(size)) return ROUND_SIZE
  return Math.min(Math.max(Math.round(size), SIZE_MIN), SIZE_MAX)
}

function readRoundSize() {
  try {
    const saved = parseInt(wx.getStorageSync(SIZE_KEY), 10)
    return Number.isFinite(saved) ? clampSize(saved) : ROUND_SIZE
  } catch (error) {
    return ROUND_SIZE
  }
}

function normalize(text) {
  return String(text || '').toLowerCase().replace(/[^a-z']/g, '')
}

function letterCountOf(word) {
  return String(word || '').replace(/[^a-zA-Z]/g, '').length
}

// 拼写格子：每个字母一格，连字符/空格占一格当分隔；第一个空格子高亮
function cellsOf(word, typed) {
  const letters = String(typed || '').replace(/[^a-zA-Z]/g, '')
  const cells = []
  let cursor = 0
  let active = false
  String(word || '').split('').forEach((ch) => {
    if (!/[a-zA-Z]/.test(ch)) {
      cells.push({ ch, sep: true, filled: true, active: false })
      return
    }
    if (cursor < letters.length) {
      cells.push({ ch: letters[cursor], sep: false, filled: true, active: false })
    } else {
      cells.push({ ch: '', sep: false, filled: false, active: !active })
      active = true
    }
    cursor += 1
  })
  return cells
}

// 长单词用小格子，保证一行放得下
function sizeClassOf(count) {
  if (count > 12) return 'spell-tight'
  if (count > 8) return 'spell-compact'
  return ''
}

// 拼写提示：只给首字母和长度，够想起来，又不至于直接把答案送去
function hintOf(word) {
  const clean = String(word || '')
  const first = clean.slice(0, 1).toLowerCase()
  const count = letterCountOf(clean)
  if (!count) return ''
  return `${first} 开头 · 共 ${count} 个字母`
}

// 语境填词：把句子里这个词挖成空格，剩下的上下文要还能读通
function clozeText(sentence, word) {
  const text = String(sentence || '').trim()
  const target = String(word || '').trim()
  if (!text || !target) return ''
  const parts = target.split(/\s+/).map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`(^|[^a-z])${parts.join('\\s+')}($|[^a-z])`, 'i')
  if (!pattern.test(text)) return ''
  return text.replace(pattern, (all, before, after) => `${before}_____${after}`)
}

// 只有看义拼写才是自己敲字母，语境填词是从四个选项里挑
function isTypingPhase(phase) {
  return phase === 'spell'
}

// 看词选义、听音选义、语境填词都是四选一
function isPickPhase(phase) {
  return phase === 'choice' || phase === 'cloze'
}

function shuffle(list) {
  const items = list.slice()
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = items[i]
    items[i] = items[j]
    items[j] = tmp
  }
  return items
}

// 词性统一成「n. / v. / adj.」，数据里有的已经带点，避免出现 n.. 这种双点
function posLabel(pos) {
  const clean = String(pos || '').trim().replace(/[.．]+$/, '')
  return clean ? `${clean}.` : ''
}

// 释义里的逗号统一成顿号，读起来顺；选项里太长就收一收，避免一行挤十个意思
function tidyDef(text) {
  return String(text || '')
    .replace(/[,，]\s*/g, '、')
    .replace(/[;；]\s*/g, '；')
    .replace(/、{2,}/g, '、')
    .replace(/^、+|、+$/g, '')
    .trim()
}

// 一条释义一行：词性 + 意思，多个词性分行，不再挤成一团
// options.maxSenses：选项里每个词性最多显示几个义项，超出的用「等」收尾
function meaningLines(item, options) {
  const limit = (options && options.maxSenses) || 0
  const meanings = item && item.meanings
  if (!Array.isArray(meanings) || !meanings.length) {
    const fallback = tidyDef(item && item.meaning)
    return fallback ? [{ pos: '', def: fallback }] : []
  }
  return meanings
    .map((mean) => {
      const senses = tidyDef(mean && mean.definition).split('、').filter(Boolean)
      const def = limit && senses.length > limit
        ? `${senses.slice(0, limit).join('、')}等`
        : senses.join('、')
      return { pos: posLabel(mean && mean.pos), def }
    })
    .filter((line) => line.def)
}

function meaningsText(item) {
  return meaningLines(item)
    .map((line) => `${line.pos} ${line.def}`.trim())
    .join('；')
}

// 一张卡涉及哪些词性，用来把干扰项往同一类上凑
function posSetOf(item) {
  const set = new Set()
  const meanings = item && item.meanings
  if (Array.isArray(meanings)) {
    meanings.forEach((mean) => {
      const label = posLabel(mean && mean.pos)
      if (label) set.add(label)
    })
  }
  return set
}

// 只改一个选项的状态，其余保持不变
function markOption(options, index, flag) {
  return (options || []).map((item, i) => (i === index ? Object.assign({}, item, { [flag]: true }) : item))
}

function dayKey(now) {
  const date = new Date(now || Date.now())
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

// 练习量只存本地：同一个词一天练几遍都算一次
function readLog() {
  try {
    const saved = wx.getStorageSync(LOG_KEY)
    return saved && typeof saved === 'object' ? saved : null
  } catch (error) {
    return null
  }
}

function countPractice(id, firstTry) {
  const today = dayKey()
  const saved = readLog()
  const log = saved && saved.date === today
    ? saved
    : { date: today, words: 0, firstTry: 0, seen: [] }
  const seen = Array.isArray(log.seen) ? log.seen : []
  const key = String(id || '')
  // 同一个词一天只算一次：重复练不再加数字，避免一天刷同一个词把练习量刷高
  if (!key || seen.indexOf(key) < 0) {
    if (key) seen.push(key)
    log.words += 1
    if (firstTry) log.firstTry += 1
  }
  log.seen = seen
  try {
    wx.setStorageSync(LOG_KEY, log)
  } catch (error) {}
  return log
}

function todayLog() {
  const saved = readLog()
  return saved && saved.date === dayKey() ? saved : { date: dayKey(), words: 0, firstTry: 0, seen: [] }
}

Page({
  data: {
    loading: true,
    error: '',
    empty: false,
    emptyText: '',
    // 单词 / 词组两类，各自一份池子
    tabs: TABS,
    tab: 'word',
    tabCounts: { word: 0, phrase: 0 },
    tabEmpty: '',
    letters: LETTER_KEYS,
    // 只练「不记得」的词，不提供「全部」，避免和今日复习混在一起
    poolSize: 0,
    // 生词本里「不记得」的总数（含缺释义的），和生词本页面口径一致
    unknownCount: 0,
    skipped: 0,
    roundSize: ROUND_SIZE,
    queue: [],
    index: 0,
    // total 是本轮的词数；答错的词会在本环节末尾补回题目，队列会变长
    total: 0,
    // 本环节已经做了几道 / 一共几道（含补考）
    stageDone: 0,
    stageTotal: 0,
    percent: 0,
    // 四个环节（按固定顺序，带 done 标记，用来画顶部指示条）
    stages: [],
    // 当前这道题考的是哪个环节
    stageKey: '',
    stageLabel: '',
    current: null,
    meaningLines: [],
    hint: '',
    // choice 释义四选一 → detail 看详情 → cloze 语境四选一 → spell 键盘拼写 → feedback 看正确答案
    phase: 'choice',
    // 看词选义答错时，详情页上提醒一下
    detailWrong: false,
    mode: 'read',
    revealed: false,
    // 语境填词用的例句：挖空后显示；对答案时显示原句
    sentence: '',
    // 例句的中文意思：语境填词靠它确认句意
    sentenceZh: '',
    // 用户自己画的记忆草图（本地图片路径），看词选义时贴在单词下面
    drawingPath: '',
    options: [],
    optionLetters: ['A', 'B', 'C', 'D'],
    answerIndex: -1,
    picked: -1,
    input: '',
    cells: [],
    sizeClass: '',
    letterCount: 0,
    answerText: '',
    resultLabel: '',
    // 已经有几个词四个环节全过了
    passedCount: 0,
    knownCount: 0,
    stats: { words: 0, firstTry: 0, retried: 0 },
    todayWords: 0,
    done: false,
    busy: false
  },

  onLoad() {
    this.load()
  },

  // 从画板回来时刷新一下当前词的草图
  onShow() {
    const current = this.data.current
    if (!current) return
    const path = drawings.pathOf(current.id)
    if (path !== this.data.drawingPath) this.setData({ drawingPath: path })
  },

  // 删掉当前词的草图，之后可以重新画
  removeDrawing() {
    const current = this.data.current
    if (!current || !current.id) return
    wx.showModal({
      title: '删掉这张画？',
      content: '只删除这张草图，单词还留在生词本里。',
      confirmText: '删掉',
      confirmColor: '#b23b30',
      success: (res) => {
        if (!res.confirm) return
        drawings.remove(current.id)
        this.setData({ drawingPath: '' })
        wx.showToast({ title: '已删掉', icon: 'none' })
      }
    })
  },

  // 切到别的页面（看文章、去复习）时把这一组存下来，回来接着练
  onHide() {
    this.saveSession()
  },

  onUnload() {
    clearTimeout(this.pickTimer)
    this.saveSession()
  },

  load() {
    this.setData({ loading: true, error: '', empty: false, done: false })
    wordbook.list(true)
      .then((data) => {
        const words = (Array.isArray(data.items) ? data.items : []).filter((item) => item && item.word)
        const phrases = (Array.isArray(data.phraseItems) ? data.phraseItems : []).filter((item) => item && item.word)
        this.pools = {
          word: this.poolOfWords(words),
          phrase: this.poolOfWords(phrases)
        }
        if (!words.length && !phrases.length) {
          this.setData({
            loading: false,
            empty: true,
            emptyText: '生词本和词组本都还是空的。精读时把不认识的内容收进来，就能开始背了。'
          })
          return
        }
        this.setData({
          loading: false,
          tabCounts: {
            word: this.pools.word.unknownCount,
            phrase: this.pools.phrase.unknownCount
          }
        }, () => this.startRoundFor(this.data.tab))
      })
      .catch((error) => this.setData({
        loading: false,
        error: (error && error.message) || '背诵内容读取失败，请重试'
      }))
  },

  // 单词和词组口径一致：只练 state !== known 的；缺释义的出不了选择题
  poolOfWords(list) {
    const unknown = list.filter((item) => item.state !== 'known')
    const pool = unknown.filter((item) => meaningsText(item))
    return {
      pool,
      unknownCount: unknown.length,
      skipped: unknown.length - pool.length,
      totalCount: list.length,
      choicePool: list.filter((item) => meaningsText(item))
    }
  },

  switchTab(event) {
    const tab = event.currentTarget.dataset.tab
    if (tab === this.data.tab) return
    playTapSound()
    // 先把当前这一组的进度存下来，切回来时接着练，不重新洗牌
    this.saveSession()
    this.setData({ tab }, () => this.startRoundFor(tab))
  },

  startRoundFor(tab) {
    const conf = (this.pools && this.pools[tab]) || { pool: [], unknownCount: 0, skipped: 0 }
    this.choicePool = conf.choicePool || []
    const saved = this.readSessions()[tab]
    if (saved && this.resumeRound(saved, tab)) return
    this.startRound(conf.pool, conf.skipped, conf.unknownCount)
  },

  // 今天已经练到一半的这一类：从上次停下的那道题接着来
  resumeRound(saved, tab) {
    const queue = saved.queue
    const index = Number(saved.index) || 0
    // 上一轮已经练完，或者存的是过期/坏数据，就按新的一组开始
    if (index >= queue.length) {
      this.clearSession(tab)
      return false
    }
    const conf = (this.pools && this.pools[tab]) || {}
    this.currentPool = conf.pool || []
    this.counted = saved.counted || {}
    this.marked = saved.marked || {}
    this.failed = saved.failed || {}
    this.prepareSentences(queue)
    this.setData({
      loading: false,
      poolSize: (conf.pool || []).length,
      unknownCount: conf.unknownCount || 0,
      skipped: conf.skipped || 0,
      roundSize: readRoundSize(),
      queue,
      total: saved.total || this.countWords(queue),
      index,
      passedCount: saved.passedCount || 0,
      knownCount: saved.knownCount || 0,
      stats: saved.stats || { words: 0, firstTry: 0, retried: 0 },
      todayWords: todayLog().words,
      done: false,
      tabEmpty: ''
    }, () => this.buildQuestion())
    return true
  },

  // 本轮有多少个不同的词（queue 里每个环节各一道题）
  countWords(queue) {
    const seen = {}
    let count = 0
    ;(queue || []).forEach((task) => {
      const id = task && task.item && task.item.id
      if (!id || seen[id]) return
      seen[id] = true
      count += 1
    })
    return count
  },

  // 会话按「单词 / 词组」各存一份，切来切去两边都不丢
  readSessions() {
    try {
      const saved = wx.getStorageSync(SESSION_KEY)
      if (!saved || typeof saved !== 'object') return {}
      const today = dayKey()
      const keep = {}
      Object.keys(saved).forEach((tab) => {
        const one = saved[tab]
        if (!one || one.v !== SESSION_VERSION || one.date !== today) return
        if (!Array.isArray(one.queue) || !one.queue.length) return
        // 旧版本存的是「词」而不是「题」，结构对不上就丢掉
        if (!one.queue.every((task) => task && task.item && task.key)) return
        keep[tab] = one
      })
      return keep
    } catch (error) {
      return {}
    }
  },

  writeSessions(all) {
    try {
      wx.setStorageSync(SESSION_KEY, all || {})
    } catch (error) {}
  },

  saveSession() {
    const data = this.data
    const tab = data.tab
    if (!tab) return
    const all = this.readSessions()
    // 练完了就把这一类的记录清掉，下次进来是新的一组
    if (data.done || !data.queue || !data.queue.length) {
      if (all[tab]) {
        delete all[tab]
        this.writeSessions(all)
      }
      return
    }
    all[tab] = {
      v: SESSION_VERSION,
      date: dayKey(),
      // 停在反馈页说明这道题答错了，还留在这个环节里等补考，回来还是这道题
      index: data.index,
      queue: data.queue,
      total: data.total,
      passedCount: data.passedCount,
      stats: data.stats,
      knownCount: data.knownCount,
      counted: this.counted || {},
      marked: this.marked || {},
      failed: this.failed || {}
    }
    this.writeSessions(all)
  },

  clearSession(tab) {
    const all = this.readSessions()
    if (!tab || !all[tab]) return
    delete all[tab]
    this.writeSessions(all)
  },

  // 一类背完（或本来就没有要背的）就记一笔，首页「今日计划」据此判断三类是否都完成
  markTabDone(tab) {
    if (!tab) return
    checkin.mark(`memorize_${tab}`)
  },

  // 当前这一组空了，按类型说清楚原因，别让用户以为坏了
  emptyTextOf(tab) {
    const conf = (this.pools && this.pools[tab]) || {}
    const count = conf.totalCount || 0
    const book = tab === 'phrase' ? '词组本' : '生词本'
    if (!count) return `${book}还是空的。精读时把不认识的${tab === 'phrase' ? '词组' : '单词'}收进来，就能开始练了。`
    if (!conf.unknownCount) return `${book}里的内容都记住了。想巩固可以等「今日复习」按排期提醒。`
    return `${book}里有 ${conf.skipped} 条缺释义，暂时出不了题；去文章里重新收录一下再练。`
  },

  // 每组数量默认 20，可以自己填（5–100），也能用加减键快速调；内容不够时有多少练多少
  startRound(pool, skipped, unknownCount) {
    const list = Array.isArray(pool) ? pool : []
    this.currentPool = list
    const size = readRoundSize()
    const words = shuffle(list).slice(0, Math.min(size, list.length))
    const queue = stagedTasks(words)
    this.counted = {}
    this.marked = {}
    this.failed = {}
    // 这一类没有要背的，也算今天这一类完成了，不挡首页计划
    if (!queue.length) this.markTabDone(this.data.tab)
    this.prepareSentences(queue)
    this.setData({
      loading: false,
      poolSize: list.length,
      unknownCount,
      skipped: skipped || 0,
      roundSize: size,
      queue,
      total: words.length,
      index: 0,
      passedCount: 0,
      knownCount: 0,
      percent: 0,
      stats: { words: 0, firstTry: 0, retried: 0 },
      todayWords: todayLog().words,
      done: false,
      tabEmpty: queue.length ? '' : this.emptyTextOf(this.data.tab)
    }, () => {
      if (queue.length) this.buildQuestion()
    })
  },

  // 加减键按 5 个一档调
  stepSize(event) {
    const step = Number(event.currentTarget.dataset.step) || 0
    this.applySize(this.data.roundSize + step)
  },

  // 点数字直接填，失焦或回车生效
  setSize(event) {
    this.applySize(event.detail.value)
  },

  // 换每组数量：立刻按新数量重新分组，今天已经背过的数字不清零
  applySize(value) {
    const list = this.currentPool || []
    if (!list.length) return
    const size = clampSize(value)
    if (size === this.data.roundSize) {
      // 到上下限时把输入框拉回真实值，不再触发重排
      this.setData({ roundSize: size })
      return
    }
    playTapSound()
    try {
      wx.setStorageSync(SIZE_KEY, size)
    } catch (error) {}
    this.startRound(list, this.data.skipped, this.data.unknownCount)
  },

  buildQuestion() {
    clearTimeout(this.pickTimer)
    this.pickTimer = null
    const task = this.data.queue[this.data.index]
    const current = task && task.item
    if (!current) {
      this.finishRound()
      return
    }
    // 环节按固定顺序推进：前面的都过了，当前这个高亮
    const stageIndex = Math.max(0, STAGES.findIndex((stage) => stage.key === task.key))
    const stages = STAGES.map((stage, i) => ({
      key: stage.key,
      label: stage.label,
      done: i < stageIndex
    }))
    // 本环节的进度：同一个环节的题目在队列里是连着的，补考也接在本环节末尾
    let start = this.data.index
    while (start > 0 && this.data.queue[start - 1].key === task.key) start -= 1
    let end = this.data.index
    while (end + 1 < this.data.queue.length && this.data.queue[end + 1].key === task.key) end += 1
    const block = this.data.queue.slice(start, end + 1)
    const stageDone = block.filter((one) => one.done).length
    const stageTotal = block.length
    this.setData({
      current,
      meaningLines: meaningLines(current),
      hint: hintOf(current.word),
      stages,
      stageKey: task.key,
      stageLabel: STAGE_LABELS[task.key] || '',
      stageDone,
      stageTotal,
      percent: stageTotal ? Math.min(100, Math.round((stageDone / stageTotal) * 100)) : 0,
      answerText: '',
      resultLabel: ''
    }, () => this.buildStep())
  },

  // 按当前这道题的环节出题：三个四选一 + 一个键盘拼写
  buildStep() {
    const current = this.data.current
    const key = this.data.stageKey || 'read'
    const base = {
      revealed: false,
      sentence: '',
      sentenceZh: '',
      drawingPath: drawings.pathOf(current && current.id),
      options: [],
      answerIndex: -1,
      picked: -1,
      input: '',
      cells: [],
      sizeClass: '',
      letterCount: 0,
      answerText: '',
      resultLabel: ''
    }
    // 看义拼写：只给释义，自己敲字母
    if (key === 'spell') {
      const count = letterCountOf(current.word)
      this.setData(Object.assign({}, base, {
        phase: 'spell',
        mode: 'spell',
        answerText: current.word,
        cells: cellsOf(current.word, ''),
        sizeClass: sizeClassOf(count),
        letterCount: count
      }))
      return
    }
    // 语境填词：把例句挖空，从四个单词 / 词组里选出该填的那个
    if (key === 'cloze') {
      const sentence = this.clozeOf(current)
      const built = this.clozeQuestion(current, sentence)
      this.setData(Object.assign({}, base, {
        phase: 'cloze',
        mode: 'cloze',
        sentence,
        // 挖空的句子光看英文容易猜偏，配一句中文意思
        sentenceZh: sentences.getZh(current.word),
        options: built.options,
        answerIndex: built.answerIndex,
        answerText: current.word
      }))
      // 中文可能是这时才开始生成的，回来再补一次
      this.ensureClozeZh()
      return
    }
    const mode = key === 'listen' ? 'listen' : 'read'
    const built = this.meaningQuestion(current)
    this.setData(Object.assign({}, base, {
      phase: 'choice',
      mode,
      options: built.options,
      answerIndex: built.answerIndex,
      answerText: current.word
    }), () => {
      // 听音这一环节一进来就先读一遍，不用先点喇叭
      if (mode === 'listen') speakWord(current.word)
    })
  },

  // 挖空后的例句：句子不一定是模型写的，兜底句也能挖出上下文
  clozeOf(item) {
    const word = String((item && item.word) || '')
    const blank = clozeText(this.sentenceOf(item), word)
    return blank || 'We learned _____ in class today.'
  },

  // 例句：优先用模型写好的，还没写好就用一句兜底的，保证一定有句子可看
  sentenceOf(item) {
    const word = String((item && item.word) || '')
    return sentences.get(word) || `Can you spell ${word} for me?`
  },

  // 开始练之前先把这一组的例句备好，写到哪算哪，不挡出题
  prepareSentences(queue) {
    const items = []
    const seen = {}
    ;(queue || []).forEach((task) => {
      const item = (task && task.item) || task
      const word = String((item && item.word) || '')
      if (!word || seen[word]) return
      seen[word] = true
      const first = Array.isArray(item.meanings) && item.meanings[0] ? item.meanings[0] : null
      items.push({
        word,
        pos: posLabel(first && first.pos),
        meaning: meaningsText(item).slice(0, 30)
      })
    })
    try {
      const job = sentences.prefetch(items)
      if (job && job.catch) job.catch(() => {})
    } catch (error) {}
  },

  // 语境填词的中文：可能是出题之后才生成好的，补上后整句一起换，保证翻译的就是眼前这句
  ensureClozeZh() {
    const current = this.data.current
    const word = current && current.word
    if (!word || sentences.getZh(word)) return
    this.zhJobs = this.zhJobs || {}
    if (this.zhJobs[word]) return
    this.zhJobs[word] = true
    const index = this.data.index
    sentences.prefetch([{ word }]).then(() => {
      delete this.zhJobs[word]
      const now = this.data.current
      if (!now || now.word !== word) return
      const zh = sentences.getZh(word)
      if (!zh) return
      // 还没答题：换句子时连选项一起重排，空格和中文才对得上
      if (this.data.stageKey === 'cloze' && this.data.index === index && this.data.picked < 0) {
        const sentence = this.clozeOf(now)
        const built = this.clozeQuestion(now, sentence)
        this.setData({
          sentence,
          sentenceZh: zh,
          options: built.options,
          answerIndex: built.answerIndex
        })
        return
      }
      // 已经答完在看反馈：只刷新这一句和它的翻译
      if (this.data.phase === 'feedback' && this.data.stageKey === 'cloze') {
        this.setData({ sentence: sentences.get(word) || this.data.sentence, sentenceZh: zh })
      }
    }).catch(() => {
      delete this.zhJobs[word]
    })
  },

  // 前两个环节：给四个中文释义，选正确的那个
  meaningQuestion(current) {
    const meaning = meaningsText(current)
    const currentLines = meaningLines(current, { maxSenses: 5 })
    const currentPos = posSetOf(current)
    // 干扰项尽量找「同一类」的词：词性一致、释义条数接近，避免靠后缀长相猜答案
    const tiers = [[], [], []]
    const texts = []
    shuffle(this.choicePool).forEach((item) => {
      const text = meaningsText(item)
      if (!text || text === meaning || texts.indexOf(text) >= 0) return
      texts.push(text)
      const lines = meaningLines(item, { maxSenses: 5 })
      const pos = posSetOf(item)
      let share = 0
      pos.forEach((key) => {
        if (currentPos.has(key)) share += 1
      })
      const entry = { key: text, text, lines, correct: false }
      if (share && lines.length === currentLines.length) tiers[0].push(entry)
      else if (share) tiers[1].push(entry)
      else tiers[2].push(entry)
    })
    const distractors = tiers[0].concat(tiers[1], tiers[2]).slice(0, 3)
    const options = shuffle([
      { key: meaning, text: meaning, lines: currentLines, correct: true }
    ].concat(distractors))
    return { options, answerIndex: options.findIndex((option) => option.correct) }
  },

  // 语境填词：四个单词 / 词组里选出该填进空格的那个
  clozeQuestion(current, sentence) {
    const answer = String((current && current.word) || '')
    const picks = []
    shuffle(this.choicePool || []).forEach((item) => {
      if (picks.length >= 3) return
      const word = String((item && item.word) || '')
      if (!word) return
      if (normalize(word) === normalize(answer)) return
      // 同一个词组只当一次干扰项
      if (picks.some((one) => normalize(one) === normalize(word))) return
      // 句子里本来就有的词不能当干扰项，不然一眼就能排除
      if (sentences.contains(sentence, word)) return
      picks.push(word)
    })
    const options = shuffle([
      { key: answer, text: answer, correct: true }
    ].concat(picks.map((word) => ({ key: word, text: word, correct: false }))))
    return { options, answerIndex: options.findIndex((option) => option.correct) }
  },

  // 答错的词给一个画板：自己画个场景，比看别人的图更容易记住
  goDraw() {
    const current = this.data.current
    if (!current || !current.id) return
    playTapSound()
    const meaning = (this.data.meaningLines || [])
      .map((line) => line.def)
      .filter(Boolean)
      .join('；')
      .slice(0, 40)
    wx.navigateTo({
      url: `/pkgWords/pages/draw/index?id=${encodeURIComponent(current.id)}&word=${encodeURIComponent(current.word)}&meaning=${encodeURIComponent(meaning)}`
    })
  },

  previewDrawing() {
    if (!this.data.drawingPath) return
    wx.previewImage({ urls: [this.data.drawingPath] })
  },

  // 听不出可以先看单词，不扣成绩：这一步只是回忆意思
  revealWord() {
    playTapSound()
    this.setData({ revealed: true })
  },

  // 选对就往下走；选错先标出正确答案，这个词记一笔，等本环节过完再补考
  pickOption(event) {
    if (this.data.busy || !isPickPhase(this.data.phase)) return
    const index = Number(event.currentTarget.dataset.index)
    const option = this.data.options[index]
    if (Number.isNaN(index) || !option) return
    if (this.data.picked >= 0) return
    playTapSound()
    const isRead = this.data.stageKey === 'read'
    if (option.correct) {
      // 看词选义答对：先进单词详情看一眼，看完手动继续
      if (isRead) {
        this.setData({
          options: markOption(this.data.options, index, 'right'),
          picked: index,
          detailWrong: false,
          sentence: this.sentenceOf(this.data.current),
          sentenceZh: sentences.getZh(this.data.current && this.data.current.word),
          phase: 'detail'
        })
        return
      }
      this.setData({ options: markOption(this.data.options, index, 'right'), picked: index }, () => {
        clearTimeout(this.pickTimer)
        this.pickTimer = setTimeout(() => {
          this.pickTimer = null
          if (isPickPhase(this.data.phase)) this.advance()
        }, 380)
      })
      return
    }
    const options = markOption(markOption(this.data.options, index, 'wrong'), this.data.answerIndex, 'right')
    this.noteWrong()
    // 看词选义的正确答案就在选项里，直接进详情页学一遍
    if (isRead) {
      this.setData({
        options,
        picked: index,
        detailWrong: true,
        sentence: this.sentenceOf(this.data.current),
        sentenceZh: sentences.getZh(this.data.current && this.data.current.word),
        phase: 'detail'
      })
      return
    }
    this.setData({ options, picked: index }, () => {
      // 停一下让用户看清正确答案，再进反馈页
      clearTimeout(this.pickTimer)
      this.pickTimer = setTimeout(() => {
        this.pickTimer = null
        if (isPickPhase(this.data.phase)) this.showFeedback()
      }, 1100)
    })
  },

  // 答错：这个词记一笔，本环节结束前还要再考一次
  noteWrong() {
    const task = this.data.queue[this.data.index]
    if (task) task.wrong = true
    const id = task && task.item && task.item.id
    if (!id) return
    this.failed = this.failed || {}
    this.failed[id] = true
  },

  // 答错后的反馈页：看一眼正确答案和例句，接着往下走
  showFeedback() {
    const current = this.data.current
    if (!current) return
    this.setData({
      phase: 'feedback',
      resultLabel: '这一步答错了',
      answerText: current.word,
      sentence: sentences.get(current.word) || '',
      sentenceZh: sentences.getZh(current.word) || ''
    })
  },

  // 详情页看完，手动继续；答错也会往下走，等本环节末尾再来一遍
  closeDetail() {
    if (this.data.phase !== 'detail') return
    clearTimeout(this.pickTimer)
    this.pickTimer = null
    this.advance()
  },

  // 答对了：这道题算过；拼写这一环答对说明四个环节都过了
  advance() {
    const task = this.data.queue[this.data.index]
    if (!task || !task.item) return
    task.done = true
    if (task.key === 'spell') this.completeWord(task.item)
    // 自动进下一题，不再补一下点击音
    this.next(true)
  },

  // 自绘字母键盘：输入只落在格子上，不弹系统键盘，也就没有光标
  tapKey(event) {
    if (this.data.busy || !isTypingPhase(this.data.phase)) return
    const key = String(event.currentTarget.dataset.key || '').toLowerCase()
    if (!/^[a-z]$/.test(key)) return
    if (this.data.input.length >= this.data.letterCount) return
    playTapSound()
    this.setSpellInput(this.data.input + key)
  },

  backspace() {
    if (this.data.busy || !isTypingPhase(this.data.phase) || !this.data.input) return
    playTapSound()
    this.setSpellInput(this.data.input.slice(0, -1))
  },

  setSpellInput(value) {
    this.setData({
      input: value,
      cells: cellsOf(this.data.current && this.data.current.word, value)
    })
  },

  submitSpell() {
    const current = this.data.current
    if (!current || this.data.busy || !isTypingPhase(this.data.phase)) return
    const typed = normalize(this.data.input)
    if (!typed) {
      wx.showToast({ title: this.data.tab === 'phrase' ? '先把这个词组填出来' : '先把这个词填出来', icon: 'none' })
      return
    }
    if (typed === normalize(current.word)) {
      this.advance()
      return
    }
    // 拼错先记一笔，等拼写环节剩下的词都拼完，再把这个词补到最后
    this.noteWrong()
    this.showFeedback()
  },

  skipSpell() {
    if (this.data.busy || !isTypingPhase(this.data.phase)) return
    playTapSound()
    this.noteWrong()
    this.showFeedback()
  },

  // 四个环节都过了：这一轮里第一次完成才计数，然后从「不记得」转成「记得」
  completeWord(item) {
    if (!item || !item.id) return
    this.counted = this.counted || {}
    if (this.counted[item.id]) return
    this.counted[item.id] = true
    const firstTry = !(this.failed && this.failed[item.id])
    const stats = Object.assign({}, this.data.stats)
    stats.words += 1
    if (firstTry) stats.firstTry += 1
    else stats.retried += 1
    const log = countPractice(item.id, firstTry)
    this.markKnown(item)
    this.setData({
      stats,
      todayWords: log.words,
      passedCount: this.data.passedCount + 1
    })
  },

  // 拼对即「记得」：同步到生词本，云端会把复习档位直接放到最后一档，半年后回访
  markKnown(item) {
    this.marked = this.marked || {}
    if (!item || !item.id || this.marked[item.id]) return
    this.marked[item.id] = true
    wordbook.setState(item.id, 'known')
      .then(() => this.setData({ knownCount: this.data.knownCount + 1 }))
      .catch(() => { delete this.marked[item.id] })
  },

  // 下一道题：本环节还有没做的就接着做；
  // 这个环节全做完了，答错的词补到环节末尾再来一轮，全对才进下一个环节
  next(auto) {
    if (this.data.busy) return
    // 页面上只有反馈页会调 next，连点两下时别把下一题也当成已答
    if (auto !== true && this.data.phase !== 'feedback') return
    // advance 自动续题时不补点击音，用户自己点「继续」时补一下
    if (auto !== true) playTapSound()
    const queue = this.data.queue.slice()
    const task = queue[this.data.index]
    if (task && !task.done) task.done = true
    const key = task ? task.key : ''
    // 同一个环节的题目在队列里是连着的
    let start = this.data.index
    while (start > 0 && queue[start - 1].key === key) start -= 1
    let end = this.data.index
    while (end + 1 < queue.length && queue[end + 1].key === key) end += 1
    let index = this.data.index + 1
    if (index > end) {
      const wrongs = queue.slice(start, end + 1).filter((one) => one.wrong)
      if (wrongs.length) {
        // 本环节过完还有错的，把这些词补到环节最后，再来一遍
        wrongs.forEach((one) => { one.wrong = false })
        const retries = shuffle(wrongs.map((one) => ({
          item: one.item,
          key: one.key,
          done: false,
          wrong: false,
          retry: true
        })))
        queue.splice(end + 1, 0, ...retries)
        index = end + 1
      } else if (end + 1 >= queue.length) {
        this.setData({ index: queue.length, queue, busy: false }, () => this.finishRound())
        return
      } else {
        index = end + 1
      }
    }
    this.setData({ index, queue, busy: false }, () => this.buildQuestion())
  },

  // 四个环节全部走完：这一组结束
  finishRound() {
    this.markTabDone(this.data.tab)
    this.clearSession(this.data.tab)
    this.setData({ done: true, current: null, percent: 100 })
  },

  again() {
    this.clearSession(this.data.tab)
    this.load()
  },

  goWordbook() {
    wx.navigateBack({
      fail: () => wx.redirectTo({ url: '/pkgWords/pages/wordbook/index' })
    })
  },

  goReview() {
    wx.navigateTo({ url: '/pages/review/index' })
  }
})
