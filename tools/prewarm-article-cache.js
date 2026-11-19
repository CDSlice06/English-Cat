#!/usr/bin/env node
/**
 * 预生成内置真题 + 外刊的 AI 精讲缓存（article_cache）。
 *
 * 目的：用户打开内置文章时直接命中共享缓存，只读库、不调用模型，打开快且不产生模型费用。
 * 依据：cloud/analyzeArticle 的 prewarm action（只接受无 OPENID 的管理侧调用）。
 *
 * 用法：
 *   node tools/prewarm-article-cache.js --dry                  # 只列出将要处理的文章
 *   node tools/prewarm-article-cache.js --only=journals        # 只跑外刊（bank / journals / all）
 *   node tools/prewarm-article-cache.js --limit=3              # 先试 3 篇
 *   node tools/prewarm-article-cache.js --phase=translate      # 只补全文对照（精讲已在缓存里）
 *   node tools/prewarm-article-cache.js --concurrency=2        # 并发数，默认 2
 *   node tools/prewarm-article-cache.js --attempts=2           # 单篇失败重试次数
 *   node tools/prewarm-article-cache.js --id=c4-01 --force     # 重做指定篇目（忽略已有缓存）
 *
 * 环境变量：
 *   TCB_ENV  云开发环境 ID，默认 cloud1-d6gaxobvw48339447
 *
 * 说明：脚本通过 CloudBase CLI 调云函数，需要本机已 `tcb login`。
 * 重复执行是安全的：已有同版本缓存会直接跳过，不会重复花模型的钱。
 */
const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const ENV = process.env.TCB_ENV || 'cloud1-d6gaxobvw48339447'
const TMP_DIR = path.join(ROOT, '.local', 'prewarm')

function argOf(name, fallback) {
  const prefix = `--${name}=`
  const hit = process.argv.slice(2).find((item) => item.indexOf(prefix) === 0)
  return hit ? hit.slice(prefix.length) : fallback
}

function hasFlag(name) {
  return process.argv.slice(2).indexOf(`--${name}`) >= 0
}

const ONLY = argOf('only', 'all')
const LIMIT = Math.max(0, Number(argOf('limit', '0')) || 0)
const CONCURRENCY = Math.max(1, Number(argOf('concurrency', '2')) || 2)
const ATTEMPTS = Math.max(1, Number(argOf('attempts', '2')) || 2)
const PHASE = argOf('phase', 'all')
const FORCE = hasFlag('force')
const IDS = argOf('id', '').split(',').map((item) => item.trim()).filter(Boolean)

function loadItems() {
  const journals = require(path.join(ROOT, 'source/journals.js')).JOURNALS || []
  const bank = require(path.join(ROOT, 'miniprogram/content/bank.js')).ARTICLES || []
  const out = []
  bank.forEach((item) => {
    out.push({
      id: item.id,
      group: 'bank',
      title: item.title,
      level: item.level === 'cet6' ? 'cet6' : 'cet4',
      text: String(item.text || '')
    })
  })
  journals.forEach((item) => {
    out.push({
      id: item.id,
      group: 'journals',
      title: item.title,
      level: item.level === 'cet6' ? 'cet6' : 'cet4',
      text: String(item.text || '')
    })
  })
  return out
}

// CLI 的 --json 输出形如 { data: { RetMsg: "<函数返回值 JSON 字符串>", Duration } }
function parseResult(stdout) {
  const raw = String(stdout || '')
  const at = raw.indexOf('{')
  if (at < 0) return null
  let outer = null
  try {
    outer = JSON.parse(raw.slice(at))
  } catch (error) {
    return null
  }
  const envelope = (outer && outer.data) || {}
  const ret = envelope.RetMsg
  if (!ret) return null
  let inner = null
  try {
    inner = JSON.parse(ret)
  } catch (error) {
    return null
  }
  return { inner, duration: Number(envelope.Duration) || 0 }
}

let payloadSeq = 0

function invoke(payload) {
  fs.mkdirSync(TMP_DIR, { recursive: true })
  payloadSeq += 1
  const file = path.join(TMP_DIR, `payload-${process.pid}-${payloadSeq}.json`)
  fs.writeFileSync(file, JSON.stringify(payload))
  try {
    const res = spawnSync(`tcb -e ${ENV} fn invoke analyzeArticle -d "@${file}" --json`, {
      cwd: ROOT,
      shell: true,
      encoding: 'utf8',
      timeout: 180000,
      maxBuffer: 32 * 1024 * 1024
    })
    const parsed = parseResult(res.stdout)
    if (!parsed) {
      return { ok: false, message: (res.stderr || res.stdout || '').trim().slice(-300) }
    }
    return parsed
  } finally {
    try {
      fs.unlinkSync(file)
    } catch (error) {}
  }
}

function labelOf(item, index, total) {
  const no = String(index + 1).padStart(2, '0')
  return `[${no}/${total}] ${item.id}`
}

