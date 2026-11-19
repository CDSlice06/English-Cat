// 分享卡片：标题带级别与词数，封面优先用云存储里的独立封面。
// 微信分享图只认代码包路径或 https，cloud:// 要先换成临时链接；
// 换不到（没网、额度用尽）就退回内置主题图，分享本身不受影响。
const CACHE_TTL = 90 * 60 * 1000
const BATCH = 50
const LEVEL_LABEL = { cet4: '四级', cet6: '六级', tem4: '专四', tem8: '专八' }

// fileID → { url, at }：只在内存里存，临时链接快过期时重新换一次
const urlCache = {}
// 已经请求过的 fileID，列表反复刷新时不重复调用
const requested = {}

function isCloud(fileId) {
  return /^cloud:\/\//.test(String(fileId || ''))
}

function cachedUrl(fileId) {
  const hit = urlCache[fileId]
  if (!hit) return ''
  if (Date.now() - hit.at > CACHE_TTL) {
    delete urlCache[fileId]
    return ''
  }
  return hit.url
}

function toHttps(fileIds) {
  const pending = fileIds.filter((id) => isCloud(id) && !cachedUrl(id) && !requested[id])
  if (!pending.length) return Promise.resolve()
  pending.forEach((id) => { requested[id] = true })
  const batches = []
  for (let i = 0; i < pending.length; i += BATCH) batches.push(pending.slice(i, i + BATCH))
  return Promise.all(batches.map((batch) => new Promise((resolve) => {
    const fail = () => {
      // 失败就把标记撤回，下次进页面还有机会重新换
      batch.forEach((id) => { delete requested[id] })
      resolve()
    }
    if (!wx.cloud || typeof wx.cloud.getTempFileURL !== 'function') {
      fail()
      return
    }
    wx.cloud.getTempFileURL({
      fileList: batch,
      success(res) {
        ;((res && res.fileList) || []).forEach((file) => {
          if (file && file.tempFileURL) urlCache[file.fileID] = { url: file.tempFileURL, at: Date.now() }
        })
        resolve()
      },
      fail
    })
  })))
}

// 进页面先把封面批量换成 https，等用户点分享时直接有图可用
function prefetch(items) {
  const ids = (Array.isArray(items) ? items : []).map((item) => item && item.cover)
  return toHttps(ids)
}

// 标题前半句给中文导读，后半句给级别和词数，好友一眼知道这篇值不值得点
function titleOf(item) {
  if (!item) return '每天读一篇外刊'
  const zh = item.zhTitle || item.title || ''
  const bits = []
  if (LEVEL_LABEL[item.level]) bits.push(LEVEL_LABEL[item.level])
  if (Number(item.words) > 0) bits.push(`${item.words} 词`)
  const tail = bits.length ? `${bits.join(' · ')}外刊` : ''
  if (!zh) return tail ? `${tail}，点开就能读` : '每天读一篇外刊'
  return tail ? `${zh}｜${tail}` : zh
}

function imageOf(item) {
  if (!item) return ''
  const cover = String(item.cover || '')
  if (isCloud(cover)) return cachedUrl(cover) || item.fallbackCover || ''
  return cover || item.fallbackCover || ''
}

// 好友点开直接落到这篇外刊；只带 id，不带我的文章 id（文章按 openid 隔离）
function shareOf(item) {
  const card = {
    title: titleOf(item),
    path: item && item.id ? `/pages/journal/index?journal=${item.id}` : '/pages/journal/index'
  }
  const imageUrl = imageOf(item)
  if (imageUrl) card.imageUrl = imageUrl
  return card
}

function timelineOf(item) {
  const card = {
    title: titleOf(item),
    query: item && item.id ? `journal=${item.id}` : ''
  }
  const imageUrl = imageOf(item)
  if (imageUrl) card.imageUrl = imageUrl
  return card
}

module.exports = { prefetch, titleOf, shareOf, timelineOf }
