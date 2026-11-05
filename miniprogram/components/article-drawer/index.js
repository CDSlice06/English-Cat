// 原文抽屉：从当前文章正文里按句拆开，高亮正在讲解的那一句
// 纯前端展示 ocrText，不发起任何请求、不消耗模型额度
function normalize(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

Component({
  properties: {
    visible: { type: Boolean, value: false },
    text: { type: String, value: '' },
    highlight: { type: String, value: '' }
  },

  data: {
    sentences: []
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
    close() {
      this.triggerEvent('close')
    },
    noop() {}
  }
})
