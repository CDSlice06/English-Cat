// 全链路回归脚本：导入 → 打开 → 解析 → 保存单元 → 学习页取数 → 星级/同根/形近
// → 点亮 → 题库进度/「已学完」→ 页面逻辑 → 老文章进度回填 → 边界情况。
//
// 用法：node tests/e2e.js
// 说明：用内存数据库桩加载真实云函数与真实页面 JS（模拟 wx 运行时），
// 不依赖微信开发者工具、云环境或大模型。改完云函数或页面逻辑后直接重跑即可。
const path = require('path')
const Module = require('module')

const ROOT = path.join(__dirname, '..')
const stub = require('./support/wx-server-sdk')

// 云函数内部 require('wx-server-sdk') 时统一换成内存桩
const originalLoad = Module._load
Module._load = function (request, parent, isMain) {
  if (request === 'wx-server-sdk') return stub
  return originalLoad.apply(this, arguments)
}

const study = require(path.join(ROOT, 'cloud/study/index.js'))
const analyze = require(path.join(ROOT, 'cloud/analyzeArticle/index.js'))

const TEXT = `In an age of constant digital interruptions, many learners approach reading as a race rather than a reflective process. However, cognitive researchers argue that deep reading, which requires sustained attention, plays a significant role in how we address complex issues.

When readers encounter an unfamiliar word, they should not simply look for a single equivalent in Chinese. A word may present a novel meaning in a specific context, and its usual definition may not account for the author's intention. This is particularly important for students preparing for college English examinations.

Despite the pressure to read quickly, learners can benefit from pausing to examine how a sentence is constructed. Careful analysis helps them become advocates of their own learning, whereas mechanical translation often leaves the underlying logic untouched. A comprehensive understanding grows significantly when vocabulary, grammar and context are considered together.`

let failed = 0
let passed = 0

function section(title) {
  console.log(`\n${title}`)
}

