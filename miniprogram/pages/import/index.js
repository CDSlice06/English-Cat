const { loadStudy } = require('../../services/study')

const MAX_BYTES = 8 * 1024 * 1024
const ALLOWED_EXT = ['docx', 'pdf']

function formatSize(bytes) {
  if (!bytes) return '0 KB'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function extensionOf(name) {
  const match = String(name || '').toLowerCase().match(/\.([a-z0-9]+)$/)
  return match ? match[1] : ''
}

// 分页 OCR 需要连续多次调用，统一包成 Promise
function callParse(data) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'parseDocument',
      data,
      success: (res) => resolve((res && res.result) || {}),
      fail: (error) => reject(error)
    })
  })
}

Page({
  data: {
    loading: true,
    error: '',
    file: null,
    parsing: false,
    uploading: false,
    // 扫描件逐页识别阶段：进度条改为真实页数，并可取消
    ocrRunning: false,
    progress: 0,
    stageText: '',
    // 上一次失败的原因，保留在页面上方便用户反馈
    lastError: ''
  },

  onShow() {
    this.loadPage()
  },

  loadPage() {
    this.setData({ loading: true, error: '' })
    loadStudy()
      .then(() => this.setData({ loading: false }))
      .catch((error) => {
        this.setData({
          loading: false,
          error: error.message || '学习数据加载失败，请重试'
        })
      })
  },

  chooseFile() {
    if (this.data.parsing) return
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ALLOWED_EXT,
      success: (result) => {
        const picked = (result.tempFiles || [])[0]
        if (picked) this.acceptFile(picked)
      },
      fail: (error) => {
        if (error.errMsg && error.errMsg.indexOf('cancel') >= 0) return
        wx.showToast({ title: '文件选择失败，请重试', icon: 'none' })
      }
    })
  },

  acceptFile(picked) {
    const name = picked.name || '未命名文档'
    const ext = extensionOf(name)
    if (ALLOWED_EXT.indexOf(ext) < 0) {
      wx.showModal({
        title: '格式不支持',
        content: '目前只支持 Word（.docx）和 PDF。旧版 .doc 请在 Word 里另存为 .docx 后再上传。',
        showCancel: false
      })
      return
    }
    if (picked.size > MAX_BYTES) {
      wx.showToast({ title: '文件超过 8MB，请压缩后再上传', icon: 'none' })
      return
    }
    // 换文件时把上一份云端副本删掉，避免存储里堆积
    this.cleanupUploaded()
    this.setData({
      lastError: '',
      file: {
        name,
        ext,
        path: picked.path,
        sizeLabel: formatSize(picked.size)
      }
    })
  },

  removeFile() {
    if (this.data.parsing) return
    this.cleanupUploaded()
    this.setData({ file: null })
  },

  parse() {
    const file = this.data.file
    if (!file) {
      wx.showToast({ title: '请先选择 Word 或 PDF 文件', icon: 'none' })
      return
    }
    if (this.data.parsing) return
    this.startParse(0)
  },

  // retry = 1 表示这是一次重试：复用已上传的云端文件，只重新解析
  startParse(retry) {
    const file = this.data.file
    if (!file) return
    this.uploadAborted = false
    this.abandoned = false
    this.ocrAborted = false
    this.cleanupOcrFiles()
    this.setData({
      parsing: true,
      uploading: false,
      ocrRunning: false,
      progress: 0,
      lastError: '',
      stageText: retry ? '正在重新提取…' : '正在上传文件…'
    })

    const uploaded = this.uploaded
    if (uploaded && uploaded.name === file.name && uploaded.path === file.path) {
      this.runParse(uploaded.fileID, file, retry)
      return
    }

    const safeName = file.name.replace(/[^\w.-]/g, '_').slice(-60)
    this.setData({ uploading: true, stageText: '正在上传文件… 0%' })
    const task = wx.cloud.uploadFile({
      cloudPath: `documents/${Date.now()}-${safeName}`,
      filePath: file.path,
      success: (result) => {
        this.clearUploadTimer()
        this.uploadTask = null
        this.setData({ uploading: false, progress: 100 })
        this.uploaded = { fileID: result.fileID, name: file.name, path: file.path }
        if (this.abandoned) {
          this.cleanupUploaded()
          return
        }
        this.runParse(result.fileID, file, retry)
      },
      fail: (error) => {
        this.clearUploadTimer()
        this.uploadTask = null
        this.setData({ uploading: false })
        // 主动取消/超时放弃时，fail 回调会跟着触发一次，这里不重复弹窗
        if (this.uploadAborted) {
          this.uploadAborted = false
          return
        }
        if (this.abandoned) return
        console.error('uploadFile 失败', error)
        this.failParse({
          code: 'UPLOAD',
          message: '文件上传失败，请检查网络后重试',
          retryable: true
        })
      }
    })
    this.uploadTask = task || null
    if (task && task.onProgressUpdate) {
      task.onProgressUpdate((res) => {
        if (!this.data.uploading) return
        const percent = Math.min(99, Math.max(0, Math.round(Number(res.progress) || 0)))
        this.setData({ progress: percent, stageText: `正在上传文件… ${percent}%` })
        // 有进展就重置看门狗，避免大文件被误杀
        this.touchUploadTimeout()
      })
    }
    this.touchUploadTimeout()
  },

  // 弱网下上传可能长时间没有进展：20 秒不动就主动放弃，避免用户干等
  touchUploadTimeout() {
    this.clearUploadTimer()
    this.uploadTimer = setTimeout(() => {
      this.uploadTimer = null
      this.uploadAborted = true
      const pending = this.uploadTask
      this.uploadTask = null
      if (pending && pending.abort) {
        try { pending.abort() } catch (error) { /* 已结束时 abort 会抛错，忽略 */ }
      }
      this.setData({ uploading: false })
      this.failParse({
        code: 'UPLOAD_TIMEOUT',
        message: '文件上传 20 秒没有进展，可能是网络不稳。请换到 Wi-Fi 后重试，或直接粘贴原文。',
        retryable: true
      })
    }, 20000)
  },

  clearUploadTimer() {
    if (this.uploadTimer) {
      clearTimeout(this.uploadTimer)
      this.uploadTimer = null
    }
  },

  cancelUpload() {
    if (!this.data.uploading) return
    this.uploadAborted = true
    this.clearUploadTimer()
    const task = this.uploadTask
    this.uploadTask = null
    if (task && task.abort) {
      try { task.abort() } catch (error) { /* 已结束时忽略 */ }
    }
    this.setData({ parsing: false, uploading: false, progress: 0, stageText: '' })
    wx.showToast({ title: '已取消上传', icon: 'none' })
  },

  onLoad(options) {
    // 从题库某个分类点进来时，导入页把归档位置预设成同一个分类
    const archive = options && options.archive
    this.archive = archive === 'real' || archive === 'custom' ? archive : ''
  },

  onUnload() {
    this.abandoned = true
    this.uploadAborted = true
    this.ocrAborted = true
    this.clearUploadTimer()
    this.cleanupOcrFiles()
    const task = this.uploadTask
    this.uploadTask = null
    if (task && task.abort) {
      try { task.abort() } catch (error) { /* 已结束时忽略 */ }
    }
    // 正在解析时不能删云端文件，等回调里再清理，否则解析会失败
    if (!this.data.parsing) this.cleanupUploaded()
  },

  runParse(fileID, file, retry) {
    this.setData({ stageText: retry ? '再试一次提取…' : '正在提取文字…' })
    wx.cloud.callFunction({
      name: 'parseDocument',
      data: { fileID, name: file.name },
      success: (res) => {
        // 用户已经离开页面：结果没有人接收，顺手把云端副本删掉
        if (this.abandoned) {
          this.cleanupUploaded()
          return
        }
        const result = res.result || {}
        if (result.code !== 0 || !result.data) {
          const code = Number(result.code) || 0
          this.failParse({
            code: `E${code || '?'}`,
            message: result.message || '文档解析没有完成，请重试',
            // 4xx 是文件本身的问题，重试没有意义；5xx 允许再试一次
            retryable: !code || code >= 500
          })
          return
        }
        const data = result.data
        // 扫描件：云端只负责拆页存图，识别由小程序逐页触发，
        // 这样每页一次请求，不会因为整卷页数多而撞上 60 秒超时
        if (data.scanned && Array.isArray(data.pages) && data.pages.length) {
          this.runOcrPages(data, file)
          return
        }
        this.finishParse(data, file)
      },
      fail: (error) => {
        if (this.abandoned) {
          this.cleanupUploaded()
          return
        }
        console.error('parseDocument 调用失败', error)
        const detail = String((error && (error.errMsg || error.message)) || '未知错误')
        const timeout = /timeout|timed out|超时|-504003/i.test(detail)
        // 第一次超时先自动重试一次（命中热实例往往能过）
        if (!retry && timeout) {
          this.startParse(1)
          return
        }
        if (timeout) {
          this.failParse({
            code: 'ETIMEOUT',
            message: '这份文件在云端解析超时了。请到云开发控制台把 parseDocument 的内存调到 512MB、超时调到 60 秒后重试；文件特别大时，可以在电脑上只导出正文所在的几页再上传。',
            retryable: true
          })
          return
        }
        // 云函数内存超限（-505004）：真题扫描件常内嵌几十 MB 的页面图与字体，
        // 重试不会有任何变化，直接把可操作的出路给用户
        if (/505004|memory exceeded/i.test(detail)) {
          this.failParse({
            code: 'EMEMORY',
            message: '这份 PDF 内嵌的图片太大，云端内存装不下，解析被中断了。可以先在电脑上压缩 PDF、或换成文字版 PDF 再上传；也可以直接把原文粘贴进来。',
            retryable: false
          })
          return
        }
        this.failParse({
          code: 'ENET',
          message: `解析服务没有响应：${detail.slice(0, 120)}`,
          retryable: true
        })
      }
    })
  },

  // 扫描件逐页识别：一次只认一页，单次十几秒，页数再多也不会超时
  async runOcrPages(data, file) {
    const pages = data.pages || []
    const texts = new Array(pages.length).fill('')
    this.ocrFiles = pages.map((page) => page.fileID)
    this.ocrAborted = false
    this.setData({
      ocrRunning: true,
      progress: 0,
      stageText: `正在识别扫描页 1/${pages.length}…`
    })

    let cursor = 0
    let done = 0
    let lastError = null
    const worker = async () => {
      while (cursor < pages.length) {
        if (this.ocrAborted || this.abandoned) return
        const index = cursor
        cursor += 1
        let text = ''
        // 每页最多试两次：网络抖动重试有意义，4xx（图太大/没文字）就直接放弃这一页
        for (let attempt = 0; attempt < 2; attempt += 1) {
          if (this.ocrAborted || this.abandoned) return
          try {
            const result = await callParse({ action: 'ocrPage', fileID: pages[index].fileID })
            if (result.code === 0) {
              text = (result.data && result.data.text) || ''
              break
            }
            lastError = result
            if (result.code >= 400 && result.code < 500) break
          } catch (error) {
            lastError = error
          }
        }
        texts[index] = text
        done += 1
        if (this.ocrAborted || this.abandoned) return
        this.setData({
          progress: Math.round((done / pages.length) * 100),
          stageText: done < pages.length
            ? `正在识别扫描页 ${done + 1}/${pages.length}…`
            : '正在整理文章…'
        })
      }
    }
    // 两页并行：既缩短等待，又不至于让单次调用的并发太高
    await Promise.all([worker(), worker()])
    if (this.ocrAborted || this.abandoned) return

    const filled = texts.filter((item) => String(item || '').trim())
    if (!filled.length) {
      this.cleanupOcrFiles()
      this.failParse({
        code: 'EOCR',
        message: (lastError && (lastError.message || lastError.errMsg)) || '扫描页没有识别出文字，请换一份文字版 PDF，或直接把原文粘贴进来',
        retryable: true
      })
      return
    }
    this.setData({ stageText: '正在整理文章…' })
    try {
      const result = await callParse({
        action: 'assemble',
        texts,
        kind: data.kind,
        fileName: data.fileName || file.name,
        // 扫描阶段的提示（拆页、跳过前 3 页）带过去，校对页要能看到
        warnings: data.warnings || []
      })
      if (result.code !== 0 || !result.data) {
        this.cleanupOcrFiles()
        this.failParse({
          code: `E${Number(result.code) || '?'}`,
          message: result.message || '识别结果整理失败，请重试',
          retryable: true
        })
        return
      }
      this.finishParse(result.data, file)
    } catch (error) {
      this.cleanupOcrFiles()
      this.failParse({
        code: 'ENET',
        message: '整理文章时网络中断了，请重试',
        retryable: true
      })
    }
  },

  cancelOcr() {
    if (!this.data.ocrRunning) return
    this.ocrAborted = true
    this.cleanupOcrFiles()
    this.setData({ parsing: false, ocrRunning: false, progress: 0, stageText: '' })
    wx.showToast({ title: '已取消识别', icon: 'none' })
  },

  cancelParse() {
    if (this.data.uploading) {
      this.cancelUpload()
      return
    }
    this.cancelOcr()
  },

  // 识别用的页面图是临时文件，解析完或取消后立刻清理
  cleanupOcrFiles() {
    const files = this.ocrFiles
    this.ocrFiles = null
    if (!files || !files.length) return
    wx.cloud.deleteFile({ fileList: files, fail: () => {} })
  },

  finishParse(data, file) {
    wx.setStorageSync('docDraft', {
      text: data.text,
      // 真题整卷会被拆成仔细阅读的多篇正文，逐篇导入
      passages: data.passages || [],
      fileName: data.fileName || (file && file.name),
      kind: data.kind,
      paragraphs: data.paragraphs || 0,
      warnings: data.warnings || [],
      at: Date.now()
    })
    this.cleanupOcrFiles()
    this.cleanupUploaded()
    this.setData({ parsing: false, uploading: false, ocrRunning: false, stageText: '' })
    wx.navigateTo({ url: `/pages/proofread/index?mode=doc${this.archive ? `&archive=${this.archive}` : ''}` })
  },

  // 原文已存进数据库，云存储里的文档不必长期保留
  cleanupUploaded() {
    const uploaded = this.uploaded
    if (!uploaded) return
    this.uploaded = null
    wx.cloud.deleteFile({ fileList: [uploaded.fileID], fail: () => {} })
  },

  failParse(info) {
    this.setData({
      parsing: false,
      uploading: false,
      ocrRunning: false,
      stageText: '',
      lastError: info.message
    })
    const retryable = info.retryable !== false
    wx.showModal({
      title: '没能提取到原文',
      content: `${info.message}${info.code ? `（${info.code}）` : ''}`,
      confirmText: retryable ? '再试一次' : '粘贴原文',
      cancelText: retryable ? '粘贴原文' : '换个文件',
      success: (res) => {
        if (retryable) {
          if (res.confirm) {
            this.startParse(1)
            return
          }
          if (res.cancel) this.goManual()
          return
        }
        if (res.confirm) this.goManual()
      }
    })
  },

  goManual() {
    wx.navigateTo({ url: `/pages/proofread/index?mode=manual${this.archive ? `&archive=${this.archive}` : ''}` })
  },

  goBank() {
    wx.navigateTo({ url: '/pages/library/index' })
  }
})
