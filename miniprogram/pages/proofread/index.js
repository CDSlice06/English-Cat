const { loadStudy, saveArticle, triggerEnhance } = require('../../services/study')

// 出处选择器：第一项都是「不标注」，值为 0，保存时直接跳过
const YEARS = ['不标注', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026']
const MONTHS = ['不标注', '6 月', '12 月']
const PAPERS = ['不标注', '第 1 套', '第 2 套', '第 3 套']
const PASSAGES = ['不标注', 'Passage 1', 'Passage 2', 'Passage 3', 'Passage 4']
const LEVEL_OPTIONS = ['四级', '六级']

// 只接受英文：至少包含一个英文字母，且不能出现中文、日文假名、韩文
const NON_ENGLISH = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/
// 四六级阅读会在生词后加中文注释，如 trade-offs（权衡）。
// 括号内不超过 20 个中文字符的注释直接忽略，不算中文正文
const GLOSS = /[(（]\s*[\u4e00-\u9fff][\u4e00-\u9fff\u3000-\u303f\uff01-\uff5e·—…]{0,19}\s*[)）]/g

// 去掉括号里的中文注释，留下纯英文正文
function stripGloss(value) {
  return String(value || '').replace(GLOSS, ' ')
}

function isEnglishText(value) {
  const text = stripGloss(value)
  return /[A-Za-z]/.test(text) && !NON_ENGLISH.test(text)
}

function valueOf(list, index) {
  return index > 0 ? Number(list[index].replace(/[^0-9]/g, '')) : 0
}

function matchIndexOf(list, value) {
  if (!value) return 0
  const index = list.findIndex((item) => item.replace(/[^0-9]/g, '') === String(value))
  return index > 0 ? index : 0
}

// 从文件名里捡出出处信息：2026年6月英语六级真题（第一套）.pdf
const CHINESE_NUM = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5 }

function examMetaOf(name) {
  const text = String(name || '')
  const year = /(20\d{2})\s*年/.exec(text)
  const month = /(\d{1,2})\s*月/.exec(text)
  const paper = /第\s*([1-9一二三四五])\s*套/.exec(text)
  return {
    level: /六级|cet-?6/i.test(text) ? 1 : (/四级|cet-?4/i.test(text) ? 0 : -1),
    year: year ? Number(year[1]) : 0,
    month: month ? Number(month[1]) : 0,
    paper: paper ? (CHINESE_NUM[paper[1]] || Number(paper[1]) || 0) : 0
  }
}

