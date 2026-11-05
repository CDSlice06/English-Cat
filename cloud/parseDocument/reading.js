// 四六级真题整卷只保留「仔细阅读」的两篇正文：
// 排除写作、听力、选词填空、段落匹配、翻译，以及所有题干与 ABCD 选项。
// 仔细阅读的可靠特征：Passage One / Passage Two + 题号 46-55，
// 因为听力篇章也叫 Passage One，但题号在 1-25，用题号就能区分开

const READING_HEAD = /^(part\s*(iii|3|Ⅲ)\b[\s\S]*reading\s+comprehension|reading\s+comprehension)/i
const TAIL_HEAD = /^(part\s*(iv|4|Ⅳ)\b|translation\b)/i
// 行首允许少量符号（OCR 有时会给标题加圆点、引号）
// OCR 也常把 One 认成 0ne，这里一并兼容
const PASSAGE_HEAD = /^[^A-Za-z]{0,4}passages?\s+(one|two|three|four|[1-4]|[o0]ne)\b/i
const PASSAGE_LABEL = /passages?\s+(one|two|three|four|[1-4]|[o0]ne)\b/i
const LABEL_ORDER = { one: 1, two: 2, three: 3, four: 4, 1: 1, 2: 2, 3: 3, 4: 4 }
// 仔细阅读的题号固定是 46-55，听力篇章的 Questions 9 to 11 之类会被这条排除
const READING_QUESTION = /questions?\s+(4[6-9]|5[0-5])\b/i
// 整卷特征：有 Part I 或 Listening Comprehension，说明是一整份真题而不是单篇文章
const PAPER_HEAD = /^part\s*(i|1|Ⅰ)\b/i
const PAPER_HINT = /\blistening\s+comprehension\b/i
// 大标题：Part III / Section C 这类才算截断点。
// 不能只写 ^part，否则正文里 “Part of the reason…” 会被误当成标题截断
const HEADING_STOP = /^(section\s+[a-d]\b|part\s+(i{1,3}|iv|v|[1-4]|[Ⅰ-Ⅳ])\b)/i
const MAX_PASSAGES = 2

function cleanLine(line) {
  return String(line || '').replace(/\s+/g, ' ').trim()
}

function lowerCount(line) {
  return (line.match(/[a-z]/g) || []).length
}

// 页眉页脚只有零星小写字母（如「2026年6月…真题(第1套) 5」），正文行不会这样
function isNoise(line) {
  if (lowerCount(line) < 4) return true
  if (/^(questions?\s+\d+|directions\b|answer\s+sheet)/i.test(line)) return true
  return false
}

// 题目从「46. What …」这类行开始，后面跟的全是选项，读到就停
// OCR 常把点号认成逗号或冒号，标点要放宽一些
function isQuestionStart(line) {
  return /^\d{1,2}\s*[.．、,，:：)]\s*[A-Z"'(]/.test(line)
}

function isOption(line) {
  return /^[A-D]\s*[)）.．]\s*\S/.test(line)
}

function isQuestionLine(line) {
  return /^\d{1,2}\s*[.．、]\s*[A-D]\s*[)）.．]/.test(line)
}

// 题干行：46. What … / 46．What … / 51 What …
// PDF 抽取出来的题干常常和选项分属两行，isQuestionLine 抓不到，需要按题号单独识别；
// 没有标点时只认「数字 + 空格 + 大写开头」，避免把正文里的 “45 percent of …” 当题号
function stemNumber(line) {
  const text = String(line || '')
  const hit = text.match(/^(\d{1,2})\s*[.．、,，:：)\]]\s*([A-Za-z"(])/) || text.match(/^(\d{1,2})\s+([A-Z"(])/)
  return hit ? Number(hit[1]) : 0
}

// 解析版真题里会带中文译文和答案解析，遇到这些标题直接截断
const NOTES_HEAD = /^(参考译文|译文|参考答案|答案详解|答案解析|答案与解析|试题解析|【参考译文】|【解析】|【答案】)/

// 统一把原文切成「非空行 + 是否另起一段」，空行只做段落标记
function toLines(text) {
  const lines = []
  String(text || '').split(/\n/).forEach((raw) => {
    const line = cleanLine(raw)
    if (!line) {
      if (lines.length) lines[lines.length - 1].brkNext = true
      return
    }
    const prev = lines[lines.length - 1]
    lines.push({ text: line, brk: prev ? prev.brkNext === true : false })
  })
  return lines
}

function joinBody(lines) {
  let text = ''
  lines.forEach((line) => {
    if (!line) return
    if (!text) {
      text = line
      return
    }
    // 行尾连字符是被排版拆开的单词，直接接上
    text += /-$/.test(text) ? line : ` ${line}`
  })
  return text.replace(/\s+/g, ' ').trim()
}

