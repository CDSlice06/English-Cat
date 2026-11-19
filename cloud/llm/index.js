// 大模型统一出口：只走 Node 原生 https，不引入任何 SDK
// 密钥只从云函数环境变量读取，绝不下发到小程序端
const cloud = require('wx-server-sdk')
const https = require('https')
const http = require('http')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const DEFAULT_BASE = 'https://api.deepseek.com'
const DEFAULT_MODEL = 'deepseek-chat'
const MAX_TEXT = 9000

// 云开发下发的 AI 资源包：先消耗它的免费额度，额度用完或不可用时再回落到自建 API。
// 资源包走 wx-server-sdk 4.x 的 cloud.ai()；provider / model 都可以用环境变量覆盖。
const AI_PACK = {
  enabled: String(process.env.AI_PACK_ENABLED || 'on').trim().toLowerCase() !== 'off',
  // 成长计划资源包对应 hunyuan-v3 + hy3；若环境改成资源点套餐，把 AI_PROVIDER 设为 cloudbase
  providers: [String(process.env.AI_PROVIDER || 'hunyuan-v3').trim() || 'hunyuan-v3', 'cloudbase'],
  model: String(process.env.AI_MODEL || 'hy3').trim() || 'hy3',
  timeout: 20000
}
// 额度耗尽后，同一个云函数实例内不再反复重试资源包，直接走自建 API
let aiPackBlocked = false

// 资源包不可用时是否允许回落到自建 DeepSeek（按 token 计费）。
// 默认关闭：只消耗资源包，资源包不可用就直接报错，绝不产生自建模型费用。
// 需要临时恢复兜底时，在云函数环境变量里设 DEEPSEEK_FALLBACK=on。
const ALLOW_FALLBACK = String(process.env.DEEPSEEK_FALLBACK || 'off').trim().toLowerCase() === 'on'

// 每个任务单独限制输出长度与超时：分析类任务输出多、判分类任务只要几十个字
const TASKS = {
  // 讲解新增分步理解与分块翻译，单点输出更长，上限相应提高
  grammar: { maxTokens: 3200, timeout: 33000, temperature: 0.3 },
  // 每词最多 3 条义项，14 个词需要更长的输出上限
  words: { maxTokens: 1400, timeout: 32000, temperature: 0.2 },
  // 长文章能抽出几十条词组，700 会在输出被截断时变成非法 JSON
  phrases: { maxTokens: 1400, timeout: 32000, temperature: 0.2 },
  // 全文对照：每批最多 8 句，个别长句本身就有几百字符，输出上限要留够
  translate: { maxTokens: 3000, timeout: 32000, temperature: 0.2 },
  // 汉译英新增「逐点核对」checklist，输出更长，上限相应提高
  // 判题等待要和 evaluateTranslation 的 raceTimeout（10 秒）对齐：
  // 判题链路整体要留在平台等待上限内，模型慢时就尽早返回失败、走本地规则兜底
  judge: { maxTokens: 1100, timeout: 9000, temperature: 0.1 },
  // 外刊抓取时翻译标题和导语，输出很短，抓取链路要快
  headline: { maxTokens: 400, timeout: 12000, temperature: 0.3 },
  // 背诵环节的例句：一批最多 10 个词，每句十几个词，输出量中等
  sentences: { maxTokens: 1600, timeout: 28000, temperature: 0.7 },
  // 写译整段点评：信息点多、答案长，等模型的时间比单句判题宽一些
  writing: { maxTokens: 1600, timeout: 16000, temperature: 0.1 },
  article: { maxTokens: 2000, timeout: 48000, temperature: 0.8 }
}

const JSON_SYSTEM = '你是一位资深的中国大学英语四六级考试教研员。你只输出 JSON，不输出任何解释、注释或 Markdown 代码块。'

// 解析类任务写死系统提示：只做语法拆解和单词释义，拒绝无关问题，非英文不编造
const PARSE_SYSTEM = [
  '你是英文句子语法解析工具，只做与英文句子解析有关的三件事：拆解长难句语法结构，解释单词在句中的词性和含义，识别固定搭配。',
  '禁止回答任何与英语语法解析、单词释义无关的问题，禁止聊天、写作、常识问答或其他任务。',
  '如果输入不是英文句子或英文单词，不要编造解析，直接返回 {"error":"仅支持英文文本解析"}。',
  '你只输出 JSON，不输出任何解释、注释或 Markdown 代码块。'
].join('\n')

// 翻译任务单独用一套提示：共用的解析提示里带「不是英文句子就拒答」的守则，
// 模型看到「下面是一篇……请逐句翻译」这类中文指令时会误判成非英文输入而直接拒答
const TRANSLATE_SYSTEM = [
  '你是专业的英译中译者，读者是中国大学生。',
  '你的任务只有翻译：把用户给出的英文句子逐句译成自然通顺的中文，不做语法分析，不做解释。',
  '你只输出 JSON，不输出任何解释、注释或 Markdown 代码块。'
].join('\n')

const NON_ENGLISH = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/

// 后端兜底：即使前端被绕过，也绝不把中文送给模型
function isEnglishText(value) {
  const text = String(value || '')
  return /[A-Za-z]/.test(text) && !NON_ENGLISH.test(text)
}

function success(data) {
  return { code: 0, message: 'ok', data }
}

function failure(code, message) {
  return { code, message, data: null }
}

