// 复习曲线：1 / 3 / 7 / 15 / 30 / 90 / 180 天，所有词都在队列里，已掌握的词也会半年回访一次。
// 三档：不认识退两档、模糊退一档、认识连续两次升一档；档位由系统维护，不靠用户手动毕业。
const checkin = require('./checkin')
const wordbook = require('./wordbook')

const DAY = 24 * 60 * 60 * 1000
const INTERVALS = [1, 3, 7, 15, 30, 90, 180]
const LOG_KEY = 'reviewLog'
const PENDING_KEY = 'reviewPending'
const MIGRATED_KEY = 'reviewMigrated'
// 每日复习目标：单词 30 条、词组 20 条、语法 10 条，用户可以在复习页顶部直接改。
// 目标不是硬上限：到期不够时，会从最近将到期的条目里提前补足，保证每天的复习量。
const TARGET_KEY = 'reviewTargets'
const TARGET_DEFAULT = { vocab: 30, phrase: 20, grammar: 10 }
const TARGET_OPTIONS = { vocab: [10, 20, 30, 50], phrase: [10, 20, 30, 50], grammar: [5, 10, 15, 20] }
const CAP_KEY = 'reviewCapBoost'

function readLog(key) {
  try {
    const saved = wx.getStorageSync(key || LOG_KEY)
    return saved && typeof saved === 'object' ? saved : {}
  } catch (error) {
    return {}
  }
}

function writeLog(log, key) {
  try {
    wx.setStorageSync(key || LOG_KEY, log)
  } catch (error) {}
}

function readPending() {
  try {
    const saved = wx.getStorageSync(PENDING_KEY)
    return saved && typeof saved === 'object' ? saved : {}
  } catch (error) {
    return {}
  }
}

function writePending(pending) {
  try {
    wx.setStorageSync(PENDING_KEY, pending)
  } catch (error) {}
}

function markPending(id, at) {
  const pending = readPending()
  pending[id] = at
  writePending(pending)
}

// 只清掉「这一次推上去的那条」：如果请求还在路上时又复习了同一个词，
// 新的待同步记录必须留着，不能被旧请求的返回值顺手删掉
function clearPending(id, at) {
  const pending = readPending()
  if (!Object.prototype.hasOwnProperty.call(pending, id)) return
  if (at && pending[id] !== at) return
  delete pending[id]
  writePending(pending)
}

function readFlag(key) {
  try {
    return wx.getStorageSync(key) === true
  } catch (error) {
    return false
  }
}

function writeFlag(key, value) {
  try {
    wx.setStorageSync(key, value)
  } catch (error) {}
}

