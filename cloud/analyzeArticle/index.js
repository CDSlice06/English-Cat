const cloud = require('wx-server-sdk')
const crypto = require('crypto')
const { buildGrammarPoints, buildPhrases, appearsInText } = require('./unit')
const { enhanceUnit, translateFullText, DRILL_VERSION } = require('./llm')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 已经真正记住的内容：生词本/词组本里点过「记住了」的条目，加上在别的文章里
// 标记过掌握的单词。再次遇到时直接跳过，不再重复展示、也不再调用模型。
const KNOWN_COLLECTION = 'known_words'
const BOOK_COLLECTION = 'wordbooks'
const GRAMMAR_COLLECTION = 'grammarbooks'
// 共享精讲缓存：同一篇正文 + 级别 + 精讲版本只生成一次，其他用户导入同一篇时直接复用
const ARTICLE_CACHE = 'article_cache'
// 抽取规则版本：规则一变，共享缓存必须跟着失效（与 study 的 EXTRACT_VERSION 对齐）
const EXTRACT_VERSION = 11

function knownDocId(openid) {
  return `kw_${openid}`
}

function addKnown(map, item, source) {
  const word = String((item && item.word) || '').trim().toLowerCase()
  if (!word) return
  // 生词本的来源优先保留：它带的是用户收藏时的释义
  const exists = map.get(word)
  if (exists && exists.source === 'book' && source !== 'book') return
  map.set(word, {
    source: source === 'mastered' ? 'mastered' : 'book',
    meanings: Array.isArray(item && item.meanings) ? item.meanings : [],
    phonetic: (item && item.phonetic) || ''
  })
}

function normPhrase(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim()
}

// 语法点按「名称」归一：规则 key（by-oneself）和模型句型名（by + 反身代词）都要能对上
function normGrammar(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '')
}

function emptyLearned() {
  return { words: new Map(), phrases: new Set(), grammars: new Set() }
}

// 服务端（study）解析时直接传入已记住的数组，避免嵌套调用里拿不到 OPENID
function learnedFromEvent(event) {
  if (!Array.isArray(event.knownWords) && !Array.isArray(event.knownPhrases)
    && !Array.isArray(event.knownGrammarKeys)) return null
  const learned = emptyLearned()
  ;(Array.isArray(event.knownWords) ? event.knownWords : []).forEach((item) => {
    addKnown(learned.words, item, (item && item.source) === 'mastered' ? 'mastered' : 'book')
  })
  ;(Array.isArray(event.knownPhrases) ? event.knownPhrases : []).forEach((item) => {
    const key = normPhrase(item)
    if (key) learned.phrases.add(key)
  })
  ;(Array.isArray(event.knownGrammarKeys) ? event.knownGrammarKeys : []).forEach((item) => {
    const key = normGrammar(item)
    if (key) learned.grammars.add(key)
  })
  return learned
}

// 只收「已经记住」的条目：只是收进本子但还没点记住的词/词组还要继续学
async function loadLearned(openid) {
  const learned = emptyLearned()
  if (!openid) return learned
  try {
    const res = await db.collection(BOOK_COLLECTION).where({ openid }).limit(1000).get()
    ;((res && res.data) || []).forEach((item) => {
      if (!item || item.state !== 'known') return
      // 词组收藏不算单词；老数据没有 entryType，用词性兜底判断
      const isPhrase = item.entryType === 'phrase'
        || (Array.isArray(item.meanings) && item.meanings.some((meaning) => meaning && meaning.pos === 'phr.'))
      if (isPhrase) {
        const key = normPhrase(item.word)
        if (key) learned.phrases.add(key)
        return
      }
      addKnown(learned.words, item, 'book')
    })
  } catch (error) {
    // 生词本集合不存在时当作空，不影响解析
  }
  try {
    const res = await db.collection(KNOWN_COLLECTION).doc(knownDocId(openid)).get()
    const raw = res && res.data
    const doc = Array.isArray(raw) ? raw[0] : raw
    ;((doc && doc.items) || []).forEach((item) => addKnown(learned.words, item, (item && item.source) === 'mastered' ? 'mastered' : 'book'))
  } catch (error) {
    // 还没有跨文章掌握记录：正常情况
  }
  try {
    const res = await db.collection(GRAMMAR_COLLECTION).where({ openid }).limit(1000).get()
    ;((res && res.data) || []).forEach((item) => {
      if (!item) return
      const key = normGrammar(item.key)
      if (key) learned.grammars.add(key)
      const pattern = normGrammar(item.pattern)
      if (pattern) learned.grammars.add(pattern)
    })
  } catch (error) {
    // 语法本集合不存在时当作空
  }
  return learned
}

// 词典按需加载，加载失败时给出明确原因而不是整个函数崩溃
let dictCache = null
let dictError = ''

// 合并三份词库：cet（四六级大纲词） + common（基础高频词） + senses（熟词生义补丁）
// cet 优先，common 只补缺失词，senses 对已有词条追加义项或标记生义
function mergeEntries(base, patch) {
  if (!patch) return base
  const list = (base.meanings || []).slice()
  ;(patch.meanings || []).forEach((item) => {
    if (!item.pos || !item.def) return
    const segments = String(item.def).split(/[,，;；]/).map((s) => s.trim()).filter(Boolean)
    const hit = list.find((m) => m.pos === item.pos
      && segments.some((seg) => String(m.def).indexOf(seg) >= 0))
    if (hit) {
      if (item.rare) hit.rare = true
      return
    }
    list.push({ pos: item.pos, def: item.def, rare: !!item.rare })
  })
  return Object.assign({}, base, {
    ph: base.ph || patch.ph || '',
    tags: base.tags || patch.tags || 'core',
    frq: base.frq || 0,
    bnc: base.bnc || 0,
    collins: base.collins || 0,
    rank: base.rank || patch.rank || 0,
    meanings: list
  })
}

function dict() {
  if (dictCache) return dictCache
  try {
    const base = require('./cet.json')
    const common = require('./common.json')
    const extra = require('./extra.json')
    const senses = require('./senses.json')
    const merged = Object.assign({}, base)
    Object.keys(common).forEach((word) => {
      if (!merged[word]) merged[word] = common[word]
    })
    // 精选补充词库：大纲外的外刊进阶词、科技/健康/社科议题词、基础词缺口
    Object.keys(extra).forEach((word) => {
      if (!merged[word]) merged[word] = extra[word]
    })
    Object.keys(senses).forEach((word) => {
      merged[word] = mergeEntries(merged[word] || { ph: '', tags: 'core', frq: 0, bnc: 0, collins: 0, rank: 1500, meanings: [] }, senses[word])
    })
    // 派生词登记：cet 只在词根的 der 里给了派生词释义（abandonment / accessibility），
    // 词根本身是词条、派生词却不是，手动查词和联想都搜不到，这里按词根等级一并登记
    Object.keys(base).forEach((word) => {
      const entry = base[word]
      const list = entry && Array.isArray(entry.der) ? entry.der : []
      list.forEach((der) => {
        if (!der || !der.w || !der.def) return
        const key = String(der.w).trim().toLowerCase()
        if (!key || merged[key]) return
        merged[key] = {
          ph: '',
          tags: entry.tags || 'core',
          frq: entry.frq || 0,
          bnc: 0,
          collins: 0,
          rank: entry.rank || 0,
          meanings: [{ pos: der.pos || 'n.', def: String(der.def) }]
        }
      })
    })
    dictCache = merged
  } catch (error) {
    dictError = error && error.message ? error.message : String(error)
    dictCache = {}
  }
  return dictCache
}

