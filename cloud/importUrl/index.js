// 网页链接导入：抓取 HTML 并提取正文，交给校对页走和文档一样的导入流程
const http = require('http')
const https = require('https')
const zlib = require('zlib')
const dns = require('dns')
const net = require('net')
const { URL } = require('url')
const { TextDecoder: NodeTextDecoder } = require('util')

// 正文抓取上限：英文精读文章不会有这么长，超过基本是整站页面
const MAX_BYTES = 3 * 1024 * 1024
const TIMEOUT_MS = 9000
const MAX_REDIRECTS = 4
// 太短的正文视为没抓到（登录墙、JS 渲染的空壳页）
const MIN_TEXT = 200
const MAX_TEXT = 20000
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  mdash: '—', ndash: '–', hellip: '…', middot: '·',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
  copy: '©', reg: '®', trade: '™', times: '×', divide: '÷',
  deg: '°', euro: '€', pound: '£', yen: '¥', cent: '¢'
}

function ok(data) {
  return { code: 0, data }
}

function fail(code, message) {
  return { code, message }
}

function decodeEntities(text) {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (whole, code) => {
    if (code.charAt(0) === '#') {
      const num = code.charAt(1).toLowerCase() === 'x'
        ? parseInt(code.slice(2), 16)
        : parseInt(code.slice(1), 10)
      return num > 0 && num <= 0x10ffff ? String.fromCodePoint(num) : whole
    }
    const hit = ENTITIES[code.toLowerCase()]
    return hit === undefined ? whole : hit
  })
}

// 只保留文本：去标签、解实体、压缩空白
function plain(html) {
  return decodeEntities(String(html).replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function textLength(html) {
  return plain(html).length
}

// 内网地址不允许访问，避免云函数被当成跳板
function isPrivateAddress(ip) {
  if (!net.isIP(ip)) return false
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number)
    return parts[0] === 0 || parts[0] === 10 || parts[0] === 127
      || (parts[0] === 169 && parts[1] === 254)
      || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
      || (parts[0] === 192 && parts[1] === 168)
      || (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127)
  }
  return ip === '::1' || /^f[cd]/i.test(ip) || /^fe80/i.test(ip)
}

function lookupHost(host) {
  return new Promise((resolve, reject) => {
    dns.lookup(host, { all: true }, (error, list) => {
      if (error || !list || !list.length) return reject(new Error('域名解析失败'))
      if (list.some((item) => isPrivateAddress(item.address))) return reject(new Error('这个地址不允许访问'))
      resolve()
    })
  })
}

function headerOf(headers, key) {
  const value = headers[key]
  return Array.isArray(value) ? value[0] : value
}

// 单次请求：返回 { redirect } 或 { status, headers, body }
function request(urlString) {
  return new Promise((resolve, reject) => {
    let parsed
    try {
      parsed = new URL(urlString)
    } catch (error) {
      return reject(new Error('链接格式不对'))
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return reject(new Error('只支持 http 或 https 链接'))
    }
    const host = parsed.hostname
    if (/^(localhost|.*\.local|.*\.internal)$/i.test(host) || isPrivateAddress(host)) {
      return reject(new Error('这个地址不允许访问'))
    }

    const client = parsed.protocol === 'https:' ? https : http
    let req
    const timer = setTimeout(() => {
      if (req) req.destroy()
      reject(new Error('网站 9 秒没有响应'))
    }, TIMEOUT_MS)

    const done = (fn, value) => {
      clearTimeout(timer)
      fn(value)
    }

    req = client.get(parsed, {
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    }, (res) => {
      const status = res.statusCode || 0
      // 3xx 交给上层跟随，最多 4 跳
      if (status >= 300 && status < 400) {
        const location = headerOf(res.headers, 'location')
        res.resume()
        if (!location) return done(reject, new Error('网站跳转出错'))
        let next
        try {
          next = new URL(location, parsed).toString()
        } catch (error) {
          return done(reject, new Error('网站跳转地址不合法'))
        }
        return done(resolve, { redirect: next })
      }
      if (status !== 200) {
        res.resume()
        return done(reject, new Error(`网站返回 ${status}，可能不允许抓取`))
      }

      const type = String(headerOf(res.headers, 'content-type') || '')
      if (type && !/text\/html|application\/xhtml\+xml|text\/plain/i.test(type)) {
        res.resume()
        return done(reject, new Error('这个链接不是网页，换一个文章页面'))
      }

      const encoding = String(headerOf(res.headers, 'content-encoding') || '').toLowerCase()
      let stream = res
      if (encoding === 'gzip') stream = res.pipe(zlib.createGunzip())
      else if (encoding === 'deflate') stream = res.pipe(zlib.createInflate())
      else if (encoding === 'br' && zlib.createBrotliDecompress) stream = res.pipe(zlib.createBrotliDecompress())

      const chunks = []
      let size = 0
      stream.on('data', (chunk) => {
        size += chunk.length
        if (size > MAX_BYTES) {
          req.destroy()
          done(reject, new Error('页面太大了，换一篇短点的文章'))
          return
        }
        chunks.push(chunk)
      })
      stream.on('end', () => done(resolve, {
        status,
        headers: res.headers,
        body: Buffer.concat(chunks)
      }))
      stream.on('error', () => done(reject, new Error('网页内容解压失败')))
    })

    req.on('error', () => done(reject, new Error('连不上这个网站')))
  })
}

