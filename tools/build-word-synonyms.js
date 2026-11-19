// 生成 cloud/analyzeArticle/synonyms.json：词库内每个词的 WordNet 近义词。
// 数据来源：WordNet 3.1 的 synset（同义词集合）。
// 只保留同时满足以下条件的候选，避免把「同义集里但意思对不上」的词当成近义词：
// - 候选在词库里，且是单个单词（WordNet 短语用下划线连接，不收）
// - 与原词同一词性，且中文释义有重合片段（strive 的同义集里有 reach，意思完全不同，弃掉）
// - 没有任何精确匹配时，才用「同词性 + 共用一个汉字」的兜底结果，最多 3 个
// - 每个词最多 4 个，按匹配强度、词频排序
// 输出紧凑的字符串数组：{"twit":["tease","bait"]}，云函数按需拼成词卡上的「近义」行。
//
// 用法：node tools/build-word-synonyms.js --wn <wordnet-db 的 dict 目录>
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

const FILE_TO_POS = { noun: 'noun', verb: 'verb', adj: 'adjective', adv: 'adverb' }
const POS_LABEL = { n: 'n.', v: 'v.', a: 'adj.', s: 'adj.', r: 'adv.' }
// 兜底匹配时不算数的高频虚字：共用「的」「一」不代表意思相关
const STOP_CHARS = new Set('的地得了着之其于与和或是有不一个人事物上下中大小'.split(''))
// 一个词可能兼多个词性，每个词性最多取 8 个义项；再往后多是生僻义
const MAX_SYNSETS_PER_POS = 8

