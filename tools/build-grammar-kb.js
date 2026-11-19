// 生成 miniprogram/pkgGrammar/content/grammar-kb.js：把「深度讲解」和「精读规则库」合并成知识点讲解。
// 深度讲解在 tools/grammar-deep/deep-*.js（源文件，不打进小程序包），
// 来源 cloud/analyzeArticle/grammar.js 的规则只作兜底。
// 用法：node tools/build-grammar-kb.js
const fs = require('fs')
const path = require('path')
const ROOT = path.join(__dirname, '..')
const TARGET = path.join(ROOT, 'miniprogram/pkgGrammar/content/grammar-kb.js')
const { RULES, FALLBACK } = require(path.join(ROOT, 'cloud/analyzeArticle/grammar'))
const { SYLLABUS } = require(path.join(ROOT, 'miniprogram/pkgGrammar/content/grammar-syllabus'))

const DEEP = Object.assign(
  {},
  require(path.join(ROOT, 'tools/grammar-deep/deep-basic')),
  require(path.join(ROOT, 'tools/grammar-deep/deep-word')),
  require(path.join(ROOT, 'tools/grammar-deep/deep-syntax-1')),
  require(path.join(ROOT, 'tools/grammar-deep/deep-syntax-2')),
  require(path.join(ROOT, 'tools/grammar-deep/deep-syntax-3'))
)

// 规则库兜底：只在深度讲解缺失时使用
const BASE = {}
RULES.concat([FALLBACK]).forEach((rule) => {
  if (!rule.key || BASE[rule.key]) return
  BASE[rule.key] = rule
})

// 按大纲顺序输出，详情页的「上一个 / 下一个」和语法本列表都跟着走
const ORDER = []
SYLLABUS.forEach((group) => {
  group.modules.forEach((module) => {
    module.keys.forEach((key) => {
      if (ORDER.indexOf(key) < 0) ORDER.push(key)
    })
  })
})

const points = []
const missing = []
ORDER.forEach((key) => {
  const deep = DEEP[key]
  const base = BASE[key]
  if (deep) {
    points.push({
      key,
      label: deep.label || (base && base.label) || key,
      definition: deep.definition || '',
      identify: deep.identify || '',
      usage: deep.usage || '',
      translate: deep.translate || '',
      trap: deep.trap || null,
      examples: (deep.examples || []).map((item) => ({ en: item.en, zh: item.zh })),
      // 兼容旧字段：语法本摘要用 understanding，翻译区用 translation
      understanding: deep.definition || '',
      translation: deep.translate || ''
    })
    return
  }
  if (base && base.label && base.understanding) {
    missing.push(key)
    points.push({
      key,
      label: base.label,
      definition: base.understanding,
      identify: '',
      usage: '',
      translate: base.translation || '',
      translation: base.translation || '',
      understanding: base.understanding,
      trap: null,
      examples: (base.examples || []).map((item) => ({ en: item.en, zh: item.zh }))
    })
    return
  }
  missing.push(key)
})

const text = points.map((point) => JSON.stringify(point)).join(',\n')
const output = `// 语法知识点讲解（生成文件，勿手改）：来源 miniprogram/content/deep-*.js
// 每条包含：key、label、definition（一句话定义）、identify（怎么识别）、
// usage（怎么用）、translate（怎么译）、trap（易错正误对比）、examples（例句）
module.exports = [
${text}
]
`
fs.writeFileSync(TARGET, output, 'utf8')

console.log('大纲知识点', ORDER.length, '生成', points.length)
console.log('文件大小', Buffer.byteLength(output), 'B')
console.log('深度讲解缺失（走旧规则兜底）', missing.length, missing.join(','))
const bad = points.filter((point) => !point.definition || !point.identify || !point.usage || !point.translate || !point.trap || !point.examples.length)
console.log('字段不全', bad.length, bad.map((point) => point.key).join(','))
