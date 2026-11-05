# 本地启动与部署

本文覆盖：本地起项目、云函数部署、环境变量、数据库与存储、合法域名、上传发布。

## 一、环境要求

| 项 | 要求 |
| --- | --- |
| 微信开发者工具 | 稳定版，支持云开发 |
| 小程序 AppID | 与 `project.config.json` 中一致（`wxac4479984021870d`） |
| 云开发环境 | 已开通，环境 ID 与 `miniprogram/app.js` 中 `wx.cloud.init({ env })` 一致（当前为 `cloud1-d6gaxobvw48339447`） |
| Node.js | 仅本地脚本自查用（`node --check` 语法校验），小程序运行不依赖本地 Node |

## 二、本地启动

1. 微信开发者工具 → **导入项目** → 目录选择本仓库根目录。
   - `miniprogramRoot` 与 `cloudfunctionRoot` 已在 `project.config.json` 声明，无需手动填写。
2. 工具栏「云开发」→ 确认已关联上表的环境；换环境时同时改 `miniprogram/app.js` 的 `env`。
3. 编译预览。首次进入会走 `pages/onboarding`，选级别后从内置题库开一篇原创模拟文章。
4. 本地调试阶段可勾选「不校验合法域名、web-view、TLS 及 HTTPS 证书」，**提审前必须取消**（见第六节）。

## 三、云函数部署

`cloud/` 下 7 个函数，每个都是独立目录、独立部署，**互不共享代码**（跨函数复用只能靠复制，这是云开发平台的限制，不是重复代码问题）。

| 云函数 | 部署要求 |
| --- | --- |
| `study` | 无特殊权限 |
| `analyzeArticle` | 词典文件（`cet.json` / `common.json` / `extra.json` / `senses.json`）随函数目录一起上传，**必须右键整个函数目录上传**，只上传前端代码不会更新词库 |
| `llm` | 需要环境变量 `DEEPSEEK_API_KEY` |
| `parseDocument` | 需要环境变量 `DEEPSEEK_API_KEY`（扫描件走视觉识别）；`config.json` 已声明 `ocr.printedText` 权限 |
| `wordbook` / `grammarbook` | 无特殊权限 |
| `evaluateTranslation` | 可选环境变量 `EVAL_LOG=off` 关闭判题日志 |

部署方式：在开发者工具中右键函数目录 → **上传并部署：云端安装依赖**。

**部署后必须到云开发控制台核对超时时间**（`config.json` 里的 `timeout` 只是声明，历史上有过未同步的情况）：

```
study 60s · analyzeArticle 60s · llm 50s · parseDocument 60s
wordbook 20s · grammarbook 20s · evaluateTranslation 25s
```

导入 PDF/Word 报 `-504003 timed out after 3 seconds` 就是超时仍为默认 3 秒的典型症状。

## 四、环境变量（云开发控制台 → 云函数 → 配置）

| 变量 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `DEEPSEEK_API_KEY` | ✅ | — | 模型密钥，`llm` 与 `parseDocument` 都要配；缺失时解析会明确报「大模型未配置」 |
| `DEEPSEEK_MODEL` | ❌ | `deepseek-chat` | 文本任务模型 |
| `DEEPSEEK_BASE_URL` | ❌ | `https://api.deepseek.com` | 接口地址 |
| `DEEPSEEK_VISION_MODEL` | ❌ | `deepseek-flash` | 扫描件识别模型，需支持图片输入 |
| `TENCENT_SECRET_ID` / `TENCENT_SECRET_KEY` | ❌ | — | 配置后扫描件优先走腾讯云 OCR；两者同时存在才生效 |
| `TENCENT_OCR_REGION` | ❌ | `ap-guangzhou` | OCR 地域 |
| `EVAL_LOG` | ❌ | 开启 | 设为 `off` 关闭 `evaluateTranslation` 的语法校验日志 |

