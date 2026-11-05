const { speakWord, stopSpeech } = require('../../utils/speech')

Component({
  properties: {
    word: { type: String, value: '' }
  },

  data: { playing: false },

  detached() {
    stopSpeech()
  },

  methods: {
    onTap() {
      const word = String(this.data.word || '').trim()
      if (!word) return
      speakWord(word, {
        onStart: () => this.setData({ playing: true }),
        onEnd: () => this.setData({ playing: false }),
        onError: () => {
          this.setData({ playing: false })
          wx.showToast({ title: '朗读加载失败，请检查网络', icon: 'none' })
        }
      })
    }
  }
})