const CATEGORY_OPTIONS = [
  { key: 'cet4', label: '四级词汇', shortLabel: '四级' },
  { key: 'cet6', label: '六级词汇', shortLabel: '六级' },
  { key: 'familiar', label: '熟词生义', shortLabel: '熟词生义' },
  { key: 'difficult', label: '重难点词', shortLabel: '重难点' },
  { key: 'frequent', label: '高频词汇', shortLabel: '高频' }
]

const STOP_WORDS = new Set(('a an the and or but if of to in on at for with by from as is are was were be been being '
  + 'it its this that these those he she they we you i his her their our your my me him them us do does did '
  + 'have has had not no so than then there here what who whom which when where why how all any both each '
  + 'few more most other some such only own same too very can will just should now').split(' '))

function success(data) {
  return { code: 0, message: 'ok', data }
}

function failure(code, message) {
  return { code, message, data: null }
}

function timeOf(value) {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value
  if (typeof value === 'string') return new Date(value).getTime() || 0
  return 0
}

// 与前端、llm 云函数保持一致：非英文内容直接跳过增强，不发起模型请求
const NON_ENGLISH = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/

function isEnglishText(value) {
  const text = String(value || '')
  return /[A-Za-z]/.test(text) && !NON_ENGLISH.test(text)
}

// 精讲会把练习题从「规则示例句」换成「原文句子」，内容变了的旧判题记录必须清掉，
// 否则同一道题 id 复用了，用户会看到自己没做过的题显示已通过
function drillMap(unitData) {
  const map = {}
  const points = unitData && Array.isArray(unitData.grammarPoints) ? unitData.grammarPoints : []
  points.forEach((point) => {
    ;(point.drills || []).forEach((drill) => {
      if (drill && drill.id) map[drill.id] = drill
    })
  })
  return map
}

function staleDrillIds(before, after) {
  const oldMap = drillMap(before)
  const nextMap = drillMap(after)
  return Object.keys(nextMap).filter((key) => oldMap[key]
    && (oldMap[key].prompt !== nextMap[key].prompt || oldMap[key].reference !== nextMap[key].reference))
}

// 带版本校验写回：模型运行期间文章被重新解析过（updatedAt 变了）就放弃这次结果，
// 避免旧快照覆盖客户端刚保存的新 unitData
async function writeIfUnchanged(articleId, openid, stamp, data) {
  const condition = { _id: articleId, openid }
  if (stamp) condition.updatedAt = stamp
  const result = await db.collection('articles').where(condition).update({ data })
  return !!(result && result.stats && result.stats.updated)
}

// 抢占「AI 精讲运行中」状态：并发请求里只有抢到的那次真正调用模型。
// 直接写 running 是「先检查后写」，两个入口同时轮询时会各跑一遍、双倍计费
async function claimEnhance(articleId, openid, now) {
  const first = await db.collection('articles')
    .where({ _id: articleId, openid, aiStatus: _.neq('running') })
    .update({ data: { aiStatus: 'running', aiAt: db.serverDate() } })
  if (first && first.stats && first.stats.updated) return true
  // 函数被超时杀掉会停在 running，90 秒后允许接管上次没跑完的任务
  const stale = await db.collection('articles')
    .where({
      _id: articleId,
      openid,
      aiStatus: 'running',
      aiAt: _.lt(new Date(now - 90 * 1000))
    })
    .update({ data: { aiStatus: 'running', aiAt: db.serverDate() } })
  return !!(stale && stale.stats && stale.stats.updated)
}

// 共享精讲缓存：正文归一后取哈希，正文完全一致才命中。
// 缓存里只有我们自己生成的分析内容，不含用户身份信息。
function cacheIdOf(text, level) {
  const plain = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 10000)
  return `ac_${crypto.createHash('sha1').update(`${level}|${EXTRACT_VERSION}|${DRILL_VERSION}|${plain}`).digest('hex')}`
}

async function readArticleCache(id) {
  try {
    const res = await db.collection(ARTICLE_CACHE).doc(id).get()
    const doc = (res && res.data) || null
    if (!doc || !doc.unitData || doc.drillVersion !== DRILL_VERSION) return null
    return doc
  } catch (error) {
    // 集合还没建或没有这条缓存，都当作未命中
    return null
  }
}

async function writeArticleCache(id, level, unitData) {
  // 缓存是给所有用户复用的：去掉「本用户已掌握」这类个人标记
  const copy = JSON.parse(JSON.stringify(unitData || {}))
  copy.vocabulary = (copy.vocabulary || []).map((item) => {
    const next = Object.assign({}, item)
    delete next.known
    return next
  })
  const data = { level, drillVersion: DRILL_VERSION, unitData: _.set(copy), updatedAt: db.serverDate() }
  try {
    await db.collection(ARTICLE_CACHE).doc(id).set({ data })
  } catch (error) {
    // 首次使用时集合可能还不存在：建一次再写，仍失败就放弃缓存
    try {
      await db.createCollection(ARTICLE_CACHE)
      await db.collection(ARTICLE_CACHE).doc(id).set({ data })
    } catch (again) {
      console.log('[ai-analyze] cache write failed', { message: again && again.message })
    }
  }
}

// 缓存来自别的用户：对方已经掌握的词/词组/语法点要去掉，保持本用户的抽取口径
function applyLearned(unitData, learned) {
  if (!unitData) return {}
  const copy = JSON.parse(JSON.stringify(unitData))
  const words = learned && learned.words instanceof Map ? learned.words : new Map()
  const phrases = learned && learned.phrases instanceof Set ? learned.phrases : new Set()
  const grammars = learned && learned.grammars instanceof Set ? learned.grammars : new Set()
  copy.vocabulary = (Array.isArray(copy.vocabulary) ? copy.vocabulary : [])
    .filter((item) => item && !words.has(String(item.word || '').toLowerCase()))
  copy.phrases = (Array.isArray(copy.phrases) ? copy.phrases : [])
    .filter((item) => item && !phrases.has(normPhrase(item.phrase)))
  copy.grammarPoints = (Array.isArray(copy.grammarPoints) ? copy.grammarPoints : [])
    .filter((item) => item && !grammars.has(normGrammar(item.pattern)))
  return copy
}

