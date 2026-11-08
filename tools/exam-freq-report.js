// 真题词频榜单生成（构建脚本）
// 读 cloud/analyzeArticle/exam-freq.json + 词库，产出：
//   exam-vocab-ranking.html   可视化榜单（自带筛选、搜索、星级分档）
//   exam-vocab-ranking.csv    词表（Excel 可直接打开）
//
// 星级口径：按「该词在多少套真题正文里出现过」分档，不看语料库排名。
// 阈值按比例给，小样本（专四 21 套）也能自动落到「1 套 = 一星」的合理档位。
//   ★★★★★ ≥25%   ★★★★ ≥12%   ★★★ ≥6%   ★★ ≥3%   ★ ≥1%   其余不计星
// 只用统计结果，不输出任何真题原文。
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'cloud', 'analyzeArticle', 'exam-freq.json'), 'utf8'))
const OUT_HTML = path.join(ROOT, 'exam-vocab-ranking.html')
const OUT_CSV = path.join(ROOT, 'exam-vocab-ranking.csv')

const LEVELS = [
  { key: 'all', label: '全部真题' },
  { key: 'cet4', label: '四级' },
  { key: 'cet6', label: '六级' },
  { key: 'kaoyan', label: '考研' },
  { key: 'tem4', label: '专四' },
  { key: 'tem8', label: '专八' }
]

// 星级规则：比例阈值 + 套数下限。专四只有 21 套，纯比例会让「出现 1 套」就够两星，
// 加上下限才能把金字塔每一档都撑起来。
const STARS = [
  { star: 5, min: 0.25, least: 8, label: '必考核心' },
  { star: 4, min: 0.12, least: 5, label: '高频' },
  { star: 3, min: 0.06, least: 3, label: '常考' },
  { star: 2, min: 0.03, least: 2, label: '偶考' },
  { star: 1, min: 0.01, least: 1, label: '低频' }
]

function starOf(papersHit, total) {
  if (!total) return 0
  const hit = STARS.find((item) => papersHit >= Math.max(item.least, Math.ceil(item.min * total)))
  return hit ? hit.star : 0
}

function loadDict() {
  const dict = {}
  ;['cet.json', 'common.json', 'extra.json'].forEach((name) => {
    Object.assign(dict, JSON.parse(fs.readFileSync(path.join(ROOT, 'cloud', 'analyzeArticle', name), 'utf8')))
  })
  return dict
}

function meaningOf(entry) {
  if (!entry || !Array.isArray(entry.meanings)) return { pos: '', def: '' }
  const first = entry.meanings[0] || {}
  const pos = String(first.pos || '')
  // 释义只留前两条，避免表格里一坨逗号堆叠
  const def = entry.meanings
    .slice(0, 2)
    .map((item) => String(item.def || '').split(/[,，;；]/)[0])
    .filter(Boolean)
    .join('；')
  return { pos, def }
}

const dict = loadDict()
const totals = { all: DATA.totalPapers }
Object.keys(DATA.levels).forEach((key) => { totals[key] = DATA.levels[key].total })

const rows = Object.keys(DATA.all).map((word) => {
  const [occ, papers] = DATA.all[word]
  const entry = dict[word]
  const { pos, def } = meaningOf(entry)
  const counts = {}
  LEVELS.forEach(({ key }) => {
    if (key === 'all') return
    const stat = DATA.levels[key] && DATA.levels[key].words[word]
    counts[key] = stat ? stat[1] : 0
  })
  return {
    w: word,
    o: occ,
    p: papers,
    pos,
    d: def,
    core: !!(entry && String(entry.tags || '').indexOf('core') >= 0),
    c: counts
  }
})

// 每套试卷的覆盖率：星级分档按当前选中的考试类型各算一套
rows.forEach((row) => {
  row.r = { all: row.p / totals.all }
  LEVELS.forEach(({ key }) => {
    if (key === 'all') return
    row.r[key] = totals[key] ? (row.c[key] || 0) / totals[key] : 0
  })
  row.s = {}
  LEVELS.forEach(({ key }) => {
    row.s[key] = starOf(key === 'all' ? row.p : (row.c[key] || 0), totals[key])
  })
})