// ---------- 词库 ----------
function loadDict() {
  const order = ['cet', 'common', 'extra', 'curated', 'advanced', 'base-ecdict', 'senses']
  // 用无原型对象：constructor / toString 这类词条名会撞上 Object.prototype
  const all = Object.create(null)
  order.forEach((name) => {
    const dict = require(`${ROOT}/cloud/analyzeArticle/${name}.json`)
    Object.keys(dict).forEach((word) => {
      const entry = dict[word]
      const meanings = (Array.isArray(entry) ? entry : entry.meanings || []).filter((m) => m && m.pos && m.def)
      if (!all[word]) {
        all[word] = {
          meanings,
          frq: Number(entry.frq) || 0,
          rank: Number(entry.rank) || 0
        }
        return
      }
      // 与云函数 dict() 完全一致：前面的词库优先，只有 senses.json 补义项。
      // 之前对所有来源都合并，会拿 extra 里 cat 的「呕吐」义项去连 vomit，
      // 而词卡上并不显示这个义项，近义词看起来就像错的
      if (name !== 'senses') return
      meanings.forEach((meaning) => {
        const hit = all[word].meanings.find((item) => item.pos === meaning.pos
          && String(meaning.def).split(/[,，;；]/).some((seg) => seg && String(item.def).indexOf(seg.trim()) >= 0))
        if (!hit) all[word].meanings.push(meaning)
      })
    })
  })
  // 云函数会把 cet 词条的 der（派生词释义）也登记成词条，构建脚本口径要一致
  const cet = require(`${ROOT}/cloud/analyzeArticle/cet.json`)
  Object.keys(cet).forEach((word) => {
    const list = Array.isArray(cet[word].der) ? cet[word].der : []
    list.forEach((der) => {
      const key = der && der.w ? String(der.w).trim().toLowerCase() : ''
      if (!key || all[key] || !der.def) return
      all[key] = {
        meanings: [{ pos: der.pos || 'n.', def: String(der.def) }],
        frq: Number(cet[word].frq) || 0,
        rank: Number(cet[word].rank) || 0
      }
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

function synsetReader(dir) {
  const handles = {}
  ;['noun', 'verb', 'adj', 'adv'].forEach((pos) => {
    const file = path.join(dir, `data.${pos}`)
    if (fs.existsSync(file)) handles[pos] = fs.openSync(file, 'r')
  })
  // 单个同义集行可能很长（十几个词 + 几十条指针），缓冲太小会把整行读丢
  const buffer = Buffer.alloc(65536)
  return (pos, offset) => {
    const fd = handles[pos]
    if (fd === undefined) return null
    const bytes = fs.readSync(fd, buffer, 0, buffer.length, offset)
    const line = buffer.toString('utf8', 0, bytes).split('\n')[0]
    const split = line.indexOf('|')
    if (split < 0) return null
    const head = line.slice(0, split).trim().split(/\s+/)
    const wordCount = parseInt(head[3], 16)
    const words = []
    for (let i = 0; i < wordCount; i += 1) {
      const word = head[4 + i * 2]
      if (word) words.push(word.replace(/_/g, ' '))
    }
    return { type: head[2], words }
  }
}

// ---------- 释义匹配 ----------
// 释义拆成中文片段（去掉词性前缀），用来判断两个词的中文意思是否对得上
function defSegments(entry) {
  const out = []
  ;((entry && entry.meanings) || []).forEach((meaning) => {
    String(meaning.def || '')
      .replace(/^(n|v|vt|vi|adj|adv|prep|conj|pron|num|art|int|aux|abbr|phr)\.\s*/gi, '')
      .split(/[,，;；、]/)
      .forEach((seg) => {
        const text = seg.trim()
        if (text && out.indexOf(text) < 0) out.push(text)
      })
  })
  return out
}

// 找到两个词中文释义里对得上的那一段；以原词靠前的义项为准。
// 返回 score=3（释义完全相同）/2（释义互相包含）/1（只共用一个汉字，作兜底）
function matchDef(headSegments, entry, posLabel) {
  const meanings = (entry.meanings || []).filter((meaning) => {
    const pos = String(meaning.pos || '').toLowerCase()
    return pos === posLabel || pos.indexOf(posLabel.replace('.', '')) === 0
  })
  let best = null
  let shared = null
  headSegments.forEach((head, headIndex) => {
    meanings.forEach((meaning) => {
      String(meaning.def || '')
        .replace(/^(n|v|vt|vi|adj|adv|prep|conj|pron|num|art|int|aux|abbr|phr)\.\s*/gi, '')
        .split(/[,，;；、]/)
        .forEach((seg) => {
          const text = seg.trim()
          if (!text) return
          let score = 0
          if (text === head) score = 3
          else if (text.length >= 2 && head.length >= 2 && (text.indexOf(head) >= 0 || head.indexOf(text) >= 0)) score = 2
          if (score) {
            if (!best || score > best.score || (score === best.score && headIndex < best.headIndex)) {
              best = { def: text, score, headIndex }
            }
            return
          }
          // 兜底：同词性、中文释义至少共用一个实义汉字（ability 能力 / power 力量）。
          // 只在该词没有任何精确匹配时才会用到，避免把泛泛相关的词排到前面
          if (!shared && text.length >= 2 && head.length >= 2 && /[\u4e00-\u9fa5]/.test(text)) {
            for (const ch of text) {
              if (STOP_CHARS.has(ch) || !/[\u4e00-\u9fa5]/.test(ch)) continue
              if (head.indexOf(ch) >= 0) { shared = { def: text, score: 1, headIndex }; break }
            }
          }
        })
    })
  })
  return best || shared
}

function matchingSynsets(entries, reader, word) {
  const byPos = {}
  entries.forEach((item) => {
    const list = byPos[item.pos] || (byPos[item.pos] = [])
    if (list.length >= MAX_SYNSETS_PER_POS) return
    const synset = reader(item.pos, item.offset)
    if (synset && synset.words.some((w) => w === word)) list.push(synset)
  })
  const out = []
  Object.keys(byPos).forEach((pos) => out.push.apply(out, byPos[pos]))
  return out
}

;(() => {
  const dict = loadDict()
  const index = buildWordNetIndex(WN_DICT)
  const read = synsetReader(WN_DICT)
  const words = Object.keys(dict).filter((word) => /^[a-z]{2,}$/.test(word))
  const out = Object.create(null)
  let withSynonym = 0

  words.forEach((word, i) => {
    const entries = index[word] || []
    if (!entries.length) return
    const headSegments = defSegments(dict[word])
    if (!headSegments.length) return
    const synsets = matchingSynsets(entries, read, word)
    // strong：释义能精确对上；weak：只共用汉字，仅在没有 strong 时兜底
    const scores = new Map()
    synsets.forEach((synset) => {
      const posLabel = POS_LABEL[synset.type] || ''
      synset.words.forEach((candidate) => {
        if (!/^[a-z]{2,}$/.test(candidate) || candidate === word) return
        const entry = dict[candidate]
        if (!entry) return
        const matched = matchDef(headSegments, entry, posLabel)
        if (!matched) return
        const prev = scores.get(candidate) || 0
        if (matched.score > prev) scores.set(candidate, matched.score)
      })
    })
    const strong = []
    const weak = []
    scores.forEach((score, candidate) => {
      if (score >= 2) strong.push({ w: candidate, score })
      else weak.push({ w: candidate, score })
    })
    const picked = strong.length ? strong : weak
    if (!picked.length) return
    withSynonym += 1
    out[word] = picked
      .sort((a, b) => (b.score - a.score)
        || (rankOf(a.w, dict) - rankOf(b.w, dict))
        || a.w.localeCompare(b.w))
      // 兜底来的近义词把握没那么大，少给两个
      .slice(0, strong.length ? 4 : 3)
      .map((item) => item.w)
    if ((i + 1) % 8000 === 0) console.log('进度', i + 1, '/', words.length)
  })

  const sorted = {}
  Object.keys(out).sort().forEach((word) => { sorted[word] = out[word] })
  const text = JSON.stringify(sorted)
  fs.writeFileSync(`${ROOT}/cloud/analyzeArticle/synonyms.json`, text, 'utf8')

  console.log('词库', words.length, '有近义词', withSynonym)
  ;['twit', 'abandon', 'increase', 'difficult', 'resilience', 'solve'].forEach((word) => {
    console.log(word, '→', (sorted[word] || []).join(', '))
  })
  console.log('体积', (Buffer.byteLength(text) / 1024 / 1024).toFixed(2), 'MB')
})()
