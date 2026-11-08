// 交互音效：点击 / 答对 / 答错各用一个独立音频实例，互不打断，也不会因连点叠音
const TAP_SOUND = '/assets/audio/tap.wav'
const CORRECT_SOUND = '/assets/audio/correct.wav'
const WRONG_SOUND = '/assets/audio/wrong.mp3'

function createPlayer(src) {
  let audio = null
  return function play() {
    if (!audio) {
      audio = wx.createInnerAudioContext()
      // 跟随系统静音键，上课/开会时不会突然出声
      audio.obeyMuteSwitch = true
      audio.onError(() => {})
    }
    audio.stop()
    audio.src = src
    audio.play()
  }
}

const playTapSound = createPlayer(TAP_SOUND)
const playCorrectSound = createPlayer(CORRECT_SOUND)
const playWrongSound = createPlayer(WRONG_SOUND)

module.exports = { playTapSound, playCorrectSound, playWrongSound }
