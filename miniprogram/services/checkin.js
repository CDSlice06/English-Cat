// 每日打卡：今天真的学了一点，就在日历上盖一枚章。
// 本地 checkinLog 是读取源（快照），按自然日去重；同一天多次学习也只算一次打卡。
// 每枚章都会挑合适时机并到云函数 checkin，换手机或清缓存后能把日历接回来。
const DAY = 24 * 60 * 60 * 1000
const KEY = 'checkinLog'
const WEEK = ['日', '一', '二', '三', '四', '五', '六']
const CLOUD_FN = 'checkin'
// 一次学习可能连着盖好几个章，攒 4 秒只发一个同步请求
const SYNC_DELAY = 4000
const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/
let syncTimer = null

function pad(value) {
  return value < 10 ? `0${value}` : `${value}`
}

function startOfDay(time) {
  const date = new Date(Number(time) || Date.now())
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function shiftDay(date, count) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + count)
}

function keyOf(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// 用 UTC 的天序号做连续判断，避免时区/夏令时把一天的差算成 0.96 天
function dayIndexOf(key) {
  const parts = String(key).split('-').map(Number)
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return NaN
  return Math.floor(Date.UTC(parts[0], parts[1] - 1, parts[2]) / DAY)
}

function readLog() {
  try {
    const saved = wx.getStorageSync(KEY)
    return saved && typeof saved === 'object' ? saved : {}
  } catch (error) {
    return {}
  }
}

function writeLog(log) {
  try {
    wx.setStorageSync(KEY, log)
  } catch (error) {}
}

// 记一次学习动作：同一天只保留一条，n 用来知道这一天学了几次
function record(kind, time) {
  const at = Number(time) || Date.now()
  const key = keyOf(startOfDay(at))
  const log = readLog()
  const old = log[key]
  // kinds 记下当天各类动作，首页「今日计划」要分别判断复习/精读/输出
  const kinds = Object.assign({}, old && old.kinds)
  if (kind) kinds[kind] = (Number(kinds[kind]) || 0) + 1
  log[key] = { at, n: (Number(old && old.n) || 0) + 1, kind: kind || '', kinds }
  writeLog(log)
  return key
}

// 今天是否做过某一类学习动作；旧记录没有 kinds 时退回看最后一条 kind
function didToday(kind, time) {
  const log = readLog()
  const item = log[keyOf(startOfDay(time))]
  if (!item || !kind) return false
  if (item.kinds) return !!item.kinds[kind]
  return item.kind === kind
}

// 今天某一类动作做了几次；首页「收 3 个生词」需要知道数量
function countToday(kind, time) {
  const log = readLog()
  const item = log[keyOf(startOfDay(time))]
  if (!item || !kind || !item.kinds) return 0
  return Number(item.kinds[kind]) || 0
}

// 同一天两端都有记录时取较大值，设备时钟不一致也不会把已经记下的次数改小
function mergeKinds(base, other) {
  const output = Object.assign({}, base || {})
  Object.keys(other || {}).forEach((kind) => {
    output[kind] = Math.max(Number(output[kind]) || 0, Number(other[kind]) || 0)
  })
  return output
}

function mergeLog(base, incoming) {
  const output = Object.assign({}, base || {})
  Object.keys(incoming || {}).forEach((key) => {
    if (!DAY_KEY.test(key)) return
    const entry = incoming[key]
    if (!entry || typeof entry !== 'object') return
    const old = output[key]
    if (!old) {
      output[key] = entry
      return
    }
    output[key] = {
      at: Math.max(Number(old.at) || 0, Number(entry.at) || 0),
      n: Math.max(Number(old.n) || 0, Number(entry.n) || 0),
      kind: (Number(entry.at) || 0) >= (Number(old.at) || 0) ? (entry.kind || '') : (old.kind || ''),
      kinds: mergeKinds(old.kinds, entry.kinds)
    }
  })
  return output
}

// 把本地记录并上云，再把云端合并结果写回本地快照。
// 失败就保持原样，下次启动或打卡时再补，不打扰任何学习流程
function sync() {
  if (!wx.cloud || !wx.cloud.callFunction) return Promise.resolve(null)
  return new Promise((resolve) => {
    wx.cloud.callFunction({
      name: CLOUD_FN,
      data: { action: 'sync', log: readLog() },
      success(res) {
        const result = (res && res.result) || {}
        if (result.code !== 0 || !result.data || !result.data.log) {
          resolve(null)
          return
        }
        // 请求期间本地可能又盖了新章，回写前再并一次，别覆盖掉
        const merged = mergeLog(readLog(), result.data.log)
        writeLog(merged)
        resolve(merged)
      },
      fail() { resolve(null) }
    })
  })
}

function scheduleSync() {
  if (syncTimer) return
  syncTimer = setTimeout(() => {
    syncTimer = null
    sync()
  }, SYNC_DELAY)
}

// 业务代码统一走 mark：打卡失败绝不能影响学习主流程
function mark(kind) {
  try {
    record(kind)
    scheduleSync()
  } catch (error) {}
}

function bestStreak(keys) {
  const indexes = keys
    .map(dayIndexOf)
    .filter((index) => !Number.isNaN(index))
    .sort((a, b) => a - b)
  let best = 0
  let run = 0
  let prev = null
  indexes.forEach((index) => {
    run = prev !== null && index === prev + 1 ? run + 1 : 1
    if (run > best) best = run
    prev = index
  })
  return best
}

// 最近 7 天：首页用它排一排小圆点，今天的那个用虚线圈出来
function weekOf(log, today) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = shiftDay(today, index - 6)
    const key = keyOf(date)
    return {
      key,
      label: WEEK[date.getDay()],
      checked: !!log[key],
      today: index === 6
    }
  })
}