// 正文按原稿的自然段拼回去：空行是段落分隔，段内所有行用空格接成一句段
function collectBody(lines, from, to) {
  const paragraphs = []
  let current = []
  const flush = () => {
    if (!current.length) return
    const text = joinBody(current)
    if (text) paragraphs.push(text)
    current = []
  }
  for (let i = from; i < to; i += 1) {
    const entry = lines[i]
    const line = entry.text
    if (HEADING_STOP.test(line)) break
    if (NOTES_HEAD.test(line)) break
    if (isQuestionStart(line) || isOption(line)) break
    if (entry.brk) flush()
    // 跨页时 Passage 标题会重复出现在页眉，不能当成正文
    if (PASSAGE_HEAD.test(line)) continue
    if (isNoise(line)) continue
    current.push(line)
  }
  flush()
  return paragraphs.join('\n\n')
}

// 判断某个 Passage 标记是不是仔细阅读：后面紧跟着 46-55 的题号说明。
// 中途又出现新的 Passage 标记就说明这个标记不是阅读篇（听力 Passage One 后面
// 往往几行就接上阅读标题，不拦住会误判）
function isReadingPassage(lines, index) {
  const limit = Math.min(lines.length, index + 9)
  for (let i = index; i < limit; i += 1) {
    if (i > index && PASSAGE_LABEL.test(lines[i].text)) return false
    if (READING_QUESTION.test(lines[i].text)) return true
  }
  return false
}

// 先按 Part III Reading Comprehension 到 Part IV 圈定范围；
// 圈不到时退回全文，靠题号保证不误抓听力篇章
function readingScope(lines) {
  let start = -1
  for (let i = 0; i < lines.length; i += 1) {
    if (READING_HEAD.test(lines[i].text)) {
      start = i
      break
    }
  }
  if (start < 0) return { from: 0, to: lines.length }
  let end = lines.length
  for (let i = start + 1; i < lines.length; i += 1) {
    if (TAIL_HEAD.test(lines[i].text)) {
      end = i
      break
    }
  }
  return { from: start, to: end }
}

function collectMarks(lines) {
  const marks = []
  lines.forEach((entry, index) => {
    const hit = entry.text.match(PASSAGE_LABEL)
    if (!hit) return
    // 0ne 这类 OCR 错字归一成 one，才能按 One → Two 排序
    const label = String(hit[1] || '').toLowerCase().replace(/^0([a-z])/, 'o$1')
    marks.push({
      index,
      title: entry.text,
      label,
      order: LABEL_ORDER[label] || 0,
      guarded: isReadingPassage(lines, index)
    })
  })
  return marks
}

// 按 One → Two 的顺序取，防止页眉里的重复标题把顺序打乱。
// 有题号 46-55 佐证的标记优先，避免把听力篇章的 Passage One 当成仔细阅读
function orderedMarks(marks) {
  const pool = marks.some((mark) => mark.guarded) ? marks.filter((mark) => mark.guarded) : marks
  const picked = []
  let next = 1
  pool.forEach((mark) => {
    if (mark.order !== next) return
    picked.push(mark)
    next += 1
  })
  return picked.slice(0, MAX_PASSAGES)
}

function buildPassages(scopeLines, marks) {
  const passages = []
  marks.forEach((mark, order) => {
    const to = order + 1 < marks.length ? marks[order + 1].index : scopeLines.length
    const body = collectBody(scopeLines, mark.index + 1, to)
    // 太短的多半是解析失败或空段落，直接跳过
    if (body.length < 120) return
    // 标题统一用阿拉伯数字，和题库里的「Passage 1」保持一致；
    // 原卷标题可能是 Passage One，放在页面标签上会和别处不一致
    passages.push({ index: passages.length + 1, title: `Passage ${mark.order || passages.length + 1}`, text: body })
  })
  return passages
}

