// 生成 miniprogram/pkgGrammar/content/usage-notes.js：语法点「常被问到的点」问答。
// 问答源文件在 tools/grammar-deep/usage-*.js（不打进小程序包），按大纲顺序合并输出。
// 用法：node tools/build-usage-notes.js
const fs = require('fs')
const path = require('path')
const ROOT = path.join(__dirname, '..')
const TARGET = path.join(ROOT, 'miniprogram/pkgGrammar/content/usage-notes.js')
const { SYLLABUS } = require(path.join(ROOT, 'miniprogram/pkgGrammar/content/grammar-syllabus'))

const SOURCES = [
  'usage-word',
  'usage-syntax-1',
  'usage-syntax-2',
  'usage-syntax-3',
  'usage-basic',
  'usage-legacy'
]

const NOTES = {}
SOURCES.forEach((name) => {
  const file = require(path.join(ROOT, 'tools/grammar-deep', name))
  const table = file.USAGE_NOTES || file
  Object.keys(table).forEach((key) => {
    NOTES[key] = table[key]
  })
})

const ORDER = []
SYLLABUS.forEach((group) => {
  group.modules.forEach((module) => {
    module.keys.forEach((key) => {
      if (ORDER.indexOf(key) < 0) ORDER.push(key)
    })
  })
})

const output = {}
const missing = []
const bad = []
ORDER.forEach((key) => {
  const note = NOTES[key]
  if (!note) {
    missing.push(key)
    return
  }
  const items = (note.items || []).filter((item) => item.q && item.a).slice(0, 3)
  if (!note.summary || items.length < 2 || items.length > 3 || !items.some((item) => item.good && item.bad)) {
    bad.push(key)
  }
  output[key] = {
    summary: note.summary,
    items
  }
})

const text = JSON.stringify(output, null, 2)
const file = `// 语法点「常被问到的点」（生成文件，勿手改）：来源 tools/grammar-deep/usage-*.js
// 每条包含：summary（一句话提醒）、items（2-3 个问答，部分带正误对比）

const USAGE_NOTES = ${text}

module.exports = { USAGE_NOTES }
`
fs.writeFileSync(TARGET, file, 'utf8')

console.log('知识点', ORDER.length, '生成', Object.keys(output).length)
console.log('文件大小', Buffer.byteLength(file), 'B')
console.log('缺问答', missing.length, missing.join(','))
console.log('问答不合规', bad.length, bad.join(','))
