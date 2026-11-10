// 每日打卡：今天真的学了一点，就在日历上盖一枚章。
// 记录只存在本地，按自然日去重；同一天多次学习也只算一次打卡。
const DAY = 24 * 60 * 60 * 1000
const KEY = 'checkinLog'
const WEEK = ['日', '一', '二', '三', '四', '五', '六']

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
  log[key] = { at, n: (Number(old && old.n) || 0) + 1, kind: kind || '' }
  writeLog(log)
  return key
}

// 业务代码统一走 mark：打卡失败绝不能影响学习主流程
function mark(kind) {
  try {
    record(kind)
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

module.exports = { record, mark, summary, monthAt }