// 页面编码不一定声明，优先看响应头，再看 meta，最后按 utf-8 兜底
function decodeBody(buffer, contentType) {
  const fromHeader = String(contentType || '').match(/charset=["']?([\w-]+)/i)
  let charset = fromHeader ? fromHeader[1] : ''
  if (!charset) {
    const head = buffer.slice(0, 4096).toString('latin1')
    const fromMeta = head.match(/<meta[^>]+charset=["']?([\w-]+)/i)
    charset = fromMeta ? fromMeta[1] : 'utf-8'
  }
  try {
    return new NodeTextDecoder(String(charset).toLowerCase()).decode(buffer)
  } catch (error) {
    return buffer.toString('utf8')
  }
}

function pickTitle(html) {
  const patterns = [
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
    /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i,
    /<title[^>]*>([\s\S]*?)<\/title>/i,
    /<h1[^>]*>([\s\S]*?)<\/h1>/i
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      const title = plain(match[1])
      if (title) return title.slice(0, 200)
    }
  }
  return ''
}

// 正文段落：优先 <p>，短于 40 字符的丢掉（菜单、版权行、图片说明）
function pickParagraphs(html) {
  const out = []
  const re = /<p\b[^>]*>([\s\S]*?)<\/p>/gi
  let match
  while ((match = re.exec(html))) {
    const text = plain(match[1])
    if (text.length < 40) continue
    if (out.length && out[out.length - 1] === text) continue
    out.push(text)
  }
  return out
}

// 没有 <p> 的页面：按块级标签断行，只保留长行
function fallbackLines(html) {
  const lines = html
    .replace(/<(br|\/p|\/div|\/section|\/li|\/h[1-6]|\/article|\/main)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .split('\n')
  return lines
    .map((line) => decodeEntities(line).replace(/\s+/g, ' ').trim())
    .filter((line) => line.length >= 60)
}

function extractContent(html) {
  const body = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg|iframe|nav|header|footer|aside|form|button|template|figure)\b[\s\S]*?<\/\1>/gi, ' ')

  let paragraphs = pickParagraphs(body)
  let text = paragraphs.join('\n\n')

  // <p> 拼不出足够正文时，退回到整页按块断行
  if (text.length < 400) {
    const lines = fallbackLines(body)
    const fallback = lines.join('\n\n')
    if (fallback.length > text.length) text = fallback
  }

  text = text.replace(/\n{3,}/g, '\n\n').trim()
  if (text.length > MAX_TEXT) {
    // 截断时尽量停在段落边界
    const sliced = text.slice(0, MAX_TEXT)
    const cut = sliced.lastIndexOf('\n\n')
    text = cut > MAX_TEXT * 0.8 ? sliced.slice(0, cut) : sliced
  }
  return {
    text,
    paragraphs: text ? text.split(/\n{2,}/).length : 0
  }
}

exports.main = async (event) => {
  const raw = String((event && event.url) || '').trim()
  if (!raw) return fail(400, '请先把文章链接贴进来')
  if (raw.length > 2048) return fail(400, '链接太长了，检查一下是不是多贴了内容')

  // 用户常常只复制 example.com/article 这种不带协议的地址
  let current = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`

  try {
    let response = null
    for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
      const host = new URL(current).hostname
      await lookupHost(host)
      response = await request(current)
      if (!response.redirect) break
      current = response.redirect
      response = null
    }
    if (!response) return fail(400, '这个链接跳转太多次了，换一条直链试试')

    const html = decodeBody(response.body, headerOf(response.headers, 'content-type'))
    const title = pickTitle(html)
    const content = extractContent(html)

    if (content.text.length < MIN_TEXT) {
      return fail(422, '页面里没找到正文，可能是需要登录或靠脚本加载的网站。改用截图或直接粘贴原文吧')
    }

    return ok({
      url: current,
      title: title || new URL(current).hostname,
      text: content.text,
      paragraphs: content.paragraphs
    })
  } catch (error) {
    return fail(502, error.message || '网页抓取失败，稍后再试')
  }
}
