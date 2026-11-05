const zlib = require('zlib')

// 纯 Node 实现的 PDF 文本提取（尽力而为）：
// 1. 扫描所有 obj，解开 FlateDecode 流与对象流
// 2. 解析 ToUnicode 映射，把字形编码还原成 Unicode
// 3. 从内容流里取 Tj / TJ / ' / " 的字符串
// 不依赖任何第三方库；扫描件、加密文档会在上层给出明确提示。

// 单个流最多解到 16MB：中文真题常内嵌几十 MB 的字体程序，
// 无限制解压会把云函数 256MB 的内存直接打爆
const INFLATE_LIMIT = 16 * 1024 * 1024
// 全文解压总量上限：单流有上限，但几十个流叠起来照样能吃掉 256MB
const INFLATE_BUDGET = 48 * 1024 * 1024

function inflate(data) {
  if (!data || !data.length) return null
  const options = { maxOutputLength: INFLATE_LIMIT }
  try {
    return zlib.inflateSync(data, options)
  } catch (error) {
    try {
      return zlib.inflateRawSync(data, options)
    } catch (error2) {
      return null
    }
  }
}

// 内嵌字体程序的 obj 号：字体流自己的字典里没有 /FontFile2 这类字样
// （引用写在 FontDescriptor 里），必须先从全文把引用挖出来，
// 否则中文字体子集会被当成普通流解压，几十 MB 直接把内存打爆
function fontProgramObjects(source) {
  const nums = new Set()
  const re = /\/FontFile[23]?\s+(\d+)\s+\d+\s+R/g
  let match
  while ((match = re.exec(source))) nums.add(Number(match[1]))
  return nums
}

function buildObjects(buf) {
  const source = buf.toString('latin1')
  const objects = new Map()
  const fontPrograms = fontProgramObjects(source)
  const startRe = /(\d+)\s+(\d+)\s+obj\b/g
  let match
  let inflatedTotal = 0

  while ((match = startRe.exec(source))) {
    const num = Number(match[1])
    const bodyStart = match.index + match[0].length
    const end = source.indexOf('endobj', bodyStart)
    if (end < 0) break
    const body = source.slice(bodyStart, end)
    const streamAt = body.indexOf('stream')

    if (streamAt < 0) {
      objects.set(num, { num, dict: body, stream: null })
      startRe.lastIndex = end
      continue
    }

    const dict = body.slice(0, streamAt)
    let dataStart = bodyStart + streamAt + 6
    if (source[dataStart] === '\r') dataStart += 1
    if (source[dataStart] === '\n') dataStart += 1

    const hardEnd = bodyStart + end
    // /Length 可能是间接引用（/Length 9 0 R），此时不能直接当数字用，
    // 否则会把流截断成几个字节，整页文字都解不出来
    const lengthMatch = /\/Length\s+(\d+)(\s+\d+\s+R)?/.exec(dict)
    const indirect = !!(lengthMatch && lengthMatch[2])
    let dataEnd = lengthMatch && !indirect ? dataStart + Number(lengthMatch[1]) : -1
    if (dataEnd < 0 || dataEnd > hardEnd) {
      const alt = source.indexOf('endstream', dataStart)
      dataEnd = alt >= 0 ? alt : hardEnd
      // endstream 前面通常还留着一个换行，去掉再解压更稳
      while (dataEnd > dataStart && (buf[dataEnd - 1] === 10 || buf[dataEnd - 1] === 13)) dataEnd -= 1
    }

    let stream = buf.slice(dataStart, dataEnd)
    // 图片与内嵌字体程序是二进制流，体积大而且正文里用不到：
    // 不解压，直接留原始字节。中文真题的字体子集解压后常有几十 MB，
    // 是云函数内存被打爆的主因
    const binary = /\/Subtype\s*\/(Image|Type1C|CIDFontType0C|OpenType|XML)\b/.test(dict)
      || /\/FontFile[23]?\b/.test(dict)
      || fontPrograms.has(num)
    // 过滤器可能写成 /Filter /FlateDecode，也可能是 /Filter [/FlateDecode]，
    // 直接看字典里有没有 FlateDecode 最稳
    if (!binary && dict.indexOf('FlateDecode') >= 0 && inflatedTotal < INFLATE_BUDGET) {
      const out = inflate(stream)
      if (out) {
        inflatedTotal += out.length
        stream = out
      }
    }
    objects.set(num, { num, dict, stream })
    startRe.lastIndex = end
  }

  // PDF 1.5+ 会把普通对象压进对象流，需要再展开一层
  Array.from(objects.values()).forEach((obj) => {
    if (!obj.stream || !/\/Type\s*\/ObjStm/.test(obj.dict)) return
    const count = Number((/\/N\s+(\d+)/.exec(obj.dict) || [])[1])
    const first = Number((/\/First\s+(\d+)/.exec(obj.dict) || [])[1])
    if (!count || Number.isNaN(first)) return

    const text = obj.stream.toString('latin1')
    const header = text.slice(0, first).trim().split(/\s+/).map(Number)
    for (let i = 0; i < count; i += 1) {
      const num = header[i * 2]
      const rel = header[i * 2 + 1]
      if (!num || Number.isNaN(rel) || objects.has(num)) continue
      const nextRel = i + 1 < count ? header[i * 2 + 3] : text.length - first
      objects.set(num, {
        num,
        dict: text.slice(first + rel, first + nextRel),
        stream: null
      })
    }
  })

  return { objects, fontPrograms }
}

