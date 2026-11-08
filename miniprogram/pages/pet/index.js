const petService = require('../../services/pet')

// 动作动画时长：和 wxss 里的 keyframes 对齐，动画结束后摘掉 class
const MOTION_MS = 800

Page({
  data: {
    loading: true,
    error: '',
    pet: null,
    motion: '',
    acting: false,
    claiming: false
  },

  onShow() {
    this.load()
  },

  load() {
    if (!this.data.pet) this.setData({ loading: true, error: '' })
    petService.getPet()
      .then((pet) => this.setData({ pet, loading: false, error: '' }))
      .catch((error) => {
        // 已经有宠物画面时，刷新失败不把页面换成错误页
        if (this.data.pet) return
        this.setData({ loading: false, error: error.message || '宠物走丢了，稍后再试' })
      })
  },

  act(event) {
    this.run(event.currentTarget.dataset.action)
  },

  touchPet() {
    this.run('touch')
  },

  run(action) {
    if (!action || this.data.acting) return
    this.setData({ acting: true, motion: action, error: '' })
    try {
      wx.vibrateShort({ type: 'light', fail() {} })
    } catch (error) {
      // 部分机型不支持触感反馈，忽略
    }
    petService.interact(action)
      .then((pet) => {
        this.setData({ pet })
        setTimeout(() => this.setData({ acting: false, motion: '' }), MOTION_MS)
      })
      .catch((error) => {
        this.setData({ acting: false, motion: '' })
        wx.showToast({ title: error.message || '它现在不想动', icon: 'none' })
      })
  },

  claim() {
    if (this.data.claiming || !this.data.pet) return
    if (!this.data.pet.daily.canClaim) {
      wx.showToast({
        title: this.data.pet.daily.claimed ? '今天已经领过啦' : '先把三件事都做一遍',
        icon: 'none'
      })
      return
    }
    this.setData({ claiming: true })
    petService.claimQuest()
      .then((pet) => {
        this.setData({ pet, claiming: false })
        wx.showToast({ title: '成长值 +' + pet.daily.reward, icon: 'none' })
      })
      .catch((error) => {
        this.setData({ claiming: false })
        wx.showToast({ title: error.message || '领取失败', icon: 'none' })
      })
  },

  goStudy() {
    wx.switchTab({ url: '/pages/workbench/index' })
  }
})