function clean(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function levelLabel(value) {
  return value === 'cet6' ? '六级（CET-6）' : '四级（CET-4）'
}

// 第一阶段：只让模型从原文里挑语法点，不写讲解，输出短、速度快
function composeGrammarSelect(event, text) {
  const maxPoints = Math.min(14, Math.max(4, Number(event.maxPoints) || 8))
  const knownPatterns = (Array.isArray(event.knownPatterns) ? event.knownPatterns : [])
    .slice(0, 20)
    .map((item) => clean(item, 60))
    .filter(Boolean)
  // 用户已经收藏并记住的语法点，不再重复出现
  const avoidPatterns = (Array.isArray(event.avoidPatterns) ? event.avoidPatterns : [])
    .slice(0, 30)
    .map((item) => clean(item, 60))
    .filter(Boolean)

  const user = [
    `下面是一篇${levelLabel(event.level)}英语文章。请挑出 ${Math.max(4, maxPoints - 2)}-${maxPoints} 个最值得讲的语法点。`,
    '输出 JSON：{"points":[{"pattern":"...","sentence":"...","evidence":"..."}]}',
    '要求：',
    '1. sentence 必须从原文逐字复制，不能改写、拼接或编造，只允许去掉首尾多余空格。',
    '2. 每个句子只能用一次；同一类句型只能出现一次，pattern 名称不能重复。',
    '3. 语法点必须「句法结构」和「词法/短语用法」混合挑选，不能全是从句类句型。句法结构含：主语从句、宾语从句、表语从句、同位语从句、定语从句（含介词 + which/whom、限制性与非限制性）、状语从句（时间/原因/让步 although、even if / 条件 unless、provided that / 目的 so that、in order to / 结果 so…that / 方式 as if）、非谓语（动名词作主语、分词作定语/状语、不定式作目的或定语）、部分倒装与完全倒装、强调句 It is … that、强调 do/does/did、比较结构（as…as、the more…the more、not so much A as B、too…to、enough to）、虚拟语气（wish/if only/would rather/It is high time）、省略、独立主格、there be、形式主语/宾语 it、wh-ever、多层从句嵌套；词法/短语用法含：反身代词、as/than + 主语 + do/did/does 替代、介词 + 反身代词、主谓一致（the number of / each / neither…nor）、情态动词 + have done、比较级修饰（much/far/even）与最高级、so/neither 引导的倒装、固定介词搭配等。as 的各种用法都要覆盖：as … as 同级比较、as 引导时间/原因状语从句（随着/由于）、as 引导让步倒装（Much as I like it）、as 引导定语从句（such / the same / as is known）、as long as、as if / as though、as well as / as a result 这类固定短语。句中确实出现了哪个就讲哪个，不能编造。',
    '4. pattern 用简短中文命名，例如「whether 宾语从句」「非限制性定语从句」「so...that 结果状语从句」「by + 反身代词」「as + 主语 + do 替代」「as 引导原因状语从句」，词法类要点名具体词形。',
    '5. pattern 里出现的每个英文词（which、that、whether、as、if、by、do 等）都必须真的出现在该句中；句子里没有 which 就不能叫「介词+which 定语从句」，只能按句中真实结构命名。',
    '6. evidence 是句子里体现该句型的逐字片段（不超过 20 个词），必须能在 sentence 中原样找到。',
    knownPatterns.length
      ? `7. 若本次句型与下列已讲过的名称相同，请沿用相同写法，便于统一讲解：${JSON.stringify(knownPatterns)}`
      : '',
    avoidPatterns.length
      ? `8. 以下是用户已经掌握并记住的语法点，本次绝对不要再选同类：${JSON.stringify(avoidPatterns)}`
      : '',
    `文章：\n"""${text}"""`
  ].filter(Boolean).join('\n')

  return { ok: true, messages: [{ role: 'system', content: PARSE_SYSTEM }, { role: 'user', content: user }] }
}

// 第二阶段：对选定的句子逐个讲解并出练习提示
function composeGrammarExplain(event, text) {
  const points = (Array.isArray(event.points) ? event.points : [])
    .slice(0, 6)
    .map((item, index) => ({
      id: clean(item && item.id, 12) || `p${index + 1}`,
      pattern: clean(item && item.pattern, 60),
      sentence: clean(item && item.sentence, 400),
      note: clean(item && item.note, 220)
    }))
    .filter((item) => item.sentence && item.pattern)
  if (!points.length) return { ok: false, message: 'points 不能为空' }

  const user = [
    `下面是一篇${levelLabel(event.level)}英语文章，以及已经选定的语法点。请逐个讲解，并围绕该语法点新造练习题句子。`,
    '输出 JSON：{"points":[{"id":"p1","pattern":"...","evidence":"...","structure":"...","understanding":"...","steps":[{"title":"...","detail":"..."}],"translation":"...","chunks":[{"en":"...","zh":"..."}],"usageTip":"...","examples":[{"en":"...","zh":"..."}],"practice":[{"en":"...","zh":"..."}],"en2zhHint":"..."}]}',
    '要求：',
    '1. id 必须与输入一一对应，不能改、不能少、不能多。',
    '2. pattern：本句真正体现的句型名（不超过 20 字）。如果输入的句型名与句子结构不符，必须按句子实际结构改名；pattern 里出现的每个英文词都必须逐字出现在 sentence 中。evidence 是 sentence 中体现该句型的逐字片段（不超过 20 词）。',
    '3. structure：这个句型的通用结构说明，不超过 60 字，讲规则不讲本句细节。',
    '4. understanding：「怎么理解」的总说明，不超过 220 字。必须针对这一句写清三件事：① 主句的主语和谓语分别是什么（引用句中真实单词）；② 从句、非谓语、介词短语分别挂在哪一个成分上、修饰谁；③ 这句话最容易读错的地方（引导词作用、省略了什么、哪个词是形式主语等）。不能只给结论，也不能套用其他句子的说法。',
    '5. steps：「怎么理解」的分步拆解，3-5 步，按用户实际读句子的顺序写，每步 {"title":"不超过 12 字","detail":"不超过 120 字"}。第一步必须指出主句主干（谁 + 做什么，引用句中真实单词）；第二步说明从句/非谓语/插入语怎么挂到主干上；第三步说明英语语序和中文语序差在哪、要不要调整；最后一步说明中文怎么连成一句。每一步都要用这一句里的真实单词，禁止写「先找主干」这类空泛的套话。',
    '6. translation：输入句子的整句自然中文翻译，不要逐词硬译，也不要把分块译文简单拼接。',
    '7. chunks：「怎么翻译」的分块对译，2-4 块，每块 {"en":"...","zh":"..."}。en 必须是 sentence 里按原顺序出现的逐字片段（可以省略虚词，但不能改写、调序或自造），zh 是这一块对应的中文。各块按原文顺序排列，合起来要覆盖整句的信息，让用户能一块一块对照着看懂。',
    '8. usageTip：写作或翻译时复用该结构的要点，不超过 70 字。',
    '9. examples：1 个同结构的英文例句（8-16 词）及中文翻译，不能照抄输入句子。',
    '10. practice：为该语法点新造 1 组练习句 {"en":"...","zh":"..."}。en 必须是你自己新写的英文句子（8-18 词），要明显体现该语法结构；禁止照抄、改写或拼接文章里的任何句子，也不能与 examples 重复；zh 是自然中文翻译。',
    '11. en2zhHint：给英译汉的提示，不超过 30 字，要针对 practice 里的新句子，不能写「先认出某结构」这类通用套话。',
    '12. note 是以前讲过的同类语法点记录，只用来保持术语和讲解口径一致，不能照抄，也不能用旧句子的内容代替本句分析。',
    '13. 所有讲解用中文；英文例句语法必须正确。',
    '14. 讲解里点名的每个语法术语都必须在输入句子里真实存在：句中没有 whether 或 if 就不能讲 whether / if 的语序，没有倒装就不能讲倒装，没有被动就不能讲被动语态。宁可少讲一层，也不能把别的句型的话术套到这一句上。',
    '15. steps 的每一步都要落到本句的真实成分上，读起来必须是「这一步在拆这一句」，而不是通用语法讲义。',
    `文章：\n"""${text}"""`,
    `语法点：\n${JSON.stringify(points)}`
  ].join('\n')

  return { ok: true, messages: [{ role: 'system', content: PARSE_SYSTEM }, { role: 'user', content: user }] }
}

function composeGrammar(event) {
  const text = clean(event.text, MAX_TEXT)
  if (!text) return { ok: false, message: 'text 不能为空' }
  if (!isEnglishText(text)) return { ok: false, message: '仅支持英文文本解析' }
  return event.stage === 'select'
    ? composeGrammarSelect(event, text)
    : composeGrammarExplain(event, text)
}

function composeWords(event) {
  const text = clean(event.text, MAX_TEXT)
  if (!text) return { ok: false, message: 'text 不能为空' }
  if (!isEnglishText(text)) return { ok: false, message: '仅支持英文文本解析' }
  const words = (Array.isArray(event.words) ? event.words : [])
    .slice(0, 14)
    .map((item) => ({
      word: clean(item && item.word, 40),
      sentence: clean(item && item.sentence, 220),
      meaning: clean(item && item.meaning, 160),
      from: clean(item && item.from, 40)
    }))
    .filter((item) => item.word)
  if (!words.length) return { ok: false, message: 'words 不能为空' }

  const user = [
    `下面是一篇${levelLabel(event.level)}英语文章里挑出的重点词，以及它们在文中的原句和词典释义。`,
    '请按书面英语的常用度，重新筛选并排序每个词的义项；词典释义为空的是词库没有收录的派生词或进阶词，必须补全，不能跳过。',
    '输出 JSON：{"words":[{"word":"...","senses":[{"pos":"n.","cn":"裂缝；裂纹"},{"pos":"v.","cn":"（使）破裂；（使）裂开"}],"ph":"...","rare":false}]}',
    '要求：',
    '1. senses 给 1-3 条，按常用度从高到低排序，第一条是原文句子里用到的义项；这个词在四六级里常考的其他义项也要给全，不能只给语境义。',
    '2. 只保留书面英语和正式语境常用的义项；口语、俚语、地区性用法、冷僻义一律剔除（例如 crack 的「第一流的」是英式口语，不能给；「啪地一声」这类拟声义也不要）。',
    '3. 同一词性的近义义项合并成一条，用「；」分隔；不要把一个词性拆成好几条。',
    '4. pos 只能是 n. / v. / adj. / adv. / prep. / conj. / pron. / num. / phr. 之一。',
    '5. cn 是纯中文释义，不超过 20 字，不带词性前缀，不能包含英文单词，无法用中文解释的词就不要返回。',
    '6. rare 为 true 表示本文句子里用的是熟词生义（常见词的生僻义）；普通词返回 false。',
    '7. ph 是该词的国际音标（不带斜杠），可选；不确定就返回空字符串。',
    '8. 最多返回 14 个词：meaning 为空的词必须全部返回；其余词的义项也按上面的标准复核，词典里漏掉的常用义要补齐。',
    '9. 词条以输入里的 word 为准，不要改拼写、不要写「原文拼写有误」「应为某某」这类批注。',
    '10. from 是该词的词根（例如 implementation ← implement），只作为判断词性和词义的参考。',
    `文章：\n"""${text}"""`,
    `重点词：\n${JSON.stringify(words)}`
  ].join('\n')

  return { ok: true, messages: [{ role: 'system', content: PARSE_SYSTEM }, { role: 'user', content: user }] }
}

function composePhrases(event) {
  const text = clean(event.text, MAX_TEXT)
  if (!text) return { ok: false, message: 'text 不能为空' }
  if (!isEnglishText(text)) return { ok: false, message: '仅支持英文文本解析' }
  const existing = (Array.isArray(event.phrases) ? event.phrases : [])
    .slice(0, 40)
    .map((item) => clean(item && item.phrase, 60))
    .filter(Boolean)

  const user = [
    `从下面这篇${levelLabel(event.level)}英语文章中尽可能多地找出值得记住的搭配（动词短语、介词短语、名词搭配、术语性组合、习语），最多 30 个。宁可多收也不要漏掉原文里真实存在的固定搭配。`,
    '输出 JSON：{"phrases":[{"phrase":"...","matched":"...","meaning":"...","note":"..."}]}',
    '要求：',
    '1. phrase 是搭配的规范形式：动词短语用原形，名词搭配用单数，例如 multinational corporations 写成 multinational corporation；不要带时态、复数等变形。',
    '2. matched 是原文中与该搭配对应的逐字片段（允许大小写差异，可以带复数/时态），必须能在原文里原样找到，长度 2-5 个词。',
    '3. meaning 是完整的中文释义，不超过 24 字，要让用户不看原文也知道怎么用。动词短语必须补出宾语占位：接人的用「使某人……」，接物的用「使某物……／把某物……」，介词后面的对象用「……」表示。例如 blind somebody to → 使某人对……视而不见（不能只写「使忽视」）；tip somebody into → 使某人陷入……；prevent somebody from → 阻止某人做……。',
    '4. note 是用法的中文提示，可为空字符串。',
    '5. 必须覆盖原文里出现的「动词 + 介词」和「动词 + 宾语 + 介词」类搭配（tip into、blind sb to、lead to、result in、prevent sb from、accuse sb of），即使全篇只出现一次也要收，不能只挑名词搭配。',
    '6. 至少给出 2 个「修饰语 + 名词」或「名词 + 名词」的术语型搭配（例如 multinational corporations、tax havens、carbon emissions），这类搭配即使不是动词短语也要收。',
    '7. 不要收录 the / a / of 这类纯功能词组合。',
    '8. 只收固定搭配，不要收临时组合。以下都不算，必须排除：',
    '   - 系动词 + 形容词：feel unwelcome、look happy、seem tired（这是语法结构，不是搭配）；',
    '   - 介词/连词 + 动名词：rather than lingering、instead of waiting（只收 rather than、instead of 本身，不要带后面的 -ing 词）；',
    '   - 动词 + 副词：work hard、run fast；',
    '   - 主语 + 谓语 + 宾语这类普通句子片段。',
    '9. 先判断核心搭配到哪结束：rather than lingering 的正确搭配是 rather than，lingering 是句中临时内容，不能一起收录。',
    '10. 关联连词必须成对收录，绝不能只收前半截：not only 配 but also（口语里 also 常省略，只剩 but），not just 配 but also，either 配 or，neither 配 nor，both 配 and，so 配 that，the more 配 the more。phrase 用省略号写成完整形式（例如 not only … but also），matched 是从前半截到后半截的原文片段（可以超过 5 个词），meaning 写「不仅……而且……」这类成对释义。原文里确实找不到后半截时才不收。',
    existing.length ? `已有词组（不要重复，也不要在这个基础上加词）：${JSON.stringify(existing)}` : '',
    `文章：\n"""${text}"""`
  ].filter(Boolean).join('\n')

  return { ok: true, messages: [{ role: 'system', content: PARSE_SYSTEM }, { role: 'user', content: user }] }
}

function composeJudge(event) {
  const en2zh = event.mode === 'en2zh'
  const mode = en2zh ? '英译汉' : '汉译英'
  const reference = clean(event.reference, 800)
  const prompt = clean(event.prompt, 800)
  const answer = clean(event.answer, 1200)
  const pattern = clean(event.pattern, 80)
  if (!answer) return { ok: false, message: 'answer 不能为空' }
  if (!reference) return { ok: false, message: 'reference 不能为空' }

  const user = [
    `题型：${mode}`,
    `本题句型：${pattern || '未标注'}`,
    `题目：${prompt}`,
    `参考译文：${reference}`,
    `学生答案：${answer}`,
    '输出 JSON：{"pass":true,"rule":"","feedback":"...","usage":{...},"improvements":[...],"checklist":[...]} 或 {"pass":false,"rule":"错误类型","feedback":"...","usage":{...},"improvements":[...],"checklist":[...]}',
    '要求：',
    '1. pass 只能是布尔值。',
    '2. 通过时 rule 为空字符串，feedback 用一句中文肯定，不超过 40 字。',
    '3. 不通过时 feedback 用一句中文指出问题类型，不超过 60 字，绝对不能出现参考答案里的具体单词、正确译文或缺失词列表，避免学生直接照抄。',
    '4. feedback 要点名学生答案里具体用错的单词或结构（例如 let、to、way），不要用「不定式符号」「某个词」这类含糊说法。'
  ]
  if (en2zh) {
    // 英译汉只看有没有读懂原句：同义替换、语序调整、翻译腔都不算错，用词差异不吹毛求疵
    user.push(
      '5. 判断标准（英译汉，从宽）：学生译文只要读懂了原句、核心意思和参考译文一致、信息基本完整，就判通过。',
      '6. 同义替换一律算对：「学生/同学」「老师/教师」「通常/往往」「尊敬/尊重」这类近义词差别不是错误；中文语序、断句、指代写法的差别不算错；略有翻译腔、表达不够优美也不算错。',
      '7. 只有出现下列情况才判不通过：意思与原文相反或明显偏离、关键信息错译或整个主干漏译、主语和宾语颠倒、答非所问。',
      '8. 禁止以「与参考译文不一致」「用词不够准确」「某处译得不够好」为由判不通过；把握不准时一律判通过。',
      '9. 英译汉不通过时，rule 为空字符串，feedback 只说明意思哪里不对，不评价用词优劣；不要输出 usage 字段（英译汉的正确用法示例会提前泄露英文句式）。'
    )
  } else {
    user.push(
      '5. 判断标准（汉译英，结构从严、用词从宽）：句型结构和句子意思正确就判通过，小的用词瑕疵不影响通过。',
      '6. 判分分两步：先把题目拆成信息点，再逐点核对学生的答案。信息点 = 主干的每一部分 + 题目里每一处完整的修饰信息（定语、状语、从句、并列成分，以及时间、地点、条件）；「这位、那个、了、着」这类细微限定词不算信息点。',
      '7. 只错冠词（多了或少了一个 the/a）、单复数、固定搭配里多词少词、用词不够地道，都判通过；可以在 feedback 里用一句话提醒，但不要因此判不通过。',
      '8. 只有结构、语法、意思层面的实质错误才判不通过：句子残缺、主谓顺序颠倒、时态或主谓一致错误、从句语序错误、漏译题目里的完整信息点（题目后半句、定语、状语、从句等整块信息在学生答案里找不到对应表达）、意思偏离原句。整块信息点漏译时 rule 取 info，绝不能因为句子主干没写错就判通过。',
      '9. feedback（覆盖第 3 条的字数限制）：通过时用一句中文肯定，并点出学生句子里值得保持的写法，不超过 40 字；不通过时用 1-2 句中文，先说清问题类型，再点到学生答案里的具体位置（例：你写的句子主语只有 candidate 一个词，题目里修饰它的那层定语整块没译出来），不超过 90 字。绝对不能出现参考答案里的具体单词、正确译文或缺失词列表。',
      '10. feedback 只能指出学生答案里真实出现的问题：学生没写从句，就不能说「从句语序错误」；句中没出现「介词 + 句子」这类结构，就不能说「介词后面不能接句子」。禁止把学生没犯的错说成他犯了。',
      '11. rule 只能取下面之一，括号里是该类型的判断依据，且必须是学生答案里真实存在的问题：',
      'incomplete(句子残缺) tail(漏译后半句) info(信息没译全或意思偏离) clause(whether/if 从句语序) clause-predicate(whether/if 从句缺谓语) clause-subject(whether/if 从句缺主语或与 that 叠加) subjectOrder(主谓顺序颠倒) subjectGap(主谓被状语隔开) tense(时态) modal(情态动词后动词形式) agreement(主谓一致) determiner(漏冠词) quantity(数量与名词复数) inversion(倒装) soThat(so…that) comparison(比较级 than 结构) adverbial(状语从句) prep(介词后面直接跟了句子) relative(定语从句) subjunctive(虚拟语气) nonfinite(非谓语动词) parallel(并列结构与关联连词) passive(被动语态) formalIt(形式主语/形式宾语) thereBe(there be 句型) order(结构不完整或语序)。',
      '12. rule 必须和这道题考的句型对得上：考比较级就选 comparison，考 as / since / because 引导的状语从句就选 adverbial，考定语从句就选 relative。只有句中确实出现 whether 或 if 时才可以用 clause 系列，不能把所有结构问题都归到 clause。',
      '13. checklist 是「逐点核对」模块（汉译英必须给出）：按第 6 条把题目拆成 2-6 个信息点，逐点核对学生在答案里有没有写到，让学生一眼看出哪块信息写到了、哪块没写到：',
      '{"checklist":[{"zh":"信息点的中文描述，不超过 18 字（例：主语候选人前面的定语『准备充分的』）","ok":true 或 false（学生答案里有没有对应表达）","note":"针对学生答案的一句说明，不超过 45 字：写到的就说明学生答案是哪一段对应上的、哪里还可以打磨；没写到的就说明这块在答案里是空的、补上句意才完整。不能用英文写出正确表达，也不能与参考译文用词相同"}]}',
      '14. usage 是给学生看的「正确用法」讲解，用来纠正学生真正写错的地方，比 feedback 详细，通过与否都要尽量给出（整句完全没有可纠正的点才留空）：',
      '{"point":"针对学生用错的那个词或结构，讲清它的正确用法，不超过 60 字（例：let sb do sth——let 后面接『人或物 + 动词原形』，不能加 to）","wrong":"学生答案里写错的那一小段，逐字引用，不超过 12 词；没有具体错处就留空","correct":"把 wrong 改对后的写法，不超过 12 词","example":"你新造的一个英文例句（8-14 词），必须与原题参考译文不同，也不能在参考译文上小幅改写","exampleZh":"例句的中文翻译，不超过 25 字"}',
      '15. usage 一次只讲学生真正用到或写错的那一个点，讲透讲准；correct 和 example 绝不能与参考译文相同或相近，否则等于把答案递给同学。',
      '16. improvements 是「可以写得更好」的改善建议数组（0-3 条）：即使句子没有错误、已经判通过，也要从更简洁、更地道、作文更推荐的角度提 1-2 条（例：seems to be 可以简化为 seems；enough 比 very 更书面）；整句确实没有可优化的点才用 []。每条格式：{"point":"为什么改完更好，不超过 40 字，可以点明『更简洁，作文更推荐』","wrong":"学生答案里的原写法，逐字引用，不超过 12 词","correct":"改进后的写法，不超过 12 词"}。improvements 不能重复 usage 已经讲过的同一个点；correct 不能与参考译文连续 5 个词以上重合。'
    )
  }

  return { ok: true, messages: [{ role: 'system', content: JSON_SYSTEM }, { role: 'user', content: user.join('\n') }] }
}

// 写译整段翻译：按四六级评分思路逐句核对，不套用单句判题那套结构错误清单
function composeWritingJudge(event) {
  const mode = event.mode === 'en2zh' ? '英译汉' : '汉译英'
  const reference = clean(event.reference, 2000)
  const prompt = clean(event.prompt, 1200)
  const answer = clean(event.answer, 2000)
  if (!answer) return { ok: false, message: 'answer 不能为空' }
  if (!reference) return { ok: false, message: 'reference 不能为空' }

  const user = [
    `题型：${mode}（整段翻译，不是单句）`,
    `题目：${prompt}`,
    `参考译文：${reference}`,
    `学生答案：${answer}`,
    '输出 JSON：{"pass":true/false,"feedback":"...","improvements":[...],"checklist":[...]}',
    '要求：',
    '1. 以信息是否译全、句意是否准确、语法是否成立为主要标准；用词不够地道、个别冠词或单复数小错，不判不通过。',
    '2. 至少两处完整信息（分句、定语、状语、并列成分）漏译或明显错译，才判不通过。',
    '3. feedback 用 1-2 句中文说明整体表现和主要问题，不超过 90 字；不能出现参考译文里的具体英文单词或正确译文，也不要列缺失词清单。',
    '4. checklist 给 3-6 个信息点，用中文描述（每条不超过 18 字），逐点标注 ok:true 或 false，note 用一句中文说明学生答案在这一点的对应情况，不能写英文正确表达。',
    '5. improvements 给 0-3 条最值得改的写法：{"point":"为什么改完更好，中文，不超过 40 字","wrong":"学生原文片段，逐字引用，不超过 12 词","correct":"改进后的写法，不超过 12 词"}；correct 不能与参考译文连续 5 个词以上重合。',
    '6. 英译汉时从宽：同义替换、语序调整、翻译腔都不算错，只看是否读懂原意，也不要输出英文改写。'
  ].join('\n')

  return { ok: true, messages: [{ role: 'system', content: JSON_SYSTEM }, { role: 'user', content: user }] }
}

// 题库文章生成：离线批量造题时使用，不在小程序端直接调用
function composeArticle(event) {
  const level = event.level === 'cet6' ? 'cet6' : 'cet4'
  const topic = clean(event.topic, 40) || '校园生活'
  const min = level === 'cet6' ? 300 : 240
  const max = level === 'cet6' ? 330 : 270

  const user = [
    `请原创一篇${levelLabel(level)}阅读理解文章，主题：${topic}。`,
    '输出 JSON：{"title":"...","topic":"...","text":"..."}',
    `要求：`,
    `1. text 为 ${min}-${max} 个英文单词，3-5 段，段落之间用 \\n\\n 分隔。`,
    '2. 只写正文，不要题目、不要小标题、不要中文。',
    level === 'cet6'
      ? '3. 句式要有长难句：至少包含定语从句、状语从句、名词性从句、非谓语各一处；词汇难度对齐六级，抽象话题为主。'
      : '3. 句子长度适中，从句不超过两层；词汇难度对齐四级。',
    '4. 话题积极、无版权风险，不要出现真实人名、机构名或真题原文。'
  ].join('\n')

  return { ok: true, messages: [{ role: 'system', content: JSON_SYSTEM }, { role: 'user', content: user }] }
}

// 全文对照：逐句翻译整篇文章，只在报告页生成一次并缓存
function composeTranslate(event) {
  // 不能按 400 截断：外刊里有整句 600+ 字符的长句，截断后模型只会翻半句，
  // 返回的 en 也跟原文对不上，调用方会把这句判成“未翻译”
  const sentences = (Array.isArray(event.sentences) ? event.sentences : [])
    .slice(0, 12)
    .map((item) => clean(item, 1200))
    .filter(Boolean)
  if (!sentences.length) return { ok: false, message: 'sentences 不能为空' }
  const text = sentences.join(' ')
  if (!isEnglishText(text)) return { ok: false, message: '仅支持英文文本解析' }

  const user = [
    `下面是一篇${levelLabel(event.level)}英语文章中的 ${sentences.length} 个句子，请逐句翻译成高质量中文。`,
    '输出 JSON：{"sentences":[{"en":"...","zh":"..."}]}',
    '要求：',
    '1. en 必须与输入句子逐字一致，不能改写、合并、拆分，也不要改标点。',
    '2. 每句一条，顺序与输入完全一致，不能漏句、不能多出句子。',
    '3. 先理清英文句子的主干、修饰关系与逻辑，再按中文表达习惯重组，不要逐词硬译，不要翻译腔。',
    '4. 追求「信达雅」：忠实原意（不增不减，保留因果、让步、条件、对比等关系），通顺自然（指代明确、句子衔接连贯），用词凝练、有文采但不浮夸。',
    '5. 同一人物、概念、术语在全篇保持统一译法；中文里能自然省略的主语代词就省略，不要机械补「他/它」。',
    '6. 不要添加原文没有的解释、背景或评论，也不要漏掉原句里的信息。',
    '7. 只做翻译，不做语法分析，不加注释。',
    `句子：\n${JSON.stringify(sentences)}`
  ].join('\n')

  return { ok: true, messages: [{ role: 'system', content: TRANSLATE_SYSTEM }, { role: 'user', content: user }] }
}

// 外刊标题与导语翻译：抓取入库时调一次，结果存进数据库给列表页用
function composeHeadline(event) {
  const title = clean(event.title, 200)
  const brief = clean(event.summary, 400)
  if (!title) return { ok: false, message: 'title 不能为空' }
  if (!isEnglishText(title)) return { ok: false, message: '仅支持英文文本解析' }

  const user = [
    '下面是一篇英文外刊文章的标题和导语，请翻译成中文，读者是中国大学生。',
    '输出 JSON：{"title":"...","summary":"..."}',
    '要求：',
    '1. title 是不超过 22 个字的中文标题，准确传达原文意思，不加书名号、不加引号，不要罗列音译人名。',
    '2. summary 是不超过 60 个字的中文导语，一到两句话，说清文章在讲什么，不要逐词直译。',
    '3. 机构、卫星、地名用通行中文译名，没有通行译名的保留英文。',
    '4. 不要添加原文没有的信息，不要写成评论或推荐语。',
    `标题：${title}`,
    brief ? `导语：${brief}` : ''
  ].filter(Boolean).join('\n')

  return { ok: true, messages: [{ role: 'system', content: JSON_SYSTEM }, { role: 'user', content: user }] }
}

// 背诵环节的例句：写一句生活化的短句，正好用上这个单词或词组
// 词表清洗只做一次，查缓存和拼提示词都用这份
function sentenceItems(event) {
  return (Array.isArray(event.items) ? event.items : [])
    .slice(0, 10)
    .map((item) => ({
      word: clean(item && item.word, 60),
      pos: clean(item && item.pos, 12),
      meaning: clean(item && item.meaning, 40)
    }))
    .filter((item) => item.word && isEnglishText(item.word))
}

function composeSentences(event) {
  const items = sentenceItems(event)
  if (!items.length) return { ok: false, message: 'items 不能为空' }

  const list = items
    .map((item, index) => `${index + 1}. ${item.word}${item.pos ? `（${item.pos}）` : ''}${item.meaning ? ` 意思是${item.meaning}` : ''}`)
    .join('\n')

  const user = [
    '你在给中国大学生准备英语语境填空素材，请为下面每个词各写一句简短的英文例句。',
    '输出 JSON：{"items":[{"word":"...","sentence":"...","zh":"..."}]}',
    '要求：',
    '1. 每句 6-14 个词，只写一句；sentence 只放英文，不加引号、不加中文解释、不写序号（中文放在 zh 里）。',
    '2. sentence 必须原样包含给定的词：大小写可以不同，但不能加 -s/-ed/-ing 等变形，词组要整条出现。',
    '3. 像日常对话或美剧台词那样自然，用吃饭、通勤、上班、朋友聊天这类生活场景，不要写作文腔和说教句。',
    '4. 除目标词外的其他词都要是高中及以下最常见的词（如 get、take、time、friend、office），不要出现生僻词、专有名词、书名地名，也不要堆从句；整句控制在 6-14 个词。',
    '5. word 必须与输入逐字一致，顺序与输入一致，不能少、不能多。',
    '6. 每个句子都要不一样，不要把同一个句型套十遍。',
    '7. 这些句子会被挖掉目标词做成填空题，所以句子本身必须读得通，而且上下文要能提示出该填哪个词。',
    '8. zh 是这句英文的自然中文翻译：像中国人平时说话，不要逐词硬译，不要把句子翻译成解释；不要留空格，目标词直接按它在该句里的意思翻。',
    `词表：\n${list}`
  ].join('\n')

  return { ok: true, messages: [{ role: 'system', content: JSON_SYSTEM }, { role: 'user', content: user }] }
}

function compose(task, event) {
  if (task === 'grammar') return composeGrammar(event)
  if (task === 'words') return composeWords(event)
  if (task === 'phrases') return composePhrases(event)
  if (task === 'translate') return composeTranslate(event)
  if (task === 'headline') return composeHeadline(event)
  if (task === 'sentences') return composeSentences(event)
  if (task === 'judge') return composeJudge(event)
  if (task === 'writing') return composeWritingJudge(event)
  return composeArticle(event)
}

function parseJSON(raw) {
  if (!raw || typeof raw !== 'string') return null
  const text = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  try {
    const parsed = JSON.parse(text)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
  } catch (error) {
    return null
  }
}

function postJSON(endpoint, apiKey, payload, timeout) {
  return new Promise((resolve, reject) => {
    let url
    try {
      url = new URL(endpoint)
    } catch (error) {
      reject(new Error('API 地址不合法'))
      return
    }
    const client = url.protocol === 'http:' ? http : https
    const body = Buffer.from(JSON.stringify(payload))
    const path = `${url.pathname.replace(/\/$/, '')}/chat/completions`
    const req = client.request({
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'http:' ? 80 : 443),
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'Content-Length': body.length
      },
      timeout
    }, (res) => {
      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8')
        let parsed = null
        try {
          parsed = JSON.parse(raw)
        } catch (error) {
          parsed = null
        }
        resolve({ statusCode: res.statusCode || 0, body: parsed, raw })
      })
    })
    req.on('timeout', () => req.destroy(new Error('TIMEOUT')))
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function isQuotaError(message) {
  return /quota|insufficient|balance|arrear|exceed|limit|额度|余额|欠费|配额/i.test(String(message || ''))
}