function utf16be(hex) {
  const clean = hex.length % 2 ? `${hex}0` : hex
  const bytes = Buffer.from(clean, 'hex')
  if (bytes.length === 0) return ''
  const swapped = Buffer.alloc(bytes.length)
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    swapped[i] = bytes[i + 1]
    swapped[i + 1] = bytes[i]
  }
  return swapped.toString('utf16le')
}

// 解析 ToUnicode CMap：beginbfchar / beginbfrange
function parseCMap(text) {
  const map = new Map()
  let bytes = 0

  const charBlock = /beginbfchar([\s\S]*?)endbfchar/g
  let block
  while ((block = charBlock.exec(text))) {
    const pairRe = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g
    let pair
    while ((pair = pairRe.exec(block[1]))) {
      const code = parseInt(pair[1], 16)
      bytes = Math.max(bytes, Math.ceil(pair[1].length / 2))
      map.set(code, utf16be(pair[2]))
    }
  }

  const rangeBlock = /beginbfrange([\s\S]*?)endbfrange/g
  while ((block = rangeBlock.exec(text))) {
    const rangeRe = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*(?:<([0-9A-Fa-f]+)>|\[([\s\S]*?)\])/g
    let range
    while ((range = rangeRe.exec(block[1]))) {
      const low = parseInt(range[1], 16)
      const high = parseInt(range[2], 16)
      bytes = Math.max(bytes, Math.ceil(range[1].length / 2))
      if (high < low || high - low > 65535) continue

      if (range[4]) {
        const items = range[4].match(/<([0-9A-Fa-f]+)>/g) || []
        items.forEach((item, index) => {
          const code = low + index
          if (code > high) return
          map.set(code, utf16be(item.replace(/[<>]/g, '')))
        })
        continue
      }

      const base = utf16be(range[3])
      if (!base) continue
      const head = base.slice(0, -1)
      const tail = base.charCodeAt(base.length - 1)
      for (let code = low; code <= high; code += 1) {
        map.set(code, head + String.fromCharCode(tail + (code - low)))
      }
    }
  }

  return { map, bytes: bytes || 1 }
}

