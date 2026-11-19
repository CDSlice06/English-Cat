// 生成 miniprogram/pkgWords/data/wordSeed.js（本地联想词表，随词汇分包一起下发）
// 合并口径与云函数 dict() 一致：cet → common → extra → curated → senses
// 格式：word|phonetic|首义词性+简短释义；按常用度排序，联想结果自然按常用度排前面
// 用法：node tools/build-word-seed.js
const fs = require('fs')
const path = require('path')
const ROOT = path.join(__dirname, '..')
const DIR = path.join(ROOT, 'cloud/analyzeArticle')
const OUT = path.join(ROOT, 'miniprogram/pkgWords/data/wordSeed.js')
const SOURCES = ['cet', 'common', 'extra', 'curated', 'senses']

// 首义的全部义项都要留着：中文反查（如「困惑」→ confusion）靠它命中
// 只限长度，避免个别词条把整段释义塞进来
const MAX_DEF = 60

const merged = Object.create(null)
SOURCES.forEach((name) => {
  const dict = require(path.join(DIR, `${name}.json`))
  Object.keys(dict).forEach((word) => {
    if (!merged[word]) merged[word] = { ph: '', frq: 0, rank: 0, meanings: [] }
    const entry = dict[word]
    const slot = merged[word]
    // 音标和词频取第一个有值的来源
    if (!slot.ph && entry.ph) slot.ph = entry.ph
    if (!slot.frq && entry.frq > 0) slot.frq = entry.frq
    if (!slot.rank && entry.rank > 0) slot.rank = entry.rank
    if (!slot.meanings.length && Array.isArray(entry.meanings)) {
      slot.meanings = entry.meanings
    }
  })
})

function shortDef(meanings) {
  const list = Array.isArray(meanings) ? meanings : []
  // 优先展示非生僻义项，其次才是 rare
  const meaning = list.find((item) => item && item.def && !item.rare) || list.find((item) => item && item.def)
  if (!meaning) return ''
  const pos = String(meaning.pos || '').trim()
  const segments = String(meaning.def || '')
    .split(/[,，;；、]/)
    .map((seg) => seg.trim())
    .filter(Boolean)
  let text = segments.join(', ')
  if (text.length > MAX_DEF) text = text.slice(0, MAX_DEF)
  return pos ? `${pos} ${text}` : text
}

const rows = []
Object.keys(merged).forEach((word) => {
  // 只收单个英文单词：词组走词组本，联想框按前缀匹配词组没有意义
  if (!/^[a-z][a-z'-]*$/.test(word)) return
  const entry = merged[word]
  const def = shortDef(entry.meanings)
  if (!def) return
  // 常用度：frq 与 rank 都是「越小越常用」，都缺失的排到最后
  const weight = entry.frq > 0 ? entry.frq : entry.rank > 0 ? entry.rank : 99999
  rows.push({ word, ph: entry.ph, def, weight })
})

rows.sort((a, b) => {
  if (a.weight !== b.weight) return a.weight - b.weight
  return a.word < b.word ? -1 : a.word > b.word ? 1 : 0
})

const body = rows.map((row) => `${row.word}|${row.ph}|${row.def}`).join('\n')
const header = '// 本地联想种子词表（生成文件，勿手改）：按词频排序，格式 word|phonetic|简短释义\n'
fs.writeFileSync(OUT, `${header}module.exports = ${JSON.stringify(body)}\n`, 'utf8')

const bytes = fs.statSync(OUT).size
console.log('词条', rows.length, '文件', (bytes / 1024).toFixed(0) + 'KB')
