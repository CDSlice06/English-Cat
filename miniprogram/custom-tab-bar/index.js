Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/index/index', text: '首页', icon: 'home' },
      { pagePath: '/pages/workbench/index', text: '学习', icon: 'study' },
      { pagePath: '/pages/profile/index', text: '我的', icon: 'profile' }
    ]
  },

  methods: {
    switchTab(event) {
      const { index, path } = event.currentTarget.dataset
      if (index === this.data.selected) return
      wx.switchTab({ url: path })
    }
  }
})
