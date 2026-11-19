// 单词朗读：全局复用一个音频实例，避免每个按钮各建一个
const AUDIO_BASE = 'https://dict.youdao.com/dictvoice'

let audio = null
let handlers = {}

function getAudio() {
  if (audio) return audio
  audio = wx.createInnerAudioContext()
  audio.onPlay(() => {
    if (handlers.onStart) handlers.onStart()
  })
  audio.onEnded(() => {
    const done = handlers.onEnd
    handlers = {}
    if (done) done()
  })
  audio.onError(() => {
    const fail = handlers.onError
    handlers = {}
    if (fail) fail()
  })
  return audio
}

// type=1 英音，type=2 美音；学习场景统一用美音
function play(src, options) {
  const player = getAudio()
  // 切换到新单词时，上一条的 onEnd 不会再触发，先手动收尾，
  // 否则前一个朗读按钮会一直停在「播放中」
  const previous = handlers
  handlers = options || {}
  if (previous && previous.onEnd) previous.onEnd()
  player.stop()
  player.src = src
  player.play()
}

function speakWord(word, options) {
  const text = String(word || '').trim()
  if (!text) return
  play(`${AUDIO_BASE}?audio=${encodeURIComponent(text)}&type=2`, options)
}

function stopSpeech() {
  if (audio) audio.stop()
  handlers = {}
}

module.exports = { speakWord, stopSpeech }