function check(name, ok, extra) {
  if (ok) {
    passed += 1
    console.log(`  PASS  ${name}`)
  } else {
    failed += 1
    console.log(`  FAIL  ${name}${extra === undefined ? '' : ' → ' + JSON.stringify(extra)}`)
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 与 miniprogram/pages/vocabulary/index.js 保持一致的合并逻辑
function mergeRelated(own, extra) {
  const list = []
  const seen = new Set()
  ;(Array.isArray(own) ? own : []).concat(Array.isArray(extra) ? extra : []).forEach((item) => {
    const word = String((item && item.w) || '').toLowerCase()
    if (!word || seen.has(word)) return
    seen.add(word)
    list.push(item)
  })
  return list.slice(0, 4)
}

function relatedWords(map, word) {
  return ((map[word] || {}).family || []).map((item) => item.w)
}

function similarWords(map, word) {
  return ((map[word] || {}).similar || []).map((item) => item.w)
}

async function main() {
  stub.__reset()

  section('[1] 导入文章')
  const imported = await study.main({
    action: 'importArticle',
    text: TEXT,
    meta: { level: 'cet4', kind: 'real', year: 2025, month: 12, paper: 1, passage: 1, origin: 'import', source: 'e2e' }
  })
  check('importArticle 返回 0', imported.code === 0, imported.message)
  const articleId = imported.data && imported.data.article && imported.data.article._id
  check('拿到 articleId', !!articleId)
  check('入库时 queued=true', imported.data && imported.data.article.queued === true)
  check('入库时未解析', imported.data && imported.data.article.unitData === null)

  section('[2] 题库点开：应先提示需要解析')
  const opened = await study.main({ action: 'openArticle', articleId })
  check('openArticle 返回 0', opened.code === 0, opened.message)
  check('needsAnalysis=true', opened.data && opened.data.needsAnalysis === true)
  check('带回正文', !!(opened.data && opened.data.text && opened.data.text.length > 100))

  section('[3] 客户端调用 analyzeArticle 解析')
  const parsed = await analyze.main({ text: opened.data.text, level: opened.data.level })
  check('解析返回 0', parsed.code === 0, parsed.message)
  const unitData = parsed.data || {}
  check('unitData.version=3', unitData.version === 3, unitData.version)
  check('解析出词汇', (unitData.vocabulary || []).length > 0, (unitData.vocabulary || []).length)
  check('每个词有 id/word/meanings', (unitData.vocabulary || []).every((w) => w.id && w.word && Array.isArray(w.meanings)))
  check('解析出语法点', (unitData.grammarPoints || []).length > 0)
  check('解析出词组', (unitData.phrases || []).length > 0)
  console.log(`        词汇 ${unitData.vocabulary.length} / 语法 ${unitData.grammarPoints.length} / 词组 ${unitData.phrases.length}`)

  section('[4] saveUnit 落库')
  const saved = await study.main({ action: 'saveUnit', articleId, unitData })
  check('saveUnit 返回 0', saved.code === 0, saved.message)
  check('学习单元 version=1', saved.data && saved.data.unit && saved.data.unit.version === 1)
  check('文章不再排队', saved.data && saved.data.article.queued === false)
  const stored = stub.__state.articles.find((item) => item._id === articleId)
  check('unitTotals 已缓存', !!(stored && stored.unitTotals), stored && stored.unitTotals)
  check('unitTotals.vocabulary 对齐', stored && stored.unitTotals.vocabulary === unitData.vocabulary.length)
  check('unitTotals.phrases 对齐', stored && stored.unitTotals.phrases === unitData.phrases.length)
  check('unitTotals.grammarPoints 对齐', stored && stored.unitTotals.grammarPoints === unitData.grammarPoints.length)
  check('unitTotals.drillIds 已去重', stored && Array.isArray(stored.unitTotals.drillIds)
    && new Set(stored.unitTotals.drillIds).size === stored.unitTotals.drillIds.length)
  console.log(`        totals = ${JSON.stringify({ v: stored.unitTotals.vocabulary, g: stored.unitTotals.grammarPoints, p: stored.unitTotals.phrases, d: stored.unitTotals.drillIds.length })}`)

  section('[5] 学习页取数（study.get）')
  const got = await study.main({ action: 'get' })
  check('get 返回 0', got.code === 0, got.message)
  check('取到同一篇文章', got.data && got.data.article && got.data.article._id === articleId)
  check('词汇数量一致', got.data && got.data.article.unitData.vocabulary.length === unitData.vocabulary.length)
  check('进度为空', got.data && (got.data.unit.masteredWords || []).length === 0)

  section('[6] 词卡数据：星级 + 同根 + 形近')
  const words = got.data.article.unitData.vocabulary.map((item) => String(item.word || '').toLowerCase())
  const freqStart = Date.now()
  const freqRes = await analyze.main({ action: 'freqs', words })
  check('freqs 返回 0', freqRes.code === 0, freqRes.message)
  const freqMap = freqRes.data || {}
  const hit = words.filter((word) => freqMap[word])
  check('词库命中率 > 90%', hit.length / words.length > 0.9, `${hit.length}/${words.length}`)
  const withRelated = hit.filter((word) => (freqMap[word].family || []).length || (freqMap[word].similar || []).length)
  check('关联词覆盖率 > 70%', withRelated.length / hit.length > 0.7, `${withRelated.length}/${hit.length}`)
  check('星级是 0-3', hit.every((word) => freqMap[word].freq4 >= 0 && freqMap[word].freq4 <= 3
    && freqMap[word].freq6 >= 0 && freqMap[word].freq6 <= 3))
  check('family/similar 都是数组', hit.every((word) => Array.isArray(freqMap[word].family) && Array.isArray(freqMap[word].similar)))
  check('每条关联词都有 w', hit.every((word) => freqMap[word].family.concat(freqMap[word].similar)
    .every((item) => item && typeof item.w === 'string' && item.w)))
  check('关联词不超过 4 条', hit.every((word) => freqMap[word].family.length <= 4 && freqMap[word].similar.length <= 4))

  const cards = got.data.article.unitData.vocabulary.map((word) => {
    const held = freqMap[String(word.word || '').toLowerCase()] || {}
    return Object.assign({}, word, {
      freq4: held.freq4 || 0,
      freq6: held.freq6 || 0,
      derivatives: mergeRelated(word.derivatives, held.family),
      similar: Array.isArray(held.similar) ? held.similar.slice(0, 4) : []
    })
  })
  check('卡片合并后仍有派生词', cards.some((card) => card.derivatives.length > 0))
  check('卡片形近词生效', cards.some((card) => card.similar.length > 0))
  check('卡片派生词无重复且 ≤4', cards.every((card) => {
    const list = card.derivatives.map((item) => String(item.w || '').toLowerCase())
    return list.length <= 4 && new Set(list).size === list.length
  }))
  const sample = cards.find((card) => card.derivatives.length || card.similar.length)
  if (sample) {
    console.log(`        示例 ${sample.word}: 派生[${sample.derivatives.map((x) => x.w).join(', ')}] 形近[${sample.similar.map((x) => x.w).join(', ')}]`)
  }
  console.log(`        freqs 耗时 ${Date.now() - freqStart}ms，${words.length} 词`)

  section('[6b] 关联词质量守卫')
  const qualityWords = [
    'implementation', 'implant', 'implication', 'create', 'creed',
    'technology', 'technical', 'technique', 'quiet', 'quite', 'nation', 'native', 'academy', 'academic'
  ]
  const quality = (await analyze.main({ action: 'freqs', words: qualityWords })).data || {}
  check('implementation 只并到 implement', relatedWords(quality, 'implementation').includes('implement')
    && !relatedWords(quality, 'implementation').includes('implant')
    && !relatedWords(quality, 'implementation').includes('implicate'), relatedWords(quality, 'implementation'))
  check('implication 不并到 implant', !relatedWords(quality, 'implication').includes('implant'), relatedWords(quality, 'implication'))
  check('create 不并到 creed', !relatedWords(quality, 'create').includes('creed'), relatedWords(quality, 'create'))
  check('technology 关联 technical/technique', relatedWords(quality, 'technology').includes('technical')
    && relatedWords(quality, 'technology').includes('technique'), relatedWords(quality, 'technology'))
  check('quiet 的形近含 quite', similarWords(quality, 'quiet').includes('quite'), similarWords(quality, 'quiet'))
  check('nation 关联 native', relatedWords(quality, 'nation').includes('native'), relatedWords(quality, 'nation'))
  check('academy 关联 academic', relatedWords(quality, 'academy').includes('academic'), relatedWords(quality, 'academy'))

  section('[7] 点亮一半单词，检查题库百分比')
  const half = unitData.vocabulary.slice(0, Math.ceil(unitData.vocabulary.length / 2)).map((item) => item.id)
  const updated = await study.main({
    action: 'update',
    articleId,
    version: 1,
    changes: { masteredWords: half }
  })
  check('update 返回 0', updated.code === 0, updated.message)
  check('version 递增到 2', updated.data && updated.data.version === 2)

  const list1 = await study.main({ action: 'listArticles' })
  check('listArticles 返回 0', list1.code === 0, list1.message)
  const row1 = (list1.data || []).find((item) => item._id === articleId)
  check('列表里有这篇文章', !!row1)
  check('studied=true', row1 && row1.studied === true)
  check('百分比在 1-99 之间', row1 && row1.percent > 0 && row1.percent < 100, row1 && row1.percent)
  check('掌握数与单元一致', row1 && row1.mastered === half.length && row1.vocabulary === words.length)
  console.log(`        学了 ${row1.percent}%（掌握 ${row1.mastered}/${row1.vocabulary}）`)

  section('[8] 点亮全部站点，检查「已学完」')
  const allWords = unitData.vocabulary.map((item) => item.id)
  const allPhrases = unitData.phrases.map((item) => item.id)
  const allGrammar = unitData.grammarPoints.map((item) => item.id)
  const updated2 = await study.main({
    action: 'update',
    articleId,
    version: 2,
    changes: { masteredWords: allWords, phrasesViewed: allPhrases, grammarViewed: allGrammar }
  })
  check('第二次 update 返回 0', updated2.code === 0, updated2.message)
  // 练习记录由判题云函数写入，这里直接补到库里模拟全部通过
  const unitRow = stub.__state.article_units.find((item) => item.articleId === articleId)
  unitRow.practiceRecords = {}
  stored.unitTotals.drillIds.forEach((id) => { unitRow.practiceRecords[id] = { result: 'pass' } })

  const list2 = await study.main({ action: 'listArticles' })
  check('listArticles 返回 0', list2.code === 0, list2.message)
  const row2 = (list2.data || []).find((item) => item._id === articleId)
  check('百分比 100', row2 && row2.percent === 100, row2 && row2.percent)
  console.log(`        已学完（掌握 ${row2.mastered}/${row2.vocabulary}）`)

  section('[9] 导入页先解析、再带着 unitData 入库')
  const text2 = TEXT + '\n\nReading widely also builds patience and strengthens memory over time.'
  const parsed2 = await analyze.main({ text: text2, level: 'cet4' })
  check('第二篇解析成功', parsed2.code === 0 && (parsed2.data.vocabulary || []).length > 0)
  const imported2 = await study.main({
    action: 'importArticle',
    text: text2,
    meta: { level: 'cet4', kind: 'custom', origin: 'import', source: 'e2e-preview' },
    unitData: parsed2.data
  })
  const articleId2 = imported2.data && imported2.data.article && imported2.data.article._id
  check('带解析结果导入返回 0', imported2.code === 0 && !!articleId2, imported2.message)
  check('入库即带 unitData', !!(imported2.data && imported2.data.article.unitData))
  check('入库即缓存 unitTotals', !!(imported2.data && imported2.data.article.unitTotals))
  const opened2 = await study.main({ action: 'openArticle', articleId: articleId2 })
  check('二次打开不再要求解析', opened2.code === 0 && !opened2.data.needsAnalysis, opened2.message)
  check('打开后建立学习单元', opened2.code === 0 && !!opened2.data.unit)

  section('[10] 边界：空词表 / 未知词 / 空正文 / 空单元')
  const empty = await analyze.main({ action: 'freqs', words: [] })
  check('空词表返回空对象', empty.code === 0 && Object.keys(empty.data).length === 0)
  const none = await analyze.main({ action: 'lookup', word: 'zzzzzz' })
  check('不存在的词返回 404', none.code === 404, none.message)
  const noText = await analyze.main({ text: '   ' })
  check('空正文返回 400', noText.code === 400, noText.message)
  const badSave = await study.main({
    action: 'saveUnit',
    articleId,
    unitData: { version: 3, vocabulary: [], grammarPoints: [], phrases: [] }
  })
  check('空单元返回 422', badSave.code === 422, badSave.message)

  section('[11] 小程序页面逻辑（加载真实页面代码，模拟 wx 运行时）')
  const pageConfigs = []
  global.Page = (config) => pageConfigs.push(config)
  global.getApp = () => ({ globalData: {} })
  global.wx = {
    cloud: {
      callFunction({ name, data, success, fail }) {
        // 页面停留时的精讲重试不参与本测试，直接返回成功避免后台任务干扰
        if (data && data.action === 'enhance') return success && success({ result: { code: 0, data: {} } })
        const target = name === 'study' ? study : (name === 'analyzeArticle' ? analyze : null)
        if (!target) return fail && fail({ errMsg: 'no cloud function: ' + name })
        target.main(data)
          .then((result) => success && success({ result }))
          .catch((error) => fail && fail({ errMsg: error.message }))
      }
    },
    getStorageSync() { return '' },
    setStorageSync() {},
    getWindowInfo() { return { windowWidth: 375 } },
    pageScrollTo() {},
    setNavigationBarTitle() {}
  }
  function loadPage(file) {
    delete require.cache[require.resolve(file)]
    require(file)
    return pageConfigs[pageConfigs.length - 1]
  }
  function makePage(config) {
    const page = Object.create(config)
    page.data = JSON.parse(JSON.stringify(config.data))
    page.setData = function (patch) {
      Object.keys(patch || {}).forEach((key) => { this.data[key] = patch[key] })
    }
    return page
  }

  const vocabPage = makePage(loadPage(path.join(ROOT, 'miniprogram/pages/vocabulary/index.js')))
  vocabPage.data.cetTarget = 'cet4'
  vocabPage.data.activeCategory = 'all'
  vocabPage.data.loading = false
  vocabPage.bookWords = new Set()
  vocabPage.freqMap = {}
  vocabPage.expandedIds = new Set()
  vocabPage.applyStudy(got.data)
  await sleep(200)
  check('页面渲染出全部单词', vocabPage.data.words.length === unitData.vocabulary.length, vocabPage.data.words.length)
  check('页面进度 0 / 全部', vocabPage.data.masteredCount === 0
    && vocabPage.data.vocabularyCount === unitData.vocabulary.length)
  check('每张卡都有 derivatives/similar 数组', vocabPage.data.words
    .every((item) => Array.isArray(item.derivatives) && Array.isArray(item.similar)))
  check('页面卡片拿到派生词', vocabPage.data.words.some((item) => item.derivatives.length > 0))
  check('页面卡片拿到形近词', vocabPage.data.words.some((item) => item.similar.length > 0))
  check('星级已贴到卡片上', vocabPage.data.words.some((item) => item.star > 0))
  check('星级文案不缺失', vocabPage.data.words.every((item) => item.star === 0
    || (typeof item.starLabel === 'string' && item.starLabel.length > 0)))

  got.data.unit.masteredWords = half
  vocabPage.applyStudy(got.data)
  check('点亮一半后页面进度 50%', vocabPage.data.masteredCount === half.length
    && vocabPage.data.masteredPercent === 50, `${vocabPage.data.masteredCount}/${vocabPage.data.vocabularyCount}`)
  check('未全亮时不显示下一站', vocabPage.data.nextReady === false)
  console.log(`        页面掌握进度 ${vocabPage.data.masteredCount}/${vocabPage.data.vocabularyCount}，${vocabPage.data.masteredPercent}%`)

  const listForLib = await study.main({ action: 'listArticles' })
  const libPage = makePage(loadPage(path.join(ROOT, 'miniprogram/pages/library/index.js')))
  libPage.data.level = 'cet4'
  libPage.data.source = 'imported'
  libPage.data.yearFilter = 'all'
  libPage.applyMine('cet4', listForLib.data || [])
  const libReal = (libPage.data.real || []).find((item) => item._id === articleId)
  const libImported = (libPage.data.imported || []).find((item) => item._id === articleId2)
  check('真题列表显示「已学完」', !!libReal && libReal.progressLabel === '已学完' && libReal.progressDone === true,
    libReal && libReal.progressLabel)
  check('导入列表未学不显示标记', !!libImported && libImported.progressLabel === '',
    libImported && libImported.progressLabel)

  section('[12] 老文章进度回填（unitTotals 缺失）')
  const legacyData = {
    version: 3,
    vocabulary: [1, 2, 3, 4].map((n) => ({ id: `lv${n}`, word: `legacy${n}`, meanings: [] })),
    grammarPoints: [
      { id: 'lg1', drills: [{ id: 'ld1', mode: 'translate', prompt: 'one' }, { id: 'ld2', mode: 'translate', prompt: 'two' }] },
      { id: 'lg2', drills: [{ id: 'ld3', mode: 'translate', prompt: 'three' }] }
    ],
    phrases: [{ id: 'lp1' }, { id: 'lp2' }]
  }
  const legacyArticle = {
    _id: 'art_legacy_e2e',
    openid: 'test-openid',
    isDemo: false,
    queued: false,
    title: 'Legacy Article',
    level: 'cet4',
    kind: 'custom',
    origin: 'import',
    year: 2024,
    month: 6,
    paper: 1,
    passage: 1,
    wordCount: 100,
    createdAt: new Date('2024-06-01T00:00:00Z'),
    unitData: legacyData
  }
  const untouchedArticle = {
    _id: 'art_legacy_untouched',
    openid: 'test-openid',
    isDemo: false,
    queued: false,
    title: 'Untouched Legacy',
    level: 'cet4',
    kind: 'custom',
    origin: 'import',
    year: 2024,
    month: 6,
    paper: 2,
    passage: 1,
    wordCount: 100,
    createdAt: new Date('2024-06-02T00:00:00Z'),
    unitTotals: { vocabulary: 4, grammarPoints: 2, phrases: 2, drillIds: ['ld1', 'ld2', 'ld3'] }
  }
  const legacyUnit = {
    _id: 'unit_legacy_e2e',
    articleId: 'art_legacy_e2e',
    openid: 'test-openid',
    version: 1,
    masteredWords: ['lv1', 'lv2', 'lv3', 'lv4'],
    grammarViewed: ['lg1', 'lg2'],
    phrasesViewed: ['lp1', 'lp2'],
    practiceRecords: {}
  }
  stub.__state.articles.push(legacyArticle, untouchedArticle)
  stub.__state.article_units.push(legacyUnit)

  const list3 = await study.main({ action: 'listArticles' })
  check('老文章能读出进度', list3.code === 0, list3.message)
  const legacyRow = (list3.data || []).find((item) => item._id === 'art_legacy_e2e')
  const untouchedRow = (list3.data || []).find((item) => item._id === 'art_legacy_untouched')
  check('老文章按四站口径算出 75%', legacyRow && legacyRow.percent === 75, legacyRow && legacyRow.percent)
  check('老文章 studied=true', legacyRow && legacyRow.studied === true)
  check('未学老文章不显示标记', untouchedRow && untouchedRow.studied === false && untouchedRow.percent === 0,
    untouchedRow && untouchedRow.percent)
  check('unitTotals 已回写数据库', !!(legacyArticle.unitTotals && legacyArticle.unitTotals.vocabulary === 4
    && legacyArticle.unitTotals.drillIds.length === 3), legacyArticle.unitTotals)

  console.log(`\n${failed ? `❌ ${failed} 项失败 / ${passed} 项通过` : `✅ 全部通过（${passed} 项）`}`)
  process.exit(failed ? 1 : 0)
}

main().catch((error) => {
  console.error('\n脚本异常：', error && (error.stack || error.message || error))
  process.exit(1)
})
