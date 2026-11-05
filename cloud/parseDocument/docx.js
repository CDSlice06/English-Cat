const zlib = require('zlib')

// 只依赖 Node 内置模块读取 docx（本质是 zip + xml），不引入任何第三方包

function findEndOfCentralDirectory(buf) {
  const lowest = Math.max(0, buf.length - 66000)
  for (let i = buf.length - 22; i >= lowest; i -= 1) {
    if (buf.readUInt32LE(i) === 0x06054b50) return i
  }
  return -1
}

// 读取 zip 中央目录，返回按文件名取内容的方法
function openZip(buf) {
  const eocd = findEndOfCentralDirectory(buf)
  if (eocd < 0) throw new Error('文件不是有效的 docx（压缩包结构缺失）')

  const count = buf.readUInt16LE(eocd + 10)
  let offset = buf.readUInt32LE(eocd + 16)
  const entries = {}

  for (let i = 0; i < count; i += 1) {
    if (offset + 46 > buf.length || buf.readUInt32LE(offset) !== 0x02014b50) break
    const method = buf.readUInt16LE(offset + 10)
    const compressedSize = buf.readUInt32LE(offset + 20)
    const nameLength = buf.readUInt16LE(offset + 28)
    const extraLength = buf.readUInt16LE(offset + 30)
    const commentLength = buf.readUInt16LE(offset + 32)
    const localOffset = buf.readUInt32LE(offset + 42)
    // 少数打包工具会写入反斜杠分隔符，统一成正斜杠
    const name = buf.toString('utf8', offset + 46, offset + 46 + nameLength).replace(/\\/g, '/')
    entries[name] = { method, compressedSize, localOffset }
    offset += 46 + nameLength + extraLength + commentLength
  }

  return {
    names: Object.keys(entries),
    read(name) {
      const entry = entries[name]
      if (!entry) return null
      const local = entry.localOffset
      if (local + 30 > buf.length || buf.readUInt32LE(local) !== 0x04034b50) return null
      const nameLength = buf.readUInt16LE(local + 26)
      const extraLength = buf.readUInt16LE(local + 28)
      const start = local + 30 + nameLength + extraLength
      const data = buf.slice(start, start + entry.compressedSize)
      if (entry.method === 0) return data
      if (entry.method === 8) {
        try {
          return zlib.inflateRawSync(data)
        } catch (error) {
          return null
        }
      }
      return null
    }
  }
}

const ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&nbsp;': ' '
}

function decodeEntities(text) {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (match, code) => String.fromCharCode(Number(code)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (match) => ENTITIES[match] || match)
}

function tidy(text) {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// docx 的正文在 word/document.xml，段落用 <w:p>，换行用 <w:br/>
function extractDocx(buf) {
  const zip = openZip(buf)
  const entry = zip.names.indexOf('word/document.xml') >= 0
    ? 'word/document.xml'
    : zip.names.find((name) => /^word\/document\d*\.xml$/.test(name))
  if (!entry) throw new Error('这个文件不是 Word 文档（缺少 word/document.xml）')

  const xmlBuffer = zip.read(entry)
  if (!xmlBuffer) throw new Error('Word 文档内容读取失败，请重新另存为 .docx 后上传')
  const xml = xmlBuffer.toString('utf8')

  const raw = xml
    .replace(/<w:tab[^>]*\/>/g, ' ')
    .replace(/<w:(br|cr)[^>]*\/>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<w:instrText[^>]*>[\s\S]*?<\/w:instrText>/g, '')
    .replace(/<w:delText[^>]*>[\s\S]*?<\/w:delText>/g, '')
    .replace(/<[^>]+>/g, '')

  const text = tidy(decodeEntities(raw))
  return { text, paragraphs: countParagraphs(text) }
}

function countParagraphs(text) {
  return text.split(/\n+/).filter((line) => line.trim()).length
}

module.exports = { extractDocx, countParagraphs }
