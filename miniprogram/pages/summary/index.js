const { loadStudy, getProgress, vocabStats, backfillPracticeRules, loadFullTranslation } = require('../../services/study')
const { errorMessage } = require('../../utils/error')

// 画布上的中文按字符断行，避免长标题溢出卡片
function wrapText(ctx, text, maxWidth) {
  const chars = String(text || '').split('')
  const lines = []
  let line = ''
  chars.forEach((char) => {
    const next = line + char
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line)
      line = char
    } else {
      line = next
    }
  })
  if (line) lines.push(line)
  return lines.length ? lines : ['']
}

// 判定器返回的错误类型 key → 报告里的中文说法
const RULE_LABELS = {
  incomplete: '句子没写完 / 缺成分',
  tail: '漏译后半句',
  clause: 'whether / if 从句语序',
  'clause-predicate': '从句缺谓语',
  'clause-subject': '引导词叠加 / 从句缺主语',
  subjectOrder: '主谓顺序颠倒',
  subjectGap: '主谓被状语隔开',
  tense: '时态用错',
  modal: '情态动词后动词形式',
  agreement: '主谓一致',
  determiner: '漏冠词',
  quantity: '数量与名词复数',
  inversion: '倒装用法',
  soThat: 'so…that 结构',
  comparison: '比较级 than 结构',
  adverbial: '状语从句结构',
  prep: '介词搭配与介词短语',
  relative: '定语从句结构',
  subjunctive: '虚拟语气',
  nonfinite: '非谓语动词',
  parallel: '并列与关联连词',
  passive: '被动语态',
  formalIt: '形式主语 / 形式宾语',
  thereBe: 'there be 句型',
  order: '结构不完整 / 语序',
  info: '信息不全或意思偏离'
}

// 从练习记录里统计：一次通过率 + 最常犯的错误类型
function diagnose(practiceRecords) {
  const records = Object.keys(practiceRecords || {})
    .map((key) => practiceRecords[key])
    .filter((record) => record && record.result && record.result !== 'pending')
  const firstTryPass = records.filter((record) => record.result === 'pass'
    && (Number(record.attempt) || 1) === 1).length
  const failed = records.filter((record) => record.result === 'fail')
  const counts = {}
  records.forEach((record) => {
    if (record.result !== 'fail' || !record.rule) return
    counts[record.rule] = (counts[record.rule] || 0) + 1
  })
  const topErrors = Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .slice(0, 3)
    .map((key) => ({ key, label: RULE_LABELS[key] || '表达不到位', count: counts[key] }))
  return {
    practiceTotal: records.length,
    firstTryRate: records.length ? Math.round((firstTryPass / records.length) * 100) : 0,
    topErrors,
    // 有失败记录但一条错误类型都没有，说明是 rule 字段上线前的存量数据
    failCount: failed.length,
    ruleCount: failed.filter((record) => !!record.rule).length
  }
}

