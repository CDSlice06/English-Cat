// 词库释义规范化：
// 1. 把「n. 资本，资金；adj. 主要的」这种一条释义里塞了多个词性的拆成独立义项
// 2. 去掉同一词条下完全重复的义项
// 3. 用 ECDICT 补齐词库里缺的词性（可选，--ecdict 指定 dict.json）
// 用法：node tools/normalize-dict.js [--ecdict <ecdict 的 dict.json>]
const fs = require('fs')
const path = require('path')
const ROOT = path.join(__dirname, '..')
const DIR = path.join(ROOT, 'cloud/analyzeArticle')
const FILES = ['cet', 'common', 'curated', 'extra', 'senses']
const POS_LABEL = /^(n|v|vt|vi|adj|adv|prep|conj|pron|num|art|int|aux|abbr)\.$/i

function argOf(name) {
  const at = process.argv.indexOf(name)
  return at >= 0 ? process.argv[at + 1] : ''
}

function isPos(token) {
  return POS_LABEL.test(String(token || '').trim())
}

function posClass(token) {
  const text = String(token || '').toLowerCase()
  if (/^n\./.test(text)) return 'n'
  if (/^(v|vt|vi)\./.test(text)) return 'v'
  if (/^(a|adj)\./.test(text)) return 'a'
  if (/^adv\./.test(text)) return 'r'
  return ''
}

// 把一条释义按内嵌词性标签拆开：保留每段自己的词性
function splitMeaning(meaning) {
  let def = String(meaning.def || '').trim()
  let pos = meaning.pos || ''
  // 释义开头的词性标签以数据为准，直接摘掉
  const lead = def.match(/^([A-Za-z]+)\.\s+/)
  if (lead && isPos(`${lead[1]}.`)) {
    pos = `${lead[1].toLowerCase()}.`
    def = def.slice(lead[0].length).trim()
  }
  const pieces = def.split(/\s*[；;,，]\s*(?=(?:n|v|vt|vi|adj|adv|prep|conj|pron|num|art|int|aux|abbr)\.\s)/i)
  if (pieces.length < 2) return [Object.assign({}, meaning, { pos, def })]
  const out = []
  let currentPos = pos
  pieces.forEach((piece) => {
    let text = piece.trim()
    if (!text) return
    const inner = text.match(/^([A-Za-z]+)\.\s*/)
    if (inner && isPos(`${inner[1]}.`)) {
      currentPos = `${inner[1].toLowerCase()}.`
      text = text.slice(inner[0].length).trim()
    }
    if (!text) return
    out.push(Object.assign({}, meaning, { pos: currentPos, def: text }))
  })
  return out.length ? out : [Object.assign({}, meaning, { pos, def })]
}

