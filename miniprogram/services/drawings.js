// 用户自己画的记忆草图：按词 id 存一张 PNG 在本地，不占包体
const KEY = 'memorizeDrawings'
// 只留最近 100 张，避免本地文件越堆越多
const MAX_KEEP = 100

function fs() {
  return wx.getFileSystemManager()
}

function dir() {
  return `${wx.env.USER_DATA_PATH}/memorize-drawings`
}

function readMap() {
  try {
    const saved = wx.getStorageSync(KEY)
    return saved && typeof saved === 'object' ? saved : {}
  } catch (error) {
    return {}
  }
}

function writeMap(map) {
  try {
    wx.setStorageSync(KEY, map)
  } catch (error) {}
}

function fileOf(id) {
  return `${dir()}/${encodeURIComponent(String(id))}.png`
}

// 文件被系统清掉时顺手把记录也删了，避免页面显示裂图
function pathOf(id) {
  const key = String(id || '')
  if (!key) return ''
  const map = readMap()
  const entry = map[key]
  if (!entry || !entry.path) return ''
  try {
    fs().accessSync(entry.path)
    return entry.path
  } catch (error) {
    delete map[key]
    writeMap(map)
    return ''
  }
}

function prune(map) {
  const keys = Object.keys(map)
  if (keys.length <= MAX_KEEP) return
  keys.sort((a, b) => (map[a].at || 0) - (map[b].at || 0))
  keys.slice(0, keys.length - MAX_KEEP).forEach((key) => {
    try {
      fs().unlinkSync(map[key].path)
    } catch (error) {}
    delete map[key]
  })
}

function save(id, tempFilePath) {
  const key = String(id || '')
  if (!key || !tempFilePath) return ''
  try {
    const folder = dir()
    try {
      fs().accessSync(folder)
    } catch (error) {
      fs().mkdirSync(folder, true)
    }
    const path = fileOf(key)
    fs().copyFileSync(tempFilePath, path)
    const map = readMap()
    map[key] = { path, at: Date.now() }
    prune(map)
    writeMap(map)
    return path
  } catch (error) {
    return ''
  }
}

// 删掉这张草图，下次可以重新画
function remove(id) {
  const key = String(id || '')
  if (!key) return false
  const map = readMap()
  const entry = map[key]
  if (!entry) return false
  try {
    fs().unlinkSync(entry.path)
  } catch (error) {}
  delete map[key]
  writeMap(map)
  return true
}

module.exports = { pathOf, save, remove }
