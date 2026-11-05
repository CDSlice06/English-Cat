const cloud = require('wx-server-sdk')
const crypto = require('crypto')
const https = require('https')
const { extractDocx } = require('./docx')
const { extractPdf } = require('./pdf')
const { pickReadingPassages, looksLikePaper, readingStats, rebuildParagraphs } = require('./reading')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const MAX_BYTES = 8 * 1024 * 1024
// 学习链路对文章长度有上限，超出部分截断并提示
const MAX_CHARS = 10000
// 扫描件 OCR：有效页 7 页以上会跳过前 3 页，最多只剩 6 页要识别；
// 有效页到 10 页就提示用户先裁剪，不再自动识别
const OCR_MAX_PAGES = 6
// 微信云调用限制图片小于 2MB；腾讯云 OCR 的 base64 上限约 7MB；DeepSeek 视觉单图 32MB
const WECHAT_OCR_MAX_BYTES = 2 * 1024 * 1024
const TENCENT_OCR_MAX_BYTES = 5 * 1024 * 1024
const DEEPSEEK_OCR_MAX_BYTES = 20 * 1024 * 1024

// 腾讯云 OCR：个人主体小程序没有微信 OCR 额度（101003），
// 所以用云函数内置 crypto 走 TC3-HMAC-SHA256 直连，零第三方依赖。
// 密钥只从环境变量读取，不落到代码和前端
const TENCENT_OCR_HOST = 'ocr.tencentcloudapi.com'
const TENCENT_OCR_SERVICE = 'ocr'
const TENCENT_OCR_VERSION = '2018-11-19'

// DeepSeek 视觉：deepseek-flash 支持在文本之外输入图片，
// 没有腾讯云密钥时用现有的 DEEPSEEK_API_KEY 直接读扫描页
const OCR_PROMPT = '这是一页扫描的英文文章。请把图片里的文字逐行转录出来：保持原有的换行；图片里两段之间只要有明显空白间距，转写时必须用一个空行分开，绝不能把整页文字连成一段。保留英文原文的拼写与标点，不要翻译、不要总结、不要补充解释，也不要输出代码块标记或任何前言。页眉、页脚、页码、题目选项都按原样转录。'

function tencentReady() {
  return !!process.env.TENCENT_SECRET_ID && !!process.env.TENCENT_SECRET_KEY
}

