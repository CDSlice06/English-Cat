const cloud = require('wx-server-sdk')
const crypto = require('crypto')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const COLLECTION = 'handbooks'
let ready = false

function docId(openid) {
  const hash = crypto.createHash('sha256').update(openid).digest('hex').slice(0, 24)
  return `hb_${hash}`
}

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

function failure(message) {
  return { code: 1, message, data: null }
}

function num(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

// 标记值正数=标记、负数=取消，0 表示从未操作
function markOf(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

// 只保留合法字段，防止坏数据把文档撑大
function sanitize(raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const plan = source.plan && typeof source.plan === 'object' ? source.plan : {}
  const done = {}
  const rawDone = source.done && typeof source.done === 'object' ? source.done : {}
  Object.keys(rawDone).slice(0, 200).forEach((id) => {
    const record = rawDone[id]
    if (!record || typeof record !== 'object' || !num(record.at)) return
    done[id] = {
      at: num(record.at),
      result: record.result === 'bad' ? 'bad' : 'ok',
      rev: Math.min(Math.max(Number(record.rev) || 0, 0), 7),
      on: record.on !== false
    }
  })
  const known = {}
  const rawKnown = source.vocab && source.vocab.known && typeof source.vocab.known === 'object' ? source.vocab.known : {}
  Object.keys(rawKnown).slice(0, 4000).forEach((key) => {
    const at = markOf(rawKnown[key])
    if (at) known[key] = at
  })
  const starred = {}
  const rawStarred = source.starred && typeof source.starred === 'object' ? source.starred : {}
  Object.keys(rawStarred).slice(0, 600).forEach((id) => {
    const at = markOf(rawStarred[id])
    if (at) starred[id] = at
  })
  const quotes = {}
  const rawQuotes = source.quotes && source.quotes.known && typeof source.quotes.known === 'object' ? source.quotes.known : {}
  Object.keys(rawQuotes).slice(0, 200).forEach((id) => {
    const at = markOf(rawQuotes[id])
    if (at) quotes[id] = at
  })
  return {
    plan: {
      perDay: Math.min(Math.max(Number(plan.perDay) || 2, 1), 4),
      startAt: /^\d{4}-\d{2}-\d{2}$/.test(String(plan.startAt || '')) ? String(plan.startAt) : '',
      review: plan.review !== false,
      planAt: num(plan.planAt)
    },
    done,
    starred,
    vocab: { known },
    quotes: { known: quotes },
    resetAt: num(source.resetAt)
  }
}

// 标记值比较绝对值：谁的操作更晚就听谁的，负数代表取消
function newerMark(mine, theirs) {
  const a = markOf(mine)
  const b = markOf(theirs)
  if (!b) return a
  if (!a) return b
  return Math.abs(b) > Math.abs(a) ? b : a
}

// 合并规则：同一条记录取时间更新的；标记（已背、收藏）取时间戳绝对值大的
function mergeProgress(local, remote) {
  const output = sanitize(local)
  const other = sanitize(remote)
  output.resetAt = Math.max(output.resetAt, other.resetAt)
  if (other.plan.planAt > output.plan.planAt) output.plan = other.plan
  Object.keys(other.done).forEach((id) => {
    const current = output.done[id]
    if (!current || other.done[id].at > current.at) output.done[id] = other.done[id]
  })
  ;[['vocab'], ['quotes']].forEach(([group]) => {
    const mine = output[group].known
    Object.keys(other[group].known).forEach((key) => {
      mine[key] = newerMark(mine[key], other[group].known[key])
    })
  })
  Object.keys(other.starred).forEach((id) => {
    output.starred[id] = newerMark(output.starred[id], other.starred[id])
  })

  // 重置时间之前的记录全部失效
  const resetAt = output.resetAt
  if (resetAt) {
    Object.keys(output.done).forEach((id) => {
      if (output.done[id].at <= resetAt) delete output.done[id]
    })
    ;[['vocab'], ['quotes']].forEach(([group]) => {
      const map = output[group].known
      Object.keys(map).forEach((key) => {
        if (Math.abs(markOf(map[key])) <= resetAt) delete map[key]
      })
    })
    Object.keys(output.starred).forEach((id) => {
      if (Math.abs(markOf(output.starred[id])) <= resetAt) delete output.starred[id]
    })
  }
  return output
}

async function readDoc(openid) {
  const result = await db.collection(COLLECTION).where({ _id: docId(openid) }).limit(1).get()
  return (result.data && result.data[0]) || null
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return failure('缺少用户身份')
  await ensureCollection()

  if (event.action === 'load') {
    const doc = await readDoc(OPENID)
    return success({ progress: doc ? doc.progress : null, updatedAt: doc ? doc.updatedAt : 0 })
  }

  if (event.action === 'save') {
    const incoming = sanitize(event.progress)
    const doc = await readDoc(OPENID)
    const merged = mergeProgress(incoming, doc ? doc.progress : null)
    const payload = { progress: merged, updatedAt: Date.now() }
    if (doc) await db.collection(COLLECTION).doc(doc._id).update({ data: payload })
    else await db.collection(COLLECTION).add({ data: Object.assign({ _id: docId(OPENID), openid: OPENID }, payload) })
    return success({ progress: merged })
  }

  return failure('未知操作')
}
