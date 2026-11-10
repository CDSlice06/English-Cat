// 内置真题库：四级/六级历年仔细阅读已随函数一起打包，
// 小程序端只拉清单，点开哪篇再取正文，避免一次下发几百篇。
const { PASSAGES } = require('./data')

const SUMMARY_KEYS = ['id', 'level', 'year', 'month', 'paper', 'passage', 'title', 'words']

function summaryOf(item) {
  const summary = {}
  SUMMARY_KEYS.forEach((key) => { summary[key] = item[key] })
  summary.topic = item.topic
  return summary
}

// 清单排序：年份倒序 → 月份倒序 → 套数正序 → 篇号正序，
// 与题库页「按年份归档」的分组规则一致
const ORDERED = PASSAGES.slice().sort((a, b) => b.year - a.year
  || b.month - a.month
  || a.paper - b.paper
  || a.passage - b.passage)

exports.main = async (event) => {
  const action = event && event.action
  if (action === 'get') {
    const id = String((event && event.id) || '')
    const hit = PASSAGES.find((item) => item.id === id)
    if (!hit) return { code: 404, message: '这篇真题不存在' }
    return { code: 0, data: hit }
  }

  const level = event && event.level
  const list = ORDERED
    .filter((item) => !level || item.level === level)
    .map(summaryOf)
  const counts = { cet4: 0, cet6: 0 }
  ORDERED.forEach((item) => { counts[item.level] = (counts[item.level] || 0) + 1 })
  return { code: 0, data: { list, counts } }
}
