// 电子宠物：数值养成的最小闭环
// 设计要点：
// 1. 数值只在云函数里改，客户端只读展示，避免改本地时间刷状态
// 2. 衰减按 lastTick 懒计算，不需要定时器
// 3. 宠物台词用固定文案池，不接大模型
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const MAX_STAT = 100
// 每小时自然衰减，离线最多结算 72 小时，避免回来直接归零
const DECAY = { food: 2.4, mood: 1.8, clean: 1.2, energy: 2.0 }
const OFFLINE_CAP_HOURS = 72
const CLAIM_EXP = 40

const ACTIONS = {
  feed: {
    label: '喂食',
    hint: '小鱼干',
    effects: { food: 30, clean: -6, mood: 6 },
    exp: 8,
    quest: 'feed',
    cooldown: 2 * 60 * 1000
  },
  play: {
    label: '玩耍',
    hint: '逗猫棒',
    effects: { mood: 26, energy: -18, food: -8 },
    exp: 12,
    quest: 'play',
    cooldown: 3 * 60 * 1000
  },
  clean: {
    label: '清洁',
    hint: '梳梳毛',
    effects: { clean: 36, mood: 5 },
    exp: 8,
    quest: 'clean',
    cooldown: 5 * 60 * 1000
  },
  sleep: {
    label: '睡觉',
    hint: '打个盹',
    effects: { energy: 45, mood: 4 },
    exp: 6,
    cooldown: 10 * 60 * 1000
  },
  touch: {
    label: '摸摸',
    hint: '摸摸头',
    effects: { mood: 5 },
    exp: 2,
    cooldown: 30 * 1000
  }
}

const STAGES = [
  { name: '奶猫', title: '刚到家的小奶猫', min: 0 },
  { name: '小猫', title: '好奇心旺盛的小猫', min: 120 },
  { name: '大猫', title: '陪你很久的大猫', min: 420 }
]

const TIPS = [
  '今天也要一起学英语呀',
  '你学习的时候，我就在旁边趴着',
  '摸摸头会让我更开心',
  '把单词学完，就能换更多小鱼干'
]

function ok(data) {
  return { code: 0, message: 'ok', data }
}

