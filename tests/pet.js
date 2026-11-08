// 电子宠物云函数回归：领养、互动、冷却、每日任务、领奖、离线衰减
// 用法：node tests/pet.js
const path = require('path')
const Module = require('module')
const stub = require('./support/wx-server-sdk')

const ROOT = path.join(__dirname, '..')
const originalLoad = Module._load
Module._load = function (request) {
  if (request === 'wx-server-sdk') return stub
  return originalLoad.apply(this, arguments)
}

const pet = require(path.join(ROOT, 'cloud/pet/index.js'))

let failed = 0
function check(name, ok, extra) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : ' → ' + JSON.stringify(extra)}`)
  if (!ok) failed += 1
}

async function main() {
  stub.__reset()

  const first = await pet.main({ action: 'getPet' })
  check('首次进入自动领养', first.code === 0 && first.data && first.data.name === '团子', first)
  check('四项数值齐全', first.data.stats.length === 4 && first.data.stats.every((item) => item.value === 80), first.data.stats)
  check('初始阶段是奶猫', first.data.stage.name === '奶猫', first.data.stage)
  check('今日任务未完成', first.data.daily.done === false && first.data.daily.canClaim === false)

  const fed = await pet.main({ action: 'interact', act: 'feed' })
  check('喂食成功', fed.code === 0 && fed.data.stats.find((item) => item.key === 'food').value >= 80, fed)
  check('喂食加成长值', fed.data.stage.exp === 8, fed.data.stage)
  check('喂食计入任务', fed.data.daily.quests.find((item) => item.key === 'feed').done === true)

  const again = await pet.main({ action: 'interact', act: 'feed' })
  check('喂食冷却生效', again.code === 429, again)

  const played = await pet.main({ action: 'interact', act: 'play' })
  check('玩耍成功', played.code === 0 && played.data.stage.exp === 20, played)
  const cleaned = await pet.main({ action: 'interact', act: 'clean' })
  check('清洁成功', cleaned.code === 0 && cleaned.data.daily.done === true, cleaned)
  check('三项完成后可领奖', cleaned.data.daily.canClaim === true)

  const claimed = await pet.main({ action: 'claimQuest' })
  check('领取奖励成功', claimed.code === 0 && claimed.data.daily.claimed === true, claimed)
  // 喂食 8 + 玩耍 12 + 清洁 8 + 奖励 40
  check('奖励加 40 成长值', claimed.data.stage.exp === 68, claimed.data.stage)
  const claimAgain = await pet.main({ action: 'claimQuest' })
  check('重复领取被拒绝', claimAgain.code === 409, claimAgain)

  const bad = await pet.main({ action: 'interact', act: 'fly' })
  check('未知动作返回 400', bad.code === 400, bad)

  // 模拟离线 10 小时：只改 lastTick 和数值，getPet 应懒结算衰减
  const saved = stub.__state.pets[0]
  saved.lastTick = Date.now() - 10 * 3600 * 1000
  saved.stats = { food: 80, mood: 80, clean: 80, energy: 80 }
  const offline = await pet.main({ action: 'getPet' })
  const food = offline.data.stats.find((item) => item.key === 'food').value
  check('离线衰减生效（10 小时饱食约 56）', food >= 54 && food <= 58, food)
  check('离线时长提示', offline.data.awayHours === 10, offline.data.awayHours)

  console.log(failed ? `\n❌ ${failed} 项失败` : '\n✅ 宠物 MVP 全部通过')
  process.exit(failed ? 1 : 0)
}

main().catch((error) => {
  console.error('\n脚本异常：', error && (error.stack || error.message || error))
  process.exit(1)
})
