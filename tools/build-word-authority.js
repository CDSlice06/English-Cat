// 生成 cloud/analyzeArticle/wordAuthority.json：词根拆解 + 易混辨析索引。
// 数据来源：roots.json（人工校订词根表）、confusables.json（人工校订易混对）。
// 这个脚本只做「校验 + 索引」，不生成任何新知识：
//   - 词根词表里词库没有的词会被剔除并打印出来；
//   - 同一个词挂在两个词根下会直接报错，避免释义自相矛盾；
//   - 词根拆解只使用词根表和前后缀表里已有的内容，拼不出就只显示词根。
// 用法：node tools/build-word-authority.js
const fs = require('fs')
const path = require('path')
const ROOT = path.join(__dirname, '..')
const DIR = path.join(ROOT, 'cloud/analyzeArticle')

// 与云函数 dict() 的合并口径一致：cet 优先，其余词库只补缺失词
function loadDict() {
  const base = require(`${DIR}/cet.json`)
  const merged = Object.assign({}, base)
  ;['common', 'extra', 'curated', 'advanced', 'base-ecdict', 'senses'].forEach((name) => {
    const dict = require(`${DIR}/${name}.json`)
    Object.keys(dict).forEach((word) => {
      if (!merged[word]) merged[word] = dict[word]
    })
  })
  // 词根的 der 里登记的派生词也算词库里有
  Object.keys(base).forEach((word) => {
    const entry = base[word]
    const list = entry && Array.isArray(entry.der) ? entry.der : []
    list.forEach((der) => {
      const key = String((der && der.w) || '').trim().toLowerCase()
      if (key && !merged[key]) merged[key] = { meanings: [{ pos: der.pos || 'n.', def: der.def || '' }] }
    })
  })
  return merged
}

function rankOf(word, dict) {
  const entry = dict[word]
  if (!entry) return 9999
  if (entry.frq > 0) return entry.frq
  return entry.rank || 6000
}

// 首义项的第一个中文片段，作为「核心义」
function coreOf(entry) {
  const meaning = ((entry && entry.meanings) || [])[0]
  if (!meaning) return ''
  return String(meaning.def || '').split(/[,，;；]/)[0].trim()
}

// 前后缀释义里带的变体说明只用于编辑，不进入词卡，避免出现括号套括号
function shortMeaning(text) {
  return String(text || '').replace(/（[^）]*）/g, '').trim()
}

function commonPrefixLength(a, b) {
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i += 1
  return i
}

// 在词里定位词根，再用前后缀表解释剩下的部分
function decompose(word, root, prefixes, suffixes) {
  let best = null
  root.variants.forEach((variant) => {
    let from = 0
    while (from <= word.length - variant.length) {
      const at = word.indexOf(variant, from)
      if (at < 0) break
      const prefix = word.slice(0, at)
      const suffix = word.slice(at + variant.length)
      const preMeaning = prefix ? prefixes[prefix] : ''
      const sufMeaning = suffix ? suffixes[suffix] : ''
      let score = 0
      if (!prefix || preMeaning) score += 2
      if (!suffix || sufMeaning) score += 2
      if (preMeaning) score += 1
      if (sufMeaning) score += 1
      score -= at * 0.01
      if (!best || score > best.score) {
        best = { score, variant, at, prefix, suffix, preMeaning, sufMeaning }
      }
      from = at + 1
    }
  })
  if (!best || (!best.preMeaning && !best.sufMeaning)) return ''
  const parts = []
  if (best.preMeaning) parts.push(`${best.prefix}-（${shortMeaning(best.preMeaning)}）`)
  parts.push(`${best.variant}（${root.meaning}）`)
  if (best.sufMeaning) parts.push(`-${best.suffix}（${shortMeaning(best.sufMeaning)}）`)
  if (parts.length < 2) return ''
  return parts.join(' + ')
}

