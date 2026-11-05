# 英语喵原生微信小程序与云开发迁移计划

## Context
用户明确要求技术栈只能使用微信小程序原生与云开发，数据存入云数据库，不使用任何第三方 SDK。当前项目是 Taro/React/TypeScript/Zustand，进度主要存本机，必须整体迁移而不是继续修补现有 Taro 工程。迁移后保留现有 10 页 MVP、奶黄卡片视觉、橘猫素材及“所有释义必须带词性”的规则。

## 实施方案

### 1. 建立原生工程骨架
- 新建 `miniprogram/`，使用原生 `app.js/app.json/app.wxss/project 所需 sitemap.json`，页面采用 JS/WXML/WXSS/JSON 四件套。
- `app.js` 仅调用 `wx.cloud.init`；客户端仅使用微信原生 `wx.*`、`wx.cloud`，零 npm、零框架、零第三方 SDK。
- 修改 `project.config.json`：`miniprogramRoot` 指向 `miniprogram/`，保留用户已配置的 AppID 与 `cloud/` 云函数目录。
- 将 6 张 tabbar PNG 与 10 张橘猫 WebP 迁入 `miniprogram/assets/`，保留 `.pai`、Trae 设计文档和现有 AppID。

### 2. 原生迁移全部页面与组件
- 迁移 index、workbench、profile、import、proofread、vocabulary、analysis、marks、practice、summary 共 10 页及 3 个 tabBar。
- 将 CatImage、PrimaryButton、SectionTitle、ProgressBar、MeaningList 改为原生 Component；WXML 数据绑定和事件替代 React，WXSS 复刻现有主题与交互。
- 用 `Page.data`、`setData`、页面生命周期和原生服务模块替代 Zustand；`onShow` 从云端重新同步进度。
- 保留图片选择/排序/旋转、OCR 校对、五类筛选、五步解析、三色笔迹、三类练习、四单元通关与重置流程。
- 12 个单词 20 个义项继续以 `pos + definition` 输出；所有词条只通过 `meaning-list` 渲染，避免裸释义。

### 3. 云数据库与云函数
- 集合保持 `articles/article_units/attempts`，全部禁止客户端直接读写；云函数通过 `cloud.getWXContext().OPENID` 确认归属，忽略客户端传入的 openid。
- `articles`：文章标题、原文、图片 fileID、分析内容、演示标记、归属及时间戳。
- `article_units`：文章 ID、归属、掌握词、解析步骤、笔迹完成状态、练习通过汇总、版本号及更新时间。
- `attempts`：文章 ID、题目 ID、答案、评估结果、归属及创建时间，仅追加。
- 新增/重整 `study` 云函数，提供初始化当前文章、读取进度、字段白名单更新和重置；每次操作校验文章归属、枚举、长度及版本，避免越权和并发覆盖。
- 更新 `evaluateTranslation`：校验文章与题目归属，追加 attempts 并同步通过汇总；关键词评分继续明确标为演示评估。
- `recognizeArticle/analyzeArticle` 未配置微信官方能力前明确返回未接入，不伪造真实 OCR/AI；示例文章以 `isDemo` 标识。
- 云函数只依赖微信官方 `wx-server-sdk`；它是云开发官方运行时 SDK，不引入任何第三方 SDK。

### 4. 清除旧技术栈
- 原生流程验证后删除 `src/`、`types/`、`config/` 及根目录重复素材。
- 删除根 `package.json` 中全部 Taro/React/Zustand/Babel/Webpack/TS/Sass/CI 依赖与脚本，原生端不再保留 package 构建链。
- 删除 `babel.config.js`、`tsconfig.json`、`project.tt.json` 等非微信原生配置；不改动 Trae 产物和用户 AppID。

## 验证
1. 静态检查 10 页路由与四件套、5 个组件注册、WXML 绑定、JS 语法、JSON、资源路径及包体。
2. 全局搜索确认无 `Taro/React/Zustand/npm import`、无第三方 SDK，词性字段与义项数量一致。
3. 通过当前 IDE 可用的微信云开发能力部署并验证云函数与集合权限；不可用则明确报告阻塞，不声称已部署。
4. 验证首次初始化、进度写入、换页/重新进入同步、重置、练习追加及重复提交；使用不同身份检查越权访问会被拒绝。
5. 验证真机预览与核心学习闭环；OCR/AI 未接入时展示明确边界，不展示伪造成功结果。
