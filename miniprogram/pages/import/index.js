const { loadStudy } = require('../../services/study')

// 导入入口只保留一种来源：粘贴英文原文。
// 真题由内置题库提供，不再做 Word / PDF 上传，也不再抓取网页链接。
Page({
  data: {
    loading: true,
    error: ''
  },

  onShow() {
    this.loadPage()
  },

  loadPage() {
    this.setData({ loading: true, error: '' })
    loadStudy()
      .then(() => this.setData({ loading: false }))
      .catch((error) => {
        this.setData({
          loading: false,
          error: error.message || '学习数据加载失败，请重试'
        })
      })
  },

  // 粘贴原文：校对页里手写输入，后面的解析与精读流程完全一致
  goManual() {
    wx.navigateTo({ url: '/pages/proofread/index?mode=manual' })
  },

  goBank() {
    // 栈里已经有题库页就直接退回它，否则顶替当前页；压入第二个题库会让返回键来回打转
    const pages = getCurrentPages()
    const target = pages.findIndex((page) => page.route === 'pages/library/index')
    if (target >= 0 && pages.length - 1 - target > 0) {
      wx.navigateBack({ delta: pages.length - 1 - target })
      return
    }
    wx.redirectTo({ url: '/pages/library/index' })
  },

  // 外刊入口：外刊已经是独立导航页，直接切过去
  goJournals() {
    wx.switchTab({ url: '/pages/journal/index' })
  }
})
