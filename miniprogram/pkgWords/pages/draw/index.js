const drawings = require('../../../services/drawings')
const { playTapSound } = require('../../../utils/sound')

// 画笔颜色就用页面上的几支，够画一个场景了
const COLORS = [
  { key: 'ink', value: '#4b4034' },
  { key: 'amber', value: '#a86a11' },
  { key: 'coral', value: '#e2654b' },
  { key: 'sky', value: '#5b8bc4' },
  { key: 'mint', value: '#5fa87c' }
]

Page({
  data: {
    word: '',
    meaning: '',
    id: '',
    colors: COLORS,
    color: COLORS[0].value,
    canUndo: false,
    saving: false
  },

  onLoad(query) {
    this.strokes = []
    this.setData({
      word: decodeURIComponent(query.word || ''),
      meaning: decodeURIComponent(query.meaning || ''),
      id: decodeURIComponent(query.id || '')
    })
  },

  onReady() {
    this.initCanvas()
  },

  initCanvas() {
    wx.createSelectorQuery()
      .select('#board')
      .fields({ node: true, size: true })
      .exec((res) => {
        const info = res && res[0]
        if (!info || !info.node) return
        const canvas = info.node
        const ctx = canvas.getContext('2d')
        // 像素比封顶 2，画布再大就白占内存了
        const dpr = Math.min(wx.getSystemInfoSync().pixelRatio || 1, 2)
        canvas.width = info.width * dpr
        canvas.height = info.height * dpr
        ctx.scale(dpr, dpr)
        this.canvas = canvas
        this.ctx = ctx
        this.width = info.width
        this.height = info.height
        this.paint()
      })
  },

  // 整幅重绘：清屏 + 淡格子 + 所有笔画
  paint() {
    const ctx = this.ctx
    if (!ctx) return
    ctx.fillStyle = '#fffdf9'
    ctx.fillRect(0, 0, this.width, this.height)
    ctx.strokeStyle = 'rgba(75, 64, 52, 0.07)'
    ctx.lineWidth = 1
    const gap = 32
    for (let x = gap; x < this.width; x += gap) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, this.height)
      ctx.stroke()
    }
    for (let y = gap; y < this.height; y += gap) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(this.width, y)
      ctx.stroke()
    }
    ;(this.strokes || []).forEach((stroke) => this.strokePath(stroke))
  },

  strokePath(stroke) {
    const ctx = this.ctx
    if (!ctx || !stroke.points.length) return
    ctx.strokeStyle = stroke.color
    ctx.fillStyle = stroke.color
    ctx.lineWidth = stroke.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    if (stroke.points.length === 1) {
      const point = stroke.points[0]
      ctx.beginPath()
      ctx.arc(point.x, point.y, stroke.width / 2, 0, Math.PI * 2)
      ctx.fill()
      return
    }
    ctx.beginPath()
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
    for (let i = 1; i < stroke.points.length; i += 1) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
    }
    ctx.stroke()
  },

  touchPoint(event) {
    const touch = event.touches && event.touches[0]
    if (!touch) return null
    return { x: touch.x, y: touch.y }
  },

  onTouchStart(event) {
    const point = this.touchPoint(event)
    if (!point) return
    playTapSound()
    this.strokes.push({ color: this.data.color, width: 4, points: [point] })
    this.strokePath(this.strokes[this.strokes.length - 1])
    this.setData({ canUndo: true })
  },

  onTouchMove(event) {
    const stroke = this.strokes && this.strokes[this.strokes.length - 1]
    const point = this.touchPoint(event)
    if (!stroke || !point) return
    const last = stroke.points[stroke.points.length - 1]
    if (last && Math.abs(last.x - point.x) + Math.abs(last.y - point.y) < 1.5) return
    stroke.points.push(point)
    // 只补最后一段，不整幅重绘，画起来才跟手
    const ctx = this.ctx
    if (!ctx) return
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(last.x, last.y)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
  },

  pickColor(event) {
    const color = event.currentTarget.dataset.color
    if (!color) return
    playTapSound()
    this.setData({ color })
  },

  undo() {
    if (!this.strokes || !this.strokes.length) return
    playTapSound()
    this.strokes.pop()
    this.paint()
    this.setData({ canUndo: this.strokes.length > 0 })
  },

  clear() {
    if (!this.strokes || !this.strokes.length) return
    playTapSound()
    this.strokes = []
    this.paint()
    this.setData({ canUndo: false })
  },

  skip() {
    wx.navigateBack()
  },

  save() {
    if (this.data.saving) return
    if (!this.strokes || !this.strokes.length) {
      wx.showToast({ title: '先画几笔再保存', icon: 'none' })
      return
    }
    if (!this.canvas || !this.data.id) {
      wx.showToast({ title: '画板还没准备好', icon: 'none' })
      return
    }
    this.setData({ saving: true })
    wx.canvasToTempFilePath({
      canvas: this.canvas,
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      destWidth: this.width * 2,
      destHeight: this.height * 2,
      fileType: 'png',
      success: (res) => {
        const saved = drawings.save(this.data.id, res.tempFilePath)
        if (!saved) {
          this.setData({ saving: false })
          wx.showToast({ title: '保存失败，再试一次', icon: 'none' })
          return
        }
        wx.showToast({ title: '记好了', icon: 'success' })
        setTimeout(() => wx.navigateBack(), 350)
      },
      fail: () => {
        this.setData({ saving: false })
        wx.showToast({ title: '保存失败，再试一次', icon: 'none' })
      }
    })
  }
})
