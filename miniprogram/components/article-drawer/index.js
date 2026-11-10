// 原文抽屉：从当前文章正文里按句拆开，高亮正在讲解的那一句
// 纯前端展示 ocrText，不发起任何请求、不消耗模型额度
function normalize(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

// 原文是长阅读场景，字号单独给三档并记住选择，不改全局样式
const SCALE_KEY = 'miao_reading_scale'
const SCALES = ['s', 'm', 'l']

Component({
  properties: {
    visible: { type: Boolean, value: false },
    text: { type: String, value: '' },
    highlight: { type: String, value: '' }
  },

  data: {
    sentences: [],
    fontScale: 'm'
  },

  lifetimes: {
    attached() {
      let scale = 'm'
      try {
        const saved = wx.getStorageSync(SCALE_KEY)
        if (SCALES.indexOf(saved) >= 0) scale = saved
      } catch (error) {
        // 读不到存储就用默认字号
      }
      if (scale !== 'm') this.setData({ fontScale: scale })
    }
  },

  observers: {
    'text, highlight': function (text, highlight) {
      const key = normalize(highlight)
      const sentences = (normalize(text).match(/[^.!?]+[.!?]*/g) || [])
        .map((raw, index) => {
          const value = raw.trim()
          return {
            id: index,
            value,
            active: !!key && (value === key || value.indexOf(key) >= 0)
          }
        })
        .filter((item) => item.value)
      this.setData({ sentences })
    }
  },

  methods: {
    setScale(event) {
      const scale = event.currentTarget.dataset.scale
      if (SCALES.indexOf(scale) < 0 || scale === this.data.fontScale) return
      this.setData({ fontScale: scale })
      try {
        wx.setStorageSync(SCALE_KEY, scale)
      } catch (error) {
        // 存储失败不影响本次调整
      }
    },
    close() {
      this.triggerEvent('close')
    },
    noop() {}
  }
})
