const cloud = require('wx-server-sdk')
const crypto = require('crypto')
const { guessTopic } = require('./topic')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
let collectionsReady = false

async function ensureCollections() {
  if (collectionsReady) return
  for (const name of ['articles', 'article_units', 'attempts', 'known_words']) {
    try {
      await db.createCollection(name)
    } catch (error) {
      const message = String((error && (error.errMsg || error.message)) || '')
      if (!/exist|已存在/i.test(message)) throw error
    }
  }
  collectionsReady = true
}

const ARTICLE_TITLE = 'The Value of Deep Reading'
const ARTICLE_TEXT = `In an age of constant digital interruptions, many learners approach reading as a race rather than a reflective process. However, cognitive researchers argue that deep reading, which requires sustained attention, plays a significant role in how we address complex issues.

When readers encounter an unfamiliar word, they should not simply look for a single equivalent in Chinese. A word may present a novel meaning in a specific context, and its usual definition may not account for the author's intention. This is particularly important for students preparing for college English examinations.

Despite the pressure to read quickly, learners can benefit from pausing to examine how a sentence is constructed. Careful analysis helps them become advocates of their own learning, whereas mechanical translation often leaves the underlying logic untouched. A comprehensive understanding grows significantly when vocabulary, grammar and context are considered together.`

// 首次进入时用当前分析函数实时生成示例文章的学习单元，保证结构与最新规则库一致
async function analyzeDemo() {
  try {
    const analyzed = await cloud.callFunction({ name: 'analyzeArticle', data: { text: ARTICLE_TEXT } })
    const result = (analyzed && analyzed.result) || {}
    if (result.code === 0 && result.data) return result.data
  } catch (error) {
    console.error('demo analyze failed', error)
  }
  return null
}

const PROGRESS_FIELDS = ['masteredWords', 'grammarViewed', 'phrasesViewed']

// 词汇/词组抽取规则版本：与 analyzeArticle 的 unitData.extractVersion 对齐。
// 旧版本的文章在用户重新选中时自动重解析，不需要删掉再导入一遍
// 3：释义按词性合并、剔除口语义项，派生词继承词根级别
// 4：派生词直接带词根释义（implementation 不再空白），释义按书面语重排
// 5：已记住的词/词组/语法不再出现；高中基础词不占名额；难词名额扩大；词组全量收录
// 6：补齐 as 系列语法点（时间/原因/让步/定语从句、as long as、as if、as … as）
// 7：补齐词法与句法（介词+which、主语/表语从句、让步/条件/目的状语、情态+have done、
//    wish/if only、not so much as、too…to、wh-ever、强调 do、完全倒装、主谓一致、
//    比较级修饰、动名词主语、分词定语、不定式、限制性定语从句）
// 8：语法卡新增分步理解（steps）与分块翻译（chunks），词组补齐动词+介词搭配
// 9：关联连词只收完整结构（not only … but also），不再出现孤立的 not only
// 10：词组库扩容到 500+ 条，补齐 be + 分词、动词短语、话题名词搭配与衔接语
// 11：词汇分核心/拓展，并按 COCA/BNC 真实语料排名标注三档词频
// 12：词库补齐考研与高频外刊词，词组库补 76 条常用搭配
// 13：语法库补时态/被动/情态/地点状语从句/关联连词/插入语；词组加类型标签并补漏 74 条；熟词生义扩到 314 条
// 14：单词释义改为「词库释义 + 模型补全」合并；星级改为四六级常考度口径（大纲级别 + 语料词频）
// 15：星级拆成四级 / 六级两套标尺（freq4 / freq6），页面按当前备考级别切换
// 16：扩展词库 curated.json（写译/作文/听力话题词、现代复合词与派生词），并支持连字符复合词抽取
// 17：词库扩容至 6000+ 扩展词；修正基础词库缺失词性/垃圾义项，补齐并规范音标
// 18：生词统一显示原形（boundaries → boundary），名词释义增加可数性标记（C / U / C/U）
// 19：补齐 tell/leave/mean/run 等高频基础词、常用派生词与缺失词性，修正 swell 等变形
// 20：词库补英式拼写变体、现代科技/医学/社会话题词与进阶书面语；词组补论证框架/逻辑连接/话题搭配；
//     语法补否定转移、It 句型、倍数、虚拟倒装、定语从句关系词、句首状语、分号/冒号/同位语/分词短语等；还原英式拼写和 e 结尾比较级
// 21：词库补考研进阶词与外刊议题新词 145 条；词组补现代议题名词搭配与论证短语 165 条
// 22：语法补 18 类句式（倒装、使役、感官动词、宾补、名词化、破折号插入语、反意疑问、间接引语等），并修正进行时/被动/名词性从句误判
const EXTRACT_VERSION = 22

// 「已认识」词表：每人一条文档，记录生词本里的词和在别的文章里点过掌握的词。
// 解析新文章时命中只做标记、不再让模型解释，省下这部分 token
const KNOWN_COLLECTION = 'known_words'

function knownDocId(openid) {
  return `kw_${openid}`
}

function knownWordOf(item, source) {
  const word = String((item && item.word) || '').trim().toLowerCase()
  if (!word) return null
  const meanings = (Array.isArray(item.meanings) ? item.meanings : [])
    .filter((meaning) => meaning && meaning.definition)
    .slice(0, 4)
    .map((meaning) => ({
      pos: String((meaning && meaning.pos) || '').slice(0, 8),
      definition: String(meaning.definition).slice(0, 80)
    }))
  return {
    word,
    meanings,
    phonetic: String((item && item.phonetic) || '').slice(0, 40),
    source: source === 'mastered' ? 'mastered' : 'book'
  }
}

async function readKnownDoc(openid) {
  try {
    const res = await db.collection(KNOWN_COLLECTION).doc(knownDocId(openid)).get()
    const raw = res && res.data
    const doc = Array.isArray(raw) ? raw[0] : raw
    return doc && Array.isArray(doc.items) ? doc.items : []
  } catch (error) {
    return []
  }
}

async function writeKnownDoc(openid, items) {
  // 只留最近 1000 条，避免单文档无限膨胀
  const data = { openid, items: items.slice(-1000), updatedAt: db.serverDate() }
  try {
    const res = await db.collection(KNOWN_COLLECTION).doc(knownDocId(openid)).update({ data })
    if (res && res.stats && res.stats.updated) return
  } catch (error) {
    // 文档还不存在，走新增
  }
  try {
    await db.collection(KNOWN_COLLECTION).add({
      data: Object.assign({ _id: knownDocId(openid), createdAt: db.serverDate() }, data)
    })
  } catch (error) {
    console.error('[study] write known words failed', error)
  }
}

