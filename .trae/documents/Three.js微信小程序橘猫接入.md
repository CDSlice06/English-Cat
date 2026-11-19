# Context

现有微信原生小程序的宠物页使用 CSS 小猫，已经具备点击、喂食、玩耍、清洁、睡觉及云端成长结算。现在需要将已完成骨骼、眼睑形态键和 8 段动作的橘猫接入为实时 Three.js 3D 模型，同时保留现有交互和云逻辑。模型采用用户选择的云存储 / CDN 加载，原 CSS 小猫保留作加载与失败降级。

## 1. 渲染运行环境与依赖

- 使用微信原生 `<canvas type="webgl">` + `threejs-miniprogram`，不使用 `web-view`，避免页面与 H5 之间的通信桥接。
- 在 `miniprogram/` 内新建 `package.json`，锁定经蒙皮和 morph 验证的 `threejs-miniprogram` 版本；配置兼容版本的 `GLTFLoader`，在微信开发者工具执行“构建 npm”。
- 页面不直接依赖 Three.js，统一封装到 `pet-3d` 组件，便于后续升级适配层。
- 模型为单文件、内嵌贴图的 GLB，首版不引入 Draco，减少解码器适配变量。

## 2. 导出小程序专用 GLB

以 `橘猫_QQ宠物毛绒版/橘猫_基础动画集.blend` 为源，不覆盖原工程，生成 `橘猫_QQ宠物毛绒版/橘猫_小程序版.glb`：

- 保留 23 根骨骼、身体蒙皮、`CAT_Eyelids` 和 Blink morph；统一变换、Y-up、30fps。
- 将 8 个 NLA 动作导出为同名 glTF clips：`Idle_Drowsy_Loop`、`Blink`、`Look_Up`、`Look_Left`、`Look_Right`、`Pet_Click`、`Eat`、`Bath`。
- 将骨架 `Blink` 驱动按动作烘焙为眼睑 morph 曲线，避免 FBX/自定义属性驱动在 glTF 中失效。
- 食盆和浴盆以低模网格保留在 GLB，取消 Blender 驱动，运行时由组件根据 Eat/Bath 显隐，避免把道具错误带进其他动作。
- 程序粒子毛发不导出；使用原有橘纹贴图、高粗糙度短绒材质、柔和灯光还原观感。贴图最大 1024，压缩颜色贴图并检查模型总大小。
- 回导 GLB 并运行 glTF Validator，检查 8 clips、时长、Blink 0→1→0、Idle 首尾、骨骼权重、材质和坐标方向。

## 3. 组件与资源加载

新增：

- `miniprogram/components/pet-3d/index.js`
- `miniprogram/components/pet-3d/index.json`
- `miniprogram/components/pet-3d/index.wxml`
- `miniprogram/components/pet-3d/index.wxss`
- `miniprogram/components/pet-3d/animation.js`：动作映射、Mixer 和状态机。
- `miniprogram/components/pet-3d/loader.js`：Canvas/Three 初始化、GLB 请求和解析。
- `miniprogram/components/pet-3d/config.js`：HTTPS `MODEL_URL` 或云存储 `MODEL_FILE_ID` 配置。
- `miniprogram/package.json`：Three.js 小程序适配依赖。

加载流程：组件 `ready` 获取 Canvas 节点和实际尺寸；云文件 ID 先换取临时 URL，再以 `arraybuffer` 请求 GLB，通过 `GLTFLoader.parse` 解析；加载期间及超时、404、WebGL 初始化失败时通知页面继续显示 CSS 小猫，不阻断云端互动。

## 4. 最小改动现有宠物页

修改 `miniprogram/pages/pet/index.json` 注册 `pet-3d`。

修改 `miniprogram/pages/pet/index.wxml`：在 `.pet-wrap` 内加入 3D 组件，将原 `.cat` 作为 `webglReady === false` 时的降级；保留现有场景、按钮、爱心/泡泡特效、领取奖励和学习跳转。

修改 `miniprogram/pages/pet/index.js`：

- 复用 `act`、`touchPet`、`run`、`services/pet.js` 和云函数，不改成长结算。
- 映射 `touch→Pet_Click`、`feed→Eat`、`clean→Bath`、`play→Look_Left/Blink/Look_Right`、`sleep→Idle_Drowsy_Loop`。
- 3D 就绪时调用组件 `play(action)`；组件 `motionend` 与云请求都结束后清理 `acting/motion`。云失败立即回 Idle；CSS 降级仍使用原 `MOTION_MS`。
- 保留连点锁定，避免云请求和动画状态竞争。

修改 `miniprogram/pages/pet/index.wxss`：增加 Canvas 尺寸、层级和降级显示规则，原 CSS 猫样式继续供降级使用。

## 5. 动画状态机与画面性能

- `Idle_Drowsy_Loop` 默认 `LoopRepeat`，保持闭眼发呆、轻晃头和摆尾。
- 一次性动作使用 `LoopOnce`，主动作之间约 0.2 秒交叉淡入淡出，结束后回 Idle 并触发 `motionend`。
- Blink 只在睁眼状态或 play 动作串中播放，不与默认闭眼 Idle 的 morph 轨争写。
- Eat/Bath 开始时显示对应道具，结束并淡出后隐藏；其余动作始终隐藏道具。
- 按 Canvas 实际 CSS 尺寸渲染，DPR 默认上限 1.5，目标 30fps；持续低帧时降低 DPR/帧率，仍不稳定则回退 CSS。
- 使用 Hemisphere/Directional 灯光和廉价接地阴影，不启用实时阴影、后处理或粒子毛发。
- `pageLifetimes.hide/show` 暂停和恢复 RAF，恢复时截断 delta；`detached` 取消 RAF、停止 Mixer，并释放几何、材质、贴图和 renderer。

## 6. 验证与发布检查

1. Blender 回导及 glTF Validator 验证模型、8 clips、morph、道具和贴图。
2. 微信开发者工具构建 npm，开启硬件加速，检查 Canvas 尺寸、默认 Idle、8 动作、动作结束解锁和连点。
3. 配置合法 HTTPS 下载域名或云存储文件 ID，验证成功加载、慢网、404、超时和 CSS 降级。
4. 回归喂食/玩耍/清洁/睡觉云结算、每日奖励领取、学习跳转、页面后台恢复及反复进出。
5. 使用 iOS/Android 真机预览检查蒙皮、闭眼、透明度、帧率、发热、内存和黑屏；重点验证一台中低端 Android，必要时自动降低渲染档位。
