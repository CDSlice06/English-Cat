const checkin = require('./checkin')

let cache = null
let pending = null

// 首屏快照：冷启动时先用本地这一份把页面铺满，云函数回来再静默替换，
// 不用每次进首页都盯着「正在加载」看一秒
const SNAPSHOT_KEY = 'studySnapshot'
const SNAPSHOT_TTL = 24 * 60 * 60 * 1000
// 首屏可以先用的旧快照上限：过了 24 小时不再当「新数据」，但仍可以拿来垫首屏
const STALE_TTL = 30 * 24 * 60 * 60 * 1000
// 断点续接：记录每篇文章最后一次停在哪一站、哪一个条目
const RESUME_PREFIX = 'resume_'
const STATION_LABELS = { 1: '第 1 站 · 词汇', 2: '第 2 站 · 词组', 3: '第 3 站 · 语法', 4: '第 4 站 · 输出练习' }
const STATION_URLS = { 1: '/pkgWords/pages/vocabulary/index', 2: '/pages/phrases/index', 3: '/pages/analysis/index', 4: '/pages/practice/index' }

// 外刊按「阅读优先」学习：不拆成四站，累计活跃阅读满 15 分钟算学完
const READING_TARGET_SECONDS = 15 * 60
const READING_TIME_PREFIX = 'readingTime_'

// 单篇预计阅读时长：按「边读边查」约 100 wpm 估，最少 5 分钟。
// 只用于列表上给个预期；每日计划的完成门槛固定是累计读满 15 分钟
function readingMinutesOf(words) {
  const count = Math.max(0, Number(words) || 0)
  if (!count) return 5
  return Math.max(5, Math.round(count * 0.6 / 60))
}

// 只有外刊走阅读模式；用户导入的文章（含真题）仍按四站式精读推进
function isReadingArticle(article) {
  if (!article) return false
  const origin = article.origin || ''
  return origin === 'journal'
}

// 计时先落本地，中途退出也不丢；云端进度回来时两边取较大值
function readReadingSeconds(articleId, unit) {
  const cloud = Math.max(0, Number(unit && unit.readingSeconds) || 0)
  if (!articleId) return cloud
  try {
    const local = Math.max(0, Number(wx.getStorageSync(READING_TIME_PREFIX + articleId)) || 0)
    return Math.max(cloud, local)
  } catch (error) {
    return cloud
  }
}

function storeReadingSeconds(articleId, seconds) {
  if (!articleId) return
  try {
    wx.setStorageSync(READING_TIME_PREFIX + articleId, Math.max(0, Math.floor(seconds) || 0))
  } catch (error) {}
}

function callFunction(name, data) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success(res) {
        const result = res.result || {}
        if (result.code === 0) resolve(result.data)
        else {
          const error = new Error(result.message || '云服务请求失败')
          // 带上业务错误码，页面可据此区分「换文章被限制」这类提示
          error.code = result.code
          reject(error)
        }
      },
      fail(err) { reject(new Error(err.errMsg || '无法连接云开发环境')) }
    })
  })
}

function loadStudy(force = false) {
  if (cache && !force) return Promise.resolve(cache)
  if (pending && !force) return pending
  pending = callFunction('study', { action: 'get' })
    .then((data) => { cache = normalizeStudy(data); remember(cache); pending = null; return cache })
    .catch((error) => { pending = null; throw error })
  return pending
}

// 旧文章的标题是原卷写法（Passage One / Passage Two），
// 题库、出处标签和报错文案都统一用阿拉伯数字，这里把旧标题一起归一，
// 免得同一个列表里「Passage 1」和「Passage Two」混着出现
const PASSAGE_NUMBER = { one: 1, two: 2, three: 3, four: 4 }

function normalizeTitle(title) {
  return String(title || '').replace(/^passages?\s+(one|two|three|four)$/i, (all, word) => `Passage ${PASSAGE_NUMBER[word.toLowerCase()]}`)
}

