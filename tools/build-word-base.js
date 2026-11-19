// 生成 cloud/analyzeArticle/base-ecdict.json：ECDICT 全量补充词库。
// 数据来源：ECDICT（https://github.com/skywind3000/ECDICT，MIT 协议）的 ecdict.csv。
// 目的：cet/common/extra/curated 只手收了 1.7 万个词，正文和手动查词里大量正常英文词
// （twit / abattoir / nanostructure 这类）查不到。这里把 ECDICT 里「真正的词条」补齐，
// 已有的高质量词条一律不覆盖，只补缺失。
//
// 过滤口径（宁可少收，也不收错）：
// - 只收小写单词（排除专有名词、缩写、带空格词组），允许一个连字符或 o'clock 式撇号
// - 必须有中文释义，且至少有一条带词性前缀（n. / vt. / adj. …）的释义
// - 排除变形词（translation 里写「…的复数 / 过去式 / 分词 / 第三人称单数」，
//   或 exchange 里带 0: 说明它是某个原形的变化形式）：变形由词形还原处理，不能单独成词条
// - 排除只有 [网络]/[医]/[化] 这类专业标记、或只作人名的条目
//
// 用法：node tools/build-word-base.js [--ecdict .local/dict/ecdict.csv] [--max-rank 60000]
const fs = require('fs')
const path = require('path')
const ROOT = path.join(__dirname, '..')

function argOf(name) {
  const at = process.argv.indexOf(name)
  return at >= 0 ? process.argv[at + 1] : ''
}

const CSV = argOf('--ecdict') || path.join(ROOT, '.local/dict/ecdict.csv')
const OUT = argOf('--out') || path.join(ROOT, 'cloud/analyzeArticle/base-ecdict.json')
// 语料词频门槛：bnc / frq 都在 6 万以后、又没有任何考试标签和词形变化的词，
// 多为生僻旧词和专业术语，收进来只会污染联想和中文反查
const MAX_RANK = Number(argOf('--max-rank')) || 60000

if (!fs.existsSync(CSV)) {
  console.error(`找不到 ECDICT 词库：${CSV}。请先下载 ecdict.csv 或用 --ecdict 指定路径`)
  process.exit(1)
}

// ---------- CSV 解析 ----------
// ECDICT 的释义字段里用字面量 \n 分行（不是真换行），字段内逗号用双引号包裹，
// 引号内的双引号写成 ""。这里按 RFC4180 处理，顺带兼容真正的换行
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1 } else quoted = false
      } else field += ch
      continue
    }
    if (ch === '"') { quoted = true; continue }
    if (ch === ',') { row.push(field); field = ''; continue }
    if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      continue
    }
    if (ch === '\r') continue
    field += ch
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows
}

// ---------- 已有词库 ----------
function existingWords() {
  const order = ['cet', 'common', 'extra', 'curated', 'advanced', 'senses']
  const set = new Set()
  order.forEach((name) => {
    const dict = require(path.join(ROOT, 'cloud/analyzeArticle', `${name}.json`))
    Object.keys(dict).forEach((word) => set.add(word))
  })
  return set
}

// ---------- 释义解析 ----------
const POS_TOKENS = new Set(['n', 'v', 'vt', 'vi', 'adj', 'a', 'adv', 'ad', 'prep', 'conj', 'pron',
  'num', 'art', 'int', 'interj', 'aux', 'abbr', 'phr', 'suf', 'pref', 'comb', 'modal'])
const POS_NORMAL = {
  n: 'n.', v: 'v.', vt: 'v.', vi: 'v.', adj: 'adj.', a: 'adj.', adv: 'adv.', ad: 'adv.',
  prep: 'prep.', conj: 'conj.', pron: 'pron.', num: 'num.', art: 'art.', int: 'int.',
  interj: 'int.', aux: 'aux.', abbr: 'abbr.', phr: 'phr.', suf: 'suf.', pref: 'pref.',
  comb: 'comb.', modal: 'modal.'
}

// 词性前缀：n. / vt., vi. / adj. 之后跟释义正文
const POS_PREFIX = /^([a-z]+(?:\s*[,，]\s*[a-z]+)*)\.\s*(.+)$/i

function parsePosPrefix(line) {
  const match = POS_PREFIX.exec(line)
  if (!match) return null
  const tokens = match[1].split(/[,，]/).map((token) => token.trim().toLowerCase()).filter(Boolean)
  if (!tokens.length || tokens.some((token) => !POS_TOKENS.has(token))) return null
  const pos = Array.from(new Set(tokens.map((token) => POS_NORMAL[token])))
  return { pos, def: match[2].trim() }
}

