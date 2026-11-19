// 分段控件左右滑动：按住拖动时选中态跟着手指走，松手才生效；点击照旧可用。
// 拖动过一次后 300ms 内屏蔽 tap，避免 touchend 之后紧跟的 tap 把结果又改回去。
// 用法（页面里）：
//   const segSwipe = require('../../utils/segSwipe')
//   segStart(e) { segSwipe.start(this, e, '.plan-seg', 4, 0) }
//   segMove(e) { segSwipe.move(this, e, (index) => this.setData({ segDrag: index })) }
//   segEnd(e) { segSwipe.end(this, e, (index) => { ... }) }
//   segCancel() { segSwipe.cancel(this) }
//   tap 处理里先 if (segSwipe.isTapBlocked(this)) return
const states = new WeakMap()

function stateOf(page) {
  let state = states.get(page)
  if (!state) {
    state = { rect: null, count: 2, index: 0, preview: -1, startX: 0, startY: 0, moving: false, blockedAt: 0 }
    states.set(page, state)
  }
  return state
}

function indexAt(rect, x, count) {
  const width = rect.width || 1
  const cell = width / (count || 1)
  const offset = Math.min(Math.max(x - rect.left, 0), width - 0.01)
  return Math.min(count - 1, Math.max(0, Math.floor(offset / cell)))
}

// selector 是分段控件容器的选择器，用来量宽度；index 是当前选中的档位
function start(page, event, selector, count, index) {
  const state = stateOf(page)
  const touch = (event.touches && event.touches[0]) || null
  state.count = count || 2
  state.index = typeof index === 'number' && index >= 0 ? index : 0
  state.startX = touch ? touch.clientX : 0
  state.startY = touch ? touch.clientY : 0
  state.moving = false
  state.preview = -1
  state.rect = null
  if (!selector || !wx.createSelectorQuery) return
  wx.createSelectorQuery()
    .select(selector)
    .boundingClientRect((rect) => {
      state.rect = rect || null
    })
    .exec()
}

function move(page, event, onPreview) {
  const state = states.get(page)
  const touch = (event.touches && event.touches[0]) || null
  if (!state || !touch) return
  if (!state.moving) {
    const dx = touch.clientX - state.startX
    const dy = touch.clientY - state.startY
    // 横向位移要明显大于纵向，避免和页面上下滚动抢手势
    if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return
    state.moving = true
  }
  if (!state.rect) return
  const index = indexAt(state.rect, touch.clientX, state.count)
  if (index === state.preview) return
  const first = state.preview < 0
  state.preview = index
  // 跨档时轻震一下，滑动手感更实
  if (!first && wx.vibrateShort) wx.vibrateShort({ type: 'light' })
  if (typeof onPreview === 'function') onPreview(index)
}

function end(page, event, onChange) {
  const state = states.get(page)
  if (!state) return
  if (!state.moving) {
    state.rect = null
    return
  }
  state.moving = false
  state.blockedAt = Date.now()
  const touch = (event.changedTouches && event.changedTouches[0]) || null
  let next = state.index
  if (touch && state.rect) next = state.preview >= 0 ? state.preview : indexAt(state.rect, touch.clientX, state.count)
  else if (touch) {
    // 没量到宽度时退回按方向推一档
    const dx = touch.clientX - state.startX
    if (dx > 24) next = Math.max(0, state.index - 1)
    else if (dx < -24) next = Math.min(state.count - 1, state.index + 1)
  }
  state.preview = -1
  state.rect = null
  if (next !== state.index && typeof onChange === 'function') onChange(next)
}

function cancel(page) {
  const state = states.get(page)
  if (!state) return
  state.moving = false
  state.preview = -1
  state.rect = null
}

function isTapBlocked(page) {
  const state = states.get(page)
  return !!state && Date.now() - state.blockedAt < 300
}

module.exports = { start, move, end, cancel, isTapBlocked }
