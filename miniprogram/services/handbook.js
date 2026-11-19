// 手账进度上云：一台设备改完，另一台打开时按「时间较新者胜」合并
function call(data) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'handbook',
      data,
      success(res) {
        const result = res.result || {}
        if (result.code === 0) resolve(result.data)
        else reject(new Error(result.message || '云同步失败'))
      },
      fail(err) { reject(new Error(err.errMsg || '无法连接云开发环境')) }
    })
  })
}

function load() {
  return call({ action: 'load' })
}

function save(progress) {
  return call({ action: 'save', progress })
}

function num(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function markOf(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

// 标记值正数=标记、负数=取消，只有绝对值更大的那次操作才算更新
function newerMark(mine, theirs) {
  const a = markOf(mine)
  const b = markOf(theirs)
  if (!b) return a
  if (!a) return b
  return Math.abs(b) > Math.abs(a) ? b : a
}

// 与云函数保持同一套规则：记录取较新，标记取时间戳绝对值大的（负数表示取消）
function merge(local, remote) {
  const base = local && typeof local === 'object' ? local : {}
  const other = remote && typeof remote === 'object' ? remote : {}
  const output = {
    plan: Object.assign({}, base.plan || {}),
    done: Object.assign({}, base.done || {}),
    starred: Object.assign({}, base.starred || {}),
    vocab: { known: Object.assign({}, (base.vocab && base.vocab.known) || {}) },
    quotes: { known: Object.assign({}, (base.quotes && base.quotes.known) || {}) },
    resetAt: Math.max(num(base.resetAt), num(other.resetAt))
  }

  const localPlanAt = num((base.plan || {}).planAt)
  const remotePlanAt = num((other.plan || {}).planAt)
  if (remotePlanAt > localPlanAt) output.plan = Object.assign({}, other.plan)

  const remoteDone = other.done || {}
  Object.keys(remoteDone).forEach((id) => {
    const mine = output.done[id]
    const theirs = remoteDone[id]
    if (!theirs || !num(theirs.at)) return
    if (!mine || num(theirs.at) > num(mine.at)) output.done[id] = Object.assign({}, theirs)
  })

  ;[['vocab', 'known'], ['quotes', 'known'], ['starred', null]].forEach(([group, field]) => {
    const theirs = field ? (other[group] || {})[field] : other[group]
    const mine = field ? output[group][field] : output[group]
    if (!theirs || typeof theirs !== 'object') return
    Object.keys(theirs).forEach((key) => {
      mine[key] = newerMark(mine[key], theirs[key])
    })
  })

  // 重置时间之后的内容才算有效，重置前的记录不参与合并
  const resetAt = output.resetAt
  if (resetAt) {
    Object.keys(output.done).forEach((id) => {
      if (num(output.done[id].at) <= resetAt) delete output.done[id]
    })
    ;[['vocab', 'known'], ['quotes', 'known'], ['starred', null]].forEach(([group, field]) => {
      const map = field ? output[group][field] : output[group]
      Object.keys(map).forEach((key) => {
        if (!markOf(map[key]) || Math.abs(markOf(map[key])) <= resetAt) delete map[key]
      })
    })
  }

  return output
}

module.exports = { load, save, merge }