function escapeWord(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 词条必须在正文里真实出现（含词表登记的变形）。
// 没有登记变形（如基础词库）就无法证伪，原样保留
function appearsInText(word, forms, text) {
  const head = String(word || '').trim().toLowerCase()
  const body = String(text || '')
  if (!head || !body) return true
  const variants = Object.keys(forms || {})
    .map((key) => (typeof forms[key] === 'string' ? forms[key].trim().toLowerCase() : ''))
    .filter(Boolean)
  if (!variants.length) return true
  const pattern = new RegExp(`(^|[^a-z])(${[head].concat(variants).map(escapeWord).join('|')})([^a-z]|$)`, 'i')
  return pattern.test(body)
}

// 模型偶尔把「原文拼写有误，应为 rate」这类批注写进释义，
// 出现这种批注说明词条本身就错了（如 rates 被还原成 rat），整条丢弃
function hasSpellingNote(item) {
  const meanings = Array.isArray(item && item.meanings) ? item.meanings : []
  return meanings.some((meaning) => /原文|拼写|笔误|应为|更正/.test(String((meaning && meaning.definition) || '')))
}

// 旧数据自检：词形还原错误的词条（rates → rat）不该出现在学习单元里；
// 进度里指向已不存在条目的 id 一并过滤，避免出现「已看 7/6」这种越界显示
function normalizeUnit(article, unit) {
  if (!article || !unit) return unit
  const data = article.unitData
  if (!data || typeof data !== 'object') return unit
  const text = String(article.ocrText || '')
  const vocabulary = Array.isArray(data.vocabulary) ? data.vocabulary : []
  const grammarPoints = Array.isArray(data.grammarPoints) ? data.grammarPoints : []
  const phrases = Array.isArray(data.phrases) ? data.phrases : []
  const kept = vocabulary.filter((item) => !hasSpellingNote(item)
    && appearsInText(item && item.word, item && item.forms, text))
  const vocabIds = new Set(kept.map((item) => item.id))
  const grammarIds = new Set(grammarPoints.map((item) => item.id))
  const phraseIds = new Set(phrases.map((item) => item.id))
  const keepIds = (list, ids) => (Array.isArray(list) ? list : []).filter((id) => ids.has(id))
  return Object.assign({}, unit, {
    masteredWords: keepIds(unit.masteredWords, vocabIds),
    grammarViewed: keepIds(unit.grammarViewed, grammarIds),
    phrasesViewed: keepIds(unit.phrasesViewed, phraseIds)
  })
}

function normalizeStudy(data) {
  if (!data || !data.article || !data.unit) return data
  const article = Object.assign({}, data.article, { title: normalizeTitle(data.article.title) })
  const unit = normalizeUnit(article, data.unit)
  const data_ = article.unitData
  if (!data_ || !Array.isArray(data_.vocabulary)) return Object.assign({}, data, { article, unit })
  const text = String(article.ocrText || '')
  const kept = data_.vocabulary.filter((item) => !hasSpellingNote(item)
    && appearsInText(item && item.word, item && item.forms, text))
  if (kept.length === data_.vocabulary.length) return Object.assign({}, data, { article, unit })
  return Object.assign({}, data, {
    article: Object.assign({}, article, {
      unitData: Object.assign({}, data_, {
        vocabulary: kept,
        stats: Object.assign({}, data_.stats, { vocabulary: kept.length })
      })
    }),
    unit
  })
}

function remember(data) {
  if (!data || !data.article || !data.unit) return data
  try {
    wx.setStorageSync(SNAPSHOT_KEY, { at: Date.now(), data })
  } catch (error) {}
  return data
}

// 同步读取，页面 onShow 里可以直接拿来渲染首屏。
// allowStale：首屏渲染允许用过期的旧快照先铺画面，云端回来再静默替换，
// 这样跨天打开也不会先白屏等云函数冷启动
function readStudySnapshot(allowStale) {
  try {
    const saved = wx.getStorageSync(SNAPSHOT_KEY)
    if (!saved || !saved.at || !saved.data) return null
    const maxAge = allowStale ? STALE_TTL : SNAPSHOT_TTL
    if (Date.now() - saved.at > maxAge) return null
    return normalizeStudy(saved.data)
  } catch (error) {
    return null
  }
}

// station：1 词汇 / 2 词组 / 3 语法 / 4 输出练习；id 是停下的那个条目
function saveResume(station, itemId) {
  const articleId = cache && cache.article && cache.article._id
  if (!articleId || !station) return
  try {
    wx.setStorageSync(RESUME_PREFIX + articleId, { station, id: itemId || '', at: Date.now() })
  } catch (error) {}
}

function readResume(articleId) {
  if (!articleId) return null
  try {
    const saved = wx.getStorageSync(RESUME_PREFIX + articleId)
    return saved && saved.station ? saved : null
  } catch (error) {
    return null
  }
}

// 工作台用：把「站点 + 条目」翻成可以直接跳转的按钮
function resumeInfo(articleId) {
  const saved = readResume(articleId)
  if (!saved) return null
  return {
    station: saved.station,
    id: saved.id || '',
    label: STATION_LABELS[saved.station] || '上次的位置',
    url: `${STATION_URLS[saved.station] || STATION_URLS[1]}?resume=1`
  }
}

function updateStudy(changes) {
  if (!cache) return loadStudy().then(() => updateStudy(changes))
  const articleId = cache.article._id
  return callFunction('study', {
    action: 'update',
    articleId,
    version: cache.unit.version,
    changes
  }).then((unit) => {
    // 请求期间可能已经切到别的文章，不能把 A 篇的结果写进 B 篇的缓存
    if (cache && cache.article && cache.article._id === articleId) {
      cache.unit = normalizeUnit(cache.article, unit)
      remember(cache)
    }
    // 推进任何一站的学习进度，都算今天学过
    checkin.mark('study')
    return cache
  })
}

// 外刊阅读秒数按文章 id 回传：不写当前文章缓存，也不切换当前文章
function updateReading(articleId, version, changes) {
  return callFunction('study', {
    action: 'update',
    articleId,
    version,
    changes
  })
}

// 个人中心汇总统计：跨文章掌握篇数 + 累计通过题数
function loadOverview() {
  return callFunction('study', { action: 'overview' })
}

function saveArticle(text, meta) {
  return callFunction('study', { action: 'saveArticle', text, meta: meta || null }).then((data) => {
    cache = normalizeStudy(data)
    remember(cache)
    return cache
  })
}

// 导入只收进题库：不生成学习单元、不切换当前文章，等用户从题库里主动打开
// 预览确认导入时会把已解析好的 unitData 一起带上，打开时不再重复解析
function importArticle(text, meta, unitData) {
  return callFunction('study', { action: 'importArticle', text, meta: meta || null, unitData: unitData || null })
}

// 导入预览用的整篇译文：不落库，只翻译传入正文
function translateText(text, level) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'analyzeArticle',
      data: { action: 'translateText', text, level },
      success(res) {
        const result = (res && res.result) || {}
        if (result.code === 0 && result.data) resolve(result.data)
        else reject(new Error(result.message || '译文暂时没有生成'))
      },
      fail(err) {
        reject(new Error((err && err.errMsg) || '译文服务暂时不可用，请稍后重试'))
      }
    })
  })
}

