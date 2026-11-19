// 单词补充信息：近义词（本地数据，不走网络）。
// 数据由 tools/build-word-extras.js 生成，格式 word|近义(w~pos~def,..)。
let index = null

function load() {
  if (index) return index
  let raw = ''
  try {
    raw = require('../data/wordExtras')
  } catch (error) {
    raw = ''
  }
  const map = {}
  String(raw || '').split('\n').forEach((line) => {
    if (!line) return
    const parts = line.split('|')
    const word = String(parts[0] || '').toLowerCase()
    if (!word) return
    const synonyms = String(parts[1] || '')
      .split(',')
      .map((item) => {
        const pieces = item.split('~')
        return { w: pieces[0] || '', pos: pieces[1] || '', def: pieces[2] || '' }
      })
      .filter((item) => item.w)
    if (!synonyms.length) return
    map[word] = { synonyms }
  })
  index = map
  return index
}

function extrasOf(raw) {
  const word = String(raw || '').toLowerCase().trim()
  if (!word) return { synonyms: [] }
  return load()[word] || { synonyms: [] }
}

module.exports = { extrasOf }