function sha256Hex(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function hmacSha256(key, value) {
  return crypto.createHmac('sha256', key).update(value).digest()
}

function postJson(host, path, headers, body, timeoutMs) {
  return new Promise((resolve, reject) => {
    // 腾讯云网关对 chunked 请求体支持不稳定，显式给长度更保险
    const options = {
      host,
      path,
      method: 'POST',
      headers: Object.assign({ 'Content-Length': Buffer.byteLength(body) }, headers)
    }
    const request = https.request(options, (response) => {
      let raw = ''
      response.setEncoding('utf8')
      response.on('data', (chunk) => { raw += chunk })
      response.on('end', () => {
        try {
          resolve(JSON.parse(raw))
        } catch (error) {
          reject(new Error(`OCR 返回内容解析失败：${raw.slice(0, 120)}`))
        }
      })
    })
    if (timeoutMs) {
      request.setTimeout(timeoutMs, () => {
        request.destroy(new Error('OCR 请求超时'))
      })
    }
    request.on('error', reject)
    request.write(body)
    request.end()
  })
}

// DeepSeek 视觉配置：优先复用大模型已有的 DEEPSEEK_API_KEY，
// 模型名单独用 DEEPSEEK_VISION_MODEL 覆盖，避免影响文本解析用的 deepseek-chat
function deepseekVisionConfig() {
  const key = String(process.env.DEEPSEEK_API_KEY || '').trim()
  if (!key) return null
  const base = String(process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').trim().replace(/\/+$/, '')
  let url
  try {
    url = new URL(`${base}/chat/completions`)
  } catch (error) {
    return null
  }
  return {
    key,
    host: url.hostname,
    path: `${url.pathname}${url.search || ''}`,
    model: String(process.env.DEEPSEEK_VISION_MODEL || 'deepseek-flash').trim() || 'deepseek-flash'
  }
}

// 模型有时会把结果包在 ``` 里，去掉围栏只留正文
function stripFence(text) {
  return String(text || '')
    .replace(/^\s*```[A-Za-z]*\s*/, '')
    .replace(/\s*```\s*$/, '')
    .trim()
}

// 模型返回的 content 可能是字符串，也可能是分块数组；两种都要能取到文字
function messageText(message) {
  if (!message) return ''
  const content = message.content
  if (typeof content === 'string') return stripFence(content)
  if (Array.isArray(content)) {
    const text = content.map((part) => {
      if (!part) return ''
      if (typeof part === 'string') return part
      return part.text || ''
    }).join('')
    return stripFence(text)
  }
  return ''
}

// 兼容官方与代理两种错误结构，别把真实原因吞掉
function apiErrorOf(result) {
  if (!result || typeof result !== 'object') return ''
  const error = result.error || result.Error
  if (error) {
    if (typeof error === 'string') return error
    return error.message || error.msg || error.type || error.code || JSON.stringify(error).slice(0, 160)
  }
  if (!Array.isArray(result.choices)) {
    const parts = [result.message, result.msg, result.code].filter(Boolean)
    if (parts.length) return parts.join(' ')
    return JSON.stringify(result).slice(0, 160)
  }
  return ''
}

async function callVision(config, imageUrl, timeoutMs) {
  const payload = JSON.stringify({
    model: config.model,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: OCR_PROMPT },
        { type: 'image_url', image_url: { url: imageUrl, detail: 'original' } }
      ]
    }],
    temperature: 0,
    // 一页 A4 的整页转录大概 1000-1500 tokens，模型自己还会先想一遍，
    // 3000 容易在思考阶段就用完导致正文为空，这里直接给足
    max_tokens: 8000,
    stream: false
  })
  const result = await postJson(config.host, config.path, {
    Authorization: `Bearer ${config.key}`,
    'Content-Type': 'application/json',
    Host: config.host
  }, payload, timeoutMs || 40000)

  const choice = result && Array.isArray(result.choices) ? result.choices[0] : null
  const text = messageText(choice && choice.message) || String((choice && choice.text) || '').trim()
  if (text) return text

  const finish = (choice && choice.finish_reason) || ''
  const detail = apiErrorOf(result) || (finish ? `finish_reason=${finish}` : '模型没有返回文字')
  const error = new Error(`DeepSeek 视觉识别失败：${detail}`)
  error.raw = JSON.stringify(result).slice(0, 500)
  throw error
}

// 用 DeepSeek 视觉模型读扫描页：返回整页文字，段落用空行保留
async function deepseekOcr(buffer, config, timeoutMs) {
  const imageUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`
  try {
    return await callVision(config, imageUrl, timeoutMs)
  } catch (error) {
    console.error('deepseek vision failed', {
      model: config.model,
      host: config.host,
      bytes: buffer.length,
      detail: (error && error.message) || error
      // 不打印 raw：里面可能含模型识别出的原文片段，避免用户文章落到日志里
    })
    throw error
  }
}

// 调腾讯云通用印刷体识别，返回逐行文字（带坐标，供还原段落）
async function tencentOcr(buffer) {
  const secretId = process.env.TENCENT_SECRET_ID
  const secretKey = process.env.TENCENT_SECRET_KEY
  const region = process.env.TENCENT_OCR_REGION || 'ap-guangzhou'
  const payload = JSON.stringify({
    ImageBase64: buffer.toString('base64'),
    LanguageType: 'auto'
  })
  const timestamp = Math.floor(Date.now() / 1000)
  const date = new Date(timestamp * 1000).toISOString().slice(0, 10)
  const contentType = 'application/json; charset=utf-8'
  const canonicalHeaders = `content-type:${contentType}\nhost:${TENCENT_OCR_HOST}\n`
  const signedHeaders = 'content-type;host'
  const canonicalRequest = [
    'POST',
    '/',
    '',
    canonicalHeaders,
    signedHeaders,
    sha256Hex(payload)
  ].join('\n')
  const credentialScope = `${date}/${TENCENT_OCR_SERVICE}/tc3_request`
  const stringToSign = [
    'TC3-HMAC-SHA256',
    String(timestamp),
    credentialScope,
    sha256Hex(canonicalRequest)
  ].join('\n')
  const secretDate = hmacSha256(`TC3${secretKey}`, date)
  const secretService = hmacSha256(secretDate, TENCENT_OCR_SERVICE)
  const secretSigning = hmacSha256(secretService, 'tc3_request')
  const signature = crypto.createHmac('sha256', secretSigning).update(stringToSign).digest('hex')

  const result = await postJson(TENCENT_OCR_HOST, '/', {
    Authorization: `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    'Content-Type': contentType,
    Host: TENCENT_OCR_HOST,
    'X-TC-Action': 'GeneralBasicOCR',
    'X-TC-Timestamp': String(timestamp),
    'X-TC-Version': TENCENT_OCR_VERSION,
    'X-TC-Region': region
  }, payload, 15000)

  const response = (result && result.Response) || {}
  if (response.Error) {
    throw new Error(`${response.Error.Code}: ${response.Error.Message}`)
  }
  return tencentTextOf(response.TextDetections)
}

