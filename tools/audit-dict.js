// 词库释义审计：把用户可见词库（合并后的最终结果）里确定性较高的问题扫出来。
// 只做「结构性问题」判定：残留词性标签、变形词残留、专业标签、无中文、同词性重复义项、
// 跨词性义项完全重复、WordNet 不支持该词性、超长/空释义。
// 语义层面的问题（twit 缺「傻瓜」这类现代常用义）无法离线判定，不在这里报。
//
// 用法：node tools/audit-dict.js [--out .local/dict-audit.json]
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const DIR = path.join(ROOT, 'cloud/analyzeArticle')
const WN = path.join(ROOT, '.local/dict/package/dict')

function argOf(name) {
  const at = process.argv.indexOf(name)
  return at >= 0 ? process.argv[at + 1] : ''
}
const OUT = argOf('--out') || path.join(ROOT, '.local/dict-audit.json')

// ---------- 合并词库（口径与云函数 dict() 一致） ----------
const SOURCES = ['cet', 'common', 'extra', 'curated', 'advanced', 'base-ecdict']
const merged = Object.create(null)
const sourceOf = Object.create(null)
SOURCES.forEach((name) => {
  const dict = require(path.join(DIR, `${name}.json`))
  Object.keys(dict).forEach((word) => {
    if (merged[word]) return
    merged[word] = dict[word]
    sourceOf[word] = name
  })
})
// 熟词生义补丁：追加义项
const senses = require(path.join(DIR, 'senses.json'))
Object.keys(senses).forEach((word) => {
  const base = merged[word]
  if (!base || !Array.isArray(base.meanings)) return
  ;(senses[word].meanings || []).forEach((item) => {
    if (!item.pos || !item.def) return
    if (base.meanings.some((m) => m.pos === item.pos && m.def === item.def)) return
    base.meanings.push({ pos: item.pos, def: item.def })
  })
})

// ---------- WordNet 词性索引 ----------
const wnPos = new Map()
;['noun', 'verb', 'adj', 'adv'].forEach((pos) => {
  const file = path.join(WN, `index.${pos}`)
  if (!fs.existsSync(file)) return
  const cls = { noun: 'n.', verb: 'v.', adj: 'adj.', adv: 'adv.' }[pos]
  fs.readFileSync(file, 'utf8').split('\n').forEach((line) => {
    if (!line || line.charAt(0) === ' ') return
    const lemma = line.split(' ')[0].replace(/_/g, ' ')
    if (!lemma || lemma.indexOf(' ') >= 0) return
    if (!wnPos.has(lemma)) wnPos.set(lemma, new Set())
    wnPos.get(lemma).add(cls)
  })
})

// ---------- 判定规则 ----------
const POS_LABEL = /^(n|v|vt|vi|adj|adv|prep|conj|pron|num|art|int|interj|aux|abbr|phr)\.\s/gi
const TAG = /\[(网络|医|化|机|计|经|法|生|地质|物|数|矿|农|军|建|冶|电|律|商|心|语|哲|宗|艺|音|体|教|口|俚|方|古|诗|贬|褒)\]/
const INFLECTION = /的(复数|过去式|过去分词|现在分词|第三人称单数)/
const CN = /[\u4e00-\u9fa5]/
const WN_CHECK_POS = new Set(['n.', 'v.', 'adj.', 'adv.'])

function norm(def) {
  return String(def || '').replace(/\s+/g, '').replace(/[，,；;、]/g, '')
}