// 合并已知词：added 覆盖旧条目，removed 从表里移除；没有变化就不写库
async function mergeKnownWords(openid, added, removed) {
  const addList = (Array.isArray(added) ? added : [])
    .map((item) => knownWordOf(item, item && item.source))
    .filter(Boolean)
  const removeList = (Array.isArray(removed) ? removed : [])
    .map((word) => String(word || '').trim().toLowerCase())
    .filter(Boolean)
  if (!addList.length && !removeList.length) return

  // 已知词表是「读整表 → 合并 → 写回」，多端同时标记掌握时会互相覆盖。
  // 写回后回读校验，发现刚加的词被覆盖就基于最新数据再合并一次，最多三轮
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const map = new Map()
    ;(await readKnownDoc(openid)).forEach((item) => {
      const norm = knownWordOf(item, item && item.source)
      if (norm) map.set(norm.word, norm)
    })
    let dirty = false
    removeList.forEach((word) => { if (map.delete(word)) dirty = true })
    addList.forEach((item) => {
      const exists = map.get(item.word)
      if (exists) {
        // 生词本带的是用户收藏时的释义，来源保持不变
        if (exists.source !== item.source && exists.source !== 'book') {
          map.set(item.word, Object.assign({}, exists, { source: item.source }))
          dirty = true
        }
        return
      }
      map.set(item.word, item)
      dirty = true
    })
    if (!dirty) return
    await writeKnownDoc(openid, Array.from(map.values()))

    const after = new Set((await readKnownDoc(openid))
      .map((item) => knownWordOf(item, item && item.source))
      .filter(Boolean)
      .map((item) => item.word))
    const lost = addList.some((item) => !after.has(item.word))
    const restored = removeList.some((word) => after.has(word))
    if (!lost && !restored) return
  }
}

// 掌握状态变化时同步「已认识」词表；取消掌握的词一并移出
async function syncMasteredWords(openid, article, nextIds, prevIds) {
  const unitData = article.unitData || {}
  const vocabulary = Array.isArray(unitData.vocabulary) ? unitData.vocabulary : []
  const byId = new Map(vocabulary.map((item) => [item.id, item]))
  const next = new Set(Array.isArray(nextIds) ? nextIds : [])
  const prev = new Set(Array.isArray(prevIds) ? prevIds : [])
  const added = []
  const removed = []
  next.forEach((id) => {
    if (prev.has(id)) return
    const item = byId.get(id)
    if (item) added.push({ word: item.word, meanings: item.meanings, phonetic: item.phonetic, source: 'mastered' })
  })
  prev.forEach((id) => {
    if (next.has(id)) return
    const item = byId.get(id)
    if (item) removed.push(item.word)
  })
  if (!added.length && !removed.length) return
  await mergeKnownWords(openid, added, removed)
}

// 传给 analyzeArticle：嵌套调用拿不到 OPENID，已记住的词/词组/语法由 study 读出来带过去。
// 只算真正点过「记住了」的条目：只是收进本子但还没记住的，下次还要继续学
async function loadRemembered(openid) {
  const words = []
  const phrases = []
  const grammarKeys = []
  const seen = new Set()
  const pushWord = (item, source) => {
    const norm = knownWordOf(item, source)
    if (!norm || seen.has(norm.word)) return
    seen.add(norm.word)
    words.push(norm)
  }
  const pushPhrase = (value) => {
    const key = String(value || '').toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim()
    if (key && phrases.indexOf(key) < 0) phrases.push(key)
  }
  ;(await readKnownDoc(openid)).forEach((item) => pushWord(item, item && item.source === 'mastered' ? 'mastered' : 'book'))
  try {
    const res = await db.collection('wordbooks').where({ openid }).limit(1000).get()
    ;((res && res.data) || []).forEach((item) => {
      if (!item || item.state !== 'known') return
      const isPhrase = item.entryType === 'phrase'
        || (Array.isArray(item.meanings) && item.meanings.some((meaning) => meaning && meaning.pos === 'phr.'))
      if (isPhrase) {
        pushPhrase(item.word)
        return
      }
      pushWord(item, 'book')
    })
  } catch (error) {
    // 生词本集合还没建：忽略
  }
  try {
    const res = await db.collection('grammarbooks').where({ openid }).limit(1000).get()
    ;((res && res.data) || []).forEach((item) => {
      if (!item) return
      ;[item.key, item.pattern].forEach((value) => {
        const key = String(value || '').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '')
        if (key && grammarKeys.indexOf(key) < 0) grammarKeys.push(key)
      })
    })
  } catch (error) {
    // 语法本集合还没建：忽略
  }
  return { words, phrases, grammarKeys }
}

function success(data) {
  return { code: 0, message: 'ok', data }
}

function failure(code, message) {
  return { code, message, data: null }
}

function makeId(prefix, ...parts) {
  const hash = crypto.createHash('sha256').update(parts.join(':')).digest('hex').slice(0, 24)
  return `${prefix}_${hash}`
}

async function findOne(collection, condition) {
  const result = await db.collection(collection).where(condition).limit(1).get()
  return result.data[0] || null
}

function findArticle(openid, articleId) {
  return findOne('articles', { _id: articleId, openid })
}

function findUnit(openid, articleId) {
  return findOne('article_units', { openid, articleId })
}

