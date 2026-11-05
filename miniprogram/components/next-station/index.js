Component({
  properties: {
    visible: { type: Boolean, value: false },
    title: { type: String, value: '这一站通关了' },
    desc: { type: String, value: '' },
    nextName: { type: String, value: '' },
    step: { type: String, value: '' },
    cat: { type: String, value: 'vocab-magnifier' },
    actionText: { type: String, value: '继续下一站' }
  },
  methods: {
    handleTap() {
      this.triggerEvent('next')
    }
  }
})
