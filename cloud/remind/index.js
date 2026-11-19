const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const COLLECTION = 'reminds'
const WORDS = 'wordbooks'

// 订阅消息模板 ID：和小程序端 config/subscribe.js 保持一致
const TEMPLATE_ID = '06Hy0mXI1GNYH7ras-mNeaaGzlkAvXWiJIJmzvX2oew'
// 对应「学习任务通知」模板：任务名称 / 提醒时间 / 数量
const FIELD_NAME = 'thing1'
const FIELD_TIME = 'time2'
const FIELD_COUNT = 'number3'
// 开发调试时改成 'developer'，正式版用 'formal'
const MINIPROGRAM_STATE = 'formal'
const PAGE = 'pages/index/index'

let ready = false

// 集合已经建好时不必再建：先探一次读，读得通就跳过创建。
// 建集合失败也不用在这里抛，随后的读写会暴露真实原因。
async function ensureCollection() {
  if (ready) return
  try {
    await db.collection(COLLECTION).limit(1).get()
  } catch (error) {
    try {
      await db.createCollection(COLLECTION)
    } catch (createError) {}
  }
  ready = true
}

function success(data) {
  return { code: 0, message: 'ok', data }
}

function failure(code, message) {
  return { code, message, data: null }
}

async function readPreference(openid) {
  const res = await db.collection(COLLECTION).where({ openid }).limit(1).get()
  return res.data[0] || null
}

// 两条时间字段都给，模板里是 date 还是 time 都能对上
function timeText() {
  const now = new Date(Date.now() + 8 * 60 * 60 * 1000)
  const pad = (n) => (n < 10 ? `0${n}` : String(n))
  const date = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`
  return `${date} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`
}

function buildData(count) {
  // 数量字段是 number 类型，必须传数字不能传字符串
  return {
    [FIELD_NAME]: { value: '今日到期单词' },
    [FIELD_TIME]: { value: timeText() },
    [FIELD_COUNT]: { value: count }
  }
}

// 复习排期已经跟着词条上云（reviewDue），所以能直接算出「今天到期几个」。
// 云函数跑在 UTC，这里按北京时间取当天 23:59:59.999 作为截止点。
const DAY = 24 * 60 * 60 * 1000
const TIMEZONE_OFFSET = 8 * 60 * 60 * 1000

function todayEndAt() {
  const local = Date.now() + TIMEZONE_OFFSET
  return Math.floor(local / DAY) * DAY - TIMEZONE_OFFSET + DAY - 1
}

async function dueCount(openid) {
  try {
    const _ = db.command
    const res = await db
      .collection(WORDS)
      .where({ openid, reviewDue: _.gt(0).and(_.lte(todayEndAt())) })
      .count()
    return res.total || 0
  } catch (error) {
    return 0
  }
}

async function status(openid) {
  if (!TEMPLATE_ID) return success({ available: false, enabled: false })
  await ensureCollection()
  const doc = await readPreference(openid)
  return success({ available: true, enabled: !!(doc && doc.enabled) })
}

async function subscribe(openid) {
  if (!TEMPLATE_ID) return failure(400, '提醒模板未配置')
  await ensureCollection()
  const now = Date.now()
  const doc = await readPreference(openid)
  if (doc) {
    await db.collection(COLLECTION).doc(doc._id).update({ data: { enabled: true, updatedAt: now } })
  } else {
    await db.collection(COLLECTION).add({ data: { openid, enabled: true, createdAt: now, updatedAt: now } })
  }
  return success({ available: true, enabled: true })
}

async function unsubscribe(openid) {
  await ensureCollection()
  const doc = await readPreference(openid)
  if (doc) {
    await db.collection(COLLECTION).doc(doc._id).update({ data: { enabled: false, updatedAt: Date.now() } })
  }
  return success({ available: true, enabled: false })
}

// 定时触发器每天跑一次：给开着提醒的人各发一条。
// 一次性订阅发完后再发会收到 43101，这时把开关关掉，用户下次进来看到的就是「未开启」。
async function sendAll() {
  if (!TEMPLATE_ID) return success({ sent: 0, reason: 'template-missing' })
  await ensureCollection()
  let sent = 0
  let skipped = 0
  let idle = 0
  const pageSize = 100

  for (let page = 0; page < 10; page += 1) {
    const res = await db.collection(COLLECTION).where({ enabled: true }).skip(page * pageSize).limit(pageSize).get()
    if (!res.data.length) break

    for (const doc of res.data) {
      try {
        const count = await dueCount(doc.openid)
        // 今天没有到期词就不打扰，也把这一次性订阅留给真正有任务的那天
        if (!count) {
          idle += 1
          continue
        }
        await cloud.openapi.subscribeMessage.send({
          touser: doc.openid,
          templateId: TEMPLATE_ID,
          page: PAGE,
          miniprogramState: MINIPROGRAM_STATE,
          lang: 'zh_CN',
          data: buildData(count)
        })
        sent += 1
        await db.collection(COLLECTION).doc(doc._id).update({ data: { lastSentAt: Date.now() } })
      } catch (error) {
        const code = Number(error && (error.errCode || error.errcode))
        // 43101：用户拒收或订阅次数已用完
        if (code === 43101) {
          skipped += 1
          await db.collection(COLLECTION).doc(doc._id).update({ data: { enabled: false, updatedAt: Date.now() } })
        } else {
          // 47003：模板字段名或值不合法，对照模板详情核对 thing1 / time2 / number3
          console.error('remind send failed', doc.openid, code, error)
        }
      }
    }

    if (res.data.length < pageSize) break
  }

  return success({ sent, skipped, idle })
}

exports.main = async (event = {}) => {
  try {
    // 定时触发器没有 OPENID，用事件里的 Type 区分
    if (event.Type === 'Timer' || event.type === 'timer' || event.action === 'send') {
      return await sendAll()
    }
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return failure(401, '无法确认用户身份')
    switch (event.action) {
      case 'status':
        return await status(OPENID)
      case 'subscribe':
        return await subscribe(OPENID)
      case 'unsubscribe':
        return await unsubscribe(OPENID)
      default:
        return failure(400, '未知操作')
    }
  } catch (error) {
    console.error('remind failed', error)
    return failure(500, (error && error.message) || '提醒服务异常')
  }
}
