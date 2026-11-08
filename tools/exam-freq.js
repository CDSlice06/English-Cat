// 四六级/考研/专四专八真题词频统计（构建脚本，产物 cloud/analyzeArticle/exam-freq.json）
//
// 数据来源：pastpapers.cn。试卷页面的 HTML 里直接带 /uploads/xxx.pdf 地址，PDF 可匿名下载，
// 不需要登录态。脚本只产出「词 -> [出现次数, 覆盖套数]」这类统计结果，不保存、不输出真题原文，
// 中间缓存（PDF / 页面 HTML）落在 .local/ 下且已进 .gitignore。
//
// 用法：
//   node tools/exam-freq.js list            列出试卷 slug 与分类
//   node tools/exam-freq.js pages           抓试卷页，建立 slug -> PDF 地址映射
//   node tools/exam-freq.js build           下载 PDF、抽文本、统计词频、写 exam-freq.json
//   node tools/exam-freq.js build --refresh 忽略本地缓存重抓
//
// 依赖：pdfjs-dist（临时装在 %TEMP%\pp_pdf，直接按绝对路径 import，不污染仓库）
const fs = require('fs')
const os = require('os')
const path = require('path')
const { pathToFileURL } = require('url')

const PDFJS_CANDIDATES = [
  path.join(__dirname, 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.mjs'),
  path.join(os.tmpdir(), 'pp_pdf', 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.mjs')
]

const ROOT = path.resolve(__dirname, '..')
const OUT_FILE = path.join(ROOT, 'cloud', 'analyzeArticle', 'exam-freq.json')
// 小程序用的两套星级表（四级 / 六级），由下面的 build 一起生成
const STAR_FILE = path.join(ROOT, 'cloud', 'analyzeArticle', 'exam-stars.json')
const LOCAL = path.join(ROOT, '.local')
const PAGE_DIR = path.join(LOCAL, 'paper-pages')
const PDF_DIR = path.join(LOCAL, 'paper-pdf')
const MAP_FILE = path.join(LOCAL, 'paper-map.json')
const BASE = 'https://pastpapers.cn'
const CONCURRENCY = 3
const DELAY_MS = 200

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function httpGet(url, asText) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        cache: 'no-store'
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return asText ? await res.text() : Buffer.from(await res.arrayBuffer())
    } catch (error) {
      if (attempt === 2) throw error
      await sleep(800 * (attempt + 1))
    }
  }
}

function levelOf(slug) {
  if (/cet4/.test(slug)) return 'cet4'
  if (/cet6/.test(slug)) return 'cet6'
  if (/tem4/.test(slug)) return 'tem4'
  if (/tem8/.test(slug)) return 'tem8'
  // 其余按年份命名的都是考研英语（1998、2010-1、2025-1 这类）
  return 'kaoyan'
}

// 试卷清单直接从公开的 sitemap 取，不猜年份
async function listPapers() {
  const xml = await httpGet(`${BASE}/sitemap.xml`, true)
  const papers = []
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const m = match[1].match(/\/paper\/(.+)$/)
    if (m) papers.push({ slug: m[1], level: levelOf(m[1]) })
  }
  return papers.sort((a, b) => (a.slug < b.slug ? -1 : 1))
}

// 试卷页 HTML 里混着试卷 PDF 与听力音频两种 uploads 地址，只取 .pdf
function findPdfUrl(html) {
  const hit = html.match(/\/uploads\/[A-Za-z0-9_\-]+\.pdf/)
  return hit ? `${BASE}${hit[0]}` : ''
}

