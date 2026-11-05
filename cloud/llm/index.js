// 大模型统一出口：只走 Node 原生 https，不引入任何 SDK
// 密钥只从云函数环境变量读取，绝不下发到小程序端
const cloud = require('wx-server-sdk')
const https = require('https')
const http = require('http')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const DEFAULT_BASE = 'https://api.deepseek.com'
const DEFAULT_MODEL = 'deepseek-chat'
const MAX_TEXT = 9000

// 每个任务单独限制输出长度与超时：分析类任务输出多、判分类任务只要几十个字
const TASKS = {
  // 讲解新增分步理解与分块翻译，单点输出更长，上限相应提高
  grammar: { maxTokens: 3200, timeout: 33000, temperature: 0.3 },
  // 每词最多 3 条义项，14 个词需要更长的输出上限
  words: { maxTokens: 1400, timeout: 32000, temperature: 0.2 },
  phrases: { maxTokens: 700, timeout: 32000, temperature: 0.2 },
  // 全文对照：每批 8 句，输出约 300-500 字中文
  translate: { maxTokens: 1600, timeout: 32000, temperature: 0.2 },
  judge: { maxTokens: 360, timeout: 13000, temperature: 0.1 },
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
    '输出 JSON：{"points":[{"id":"p1","pattern":"...","evidence":"...","structure":"...","understanding":"...","steps":[{"title":"...","detail":"..."}],"translation":"...","chunks":[{"en":"...","zh":"..."}],"usageTip":"...","examples":[{"en":"...","zh":"..."}],"practice":[{"en":"...","zh":"..."},{"en":"...","zh":"..."}],"en2zhHint":"...","zh2enHint":"..."}]}',
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
    '10. practice：为该语法点新造 2 组练习句，每组 {"en":"...","zh":"..."}。en 必须是你自己新写的英文句子（8-18 词），要明显体现该语法结构；禁止照抄、改写或拼接文章里的任何句子，也不能与 examples 重复；两组之间也不能重复；zh 是自然中文翻译。',
    '11. en2zhHint / zh2enHint：分别给英译汉、汉译英的提示，不超过 30 字，要针对 practice 里的新句子，不能写「先认出某结构」这类通用套话，两题提示不能雷同。',
    '12. note 是以前讲过的同类语法点记录，只用来保持术语和讲解口径一致，不能照抄，也不能用旧句子的内容代替本句分析。',
    '13. 所有讲解用中文；英文例句语法必须正确。',
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
    '1. senses 给 1-3 条，按书面语常用度从高到低排序，第一条是阅读里最可能用到的义项。',
    '2. 只保留书面英语和正式语境常用的义项；口语、俚语、地区性用法、冷僻义一律剔除（例如 crack 的「第一流的」是英式口语，不能给；「啪地一声」这类拟声义也不要）。',
    '3. 同一词性的近义义项合并成一条，用「；」分隔；不要把一个词性拆成好几条。',
    '4. pos 只能是 n. / v. / adj. / adv. / prep. / conj. / pron. / num. / phr. 之一。',
    '5. cn 是纯中文释义，不超过 20 字，不带词性前缀，不能包含英文单词，无法用中文解释的词就不要返回。',
    '6. rare 为 true 表示本文句子里用的是熟词生义（常见词的生僻义）；普通词返回 false。',
    '7. ph 是该词的国际音标（不带斜杠），可选；不确定就返回空字符串。',
    '8. 最多返回 14 个词：meaning 为空的词必须全部返回；其余词也要按上面的标准重新筛选排序，不要照抄词典顺序。',
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
  const mode = event.mode === 'en2zh' ? '英译汉' : '汉译英'
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
    '请判断学生答案能否通过：意思完整、结构正确、允许同义表达，不要求与参考译文逐字一致。',
    '输出 JSON：{"pass":true,"rule":"","feedback":"..."}',
    '要求：',
    '1. pass 只能是布尔值。',
    '2. 通过时 rule 为空字符串，feedback 用一句中文肯定，不超过 40 字。',
    '3. 不通过时 feedback 用一句中文指出问题类型，不超过 60 字，绝对不能出现参考答案里的具体单词、正确译文或缺失词列表，避免学生直接照抄。',
    '4. 汉译英不通过时，rule 只能取：incomplete, tail, clause, clause-predicate, clause-subject, subjectOrder, subjectGap, tense, modal, agreement, determiner, quantity, inversion, soThat, order, info。',
    '5. 英译汉不通过时，rule 为空字符串。',
    '6. 出现明显语法错误（时态、主谓一致、缺冠词、语序、引导词叠加、结构残缺）一律判不通过，即使关键词都写了。'
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
  const sentences = (Array.isArray(event.sentences) ? event.sentences : [])
    .slice(0, 12)
    .map((item) => clean(item, 400))
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

  return { ok: true, messages: [{ role: 'system', content: PARSE_SYSTEM }, { role: 'user', content: user }] }
}

function compose(task, event) {
  if (task === 'grammar') return composeGrammar(event)
  if (task === 'words') return composeWords(event)
  if (task === 'phrases') return composePhrases(event)
  if (task === 'translate') return composeTranslate(event)
  if (task === 'judge') return composeJudge(event)
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

exports.main = async (event = {}) => {
  const task = typeof event.task === 'string' ? event.task : ''
  if (!Object.prototype.hasOwnProperty.call(TASKS, task)) return failure(400, '不支持的大模型任务')

  const apiKey = String(process.env.DEEPSEEK_API_KEY || '').trim()
  if (!apiKey) return failure(503, '大模型未配置：请在云函数环境变量中设置 DEEPSEEK_API_KEY')

  const composed = compose(task, event)
  if (!composed.ok) return failure(400, composed.message)

  // 选点阶段只需要输出句子清单，缩短等待时间
  const config = task === 'grammar' && event.stage === 'select'
    ? { maxTokens: 800, timeout: 17000, temperature: 0.2 }
    : TASKS[task]
  const model = String(process.env.DEEPSEEK_MODEL || DEFAULT_MODEL).trim() || DEFAULT_MODEL
  const base = String(process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE).trim() || DEFAULT_BASE
  const started = Date.now()

  try {
    const response = await postJSON(base, apiKey, {
      model,
      messages: composed.messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stream: false,
      response_format: { type: 'json_object' }
    }, config.timeout)

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
