// 真题翻译手账：75 套四六级翻译真题，自己排期、自己自评、按 1/3/7 天回看。
// 进度先写本地，再防抖推到云函数合并；云端失败不打断使用，留 pending 下次补传。
const { sets, sentences } = require('../../content/translationSets')
const { advanced: ADVANCED_QUOTES } = require('../../content/translationAdvanced')
const {
  chapters: VOCAB_CHAPTERS,
  pitfalls: VOCAB_PITFALLS,
  predictions: VOCAB_PREDICTIONS,
  total: VOCAB_TOTAL
} = require('../../content/translationVocab')
const checkin = require('../../../services/checkin')
const handbook = require('../../../services/handbook')
const segSwipe = require('../../../utils/segSwipe')

const KEY = 'transHandbook.v1'
const PENDING = 'transSyncPending'
const SYNC_DELAY = 900
const DAY_MS = 24 * 60 * 60 * 1000
const TOTAL = sets.length
const WEEK = ['日', '一', '二', '三', '四', '五', '六']
const PER_DAY = [1, 2, 3, 4]
const YEARS = ['全部年份', '2020', '2021', '2022', '2023', '2024', '2025', '2026']

const SET_MAP = {}
sets.forEach((item) => {
  SET_MAP[item.id] = item
})

// 今日任务从最近年份往前排：2026 年的题先做，再逐步回到 2020 年。
// 同一次考试内保持原顺序（四级在前、六级在后），不来回跳
function issueScore(date) {
  const parts = String(date || '').split('.')
  return (Number(parts[0]) || 0) * 100 + (Number(parts[1]) || 0)
}

const SCHEDULE = sets
  .map((set, order) => ({ set, order }))
  .sort((a, b) => issueScore(b.set.date) - issueScore(a.set.date) || a.order - b.order)
  .map((row) => row.set)
const SENTENCE_MAP = {}
;(sentences || []).forEach((item) => {
  SENTENCE_MAP[item.id] = item
})
const ADVANCED_MAP = {}
ADVANCED_QUOTES.forEach((item) => {
  ADVANCED_MAP[item.id] = item
})

// 词汇数据只在模块加载时整理一次：章节映射、chip 短名、全局搜索索引
const CHAPTER_MAP = {}
const CHAPTER_CHIPS = []
const VOCAB_SEARCH = []
const PREDICT_TABS = [
  { key: 'word', label: '题材词 100' },
  { key: 'sentence', label: '整句 60' }
]
// 金句分两组：提分句默认在前，真题原句沿用原列表
const QUOTE_GROUPS = [
  { key: 'advanced', label: '提分句（' + ADVANCED_QUOTES.length + '）' },
  { key: 'real', label: '真题原句（' + sentences.length + '）' }
]

VOCAB_CHAPTERS.forEach((chapter) => {
  CHAPTER_MAP[chapter.id] = chapter
  CHAPTER_CHIPS.push({ key: chapter.id, label: chapter.name.replace(/、.*/, '') })
  // 避坑卡排在第十一章「难译俗语」之后，所以它是第十二个入口
  if (chapter.id === 'c11') CHAPTER_CHIPS.push({ key: 'pitfall', label: '十二·避坑' })
  chapter.sections.forEach((section) => {
    section.rows.forEach((row, index) => {
      VOCAB_SEARCH.push({
        key: chapter.id + '-' + section.id + '-' + index,
        zh: row.zh,
        en: row.en,
        from: chapter.name,
        hay: (row.zh + ' ' + row.en + ' ' + (row.note || '')).toLowerCase()
      })
    })
  })
})
CHAPTER_CHIPS.push({ key: 'predict', label: '预测' })

VOCAB_PREDICTIONS.forEach((item) => {
  VOCAB_SEARCH.push({
    key: item.id,
    zh: item.zh,
    en: item.en,
    from: '预测 · ' + item.dir,
    hay: (item.zh + ' ' + item.en + ' ' + (item.note || '')).toLowerCase()
  })
})

// 词汇 key 统一是「章-s节-序号」（如 c1-s1-0），预测词是 p 开头，天然不进 1579
const VOCAB_KEY = /^(c\d+)-s\d+-\d+$/

// 标记值带方向：正数是「标记」时间，负数是「取消」时间，0 表示从未操作
function isOn(value) {
  return Number(value) > 0
}

// 已背记录取消后仍保留时间戳，换设备合并时才能判断哪次操作更晚
function isDone(record) {
  return !!record && record.on !== false
}

// 只统计落在 11 章里的已背 key，避免其他 key 影响 1579 的分母
function countKnown(known, prefix) {
  let count = 0
  Object.keys(known).forEach((key) => {
    if (!isOn(known[key])) return
    if (key.indexOf(prefix) !== 0) return
    const parts = VOCAB_KEY.exec(key)
    if (!parts || !CHAPTER_MAP[parts[1]]) return
    count += 1
  })
  return count
}

// 提分句只看 60 个 a id，收藏或别的 key 都不算
function countQuoteKnown(known) {
  let count = 0
  ADVANCED_QUOTES.forEach((item) => {
    if (isOn(known[item.id])) count += 1
  })
  return count
}

// 收藏条目 = 真题套 + 真题句 + 提分句，按 id 去重
function countStarred(starred) {
  const seen = {}
  let count = 0
  Object.keys(starred).forEach((id) => {
    if (!isOn(starred[id])) return
    if (!SET_MAP[id] && !SENTENCE_MAP[id] && !ADVANCED_MAP[id]) return
    if (seen[id]) return
    seen[id] = true
    count += 1
  })
  return count
}