> 腾讯云 OCR 请关闭后付费，避免超出免费额度自动扣费；未配置时不走 OCR 通道，扫描件自动降级到 DeepSeek 视觉识别，再失败则提示用户上传文字版或粘贴原文。

## 五、数据库与云存储

集合清单与字段以 `cloud/database.json` 为准（共 9 个）：`articles`、`article_units`、`attempts`、`wordbooks`、`grammarbooks`、`known_words`、`word_cache`、`grammar_cache`、`article_cache`。

- 9 个集合的读写权限均为 `false`：**只允许云函数访问**，前端不直连数据库。控制台里的实际权限要与该声明保持一致，避免平台默认权限导致数据被越权读取。
- 新增集合时同步更新 `cloud/database.json`，否则后续接手的人会漏配权限。
- 云存储用于暂存用户上传的 PDF/Word 原文件；解析完成后由前端清理，避免残留孤儿文件。
- 用户在文章里看到的正文与学习记录只属于本人（按 `openid` 隔离），不会跨账号共享；共享的只有「同一篇正文的精讲缓存」。

## 六、合法域名

开发者工具 → 开发管理 → 开发设置 → 服务器域名：

| 类型 | 域名 | 用途 |
| --- | --- | --- |
| downloadFile 合法域名 | `https://dict.youdao.com` | 单词发音音频 |

不加这条，线上（真机）发音会静默失败，只有开发者工具勾了「不校验合法域名」时才听得到声音——**提审前取消勾选并真机实测一次发音**。

云开发控制台的「API 安全配置」和「普通链接二维码跳转」当前项目都不需要开启。

## 七、上传与发布

1. 开发者工具右上角「上传」，版本号按语义化递增（当前基线 `1.1.0`；修 bug 升补丁位，新增功能升次版本位）。
2. 上传备注建议写清本次改动范围，例如：
   `新增今日复习与断点续接；首页/工作台/生词本快照优先渲染；词汇页左滑快捷掌握/收藏、词频星级；报告页支持存手账卡片并分享`
3. 公众平台 → 版本管理 → 设为「体验版」先自测（体验成员最多 15 人，体验版无需备案即可访问，正式发布才需要备案）。
4. 提交审核时备注示例：
   ```
   英语精读小程序。首页即功能入口，内置示例文章可完整体验：
   选级别 → 打开示例文章 → 词汇/词组/语法/输出练习 → 学习报告。
   支持用户导入自己的 Word/PDF 英文文章；保存手账卡片需相册权限。
   小程序不提供 AI 对话能力，仅做英文文章的语法与词汇解析。
   ```
5. 隐私保护指引里要与代码实际能力对齐，勾选：**保存到相册**（报告页存卡片）、**选择文件**（上传 Word/PDF）。
6. 服务类目建议「工具 → 效率」；名称「英语精读喵」。

## 八、依赖与版本

- 前端零第三方依赖；云函数唯一依赖是 `wx-server-sdk`，7 个函数统一**精确锁定** `2.6.3`（不写 `^` / `~`），也没有 `package-lock.json` —— 云函数部署时平台只按 `package.json` 安装，lockfile 不参与，所以锁定只能靠精确版本号。
- `2.6.3` 是长期稳定的老版本（2021 年发布），npm 上最新为 `4.0.2`。**不要在临近发版时直接升**：官方更新日志里 `2.7.0` 属于破坏性更新（改内置 BigInt，影响 JSON 序列化行为）、`4.0.1` 又换过底层 `@cloudbase/node-sdk` 主版本，而云函数无法在本地跑回归。
- 需要升级时的安全路径：挑一个影响面最小的函数（如 `wordbook`）改版本 → 单独部署 → 覆盖测「收藏 / 解析 / 判题 / 发音」四条链路 → 确认无异常再推进到 `study`、`analyzeArticle`、`llm`、`parseDocument`。
- `parseDocument` 用到了云调用（`ocr.printedText`），该能力要求 `wx-server-sdk >= 0.4.0`，当前版本满足；若后续接入更多云调用接口，同样按上面的路径先验证再升。