// 客户端直接调解析云函数：绕开云函数之间的嵌套调用，失败时能拿到真实原因
// remembered 由 openArticle 下发：已记住的词/词组/语法不再参与本次抽取
function analyzeText(text, level, remembered) {
  const known = remembered || {}
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'analyzeArticle',
      data: {
        text,
        level,
        knownWords: Array.isArray(known.words) ? known.words : [],
        knownPhrases: Array.isArray(known.phrases) ? known.phrases : [],
        knownGrammarKeys: Array.isArray(known.grammarKeys) ? known.grammarKeys : []
      },
      success(res) {
        const result = (res && res.result) || {}
        if (result.code === 0 && result.data) resolve(result.data)
        else reject(new Error(result.message || '文章解析没有完成'))
      },
      fail(err) {
        const message = (err && err.errMsg) || ''
        // 云函数部署时没装依赖：给出可直接照做的处理方式
        if (message.indexOf("Cannot find module 'wx-server-sdk'") >= 0) {
          reject(new Error('解析云函数缺少依赖：请在开发者工具里右键 cloud/analyzeArticle，选择「上传并部署：云端安装依赖」后重试'))
          return
        }
        reject(new Error(message || '解析服务暂时不可用，请稍后重试'))
      }
    })
  })
}

// 我的题库：只取摘要，不含正文
function listArticles() {
  return callFunction('study', { action: 'listArticles' })
    .then((items) => (items || []).map((item) => Object.assign({}, item, { title: normalizeTitle(item.title) })))
}

