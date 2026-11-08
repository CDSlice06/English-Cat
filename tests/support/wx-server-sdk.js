// 微信云开发 SDK 的内存替身：只实现回归脚本用到的数据库能力。
// 覆盖 where / field / orderBy / limit / get / update / remove、doc().get/update/set/remove、
// add、serverDate，以及 _ .in / neq / set / remove / inc 五个指令。
const state = {
  articles: [],
  article_units: [],
  known_words: [],
  writes: []
}

function match(doc, cond) {
  return Object.keys(cond || {}).every((key) => {
    const want = cond[key]
    if (want && want.__in) return want.__in.indexOf(doc[key]) >= 0
    if (want && want.__neq !== undefined) return doc[key] !== want.__neq
    return doc[key] === want
  })
}

function apply(doc, data) {
  Object.keys(data || {}).forEach((key) => {
    const value = data[key]
    if (value && value.__remove) delete doc[key]
    else if (value && value.__inc !== undefined) doc[key] = Number(doc[key] || 0) + value.__inc
    else doc[key] = value
  })
}

function clone(list) {
  return JSON.parse(JSON.stringify(list))
}

function chain(name) {
  let cond = {}
  let order = null
  const api = {
    where(next) { cond = next || {}; return api },
    field() { return api },
    orderBy(field, dir) {
      order = { field, dir: dir === 'desc' ? -1 : 1 }
      return api
    },
    limit() { return api },
    async get() {
      let list = (state[name] || []).filter((doc) => match(doc, cond))
      if (order) {
        list = list.slice().sort((a, b) => {
          if (a[order.field] === b[order.field]) return 0
          return (a[order.field] > b[order.field] ? 1 : -1) * order.dir
        })
      }
      return { data: clone(list) }
    },
    async update({ data }) {
      const list = (state[name] || []).filter((doc) => match(doc, cond))
      list.forEach((doc) => apply(doc, data))
      return { stats: { updated: list.length } }
    },
    async remove() {
      const before = (state[name] || []).length
      state[name] = (state[name] || []).filter((doc) => !match(doc, cond))
      return { stats: { removed: before - state[name].length } }
    }
  }
  return api
}

const command = {
  in: (values) => ({ __in: values }),
  neq: (value) => ({ __neq: value }),
  set: (value) => value,
  remove: () => ({ __remove: true }),
  inc: (value) => ({ __inc: value })
}

module.exports = {
  __state: state,
  // 每次回归前清空：articles / article_units 可传入初始数据，模拟老库
  __reset(articles, units) {
    state.articles = articles || []
    state.article_units = units || []
    state.known_words = []
    state.writes = []
  },
  __writes: () => state.writes,
  init() {},
  // 测试环境没有大模型：默认 503，让增强逻辑走熔断分支而不是抛异常
  async callFunction() {
    return { result: { code: 503, message: 'llm unavailable in stub' } }
  },
  getWXContext() {
    return { OPENID: 'test-openid' }
  },
  database() {
    return {
      command,
      serverDate() { return new Date() },
      async createCollection() {},
      collection(name) {
        return {
          where: (cond) => chain(name).where(cond),
          field: () => chain(name),
          orderBy: (...args) => chain(name).orderBy(...args),
          limit: () => chain(name),
          get: () => chain(name).get(),
          doc(id) {
            return {
              async get() {
                return { data: (state[name] || []).find((doc) => doc._id === id) || {} }
              },
              async update({ data }) {
                const hit = (state[name] || []).find((doc) => doc._id === id)
                if (hit) apply(hit, data)
                state.writes.push({ name, id, data })
                return {}
              },
              async set({ data }) {
                const index = (state[name] || []).findIndex((doc) => doc._id === id)
                if (index >= 0) state[name][index] = Object.assign({ _id: id }, data)
                else (state[name] = state[name] || []).push(Object.assign({ _id: id }, data))
                return {}
              },
              async remove() {
                state[name] = (state[name] || []).filter((doc) => doc._id !== id)
                return {}
              }
            }
          },
          async add({ data }) {
            ;(state[name] = state[name] || []).push(data)
            return {}
          }
        }
      }
    }
  },
  DYNAMIC_CURRENT_ENV: 'test'
}
