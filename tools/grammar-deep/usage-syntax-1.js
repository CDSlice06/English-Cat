// 语法与句式本 · 常见问答（第一批）
// 每条包含 summary / items，item 为 q + a，部分带 good / bad 正误对比

module.exports = {
  "relative-clause": {
    "summary": "which 与 that 指物多可换；先行词有 all、only、最高级或不定代词时只用 that。",
    "items": [
      {
        "q": "which 和 that 指物时到底能不能随便换？",
        "a": "大多数限制性从句里可以换，但先行词是 all、everything 等不定代词，或被 only、序数词、最高级修饰时只能用 that；主句已出现 which 时也改用 that。反过来，介词后和逗号后的非限制性从句只能用 which。",
        "good": "All that he said at the meeting was true.",
        "bad": "All which he said at the meeting was true."
      },
      {
        "q": "关系代词在从句里作宾语，可以省略吗？",
        "a": "可以，而且很常见：作宾语的 that、which、who、whom 都能省，句子照样成立，如 the book I bought。但作主语时不能省，否则从句就没有主语了。判断方法是把从句单独拿出来看：缺宾语就可以省，缺主语就必须保留关系代词。"
      },
      {
        "q": "one of the students who 后面的谓语用单数还是复数？",
        "a": "看 who 修饰谁。one of the students who were late 中，who 紧跟复数名词 students，从句谓语用复数 were；如果 one 前有 the only，who 就修饰 the only one，从句谓语改用单数。主句谓语仍随 one 用单数，两处不要混。"
      }
    ]
  },

  "relative-whose": {
    "summary": "whose 后必须紧跟名词，不能再加 his；指物也可用 the + 名词 + of which。",
    "items": [
      {
        "q": "whose 只能指人吗？指物怎么办？",
        "a": "whose 指人指物都行，后面跟名词表示所属，如 a house whose windows face the sea。指物时也可用 the + 名词 + of which，更正式，如 a theory the origin of which is unclear。两种都对，口语多用 whose。"
      },
      {
        "q": "whose 和 of whom 有什么区别？",
        "a": "两者都表所属，但结构不同：whose + 名词，或 the + 名词 + of whom，后者只用于人且更正式。of whom 不能直接放在名词前，不能说 of whom book。写作时若先行词是人、句子又长，用 the + 名词 + of whom 可以避免 whose 连续出现造成的歧义。",
        "good": "She has a friend whose brother works in Beijing.",
        "bad": "She has a friend whose his brother works in Beijing."
      },
      {
        "q": "whose 引导的从句前面可以加逗号吗？",
        "a": "可以。加逗号就是非限制性定语从句，只作补充说明，删掉后主句仍然完整，如 Mr. Li, whose son studies abroad, teaches history。此时仍不能用 that，也不能把 whose 换成 his。逗号前后的两个逗号必须成对，不能只加一个。"
      }
    ]
  },

  "relative-adverb": {
    "summary": "先行词是地点未必用 where；从句缺主语或宾语用 which/that，缺状语才用 where。",
    "items": [
      {
        "q": "先行词是 city、house 这类地点名词，是不是就必须用 where？",
        "a": "不是。where 只能在从句缺地点状语时用，等于 in/at which。动词若还缺宾语，就得用 that 或 which，如 the city that I visited。把从句还原成完整句：能补出 in the city 才用 where，需要补出 the city 作宾语就用 which。",
        "good": "This is the village where she grew up.",
        "bad": "This is the village where she visited last year."
      },
      {
        "q": "the reason why 里的 why 可以换成 that 或省掉吗？",
        "a": "可以。the reason 后面接完整从句时，why、that 都能用，也常直接省略：the reason he left。但不用 because，因为 because 引导的是原因状语，不能修饰名词。另外 why 只在从句缺原因状语时成立，若从句缺主语或宾语，仍要用 that 或 which。"
      },
      {
        "q": "when 和 that 都能修饰 day，怎么选？",
        "a": "看从句成分。缺时间状语用 when，如 the day when we met；缺主语或宾语用 that/which，如 the day that we spent together，这里 spent 需要宾语。that 作宾语时能省略，when 不能省。先行词是 time、moment 时同理。"
      }
    ]
  },

  "relative-who": {
    "summary": "指人用 who/that，不用 which；介词后只能接 whom，口语 who 可代 whom。",
    "items": [
      {
        "q": "who 和 whom 到底怎么选？",
        "a": "把从句还原成独立句，看关系词做什么成分：作主语用 who，作宾语用 whom。口语里作宾语的 whom 常被 who 代替，但介词后面必须用 whom，如 to whom、with whom，不能写 to who。考试和正式写作按成分选最稳妥。",
        "good": "The man to whom I spoke was very kind.",
        "bad": "The man to who I spoke was very kind."
      },
      {
        "q": "先行词是 people，用 which 行不行？",
        "a": "不行。which 只指物，指人要用 who 或 that；集合名词如 people、staff、audience 指成员时同样按人处理。只有把整个群体当成一个机构时才可能用 which，如 the committee which issued the report，这时它被视为组织而不是一群人。"
      },
      {
        "q": "非限制性从句里指人，能用 that 吗？",
        "a": "不能。逗号后的非限制性定语从句只能用 who、whom、whose，不能用 that。这一点和指物时一样，逗号加 that 一律算错。如果句子太长，可以拆成两句，用 he、she 或 they 承接，读起来更清楚。"
      }
    ]
  },

  "where-clause": {
    "summary": "where 前有地点名词是定语从句，没有先行词、直接修饰主句动词是地点状语从句。",
    "items": [
      {
        "q": "where 引导的到底是定语从句还是状语从句？",
        "a": "看 where 前有没有先行词。有地点名词让它修饰，就是定语从句，如 the office where I work；前面没有名词、where 直接说明主句动作发生的地点，就是状语从句，如 Put it where you like。状语从句的 where 不能换成 in which。",
        "good": "Put the book where it belongs.",
        "bad": "Put the book where does it belong."
      },
      {
        "q": "where 引导宾语从句时语序要变吗？",
        "a": "不用倒装，一律用陈述语序：主语在前，谓语在后。I don't know where he lives 不能说成 where does he live。这条规则适用于所有 wh- 宾语从句，包括 when、why、how。只有整个句子本身是疑问句时，主句才倒装。"
      },
      {
        "q": "Where there is a will, there is a way 里 where 是什么从句？",
        "a": "是地点状语从句，不是定语从句，因为 where 前没有先行词。这类句子里 where 相当于 in the place where，主句常以 there 开头。类似结构还有 Where there is smoke, there is fire。翻译成哪里……哪里就……，不要译成……的地方。"
      }
    ]
  },

  "as-relative": {
    "summary": "the same 后接 as 定语从句；the same … as 指同类，that 指同一。",
    "items": [
      {
        "q": "the same … as 和 the same … that 意思一样吗？",
        "a": "不一样。the same pen as I lost 指和我丢的那支同款，不一定同一支；the same pen that I lost 指就是我丢的那一支。as 强调同类，that 强调同一。考试常靠这一点设题，看到 the same 先想清楚是同款还是同一件。",
        "good": "She bought the same phone as I did.",
        "bad": "She bought the same phone as I did it."
      },
      {
        "q": "as 指代整个主句时，位置能放哪儿？",
        "a": "as 引导的从句位置灵活，句首、句中、句末都可以，如 As is known to all, …、…, as is often the case。which 指代整句时只能放在主句后面，不能提到句首。这是 as 和 which 指代整句时最实用的区别。"
      },
      {
        "q": "such … as 后面接的是从句还是短语？",
        "a": "接从句，as 在从句里充当主语或宾语。Such books as you mentioned are hard to find 中 as 作 mentioned 的宾语。如果 as 后面只剩名词或代词，就不是从句，而是比较结构，如 as tall as him，两种结构不要混。"
      }
    ]
  },

  "prep-which": {
    "summary": "介词由从句动词搭配决定，提前后只能用 which 或 whom，绝不能用 that 或 who。",
    "items": [
      {
        "q": "介词 + which 里的介词是怎么定的？",
        "a": "由从句里的动词、形容词或名词搭配决定：depend on 就配 on，pay attention to 就配 to，be based on 就配 on。做题时先把从句还原成普通句，看动词后面跟哪个介词，再把这个介词提到 which 前。介词放句末也可以，口语更常见。"
      },
      {
        "q": "介词能不能留在句子末尾？",
        "a": "能，而且口语里更自然：the tool (that) he fixed the car with。这时关系代词可以用 that，也可以直接省略，因为介词已经不在它前面了。正式写作倾向把介词提前，此时只能用 which 或 whom，写成 with which、with whom。",
        "good": "The friend with whom I traveled is a doctor.",
        "bad": "The friend with who I traveled is a doctor."
      },
      {
        "q": "in which 和 where 可以互换吗？",
        "a": "表地点时大多可以，in which 更正式、where 更简洁。但先行词是抽象名词、表示在……方面时，只能用 in which，如 a case in which the rule does not apply，这里不能换成 where。判断标准仍是先行词是否真的表示地点。"
      }
    ]
  },

  "subject-clause": {
    "summary": "主语从句整体当单数，谓语用 is；句首的 that 不能省，长从句常用 it 作形式主语。",
    "items": [
      {
        "q": "主语从句的谓语为什么总用单数？",
        "a": "因为整个从句被视为一件事，是一个整体概念，所以谓语用单数。Whether they agree is important 里从句中有复数 they，谓语仍是 is。what 引导的从句稍特殊：表语是复数名词时口语偶尔用复数谓语，但考试按单数处理最稳。",
        "good": "Whether they agree is unimportant.",
        "bad": "Whether they agree are unimportant."
      },
      {
        "q": "句首主语从句的 that 能省略吗？",
        "a": "不能。That he passed the exam surprised everyone 里 that 一去掉，读者会先把它当成一个完整句子，结构就乱了。只有在用 it 作形式主语时才可省：It is clear (that) he is right。whether 和 what 本来就不能省。"
      },
      {
        "q": "什么时候该用 it 作形式主语？",
        "a": "从句较长、直接放句首显得头重脚轻时。常见句型有 It is important that …、It remains unknown whether …、It surprised me that …。注意 it 只是占位，真正的主语还是后面的从句，谓语仍用单数。"
      }
    ]
  },

  "predicative-clause": {
    "summary": "The reason is that … 用 that；That's because … 另属句型。",
    "items": [
      {
        "q": "The reason is because 到底算不算错？",
        "a": "在标准书面语和考试里算错，因为 is 后面需要表语从句，而 because 只能引导原因状语，不能作表语。应改成 The reason is that …。口语中确实能听到 is because，但写作、翻译、改错题一律按 that 处理。",
        "good": "The reason for his absence is that he was ill.",
        "bad": "The reason for his absence is because he was ill."
      },
      {
        "q": "那 That's because … 为什么又能说？",
        "a": "因为主语 that 指代前面提到的结果，because 从句说明这个结果的原因，此时 because 仍是状语，只是整个句子结构不同。That's why … 则相反，后面接结果。区分方法：because 后是原因，why 后是结果，两者不能对调。"
      },
      {
        "q": "表语从句里表示是否，用 if 还是 whether？",
        "a": "用 whether。if 只能引导宾语从句，不能放在 be 动词后面作表语。The question is whether he will come 不能说成 is if he will come。同样，主语从句和同位语从句里也优先用 whether。"
      }
    ]
  },

  "wh-ever": {
    "summary": "能换成 no matter + wh- 的是让步从句，不能换的是名词性从句；从句一律陈述语序。",
    "items": [
      {
        "q": "whatever 和 no matter what 能互换吗？",
        "a": "只在让步从句里能换：Whatever you say, … 等于 No matter what you say, …。如果 wh-ever 引导的是主语、宾语或表语从句，就不能换成 no matter what，因为 no matter 结构只能作状语。看它在句中作不作成分，就能判断是哪一类。",
        "good": "Whatever you choose is fine with me.",
        "bad": "No matter what you choose is fine with me."
      },
      {
        "q": "whoever 和 whomever 怎么区分？",
        "a": "看它在从句里作主语还是宾语：作主语用 whoever，作宾语在正式文体可用 whomever。不过现代英语里，即使作宾语，只要后面紧跟自己的谓语，也常直接用 whoever，如 give it to whoever needs it。考试若考正式用法，按成分选更安全。"
      },
      {
        "q": "wh-ever 引导的从句要用陈述语序吗？",
        "a": "要。它在从句里只是连接词加成分，不构成疑问句，所以主语在谓语前：Whatever he says、Whoever comes。不要写成 Whatever does he say。这一点和所有 wh- 名词性从句一致。"
      }
    ]
  },

  "noun-appositive": {
    "summary": "逗号后的名词短语没有引导词也没有谓语，只是换个说法解释前面的名词，别再补 it。",
    "items": [
      {
        "q": "逗号后面那个名词短语，是同位语还是省略了的从句？",
        "a": "看有没有引导词和谓语。Beijing, the capital of China, has a long history 中，后者没有 who/which、也没有谓语，就是名词短语作同位语。写成 which is … 就变成非限制性定语从句。",
        "good": "My brother, a doctor, works in Shanghai.",
        "bad": "My brother, a doctor, he works in Shanghai."
      },
      {
        "q": "同位语前面能不能加 that is 或 namely？",
        "a": "能。that is、namely、i.e. 都可以引出同位语，语气更书面；口语里常用破折号或括号代替。注意 that is 后面接名词短语，不接完整从句，写成 that is he is a doctor 就错了。"
      },
      {
        "q": "同位语前的逗号可以省吗？",
        "a": "看是否限定。My friend Anna 不带逗号，暗示我有好几个朋友，Anna 用来限定是哪一个；My friend, Anna 带逗号，暗示我只有一个朋友，Anna 只是补充。这一点和定语从句的限制性、非限制性完全对应。"
      }
    ]
  },

  "parenthetical": {
    "summary": "however、therefore 是副词，不能像 but 那样连接句子，要用分号隔开。",
    "items": [
      {
        "q": "however 和 but 都是但是，能随便换吗？",
        "a": "不能。but 是连词，可直接连接两个分句；however 是副词，只能作插入语，前后要有逗号，句子之间要用分号。写成 He was tired; however, he kept working。",
        "good": "It rained heavily; however, the match went on.",
        "bad": "It rained heavily, however, the match went on."
      },
      {
        "q": "插入语会不会影响主谓一致？",
        "a": "不会。插入语不充当句子成分，去掉后主句照样成立，所以谓语仍与真正的主语一致。The teacher, together with his students, was invited 里谓语跟 teacher 用 was。阅读时遇到插入语可以先跳过，先抓主干。"
      },
      {
        "q": "therefore 放在句首、句中、句末有区别吗？",
        "a": "意思一样，只是强调重点不同。句首最常见，后面加逗号；句中前后各加逗号，语气稍弱；句末较少见，多用于口语。无论放哪儿，它都不能代替连词去连接两个独立句子。"
      }
    ]
  },

  "dash-parenthesis": {
    "summary": "破折号插入必须成对，或用在全句末尾；少一个就会把主句切断，语气比括号强。",
    "items": [
      {
        "q": "破折号和括号有什么区别？",
        "a": "内容上都能放补充说明，区别在语气：破折号更强调、更口语化，读的时候要停顿；括号语气最弱，像旁注。插入内容本身带逗号时，用破折号比用逗号更清楚，因为不会和句中的逗号混在一起。"
      },
      {
        "q": "破折号插入语必须用两个吗？",
        "a": "插在句子中间时必须成对，前后各一个；如果补充内容放在句末，用一个就够。只写一个又插在中间，会把主句切成两半，句子结构就断了。检查方法是把两个破折号之间的内容删掉，看剩下的部分是否完整。",
        "good": "The answer — a firm no — surprised everyone.",
        "bad": "The answer — a firm no, surprised everyone."
      },
      {
        "q": "破折号后面能接完整句子吗？",
        "a": "能，但通常放在句末，用来说明或总结前面的内容，如 He finally told the truth — he had lost the money。若插在句子中间，就要用一对破折号把整句包起来，否则主句会被切断。"
      }
    ]
  },

  "time-clause": {
    "summary": "时间从句用一般现在时表将来，不用 will；when 指点或段，while 强调在……期间。",
    "items": [
      {
        "q": "when 和 while 到底怎么区分？",
        "a": "when 可以指一个时间点，也可以指一段时间；while 强调在……期间，从句动词多为延续性的，常用进行时。所以 While I was cooking, the phone rang 很自然，而 While he arrived 就别扭，因为 arrive 是瞬间动作，这时要用 when。"
      },
      {
        "q": "时间从句里为什么不能用 will？",
        "a": "因为连词已表明将来时间，英语习惯用一般现在时表将来，主句才用 will。若强调完成，用现在完成时代替将来完成：When you have finished, call me。只有 when 引导名词性从句，如 I don't know when he will come，才可保留 will。",
        "good": "Once you begin, you cannot stop.",
        "bad": "Once you will begin, you cannot stop."
      },
      {
        "q": "until 和 not … until 意思差在哪？",
        "a": "肯定句里 until 表示一直到……为止，动作持续：Wait here until I come back。否定结构 not … until 表示直到……才，动作到那时才开始：He didn't leave until midnight。中文的才对应的是否定结构，不要漏掉 not。"
      }
    ]
  },

  "as-soon-as": {
    "summary": "as soon as 从句用一般现在时表将来；hardly … when 主句要倒装。",
    "items": [
      {
        "q": "hardly … when 和 as soon as 有什么不同？",
        "a": "意思都是一……就，但 hardly … when 更书面，主句用过去完成时并倒装：Hardly had he arrived when it began to rain。as soon as 用一般过去时和普通语序：As soon as he arrived, it began to rain。",
        "good": "Hardly had he arrived when the rain began.",
        "bad": "Hardly he had arrived when the rain began."
      },
      {
        "q": "the moment 后面要加 when 吗？",
        "a": "不用。the moment、the instant、the minute 本身就起连词作用，直接接从句：The moment she saw him, she smiled。加 when 反而多余。immediately 作连词时也直接接从句，多见于英式英语。"
      },
      {
        "q": "as soon as possible 也是连词吗？",
        "a": "不是。as soon as possible 是固定短语，意为尽快，后面不接从句，常放在句末：Please reply as soon as possible。要接从句时必须补出主语和谓语，写成 as soon as you can，不能省成 as soon as possible you can。"
      }
    ]
  },

  "reason-clause": {
    "summary": "because 答 why，since/as 指已知原因，for 不放句首，不与 so 连用。",
    "items": [
      {
        "q": "because、since、as、for 四个因为怎么选？",
        "a": "because 语气最强，回答 why，也是强调句唯一能用的；since 和 as 表示双方已知的原因，常译既然、由于，重点在主句；for 是并列连词，补充说明理由，不能放句首，也不能回答 why。写作时拿不准就用 because。",
        "good": "He stayed at home, for the roads were icy.",
        "bad": "For the roads were icy, he stayed at home."
      },
      {
        "q": "because 从句能被强调吗？",
        "a": "能，这是 because 独有的用法：It was because he was ill that he left early。since、as、for 都不能这样强调。这也是判断该用哪个词的方法之一：如果句子是强调句，只能用 because。"
      },
      {
        "q": "because of 和 because 有什么区别？",
        "a": "because 后接完整从句，because of 后接名词、代词或动名词。He left because he was ill 不能写成 because of he was ill；反过来 because of the rain 也不能补成 because the rain。看后面有没有主谓即可。"
      }
    ]
  },

  "reason-that": {
    "summary": "The reason why … is that …；is because 在标准写作中算错。",
    "items": [
      {
        "q": "The reason why … is that 里的 why 能省吗？",
        "a": "能。the reason 后接完整从句时，why 可以省略，也可以换成 that：The reason he left is that …。若想更正式，还可用 for which。但无论怎么变，后面的表语从句都要用 that，这一点不能动。",
        "good": "The reason I called you is that I need help.",
        "bad": "The reason I called you is because I need help."
      },
      {
        "q": "That's why 和 That's because 怎么区分？",
        "a": "why 后接结果，because 后接原因。He was ill. That's why he left 中，he left 是结果；He left. That's because he was ill 中，he was ill 是原因。做题时看后半句给的是原因还是结果，就能选对。"
      },
      {
        "q": "reason 后面的定语从句用 why 还是 that？",
        "a": "看从句缺什么。缺原因状语用 why，也可用 that 或 for which：the reason why he left；若从句缺主语或宾语，就只能用 that/which，如 the reason that he gave，因为 gave 需要宾语，这时不能用 why。"
      }
    ]
  },

  "condition-clause": {
    "summary": "on condition that、provided that 后接完整从句，用一般现在时表将来。",
    "items": [
      {
        "q": "on condition that 和 if 有什么不同？",
        "a": "意思接近，但 on condition that 更正式，强调必须满足这个条件，常出现在合同、规定里，译条件是。if 中性、通用。provided that 和 as long as 都偏只要，语气比 on condition that 宽。写作时按正式程度挑，不要一律用 if。",
        "good": "Provided that he agrees, we can proceed.",
        "bad": "Provided that he will agree, we can proceed."
      },
      {
        "q": "provided that 里的 that 能省略吗？",
        "a": "能。provided 和 providing 都可以单独当连词用，意思不变，providing 稍口语。类似的还有 given that 的 that 可省，而 on condition that 的 that 一般不省。记不住时保留 that 最安全，正式文体也倾向保留。"
      },
      {
        "q": "only if 放句首要倒装吗？",
        "a": "要。only 修饰状语且位于句首时，主句倒装：Only if you work hard can you succeed。从句本身不倒装。这一点和 if 不同，也是考试常设的陷阱。若不想倒装，把 only if 放在句中即可。"
      }
    ]
  },

  "conditional-clause": {
    "summary": "unless 等于 if not，从句不能再加 not；in case 表以防，从句不用 will。",
    "items": [
      {
        "q": "unless 和 if not 完全等价吗？",
        "a": "多数情况可以互换，但 unless 强调唯一的例外，语气更强；if not 只是普通否定条件。虚拟语气里更常见 if not，unless 用得较少。改写时先确认原句是不是真实条件，是就可以换，不是就保留 if not。"
      },
      {
        "q": "in case 和 if 有什么区别？",
        "a": "if 表示如果发生，就……；in case 表示以防发生，主句动作是提前做的准备。Take an umbrella in case it rains 是现在就带伞，以防下雨；If it rains, we'll stay home 是等雨来了再决定。两者逻辑方向不同。",
        "good": "Take an umbrella in case it rains.",
        "bad": "Take an umbrella in case it will rain."
      },
      {
        "q": "条件从句里真的完全不能用 will 吗？",
        "a": "不是绝对。若 will 表示意愿或坚持，可以保留：If you will wait a moment, I'll check。这里 will 不表将来，而表愿意。表示将来时间时仍用一般现在时。看到 will 先想它是不是愿意，不是就删掉。"
      }
    ]
  },

  "concessive-clause": {
    "summary": "although 后必须接完整从句，不能只接名词；主句不能再加 but。",
    "items": [
      {
        "q": "although 后面能不能只接名词？",
        "a": "不能。although 是连词，后面必须有主语和谓语；只接名词要用 despite 或 in spite of。Although his illness, he came 应改成 Although he was ill, he came 或 Despite his illness, he came。",
        "good": "Although he was exhausted, he finished the race.",
        "bad": "Although his exhaustion, he finished the race."
      },
      {
        "q": "though 放句末是什么意思？",
        "a": "这时 though 不是连词而是副词，意为不过、然而，相当于 however，常用于口语：It's a good idea, though。它不能连接两个句子，前面要有逗号或分号。句首的 Though 才是连词。"
      },
      {
        "q": "even if 和 even though 能互换吗？",
        "a": "不能随便换。even though 承认的是事实，译尽管；even if 说的是假设，译即使。Even though he was ill, he came 说明他确实病了；Even if he was ill, he would come 只是假设。看内容真假就能判断。"
      }
    ]
  },

  "as-concession": {
    "summary": "as 表尽管必须倒装，把形容词、副词、名词或动词原形提到 as 前，名词不加冠词。",
    "items": [
      {
        "q": "as 表让步时为什么非要倒装？",
        "a": "这是 as 让步用法的固定形式，不倒装就会被理解成因为或当……时。所以表语、状语要提到 as 前面：Tired as he was、Hard as she tried。看到 as 前面是形容词、副词或名词，基本可以断定是让步。"
      },
      {
        "q": "名词提前时冠词怎么处理？",
        "a": "要去掉冠词。Child as he is 不能说成 A child as he is；若名词前有形容词，也一样不用冠词：Clever boy as he is。这一点和普通表语结构不同，是考试常考的细节。",
        "good": "Child as he is, he knows a lot about physics.",
        "bad": "A child as he is, he knows a lot about physics."
      },
      {
        "q": "怎么区分 as 表让步和表原因？",
        "a": "先看语序：倒装的是让步，正常语序的是原因。再看替换：能换成 although 的是让步，能换成 since 的是原因。As he was tired, he went to bed 是原因；Tired as he was, he kept working 是让步。两者意思几乎相反，别读错。"
      }
    ]
  },

  "concession-no-matter": {
    "summary": "no matter how 和 however 后必须紧跟形容词或副词，从句用陈述语序，不能倒装。",
    "items": [
      {
        "q": "however 什么时候是无论多么，什么时候是然而？",
        "a": "看后面接什么。后面紧跟形容词或副词、再跟主谓，就是无论多么，引导让步从句：However hard he tried, …。后面用逗号隔开、单独修饰整个句子，就是然而的转折副词。位置和搭配不同，意思也不同。",
        "good": "However hard he tried, he could not solve it.",
        "bad": "However he tried hard, he could not solve it."
      },
      {
        "q": "no matter how 和 however 完全一样吗？",
        "a": "作无论多么时同义，可以互换，however 更书面、更简洁。区别在于 however 还有然而的副词用法，no matter how 没有。另外 no matter how 只能引导状语从句，不能像 however 那样单独作连接副词。"
      },
      {
        "q": "no matter how much 和 how many 怎么选？",
        "a": "看后面的名词可数与否。修饰不可数名词用 much：No matter how much money he has；修饰可数复数用 many：No matter how many books you read。much 和 many 在这里仍遵循普通数量词的规则。"
      }
    ]
  },

  "purpose-clause": {
    "summary": "so that 后接完整从句；要接动词原形，用 so as to 或 in order to。",
    "items": [
      {
        "q": "so that 和 so … that 有什么区别？",
        "a": "so that 引导目的，常带 can、could、may、might，译以便；so … that 中间夹形容词或副词，引导结果，译如此……以至于。看 that 前面有没有形容词、从句里有没有情态动词，就能区分。"
      },
      {
        "q": "in order to 和 in order that 怎么用？",
        "a": "in order to 后接动词原形，in order that 后接完整从句，从句常带 can/could/may/might。两者逻辑主语都要和主句一致：He studied hard in order to pass 中，学习的和通过的是同一个人。不一致时只能用 so that 从句。",
        "good": "He studied hard in order to pass the exam.",
        "bad": "He studied hard in order to he could pass the exam."
      },
      {
        "q": "so as to 能放句首吗？",
        "a": "不能，so as to 只用于句中；要放句首必须用 in order to。否定形式分别是 so as not to 和 in order not to，not 放在 to 前面，不能写成 to not。这一点在写作里很容易被扣分。"
      }
    ]
  },

  "purpose-lest": {
    "summary": "lest 从句用 should + 动词原形，should 可省；从句不能再加 not。",
    "items": [
      {
        "q": "lest 后面的 should 一定要写吗？",
        "a": "不一定，可以省略，省后只剩动词原形：lest he forget、lest any error remain。书面语里保留 should 更清楚，尤其在美国英语中。但无论如何都不能用 will 或 would，这是 lest 的虚拟要求。",
        "good": "Take notes lest you should forget the key points.",
        "bad": "Take notes lest you will forget the key points."
      },
      {
        "q": "lest 和 in case 都是以防，能换吗？",
        "a": "意思接近，但 lest 更正式、带虚拟语气，从句用 should 或动词原形；in case 用陈述语气，按实际时态写。口语和一般写作里 in case 更常见，lest 多出现在文学作品或正式文章里。"
      },
      {
        "q": "for fear that 和 for fear of 有什么区别？",
        "a": "for fear that 后接从句，常带 should 或 might；for fear of 后接名词或动名词。She spoke quietly for fear that someone might hear 等于 for fear of being heard。看后面有没有主谓即可。"
      }
    ]
  },

  "so-that": {
    "summary": "so 后接形容词或副词，such 后接名词；表数量时 many、much 仍用 so。",
    "items": [
      {
        "q": "so 和 such 到底怎么选？",
        "a": "看 that 前的词：形容词或副词用 so，名词用 such。有 a/an 时，such 放 a/an 前：such a good student。名词被 many、much、few、little 修饰时仍用 so：so many books。单数名词也可写成 so good a student。",
        "good": "It was such a hot day that we stayed indoors.",
        "bad": "It was so a hot day that we stayed indoors."
      },
      {
        "q": "so … that 里的 that 能省吗？",
        "a": "口语和非正式写作里可以省，尤其 that 后直接跟主语时：It was so hot I couldn't sleep。正式写作和考试建议保留 that，结构更清楚。注意省略后仍是结果从句，不要和目的结构的 so that 混为一谈，后者 that 不能省。"
      },
      {
        "q": "so 放在句首要倒装吗？",
        "a": "要。so + 形容词或副词提到句首时，主句用部分倒装：So tired was he that he fell asleep at once。若 so 只是正常语序中的程度修饰，则不用倒装。判断标准是 so 短语是否位于句首并作强调，是就倒装，不是就保持陈述语序。",
        "good": "So loudly did he speak that everyone could hear him.",
        "bad": "So loudly he spoke that everyone could hear him."
      }
    ]
  },

  "while-contrast": {
    "summary": "while 可表当……时、而、虽然；两个相反事实并列时译而，不能译成当。",
    "items": [
      {
        "q": "while 到底是时间、对比还是让步？",
        "a": "三个测试：两个动作同时进行，是时间；两个事实相反、可换成 but，是对比；能换成 although，是让步。对比义的 while 前后分句主语通常不同，且中间有逗号。翻译时按测试结果选当……时、而或虽然。",
        "good": "My father likes tea, while my mother prefers coffee.",
        "bad": "My father likes tea, while my mother she prefers coffee."
      },
      {
        "q": "whereas 和 while 的对比用法一样吗？",
        "a": "意思一样，但 whereas 只能表对比，不能表时间或让步，语气更正式，多用于书面论述。while 用法更广，也更口语。写作时若要明确表示对比、避免歧义，用 whereas 更稳妥。"
      },
      {
        "q": "对比义的 while 前面一定要加逗号吗？",
        "a": "通常要加，因为它连接的是两个相对独立的分句，逗号能让对比关系更清楚。若两个分句都很短，逗号有时可省，但考试写作里加上更安全。时间义的 while 从句放句首时，后面同样用逗号隔开。"
      }
    ]
  },

  "now-that": {
    "summary": "now that 表既然，理由是已知事实，主句不能再加 so；回答 why 仍要用 because。",
    "items": [
      {
        "q": "now that 和 because 有什么不同？",
        "a": "because 给出的是直接原因，可以回答 why，也能用于强调句；now that 给出的是双方已知或刚出现的情况，重点在主句的结论，译既然。所以回答 Why did he leave 只能用 because，不能用 now that。",
        "good": "Now that you mention it, I do remember.",
        "bad": "Now that you mention it, so I do remember."
      },
      {
        "q": "now that 里的 that 能省略吗？",
        "a": "口语里可以，只说 now：Now you're here, we can start。此时 now 起连词作用，意思仍是既然。但书面语保留 that 更清楚，也能避免和表示时间的 now 混淆。"
      },
      {
        "q": "given that 后面只能接从句吗？",
        "a": "不是，given 也可直接接名词或名词短语：Given the circumstances, we should wait。接从句时加 that：Given that the data are incomplete, …。seeing that 则一般只接从句，that 可省。"
      }
    ]
  },

  "as-long-as": {
    "summary": "as long as 表只要时接完整从句，用一般现在时表将来；表达长达时只接数量。",
    "items": [
      {
        "q": "as long as 什么时候是只要，什么时候是一样长？",
        "a": "看后面接什么。接主语和谓语，就是条件从句，译只要；只接名词、代词或数量，就是比较结构，译和……一样长，如 as long as two meters。判断时找后面有没有谓语动词，这是最直接的标准。",
        "good": "You can use my bike as long as you return it tonight.",
        "bad": "You can use my bike as long as you will return it tonight."
      },
      {
        "q": "as long as 和 so long as 有区别吗？",
        "a": "意思相同，都表示只要，so long as 稍口语、在美式英语里更常见，as long as 更通用。写作里两者都可，但同一篇文章最好统一用一个，避免风格不一致。"
      },
      {
        "q": "as long as 从句能用将来时吗？",
        "a": "不能。条件从句用一般现在时表将来，主句才用 will 或情态动词：As long as it doesn't rain, we'll go。若强调完成，用现在完成时：As long as you have finished, you may leave。"
      }
    ]
  },

  "as-if": {
    "summary": "as if 用陈述还是虚拟看是否与事实相反；与过去相反用 had done，与现在相反用过去式。",
    "items": [
      {
        "q": "as if 后面到底用陈述还是虚拟？",
        "a": "看可能性。说话人认为很可能为真，用陈述语气：It looks as if it is going to rain。明知与事实相反，用虚拟：He talks as if he knew everything。判断标准是像不像真的，不是固定搭配。"
      },
      {
        "q": "as if 从句里用 was 还是 were？",
        "a": "虚拟语气里正式用法是 were，适用于所有人称：as if he were the boss。口语中第一、三人称单数常用 was，考试和正式写作按 were 更稳。若从句是陈述语气，就按实际人称用 is 或 was。"
      },
      {
        "q": "as if 后面能直接跟 to do 吗？",
        "a": "能，条件是主句主语和不定式的逻辑主语一致，且动作简短：He raised his hand as if to ask a question。这种结构相当于省略了主语和 be 动词，后面直接接动词原形。",
        "good": "She opened her mouth as if to speak.",
        "bad": "She opened her mouth as if to speaking."
      }
    ]
  },

  "as-phrase": {
    "summary": "as well as 连接主语时谓语随前面的主语；as for 后接宾格。",
    "items": [
      {
        "q": "as well as 连接两个主语，谓语用单数还是复数？",
        "a": "随前面的主语，因为 as well as 后面的成分只是补充。The teacher as well as the students was invited 中核心是 teacher，用 was。这点和 and 不同：and 连接两个主语时谓语用复数。划掉 as well as 部分再定谓语最稳。"
      },
      {
        "q": "as for 后面接主格还是宾格？",
        "a": "接宾格，因为 for 是介词：as for me、as for him。不能写 as for I。它常用于句首，引出新话题，译至于。类似结构 as to 后面也接名词或 wh- 从句。",
        "good": "As for me, I prefer to stay at home.",
        "bad": "As for I, I prefer to stay at home."
      },
      {
        "q": "as a result 和 as a result of 怎么区分？",
        "a": "as a result 是副词短语，单独使用，后面用逗号：As a result, prices rose。as a result of 是介词短语，后面必须接名词：as a result of the strike。看后面有没有名词，就能判断该用哪个。"
      }
    ]
  },

  "as-time-cause": {
    "summary": "as 可表随着也可表由于；能换 since 的是原因，能换 while 的是时间，别乱译。",
    "items": [
      {
        "q": "as 表随着和表由于怎么判断？",
        "a": "用替换法：换成 since 读得通，就是原因；换成 while 或 when 读得通，就是时间。另外时间义的 as 常与变化类动词连用，如 grow、rise、approach，强调同步变化；原因义的 as 从句多说明已知理由，主句是结论。"
      },
      {
        "q": "as 表随着时，从句能用将来时吗？",
        "a": "不能。它属于时间从句，用一般现在时表将来：As the years pass, she will grow wiser。若强调完成，用现在完成时。这与 when、while 的规则一致。",
        "good": "As the years pass, she grows wiser.",
        "bad": "As the years will pass, she grows wiser."
      },
      {
        "q": "as 表原因和 because 能互换吗？",
        "a": "意思接近，但 as 语气弱，给的是对方已知的理由，重点在主句；because 语气强，回答 why，也能用于强调句。若句子是 It was … that … 的强调结构，只能用 because，不能用 as。"
      }
    ]
  }
};
