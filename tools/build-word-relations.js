// 生成 cloud/analyzeArticle/relations.json：每个词的 WordNet 派生同族词。
// 数据来源：WordNet 3.1 的派生关系指针（+，derivationally related form）。
// 指针里带「源词序号 → 目标词序号」，按序号取到具体词，才是精确的派生对
// （ability → able、diversion → divert），不会把同一个同义集里的近义词一并算进来。
// 只保留词库内存在的单词，每词最多 8 个。
// 用法：node tools/build-word-relations.js --wn <wordnet-db 的 dict 目录>
const fs = require('fs')
const path = require('path')
const ROOT = path.join(__dirname, '..')

function argOf(name) {
  const at = process.argv.indexOf(name)
  return at >= 0 ? process.argv[at + 1] : ''
}

const WN_DICT = argOf('--wn') || process.env.WN_DICT || ''
if (!WN_DICT || !fs.existsSync(path.join(WN_DICT, 'index.noun'))) {
  console.error('请用 --wn 指定 wordnet-db 的 dict 目录（内含 index.noun / data.noun）')
  process.exit(1)
}

// ---------- 词库 ----------
function loadDict() {
  const order = ['cet', 'common', 'extra', 'curated', 'advanced', 'base-ecdict', 'senses']
  const all = Object.create(null)
  order.forEach((name) => {
    const dict = require(`${ROOT}/cloud/analyzeArticle/${name}.json`)
    Object.keys(dict).forEach((word) => {
      if (!all[word]) all[word] = { frq: Number(dict[word].frq) || 0, rank: Number(dict[word].rank) || 0 }
    })
  })
  // 云函数会把 cet 词条的 der（派生词释义）也登记成词条，构建脚本口径要一致，
  // 否则 abandonment 这类只在 der 里出现的派生词永远查不到同族关系
  const cet = require(`${ROOT}/cloud/analyzeArticle/cet.json`)
  Object.keys(cet).forEach((word) => {
    const list = Array.isArray(cet[word].der) ? cet[word].der : []
    list.forEach((der) => {
      const key = der && der.w ? String(der.w).trim().toLowerCase() : ''
      if (!key || all[key]) return
      all[key] = { frq: Number(cet[word].frq) || 0, rank: Number(cet[word].rank) || 0 }
    })
  })
  return all
}

function rankOf(word, dict) {
  const entry = dict[word]
  if (!entry) return 9999
  if (entry.frq > 0) return entry.frq
  return entry.rank || 6000
}

// ---------- WordNet 读取 ----------
function buildWordNetIndex(dir) {
  const index = Object.create(null)
  ;['noun', 'verb', 'adj', 'adv'].forEach((pos) => {
    const file = path.join(dir, `index.${pos}`)
    if (!fs.existsSync(file)) return
    fs.readFileSync(file, 'utf8').split('\n').forEach((line) => {
      if (!line || line.charAt(0) === ' ') return
      const parts = line.split(' ')
      const lemma = parts[0]
      const synsetCount = Number(parts[2]) || 0
      const pointerCount = Number(parts[3]) || 0
      const start = 4 + pointerCount + 2
      const offsets = parts.slice(start, start + synsetCount).map(Number).filter(Boolean)
      if (!offsets.length) return
      if (!index[lemma]) index[lemma] = []
      offsets.forEach((offset) => index[lemma].push({ pos, offset }))
    })
  })
  return index
}

const POS_MAP = { n: 'noun', v: 'verb', a: 'adj', s: 'adj', r: 'adv' }