// 异步 AI 增强：规则结果先落库，模型结果只做补充；任何失败都保留原内容
async function enhanceArticle(openid, articleId) {
  if (!openid) return failure(401, '无法确认用户身份')
  const id = typeof articleId === 'string' ? articleId.trim() : ''
  if (!id) return failure(400, 'articleId 不能为空')

  const found = await db.collection('articles').where({ _id: id, openid }).limit(1).get()
  const article = (found.data && found.data[0]) || null
  if (!article) return failure(404, '文章不存在或无权访问')
  if (article.isDemo) return success({ skipped: true, reason: 'demo' })
  if (!article.ocrText) return failure(400, '文章正文为空')

  if (!isEnglishText(article.ocrText)) {
    await db.collection('articles').where({ _id: id, openid }).update({
      data: { aiStatus: 'skipped', aiAt: db.serverDate() }
    })
    return success({ skipped: true, reason: 'not-english' })
  }

  const now = Date.now()
  // 同一个用户连续触发时只跑一次，避免重复计费；
  // 函数被超时杀掉会停在 running，90 秒后允许重新触发
  if (article.aiStatus === 'running' && now - timeOf(article.aiAt) < 90 * 1000) {
    return success({ skipped: true, reason: 'running' })
  }
  // 刚失败过的十分钟内不再重试，避免用户反复进页面时反复调用模型
  if (article.aiStatus === 'failed' && Date.now() - timeOf(article.aiAt) < 10 * 60 * 1000) {
    return success({ skipped: true, reason: 'failed-recently' })
  }
  // 旧版本可能在语法精讲失败时仍把状态写成 ready，导致练习题永远停在固定示例题；
  // 旧版精讲用的是文章原句当题目，版本不一致也允许重新增强
  const points = article.unitData && Array.isArray(article.unitData.grammarPoints)
    ? article.unitData.grammarPoints
    : []
  const grammarEnhanced = points.some((point) => point
    && point.aiEnhanced === true
    && point.drillVersion === DRILL_VERSION)
  // 版本号不一致（含旧数据没有版本号）的卡片直接重做，不等十分钟，
  // 否则用户会一直看到错配的旧内容
  const versionOutdated = points.some((point) => point && point.drillVersion !== DRILL_VERSION)
  const vocabulary = article.unitData && Array.isArray(article.unitData.vocabulary)
    ? article.unitData.vocabulary
    : []
  // 旧文章没有 wordsPending 标记：按「还有词没释义」补判，
  // 否则这些词永远停在「正在补全」的占位文案上
  // 已认识的词不会再交给模型解释，不能算进「待补全」，否则会一直让客户端轮询
  const missingWords = vocabulary.filter((item) => item && item.known !== true
    && !(Array.isArray(item.meanings) && item.meanings.length)).length
  // 语法已经讲完、只是超纲词还没补全：只补词，一分钟内不重复触发
  const wordsOnly = article.aiStatus === 'ready' && grammarEnhanced && !versionOutdated
    && (article.wordsPending === true || missingWords > 0)
  if (wordsOnly && Date.now() - timeOf(article.aiAt) < 60 * 1000) {
    return success({ skipped: true, reason: 'words-recently' })
  }
  if (article.aiStatus === 'ready' && points.length && !grammarEnhanced && !versionOutdated
    && !wordsOnly && Date.now() - timeOf(article.aiAt) < 10 * 60 * 1000) {
    return success({ skipped: true, reason: 'grammar-pending' })
  }

  const claimed = await claimEnhance(id, openid, now)
  if (!claimed) return success({ skipped: true, reason: 'running' })
  // 抢到执行权后重读一次：抢占前拿到的可能是旧快照，
  // 直接拿旧 unitData 去写回会覆盖这期间客户端刚保存的新解析结果
  const claimedDoc = await db.collection('articles').where({ _id: id, openid }).limit(1).get()
  const current = (claimedDoc.data && claimedDoc.data[0]) || article

  try {
    // 已经在生词本/词组本/语法本里点过「记住了」的内容不再让模型重复讲
    const learned = await loadLearned(openid)
    const level = current.level === 'cet6' ? 'cet6' : 'cet4'
    const cacheId = cacheIdOf(current.ocrText, level)
    // 别人导入过同一篇、且精讲版本一致：直接复用，零模型调用
    const cached = await readArticleCache(cacheId)
    if (cached) {
      const merged = applyLearned(cached.unitData, learned)
      // 本用户已有的全文对照不能被缓存覆盖掉
      const ownTranslation = current.unitData && current.unitData.fullTranslation
      if (!merged.fullTranslation && ownTranslation) merged.fullTranslation = ownTranslation
      const written = await writeIfUnchanged(id, openid, current.updatedAt, {
        unitData: _.set(merged),
        aiStatus: 'ready',
        wordsPending: false,
        aiAt: db.serverDate(),
        updatedAt: db.serverDate()
      })
      if (!written) {
        await db.collection('articles').where({ _id: id, openid, aiStatus: 'running' }).update({
          data: { aiStatus: 'pending', aiAt: db.serverDate() }
        })
        return success({ changed: false, aborted: true })
      }
      const stale = staleDrillIds(current.unitData, merged)
      if (stale.length) {
        const patch = {}
        stale.forEach((drillId) => { patch[`practiceRecords.${drillId}`] = db.command.remove() })
        try {
          await db.collection('article_units').where({ articleId: id, openid }).update({ data: patch })
        } catch (error) {
          console.log('[ai-analyze] clear stale records failed', { count: stale.length })
        }
      }
      // 命中次数只用于观察缓存效果，写失败不影响用户
      db.collection(ARTICLE_CACHE).doc(cacheId).update({ data: { hits: _.inc(1) } }).catch(() => {})
      console.log('[ai-analyze] article cache hit', { articleId: id })
      return success({ changed: true, cached: true })
    }
    const result = await enhanceUnit(current.ocrText, level, current.unitData, { wordsOnly, learned })
    console.log('[ai-analyze] enhance done', {
      articleId: id,
      changed: result.changed,
      grammar: result.applied.grammar,
      grammarFailed: result.grammarFailed,
      wordsIncomplete: result.wordsIncomplete
    })
    // 语法精讲失败时练习题还是固定示例题，状态必须保留 failed，客户端才会计时重试；
    // 超纲词没补全会单独记 wordsPending，客户端只补词不重跑语法
    const nextStatus = result.grammarFailed ? 'failed' : 'ready'
    const wordsPending = !!result.wordsIncomplete
    if (!result.changed) {
      await writeIfUnchanged(id, openid, current.updatedAt, { aiStatus: nextStatus, wordsPending, aiAt: db.serverDate() })
      return success({ changed: false, failed: result.failed, applied: result.applied, wordsIncomplete: result.wordsIncomplete })
    }

    const written = await writeIfUnchanged(id, openid, current.updatedAt, {
      // 整体替换，避免普通 update 把对象拆成点号路径
      unitData: _.set(result.unitData),
      aiStatus: nextStatus,
      wordsPending,
      aiAt: db.serverDate(),
      updatedAt: db.serverDate()
    })
    if (!written) {
      // 模型生成的这几十秒里文章被重新解析过：丢弃本次旧结果，
      // 把状态交回 pending 让客户端按新内容重新触发，避免覆盖新数据
      await db.collection('articles').where({ _id: id, openid, aiStatus: 'running' }).update({
        data: { aiStatus: 'pending', aiAt: db.serverDate() }
      })
      console.log('[ai-analyze] enhance abandoned, article changed during run', { articleId: id })
      return success({ changed: false, aborted: true })
    }

    // 完整增强成功才写缓存：失败或半途的结果不缓存，避免别人复用残缺内容
    if (nextStatus === 'ready' && !wordsPending) {
      await writeArticleCache(cacheId, level, result.unitData)
    }

    const stale = staleDrillIds(current.unitData, result.unitData)
    if (stale.length) {
      const patch = {}
      stale.forEach((drillId) => { patch[`practiceRecords.${drillId}`] = db.command.remove() })
      try {
        await db.collection('article_units').where({ articleId: id, openid }).update({ data: patch })
      } catch (error) {
        console.log('[ai-analyze] clear stale records failed', { count: stale.length })
      }
    }

    return success({ changed: true, applied: result.applied })
  } catch (error) {
    console.error('enhanceArticle failed', error)
    try {
      await db.collection('articles').where({ _id: id, openid }).update({
        data: { aiStatus: 'failed', aiAt: db.serverDate() }
      })
    } catch (ignore) {}
    return failure(500, 'AI 精讲生成失败')
  }
}

function splitSentences(text) {
  return String(text)
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12 && /[a-zA-Z]/.test(s))
}