async function cmdPages(refresh) {
  if (!refresh && fs.existsSync(MAP_FILE)) {
    const cached = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'))
    if (cached.length) return cached
  }
  const papers = await listPapers()
  fs.mkdirSync(PAGE_DIR, { recursive: true })
  const out = []
  let done = 0
  const queue = papers.slice()
  const worker = async () => {
    while (queue.length) {
      const item = queue.shift()
      const pageFile = path.join(PAGE_DIR, `${item.slug}.html`)
      try {
        let html
        if (!refresh && fs.existsSync(pageFile)) html = fs.readFileSync(pageFile, 'utf8')
        else {
          html = await httpGet(`${BASE}/paper/${item.slug}`, true)
          fs.writeFileSync(pageFile, html)
        }
        const pdfUrl = findPdfUrl(html)
        const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || ''
        if (pdfUrl) out.push({ ...item, pdfUrl, title })
        else console.error(`  ! ${item.slug} 没找到 PDF 地址`)
      } catch (error) {
        console.error(`  ! ${item.slug} 页面抓取失败：${error.message}`)
      }
      done += 1
      if (done % 20 === 0) console.log(`  页面 ${done}/${papers.length}`)
      await sleep(DELAY_MS)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  out.sort((a, b) => (a.slug < b.slug ? -1 : 1))
  fs.mkdirSync(LOCAL, { recursive: true })
  fs.writeFileSync(MAP_FILE, JSON.stringify(out, null, 1))
  const byLevel = {}
  out.forEach((item) => { byLevel[item.level] = (byLevel[item.level] || 0) + 1 })
  console.log(`共 ${out.length} 套：${Object.entries(byLevel).map(([k, v]) => `${k} ${v}`).join('，')}`)
  return out
}

// 按 y 坐标把文本块拼回行：pdfjs 的 hasEOL 在不少整卷 PDF 里是空的，
// 只靠它会把整页拼成一行，阅读正文解析器就失效了
function pageLines(content) {
  const items = content.items.filter((item) => item.str && item.transform)
  const rows = []
  items.forEach((item) => {
    const x = item.transform[4]
    const y = item.transform[5]
    const h = Math.abs(item.transform[3]) || item.height || 10
    const row = rows.find((entry) => Math.abs(entry.y - y) <= Math.max(2, h * 0.5))
    if (row) row.items.push({ x, str: item.str, h })
    else rows.push({ y, h, items: [{ x, str: item.str, h }] })
  })
  rows.sort((a, b) => b.y - a.y)
  const lines = []
  let prev = null
  rows.forEach((row) => {
    const text = row.items.sort((a, b) => a.x - b.x).map((item) => item.str).join(' ').replace(/\s+/g, ' ').trim()
    if (!text) return
    // 行距明显变大就是新段落，插一个空行给阅读解析器当分段信号
    if (prev && prev.y - row.y > row.h * 2.2) lines.push('')
    lines.push(text)
    prev = row
  })
  return lines
}

async function extractText(pdfFile) {
  const found = PDFJS_CANDIDATES.find((file) => fs.existsSync(file))
  if (!found) throw new Error('缺少 pdfjs-dist，请先 npm install pdfjs-dist')
  const pdfjs = await import(pathToFileURL(found).href)
  const data = new Uint8Array(fs.readFileSync(pdfFile))
  const doc = await pdfjs.getDocument({ data, isEvalSupported: false, disableFontFace: true }).promise
  const parts = []
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    parts.push(...pageLines(content), '')
  }
  await doc.destroy()
  return parts.join('\n')
}

// 词典：词条集合 + 变形词 -> 原形的索引（词库里 forms 字段是权威的，查不到再用规则兜底）
function loadDict() {
  const dict = {}
  ;['cet.json', 'common.json', 'extra.json'].forEach((name) => {
    Object.assign(dict, JSON.parse(fs.readFileSync(path.join(ROOT, 'cloud', 'analyzeArticle', name), 'utf8')))
  })
  const keys = new Set(Object.keys(dict))
  const forms = new Map()
  Object.keys(dict).forEach((word) => {
    const list = dict[word] && dict[word].forms
    if (!list) return
    Object.keys(list).forEach((type) => {
      String(list[type] || '').split(/[,，;；\s]+/).forEach((form) => {
        const clean = form.trim().toLowerCase()
        if (clean && clean !== word && !forms.has(clean)) forms.set(clean, word)
      })
    })
  })
  return { keys, forms, dict }
}

// 规则兜底：s / es / ies / ed / ied / ing / 双写辅音 等常见屈折
function ruleCandidates(token) {
  const out = []
  const push = (value) => {
    if (value.length >= 2 && out.indexOf(value) < 0) out.push(value)
  }
  if (token.endsWith('ies')) push(`${token.slice(0, -3)}y`)
  if (token.endsWith('es')) push(token.slice(0, -2))
  if (token.endsWith('s')) push(token.slice(0, -1))
  if (token.endsWith('ied')) push(`${token.slice(0, -3)}y`)
  if (token.endsWith('ed')) {
    push(token.slice(0, -2))
    push(token.slice(0, -1))
    push(token.replace(/([bdfglmnprt])\1(ed|ing)$/, '$1$2').slice(0, -2))
  }
  if (token.endsWith('ing')) {
    push(token.slice(0, -3))
    push(`${token.slice(0, -3)}e`)
    push(token.replace(/([bdfglmnprt])\1(ing)$/, '$1ing').slice(0, -3))
  }
  if (token.endsWith('er')) push(token.slice(0, -2))
  if (token.endsWith('est')) push(token.slice(0, -3))
  if (token.endsWith('ly')) push(token.slice(0, -2))
  return out
}

// 不规则变形直接锁死原形：只靠后缀规则会把 has 削成 ha（词库恰好收了 ha 这个语气词），
// went / found 这类也容易归错
const IRREGULARS = {
  am: 'be', is: 'be', are: 'be', was: 'be', were: 'be', been: 'be', being: 'be',
  has: 'have', had: 'have', having: 'have', does: 'do', did: 'do', done: 'do', doing: 'do',
  went: 'go', gone: 'go', goes: 'go', came: 'come', become: 'become', became: 'become',
  said: 'say', saw: 'see', seen: 'see', made: 'make', took: 'take', taken: 'take',
  gave: 'give', given: 'give', got: 'get', gotten: 'get', knew: 'know', known: 'know',
  thought: 'think', told: 'tell', felt: 'feel', left: 'leave', kept: 'keep', began: 'begin',
  begun: 'begin', heard: 'hear', ran: 'run', brought: 'bring', sat: 'sit', met: 'meet',
  understood: 'understand', spoke: 'speak', spoken: 'speak', spent: 'spend', grew: 'grow',
  grown: 'grow', built: 'build', sold: 'sell', bought: 'buy', sent: 'send', found: 'find',
  lost: 'lose', paid: 'pay', led: 'lead', stood: 'stand', wrote: 'write', written: 'write',
  won: 'win', read: 'read', children: 'child', men: 'man', women: 'woman', people: 'people',
  feet: 'foot', teeth: 'tooth', lives: 'life', wives: 'wife', knives: 'knife'
}

const CONTRACTIONS = {
  "don't": 'do', "doesn't": 'do', "didn't": 'do', "isn't": 'be', "aren't": 'be',
  "wasn't": 'be', "weren't": 'be', "can't": 'can', cannot: 'can', "couldn't": 'can',
  "won't": 'will', "wouldn't": 'will', "shouldn't": 'should', "mustn't": 'must',
  "haven't": 'have', "hasn't": 'have', "hadn't": 'have', "it's": 'it', "that's": 'that',
  "there's": 'there', "he's": 'he', "she's": 'she', "let's": 'let', "i'm": 'i',
  "i've": 'have', "we've": 'have', "they've": 'have', "you're": 'you', "we're": 'we',
  "they're": 'they', "i'll": 'will', "we'll": 'will', "you'll": 'will', "they'll": 'will'
}

// 功能词不进星级榜：它们在每套卷都出现，统计出来没有学习价值
const STOPWORDS = new Set(('a an the and or but if because so that than then this these those it its it\'s they them their we us our you your he him his she her i me my mine '
  + 'is are was were be been being am do does did doing have has had having will would shall should can could may might must ought '
  + 'in on at by for with without from to of into onto about as up down out over under between among during before after above below '
  + 'not no nor yes all any some each every both few many much more most less least other another such own same very too also only just '
  + 'there here when where who whom whose which what why how one two three four five six seven eight nine ten first second third '
  + 'mr mrs ms dr st etc ie eg versus per via though although while whereas whether since unless until upon within across along around '
  + 'off per again ever never always often sometimes usually still yet even well back forward however therefore thus moreover furthermore '
  + 'according based due despite besides instead rather quite rather through throughout toward towards').split(' '))

// 抽不到阅读正文时（考研 Text 1-4、专四专八 TEXT A 的排版不同）退回全文，
// 但要先剔掉考试说明、答题卡提示和 ABCD 选项，否则 answer / sheet / part 这类
// 卷面用词会虚高到每套必现
const BOILERPLATE = [
  /^part\s+(i{1,3}|iv|v|[1-4])\b/i,
  /^section\s+[a-d]\b/i,
  /^directions?\b/i,
  /^questions?\s+\d+/i,
  /^answer\s+sheet/i,
  /^you\s+(should|may|must|are|will|have)\b/i,
  /^write\s+your\b/i,
  /^choose\s+the\s+best\b/i,
  /^read\s+the\s+following\b/i,
  /^in\s+this\s+section\b/i,
  /^now\s+you\s+will\b/i,
  /^for\s+(questions|each)\b/i,
  /^\d{1,2}\s*[.．]\s*[A-D]\s*[)）.．]/,
  /^[A-D]\s*[)）.．]\s/
]