async function warmOne(item, index, total, phase) {
  const payload = { action: 'prewarm', text: item.text, level: item.level }
  // 云端配了 PREWARM_TOKEN 时，管理调用必须带上同一个口令
  if (process.env.PREWARM_TOKEN) payload.token = process.env.PREWARM_TOKEN
  if (FORCE) payload.force = true
  if (phase === 'translate') payload.translate = true
  let last = null
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    const res = invoke(payload)
    last = res
    if (res && res.inner) {
      const inner = res.inner
      if (inner.code === 0) {
        const data = inner.data || {}
        // 旧版函数没有 prewarm 分支，会把请求当普通解析返回；必须认标记，避免误报成功
        if (data.prewarmed !== true) {
          return { ok: false, message: '云端仍是旧代码（缺少 prewarm 分支），先部署 analyzeArticle', attempt }
        }
        return { ok: true, data, duration: res.duration, attempt }
      }
      // 参数 / 权限 / 正文问题重试没有意义
      if ([400, 403, 422].indexOf(inner.code) >= 0) {
        return { ok: false, message: `${inner.code} ${inner.message || ''}`, attempt }
      }
      // 502：模型这一步没成功，稍后重试
      last = { ok: false, message: `${inner.code} ${inner.message || ''}`, duration: res.duration }
    }
    await new Promise((resolve) => setTimeout(resolve, 2000 * attempt))
  }
  return { ok: false, message: (last && last.message) || '调用失败', attempt: ATTEMPTS }
}

function report(item, phase, outcome, seconds) {
  const tag = phase === 'translate' ? '全文对照' : '精讲'
  const cost = seconds ? `${seconds.toFixed(1)}s` : '-'
  if (!outcome.ok) {
    console.log(`${item.__label} ${tag} ✗ ${outcome.message}（${cost}）`)
    return
  }
  const data = outcome.data || {}
  const stats = data.stats || {}
  if (data.skipped) {
    console.log(`${item.__label} ${tag} 已存在，跳过（${cost}）`)
    return
  }
  if (phase === 'translate') {
    console.log(`${item.__label} ${tag} ✓ ${data.sentences || 0} 句（${cost}）`)
    return
  }
  console.log(`${item.__label} ${tag} ✓ 生词 ${stats.vocabulary || 0} · 语法 ${stats.grammarPoints || 0} · 词组 ${stats.phrases || 0}（${cost}）`)
}

async function main() {
  let items = loadItems().filter((item) => {
    if (!item.text.trim()) return false
    if (IDS.length && IDS.indexOf(item.id) < 0) return false
    if (ONLY === 'all') return true
    return item.group === ONLY
  })
  if (LIMIT > 0) items = items.slice(0, LIMIT)

  const phases = PHASE === 'translate' ? ['translate'] : (PHASE === 'enhance' ? ['enhance'] : ['enhance', 'translate'])
  const total = items.length

  console.log(`环境 ${ENV} · 共 ${total} 篇 · 阶段 ${phases.join(' → ')} · 并发 ${CONCURRENCY}`)
  if (!total) {
    console.log('没有匹配到文章，检查 --only / --limit 参数')
    return 1
  }

  const groups = { bank: 0, journals: 0 }
  items.forEach((item) => { groups[item.group] += 1 })
  console.log(`题库 ${groups.bank} 篇 · 外刊 ${groups.journals} 篇`)

  if (hasFlag('dry')) {
    items.forEach((item, index) => {
      console.log(`${String(index + 1).padStart(2, '0')} ${item.group} ${item.id} ${item.level} ${item.text.length} 字符 · ${item.title}`)
    })
    return 0
  }

  let cursor = 0
  const failed = []
  const startedAt = Date.now()

  const runners = new Array(CONCURRENCY).fill(0).map(async () => {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      const item = items[index]
      item.__label = labelOf(item, index, total)
      const secondsOf = (res) => (res && res.duration ? res.duration / 1000 : 0)
      if (phases.indexOf('enhance') >= 0) {
        const outcome = await warmOne(item, index, total, 'enhance')
        report(item, 'enhance', outcome, secondsOf(outcome))
        if (!outcome.ok) {
          failed.push({ item, phase: 'enhance', message: outcome.message })
          continue
        }
      }
      if (phases.indexOf('translate') >= 0) {
        const outcome = await warmOne(item, index, total, 'translate')
        report(item, 'translate', outcome, secondsOf(outcome))
        if (!outcome.ok) failed.push({ item, phase: 'translate', message: outcome.message })
      }
    }
  })

  await Promise.all(runners)

  const minutes = ((Date.now() - startedAt) / 60000).toFixed(1)
  console.log('')
  console.log(`完成：成功 ${total - failed.length} 篇 · 失败 ${failed.length} 篇 · 用时 ${minutes} 分钟`)
  failed.forEach((hit) => {
    console.log(`  ✗ ${hit.item.id}（${hit.phase}）${hit.message}`)
  })
  if (failed.length) {
    console.log('失败篇目重跑一次即可：node tools/prewarm-article-cache.js（已成功的会直接跳过）')
    return 1
  }
  return 0
}

main().then((code) => process.exit(code)).catch((error) => {
  console.error(error && error.stack ? error.stack : error)
  process.exit(1)
})