// 扫描页 OCR 的提供方：腾讯云 > DeepSeek 视觉 > 微信云调用。
// 腾讯云对整页扫描的字准度最好；没有密钥时用已有的 DeepSeek Key 直接读图；
// 微信云调用只作为最后兜底（个人主体没有额度）
function ocrProvider() {
  if (tencentReady()) {
    return { name: 'tencent', maxBytes: TENCENT_OCR_MAX_BYTES }
  }
  const vision = deepseekVisionConfig()
  if (vision) {
    return { name: 'deepseek', maxBytes: DEEPSEEK_OCR_MAX_BYTES, vision }
  }
  return { name: 'wechat', maxBytes: WECHAT_OCR_MAX_BYTES }
}

async function ocrPage(buffer, provider, timeoutMs) {
  if (provider.name === 'tencent') return tencentOcr(buffer)
  if (provider.name === 'deepseek') return deepseekOcr(buffer, provider.vision, timeoutMs)
  const result = await cloud.openapi.ocr.printedText({
    img: { contentType: 'image/jpeg', value: buffer }
  })
  return wechatTextOf(result && result.items)
}

// 把逐行识别结果按纵坐标排好，遇到明显大于正常行距的间距补空行，保住自然段
function joinOcrRows(rows) {
  const list = rows.filter((row) => row.text)
  if (!list.length) return ''
  if (list.some((row) => row.y === null)) return list.map((row) => row.text).join('\n')
  list.sort((a, b) => a.y - b.y)

  // 用行距中位数判断什么算「正常行距」，避免不同分辨率下写死阈值
  const gaps = []
  for (let i = 1; i < list.length; i += 1) {
    const gap = list[i].y - list[i - 1].y
    if (gap > 1) gaps.push(gap)
  }
  gaps.sort((a, b) => a - b)
  const median = gaps.length ? gaps[Math.floor(gaps.length / 2)] : 0

  let out = list[0].text
  for (let i = 1; i < list.length; i += 1) {
    const row = list[i]
    const gap = row.y - list[i - 1].y
    out += median && gap > median * 1.6 ? '\n\n' : '\n'
    out += row.text
  }
  return out
}

// 微信云调用：字段是小写 pos.left_top
function wechatTextOf(items) {
  const rows = (Array.isArray(items) ? items : []).map((item) => {
    const pos = (item && item.pos) || {}
    const top = pos.left_top || null
    const bottom = pos.right_bottom || null
    return {
      text: String((item && item.text) || '').trim(),
      y: top ? Number(top.y) : null,
      height: top && bottom ? Number(bottom.y) - Number(top.y) : 0
    }
  })
  return joinOcrRows(rows)
}

// 腾讯云：字段是 Polygon 点数组，取最小/最大 Y
function tencentTextOf(detections) {
  const rows = (Array.isArray(detections) ? detections : []).map((item) => {
    const polygon = Array.isArray(item && item.Polygon) ? item.Polygon : []
    const ys = polygon.map((point) => Number(point && point.Y)).filter((value) => !Number.isNaN(value))
    return {
      text: String((item && item.DetectedText) || '').trim(),
      y: ys.length ? Math.min.apply(null, ys) : null,
      height: ys.length ? Math.max.apply(null, ys) - Math.min.apply(null, ys) : 0
    }
  })
  return joinOcrRows(rows)
}