Page({
  data: {
    loading: true,
    error: '',
    article: null,
    isDemo: false,
    docMode: false,
    manualMode: false,
    // 上传文档和粘贴原文都属于「导入」：只存题库，不在这里解析
    storeMode: false,
    docMeta: null,
    ocrText: '',
    characterCount: 0,
    canSubmit: false,
    analyzing: false,
    analyzeError: '',
    levelOptions: LEVEL_OPTIONS,
    yearOptions: YEARS,
    monthOptions: MONTHS,
    paperOptions: PAPERS,
    passageOptions: PASSAGES,
    levelIndex: 0,
    yearIndex: 0,
    monthIndex: 0,
    paperIndex: 0,
    passageIndex: 0,
    // 归档位置：真题 / 普通导入，和年份是否填写无关，由用户自己决定
    target: 'custom',
    // 真题整卷会自动拆成仔细阅读的多篇正文，逐篇导入
    passages: [],
    passageTab: 0
  },

  onLoad(options) {
    // 级别默认跟随用户首次进入时选的备考目标
    const levelIndex = wx.getStorageSync('userLevel') === 'cet6' ? 1 : 0
    this.setData({ levelIndex })
    const mode = (options && options.mode) || ''
    // 从题库「我的真题 / 其它篇目」进来时，归档位置跟随来源分类
    const archive = (options && options.archive) || ''
    if (mode === 'doc') {
      const draft = wx.getStorageSync('docDraft')
      if (draft && draft.text) {
        const valid = isEnglishText(draft.text)
        const passages = Array.isArray(draft.passages) ? draft.passages : []
        // 每篇的修改都先留在本地，切换篇目时不丢
        this.passageTexts = passages.map((item) => item.text)
        // 文件名里带年份套数时自动填好出处，省得用户再选一遍
        const exam = examMetaOf(draft.fileName)
        this.setData({
          docMode: true,
          storeMode: true,
          // 上传文档通常是真题原文，默认归到「我的真题」，可手动改成导入
          target: archive === 'custom' ? 'custom' : 'real',
          levelIndex: exam.level >= 0 ? exam.level : this.data.levelIndex,
          yearIndex: exam.year ? matchIndexOf(YEARS, exam.year) : this.data.yearIndex,
          monthIndex: exam.month ? matchIndexOf(MONTHS, exam.month) : this.data.monthIndex,
          paperIndex: exam.paper ? matchIndexOf(PAPERS, exam.paper) : this.data.paperIndex,
          passages,
          passageTab: 0,
          docMeta: {
            fileName: draft.fileName || '已上传文档',
            kindLabel: draft.kind === 'pdf' ? 'PDF' : 'Word',
            paragraphs: draft.paragraphs || 0,
            warnings: draft.warnings || []
          },
          ocrText: passages.length ? passages[0].text : draft.text,
          characterCount: passages.length ? passages[0].text.length : draft.text.length,
          canSubmit: valid,
          analyzeError: valid ? '' : '仅支持英文文本解析'
        })
        return
      }
      this.setData({ manualMode: true, storeMode: true })
      return
    }
    if (mode === 'manual') {
      const patch = { manualMode: true, storeMode: true }
      if (archive === 'real' || archive === 'custom') patch.target = archive
      this.setData(patch)
    }
  },

  onShow() {
    this.loadPage()
  },

  loadPage() {
    this.setData({ loading: true, error: '' })
    loadStudy()
      .then((study) => {
        const article = study.article
        const sameArticle = this.data.article && this.data.article._id === article._id
        // 文档/粘贴进来的文本优先；上传或粘贴模式下不回填旧文章，避免串内容
        const typed = this.data.ocrText
        const fromDraft = this.data.docMode || this.data.manualMode
        const text = typed || (fromDraft ? '' : (sameArticle ? '' : (article.ocrText || '')))
        const valid = !text.trim() || isEnglishText(text)
        this.setData({
          loading: false,
          article,
          // 用户上传或粘贴的文本一律按真实文章处理，不能走体验文章的分支
          isDemo: !this.data.docMode && !this.data.manualMode && !!article.isDemo,
          ocrText: text,
          characterCount: text.length,
          canSubmit: !!text.trim() && valid,
          analyzeError: valid ? '' : '仅支持英文文本解析'
        })
      })
      .catch((error) => {
        this.setData({
          loading: false,
          error: error.message || '学习数据加载失败，请重试'
        })
      })
  },

  onTextInput(event) {
    const ocrText = event.detail.value
    const hasText = !!ocrText.trim()
    const valid = !hasText || isEnglishText(ocrText)
    // 切换篇目时把当前这篇的修改带回去
    if (this.data.docMode && this.data.passages.length) {
      if (!this.passageTexts) this.passageTexts = []
      this.passageTexts[this.data.passageTab] = ocrText
    }
    this.setData({
      ocrText,
      characterCount: ocrText.length,
      canSubmit: hasText && valid,
      analyzeError: valid ? '' : '仅支持英文文本解析'
    })
  },

  // 真题整卷拆出来的多篇正文，切换查看/修改
  onPassageTab(event) {
    if (this.data.analyzing) return
    const index = Number(event.currentTarget.dataset.index) || 0
    if (index === this.data.passageTab) return
    if (this.passageTexts) this.passageTexts[this.data.passageTab] = this.data.ocrText
    const text = (this.passageTexts && this.passageTexts[index]) || ''
    const valid = !text.trim() || isEnglishText(text)
    this.setData({
      passageTab: index,
      ocrText: text,
      characterCount: text.length,
      canSubmit: !!text.trim() && valid,
      analyzeError: valid ? '' : '仅支持英文文本解析'
    })
  },

  // 出处选择器：只改本地状态，保存时统一组装成 meta
  onLevel(event) {
    const levelIndex = Number(event.detail.value) || 0
    wx.setStorageSync('userLevel', levelIndex === 1 ? 'cet6' : 'cet4')
    this.setData({ levelIndex })
  },

  onYear(event) {
    this.setData({ yearIndex: Number(event.detail.value) || 0 })
  },

  onMonth(event) {
    this.setData({ monthIndex: Number(event.detail.value) || 0 })
  },

  onPaper(event) {
    this.setData({ paperIndex: Number(event.detail.value) || 0 })
  },

  onPassage(event) {
    this.setData({ passageIndex: Number(event.detail.value) || 0 })
  },

  // 归档位置：真题 / 导入，独立于出处字段
  onTarget(event) {
    const target = event.currentTarget.dataset.target === 'real' ? 'real' : 'custom'
    if (target === this.data.target) return
    this.setData({ target })
  },

  // 待保存的篇章：真题整卷会有多篇，第一篇今天学，其余排队进「我的真题」
  batchesForSave() {
    const passages = this.data.passages || []
    if (this.data.docMode && passages.length) {
      return passages.map((item, index) => ({
        // 入库前去掉括号里的中文注释，解析链路只认纯英文
        text: stripGloss((this.passageTexts && this.passageTexts[index]) || item.text || '').trim(),
        title: item.title || '',
        passage: Number(item.index) || index + 1,
        queued: index > 0
      }))
    }
    return [{ text: stripGloss(this.data.ocrText || '').trim(), title: '', passage: 0, queued: false }]
  },

  metaOf(batch) {
    return {
      level: this.data.levelIndex === 1 ? 'cet6' : 'cet4',
      kind: this.data.target === 'real' ? 'real' : 'custom',
      year: valueOf(YEARS, this.data.yearIndex),
      month: valueOf(MONTHS, this.data.monthIndex),
      paper: valueOf(PAPERS, this.data.paperIndex),
      passage: batch.passage || valueOf(PASSAGES, this.data.passageIndex),
      title: batch.title,
      queued: batch.queued
    }
  },

  // 逐篇入库：第一篇失败直接报错，排队篇失败只提示不打断
  saveBatches(batches, save) {
    let first = null
    let failed = 0
    let shown = false
    const step = (batch, index) => {
      if (batches.length > 1 && !shown) {
        shown = true
        wx.showLoading({ title: `正在准备第 ${index + 1}/${batches.length} 篇…`, mask: true })
      }
      return save(batch.text, this.metaOf(batch))
        .then((data) => {
          if (!first) first = data
        })
        .catch((error) => {
          if (!first) throw error
          failed += 1
          console.error('排队文章导入失败', error)
        })
    }
    return batches
      .reduce((chain, batch, index) => chain.then(() => step(batch, index)), Promise.resolve())
      .then(() => {
        if (shown) wx.hideLoading()
        return { first, failed }
      }, (error) => {
        if (shown) wx.hideLoading()
        throw error
      })
  },

  next() {
    if (this.data.analyzing) return
    const batches = this.batchesForSave()
    const empty = batches.find((batch) => !batch.text)
    if (empty) {
      wx.showToast({ title: '请先粘贴或上传文章原文', icon: 'none' })
      return
    }
    // 中文直接在前端拦截：不保存、不触发解析，更不会调用大模型
    const invalid = batches.find((batch) => !isEnglishText(batch.text))
    if (invalid) {
      this.setData({ analyzeError: '仅支持英文文本解析', canSubmit: false })
      wx.showToast({ title: '仅支持英文文本解析', icon: 'none' })
      return
    }
    if (this.data.isDemo) {
      // 示例文章没有入库动作，同样顶替校对页，返回键直接回上一级
      wx.redirectTo({ url: '/pages/vocabulary/index' })
      return
    }

    // 导入题库：先进入过渡页，展示原文、译文与学习目标，确认后再入库
    const storing = this.data.storeMode
    if (storing) {
      wx.setStorageSync('importPreview', {
        batches: batches.map((batch) => ({
          text: batch.text,
          title: batch.title,
          passage: batch.passage,
          queued: batch.queued
        })),
        meta: batches.map((batch) => this.metaOf(batch))
      })
      this.setData({ analyzing: false, analyzeError: '' })
      wx.navigateTo({ url: '/pages/preview/index' })
      return
    }

    this.setData({ analyzing: true, analyzeError: '' })
    // 粘贴解析：不经过预览页，解析后直接进入词汇页
    this.saveBatches(batches, saveArticle)
      .then(({ first, failed }) => {
        this.setData({ analyzing: false })
        wx.removeStorageSync('docDraft')
        // 粘贴解析：规则解析已经可用，AI 精讲在后台继续补充；
        // 但同一篇正文重复导入时服务端会复用已精讲的结果，这时不要再触发一次模型
        const firstArticle = first && first.article
        if (firstArticle && firstArticle._id && firstArticle.aiStatus !== 'ready') {
          triggerEnhance(firstArticle._id)
        }
        // 顶替校对页：文章已经存好并在学了，往回退到校对页只会让人重复点一遍解析
        const go = () => wx.redirectTo({ url: '/pages/vocabulary/index' })
        if (failed) {
          wx.showModal({
            title: '有文章没准备好',
            content: `已导入 ${batches.length - failed} 篇，另外 ${failed} 篇没有准备好，可以稍后重新上传这份文档。`,
            showCancel: false,
            complete: go
          })
          return
        }
        go()
      })
      .catch((error) => {
        const message = (error && error.message) || '解析没有完成，请稍后重试'
        this.setData({ analyzing: false, analyzeError: message })
        // 换文章被限制时用弹窗完整说明，toast 放不下这么长的文案
        if (error && error.code === 403) {
          wx.showModal({ title: '今天的学习安排', content: message, showCancel: false, confirmText: '知道了' })
        } else {
          wx.showToast({ title: message, icon: 'none' })
        }
      })
  }
})
