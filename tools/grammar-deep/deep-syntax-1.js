// 语法与句式本 · 深度讲解（第一批）
// 每条统一包含 label / definition / identify / usage / translate / trap / examples

module.exports = {
  "relative-clause": {
    "label": "限制性定语从句（that / which / who）",
    "definition": "紧跟在名词后面、用来限定这个名词是哪一个的从句，删掉后句子意思会不完整。",
    "identify": "找到先行词（被修饰的名词），看它后面是否直接跟 that / which / who，且从句里缺主语或宾语；从句前没有逗号。",
    "usage": "结构：先行词 + that/which/who + 不完整从句。指物用 that 或 which，指人用 who，that 也可指人。判断：从句缺主语或宾语才用关系代词，缺状语用 where/when/why；介词后不能用 that。",
    "translate": "译成“……的……”放在名词前；从句太长时拆成两个分句，用“这个/他/它”承接。",
    "trap": {
      "wrong": "The book which I bought it yesterday is very useful.",
      "right": "The book which I bought yesterday is very useful.",
      "note": "关系代词 which 已在从句里作 bought 的宾语，不能再加 it，否则宾语重复。"
    },
    "examples": [
      { "en": "The scientist who discovered the vaccine received a major award.", "zh": "发现这种疫苗的科学家获得了一项重要奖项。" },
      { "en": "This is the method that the team has used for years.", "zh": "这就是团队用了多年的方法。" },
      { "en": "Students who read widely tend to write more clearly.", "zh": "阅读广泛的学生往往写得更清楚。" }
    ]
  },

  "non-restrictive": {
    "label": "非限制性定语从句（, which / who …）",
    "definition": "用逗号隔开的补充说明从句，删掉后主句仍然完整通顺，只起附加信息作用。",
    "identify": "名词或整句后面先有逗号，再用 which / who / whom / whose 引导；不能用 that，也不能写成逗号加 that。",
    "usage": "结构：主句, + which/who + 补充说明。which 可指前面的名词，也可指整个主句（此时译“这一点”）；who 指人。从句只是附加信息，不能缩小先行词范围。翻译时一般另起一句。",
    "translate": "拆成两个短句：“……，这……”“……，他/它……”；指代整句时用“这一点/此事”。",
    "trap": {
      "wrong": "He missed the train, that made him late for work.",
      "right": "He missed the train, which made him late for work.",
      "note": "非限制性定语从句不能用 that；指代前面整句时只能用 which。"
    },
    "examples": [
      { "en": "The project, which took three years, finally won national recognition.", "zh": "这个项目耗时三年，最终获得了国家级的认可。" },
      { "en": "My mentor, who retired last month, still answers my emails.", "zh": "我的导师上个月退休了，但他仍然回复我的邮件。" },
      { "en": "The company cut prices, which helped it win new customers.", "zh": "这家公司降低了价格，这帮助它赢得了新客户。" }
    ]
  },

  "relative-whose": {
    "label": "whose / of which 所属定语从句",
    "definition": "表示“谁的、它的”的定语从句，whose 后面直接跟名词，用来说明所属关系。",
    "identify": "先行词后出现 whose + 名词，或“the + 名词 + of which / of whom”结构；whose 可指人也可指物。",
    "usage": "结构：先行词 + whose + 名词 + 从句。指物也可写成 the + 名词 + of which，如 the door of which。whose 在从句里作定语，后面必须紧跟名词，不能单独使用。",
    "translate": "译成“……的……”：whose car 就是“他的车”；of which 结构同样译“的”，语序按中文调整。",
    "trap": {
      "wrong": "The student whose his father is a doctor wants to study medicine.",
      "right": "The student whose father is a doctor wants to study medicine.",
      "note": "whose 本身已含“他的”，后面不能再加 his，否则所属重复。"
    },
    "examples": [
      { "en": "She lives in a house whose windows face the sea.", "zh": "她住在一所窗户朝海的房子里。" },
      { "en": "The company, whose profits had fallen, decided to restructure.", "zh": "这家公司利润下滑，决定进行重组。" },
      { "en": "This is a theory of which the origin remains unclear.", "zh": "这是一个起源仍不清楚的理论。" }
    ]
  },

  "relative-adverb": {
    "label": "where / when / why 关系副词定语从句",
    "definition": "用 where、when、why 引导的定语从句，它们在从句里代替“介词 + 名词”，只作状语。",
    "identify": "先行词是地点（place/city）、时间（day/time）或原因（reason），且从句成分完整、只缺状语时，才用关系副词。",
    "usage": "where = in/at which，when = in/on which，why = for which。判断：从句缺主语或宾语用 which/that，缺状语才用关系副词。先行词是地点名词不一定就用 where，关键看从句缺什么成分。",
    "translate": "译成“在那里/在那时/原因”等，通常把从句译到名词前作定语，或另起一句。",
    "trap": {
      "wrong": "This is the city where I visited last year.",
      "right": "This is the city that I visited last year.",
      "note": "visited 缺宾语，应用 which/that；where 只能代替状语，不能作宾语。"
    },
    "examples": [
      { "en": "The village where she grew up has changed beyond recognition.", "zh": "她长大的那个村庄已经变得认不出来了。" },
      { "en": "I still remember the day when we first met.", "zh": "我仍然记得我们初次见面的那一天。" },
      { "en": "Nobody knows the reason why the plan was abandoned.", "zh": "没有人知道这个计划被放弃的原因。" }
    ]
  },

  "relative-who": {
    "label": "who / whom 定语从句（修饰人或人群）",
    "definition": "先行词是人时使用的定语从句关系词，who 在从句中作主语，whom 作宾语。",
    "identify": "先行词是 person、people、students 等指人的名词，后面紧跟 who 或 whom，且从句缺主语或宾语。",
    "usage": "who 在从句中作主语，whom 作宾语（口语常用 who 代替）；介词后面只能用 whom，如 to whom。whose 表所属，who 不能直接放在介词后。判断：把从句还原成独立句，看关系词充当什么成分。",
    "translate": "译成“……的（人）”，放在名词前；从句长时拆句，用“他/他们”承接。",
    "trap": {
      "wrong": "The professor which teaches us history is very strict.",
      "right": "The professor who teaches us history is very strict.",
      "note": "先行词 professor 指人，关系代词要用 who 或 that，不能用 which。"
    },
    "examples": [
      { "en": "The doctor who treated her explained the risks carefully.", "zh": "为她治疗的医生仔细解释了风险。" },
      { "en": "The candidates whom we interviewed all had strong backgrounds.", "zh": "我们面试过的候选人都很有背景。" },
      { "en": "She is the colleague to whom I owe the most.", "zh": "她是我最应该感谢的同事。" }
    ]
  },

  "where-clause": {
    "label": "where 引导的从句（地点状语 / 定语从句）",
    "definition": "where 可引导地点状语从句、定语从句，也可引导名词性从句，意思和功能随位置而变。",
    "identify": "看 where 前有没有先行词：有地点名词是定语从句；没有先行词、直接修饰主句动词是状语从句；放在 know 等动词后是宾语从句。",
    "usage": "定语从句：the house where I live；状语从句：Sit where you like；名词性从句：I don't know where he lives。判断看有无先行词和从句缺什么成分。",
    "translate": "定语从句译“……的（地方）”；状语从句译“在……的地方”；名词性从句译“在哪里”，并按陈述句调整语序。",
    "trap": {
      "wrong": "I don't know where does he live.",
      "right": "I don't know where he lives.",
      "note": "where 引导宾语从句时用陈述语序，不能保留疑问句的倒装。"
    },
    "examples": [
      { "en": "Where there is demand, new businesses soon appear.", "zh": "哪里有需求，新的生意很快就会出现在哪里。" },
      { "en": "This is the office where the interviews take place.", "zh": "这就是进行面试的办公室。" },
      { "en": "She asked me where I had bought the dictionary.", "zh": "她问我这本词典是在哪里买的。" }
    ]
  },

  "as-relative": {
    "label": "as 引导定语从句（such / the same / as is known）",
    "definition": "as 引导的定语从句，指代前面整句或 such、the same 修饰的名词，位置比较灵活。",
    "identify": "常见信号：such … as、the same … as、as is known、as we all know，as 后面跟一个从句。",
    "usage": "such + 名词 + as 表示“像……这样的”；the same + 名词 + as 表示“和……同类的”（用 that 指同一个）。as 指代整句时可放句首：As is known to all, …。",
    "translate": "译成“正如……”“像……这样的”；指代整句时译“这一点/这种情况”，常放句首。",
    "trap": {
      "wrong": "As is known to all, that the earth moves around the sun.",
      "right": "As is known to all, the earth moves around the sun.",
      "note": "as 已引导从句并作主语，后面不能再加 that，也不能只剩一个名词短语。"
    },
    "examples": [
      { "en": "As is often the case, the simplest solution worked best.", "zh": "正如常见的情况那样，最简单的方案效果最好。" },
      { "en": "Such books as you mentioned are hard to find now.", "zh": "你提到的那类书现在很难找到。" },
      { "en": "He uses the same dictionary as I do.", "zh": "他用的词典和我的一样。" }
    ]
  },

  "prep-which": {
    "label": "介词 + which / whom 引导定语从句",
    "definition": "把介词提到关系词前面的定语从句，介词由从句中动词或形容词的搭配决定。",
    "identify": "看到 which / whom 前面直接有介词（in、on、by、with、to、for 等），且前面有先行词或逗号，就是这种结构。",
    "usage": "结构：先行词 + 介词 + which/whom + 从句。还原时把介词放回从句末尾：the method by which = by the method。介词看搭配，如 depend on；指人只能用 whom。",
    "translate": "译成“……的……”，把介词含义（通过、凭借、关于、在……中）译出来，不必保留英文语序。",
    "trap": {
      "wrong": "The tool with that he fixed the car is missing.",
      "right": "The tool with which he fixed the car is missing.",
      "note": "介词后面不能用 that；指物用 which，指人用 whom。"
    },
    "examples": [
      { "en": "The rate at which the population grows has slowed down.", "zh": "人口增长的速度已经放缓。" },
      { "en": "These are the principles on which the design is based.", "zh": "这些就是该设计所依据的原则。" },
      { "en": "The colleague to whom I spoke was extremely helpful.", "zh": "和我交谈的那位同事非常乐于助人。" }
    ]
  },

  "noun-clause": {
    "label": "名词性从句（what / whether / that 引导）",
    "definition": "在句中充当主语、宾语、表语或同位语的从句，整体相当于一个名词。",
    "identify": "从句出现在动词后、句首、be 动词后或抽象名词后，且由 what / whether / that 引导；从句一律用陈述语序。",
    "usage": "what 在从句中作主语或宾语，意为“……的东西”；whether 意为“是否”，不作成分；that 只连接、不译、不作成分。判断：从句缺成分用 what，不缺成分且表“是否”用 whether，不缺成分且为陈述用 that。",
    "translate": "what 译“……的（东西/事）”；whether 译“是否”；that 不译，直接按陈述句译。",
    "trap": {
      "wrong": "That he said at the meeting surprised everyone.",
      "right": "What he said at the meeting surprised everyone.",
      "note": "said 缺宾语，应用 what；that 不作成分，不能充当宾语。"
    },
    "examples": [
      { "en": "What she needs most is a quiet place to study.", "zh": "她最需要的是一个安静的学习场所。" },
      { "en": "I doubt whether the plan can be completed on time.", "zh": "我怀疑这个计划能否按时完成。" },
      { "en": "That he passed the exam surprised no one.", "zh": "他通过考试没有人感到意外。" }
    ]
  },

  "subject-clause": {
    "label": "主语从句（That / Whether / What 置于句首）",
    "definition": "放在句首充当主语的从句，谓语通常用单数，也可用 it 作形式主语把它后置。",
    "identify": "句首出现 That / Whether / What 引导的完整从句，后面接主句谓语。",
    "usage": "结构：That/Whether/What + 主语 + 谓语 + 主句谓语（单数）。that 不作成分、不译；whether 表“是否”；what 作成分。主语从句较长时常用 It is … that … 后置，避免头重脚轻。",
    "translate": "译成“……这件事/这一做法”，再接“是/取决于/很重要”；不要译成“那个”。",
    "trap": {
      "wrong": "Whether he will come are still unknown.",
      "right": "Whether he will come is still unknown.",
      "note": "主语从句整体视为单数，谓语要用 is；即使从句里出现复数名词也一样。"
    },
    "examples": [
      { "en": "Whether the experiment will succeed still remains uncertain.", "zh": "实验是否会成功仍不确定。" },
      { "en": "What caused the accident is still under investigation.", "zh": "造成事故的原因仍在调查中。" },
      { "en": "That she refused the offer surprised her colleagues.", "zh": "她拒绝了这份工作，这让同事们很意外。" }
    ]
  },

  "predicative-clause": {
    "label": "表语从句（The reason is that …）",
    "definition": "放在 be、seem、remain 等系动词后作表语的从句，用来说明主语是什么。",
    "identify": "系动词（is/was/seems/remains）后面直接跟 that / whether / what / why 等引导的完整从句。",
    "usage": "结构：主语 + be + that/whether/what + 从句。that 不作成分、不译；whether 表“是否”；what 作成分。The reason is that … 是固定表达，不用 because。",
    "translate": "译成“是……/在于……”；that 不译，whether 译“是否”，what 译“……的东西”。",
    "trap": {
      "wrong": "The reason why he left is because he was ill.",
      "right": "The reason why he left is that he was ill.",
      "note": "The reason is that … 是固定搭配；is because 把原因状语当表语，正式写作中算错。"
    },
    "examples": [
      { "en": "The problem is that nobody wants to take responsibility.", "zh": "问题在于没有人愿意承担责任。" },
      { "en": "What matters most is whether we can work together.", "zh": "最重要的是我们能否合作。" },
      { "en": "The question remains how we should raise the money.", "zh": "问题仍然是我们该如何筹钱。" }
    ]
  },

  "wh-ever": {
    "label": "wh-ever 引导的让步/名词性从句",
    "definition": "whoever、whatever、whenever 等词可引导名词性从句，也可引导让步状语从句。",
    "identify": "看 wh-ever 在句中的位置和成分：作主语、宾语或表语就是名词性从句；作状语、能换成 no matter + wh- 就是让步从句。",
    "usage": "名词性从句：Whoever comes is welcome.；让步从句：Whatever you say, I won't change my mind.。能换成 no matter + wh- 的是让步，不能换的是名词性从句。",
    "translate": "名词性从句译“任何……的人/事”；让步从句译“无论……都……”。",
    "trap": {
      "wrong": "Whatever you do, but don't give up.",
      "right": "Whatever you do, don't give up.",
      "note": "wh-ever 让步从句后面主句不能再加 but，中文的“但是”不能直译。"
    },
    "examples": [
      { "en": "Whoever finishes first will receive a small prize.", "zh": "无论谁先完成，都会得到一个小奖品。" },
      { "en": "Whatever the outcome is, we must stay calm.", "zh": "无论结果如何，我们都必须保持冷静。" },
      { "en": "Whenever she visits, she always brings homemade cookies.", "zh": "她每次来访都会带自制饼干。" }
    ]
  },

  "appositive": {
    "label": "同位语从句（the fact / idea / belief that …）",
    "definition": "跟在 fact、idea、belief 等抽象名词后、说明其具体内容的从句，that 不作成分。",
    "identify": "抽象名词（fact/idea/belief/news/evidence）后紧跟 that 从句，从句结构完整，that 不充当主语或宾语。",
    "usage": "结构：抽象名词 + that + 完整从句。判断：that 在从句中不作成分，且从句内容等于该名词的内容，就是同位语从句；若 that 作成分，则是定语从句。",
    "translate": "译成“……的事实/观点/证据是……”，或用冒号直接引出内容，that 不译。",
    "trap": {
      "wrong": "The fact which he lied made everyone angry.",
      "right": "The fact that he lied made everyone angry.",
      "note": "从句结构完整、that 不作成分，是同位语从句，不能用 which。"
    },
    "examples": [
      { "en": "The idea that machines can think frightens some people.", "zh": "机器能思考这一想法让一些人感到害怕。" },
      { "en": "There is little evidence that the drug is effective.", "zh": "几乎没有证据表明这种药有效。" },
      { "en": "She rejected the suggestion that the meeting be postponed.", "zh": "她拒绝了推迟会议的建议。" }
    ]
  },

  "noun-appositive": {
    "label": "名词短语同位语（, a process called …）",
    "definition": "用逗号隔开的另一个名词短语，对前面的名词作补充说明，二者指同一事物。",
    "identify": "名词后出现逗号，再接一个名词短语（常带 a/an、the、called、known as），删掉后句子仍然完整。",
    "usage": "结构：名词, + 名词短语, + 其余部分。常见形式：, a process called …、, an approach known as …。它没有引导词、没有谓语，只是换个说法解释前面的词。",
    "translate": "译成“即……”“也就是……”，或用破折号、括号补出说明，不必译成完整句子。",
    "trap": {
      "wrong": "Beijing, the capital of China, it has a long history.",
      "right": "Beijing, the capital of China, has a long history.",
      "note": "同位语只是名词短语，不能再用 it 重复指代主语，否则主语重复。"
    },
    "examples": [
      { "en": "The river, a major source of drinking water, is now polluted.", "zh": "这条河是主要的饮用水源，如今已被污染。" },
      { "en": "They adopted a new method, an approach called peer review.", "zh": "他们采用了一种新方法，即一种名为同行评审的做法。" },
      { "en": "Shanghai, the largest city in China, attracts millions of visitors.", "zh": "上海是中国最大的城市，吸引了数百万游客。" }
    ]
  },

  "parenthetical": {
    "label": "插入语（however / therefore / for example 等独立成分）",
    "definition": "用逗号隔开的独立成分，表达说话人的态度或补充说明，去掉后句子仍然完整。",
    "identify": "句中或句首出现 however、therefore、for example、in fact 等，前后常有逗号，不充当句子成分。",
    "usage": "常见位置：句首加逗号；句中前后各一个逗号；句末前加逗号。however 表转折，therefore 表结果，for example 举例，in fact 表强调。插入语不影响主句结构和主谓一致，阅读时可先跳过。",
    "translate": "分别译“然而/因此/例如/事实上/当然”，一般放在句首，用逗号隔开。",
    "trap": {
      "wrong": "He didn't study hard, therefore he failed the exam.",
      "right": "He didn't study hard; therefore, he failed the exam.",
      "note": "therefore 是副词，不能像连词那样连接两个句子，需用分号或句号。"
    },
    "examples": [
      { "en": "The plan, however, was rejected by the committee.", "zh": "然而，这个计划被委员会否决了。" },
      { "en": "She therefore decided to change her major last year.", "zh": "因此，她去年决定转专业。" },
      { "en": "For example, many students study late into the night.", "zh": "例如，许多学生学到深夜。" }
    ]
  },

  "dash-parenthesis": {
    "label": "破折号插入语（— 补充说明 —）",
    "definition": "用一对破折号插入的补充说明，作用类似括号，但语气更强调、更口语化。",
    "identify": "句中突然出现单个或成对的破折号，中间是一段可删除的说明、举例或转折，删后句子仍通顺。",
    "usage": "结构：主句 — 补充内容 — 主句剩余部分。破折号可代替逗号或括号，强调补充信息；正式写作中不宜过多。若插入内容本身有逗号，用破折号更清楚。翻译时用破折号或括号保留。",
    "translate": "译成“——……——”或“……（即……）”，补充说明放在被说明内容之后。",
    "trap": {
      "wrong": "The plan — which was costly, was rejected.",
      "right": "The plan — which was costly — was rejected.",
      "note": "破折号插入语必须成对使用，前后各一个；只写一个会把主句结构切断，句子就不完整了。"
    },
    "examples": [
      { "en": "The solution — a simple change in policy — worked almost immediately.", "zh": "解决办法——政策上的一个简单改变——几乎立刻见效了。" },
      { "en": "He gave one reason — lack of time — for missing the deadline.", "zh": "他为错过截止日期给出了一个理由——时间不够。" },
      { "en": "The old bridge — built in 1920 — is still in use.", "zh": "这座旧桥建于 1920 年，至今仍在使用。" }
    ]
  },

  "time-clause": {
    "label": "时间状语从句（when / while / before / after / once）",
    "definition": "说明主句动作发生时间的从句，由 when、while、before 等连词引导。",
    "identify": "主句前后出现 when/while/before/after/once/until 等连词，后面接完整的主谓结构，回答“什么时候”。",
    "usage": "when 指某一点或某一段时间；while 强调“在……期间”，常接进行时；before/after 表示先后；once 表示“一旦”。时间从句中不能用 will 表将来，要用一般现在时代替。",
    "translate": "译成“当……时/在……期间/在……之前/之后/一旦……”，中文习惯把时间从句放前面。",
    "trap": {
      "wrong": "When he will arrive, we will start the meeting.",
      "right": "When he arrives, we will start the meeting.",
      "note": "时间状语从句不能用 will 表示将来，要用一般现在时替代，主句才用 will。"
    },
    "examples": [
      { "en": "While she was preparing dinner, the phone rang twice.", "zh": "她在准备晚饭时，电话响了两次。" },
      { "en": "Once you start the program, it cannot be stopped.", "zh": "一旦启动这个程序，就无法停止。" },
      { "en": "We had finished the report before the manager arrived.", "zh": "经理到达之前，我们已经完成了报告。" }
    ]
  },

  "as-soon-as": {
    "label": "as soon as / the moment 一……就……",
    "definition": "表示两个动作紧接发生的连词结构，as soon as 最常用，the moment 更书面。",
    "identify": "看到 as soon as、the moment、the instant、immediately 等，后面接完整从句，主句表示紧接着的动作。",
    "usage": "结构：As soon as + 从句（一般现在时）, 主句（将来时/过去时）。从句不能用 will。the moment 直接当连词。hardly … when 也表“一……就”，但主句要倒装并用过去完成时。",
    "translate": "译成“一……就……”，先发生的动作放前面，后发生的放后面，不必逐字对应。",
    "trap": {
      "wrong": "As soon as he will come, I will tell him the news.",
      "right": "As soon as he comes, I will tell him the news.",
      "note": "as soon as 从句用一般现在时表将来，不能用 will。"
    },
    "examples": [
      { "en": "As soon as the bell rang, the students left the classroom.", "zh": "铃声一响，学生们就离开了教室。" },
      { "en": "The moment she saw the letter, she burst into tears.", "zh": "她一看到那封信就哭了。" },
      { "en": "We will start as soon as everyone arrives.", "zh": "大家一到，我们就开始。" }
    ]
  },

  "reason-clause": {
    "label": "原因状语从句（because / since / now that）",
    "definition": "说明主句动作原因的从句，由 because、since、as、now that 等连词引导。",
    "identify": "主句后（或前）出现 because/since/as/now that，后面接完整主谓结构，回答“为什么”。",
    "usage": "because 语气最强，回答 why；since/now that 表示已知原因，译“既然”；as 语气较弱。for 是并列连词，不能放句首。中文“因为……所以”不能同时译成 because … so。",
    "translate": "because 译“因为”，since/now that 译“既然”，as 译“由于”；主句前不要再加“所以”。",
    "trap": {
      "wrong": "Because he was tired, so he went to bed early.",
      "right": "Because he was tired, he went to bed early.",
      "note": "英语中 because 和 so 不能连用，中文的“因为……所以”只能译一个。"
    },
    "examples": [
      { "en": "She stayed home because the roads were covered with ice.", "zh": "她待在家里，因为道路结了冰。" },
      { "en": "Since you already know the answer, why ask me?", "zh": "既然你已经知道答案，为什么还问我？" },
      { "en": "Now that the exam is over, we can relax a little.", "zh": "既然考试结束了，我们可以放松一下。" }
    ]
  },

  "reason-that": {
    "label": "The reason why … is that …",
    "definition": "解释原因时的固定句型：先提出结果或原因，再用 that 从句给出具体理由。",
    "identify": "看到 The reason why … is that …，注意最后用 that 而不用 because。",
    "usage": "结构：The reason why + 从句 + is that + 原因。不能说 The reason is because …，因为 because 从句是状语，不能作表语。",
    "translate": "译成“……的原因是……”，也可译“之所以……，是因为……”，语气更自然。",
    "trap": {
      "wrong": "The reason why she was late is because her car broke down.",
      "right": "The reason why she was late is that her car broke down.",
      "note": "is 后面是表语从句，要用 that；because 只能引导原因状语从句。"
    },
    "examples": [
      { "en": "The reason why the plan failed is that nobody followed it.", "zh": "计划失败的原因在于没有人照着执行。" },
      { "en": "The reason for his silence was that he disagreed completely.", "zh": "他沉默的原因是他完全不同意。" },
      { "en": "That is the reason why she refused the offer.", "zh": "这就是她拒绝这个提议的原因。" }
    ]
  },

  "condition-clause": {
    "label": "on condition that / provided that / as long as",
    "definition": "表示“只有在……条件下才”的正式条件表达，语气比 if 更强、更明确。",
    "identify": "看到 on condition that、provided that、as long as、only if，后面接完整从句，主句给出结果。",
    "usage": "on condition that 意为“条件是”，多用于正式文体；provided that 意为“只要”；as long as 同义但更口语。它们都直接接从句。only if 放句首时主句要倒装。",
    "translate": "统一译“只要/条件是/只有在……条件下”，从句放前面，主句用“就/才”。",
    "trap": {
      "wrong": "You may go out on condition that you will come back by ten.",
      "right": "You may go out on condition that you come back by ten.",
      "note": "条件从句用一般现在时表将来，不用 will，主句才用情态动词或将来时。"
    },
    "examples": [
      { "en": "You can use the car on condition that you drive carefully.", "zh": "你可以用这辆车，条件是小心驾驶。" },
      { "en": "Provided that the weather is fine, the match will go ahead.", "zh": "只要天气好，比赛就会照常进行。" },
      { "en": "You may keep the book as long as you return it.", "zh": "只要你归还，就可以留着这本书。" }
    ]
  },

  "conditional-clause": {
    "label": "条件状语从句（unless / provided that / in case）",
    "definition": "表示“如果、除非、以防”等条件的从句，用 unless、if、in case 等引导。",
    "identify": "主句前后出现 if/unless/in case/provided that，后面接完整从句；从句用一般现在时表将来。",
    "usage": "unless = if not，本身含否定，主句不能再加 not；in case 表示“以防万一”，从句常用一般现在时或 should；provided that 表示“只要”。条件从句同样不用 will 表将来，主句才用将来时或情态动词。",
    "translate": "unless 译“除非……否则”；in case 译“以防”；provided that 译“只要”。",
    "trap": {
      "wrong": "Unless you don't hurry, you will miss the train.",
      "right": "Unless you hurry, you will miss the train.",
      "note": "unless 本身等于 if not，从句里再加 don't 就变成双重否定。"
    },
    "examples": [
      { "en": "Unless the government acts soon, prices will keep rising.", "zh": "除非政府尽快采取行动，否则物价会持续上涨。" },
      { "en": "Take a taxi in case you are late for the interview.", "zh": "打车去吧，以防面试迟到。" },
      { "en": "If it rains tomorrow, the trip will be cancelled.", "zh": "如果明天下雨，旅行就会取消。" }
    ]
  },

  "concessive-clause": {
    "label": "让步状语从句（although / though / even if）",
    "definition": "表示“虽然、即使”的从句，先承认一种情况，再说明主句的相反结果。",
    "identify": "出现 although/though/even though/even if/while，后面接完整从句；主句前不能再加 but。",
    "usage": "although 偏事实，even if 偏假设；though 还可放句末作副词。主句不能用 but，但可用 yet/still。while 也可表让步，译“虽然”。",
    "translate": "译成“虽然……但……”“即使……也……”，中文可保留“但/也”，英文不能加 but。",
    "trap": {
      "wrong": "Although he was tired, but he kept working.",
      "right": "Although he was tired, he kept working.",
      "note": "although 引导从句后，主句不能再加 but；中文的“虽然……但是”在英文里只能留一个。"
    },
    "examples": [
      { "en": "Although the evidence was weak, the jury convicted him.", "zh": "尽管证据不足，陪审团还是判他有罪。" },
      { "en": "Even if the plan fails, we will learn something useful.", "zh": "即使计划失败，我们也会学到有用的东西。" },
      { "en": "Though it was raining heavily, they continued the game.", "zh": "虽然雨下得很大，他们还是继续比赛。" }
    ]
  },

  "as-concession": {
    "label": "as 引导让步倒装（Much as I like it）",
    "definition": "as 表示“尽管”时必须倒装，把形容词、副词、名词或动词原形提到 as 前面。",
    "identify": "句首出现形容词/副词/名词/动词原形 + as + 主语 + 谓语，且可换成 although，就是让步倒装。",
    "usage": "adj./adv./n./v. + as + 主语 + 谓语。Much as I like it = Although I like it；Child as he is = Although he is a child（名词前不用冠词）。",
    "translate": "译成“尽管……、虽然……”，绝不能译成“因为”或“当……时”。",
    "trap": {
      "wrong": "As he is a child, he knows a lot about physics.",
      "right": "Child as he is, he knows a lot about physics.",
      "note": "表让步时须把表语提前并去掉冠词，形成 Child as he is 的倒装。"
    },
    "examples": [
      { "en": "Much as I respect him, I cannot accept his conclusion.", "zh": "尽管我很尊敬他，但我无法接受他的结论。" },
      { "en": "Hard as she tried, she could not solve the problem.", "zh": "尽管她很努力，还是解决不了这个问题。" },
      { "en": "Young as he is, he has already published two papers.", "zh": "尽管他很年轻，他已经发表了两篇论文。" }
    ]
  },

  "concession-no-matter": {
    "label": "no matter how / however + 形容词 让步",
    "definition": "用 no matter how 或 however 加形容词，表示“无论多么……”，引导让步从句。",
    "identify": "看到 no matter how、however、whatever、whoever 等，后面紧跟形容词或副词，再接主语和谓语。",
    "usage": "结构：No matter how + adj./adv. + 主语 + 谓语, 主句。however 同义，但后面必须紧跟形容词或副词，且用陈述语序，不能倒装。",
    "translate": "译成“无论多么……都……”，注意 however 在这里不是“然而”，而是“无论怎么”。",
    "trap": {
      "wrong": "No matter how hard did he try, he could not pass the test.",
      "right": "No matter how hard he tried, he could not pass the test.",
      "note": "no matter how 引导的从句用陈述语序，不能像疑问句那样倒装。"
    },
    "examples": [
      { "en": "No matter how late it is, she always finishes her work.", "zh": "无论多晚，她总是把工作做完。" },
      { "en": "However difficult the task is, we must complete it.", "zh": "无论任务多难，我们都必须完成。" },
      { "en": "No matter where you go, remember to call home.", "zh": "无论你去哪里，记得给家里打电话。" }
    ]
  },

  "purpose-clause": {
    "label": "目的状语（so that / in order that / in order to）",
    "definition": "说明做某事“为了什么”的从句或短语，常用 so that、in order to。",
    "identify": "看到 so that / in order that + 从句，或 in order to + 动词原形，表示目的。",
    "usage": "so that/in order that 从句常带 can/could/may/might；in order to/so as to 后接动词原形，否定用 in order not to。",
    "translate": "译成“为了……”“以便……”，中文通常把目的放在主句前面，更符合表达习惯。",
    "trap": {
      "wrong": "He got up early so that to catch the first bus.",
      "right": "He got up early so as to catch the first bus.",
      "note": "so that 后面必须接完整从句；接动词原形要用 so as to 或 in order to。"
    },
    "examples": [
      { "en": "She spoke slowly so that everyone could follow her.", "zh": "她说得很慢，以便每个人都能跟上。" },
      { "en": "In order to save time, we took the express train.", "zh": "为了节省时间，我们乘坐了特快列车。" },
      { "en": "The school added lights in order that students could study safely.", "zh": "学校增加了照明，以便学生能安全地学习。" }
    ]
  },

  "purpose-lest": {
    "label": "lest / for fear that 虚拟目的从句",
    "definition": "表示“以免、生怕”的正式结构，从句用 should + 动词原形，should 可以省略。",
    "identify": "看到 lest 或 for fear that，后面接从句；lest 从句常用动词原形，for fear that 从句常用 should。",
    "usage": "结构：主句 + lest + 主语 + (should) + 动词原形；或 for fear that + 主语 + should/might + 动词。lest 本身含否定，从句不能再加 not。",
    "translate": "译成“以免……”“生怕……”，不要译成“因为害怕”，它表达的是目的。",
    "trap": {
      "wrong": "Study hard lest you will fail the exam.",
      "right": "Study hard lest you should fail the exam.",
      "note": "lest 从句用 should + 动词原形，不用 will；should 也可省略。"
    },
    "examples": [
      { "en": "Take notes lest you forget the key points.", "zh": "记笔记，以免忘记要点。" },
      { "en": "She spoke quietly for fear that someone might hear her.", "zh": "她轻声说话，生怕有人听见。" },
      { "en": "He checked the data twice lest any error should remain.", "zh": "他把数据核对了两遍，以免留下错误。" }
    ]
  },

  "so-that": {
    "label": "so … that / such … that 结果状语从句",
    "definition": "表示“如此……以至于……”的结果从句，so 修饰形容词或副词，such 修饰名词。",
    "identify": "看到 so + 形容词/副词 + that，或 such + (a/an) + 形容词 + 名词 + that，that 后是结果。",
    "usage": "so 后接 adj./adv.；such 后接名词短语。so many/much/few/little + 名词 + that 也用 so。so 或 such 提到句首时主句要倒装。",
    "translate": "译成“如此……以至于……”，中文常简化为“……得让……”“太……结果……”。",
    "trap": {
      "wrong": "It was so a difficult test that many students failed.",
      "right": "It was such a difficult test that many students failed.",
      "note": "difficult 修饰名词 test，应用 such a + 形容词 + 名词；so 只能直接修饰形容词。"
    },
    "examples": [
      { "en": "The box was so heavy that nobody could lift it.", "zh": "箱子太重了，没人能搬动。" },
      { "en": "She is such a talented writer that publishers seek her out.", "zh": "她是一位很有才华的作家，出版商都主动找她。" },
      { "en": "So convincing was his argument that everyone agreed.", "zh": "他的论证如此有说服力，以至于大家都同意了。" }
    ]
  },

  "while-contrast": {
    "label": "while / whereas 对比从句",
    "definition": "用 while 或 whereas 连接两个相反或相对的事实，表示“而、然而”的对比。",
    "identify": "两个分句用逗号隔开，while/whereas 位于第二个分句前，前后内容形成对照，可换成 but。",
    "usage": "while 有三种用法：时间“当……时”、对比“而”、让步“虽然”；whereas 只表对比。判断：两个动作同时进行就是时间；两个事实相反就是对比。对比义的 while 不能放句首译成“当”。",
    "translate": "对比义译“而、然而”；时间义译“当……时”；让步义译“虽然”，按上下文选定。",
    "trap": {
      "wrong": "My brother likes tea, while my sister she prefers coffee.",
      "right": "My brother likes tea, while my sister prefers coffee.",
      "note": "while 从句里 my sister 已是主语，再加 she 就造成主语重复。"
    },
    "examples": [
      { "en": "Some students prefer group work, while others study better alone.", "zh": "有些学生喜欢小组学习，而另一些学生独自学习效果更好。" },
      { "en": "The north is dry and cold, whereas the south is wet and warm.", "zh": "北方干燥寒冷，而南方潮湿温暖。" },
      { "en": "While the plan looks simple, it is hard to carry out.", "zh": "虽然这个计划看起来简单，却很难实施。" }
    ]
  },

  "now-that": {
    "label": "now that / given that / seeing that 原因从句",
    "definition": "表示“既然、考虑到”的原因从句，所给理由通常是听话人已知或显而易见的事实。",
    "identify": "看到 now that、given that、seeing that 位于句首，后面接完整从句，主句给出结论或建议。",
    "usage": "now that 强调“现在情况已变”，译“既然”；given that 译“考虑到”，given 后也可直接接名词；seeing that 译“既然、鉴于”。这些连词比 because 弱，通常不回答 why，也不用于强调句。",
    "translate": "now that 译“既然”，given that 译“考虑到”，seeing that 译“鉴于、既然”。",
    "trap": {
      "wrong": "Now that you are here, so we can start.",
      "right": "Now that you are here, we can start.",
      "note": "now that 已引导从句，主句不能再加 so，中英文连词不能成对直译。"
    },
    "examples": [
      { "en": "Now that you have finished the report, you can go home.", "zh": "既然你完成了报告，就可以回家了。" },
      { "en": "Given that the data are incomplete, the conclusion is unreliable.", "zh": "考虑到数据不完整，这个结论并不可靠。" },
      { "en": "Seeing that everyone agrees, we will adopt the proposal.", "zh": "既然大家都同意，我们就采纳这个提议。" }
    ]
  },

  "as-long-as": {
    "label": "as long as 引导条件状语从句",
    "definition": "as long as 表示“只要”，引导条件从句，相当于 provided that。",
    "identify": "as long as 后接完整的主谓结构，且可换成 if，就是条件从句；若后接名词且表示长度，则是比较。",
    "usage": "结构：As long as + 从句, 主句。从句用一般现在时表将来。它和 as … as 比较结构不同：条件义后面必须有主语和谓语，比较义后面只接名词或代词，如 as long as two meters。",
    "translate": "条件义译“只要……就……”；比较义译“和……一样长”，两者要分清。",
    "trap": {
      "wrong": "As long as you will study hard, you will pass the exam.",
      "right": "As long as you study hard, you will pass the exam.",
      "note": "条件状语从句用一般现在时表示将来，不用 will，主句才用 will。"
    },
    "examples": [
      { "en": "You can stay here as long as you keep the room clean.", "zh": "只要你保持房间干净，就可以待在这里。" },
      { "en": "As long as the weather permits, we will hold the race.", "zh": "只要天气允许，我们就举行比赛。" },
      { "en": "The rope is as long as three meters.", "zh": "这根绳子有三米长。" }
    ]
  },

  "as-if": {
    "label": "as if / as though 引导方式状语从句",
    "definition": "表示“好像、仿佛”的方式状语从句，可接陈述语气，也可接虚拟语气。",
    "identify": "看到 as if / as though 后接完整从句，判断所说内容是否与事实相符，据此决定用陈述还是虚拟。",
    "usage": "与事实相反用虚拟：as if + 过去式（现在）、had done（过去）；可能性较大用陈述语气。也可接 to do：He opened his mouth as if to speak。判断依据是“像不像真的”。",
    "translate": "译成“好像……似的”，虚拟时加“仿佛、似乎”，不要译成“如果”。",
    "trap": {
      "wrong": "He talks as if he has seen the film yesterday.",
      "right": "He talks as if he had seen the film yesterday.",
      "note": "yesterday 表明与过去事实相反，as if 从句要用 had done。"
    },
    "examples": [
      { "en": "She looked at me as if she had never seen me before.", "zh": "她看着我，好像从没见过我似的。" },
      { "en": "It sounds as though the engine is failing.", "zh": "听起来发动机好像要坏了。" },
      { "en": "He raised his hand as if to ask a question.", "zh": "他举起手，好像要问问题。" }
    ]
  },

  "as-phrase": {
    "label": "as 引出的固定短语（as well as / as a result / as for）",
    "definition": "由 as 构成的固定短语，各有独立含义，不能一律按“作为”来理解。",
    "identify": "看到 as well as、as a result、as for、as a whole、as a rule 等固定搭配，要把整个短语一起记。",
    "usage": "as well as = 以及，连接并列成分，谓语与前面主语一致；as a result = 因此；as for = 至于；as a whole = 总体上；as opposed to = 与……相对。",
    "translate": "按固定义译：“以及/因此/至于/总体上/通常/与……相对”，不要译“作为”。",
    "trap": {
      "wrong": "The teacher as well as the students were invited.",
      "right": "The teacher as well as the students was invited.",
      "note": "as well as 连接主语时，谓语与前面的主语保持一致，这里核心是 teacher。"
    },
    "examples": [
      { "en": "The course covers writing as well as speaking.", "zh": "这门课既包括写作也包括口语。" },
      { "en": "As a result, the company lost two important clients.", "zh": "结果，公司失去了两个重要客户。" },
      { "en": "As for the price, we can discuss it later.", "zh": "至于价格，我们可以稍后再谈。" }
    ]
  },

  "as-time-cause": {
    "label": "as 引导时间/原因状语从句（随着；由于）",
    "definition": "as 可引导时间从句表示“随着、当……时”，也可引导原因从句表示“由于”。",
    "identify": "as 位于句首或逗号后，后接完整从句；看从句与主句是同时发生（时间），还是解释原因（原因）。",
    "usage": "时间义强调两个动作同时或同步变化，常译“随着”；原因义语气比 because 弱，常译“由于”，多用于已知理由。判断：译“随着”读得通就是时间，读不通就改译“由于”；也可用 since/while 替换验证。",
    "translate": "时间义译“随着、当……时”；原因义译“由于、因为”，根据句意选择，不要一律译“当……时”。",
    "trap": {
      "wrong": "As he was ill, so he stayed at home.",
      "right": "As he was ill, he stayed at home.",
      "note": "as 引导原因从句时，主句不能再加 so，中英文不能成对直译。"
    },
    "examples": [
      { "en": "As the sun rose, the fog slowly disappeared.", "zh": "随着太阳升起，雾气慢慢散去。" },
      { "en": "As the deadline approaches, the team works longer hours.", "zh": "随着截止日期临近，团队工作的时间更长了。" },
      { "en": "As she had no money, she walked home.", "zh": "由于没有钱，她走回了家。" }
    ]
  }
};