function escapeWord(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 词条必须在正文里真实出现（含词表登记的变形）。
// 没有登记变形（如基础词库）就无法证伪，原样保留。
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

// 旧数据自检：词形还原错误的词条（rates → rat）不进学习单元；
// 进度里指向已不存在条目的 id 一并过滤，避免出现「已看 7/6」这种越界显示。
// 用户下次改进度时过滤后的列表会自然写回，数据自愈
function sanitizeStudy(article, unit) {
  if (!article || !unit) return { article, unit }
  const data = article.unitData
  if (!data || typeof data !== 'object') return { article, unit }
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
  const masteredWords = keepIds(unit.masteredWords, vocabIds)
  const grammarViewed = keepIds(unit.grammarViewed, grammarIds)
  const phrasesViewed = keepIds(unit.phrasesViewed, phraseIds)
  const vocabChanged = kept.length !== vocabulary.length
  const progressChanged = masteredWords.length !== (unit.masteredWords || []).length
    || grammarViewed.length !== (unit.grammarViewed || []).length
    || phrasesViewed.length !== (unit.phrasesViewed || []).length
  if (!vocabChanged && !progressChanged) return { article, unit }
  const safeArticle = vocabChanged ? Object.assign({}, article, {
    unitData: Object.assign({}, data, {
      vocabulary: kept,
      stats: Object.assign({}, data.stats, {
        vocabulary: kept.length,
        grammarPoints: grammarPoints.length,
        phrases: phrases.length
      })
    })
  }) : article
  const safeUnit = progressChanged
    ? Object.assign({}, unit, { masteredWords, grammarViewed, phrasesViewed })
    : unit
  return { article: safeArticle, unit: safeUnit }
}

// 每日配额按北京时间自然日计算
function todayKey() {
  return new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

// 词汇站：本篇单词必须全部掌握才算通过
function vocabProgressOf(unit, vocabulary) {
  const list = Array.isArray(vocabulary) ? vocabulary : []
  const mastered = new Set((unit && unit.masteredWords) || [])
  return { vocabTotal: list.length, vocabMastered: list.filter((item) => item && mastered.has(item.id)).length }
}

// 与前端 getProgress 同一口径：四站各占 25%，站内按完成条数比例连续计分
function percentOf(article, unit) {
  if (!unit) return 0
  const data = (article && article.unitData) || {}
  const vocabulary = Array.isArray(data.vocabulary) ? data.vocabulary : []
  const grammarPoints = Array.isArray(data.grammarPoints) ? data.grammarPoints : []
  const phrases = Array.isArray(data.phrases) ? data.phrases : []
  const seen = new Set()
  const drills = []
  grammarPoints.forEach((point) => {
    ;(point.drills || []).forEach((drill) => {
      const key = `${drill.mode || ''}|${String(drill.prompt || '').trim().toLowerCase()}`
      if (!drill.id || seen.has(key)) return
      seen.add(key)
      drills.push(drill)
    })
  })
  const records = unit.practiceRecords || {}
  const drillIds = new Set(drills.map((drill) => drill.id))
  const passed = Object.keys(records)
    .filter((key) => drillIds.has(key) && records[key].result === 'pass').length
  const vocab = vocabProgressOf(unit, vocabulary)
  // 站内按比例计分：学会 5/20 个词就是 6%，不等整站通关
  const ratio = (done, total) => (total > 0 ? Math.min(1, done / total) : 1)
  return Math.round((ratio(vocab.vocabMastered, vocab.vocabTotal)
    + ratio((unit.phrasesViewed || []).length, phrases.length)
    + ratio((unit.grammarViewed || []).length, grammarPoints.length)
    + ratio(passed, drills.length)) * 25)
}

// 换文章的限制：当前这篇学超过 35% 就锁住。
// 导入文章不受每日一篇拦截——用户可以先囤文章，一天只精读哪一篇由 35% 门槛来约束
async function checkSwitch(openid, targetId) {
  const latest = await db.collection('articles')
    // 排队篇章不是「当前在学的文章」，不参与进度判断
    .where({ openid, isDemo: false, queued: _.neq(true) })
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get()
  const current = latest.data[0] || null
  if (current && current._id !== targetId) {
    const unit = await findUnit(openid, current._id)
    const percent = percentOf(current, unit)
    // 进度超过 35% 就锁住，避免频繁换文章反复消耗模型额度；
    // 学完（100%）允许换下一篇
    if (percent > 35 && percent < 100) {
      return failure(403, `当前这篇已经学了 ${percent}%，先把它学完再换文章吧`)
    }
  }
  return null
}

async function ensureDemoArticle(openid) {
  const articleId = makeId('demo', openid)
  const existing = await findArticle(openid, articleId)
  if (existing) return existing

  const data = {
    _id: articleId,
    openid,
    title: ARTICLE_TITLE,
    sourceImages: [],
    ocrText: ARTICLE_TEXT,
    isDemo: true,
    unitData: await analyzeDemo(),
    aiStatus: 'skipped',
    status: 'ready',
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  }

  try {
    await db.collection('articles').add({ data })
  } catch (error) {
    const concurrent = await findArticle(openid, articleId)
    if (concurrent) return concurrent
    throw error
  }

  return findArticle(openid, articleId)
}

async function ensureUnit(openid, articleId) {
  const existing = await findUnit(openid, articleId)
  if (existing) return existing

  const data = {
    _id: makeId('unit', openid, articleId),
    openid,
    articleId,
    masteredWords: [],
    grammarViewed: [],
    phrasesViewed: [],
    practiceRecords: {},
    version: 1,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  }

  try {
    await db.collection('article_units').add({ data })
  } catch (error) {
    const concurrent = await findUnit(openid, articleId)
    if (concurrent) return concurrent
    throw error
  }

  return findUnit(openid, articleId)
}

// 进度清零：practiceRecords 必须整字段移除，不能写成 {}。
// 云数据库会把空对象拆成空的 $set，整条更新直接失败（-502001 multiple write errors）
async function clearProgress(openid, articleId) {
  const found = await db.collection('article_units').where({ openid, articleId }).limit(20).get()
  const units = found.data || []
  if (!units.length) return
  // 早期并发可能留下重复的 unit 文档，只更新一条，多余的删掉
  const keep = units[0]
  await db.collection('article_units').doc(keep._id).update({
    data: {
      masteredWords: [],
      grammarViewed: [],
      phrasesViewed: [],
      practiceRecords: _.remove(),
      updatedAt: db.serverDate()
    }
  })
  const extra = units.slice(1)
  if (extra.length) {
    await Promise.all(extra.map((unit) => db.collection('article_units').doc(unit._id).remove()
      .catch(() => null)))
  }
}

// 重新解析时按词条文本把旧进度映射到新 id 上：
// 用户只是重新选中文章，不该丢掉已掌握的词、已看的词组和语法点
function indexBy(list, valueOf) {
  const map = {}
  ;(Array.isArray(list) ? list : []).forEach((item) => {
    if (!item || !item.id) return
    const value = valueOf(item)
    if (value && !map[value]) map[value] = item.id
  })
  return map
}

function remapIds(ids, previousList, nextList, valueOf) {
  // 旧数据：id -> 词条文本；新数据：词条文本 -> 新 id
  const before = {}
  ;(Array.isArray(previousList) ? previousList : []).forEach((item) => {
    if (!item || !item.id) return
    const value = valueOf(item)
    if (value) before[item.id] = value
  })
  const after = indexBy(nextList, valueOf)
  const result = []
  ;(Array.isArray(ids) ? ids : []).forEach((id) => {
    const value = before[id]
    const nextId = value ? after[value] : ''
    if (nextId && result.indexOf(nextId) < 0) result.push(nextId)
  })
  return result
}

const wordKey = (item) => String(item.word || '').trim().toLowerCase()
const grammarKey = (item) => String(item.pattern || '').trim().toLowerCase()
const phraseKey = (item) => String(item.phrase || '').trim().toLowerCase()

async function remapProgress(openid, articleId, previous, next) {
  const found = await db.collection('article_units').where({ openid, articleId }).limit(20).get()
  const units = found.data || []
  if (!units.length) return
  const keep = units[0]
  const oldData = previous && typeof previous === 'object' ? previous : {}
  const nextData = next && typeof next === 'object' ? next : {}
  await db.collection('article_units').doc(keep._id).update({
    data: {
      masteredWords: remapIds(keep.masteredWords, oldData.vocabulary, nextData.vocabulary, wordKey),
      grammarViewed: remapIds(keep.grammarViewed, oldData.grammarPoints, nextData.grammarPoints, grammarKey),
      phrasesViewed: remapIds(keep.phrasesViewed, oldData.phrases, nextData.phrases, phraseKey),
      // 练习题整批重新生成，旧判题记录作废，避免新题复用 id 后显示「没做过却已通过」
      practiceRecords: _.remove(),
      updatedAt: db.serverDate()
    }
  })
  const extra = units.slice(1)
  if (extra.length) {
    await Promise.all(extra.map((unit) => db.collection('article_units').doc(unit._id).remove()
      .catch(() => null)))
  }
}

function validateChanges(article, changes) {
  if (!changes || typeof changes !== 'object' || Array.isArray(changes)) {
    return { message: 'changes 必须是对象' }
  }

  const keys = Object.keys(changes)
  if (!keys.length) return { message: '至少提供一个待更新字段' }
  const unsupported = keys.find((key) => !PROGRESS_FIELDS.includes(key))
  if (unsupported) return { message: `不允许更新字段 ${unsupported}` }

  const unitData = article.unitData || {}
  const vocabulary = Array.isArray(unitData.vocabulary) ? unitData.vocabulary : []
  const grammarPoints = Array.isArray(unitData.grammarPoints) ? unitData.grammarPoints : []
  const phrases = Array.isArray(unitData.phrases) ? unitData.phrases : []

  if (Object.prototype.hasOwnProperty.call(changes, 'masteredWords')) {
    const value = changes.masteredWords
    const validIds = new Set(vocabulary.map((item) => item.id))
    if (!Array.isArray(value) || value.length > vocabulary.length || new Set(value).size !== value.length || value.some((id) => typeof id !== 'string' || !validIds.has(id))) {
      return { message: 'masteredWords 包含无效或重复词汇' }
    }
  }

  if (Object.prototype.hasOwnProperty.call(changes, 'grammarViewed')) {
    const value = changes.grammarViewed
    const validIds = new Set(grammarPoints.map((item) => item.id))
    if (!Array.isArray(value) || value.length > grammarPoints.length || new Set(value).size !== value.length || value.some((id) => typeof id !== 'string' || !validIds.has(id))) {
      return { message: 'grammarViewed 包含无效或重复语法点' }
    }
  }

  if (Object.prototype.hasOwnProperty.call(changes, 'phrasesViewed')) {
    const value = changes.phrasesViewed
    const validIds = new Set(phrases.map((item) => item.id))
    if (!Array.isArray(value) || value.length > phrases.length || new Set(value).size !== value.length || value.some((id) => typeof id !== 'string' || !validIds.has(id))) {
      return { message: 'phrasesViewed 包含无效或重复词组' }
    }
  }

  const data = {}
  keys.forEach((key) => { data[key] = changes[key] })
  return { data }
}

// 旧版本文章缺少语法点/词组或分析版本过旧时，按最新规则重新分析一次
// 返回 { article, error }：error 为空表示解析成功，调用方可以把真实原因告诉用户
async function ensureAnalyzed(article) {
  const unitData = article.unitData || {}
  const fresh = Array.isArray(unitData.grammarPoints) && Array.isArray(unitData.phrases) && unitData.version === 3
  if (fresh) return { article, error: '' }
  if (!article.ocrText) return { article, error: '文章正文为空' }

  // 冷启动或偶发超时先自动再试一次，避免第一次打开就报解析失败
  let lastMessage = ''
  // 嵌套调用里拿不到用户 OPENID，已记住的词/词组/语法在这里读好传过去
  const remembered = await loadRemembered(article.openid)
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const analyzed = await cloud.callFunction({
        name: 'analyzeArticle',
        data: {
          text: article.ocrText,
          level: article.level === 'cet6' ? 'cet6' : 'cet4',
          knownWords: remembered.words,
          knownPhrases: remembered.phrases,
          knownGrammarKeys: remembered.grammarKeys
        }
      })
      const result = (analyzed && analyzed.result) || {}
      if (result.code !== 0 || !result.data) {
        lastMessage = result.message || '文章解析没有完成'
        console.error('[study] analyzeArticle failed', {
          articleId: article._id,
          attempt,
          code: result.code,
          message: lastMessage,
          textLength: article.ocrText.length
        })
        // 4xx 是内容问题，重试也没有意义
        if (result.code >= 400 && result.code < 500) return { article, error: lastMessage }
        continue
      }
      await db.collection('articles').where({ _id: article._id, openid: article.openid }).update({
        // unitData 入库时是 null，普通 update 会拆成点号路径，无法在 null 下建子字段
        data: { unitData: _.set(result.data), updatedAt: db.serverDate() }
      })
      // 重新分析后 id 会整体错位：按词条文本把旧进度映射到新 id 上，
      // 已掌握的词、看过的词组和语法点都保留，只作废练习题判题记录
      await remapProgress(article.openid, article._id, article.unitData || {}, result.data)
      return { article: await findArticle(article.openid, article._id) || article, error: '' }
    } catch (error) {
      // 把云端的原始错误码一起带出来：函数不存在、环境不对、超时都会落在这里
      const detail = (error && (error.errCode || error.errMsg || error.message)) || ''
      lastMessage = detail
        ? `解析服务暂时不可用（${String(detail).slice(0, 120)}）`
        : '解析服务暂时不可用，请稍后重试'
      console.error('[study] ensureAnalyzed call failed', {
        articleId: article._id,
        attempt,
        detail: String(detail)
      })
    }
  }
  return { article, error: lastMessage || '文章解析没有完成' }
}