// 第一优先：云开发 AI 资源包。返回 null 表示这一轮没拿到可用结果，交给自建 API 兜底。
async function requestAIPack(task, messages, config) {
  if (!AI_PACK.enabled || aiPackBlocked || typeof cloud.ai !== 'function') return null
  let ai
  try {
    ai = cloud.ai()
  } catch (error) {
    console.log('[llm] ai pack unavailable', { task, message: String(error && error.message).slice(0, 160) })
    return null
  }
  const timeout = Math.min(config.timeout || AI_PACK.timeout, AI_PACK.timeout)
  const tried = new Set()
  for (const provider of AI_PACK.providers) {
    if (tried.has(provider)) continue
    tried.add(provider)
    const started = Date.now()
    try {
      const model = ai.createModel(provider)
      const res = await model.generateText({
        model: AI_PACK.model,
        messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens
      }, { timeout })
      const raw = res && (res.text
        || (res.choices && res.choices[0] && res.choices[0].message && res.choices[0].message.content))
      const content = parseJSON(raw)
      if (!content) throw new Error('返回内容不是合法 JSON')
      // 模型拒答（如 {"error":"仅支持英文文本解析"}）不算成功，换 provider 或回落自建 API
      if (content.error) throw new Error(`模型拒答：${String(content.error).slice(0, 80)}`)
      console.log('[llm] ai pack ok', { task, provider, ms: Date.now() - started, usage: (res && res.usage) || null })
      return {
        content,
        usage: (res && res.usage) || null,
        model: (res && res.model) || AI_PACK.model,
        provider
      }
    } catch (error) {
      const message = String((error && error.message) || '')
      console.log('[llm] ai pack failed', { task, provider, ms: Date.now() - started, message: message.slice(0, 160) })
      // 额度用完：本次及之后的实例内调用都直接走自建 API
      if (isQuotaError(message)) {
        aiPackBlocked = true
        return null
      }
      // 模型能连通、只是输出不是 JSON：换 provider 意义不大，直接兜底
      if (message === '返回内容不是合法 JSON') return null
    }
  }
  return null
}