function ocrHint(error) {
  const detail = String((error && (error.errCode || error.errMsg || error.message)) || '')
  if (/101003|quota/i.test(detail)) {
    if (tencentReady()) return 'OCR 的免费额度用完了（101003）。可以到腾讯云控制台看一下用量，或明天再试；也可以先把原文粘贴进来。'
    if (deepseekVisionConfig()) return '扫描件的识别额度用完了（101003）。等额度恢复再试，或先把原文粘贴进来。'
    return '扫描件需要识别文字，但当前没有可用的识别通道：请给 parseDocument 配置 DEEPSEEK_API_KEY（走 DeepSeek 视觉），或配置腾讯云 OCR 的 TENCENT_SECRET_ID / TENCENT_SECRET_KEY。也可以先把原文粘贴进来。'
  }
  if (/DeepSeek 视觉识别失败|invalid_api_key|Insufficient Balance|model_not_found|does not support image/i.test(detail)) {
    return `DeepSeek 视觉识别没成功${detail ? `（${detail.slice(0, 160)}）` : ''}。请确认 DEEPSEEK_API_KEY 有效、账户有余额，且 DEEPSEEK_VISION_MODEL 是支持图片的模型（默认 deepseek-flash）；也可以先把原文粘贴进来。`
  }
  if (/AuthFailure|SecretId|Signature|UnauthorizedOperation/i.test(detail)) {
    return '腾讯云 OCR 鉴权失败：请检查 TENCENT_SECRET_ID / TENCENT_SECRET_KEY 是否正确、是否已开通文字识别，以及账号是否欠费。'
  }
  if (/LimitExceeded|RequestLimitExceeded|RequestLimit/i.test(detail)) {
    return 'OCR 调用被限流了，等一分钟再试一次。'
  }
  if (/48001|unauthorized|permission|no permission/i.test(detail)) {
    return '扫描件的文字识别没有授权：请在公众平台确认小程序已认证，并在云开发控制台为 parseDocument 开启 ocr.printedText 权限。也可以先把原文粘贴进来。'
  }
  return `扫描件的文字识别没有成功${detail ? `（${detail.slice(0, 80)}）` : ''}，请稍后重试，或直接把原文粘贴进来。`
}


function success(data) {
  return { code: 0, message: 'ok', data }
}

function failure(code, message) {
  return { code, message, data: null }
}

// 只打内存数字，不打任何正文，方便线上判断是不是内存打爆。
// 图片、字体这类 Buffer 走的是堆外内存，只看 heapUsed 会漏掉大头，必须连 rss 一起看
function heapMb() {
  const usage = process.memoryUsage()
  return {
    rss: Math.round(usage.rss / 1048576),
    heap: Math.round(usage.heapUsed / 1048576)
  }
}

function kindOf(buffer, name) {
  if (buffer.length > 3 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03) return 'docx'
  // PDF 规范只要求 %PDF 出现在前 1024 字节内，部分导出工具会在头部前塞注释
  if (buffer.slice(0, 1024).toString('latin1').indexOf('%PDF') >= 0) return 'pdf'
  if (buffer.length > 3 && buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11) return 'doc'
  const ext = String(name || '').toLowerCase().match(/\.([a-z0-9]+)$/)
  return ext ? ext[1] : ''
}

// ---------- 扫描件分页 OCR ----------
// 整卷扫描件一次识别必然撞 60 秒上限：这里只负责把页面图存进云存储，
// 小程序拿到页面列表后逐页调用 action=ocrPage，每页一次请求，单次十几秒
async function uploadOcrPages(images) {
  let openid = ''
  try {
    const wxContext = cloud.getWXContext()
    openid = (wxContext && wxContext.OPENID) || ''
  } catch (error) {
    openid = ''
  }
  const folder = `ocr/${openid || 'anon'}/${Date.now()}`
  return Promise.all(images.map(async (buffer, index) => {
    const uploaded = await cloud.uploadFile({
      cloudPath: `${folder}/p${index + 1}.jpg`,
      fileContent: buffer
    })
    return { index: index + 1, fileID: uploaded.fileID, bytes: buffer.length }
  }))
}