// 保留大小写取词：句中首字母大写或全大写缩写的多半是人名、地名、机构名，不该当生词。
// 撇号只允许出现在常见缩写/所有格里（don't / it's / firms'）；PDF 抽文本常丢空格，
// corporations'abusive 这种粘连必须拆成两个词，否则会变成一个查不到的超纲词
function wordsOf(sentence) {
  return sentence.match(/[A-Za-z]+(?:'(?:s|t|re|ve|ll|d|m)(?![A-Za-z]))?/gi) || []
}

function isNameLike(raw, atSentenceStart) {
  if (/^[A-Z]{2,}$/.test(raw)) return true
  return !atSentenceStart && /^[A-Z]/.test(raw)
}

// 词族归并：develop / development / developing 只留一个，避免同一篇里重复考同一个词根
function familyKey(word) {
  const lemma = toLemma(word) || word
  const derived = lemma.replace(/(ations?|itions?|tions?|sions?|ments?|nesses?|ities?|ances?|ences?|ables?|ibles?|ives?|ally|als?|ly|ers?|ors?|ists?|ings?|eds?)$/, '')
  return derived.length >= 4 ? derived : lemma
}

// 词形还原：按常见屈折规则回退到词库原形
function toLemma(word) {
  const DICT = dict()
  if (DICT[word]) return word
  // 先去 s 再去 es：rates 是 rate+s，剥 es 会得到 rat（另一个词）
  const rules = [
    [/ies$/, 'y'], [/ied$/, 'y'], [/ying$/, 'ie'],
    [/ing$/, ''], [/ing$/, 'e'], [/ed$/, ''], [/ed$/, 'e'],
    [/s$/, ''], [/es$/, ''], [/ly$/, ''], [/er$/, ''], [/est$/, '']
  ]
  for (const [pattern, replacement] of rules) {
    if (pattern.test(word)) {
      const candidate = word.replace(pattern, replacement)
      if (candidate.length > 2 && DICT[candidate]) return candidate
    }
  }
  if (/([bcdfghjklmnpqrstvwxz])\1(ed|ing)$/.test(word)) {
    const candidate = word.replace(/([bcdfghjklmnpqrstvwxz])\1(ed|ing)$/, '$1')
    if (DICT[candidate]) return candidate
  }
  return null
}

function hasRare(entry) {
  return (entry.meanings || []).some((m) => m.rare)
}

function categoriesOf(entry) {
  const categories = []
  const tags = entry.tags || ''
  if (tags.indexOf('c4') >= 0) categories.push('cet4')
  if (tags.indexOf('c6') >= 0) categories.push('cet6')
  const frq = entry.frq || 0
  const collins = entry.collins || 0
  const meanings = entry.meanings || []
  const posKinds = new Set(meanings.map((m) => m.pos))
  // 熟词生义：手工标注的生义优先；基础词（core）跨词性的多义也算
  const coreMultiple = tags.indexOf('core') >= 0 && meanings.length >= 2 && posKinds.size >= 2
  if (hasRare(entry) || coreMultiple || (meanings.length >= 3 && frq > 0 && frq < 4000)) categories.push('familiar')
  if ((frq > 2500 || (collins > 0 && collins <= 2)) && collins < 4) categories.push('difficult')
  if ((frq > 0 && frq < 1200) || collins >= 4) categories.push('frequent')
  // 基础词若没有任何分类，归入高频，避免在筛选页看不到
  if (!categories.length && tags.indexOf('core') >= 0) categories.push('frequent')
  return categories
}

// 词库把少数英式口语/冷僻义也标成了常规义项（crack 的「第一流的」「啪地一声」），
// 阅读场景要的是书面常用义，这些直接剔除，避免误导
const DROP_SENSES = {
  crack: ['第一流的', '啪地一声']
}

function isDroppedSense(word, def) {
  const list = DROP_SENSES[word]
  if (!list) return false
  return list.some((piece) => String(def || '').indexOf(piece) >= 0)
}

// 选取释义：同一词性的多条义项合并成一行（词库常把 n. 拆成好几条），
// 最多 limit 行；标了生义的义项优先保留，避免被常规义项挤掉
function pickMeanings(entry, limit, word) {
  const all = (entry.meanings || [])
    .filter((m) => m.pos && m.def && !isDroppedSense(word, m.def))
  const merged = []
  all.forEach((m) => {
    const hit = merged.find((item) => item.pos === m.pos)
    if (!hit) {
      merged.push({ pos: m.pos, def: m.def, rare: !!m.rare })
      return
    }
    if (hit.def.indexOf(m.def) < 0) hit.def = `${hit.def}；${m.def}`
    hit.rare = hit.rare || !!m.rare
  })
  if (merged.length <= limit) return merged
  const rare = merged.filter((m) => m.rare)
  const normal = merged.filter((m) => !m.rare)
  const keepRare = rare.slice(0, 2)
  const keepNormal = normal.slice(0, Math.max(1, limit - keepRare.length))
  return merged.filter((m) => keepNormal.indexOf(m) >= 0 || keepRare.indexOf(m) >= 0)
}

function toMeaning(m) {
  return { pos: m.pos, definition: m.def, rare: !!m.rare }
}

// 纯功能词（介词、连词等）不做生词展示，除非标注了生义
const FUNC_POS = new Set(['prep.', 'conj.', 'pron.', 'art.', 'num.', 'int.', 'aux.'])

function isFunctionWord(meanings) {
  return meanings.every((m) => !m.rare && FUNC_POS.has(m.pos))
}

// 难度分：frq 越大越少见，越值得讲；熟词生义永远排最前
function difficultyScore(entry, level) {
  const tags = entry.tags || ''
  const basic = tags.indexOf('core') >= 0 && !(entry.frq > 0)
  // common.json 里的基础词统一是 frq 0 / rank 2000，直接按 2000 算会挤掉真正的四六级词
  let score = entry.frq > 0 ? entry.frq : (basic ? 800 : (entry.rank || 2000))
  if (tags.indexOf('c6') >= 0) score += level === 'cet6' ? 700 : 250
  if (tags.indexOf('c4') >= 0 && level === 'cet4') score += 300
  // 熟词生义优先，但 tree 这类基础词的生义只是「顺带一提」，不该压过正文难词
  if (hasRare(entry)) score += basic ? 1200 : 5000
  return score
}

// 词典条目里有没有动词义项：决定变形词是「还原成动词原形」还是「保留原文写法」
function hasVerbSense(entry) {
  return (entry.meanings || []).some((m) => m.pos === 'v.' && m.def)
}

// 动词变形 → 原形：用词库自带的 forms 反查，覆盖 went / taken 这类不规则变形
let verbFormCache = null
function verbFormIndex() {
  if (verbFormCache) return verbFormCache
  const DICT = dict()
  const index = {}
  Object.keys(DICT).forEach((base) => {
    const entry = DICT[base]
    const forms = entry && entry.forms
    if (!forms || !hasVerbSense(entry)) return
    ;['third', 'past', 'pp', 'ing'].forEach((key) => {
      const value = typeof forms[key] === 'string' ? forms[key].trim().toLowerCase() : ''
      if (value && value !== base && !index[value]) index[value] = base
    })
  })
  verbFormCache = index
  return index
}

// 抽取口径：动词一律取原形，名词/形容词/副词等按原文写法保留。
// 词库没收录的超纲词返回 entry: null，交给后面的「超纲词」分支处理
function resolveHead(surface) {
  const DICT = dict()
  if (DICT[surface]) return { head: surface, entry: DICT[surface] }
  const base = verbFormIndex()[surface]
  if (base && DICT[base]) return { head: base, entry: DICT[base] }
  const lemma = toLemma(surface)
  if (lemma && DICT[lemma]) {
    // 原形是动词才改写；corporations 这类名词复数保留原文写法，只借用原形释义
    return hasVerbSense(DICT[lemma])
      ? { head: lemma, entry: DICT[lemma] }
      : { head: surface, entry: DICT[lemma] }
  }
  return { head: surface, entry: null }
}

// 派生词：implementation / abusive / dramatically 这类词库没单收，
// 但词根就是四六级词，不能算超纲词
const DERIV_STRIP = [
  [/ically$/, 'y'], [/ical$/, 'y'], [/ically$/, 'ic'], [/ical$/, 'ic'],
  [/ations?$/, ''], [/itions?$/, ''], [/tions?$/, ''], [/sions?$/, ''],
  [/ments?$/, ''], [/ances?$/, ''], [/ences?$/, ''],
  [/enc(?:y|ies)$/, 'ent'], [/anc(?:y|ies)$/, 'ant'],
  [/ities$/, 'y'], [/ity$/, ''], [/ness(es)?$/, ''],
  [/ships?$/, ''], [/ery$/, 'e'], [/ests?$/, ''],
  [/ables?$/, ''], [/ibles?$/, ''], [/ively$/, ''], [/atives?$/, ''], [/itives?$/, ''], [/sives?$/, ''], [/ives?$/, ''],
  [/ably$/, 'able'], [/ibly$/, 'ible'],
  [/ously$/, ''], [/ous$/, ''], [/ally$/, ''], [/als?$/, ''], [/ly$/, ''],
  [/ists?$/, ''], [/isms?$/, ''], [/izes?$/, ''], [/ises?$/, ''], [/ify$/, ''],
  [/ings?$/, ''], [/eds?$/, ''],
  [/ers?$/, ''], [/ors?$/, ''], [/ants?$/, ''], [/ents?$/, '']
]

function derivStems(word) {
  const stems = []
  for (const [pattern, replacement] of DERIV_STRIP) {
    if (!pattern.test(word)) continue
    const stem = word.replace(pattern, replacement)
    // 允许 3 个字母的词干：tiredness → tired → tir + e = tire
    if (stem.length >= 3) stems.push(stem)
  }
  return stems
}

// 词库没有原词时，按派生后缀逐层回退找词根（noticeably → noticeable → notice），
// 词根必须是四六级/核心词才算数
function resolveDerivative(word) {
  const DICT = dict()
  const queue = derivStems(word).map((stem) => ({ stem, depth: 1 }))
  const seen = new Set()
  while (queue.length) {
    const node = queue.shift()
    if (seen.has(node.stem)) continue
    seen.add(node.stem)
    for (const candidate of [node.stem, `${node.stem}e`]) {
      const entry = DICT[candidate]
      if (!entry) continue
      const tags = entry.tags || ''
      if (tags.indexOf('c4') < 0 && tags.indexOf('c6') < 0 && tags.indexOf('core') < 0) continue
      return { word: candidate, entry }
    }
    if (node.depth < 2) {
      derivStems(node.stem).forEach((stem) => queue.push({ stem, depth: node.depth + 1 }))
    }
  }
  return null
}

// 词库的 der 列表本身带派生词释义（abusive adj. 恶言谩骂的…），
// 直接反查比让模型猜更准，也不用等 AI 补全
let derIndexCache = null
function derIndex() {
  if (derIndexCache) return derIndexCache
  const DICT = dict()
  const index = {}
  Object.keys(DICT).forEach((base) => {
    const list = DICT[base] && Array.isArray(DICT[base].der) ? DICT[base].der : []
    list.forEach((der) => {
      if (!der || !der.w || !der.def) return
      const key = String(der.w).trim().toLowerCase()
      if (key && !index[key]) index[key] = { base, pos: der.pos || '', definition: String(der.def) }
    })
  })
  derIndexCache = index
  return index
}

// 连字符/空格归一：like-minded 与 likeminded、well being 视为同一个词，
// 用户少打或漏打连字符也能查到
let compactIndexCache = null
function compactIndex() {
  if (compactIndexCache) return compactIndexCache
  const DICT = dict()
  const index = {}
  Object.keys(DICT).forEach((key) => {
    const compact = key.replace(/[-\s]/g, '')
    if (compact && !index[compact]) index[compact] = key
  })
  compactIndexCache = index
  return index
}

function resolveCompact(word) {
  const compact = String(word || '').replace(/[-\s]/g, '')
  if (!compact) return ''
  const key = compactIndex()[compact]
  return key && dict()[key] ? key : ''
}

// -ly 结尾的形容词，不能按副词规则处理
const LY_ADJECTIVES = new Set(('friendly lovely lonely lively likely deadly costly elderly holy silly ugly early daily weekly '
  + 'monthly yearly only orderly timely untimely unlikely disorderly scholarly curly').split(' '))

// 派生后缀 → 派生词词性
// -ly 必须在形容词规则之前判断，否则 dramatically 会先命中 ically/ally 落到 adj.
const DERIV_POS_RULES = [
  [/ations?$|itions?$|tions?$|sions?$|ments?$|ances?$|ences?$|ities$|ity$|ness(es)?$|isms?$|enc(?:y|ies)$|anc(?:y|ies)$|ships?$|ery$/, 'n.'],
  [/ively$|ives?$|ables?$|ibles?$|ously$|ous$|ical$|al$|ests?$/, 'adj.'],
  [/ly$/, 'adv.'],
  [/ers?$|ors?$|ists?$|ants?$|ents?$/, 'n.']
]

function derivedPos(word) {
  if (LY_ADJECTIVES.has(word)) return 'adj.'
  for (const [pattern, pos] of DERIV_POS_RULES) {
    if (pattern.test(word)) return pos
  }
  return ''
}

// -al 既可能是名词（dismissal）也可能是形容词（natural）：词根是动词时按名词处理
function refinedPos(word, entry) {
  const pos = derivedPos(word)
  if (/als?$/.test(word) && entry && hasVerbSense(entry)) return 'n.'
  return pos
}

// 用词根释义按派生词词性拼一条可读释义（implementation ← implement 实现/使生效/执行）
function synthesizeSenses(word, entry) {
  const pos = refinedPos(word, entry)
  if (!pos || !entry) return []
  // 动作名词（implementation / tiredness）优先取动词义，其余名词（partnership）优先取名词义
  const actionNoun = /(ation|ition|tion|sion|ment|ance|ence|ity|ness|ism)$/.test(word)
  const order = pos === 'adj.'
    ? ['adj.', 'v.', 'n.']
    : (pos === 'adv.' ? ['adj.'] : (actionNoun ? ['v.', 'n.', 'adj.'] : ['n.', 'v.', 'adj.']))
  const source = order
    .map((key) => (entry.meanings || []).find((m) => m.pos === key && m.def))
    .find(Boolean)
  if (!source) return []
  const parts = String(source.def).split(/[,，;；]/).map((s) => s.trim()).filter(Boolean).slice(0, 3)
  // transparency 的词根是形容词「透明的」：名词去掉「的」，副词换成「地」；名词词根做形容词时补「的」
  const fixed = parts.map((s) => {
    if (pos === 'n.') return s.replace(/的$/, '')
    if (pos === 'adv.') return s.replace(/的$/, '地')
    if (pos === 'adj.' && source.pos === 'n.' && !/的$/.test(s)) return `${s}的`
    return s
  })
  return [{ pos, definition: fixed.join(', '), rare: false }]
}

// 词库没单收的派生词：返回词根、词根条目和一条兜底释义，
// 保证卡片上先有内容，模型可用时再被更准确的义项覆盖
function derivedInfo(word) {
  const DICT = dict()
  const variants = [word, word.replace(/s$/, ''), word.replace(/es$/, '')]
  for (const variant of variants) {
    const found = derIndex()[variant]
    if (!found) continue
    return {
      baseWord: found.base,
      entry: DICT[found.base] || null,
      senses: found.definition
        ? [{ pos: found.pos || derivedPos(word) || 'n.', definition: found.definition, rare: false }]
        : []
    }
  }
  const derived = resolveDerivative(word)
  if (!derived) return null
  return { baseWord: derived.word, entry: derived.entry, senses: synthesizeSenses(word, derived.entry) }
}

// 基础动词的不规则变形：这些词学生早就会，不能当成超纲生词收进来
const IRREGULAR_FORMS = new Set(('arose arisen awoke awoken was were been bore borne born beat beaten became become '
  + 'began begun bent bet bound bit bitten bled blew blown broke broken bred brought built burnt burst bought caught '
  + 'chose chosen came come cost crept cut dealt dug did done drew drawn dreamt drank drunk drove driven ate eaten '
  + 'fell fallen fed felt fought found fled flew flown forbade forbidden forgot forgotten forgave forgiven froze frozen '
  + 'got gotten gave given went gone ground grew grown hung had heard hid hidden hit held hurt kept knelt knew known '
  + 'laid led leant leapt learnt left lent let lay lain lit lost made meant met mistook mistaken paid proved proven put '
  + 'quit read rode ridden rang rung rose risen ran said saw seen sought sold sent set sewed sewn shook shaken shone shot '
  + 'showed shown shrank shrunk shut sang sung sank sunk sat slept slid spoke spoken sped spent spilt spun spat split spoilt '
  + 'spread sprang sprung stood stole stolen stuck stung stank stunk struck striven swore sworn swept swam swum swung took '
  + 'taken taught tore torn told thought threw thrown thrust trod trodden understood undertook undertaken undid undone '
  + 'upset woke woken wore worn wove woven wept won wound withdrew withdrawn wrote written').split(' '))

// 派生后缀：词库没收、但明显是学术/进阶词时才收进生词表
const DERIV_SUFFIX = /(tion|sion|ment|ness|ity|ance|ence|able|ible|ive|ous|ical|ism|ist|ize|ise|ify|ular|ary|ory|ate)$/

// 超基础词：词库里偶尔漏收（give / great），但它们不是生词，
// 不能因为「查不到词条」被当成超纲词收进生词表
const BASIC_WORDS = new Set(('good bad big small new old great little long short high low young able sure true false '
  + 'give go make take get see know think tell feel leave keep begin hear run bring sit meet understand speak spend grow '
  + 'buy send build sell do have be say come find look use work seem try ask need want help call show play move live '
  + 'believe happen write provide stand lose pay include continue learn change lead watch follow stop create read win '
  + 'offer remember love consider appear wait serve die expect stay fall cut reach kill remain suggest raise pass report '
  + 'decide pull turn start put let set hold keep mean become leave bring happen begin end open close start finish '
  + 'thing things something nothing everything anyone everyone someone people person man woman child world life time year '
  + 'day night week month home house school work money hand eye head way place case point fact group problem right left '
  + 'same different important possible difficult easy hard clear simple common real natural human social public private '
  + 'large small main major minor local national global international recent current modern future past early late '
  + 'increase decrease rise drop grow change develop reduce improve create produce support provide include receive '
  + 'allow require suggest consider explain describe discuss compare decide choose avoid agree argue claim expect '
  + 'better best worse worst more most less least much many few enough both all some any each every other another').split(' '))

// 基础词的常见变形也一并排除（greatest / gives / running）
function isBasicWord(word) {
  if (BASIC_WORDS.has(word)) return true
  const rules = [
    [/ies$/, 'y'], [/ied$/, 'y'], [/ing$/, ''], [/ing$/, 'e'], [/ed$/, ''], [/ed$/, 'e'],
    [/est$/, ''], [/er$/, ''], [/ly$/, ''], [/s$/, ''], [/es$/, '']
  ]
  return rules.some(([pattern, replacement]) => BASIC_WORDS.has(word.replace(pattern, replacement)))
}

// 高中及以前已经反复背过的高频词（frq 越小越常用）不再收进生词表
const HIGH_SCHOOL_FREQ = 2000
// 这类词里保留的熟词生义条数上限
const HIGH_SCHOOL_LIMIT = 2
// 词库外的进阶词上限：真正没见过的难词多半不在词库里，名额要给足
const EXTRA_LIMIT = 20

// 词频星级只依据词库里的真实语料排名（ECDICT 收录的 COCA frq / BNC bnc / 柯林斯星级），
// 没有数据的词宁可留空也不估算。阈值取自覆盖率研究：COCA 前 3000 词族覆盖约 85% 的
// 书面文本，前 9000 词族覆盖九成以上，因此用 3000 / 9000 划高、中、低频
const FREQ_HIGH_MAX = 3000
const FREQ_MID_MAX = 9000

function freqLevelOf(entry) {
  if (!entry) return 0
  const rank = Number(entry.frq) || Number(entry.bnc) || 0
  if (rank > 0) {
    if (rank <= FREQ_HIGH_MAX) return 3
    if (rank <= FREQ_MID_MAX) return 2
    return 1
  }
  // 没有 COCA / BNC 排名时只信柯林斯星级，仍取不到就返回 0（页面不显示星星）
  const collins = Number(entry.collins) || 0
  if (collins >= 5) return 3
  if (collins >= 4) return 2
  if (collins >= 1) return 1
  return 0
}

// 超纲词判定：词库没收录不等于不该学，multinational / relentless 这类必须进生词表。
// 长词或带派生后缀才收，基础词、不规则变形、比较级最高级都不收
function isExtraWord(word, nameLike) {
  if (IRREGULAR_FORMS.has(word) || nameLike.has(word) || isBasicWord(word)) return false
  if (!/[aeiouy]/.test(word)) return false
  // 比较级 / 最高级是同一个词的变形，不单独收
  if (/(ier|iest)$/.test(word)) return false
  if (word.length < 8) return false
  return word.length >= 9 || DERIV_SUFFIX.test(word)
}

function pickVocabulary(sentences, level, learned) {
  const known = learned && learned.words instanceof Map
    ? learned.words
    : (learned instanceof Map ? learned : new Map())
  const seen = new Set()
  const families = new Set()
  const picked = []
  const freq = {}
  // 句中非首词位置出现的大写词基本是人名/地名/机构名，超纲词判定要排除
  const nameLike = new Set()
  let totalWords = 0
  let extraCount = 0
  let familiarCount = 0

  sentences.forEach((sentence) => {
    wordsOf(sentence).forEach((raw, index) => {
      const lower = raw.toLowerCase().replace(/'s$/, '')
      if (!lower) return
      freq[lower] = (freq[lower] || 0) + 1
      if (index > 0 && /^[A-Z]/.test(raw)) nameLike.add(lower)
    })
  })

  for (const sentence of sentences) {
    const words = wordsOf(sentence)
    words.forEach((raw, index) => {
      totalWords += 1
      const lower = raw.toLowerCase().replace(/'s$/, '')
      if (lower.length < 4 || STOP_WORDS.has(lower)) return
      if (isNameLike(raw, index === 0)) return
      const resolved = resolveHead(lower)
      const head = resolved.head
      if (seen.has(head)) return
      // 词形还原可能把 rates 弄成 rat：正文里没有这个整词（含变形）就不收
      if (!appearsInText(head, resolved.entry ? resolved.entry.forms : null, sentence)) return

      // 已经记住的词不再出现（也不再送模型），第二篇文章只会越抽越少
      if (known.has(head)) return

      let item = null
      if (resolved.entry) {
        const entry = resolved.entry
        const meanings = pickMeanings(entry, 3, head)
        if (!meanings.length) return
        if (isFunctionWord(meanings)) return
        const categories = categoriesOf(entry)
        // 高中及以前就该掌握的词（core 基础词 + 高频词）原则上不进生词表，
        // 只有词表标了熟词生义的才留，而且每篇最多留 2 个，避免整篇都是老面孔
        const highSchool = ((entry.tags || '').indexOf('core') >= 0 && !(entry.frq > 0))
          || (entry.frq > 0 && entry.frq <= HIGH_SCHOOL_FREQ)
        if (highSchool) {
          if (!hasRare(entry) || familiarCount >= HIGH_SCHOOL_LIMIT) return
          familiarCount += 1
        }
        item = {
          id: '',
          word: head,
          phonetic: entry.ph ? `/${entry.ph}/` : '',
          meanings: meanings.map(toMeaning),
          categories,
          forms: entry.forms || {},
          derivatives: entry.der || [],
          // 词频星级：3 高频 / 2 中频 / 1 低频 / 0 语料未收录
          freq: freqLevelOf(entry),
          score: difficultyScore(entry, level)
        }
      } else {
        // 词库外的进阶词：先占位收录，词性/释义/音标由 AI 精讲补全
        if (extraCount >= EXTRA_LIMIT || !isExtraWord(lower, nameLike)) return
        extraCount += 1
        // 四六级词的派生形式（implementation ← implement）继承词根级别和释义，
        // 不能因为词库没单收就归成重难点、也不能一直停在「释义待补全」
        const info = derivedInfo(lower)
        const baseCategories = info && info.entry
          ? categoriesOf(info.entry).filter((key) => key === 'cet4' || key === 'cet6')
          : []
        const meanings = info ? info.senses : []
        item = {
          id: '',
          word: head,
          phonetic: '',
          meanings,
          categories: baseCategories.length ? baseCategories : ['difficult'],
          forms: {},
          derivatives: [],
          baseWord: info ? info.baseWord : '',
          // 词库外的进阶词没有语料排名，不猜星级，页面不显示星星
          freq: freqLevelOf(info && info.entry),
          pending: !meanings.length,
          score: 6200 + head.length * 40 + Math.min(freq[lower] || 1, 5) * 120
        }
      }

      // 已记住的词在上面已经跳过，这里不再做标记

      // 同一词族只收一次，避免 develop / development 连着出现
      const family = familyKey(head)
      if (families.has(family)) return
      seen.add(head)
      families.add(family)
      item.sentence = sentence.length > 160 ? `${sentence.slice(0, 157)}…` : sentence
      picked.push(item)
    })
  }

  // 词数跟着篇幅走：约每 8 个词留 1 个学习词，上限 60 条，
  // 已记住的词会被跳过，所以同一篇文章第二次出现时会自然变少
  const target = Math.max(20, Math.min(60, Math.round(totalWords / 8)))
  const list = picked
    .sort((a, b) => b.score - a.score || a.word.localeCompare(b.word))
    .slice(0, target)
    .map((item) => {
      const copy = Object.assign({}, item)
      delete copy.score
      return copy
    })
  // 全部词都要掌握，语义上不再区分核心/拓展，只保留固定的词条 id
  return list.map((item, index) => Object.assign(item, { id: `w${index + 1}` }))
}

function buildUnitData(text, level, learned) {
  const sentences = splitSentences(text)
  if (!sentences.length) return null

  const safe = learned && typeof learned === 'object' ? learned : emptyLearned()
  const vocabulary = pickVocabulary(sentences, level, safe)
  const grammarPoints = buildGrammarPoints(sentences, 16, safe.grammars)
  const phrases = buildPhrases(text, 60, safe.phrases)

  return {
    version: 3,
    // 词汇/词组抽取规则版本：study 发现旧版本会在重新选中文章时自动重解析
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
    extractVersion: EXTRACT_VERSION,
    level: level || 'cet4',
    categoryOptions: CATEGORY_OPTIONS,
    vocabulary,
    grammarPoints,
    phrases,
    stats: {
      sentences: sentences.length,
      vocabulary: vocabulary.length,
      grammarPoints: grammarPoints.length,
      phrases: phrases.length
    }
  }
}

// 单词查询：供个人词库补全音标、词性释义、变形与派生
function lookupWord(raw) {
  const word = String(raw || '').trim().toLowerCase()
  if (!word || !/^[a-z][a-z' -]*$/.test(word)) return null
  const lemma = toLemma(word) || word
  let key = lemma
  let entry = dict()[lemma]
  // 连字符写法不一致（likeminded / well being）时按去掉连字符后再匹配一次
  if (!entry) {
    const compact = resolveCompact(word)
    if (compact) {
      key = compact
      entry = dict()[compact]
    }
  }
  if (!entry) {
    // 词库没单收的派生词（implementation / abusive）用词根释义兜底，不要直接查不到
    const info = derivedInfo(word)
    if (!info || !info.senses.length) return null
    return {
      word,
      phonetic: info.entry && info.entry.ph ? `/${info.entry.ph}/` : '',
      meanings: info.senses.map((sense) => ({ pos: sense.pos, definition: sense.definition, rare: !!sense.rare })),
      forms: {},
      derivatives: [],
      freq: freqLevelOf(info.entry),
      categories: info.entry
        ? categoriesOf(info.entry).filter((key) => key === 'cet4' || key === 'cet6')
        : ['difficult']
    }
  }
  const meanings = pickMeanings(entry, 4, key).map(toMeaning)
  return {
    word: key,
    phonetic: entry.ph ? `/${entry.ph}/` : '',
    meanings,
    forms: entry.forms || {},
    derivatives: (entry.der || []).slice(0, 4),
    freq: freqLevelOf(entry),
    categories: categoriesOf(entry)
  }
}

// 输入框里敲的可能是变形或派生词：refuted → refute，dramatically → dramatic
function morphCandidates(word) {
  const DICT = dict()
  const out = []
  const push = (candidate) => {
    if (!candidate || out.indexOf(candidate) >= 0) return
    if (DICT[candidate]) out.push(candidate)
  }
  push(toLemma(word))
  derivStems(word).forEach((stem) => {
    push(stem)
    push(`${stem}e`)
  })
  return out
}

// 单词联想：生词本手动收录时按前缀补全，省得用户自己敲完整拼写。
// 除了前缀匹配，整词已收录、变形/派生词还原、变形表反查三种情况都要能命中
function suggestWords(raw, limit) {
  const prefix = String(raw || '').trim().toLowerCase().replace(/[^a-z' -]/g, '').slice(0, 24)
  if (prefix.length < 2) return []
  const max = Math.max(1, Math.min(10, Number(limit) || 6))
  const all = dict()
  // 词频越小越常见，同频再按长度和字母序排，短词优先
  const scoreOf = (word) => {
    const entry = all[word]
    if (entry.frq > 0) return entry.frq
    return (entry.tags || '').indexOf('core') >= 0 ? 4000 : (entry.rank || 6000)
  }
  const compare = (a, b) => scoreOf(a) - scoreOf(b) || a.length - b.length || a.localeCompare(b)
  const picked = []
  const taken = new Set()
  const push = (word) => {
    if (!word || taken.has(word) || picked.length >= max) return
    const entry = all[word]
    if (!entry) return
    taken.add(word)
    picked.push({
      word,
      phonetic: entry.ph ? `/${entry.ph}/` : '',
      meanings: pickMeanings(entry, 1, word).map(toMeaning),
      freq: freqLevelOf(entry)
    })
  }

  // 整词就在词库里（teach / resilience）先给出来
  push(prefix)
  Object.keys(all)
    .filter((word) => word !== prefix && word.indexOf(prefix) === 0)
    .sort(compare)
    .forEach(push)
  if (picked.length >= max) return picked

  morphCandidates(prefix).forEach(push)
  if (picked.length >= max) return picked

  // 连字符写法差异：敲 likeminded 也要能联想出 like-minded
  const compactPrefix = prefix.replace(/[-\s]/g, '')
  if (compactPrefix.length >= 4) {
    const compact = compactIndex()
    const exact = compact[compactPrefix]
    if (exact) push(exact)
    Object.keys(compact)
      .filter((key) => key !== compactPrefix && key.indexOf(compactPrefix) === 0)
      .map((key) => compact[key])
      .sort(compare)
      .forEach(push)
    if (picked.length >= max) return picked
  }

  // 变形表反查：敲的是某个词条的变形（refuted / taken），给出对应的原形
  const formHits = []
  Object.keys(all).forEach((word) => {
    const forms = all[word].forms
    if (!forms || typeof forms !== 'object') return
    Object.keys(forms).forEach((key) => {
      const value = forms[key]
      if (typeof value === 'string' && value && value !== word && value.indexOf(prefix) === 0) formHits.push(word)
    })
  })
  formHits.sort(compare).forEach(push)
  return picked
}

// 各篇文章的全文翻译进行中标记：同一篇并发请求只跑一次，避免重复计费
const translating = {}

// 导入预览的整篇翻译缓存：同一篇正文重复点「预览」不再重复调用模型
const textTranslationCache = new Map()

function textTranslationKey(text, level) {
  return crypto.createHash('sha256').update(`${level}:${text}`).digest('hex')
}

// 全文对照：报告页用，整篇逐句翻译，生成一次后缓存在 unitData.fullTranslation
async function translateArticleForReport(openid, articleId) {
  if (!openid) return failure(401, '无法确认用户身份')
  const id = typeof articleId === 'string' ? articleId.trim() : ''
  if (!id) return failure(400, 'articleId 不能为空')

  const found = await db.collection('articles').where({ _id: id, openid }).limit(1).get()
  const article = (found.data && found.data[0]) || null
  if (!article) return failure(404, '文章不存在或无权访问')
  if (!article.ocrText) return failure(400, '文章正文为空')
  const unitData = article.unitData
  if (!unitData || typeof unitData !== 'object') return failure(409, '这篇还没有开始精读')
  const cached = Array.isArray(unitData.fullTranslation) ? unitData.fullTranslation : []
  // 旧版译文没有段落序号：原文有自然段时重新生成一次，保证分段和译文质量
  const hasParagraph = cached.some((item) => item && typeof item.para === 'number')
  const multiParagraph = /\n\s*\n/.test(article.ocrText)
  if (cached.length && (hasParagraph || !multiParagraph)) return success({ sentences: cached, cached: true })
  if (!isEnglishText(article.ocrText)) return failure(400, '仅支持英文文本解析')
  if (translating[id]) return translating[id]

  translating[id] = translateFullText(article.ocrText, article.level || 'cet4')
    .then(async (sentences) => {
      if (!sentences.length) return failure(502, '全文翻译暂时没有生成，请稍后重试')
      await db.collection('articles').doc(id).update({
        data: { 'unitData.fullTranslation': sentences }
      })
      return success({ sentences, cached: false })
    })
    .catch((error) => {
      console.error('translate article failed', error)
      return failure(500, '全文对照生成失败，请稍后重试')
    })
    .then((result) => {
      delete translating[id]
      return result
    })
  return translating[id]
}

exports.main = async (event = {}) => {
  // AI 增强由客户端在保存成功后异步触发，不阻塞导入流程
  if (event.action === 'enhance') {
    const { OPENID } = cloud.getWXContext()
    try {
      return await enhanceArticle(OPENID, event.articleId)
    } catch (error) {
      console.error('enhance action failed', error)
      return failure(500, 'AI 精讲生成失败')
    }
  }

  // 报告页全文对照：按句翻译整篇，缓存后不再调用模型
  if (event.action === 'translate') {
    const { OPENID } = cloud.getWXContext()
    try {
      return await translateArticleForReport(OPENID, event.articleId)
    } catch (error) {
      console.error('translate action failed', error)
      return failure(500, '全文对照生成失败，请稍后重试')
    }
  }

  // 导入前预览：只翻译传入的正文，不落库；用户确认导入后不会再重复翻译
  if (event.action === 'translateText') {
    // 导入前预览也走付费翻译，必须确认身份，避免被匿名直接调用放大成本
    const { OPENID } = cloud.getWXContext()
    if (!OPENID) return failure(401, '无法确认用户身份')
    const raw = typeof event.text === 'string' ? event.text.trim() : ''
    if (!raw) return failure(400, '文章正文不能为空')
    if (raw.length > 10000) return failure(400, '文章不能超过 10000 个字符')
    if (!isEnglishText(raw)) return failure(400, '仅支持英文文本解析')
    const level = event.level === 'cet6' ? 'cet6' : 'cet4'
    const cacheKey = textTranslationKey(raw, level)
    const cached = textTranslationCache.get(cacheKey)
    if (cached) return success({ sentences: cached, cached: true })
    try {
      const sentences = await translateFullText(raw, level)
      if (!sentences.length) return failure(502, '译文暂时没有生成，请稍后重试')
      textTranslationCache.set(cacheKey, sentences)
      // 只留最近 30 篇，避免云函数实例内存无限增长
      if (textTranslationCache.size > 30) {
        textTranslationCache.delete(textTranslationCache.keys().next().value)
      }
      return success({ sentences })
    } catch (error) {
      console.error('translate text failed', error)
      return failure(500, '译文生成失败，请稍后重试')
    }
  }

  if (event.action === 'lookup') {
    const entry = lookupWord(event.word)
    if (!entry) return failure(404, dictError ? `词典加载失败：${dictError}` : '词库暂未收录这个词')
    return success(entry)
  }

  // 生词本批量补词频：只读词库，不调模型，用于给早期收藏的词补上星级
  if (event.action === 'freqs') {
    const words = Array.isArray(event.words) ? event.words.slice(0, 200) : []
    const map = {}
    words.forEach((raw) => {
      const key = String(raw || '').trim().toLowerCase()
      if (!key || Object.prototype.hasOwnProperty.call(map, key)) return
      const entry = lookupWord(key)
      if (entry && entry.freq) map[key] = entry.freq
    })
    return success(map)
  }

  if (event.action === 'suggest') {
    try {
      return success(suggestWords(event.prefix, event.limit))
    } catch (error) {
      console.error('suggest failed', error)
      return failure(500, dictError ? `词典加载失败：${dictError}` : '查询建议暂时不可用')
    }
  }

  const text = typeof event.text === 'string' ? event.text.trim() : ''
  if (!text) return failure(400, '识别文本不能为空')
  if (text.length > 10000) return failure(400, '文章不能超过 10000 个字符')
  const level = event.level === 'cet6' ? 'cet6' : 'cet4'

  try {
    // 客户端直接调用时用 OPENID 读生词本/词组本/语法本；study 内部调用时把已知内容直接传进来
    const learned = learnedFromEvent(event) || await loadLearned(cloud.getWXContext().OPENID)
    const unitData = buildUnitData(text, level, learned)
    if (!unitData) return failure(422, '没有找到可分析的英文句子')
    // 词典文件缺失时排出来的词一定是空的，单独提示部署问题，避免误导成文章内容有问题；
    // 词典正常但词表为空说明这篇的词都认识，是合法结果
    if (!unitData.vocabulary.length && dictError) {
      return failure(422, `词典加载失败：${dictError}。请重新部署 analyzeArticle（需包含 cet/common/senses.json）`)
    }
    return success(unitData)
  } catch (error) {
    console.error('analyzeArticle failed', error)
    return failure(500, '文章解析没有完成，请稍后重试')
  }
}