// 月历：周一开头，空位补齐；未来日期淡显，今天单独描一圈
function monthOf(log, today, offset) {
  const first = new Date(today.getFullYear(), today.getMonth() + offset, 1)
  const year = first.getFullYear()
  const month = first.getMonth()
  const lead = (first.getDay() + 6) % 7
  const days = new Date(year, month + 1, 0).getDate()
  const todayKey = keyOf(today)
  const cells = []
  for (let index = 0; index < lead; index += 1) {
    cells.push({ id: `pad-${index}`, empty: true })
  }
  for (let day = 1; day <= days; day += 1) {
    const date = new Date(year, month, day)
    const key = keyOf(date)
    cells.push({
      id: key,
      day,
      checked: !!log[key],
      today: key === todayKey,
      future: date.getTime() > today.getTime()
    })
  }
  return {
    key: `${year}-${pad(month + 1)}`,
    title: `${year} 年 ${month + 1} 月`,
    cells,
    canNext: offset < 0
  }
}

// 指定月份的月历：offset 0 是本月，-1 是上个月
function monthAt(offset, now) {
  return monthOf(readLog(), startOfDay(now), Number(offset) || 0)
}

function summary(now) {
  const today = startOfDay(now)
  const todayKey = keyOf(today)
  const log = readLog()
  const keys = Object.keys(log)
  const checkedToday = !!log[todayKey]

  // 今天还没盖章时，从昨天往前算，连续记录不会因为「还没开始学」先断掉
  let streak = 0
  let cursor = checkedToday ? today : shiftDay(today, -1)
  while (log[keyOf(cursor)]) {
    streak += 1
    cursor = shiftDay(cursor, -1)
  }

  const best = bestStreak(keys)
  const monthPrefix = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-`
  const monthDays = keys.filter((key) => key.indexOf(monthPrefix) === 0).length

  return {
    streak,
    best,
    total: keys.length,
    monthDays,
    checkedToday,
    todayKey,
    week: weekOf(log, today),
    calendar: monthOf(log, today, 0)
  }
}

module.exports = { record, mark, sync, didToday, countToday, summary, monthAt }
