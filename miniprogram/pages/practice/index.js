const { loadStudy, savePractice } = require('../../services/study')
const { errorMessage } = require('../../utils/error')

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key)
}

// 把每个语法点的练习摊平成题目列表，英译汉与汉译英交替出现
// 同一方向、同一题干只保留一次，防止历史数据里重复的题被展示两遍
function collectDrills(unitData) {
  const points = Array.isArray(unitData.grammarPoints) ? unitData.grammarPoints : []
  const drills = []
  const seen = new Set()
  points.forEach((point) => {
    (point.drills || []).forEach((drill) => {
      const key = `${drill.mode || ''}|${String(drill.prompt || '').trim().toLowerCase()}`
      if (!drill.id || seen.has(key)) return
      seen.add(key)
      drills.push(Object.assign({}, drill, {
        pattern: drill.pattern || point.pattern,
        modeLabel: drill.modeLabel || (drill.mode === 'en2zh' ? '英译汉' : '汉译英'),
        shortMode: drill.mode === 'en2zh' ? '英→中' : '中→英'
      }))
    })
  })
  return drills
}

// 旧版本判题会把缺失的关键词直接写进反馈，这里统一替换掉，避免继续泄露答案
function sanitizeRecord(record) {
  if (!record || typeof record.feedback !== 'string') return record
  if (record.feedback.indexOf('还差这些关键点') !== 0) return record
  return Object.assign({}, record, {
    feedback: '这次没有通过，回到语法卡对照句型结构再改一遍。'
  })
}

// 讲解后重写：失败后先锁住参考答案，强制按讲解改一遍；第 MAX_ATTEMPT 次仍未通过才开放答案
const MAX_ATTEMPT = 3

function rewriteState(record) {
  if (!record || record.result !== 'fail') {
    return { referenceLocked: false, rewriteHint: '' }
  }
  const attempt = Number(record.attempt) || 1
  if (attempt >= MAX_ATTEMPT) {
    return { referenceLocked: false, rewriteHint: '已经重写了几次，参考答案已开放，对照着看看差在哪。' }
  }
  return {
    referenceLocked: true,
    rewriteHint: `第 ${attempt} 次没通过。先照着上面的讲解改一遍再提交，第 ${MAX_ATTEMPT} 次仍未通过才会开放参考答案。`
  }
}

// 下一道还没通过的题：先往后找，再从头补一遍；全部通过返回 -1
function nextQuestionIndex(items, index) {
  for (let i = index + 1; i < items.length; i += 1) {
    if (!items[i].passed) return i
  }
  for (let i = 0; i < index; i += 1) {
    if (!items[i].passed) return i
  }
  return -1
}

