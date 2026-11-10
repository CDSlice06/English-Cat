// 复习曲线：新词记下的第 1 / 3 / 7 / 15 / 30 / 180 天各复习一次。
// 日期从「记下这个词」那天起算，所以第 4 天会同时复习第 1 天（间隔 3 天）和第 3 天（间隔 1 天）的词。
const checkin = require('./checkin')

const DAY = 24 * 60 * 60 * 1000
const INTERVALS = [1, 3, 7, 15, 30, 180]
const LOG_KEY = 'reviewLog'

function readLog() {
  try {
    const saved = wx.getStorageSync(LOG_KEY)
    return saved && typeof saved === 'object' ? saved : {}
  } catch (error) {
    return {}
  }
}

function writeLog(log) {
  try {
    wx.setStorageSync(LOG_KEY, log)
  } catch (error) {}
}

function dayStart(time) {
  const date = new Date(Number(time) || Date.now())
  date.setHours(0, 0, 0, 0)
  return date.getTime()
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

// 补全一条复习记录：旧版只存了时间戳，从那次复习按第 1 次重新走曲线
function entryOf(raw, item, today) {
  if (raw && typeof raw === 'object') {
    const stage = Math.min(Math.max(Number(raw.stage) || 0, 0), INTERVALS.length)
    return {
      stage,
      base: Number(raw.base) || toTime(item && item.createdAt) || today,
      lastAt: Number(raw.lastAt) || 0
    }
  }
  if (typeof raw === 'number' && raw > 0) {
    return { stage: 0, base: raw, lastAt: raw }
  }
  return { stage: 0, base: toTime(item && item.createdAt) || today, lastAt: 0 }
}

function dueAtOf(entry) {
  if (entry.stage >= INTERVALS.length) return 0
  return entry.base + INTERVALS[entry.stage] * DAY
}

function curveOf(stage) {
  return INTERVALS.map((days, index) => ({
    label: intervalLabel(days),
    state: index < stage ? 'done' : (index === stage ? 'now' : 'todo')
  }))
}

// 今天该复习的词：只取「不记得」的词，按到期日从早到晚排
function dueQueue(items, now) {
  const log = readLog()
  const today = dayStart(now)
  const queue = []
  ;(Array.isArray(items) ? items : []).forEach((item) => {
    if (!item || item.state === 'known') return
    const entry = entryOf(log[item.id], item, today)
    if (entry.stage >= INTERVALS.length) return
    const dueAt = dueAtOf(entry)
    if (dayStart(dueAt) > today) return
    queue.push(Object.assign({}, item, {
      stage: entry.stage,
      base: entry.base,
      reviewNo: entry.stage + 1,
      interval: INTERVALS[entry.stage],
      intervalLabel: intervalLabel(INTERVALS[entry.stage]),
      when: whenLabel(INTERVALS[entry.stage]),
      dueAt,
      curve: curveOf(entry.stage)
    }))
  })
  return queue.sort((a, b) => a.dueAt - b.dueAt || String(a.word).localeCompare(String(b.word)))
}

// 首页入口：今天到期多少、今天已经复习过多少、下一次什么时候到期
function todayStats(items, now) {
  const log = readLog()
  const today = dayStart(now)
  const ids = new Set()
  let due = 0
  let doneToday = 0
  let nextAt = 0
  let nextCount = 0
  ;(Array.isArray(items) ? items : []).forEach((item) => {
    if (!item) return
    ids.add(item.id)
    if (item.state === 'known') return
    const entry = entryOf(log[item.id], item, today)
    if (entry.stage >= INTERVALS.length) return
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
  Object.keys(log).forEach((id) => {
    if (!ids.has(id)) return
    const entry = log[id]
    const at = typeof entry === 'number' ? entry : Number(entry && entry.lastAt) || 0
    if (at && dayStart(at) === today) doneToday += 1
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

// 复习完一个词：推进到下一档间隔；最后一档仍不记得就重新从明天开始一轮
function advance(id, base, stage, remembered) {
  const log = readLog()
  const now = Date.now()
  const today = dayStart(now)
  const current = Math.min(Math.max(Number(stage) || 0, 0), INTERVALS.length - 1)
  let nextStage = current + 1
  let nextBase = Number(base) || today
  let restarted = false
  let graduated = false
  if (nextStage >= INTERVALS.length) {
    if (remembered) {
      graduated = true
    } else {
      nextStage = 0
      nextBase = today
      restarted = true
    }
  } else if (dayStart(nextBase + INTERVALS[nextStage] * DAY) <= today) {
    // 这次复习已经晚于原计划：把曲线起点挪到今天，避免刚复习完又立刻到期
    nextBase = today
  }
  log[id] = { stage: nextStage, base: nextBase, lastAt: now }
  writeLog(log)
  // 复习一个词就算今天打过卡
  checkin.mark('review')
  return {
    stage: nextStage,
    graduated,
    restarted,
    nextAt: graduated ? 0 : nextBase + INTERVALS[nextStage] * DAY,
    nextDays: graduated ? 0 : INTERVALS[nextStage]
  }
}

module.exports = { INTERVALS, dueQueue, todayStats, advance }