// 单页识别：一次调用只处理一页，不会因为整卷页数多而超时
async function ocrSinglePage(event, limitMs) {
  const fileID = typeof event.fileID === 'string' ? event.fileID : ''
  if (fileID.indexOf('cloud://') !== 0) return failure(400, '缺少待识别的页面图')
  const provider = ocrProvider()
  let buffer
  try {
    const downloaded = await cloud.downloadFile({ fileID })
    buffer = downloaded.fileContent
  } catch (error) {
    console.error('ocrPage download failed', error)
    return failure(500, '页面图读取失败，请重试')
  }
  if (!buffer || !buffer.length) return failure(400, '页面图是空的')
  if (buffer.length > provider.maxBytes) return failure(413, '这一页的图片太大，暂时识别不了')
  const timeout = Math.max(15000, Math.min(45000, (Number(limitMs) || 20000) - 5000))
  try {
    const text = await ocrPage(buffer, provider, timeout)
    if (!text || !/\S/.test(text)) return failure(422, '这一页没有识别出文字')
    return success({ text, provider: provider.name })
  } catch (error) {
    console.error('ocrPage failed', {
      provider: provider.name,
      bytes: buffer.length,
      detail: (error && (error.errMsg || error.message)) || error
    })
    return failure(502, ocrHint(error))
  }
}

// 逐页识别结束后，把多页文字合回一篇文章；只保留仔细阅读，逻辑与整份解析一致
function assemblePassages(event) {
  const texts = Array.isArray(event.texts) ? event.texts : []
  const content = texts.map((item) => String(item || '').trim()).filter(Boolean).join('\n\n')
  if (!content || !/[A-Za-z]/.test(content)) {
    return failure(422, '这些扫描页都没有识别出英文正文，请换一份文字版 PDF，或直接把原文粘贴进来')
  }
  // 扫描阶段的提示（拆页、跳过前几页）要一路带到校对页，别在合并时丢掉
  const carried = Array.isArray(event.warnings) ? event.warnings.filter((item) => typeof item === 'string' && item) : []
  return packageText(content, {
    kind: event.kind === 'pdf' ? 'pdf' : 'docx',
    fileName: typeof event.fileName === 'string' ? event.fileName : '扫描件',
    warnings: carried.concat('扫描件已逐页识别，文字可能有少量错字，进入校对页先通读一遍。'),
    usedOcr: true,
    ocrFailed: [],
    limitMs: Number(event.limitMs) || 0
  })
}

// 从提取结果到「可导入的文章」的统一收口：段落还原、只留仔细阅读、超长截断
function packageText(text, options) {
  const opts = options || {}
  const kind = opts.kind
  const fileName = opts.fileName
  const warnings = Array.isArray(opts.warnings) ? opts.warnings.slice() : []
  const usedOcr = !!opts.usedOcr
  const ocrFailed = Array.isArray(opts.ocrFailed) ? opts.ocrFailed : []
  const limitMs = Number(opts.limitMs) || 0

  if (!text || !/[A-Za-z]/.test(text)) {
    return failure(422, '文档里没有找到英文正文，请确认内容后再上传')
  }
  // OCR 常把整页连成一段：没有空行时按行宽补回自然段
  const content = rebuildParagraphs(text)
  const paragraphs = content.split(/\n{2,}/).filter((block) => block.trim()).length
  // 真题整卷：排除写作、听力、翻译，只留仔细阅读的 Passage One / Two
  let passages = []
  try {
    passages = pickReadingPassages(content)
  } catch (error) {
    console.error('reading section extract failed', error)
  }
  if (passages.length) {
    const kept = passages.map((item) => {
      if (item.text.length <= MAX_CHARS) return item
      warnings.push(`${item.title} 超过 ${MAX_CHARS} 字符，已截取前 ${MAX_CHARS} 字符。`)
      return { ...item, text: item.text.slice(0, MAX_CHARS) }
    })
    warnings.push(`已自动排除写作、听力、选词填空、段落匹配与翻译，只保留仔细阅读 ${kept.length} 篇。`)
    return success({
      text: kept[0].text,
      passages: kept,
      kind,
      fileName,
      // 段落数按实际保留的第一篇算，不能用整卷的段落数
      paragraphs: kept[0].text.split(/\n{2,}/).filter((block) => block.trim()).length,
      warnings
    })
  }
  // 是一整份真题却没找到仔细阅读：直接报错，绝不把写作/听力/选项当正文导进来
  if (looksLikePaper(content)) {
    const stats = readingStats(content)
    console.log('reading extract failed', stats)
    const failedNote = usedOcr && ocrFailed.length ? `其中第 ${ocrFailed.join('、')} 页没识别出来。` : ''
    const extra = usedOcr
      ? (ocrFailed.length
        ? `${failedNote}仔细阅读可能就在没识别出来的页里。可以把 Passage 1 / Passage 2 所在页面单独导出成 PDF 再上传，或直接粘贴这两篇原文。`
        : '识别出来的文字里没有 Passage 1 / Passage 2 标记，可能是标题识别出了错字。建议直接粘贴这两篇原文。')
      : '请确认文件里有「Part III Reading Comprehension」和「Passage 1 / Passage 2」。'
    const limitNote = limitMs ? `云函数超时 ${Math.round(limitMs / 1000)} 秒` : '云函数超时未知'
    return failure(422, `这是一整份真题，但没有找到仔细阅读的 Passage 1 / Passage 2。${extra}（${limitNote}；识别到 ${stats.marks} 个 Passage 标记，题号行 ${stats.questions} 行）`)
  }

  if (content.length > MAX_CHARS) {
    warnings.push(`文章超过 ${MAX_CHARS} 字符，已截取前 ${MAX_CHARS} 字符。`)
  }
  return success({
    text: content.length > MAX_CHARS ? content.slice(0, MAX_CHARS) : content,
    kind,
    fileName,
    paragraphs,
    warnings
  })
}