const counts = {}
LEVELS.forEach(({ key }) => {
  const total = totals[key] || 0
  counts[key] = { total, words: 0, byStar: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }
  rows.forEach((row) => {
    if (key !== 'all' && !row.c[key]) return
    counts[key].words += 1
    if (row.s[key] > 0) counts[key].byStar[row.s[key]] += 1
  })
})

const csvLines = ['word,pos,meaning,occurrences,papers_covered,total_papers,coverage,star_all,star_cet4,star_cet6,star_kaoyan,star_tem4,star_tem8']
rows.slice().sort((a, b) => b.p - a.p || b.o - a.o).forEach((row) => {
  const esc = (value) => `"${String(value || '').replace(/"/g, '""')}"`
  csvLines.push([
    row.w, row.pos, esc(row.d), row.o, row.p, totals.all, (row.r.all * 100).toFixed(1),
    row.s.all, row.s.cet4, row.s.cet6, row.s.kaoyan, row.s.tem4, row.s.tem8
  ].join(','))
})
fs.writeFileSync(OUT_CSV, '\ufeff' + csvLines.join('\r\n'), 'utf8')

const payload = {
  generatedAt: DATA.generatedAt,
  source: DATA.source,
  totals,
  counts,
  rows: rows.map((row) => [row.w, row.o, row.p, row.pos, row.d, row.core ? 1 : 0, row.c.cet4, row.c.cet6, row.c.kaoyan, row.c.tem4, row.c.tem8])
}

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>真题词汇星级总榜 · 238 套真题实测词频</title>
<style>
:root{
  --paper:#fdf6e6; --paper2:#fffdf6; --ink:#3b2f2a; --ink2:#6b5a4e; --line:#d9c8a9;
  --cream:#f7e6bd; --gold:#c9a227; --red:#b94b3a; --green:#5c7a52;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{
  background:
    radial-gradient(circle at 12% 8%, rgba(255,255,255,.7), transparent 45%),
    repeating-linear-gradient(0deg, rgba(59,47,42,.028) 0 1px, transparent 1px 28px),
    var(--paper);
  color:var(--ink);
  font-family:"PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif;
  font-size:14px; line-height:1.6;
}
.serif{font-family:"Iowan Old Style","Palatino Linotype","Songti SC",Georgia,serif}
.wrap{max-width:1180px;margin:0 auto;padding:40px 22px 80px}
header.top{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;flex-wrap:wrap;border-bottom:2px solid var(--ink);padding-bottom:14px}
h1{margin:0;font-size:36px;letter-spacing:.5px;font-weight:700}
h1 .en{display:block;font-size:13px;letter-spacing:3px;color:var(--ink2);font-weight:400;text-transform:uppercase;margin-bottom:6px}
.meta{font-size:12px;color:var(--ink2);text-align:right;line-height:1.8}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:26px 0}
.stat{background:var(--paper2);border:2px solid var(--ink);border-radius:3px 14px 4px 12px;box-shadow:4px 4px 0 rgba(59,47,42,.16);padding:14px 16px}
.stat b{display:block;font-size:30px;line-height:1.1;font-family:Georgia,serif}
.stat span{font-size:12px;color:var(--ink2)}
.rubric{background:var(--cream);border:2px dashed var(--ink);border-radius:12px 3px 12px 3px;padding:14px 18px;margin-bottom:22px;font-size:13px}
.rubric strong{font-size:14px}
.rubric .tiers{display:flex;gap:16px;flex-wrap:wrap;margin-top:8px;color:var(--ink2)}
.rubric .tiers i{font-style:normal;color:var(--gold);letter-spacing:1px}
.controls{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:16px}
.tabs{display:flex;gap:6px;flex-wrap:wrap}
.tab{border:2px solid var(--ink);background:var(--paper2);padding:7px 14px;border-radius:2px 10px 3px 9px;cursor:pointer;font-size:13px;font-weight:600}
.tab.on{background:var(--ink);color:var(--paper)}
input[type=search]{flex:1;min-width:200px;border:2px solid var(--ink);background:var(--paper2);border-radius:8px 2px 8px 2px;padding:9px 12px;font-size:14px;color:var(--ink);outline:none}
input[type=search]:focus{box-shadow:3px 3px 0 rgba(201,162,39,.4)}
.chips{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.chip{border:1.5px dashed var(--ink);background:transparent;border-radius:20px;padding:5px 12px;font-size:12px;cursor:pointer;color:var(--ink)}
.chip.on{background:var(--gold);border-style:solid;color:#fff}
label.core{display:flex;gap:6px;align-items:center;font-size:12px;color:var(--ink2);cursor:pointer}
table{width:100%;border-collapse:collapse;background:var(--paper2);border:2px solid var(--ink);box-shadow:6px 6px 0 rgba(59,47,42,.12)}
thead th{position:sticky;top:0;background:var(--paper2);border-bottom:2px solid var(--ink);padding:10px 8px;font-size:12px;color:var(--ink2);text-align:left;z-index:2}
tbody td{border-bottom:1px dashed var(--line);padding:9px 8px;vertical-align:middle}
tbody tr:hover{background:#fff8e3}
td.rank{width:56px;color:var(--ink2);font-family:Georgia,serif;text-align:right}
td.star{width:104px;white-space:nowrap;color:var(--gold);letter-spacing:1px;font-size:15px}
td.star small{display:block;color:var(--ink2);font-size:10px;letter-spacing:0;margin-top:-3px}
.word{font-family:"Iowan Old Style",Georgia,serif;font-size:19px;font-weight:700;letter-spacing:.3px}
.pos{color:var(--red);font-size:12px;margin-right:4px}
.def{color:var(--ink2);font-size:13px}
.num{font-family:Georgia,serif;text-align:right;width:76px}
td.cov{width:132px}
.bar{height:7px;background:#efe2c6;border-radius:4px;overflow:hidden;margin-top:3px}
.bar i{display:block;height:100%;background:linear-gradient(90deg,#d8b43f,#b98a1f)}
.badge{display:inline-block;font-size:10px;border:1px solid var(--line);border-radius:8px;padding:0 5px;color:var(--ink2);margin-left:6px;vertical-align:2px}
.more{display:block;width:100%;margin-top:18px;padding:12px;border:2px dashed var(--ink);background:transparent;border-radius:10px;cursor:pointer;font-size:13px;color:var(--ink)}
.empty{padding:40px;text-align:center;color:var(--ink2)}
.hint{font-size:12px;color:var(--ink2);margin-top:14px;line-height:1.9}
.hint b{color:var(--ink)}
@media (max-width:760px){
  .stats{grid-template-columns:repeat(2,1fr)}
  h1{font-size:26px}
  .wrap{padding:24px 12px 60px}
  td.cov{display:none}
  th.covh{display:none}
  thead th:nth-child(5){display:none}
  td:nth-child(5){display:none}
}
</style>
</head>
<body>
<div class="wrap">
  <header class="top">
    <h1><span class="en">Vocabulary Frequency Ranking</span>真题词汇星级总榜</h1>
    <div class="meta">
      语料：pastpapers.cn 全部 ${totals.all} 套真题正文<br/>
      统计日期：${DATA.generatedAt} · 释义来自本地词库
    </div>
  </header>

  <section class="stats">
    <div class="stat"><b>${totals.all}</b><span>套真题（四级 76 / 六级 76 / 考研 44 / 专四 21 / 专八 21）</span></div>
    <div class="stat"><b>${Object.keys(DATA.all).length.toLocaleString()}</b><span>命中词库的不同词形还原词</span></div>
    <div class="stat"><b>${counts.all.byStar[5]}</b><span>五星必考核心词（覆盖 ≥25% 试卷）</span></div>
    <div class="stat"><b>${counts.all.byStar[5] + counts.all.byStar[4]}</b><span>四星及以上高频词</span></div>
  </section>

  <section class="rubric">
    <strong>星级怎么来的</strong>：把每套真题的阅读正文抽出来，做词形还原后统计「这个词出现在多少套卷里」，再按覆盖率分档。覆盖率比出现次数更能代表“常考”，因为它不会被某一套卷里的反复出现带偏。
    <div class="tiers">
      <span><i>★★★★★</i> ≥25% 试卷</span>
      <span><i>★★★★</i> ≥12%</span>
      <span><i>★★★</i> ≥6%</span>
      <span><i>★★</i> ≥3%</span>
      <span><i>★</i> ≥1%</span>
      <span>低于 1% 不计星</span>
    </div>
  </section>

  <div class="controls">
    <div class="tabs" id="tabs">
      ${LEVELS.map((level, index) => `<button class="tab${index === 0 ? ' on' : ''}" data-level="${level.key}">${level.label}</button>`).join('')}
    </div>
    <input id="q" type="search" placeholder="搜索单词或中文释义，如 sustain / 可持续"/>
  </div>
  <div class="controls">
    <div class="chips" id="chips">
      <button class="chip on" data-star="0">全部星级</button>
      <button class="chip" data-star="5">★★★★★</button>
      <button class="chip" data-star="4">★★★★</button>
      <button class="chip" data-star="3">★★★</button>
      <button class="chip" data-star="2">★★</button>
      <button class="chip" data-star="1">★</button>
    </div>
    <label class="core"><input id="hideCore" type="checkbox"/> 隐藏高中基础词（core）</label>
    <span id="count" class="hint" style="margin:0"></span>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th><th>星级</th><th>单词 / 释义</th><th class="num">出现次数</th>
        <th class="covh">试卷覆盖</th><th class="num">覆盖率</th>
      </tr>
    </thead>
    <tbody id="tbody"></tbody>
  </table>
  <div id="empty" class="empty" style="display:none">没有符合条件的词</div>
  <button id="more" class="more">加载更多</button>

  <div class="hint">
    <b>读法建议</b>：先用「四级 / 六级」标签看自己那一档，五星词是必须条件反射认出的；四星词是拉开差距的部分。点右上星级筛选可以直接导出某一档来背。<br/>
    <b>统计说明</b>：只统计真题的阅读正文（考研 Text 1–4、专四专八 TEXT A 排版不同的试卷退回过滤后的全文，已剔除考试说明与 ABCD 选项），不做任何人工干预；同一篇正文在多套卷重复出现时会计入多套。
  </div>
</div>

<script>
const DATA = ${JSON.stringify(payload)};
const LEVELS = ${JSON.stringify(LEVELS.map((level) => level.key))};
const ROW = { w:0, o:1, p:2, pos:3, d:4, core:5, cet4:6, cet6:7, kaoyan:8, tem4:9, tem8:10 };
const LEVEL_INDEX = { cet4: ROW.cet4, cet6: ROW.cet6, kaoyan: ROW.kaoyan, tem4: ROW.tem4, tem8: ROW.tem8 };
const STARS = ${JSON.stringify(STARS)};
const $ = (id) => document.getElementById(id);
let level = 'all';
let starFilter = 0;
let hideCore = false;
let keyword = '';
let shown = 120;

function countOf(row) {
  if (level === 'all') return row[ROW.p];
  return row[LEVEL_INDEX[level]] || 0;
}
function totalOf() {
  return level === 'all' ? DATA.totals.all : (DATA.totals[level] || 0);
}
function ratioOf(row) {
  const total = totalOf();
  return total ? countOf(row) / total : 0;
}
function starOf(row) {
  const count = countOf(row);
  const total = totalOf();
  if (!total) return 0;
  const hit = STARS.find((item) => count >= Math.max(item.least || 1, Math.ceil(item.min * total)));
  return hit ? hit.star : 0;
}
function filtered() {
  const kw = keyword.trim().toLowerCase();
  return DATA.rows.filter((row) => {
    if (level !== 'all' && !row[LEVEL_INDEX[level]]) return false;
    if (hideCore && row[ROW.core]) return false;
    const star = starOf(row);
    if (starFilter && star !== starFilter) return false;
    if (star === 0) return false;
    if (kw && row[ROW.w].indexOf(kw) < 0 && String(row[ROW.d]).indexOf(kw) < 0) return false;
    return true;
  }).sort((a, b) => {
    const ra = ratioOf(a);
    const rb = ratioOf(b);
    if (rb !== ra) return rb - ra;
    return b[ROW.o] - a[ROW.o];
  });
}
function starText(star) {
  return star ? '★'.repeat(star) + '☆'.repeat(5 - star) : '—';
}
function starLabel(star) {
  const hit = STARS.find((item) => item.star === star);
  return hit ? hit.label : '未达星';
}
let list = [];
function render(reset) {
  if (reset) {
    list = filtered();
    shown = 120;
  }
  $('count').textContent = '共 ' + list.length.toLocaleString() + ' 个词';
  const slice = list.slice(0, shown);
  const total = totalOf();
  $('tbody').innerHTML = slice.map((row, index) => {
    const ratio = ratioOf(row);
    const star = starOf(row);
    const covered = countOf(row);
    return '<tr>'
      + '<td class="rank">' + (index + 1) + '</td>'
      + '<td class="star">' + starText(star) + '<small>' + starLabel(star) + '</small></td>'
      + '<td><span class="word">' + row[ROW.w] + '</span>' + (row[ROW.core] ? '<span class="badge">基础词</span>' : '')
        + '<div class="def">' + (row[ROW.pos] ? '<span class="pos">' + row[ROW.pos] + '</span>' : '') + (row[ROW.d] || '—') + '</div></td>'
      + '<td class="num">' + row[ROW.o].toLocaleString() + '</td>'
      + '<td class="cov">' + covered + ' / ' + total + '<div class="bar"><i style="width:' + Math.min(100, ratio * 100).toFixed(0) + '%"></i></div></td>'
      + '<td class="num">' + (ratio * 100).toFixed(1) + '%</td>'
      + '</tr>';
  }).join('');
  $('empty').style.display = list.length ? 'none' : 'block';
  $('more').style.display = list.length > shown ? 'block' : 'none';
  $('more').textContent = '加载更多（剩余 ' + Math.max(0, list.length - shown).toLocaleString() + ' 个）';
}
$('tabs').addEventListener('click', (event) => {
  const target = event.target.closest('.tab');
  if (!target) return;
  level = target.dataset.level;
  Array.from($('tabs').children).forEach((item) => item.classList.toggle('on', item === target));
  render(true);
});
$('chips').addEventListener('click', (event) => {
  const target = event.target.closest('.chip');
  if (!target) return;
  starFilter = Number(target.dataset.star);
  Array.from($('chips').children).forEach((item) => item.classList.toggle('on', item === target));
  render(true);
});
$('q').addEventListener('input', (event) => {
  keyword = event.target.value;
  render(true);
});
$('hideCore').addEventListener('change', (event) => {
  hideCore = event.target.checked;
  render(true);
});
$('more').addEventListener('click', () => {
  shown += 200;
  render(false);
});
render(true);
</script>
</body>
</html>`

fs.writeFileSync(OUT_HTML, html, 'utf8')
console.log(`已写出 ${OUT_HTML}（${(fs.statSync(OUT_HTML).size / 1024).toFixed(0)}KB）`)
console.log(`已写出 ${OUT_CSV}（${(fs.statSync(OUT_CSV).size / 1024).toFixed(0)}KB）`)
LEVELS.forEach(({ key }) => {
  const stat = counts[key]
  console.log(`${key}: 总 ${stat.total} 套，上榜 ${stat.words} 词，五星 ${stat.byStar[5]} 四星 ${stat.byStar[4]} 三星 ${stat.byStar[3]} 二星 ${stat.byStar[2]} 一星 ${stat.byStar[1]}`)
})

