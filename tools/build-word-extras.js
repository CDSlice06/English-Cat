// 生成 miniprogram/pkgWords/data/wordExtras.js：每个词的近义词与例句。
// 数据来源：WordNet 3.0（近义词、英文例句）+ 内置真题题库原文（例句兜底）。
// 用法：node tools/build-word-extras.js --wn <wordnet-db 的 dict 目录>
// WordNet 数据可直接从 npm 包 wordnet-db 的 dict 目录取得（不需要额外安装依赖）。
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

const POS_FILE = { 'n.': 'noun', 'v.': 'verb', 'vt.': 'verb', 'vi.': 'verb', 'adj.': 'adjective', 'adv.': 'adverb' }
const POS_LABEL = { n: 'n.', v: 'v.', a: 'adj.', s: 'adj.', r: 'adv.' }
// 兜底匹配时不算数的高频虚字：共用「的」「一」不代表意思相关
const STOP_CHARS = new Set('的地得了着之其于与和或是有不一个人事物上下中大小'.split(''))

// ---------- WordNet 读取 ----------
// wordnet 包的解析器只取每个词条的第一个义项，这里直接读库文件拿全部义项
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
    const gloss = line.slice(split + 1).trim()
    // 数据行：synset_offset lex_filenum ss_type w_cnt (word lex_id)* p_cnt pointers...
    const type = head[2]
    const wordCount = parseInt(head[3], 16)
    const words = []
    for (let i = 0; i < wordCount; i += 1) {
      const word = head[4 + i * 2]
      if (word) words.push(word.replace(/_/g, ' '))
    }
    return { type, words, gloss }
  }
}

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
          rank: Number(entry.rank) || 0,
          forms: entry.forms || {}
        }
        return
      }
      if (!Object.keys(all[word].forms).length && entry.forms) all[word].forms = entry.forms
      // 与云函数 dict() 一致：前面的词库优先，只有 senses.json 补义项
      if (name !== 'senses') return
      meanings.forEach((meaning) => {
        const hit = all[word].meanings.find((item) => item.pos === meaning.pos
          && String(meaning.def).split(/[,，;；]/).some((seg) => seg && String(item.def).indexOf(seg.trim()) >= 0))
        if (!hit) all[word].meanings.push(meaning)
      })
    })
  })
  // 云函数会把 cet 词条的 der（派生词释义）也登记成词条，口径保持一致
  const cet = require(`${ROOT}/cloud/analyzeArticle/cet.json`)
  Object.keys(cet).forEach((word) => {
    const list = Array.isArray(cet[word].der) ? cet[word].der : []
    list.forEach((der) => {
      const key = der && der.w ? String(der.w).trim().toLowerCase() : ''
      if (!key || all[key] || !der.def) return
      all[key] = {
        meanings: [{ pos: der.pos || 'n.', def: String(der.def) }],
        frq: Number(cet[word].frq) || 0,
        rank: Number(cet[word].rank) || 0,
        forms: {}
      }
    })
  })
  return all
}

function shortDef(meaning) {
  return String((meaning && meaning.def) || '').split(/[,，;；]/)[0].trim()
}

// 释义拆成中文片段（去掉 vi. / n. 这类词性前缀），用来判断两个词的中文意思是否对得上
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

// 找到两个词中文释义里对得上的那一段，近义词就显示这一段而不是首义
// 以原词最靠前的义项为准：solve 匹配 resolve 应取「解决」，不是后面的「溶解」
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

function rankOf(word, entry) {
  if (!entry) return 9999
  if (entry.frq > 0) return entry.frq
  return entry.rank || 6000
}

// ---------- 近义词 ----------
// 索引里存的是词库文件名（adj / adv），比较时换回完整词性
const FILE_TO_POS = { noun: 'noun', verb: 'verb', adj: 'adjective', adv: 'adverb' }

// 一个词可能兼多个词性（make 名/动），全部收进来；每个词性最多 8 个义项，
// 再往后基本是专业/生僻义（significant 的第 4 个义项是 pregnant）
// synset.rank 记录它在同词性里的常用度顺序，选例句时只用前两个义项，避免举到生僻用法
const MAX_SYNSETS_PER_POS = 8

