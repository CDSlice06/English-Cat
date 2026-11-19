// 词库释义清理：
// 1) 同一义项里重复的中文片段去重（happen: 发生, 发生, 恰巧 -> 发生, 恰巧）
// 2) 已人工核对确认的错义/错词性修正（PATCH 表，幂等）
// 3) 顺带去掉重复 JSON 键（curated.json 里 twit 被追加了 3 次，JSON.parse 只用最后一个）
//
// 只改云端词库源文件，不动 cet 之外的本地 seed/extras。
// 用法：node tools/clean-dict.js
const fs = require('fs')
const path = require('path')

const DIR = path.join(__dirname, '../cloud/analyzeArticle')
const FILES = ['cet', 'common', 'extra', 'curated', 'base-ecdict', 'senses']

// 人工核对过、确定有问题的义项
// drop: 删除该词性义项；def: 用新释义替换该词性义项
const PATCH = {
  cet: {
    apt: [{ pos: 'n.', drop: true }],              // 波：与 apt 无关的错义
    beg: [{ pos: 'n.', drop: true }],              // 塞：错义
    item: [{ pos: 'adj.', drop: true }],           // 又：错义
    bald: [{ pos: 'n.', drop: true }],             // 法：错义
    alter: [{ pos: 'n.', drop: true }],            // 捷, 葡, 爱沙：错义
    anywhere: [{ pos: 'n.', drop: true }]          // 与 adv. 义完全重复，且 n. 不成立
  },
  common: {
    boring: [{ pos: 'v.', drop: true }],           // 钻孔：bore 的现在分词，词条本身是 adj./n.
    // 以下几个 n. 是 ECDICT 里的国家简称乱码，与单词本义无关
    about: [{ pos: 'n.', drop: true }],            // 大致, 粗枝大叶, 不拘小节的人
    ago: [{ pos: 'n.', drop: true }],              // 西, 意, 塞
    below: [{ pos: 'n.', drop: true }],            // 德, 芬
    both: [{ pos: 'n.', drop: true }],             // 罗, 捷, 南非
    happy: [{ pos: 'n.', drop: true }],            // 瑞典
    hard: [{ pos: 'n.', drop: true }],             // 芬
    just: [{ pos: 'n.', drop: true }],             // 匈, 波, 捷
    on: [{ pos: 'n.', drop: true }],               // 柬
    tall: [{ pos: 'n.', drop: true }],             // 罗
    woo: [{ pos: 'n.', drop: true }],              // 羊毛，羊绒：wool 的误义
    cordless: [{ pos: 'n.', drop: true }],         // 不用电线的：形容词当名词，不成立
    wide: [{ pos: 'n.', drop: true }],             // 大千世界：错义
    redirect: [
      { pos: 'adj.', drop: true },                 // 再直接的：不成立
      { pos: 'n.', def: '重定向，网址跳转' }        // 原「再直接询问」是误义
    ],
    // boating 原释义被下一词条 body 串入：「划船…泛舟 body」+ 多出一条「n. 身体」
    boating: [
      { pos: 'n.', def: '划船，泛舟' },
      { pos: 'n.', drop: true, nth: 2 }
    ],
    // sideway 有两个 n.：「人行道」其实是 sidewalk
    sideway: [
      { pos: 'n.', def: '小路，岔路' },
      { pos: 'n.', drop: true, nth: 2 }
    ],
    same: [{ pos: 'n.', def: '同样的事，同一事物' }],   // 原「同样的事a同样的,同一」
    heart: [{ pos: 'v.', def: '鼓励，铭记' }],          // 原「鼓励, 铭记, 结心」
    vegetable: [{ pos: 'n.', def: '蔬菜, 植物, 植物人' }] // 原末尾「生活呆板」不是名词义
  },
  extra: {
    // 第 1 轮核对：国家简称乱码与错义
    abate: [{ pos: 'n.', drop: true }],           // 意, 法
    prosper: [{ pos: 'n.', drop: true }],         // 德, 罗
    sane: [{ pos: 'n.', drop: true }],            // 塞, 冈, 几比
    meager: [{ pos: 'n.', drop: true }],          // 兆
    detrimental: [{ pos: 'n.', drop: true }],     // 不受欢迎的求婚者：错义
    negate: [{ pos: 'n.', drop: true }],          // 对立面, 反面：名词不成立
    projection: [{ pos: 'v.', drop: true }],      // 发射, 计划：名词误作动词
    upheaval: [{ pos: 'v.', drop: true }],        // 举起, 抬起：upheave 的误义
    gut: [{ pos: 'n.', def: '内脏, 肠子, 肚子, 勇气, 胆量, 内容, 实质, 海峡' }] // 去掉「剧情」
  },
  'base-ecdict': {
    // 词性串位：释义本身没错，是词性标错了（toPos 把整条义项挪到正确词性）
    auricular: [{ pos: 'n.', toPos: 'adj.' }],          // 耳的, 耳状的：形容词
    moonless: [{ pos: 'n.', toPos: 'adj.', def: '无月亮的' }],
    oviparous: [{ pos: 'n.', toPos: 'adj.', def: '卵生的' }],
    conveniently: [{ pos: 'adj.', toPos: 'adv.', def: '方便地，合宜地' }],
    doubtlessly: [{ pos: 'adj.', toPos: 'adv.', def: '无疑地，毫无疑问' }],
    longingly: [{ pos: 'adj.', toPos: 'adv.', def: '渴望地，切望地' }],
    lusciously: [{ pos: 'adj.', toPos: 'adv.', def: '甘美地，令人感官愉悦地' }],
    finder: [{ pos: 'adj.', toPos: 'n.', def: '发现者，寻星镜' }],
    headdress: [{ pos: 'adj.', toPos: 'n.', def: '头饰，饰头巾' }],
    metaphase: [{ pos: 'adj.', toPos: 'n.', def: '中期（细胞分裂的中期）' }],
    redcoat: [{ pos: 'adj.', toPos: 'n.', def: '英国军人（尤指美国独立战争时的英军）' }],
    unilateralist: [{ pos: 'adj.', toPos: 'n.', def: '单方面裁军主张者' }],
    heterostracan: [{ pos: 'adj.', toPos: 'n.', def: '异甲鱼类（已灭绝的无颌鱼）' }],
    philippian: [{ pos: 'adj.', toPos: 'n.', def: '腓立比人' }],
    presentist: [{ pos: 'adj.', def: '当下主义的，当下主义者' }], // 原「presentism的变形」
    // 释义本身错的
    chara: [{ pos: 'n.', def: '轮藻（一种淡水绿藻）' }],     // 原「大型游览汽车」是 charabanc
    sideslip: [{ pos: 'n.', def: '侧滑，侧滑飞行' }],        // 原含「私生子」错义
    photosensitize: [{ pos: 'n.', drop: true }]             // 光敏剂是 photosensitizer
  },
  curated: {
    cutback: [{ pos: 'n.', def: '削减，减少；截枝' }],   // 原「情节倒叙」是 flashback 的误义
    blackberry: [{ pos: 'n.', def: '黑莓' }],            // 原「刺」是 bramble 的误义
    leaky: [{ pos: 'adj.', def: '有漏洞的，易泄漏秘密的' }], // 原「爱哭的」为误义
    unfriendly: [{ pos: 'adv.', drop: true }],      // adv. 不成立，保留 adj.
    downgrade: [
      { pos: 'n.', def: '下坡；降级' },
      { pos: 'adj.', drop: true },
      { pos: 'adv.', drop: true }
    ],
    // 第 2 轮批量核对：以下 n. 是国家简称乱码，或把别的词、别的词性的释义塞了进来
    akin: [{ pos: 'n.', drop: true }],            // 瑞典
    bestial: [{ pos: 'n.', drop: true }],         // 牛
    christen: [{ pos: 'n.', drop: true }],        // 德, 西, 丹
    coy: [{ pos: 'n.', drop: true }],             // 德
    prim: [{ pos: 'n.', drop: true }],            // 德, 匈, 捷
    auditory: [{ pos: 'n.', drop: true }],        // 听众, 礼堂：audience / auditorium 的误义
    cranial: [{ pos: 'n.', drop: true }],         // 头盖骨的：形容词当名词
    ensemble: [{ pos: 'adv.', drop: true }],      // 同时：不成立
    etch: [{ pos: 'n.', drop: true }],            // 腐蚀剂：etchant 的误义
    hunk: [{ pos: 'adj.', drop: true }],          // 行的, 好的：错义
    irreverence: [{ pos: 'adj.', drop: true }],   // 不尊敬的：形容词当名词
    knoll: [{ pos: 'v.', drop: true }],           // 敲钟：knell 的误义
    sonorous: [{ pos: 'n.', drop: true }],        // 宏亮的, 响亮的：名词义装的是形容词文字
    squatter: [{ pos: 'v.', drop: true }],        // 涉水而过：不成立
    temperance: [{ pos: 'adj.', drop: true }],    // 温暖的：temperate 的误义
    transgression: [{ pos: 'v.', drop: true }],   // 侵越, 超过：名词误作动词
    zesty: [
      { pos: 'adj.', def: '味道浓的，有滋味的；热情洋溢的' }, // 原释义是名词 zest 的意思
      { pos: 'v.', drop: true }                    // 给…加香味：不成立
    ],
    fallow: [{ pos: 'v.', def: '使（土地）休耕' }],  // 原「潜伏」
    fella: [{ pos: 'n.', def: '小伙子；伙伴，伙计' }], // 去掉 [俚] 标签
    sandal: [{ pos: 'v.', def: '给…穿凉鞋' }],      // 原「穿以便鞋」是错字
    spoof: [{ pos: 'adj.', def: '哄骗的' }],         // 原「哄骗认的」是错字
    shotgun: [{ pos: 'n.', def: '散弹猎枪，霰弹枪' }] // 去掉「媒人」错义
  }
}