;(() => {
  const dict = loadDict()
  const rootsFile = require(`${DIR}/roots.json`)
  const confusablesFile = require(`${DIR}/confusables.json`)
  const prefixes = rootsFile.prefixes || {}
  const suffixes = rootsFile.suffixes || {}
  const authority = Object.create(null)
  const assigned = new Map()
  const problems = []
  // 词根表里的词库未收录词：直接跳过，不算错误（派生词未必单独立条）
  const missing = []
  let covered = 0

  rootsFile.roots.forEach((root) => {
    if (!root || !root.id || !Array.isArray(root.words) || !Array.isArray(root.variants)) {
      problems.push(`词根条目缺少字段：${root && root.id}`)
      return
    }
    const family = root.words
      .map((word) => String(word || '').trim().toLowerCase())
      .filter((word) => {
        if (!word) return false
        if (!dict[word]) {
          missing.push(word)
          return false
        }
        if (!root.variants.some((variant) => word.indexOf(variant) >= 0)) {
          problems.push(`${word} 不含词根 ${root.id} 的任何变体（${root.variants.join('/')}）`)
          return false
        }
        if (assigned.has(word)) {
          problems.push(`${word} 同时挂在 ${assigned.get(word)} 和 ${root.id}`)
          return false
        }
        assigned.set(word, root.id)
        return true
      })
      .sort((a, b) => (rankOf(a, dict) - rankOf(b, dict)) || a.localeCompare(b))
    family.forEach((word) => {
      // 同根词优先排拼写最接近的：diversion 下面先出现 divert / diverse，
      // 而不是 frequency 更低的 university
      const siblings = family
        .filter((item) => item !== word)
        .sort((a, b) => (commonPrefixLength(b, word) - commonPrefixLength(a, word))
          || (rankOf(a, dict) - rankOf(b, dict))
          || a.localeCompare(b))
        .slice(0, 8)
      const build = decompose(word, root, prefixes, suffixes)
      authority[word] = Object.assign(authority[word] || {}, {
        root: {
          form: root.form,
          meaning: root.meaning,
          origin: root.origin || '',
          build,
          core: coreOf(dict[word]),
          family: siblings
        }
      })
      covered += 1
    })
  })

  // 易混对：双向登记；同一对正反写只算一次
  const seenPairs = new Set()
  let pairCount = 0
  ;(confusablesFile.pairs || []).forEach((pair) => {
    const a = String((pair && pair[0]) || '').trim().toLowerCase()
    const b = String((pair && pair[1]) || '').trim().toLowerCase()
    const note = String((pair && pair[2]) || '').trim()
    if (!a || !b || a === b || !note) return
    const key = a < b ? `${a}|${b}` : `${b}|${a}`
    if (seenPairs.has(key)) return
    seenPairs.add(key)
    pairCount += 1
    const push = (word, other) => {
      const entry = authority[word] || (authority[word] = {})
      const list = entry.confuse || (entry.confuse = [])
      if (list.some((item) => item.w === other)) return
      if (list.length >= 4) return
      const target = dict[other]
      const meaning = target && ((target.meanings || [])[0] || {})
      list.push({
        w: other,
        pos: (meaning && meaning.pos) || '',
        def: meaning && meaning.def ? String(meaning.def).split(/[,，;；]/)[0].trim() : '',
        note
      })
    }
    push(a, b)
    push(b, a)
  })

  const sorted = {}
  Object.keys(authority).sort().forEach((word) => { sorted[word] = authority[word] })
  fs.writeFileSync(`${DIR}/wordAuthority.json`, JSON.stringify(sorted), 'utf8')

  console.log('词根条目', rootsFile.roots.length, '覆盖单词', covered)
  console.log('易混对', pairCount, '覆盖单词', Object.keys(authority).filter((word) => authority[word].confuse).length)
  console.log('diversion →', JSON.stringify(sorted.diversion))
  console.log('divert →', JSON.stringify(sorted.divert))
  console.log('词库未收录、已跳过', missing.length, '个：', missing.slice(0, 8).join(', '))
  if (problems.length) {
    console.log(`\n需要修正的条目（${problems.length}）：`)
    problems.slice(0, 40).forEach((item) => console.log('  -', item))
    process.exitCode = 1
  }
  console.log('体积', Math.round(Buffer.byteLength(JSON.stringify(sorted)) / 1024), 'KB')
})()
