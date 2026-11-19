// 本地联想词表：输入时先在本地匹配，做到「打一个字就出候选」；
// 云端联想只负责补生僻词和更完整的释义，回来后再静默替换。
// 词表由词库生成（data/wordSeed.js），只收常用词控制体积。
let index = null

function load() {
  if (index) return index
  let raw = ''
  try {
    raw = require('../data/wordSeed')
  } catch (error) {
    raw = ''
  }
  const words = []
  const order = {}
  String(raw || '').split('\n').forEach((line) => {
    if (!line) return
    const parts = line.split('|')
    const word = parts[0]
    if (!word || order[word] !== undefined) return
    order[word] = words.length
    words.push({ word, phonetic: parts[1] || '', meaningText: parts[2] || '' })
  })
  index = { words, order }
  return index
}

function copy(item) {
  return { word: item.word, phonetic: item.phonetic, meaningText: item.meaningText }
}

// 英文前缀联想：词表已按词频排序，命中的词自然按常用度排前面
function suggest(prefix, limit) {
  const text = String(prefix || '').trim().toLowerCase()
  if (!text) return []
  const max = limit || 6
  const { words, order } = load()
  const out = []
  const exact = order[text]
  if (exact !== undefined) out.push(words[exact])
  for (let i = 0; i < words.length && out.length < max; i += 1) {
    const item = words[i]
    if (item.word !== text && item.word.indexOf(text) === 0) out.push(item)
  }
  return out.slice(0, max).map(copy)
}

// 中文反查英文：按简短释义匹配
// 释义开头就命中的词排前面（搜「环境」先给 environment，而不是释义第三条才是「环境」的 condition），
// 同一档内仍按词频排序
function search(query, limit) {
  const text = String(query || '').trim()
  if (!text) return []
  const max = limit || 8
  const { words } = load()
  const out = []
  words.forEach((item, index) => {
    const at = item.meaningText.indexOf(text)
    if (at < 0) return
    // 去掉词性前缀（「n. 」）后判断命中位置：首义就命中的给一个有限加分，
    // 但加分不能盖过词频，否则生僻词会挤掉 environment 这类常用词
    const start = /^[a-z]+\.\s*/i.test(item.meaningText) ? item.meaningText.indexOf(' ') + 1 : 0
    out.push({ item, score: index - (at <= start ? 1500 : 0) })
  })
  out.sort((a, b) => a.score - b.score)
  return out.slice(0, max).map((hit) => copy(hit.item))
}

module.exports = { suggest, search }