// 扫描件 OCR 经常整页给回一整段（只有换行没有空行），
// 这里按「段落末行明显短于正常行宽」把自然段补回来。
// 已经有空行的文本原样返回，不重复处理
const SENTENCE_END = /[.!?"”’)]$/
const PARAGRAPH_START = /^["“'(]?[A-Z0-9]/

function rebuildParagraphs(text) {
  const raw = String(text || '')
  if (!raw.trim()) return raw
  if (/\n\s*\n/.test(raw)) return raw
  const lines = raw.split(/\n/).map((line) => line.trim()).filter(Boolean)
  if (lines.length < 6) return lines.join('\n')
  // 题目选项行很短，会把行长中位数拉低，只用正常长度的正文行做参照
  const widths = lines.filter((line) => line.length >= 24).map((line) => line.length).sort((a, b) => a - b)
  const median = widths.length ? widths[Math.floor(widths.length / 2)] : 0
  const out = []
  if (median) {
    lines.forEach((line, index) => {
      out.push(line)
      if (index === lines.length - 1) return
      const next = lines[index + 1]
      // 短行 + 句末标点 + 下一行大写开头，才认为上一段结束了
      if (line.length < median * 0.8 && SENTENCE_END.test(line) && PARAGRAPH_START.test(next)) {
        out.push('')
      }
    })
  }
  if (out.some((line) => !line)) return out.join('\n')
  // 行长完全看不出边界时，按句子分组兜底，保证不会整篇连成一段
  const sentences = raw.replace(/\n+/g, ' ').match(/[^.!?]+[.!?]+["”’)]?/g) || []
  if (sentences.length < 6) return lines.join('\n')
  const groups = []
  for (let i = 0; i < sentences.length; i += 4) {
    groups.push(sentences.slice(i, i + 4).join(' ').replace(/\s+/g, ' ').trim())
  }
  return groups.join('\n\n')
}

// 没识别到 Passage 标题时的兜底：用 46 / 51 两个题号反推正文范围。
// 仔细阅读的正文一定紧挨在题号之前，从题号往前找到最近的分节标题、
// 上一题题干或选项，中间那段就是这一篇的正文
function boundaryBefore(lines, index) {
  const floor = Math.max(0, index - 80)
  for (let i = index - 1; i >= floor; i -= 1) {
    const line = lines[i].text
    if (HEADING_STOP.test(line) || isOption(line) || stemNumber(line)) return i + 1
  }
  return 0
}

function anchorPassages(lines) {
  const stems = []
  lines.forEach((entry, index) => {
    const no = stemNumber(entry.text)
    if (no >= 46 && no <= 55) stems.push({ index, no })
  })
  if (!stems.length) return []
  // 只记题号不记正文，方便定位「为什么只抽出一篇」
  console.log('reading stems', { numbers: stems.map((item) => item.no) })
  const targets = []
  ;[46, 51].forEach((no) => {
    const hit = stems.find((item) => item.no === no)
    if (hit) targets.push(hit)
  })
  const passages = []
  targets.forEach((target) => {
    const body = collectBody(lines, boundaryBefore(lines, target.index), target.index)
    if (body.length < 120) return
    passages.push({ index: passages.length + 1, title: `Passage ${passages.length + 1}`, text: body })
  })
  return passages
}

function pickReadingPassages(text) {
  const lines = toLines(text)
  if (!lines.length) return []
  const scope = readingScope(lines)
  const scopeLines = lines.slice(scope.from, scope.to)

  const marks = collectMarks(scopeLines)
  // 优先用带 46-55 题号的标记；一个都没有时再退回单纯的 Passage 标记
  const guarded = orderedMarks(marks.filter((mark) => mark.guarded))
  const chosen = guarded.length ? guarded : orderedMarks(marks)
  // 标题没抽出来（扫描件很常见）：改用 46/51 题号锚点定位正文
  const anchored = anchorPassages(scopeLines)
  if (!chosen.length) {
    if (anchored.length) {
      console.log('reading anchored by question numbers', { passages: anchored.length })
      return anchored
    }
    console.log('reading marks', { marks: marks.length, guarded: guarded.length })
    return []
  }
  const built = buildPassages(scopeLines, chosen)
  // 只认出 Passage One、却没认出 Passage Two 时，用题号锚点把第二篇补回来
  if (built.length >= 2 || anchored.length <= built.length) return built
  console.log('reading anchored to complete passages', { built: built.length, anchored: anchored.length })
  return anchored
}

// 这份文档看起来是一整份真题（而不是一篇文章）：有 Part I / 听力标题，
// 或者有成片的「46. A) …」这种题干带选项的行
function looksLikePaper(text) {
  const lines = toLines(text)
  if (lines.slice(0, 400).some((entry) => PAPER_HEAD.test(entry.text))) return true
  if (lines.some((entry) => PAPER_HINT.test(entry.text))) return true
  if (lines.filter((entry) => isQuestionLine(entry.text)).length >= 3) return true
  // PDF 里题干和选项分行的写法也要算：46-55 的题号出现多次就是整份真题
  return lines.filter((entry) => {
    const no = stemNumber(entry.text)
    return no >= 26 && no <= 55
  }).length >= 3
}

// 给报错用的诊断信息，方便定位到底是没识别到标题还是没识别到题号
function readingStats(text) {
  const lines = toLines(text)
  const scope = readingScope(lines)
  const scopeLines = lines.slice(scope.from, scope.to)
  const marks = collectMarks(scopeLines)
  return {
    lines: lines.length,
    marks: marks.length,
    guarded: marks.filter((mark) => mark.guarded).length,
    questions: lines.filter((entry) => isQuestionLine(entry.text)).length
  }
}

module.exports = { pickReadingPassages, looksLikePaper, readingStats, rebuildParagraphs }