function dedupe(meanings) {
  const seen = new Set()
  return meanings.filter((meaning) => {
    const key = `${String(meaning.pos || '').toLowerCase()}|${String(meaning.def || '').replace(/\s+/g, '')}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function parseTranslation(text) {
  const out = []
  // ECDICT 的 translation 里换行是字面量 \n，不是真正的换行符
  String(text || '').split(/\\n|\r?\n/).forEach((line) => {
    const raw = line.trim()
    if (!raw || /^\[/.test(raw)) return
    const match = raw.match(/^([A-Za-z]+)\.\s*(.+)$/)
    if (!match) return
    const cls = posClass(`${match[1]}.`)
    if (!cls) return
    const def = match[2].trim()
    if (!def || def.length > 90) return
    out.push({ pos: `${match[1].toLowerCase()}.`, cls, def })
  })
  return out
}

const ECDICT = argOf('--ecdict')
const WN_DICT = argOf('--wn')
let ecdict = null
if (ECDICT) {
  const raw = require(path.resolve(ECDICT))
  ecdict = new Map(raw.map((item) => [String(item.word || '').toLowerCase(), item]))
}

// 只有 WordNet 也承认这个词性时才补，避免 ECDICT 里 envelop → 信封 这类张冠李戴
const wnPos = new Map()
if (WN_DICT) {
  ;['noun', 'verb', 'adj', 'adv'].forEach((pos) => {
    const file = path.join(WN_DICT, `index.${pos}`)
    if (!fs.existsSync(file)) return
    const cls = { noun: 'n', verb: 'v', adj: 'a', adv: 'r' }[pos]
    fs.readFileSync(file, 'utf8').split('\n').forEach((line) => {
      if (!line || line.charAt(0) === ' ') return
      const word = line.split(' ')[0]
      if (!wnPos.has(word)) wnPos.set(word, new Set())
      wnPos.get(word).add(cls)
    })
  })
}

const backup = path.join(require('os').tmpdir(), `dict-backup-${Date.now()}`)
fs.mkdirSync(backup, { recursive: true })

let splitCount = 0
let dedupeCount = 0
const dicts = {}

FILES.forEach((name) => {
  const file = path.join(DIR, `${name}.json`)
  const dict = require(file)
  fs.copyFileSync(file, path.join(backup, `${name}.json`))
  dicts[name] = dict
  Object.keys(dict).forEach((word) => {
    const entry = dict[word]
    if (!entry || !Array.isArray(entry.meanings)) return
    const before = entry.meanings.length
    let meanings = []
    entry.meanings.forEach((meaning) => {
      const parts = splitMeaning(meaning)
      if (parts.length > 1) splitCount += 1
      meanings = meanings.concat(parts)
    })
    const afterSplit = meanings.length
    meanings = dedupe(meanings)
    dedupeCount += afterSplit - meanings.length
    // 词性标签被摘掉时条数不变，但内容变了，也要写回
    entry.meanings = meanings
  })
})

// 跨词库去冗余：熟词生义表里的基础义项常和主词库重复，只是写法更短
const PRIORITY = ['cet', 'common', 'extra', 'curated', 'senses']
function segmentsOf(def) {
  return String(def || '')
    .split(/[,，;；、]/)
    .map((seg) => seg.replace(/^(n|v|vt|vi|adj|adv|prep|conj|pron|num|art|int|aux|abbr)\.\s*/i, '').trim())
    .filter(Boolean)
}
let redundant = 0
const words = {}
PRIORITY.forEach((name) => {
  Object.keys(dicts[name]).forEach((word) => {
    if (!words[word]) words[word] = []
    words[word].push(name)
  })
})
Object.keys(words).forEach((word) => {
  const covered = {}
  PRIORITY.forEach((name) => {
    const entry = dicts[name][word]
    if (!entry || !Array.isArray(entry.meanings)) return
    entry.meanings = entry.meanings.filter((meaning) => {
      const cls = posClass(meaning.pos)
      const segs = segmentsOf(meaning.def)
      if (!cls || !segs.length) return true
      const known = covered[cls] || (covered[cls] = new Set())
      // 这一条的每个中文片段都在前面的词库里出现过，就是重复义项
      if (segs.every((seg) => known.has(seg))) {
        redundant += 1
        return false
      }
      segs.forEach((seg) => known.add(seg))
      return true
    })
  })
})

// 词性补齐：只补词典里完全没有的词性，且只补单词（词组不补）
let filled = 0
if (ecdict) {
  const extra = dicts.extra
  const posIndex = {}
  FILES.forEach((name) => {
    Object.keys(dicts[name]).forEach((word) => {
      const entry = dicts[name][word]
      if (!Array.isArray(entry.meanings)) return
      if (!posIndex[word]) posIndex[word] = new Set()
      entry.meanings.forEach((meaning) => {
        const cls = posClass(meaning.pos)
        if (cls) posIndex[word].add(cls)
      })
    })
  })
  Object.keys(posIndex).forEach((word) => {
    if (!/^[a-z][a-z'-]*$/.test(word)) return
    const source = ecdict.get(word)
    if (!source) return
    const have = posIndex[word]
    const missing = parseTranslation(source.translation).filter((item) => {
      if (have.has(item.cls)) return false
      const known = wnPos.get(word)
      // WordNet 不认识的词（新造词、复合词）一律不补，只补双方都认可的词性
      return !!known && known.has(item.cls)
    })
    if (!missing.length) return
    if (!extra[word]) extra[word] = { meanings: [] }
    missing.forEach((item) => {
      extra[word].meanings.push({ pos: item.pos, def: item.def, rare: false })
      have.add(item.cls)
      filled += 1
    })
  })
}

FILES.forEach((name) => {
  fs.writeFileSync(path.join(DIR, `${name}.json`), JSON.stringify(dicts[name]), 'utf8')
})

console.log('拆分歧义', splitCount, '去掉重复义项', dedupeCount, '补词性', filled)
console.log('备份', backup)
