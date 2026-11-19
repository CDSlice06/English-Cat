// 首周引导：新用户先做三件小事（入库一篇、走完四站、复习三个词）。
// 完成状态不单独记账，全部从真实数据推导，避免本地标记和实际进度对不上。
const { loadOverview } = require('./study')

const KEY = 'starterGuide'
const WEEK = 7 * 24 * 60 * 60 * 1000
const WORD_GOAL = 3

function read() {
  try {
    const saved = wx.getStorageSync(KEY)
    return saved && typeof saved === 'object' ? saved : null
  } catch (error) {
    return null
  }
}

function write(value) {
  try {
    wx.setStorageSync(KEY, value)
  } catch (error) {}
}

function stepsOf(saved, data, reviewedWords) {
  const imported = (data.articleTotal || 0) > 0
  const studied = (data.masteredArticles || 0) > 0
  const reviewed = reviewedWords >= WORD_GOAL
  return {
    firstAt: saved.firstAt,
    done: [imported, studied, reviewed].filter(Boolean).length,
    complete: imported && studied && reviewed,
    steps: [
      {
        key: 'import',
        title: '收下第一篇文章',
        desc: imported ? '文章已入库，随时可以打开' : '从题库抽一篇，或粘贴自己的英文原文',
        done: imported,
        url: '/pages/library/index'
      },
      {
        key: 'study',
        title: '走完四站学习',
        desc: studied ? '已经完整通关一篇' : '词汇 → 词组 → 语法 → 输出练习',
        done: studied,
        url: '/pages/workbench/index'
      },
      {
        key: 'review',
        title: `复习 ${WORD_GOAL} 个单词`,
        desc: reviewed ? `已复习 ${reviewedWords} 个词` : `已复习 ${reviewedWords}/${WORD_GOAL} 个，按记忆曲线回访`,
        done: reviewed,
        url: '/pages/review/index'
      }
    ]
  }
}

// 返回卡片数据表示展示，null 表示不展示；
// undefined 表示这次没拿到汇总（离线或云函数异常），页面保留原样即可。
// reviewedWords 由页面用复习记录算好传入，这里不再拉一次词库。
function resolve(reviewedWords) {
  const saved = read()
  if (saved && saved.hidden) return Promise.resolve(null)
  return loadOverview().then((data) => {
    if (!data) return undefined
    if (!saved) {
      // 第一次见到这个人：既没有文章、也没通关过，才当新用户
      const fresh = (data.articleTotal || 0) === 0 && (data.masteredArticles || 0) === 0
      if (!fresh) {
        write({ hidden: true, at: Date.now() })
        return null
      }
      const created = { firstAt: Date.now() }
      write(created)
      return stepsOf(created, data, reviewedWords)
    }
    // 首周过了就不再出现，别让任务卡长期占着首页
    if (Date.now() - (Number(saved.firstAt) || 0) > WEEK) {
      write(Object.assign({}, saved, { hidden: true }))
      return null
    }
    return stepsOf(saved, data, reviewedWords)
  }).catch(() => undefined)
}

function dismiss() {
  const saved = read() || { firstAt: Date.now() }
  write(Object.assign({}, saved, { hidden: true }))
}

module.exports = { resolve, dismiss }