function dedupeGroup(group) {
  const parts = String(group).split(/([,，、])/)
  const out = []
  const seen = new Set()
  let sep = ''
  parts.forEach((token) => {
    if (/^[,，、]$/.test(token)) {
      sep = token
      return
    }
    const key = token.trim()
    if (!key) return
    if (seen.has(key)) {
      sep = ''
      return
    }
    seen.add(key)
    if (out.length) out.push(sep || '，')
    out.push(token)
    sep = ''
  })
  return out.join('')
}

// 只在「；」分隔的同一个义项组内去重，避免把两个不同义项合并
function dedupeDef(def) {
  const next = String(def).split(/([；;])/).map((part, i) => (i % 2 ? part : dedupeGroup(part))).join('')
  return next === def ? def : next
}

// 去掉释义开头残留的词性标签（base-ecdict 里有一批 "adj. xxx的变形"）
function stripLeadingLabel(def) {
  return String(def)
    .replace(/^\s+/, '')
    .replace(/^(?:n|v|vt|vi|adj|adv|prep|conj|pron|det|art|int|interj|aux|abbr)\.\s*/i, '')
}

function argOf(name) {
  const at = process.argv.indexOf(name)
  return at >= 0 ? process.argv[at + 1] : ''
}

// 外部补丁：--patch <file>，结构与 PATCH 相同，用于分批核对后累计修正
const EXTRA_PATCH = (() => {
  const file = argOf('--patch')
  if (!file) return {}
  return JSON.parse(fs.readFileSync(file, 'utf8'))
})()