function matchingSynsets(entries, reader, word, preferredPos) {
  const byPos = {}
  entries.forEach((item) => {
    const list = byPos[item.pos] || (byPos[item.pos] = [])
    if (list.length >= MAX_SYNSETS_PER_POS) return
    const synset = reader(item.pos, item.offset)
    if (synset && synset.words.some((w) => w === word)) {
      synset.rank = list.length
      list.push(synset)
    }
  })
  const posOrder = Object.keys(byPos).sort((a, b) => {
    const pa = FILE_TO_POS[a] === preferredPos ? 0 : 1
    const pb = FILE_TO_POS[b] === preferredPos ? 0 : 1
    return pa - pb
  })
  const out = []
  posOrder.forEach((pos) => out.push.apply(out, byPos[pos]))
  return out
}

function synonymsOf(synsets, word, dict, headSegments) {
  const scores = new Map()
  synsets.forEach((synset) => {
    const posLabel = POS_LABEL[synset.type] || ''
    synset.words.forEach((candidate) => {
      if (!/^[a-z]{2,}$/.test(candidate) || candidate === word) return
      const entry = dict[candidate]
      if (!entry) return
      // 意思对不上就不要：strive 的同义集里还有 reach / strain，释义完全不同
      const matched = matchDef(headSegments, entry, posLabel)
      if (!matched) return
      const prev = scores.get(candidate)
      if (!prev || matched.score > prev.score) scores.set(candidate, { score: matched.score, pos: posLabel, def: matched.def })
    })
  })
  // 释义能精确对上的优先；一个都没有时才用「共用一个汉字」的兜底结果
  const strong = []
  const weak = []
  scores.forEach((item, candidate) => {
    if (item.score >= 2) strong.push({ w: candidate, ...item })
    else weak.push({ w: candidate, ...item })
  })
  const picked = strong.length ? strong : weak
  picked.sort((a, b) => (b.score - a.score)
    || (rankOf(a.w, dict[a.w]) - rankOf(b.w, dict[b.w]))
    || a.w.localeCompare(b.w))
  return picked.slice(0, strong.length ? 4 : 3)
}

function clean(text) {
  return String(text || '').replace(/[|\n\r]/g, ' ').replace(/\s+/g, ' ').trim()
}

;(() => {
  const index = buildWordNetIndex(WN_DICT)
  const reader = synsetReader(WN_DICT)
  const dict = loadDict()
  const words = Object.keys(dict).filter((word) => /^[a-z]{2,}$/.test(word)).sort()
  const lines = []
  let withSyn = 0

  words.forEach((word, i) => {
    const entry = dict[word]
    const posFile = POS_FILE[String(entry.meanings[0].pos || '').toLowerCase()] || ''
    const entries = index[word] || []
    const synsets = entries.length ? matchingSynsets(entries, reader, word, posFile) : []
    const headSegments = defSegments(entry)
    const synonyms = synsets.length ? synonymsOf(synsets, word, dict, headSegments) : []
    if (!synonyms.length) return
    withSyn += 1
    const synText = synonyms.map((item) => `${item.w}~${item.pos}~${clean(item.def)}`).join(',')
    lines.push(`${word}|${synText}`)
    if ((i + 1) % 4000 === 0) console.log('进度', i + 1, '/', words.length)
  })

  const text = lines.join('\n')
  fs.writeFileSync(`${ROOT}/miniprogram/pkgWords/data/wordExtras.js`,
    `// 单词补充信息（生成文件，勿手改）：word|近义(w~pos~def,..)\n`
    + `// 近义词来自 WordNet 3.0：只保留同词性、中文释义重合的义项，每个词最多 4 个。\n`
    + `module.exports = ${JSON.stringify(text)}\n`, 'utf8')

  console.log('词条', words.length, '有近义词', withSyn)
  console.log('体积', Math.round(Buffer.byteLength(text) / 1024), 'KB')
})()