// 已记住的词/词组/语法清单：工作台兜底解析时带上，避免已掌握内容再次出现
function loadRemembered() {
  return callFunction('study', { action: 'remembered' })
}

// 题库点开文章时的过渡页数据：正文、出处与已解析摘要，不切换当前文章
function previewArticle(articleId) {
  return callFunction('study', { action: 'previewArticle', articleId })
    .then((data) => (data && typeof data === 'object'
      ? Object.assign({}, data, { title: normalizeTitle(data.title) })
      : data))
}

// 切回一篇旧文章（真题/导入），保留它原有的学习进度；
// 返回 needsAnalysis 表示这篇还没解析，需要客户端调 analyzeArticle 后再 saveUnit
function openArticle(articleId) {
  return callFunction('study', { action: 'openArticle', articleId }).then((data) => {
    if (data && data.needsAnalysis) return data
    cache = normalizeStudy(data)
    remember(cache)
    return cache
  })
}

// 阅读页按 id 取外刊：只读，不切换当前文章
function readReadingArticle(articleId) {
  return callFunction('study', { action: 'read', articleId })
}

// 客户端解析完成后回传学习单元，由云端落库
function saveUnit(articleId, unitData) {
  return callFunction('study', { action: 'saveUnit', articleId, unitData }).then((data) => {
    cache = normalizeStudy(data)
    remember(cache)
    return cache
  })
}

// 删除自己导入的文章：正文、进度、练习记录一起删，已收藏的生词/词组/语法不受影响
function deleteArticle(articleId) {
  return callFunction('study', { action: 'deleteArticle', articleId }).then((data) => {
    if (cache && cache.article && cache.article._id === articleId) cache = null
    try { wx.removeStorageSync(RESUME_PREFIX + articleId) } catch (error) {}
    return data
  })
}

// 补/改考试年份（可选月份）：只更新出处，不动正文和学习进度
function setArticleYear(articleId, year, month) {
  return callFunction('study', { action: 'setYear', articleId, year, month })
}

function resetStudy() {
  if (!cache) return loadStudy().then(resetStudy)
  const articleId = cache.article._id
  return callFunction('study', { action: 'reset', articleId })
    .then((unit) => {
      if (cache && cache.article && cache.article._id === articleId) {
        cache.unit = normalizeUnit(cache.article, unit)
        remember(cache)
      }
      return cache
    })
}
function savePractice(questionId, answer, attempt) {
  if (!cache) return loadStudy().then(() => savePractice(questionId, answer, attempt))
  const articleId = cache.article._id
  return callFunction('evaluateTranslation', {
    articleId,
    id: questionId,
    answer,
    attempt: attempt || 1
  })
    .then((data) => {
      const record = data.record
      // 判定成功但进度没写进库（云函数侧两次重试都失败）：标出来让页面提示一下
      if (record && data.saved === false) record.saved = false
      // 英译汉通过，是今天实打实的输出练习
      if (record && record.result === 'pass') checkin.mark('drill')
      // 判题期间切了文章：记录照常返回，但不写入当前缓存
      if (cache && cache.article && cache.article._id === articleId) {
        cache.unit.practiceRecords = Object.assign({}, cache.unit.practiceRecords, { [questionId]: record })
        cache.unit.version = data.version
        remember(cache)
      }
      return record
    })
}

// 词汇站：本篇单词必须全部掌握才算通过
function vocabStats(unit, unitData) {
  const vocabulary = Array.isArray(unitData && unitData.vocabulary) ? unitData.vocabulary : []
  const mastered = new Set((unit && unit.masteredWords) || [])
  return {
    total: vocabulary.length,
    mastered: vocabulary.filter((item) => item && mastered.has(item.id)).length
  }
}