// 真正打模型：所有任务共用，失败一律转成统一的 failure
async function requestModel(task, messages, config, apiKey) {
  const started = Date.now()

  // 优先消耗云开发下发的 AI 资源包
  const packed = await requestAIPack(task, messages, config)
  if (packed) {
    console.log('[llm] ok', { task, source: 'ai-pack', ms: Date.now() - started, usage: packed.usage })
    return success({
      content: packed.content,
      usage: packed.usage,
      model: packed.model,
      source: 'ai-pack',
      ms: Date.now() - started
    })
  }

  if (!apiKey) {
    return failure(503, 'AI 资源包额度已用完，且未配置 DEEPSEEK_API_KEY，暂时无法调用大模型')
  }

  if (!ALLOW_FALLBACK) {
    console.log('[llm] fallback disabled', { task, reason: 'DEEPSEEK_FALLBACK=off' })
    return failure(503, 'AI 资源包暂时不可用，已停止回落自建模型，请稍后再试')
  }

  const model = String(process.env.DEEPSEEK_MODEL || DEFAULT_MODEL).trim() || DEFAULT_MODEL
  const base = String(process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE).trim() || DEFAULT_BASE
  // 资源包失败后只剩有限时间，兜底请求不能把云函数整体超时顶穿
  const budget = Math.max(6000, 45000 - (Date.now() - started))
  const timeout = Math.min(config.timeout, budget)

  try {
    const response = await postJSON(base, apiKey, {
      model,
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stream: false,
      response_format: { type: 'json_object' }
    }, timeout)

    if (response.statusCode < 200 || response.statusCode >= 300) {
      const detail = response.body && response.body.error && response.body.error.message
        ? String(response.body.error.message).slice(0, 160)
        : ''
      console.log('[llm] upstream failed', { task, status: response.statusCode, detail })
      return failure(502, `大模型调用失败（HTTP ${response.statusCode}）${detail ? `：${detail}` : ''}`)
    }

    const choice = response.body && Array.isArray(response.body.choices) ? response.body.choices[0] : null
    const content = parseJSON(choice && choice.message ? choice.message.content : '')
    if (!content) {
      // 只记长度，不记原文：返回内容可能包含用户文章片段
      console.log('[llm] invalid json', { task, chars: String(response.raw || '').length })
      return failure(502, '大模型返回的内容不是合法 JSON')
    }

    console.log('[llm] ok', { task, ms: Date.now() - started, usage: response.body.usage || null })
    return success({
      content,
      usage: response.body.usage || null,
      model: response.body.model || model,
      ms: Date.now() - started
    })
  } catch (error) {
    const message = error && error.message ? error.message : ''
    if (message === 'TIMEOUT') {
      console.log('[llm] timeout', { task, ms: Date.now() - started })
      return failure(504, '大模型响应超时')
    }
    console.log('[llm] request error', { task, message })
    return failure(502, '大模型服务暂时不可用')
  }
}

