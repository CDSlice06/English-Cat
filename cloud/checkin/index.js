const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 每日打卡的云端备份：每人一条文档，按自然日存 { at, n, kind, kinds }。
// 本地 checkinLog 仍是读取源（快照），这里只负责换手机 / 清缓存后把日历接回来
const COLLECTION = 'checkins'
// 单文档上限 1MB，一天一条约 100 字节，留 3000 天足够用
const MAX_DAYS = 3000
const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/

let ready = false

async function ensureCollection() {
  if (ready) return
  try {
    await db.createCollection(COLLECTION)
  } catch (error) {
    const message = String((error && (error.errMsg || error.message)) || '')
    if (!/exist|已存在/i.test(message)) throw error
  }
  ready = true
}

function success(data) {
  return { code: 0, message: 'ok', data }
}

function failure(code, message) {
  return { code, message, data: null }
}

function normalizeEntry(raw) {
  if (!raw || typeof raw !== 'object') return null
  const kinds = {}
  Object.keys(raw.kinds || {}).forEach((kind) => {
    const count = Math.floor(Number(raw.kinds[kind]) || 0)
    if (count > 0) kinds[String(kind).slice(0, 20)] = Math.min(count, 1000)
  })
  return {
    at: Math.max(0, Math.floor(Number(raw.at) || 0)),
    n: Math.max(0, Math.min(Math.floor(Number(raw.n) || 0), 1000)),
    kind: typeof raw.kind === 'string' ? raw.kind.slice(0, 20) : '',
    kinds
  }
}

// 同一天两端都有记录时取较大值：设备时钟不一致也不会把已记的次数改小
function mergeLog(base, incoming) {
  const output = {}
  Object.keys(base || {}).forEach((key) => {
    if (!DAY_KEY.test(key)) return
    const entry = normalizeEntry(base[key])
    if (entry) output[key] = entry
  })
  Object.keys(incoming || {}).forEach((key) => {
    if (!DAY_KEY.test(key)) return
    const entry = normalizeEntry(incoming[key])
    if (!entry) return
    const old = output[key]
    if (!old) {
      output[key] = entry
      return
    }
    const kinds = Object.assign({}, old.kinds)
    Object.keys(entry.kinds).forEach((kind) => {
      kinds[kind] = Math.max(Number(kinds[kind]) || 0, entry.kinds[kind])
    })
    output[key] = {
      at: Math.max(old.at, entry.at),
      n: Math.max(old.n, entry.n),
      kind: entry.at >= old.at ? entry.kind : old.kind,
      kinds
    }
  })
  return output
}

// 超量时按日期裁掉最早的几天，避免单文档无限膨胀
function prune(log) {
  const keys = Object.keys(log).sort()
  if (keys.length <= MAX_DAYS) return log
  const kept = {}
  keys.slice(keys.length - MAX_DAYS).forEach((key) => { kept[key] = log[key] })
  return kept
}

function docId(openid) {
  return `ck_${openid}`
}

async function readLog(openid) {
  try {
    const res = await db.collection(COLLECTION).doc(docId(openid)).get()
    const raw = res && res.data
    const doc = Array.isArray(raw) ? raw[0] : raw
    return doc && doc.log && typeof doc.log === 'object' ? doc.log : {}
  } catch (error) {
    return {}
  }
}

async function writeLog(openid, log) {
  const data = { openid, log, updatedAt: db.serverDate() }
  try {
    const res = await db.collection(COLLECTION).doc(docId(openid)).update({ data })
    if (res && res.stats && res.stats.updated) return
  } catch (error) {
    // 文档还不存在，走新增
  }
  try {
    await db.collection(COLLECTION).add({
      data: Object.assign({ _id: docId(openid), createdAt: db.serverDate() }, data)
    })
  } catch (error) {
    // 首次同步并发新增同一条时，回退成更新
    await db.collection(COLLECTION).doc(docId(openid)).update({ data }).catch(() => {})
  }
}

exports.main = async (event = {}) => {
  try {
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return failure(401, '无法确认用户身份')
    await ensureCollection()

    const action = event.action || 'sync'
    if (action === 'get') return success({ log: await readLog(OPENID) })
    if (action !== 'sync') return failure(400, '不支持的操作')

    const incoming = event.log && typeof event.log === 'object' ? event.log : {}
    const stored = await readLog(OPENID)
    const merged = prune(mergeLog(stored, incoming))
    // 两端一致就不写库，省一次写操作
    if (JSON.stringify(merged) !== JSON.stringify(stored)) await writeLog(OPENID, merged)
    return success({ log: merged })
  } catch (error) {
    const detail = (error && (error.errMsg || error.message)) || String(error || '')
    console.error('[checkin] sync failed', detail)
    return failure(500, '打卡记录同步失败，请稍后重试')
  }
}