exports.main = async (event = {}, context = {}) => {
  // 云函数实际配置的超时（毫秒），用来决定扫描件能认几页
  const limitMs = Number(context.time_limit_in_ms || context.timeout * 1000 || 0)
  const fileID = typeof event.fileID === 'string' ? event.fileID : ''
  const fileName = typeof event.name === 'string' ? event.name : '未命名文档'
  // 扫描件分页 OCR 的两个后续动作：单页识别、识别完成后合并
  const action = typeof event.action === 'string' ? event.action : ''
  if (action === 'ocrPage') return ocrSinglePage(event, limitMs)
  if (action === 'assemble') return assemblePassages(event)
  if (fileID.indexOf('cloud://') !== 0) return failure(400, '请先选择要上传的文档')

  let buffer
  try {
    const downloaded = await cloud.downloadFile({ fileID })
    buffer = downloaded.fileContent
  } catch (error) {
    console.error('parseDocument download failed', error)
    return failure(500, '文档下载失败，请检查网络后重试')
  }

  if (!buffer || !buffer.length) return failure(400, '文档是空的，请换一个文件')
  if (buffer.length > MAX_BYTES) return failure(413, '文档超过 8MB，请压缩或拆分后再上传')

  const kind = kindOf(buffer, fileName)
  if (kind === 'doc') return failure(415, '暂不支持旧版 .doc，请在 Word 里另存为 .docx 再上传')
  if (kind !== 'docx' && kind !== 'pdf') return failure(415, '只支持 Word（.docx）与 PDF 文件')

  let parsed
  try {
    parsed = kind === 'docx' ? extractDocx(buffer) : extractPdf(buffer)
  } catch (error) {
    console.error('parseDocument extract failed', error)
    return failure(422, (error && error.message) || '文档解析失败，请换一个文件重试')
  }
  console.log('parseDocument memory', {
    stage: 'extracted', kind, bytes: buffer.length, pages: (parsed.pageGroups || []).length, mb: heapMb()
  })

  // PDF 可能带打开密码或所有者加密，流被加密后无法解出文字，单独给一句明确提示
  const encrypted = kind === 'pdf' && buffer.toString('latin1').indexOf('/Encrypt') >= 0

  const warnings = []
  let text = parsed.text
  let garbled = kind === 'pdf' && !!parsed.garbled

  if (kind === 'pdf') {
    let letters = parsed.letters || 0
    // 扫描件没有文字层：取出页面图，交给 OCR 识别。
    // 文字层是乱码（扫描件常带一个按错编码写入的文字层）时同样走 OCR，
    // 否则会把 Ã¤Â¸Â­ 这类乱码当成正文直接导入
    if ((text.length < 120 || letters < 40 || garbled) && parsed.scanned) {
      const groups = Array.isArray(parsed.pageGroups) ? parsed.pageGroups : []
      const provider = ocrProvider()
      // 有效页 = 真正有扫描图的页，空白页不计入。
      // 页数太多时从末尾往前裁：题解、听力原文一般都在后面，
      // 裁到 9 页再跳过前 3 页，正好只剩 6 页要识别
      const effectivePages = groups.length
      const keptPages = effectivePages >= 10 ? 9 : effectivePages
      // 6 页及以上跳过前 3 页的封面、写作与听力；正好 5 页跳过封面 1 页；4 页以内从第 1 页找起
      const skipPages = keptPages >= 6 ? 3 : (keptPages === 5 ? 1 : 0)
      const usable = []
      groups.slice(skipPages, keptPages).forEach((group) => {
        group.buffers.forEach((buffer) => {
          if (buffer && buffer.length && buffer.length <= provider.maxBytes) usable.push(buffer)
        })
      })
      const pagesToOcr = usable.slice(0, OCR_MAX_PAGES)
      // 页图用完立刻释放，避免后续处理还占着几 MB 的 JPEG
      parsed.pageGroups = []
      groups.forEach((group) => { group.buffers.length = 0 })
      if (pagesToOcr.length) {
        let pages
        try {
          pages = await uploadOcrPages(pagesToOcr)
        } catch (error) {
          console.error('ocr page upload failed', { pages: pagesToOcr.length, detail: (error && error.message) || error })
          return failure(500, '扫描页上传失败，请检查网络后重试')
        }
        console.log('parseDocument scan split', {
          pages: pages.length, effective: effectivePages, skip: skipPages, provider: provider.name, mb: heapMb()
        })
        const notes = [`这份 PDF 是扫描件（${effectivePages} 页有内容），接下来逐页识别文字。`]
        if (keptPages < effectivePages) {
          notes.push(`页数过多，已从末尾裁掉 ${effectivePages - keptPages} 页（听力原文、题解通常在后面），只识别前 ${keptPages} 页。`)
        }
        if (skipPages) {
          notes.push(`已跳过前 ${skipPages} 页的封面、写作与听力，从第 ${skipPages + 1} 页开始找仔细阅读。`)
        }
        return success({
          scanned: true,
          pages,
          kind,
          fileName,
          effectivePages,
          skipPages,
          text: '',
          warnings: notes
        })
      }
      if (garbled) {
        return failure(422, '这个 PDF 的文字层是乱码（扫描件常带一个错误的文字层），页面图也无法识别。请上传文字版 PDF，或直接把原文粘贴进来。')
      }
      if (effectivePages) {
        return failure(422, '这份 PDF 是扫描件，但页面图太大或压缩格式特殊，暂时识别不了。可以在电脑上把 PDF 压缩后再上传，或直接把原文粘贴进来。')
      }
      return failure(422, '这份 PDF 是扫描图片，没有文字层，页面图里也没有可提取的图块。请上传文字版 PDF，或直接把文章原文粘贴进来。')
    }
    // 用非空白字符做分母：PDF 里大量换行和空格会把比例稀释掉，导致正常文章被误判
    const dense = text.replace(/\s+/g, '').length
    const ratio = dense ? letters / dense : 0
    console.log('pdf extract stats', { chars: text.length, letters, dense, ratio: Number(ratio.toFixed(3)), garbled, encrypted })
    // 文字层是乱码时直接报错，绝不把 Ã¤Â¸Â­ 这类内容导进题库
    if (garbled) {
      return failure(422, encrypted
        ? '这个 PDF 带密码保护，文字提取不出来。请在阅读器里另存为不加密的 PDF，或改用 Word 上传。'
        : '这个 PDF 的文字层是乱码（常见于扫描件带了一个错误的文字层），提取不出可用的英文正文。请上传文字版 PDF，或直接把原文粘贴进来。')
    }
    if (text.length < 120 || letters < 40) {
      return failure(422, encrypted
        ? '这个 PDF 带密码保护，文字提取不出来。请在阅读器里另存为不加密的 PDF，或改用 Word 上传。'
        : '这个 PDF 里没有可提取的文字（多半是扫描件），请上传 Word，或直接把原文粘贴进来。')
    }
    // 文字版 PDF 的字母占比：太少说明不是英文正文
    if (ratio < 0.3) {
      return failure(422, '文档里没有找到足够的英文正文，请确认这是一篇英文文章')
    }
    warnings.push('PDF 的文字顺序可能与原文略有差异，建议先通读一遍再进入下一步。')
  }

  return packageText(text, { kind, fileName, warnings, limitMs })
}
