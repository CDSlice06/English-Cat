// 全链路回归脚本：导入 → 打开 → 解析 → 保存单元 → 学习页取数 → 星级/同根/形近
// → 点亮 → 题库进度/「已学完」→ 页面逻辑 → 老文章进度回填 → 边界情况。
//
// 用法：node tests/e2e.js
// 说明：用内存数据库桩加载真实云函数与真实页面 JS（模拟 wx 运行时），
// 不依赖微信开发者工具、云环境或大模型。改完云函数或页面逻辑后直接重跑即可。
const path = require('path')
const fs = require('fs')
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

// 与 miniprogram/pkgWords/pages/vocabulary/index.js 保持一致的合并逻辑
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
    // 四站进度用内置题库口径测；导入/外刊的阅读口径在 [16] 单独测
    meta: { level: 'cet4', kind: 'real', year: 2025, month: 12, paper: 1, passage: 1, origin: 'exam', source: 'e2e' }
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

  section('[6c] 词根 / 易混 / 派生权威数据')
  const diversion = (await analyze.main({ action: 'lookup', word: 'diversion' })).data || {}
  check('diversion 有词根', !!(diversion.root && diversion.root.form), diversion.root)
  check('diversion 词根释义为「转」', !!(diversion.root && diversion.root.meaning === '转'))
  check('diversion 有构词拆解', !!(diversion.root && diversion.root.build && diversion.root.build.indexOf('vers') >= 0), diversion.root && diversion.root.build)
  check('diversion 核心义已给出', !!(diversion.root && diversion.root.core), diversion.root && diversion.root.core)
  check('diversion 同根词含 divert', !!(diversion.root && diversion.root.family.indexOf('divert') >= 0), diversion.root && diversion.root.family)

  const authorityMap = (await analyze.main({
    action: 'freqs',
    words: ['diversion', 'divert', 'affect', 'effect']
  })).data || {}
  check('freqs 带回词根', !!(authorityMap.diversion && authorityMap.diversion.root))
  check('divert 的派生能查回 diversion', relatedWords(authorityMap, 'divert').includes('diversion'), relatedWords(authorityMap, 'divert'))
  check('affect 的易混含 effect', ((authorityMap.affect || {}).confusables || []).some((item) => item.w === 'effect'))
  check('易混条目带辨析文案', ((authorityMap.affect || {}).confusables || []).some((item) => item.note && item.note.length > 10))
  check('effect 反向登记 affect', ((authorityMap.effect || {}).confusables || []).some((item) => item.w === 'affect'))

  const include = (await analyze.main({ action: 'lookup', word: 'include' })).data || {}
  check('include 有词根 clud/clus', !!(include.root && include.root.form.indexOf('clud') >= 0), include.root && include.root.form)
  const suggest = (await analyze.main({ action: 'lookup', word: 'suggest' })).data || {}
  check('suggest 构词含 gest', !!(suggest.root && suggest.root.build && suggest.root.build.indexOf('gest') >= 0), suggest.root && suggest.root.build)
  const president = (await analyze.main({ action: 'lookup', word: 'president' })).data || {}
  check('president 词根为「坐」', !!(president.root && president.root.meaning === '坐'), president.root && president.root.meaning)
  const invasion = (await analyze.main({ action: 'lookup', word: 'invasion' })).data || {}
  check('invasion 有词根 vad/vas', !!(invasion.root && invasion.root.form.indexOf('vad') >= 0), invasion.root && invasion.root.form)
  const attempt = (await analyze.main({ action: 'lookup', word: 'attempt' })).data || {}
  check('attempt 构词含 tempt', !!(attempt.root && attempt.root.build && attempt.root.build.indexOf('tempt') >= 0), attempt.root && attempt.root.build)
  const surprise = (await analyze.main({ action: 'lookup', word: 'surprise' })).data || {}
  check('surprise 词根为「抓、握」', !!(surprise.root && surprise.root.meaning === '抓、握'), surprise.root && surprise.root.meaning)
  const confident = (await analyze.main({ action: 'lookup', word: 'confident' })).data || {}
  check('confident 词根为「信任」', !!(confident.root && confident.root.meaning === '信任'), confident.root && confident.root.meaning)

  section('[6d] 词库扩容：派生词与拼写纠正')
  const popularization = (await analyze.main({ action: 'lookup', word: 'popularization' })).data || {}
  check('popularization 有名词释义', popularization.meanings.length > 0 && popularization.meanings[0].pos === 'n.', popularization.meanings)
  const popularize = (await analyze.main({ action: 'lookup', word: 'popularize' })).data || {}
  check(
    'popularize 能带出 popularization',
    (popularize.derivatives || []).some((item) => item.w === 'popularization'),
    popularize.derivatives
  )
  const typoWord = (await analyze.main({ action: 'lookup', word: 'popularizaion' })).data || {}
  check(
    'popularizaion 能纠正成 popularization 并给出释义',
    typoWord.word === 'popularization' && typoWord.meanings.length > 0,
    typoWord
  )
  const offerings = (await analyze.main({ action: 'lookup', word: 'offerings' })).data || {}
  check('offerings 能按名词给出释义', offerings.meanings.length > 0, offerings.meanings)
  const curricula = (await analyze.main({ action: 'lookup', word: 'curricula' })).data || {}
  check('curricula 能还原到 curriculum', curricula.word === 'curriculum', curricula.word)

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
        const target = name === 'study' ? study
          : (name === 'analyzeArticle' ? analyze
            : (name === 'journal' ? require(path.join(ROOT, 'cloud/journal/index.js')) : null))
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
    setNavigationBarTitle() {},
    // 页面里的点击音效与单词朗读：测试环境没有音频，用空播放器并记录播放次数
    audioPlays: 0,
    createInnerAudioContext() {
      return {
        obeyMuteSwitch: true,
        stop() {},
        play() { global.wx.audioPlays += 1 },
        onError() {},
        onPlay() {},
        onEnded() {}
      }
    }
  }
  function loadPage(file) {
    delete require.cache[require.resolve(file)]
    require(file)
    return pageConfigs[pageConfigs.length - 1]
  }
  function makePage(config) {
    const page = Object.create(config)
    page.data = JSON.parse(JSON.stringify(config.data))
    page.setData = function (patch, done) {
      Object.keys(patch || {}).forEach((key) => { this.data[key] = patch[key] })
      // 页面常用 setData 的回调接下一步（例如切词卡），测试里同步执行
      if (typeof done === 'function') done()
    }
    return page
  }

  const vocabPage = makePage(loadPage(path.join(ROOT, 'miniprogram/pkgWords/pages/vocabulary/index.js')))
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
  libPage.applyMine('cet4', listForLib.data || [])
  const libStudied = (libPage.data.imported || []).find((item) => item._id === articleId)
  const libFresh = (libPage.data.imported || []).find((item) => item._id === articleId2)
  check('我的导入里显示「已学完」', !!libStudied && libStudied.progressLabel === '已学完' && libStudied.progressDone === true,
    libStudied && libStudied.progressLabel)
  check('导入列表未学不显示标记', !!libFresh && libFresh.progressLabel === '',
    libFresh && libFresh.progressLabel)

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
    origin: 'exam',
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
    origin: 'exam',
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

  section('[13] 外刊数据与题库入口收敛')
  const journalService = require(path.join(ROOT, 'miniprogram/services/journals.js'))
  const jlist = await journalService.listJournals()
  check('外刊清单非空', jlist.length >= 20, jlist.length)
  check('每条都带出处与许可', jlist.every((item) => !!item.source && !!item.sourceUrl
    && !!item.license && !!item.date && !!item.topic && item.words > 0))
  check('清单按日期倒序', jlist.every((item, i) => i === 0 || jlist[i - 1].date >= item.date))
  check('清单不带正文', jlist.every((item) => item.text === undefined))
  check('id 不重复', new Set(jlist.map((item) => item.id)).size === jlist.length)
  check('标题不重复', new Set(jlist.map((item) => item.title)).size === jlist.length)
  const cet4Journals = await journalService.listJournals('cet4')
  check('按级别筛外刊', cet4Journals.length > 0
    && cet4Journals.every((item) => item.level === 'cet4'))
  const tem4Journals = await journalService.listJournals('tem4')
  const tem8Journals = await journalService.listJournals('tem8')
  check('专四档有文章且级别一致', tem4Journals.length > 0
    && tem4Journals.every((item) => item.level === 'tem4'), tem4Journals.length)
  check('专八档有文章且级别一致', tem8Journals.length > 0
    && tem8Journals.every((item) => item.level === 'tem8'), tem8Journals.length)
  check('四档都有文章', ['cet4', 'cet6', 'tem4', 'tem8']
    .every((key) => jlist.some((item) => item.level === key)),
  [...new Set(jlist.map((item) => item.level))])
  const oneJournal = await journalService.getJournal(jlist[0].id)
  check('journal 取到正文', oneJournal.text.length > 200, oneJournal.id)
  check('正文词数与清单一致',
    (oneJournal.text.match(/[A-Za-z][A-Za-z'-]*/g) || []).length === oneJournal.words)
  const missingJournal = await journalService.getJournal('nope').then(() => '', (error) => error.message)
  check('不存在的外刊给出提示', missingJournal.indexOf('不存在') >= 0, missingJournal)

  const dayTime = new Date(2026, 10, 14).getTime()
  check('同一天取同一篇', journalService.pickDaily(jlist, dayTime).id === journalService.pickDaily(jlist, dayTime).id)
  check('隔天换下一篇', jlist.length < 2
    || journalService.pickDaily(jlist, dayTime + 86400000).id !== journalService.pickDaily(jlist, dayTime).id)
  check('空清单返回 null', journalService.pickDaily([], dayTime) === null)

  // 外刊统一走独立导航栏，题库不再保留外刊分类与入口
  check('题库页不再有外刊分类', libPage.data.journals === undefined
    && typeof libPage.loadJournals !== 'function')
  libPage.applyMine('cet4', [
    { _id: 'a1', title: '导入的社论', level: 'cet4', origin: 'import', words: 300 },
    { _id: 'a2', title: '外刊一篇', level: 'cet4', origin: 'journal', words: 500 }
  ])
  check('外刊不混进我的导入', libPage.data.imported.length === 1
    && libPage.data.imported[0]._id === 'a1', libPage.data.imported.map((item) => item._id))

  section('[13b] 外刊独立导航页')
  const appJson = require(path.join(ROOT, 'miniprogram/app.json'))
  const tabTexts = appJson.tabBar.list.map((item) => item.text)
  check('外刊导航在学习右边', tabTexts.join(',') === '首页,学习,外刊,我的', tabTexts)
  check('外刊页已注册', appJson.pages.indexOf('pages/journal/index') >= 0)
  const journalPage = makePage(loadPage(path.join(ROOT, 'miniprogram/pages/journal/index.js')))
  journalPage.all = jlist
  journalPage.progressMap = {}
  journalPage.apply()
  check('外刊页默认混排所有级别', journalPage.data.level === 'all'
    && new Set(journalPage.data.journals.map((item) => item.level)).size > 1,
  journalPage.data.journals.map((item) => item.level))
  check('外刊页有今日推荐', !!journalPage.data.today
    && jlist.some((item) => item.id === journalPage.data.today.id))
  check('今日推荐不在列表里重复', !journalPage.data.journals
    .some((item) => item.id === journalPage.data.today.id)
    && journalPage.data.journals.length === jlist.length - 1)
  check('外刊页每篇带日期与预计时长', journalPage.data.journals
    .every((item) => !!item.dateLabel && item.minutes >= 1))
  const journalCards = journalPage.data.today ? [journalPage.data.today].concat(journalPage.data.journals) : journalPage.data.journals
  check('每篇外刊都有中文导读和封面', journalCards.length >= 20
    && journalCards.every((item) => !!item.zhTitle && !!item.summary && !!item.cover),
  journalCards.filter((item) => !item.zhTitle || !item.summary || !item.cover).map((item) => item.id))
  // 封面托管在云存储，仓库里保留一份上传源文件，避免清单指向不存在的图
  check('云封面都有对应的上传文件', journalCards.every((item) => {
    const cover = String(item.cover || '')
    if (!/^cloud:\/\/[^/]+\/journal-covers\/journal-\d{3}\.jpg$/.test(cover)) return false
    return fs.existsSync(path.join(ROOT, 'journal-covers', cover.replace(/^cloud:\/\/[^/]+\/journal-covers\//, '')))
  }), journalCards.filter((item) => !/^cloud:\/\//.test(item.cover || '')).map((item) => item.cover))
  check('回退封面随包内置且文件存在', journalCards.every((item) =>
    /^\/assets\/journal\/[\w-]+\.jpg$/.test(item.fallbackCover || '')
    && fs.existsSync(path.join(ROOT, 'miniprogram', item.fallbackCover))),
  journalCards.filter((item) => !fs.existsSync(path.join(ROOT, 'miniprogram', item.fallbackCover || ''))).map((item) => item.fallbackCover))

  // 分享链路：只带外刊 id，标题带级别和词数，好友点开会落到同一篇
  const shareToday = journalPage.data.today
  const todayShare = journalPage.onShareAppMessage({ target: { dataset: { id: shareToday.id } } })
  check('分享路径带外刊 id', todayShare.path === `/pages/journal/index?journal=${shareToday.id}`, todayShare.path)
  check('分享标题带中文标题与词数', todayShare.title.indexOf(shareToday.zhTitle) >= 0
    && todayShare.title.indexOf(`${shareToday.words} 词`) >= 0, todayShare.title)
  check('云封面不可用时退回包内封面', /^\/assets\/journal\/[\w-]+\.jpg$/.test(todayShare.imageUrl || ''),
    todayShare.imageUrl)
  const listShare = journalPage.onShareAppMessage({ target: { dataset: { id: journalPage.data.journals[0].id } } })
  check('列表卡片能分享对应那一篇',
    listShare.path === `/pages/journal/index?journal=${journalPage.data.journals[0].id}`, listShare.path)
  const timelineShare = journalPage.onShareTimeline()
  check('朋友圈分享只带外刊 id', timelineShare.query === `journal=${shareToday.id}`, timelineShare.query)

  section('[14] 背词模式：四环节依次推进 + 环节末尾补考')
  const memPage = makePage(loadPage(path.join(ROOT, 'miniprogram/pkgWords/pages/memorize/index.js')))
  const wordbookService = require(path.join(ROOT, 'miniprogram/services/wordbook.js'))
  const sentencesService = require(path.join(ROOT, 'miniprogram/services/sentences.js'))
  const originSetState = wordbookService.setState
  const originList = wordbookService.list
  const originSentenceApis = {
    get: sentencesService.get,
    getZh: sentencesService.getZh,
    prefetch: sentencesService.prefetch,
    contains: sentencesService.contains
  }
  const marked = []
  wordbookService.setState = (id, state) => {
    marked.push(`${id}:${state}`)
    return Promise.resolve({ id, state })
  }
  // 例句换成可控桩：每个词都有一句带中文的例句，语境填词才有中文可看
  sentencesService.get = (word) => `I feel ${word} today.`
  sentencesService.getZh = (word) => `我今天感到${word}。`
  sentencesService.prefetch = () => Promise.resolve()
  sentencesService.contains = (sentence, word) => String(sentence || '').toLowerCase()
    .indexOf(String(word || '').toLowerCase()) >= 0
  const memWord = (id, word, definition) => ({
    id,
    word,
    phonetic: '',
    state: 'unknown',
    meanings: [{ pos: 'adj.', definition }]
  })
  const memWords = [
    memWord('m1', 'cognitive', '认知的'),
    memWord('m2', 'reluctant', '勉强的'),
    memWord('m3', 'diverse', '多样的'),
    memWord('m4', 'fragile', '易碎的'),
    memWord('m5', 'eager', '渴望的'),
    memWord('m6', 'fluent', '流利的')
  ]
  const memPools = (list) => ({
    word: {
      pool: list,
      unknownCount: list.length,
      skipped: 0,
      totalCount: list.length,
      choicePool: list
    },
    phrase: { pool: [], unknownCount: 0, skipped: 0, totalCount: 0, choicePool: [] }
  })
  // 这一节要真的持久化会话与练习量，换成内存存储
  const memStore = {}
  const originGetStorage = wx.getStorageSync
  const originSetStorage = wx.setStorageSync
  wx.getStorageSync = (key) => (memStore[key] === undefined ? '' : memStore[key])
  wx.setStorageSync = (key, value) => { memStore[key] = value }

  memPage.pools = memPools(memWords)
  memPage.setData({ tab: 'word' }, () => memPage.startRoundFor('word'))

  const queue = memPage.data.queue
  const stageKeys = ['read', 'listen', 'cloze', 'spell']
  check('四个环节各出一道，整组词都排进队列', queue.length === 24, queue.length)
  check('环节按固定顺序排开', stageKeys.every((key, i) =>
    queue.slice(i * 6, i * 6 + 6).every((task) => task.key === key)),
  queue.map((task) => task.key).join(','))
  check('每个环节覆盖整组词', stageKeys.every((key) => {
    const ids = queue.filter((task) => task.key === key).map((task) => task.item.id)
    return ids.length === 6 && new Set(ids).size === 6
  }))
  check('先出看词选义，不直接给答案',
    memPage.data.stageKey === 'read' && memPage.data.phase === 'choice' && memPage.data.mode === 'read',
    `${memPage.data.stageKey}/${memPage.data.phase}/${memPage.data.mode}`)
  check('四个选项只有一个正确',
    memPage.data.options.length === 4
    && memPage.data.options.filter((option) => option.correct).length === 1)
  check('释义按词性分行，词性不带双点',
    memPage.data.options.every((option) => option.lines.length >= 1
      && option.lines.every((line) => line.pos.indexOf('..') < 0)),
    JSON.stringify(memPage.data.options[0].lines))
  check('干扰项优先同词性，不能靠长相猜',
    memPage.data.options.every((option) => option.lines.some((line) => line.pos === 'adj.')),
    JSON.stringify(memPage.data.options.map((option) => option.lines.map((line) => line.pos))))

  // 四个环节各挑一个词故意答错一次，其余都答对，走完一整轮
  const wrongTargets = { read: 'm1', listen: 'm2', cloze: 'm3', spell: 'm4' }
  const stageOrder = { read: 0, listen: 1, cloze: 2, spell: 3 }
  const sequence = []
  const retryIndex = {}
  const observed = {}
  let listenChecked = false
  let markedAtFirstSpell = null
  let steps = 0
  while (!memPage.data.done && steps < 120) {
    steps += 1
    const task = memPage.data.queue[memPage.data.index]
    if (!task) break
    sequence.push(task.key)
    if (task.retry && retryIndex[task.key] === undefined) retryIndex[task.key] = sequence.length - 1
    if (task.key === 'spell' && markedAtFirstSpell === null) markedAtFirstSpell = marked.length
    if (task.key === 'listen' && !listenChecked) {
      listenChecked = true
      observed.listenPlayed = wx.audioPlays > 0
    }
    const shouldWrong = wrongTargets[task.key] === task.item.id && !task.retry
    if (task.key === 'read') {
      const wrongIndex = memPage.data.options.findIndex((option) => !option.correct)
      memPage.pickOption({
        currentTarget: { dataset: { index: shouldWrong ? wrongIndex : memPage.data.answerIndex } }
      })
      if (!observed.readEnter) observed.readEnter = memPage.data.phase
      if (shouldWrong) {
        observed.readWrong = { phase: memPage.data.phase, detailWrong: memPage.data.detailWrong }
      }
      memPage.closeDetail()
      await sleep(5)
      continue
    }
    if (task.key === 'spell') {
      if (!observed.spell) {
        observed.spell = {
          cells: memPage.data.cells.length,
          letters: String(memPage.data.current.word).replace(/[^a-zA-Z]/g, '').length
        }
      }
      memPage.setData({ input: shouldWrong ? 'zzzz' : memPage.data.current.word })
      memPage.submitSpell()
      if (shouldWrong) {
        observed.spellWrong = { phase: memPage.data.phase, label: memPage.data.resultLabel }
        memPage.next()
      }
      await sleep(5)
      continue
    }
    // 听音选义 / 语境填词：四选一
    if (task.key === 'cloze' && !observed.cloze) {
      observed.cloze = {
        phase: memPage.data.phase,
        sentence: memPage.data.sentence,
        zh: memPage.data.sentenceZh,
        options: (memPage.data.options || []).length
      }
    }
    const wrongIndex = memPage.data.options.findIndex((option) => !option.correct)
    memPage.pickOption({
      currentTarget: { dataset: { index: shouldWrong ? wrongIndex : memPage.data.answerIndex } }
    })
    if (shouldWrong) {
      await sleep(1150)
      if (!observed.feedback) {
        observed.feedback = { phase: memPage.data.phase, label: memPage.data.resultLabel }
      }
      memPage.next()
    } else {
      await sleep(420)
    }
  }
  await sleep(20)

  check('走完四个环节后进入完成态', memPage.data.done === true && memPage.data.percent === 100,
    `${memPage.data.done}/${memPage.data.percent}`)
  check('环节顺序不倒退', sequence.every((key, i) => i === 0 || stageOrder[key] >= stageOrder[sequence[i - 1]]),
    sequence.join(','))
  check('每个环节答错的词都在本环节最后补考', stageKeys.every((key) =>
    retryIndex[key] !== undefined && sequence.lastIndexOf(key) === retryIndex[key]),
  JSON.stringify(retryIndex))
  check('看词选义答对也先看详情', observed.readEnter === 'detail', observed.readEnter)
  check('看词选义答错进详情页标红', !!observed.readWrong
    && observed.readWrong.phase === 'detail' && observed.readWrong.detailWrong === true, observed.readWrong)
  check('听音选义一进来先读一遍', observed.listenPlayed === true)
  check('语境填词挖空并带中文意思', !!observed.cloze
    && observed.cloze.phase === 'cloze'
    && observed.cloze.sentence.indexOf('_____') >= 0
    && observed.cloze.zh.indexOf('我今天感到') === 0
    && observed.cloze.options === 4, observed.cloze)
  check('听音、语境答错先停在反馈页', !!observed.feedback
    && observed.feedback.phase === 'feedback' && observed.feedback.label === '这一步答错了', observed.feedback)
  check('看义拼写按字母数给格子', !!observed.spell && observed.spell.cells === observed.spell.letters,
    observed.spell)
  check('拼错先停在反馈页', !!observed.spellWrong
    && observed.spellWrong.phase === 'feedback' && observed.spellWrong.label === '这一步答错了',
  observed.spellWrong)
  check('拼写之前不会提前标记得', markedAtFirstSpell === 0, markedAtFirstSpell)
  check('四环节全过才算过', memPage.data.passedCount === 6, memPage.data.passedCount)
  check('四环节全过才从「不记得」转成「记得」',
    marked.length === 6 && marked.every((entry) => entry.slice(-6) === ':known'), marked.join(','))
  check('一次过与补考分开统计', memPage.data.stats.words === 6 && memPage.data.stats.firstTry === 2
    && memPage.data.stats.retried === 4, JSON.stringify(memPage.data.stats))
  check('同一天同一个词只记一次练习量', memPage.data.todayWords === 6, memPage.data.todayWords)
  check('本轮会话已清空', !(memStore.memorizeSession && memStore.memorizeSession.word),
    memStore.memorizeSession)
  memPage.counted = {}
  memPage.completeWord(memWords[0])
  check('同一个词一天练两遍也不重复计数', memPage.data.todayWords === 6, memPage.data.todayWords)

  // 中途退出再回来：接着原来那道题，补考标记不能丢
  memPage.setData({ tab: 'word' }, () => memPage.startRoundFor('word'))
  const pendingWord = memPage.data.current
  memPage.pickOption({
    currentTarget: { dataset: { index: memPage.data.options.findIndex((option) => !option.correct) } }
  })
  memPage.closeDetail()
  check('答错后先往下走，补考留到环节末尾', memPage.data.index === 1, memPage.data.index)
  memPage.saveSession()
  const savedSession = memStore.memorizeSession && memStore.memorizeSession.word
  check('会话保存题目位置与错题标记', !!savedSession && savedSession.index === 1
    && savedSession.failed[pendingWord.id] === true && savedSession.queue.length === 24,
  savedSession && { index: savedSession.index, failed: savedSession.failed })
  const memResumed = makePage(loadPage(path.join(ROOT, 'miniprogram/pkgWords/pages/memorize/index.js')))
  memResumed.pools = memPools(memWords)
  memResumed.setData({ tab: 'word' }, () => memResumed.startRoundFor('word'))
  check('重新进来接着上次这道题', memResumed.data.index === 1 && memResumed.data.queue.length === 24,
    `${memResumed.data.index}/${memResumed.data.queue.length}`)
  check('错题标记恢复后不会提前算一次过', !!memResumed.failed && memResumed.failed[pendingWord.id] === true)

  // 多义词：选项里每个词性最多 5 个义项，拼写提示保留完整释义
  const multi = {
    id: 'm7',
    word: 'regard',
    phonetic: '',
    state: 'unknown',
    meanings: [
      { pos: 'n.', definition: '关心, 注意, 尊敬, 关系, 问候, 尊重, 凝视, 致意' },
      { pos: 'v.', definition: '视为, 注意, 考虑, 看待' }
    ]
  }
  memPage.choicePool = memWords.concat([multi])
  memPage.setData({
    queue: [{ item: multi, key: 'read', done: false, wrong: false }],
    total: 1,
    index: 0,
    done: false,
    passedCount: 0,
    knownCount: 0
  }, () => memPage.buildQuestion())
  const multiCorrect = memPage.data.options.find((option) => option.correct)
  check('多义词选项按词性分行', multiCorrect.lines.length === 2
    && multiCorrect.lines[0].pos === 'n.' && multiCorrect.lines[1].pos === 'v.',
  JSON.stringify(multiCorrect.lines))
  check('义项过多收敛到 5 个', multiCorrect.lines[0].def === '关心、注意、尊敬、关系、问候等',
    multiCorrect.lines[0].def)
  check('释义里的逗号排成顿号', multiCorrect.lines[0].def.indexOf(',') < 0, multiCorrect.lines[0].def)
  check('拼写提示保留完整释义', memPage.data.meaningLines[0].def.indexOf('问候') > 0,
    memPage.data.meaningLines[0].def)

  // 恢复真实存储与例句服务，下面的词库口径用例继续用
  wx.getStorageSync = originGetStorage
  wx.setStorageSync = originSetStorage
  sentencesService.get = originSentenceApis.get
  sentencesService.getZh = originSentenceApis.getZh
  sentencesService.prefetch = originSentenceApis.prefetch
  sentencesService.contains = originSentenceApis.contains
  wordbookService.list = originList
  wordbookService.setState = originSetState

  // 词库口径：单词这一类只取生词本的单词，词组归到「词组」那一类
  wordbookService.list = () => Promise.resolve({
    items: [
      memWord('a', 'alpha', '第一个'),
      memWord('b', 'beta', '第二个'),
      { id: 'c', word: 'gamma', state: 'unknown', meanings: [] }
    ],
    phraseItems: [{ id: 'p1', word: 'forge ahead', state: 'unknown', meanings: [{ pos: 'phr.', definition: '前进' }] }]
  })
  memPage.load()
  await sleep(20)
  check('可选数量只算单词，不含词组', memPage.data.poolSize === 2, memPage.data.poolSize)
  check('缺释义的词标出来，不参与这一轮', memPage.data.skipped === 1, memPage.data.skipped)
  check('「不记得」总数按生词本口径', memPage.data.unknownCount === 3, memPage.data.unknownCount)

  // 词组单独一类，切过去就只练词组
  check('单词、词组分开计数', memPage.data.tabCounts.word === 3 && memPage.data.tabCounts.phrase === 1,
    JSON.stringify(memPage.data.tabCounts))
  memPage.switchTab({ currentTarget: { dataset: { tab: 'phrase' } } })
  check('切到词组只练词组', memPage.data.tab === 'phrase' && memPage.data.total === 1
    && memPage.data.poolSize === 1, `${memPage.data.tab}/${memPage.data.total}/${memPage.data.poolSize}`)
  check('词组题照常出释义选项', (memPage.data.options || []).some((option) => option.correct))
  memPage.switchTab({ currentTarget: { dataset: { tab: 'word' } } })
  check('切回单词恢复单词池', memPage.data.tab === 'word' && memPage.data.poolSize === 2, memPage.data.poolSize)

  // 语法卡相关用例见 [15]，这里只保留复习状态工具给下面用
  const reviewService = require(path.join(ROOT, 'miniprogram/services/review'))
  wordbookService.list = originList
  wordbookService.setState = originSetState

  // 每组数量可以自己填，也能加减，偏好存本地
  const sizeStore = {}
  const originGet = wx.getStorageSync
  const originSet = wx.setStorageSync
  wx.getStorageSync = (key) => (key === 'memorizeSize'
    ? (sizeStore[key] === undefined ? '' : sizeStore[key])
    : '')
  wx.setStorageSync = (key, value) => { sizeStore[key] = value }
  const many = Array.from({ length: 26 }, (value, i) => ({
    id: 's' + i,
    word: 'sample' + i,
    phonetic: '',
    state: 'unknown',
    meanings: [{ pos: 'n.', definition: '词义' + i }]
  }))
  memPage.pool = many
  memPage.choicePool = many
  memPage.startRound(many, 0, many.length)
  check('默认每组 20 个', memPage.data.total === 20 && memPage.data.roundSize === 20, String(memPage.data.total))
  memPage.setSize({ detail: { value: '12' } })
  check('可以自己填每组 12 个', memPage.data.total === 12 && memPage.data.roundSize === 12, String(memPage.data.total))
  check('数量偏好写到本地', sizeStore.memorizeSize === 12, String(sizeStore.memorizeSize))
  memPage.stepSize({ currentTarget: { dataset: { step: 5 } } })
  check('加减键按 5 个一档调', memPage.data.total === 17, String(memPage.data.total))
  memPage.setSize({ detail: { value: '500' } })
  check('数量上限是 100，词不够时有几个练几个',
    memPage.data.roundSize === 100 && memPage.data.total === 26,
    `${memPage.data.roundSize}/${memPage.data.total}`)
  memPage.stepSize({ currentTarget: { dataset: { step: 5 } } })
  check('到上限再点加号仍是 100', memPage.data.roundSize === 100, String(memPage.data.roundSize))
  memPage.setSize({ detail: { value: '1' } })
  check('填得太小按最少 5 个', memPage.data.roundSize === 5, String(memPage.data.roundSize))
  memPage.stepSize({ currentTarget: { dataset: { step: -5 } } })
  check('到下限再点减号仍是 5，不跳回默认值',
    memPage.data.roundSize === 5 && memPage.data.total === 5,
    `${memPage.data.roundSize}/${memPage.data.total}`)
  memPage.startRound(many, 0, many.length)
  check('重新分组沿用上次的数量', memPage.data.total === 5, String(memPage.data.total))
  wx.getStorageSync = originGet
  wx.setStorageSync = originSet

  // 语法卡三档自评要能被语法本读到，否则点了「不认识」像没发生过
  section('[15] 语法卡三档自评落到语法本')
  const GRAMMAR_OPTIONS = { logKey: 'grammarReviewLog', sync: false }
  const cardId = 'grammar-card-1'
  // 这一节要真的读写本地存储，换成内存版
  const localStore = {}
  const plainGet = wx.getStorageSync
  const plainSet = wx.setStorageSync
  wx.getStorageSync = (key) => (localStore[key] === undefined ? '' : localStore[key])
  wx.setStorageSync = (key, value) => { localStore[key] = value }
  check('没复习过的卡是待复习', reviewService.stateOf(cardId, GRAMMAR_OPTIONS) === '')
  const afterUnknown = reviewService.advance(cardId, { stage: 2, due: 0, streak: 0 }, 'unknown', GRAMMAR_OPTIONS)
  check('点「不认识」后语法本读到不认识', reviewService.stateOf(cardId, GRAMMAR_OPTIONS) === 'unknown')
  const afterFuzzy = reviewService.advance(cardId, afterUnknown, 'fuzzy', GRAMMAR_OPTIONS)
  check('再点「模糊」会覆盖上一次', reviewService.stateOf(cardId, GRAMMAR_OPTIONS) === 'fuzzy')
  const afterKnown = reviewService.advance(cardId, afterFuzzy, 'known', GRAMMAR_OPTIONS)
  check('点「认识」后语法本读到认识', reviewService.stateOf(cardId, GRAMMAR_OPTIONS) === 'known')
  check('不认识的卡退档，认识的卡按曲线排', afterUnknown.stage < 2 && afterKnown.due > 0)
  wx.getStorageSync = plainGet
  wx.setStorageSync = plainSet

  section('[16] 外刊：阅读优先进度')
  const readingImport = await study.main({
    action: 'importArticle',
    text: TEXT,
    meta: { level: 'cet4', kind: 'journal', origin: 'journal', source: 'e2e-reading' },
    unitData: parsed.data
  })
  const readingId = readingImport.data && readingImport.data.article && readingImport.data.article._id
  check('外刊可建立阅读单元', readingImport.code === 0 && !!readingId)
  const currentBeforeRead = await study.main({ action: 'get' })
  const currentIdBeforeRead = currentBeforeRead.data && currentBeforeRead.data.article && currentBeforeRead.data.article._id
  const openedReading = await study.main({ action: 'read', articleId: readingId })
  check('外刊按 id 打开后直接有单元', openedReading.code === 0 && !!openedReading.data.unit, openedReading.message)
  const currentAfterRead = await study.main({ action: 'get' })
  check('读外刊不切换当前文章', currentAfterRead.data && currentAfterRead.data.article
    && currentAfterRead.data.article._id === currentIdBeforeRead,
  currentAfterRead.data && currentAfterRead.data.article && currentAfterRead.data.article._id)
  const previewReading = await study.main({ action: 'previewArticle', articleId: readingId })
  check('预览带回阅读模式标记', previewReading.code === 0 && previewReading.data.origin === 'journal',
    previewReading.data && previewReading.data.origin)

  const readOnce = await study.main({
    action: 'update',
    articleId: readingId,
    version: openedReading.data.unit.version,
    changes: { readingSeconds: 300 }
  })
  check('阅读时长可以保存', readOnce.code === 0 && readOnce.data.readingSeconds === 300, readOnce.message)
  const readList = await study.main({ action: 'listArticles' })
  const readRow = (readList.data || []).find((item) => item._id === readingId)
  check('阅读型文章标为读过', !!readRow && readRow.studied === true && readRow.readingMode === true)
  check('读 5 分钟进度约 33%', readRow && readRow.percent === 33, readRow && readRow.percent)

  const readDone = await study.main({
    action: 'update',
    articleId: readingId,
    version: readOnce.data.version,
    changes: { readingSeconds: 900 }
  })
  const readList2 = await study.main({ action: 'listArticles' })
  const readRow2 = (readList2.data || []).find((item) => item._id === readingId)
  check('读满 15 分钟算学完', readDone.code === 0 && !!readRow2 && readRow2.percent === 100,
    readRow2 && readRow2.percent)

  const badSeconds = await study.main({
    action: 'update',
    articleId: readingId,
    version: readDone.data.version,
    changes: { readingSeconds: -1 }
  })
  check('负的阅读时长被拒绝', badSeconds.code === 400, badSeconds.message)

  // 用户自己导入的真题仍走四站式，不能被当成阅读文章
  const stationImport = await study.main({
    action: 'importArticle',
    text: `${TEXT}\n\nImported for station mode.`,
    meta: { level: 'cet4', kind: 'custom', origin: 'import', source: 'e2e-stations' },
    unitData: parsed.data
  })
  const stationId = stationImport.data && stationImport.data.article && stationImport.data.article._id
  const stationList = await study.main({ action: 'listArticles' })
  const stationRow = (stationList.data || []).find((item) => item._id === stationId)
  check('用户导入的文章不走阅读模式', !!stationRow && stationRow.readingMode !== true, stationRow && stationRow.readingMode)

  // 真题学起来以后再去读外刊：外刊不能顶掉「当前文章」
  const stationOpen = await study.main({ action: 'openArticle', articleId: stationId })
  check('真题可成为当前文章', stationOpen.code === 0, stationOpen.message)
  const stationUnit = stationOpen.data && stationOpen.data.unit
  const stationWord = parsed.data.vocabulary && parsed.data.vocabulary[0]
  await study.main({
    action: 'update',
    articleId: stationId,
    version: stationUnit.version,
    changes: stationWord ? { masteredWords: [stationWord.id] } : { readingSeconds: 60 }
  })
  const keepRead = await study.main({ action: 'openArticle', articleId: readingId })
  const afterKeep = await study.main({ action: 'get' })
  check('真题没学完时读外刊不换当前文章', keepRead.code === 0
    && afterKeep.data.article._id === stationId,
  `${keepRead.code} / ${afterKeep.data && afterKeep.data.article && afterKeep.data.article._id}`)

  section('[17] 阅读页：点词、词组、长难句标注')
  const readingPage = makePage(loadPage(path.join(ROOT, 'miniprogram/pages/reading/index.js')))
  readingPage.article = {
    _id: readingId,
    origin: 'journal',
    title: 'Reading E2E',
    wordCount: 22,
    ocrText: 'The quick brown fox jumps over the lazy dog. In the end, the small robot that had been running all morning suddenly stopped and waited for its owner. It runs away.'
  }
  readingPage.unitData = {
    vocabulary: [{ id: 'v1', word: 'quick', phonetic: 'kwɪk', meanings: [{ pos: 'adj.', definition: '快的' }], forms: { comparative: 'quicker' } }],
    phrases: [{ id: 'p1', phrase: 'in the end', matched: 'In the end', meaning: '最后' }],
    grammarPoints: [
      {
        id: 'g1',
        sentence: 'In the end, the small robot that had been running all morning suddenly stopped and waited for its owner.',
        pattern: '定语从句 + 并列谓语',
        understanding: 'that 从句修饰 robot',
        chunks: [
          { en: 'In the end,', zh: '最后，' },
          { en: 'the small robot', zh: '这个小机器人' },
          { en: 'that had been running all morning', zh: '整个早上一直在跑' },
          { en: 'suddenly stopped and waited for its owner.', zh: '突然停下来等它的主人。' }
        ]
      },
      { id: 'g2', sentence: 'It runs away.', pattern: '主谓', understanding: '短句' }
    ]
  }
  readingPage.translation = []
  readingPage.vocabMap = readingPage.buildVocabMap()
  readingPage.phraseById = readingPage.indexById(readingPage.unitData.phrases)
  readingPage.grammarById = readingPage.indexById(readingPage.unitData.grammarPoints)
  const built = readingPage.buildParagraphs()
  const builtTokens = built.reduce((list, para) => list.concat(para.tokens), [])
  check('生词不再画虚线', builtTokens.every((token) => !token.isNew))
  check('词形也能识别', readingPage.vocabMap.quicker && readingPage.vocabMap.quicker.id === 'v1')
  const phraseText = builtTokens.filter((token) => token.phraseId === 'p1').map((token) => token.text).join('')
  check('词组：只标词组本身，不标整句', phraseText === 'In the end', phraseText)
  check('长难句：够长的句子句尾带句型标签', builtTokens.some((token) => token.badge === 'g1'))
  check('长难句：标签写清是什么结构', builtTokens.some((token) => token.badge === 'g1' && token.badgeLabel === '定语从句'),
    builtTokens.filter((token) => token.badge).map((token) => token.badgeLabel))
  check('长难句：句子下方有细线', builtTokens.filter((token) => token.inGrammar).length >= 10)
  check('长难句：短句不参与标注', !builtTokens.some((token) => token.badge === 'g2'))
  check('长难句：正文不再整句上色', builtTokens.every((token) => !token.grammarId))
  const timerHalf = readingPage.timerView(300)
  const timerDone = readingPage.timerView(900)
  check('计时条：5 分钟约 33%', timerHalf.percent === 33 && timerHalf.elapsedText === '05:00', JSON.stringify(timerHalf))
  check('计时条：15 分钟满格', timerDone.percent === 100)
  readingPage.article.bankId = jlist[0].id
  const readShare = readingPage.onShareAppMessage()
  check('阅读页分享回落到外刊 id', readShare.path === `/pages/journal/index?journal=${jlist[0].id}`, readShare.path)

  readingPage.data.showPhrases = true
  readingPage.openWord('quick', 'p1')
  check('点词面板带释义', readingPage.data.panel.title === 'quick'
    && readingPage.data.panel.meanings[0].definition === '快的', JSON.stringify(readingPage.data.panel))
  check('点词面板顺带显示所在词组', !!readingPage.data.panel.phrase
    && readingPage.data.panel.phrase.phrase === 'in the end')

  readingPage.applyMode('plain', false)
  check('纯读模式关闭所有标注', !readingPage.data.showTranslation && !readingPage.data.showPhrases && !readingPage.data.showGrammar)
  readingPage.applyMode('study', false)

  // 读到 1 分钟：外刊记「外刊阅读」，但不能顺手把四站式精读也勾掉
  const store = new Map()
  const originalGet = global.wx.getStorageSync
  const originalSet = global.wx.setStorageSync
  global.wx.getStorageSync = (key) => (store.has(key) ? store.get(key) : '')
  global.wx.setStorageSync = (key, value) => { store.set(key, value) }
  const checkin = require(path.join(ROOT, 'miniprogram/services/checkin'))
  readingPage.article.origin = 'journal'
  readingPage.seconds = 60
  readingPage.markJournalRead()
  check('外刊读满 1 分钟记外刊阅读', checkin.didToday('journal'))
  check('读外刊不误记四站精读', !checkin.didToday('study'))
  store.clear()
  readingPage.article.origin = 'import'
  readingPage.journalMarked = false
  readingPage.markJournalRead()
  check('非外刊不计入外刊阅读', !checkin.didToday('journal'))
  checkin.mark('collect')
  checkin.mark('collect')
  check('收词按天累计计数', checkin.countToday('collect') === 2)
  global.wx.getStorageSync = originalGet
  global.wx.setStorageSync = originalSet
  check('精读模式打开词组和长难句', !readingPage.data.showTranslation && readingPage.data.showPhrases && readingPage.data.showGrammar)
  readingPage.updateDisplay({ fontSize: 'lg', lineHeight: 'loose', night: true })
  check('显示设置：字号/行距/夜间生效', readingPage.data.displayClass === 'fs-lg lh-loose is-night',
    readingPage.data.displayClass)
  const summary = readingPage.buildSummary()
  check('读完小结统计本篇知识点', summary.vocab === 1 && summary.phrases === 1 && summary.grammar === 1,
    JSON.stringify(summary))
  readingPage.openGrammar({ currentTarget: { dataset: { gid: 'g1' } } })
  check('长难句面板带分块拆解', readingPage.data.panel.chunks.length === 4
    && readingPage.data.panel.chunks[1].zh === '这个小机器人', JSON.stringify(readingPage.data.panel.chunks))

  console.log(`\n${failed ? `❌ ${failed} 项失败 / ${passed} 项通过` : `✅ 全部通过（${passed} 项）`}`)
  process.exit(failed ? 1 : 0)
}

main().catch((error) => {
  console.error('\n脚本异常：', error && (error.stack || error.message || error))
  process.exit(1)
})
