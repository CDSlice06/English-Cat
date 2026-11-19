// 单词常用句型：单词卡上展示「这个词怎么用」的固定搭配（strive to do sth 之类），
// 每个句型后面带中文释义；部分常用词还带一句示范用法的短句。数据由 data/wordPatterns.js 生成。
let index = null

// 生成格式是 pattern~释义，老数据没有 ~ 时释义留空
function parsePattern(raw) {
  const at = raw.indexOf('~')
  if (at < 0) return { text: raw, gloss: '' }
  return { text: raw.slice(0, at), gloss: raw.slice(at + 1) }
}

function load() {
  if (index) return index
  let raw = ''
  try {
    raw = require('../data/wordPatterns')
  } catch (error) {
    raw = ''
  }
  const map = {}
  String(raw || '').split('\n').forEach((line) => {
    if (!line) return
    const parts = line.split('|')
    const word = String(parts[0] || '').toLowerCase()
    if (!word) return
    map[word] = {
      patterns: (parts[1] || '').split(';').filter(Boolean).map(parsePattern),
      example: parts[2] || ''
    }
  })
  index = map
  return index
}

function patternsOf(raw) {
  const word = String(raw || '').toLowerCase().trim()
  if (!word) return []
  const entry = load()[word]
  return entry ? entry.patterns : []
}

// 用法例句：只给常用词准备了示范句，没有就返回空串
function exampleOf(raw) {
  const word = String(raw || '').toLowerCase().trim()
  if (!word) return ''
  const entry = load()[word]
  return entry ? entry.example : ''
}

module.exports = { patternsOf, exampleOf }