// 例句共享缓存：一个词全平台只让模型写一次
const SENTENCE_COLLECTION = 'sentences'
let database = null
let collectionReady = false

function getDatabase() {
  if (!database) database = cloud.database()
  return database
}

// 集合第一次用时自动建，已存在会报错，忽略即可
async function ensureSentenceCollection() {
  if (collectionReady) return
  collectionReady = true
  try {
    await getDatabase().createCollection(SENTENCE_COLLECTION)
    console.log('[llm] sentence collection created')
  } catch (error) {}
}

function containsWord(sentence, word) {
  const text = String(sentence || '').toLowerCase()
  const target = String(word || '').toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  if (!target) return false
  return new RegExp(`(^|[^a-z])${target}($|[^a-z])`).test(text)
}

async function readSentenceCache(words) {
  const list = (words || []).map((word) => String(word || '').toLowerCase()).filter(Boolean)
  if (!list.length) return []
  await ensureSentenceCollection()
  try {
    const db = getDatabase()
    // _id 就是小写单词，直接走主键索引，不用再建二级索引
    const res = await db.collection(SENTENCE_COLLECTION)
      .where({ _id: db.command.in(list) })
      .field({ word: true, sentence: true, zh: true })
      .limit(100)
      .get()
    return res.data || []
  } catch (error) {
    console.log('[llm] sentence cache read failed', { message: error && error.message })
    return []
  }
}

