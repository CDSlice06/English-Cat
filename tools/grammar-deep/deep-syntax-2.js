// 语法深度讲解（第二组）：比较结构、强调、倒装与虚拟语气。
// 每条统一包含 definition / identify / usage / translate / trap / examples 六类信息。
// key 与小程序语法本中的语法点 key 一一对应。

module.exports = {
  "as-many-as": {
    "label": "as many / much … as 同级比较（含省略）",
    "definition": "as many/much + 名词 + as 表示两边数量一样多，用来把两个数量放在一起比较。",
    "identify": "句中先出现 as many 或 as much，后面再接一个 as；第二个 as 后常只剩名词或代词，被省掉的谓语要自己补回。",
    "usage": "结构为 as many + 可数名词复数 + as，或 as much + 不可数名词 + as。第二个 as 后面接比较对象；谓语与前文重复时可以省略，只留主语，如 as many books as he does。倍数词要放在第一个 as 前面，如 twice as many as。",
    "translate": "译成“和……一样多”“达到……的数量”。half as many as 译“是……的一半”，twice as many as 译“是……的两倍”。",
    "trap": {
      "wrong": "The company hired as many engineers than it did last year.",
      "right": "The company hired as many engineers as it did last year.",
      "note": "同级比较的第二部分只能用 as，不能换成 than；than 只能跟比较级搭配使用。"
    },
    "examples": [
      { "en": "She spends as much time on reading as her brother does.", "zh": "她花在阅读上的时间和她弟弟一样多。" },
      { "en": "We produced twice as many cars this year as we did in 2020.", "zh": "我们今年生产的汽车是 2020 年的两倍。" }
    ]
  },
  "the-more": {
    "label": "the more …, the more … 比较句式",
    "definition": "两个 the + 比较级前后呼应，前一句是条件，后一句是结果，表示一方变化引起另一方变化。",
    "identify": "句首或分句开头出现 the + 比较级，逗号后还有 the + 比较级，两半各有一套主谓，就是“越……越……”。",
    "usage": "公式：The + 比较级 + 主语 + 谓语, the + 比较级 + 主语 + 谓语。前一个 the 引条件，后一个 the 引结果，顺序不能颠倒。比较级可以带名词，如 the more books you read；谓语有时可省，如 the sooner, the better。",
    "translate": "译成“越……，就越……”。前半句用“越……”，后半句用“就越……”，中文习惯条件在前、结果在后。",
    "trap": {
      "wrong": "More you read, more you know.",
      "right": "The more you read, the more you know.",
      "note": "两个比较级前面都必须有 the，缺了 the 就不成这个句式，句子也读不通。"
    },
    "examples": [
      { "en": "The more carefully you plan, the fewer mistakes you will make.", "zh": "计划得越仔细，犯的错误就越少。" },
      { "en": "The longer the meeting lasted, the less attention people paid.", "zh": "会议开得越久，人们越不专心。" },
      { "en": "The more books you read, the wider your horizons become.", "zh": "你读的书越多，眼界就越宽。" }
    ]
  },
  "comparative-than": {
    "label": "比较级 + than 结构（含 than 后省略）",
    "definition": "用形容词或副词的比较级加 than，把两个对象放在一起比高低，than 后面是比较对象。",
    "identify": "看到 -er 或 more/less/fewer + 形容词，后面紧跟 than，就是比较级结构；than 后常只剩一个名词或代词。",
    "usage": "结构：A + 比较级 + than + B。短词加 -er，长词用 more + 原级，两者不能叠用。than 后重复的谓语可省略，只留比较对象，如 than his brother does。than 后接代词时口语常用宾格，正式写作可用主格。",
    "translate": "译成“比……更……”。less … than 译“不如……”，more than 常译“不止、超过”，not more than 译“不超过”。",
    "trap": {
      "wrong": "This method is much more better than the old one.",
      "right": "This method is much better than the old one.",
      "note": "more 和 -er 不能叠用，better 本身已经是比较级，前面不能再加 more，也不能加 most。"
    },
    "examples": [
      { "en": "The new policy proved far more effective than the previous one.", "zh": "新政策被证明比原来那条有效得多。" },
      { "en": "Fewer students failed the exam than the teacher had expected.", "zh": "考试不及格的学生比老师预想的少。" }
    ]
  },
  "comparative-substitute": {
    "label": "比较从句的替代（as / than + 主语 + do / did）",
    "definition": "比较从句里用 do/does/did 代替前面重复的动词，免得把同一个谓语写两遍。",
    "identify": "as 或 than 后面出现“主语 + do/did”，后面再没有别的动词，说明动词被替代了，要回到前半句找原动词。",
    "usage": "前半句是实义动词，后半句用 do/does/did 替代：She reads faster than I do。前半句有情态动词或 be 动词时，保留 can、will、is，如 than I can、than he is。时态跟着前半句走：过去用 did，现在用 do 或 does。",
    "translate": "译成“和……一样……”“比……更……”，替代的 do/did 不必译出，只要把比较对象说清楚。",
    "trap": {
      "wrong": "She reads faster than I am.",
      "right": "She reads faster than I do.",
      "note": "前半句谓语是实义动词 reads，替代词要用 do 的相应形式，不能用 be 动词。"
    },
    "examples": [
      { "en": "The company hired more workers this year than it did last year.", "zh": "这家公司今年招的工人比去年多。" },
      { "en": "He speaks English as fluently as his teacher does.", "zh": "他英语说得和他老师一样流利。" }
    ]
  },
  "as-as-comparison": {
    "label": "as … as 同级比较（形容词/副词原级）",
    "definition": "as + 形容词或副词原级 + as，表示两者在某一性质上程度相同，是最常见的同级比较。",
    "identify": "两个 as 成对出现，中间夹着形容词或副词，而且必须是原级；否定形式是 not as … as，中间同样用原级。",
    "usage": "结构：A + be 动词/实义动词 + as + 形容词/副词原级 + as + B。形容词原级作表语，副词原级修饰动词。not as … as 意为“不如……”。第二个 as 后重复的谓语可省略，只留比较对象。",
    "translate": "译成“和……一样……”，否定式译“不如……”。不要把它译成“不一样”，那是误解。",
    "trap": {
      "wrong": "This test is as harder as the last one.",
      "right": "This test is as hard as the last one.",
      "note": "as … as 中间必须用原级，比较级 harder 不能放进来，这是最常见的错误。"
    },
    "examples": [
      { "en": "The second test was as difficult as the first one.", "zh": "第二次考试和第一次一样难。" },
      { "en": "She finished the report as quickly as her colleague did.", "zh": "她完成报告的速度和同事一样快。" }
    ]
  },
  "not-so-much-as": {
    "label": "not so much A as B（与其说 A 不如说 B）",
    "definition": "not so much A as B 表示前后两项中后者才真正成立，前者只是表面的说法，重点在 B。",
    "identify": "句中同时出现 not so much 和 as，A、B 多为名词、形容词或短语，形成对照，重心落在 as 后面的 B 上。",
    "usage": "结构：not so much A as B，A 和 B 的形式要对等。意思为“与其说 A，不如说 B”，B 才是重点。不要与 not as much … as（数量不如）混淆：前者比性质，后者比数量，可看 as 前有没有 many/much 修饰名词。",
    "translate": "译成“与其说 A，不如说 B”。重点在后半句，翻译时把 B 说得更重。",
    "trap": {
      "wrong": "He is not so much a writer than a journalist.",
      "right": "He is not so much a writer as a journalist.",
      "note": "这个句式固定用 as 连接两项，换成 than 就变成比较级结构，意思也说不通。"
    },
    "examples": [
      { "en": "The failure was not so much a matter of money as of timing.", "zh": "这次失败与其说是钱的问题，不如说是时机的问题。" },
      { "en": "She was not so much angry as disappointed at the result.", "zh": "对这个结果，她与其说生气，不如说失望。" }
    ]
  },
  "comparative-degree": {
    "label": "比较级修饰与最高级（much / far / the most…）",
    "definition": "比较级前可用 much、far、a lot 等词加强程度，最高级前一般加 the，表示三者以上中的极点。",
    "identify": "比较级前出现 much、far、a lot、a little、even、still，或最高级前有 the、one of the，就是在加强程度或限定范围。",
    "usage": "修饰比较级只能用 much、far、a lot、a bit、a little、even、still，不能用 very。最高级前一般加 the，副词最高级可省 the。one of the + 最高级 + 复数名词表示“最……之一”。the + 比较级也可指两者中较……的那个。",
    "translate": "much、far + 比较级译“得多、远远”；最高级译“最……”；one of the 最高级译“最……之一”。",
    "trap": {
      "wrong": "This problem is very more difficult than that one.",
      "right": "This problem is much more difficult than that one.",
      "note": "very 不能修饰比较级，表示“难得多”要用 much 或 far，这是固定搭配，不能随意替换。"
    },
    "examples": [
      { "en": "The second half of the film is far more interesting than the first.", "zh": "影片后半部分比前半部分有趣得多。" },
      { "en": "She is one of the most experienced teachers in the school.", "zh": "她是学校里最有经验的老师之一。" }
    ]
  },
  "times-comparison": {
    "label": "倍数表达（three times as … as / the size of）",
    "definition": "用 twice、three times 等倍数词说明一方是另一方的几倍，常用于数据、规模和趋势。",
    "identify": "句中同时出现倍数词（twice、three times、double），又出现 as … as、the size/length of 或比较级，说明在比较两方的倍数关系。",
    "usage": "三种常用结构：倍数 + as + 原级 + as（three times as large as）；倍数 + the + size/length/weight + of（three times the size of）；倍数 + 比较级 + than（three times larger than）。都表示“是……的三倍”，不是“大三倍”。第三种含义有争议，写作时前两种最清楚。",
    "translate": "译成“是……的几倍”。twice 译“两倍”，three times 译“三倍”，不要译成“多了几倍”。",
    "trap": {
      "wrong": "The new hall is three times as larger as the old one.",
      "right": "The new hall is three times as large as the old one.",
      "note": "as … as 中间要用原级，large 不能写成比较级 larger，倍数词应放在最前面。"
    },
    "examples": [
      { "en": "The new bridge is three times as long as the old one.", "zh": "新桥的长度是旧桥的三倍。" },
      { "en": "Their output is now four times the level of ten years ago.", "zh": "他们现在的产量是十年前的四倍。" }
    ]
  },
  "compared-with": {
    "label": "compared with / compared to 比较短语",
    "definition": "compared with 或 compared to 是过去分词短语，放在句首或句尾，用来引出被比较的另一方。",
    "identify": "句首或句末出现 compared with、compared to、in comparison with，后面接名词，前面是主句，中间用逗号隔开，就是比较短语。",
    "usage": "compared with 与 compared to 现代英语基本通用，都表示“与……相比”。它修饰整个句子，逻辑主语要和主句主语一致，否则成悬垂结构。放句首时后面加逗号。不要与主动形式的 comparing 混用。",
    "translate": "译成“与……相比”“比起……来”。中文通常把这个短语放在句首。",
    "trap": {
      "wrong": "Comparing with last year, sales have risen sharply.",
      "right": "Compared with last year, sales have risen sharply.",
      "note": "销售额是被比较的对象，要用过去分词 compared 表示被动，不能用主动的 comparing。"
    },
    "examples": [
      { "en": "Compared with last year, the number of applicants has doubled.", "zh": "与去年相比，申请人数翻了一番。" },
      { "en": "The cost of living here is still low compared to other cities.", "zh": "与其它城市相比，这里的生活成本仍然较低。" }
    ]
  },
  "comparative-separated": {
    "label": "被介词短语隔开的比较（less important for A than for B）",
    "definition": "比较级和 than 之间插入介词短语等成分，两个比较对象分别跟在同一个介词后面。",
    "identify": "看到比较级后先出现一个介词短语，之后才出现 than，且 than 后重复同一介词，说明比较对象被隔开了。",
    "usage": "结构：比较级 + 介词短语 + than + 同一介词 + 另一对象。理解时先把介词短语分别挂到两边：less important for A than for B 意为“对 A 来说不如对 B 重要”。than 后不能漏掉介词，否则比较对象不清楚。",
    "translate": "译成“对 A 来说不如对 B……”。中文要把两个对象各自跟介词的搭配说清楚，不要合成一句模糊的话。",
    "trap": {
      "wrong": "The rule is less important for adults than children.",
      "right": "The rule is less important for adults than for children.",
      "note": "than 后面要重复介词 for，否则 children 会被读成与 adults 并列，比较对象就乱了。"
    },
    "examples": [
      { "en": "The change is more significant for small firms than for large ones.", "zh": "这一变化对小公司来说比对大公司更重要。" },
      { "en": "This skill is less useful for beginners than for advanced learners.", "zh": "这项技能对初学者不如对进阶学习者有用。" }
    ]
  },
  "cleft": {
    "label": "强调句 It is … that …",
    "definition": "用 It is 或 It was … that … 把句中某一成分提到前面加以突出，其余部分保持原序。",
    "identify": "句首是 It is 或 It was，后面接一个名词、时间或地点，再有 that/who，去掉这两部分后剩下的仍是完整句子。",
    "usage": "判断方法：去掉 It is/was 和 that，剩下部分能独立成句就是强调句；不能成句则可能是主语从句或定语从句。强调人时 that 可换成 who，强调其他成分一律用 that。被强调部分作主语时，that 后的谓语与它保持一致。",
    "translate": "译成“正是……才……”“是……的”。中文常用“正是、就是”把重点提出来，不要译成“它是……的”。",
    "trap": {
      "wrong": "It was in 2019 when the company was founded.",
      "right": "It was in 2019 that the company was founded.",
      "note": "强调时间状语时连接词仍用 that，不能因为指时间就换成 when，这是强调句的固定形式。"
    },
    "examples": [
      { "en": "It was his attitude that impressed the interviewer most.", "zh": "最打动面试官的是他的态度。" },
      { "en": "It is through practice that skills are gradually built.", "zh": "技能正是通过练习逐步建立起来的。" }
    ]
  },
  "inversion": {
    "label": "部分倒装（否定词 / only 置于句首）",
    "definition": "否定词或 only + 状语放到句首时，只把助动词、情态动词或 be 提到主语前，实义动词不动。",
    "identify": "句首出现 never、seldom、hardly、not until、no sooner、only + 状语等，后面是“助动词 + 主语 + 动词”，就是部分倒装。",
    "usage": "部分倒装只提前助动词：Never have I seen it；Only then did he realize it。原句没有助动词时补 do/does/did，实义动词位置不变。hardly … when 与 no sooner … than 中，主句用过去完成时，从句用一般过去时。only 修饰主语时不倒装。",
    "translate": "按正常语序理解，译成“直到……才”“一……就……”“只有……才……”。倒装本身不改变意思。",
    "trap": {
      "wrong": "Never I have seen such a convincing argument.",
      "right": "Never have I seen such a convincing argument.",
      "note": "否定词置于句首必须部分倒装，助动词 have 要提到主语 I 前面，实义动词 seen 留在原位。"
    },
    "examples": [
      { "en": "Seldom does the manager change his mind once a decision is made.", "zh": "一旦做出决定，经理很少改变主意。" },
      { "en": "Hardly had the meeting begun when the power went out.", "zh": "会议刚开始，电就停了。" }
    ]
  },
  "so-neither-inversion": {
    "label": "so / neither 倒装（So did he）",
    "definition": "so 或 neither/nor 放句首表示“也是如此”或“也不如此”，后面用倒装，助动词与前句一致。",
    "identify": "逗号后出现 and so + 助动词 + 主语，或 and neither/nor + 助动词 + 主语，说明在回应前一句的肯定或否定。",
    "usage": "前句肯定，用 so + 助动词 + 主语；前句否定，用 neither 或 nor + 助动词 + 主语。助动词要与前句时态、情态一致：likes 用 does，can 用 can，has 用 has。主语必须换成新的名词或代词，不能重复原主语。",
    "translate": "译成“……也是这样”“……也不……”。neither 不要译成“两者都不”，so 也不要译成“所以”。",
    "trap": {
      "wrong": "She enjoyed the lecture, and so her classmates did.",
      "right": "She enjoyed the lecture, and so did her classmates.",
      "note": "so 置于句首要倒装，助动词 did 应放在主语 her classmates 之前，不能按陈述语序写。"
    },
    "examples": [
      { "en": "He cannot attend the meeting, and neither can I.", "zh": "他不能参加这个会议，我也不能。" },
      { "en": "They finished the project ahead of time, and so did we.", "zh": "他们提前完成了项目，我们也一样。" }
    ]
  },
  "emphatic-do": {
    "label": "do / does / did + 动词原形（强调）",
    "definition": "在动词原形前加 do/does/did 来强调肯定语气，意为“确实、的确”，时态和数由 do 体现。",
    "identify": "句中 do/does/did 后面紧跟动词原形，且这个 do 既不是实义动词也不是替代词，就是在起强调作用。",
    "usage": "结构：do/does/did + 动词原形。现在时第三人称单数用 does，其余用 do，过去时用 did。后面的动词一律用原形，不再变人称或时态。强调用法常见于肯定句和祈使句（Do come in!），也可用在疑问句中。",
    "translate": "译成“确实……”“的确……”“一定要……”。中文用副词加重语气，不必把 do 单独译出来。",
    "trap": {
      "wrong": "She does likes classical music.",
      "right": "She does like classical music.",
      "note": "强调用的 does 后面动词必须用原形，不能再加 -s，时态已经由 does 承担。"
    },
    "examples": [
      { "en": "I do believe this policy will benefit ordinary families.", "zh": "我确实相信这项政策会让普通家庭受益。" },
      { "en": "He did warn us about the risk, but nobody listened.", "zh": "他确实提醒过我们有风险，但没人听。" }
    ]
  },
  "full-inversion": {
    "label": "完全倒装（Here comes… / On the table lies…）",
    "definition": "把整个谓语动词放到主语前面叫完全倒装，多见于 here、there 或方位短语开头的句子。",
    "identify": "句首是 here、there、now、then 或表示方位的介词短语，后面直接跟动词，主语出现在动词之后，形成“状语 + 动词 + 主语”的顺序。",
    "usage": "结构：地点或方向状语 + 谓语动词 + 主语。谓语多为 come、go、lie、stand、sit、be 等不及物动词。主语是名词时倒装，主语是代词时不倒装：Here comes the bus，但 Here it comes。这类句子多用一般现在时。",
    "translate": "译成“……来了”“……位于……”“……坐着……”。中文按正常语序说，不必保留倒装形式。",
    "trap": {
      "wrong": "Here comes he.",
      "right": "Here he comes.",
      "note": "主语是代词时不倒装，代词 he 要放在动词 comes 前面，名词主语才后置。"
    },
    "examples": [
      { "en": "On the top of the hill stands an old temple.", "zh": "山顶上矗立着一座古庙。" },
      { "en": "Here comes the train we have been waiting for.", "zh": "我们一直在等的那趟火车来了。" }
    ]
  },
  "not-until": {
    "label": "not … until 直到……才",
    "definition": "not … until 表示某个动作到 until 所指的时间才发生，在那之前一直没有发生。",
    "identify": "句中出现 not 或 never 与 until 搭配，until 后接时间点或从句，主句动作要到该时间之后才发生，之前一直没有发生。",
    "usage": "结构：主语 + not + 谓语 + until + 时间。谓语是短暂动词时用一般过去时；强调“到那时才完成”可用过去完成时。It was not until … that … 是强调形式，that 后接正常语序；Not until 置于句首时主句部分倒装。",
    "translate": "译成“直到……才……”。中文一定要有“才”，否则意思会变成“直到……都没有”。",
    "trap": {
      "wrong": "Not until midnight he finished the essay.",
      "right": "Not until midnight did he finish the essay.",
      "note": "Not until 置于句首时，主句必须部分倒装，要补出助动词 did，实义动词用原形。"
    },
    "examples": [
      { "en": "I did not understand the rule until the teacher explained it.", "zh": "直到老师讲解，我才弄懂这条规则。" },
      { "en": "It was not until 2019 that the two sides reached an agreement.", "zh": "直到 2019 年双方才达成协议。" }
    ]
  },
  "subjunctive-inversion": {
    "label": "虚拟语气倒装（Were I … / Had I …）",
    "definition": "虚拟条件句省略 if 时，把 were、had、should 提到主语前面形成倒装，意思不变。",
    "identify": "句首直接是 Were I、Had he、Should it 等，后面没有 if，但整句仍在表达假设条件，就是虚拟语气倒装，多见于书面语。",
    "usage": "规则：if 从句含 were、had、should 时，可去掉 if，把它们提到主语前：Were I you = If I were you；Had I known = If I had known；Should it rain = If it should rain。主句结构保持不变。从句谓语是其他实义动词的过去式时不能这样倒装。",
    "translate": "译成“如果……”“要是……”。倒装不改变意思，补回 if 再理解最稳妥。",
    "trap": {
      "wrong": "Was I you, I would accept the offer.",
      "right": "Were I you, I would accept the offer.",
      "note": "虚拟条件句的 be 动词一律用 were，倒装之后同样不能用 was，这是固定规则。"
    },
    "examples": [
      { "en": "Had I known the deadline, I would have started earlier.", "zh": "要是我知道截止日期，就会早点开始。" },
      { "en": "Were the plan approved, construction would begin next spring.", "zh": "如果方案获批，工程明年春天就会开工。" }
    ]
  },
  "only-inversion": {
    "label": "Only + 介词短语 / 从句置于句首的部分倒装",
    "definition": "only 加介词短语或状语从句放在句首时，主句要把助动词提到主语前，形成部分倒装。",
    "identify": "句首是 Only + 介词短语、副词或从句，逗号后出现“助动词 + 主语 + 动词”，说明主句已经倒装。",
    "usage": "结构：Only + 状语 + 助动词 + 主语 + 动词。only 修饰状语（by doing、then、when 从句）时主句倒装；only 修饰主语时不倒装，如 Only he knows the answer。原句没有助动词时要补 do/does/did，不能保留陈述语序。",
    "translate": "译成“只有……才……”。only 引出的部分译成“只有”，主句译成“才”，语气要加重。",
    "trap": {
      "wrong": "Only by practicing every day you can improve your pronunciation.",
      "right": "Only by practicing every day can you improve your pronunciation.",
      "note": "Only + 介词短语置于句首，主句要部分倒装，情态动词 can 提到主语前。"
    },
    "examples": [
      { "en": "Only when the data were rechecked did the error appear.", "zh": "只有重新核对数据时，这个错误才显现出来。" },
      { "en": "Only in this way can we solve the problem quickly.", "zh": "只有用这种方法，我们才能迅速解决问题。" }
    ]
  },
  "wish-ifonly": {
    "label": "wish / if only / would rather 的虚拟表达",
    "definition": "这三个词后面接不同时态，用来表达对现在或过去的遗憾，以及“宁愿”的愿望。",
    "identify": "句中见到 wish、if only 或 would rather，后面动词不是正常时态，而是过去式或过去完成式，就是虚拟语气。",
    "usage": "wish / if only + 过去式（be 用 were）表示与现在相反；+ had done 表示对过去的遗憾；+ would do 表示希望将来改变。would rather + 过去式表示现在或将来的宁愿；+ had done 表示对过去的宁愿。这些形式都不随人称变化。",
    "translate": "wish 和 if only 译“真希望……”“要是……就好了”；would rather 译“宁愿……”。",
    "trap": {
      "wrong": "I wish I have more time to read.",
      "right": "I wish I had more time to read.",
      "note": "wish 后表示与现在事实相反，要用过去式 had，不能用现在时 have，也没有 will 的说法。"
    },
    "examples": [
      { "en": "If only we had started the project earlier.", "zh": "要是我们早点开始这个项目就好了。" },
      { "en": "I would rather you told me the truth directly.", "zh": "我宁愿你直接告诉我真相。" },
      { "en": "She wishes she could speak French as fluently as her sister.", "zh": "她希望自己法语能说得和姐姐一样流利。" }
    ]
  },
  "subjunctive": {
    "label": "虚拟语气（与事实相反 / 建议要求）",
    "definition": "虚拟语气用特别的动词形式表达与事实相反的情况，或表示建议、要求、命令。",
    "identify": "if 从句里用 were、had done、would have done，或 suggest、demand、essential 后接 (should) + 动词原形，都是虚拟语气的信号，要特别注意动词形式。",
    "usage": "与现在相反：if + 过去式（be 用 were），主句用 would/could + 动词原形。与过去相反：if + had done，主句用 would have done。表示建议、要求、命令的词（suggest、insist、demand、It is necessary that）后，从句用 (should) + 动词原形，should 可省。",
    "translate": "译成“如果……就……”“本来会……”“应该……”。与事实相反的要靠“本来、要是”点明。",
    "trap": {
      "wrong": "If I was you, I would take the job.",
      "right": "If I were you, I would take the job.",
      "note": "虚拟条件句中 be 动词一律用 were，if I were you 是固定说法，口语里也很少用 was。"
    },
    "examples": [
      { "en": "If the team had prepared better, it would have won the match.", "zh": "如果球队准备得更充分，本会赢下这场比赛。" },
      { "en": "The doctor insisted that the patient stay in bed for a week.", "zh": "医生坚持让病人卧床一周。" }
    ]
  },
  "but-for": {
    "label": "But for / Without 含蓄虚拟条件",
    "definition": "but for 和 without 用介词短语代替 if 从句，表示“要不是……”，主句用虚拟形式。",
    "identify": "句首出现 But for 或 Without + 名词，后面主句有 would/could/might have done 或 would do，就是含蓄的虚拟条件，主句不用 if 从句。",
    "usage": "but for = without = 要不是、如果没有。指现在或将来，主句用 would/could + 动词原形；指过去，主句用 would/could have done。介词后面只接名词或动名词，不能接完整句子。but for 多用于书面语。",
    "translate": "译成“要不是……”“如果没有……”。主句的“就……”要译出来，语气是假设。",
    "trap": {
      "wrong": "But for you helped me, I would have failed.",
      "right": "But for your help, I would have failed.",
      "note": "but for 是介词短语，后面只能接名词或动名词，不能像 if 那样接完整的句子。"
    },
    "examples": [
      { "en": "But for the timely warning, the accident would have been worse.", "zh": "要不是那场及时的预警，事故会更严重。" },
      { "en": "Without sufficient funding, the research would stop next year.", "zh": "如果没有足够的资金，这项研究明年就会停止。" }
    ]
  },
  "otherwise-subjunctive": {
    "label": "otherwise / or else + 虚拟语气（否则……）",
    "definition": "otherwise 或 or else 引出与前面事实相反的结果，相当于“否则就……”，后面用虚拟形式。",
    "identify": "前半句陈述事实，后半句以 otherwise、or、or else 开头，谓语是 would do 或 would have done，说明这是与事实相反的结果。",
    "usage": "前句为真实情况，otherwise 后接虚拟结果：与过去相反用 would have done，与现在相反用 would do。or 和 or else 也表示“否则”，语气更口语。otherwise 前通常有逗号；放句首时也可能表示“在其他方面”。",
    "translate": "译成“否则……”“不然就……”。中文用“否则、要不然”引出结果，虚拟语气不必另外标出。",
    "trap": {
      "wrong": "I was busy yesterday; otherwise I would attend the meeting.",
      "right": "I was busy yesterday; otherwise I would have attended the meeting.",
      "note": "前句说的是过去的事实，otherwise 后的结果要用 would have done，不能用 would do，时态要跟事实对齐。"
    },
    "examples": [
      { "en": "The road was blocked; otherwise we would have arrived on time.", "zh": "路被堵住了，否则我们会准时到达。" },
      { "en": "You should take notes, or else you will forget the details.", "zh": "你应该记笔记，否则会忘掉细节。" }
    ]
  }
};