function getProgress(unit, unitData) {
  const data = unitData || {}
  const grammarPoints = Array.isArray(data.grammarPoints) ? data.grammarPoints : []
  const phrases = Array.isArray(data.phrases) ? data.phrases : []
  const vocabulary = Array.isArray(data.vocabulary) ? data.vocabulary : []
  const drills = []
  const seenDrills = new Set()
  grammarPoints.forEach((point) => {
    (point.drills || []).forEach((drill) => {
      // 与练习页保持同一口径：只算英译汉
      if (drill.mode !== 'en2zh') return
      const key = String(drill.prompt || '').trim().toLowerCase()
      if (!drill.id || seenDrills.has(key)) return
      seenDrills.add(key)
      drills.push(drill)
    })
  })

  const records = unit.practiceRecords || {}
  const drillIds = new Set(drills.map((drill) => drill.id))
  const practicePassed = Object.keys(records)
    .filter((key) => drillIds.has(key) && records[key].result === 'pass').length
  const grammarViewed = (unit.grammarViewed || []).length
  const phrasesViewed = (unit.phrasesViewed || []).length

  // 这篇没有可学的内容时（比如全文没命中固定搭配），该站直接算通过，
  // 否则进度永远卡在上一站，用户走不到报告页
  const vocab = vocabStats(unit, unitData)
  const checks = [
    // 词汇站要求本篇单词全部掌握
    vocab.mastered >= vocab.total,
    !grammarPoints.length || grammarViewed >= grammarPoints.length,
    !phrases.length || phrasesViewed >= phrases.length,
    !drills.length || practicePassed >= drills.length
  ]
  const completed = checks.filter(Boolean).length
  // 进度条要能连续走：四站各占 25%，站内再按完成条数的比例计分，
  // 不再等到整站通过才跳一个 25%（没内容的站按满额计，与云端 percentOf 同一口径）
  const ratio = (done, total) => (total > 0 ? Math.min(1, done / total) : 1)
  const percent = Math.round((ratio(vocab.mastered, vocab.total)
    + ratio(phrasesViewed, phrases.length)
    + ratio(grammarViewed, grammarPoints.length)
    + ratio(practicePassed, drills.length)) * 25)
  return {
    completed,
    total: 4,
    practicePassed,
    drillTotal: drills.length,
    grammarViewed,
    grammarTotal: grammarPoints.length,
    phrasesViewed,
    phraseTotal: phrases.length,
    percent
  }
}

// AI 精讲增强：保存成功后由客户端在后台触发，不阻塞页面跳转、失败了也不影响规则结果。
// 传 timeoutMs 时到点先放行，请求仍在云端继续跑，避免冷启动那篇把页面卡住
function triggerEnhance(articleId, timeoutMs) {
  if (!articleId) return Promise.resolve()
  return new Promise((resolve) => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      resolve()
    }
    if (timeoutMs > 0) setTimeout(finish, timeoutMs)
    wx.cloud.callFunction({
      name: 'analyzeArticle',
      data: { action: 'enhance', articleId },
      complete: finish
    })
  })
}

// 旧练习记录缺少错误类型时，让云端按原始答案重算一遍
function backfillPracticeRules(articleId) {
  return callFunction('evaluateTranslation', { action: 'backfill', articleId })
}

// 报告页全文对照：云端按句翻译整篇并缓存，重复进入不再调用模型
function loadFullTranslation(articleId) {
  if (!articleId) return Promise.resolve({ sentences: [] })
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'analyzeArticle',
      data: { action: 'translate', articleId },
      success(res) {
        const result = (res && res.result) || {}
        if (result.code === 0 && result.data) resolve(result.data)
        else reject(new Error(result.message || '全文对照生成失败'))
      },
      fail(err) { reject(new Error((err && err.errMsg) || '无法连接云开发环境')) }
    })
  })
}

module.exports = { loadStudy, updateStudy, updateReading, resetStudy, savePractice, saveArticle, importArticle, translateText, analyzeText, listArticles, loadRemembered, previewArticle, openArticle, readReadingArticle, saveUnit, deleteArticle, setArticleYear, getProgress, vocabStats, loadOverview, backfillPracticeRules, triggerEnhance, loadFullTranslation, readStudySnapshot, saveResume, resumeInfo, isReadingArticle, readReadingSeconds, storeReadingSeconds, readingMinutesOf, READING_TARGET_SECONDS }
