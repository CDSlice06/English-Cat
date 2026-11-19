# 英语精读喵（English Reading Coach）

四六级英语精读微信小程序：把一篇文章拆成「词汇 → 词组 → 语法 → 输出练习」四站带学，走完四站产出学习报告。

- **形态**：微信小程序（原生语法，无框架、无第三方 UI 库）+ 微信云开发（云函数 / 云数据库 / 云存储）
- **硬约束**：**零第三方 SDK**（云函数侧仅 `wx-server-sdk`）；大模型调用只用 Node 原生 `https`；模型返回强制 JSON 格式；非英文输入直接拦截、不触发模型
- **模型**：DeepSeek 文本模型 `deepseek-chat`；扫描件视觉识别走 `deepseek-flash`（均可用环境变量覆盖，见 [部署文档](docs/deployment.md)）
- **小程序名称**：英语精读喵（`project.config.json` 内 projectname 为 `english-miao`）

## 目录结构

```
English/
├── miniprogram/                 # 小程序前端（唯一被打包的前端目录）
│   ├── pages/                   # 17 个页面，每页 js / json / wxml / wxss 四件套
│   ├── components/              # 8 个通用组件
│   ├── services/                # 前端服务层：所有云函数调用的唯一出入口
│   ├── utils/                   # 通用工具：单词发音、统一错误文案
│   ├── content/                 # 内置原创题库与用法要点（离线资源，不发网络请求）
│   ├── assets/                  # 运行期素材：橘猫 IP、分享封面、tabBar 图标、音效
│   ├── custom-tab-bar/          # 自定义手绘风 tabBar
│   └── app.js / app.json / app.wxss
├── cloud/                       # 云函数，每个函数独立目录、独立部署
├── docs/                        # 部署与排查文档（不参与打包）
├── english-miao-prd/            # 产品原型（HTML，浏览器直接打开）
├── english-miao-ui-design/      # UI 设计原型（引用根目录 assets/ip 素材）
├── assets/                      # 设计原型专用素材（不参与打包，勿删）
├── .trae/documents/             # 阶段性设计文档
└── project.config.json          # miniprogramRoot=miniprogram/，cloudfunctionRoot=cloud/
```

> `project.config.json` 只把 `miniprogram/` 和 `cloud/` 交给开发者工具；根目录的 `docs/`、两个原型目录、根 `assets/` 都不会进入小程序包，也不需要上传到云端。

## 学习动线

```
导入文章（Word / PDF / 粘贴原文）
   ↓
第 1 站 词汇 ──► 第 2 站 词组 ──► 第 3 站 语法 ──► 第 4 站 输出练习 ──► 学习报告
```

- **通关口径**：四站各占 25%。词汇站要求**本篇抽出的全部单词**都标记掌握；词组全点开、语法点全展开、练习全通过；某一站内容为空（如文章没有固定搭配）时该站直接判通过，不会卡住流程。
- **换文章限制**：当前文章进度 > 35% 且未完成时禁止切换（进度按 25% 递增，实际在 50% 起锁定）。
- **导入只是入库**：导入不消耗模型额度，AI 精讲在用户主动打开文章时触发；同一篇正文（按 openid + 正文哈希）重复导入会复用已有解析结果。

## 核心模块

### 页面（miniprogram/pages）

| 页面 | 职责 |
| --- | --- |
| `index` | 首页：继续学习主行动、四站进度、打招呼橘猫点击互动、分享入口 |
| `workbench` | 学习工作台：四站入口、AI 精讲状态轮询、断点续接「继续上次」 |
| `vocabulary` | 词汇：全量词卡、词频星级、左滑「掌握 / 收藏」、发音、分类筛选 |
| `phrases` | 词组与固定搭配：成对关联连词、一键收进词组本 |
| `analysis` | 语法与句式：分步拆解 + 逐块对译、收藏到语法本、进入练习 |
| `practice` | 输出练习：英译汉 / 汉译英打字判题、正确用法提示、题目跳转 |
| `summary` | 学习报告：错误类型统计、全文对照、手账卡片保存与分享 |
| `import` / `proofread` / `preview` | 上传 Word/PDF 或粘贴原文 → 校对元数据 → 批量解析入库 |
| `library` | 题库：内置模拟篇 / 我的真题（按年份分组）/ 其它篇目 |
| `onboarding` | 首次进入：选级别并开一篇内置文章 |
| `wordbook` / `phrasebook` / `grammarbook` | 三个互相隔离的收藏本 |
| `review` | 今日复习：只复习「不记得」的词，仅「记得」才改状态 |
| `profile` | 我的：三个收藏入口汇总、累计统计、重置进度 |

