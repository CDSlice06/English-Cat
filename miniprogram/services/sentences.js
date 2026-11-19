// 背诵用的例句：优先用本地缓存，缺的一次批量请大模型写，写过的长期留着
const KEY = 'memorizeSentences'
// 一次最多让模型写 10 句，批太大输出会被截断
const BATCH = 8

let cache = null

function read() {
  if (cache) return cache
  try {
    const saved = wx.getStorageSync(KEY)
    cache = saved && typeof saved === 'object' ? saved : {}
  } catch (error) {
    cache = {}
  }
  return cache
}

function write() {
  try {
    wx.setStorageSync(KEY, cache)
  } catch (error) {}
}

// 取一条缓存：旧版本只存了英文句子，这里兼容一下
function entryOf(word) {
  const value = read()[String(word || '').toLowerCase()]
  if (!value) return null
  if (typeof value === 'string') return { sentence: value, zh: '' }
  if (typeof value === 'object') {
    return { sentence: String(value.sentence || ''), zh: String(value.zh || '') }
  }
  return null
}

function get(word) {
  const entry = entryOf(word)
  return entry ? entry.sentence : ''
}

// 例句的中文意思：语境填词要配着看，没有就返回空字符串
function getZh(word) {
  const entry = entryOf(word)
  return entry ? entry.zh : ''
}

function remember(word, sentence, zh) {
  const key = String(word || '').toLowerCase()
  if (!key || !sentence) return
  read()
  cache[key] = { sentence: String(sentence), zh: String(zh || '') }
  write()
}

// 句子必须真的含这个词，模型的输出不总是靠谱，不合要求就当没有
function contains(sentence, word) {
  const text = String(sentence || '').toLowerCase()
  const target = String(word || '').toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  if (!target) return false
  return new RegExp(`(^|[^a-z])${target}($|[^a-z])`).test(text)
}

function callFunction(name, data) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success(res) {
        const result = res.result || {}
        if (result.code === 0) resolve(result.data)
        else reject(new Error(result.message || '例句获取失败'))
      },
      fail(err) {
        reject(new Error((err && err.errMsg) || '无法连接云开发环境'))
      }
    })
  })
}

function request(items) {
  return callFunction('llm', { task: 'sentences', items }).then((data) => {
    const content = data && data.content
    const list = content && Array.isArray(content.items) ? content.items : []
    list.forEach((item) => {
      const word = item && item.word
      const sentence = item && item.sentence
      const zh = item && item.zh
      if (!word || !sentence) return
      if (!contains(sentence, word)) return
      remember(word, String(sentence).replace(/\s+/g, ' ').trim(), String(zh || '').replace(/\s+/g, ' ').trim())
    })
  })
}

// 一批一批顺着来，避免同时打太多请求
function generate(items) {
  const queue = (Array.isArray(items) ? items : []).slice()
  const step = () => {
    if (!queue.length) return Promise.resolve()
    const batch = queue.splice(0, BATCH)
    return request(batch).catch(() => {}).then(step)
  }
  return step()
}

// 只补还没有的（缺句子或缺中文意思都算），返回 Promise 方便测试；页面里直接不管结果就行
function prefetch(items) {
  const missing = (Array.isArray(items) ? items : []).filter((item) => {
    if (!item || !item.word) return false
    const entry = entryOf(item.word)
    return !entry || !entry.sentence || !entry.zh
  })
  if (!missing.length) return Promise.resolve()
  return generate(missing)
}

module.exports = { get, getZh, remember, prefetch, contains }