function fail(code, message) {
  return { code, message }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function round(value) {
  return Math.round(value)
}

// 按北京时间切日，和用户感知的“今天”一致
function dayKey(ts) {
  return new Date(ts + 8 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function defaultDaily(ts) {
  return { date: dayKey(ts), feed: 0, play: 0, clean: 0, claimed: false }
}

function makePet(openid, now) {
  return {
    openid,
    name: '团子',
    species: 'cat',
    stats: { food: 80, mood: 80, clean: 80, energy: 80 },
    exp: 0,
    lastTick: now,
    cooldowns: {},
    daily: defaultDaily(now),
    createdAt: now,
    updatedAt: now
  }
}

// 懒结算衰减：只算数值，不写库；真正互动时再把结果落盘
function settle(pet, now) {
  const last = Number(pet.lastTick) || now
  const hours = clamp((now - last) / (60 * 60 * 1000), 0, OFFLINE_CAP_HOURS)
  const stats = Object.assign({ food: 80, mood: 80, clean: 80, energy: 80 }, pet.stats || {})
  const next = {
    food: clamp(stats.food - DECAY.food * hours, 0, MAX_STAT),
    mood: clamp(stats.mood - DECAY.mood * hours, 0, MAX_STAT),
    clean: clamp(stats.clean - DECAY.clean * hours, 0, MAX_STAT),
    energy: clamp(stats.energy - DECAY.energy * hours, 0, MAX_STAT)
  }
  return { pet: Object.assign({}, pet, { stats: next }), awayHours: hours }
}

function ensureDaily(pet, now) {
  const today = dayKey(now)
  if (!pet.daily || pet.daily.date !== today) {
    pet.daily = defaultDaily(now)
  }
  return pet.daily
}

function stageOf(exp) {
  const value = Math.max(0, Number(exp) || 0)
  let index = 0
  STAGES.forEach((stage, i) => {
    if (value >= stage.min) index = i
  })
  const current = STAGES[index]
  const next = STAGES[index + 1] || null
  const span = next ? next.min - current.min : 0
  const done = next ? value - current.min : 1
  return {
    index,
    name: current.name,
    title: current.title,
    exp: value,
    nextName: next ? next.name : '',
    nextExp: next ? next.min : value,
    progress: next ? clamp(Math.round((done / span) * 100), 0, 100) : 100,
    nextText: next ? `再攒 ${Math.max(0, next.min - value)} 点成长值，就能长成${next.name}` : '已经长成大猫啦'
  }
}

function moodOf(stats) {
  const avg = (stats.food + stats.mood + stats.clean + stats.energy) / 4
  if (avg >= 80) return { key: 'great', label: '元气满满' }
  if (avg >= 60) return { key: 'good', label: '心情不错' }
  if (avg >= 40) return { key: 'ok', label: '有点无聊' }
  if (avg >= 20) return { key: 'low', label: '蔫蔫的' }
  return { key: 'bad', label: '需要照顾' }
}

function tipOf(stats) {
  if (stats.food < 40) return '肚子饿了，来点小鱼干吧'
  if (stats.energy < 40) return '困了，想睡一会儿'
  if (stats.clean < 40) return '毛毛有点乱，想梳一梳'
  if (stats.mood < 40) return '想和你玩一会儿'
  return TIPS[Math.floor(Math.random() * TIPS.length)]
}

function cooldownsOf(pet, now) {
  const map = {}
  Object.keys(ACTIONS).forEach((key) => {
    const at = Number((pet.cooldowns || {})[key]) || 0
    map[key] = Math.max(0, Math.ceil((at + ACTIONS[key].cooldown - now) / 1000))
  })
  return map
}

function viewOf(pet, now, awayHours) {
  const stats = pet.stats || {}
  ensureDaily(pet, now)
  const daily = pet.daily
  const stage = stageOf(pet.exp)
  const cooling = cooldownsOf(pet, now)
  const quests = [
    { key: 'feed', label: '喂食 1 次', done: (daily.feed || 0) >= 1 },
    { key: 'play', label: '陪它玩 1 次', done: (daily.play || 0) >= 1 },
    { key: 'clean', label: '清洁 1 次', done: (daily.clean || 0) >= 1 }
  ]
  const questDone = quests.every((quest) => quest.done)
  return {
    name: pet.name,
    species: pet.species || 'cat',
    stats: [
      { key: 'food', label: '饱食', value: round(stats.food) },
      { key: 'mood', label: '心情', value: round(stats.mood) },
      { key: 'clean', label: '清洁', value: round(stats.clean) },
      { key: 'energy', label: '精力', value: round(stats.energy) }
    ],
    stage,
    mood: moodOf(stats),
    tip: tipOf(stats),
    // 离开超过半小时才提示，避免切个页面就弹“好久不见”
    awayHours: awayHours >= 0.5 ? Math.min(OFFLINE_CAP_HOURS, Math.round(awayHours)) : 0,
    actions: Object.keys(ACTIONS).filter((key) => key !== 'touch').map((key) => ({
      key,
      label: ACTIONS[key].label,
      hint: ACTIONS[key].hint,
      cooling: cooling[key] > 0 ? cooling[key] : 0
    })),
    daily: {
      date: daily.date,
      quests,
      done: questDone,
      claimed: daily.claimed === true,
      canClaim: questDone && daily.claimed !== true,
      reward: CLAIM_EXP
    },
    serverNow: now
  }
}

let collectionReady = false

// 首次调用时确保集合存在；已存在会报错，忽略即可
async function ensureCollection() {
  if (collectionReady) return
  try {
    await db.createCollection('pets')
  } catch (error) {
    // 集合已存在或没有创建权限：继续走正常查询
  }
  collectionReady = true
}

async function findPet(openid) {
  await ensureCollection()
  const result = await db.collection('pets').where({ openid }).limit(1).get()
  return (result.data && result.data[0]) || null
}

async function createPet(openid, now) {
  const data = makePet(openid, now)
  const result = await db.collection('pets').add({ data })
  return Object.assign({ _id: result._id }, data)
}

async function getOrCreatePet(openid, now) {
  const found = await findPet(openid)
  if (found) return { pet: found, created: false }
  return { pet: await createPet(openid, now), created: true }
}

async function savePet(pet, now) {
  const data = {
    stats: pet.stats,
    exp: pet.exp,
    lastTick: now,
    cooldowns: pet.cooldowns,
    daily: pet.daily,
    name: pet.name,
    updatedAt: now
  }
  await db.collection('pets').doc(pet._id).update({ data })
  return Object.assign({}, pet, data)
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return fail(401, '请先登录')
  const action = event.action || 'getPet'
  const now = Date.now()

  try {
    if (action === 'getPet') {
      const { pet } = await getOrCreatePet(OPENID, now)
      const settled = settle(pet, now)
      return ok(viewOf(settled.pet, now, settled.awayHours))
    }

    if (action === 'interact') {
      const def = ACTIONS[event.act]
      if (!def) return fail(400, '这个动作还不支持')
      const { pet: found } = await getOrCreatePet(OPENID, now)
      const settled = settle(found, now)
      const pet = settled.pet
      ensureDaily(pet, now)

      const last = Number((pet.cooldowns || {})[event.act]) || 0
      const readyAt = last + def.cooldown
      if (readyAt > now) {
        return fail(429, `它刚${def.label}过，等 ${Math.ceil((readyAt - now) / 1000)} 秒再来吧`)
      }

      const stats = Object.assign({}, pet.stats)
      Object.keys(def.effects).forEach((key) => {
        stats[key] = clamp((stats[key] || 0) + def.effects[key], 0, MAX_STAT)
      })
      pet.stats = stats
      pet.exp = Math.max(0, Number(pet.exp) || 0) + def.exp
      pet.cooldowns = Object.assign({}, pet.cooldowns, { [event.act]: now })
      if (def.quest && pet.daily) {
        pet.daily[def.quest] = (pet.daily[def.quest] || 0) + 1
      }
      const saved = await savePet(pet, now)
      return ok(viewOf(saved, now, settled.awayHours))
    }

    if (action === 'claimQuest') {
      const { pet: found } = await getOrCreatePet(OPENID, now)
      const settled = settle(found, now)
      const pet = settled.pet
      const daily = ensureDaily(pet, now)
      const done = (daily.feed || 0) >= 1 && (daily.play || 0) >= 1 && (daily.clean || 0) >= 1
      if (!done) return fail(409, '今日照顾还没完成，先把三件事都做一遍吧')
      if (daily.claimed) return fail(409, '今天已经领过奖励啦')
      daily.claimed = true
      pet.exp = Math.max(0, Number(pet.exp) || 0) + CLAIM_EXP
      pet.stats.mood = clamp((pet.stats.mood || 0) + 8, 0, MAX_STAT)
      const saved = await savePet(pet, now)
      return ok(viewOf(saved, now, settled.awayHours))
    }

    return fail(400, '未知操作')
  } catch (error) {
    console.log('[pet] failed', { action, message: error && error.message })
    return fail(500, '宠物服务开小差了，稍后再试')
  }
}