function cleanDef(text) {
  let value = String(text || '')
    // 人名/地名括注（Aaron)人名；(西)埃斯库埃拉）不是词义
    .replace(/[(（][^()（）]*人名[^()（）]*[)）]/g, '')
    .replace(/[(（][^()（）]*地名[^()（）]*[)）]/g, '')
    .replace(/[(（][^()（）]*的(?:复数|过去式|过去分词|现在分词|第三人称单数)[^()（）]*[)）]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^[=:：\s]+/, '')
    .replace(/[：:；;、\s]+$/, '')
    .trim()
  // 部分词条的释义里又套了一层词性前缀（vt., vi. vi. (使)挥发），去掉重复的那层
  for (let i = 0; i < 2; i += 1) {
    const nested = POS_PREFIX.exec(value)
    if (!nested) break
    const tokens = nested[1].split(/[,，]/).map((token) => token.trim().toLowerCase())
    if (tokens.some((token) => !POS_TOKENS.has(token))) break
    value = nested[2].trim()
  }
  return value.replace(/[：:；;、\s]+$/, '').trim()
}

// 音标清洗：ECDICT 少数音标带反斜杠、^ 等转义残渣，只保留国际音标常用字符
const PHONETIC_OK = /[^a-zæɑɒɔəәɜɛɪʊʌʃʒθðŋɡˈˌː'()\-,;. ]/gi

function cleanPhonetic(text) {
  const value = String(text || '')
    .replace(/^\/|\/$/g, '')
    .split(';')[0]
    .replace(PHONETIC_OK, '')
    .replace(/\s+/g, ' ')
    .trim()
  return value.slice(0, 48)
}

// 变形词标记：这类条目是别的词的屈折形式，交给词形还原处理
const INFLECTION = /的(复数|过去式|过去分词|现在分词|第三人称单数|比较级|最高级)|(复数|过去式|过去分词|现在分词|第三人称单数)形式/

// 同词性多条释义合并成一行，保持和现有词库一致的「；」分隔
function parseMeanings(translation) {
  const lines = String(translation || '').split(/\\n|\n/)
  const byPos = new Map()
  let inflected = false
  lines.forEach((raw) => {
    const line = raw.trim()
    if (!line) return
    // 专业/网络标记行（[网络] [医] [化] …）不作通用释义
    if (line.charAt(0) === '[') return
    // 人名/地名行（(Roelof)人名；(荷、南非)鲁洛夫）不是词义
    if (/人名|地名/.test(line)) return
    if (INFLECTION.test(line)) { inflected = true; return }
    const parsed = parsePosPrefix(line)
    if (!parsed) return
    const def = cleanDef(parsed.def)
    if (!def || !/[\u4e00-\u9fff]/.test(def)) return
    parsed.pos.forEach((pos) => {
      const list = byPos.get(pos) || []
      if (!list.some((item) => item.indexOf(def) >= 0 || def.indexOf(item) >= 0)) list.push(def)
      byPos.set(pos, list)
    })
  })
  const meanings = []
  byPos.forEach((defs, pos) => {
    const def = defs.join('；').slice(0, 80)
    meanings.push({ pos, def })
  })
  return { meanings, inflected }
}

// ---------- 词形变化 ----------
const EXCHANGE_KEYS = { s: 'plural', 3: 'third', p: 'past', d: 'pp', i: 'ing' }

function parseForms(exchange, hasNoun, hasVerb) {
  const forms = {}
  String(exchange || '').split('/').forEach((pair) => {
    const at = pair.indexOf(':')
    if (at <= 0) return
    const key = pair.slice(0, at).trim()
    const value = pair.slice(at + 1).trim().toLowerCase()
    if (!value || value.indexOf(' ') >= 0 || !/^[a-z'-]+$/.test(value)) return
    const target = EXCHANGE_KEYS[key]
    if (!target) return
    // s 对名词是复数、对动词也可能是第三人称；3 只给动词
    if (target === 'plural' && !hasNoun && hasVerb) return
    if (target === 'third' && !hasVerb) return
    if ((target === 'past' || target === 'pp' || target === 'ing') && !hasVerb) return
    if (!forms[target]) forms[target] = value
  })
  return forms
}

// 单词形态：小写字母，最多一个连字符（两边各至少 3 个字母），或 o'clock 式撇号
function wordOk(word) {
  if (!/^[a-z][a-z'-]*$/.test(word)) return false
  if (word.length < 3 || word.length > 24) return false
  if (/(.)\1\1/.test(word)) return false
  if (!/[aeiouy]/.test(word)) return false
  if (word.indexOf('-') >= 0) {
    if ((word.match(/-/g) || []).length > 1) return false
    const parts = word.split('-')
    if (parts.length !== 2 || parts[0].length < 3 || parts[1].length < 3) return false
  }
  if (word.indexOf("'") >= 0 && !/^[a-z]+'[a-z]+$/.test(word)) return false
  return true
}

// ECDICT 收词偏传统，这些近十年才进入外刊的网络/社会议题词它还没有。
// 词条少、都可核对，直接内置；已有词库覆盖的词不会重复添加
const MODERN_WORDS = {
  unfollow: { ph: 'ˌʌnˈfɒləʊ', meanings: [{ pos: 'v.', def: '取消关注（社交媒体账号）' }] },
  crowdsourcing: { ph: 'ˈkraʊdsɔːsɪŋ', meanings: [{ pos: 'n.', def: '众包（把任务公开征集、交由大众完成）' }] },
  crowdsource: { ph: 'ˈkraʊdsɔːs', meanings: [{ pos: 'v.', def: '众包，向大众征集（方案、资金等）' }] },
  netizen: { ph: 'ˈnetɪzn', meanings: [{ pos: 'n.', def: '网民' }] },
  selfie: { ph: 'ˈselfi', meanings: [{ pos: 'n.', def: '自拍照' }] },
  vlog: { ph: 'vlɒɡ', meanings: [{ pos: 'n.', def: '视频博客，视频日志' }, { pos: 'v.', def: '拍摄并发布视频博客' }] },
  vlogger: { ph: 'ˈvlɒɡə', meanings: [{ pos: 'n.', def: '视频博主' }] },
  upcycling: { ph: 'ˌʌpˈsaɪklɪŋ', meanings: [{ pos: 'n.', def: '升级再造（把废弃物改造成价值更高的新品）' }] },
  'fact-check': { ph: '', meanings: [{ pos: 'v.', def: '核查（报道、言论的）事实' }, { pos: 'n.', def: '事实核查' }] },
  retweet: { ph: 'ˌriːˈtwiːt', meanings: [{ pos: 'v.', def: '转发（他人的推文）' }, { pos: 'n.', def: '转发的内容' }] },
  phishing: { ph: 'ˈfɪʃɪŋ', meanings: [{ pos: 'n.', def: '网络钓鱼（骗取账号、密码的欺诈手段）' }] },
  ransomware: { ph: 'ˈrænsəmweə', meanings: [{ pos: 'n.', def: '勒索软件' }] },
  greenwashing: { ph: 'ˈɡriːnwɒʃɪŋ', meanings: [{ pos: 'n.', def: '漂绿（以虚假宣传标榜环保）' }] },
  unboxing: { ph: 'ʌnˈbɒksɪŋ', meanings: [{ pos: 'n.', def: '开箱（展示新产品的视频）' }] },
  performative: { ph: 'pəˈfɔːmətɪv', meanings: [{ pos: 'adj.', def: '表演性的，做给人看的（而非真心实意）' }] },
  wellness: { ph: 'ˈwelnəs', meanings: [{ pos: 'n.', def: '健康，养生（尤指通过生活方式维护身心健康）' }] },
  staycation: { ph: 'steɪˈkeɪʃn', meanings: [{ pos: 'n.', def: '居家度假，本地度假' }] },
  intersectionality: { ph: 'ˌɪntəsekʃəˈnæləti', meanings: [{ pos: 'n.', def: '交叉性（多重身份带来的歧视叠加）' }] }
}

// ---------- 主流程 ----------
;(() => {
  const existing = existingWords()
  const rows = parseCsv(fs.readFileSync(CSV, 'utf8'))
  const header = rows[0]
  const idx = {}
  header.forEach((name, i) => { idx[name] = i })

  const out = {}
  let total = 0
  let skippedExisting = 0
  let skippedInflected = 0
  let skippedNoMeaning = 0
  let skippedLowValue = 0
  let skippedName = 0

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i]
    const word = String(row[idx.word] || '').trim()
    if (!wordOk(word)) continue
    if (existing.has(word)) { skippedExisting += 1; continue }
    total += 1

    const translation = row[idx.translation] || ''
    if (!/[\u4e00-\u9fff]/.test(translation)) continue
    // 只作人名的条目：释义里出现人名且去掉括注后没有别的中文
    const translationNoName = translation.replace(/[(（][^()（）]*(人名|地名)[^()（）]*[)）]/g, '')
    if (/人名/.test(translation) && !/[\u4e00-\u9fff]/.test(cleanDef(translationNoName))) { skippedName += 1; continue }

    const exchange = String(row[idx.exchange] || '').trim()
    // 0: 表示这条是别的词的屈折/派生形式（0:yellow/1:r）
    if (/(^|\/)0:/.test(exchange)) { skippedInflected += 1; continue }

    const { meanings, inflected } = parseMeanings(translation)
    if (inflected || !meanings.length) { skippedNoMeaning += 1; continue }
    // 只作缩写的条目（tha 之类）对阅读和背词都没意义
    if (meanings.every((item) => item.pos === 'abbr.')) { skippedNoMeaning += 1; continue }
    // 纯人名/姓氏条目（伊拉兹马斯（男子名））不收；地名保留，外刊里经常出现
    if (meanings.every((item) => /男子名|女子名|姓氏/.test(item.def) && !/地名/.test(item.def))) {
      skippedName += 1
      continue
    }

    const bnc = Number(row[idx.bnc]) || 0
    const frq = Number(row[idx.frq]) || 0
    const collins = Number(row[idx.collins]) || 0
    const oxford = Number(row[idx.oxford]) || 0
    const tag = String(row[idx.tag] || '').trim()
    const rank = Math.min(...[bnc, frq].filter((value) => value > 0), Number.MAX_SAFE_INTEGER)
    const hasExamTag = /(^|\s)(cet4|cet6|gk)(\s|$)/.test(tag)
    // 低价值词：既不在考试大纲、也进不了语料前 6 万、还没有任何词形变化
    if (!hasExamTag && !collins && !oxford && rank > MAX_RANK && !exchange) { skippedLowValue += 1; continue }

    const hasNoun = meanings.some((item) => item.pos === 'n.')
    const hasVerb = meanings.some((item) => item.pos === 'v.')
    const forms = parseForms(exchange, hasNoun, hasVerb)
    const tags = []
    if (/(^|\s)cet4(\s|$)/.test(tag)) tags.push('c4')
    if (/(^|\s)cet6(\s|$)/.test(tag)) tags.push('c6')
    if (/(^|\s)gk(\s|$)/.test(tag)) tags.push('core')

    const entry = {
      ph: cleanPhonetic(row[idx.phonetic]),
      tags: tags.join(' '),
      frq,
      bnc,
      collins,
      rank: rank === Number.MAX_SAFE_INTEGER ? 0 : rank,
      meanings
    }
    // 大纲外的词按超纲算星级（★），和 extra/advanced 的口径一致
    if (!tags.length) entry.outside = true
    if (Object.keys(forms).length) entry.forms = forms
    out[word] = entry
  }

  // 补充 ECDICT 还没收的现代词：同样只补缺
  Object.keys(MODERN_WORDS).forEach((word) => {
    if (existing.has(word) || out[word]) return
    const item = MODERN_WORDS[word]
    out[word] = {
      ph: item.ph,
      tags: '',
      frq: 0,
      bnc: 0,
      collins: 0,
      rank: 0,
      outside: true,
      meanings: item.meanings
    }
  })

  const sorted = {}
  Object.keys(out).sort().forEach((word) => { sorted[word] = out[word] })
  const text = JSON.stringify(sorted)
  fs.writeFileSync(OUT, text, 'utf8')

  console.log('候选单词', total)
  console.log('跳过：已在现有词库', skippedExisting, '/ 变形词', skippedInflected,
    '/ 无可用释义', skippedNoMeaning, '/ 仅人名', skippedName, '/ 低价值', skippedLowValue)
  console.log('收录', Object.keys(sorted).length, '条，体积', (Buffer.byteLength(text) / 1024 / 1024).toFixed(2), 'MB')
  ;['twit', 'abattoir', 'nanostructure', 'misinformation', 'overfishing'].forEach((word) => {
    console.log(word, '→', sorted[word] ? JSON.stringify(sorted[word]) : '未收录')
  })
})()
