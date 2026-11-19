const { importArticle, openArticle, readReadingArticle, analyzeText, saveUnit, triggerEnhance } = require('./study')

// 题库文章统一走「先入库、再解析」：
// 解析不再由 study 云函数嵌套调用 analyzeArticle（部分环境会失败），
// 改由客户端直接调解析函数，再用 saveUnit 回传落库
function metaOf(article) {
  return {
    level: article.level,
    kind: article.kind || 'mock',
    origin: article.origin || 'bank',
    source: article.source,
    bankId: article.id,
    title: article.title,
    // 内置真题带出处，学完在「真题库」里按年份对齐进度
    year: article.year,
    month: article.month,
    paper: article.paper,
    passage: article.passage
  }
}

// 题库/真题库点开：只入库并返回 id，交给预览页展示这篇要学什么
function prepareBankArticle(article) {
  if (!article) return Promise.reject(new Error('这篇文章不存在'))
  return importArticle(article.text, metaOf(article)).then((data) => {
    const articleId = (data && data.article && data.article._id) || ''
    if (!articleId) throw new Error('这篇文章没能存入题库，稍后再试')
    return articleId
  })
}

// 首次引导里直接用：入库 → 打开 → 解析落库，不经过预览
function startBankArticle(article) {
  let articleId = ''
  return prepareBankArticle(article)
    .then((id) => {
      articleId = id
      return openArticle(articleId)
    })
    .then((data) => {
      if (data && data.needsAnalysis) {
        if (!data.text) throw new Error('这篇文章没有正文，换一篇试试')
        return analyzeText(data.text, data.level, data.remembered).then((unitData) => saveUnit(articleId, unitData))
      }
      return data
    })
}

// 外刊独立阅读：入库 → 按 id 读（不切换当前文章）→ 需要解析就解析落库，
// 返回 articleId 供阅读页带着 ?id= 打开
function startReadingArticle(article) {
  let articleId = ''
  let ready = false
  return prepareBankArticle(article)
    .then((id) => {
      articleId = id
      return readReadingArticle(articleId)
    })
    .then((data) => {
      if (!data || !data.needsAnalysis) {
        // 老文章已经解析过：精讲也完成后就不用再跑一轮云端
        ready = !!(data && data.article && data.article.aiStatus === 'ready'
          && data.article.wordsPending !== true)
        return null
      }
      if (!data.text) throw new Error('这篇文章没有正文，换一篇试试')
      return analyzeText(data.text, data.level, data.remembered)
        .then((unitData) => saveUnit(articleId, unitData))
    })
    // 外刊同样吃共享精讲缓存：命中时只是几次读库，打开就有译文和释义，不再调用模型。
    // 冷缓存那次最多等 2.5 秒，剩下的交给云端在后台跑完，别把打开文章卡住
    .then(() => (ready ? null : triggerEnhance(articleId, 2500)))
    .then(() => articleId)
}

module.exports = { prepareBankArticle, startBankArticle, startReadingArticle }
