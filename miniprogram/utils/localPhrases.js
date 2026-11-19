// 本地词组检索：词组本手动收录时按英文词组或中文释义即时匹配，不走网络。
// 词表由词组库生成（data/phraseSeed.js），收录点选后直接带出释义和用法小抄。
let index = null

function load() {
  if (index) return index
  let raw = ''
  try {
    raw = require('../data/phraseSeed')
  } catch (error) {
    raw = ''
  }
  const list = []
  const map = {}
  String(raw || '').split('\n').forEach((line) => {
    if (!line) return
    const parts = line.split('|')
    const phrase = parts[0]
    if (!phrase) return
    const item = { phrase, meaning: parts[1] || '', note: parts[2] || '' }
    if (map[phrase]) return
    map[phrase] = item
    list.push(item)
  })
  index = { list, map }
  return index
}

// 比较时忽略大小写、省略号和多余空格，用户敲「not only」也能命中「not only sth but also」
function normalize(text) {
  return String(text || '').toLowerCase().replace(/[.…]/g, ' ').replace(/\s+/g, ' ').trim()
}

function copy(item) {
  return { phrase: item.phrase, meaning: item.meaning, note: item.note }
}

function suggest(raw, limit) {
  const query = normalize(raw)
  if (!query) return []
  const max = limit || 6
  const { list } = load()
  // 中文按释义反查，英文按词组匹配。都按「开头命中 > 中间命中」排，
  // 同一档里词组短的更常用，排前面
  const exact = []
  const head = []
  const body = []
  const byLength = (a, b) => a.phrase.length - b.phrase.length || (a.phrase < b.phrase ? -1 : 1)
  if (/[\u4e00-\u9fff]/.test(query)) {
    list.forEach((item) => {
      const at = item.meaning.indexOf(query)
      if (at === 0) head.push(item)
      else if (at > 0) body.push(item)
    })
  } else {
    list.forEach((item) => {
      if (item.phrase === query) exact.push(item)
      else {
        const at = item.phrase.indexOf(query)
        // 只认词组开头或某个单词的开头，避免 typing「put」命中外面的 computing
        if (at === 0) head.push(item)
        else if (at > 0 && item.phrase.charAt(at - 1) === ' ') body.push(item)
      }
    })
    head.sort(byLength)
    body.sort(byLength)
  }
  // 开头命中的优先，但给中间命中留两个位置：
  // 输入 account 也能看到 take into account，而不是只出现 account for
  const headQuota = body.length ? Math.max(max - 2, 0) : max
  return exact.concat(head.slice(0, headQuota), body).slice(0, max).map(copy)
}

// 手动输入完整词组时用它补释义，用户没点候选也不至于收录一条空释义
function exact(raw) {
  const key = normalize(raw)
  if (!key) return null
  const hit = load().map[key]
  return hit ? copy(hit) : null
}

module.exports = { suggest, exact }