Page({
  data: {
    loading: true,
    error: '',
    complete: false,
    articleTitle: '',
    articleId: '',
    progress: { completed: 0, total: 4, percent: 0, practicePassed: 0 },
    units: [],
    reviewWords: [],
    plan: '',
    practiceTotal: 0,
    firstTryRate: 0,
    failCount: 0,
    topErrors: [],
    // 全文对照：整篇逐句翻译，生成一次后缓存在文章里
    translation: [],
    translationLoading: false,
    translationError: '',
    // 手账卡片：离屏 canvas 画好再存进相册
    savingCard: false
  },

  onShow() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage']
    })
    this.load()
  },

  // 报告页也支持转发：卡片先存相册，再自己选图发出去
  onShareAppMessage() {
    return {
      title: `我的精读报告 · ${this.data.articleTitle || '英语精读喵'}`,
      path: '/pages/index/index'
    }
  },

  load() {
    this.setData({ loading: true, error: '' })
    loadStudy(true).then(({ article, unit }) => {
      // 存量失败记录缺少 rule 字段时，先让云端按原始答案重算一次错误类型
      const records = unit.practiceRecords || {}
      const legacyFailures = Object.keys(records).some((key) => {
        const record = records[key]
        return record && record.result === 'fail' && !record.rule
      })
      if (legacyFailures && !this.backfillTried) {
        this.backfillTried = true
        backfillPracticeRules(article._id)
          .then(() => this.load())
          .catch(() => this.load())
        return
      }

      const unitData = article.unitData || {}
      const vocabulary = unitData.vocabulary || []
      const grammarPoints = unitData.grammarPoints || []
      const phrases = unitData.phrases || []
      const progress = getProgress(unit, unitData)
      const complete = progress.completed === progress.total
      const preferredIds = ['w1', 'w2', 'w3', 'w10']
      const reviewWords = preferredIds.map((id) => vocabulary.find((word) => word.id === id)).filter(Boolean)
      vocabulary.forEach((word) => {
        if (reviewWords.length < 4 && reviewWords.indexOf(word) === -1) reviewWords.push(word)
      })

      const grammarDone = !grammarPoints.length || progress.grammarViewed >= grammarPoints.length
      const phraseDone = !phrases.length || progress.phrasesViewed >= phrases.length
      const practiceDone = !progress.drillTotal || progress.practicePassed >= progress.drillTotal
      const vocab = vocabStats(unit, unitData)
      const vocabDone = vocab.mastered >= vocab.total
      const stats = diagnose(unit.practiceRecords)
      const cachedTranslation = Array.isArray(unitData.fullTranslation) ? unitData.fullTranslation : []

      let plan = '尝试不看参考翻译复述原文，并在下一篇文章中迁移本次的句式和词组。'
      if (!vocabDone) {
        plan = '先回到词汇页，把这篇文章的单词全部点一遍再往下走。'
      } else if (!phraseDone) {
        plan = '去词组页把固定搭配整块记下来，重点看它们在原句里的用法。'
      } else if (!grammarDone) {
        plan = '继续看语法页，把每个语法点的「怎么理解、怎么翻译」过一遍。'
      } else if (!practiceDone) {
        plan = '继续做英译汉练习，按反馈补上遗漏的关键表达。'
      }

      this.setData({
        loading: false,
        complete,
        articleTitle: article.title,
        articleId: article._id,
        progress,
        reviewWords,
        plan,
        practiceTotal: stats.practiceTotal,
        firstTryRate: stats.firstTryRate,
        failCount: stats.failCount,
        topErrors: stats.topErrors,
        translation: cachedTranslation,
        translationError: cachedTranslation.length ? '' : this.data.translationError,
        units: [
          { name: '词汇', value: `单词 ${vocab.mastered}/${vocab.total} 个已掌握`, done: vocabDone },
          { name: '词组搭配', value: `${progress.phrasesViewed}/${phrases.length} 个已看`, done: phraseDone },
          { name: '语法点', value: `${progress.grammarViewed}/${grammarPoints.length} 个已看`, done: grammarDone },
          { name: '输出练习', value: `${progress.practicePassed}/${progress.drillTotal} 道已通过`, done: practiceDone }
        ]
      })
      // 四个单元都通关后才生成全文对照；每次进入页面最多自动尝试一次，失败后可手动重试
      if (complete && !cachedTranslation.length && !this.translationTried) {
        this.translationTried = true
        this.ensureTranslation(article._id)
      }
    }).catch((error) => {
      this.setData({ loading: false, error: errorMessage(error) })
    })
  },

  ensureTranslation(articleId) {
    if (!articleId || this.translationPending) return
    this.translationPending = true
    this.setData({ translationLoading: true, translationError: '' })
    loadFullTranslation(articleId)
      .then((data) => {
        this.translationPending = false
        this.setData({
          translationLoading: false,
          translation: Array.isArray(data.sentences) ? data.sentences : []
        })
      })
      .catch((error) => {
        this.translationPending = false
        this.setData({ translationLoading: false, translationError: errorMessage(error) })
      })
  },

  retryTranslation() {
    this.translationPending = false
    this.ensureTranslation(this.data.articleId)
  },

  // 把这篇的精读成果画成一张手账卡片，存进相册
  saveReportCard() {
    if (this.data.savingCard) return
    this.setData({ savingCard: true })
    wx.createSelectorQuery()
      .select('#reportCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const item = res && res[0]
        const canvas = item && item.node
        if (!canvas) {
          this.setData({ savingCard: false })
          wx.showToast({ title: '卡片还没准备好，请重试', icon: 'none' })
          return
        }
        const width = 620
        const height = 900
        const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
        const dpr = Math.min(2, Number(info && info.pixelRatio) || 2)
        canvas.width = width * dpr
        canvas.height = height * dpr
        const ctx = canvas.getContext('2d')
        ctx.scale(dpr, dpr)
        this.paintCard(ctx, canvas, width, height).then(() => {
          // 不传 x/y/width/height，交给接口按整块画布导出：
          // 2d canvas 的裁剪参数到底按 CSS 尺寸还是像素尺寸算各机型有差异，显式传会裁掉一半
          wx.canvasToTempFilePath({
            canvas,
            destWidth: width * dpr,
            destHeight: height * dpr,
            success: (file) => this.saveToAlbum(file.tempFilePath),
            fail: () => {
              this.setData({ savingCard: false })
              wx.showToast({ title: '卡片生成失败，请重试', icon: 'none' })
            }
          })
        }).catch(() => {
          this.setData({ savingCard: false })
          wx.showToast({ title: '卡片生成失败，请重试', icon: 'none' })
        })
      })
  },

  paintCard(ctx, canvas, width, height) {
    return new Promise((resolve) => {
      const ink = '#3c3228'
      const muted = '#6f6557'
      const accent = '#a86a11'
      const serif = '"Iowan Old Style", Georgia, "Songti SC", serif'
      const sans = '"PingFang SC", "Songti SC", sans-serif'
      const pad = 36
      const inner = width - pad * 2

      // 纸底 + 双层描边
      ctx.fillStyle = '#fdf7ea'
      ctx.fillRect(0, 0, width, height)
      ctx.strokeStyle = 'rgba(75, 64, 52, 0.55)'
      ctx.lineWidth = 3
      ctx.strokeRect(16, 16, width - 32, height - 32)
      ctx.strokeStyle = 'rgba(75, 64, 52, 0.18)'
      ctx.lineWidth = 1
      ctx.strokeRect(28, 28, width - 56, height - 56)

      // 左上角纸胶带
      ctx.save()
      ctx.translate(58, 30)
      ctx.rotate(-0.06)
      ctx.fillStyle = 'rgba(255, 226, 160, 0.92)'
      ctx.fillRect(0, 0, 96, 26)
      ctx.restore()

      // 标题区
      ctx.fillStyle = muted
      ctx.font = `20px ${serif}`
      ctx.fillText('DEEP READING REPORT', pad, 96)

      ctx.fillStyle = ink
      ctx.font = `700 34px ${sans}`
      ctx.fillText('英语精读喵 · 精读手账', pad, 140)

      ctx.fillStyle = ink
      ctx.font = `700 24px ${serif}`
      const titleLines = wrapText(ctx, this.data.articleTitle || '本篇精读', inner).slice(0, 2)
      titleLines.forEach((line, index) => {
        ctx.fillText(line, pad, 182 + index * 34)
      })

      const dividerY = 182 + titleLines.length * 34 + 18
      ctx.save()
      ctx.strokeStyle = 'rgba(75, 64, 52, 0.28)'
      ctx.setLineDash([6, 6])
      ctx.beginPath()
      ctx.moveTo(pad, dividerY)
      ctx.lineTo(width - pad, dividerY)
      ctx.stroke()
      ctx.restore()

      // 大号进度
      const progressY = dividerY + 84
      ctx.fillStyle = accent
      ctx.font = `700 76px ${serif}`
      ctx.fillText(`${this.data.progress.percent || 0}%`, pad, progressY)

      ctx.fillStyle = muted
      ctx.font = `22px ${sans}`
      ctx.fillText(`已通关 ${this.data.progress.completed || 0}/4 个单元`, pad, progressY + 30)

      // 进度条
      const barY = progressY + 48
      ctx.fillStyle = 'rgba(75, 64, 52, 0.12)'
      ctx.fillRect(pad, barY, inner, 12)
      ctx.fillStyle = '#e5b95c'
      ctx.fillRect(pad, barY, Math.max(0, Math.min(1, (this.data.progress.percent || 0) / 100)) * inner, 12)

      // 四个单元：两列两行
      const units = this.data.units || []
      const unitTop = barY + 56
      units.forEach((unit, index) => {
        const col = index % 2
        const row = Math.floor(index / 2)
        const x = pad + col * (inner / 2)
        const y = unitTop + row * 100
        ctx.beginPath()
        ctx.arc(x + 9, y - 6, 7, 0, Math.PI * 2)
        if (unit.done) {
          ctx.fillStyle = '#7fa87f'
          ctx.fill()
        } else {
          ctx.strokeStyle = 'rgba(75, 64, 52, 0.4)'
          ctx.lineWidth = 2
          ctx.stroke()
        }
        ctx.fillStyle = ink
        ctx.font = `700 25px ${sans}`
        ctx.fillText(unit.name, x + 26, y)
        ctx.fillStyle = muted
        ctx.font = `21px ${sans}`
        ctx.fillText(unit.value || '', x + 26, y + 30)
      })

      // 重点词：给右下角的猫猫留出位置
      const wordsY = unitTop + 180
      ctx.fillStyle = ink
      ctx.font = `700 25px ${sans}`
      ctx.fillText('重点词回顾', pad, wordsY)

      ctx.fillStyle = ink
      ctx.font = `700 26px ${serif}`
      const wordText = (this.data.reviewWords || []).map((word) => word.word).join(' · ') || '这篇还没有重点词'
      const wordLines = wrapText(ctx, wordText, inner - 180).slice(0, 2)
      wordLines.forEach((line, index) => {
        ctx.fillText(line, pad, wordsY + 42 + index * 38)
      })

      // 输出练习
      const practiceY = wordsY + 42 + wordLines.length * 38 + 30
      ctx.fillStyle = ink
      ctx.font = `700 25px ${sans}`
      ctx.fillText('输出练习', pad, practiceY)
      ctx.fillStyle = muted
      ctx.font = `22px ${sans}`
      const practiceText = this.data.practiceTotal
        ? `通过 ${this.data.progress.practicePassed || 0}/${this.data.progress.drillTotal || 0} 道 · 一次通过率 ${this.data.firstTryRate}%`
        : '还没有开始英译汉练习'
      ctx.fillText(practiceText, pad, practiceY + 34)

      // 日期
      const now = new Date()
      const month = `0${now.getMonth() + 1}`.slice(-2)
      const day = `0${now.getDate()}`.slice(-2)
      ctx.fillStyle = muted
      ctx.font = `20px ${serif}`
      ctx.fillText(`${now.getFullYear()}.${month}.${day}`, pad, height - 44)

      // 右下角猫猫：加载失败也不影响卡片本身
      if (typeof canvas.createImage !== 'function') {
        resolve()
        return
      }
      const image = canvas.createImage()
      // 图片加载最长等 2 秒：拿不到就少画一只猫，卡片照样能存
      const timer = setTimeout(resolve, 2000)
      image.onload = () => {
        clearTimeout(timer)
        ctx.drawImage(image, width - 200, 610, 170, 170)
        resolve()
      }
      image.onerror = () => {
        clearTimeout(timer)
        resolve()
      }
      image.src = '/assets/ip/cat-complete-halo.png'
    })
  },

  saveToAlbum(tempFilePath) {
    wx.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success: () => {
        this.setData({ savingCard: false })
        wx.showToast({ title: '已存进相册', icon: 'success' })
      },
      fail: (err) => {
        this.setData({ savingCard: false })
        const message = (err && err.errMsg) || ''
        if (message.indexOf('auth') >= 0 || message.indexOf('authorize') >= 0) {
          wx.showModal({
            title: '需要相册权限',
            content: '存卡片需要「保存到相册」的权限，去设置里打开就能用了。',
            confirmText: '去设置',
            confirmColor: '#a86a11',
            success: (res) => {
              if (res.confirm) wx.openSetting({})
            }
          })
          return
        }
        wx.showToast({ title: message.indexOf('cancel') >= 0 ? '已取消保存' : '保存失败，请重试', icon: 'none' })
      }
    })
  },

  goTab(event) {
    wx.switchTab({ url: event.currentTarget.dataset.url })
  }
})
