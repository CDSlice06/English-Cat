function countAnswer(text, mode) {
  const raw = String(text || '')
  if (mode === 'en2zh') {
    return (raw.match(/[\u4e00-\u9fa5]/g) || []).length
  }
  return (raw.match(/[A-Za-z][A-Za-z'-]*/g) || []).length
}

// 信息点核对：评估层返回 { zh, ok, note }
function normalizeChecklist(list) {
  return (Array.isArray(list) ? list : []).map((item) => {
    if (typeof item === 'string') return { text: item, hit: null }
    if (!item || typeof item !== 'object') return null
    const text = item.zh || item.text || item.point || item.label || ''
    if (!text) return null
    const hit = item.ok === true ? true : (item.ok === false ? false : null)
    return { text: item.note ? `${text}（${item.note}）` : text, hit }
  }).filter(Boolean)
}

// 改善建议：评估层返回 { point, wrong, correct }，拼成“问题：错 → 对”
function normalizeImprovements(list) {
  return (Array.isArray(list) ? list : []).map((item) => {
    if (typeof item === 'string') return { text: item }
    if (!item || typeof item !== 'object') return null
    const point = item.point || item.text || ''
    const wrong = item.wrong || ''
    const correct = item.correct || ''
    let text = point
    if (wrong && correct) text = point ? `${point}：${wrong} → ${correct}` : `${wrong} → ${correct}`
    else if (correct) text = point ? `${point}：${correct}` : correct
    if (!text) return null
    return { text }
  }).filter(Boolean)
}

Page({
  data: {
    loading: true,
    error: '',
    question: null,
    answer: '',
    count: 0,
    photo: '',
    recognizing: false,
    submitting: false,
    attempt: 0,
    result: null,
    reference: '',
    points: [],
    showAnswer: false
  },

  onLoad(options) {
    this.questionId = String((options && options.id) || '')
    this.loadQuestion()
  },

  async loadQuestion() {
    if (!this.questionId) {
      this.setData({ loading: false, error: '题目不存在' })
      return
    }
    try {
      const res = await wx.cloud.callFunction({
        name: 'evaluateTranslation',
        data: { action: 'writing', writingAction: 'get', id: this.questionId }
      })
      const payload = (res && res.result) || {}
      if (payload.code !== 0 || !payload.data || !payload.data.question) {
        throw new Error(payload.message || '题目加载失败')
      }
      this.setData({ loading: false, error: '', question: payload.data.question })
    } catch (error) {
      console.log('writing question failed', error)
      this.setData({ loading: false, error: (error && error.message) || '题目加载失败' })
    }
  },

  onAnswerInput(event) {
    const answer = event.detail.value || ''
    this.setData({ answer, count: countAnswer(answer, this.data.question && this.data.question.mode) })
  },

  async choosePhoto() {
    if (this.data.recognizing) return
    let filePath = ''
    try {
      const chosen = await wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      const file = chosen && chosen.tempFiles && chosen.tempFiles[0]
      filePath = file && file.tempFilePath
    } catch (error) {
      return
    }
    if (!filePath) return

    this.setData({ photo: filePath, recognizing: true })
    let uploadedFileID = ''
    try {
      wx.showLoading({ title: '上传照片', mask: true })
      const uploaded = await wx.cloud.uploadFile({
        cloudPath: `writing/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`,
        filePath
      })
      uploadedFileID = uploaded.fileID
      wx.showLoading({ title: '识别手写', mask: true })
      const res = await wx.cloud.callFunction({
        name: 'parseDocument',
        data: { action: 'handwriting', fileID: uploaded.fileID }
      })
      const payload = (res && res.result) || {}
      wx.hideLoading()
      if (payload.code !== 0) throw new Error(payload.message || '手写识别失败')
      const text = String((payload.data && payload.data.text) || '').trim()
      if (!text) throw new Error('没有识别出文字')
      this.setData({
        answer: text,
        count: countAnswer(text, this.data.question && this.data.question.mode),
        result: null,
        showAnswer: false
      })
      wx.showToast({ title: '已识别，请先核对', icon: 'none' })
    } catch (error) {
      wx.hideLoading()
      wx.showModal({
        title: '识别没成功',
        content: (error && error.message) || '换一张更清晰的照片，或直接输入译文。',
        showCancel: false
      })
    } finally {
      // 手写照片只用于本次识别，无论成功失败都删除云端副本，避免长期占用存储
      if (uploadedFileID) wx.cloud.deleteFile({ fileList: [uploadedFileID] }).catch(() => {})
      this.setData({ recognizing: false })
    }
  },

  clearPhoto() {
    this.setData({ photo: '' })
  },

  clearAnswer() {
    this.setData({ answer: '', count: 0, result: null, showAnswer: false })
  },

  async submit() {
    if (this.data.submitting) return
    const answer = String(this.data.answer || '').trim()
    if (!answer) {
      wx.showToast({ title: '请先写下译文', icon: 'none' })
      return
    }
    this.setData({ submitting: true })
    wx.showLoading({ title: 'AI 正在点评', mask: true })
    try {
      const res = await wx.cloud.callFunction({
        name: 'evaluateTranslation',
        data: {
          action: 'writing',
          writingAction: 'submit',
          id: this.questionId,
          answer,
          attempt: this.data.attempt + 1
        }
      })
      const payload = (res && res.result) || {}
      if (payload.code !== 0) throw new Error(payload.message || '点评失败')
      const data = payload.data || {}
      wx.hideLoading()
      this.setData({
        attempt: data.attempt || (this.data.attempt + 1),
        result: {
          pass: data.result === 'pass',
          feedback: data.feedback || '',
          tip: data.tip || '',
          rule: data.rule || '',
          improvements: normalizeImprovements(data.improvements),
          checklist: normalizeChecklist(data.checklist),
          usage: data.usage && (data.usage.correct || data.usage.point) ? data.usage : null,
          source: data.source === 'ai' ? 'AI 点评' : '规则判定'
        },
        reference: data.reference || '',
        points: Array.isArray(data.points) ? data.points : [],
        showAnswer: true
      }, () => {
        wx.pageScrollTo({ selector: '#result-card', duration: 300 })
      })
    } catch (error) {
      wx.hideLoading()
      wx.showModal({
        title: '点评没成功',
        content: (error && error.message) || '网络不太稳定，稍后再试一次。',
        showCancel: false
      })
    } finally {
      this.setData({ submitting: false })
    }
  },

  rewrite() {
    this.setData({ result: null, showAnswer: false })
    wx.pageScrollTo({ scrollTop: 0, duration: 250 })
  },

  copyReference() {
    if (!this.data.reference) return
    wx.setClipboardData({ data: this.data.reference })
  }
})