async function getStudy(openid) {
  const latest = await db.collection('articles')
    // 排队篇章等用户主动打开，不能顶掉今天正在学的文章
    .where({ openid, isDemo: false, queued: _.neq(true) })
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get()
  const found = latest.data[0] || await ensureDemoArticle(openid)
  const analyzed = await ensureAnalyzed(found)
  const article = analyzed.article
  const unit = await ensureUnit(openid, article._id)
  // 旧数据可能残留词形还原错误的词条或越界进度，返回前先自检
  const safe = sanitizeStudy(article, unit)
  return success({ article: safe.article, unit: safe.unit })
}

// 题库文章会带上等级与来源，导入的文章 origin 为 import，手工粘贴为 manual
// 真题还额外带年份、月份、套数、篇号，用于在题库里标注「2023年6月 第2套 Passage 1」
function readMeta(meta) {
  const pick = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '')
  const num = (value, min, max) => {
    const parsed = Number(value)
    return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : 0
  }
  const level = meta && meta.level === 'cet6' ? 'cet6' : 'cet4'
  const year = num(meta && meta.year, 2000, 2100)
  // 归档位置以用户选择为准：明确选了「我的真题」就归真题，不再要求必须填年份
  let kind = 'custom'
  if (meta && meta.kind === 'mock') kind = 'mock'
  else if (meta && meta.kind === 'real') kind = 'real'
  else if (year) kind = 'real'
  return {
    level,
    kind,
    // 排队篇章：真题整卷里除第一篇外的其余文章，先入库但不算今天的学习名额
    queued: !!(meta && meta.queued === true),
    year,
    month: num(meta && meta.month, 1, 12),
    paper: num(meta && meta.paper, 1, 9),
    passage: num(meta && meta.passage, 1, 9),
    origin: pick(meta && meta.origin, 20) || 'import',
    source: pick(meta && meta.source, 60),
    bankId: pick(meta && meta.bankId, 40),
    customTitle: pick(meta && meta.title, 60)
  }
}