function patchFor(name) {
  const out = {}
  const base = PATCH[name] || {}
  Object.keys(base).forEach((word) => {
    out[word] = base[word].slice()
  })
  const extra = EXTRA_PATCH[name] || {}
  Object.keys(extra).forEach((word) => {
    out[word] = (out[word] || []).concat(extra[word])
  })
  return out
}

let total = 0
FILES.forEach((name) => {
  const file = path.join(DIR, `${name}.json`)
  const raw = fs.readFileSync(file, 'utf8')
  const dict = JSON.parse(raw.replace(/^\uFEFF/, ''))
  let changed = 0
  const notes = []

  // 1) 重复片段去重
  Object.keys(dict).forEach((word) => {
    const means = dict[word] && dict[word].meanings
    if (!Array.isArray(means)) return
    means.forEach((m) => {
      if (!m || typeof m.def !== 'string') return
      const next = dedupeDef(stripLeadingLabel(m.def))
      if (next !== m.def) {
        notes.push(`${word} ${m.pos} 去重: ${m.def} -> ${next}`)
        m.def = next
        changed += 1
      }
    })
  })

  // 2) 人工修正
  const patch = patchFor(name)
  Object.keys(patch).forEach((word) => {
    const entry = dict[word]
    if (!entry || !Array.isArray(entry.meanings)) {
      console.warn(`[skip] ${name}.${word} 不存在`)
      return
    }
    patch[word].forEach((op) => {
      // 同一词性有多条义项时按 nth 指定第几条（从 1 开始），默认取第一条
      const hits = []
      entry.meanings.forEach((m, i) => {
        if (m && m.pos === op.pos) hits.push(i)
      })
      const at = op.nth ? hits[op.nth - 1] : hits[0]
      if (typeof at !== 'number') return
      if (op.drop) {
        notes.push(`${word} ${op.pos} 删除: ${entry.meanings[at].def}`)
        entry.meanings.splice(at, 1)
        changed += 1
      } else if (op.toPos) {
        // 词性标错：把义项整体改到正确词性（ECDICT 里副词/形容词串位的很多）
        notes.push(`${word} ${op.pos} -> ${op.toPos} 修正: ${entry.meanings[at].def} -> ${op.def || entry.meanings[at].def}`)
        entry.meanings[at].pos = op.toPos
        if (op.def) entry.meanings[at].def = op.def
        changed += 1
      } else if (op.def && entry.meanings[at].def !== op.def) {
        notes.push(`${word} ${op.pos} 修正: ${entry.meanings[at].def} -> ${op.def}`)
        entry.meanings[at].def = op.def
        changed += 1
      }
    })
    if (!entry.meanings.length) delete dict[word]
  })

  if (changed) {
    fs.writeFileSync(file, JSON.stringify(dict), 'utf8')
    total += changed
    console.log(`\n${name}.json 修改 ${changed} 处（重复键已合并）`)
    notes.slice(0, 20).forEach((n) => console.log('  ' + n))
    if (notes.length > 20) console.log(`  ... 其余 ${notes.length - 20} 条`)
  } else {
    console.log(`${name}.json 无需修改`)
  }
})

console.log(`\n完成，共修改 ${total} 处`)