function synsetReader(dir) {
  const handles = {}
  ;['noun', 'verb', 'adj', 'adv'].forEach((pos) => {
    const file = path.join(dir, `data.${pos}`)
    if (fs.existsSync(file)) handles[pos] = fs.openSync(file, 'r')
  })
  // 单个同义集行可能很长（十几个词 + 几十条指针），缓冲太小会截断到没有「|」，
  // 导致 chemistry 这类词的派生线索被整行丢掉
  const buffer = Buffer.alloc(65536)
  return (pos, offset) => {
    const fd = handles[pos]
    if (fd === undefined) return null
    const bytes = fs.readSync(fd, buffer, 0, buffer.length, offset)
    const line = buffer.toString('utf8', 0, bytes).split('\n')[0]
    const split = line.indexOf('|')
    if (split < 0) return null
    const head = line.slice(0, split).trim().split(/\s+/)
    const type = head[2]
    const wordCount = parseInt(head[3], 16)
    const words = []
    for (let i = 0; i < wordCount; i += 1) {
      const word = head[4 + i * 2]
      if (word) words.push(word.replace(/_/g, ' '))
    }
    const pointerCount = Number(head[4 + wordCount * 2]) || 0
    const pointers = []
    let at = 5 + wordCount * 2
    for (let i = 0; i < pointerCount; i += 1) {
      pointers.push({
        symbol: head[at],
        offset: Number(head[at + 1]),
        pos: POS_MAP[head[at + 2]] || '',
        // 最后一段是「源词序号 + 目标词序号」（各两位十六进制），拿它锁定具体词
        srcTgt: head[at + 3] || ''
      })
      at += 4
    }
    return { type, words, pointers }
  }
}

;(() => {
  const dict = loadDict()
  const index = buildWordNetIndex(WN_DICT)
  const read = synsetReader(WN_DICT)
  const words = Object.keys(dict).filter((word) => /^[a-z]{2,}$/.test(word)).sort()
  const links = Object.create(null)
  let withLinks = 0

  words.forEach((word, i) => {
    const entries = index[word] || []
    const seen = new Set()
    entries.forEach(({ pos, offset }) => {
      const synset = read(pos, offset)
      if (!synset) return
      const lemmas = synset.words.map((raw) => raw.trim().toLowerCase())
      // 一个同义集里可能同时有 ability / power，只处理指向本词的那条指针
      const myIndexes = []
      lemmas.forEach((lemma, at) => { if (lemma === word) myIndexes.push(at) })
      if (!myIndexes.length) return
      synset.pointers.forEach((pointer) => {
        if (pointer.symbol !== '+') return
        const code = String(pointer.srcTgt || '')
        if (code.length < 4) return
        const source = parseInt(code.slice(0, 2), 16) - 1
        const targetIndex = parseInt(code.slice(2, 4), 16) - 1
        if (myIndexes.indexOf(source) < 0) return
        const target = read(pointer.pos, pointer.offset)
        if (!target) return
        const raw = target.words[targetIndex]
        if (!raw) return
        const candidate = raw.trim().toLowerCase()
        if (!/^[a-z]{2,}$/.test(candidate) || candidate === word || seen.has(candidate)) return
        if (!dict[candidate]) return
        seen.add(candidate)
      })
    })
    const list = Array.from(seen)
      .sort((a, b) => (a.length - b.length)
        || (rankOf(a, dict) - rankOf(b, dict))
        || a.localeCompare(b))
      .slice(0, 8)
    if (!list.length) return
    withLinks += 1
    links[word] = list
    if ((i + 1) % 4000 === 0) console.log('进度', i + 1, '/', words.length)
  })

  // 反向补齐：diversion 登记了 divert，divert 也要能查到 diversion
  Object.keys(links).forEach((word) => {
    links[word].forEach((candidate) => {
      if (!links[candidate]) links[candidate] = []
      if (links[candidate].indexOf(word) < 0 && links[candidate].length < 8) links[candidate].push(word)
    })
  })
  Object.keys(links).forEach((word) => {
    links[word].sort((a, b) => (a.length - b.length)
      || (rankOf(a, dict) - rankOf(b, dict))
      || a.localeCompare(b))
  })

  const sorted = {}
  Object.keys(links).sort().forEach((word) => { sorted[word] = links[word] })
  fs.writeFileSync(`${ROOT}/cloud/analyzeArticle/relations.json`, JSON.stringify(sorted), 'utf8')

  console.log('词库', words.length, '有派生同族关系', withLinks)
  console.log('diversion →', (sorted.diversion || []).join(', '))
  console.log('divert →', (sorted.divert || []).join(', '))
  console.log('体积', Math.round(Buffer.byteLength(JSON.stringify(sorted)) / 1024), 'KB')
})()