### 前端服务层（miniprogram/services）

| 模块 | 职责 |
| --- | --- |
| `study.js` | 学习数据总入口：文章、单元进度、题库、内置文章开课、断点续接、本地快照 |
| `wordbook.js` | 生词本 / 词组本：收录、掌握状态、联想、词频补查、快照 |
| `grammarbook.js` | 语法与句式本：收藏、移除、列表缓存 |
| `article.js` | 把内置题库文章一键导入并解析为当前学习文章 |

### 通用组件（miniprogram/components）

`cat-image`（橘猫 IP，name + size 两个属性）、`primary-button`、`section-title`、`progress-bar`、`meaning-list`、`next-station`（学习路径引导）、`speak-btn`（单词发音）、`article-drawer`（原文抽屉）。

### 云函数（cloud）

| 云函数 | 职责 | 建议超时 |
| --- | --- | --- |
| `study` | 文章与单元进度、题库、导入、换文章门槛、掌握篇数统计 | 60s |
| `analyzeArticle` | 规则抽取 + 词频 + 词典 + 共享精讲缓存（词汇/词组/语法/练习） | 60s |
| `llm` | 唯一的模型出口：任务白名单（grammar/words/phrases/judge/article）、强制 JSON | 50s |
| `parseDocument` | PDF / Word 文本抽取（含整卷真题拆篇、扫描件识别通道） | 60s |
| `wordbook` | 生词本 / 词组本数据操作与查询 | 20s |
| `grammarbook` | 语法与句式本数据操作 | 20s |
| `evaluateTranslation` | 翻译判题：结构比对 + 语法校验 + 幂等复用 | 25s |
| `checkin` | 每日打卡记录云端备份：本地快照 + 云端按日合并 | 10s |

数据库集合共 10 个，清单与字段见 `cloud/database.json`（该文件是集合的唯一事实来源，新增集合要同步登记）。

## 快速开始

1. **导入项目**：微信开发者工具 → 导入 → 选择本目录 → 填入小程序 AppID（`project.config.json` 已声明 `miniprogramRoot` / `cloudfunctionRoot`，不需要手工改）。
2. **开通云开发**：确认云环境 ID 与 `miniprogram/app.js` 中 `wx.cloud.init({ env })` 一致。
3. **部署云函数**：`cloud/` 下每个函数右键「上传并部署：云端安装依赖」，并配置环境变量 `DEEPSEEK_API_KEY`。

完整步骤、环境变量、合法域名与发布流程见 [部署与发布](docs/deployment.md)；线上问题排查见 [常见问题排查](docs/troubleshooting.md)。

## 文档索引

| 文档 | 内容 |
| --- | --- |
| [docs/deployment.md](docs/deployment.md) | 本地启动、云函数部署、环境变量、数据库权限、合法域名、上传发布 |
| [docs/conventions.md](docs/conventions.md) | 命名、注释、模块结构、UI 与素材、云函数、依赖与提交前自查 |
| [docs/troubleshooting.md](docs/troubleshooting.md) | 解析失败、词频缺失、发音无声、进度口径、模型调用等高频问题 |
| [.trae/documents/](.trae/documents/) | 阶段性设计文档（学习本设计、迁移计划、UI 规范） |
| [english-miao-prd/english-miao-prd.html](english-miao-prd/english-miao-prd.html) | 产品需求原型（浏览器打开） |
| [english-miao-ui-design/english-miao-ui-design.html](english-miao-ui-design/english-miao-ui-design.html) | UI 设计原型（依赖根目录 `assets/ip`） |