// 字体资源名（/F1）→ ToUnicode 映射
function collectFontMaps(objects) {
  const cmapByObject = new Map()
  objects.forEach((obj) => {
    if (!obj.stream) return
    const text = obj.stream.toString('latin1')
    if (text.indexOf('beginbfchar') < 0 && text.indexOf('beginbfrange') < 0) return
    const cmap = parseCMap(text)
    if (cmap.map.size) cmapByObject.set(obj.num, cmap)
  })

  const cmapByFont = new Map()
  objects.forEach((obj) => {
    if (!/\/Type\s*\/Font\b/.test(obj.dict)) return
    const ref = /\/ToUnicode\s+(\d+)\s+\d+\s+R/.exec(obj.dict)
    if (ref && cmapByObject.has(Number(ref[1]))) {
      cmapByFont.set(obj.num, cmapByObject.get(Number(ref[1])))
    }
  })

  const byName = new Map()
  // 字体资源字典既可能内联在页面对象里，也可能挂在 /Resources 的间接引用上，
  // 两种都要能解析，否则带 ToUnicode 的 PDF 会退化成按字节解码的乱码
  const addResource = (text) => {
    const entryRe = /\/([A-Za-z0-9#+._-]+)\s+(\d+)\s+\d+\s+R/g
    let entry
    while ((entry = entryRe.exec(text))) {
      const cmap = cmapByFont.get(Number(entry[2]))
      if (cmap && !byName.has(`/${entry[1]}`)) byName.set(`/${entry[1]}`, cmap)
    }
  }

  objects.forEach((obj) => {
    const inline = /\/Font\s*<<([\s\S]*?)>>/.exec(obj.dict)
    if (inline) {
      addResource(inline[1])
      return
    }
    const ref = /\/Font\s+(\d+)\s+\d+\s+R/.exec(obj.dict)
    if (ref) {
      const target = objects.get(Number(ref[1]))
      if (target) addResource(target.dict)
    }
  })

  return byName
}

const CP1252 = {
  0x80: '€', 0x82: '‚', 0x83: 'ƒ', 0x84: '„', 0x85: '…', 0x86: '†', 0x87: '‡',
  0x88: 'ˆ', 0x89: '‰', 0x8a: 'Š', 0x8b: '‹', 0x8c: 'Œ', 0x8e: 'Ž', 0x91: '‘',
  0x92: '’', 0x93: '“', 0x94: '”', 0x95: '•', 0x96: '–', 0x97: '—', 0x98: '˜',
  0x99: '™', 0x9a: 'š', 0x9b: '›', 0x9c: 'œ', 0x9e: 'ž', 0x9f: 'Ÿ'
}

function decodeWithCmap(bytes, cmap) {
  if (!cmap || !cmap.map.size) return ''
  const width = cmap.bytes === 2 ? 2 : 1
  let out = ''
  for (let i = 0; i + width <= bytes.length; i += width) {
    const code = width === 2 ? (bytes[i] << 8) | bytes[i + 1] : bytes[i]
    const char = cmap.map.get(code)
    if (char) out += char
  }
  return out
}

// GBK 标点区：中文排版软件给英文正文插入的破折号、引号常走这套双字节编码。
// 只收录英文文章里真正会出现的标点，避免把普通 latin1 字符误判成双字节
const GBK_PUNCT = {
  0xa1a2: '、', 0xa1a3: '。', 0xa1a4: '·', 0xa1aa: '—', 0xa1ad: '…',
  0xa1ae: '‘', 0xa1af: '’', 0xa1b0: '“', 0xa1b1: '”',
  0xa1b6: '《', 0xa1b7: '》', 0xa1b8: '「', 0xa1b9: '」',
  0xa1ba: '『', 0xa1bb: '』', 0xa1be: '【', 0xa1bf: '】',
  0xa3a1: '！', 0xa3a4: '＄', 0xa3a5: '％', 0xa3a8: '（', 0xa3a9: '）',
  0xa3ac: '，', 0xa3ae: '．', 0xa3ba: '：', 0xa3bb: '；', 0xa3bf: '？'
}

function decodeLatin(bytes) {
  let out = ''
  for (let i = 0; i < bytes.length; i += 1) {
    const byte = bytes[i]
    // 中文排版 PDF 的破折号、引号常用 GBK 双字节（如 A1AA 是破折号），
    // 逐字节按 latin1 解会变成 ¡ª，这里把成对的 GBK 标点还原成正确字符
    if ((byte === 0xa1 || byte === 0xa3) && i + 1 < bytes.length) {
      const pair = (byte << 8) | bytes[i + 1]
      if (GBK_PUNCT[pair]) {
        out += GBK_PUNCT[pair]
        i += 1
        continue
      }
    }
    out += CP1252[byte] || String.fromCharCode(byte)
  }
  return out
}

function unescapeLiteral(raw) {
  const body = raw.slice(1, -1)
  const bytes = []
  for (let i = 0; i < body.length; i += 1) {
    const char = body[i]
    if (char !== '\\') {
      bytes.push(body.charCodeAt(i) & 0xff)
      continue
    }
    const next = body[i + 1]
    if (next === undefined) break
    if (next === 'n') { bytes.push(10); i += 1 }
    else if (next === 'r') { bytes.push(13); i += 1 }
    else if (next === 't') { bytes.push(9); i += 1 }
    else if (next === 'b') { bytes.push(8); i += 1 }
    else if (next === 'f') { bytes.push(12); i += 1 }
    else if (next === '\n' || next === '\r') { i += 1 }
    else if (/[0-7]/.test(next)) {
      let octal = next
      let cursor = i + 2
      while (octal.length < 3 && /[0-7]/.test(body[cursor])) {
        octal += body[cursor]
        cursor += 1
      }
      bytes.push(parseInt(octal, 8) & 0xff)
      i = cursor - 1
    } else {
      bytes.push(next.charCodeAt(0) & 0xff)
      i += 1
    }
  }
  return bytes
}

function hexToBytes(raw) {
  const clean = raw.replace(/[^0-9A-Fa-f]/g, '')
  return Array.from(Buffer.from(clean.length % 2 ? `${clean}0` : clean, 'hex'))
}

// 逐 token 扫内容流，只关心取文本的操作符
function textFromContent(content, fontMaps) {
  const tokenRe = /\((?:\\[\s\S]|[^\\()])*\)|<[0-9A-Fa-f\s]*>|\/[A-Za-z0-9#+._-]+|\[|\]|[-+]?\d*\.?\d+|[A-Za-z'"*]{1,3}/g
  let out = ''
  let pending = []
  let arrayDepth = 0
  let lastRef = ''
  let cmap = null
  let match
  let numbers = []
  let fontSize = 12
  let lastX = null
  let lastY = null
  // 上一条正常行距：段间距通常比它明显更大，用它做自适应判断比写死倍数稳
  let lineGap = 0

  const lineBreak = (gap) => {
    const isParagraph = lineGap > 0 && gap > lineGap * 1.45 && gap > fontSize * 1.2
    if (!isParagraph) lineGap = gap
    out += isParagraph ? '\n\n' : '\n'
  }

  const flush = () => {
    if (!pending.length) return
    let chunk = ''
    pending.forEach((item) => {
      if (item === ' ') {
        chunk += ' '
        return
      }
      chunk += decodeWithCmap(item, cmap) || decodeLatin(item)
    })
    pending = []
    out += chunk
  }

  while ((match = tokenRe.exec(content))) {
    const token = match[0]
    const head = token[0]

    if (head === '(') {
      pending.push(unescapeLiteral(token))
      continue
    }
    if (head === '<') {
      pending.push(hexToBytes(token))
      continue
    }
    if (head === '/') {
      lastRef = token
      continue
    }
    if (head === '[') { arrayDepth += 1; continue }
    if (head === ']') { arrayDepth = Math.max(0, arrayDepth - 1); continue }
    if (/^[-+]?\d*\.?\d+$/.test(token)) {
      numbers.push(Number(token))
      if (numbers.length > 6) numbers.shift()
      // TJ 数组里的负值代表字间距，超过阈值视为词间空格
      if (arrayDepth > 0 && Number(token) <= -250) pending.push(' ')
      continue
    }

    if (token === 'Tf') {
      cmap = fontMaps.get(lastRef) || null
      if (numbers.length) fontSize = numbers[numbers.length - 1] || fontSize
      numbers = []
      continue
    }
    if (token === 'Tj' || token === 'TJ') {
      flush()
      numbers = []
      continue
    }
    if (token === "'" || token === '"') {
      flush()
      out += '\n'
      numbers = []
      continue
    }
    if (token === 'T*' || token === 'ET') {
      flush()
      out += '\n'
      numbers = []
      continue
    }
    // Td / TD 只移动一行内的位置；横向位移大于半个字号才补空格
    if (token === 'Td' || token === 'TD') {
      const tx = numbers.length >= 2 ? numbers[numbers.length - 2] : 0
      const ty = numbers.length >= 1 ? numbers[numbers.length - 1] : 0
      flush()
      if (Math.abs(ty) > 0.1) lineBreak(Math.abs(ty))
      // 逐字排版的文档（尤其中文）位移约等于 1 个字号，只有明显更大的间距才补空格
      else if (Math.abs(tx) > fontSize * 1.2) out += ' '
      numbers = []
      continue
    }
    if (token === 'Tm') {
      const x = numbers.length >= 6 ? numbers[numbers.length - 2] : null
      const y = numbers.length >= 6 ? numbers[numbers.length - 1] : null
      flush()
      if (x !== null && y !== null) {
        if (lastY !== null && Math.abs(y - lastY) > 0.1) {
          // 行距明显大于正常行高时视为段间距，保留空行供上层还原自然段
          lineBreak(Math.abs(y - lastY))
        } else if (lastX !== null && Math.abs(x - lastX) > fontSize * 1.2) out += ' '
        lastX = x
        lastY = y
      }
      numbers = []
      continue
    }
    numbers = []
  }
  flush()
  return out
}

function tidy(text) {
  return text
    .replace(/\u0000/g, '')
    .replace(/[\u0001-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// 中文真题 PDF 的文字层常是 GBK 编码，按 latin1 解出来就是
// 「2026Äê6ÔÂ´óÑ§Ó¢ÓïÁù¼¶¿¼ÊÔÕæÌâ」这种乱码。
// 小程序只需要英文正文，把这些连续的高位字符整段丢掉，
// 比保留乱码（或被前端当成英文正文导入）更安全
const MOJIBAKE_RUN = /[\u0080-\u00ff]{2,}/g

function stripMojibake(text) {
  let runs = 0
  const out = String(text || '').replace(MOJIBAKE_RUN, () => {
    runs += 1
    return ' '
  })
  return { text: out, runs }
}

// 文字层健康度：正常英文正文几乎全是 ASCII 字母，而且每 1000 个字母大约 150+ 个词。
// 字体缺 ToUnicode、字形被映射成随机汉字、或逐字母排版时，
// 抽出来会是一堆「看着有字」的乱码，不能当正文导入
function looksGarbled(text) {
  const raw = String(text || '')
  const compact = raw.replace(/\s+/g, '')
  if (compact.length < 200) return false
  let ascii = 0
  let accented = 0
  let cjk = 0
  for (let i = 0; i < compact.length; i += 1) {
    const code = compact.charCodeAt(i)
    if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) ascii += 1
    else if (code >= 0x80 && code <= 0xff) accented += 1
    else if (code >= 0x4e00 && code <= 0x9fff) cjk += 1
  }
  // 英文正文里混进大量汉字：典型的 ToUnicode 损坏，字形被映射成随机汉字
  if (cjk / compact.length > 0.25) return true
  const latinTotal = ascii + accented
  if (latinTotal < 40) return false
  if (accented / latinTotal > 0.3) return true
  const words = raw.match(/\b[A-Za-z]{2,}\b/g) || []
  // 逐字母排版/字形错位的文字层，词数远低于正常英文
  if (words.length * 1000 < latinTotal * 90) return true
  const stopwords = raw.match(/\b(the|and|of|to|in|is|that|for|with|as|on|it|be|are|was)\b/gi) || []
  return words.length >= 40 && stopwords.length / words.length < 0.03
}

function extractPdf(buf) {
  const parsed = buildObjects(buf)
  const objects = parsed.objects
  const fontPrograms = parsed.fontPrograms
  if (!objects.size) throw new Error('PDF 结构无法读取，可能是加密文档')

  const fontMaps = collectFontMaps(objects)
  const parts = []

  objects.forEach((obj) => {
    if (!obj.stream || !obj.stream.length) return
    if (/\/Type\s*\/(XRef|ObjStm|Metadata|Font|FontDescriptor|ToUnicode)\b/.test(obj.dict)) return
    // 图片与内嵌字体程序是二进制流，里面凑巧出现 BT/Tj 字节会被当成正文解析成乱码
    if (/\/Subtype\s*\/(Image|Type1C|CIDFontType0C|OpenType|XML)\b/.test(obj.dict)) return
    if (fontPrograms.has(obj.num)) return
    if (/\/Filter\s*(\[[^\]]*\])?\s*\/(DCTDecode|JPXDecode|CCITTFaxDecode|JBIG2Decode)\b/.test(obj.dict)) return
    const content = obj.stream.toString('latin1')
    if (content.indexOf('BT') < 0 || (content.indexOf('Tj') < 0 && content.indexOf('TJ') < 0)) return
    // 正文内容流一定带字体设置或定位操作符，缺这两个的多半是字体/图片里碰巧同名
    if (content.indexOf('Tf') < 0 && content.indexOf('Td') < 0 && content.indexOf('Tm') < 0) return
    parts.push(textFromContent(content, fontMaps))
  })

  // GBK 文字层解出来是乱码：先把连续的高位字符段丢掉，再做正常清洗
  const cleaned = stripMojibake(parts.join('\n\n'))
  if (cleaned.runs) console.log('pdf mojibake stripped', { runs: cleaned.runs })
  const text = tidy(cleaned.text)
  const latinLetters = (text.match(/[A-Za-z]/g) || []).length
  const garbled = looksGarbled(text)
  // 没有字体、只有图片：典型的扫描版，需要 OCR 才能读到字
  let fonts = 0
  let images = 0
  objects.forEach((obj) => {
    if (/\/Type\s*\/Font\b/.test(obj.dict)) fonts += 1
    if (/\/Subtype\s*\/Image\b/.test(obj.dict)) images += 1
  })
  // 扫描版页图：按页分组，空页不占位，供上层决定从第几页开始识别
  const pageGroups = collectPageImages(objects)
  return {
    text,
    paragraphs: text.split(/\n{2,}/).filter((block) => block.trim()).length,
    letters: latinLetters,
    garbled,
    // 有些扫描件会给页码、页眉单独嵌入字体，fonts 不为 0 但其实没有正文，
    // 所以只按「图片存在且抽不到多少英文」判断，避免这类文件被漏掉。
    // 文字层是乱码时同样要走 OCR，否则会把乱码当正文导进来
    scanned: images > 0 && (latinLetters < 40 || garbled),
    // 供扫描件 OCR 使用：[{ index, buffers }]
    pageGroups
  }
}

module.exports = { extractPdf, looksGarbled }

// 扫描版 PDF 没有文字层，但页面本身通常是内嵌的 JPEG 图片。
// 这里只取 DCTDecode 的图（本身就是 JPEG，可直接送 OCR）；
// CCITT / JBIG2 这类黑白压缩在零依赖下无法转码，交给上层给出提示
const MIN_PAGE_IMAGE_BYTES = 20 * 1024

function isPageImage(obj) {
  return !!obj && !!obj.stream && obj.stream.length >= MIN_PAGE_IMAGE_BYTES &&
    /\/Subtype\s*\/Image\b/.test(obj.dict) && /\/DCTDecode\b/.test(obj.dict)
}

// 按页序取出每一页引用的扫描图。
// 页对象里的 /Resources 可能内联，也可能挂在间接引用上，两种都要能跟到
function pageImageObjects(objects, page) {
  const refs = []
  const pushRefs = (dict) => {
    const re = /\/([A-Za-z0-9#+._-]+)\s+(\d+)\s+\d+\s+R/g
    let match
    while ((match = re.exec(dict))) refs.push(Number(match[2]))
  }
  pushRefs(page.dict)
  const resRef = /\/Resources\s+(\d+)\s+\d+\s+R/.exec(page.dict)
  if (resRef) {
    const res = objects.get(Number(resRef[1]))
    if (res) {
      pushRefs(res.dict)
      const xRef = /\/XObject\s+(\d+)\s+\d+\s+R/.exec(res.dict)
      if (xRef) {
        const xobj = objects.get(Number(xRef[1]))
        if (xobj) pushRefs(xobj.dict)
      }
    }
  }
  const found = []
  refs.forEach((num) => {
    if (found.some((item) => item.num === num)) return
    const obj = objects.get(num)
    if (!isPageImage(obj)) return
    found.push({ num, buffer: obj.stream })
  })
  return found
}

// 页序必须走 /Pages 的 /Kids 树：对象号顺序在多数 PDF 里和页序一致，
// 但重排过对象的文件会乱，一乱「跳过前几页」就会跳错
function pageOrder(objects) {
  const order = []
  let rootNum = 0
  objects.forEach((obj) => {
    if (rootNum) return
    if (!/\/Type\s*\/Catalog\b/.test(obj.dict)) return
    const ref = /\/Pages\s+(\d+)\s+\d+\s+R/.exec(obj.dict)
    if (ref) rootNum = Number(ref[1])
  })
  const walk = (num, depth) => {
    if (!num || depth > 32 || order.indexOf(num) >= 0) return
    const node = objects.get(num)
    if (!node) return
    if (/\/Type\s*\/Page\b/.test(node.dict)) {
      order.push(num)
      return
    }
    const kids = /\/Kids\s*\[([\s\S]*?)\]/.exec(node.dict)
    if (!kids) return
    const re = /(\d+)\s+\d+\s+R/g
    let match
    while ((match = re.exec(kids[1]))) walk(Number(match[1]), depth + 1)
  }
  if (rootNum) walk(rootNum, 0)
  if (order.length) return order
  // 页树损坏时退回对象号顺序，至少还能按大致页序识别
  objects.forEach((obj) => {
    if (/\/Type\s*\/Page\b/.test(obj.dict)) order.push(obj.num)
  })
  order.sort((a, b) => a - b)
  return order
}

// 返回 [{ index, buffers }]，只收录真正有扫描图的页：
// 空白页、只有矢量文字勾线的页没有整页图，不计为有效页
function collectPageImages(objects) {
  const seen = new Set()
  const pages = []
  pageOrder(objects).forEach((num, index) => {
    const page = objects.get(num)
    if (!page) return
    const buffers = pageImageObjects(objects, page)
      .sort((a, b) => b.buffer.length - a.buffer.length)
      .map((item) => item.buffer)
      .filter((buffer) => {
        // JPEG 的文件头都一样，用中段字节做指纹，避免同尺寸的两页被误判成重复
        const mid = Math.max(32, Math.floor(buffer.length / 2))
        const hash = `${buffer.length}:${buffer.slice(mid, mid + 32).toString('hex')}`
        if (seen.has(hash)) return false
        seen.add(hash)
        return true
      })
    if (buffers.length) pages.push({ index: index + 1, buffers })
  })
  return pages
}
