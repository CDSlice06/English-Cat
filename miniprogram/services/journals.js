// 英语外刊：主包只带清单，正文由云端内容包按 id 取回并缓存。
// 清单只回摘要，正文按 id 取；云端没更新时完全不发请求。
const { JOURNALS } = require('../content/journalSummary')
const { META } = require('../content/journalMeta')
const { COVERS } = require('../content/journalCovers')
const journalPack = require('./journalPack')

const SUMMARY_KEYS = ['id', 'level', 'title', 'source', 'sourceUrl', 'license', 'date', 'topic', 'words']

// 新文章排前面；同一天按 id 稳定排序，保证「今日外刊」每天都是固定的一篇
function orderedOf(items) {
  return items.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))
    || String(a.id).localeCompare(String(b.id)))
}

// 内置清单 + 云端发布的新外刊合成一份，列表、今日推荐、下一篇都读这一份
let merged = orderedOf(JOURNALS)

function summaryOf(item) {
  const summary = {}
  SUMMARY_KEYS.forEach((key) => { summary[key] = item[key] })
  const meta = META[item.id] || {}
  // 云端清单没带中文标题时留空，由页面隐藏这一行
  summary.zhTitle = item.zhTitle || meta.zhTitle || ''
  summary.summary = item.summary || meta.summary || ''
  // 独立封面在云存储；fallbackCover 留给列表页加载失败时换回主题图
  summary.fallbackCover = item.fallbackCover || (meta.cover ? `/assets/journal/${meta.cover}.jpg` : '')
  summary.cover = item.cover || COVERS[item.id] || summary.fallbackCover
  return summary
}

// 云端清单按 id 覆盖同名的内置文章，再整体重排；返回是否有变化由调用方判断
function mergeRemote(items) {
  if (!Array.isArray(items) || !items.length) return
  const byId = {}
  merged.forEach((item) => { byId[item.id] = item })
  items.forEach((raw) => {
    if (!raw || !raw.id) return
    // 旧版本自动抓取的文章不再展示，避免本地缓存里残留
    if (/^journal-a-/i.test(raw.id)) return
    const meta = META[raw.id] || {}
    byId[raw.id] = Object.assign({}, byId[raw.id] || {}, raw, {
      zhTitle: raw.zhTitle || meta.zhTitle || '',
      summary: raw.summary || meta.summary || '',
      fallbackCover: raw.fallbackCover || (meta.cover ? `/assets/journal/${meta.cover}.jpg` : ''),
      cover: raw.cover || COVERS[raw.id] || ''
    })
  })
  merged = orderedOf(Object.keys(byId).map((id) => byId[id]))
}

// 上次拿到的云端清单先在内存里合并：断网或云端不可用时，已经发布的新文章照样能看
mergeRemote(journalPack.cachedItems())

function listJournals(level) {
  return Promise.resolve(merged
    .filter((item) => !level || item.level === level)
    .map(summaryOf))
}

function getJournal(id) {
  const hit = merged.find((item) => item.id === id)
  if (!hit) return Promise.reject(new Error('这篇外刊不存在，换一篇试试'))
  // 内置文章自带正文；云端新增的文章点开时才取一次正文，之后缓存在本地
  if (String(hit.text || '').trim()) return Promise.resolve(hit)
  return journalPack.article(id).then((item) => {
    if (!item || !String(item.text || '').trim()) throw new Error('这篇外刊还没同步下来，稍后再试')
    return Object.assign({}, hit, item)
  })
}

// 静默检查云端内容包：有新版本才合并并返回 true，页面据此静默刷新列表
function refreshManifest(force) {
  return journalPack.refresh(force).then((items) => {
    if (!items) return false
    mergeRemote(items)
    return true
  })
}

const DAY = 24 * 60 * 60 * 1000

// 每日外刊：按本地日期取模，同一天里反复进首页都是同一篇，跨天自动换下一篇。
// 用日期而不是随机，是为了让「今天读哪篇」可以被约定，也方便用户隔天回来找。
function pickDaily(list, now) {
  const items = Array.isArray(list) ? list : []
  if (!items.length) return null
  const date = new Date(Number(now) || Date.now())
  const day = Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / DAY)
  return items[((day % items.length) + items.length) % items.length]
}

// 按外刊 id 反查：入库时 bankId 存的就是这个 id，用来避开「同源同日」不唯一的出处键
function findById(id) {
  const key = String(id || '')
  if (!key) return null
  const hit = merged.find((item) => item.id === key)
  return hit ? summaryOf(hit) : null
}

// 按入库时写的 source（「来源 · 日期」）反查外刊，阅读页用它定位「下一篇」
function findBySource(source) {
  const key = String(source || '')
  if (!key) return null
  const hit = merged.find((item) => `${item.source} · ${item.date}` === key)
  return hit ? summaryOf(hit) : null
}

// 按发布日期倒序的下一篇；读到头了回到最新的一篇，读完永远有下文可接
function nextOf(id) {
  const index = merged.findIndex((item) => item.id === id)
  if (index < 0) return null
  return summaryOf(merged[(index + 1) % merged.length])
}

module.exports = { listJournals, getJournal, pickDaily, findById, findBySource, nextOf, refreshManifest }