// _id 直接用单词：重复写入会被数据库挡掉，天然去重；
// 老记录只有英文句子没有中文，用 update 补上
async function writeSentenceCache(rows) {
  if (!rows.length) return
  await ensureSentenceCollection()
  const db = getDatabase()
  const results = await Promise.all(rows.map((row) => {
    const word = String(row.word || '').toLowerCase()
    const data = { word, sentence: row.sentence, zh: row.zh, createdAt: Date.now() }
    return db.collection(SENTENCE_COLLECTION).add({ data: Object.assign({ _id: word }, data) })
      .catch(() => db.collection(SENTENCE_COLLECTION).doc(word).update({ data }).catch(() => null))
  }))
  console.log('[llm] sentence cache saved', { added: results.filter(Boolean).length, total: rows.length })
}

// 背诵例句任务：先查共享缓存，缺的才让模型写，写完存回数据库
async function sentencesTask(event, apiKey) {
  const items = sentenceItems(event)
  if (!items.length) return failure(400, 'items 不能为空')

  const stored = await readSentenceCache(items.map((item) => item.word))
  const known = {}
  stored.forEach((row) => {
    const word = String((row && row.word) || '').toLowerCase()
    const sentence = String((row && row.sentence) || '')
    const zh = String((row && row.zh) || '')
    // 老缓存只有英文，没有中文意思的一律当没写，重新生成一次
    if (word && sentence && zh) known[word] = { sentence, zh }
  })

  const missing = items.filter((item) => !known[String(item.word).toLowerCase()])
  if (!missing.length) {
    console.log('[llm] sentences all cached', { count: items.length })
    return success({
      content: {
        items: items.map((item) => {
          const entry = known[String(item.word).toLowerCase()]
          return { word: item.word, sentence: entry.sentence, zh: entry.zh }
        })
      },
      usage: null,
      model: 'cache',
      ms: 0,
      cached: true
    })
  }

  const composed = composeSentences({ items: missing })
  if (!composed.ok) return failure(400, composed.message)
  const result = await requestModel('sentences', composed.messages, TASKS.sentences, apiKey)
  if (result.code !== 0 || !result.data) return result

  const list = (result.data.content && Array.isArray(result.data.content.items))
    ? result.data.content.items
    : []
  const fresh = {}
  list.forEach((row) => {
    const word = String((row && row.word) || '').toLowerCase()
    const sentence = String((row && row.sentence) || '').replace(/\s+/g, ' ').trim()
    const zh = String((row && row.zh) || '').replace(/\s+/g, ' ').trim()
    if (!word || !sentence || !zh) return
    // 模型偶尔会把词变形，不合格的直接丢掉，前端会用兜底句
    if (!containsWord(sentence, word)) return
    fresh[word] = { sentence, zh }
  })
  await writeSentenceCache(items
    .filter((item) => fresh[String(item.word).toLowerCase()])
    .map((item) => {
      const entry = fresh[String(item.word).toLowerCase()]
      return { word: item.word, sentence: entry.sentence, zh: entry.zh }
    }))

  return success({
    content: {
      items: items.map((item) => {
        const key = String(item.word).toLowerCase()
        const entry = fresh[key] || known[key] || { sentence: '', zh: '' }
        return { word: item.word, sentence: entry.sentence, zh: entry.zh }
      })
    },
    usage: result.data.usage || null,
    model: result.data.model || '',
    ms: result.data.ms || 0,
    cached: false
  })
}

exports.main = async (event = {}) => {
  const task = typeof event.task === 'string' ? event.task : ''
  if (!Object.prototype.hasOwnProperty.call(TASKS, task)) return failure(400, '不支持的大模型任务')

  const apiKey = String(process.env.DEEPSEEK_API_KEY || '').trim()
  // 有 AI 资源包时不需要自建密钥；资源包不可用会自动回落到 DEEPSEEK_API_KEY
  if (!apiKey && !AI_PACK.enabled) return failure(503, '大模型未配置：请在云函数环境变量中设置 DEEPSEEK_API_KEY')

  // 例句先查全平台共享缓存，命中就完全不调模型
  if (task === 'sentences') return sentencesTask(event, apiKey)

  const composed = compose(task, event)
  if (!composed.ok) return failure(400, composed.message)

  // 选点阶段只需要输出句子清单，缩短等待时间；14 条清单加原文句子，
  // 800 的上限在长文章上会被截断，导致返回的 JSON 不完整
  const config = task === 'grammar' && event.stage === 'select'
    ? { maxTokens: 1600, timeout: 17000, temperature: 0.2 }
    : TASKS[task]
  return requestModel(task, composed.messages, config, apiKey)
}