function countWords(text) {
  return (String(text || '').match(/[A-Za-z']+/g) || []).length
}

// 旧入口保留：同样只入库，不在这里解析。
// study 内部嵌套调 analyzeArticle 在部分环境会直接失败（函数找不到/依赖缺失），
// 解析统一由客户端触发，成功后用 saveUnit 回传落库
async function saveArticle(openid, event) {
  const text = typeof event.text === 'string' ? event.text.trim() : ''
  if (!text) return failure(400, '识别文本不能为空')
  const meta = readMeta(event.meta)
  // 先判换文章限制，避免白白入库一篇打不开的文章
  if (!meta.queued) {
    const blocked = await checkSwitch(openid, makeId('art', openid, text))
    if (blocked) return blocked
  }

  const result = await importArticle(openid, Object.assign({}, event, { text }))
  if (result.code !== 0) return result
  const article = (result.data && result.data.article) || null
  if (!article) return failure(500, '文章没能存入题库，请稍后重试')
  if (!meta.queued) await markCurrent(openid, article._id)
  const unit = await ensureUnit(openid, article._id)
  return success({ article: (await findArticle(openid, article._id)) || article, unit })
}

// 导入前预览已经解析好的学习单元：用户确认导入时直接落库，
// 之后从题库打开这篇就不用再跑一次模型
function readPreviewUnitData(value) {
  if (!value || typeof value !== 'object') return null
  if (value.version !== 3) return null
  if (!Array.isArray(value.vocabulary) || !Array.isArray(value.grammarPoints) || !Array.isArray(value.phrases)) return null
  if (!value.vocabulary.length && !value.grammarPoints.length && !value.phrases.length) return null
  return Object.assign({}, value, { extractVersion: EXTRACT_VERSION })
}

// 导入 = 只把正文收进题库：不判换文章、不开始精读；带预览结果时直接落库
async function importArticle(openid, event) {
  const text = typeof event.text === 'string' ? event.text.trim() : ''
  if (!text) return failure(400, '文章正文不能为空')
  if (text.length > 10000) return failure(400, '文章不能超过 10000 个字符')

  const previewUnit = readPreviewUnitData(event.unitData)
  const meta = readMeta(event.meta)
  const articleId = makeId('art', openid, text)
  const title = meta.customTitle || (text.split(/[.!?]/)[0] || '未命名文章').trim().slice(0, 40)
  const fields = {
    title,
    ocrText: text,
    wordCount: countWords(text),
    level: meta.level,
    kind: meta.kind,
    year: meta.year,
    month: meta.month,
    paper: meta.paper,
    passage: meta.passage,
    origin: meta.origin,
    source: meta.source,
    bankId: meta.bankId,
    // 主题由正文关键词判定，题库列表要像模拟篇一样标出「健康 / 科技 / 环境」
    topic: guessTopic(text, title),
    updatedAt: db.serverDate()
  }

  const existing = await findArticle(openid, articleId)
  if (existing) {
    // 已存在就只更新出处信息，unitData / aiStatus / 学习进度全部保留，
    // 避免同一份文档反复解析、反复消耗模型额度
    const patch = Object.assign({}, fields)
    // 预览带来的解析结果只在旧文章还没解析或版本过旧时补写
    if (previewUnit && (!existing.unitData || isExtractOutdated(existing))) {
      patch.unitData = _.set(previewUnit)
      // 站点总数缓存跟着解析结果一起更新，题库列表才能算进度
      patch.unitTotals = _.set(unitTotalsOf(previewUnit))
      patch.aiStatus = 'pending'
      patch.wordsPending = false
      patch.aiAt = null
    }
    await db.collection('articles').where({ _id: articleId, openid }).update({ data: patch })
  } else {
    await db.collection('articles').add({
      data: {
        _id: articleId,
        openid,
        ...fields,
        sourceImages: [],
        isDemo: false,
        // 入库但还没开始学：标记排队，不顶掉当前正在精读的文章
        queued: true,
        startedOn: '',
        unitData: previewUnit,
        // 解析结果随导入一起带进来时，顺手缓存站点总数（空则留空，等列表补算）
        unitTotals: previewUnit ? unitTotalsOf(previewUnit) : null,
        aiStatus: 'pending',
        aiAt: null,
        status: 'ready',
        createdAt: db.serverDate()
      }
    })
  }

  return success({ article: await findArticle(openid, articleId) })
}

async function updateStudy(openid, event) {
  const { articleId, version, changes } = event
  if (typeof articleId !== 'string' || !articleId.trim()) return failure(400, 'articleId 不能为空')
  if (!Number.isInteger(version) || version < 1) return failure(400, 'version 必须是正整数')

  const article = await findArticle(openid, articleId)
  if (!article) return failure(404, '文章不存在或无权访问')

  const validation = validateChanges(article, changes)
  if (validation.message) return failure(400, validation.message)

  const unit = await findUnit(openid, articleId)
  if (!unit) return failure(404, '学习单元不存在')
  if (unit.version !== version) return failure(409, '学习进度已更新，请刷新后重试')

  const result = await db.collection('article_units').where({
    _id: unit._id,
    openid,
    articleId,
    version
  }).update({
    data: {
      ...validation.data,
      version: _.inc(1),
      updatedAt: db.serverDate()
    }
  })

  if (!result.stats || result.stats.updated !== 1) {
    return failure(409, '学习进度已更新，请刷新后重试')
  }

  // 掌握状态变化记进「已认识」词表，下一篇遇到同一个词就不再让模型解释
  if (Object.prototype.hasOwnProperty.call(validation.data, 'masteredWords')) {
    try {
      await syncMasteredWords(openid, article, validation.data.masteredWords, unit.masteredWords)
    } catch (error) {
      // 已知词同步只是省 token 的优化，失败不影响学习进度
      console.log('[study] sync known words skipped', { articleId })
    }
  }

  const fresh = await findUnit(openid, articleId)
  const safe = sanitizeStudy(article, fresh)
  return success(safe.unit)
}

// 题库列表：只回摘要字段，不把正文（ocrText）带出来，避免一次拉几十万字
// 「我的真题」只放用户自己导入的文章，内置模拟篇（origin=bank）不算在内
async function listArticles(openid) {
  const result = await db.collection('articles')
    .where({ openid, isDemo: false })
    .field({
      title: true,
      level: true,
      kind: true,
      origin: true,
      source: true,
      year: true,
      month: true,
      paper: true,
      passage: true,
      wordCount: true,
      topic: true,
      unitTotals: true,
      createdAt: true
    })
    .orderBy('createdAt', 'desc')
    .limit(80)
    .get()
  const items = (result.data || [])
    .filter((article) => article.origin !== 'bank')
    .map((article) => ({
      _id: article._id,
      title: article.title,
      level: article.level === 'cet6' ? 'cet6' : 'cet4',
      // 保留空值：旧文章没有 kind 字段时，前端按年份兜底判断是否真题
      kind: article.kind || '',
      origin: article.origin || 'import',
      source: article.source || '',
      year: article.year || 0,
      month: article.month || 0,
      paper: article.paper || 0,
      passage: article.passage || 0,
      words: article.wordCount || 0,
      // 旧文章没有 topic 字段：下面会从正文补算
      topic: article.topic || ''
    }))
  // 列表里缺主题的文章就地补一次，否则用户必须逐篇点开才看得到。
  // 只取缺主题的、最多 12 篇，避免一次拉回几十万字正文
  await fillTopics(openid, items)
  // 「已学完 / 学了 x%」标记：进度文档与站点总数合起来算
  await attachProgress(openid, items, result.data || [])
  return success(items)
}

// 学习单元里有多少条内容要学：站点总数变了解析结果才变，
// 所以只在保存解析结果时算一次，缓存在文章文档上给列表用
function unitTotalsOf(unitData) {
  const data = unitData || {}
  const grammarPoints = Array.isArray(data.grammarPoints) ? data.grammarPoints : []
  // 与 percentOf / 前端 getProgress 同一口径：同方向同题干只算一道题
  const seen = new Set()
  const drillIds = []
  grammarPoints.forEach((point) => {
    ;(point && point.drills || []).forEach((drill) => {
      const key = `${drill.mode || ''}|${String(drill.prompt || '').trim().toLowerCase()}`
      if (!drill.id || seen.has(key)) return
      seen.add(key)
      drillIds.push(drill.id)
    })
  })
  return {
    vocabulary: Array.isArray(data.vocabulary) ? data.vocabulary.length : 0,
    grammarPoints: grammarPoints.length,
    phrases: Array.isArray(data.phrases) ? data.phrases.length : 0,
    drillIds
  }
}

// 进度文档里有没有动过：用来区分「收藏进题库但没学」和「学了一点」
function unitStarted(unit) {
  if (!unit) return false
  const records = unit.practiceRecords || {}
  return (unit.masteredWords || []).length > 0
    || (unit.grammarViewed || []).length > 0
    || (unit.phrasesViewed || []).length > 0
    || Object.keys(records).length > 0
}

// 与 percentOf 同一口径：四站各 25%，站内按完成条数比例连续计分。
// totals 缺失（老文章还没补算）时 percent 返回 null，前端只显示「学过」
function progressOf(totals, unit) {
  const mastered = (unit && Array.isArray(unit.masteredWords) ? unit.masteredWords : []).length
  if (!totals) return { percent: null, studied: unitStarted(unit), mastered, total: 0 }
  const records = (unit && unit.practiceRecords) || {}
  const drillIds = Array.isArray(totals.drillIds) ? totals.drillIds : []
  const passed = drillIds.filter((id) => records[id] && records[id].result === 'pass').length
  const grammarViewed = (unit && Array.isArray(unit.grammarViewed) ? unit.grammarViewed : []).length
  const phrasesViewed = (unit && Array.isArray(unit.phrasesViewed) ? unit.phrasesViewed : []).length
  const ratio = (done, total) => (total > 0 ? Math.min(1, done / total) : 1)
  const percent = Math.round((ratio(mastered, Number(totals.vocabulary) || 0)
    + ratio(phrasesViewed, Number(totals.phrases) || 0)
    + ratio(grammarViewed, Number(totals.grammarPoints) || 0)
    + ratio(passed, drillIds.length)) * 25)
  return { percent, studied: unitStarted(unit), mastered, total: Number(totals.vocabulary) || 0 }
}

// 列表项补上进度字段：进度数组来自 article_units，站点总数来自文章上的 unitTotals
async function attachProgress(openid, items, rows) {
  if (!items.length) return
  const ids = items.map((item) => item._id)
  const units = new Map()
  try {
    const res = await db.collection('article_units')
      .where({ openid, articleId: _.in(ids) })
      .field({
        articleId: true,
        masteredWords: true,
        grammarViewed: true,
        phrasesViewed: true,
        practiceRecords: true
      })
      .limit(100)
      .get()
    ;(res.data || []).forEach((unit) => units.set(unit.articleId, unit))
  } catch (error) {
    // 进度只是列表标记，查不到不影响题库本身
    return
  }
  const totals = new Map(rows.map((row) => [row._id, row.unitTotals || null]))
  // 老文章没缓存过站点总数：只给已经学过的补算，最多 20 篇一次，
  // 补完写回 unitTotals，下次列表直接读缓存
  const missing = items.filter((item) => units.has(item._id)
    && unitStarted(units.get(item._id)) && !totals.get(item._id)).slice(0, 20)
  if (missing.length) {
    const filled = await backfillTotals(openid, missing.map((item) => item._id))
    filled.forEach((value, id) => totals.set(id, value))
  }
  items.forEach((item) => {
    const progress = progressOf(totals.get(item._id), units.get(item._id))
    item.percent = progress.percent
    item.studied = progress.studied
    item.mastered = progress.mastered
    item.vocabulary = progress.total
  })
}

// 旧文章补算站点总数：单独查一次解析结果（不带正文），算完回写文章文档
async function backfillTotals(openid, ids) {
  const filled = new Map()
  try {
    const res = await db.collection('articles')
      .where({ openid, _id: _.in(ids) })
      .field({ unitData: true })
      .limit(ids.length)
      .get()
    await Promise.all((res.data || []).map(async (row) => {
      if (!row.unitData) return
      const totals = unitTotalsOf(row.unitData)
      filled.set(row._id, totals)
      try {
        await db.collection('articles').doc(row._id).update({ data: { unitTotals: totals } })
      } catch (error) {
        // 回写失败不影响本次展示，下次列表再补
      }
    }))
  } catch (error) {
    // 查询失败就都不标，下次再试
  }
  return filled
}

// 给列表里没有主题的文章补算：查正文 → 关键词打分 → 回写数据库并更新返回值
async function fillTopics(openid, items) {
  const missing = items.filter((item) => !item.topic).slice(0, 12)
  if (!missing.length) return
  let rows = []
  try {
    const res = await db.collection('articles')
      .where({ openid, _id: _.in(missing.map((item) => item._id)) })
      .field({ title: true, ocrText: true })
      .get()
    rows = res.data || []
  } catch (error) {
    return
  }
  const byId = new Map(rows.map((row) => [row._id, row]))
  await Promise.all(missing.map(async (item) => {
    const row = byId.get(item._id)
    const topic = guessTopic((row && row.ocrText) || '', (row && row.title) || item.title)
    if (!topic) return
    item.topic = topic
    try {
      await db.collection('articles').where({ _id: item._id, openid }).update({ data: { topic } })
    } catch (error) {
      // 回写失败不影响本次展示，下次列表再补
    }
  }))
}

// 文章是否已经有可用的规则解析结果。
// 词汇可以为空（已记住的词不再返回），只要还有词组或语法点就算解析完成，
// 否则这类文章每次打开都会被误判成「没解析」而反复调用模型
function hasUnitData(article) {
  const unitData = (article && article.unitData) || {}
  return ['vocabulary', 'phrases', 'grammarPoints']
    .some((key) => Array.isArray(unitData[key]) && unitData[key].length > 0)
}

// 解析结果是不是用旧版抽取规则生成的（旧数据没有 extractVersion）
function isExtractOutdated(article) {
  if (!hasUnitData(article)) return false
  return Number(article.unitData.extractVersion || 0) < EXTRACT_VERSION
}

// 把文章切换成「当前正在精读」的那一篇
async function markCurrent(openid, articleId) {
  await db.collection('articles').where({ _id: articleId, openid }).update({
    data: {
      // 今天打开的就是今天精读的文章；排队标记随之取消
      queued: false,
      startedOn: todayKey(),
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  })
}

// 旧文章没有主题字段：点开时用正文补一次，题库列表下次刷新就能看到
async function ensureTopic(openid, article) {
  if (!article || article.topic) return
  const topic = guessTopic(article.ocrText || '', article.title || '')
  if (!topic) return
  try {
    await db.collection('articles').where({ _id: article._id, openid }).update({ data: { topic } })
  } catch (error) {
    // 主题只是展示字段，写失败不影响打开文章
  }
}

// 题库里点开文章的过渡页：只读返回正文、出处与已解析好的内容摘要。
// 不切当前文章、不校验 35% 门槛，用户看完目标点「开始学习」才真正进入精读
async function previewArticle(openid, event) {
  const articleId = typeof event.articleId === 'string' ? event.articleId.trim() : ''
  if (!articleId) return failure(400, 'articleId 不能为空')
  const article = await findArticle(openid, articleId)
  if (!article) return failure(404, '文章不存在或无权访问')
  await ensureTopic(openid, article)
  // 只有解析结果是最新规则时才能直接复用，否则交给客户端重新解析
  const ready = hasUnitData(article) && !isExtractOutdated(article)
  const unitData = ready ? (article.unitData || {}) : {}
  const vocabulary = (Array.isArray(unitData.vocabulary) ? unitData.vocabulary : []).map((item) => ({
    word: item.word,
    meanings: (Array.isArray(item.meanings) ? item.meanings : []).slice(0, 2)
      .map((meaning) => ({ pos: meaning.pos || '', definition: meaning.definition || '', count: meaning.count || '' }))
  }))
  const phrases = (Array.isArray(unitData.phrases) ? unitData.phrases : []).map((item) => ({
    phrase: item.phrase,
    meaning: item.meaning || ''
  }))
  const grammarPoints = (Array.isArray(unitData.grammarPoints) ? unitData.grammarPoints : []).map((item) => ({
    pattern: item.pattern || '',
    sentence: item.sentence || ''
  }))
  const translation = Array.isArray(unitData.fullTranslation) ? unitData.fullTranslation : []
  const text = article.ocrText || ''

  return success({
    articleId,
    title: article.title || '',
    level: article.level === 'cet6' ? 'cet6' : 'cet4',
    text,
    wordCount: article.wordCount || (text.match(/[A-Za-z][A-Za-z'-]*/g) || []).length,
    year: article.year || 0,
    month: article.month || 0,
    paper: article.paper || 0,
    passage: article.passage || 0,
    ready,
    // 没解析过：客户端在这里解析，已记住的词/词组/语法要一起带过去
    remembered: ready ? null : await loadRemembered(openid),
    cached: { vocabulary, phrases, grammarPoints, translation }
  })
}

// 切回某篇旧文章：已有解析结果就直接切换；没解析过、或用旧抽取规则解析过的，
// 把正文交给客户端重新解析。解析不走云函数嵌套调用：客户端直接调 analyzeArticle，
// 成功后用 saveUnit 回传落库
async function openArticle(openid, event) {
  const articleId = typeof event.articleId === 'string' ? event.articleId.trim() : ''
  if (!articleId) return failure(400, 'articleId 不能为空')
  const article = await findArticle(openid, articleId)
  if (!article) return failure(404, '文章不存在或无权访问')
  await ensureTopic(openid, article)
  // 切到已入库的文章只受 35% 门槛限制
  const blocked = await checkSwitch(openid, articleId)
  if (blocked) return blocked

  if (!hasUnitData(article) || isExtractOutdated(article)) {
    // 客户端会直接调 analyzeArticle，已记住的词/词组/语法要一起带过去，
    // 否则客户端解析出来的还是老的一套内容，第二次照样出现
    const remembered = await loadRemembered(openid)
    return success({
      needsAnalysis: true,
      articleId,
      text: article.ocrText || '',
      level: article.level === 'cet6' ? 'cet6' : 'cet4',
      title: article.title,
      remembered,
      // old 表示这篇文章之前解析过，只是抽取规则升级了，前端可以给出对应提示
      outdated: isExtractOutdated(article)
    })
  }

  await markCurrent(openid, articleId)
  const unit = await ensureUnit(openid, articleId)
  const safe = sanitizeStudy(article, unit)
  return success({ article: safe.article, unit: safe.unit })
}

// 客户端解析完成后把学习单元回传：校验结构、落库、切换成当前文章
async function saveUnit(openid, event) {
  const articleId = typeof event.articleId === 'string' ? event.articleId.trim() : ''
  if (!articleId) return failure(400, 'articleId 不能为空')
  const unitData = event.unitData
  if (!unitData || typeof unitData !== 'object') return failure(400, '学习单元数据不能为空')
  if (!Array.isArray(unitData.vocabulary)) {
    return failure(422, '这篇正文没能解析出可学习的单词，换一篇试试')
  }
  // 词汇可以为空（已记住的内容不再返回），但三类内容全空说明解析其实没成功
  const grammarList = Array.isArray(unitData.grammarPoints) ? unitData.grammarPoints : []
  const phraseList = Array.isArray(unitData.phrases) ? unitData.phrases : []
  if (!unitData.vocabulary.length && !grammarList.length && !phraseList.length) {
    return failure(422, '这篇正文没能解析出可学习的单词，换一篇试试')
  }
  if (!Array.isArray(unitData.grammarPoints) || !Array.isArray(unitData.phrases) || unitData.version !== 3) {
    return failure(400, '学习单元数据不完整，请重新解析')
  }
  // 服务端补版本号：解析结果来自哪一版抽取规则由这里兜底，
  // 避免客户端漏传导致每次选中都判定「旧版本」反复重解析
  const incoming = Object.assign({}, unitData, { extractVersion: EXTRACT_VERSION })
  const article = await findArticle(openid, articleId)
  if (!article) return failure(404, '文章不存在或无权访问')
  const blocked = await checkSwitch(openid, articleId)
  if (blocked) return blocked
  // 规则升级后的重解析：按词条文本把旧进度映射到新 id，不清空
  const rebuilding = isExtractOutdated(article)

  // 归属已由 findArticle 校验过，这里按 _id 单文档写，避免 where 批量写
  await db.collection('articles').doc(articleId).update({
    data: {
      // 文档里 unitData 初始是 null，必须整体替换，不能拆成点号路径
      unitData: _.set(incoming),
      // 站点总数缓存：题库列表按它算「已学完 / 学了 x%」
      unitTotals: _.set(unitTotalsOf(incoming)),
      // 规则结果已就绪，AI 精讲由工作台随后异步触发
      aiStatus: 'pending',
      // 重新解析后旧的「超纲词未补全」标记作废，等新一轮精讲重新判定
      wordsPending: false,
      aiAt: _.remove(),
      updatedAt: db.serverDate()
    }
  })
  // 首次解析出来的 id 与旧进度对不上，进度清零
  if (rebuilding) await remapProgress(openid, articleId, article.unitData, incoming)
  else await clearProgress(openid, articleId)
  await markCurrent(openid, articleId)
  const unit = await ensureUnit(openid, articleId)
  const fresh = await findArticle(openid, articleId)
  // 兜底用刚写入的内容组装返回，避免查询异常时前端拿到空文章
  const safe = sanitizeStudy(fresh || Object.assign({}, article, { unitData: incoming, queued: false }), unit)
  return success({ article: safe.article, unit: safe.unit })
}

// 删除自己导入的文章：正文与学习进度一起删，收藏夹（生词/词组/语法本）不受影响
async function deleteArticle(openid, event) {
  const articleId = typeof event.articleId === 'string' ? event.articleId.trim() : ''
  if (!articleId) return failure(400, 'articleId 不能为空')
  const article = await findArticle(openid, articleId)
  if (!article) return failure(404, '文章不存在或无权访问')
  if (article.isDemo) return failure(400, '示例文章不能删除')
  await db.collection('articles').where({ _id: articleId, openid }).remove()
  await db.collection('article_units').where({ articleId, openid }).remove()
  // 判题流水一并清掉，避免留下打不开这篇文章的孤儿记录
  try {
    await db.collection('attempts').where({ articleId, openid }).remove()
  } catch (error) {
    console.log('[delete] attempts cleanup skipped', { articleId })
  }
  return success({ deleted: true })
}

// 补/改考试年份：早期导入的真题没填年份，会落在「未标年份」分组里。
// 只改年份与归档类型，不动正文、解析结果和学习进度
async function setYear(openid, event) {
  const articleId = typeof event.articleId === 'string' ? event.articleId.trim() : ''
  if (!articleId) return failure(400, 'articleId 不能为空')
  const year = Number(event.year)
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return failure(400, '年份不合法')
  // 月份可选：四六级一年两次（6 月、12 月），0 表示不标
  const month = event.month === undefined ? null : Number(event.month)
  if (month !== null && [0, 6, 12].indexOf(month) < 0) return failure(400, '月份不合法')
  const article = await findArticle(openid, articleId)
  if (!article) return failure(404, '文章不存在或无权访问')
  if (article.origin === 'bank') return failure(400, '内置模拟篇不需要年份')
  const data = { year, kind: 'real', updatedAt: db.serverDate() }
  if (month !== null) data.month = month
  await db.collection('articles').where({ _id: articleId, openid }).update({ data })
  return success({ year, month: month === null ? article.month || 0 : month })
}

async function resetStudy(openid, event) {
  const { articleId } = event
  if (typeof articleId !== 'string' || !articleId.trim()) return failure(400, 'articleId 不能为空')

  const article = await findArticle(openid, articleId)
  if (!article) return failure(404, '文章不存在或无权访问')

  const unit = await ensureUnit(openid, articleId)
  const result = await db.collection('article_units').where({
    _id: unit._id,
    openid,
    articleId
  }).update({
    data: {
      masteredWords: [],
      grammarViewed: [],
      phrasesViewed: [],
      practiceRecords: _.remove(),
      version: _.inc(1),
      updatedAt: db.serverDate()
    }
  })

  if (!result.stats || result.stats.updated !== 1) {
    return failure(409, '学习进度重置失败，请刷新后重试')
  }

  return success(await findUnit(openid, articleId))
}

// 汇总统计：跨全部文章统计掌握篇数与累计通过题数，示例文章不计入
async function overview(openid) {
  const articleResult = await db.collection('articles')
    .where({ openid, isDemo: false })
    .limit(100)
    .get()
  const articles = articleResult.data || []
  const unitResult = await db.collection('article_units').where({ openid }).limit(100).get()
  const unitMap = {}
  ;(unitResult.data || []).forEach((unit) => { unitMap[unit.articleId] = unit })

  let masteredArticles = 0
  let passedDrills = 0
  let drillTotal = 0
  // 老版本的掌握记录不在 known_words 里，汇总时顺手回填一次
  const backfill = []

  articles.forEach((article) => {
    const unit = unitMap[article._id]
    if (!unit) return
    const unitData = article.unitData || {}
    const vocabulary = Array.isArray(unitData.vocabulary) ? unitData.vocabulary : []
    const grammarPoints = Array.isArray(unitData.grammarPoints) ? unitData.grammarPoints : []
    const phrases = Array.isArray(unitData.phrases) ? unitData.phrases : []
    const drills = []
    grammarPoints.forEach((point) => {
      ;(point.drills || []).forEach((drill) => drills.push(drill))
    })
    const drillIds = new Set(drills.map((drill) => drill.id))
    const records = unit.practiceRecords || {}
    // 同一道题重写多次只算一题，取最终状态
    const passed = Object.keys(records)
      .filter((key) => drillIds.has(key) && records[key] && records[key].result === 'pass').length
    passedDrills += passed
    drillTotal += drills.length
    // 与学习页口径一致：本篇单词全掌握、语法点全看、词组全看、练习全通过
    const vocab = vocabProgressOf(unit, vocabulary)
    const checks = [
      vocab.vocabMastered >= vocab.vocabTotal,
      grammarPoints.length === 0 || (unit.grammarViewed || []).length >= grammarPoints.length,
      phrases.length === 0 || (unit.phrasesViewed || []).length >= phrases.length,
      drills.length === 0 || passed >= drills.length
    ]
    if (checks.every(Boolean)) masteredArticles += 1

    const byId = new Map(vocabulary.map((item) => [item.id, item]))
    ;(unit.masteredWords || []).forEach((id) => {
      const item = byId.get(id)
      if (item) backfill.push({ word: item.word, meanings: item.meanings, phonetic: item.phonetic, source: 'mastered' })
    })
  })

  if (backfill.length) {
    try {
      await mergeKnownWords(openid, backfill, [])
    } catch (error) {
      console.log('[study] backfill known words skipped')
    }
  }

  return success({ articleTotal: articles.length, masteredArticles, passedDrills, drillTotal })
}

exports.main = async (event = {}) => {
  try {
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return failure(401, '无法确认用户身份')
    await ensureCollections()

    switch (event.action) {
      case 'get':
        return await getStudy(OPENID)
      case 'update':
        return await updateStudy(OPENID, event)
      case 'reset':
        return await resetStudy(OPENID, event)
      case 'saveArticle':
        return await saveArticle(OPENID, event)
      case 'importArticle':
        return await importArticle(OPENID, event)
      case 'listArticles':
        return await listArticles(OPENID)
      case 'previewArticle':
        return await previewArticle(OPENID, event)
      case 'openArticle':
        return await openArticle(OPENID, event)
      case 'saveUnit':
        return await saveUnit(OPENID, event)
      case 'deleteArticle':
        return await deleteArticle(OPENID, event)
      case 'setYear':
        return await setYear(OPENID, event)
      case 'overview':
        return await overview(OPENID)
      case 'remembered':
        // 工作台兜底解析时客户端拿不到文章对象上的已记住清单，单独取一次
        return success(await loadRemembered(OPENID))
      default:
        return failure(400, '不支持的操作')
    }
  } catch (error) {
    // 把出错的动作和原因打出来，方便在云开发控制台精确定位
    const detail = (error && (error.errMsg || error.message)) || String(error || '')
    console.error('[study] action failed', { action: event.action, detail, stack: error && error.stack })
    return failure(500, detail ? `学习数据服务暂时不可用（${event.action}: ${String(detail).slice(0, 300)}）` : '学习数据服务暂时不可用')
  }
}
