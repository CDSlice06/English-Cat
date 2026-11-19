// 外刊清单与正文全部来自随函数发布的 pack.json。
// 文章由人工精选、写好中文标题和导读后，用 tools/build-journal-pack.js 重新打包并部署本函数。
// 注意：内容包必须是单文件。开发者工具在 Windows 上打包子目录时会把路径写成
// `pack\articles\x.json` 这种反斜杠文件名，上传后云函数就读不到了。
const pack = require('./pack.json')

const ID_RE = /^journal-[a-z0-9-]{3,40}$/i

exports.main = async (event) => {
  const action = String((event && event.action) || 'manifest')
  if (action === 'manifest') {
    return { code: 0, data: { version: pack.version, updatedAt: pack.updatedAt, total: pack.total, items: pack.items } }
  }
  if (action === 'article') {
    const id = String((event && event.id) || '')
    if (!ID_RE.test(id)) return { code: 400, message: '参数不对' }
    const item = pack.articles[id]
    if (!item) return { code: 404, message: '这篇外刊还没同步到云端' }
    return { code: 0, data: item }
  }
  return { code: 400, message: '不支持的操作' }
}