function dayStart(time) {
  const date = new Date(Number(time) || Date.now())
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

// 每日复习目标：设置值 + 今天点过「再复习一批」临时加的额度
function kindOf(kind) {
  if (kind === 'grammar' || kind === 'phrase') return kind
  return 'vocab'
}

// 用户设置的每日目标（不含「再复习一批」临时加的额度）
function baseTarget(kind) {
  const key = kindOf(kind)
  const saved = readLog(TARGET_KEY)
  const value = Number(saved[key])
  return TARGET_OPTIONS[key].indexOf(value) >= 0 ? value : TARGET_DEFAULT[key]
}

function setTarget(kind, value) {
  const key = kindOf(kind)
  const next = Number(value)
  if (TARGET_OPTIONS[key].indexOf(next) < 0) return baseTarget(key)
  const saved = readLog(TARGET_KEY)
  saved[key] = next
  writeLog(saved, TARGET_KEY)
  return next
}

function extraOf(kind, now) {
  const key = kindOf(kind)
  const today = dayStart(now)
  const saved = readLog(CAP_KEY)
  if (!saved || Number(saved.date) !== today) return 0
  // 兼容旧版 { date, extra: 30 }：旧额度只算给词汇
  if (typeof saved.extra === 'number') return key === 'vocab' ? Number(saved.extra) || 0 : 0
  return Number(saved.extra && saved.extra[key]) || 0
}

function targetOf(kind, now) {
  return baseTarget(kind) + extraOf(kind, now)
}

function boostCap(kind, now) {
  const key = kindOf(kind)
  const today = dayStart(now)
  const saved = readLog(CAP_KEY)
  const old = saved && Number(saved.date) === today ? saved.extra : null
  const extra = {
    vocab: old && typeof old === 'object' ? Number(old.vocab) || 0 : (typeof old === 'number' ? Number(old) || 0 : 0),
    phrase: old && typeof old === 'object' ? Number(old.phrase) || 0 : 0,
    grammar: old && typeof old === 'object' ? Number(old.grammar) || 0 : 0
  }
  extra[key] += baseTarget(key)
  writeLog({ date: today, extra }, CAP_KEY)
  return targetOf(key, now)
}

// createdAt 从云端回来可能是 Date、时间戳、ISO 字符串或 { $date }
function toTime(value) {
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

function intervalLabel(days) {
  return days === 180 ? '半年' : `${days} 天`
}

// 卡片上的一句话说明：180 天说成「记下后半年」比「第 180 天」更像人话
function whenLabel(days) {
  return days === 180 ? '记下后半年' : `记下后第 ${days} 天`
}

// 三档复习：不认识 / 模糊 / 认识。档位由系统升降，不再由用户手动「毕业」。
// 记住一条记录只需要 stage（0-6）、due（下次到期时间）、streak（连续认识次数）。
function clampStage(value) {
  return Math.min(Math.max(Number(value) || 0, 0), INTERVALS.length - 1)
}

// 旧版记录只有 base + stage，没有 due：按原来的间隔换算成到期日
function legacyEntryOf(raw, item, today) {
  if (raw && typeof raw === 'object') {
    const stage = clampStage(raw.stage)
    const due = Number(raw.due) ||
      (Number(raw.base) ? Number(raw.base) + INTERVALS[stage] * DAY : today + INTERVALS[stage] * DAY)
    return {
      stage,
      due,
      streak: Number(raw.streak) || 0,
      lastAt: Number(raw.lastAt) || 0
    }
  }
  if (typeof raw === 'number' && raw > 0) {
    return { stage: 0, due: raw + DAY, streak: 0, lastAt: raw }
  }
  // 从没复习过的词：已经标「记得」的按「已掌握」半年后回访，其余明天第一次复习
  if (item && item.state === 'known') {
    const knownAt = toTime(item.knownAt) || toTime(item.createdAt) || today
    return {
      stage: INTERVALS.length - 1,
      due: Math.max(knownAt + INTERVALS[INTERVALS.length - 1] * DAY, today + 3 * DAY),
      streak: 0,
      lastAt: 0
    }
  }
  const createdAt = toTime(item && item.createdAt) || today
  return { stage: 0, due: Math.max(createdAt + DAY, today), streak: 0, lastAt: 0 }
}

// 进度跟着词条存在云端，换手机也能接着复习；本地记录更新时（离线复习过）以本地为准
function entryOf(raw, item, today) {
  const local = legacyEntryOf(raw, item, today)
  const cloudAt = Number(item && item.reviewAt) || 0
  const hasCloud = cloudAt > 0 || Number(item && item.reviewDue) > 0
  if (hasCloud && local.lastAt <= cloudAt) {
    const stage = clampStage(item.reviewStage === undefined ? INTERVALS.length - 1 : item.reviewStage)
    const cloudDue = Number(item.reviewDue) ||
      (Number(item.reviewBase) ? Number(item.reviewBase) + INTERVALS[stage] * DAY : today)
    return {
      stage,
      due: cloudDue,
      streak: Number(item.reviewStreak) || 0,
      lastAt: cloudAt
    }
  }
  return local
}

// 累计复习过多少个词：本地记录和云端进度取并集。
// 首页首周任务只需要一个数字，不重复拉词库。
function reviewedTotal(items) {
  const log = readLog()
  const ids = {}
  Object.keys(log).forEach((id) => {
    if (log[id]) ids[id] = true
  })
  ;(Array.isArray(items) ? items : []).forEach((item) => {
    if (item && Number(item.reviewAt) > 0) ids[item.id] = true
  })
  return Object.keys(ids).length
}

function dueAtOf(entry) {
  return entry.due
}

function curveOf(stage) {
  return INTERVALS.map((days, index) => ({
    label: intervalLabel(days),
    state: index < stage ? 'done' : (index === stage ? 'now' : 'todo')
  }))
}

// 给每条内容附上排期信息，按到期时间从早到晚排好；到期和未到期都用这份结果
function scheduleOf(items, now, options) {
  const log = readLog(options && options.logKey)
  const today = dayStart(now)
  const queue = []
  ;(Array.isArray(items) ? items : []).forEach((item) => {
    if (!item) return
    const entry = entryOf(log[item.id], item, today)
    queue.push(Object.assign({}, item, {
      stage: entry.stage,
      due: entry.due,
      streak: entry.streak,
      reviewNo: entry.stage + 1,
      interval: INTERVALS[entry.stage],
      intervalLabel: intervalLabel(INTERVALS[entry.stage]),
      when: whenLabel(INTERVALS[entry.stage]),
      dueAt: entry.due,
      lastAt: entry.lastAt,
      curve: curveOf(entry.stage)
    }))
  })
  return queue.sort((a, b) => a.dueAt - b.dueAt || String(a.word).localeCompare(String(b.word)))
}

// 今天该复习的内容：所有内容都参与排期，包括已经「记得」的，只是间隔更长
// options.logKey：语法卡等其它类型用独立日志，互不干扰
function dueQueue(items, now, options) {
  const today = dayStart(now)
  return scheduleOf(items, now, options).filter((item) => dayStart(item.dueAt) <= today)
}

// 今日队列：先排到期卡；到期不够每日目标时，从最近将到期的内容里提前补足。
// 这样「昨天学 30 个，今天目标 30」就不会因为只有 10 条到期而变成只复习 10 条。
function planOf(items, kind, now, options) {
  const today = dayStart(now)
  const all = scheduleOf(items, now, options)
  const due = all.filter((item) => dayStart(item.dueAt) <= today)
  const stats = todayStats(items, now, options)
  const target = targetOf(kind, now)
  const left = Math.max(0, target - stats.doneToday)
  const queue = due.slice(0, left)
  const more = due.length - queue.length
  if (queue.length < left) {
    all
      // 今天已经复习过的不要当补足卡再拉一次
      .filter((item) => dayStart(item.dueAt) > today && dayStart(item.lastAt) !== today)
      .slice(0, left - queue.length)
      .forEach((item) => queue.push(Object.assign({}, item, { early: true })))
  }
  // 还没排进今天队列的内容，用户点「再复习一批」时可以继续加
  const rest = all.length - queue.length - stats.doneToday
  return {
    queue,
    due: due.length,
    more,
    rest: Math.max(0, rest),
    target,
    batch: baseTarget(kind),
    early: queue.filter((item) => item.early).length,
    doneToday: stats.doneToday,
    total: queue.length + stats.doneToday,
    nextAt: stats.nextAt,
    nextCount: stats.nextCount,
    nextLabel: stats.nextLabel
  }
}

// 首页入口：今天到期多少、今天已经复习过多少、下一次什么时候到期
function todayStats(items, now, options) {
  const log = readLog(options && options.logKey)
  const today = dayStart(now)
  let due = 0
  let doneToday = 0
  let nextAt = 0
  let nextCount = 0
  ;(Array.isArray(items) ? items : []).forEach((item) => {
    if (!item) return
    // 今天复习过几次：云端 reviewAt 和本地记录取较新的那个
    const raw = log[item.id]
    const localAt = typeof raw === 'number' ? raw : Number(raw && raw.lastAt) || 0
    const doneAt = Math.max(Number(item.reviewAt) || 0, localAt)
    if (doneAt && dayStart(doneAt) === today) doneToday += 1
    const entry = entryOf(raw, item, today)
    const at = dayStart(dueAtOf(entry))
    if (at <= today) {
      due += 1
      return
    }
    if (!nextAt || at < nextAt) {
      nextAt = at
      nextCount = 1
    } else if (at === nextAt) {
      nextCount += 1
    }
  })
  const nextDays = nextAt ? Math.round((nextAt - today) / DAY) : 0
  return {
    due,
    doneToday,
    total: due + doneToday,
    nextAt,
    nextCount,
    nextLabel: nextAt ? (nextDays <= 1 ? '明天' : `${nextDays} 天后`) : ''
  }
}

// 首页入口：把词汇和语法两份日志的统计合成一个数字
function combineStats(list) {
  let due = 0
  let doneToday = 0
  let nextAt = 0
  let nextCount = 0
  ;(Array.isArray(list) ? list : []).forEach((stats) => {
    if (!stats) return
    due += stats.due
    doneToday += stats.doneToday
    if (stats.nextAt && (!nextAt || stats.nextAt < nextAt)) {
      nextAt = stats.nextAt
      nextCount = stats.nextCount
    } else if (stats.nextAt && stats.nextAt === nextAt) {
      nextCount += stats.nextCount
    }
  })
  const nextDays = nextAt ? Math.round((nextAt - dayStart()) / DAY) : 0
  return {
    due,
    doneToday,
    total: due + doneToday,
    nextAt,
    nextCount,
    nextLabel: nextAt ? (nextDays <= 1 ? '明天' : `${nextDays} 天后`) : ''
  }
}

// 三档推进：
// 不认识 → 退两档，明天再来；模糊 → 退一档，明天再来；认识 → 连续两次才升一档
// 一直不点「认识」的词不会被判死刑，也不会被移出复习队列。
function advance(id, entry, result, options) {
  const logKey = options && options.logKey
  const log = readLog(logKey)
  const now = Date.now()
  const today = dayStart(now)
  const current = clampStage(entry && entry.stage)
  const streak = Number(entry && entry.streak) || 0
  let nextStage = current
  let nextStreak = streak
  let due = today + DAY
  let restarted = false

  if (result === 'unknown') {
    nextStage = Math.max(0, current - 2)
    nextStreak = 0
    restarted = true
  } else if (result === 'fuzzy') {
    nextStage = Math.max(0, current - 1)
    nextStreak = 0
    restarted = true
  } else {
    // 提前复习答对时不动排期，免得把 90 天的间隔重置成 3 天
    if (Number(entry && entry.due) > today) {
      nextStage = current
      nextStreak = streak
      due = Number(entry.due)
    } else {
      nextStreak = streak + 1
      if (nextStreak >= 2) {
        nextStage = Math.min(current + 1, INTERVALS.length - 1)
        nextStreak = 0
        due = today + INTERVALS[nextStage] * DAY
      }
    }
  }

  log[id] = { stage: nextStage, due, streak: nextStreak, lastAt: now, lastResult: result }
  writeLog(log, logKey)
  // 复习一个词就算今天打过卡
  checkin.mark('review')

  // 语法卡只存在本地：云端语法本没有排期字段，跳过上云推送
  if (!options || options.sync !== false) pushReview(id, log[id])
  return {
    stage: nextStage,
    due,
    streak: nextStreak,
    mastered: nextStage >= INTERVALS.length - 1,
    restarted,
    nextAt: due,
    nextDays: Math.round((due - today) / DAY)
  }
}

// 单条进度立刻上云；失败就留在待同步里，下次进复习页补推
function pushReview(id, entry) {
  markPending(id, entry.lastAt)
  const payload = {}
  payload[id] = {
    stage: entry.stage,
    due: entry.due,
    streak: entry.streak || 0,
    lastAt: entry.lastAt
  }
  return wordbook.syncReview(payload)
    .then(() => clearPending(id, entry.lastAt))
    .catch(() => {})
}

// 老版本只把进度存在本地，升级后把整份日志推一次上云；之后再补推离线期间的记录
function syncOnce() {
  if (!readFlag(MIGRATED_KEY)) {
    const log = readLog()
    Object.keys(log).forEach((id) => {
      const entry = log[id]
      const at = typeof entry === 'number' ? entry : Number(entry && entry.lastAt) || 0
      if (at) markPending(id, at)
    })
    writeFlag(MIGRATED_KEY, true)
  }

  const pending = readPending()
  const ids = Object.keys(pending)
  if (!ids.length) return Promise.resolve({ synced: 0 })

  const log = readLog()
  const payload = {}
  ids.forEach((id) => {
    const raw = log[id]
    if (!raw) return
    const entry = typeof raw === 'number' ? { stage: 0, due: raw + DAY, lastAt: raw } : raw
    const stage = clampStage(entry.stage)
    const due = Number(entry.due) ||
      (Number(entry.base) ? Number(entry.base) + INTERVALS[stage] * DAY : 0)
    const lastAt = Number(entry.lastAt) || 0
    if (!due || !lastAt) return
    payload[id] = { stage, due, streak: Number(entry.streak) || 0, lastAt }
  })

  if (!Object.keys(payload).length) {
    writePending({})
    return Promise.resolve({ synced: 0 })
  }

  // 记下这一批推上去的时间戳：回来时只删「没被新复习覆盖」的那些，
  // 免得上云途中又复习同一个词，新的待同步被一起清空
  const sentAt = {}
  Object.keys(payload).forEach((id) => {
    sentAt[id] = pending[id]
  })

  return wordbook.syncReview(payload)
    .then((data) => {
      const latest = readPending()
      Object.keys(sentAt).forEach((id) => {
        if (latest[id] === sentAt[id]) delete latest[id]
      })
      writePending(latest)
      return data || { synced: 0 }
    })
    .catch(() => ({ synced: 0 }))
}

// 语法本用：读一张卡最近一次自评（不认识 / 模糊 / 认识）。
// 没有记录就是新收进来的「待复习」；老记录没有 lastResult 时按档位粗略还原。
function stateOf(id, options) {
  const raw = readLog(options && options.logKey)[id]
  if (!raw || typeof raw !== 'object') return ''
  if (raw.lastResult) return raw.lastResult
  const stage = clampStage(raw.stage)
  if (stage >= INTERVALS.length - 1) return 'known'
  if (stage >= 3) return 'fuzzy'
  return 'unknown'
}

// 背诵模式用：自评前要拿到这张卡现在的档位，交给 advance 推进
function entryFor(id, options) {
  const raw = readLog(options && options.logKey)[id]
  return {
    stage: clampStage(raw && raw.stage),
    due: Number(raw && raw.due) || 0,
    streak: Number(raw && raw.streak) || 0
  }
}

module.exports = { INTERVALS, TARGET_OPTIONS, targetOf, baseTarget, setTarget, boostCap, planOf, dueQueue, todayStats, combineStats, advance, syncOnce, intervalLabel, whenLabel, curveOf, reviewedTotal, stateOf, entryFor }
