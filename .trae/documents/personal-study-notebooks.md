# 我的三类学习笔记本

## Context

“我的”目前只有“我的生词本”。词组虽然能从文章加入生词本，但与单词混存且丢失用法和原句；语法只有“已看”进度，没有个人收藏。此次要补齐“我的生词本、我的词组本、我的语法与句式本”三个真实可用的跨文章笔记本，同时保持现有学习顺序、进度和橘猫手帐 UI 不变。

## 实施方案

### 1. 词组复用现有词库，按类型独立展示

修改 `cloud/wordbook/index.js` 与 `miniprogram/services/wordbook.js`：

- 为词条增加 `entryType: word | phrase`，普通单词保持原有 `items/counts` 返回结构，新增 `phraseItems/phraseCounts` 给词组本使用。
- 新词组保存 `matched/note/sentence/articleId/articleTitle`，继续使用 `state: unknown | known`，状态只能由用户点击切换。
- 旧记录不批量迁移：没有 `entryType` 且释义含 `phr.` 的记录读取时归入词组，其余仍归入单词；旧词组缺少的上下文字段按空值处理。
- 新收藏 ID 包含类型，避免相同文本作为单词和词组时互相覆盖；`known/remove` 继续按用户和条目 ID 操作。

### 2. 来源页改为收藏到正确的笔记本

修改 `pages/phrases/index.js` 和 `index.wxml`：

- “加入生词本”改为“加入词组本”，调用新的 `addPhrase` 并保存完整词组内容。
- 收藏状态直接写入每个 `item.added`，从词组缓存重新计算，修复当前映射与 WXML 状态不同步的问题。
- 保留现有展开、已看进度和“去语法练习”流程。

修改 `pages/analysis/index.js`、`index.wxml`、`index.wxss`：

- 每张语法卡增加“收藏到语法本 / 已收藏”按钮及独立忙碌状态。
- 收藏只写语法本，不自动展开卡片、不修改 `grammarViewed`、不影响练习记录。
- 以 `articleId + key + sentence` 判断收藏状态，避免文章重析后 `g1/g2` 顺序 ID 错位。

### 3. 新建个人语法与句式本

新增 `cloud/grammarbook/index.js`、`package.json` 和 `miniprogram/services/grammarbook.js`：

- 云函数仅使用 `wx-server-sdk`，提供 `add/list/remove`，通过 `OPENID` 隔离数据。
- 收藏时客户端只传 `articleId + pointId`；云端读取该用户文章的 `unitData.grammarPoints` 并保存快照，不信任客户端提交的大段讲解。
- 新集合 `grammarbooks` 保存来源文章、`key/pattern/sentence/understanding/translation/examples`；去重指纹包含 `articleId + key + sentence`。
- 不复制练习进度，不在语法本另建练习系统；删除收藏不影响原文章学习记录。

### 4. 新增两个笔记本页面和个人中心入口

新增普通页面：

- `miniprogram/pages/phrasebook/`：统计“不记得/记得”，展示词组、释义、文中形式、用法、原句和来源；支持“我记住了”和确认后移除。
- `miniprogram/pages/grammarbook/`：展示跨文章语法卡、原句、理解、翻译、例句和来源；支持确认后移除，不增加“记得”状态。
- 两个页面复用现有全局组件、纸张样式及橘猫素材，空态分别引导用户回文章词组/语法步骤收藏。

修改 `miniprogram/app.json` 注册两个普通页面，不改 tabBar。

修改 `miniprogram/pages/profile/index.js`、`index.wxml`、`index.wxss`：

- 并行读取学习数据、词库和语法本，任一笔记本读取失败时独立降级，不阻塞“我的”。
- 展示三个入口：我的生词本、我的词组本、我的语法与句式本；分别显示对应统计。
- 使用 `wx.navigateTo` 打开三个笔记本，保持三个入口的手帐卡片层次和间距。

## 保持不变

- `pages/wordbook` 的现有页面结构继续使用单词 `items/counts`，不做无关重构。
- 不修改 `study/analyzeArticle/evaluateTranslation`、学习顺序或清除学习记录的含义。
- 清除学习记录仍只重置文章学习进度，不清空三个个人笔记本。
- 不新增第三方依赖、外部图片或字体。

## 验证

1. 部署更新后的 `wordbook` 和新的 `grammarbook`，均使用“上传并部署：云端安装依赖（不上传 node_modules）”。
2. 验证旧单词仍只在生词本，旧 `phr.` 记录只在词组本，原记得状态与统计保持不变。
3. 从文章收藏词组，确认词组本展示完整释义、用法和原句；重复收藏不产生重复记录，点击记得和移除后统计同步。
4. 从语法卡收藏语法，确认语法本展示完整讲解与例句；移除后原文章已看进度和练习记录不变。
5. 切换文章后确认三个笔记本仍保留历史收藏；来源页的已收藏状态与删除结果一致。
6. 在模拟器检查“我的”三个入口、两个新页面的空态/长文本/底栏，以及“词汇 → 词组 → 语法 → 输出”原流程回归。