function fallbackLines(text) {
  return String(text)
    .split(/\n/)
    .filter((line) => line.trim() && !BOILERPLATE.some((rule) => rule.test(line.trim())))
    .join('\n')
}

function toTokens(text) {
  // 断行连字符：exam-\nple -> example；保留行内连字符复合词
  const cleaned = String(text)
    .replace(/-\s*\n\s*(?=[a-z])/g, '')
    .replace(/[\u2018\u2019]/g, "'")
    .toLowerCase()
  return cleaned.match(/[a-z]+(?:'[a-z]+)?/g) || []
}

// 生成小程序用的星级表：word -> [四级星级, 六级星级]
function writeStarTable(levels, dict) {
  const starFrom = (hit, total, inSyllabus) => {
    if (!inSyllabus) return 1
    const need = (ratio, least) => Math.max(least, Math.ceil(ratio * total))
    if (hit >= need(0.10, 5)) return 3
    if (hit >= need(0.025, 2)) return 2
    return 1
  }
  const table = {}
  Object.keys(dict).forEach((word) => {
    // 是否算大纲词只看 tags：extra.json 里也有一批带 c4 / c6 标签的真大纲词
    // （sustainable / resilience），不能因为放在补充词库就一律压成一星
    const tags = String((dict[word] && dict[word].tags) || '')
    const core = tags.indexOf('core') >= 0
    const in4 = core || tags.indexOf('c4') >= 0
    const in6 = core || tags.indexOf('c4') >= 0 || tags.indexOf('c6') >= 0
    const c4 = (levels.cet4.words[word] || [0, 0])[1]
    const c6 = (levels.cet6.words[word] || [0, 0])[1]
    table[word] = [
      starFrom(c4, levels.cet4.total, in4),
      starFrom(c6, levels.cet6.total, in6)
    ]
  })
  fs.writeFileSync(STAR_FILE, JSON.stringify(table))
  const dist = { cet4: { 3: 0, 2: 0, 1: 0 }, cet6: { 3: 0, 2: 0, 1: 0 } }
  Object.keys(table).forEach((word) => {
    dist.cet4[table[word][0]] += 1
    dist.cet6[table[word][1]] += 1
  })
  console.log(`已写出 ${STAR_FILE}（${(fs.statSync(STAR_FILE).size / 1024).toFixed(0)}KB）`)
  console.log(`星级分布 四级 ${JSON.stringify(dist.cet4)}；六级 ${JSON.stringify(dist.cet6)}`)
  return table
}

async function cmdBuild(refresh) {
  const papers = await cmdPages(refresh)
  fs.mkdirSync(PDF_DIR, { recursive: true })
  const { keys, forms, dict } = loadDict()
  const { pickReadingPassages } = require(path.join(ROOT, 'cloud', 'parseDocument', 'reading.js'))

  const reduceCache = new Map()
  const reduce = (token) => {
    if (reduceCache.has(token)) return reduceCache.get(token)
    let base = ''
    if (CONTRACTIONS[token]) base = CONTRACTIONS[token]
    else if (IRREGULARS[token]) base = IRREGULARS[token]
    else if (token.indexOf("'") >= 0) base = ''
    // forms 是词库登记的屈折表，比「token 本身也是词条」更可信：
    // used / means / studies 既是独立词条也是 use / mean / study 的变形，这里归到原形
    else if (forms.has(token)) base = forms.get(token)
    else if (keys.has(token)) base = token
    else {
      const hit = ruleCandidates(token).find((cand) => keys.has(cand) || forms.has(cand))
      if (hit) base = keys.has(hit) ? hit : forms.get(hit)
    }
    if (base && !keys.has(base)) base = ''
    reduceCache.set(token, base)
    return base
  }

  const levels = {}
  const ensure = (level) => {
    if (!levels[level]) levels[level] = { total: 0, words: new Map() }
    return levels[level]
  }
  const hit = (bucket, base, seen) => {
    const stat = bucket.words.get(base) || [0, 0]
    stat[0] += 1
    if (!seen.has(base)) {
      stat[1] += 1
      seen.add(base)
    }
    bucket.words.set(base, stat)
  }

  let done = 0
  const queue = papers.slice()
  const worker = async () => {
    while (queue.length) {
      const item = queue.shift()
      const pdfFile = path.join(PDF_DIR, `${item.slug}.pdf`)
      try {
        if (!fs.existsSync(pdfFile)) {
          const buf = await httpGet(item.pdfUrl, false)
          fs.writeFileSync(pdfFile, buf)
        }
        const text = await extractText(pdfFile)
        const bucket = ensure(item.level)
        const seen = new Set()
        // 优先只统计仔细阅读正文；抽不到正文的试卷退回过滤后的全文
        const mute = console.log
        console.log = () => {}
        let passages = []
        try {
          passages = pickReadingPassages(text)
        } finally {
          console.log = mute
        }
        const corpus = passages.length ? passages.map((part) => part.text).join('\n') : fallbackLines(text)
        if (passages.length) bucket.withPassages = (bucket.withPassages || 0) + 1
        toTokens(corpus).forEach((token) => {
          const base = reduce(token)
          if (!base || STOPWORDS.has(base)) return
          hit(bucket, base, seen)
        })
        bucket.total += 1
      } catch (error) {
        console.error(`  ! ${item.slug} 失败：${error.message}`)
      }
      done += 1
      if (done % 10 === 0) console.log(`  解析 ${done}/${papers.length}`)
      await sleep(60)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  const output = { generatedAt: new Date().toISOString().slice(0, 10), source: 'pastpapers.cn', levels: {} }
  const order = ['cet4', 'cet6', 'kaoyan', 'tem4', 'tem8']
  order.forEach((level) => {
    const bucket = levels[level]
    if (!bucket || !bucket.total) return
    const words = {}
    Array.from(bucket.words.entries())
      .sort((a, b) => b[1][1] - a[1][1] || b[1][0] - a[1][0])
      .forEach(([word, stat]) => { words[word] = stat })
    output.levels[level] = { total: bucket.total, withPassages: bucket.withPassages || 0, words }
  })
  // 跨全部试卷的总覆盖（每套卷只记一次）
  const all = new Map()
  const totalPapers = order.reduce((sum, level) => sum + ((levels[level] && levels[level].total) || 0), 0)
  order.forEach((level) => {
    const bucket = levels[level]
    if (!bucket) return
    bucket.words.forEach(([occ, papersHit], word) => {
      const stat = all.get(word) || [0, 0]
      stat[0] += occ
      stat[1] += papersHit
      all.set(word, stat)
    })
  })
  output.totalPapers = totalPapers
  output.all = {}
  Array.from(all.entries())
    .sort((a, b) => b[1][1] - a[1][1] || b[1][0] - a[1][0])
    .forEach(([word, stat]) => { output.all[word] = stat })

  fs.writeFileSync(OUT_FILE, JSON.stringify(output))
  console.log(`已写出 ${OUT_FILE}（${(fs.statSync(OUT_FILE).size / 1024).toFixed(0)}KB）`)

  // 小程序星级：只看该词在自己那一级真题里的覆盖套数。
  // ★★★ ≥10% 试卷（四级/六级 76 套即 ≥8 套）；★★ ≥2.5%（≥2 套）；★ 其余大纲词。
  // 大纲外的词（四级标尺看六级专属词）沿用旧口径给一星，不用真题数据抬星。
  writeStarTable(output.levels, dict)

  order.forEach((level) => {
    const bucket = output.levels[level]
    if (!bucket) return
    const covered = Object.keys(bucket.words).length
    console.log(`${level}：${bucket.total} 套（正文抽取 ${bucket.withPassages || 0} 套），命中词库 ${covered} 词`)
  })
  ;[[0.5, 0.25, 0.1], [0.4, 0.2, 0.08], [0.3, 0.15, 0.05]].forEach(([a, b, c]) => {
    const count = (min) => Object.values(output.all).filter((s) => s[1] / totalPapers >= min).length
    console.log(`阈值 ${a * 100}/${b * 100}/${c * 100}% -> 五星 ${count(a)} 四星 ${count(b)} 三星 ${count(c)}`)
  })
}

async function main() {
  const cmd = process.argv[2] || 'build'
  const refresh = process.argv.includes('--refresh')
  if (cmd === 'list') {
    const papers = await listPapers()
    const byLevel = {}
    papers.forEach((p) => { byLevel[p.level] = (byLevel[p.level] || 0) + 1 })
    console.log(`共 ${papers.length} 套：`, byLevel)
    return
  }
  if (cmd === 'pages') {
    await cmdPages(refresh)
    return
  }
  // 只重算小程序星级表，不重新抓 PDF（exam-freq.json 已存在时用这个）
  if (cmd === 'stars') {
    const data = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'))
    const loaded = loadDict()
    writeStarTable(data.levels, loaded.dict)
    return
  }
  await cmdBuild(refresh)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
