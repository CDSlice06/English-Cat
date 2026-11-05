# 编码与协作约定

本文件是长期迭代的底线约定。改代码前先扫一遍，新增代码按此执行，避免风格与口径再次发散。

## 一、命名

| 对象 | 约定 | 示例 |
| --- | --- | --- |
| 目录 / 文件 | kebab-case（云函数目录与其函数名一致） | `cat-image`、`usage-notes`、`analyzeArticle` |
| 变量 / 函数 / Page 方法 | 小驼峰 | `applyStudy`、`masteredWords`、`saveResume` |
| 常量 | 全大写下划线 | `SNAPSHOT_KEY`、`EXTRACT_VERSION`、`POS_ALIAS` |
| 状态字段 | 语义完整、可读 | `aiBusy`、`resumeFlag`、`isDemo`、`wordsPending` |

- 不用下划线前缀表示「私有」；只有模块内部使用就不导出。
- 布尔值不要用 `flag`、`status` 这类模糊名，写成 `xxxDone` / `xxxViewed` / `isXxx`。

## 二、模块结构

- 页面固定四件套 `index.js / index.json / index.wxml / index.wxss`；组件同构。
- `data` 只放渲染需要的数据；不进模板的中间状态挂 `this`（如 `this.expandedIds`、`this.freqMap`、`this.swipe`）。
- **所有数据请求必须经 `miniprogram/services/*`**，页面里不出现 `wx.cloud.callFunction`（服务层内部除外）。
- 页面接口的返回形状统一为「数组 / 对象」，不要在页面里再解一层云函数返回的 `{ code, message, data }`。
- 新增通用能力优先看 `utils/` 是否已有：`utils/speech.js`（发音）、`utils/error.js`（错误文案）。同一段逻辑出现第 3 次就必须抽取。

## 三、注释

- 注释用中文，写**为什么**，不写「给变量赋值」这类废话。
- 以下位置必须写注释：复杂的业务护栏（判题护栏、解析兼容、换文章门槛）、与云端口径强绑定的计算、任何绕过平台限制的写法。
- 模块顶部用一两句话说明该模块职责；长篇规则（词库、题库）写来源与版本。
- 禁止保留被注释掉的旧代码、`TODO` 占位、调试用 `console.log`（服务端的结构化 `logger` 与 `catch` 里的 `console.error` 属正常错误上报，保留）。

## 四、UI 与素材

- 字号只有四级：标题 `44rpx`、卡片标题 `32rpx`、正文 `25rpx`、注释 `22rpx`；字重只有 `700` / `400`。
- 圆角只有三档：卡片 `32rpx`、小件 `20rpx`、胶囊 `999rpx`；描边统一 `2rpx`；阴影统一「错位硬影 + 极淡柔影」。
- 英文标题、标签、数字统一衬线：`'Iowan Old Style', Georgia, 'Songti SC', serif`。
- 可点元素热区 ≥ `88rpx`（视觉尺寸保持不变，靠 padding 扩展）。
- 同一屏装饰元素不超过 2 处；加载态 / 空态 / 错误态统一用橘猫 IP（`sleepy-nap` / `not-found` / `complete-halo`），禁止原生 spinner 与系统口吻的空态文案。
- 素材只从 `miniprogram/assets/` 引用。根目录 `assets/` 是设计原型素材（被 `english-miao-ui-design` 引用），小程序代码不得引用，也不得删除。

## 五、云函数

- 统一返回 `{ code, message, data }`，`code === 0` 表示成功。
- 更新数据库时 `data` 不能是空对象，需清空字段用 `_.remove()`（否则触发 `-502001 multiple write errors`）。
- 模型调用只有 `llm` 一个出口：任务白名单（`grammar` / `words` / `phrases` / `judge` / `article`）、强制 JSON、非英文在入口拦截。
- 抽取规则、语法规则、练习题结构发生任何变化，必须同步升版本号（`EXTRACT_VERSION` / `drillVersion` / `extractVersion`），否则旧文章不会重解析、新旧数据会混用。
- 日志禁止打印用户正文：解析失败只记字符数，视觉识别失败只记模型名、响应体积与错误信息。
- 云端与前端存在同源逻辑（进度口径、词汇归一、词组校验）时，两侧改动必须同时进行，并在注释里互相点名。

## 六、依赖与构建

- 前端零第三方依赖；云函数仅 `wx-server-sdk`，版本**精确锁定**（当前 `2.6.3`），不写 `^` / `~`。
- 不引入任何构建步骤（无 npm script、无打包器、无转译），保证「打开工具即可运行」。
- 依赖升级要单独评估：云函数只能在真实环境验证，未做过回归不升级。

## 七、提交前自查

1. 语法：所有改动的 `.js` 通过 `node --check`。
2. 结构：`.json` 可解析、WXML 标签配对、`bind*` 事件处理函数存在。
3. 引用：新增 `require` 路径存在；`app.json` 页面四件套齐全；素材路径存在。
4. 口径：涉及进度/通关/统计的改动，前端 `services/study.js` 与云函数 `study` 两侧一致。
5. 部署影响：改了云函数就要说明「需要重新上传哪个函数」，不要只提示上传前端。
