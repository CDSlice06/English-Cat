const { loadStudy, savePractice } = require('../../services/study')
const { errorMessage, isTimeoutError } = require('../../utils/error')
const { playTapSound, playCorrectSound, playWrongSound } = require('../../utils/sound')

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key)
}

// 把每个语法点的练习摊平成题目列表，只出英译汉（中译英太重，已下线）
// 同一题干只保留一次，防止历史数据里重复的题被展示两遍
function collectDrills(unitData) {
  const points = Array.isArray(unitData.grammarPoints) ? unitData.grammarPoints : []
  const drills = []
  const seen = new Set()
  points.forEach((point) => {
    (point.drills || []).forEach((drill) => {
      if (drill.mode !== 'en2zh') return
      const key = String(drill.prompt || '').trim().toLowerCase()
      if (!drill.id || seen.has(key)) return
      seen.add(key)
      drills.push(Object.assign({}, drill, {
        pattern: drill.pattern || point.pattern,
        modeLabel: '英译汉',
        shortMode: '英→中'
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

// 底栏与键盘旁的提交入口共用同一份文案，避免两处说法不一致
function primaryTextOf(state) {
  if (state.evaluating) return state.retrying ? '正在重试…' : '评估中…'
  const record = state.record
  if (record && record.result === 'pass') {
    return Number(state.nextIndex) < 0 ? '查看学习报告' : '下一题'
  }
  return state.referenceLocked ? '按讲解重写并提交' : '提交并评估'
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
    retrying: false,
    referenceLocked: false,
    rewriteHint: '',
    nextIndex: -1,
    primaryText: '提交并评估',
    keyboardUp: false
  },

  onShow() {
    this.load()
  },

  load() {
    // 页面上已有内容时（从其它页面切回来）：不闪加载态，数据没变化就不重建
    const warm = !!this.ready
    if (!warm) this.setData({ loading: true, error: '' })
    loadStudy(true).then(({ article, unit }) => {
      this.ready = true
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
      const nextIndex = nextQuestionIndex(items, index)
      const payload = Object.assign({
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
        nextIndex,
        showHint: false,
        showReference: false,
        keyboardUp: false
      }, rewriteState(currentRecord))
      // 判题请求可能还在进行，文案要跟着当前状态走，不能回成「提交并评估」
      payload.primaryText = primaryTextOf(Object.assign({
        evaluating: this.data.evaluating,
        retrying: this.data.retrying
      }, payload))
      // 签名只取影响界面的关键字段：和上次一致就跳过 setData，回页不再整页重建
      const signature = JSON.stringify([
        article._id,
        article.aiStatus || '',
        article.extractVersion || 0,
        article.updatedAt || 0,
        items.map((practice) => `${practice.id}:${practice.passed ? 1 : 0}:${String(practice.prompt || '').length}`).join(','),
        index,
        item.id || '',
        (answer || '').length,
        Object.keys(records).sort().map((key) => `${key}:${records[key].result || ''}:${records[key].attempt || 0}:${records[key].rule || ''}:${records[key].tip ? 1 : 0}:${records[key].usage ? 1 : 0}:${records[key].improvements ? records[key].improvements.length : 0}:${records[key].checklist ? records[key].checklist.map((entry) => `${entry.ok ? 1 : 0}-${(entry.zh || '').length}-${(entry.note || '').length}`).join('|') : ''}`).join(','),
        passed,
        nextIndex
      ])
      if (warm && signature === this.renderSignature) return
      this.renderSignature = signature
      this.setData(payload)
    }).catch((error) => {
      // 回页刷新失败时保留已有内容，别把渲染好的页面换成错误页
      if (warm) return
      this.setData({ loading: false, error: errorMessage(error) })
    })
  },

  selectQuestion(event) {
    const index = Number(event.currentTarget.dataset.index)
    if (index < 0 || index >= this.data.items.length) return
    // 底部的上一题 / 跳过这一题带点击音效；上方的题目标签切换不加，避免太吵
    if (event.currentTarget.dataset.sound) playTapSound()
    this.showQuestion(index)
  },

  showQuestion(index) {
    if (index < 0 || index >= this.data.items.length) return
    const item = this.data.items[index]
    const answer = hasOwn(this.data.answers, item.id) ? this.data.answers[item.id] : ''
    const record = this.data.records[item.id] || null
    const next = Object.assign({
      index,
      item,
      answer,
      answerLength: answer.length,
      record,
      nextIndex: nextQuestionIndex(this.data.items, index),
      showHint: false,
      showReference: false,
      keyboardUp: false,
      evaluating: this.data.evaluating,
      retrying: this.data.retrying
    }, rewriteState(record))
    next.primaryText = primaryTextOf(next)
    this.setData(next)
  },

  onAnswerInput(event) {
    const id = this.data.item.id
    if (!id) return
    const answer = event.detail.value
    // 只更新这一题的答案字段：不再每次按键复制并回传整份 answers
    this.setData({
      [`answers.${id}`]: answer,
      answer,
      answerLength: answer.length
    })
  },

  // 键盘高度变化：底栏让位给行内提交按钮，键盘收起后恢复
  onKeyboard(event) {
    const height = Number(event.detail && event.detail.height) || 0
    this.setData({ keyboardUp: height > 0 })
  },

  // 关闭系统自动上推，改为把输入区滚到顶部，让行内提交按钮始终在键盘上方
  onAnswerFocus() {
    if (!this.data.item.id) return
    wx.pageScrollTo({ selector: '#answer-input', duration: 200 })
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
    this.setData({ evaluating: true, retrying: false, primaryText: '评估中…' })
    // 收起键盘，让评估结果和逐点核对直接出现在眼前
    if (typeof wx.hideKeyboard === 'function') wx.hideKeyboard({ fail: () => {} })
    // 判题是幂等的（同一答案在服务端会复用已存结果）：超时类失败自动重试一次，
    // 解决「第一次报错、再点一次提交才好」；首次超时后服务端会短路走本地判定，重试很快返回
    const run = () => savePractice(item.id, answer, attempt)
    run().catch((error) => {
      if (!isTimeoutError(error)) throw error
      this.setData({ retrying: true, primaryText: '正在重试…' })
      return run()
    }).then((record) => {
      const records = Object.assign({}, this.data.records, { [item.id]: record })
      const items = this.data.items.map((practice) => Object.assign({}, practice, {
        passed: !!(records[practice.id] && records[practice.id].result === 'pass')
      }))
      const passed = items.filter((practice) => practice.passed).length
      const changes = Object.assign({
        evaluating: false,
        retrying: false,
        records,
        items,
        passed,
        nextReady: !items.length || passed === items.length,
        nextIndex: nextQuestionIndex(items, currentIndex),
        keyboardUp: false
      }, rewriteState(record))
      if (this.data.item.id === item.id) {
        changes.record = record
        changes.showReference = false
      }
      changes.primaryText = primaryTextOf(changes)
      this.setData(changes)
      // 判定结果的声音反馈：通过播「答对啦」，未通过播「答错了」
      if (record.result === 'pass') playCorrectSound()
      else if (record.result === 'fail') playWrongSound()
      if (record.saved === false) {
        wx.showToast({ title: '这次结果没存上，下次进来会重新判定', icon: 'none', duration: 2500 })
      }
    }).catch((error) => {
      const idle = Object.assign({}, this.data, { evaluating: false, retrying: false })
      this.setData({ evaluating: false, retrying: false, primaryText: primaryTextOf(idle) })
      wx.showToast({ title: errorMessage(error, '评估服务响应慢，请再点一次提交'), icon: 'none', duration: 2500 })
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
