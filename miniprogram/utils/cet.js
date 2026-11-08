// 备考标尺：四级、六级各有一套星级，同一个词在两套标尺下星级可以不同。
// 解析时已经按两套标尺各算好一份（freq4 / freq6）存进文章，这里只负责
// 「用户当前在备哪一级」这件事：读取、保存、以及按标尺取星级和写说明文案。
const TARGET_KEY = 'cetTarget'
// 没单独切过标尺时，跟着用户第一次进小程序时选的备考级别（userLevel）
const LEVEL_KEY = 'userLevel'

function normalizeTarget(value) {
  return value === 'cet6' ? 'cet6' : 'cet4'
}

function getTarget() {
  try {
    const saved = wx.getStorageSync(TARGET_KEY)
    if (saved) return normalizeTarget(saved)
    return normalizeTarget(wx.getStorageSync(LEVEL_KEY))
  } catch (error) {
    return 'cet4'
  }
}

function saveTarget(value) {
  const target = normalizeTarget(value)
  try {
    wx.setStorageSync(TARGET_KEY, target)
  } catch (error) {
    // 存储失败不影响本次展示，只是下次打开会回到默认标尺
  }
  return target
}

function targetLabel(target) {
  return normalizeTarget(target) === 'cet6' ? '六级' : '四级'
}

// 取这个词在当前标尺下的星级：新数据用 freq4 / freq6，
// 老文章只存过一个 freq（旧口径），两套标尺都拿它兜底，等批量补查回来再替换
function starOf(word, target) {
  const item = word || {}
  const six = normalizeTarget(target) === 'cet6'
  const level = six ? item.freq6 : item.freq4
  if (level !== undefined && level !== null) return Number(level) || 0
  return Number(item.freq) || 0
}

// 星数对应的档位名，0 星（词表与语料都查不到）不显示
function starLabel(level) {
  const star = Number(level) || 0
  if (star >= 3) return '高频'
  if (star === 2) return '常考'
  if (star === 1) return '低频'
  return ''
}

// 星级说明：文案跟着当前标尺走，讲清「同一个词换标尺星级会变」
function freqHelp(target) {
  const own = targetLabel(target)
  const other = own === '六级' ? '四级' : '六级'
  return `${own}标尺：星级来自 ${own}真题 76 套阅读正文的实测词频，按这个词出现过多少套卷分档。`
    + `★★★ 出现在 10% 以上的${own}试卷里，最常考；`
    + `★★ 出现在 2.5% 以上；`
    + `★ 其余${own}大纲词，以及${other}大纲等超纲收录词。`
    + `统计不含考试说明和 ABCD 选项，所以同一个词换到另一级标尺，星级会跟着变。`
}

module.exports = { normalizeTarget, getTarget, saveTarget, targetLabel, starOf, starLabel, freqHelp }
