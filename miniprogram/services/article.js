const { importArticle, openArticle, analyzeText, saveUnit } = require('./study')

// 题库文章同样走「先入库、打开时解析」：
// 解析不再由 study 云函数嵌套调用 analyzeArticle（部分环境会失败），
// 改由客户端直接调解析函数，再用 saveUnit 回传落库
function startBankArticle(article) {
  if (!article) return Promise.reject(new Error('这篇文章不存在'))
  let articleId = ''
  return importArticle(article.text, {
    level: article.level,
    kind: 'mock',
    origin: 'bank',
    source: article.source,
    bankId: article.id,
    title: article.title
  })
    .then((data) => {
      articleId = (data && data.article && data.article._id) || ''
      if (!articleId) throw new Error('这篇文章没能存入题库，稍后再试')
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

module.exports = { startBankArticle }
