const { importArticle, openArticle, analyzeText, saveUnit } = require('./study')

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

module.exports = { prepareBankArticle, startBankArticle }