function cleanWords(word) {
  return /^[a-z][a-z'-]*$/.test(word) && word.indexOf('-') < 0 && word.indexOf("'") < 0
}

const flags = []
function add(word, source, check, detail) {
  flags.push({ word, source, check, detail })
}

Object.keys(merged).forEach((word) => {
  const entry = merged[word]
  const meanings = (entry && Array.isArray(entry.meanings)) ? entry.meanings : []
  const source = sourceOf[word] || 'senses'
  if (!meanings.length) {
    add(word, source, 'empty', '')
    return
  }
  const seenDef = new Map()
  meanings.forEach((m) => {
    const def = String((m && m.def) || '').trim()
    const pos = String((m && m.pos) || '').trim()
    if (!def) {
      add(word, source, 'empty-def', pos)
      return
    }
    if (!CN.test(def)) add(word, source, 'no-chinese', `${pos} ${def}`)
    if (POS_LABEL.test(def)) {
      POS_LABEL.lastIndex = 0
      add(word, source, 'pos-in-def', `${pos} ${def}`)
    }
    POS_LABEL.lastIndex = 0
    if (INFLECTION.test(def)) add(word, source, 'inflection', `${pos} ${def}`)
    if (TAG.test(def)) add(word, source, 'tag', `${pos} ${def}`)
    if (def.length > 80) add(word, source, 'too-long', `${pos} ${def}`)
    const segs = def.split(/[,，;；、]/).map((s) => s.trim()).filter(Boolean)
    const dup = segs.filter((s, i) => segs.indexOf(s) !== i)
    if (dup.length) add(word, source, 'dup-seg', `${pos} ${def}`)
    const key = `${pos}|${norm(def)}`
    if (seenDef.has(key)) add(word, source, 'dup-meaning', `${pos} ${def}`)
    seenDef.set(key, true)
  })
  // 跨词性义项完全相同：n./v. 都写「嘲笑」这类，多半是词性张冠李戴
  const byDef = new Map()
  meanings.forEach((m) => {
    const key = norm(m.def)
    if (!key) return
    const prev = byDef.get(key)
    if (prev && prev !== m.pos) add(word, source, 'cross-pos-dup', `${prev}/${m.pos} ${m.def}`)
    if (!prev) byDef.set(key, m.pos)
  })
  // WordNet 不支持该词性：只查纯小写单词，词组/连字符/派生词不判
  if (cleanWords(word) && wnPos.has(word)) {
    const known = wnPos.get(word)
    const used = new Set(meanings.map((m) => m.pos))
    used.forEach((pos) => {
      if (!WN_CHECK_POS.has(pos)) return
      if (!known.has(pos)) add(word, source, 'wn-pos-missing', `${pos} ${(meanings.find((m) => m.pos === pos) || {}).def}`)
    })
  }
})

// ---------- 汇总 ----------
const byCheck = {}
const bySource = {}
flags.forEach((item) => {
  byCheck[item.check] = (byCheck[item.check] || 0) + 1
  bySource[item.source] = (bySource[item.source] || 0) + 1
})
const words = new Set(flags.map((item) => item.word))
console.log(`词条总数 ${Object.keys(merged).length}，命中问题词 ${words.size}，问题条数 ${flags.length}`)
console.log('按类型：', byCheck)
console.log('按来源：', bySource)
Object.keys(byCheck).forEach((check) => {
  console.log(`\n=== ${check} (${byCheck[check]}) ===`)
  flags.filter((item) => item.check === check).slice(0, 12)
    .forEach((item) => console.log(`${item.word} [${item.source}] ${item.detail}`))
})
fs.writeFileSync(OUT, JSON.stringify(flags, null, 1), 'utf8')
console.log(`\n明细已写入 ${OUT}`)

// ---------- 生成可读清单 ----------
const CHECK_LABEL = {
  empty: '空词条',
  'empty-def': '空释义',
  'no-chinese': '无中文释义',
  'pos-in-def': '释义里带词性标签',
  inflection: '变形词残留',
  tag: '专业/语体标签',
  'too-long': '释义过长',
  'dup-seg': '重复义项片段',
  'dup-meaning': '重复义项',
  'cross-pos-dup': '跨词性义项重复',
  'wn-pos-missing': '该词性未见于 WordNet'
}
const SOURCE_LABEL = {
  cet: '四六级核心词（cet）',
  common: '常用词（common）',
  curated: '精选词（curated）',
  extra: '补充词（extra）',
  advanced: '进阶词（advanced）',
  'base-ecdict': 'ECDICT 兜底词',
  senses: '熟词生义补丁'
}
const SOURCE_ORDER = ['cet', 'common', 'curated', 'extra', 'advanced', 'base-ecdict', 'senses']
const CHECK_ORDER = ['empty', 'empty-def', 'no-chinese', 'pos-in-def', 'inflection', 'dup-meaning', 'dup-seg', 'cross-pos-dup', 'too-long', 'tag', 'wn-pos-missing']

const md = []
md.push('# 词库释义审计清单')
md.push('')
md.push(`共 ${Object.keys(merged).length} 条词条，命中 ${flags.length} 条、${words.size} 个词。`)
md.push('')
md.push('说明：')
md.push('- `该词性未见于 WordNet`：可能是罕见但正确的义项，也可能是错义/错词性，需要逐条判断；例如 `aluminium adj. 铝的` 正确，`apt n. 波` 是错的。')
md.push('- `专业/语体标签`：如 `[化]`、`[电]`，一般不需要修改，只是展示时比较杂。')
md.push('- `重复义项片段`、`释义里带词性标签` 已由 tools/clean-dict.js 自动处理，重新运行本脚本得到的就是清理后的结果。')
md.push('')
SOURCE_ORDER.forEach((source) => {
  const items = flags.filter((item) => item.source === source)
  if (!items.length) return
  items.sort((a, b) => {
    const ca = CHECK_ORDER.indexOf(a.check)
    const cb = CHECK_ORDER.indexOf(b.check)
    if (ca !== cb) return ca - cb
    const fa = (merged[a.word] && merged[a.word].frq) || 99999
    const fb = (merged[b.word] && merged[b.word].frq) || 99999
    return fa - fb
  })
  md.push(`## ${SOURCE_LABEL[source] || source}（${items.length} 条）`)
  md.push('')
  md.push('| 单词 | 频率 | 问题 | 当前释义 |')
  md.push('| --- | --- | --- | --- |')
  items.forEach((item) => {
    const frq = (merged[item.word] && merged[item.word].frq) || ''
    const detail = String(item.detail || '').replace(/\|/g, '\\|')
    md.push(`| ${item.word} | ${frq} | ${CHECK_LABEL[item.check] || item.check} | ${detail} |`)
  })
  md.push('')
})
const MD_OUT = OUT.replace(/\.json$/, '.md')
fs.writeFileSync(MD_OUT, md.join('\n'), 'utf8')
console.log(`可读清单已写入 ${MD_OUT}`)
