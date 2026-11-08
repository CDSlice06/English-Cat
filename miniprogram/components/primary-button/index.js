const { playTapSound } = require('../../utils/sound')

Component({
  externalClasses: ['custom-class'],
  properties: {
    text: { type: String, value: '确定' },
    disabled: { type: Boolean, value: false },
    secondary: { type: Boolean, value: false }
  },
  methods: {
    handleTap() {
      if (this.data.disabled) return
      // 全站主按钮统一带点击音效，让「按下去」有即时反馈
      playTapSound()
      this.triggerEvent('tap')
    }
  }
})