function pad2(value) {
  return value < 10 ? '0' + value : '' + value
}

function dayStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function dayKey(date) {
  return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate())
}

function addDays(date, count) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + count)
}

// 用 UTC 天序号做自然日相减，跨月跨年都稳
function dayIndex(date) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS)
}

function parseStart(text) {
  const parts = String(text || '').split('-')
  if (parts.length === 3) {
    const year = Number(parts[0])
    const month = Number(parts[1])
    const day = Number(parts[2])
    if (year && month && day) return new Date(year, month - 1, day)
  }
  return dayStart(new Date())
}

function monthDay(date) {
  return (date.getMonth() + 1) + ' 月 ' + date.getDate() + ' 日'
}

function issueOf(set) {
  return set.date + ' ' + set.level + ' 第' + set.no + '套'
}

function trim(text, max) {
  const value = String(text || '')
  return value.length > max ? value.slice(0, max) + '…' : value
}

// 来源写成「机构名 + 截断链接」，两段都用 text 显示，不做跳转
function splitSrc(src) {
  const text = String(src || '')
  const at = text.search(/https?:\/\//)
  if (at < 0) return { srcName: text, srcUrl: '' }
  return { srcName: text.slice(0, at).trim(), srcUrl: trim(text.slice(at), 42) }
}

function defaults() {
  return {
    plan: { perDay: 2, startAt: dayKey(new Date()), review: true, planAt: 0 },
    done: {},
    starred: {},
    vocab: { known: {} },
    quotes: { known: {} },
    resetAt: 0
  }
}

// 老数据里收藏是数组、已背是 true；统一升级成时间戳，0 表示取消
function stampOf(value) {
  if (value === true) return Date.now()
  const at = Number(value)
  return Number.isFinite(at) && at > 0 ? at : 0
}

// 标记保留正负号：正数标记、负数取消，合并时比较绝对值
function markMap(raw) {
  const output = {}
  if (!raw || typeof raw !== 'object') return output
  Object.keys(raw).forEach((key) => {
    const at = raw[key] === true ? Date.now() : Number(raw[key])
    if (Number.isFinite(at) && at !== 0) output[key] = at
  })
  return output
}

function normalize(raw) {
  const base = defaults()
  if (!raw || typeof raw !== 'object') return base
  const plan = raw.plan && typeof raw.plan === 'object' ? raw.plan : {}
  const perDay = PER_DAY.indexOf(Number(plan.perDay)) >= 0 ? Number(plan.perDay) : base.plan.perDay
  const startAt = /^\d{4}-\d{2}-\d{2}$/.test(String(plan.startAt || '')) ? String(plan.startAt) : base.plan.startAt
  const done = {}
  const rawDone = raw.done && typeof raw.done === 'object' ? raw.done : {}
  Object.keys(rawDone).forEach((id) => {
    const record = rawDone[id]
    if (!record || typeof record !== 'object') return
    const at = Number(record.at)
    done[id] = {
      at: at > 0 ? at : Date.now(),
      result: record.result === 'bad' ? 'bad' : 'ok',
      // rev 记录「已经复习到第几档」，避免同一条复习提醒永远挂在列表里
      rev: Math.min(Math.max(Number(record.rev) || 0, 0), 7),
      on: record.on !== false
    }
  })
  // 收藏早期是数组，转成 { id: 时间戳 }；对象则逐条升级
  let starred = {}
  if (Array.isArray(raw.starred)) {
    const now = Date.now()
    raw.starred.forEach((id) => {
      if (typeof id === 'string' && id) starred[id] = now
    })
  } else {
    starred = markMap(raw.starred)
  }
  const rawVocab = raw.vocab && typeof raw.vocab === 'object' ? raw.vocab : {}
  const known = markMap(rawVocab.known)
  const rawQuotes = raw.quotes && typeof raw.quotes === 'object' ? raw.quotes : {}
  return {
    plan: {
      perDay,
      startAt,
      review: plan.review !== false,
      planAt: stampOf(plan.planAt)
    },
    done,
    starred,
    vocab: { known },
    quotes: { known: markMap(rawQuotes.known) },
    resetAt: stampOf(raw.resetAt)
  }
}

function readStore() {
  try {
    const saved = wx.getStorageSync(KEY)
    return saved && typeof saved === 'object' ? saved : null
  } catch (error) {
    return null
  }
}

Page({
  data: {
    tab: 'today',
    tabs: [
      { key: 'today', label: '今日' },
      { key: 'bank', label: '题库' },
      { key: 'quotes', label: '金句' },
      { key: 'vocab', label: '词汇' },
      { key: 'starred', label: '收藏' },
      { key: 'plan', label: '计划' }
    ],
    todayHead: '',
    todayCountLabel: '',
    todaySets: [],
    todayEmpty: '',
    reviewList: [],
    reviewHint: '',
    keyword: '',
    levelOptions: ['全部', '四级', '六级'],
    levelFilter: '全部',
    yearOptions: YEARS,
    yearIndex: 0,
    yearLabel: '全部年份',
    bankList: [],
    quoteKeyword: '',
    quoteGroups: QUOTE_GROUPS,
    quoteGroup: 'advanced',
    quotePh: '搜中文、英文或话题',
    quoteEmpty: '',
    quoteList: [],
    vocabChips: CHAPTER_CHIPS,
    vocabChip: CHAPTER_CHIPS[0].key,
    vocabKeyword: '',
    vocabSearching: false,
    vocabMode: 'chapter',
    vocabChapter: null,
    vocabResults: [],
    vocabTotal: VOCAB_TOTAL,
    quoteTotal: ADVANCED_QUOTES.length,
    setTotal: TOTAL,
    // 来源说明默认只留一行，点「说明」再展开细节
    scopeOpen: false,
    predictTabs: PREDICT_TABS,
    predictKind: 'word',
    predictGroups: [],
    pitfalls: [],
    perDayOptions: PER_DAY,
    perDay: 2,
    // 拖动过程中选中态跟着手指走，-1 表示没在拖
    segDrag: -1,
    startAt: '',
    startLabel: '',
    reviewOn: true,
    schedule: [],
    scheduleHintBefore: '',
    scheduleHintAfter: '',
    stats: { done: 0, vocab: 0, quotes: 0, starred: 0, finishLabel: '' },
    starredGroups: [],
    starredTotal: 0,
    starredEmpty: '',
    syncText: '',
    practice: {
      open: false,
      finished: false,
      kicker: '',
      topic: '',
      issue: '',
      text: '',
      en: '',
      diff: '',
      hasDiff: false,
      srcName: '',
      srcUrl: '',
      showEn: false,
      draft: '',
      doneDesc: ''
    }
  },

  onLoad() {
    this.openCards = {}
    this.shownEn = {}
    this.openQuotes = {}
    this.openSections = {}
    this.vocabReveal = {}
    this.vocabRowIndex = {}
    this.searchRowIndex = {}
    this.predictIndex = {}
    this.store = normalize(readStore())
    this.dayKey = dayKey(new Date())
    this.renderAll()
    // 本地先渲染完再拉云端，慢网也不挡使用
    this.pullCloud()
  },

  onShow() {
    // 跨过零点再回来时，今日任务要换到新的一天
    const key = dayKey(new Date())
    if (key !== this.dayKey) {
      this.dayKey = key
      this.renderAll()
    }
  },

  onHide() {
    this.clearSearchTimer()
    this.clearQuoteTimer()
    this.clearVocabTimer()
    this.flushSync()
  },

  onUnload() {
    this.clearSearchTimer()
    this.clearQuoteTimer()
    this.clearVocabTimer()
    this.flushSync()
  },

  clearSearchTimer() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
      this.searchTimer = null
    }
  },

  clearQuoteTimer() {
    if (this.quoteTimer) {
      clearTimeout(this.quoteTimer)
      this.quoteTimer = null
    }
  },

  clearVocabTimer() {
    if (this.vocabTimer) {
      clearTimeout(this.vocabTimer)
      this.vocabTimer = null
    }
  },

  // ---------- 存储与云同步 ----------
  writeLocal() {
    try {
      wx.setStorageSync(KEY, this.store)
    } catch (error) {
      // 写入失败不打断使用，页面内存态继续跑
    }
  },

  save() {
    this.writeLocal()
    this.dirty = true
    this.scheduleSync()
  },

  scheduleSync() {
    this.clearSyncTimer()
    this.syncTimer = setTimeout(() => {
      this.syncTimer = null
      this.pushCloud()
    }, SYNC_DELAY)
  },

  clearSyncTimer() {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer)
      this.syncTimer = null
    }
  },

  readPending() {
    try {
      return wx.getStorageSync(PENDING) === true
    } catch (error) {
      return false
    }
  },

  writePending(value) {
    this.pending = !!value
    try {
      wx.setStorageSync(PENDING, !!value)
    } catch (error) {
      // 标记写不进去也不影响页面继续用
    }
  },

  setSyncText(text) {
    if (this.data.syncText !== text) this.setData({ syncText: text })
  },

  // 首次进页面：本地已经在用，随后拉云端合并
  pullCloud() {
    this.pending = this.readPending()
    if (this.pending) this.setSyncText('进度暂存本机，联网后自动补传')
    let task = null
    try {
      task = handbook.load()
    } catch (error) {
      this.writePending(true)
      this.setSyncText('进度暂存本机，联网后自动补传')
      return
    }
    if (!task || typeof task.then !== 'function') return
    task.then((data) => {
      const remote = data && data.progress
      if (remote && typeof remote === 'object') {
        this.store = normalize(handbook.merge(this.store, remote))
        this.writeLocal()
        this.renderAll()
      }
      // 有旧待传就补推一次；云端为空（第一次用）也把本地推上去
      if (this.pending || !remote) this.pushCloud()
      else this.setSyncText('进度已同步到云端')
    }).catch(() => {
      this.writePending(true)
      this.setSyncText('进度暂存本机，联网后自动补传')
    })
  },

  pushCloud() {
    this.clearSyncTimer()
    let task = null
    try {
      task = handbook.save(this.store)
    } catch (error) {
      this.writePending(true)
      this.setSyncText('进度暂存本机，联网后自动补传')
      return
    }
    if (!task || typeof task.then !== 'function') return
    task.then((data) => {
      const remote = data && data.progress
      if (remote && typeof remote === 'object') {
        this.store = normalize(handbook.merge(this.store, remote))
        this.writeLocal()
        this.renderAll()
      }
      this.writePending(false)
      this.dirty = false
      this.setSyncText('进度已同步到云端')
    }).catch(() => {
      this.writePending(true)
      this.setSyncText('进度暂存本机，联网后自动补传')
    })
  },

  // 页面藏起来 / 关掉时别等防抖，立刻推一次；没改过也没欠账就不打扰云端
  flushSync() {
    const waiting = !!this.syncTimer
    this.clearSyncTimer()
    if (!waiting && !this.dirty && !this.pending) return
    this.pushCloud()
  },

  doneCount() {
    return Object.keys(this.store.done).filter((id) => SET_MAP[id] && isDone(this.store.done[id])).length
  },

  renderAll() {
    this.renderToday()
    this.renderBank()
    this.renderQuotes()
    if (this.data.tab === 'vocab') this.renderVocab()
    if (this.data.tab === 'starred') this.renderStarred()
    this.renderPlan()
  },

  // ---------- 今日 ----------
  renderToday() {
    const plan = this.store.plan
    const today = dayStart(new Date())
    const start = parseStart(plan.startAt)
    const offset = dayIndex(today) - dayIndex(start)
    const perDay = plan.perDay
    const totalDays = Math.ceil(TOTAL / perDay)
    const doneCount = this.doneCount()
    let todaySets = []
    let todayEmpty = ''

    if (offset < 0) {
      todayEmpty = '今天没有新任务，下一批 ' + monthDay(start)
    } else if (offset >= totalDays) {
      todayEmpty = doneCount >= TOTAL
        ? TOTAL + ' 套已全部背完，去题库随便翻翻'
        : '计划里的批次已经过完，还剩 ' + (TOTAL - doneCount) + ' 套，去题库补背或在「计划」里调整开始日期'
    } else {
      const startIndex = offset * perDay
      todaySets = SCHEDULE.slice(startIndex, startIndex + perDay).map((set) => {
        const raw = this.store.done[set.id]
        const record = isDone(raw) ? raw : null
        return {
          id: set.id,
          topic: set.topic,
          issue: issueOf(set),
          summary: trim(set.text, 34),
          done: !!record,
          checkLabel: record ? '✓ 已背' : '待背',
          resultLabel: record ? (record.result === 'bad' ? '上次没译好' : '上次译出来了') : ''
        }
      })
    }

    const finished = todaySets.filter((item) => item.done).length
    this.setData({
      todayHead: monthDay(today) + ' · 周' + WEEK[today.getDay()],
      todayCountLabel: todaySets.length
        ? '今天 ' + todaySets.length + ' 套 · 已背 ' + finished + ' 套'
        : '',
      todaySets,
      todayEmpty
    })
    this.renderReview()
  },

  renderReview() {
    if (!this.store.plan.review) {
      this.setData({
        reviewList: [],
        reviewHint: '复习提醒已关闭，可在「计划」里打开'
      })
      return
    }
    const todayIndex = dayIndex(dayStart(new Date()))
    const gaps = [1, 3, 7]
    const rows = []
    Object.keys(this.store.done).forEach((id) => {
      const set = SET_MAP[id]
      const record = this.store.done[id]
      if (!set || !isDone(record)) return
      const base = dayIndex(dayStart(new Date(record.at)))
      // 只提醒还没复习过、且已经到期的下一档
      const gap = gaps.find((value) => base + value <= todayIndex && value > (record.rev || 0))
      if (!gap) return
      rows.push({
        id,
        gap,
        topic: set.topic,
        issue: issueOf(set),
        dueLabel: '完成后第 ' + gap + ' 天 · 该复习了',
        order: base + gap
      })
    })
    rows.sort((a, b) => a.order - b.order)
    this.setData({
      reviewList: rows.slice(0, 6),
      reviewHint: rows.length ? '' : '暂时没有到期复习，背过的套会在第 1 / 3 / 7 天提醒'
    })
  },

  startToday(event) {
    const index = Number(event.currentTarget.dataset.index) || 0
    const ids = this.data.todaySets.map((item) => item.id)
    if (!ids.length) return
    this.openPractice(ids, index, false)
  },

  startReview(event) {
    const id = event.currentTarget.dataset.id
    const gap = Number(event.currentTarget.dataset.gap) || 0
    if (!id) return
    this.openPractice([id], 0, true, gap)
  },

  // ---------- 练习层 ----------
  openPractice(ids, index, reviewMode, gap) {
    this.practiceIds = ids
    this.practiceIndex = Math.max(0, Math.min(index, ids.length - 1))
    this.practiceReview = !!reviewMode
    this.practiceGap = Number(gap) || 0
    this.renderPractice()
  },

  practiceItem(set) {
    const src = splitSrc(set.src)
    return {
      open: true,
      finished: false,
      kicker: '',
      topic: set.topic,
      issue: issueOf(set),
      text: set.text,
      en: set.en,
      diff: set.diff || '',
      hasDiff: !!set.diff,
      srcName: src.srcName,
      srcUrl: src.srcUrl,
      showEn: false,
      draft: '',
      doneDesc: ''
    }
  },

  renderPractice() {
    const id = this.practiceIds[this.practiceIndex]
    const set = SET_MAP[id]
    if (!set) {
      this.setData({
        practice: {
          open: true,
          finished: true,
          kicker: '',
          topic: '',
          issue: '',
          text: '',
          en: '',
          diff: '',
          hasDiff: false,
          srcName: '',
          srcUrl: '',
          showEn: false,
          draft: '',
          doneDesc: '这一套没找到，先关掉吧。'
        }
      })
      return
    }
    const item = this.practiceItem(set)
    item.kicker = this.practiceReview
      ? 'REVIEW · 再练一次'
      : 'TODAY · 第 ' + (this.practiceIndex + 1) + ' / ' + this.practiceIds.length + ' 套'
    this.setData({ practice: item })
  },

  onDraft(event) {
    this.setData({ 'practice.draft': event.detail.value })
  },

  showTranslation() {
    this.setData({ 'practice.showEn': true })
  },

  assess(event) {
    if (!this.practiceIds) return
    const result = event.currentTarget.dataset.result === 'bad' ? 'bad' : 'ok'
    const id = this.practiceIds[this.practiceIndex]
    this.markDone(id, result, this.practiceReview ? this.practiceGap : 0)

    if (this.practiceReview) {
      this.setData({
        'practice.finished': true,
        'practice.doneDesc': '这一套又过了一遍，下次到期再来。'
      })
      this.renderAll()
      return
    }

    let next = this.practiceIndex + 1
    while (next < this.practiceIds.length && isDone(this.store.done[this.practiceIds[next]])) {
      next += 1
    }
    if (next >= this.practiceIds.length) {
      this.setData({
        'practice.finished': true,
        'practice.doneDesc': '今天的 ' + this.practiceIds.length + ' 套都过了一遍，回手账看看。'
      })
      this.renderAll()
      return
    }
    this.practiceIndex = next
    this.renderPractice()
    this.renderAll()
  },

  markDone(id, result, gap) {
    if (!SET_MAP[id]) return
    const prev = isDone(this.store.done[id]) ? this.store.done[id] : null
    // 复习时不重置完成时间，已背数量也不会重复增加；rev 只往前进，不往回退
    this.store.done[id] = {
      at: prev ? prev.at : Date.now(),
      result,
      rev: Math.max(Number(gap) || 0, prev ? prev.rev || 0 : 0),
      on: true
    }
    this.save()
    try {
      checkin.mark('translation')
    } catch (error) {}
  },

  closePractice() {
    this.practiceIds = null
    this.setData({ 'practice.open': false })
    this.renderAll()
  },

  // ---------- 题库 ----------
  renderBank() {
    const keyword = String(this.data.keyword || '').trim().toLowerCase()
    const level = this.data.levelFilter
    const year = this.data.yearIndex > 0 ? YEARS[this.data.yearIndex] : ''
    const rows = []
    sets.forEach((set) => {
      if (level !== '全部' && set.level !== level) return
      if (year && set.date.indexOf(year) !== 0) return
      if (keyword) {
        const hay = (set.topic + ' ' + set.text + ' ' + set.en).toLowerCase()
        if (hay.indexOf(keyword) < 0) return
      }
      const raw = this.store.done[set.id]
      const record = isDone(raw) ? raw : null
      const starred = isOn(this.store.starred[set.id])
      const expanded = !!this.openCards[set.id]
      const src = splitSrc(set.src)
      rows.push({
        id: set.id,
        topic: set.topic,
        issue: issueOf(set),
        summary: trim(set.text, 24),
        text: set.text,
        en: set.en,
        diff: set.diff || '',
        hasDiff: !!set.diff,
        srcName: src.srcName,
        srcUrl: src.srcUrl,
        done: !!record,
        starred,
        expanded,
        revealed: !!this.shownEn[set.id],
        toggleLabel: expanded ? '收起' : '展开',
        doneBtn: record ? '取消已背' : '标记已背',
        starBtn: starred ? '已收藏' : '收藏'
      })
    })
    rows.sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0))
    this.setData({ bankList: rows })
  },

  onSearch(event) {
    this.setData({ keyword: event.detail.value })
    this.clearSearchTimer()
    this.searchTimer = setTimeout(() => {
      this.searchTimer = null
      this.renderBank()
    }, 120)
  },

  clearSearch() {
    this.clearSearchTimer()
    this.setData({ keyword: '' })
    this.renderBank()
  },

  setLevel(event) {
    const level = event.currentTarget.dataset.level
    if (!level || level === this.data.levelFilter) return
    this.setData({ levelFilter: level })
    this.renderBank()
  },

  setYear(event) {
    const index = Number(event.detail.value) || 0
    this.setData({
      yearIndex: index,
      yearLabel: YEARS[index] || '全部年份'
    })
    this.renderBank()
  },

  toggleCard(event) {
    const id = event.currentTarget.dataset.id
    if (!id) return
    this.openCards[id] = !this.openCards[id]
    this.renderBank()
  },

  toggleEn(event) {
    const id = event.currentTarget.dataset.id
    if (!id) return
    this.shownEn[id] = !this.shownEn[id]
    this.renderBank()
  },

  toggleDone(event) {
    const id = event.currentTarget.dataset.id
    if (!SET_MAP[id]) return
    const prev = this.store.done[id]
    if (isDone(prev)) {
      // 取消时保留负时间戳，云端合并才知道这是更晚的操作
      this.store.done[id] = {
        at: Date.now(),
        result: prev.result === 'bad' ? 'bad' : 'ok',
        rev: prev.rev || 0,
        on: false
      }
    } else {
      this.store.done[id] = { at: Date.now(), result: 'ok', rev: 0, on: true }
    }
    this.save()
    this.renderAll()
  },

  // 取消标记写负时间戳，跨设备合并时「更晚的那次操作」才会生效
  toggleStar(event) {
    const id = event.currentTarget.dataset.id
    if (!id) return
    const next = !isOn(this.store.starred[id])
    this.store.starred[id] = next ? Date.now() : -Date.now()
    this.save()
    this.renderAll()
  },

  // ---------- 收藏 ----------
  // 收藏横跨真题套、提分句、真题原句三类，按收藏时间倒序分组展示
  renderStarred() {
    const groups = [
      { key: 'set', label: '真题套', items: [] },
      { key: 'advanced', label: '提分句', items: [] },
      { key: 'sentence', label: '真题原句', items: [] }
    ]
    const byKey = {}
    groups.forEach((group) => {
      byKey[group.key] = group
    })

    Object.keys(this.store.starred).forEach((id) => {
      if (!isOn(this.store.starred[id])) return
      const at = Number(this.store.starred[id]) || 0
      const set = SET_MAP[id]
      if (set) {
        byKey.set.items.push({
          id,
          at,
          type: 'set',
          title: set.topic,
          meta: issueOf(set),
          zh: set.text,
          en: set.en
        })
        return
      }
      const advanced = ADVANCED_MAP[id]
      if (advanced) {
        byKey.advanced.items.push({
          id,
          at,
          type: 'advanced',
          title: advanced.topic || '提分句',
          meta: '教研自编 · 非真题',
          zh: advanced.zh,
          en: advanced.en
        })
        return
      }
      const sentence = SENTENCE_MAP[id]
      if (sentence) {
        byKey.sentence.items.push({
          id,
          at,
          type: 'sentence',
          title: '真题原句',
          meta: String(sentence.note || '').split('；')[0],
          zh: sentence.zh,
          en: sentence.en
        })
      }
    })

    const visible = groups.filter((group) => {
      group.items.sort((a, b) => b.at - a.at)
      return group.items.length > 0
    })
    const total = visible.reduce((sum, group) => sum + group.items.length, 0)
    this.setData({
      starredGroups: visible,
      starredTotal: total,
      starredEmpty: total ? '' : '还没有收藏。在题库或金句里点「收藏」，条目会集中到这里。'
    })
  },

  practiceStarred(event) {
    const id = event.currentTarget.dataset.id
    if (!SET_MAP[id]) return
    this.openPractice([id], 0, false)
  },

  // ---------- 金句 ----------
  renderQuotes() {
    const isAdvanced = this.data.quoteGroup === 'advanced'
    const keyword = String(this.data.quoteKeyword || '').trim().toLowerCase()
    const source = isAdvanced ? ADVANCED_QUOTES : (sentences || [])
    const rows = []
    source.forEach((item) => {
      if (keyword) {
        // 提分句多搜一个话题字段；备注不参与搜索
        const hay = isAdvanced
          ? (item.zh + ' ' + item.en + ' ' + (item.topic || '')).toLowerCase()
          : (item.zh + ' ' + item.en).toLowerCase()
        if (hay.indexOf(keyword) < 0) return
      }
      const starred = isOn(this.store.starred[item.id])
      const known = isOn(this.store.quotes.known[item.id])
      const open = !!this.openQuotes[item.id]
      // 真题原句的备注前半段是出处（如「2026.6 四级参考答案（第一套）」），后半段才是翻译提示
      const note = String(item.note || '')
      const parts = isAdvanced ? ['', note] : note.split('；')
      rows.push({
        id: item.id,
        zh: item.zh,
        en: item.en,
        topic: item.topic || '',
        note,
        quoteSrc: parts[0] || '',
        quoteTip: isAdvanced
          ? String(note).replace(/^提分点[:：]\s*/, '')
          : parts.slice(1).join('；'),
        noteText: String(note).replace(/^提分点[:：]\s*/, ''),
        starred,
        known,
        knownLabel: known ? '取消已背' : '标记已背',
        open,
        toggleLabel: isAdvanced
          ? (open ? '收起' : '看高级表达')
          : (open ? '收起译文' : '显示译文')
      })
    })
    rows.sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0))
    let quoteEmpty = ''
    if (!rows.length) {
      if (!source.length) quoteEmpty = isAdvanced ? '暂无提分句' : '暂无金句'
      else quoteEmpty = '没找到，换个词试试'
    }
    this.setData({
      quoteList: rows,
      quoteEmpty,
      quotePh: isAdvanced ? '搜中文、英文或话题' : '搜中文或英文金句'
    })
  },

  pickQuoteGroup(event) {
    const key = event.currentTarget.dataset.key
    if (!key || key === this.data.quoteGroup) return
    this.clearQuoteTimer()
    this.setData({ quoteGroup: key, quoteKeyword: '' })
    this.renderQuotes()
  },

  onQuoteSearch(event) {
    this.setData({ quoteKeyword: event.detail.value })
    this.clearQuoteTimer()
    this.quoteTimer = setTimeout(() => {
      this.quoteTimer = null
      this.renderQuotes()
    }, 120)
  },

  clearQuoteSearch() {
    this.clearQuoteTimer()
    this.setData({ quoteKeyword: '' })
    this.renderQuotes()
  },

  toggleQuote(event) {
    const id = event.currentTarget.dataset.id
    if (!id) return
    this.openQuotes[id] = !this.openQuotes[id]
    this.renderQuotes()
  },

  // 提分句已背：取消写负时间戳，切分组、搜索都靠 store 还原状态
  toggleQuoteKnown(event) {
    const id = event.currentTarget.dataset.id
    if (!id) return
    const known = this.store.quotes.known
    const next = !isOn(known[id])
    known[id] = next ? Date.now() : -Date.now()
    this.save()
    this.renderQuotes()
    this.renderPlan()
  },

  // ---------- 词汇 ----------
  renderVocab() {
    const keyword = String(this.data.vocabKeyword || '').trim().toLowerCase()
    if (keyword) {
      this.renderVocabSearch(keyword)
      return
    }
    const chip = this.data.vocabChip
    if (chip === 'predict') {
      this.renderPredict()
      return
    }
    if (chip === 'pitfall') {
      this.renderPitfalls()
      return
    }
    this.renderVocabChapter(chip)
  },

  // 只把当前章的节和已展开节里的词条放进 data
  renderVocabChapter(chipId) {
    const chapter = CHAPTER_MAP[chipId] || VOCAB_CHAPTERS[0]
    const known = this.store.vocab.known
    const index = {}
    let totalRows = 0
    let done = countKnown(known, chapter.id + '-')

    const sections = chapter.sections.map((section, si) => {
      const open = !!this.openSections[chapter.id + '|' + section.id]
      let secDone = 0
      const rows = []
      section.rows.forEach((row, ri) => {
        const key = chapter.id + '-' + section.id + '-' + ri
        const isKnown = isOn(known[key])
        if (isKnown) secDone += 1
        if (!open) return
        index[key] = { s: si, r: ri }
        rows.push({
          key,
          zh: row.zh,
          en: row.en,
          note: row.note || '',
          known: isKnown,
          revealed: !!this.vocabReveal[key]
        })
      })
      totalRows += section.rows.length
      return {
        id: section.id,
        title: section.title,
        total: section.rows.length,
        countLabel: secDone + '/' + section.rows.length,
        open,
        rows
      }
    })

    this.vocabRowIndex = index
    this.setData({
      vocabMode: 'chapter',
      vocabSearching: false,
      vocabChip: chapter.id,
      vocabChapter: {
        id: chapter.id,
        name: chapter.name,
        total: totalRows,
        doneLabel: '已背 ' + done + ' / ' + totalRows + ' 条',
        sections
      },
      vocabResults: [],
      predictGroups: [],
      pitfalls: []
    })
  },

  // 跨 11 章 + 预测做扁平搜索，最多 60 条
  renderVocabSearch(keyword) {
    const rows = []
    const index = {}
    for (let i = 0; i < VOCAB_SEARCH.length; i += 1) {
      const item = VOCAB_SEARCH[i]
      if (item.hay.indexOf(keyword) < 0) continue
      index[item.key] = rows.length
      rows.push({
        key: item.key,
        zh: item.zh,
        en: item.en,
        from: item.from,
        revealed: !!this.vocabReveal[item.key]
      })
      if (rows.length >= 60) break
    }
    this.searchRowIndex = index
    this.setData({
      vocabMode: 'search',
      vocabSearching: true,
      vocabResults: rows,
      vocabChapter: null,
      predictGroups: [],
      pitfalls: []
    })
  },

  renderPredict() {
    const kind = this.data.predictKind === 'sentence' ? 'sentence' : 'word'
    const groups = []
    const groupMap = {}
    const index = {}
    VOCAB_PREDICTIONS.forEach((item) => {
      if (item.kind !== kind) return
      let group = groupMap[item.dir]
      if (!group) {
        group = { g: groups.length, title: item.dir, rows: [] }
        groupMap[item.dir] = group
        groups.push(group)
      }
      index[item.id] = { g: group.g, r: group.rows.length }
      group.rows.push({
        id: item.id,
        zh: item.zh,
        en: item.en,
        src: item.src,
        srcReal: item.src !== '预测',
        sentence: item.kind === 'sentence',
        revealed: !!this.vocabReveal[item.id]
      })
    })
    this.predictIndex = index
    this.setData({
      vocabMode: 'predict',
      vocabSearching: false,
      vocabChip: 'predict',
      predictKind: kind,
      predictGroups: groups,
      vocabChapter: null,
      vocabResults: [],
      pitfalls: []
    })
  },

  renderPitfalls() {
    this.setData({
      vocabMode: 'pitfall',
      vocabSearching: false,
      vocabChip: 'pitfall',
      pitfalls: VOCAB_PITFALLS.map((item) => ({ title: item.title, body: item.body })),
      vocabChapter: null,
      vocabResults: [],
      predictGroups: []
    })
  },

  onVocabSearch(event) {
    this.setData({ vocabKeyword: event.detail.value })
    this.clearVocabTimer()
    this.vocabTimer = setTimeout(() => {
      this.vocabTimer = null
      this.renderVocab()
    }, 120)
  },

  clearVocabSearch() {
    this.clearVocabTimer()
    this.setData({ vocabKeyword: '' })
    this.renderVocab()
  },

  pickVocabChip(event) {
    const key = event.currentTarget.dataset.key
    if (!key || key === this.data.vocabChip) return
    this.setData({ vocabChip: key })
    this.renderVocab()
  },

  pickPredictKind(event) {
    const key = event.currentTarget.dataset.key
    if (!key || key === this.data.predictKind) return
    this.setData({ predictKind: key })
    this.renderPredict()
  },

  toggleSection(event) {
    const id = event.currentTarget.dataset.id
    if (!id) return
    const key = this.data.vocabChip + '|' + id
    this.openSections[key] = !this.openSections[key]
    this.renderVocabChapter(this.data.vocabChip)
  },

  // 点行揭开 / 遮回英文；按当前视图只改对应那一条
  toggleVocabEn(event) {
    const key = event.currentTarget.dataset.key
    if (!key) return
    const next = !this.vocabReveal[key]
    if (next) this.vocabReveal[key] = true
    else delete this.vocabReveal[key]
    const patch = {}
    if (this.data.vocabMode === 'search') {
      const at = this.searchRowIndex[key]
      if (at === undefined) return
      patch['vocabResults[' + at + '].revealed'] = next
    } else if (this.data.vocabMode === 'predict') {
      const loc = this.predictIndex[key]
      if (!loc) return
      patch['predictGroups[' + loc.g + '].rows[' + loc.r + '].revealed'] = next
    } else {
      const loc = this.vocabRowIndex[key]
      if (!loc) return
      patch['vocabChapter.sections[' + loc.s + '].rows[' + loc.r + '].revealed'] = next
    }
    this.setData(patch)
  },

  // 圆点用 catchtap，避免顺带触发展开或揭英文
  toggleKnown(event) {
    const key = event.currentTarget.dataset.key
    if (!key || !this.vocabRowIndex[key]) return
    const known = this.store.vocab.known
    const next = !isOn(known[key])
    known[key] = next ? Date.now() : -Date.now()
    this.save()

    const loc = this.vocabRowIndex[key]
    const chapter = this.data.vocabChapter
    if (!chapter) {
      this.renderPlan()
      return
    }
    const section = chapter.sections[loc.s]
    if (!section) return
    // 计数只认正数时间戳，取消后写 0 的那条不会再被算进来
    const secPrefix = chapter.id + '-' + section.id + '-'
    const secDone = countKnown(known, secPrefix)
    const done = countKnown(known, chapter.id + '-')
    const patch = {}
    patch['vocabChapter.sections[' + loc.s + '].rows[' + loc.r + '].known'] = next
    patch['vocabChapter.sections[' + loc.s + '].countLabel'] = secDone + '/' + section.total
    patch['vocabChapter.doneLabel'] = '已背 ' + done + ' / ' + chapter.total + ' 条'
    this.setData(patch)
    this.renderPlan()
  },

  // ---------- 计划 ----------
  renderPlan() {
    const plan = this.store.plan
    const start = parseStart(plan.startAt)
    const totalDays = Math.ceil(TOTAL / plan.perDay)
    const todayIndex = dayIndex(dayStart(new Date())) - dayIndex(start)
    const all = []
    for (let i = 0; i < totalDays; i += 1) {
      const date = addDays(start, i)
      const names = SCHEDULE
        .slice(i * plan.perDay, i * plan.perDay + plan.perDay)
        .map((set) => set.topic)
        .join('、')
      all.push({
        key: dayKey(date),
        dayLabel: monthDay(date),
        week: '周' + WEEK[date.getDay()],
        names,
        today: i === todayIndex
      })
    }

    // 排期很长时只看今天前后各 14 天，中间折叠成一行提示
    let from = 0
    let to = all.length
    if (all.length > 29) {
      const center = Math.max(0, Math.min(all.length - 1, todayIndex))
      from = Math.max(0, center - 14)
      to = Math.min(all.length, from + 29)
      from = Math.max(0, to - 29)
    }

    const finish = addDays(start, totalDays - 1)
    this.setData({
      perDay: plan.perDay,
      startAt: plan.startAt,
      startLabel: plan.startAt,
      reviewOn: plan.review,
      schedule: all.slice(from, to),
      scheduleHintBefore: from > 0 ? '上面还有 ' + from + ' 天已折叠' : '',
      scheduleHintAfter: to < all.length ? '下面还有 ' + (all.length - to) + ' 天已折叠' : '',
      stats: {
        done: this.doneCount(),
        vocab: countKnown(this.store.vocab.known, 'c'),
        quotes: countQuoteKnown(this.store.quotes.known),
        starred: countStarred(this.store.starred),
        finishLabel: monthDay(finish)
      }
    })
  },

  // 每日套数：既能点，也能按住左右滑，滑到哪一档松手就切到哪一档
  segStart(event) {
    segSwipe.start(this, event, '.plan-seg', PER_DAY.length, PER_DAY.indexOf(this.store.plan.perDay))
  },

  segMove(event) {
    segSwipe.move(this, event, (index) => {
      if (this.data.segDrag !== index) this.setData({ segDrag: index })
    })
  },

  segEnd(event) {
    segSwipe.end(this, event, (index) => this.applyPerDay(PER_DAY[index]))
    if (this.data.segDrag !== -1) this.setData({ segDrag: -1 })
  },

  segCancel() {
    segSwipe.cancel(this)
    if (this.data.segDrag !== -1) this.setData({ segDrag: -1 })
  },

  setPerDay(event) {
    if (segSwipe.isTapBlocked(this)) return
    this.applyPerDay(Number(event.currentTarget.dataset.n))
  },

  applyPerDay(value) {
    if (PER_DAY.indexOf(value) < 0 || value === this.store.plan.perDay) return
    this.store.plan.perDay = value
    this.store.plan.planAt = Date.now()
    this.save()
    this.renderAll()
  },

  setStartAt(event) {
    const value = event.detail.value
    if (!value) return
    this.store.plan.startAt = value
    this.store.plan.planAt = Date.now()
    this.save()
    this.renderAll()
  },

  setReview(event) {
    this.store.plan.review = !!event.detail.value
    this.store.plan.planAt = Date.now()
    this.save()
    this.renderAll()
  },

  resetProgress() {
    wx.showModal({
      title: '重置进度',
      content: '会清空已背记录、词汇进度、提分句和收藏，排期设置保留。',
      confirmText: '重置',
      confirmColor: '#a86a11',
      success: (res) => {
        if (!res.confirm) return
        this.store.done = {}
        this.store.starred = {}
        this.store.vocab.known = {}
        this.store.quotes.known = {}
        this.store.resetAt = Date.now()
        this.save()
        this.renderAll()
        wx.showToast({ title: '已重置', icon: 'none' })
      }
    })
  },

  // ---------- 通用 ----------
  toggleScope() {
    this.setData({ scopeOpen: !this.data.scopeOpen })
  },

  switchTab(event) {
    const tab = event.currentTarget.dataset.key
    if (!tab || tab === this.data.tab) return
    this.setData({ tab })
    this.renderAll()
  },

  noop() {}
})