Page({
  data: {
    loading: true,
    error: '',
    items: [],
    index: 0,
    item: {},
    answers: {},
    answer: '',
    answerLength: 0,
    records: {},
    record: null,
    passed: 0,
    nextReady: false,
    showHint: false,
    showReference: false,
    evaluating: false,
    referenceLocked: false,
    rewriteHint: '',
    nextIndex: -1
  },

  onShow() {
    this.load()
  },

  load() {
    this.setData({ loading: true, error: '' })
    loadStudy(true).then(({ article, unit }) => {
      const unitData = article.unitData || {}
      const sourceItems = collectDrills(unitData)
      const rawRecords = unit.practiceRecords || {}
      const records = {}
      Object.keys(rawRecords).forEach((key) => {
        records[key] = sanitizeRecord(rawRecords[key])
      })
      const answers = Object.assign({}, this.data.answers)
      sourceItems.forEach((item) => {
        const record = records[item.id]
        if (!hasOwn(answers, item.id) && record && typeof record.answer === 'string') {
          answers[item.id] = record.answer
        }
      })
      const items = sourceItems.map((item) => Object.assign({}, item, {
        passed: !!(records[item.id] && records[item.id].result === 'pass')
      }))
      const index = Math.min(this.data.index, Math.max(items.length - 1, 0))
      const item = items[index] || {}
      const answer = item.id && hasOwn(answers, item.id) ? answers[item.id] : ''
      const currentRecord = item.id ? records[item.id] || null : null
      const passed = items.filter((practice) => practice.passed).length
      this.setData(Object.assign({
        loading: false,
        items,
        index,
        item,
        answers,
        answer,
        answerLength: answer.length,
        records,
        record: currentRecord,
        passed,
        nextReady: !items.length || passed === items.length,
        nextIndex: nextQuestionIndex(items, index),
        showHint: false,
        showReference: false
      }, rewriteState(currentRecord)))
    }).catch((error) => {
      this.setData({ loading: false, error: errorMessage(error) })
    })
  },

  selectQuestion(event) {
    this.showQuestion(Number(event.currentTarget.dataset.index))
  },

  showQuestion(index) {
    if (index < 0 || index >= this.data.items.length) return
    const item = this.data.items[index]
    const answer = hasOwn(this.data.answers, item.id) ? this.data.answers[item.id] : ''
    const record = this.data.records[item.id] || null
    this.setData(Object.assign({
      index,
      item,
      answer,
      answerLength: answer.length,
      record,
      nextIndex: nextQuestionIndex(this.data.items, index),
      showHint: false,
      showReference: false
    }, rewriteState(record)))
  },

  onAnswerInput(event) {
    if (!this.data.item.id) return
    const answer = event.detail.value
    const answers = Object.assign({}, this.data.answers)
    answers[this.data.item.id] = answer
    this.setData({ answers, answer, answerLength: answer.length })
  },

  toggleHint() {
    this.setData({ showHint: !this.data.showHint })
  },

  toggleReference() {
    // 讲解后重写阶段先不给答案，避免直接抄
    if (this.data.referenceLocked) {
      wx.showToast({ title: '先按讲解重写一遍', icon: 'none' })
      return
    }
    this.setData({ showReference: !this.data.showReference })
  },

  submit() {
    if (this.data.evaluating || !this.data.item.id) return
    const item = this.data.item
    const currentIndex = this.data.index
    const answer = this.data.answer
    if (!answer.trim()) {
      wx.showToast({ title: '先写下你的翻译', icon: 'none' })
      return
    }
    const previous = this.data.records[item.id]
    // 上一轮没通过就继续累加次数；上一轮已通过则算重新开始
    const attempt = previous && previous.result !== 'pass'
      ? (Number(previous.attempt) || 1) + 1
      : 1
    this.setData({ evaluating: true })
    savePractice(item.id, answer, attempt).then((record) => {
      const records = Object.assign({}, this.data.records, { [item.id]: record })
      const items = this.data.items.map((practice) => Object.assign({}, practice, {
        passed: !!(records[practice.id] && records[practice.id].result === 'pass')
      }))
      const passed = items.filter((practice) => practice.passed).length
      const changes = Object.assign({
        evaluating: false,
        records,
        items,
        passed,
        nextReady: !items.length || passed === items.length,
        nextIndex: nextQuestionIndex(items, currentIndex)
      }, rewriteState(record))
      if (this.data.item.id === item.id) {
        changes.record = record
        changes.showReference = false
      }
      this.setData(changes)
    }).catch((error) => {
      this.setData({ evaluating: false })
      wx.showToast({ title: errorMessage(error), icon: 'none', duration: 2500 })
    })
  },

  // 通过后主按钮变成「下一题」，不再允许把同一句反复提交
  primaryAction() {
    if (this.data.evaluating || !this.data.item.id) return
    const record = this.data.record
    if (record && record.result === 'pass') {
      if (this.data.nextIndex < 0) {
        this.goSummary()
        return
      }
      this.showQuestion(this.data.nextIndex)
      return
    }
    this.submit()
  },

  goSummary() {
    wx.navigateTo({ url: '/pages/summary/index' })
  }
})
