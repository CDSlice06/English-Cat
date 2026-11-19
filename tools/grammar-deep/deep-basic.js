// 语法基础与长句处理：13 个知识点，供语法本「深入」层展示。
// 每条包含 label / definition / identify / usage / translate / trap / examples。

module.exports = {
  "five-patterns": {
    "label": "五种基本句型（SV / SVO / SVP / SVOO / SVOC）",
    "definition": "英语里的句子基本都能归到五种基本句型，区别只在谓语动词后面跟了什么成分，骨架永远只有一套。",
    "identify": "先找谓语动词，再看它后面跟了没有、跟几个：后面不跟宾语是 SV，跟一个宾语是 SVO，跟表语是 SVP，跟两个宾语是 SVOO，宾语后还有补语是 SVOC。",
    "usage": "先立住主语和谓语，再数谓语后面跟几样：不跟宾语是 SV，跟一个宾语是 SVO，跟表语是 SVP，跟两个宾语是 SVOO，宾语后还有补语是 SVOC。区分 SVOO 和 SVOC，只需在两个成分之间加 be：讲得通的是补语，如 They elected him chairman；讲不通的是双宾语，如 He gave me a book。",
    "translate": "按“谁—做什么—对谁—怎么样”的中文顺序译；SVP 把表语译成“是……的”，SVOC 常译成“使/让……怎么样”。",
    "trap": {
      "wrong": "The news made him happily.",
      "right": "The news made him happy.",
      "note": "make 后接形容词作宾语补足语，表示“使某人处于某种状态”，不能用副词 happily；him 和 happy 之间能加 be，属于 SVOC 结构。"
    },
    "examples": [
      { "en": "The teacher asked us to hand in our essays by Friday.", "zh": "老师要求我们在周五前交论文。" },
      { "en": "The old bridge has stood there for more than a century.", "zh": "这座老桥在那里矗立了一个多世纪。" },
      { "en": "She offered the guests a warm cup of tea.", "zh": "她给客人们端上一杯热茶。" }
    ]
  },

  "sentence-elements": {
    "label": "句子成分（主谓宾定状补）",
    "definition": "句子成分是词或短语在句中担任的角色：主语、谓语、宾语、定语、状语、补语，各司其职，缺一不可。",
    "identify": "主语是动作的发出者，谓语是动作或状态，宾语是动作承受者；定语修饰名词，状语修饰动词或整句，补语补充说明宾语或主语，删掉意思就不完整。",
    "usage": "拆句顺序：先圈谓语动词，再往前找主语，往后找宾语；名词前后的修饰是定语；表示时间、地点、原因、方式、程度的是状语；宾语后说明“它怎么样/是什么”的是补语。定语回答“哪一个”，状语回答“何时何地为何如何”，补语回答“怎么样”。",
    "translate": "中文按“定语前置、状语灵活、补语后置”处理：定语加“的”，状语常放动词前，补语译成“得……”或“使……”。",
    "trap": {
      "wrong": "She speaks English very good.",
      "right": "She speaks English very well.",
      "note": "修饰动词 speaks 要用副词 well，good 是形容词，只能作定语或表语，不能放在动词后面修饰动作。"
    },
    "examples": [
      { "en": "The students in the front row answered the question confidently.", "zh": "前排的学生自信地回答了这个问题。" },
      { "en": "The committee considered the new proposal completely impractical.", "zh": "委员会认为这个新提议完全不切实际。" },
      { "en": "We met an old friend at the station yesterday.", "zh": "我们昨天在车站遇到了一位老朋友。" }
    ]
  },

  "articles": {
    "label": "冠词（a / an / the 与零冠词）",
    "definition": "冠词放在名词前，a/an 表示“一个、某一类”，the 表示“特定的那个”，零冠词就是名词前什么也不加。",
    "identify": "单数可数名词前通常必须有冠词；首次提到用 a/an，再次提到用 the；世上唯一或上下文明确用 the；复数泛指、不可数泛指、专有名词和固定短语常不用冠词。",
    "usage": "三步判断：①名词是否可数单数，是就必须带冠词；②听者能否确定是哪一个，能确定就用 the，不能确定就用 a/an；③a/an 看读音不看字母，如 an hour、a university。固定短语整块记：in the morning、at night、go to school、play the piano。另外，a/an 只用于单数可数名词，复数和不可数名词泛指时用零冠词。",
    "translate": "a/an 常译“一个”或干脆不译；the 译“这个/那个”或不译；复数泛指不译。中文没有冠词，不要见名词就硬加“一个”。",
    "trap": {
      "wrong": "He is a honest man.",
      "right": "He is an honest man.",
      "note": "honest 的 h 不发音，开头实际是元音音素，所以用 an；a/an 看读音，不看拼写字母，元音音素前用 an。"
    },
    "examples": [
      { "en": "The scientist who discovered the vaccine won a major prize.", "zh": "发现这种疫苗的科学家获得了一项大奖。" },
      { "en": "Children need plenty of sleep to grow well.", "zh": "孩子需要充足的睡眠才能长得好。" },
      { "en": "She plays the violin in a local orchestra.", "zh": "她在一个本地乐团拉小提琴。" }
    ]
  },

  "prepositions": {
    "label": "介词（时间、地点、方式与固定搭配）",
    "definition": "介词是句子里的“关系词”，把名词和别的成分连起来，表示时间、地点、方式、原因等关系。",
    "identify": "介词后面一定跟名词、代词或动名词，不跟句子；看到 in/on/at/for/by/with 先判断它管的是时间、地点还是方式，再看是不是固定搭配。",
    "usage": "时间：in 年、月、季节，on 具体某天，at 时刻；地点：in 大范围，on 表面或街道，at 具体点；方式：by 交通工具或手段，with 工具，in 语言或材料。介词后接动词一律用 doing，如 look forward to hearing。固定搭配整块记，不能照中文逐字换；介词短语还能作定语和状语，位置不同，修饰的对象也不同。",
    "translate": "介词常不单独译，融进动词或方位词里：in the box 译“在盒子里”，by bus 译“坐公交”，with a pen 译“用笔”，不要逐字对译。",
    "trap": {
      "wrong": "I am looking forward to hear from you.",
      "right": "I am looking forward to hearing from you.",
      "note": "look forward to 里的 to 是介词，不是不定式符号，后面必须接动名词 hearing，这一点最容易按中文习惯写错。"
    },
    "examples": [
      { "en": "The meeting has been put off until next Tuesday.", "zh": "会议被推迟到下周二。" },
      { "en": "She solved the problem by asking her colleagues for help.", "zh": "她通过向同事求助解决了这个问题。" },
      { "en": "They arrived at the airport two hours before the flight.", "zh": "他们在航班起飞前两小时到达了机场。" }
    ]
  },

  "pronoun-types": {
    "label": "代词细类（人称 / 物主 / 指示 / 不定）",
    "definition": "代词用来代替名词或名词短语，按功能分成人称、物主、指示、不定等几类，各有各的位置和搭配。",
    "identify": "人称代词分主格和宾格；物主代词分形容词性和名词性；指示代词是 this/that/these/those；不定代词是 some/any/few/little/both/either/neither/all/none 这一类，要按数量和可数性区分。",
    "usage": "some 多用于肯定句，any 多用于否定句和疑问句；few/a few 修饰可数名词，little/a little 修饰不可数，带 a 表示“有一些”，不带 a 表示“几乎没有”；both/either/neither 管两者，all/none 管三者及以上，either 是“两者之一”，neither 是“两者都不”，none 是“一个也没有”。修饰可数名词用 few，修饰不可数名词用 little，两类不能混用。",
    "translate": "主格和宾格都译“我/他”，名词性物主代词译“我的（东西）”；few 译“很少”，a few 译“几个”，neither 译“两者都不”，none 译“一个也没有”。",
    "trap": {
      "wrong": "Neither of the two answers are correct.",
      "right": "Neither of the two answers is correct.",
      "note": "neither of 作主语时谓语用单数 is；neither 本身已含否定，句中不能再加 not，否则就成了双重否定。"
    },
    "examples": [
      { "en": "Some of the students had read the novel, but none of them could explain it.", "zh": "有些学生读过这本小说，但没有一个人能解释它。" },
      { "en": "Either of these two routes will take you to the station.", "zh": "这两条路线中的任何一条都能带你到车站。" },
      { "en": "This is my notebook; yours is on the desk.", "zh": "这是我的笔记本，你的在桌上。" }
    ]
  },

  "substitution": {
    "label": "替代（do so / one / that / so）",
    "definition": "替代是用一个短词顶替前面出现过的内容，避免重复；英语里常用 do so、one/ones、that/those、so 四种形式。",
    "identify": "看替代词替代的是什么：do so 替代动作或动词短语；one/ones 替代可数名词；that/those 替代前面提到的名词，后面常带 of/in 等修饰；so 替代整个从句或形容词。",
    "usage": "do so 代替动词短语，如 He asked me to leave and I did so；one/ones 代替可数名词，前面常有形容词，如 a red one；that/those 代替前面提到的名词，常带 of/in 等后置修饰，如 the climate of Japan is milder than that of Korea；so 代替整个从句，如 I think so，也可代替形容词，如 so is she。先判断被替代的是动作、名词还是从句，再选替代词，就不会混用。",
    "translate": "中文一般不译出替代词，直接用“这样/也一样/那个”带过；that/those 常译成“的”字结构，如“韩国的（气候）”。",
    "trap": {
      "wrong": "The population of China is larger than one of India.",
      "right": "The population of China is larger than that of India.",
      "note": "这里替代的是不可数的 population，不能用 one；替代前面带 of 修饰的名词要用 that，单数用 that，复数用 those。"
    },
    "examples": [
      { "en": "He promised to call me back, but he never did so.", "zh": "他答应给我回电话，却从没这样做。" },
      { "en": "I do not like this dictionary; please show me a smaller one.", "zh": "我不喜欢这本词典，请给我拿一本小一点的。" },
      { "en": "The rules of this game are simpler than those of chess.", "zh": "这个游戏的规则比国际象棋的规则简单。" }
    ]
  },

  "nonfinite-advanced": {
    "label": "非谓语进阶（having done / being done）",
    "definition": "having done 和 being done 是分词的进阶形式，专门用来把两个动作的先后顺序或主动被动关系说清楚。",
    "identify": "having done 表示动作发生在谓语之前，且逻辑主语是主动的；being done 表示与谓语同时发生，且逻辑主语是被动的；两者都常出现在句首或逗号后作状语。",
    "usage": "先找逻辑主语，再看它和谓语的时间关系：动作先发生且逻辑主语是主动的，用 having done，如 Having finished the report, she went home；动作同时进行且逻辑主语是被动的，用 being done，如 Being asked to speak, he stood up。否定式把 not 放最前面：Not having received a reply, he wrote again。这两种形式都不能单独作谓语，句中真正的谓语仍由主句提供。",
    "translate": "having done 译“……之后/因为已经……”；being done 译“由于被……/在被……时”；中文按时间顺序先译状语，再译主句，不必保留分词形式。",
    "trap": {
      "wrong": "Having finished his homework, the TV was turned on.",
      "right": "Having finished his homework, he turned on the TV.",
      "note": "分词作状语时逻辑主语必须和主句主语一致；作业不是打开电视的人，这是悬垂分词。"
    },
    "examples": [
      { "en": "Having lived in the city for years, she knew every corner of it.", "zh": "在这座城市住了多年，她熟悉它的每一个角落。" },
      { "en": "Being constantly interrupted, the speaker lost her train of thought.", "zh": "由于不断被打断，演讲者乱了思路。" },
      { "en": "Not having been informed of the change, the staff arrived late.", "zh": "由于没有被告知变动，员工们来晚了。" }
    ]
  },

  "modal-advanced": {
    "label": "情态进阶（need / dare / ought to / had better）",
    "definition": "need 和 dare 是半情态动词，兼有情态和实义两种用法；ought to 和 had better 是情态短语，后面一律接动词原形。",
    "identify": "need/dare 用于否定和疑问时可作情态动词，后接动词原形、不加 to；作实义动词时第三人称加 -s、后面接 to do。ought to 和 had better 后面一律接动词原形。",
    "usage": "need 作情态动词：Need I say more? / You needn't worry；作实义动词：He needs to see a doctor。dare 同理：Dare you ask her? / He dares to speak。ought to 表示“应该”，否定是 ought not to；had better 表示“最好”，否定是 had better not，后面不加 to。回答 need 的疑问句时，肯定用 must，否定用 needn't。判断是情态还是实义，看形式和主语：后面直接跟动词原形、疑问和否定不加 do 的是情态，第三人称单数加 -s、后面接 to do 的是实义。",
    "translate": "needn't 译“不必”，mustn't 译“禁止”；ought to 译“应该”；had better 译“最好”，had better not 译“最好别”，语气都比 should 更口语。ought to 的否定也可缩写成 oughtn't to，had better 的否定直接在后面加 not。",
    "trap": {
      "wrong": "You had better not to stay up late.",
      "right": "You had better not stay up late.",
      "note": "had better 后直接接动词原形，否定形式是 had better not do，不能加 to，也不要写成 hadn't better；它比 should 语气更强，多用于提醒和劝告。"
    },
    "examples": [
      { "en": "You needn't book a table; the restaurant is never full on weekdays.", "zh": "你不必订位，这家餐厅工作日从不坐满。" },
      { "en": "She ought to apologize for what she said at the meeting.", "zh": "她应该为会上说的话道歉。" },
      { "en": "Dare he tell the truth in front of everyone?", "zh": "他敢当着所有人的面说出真相吗？" }
    ]
  },

  "long-insertion": {
    "label": "长句结构：插入语与分隔",
    "definition": "插入语是插在句子中间、用逗号或破折号隔开的成分，它不充当句子成分，删掉后句子依然完整。",
    "identify": "长句里看到两个逗号、两个破折号或一对括号夹住的一小段，先判断它是不是插入语；常见信号是 however、therefore、for example、in fact、I think、as a result。",
    "usage": "三步拆：①把插入语整体括起来先跳过，主句的主谓立刻显形；②判断插入语的作用，是转折、举例、补充还是说话人态度；③再把插入语放回中文的句首或分句位置。注意插入语常把主谓或动宾隔开，别把被隔开的两半当成两个成分。",
    "translate": "插入语按功能译到句首：“然而/因此/例如/事实上/我认为”，不要卡在原位置；破折号里的内容可译成括号或独立短句。",
    "trap": {
      "wrong": "The plan, I think, it will take too long.",
      "right": "The plan, I think, will take too long.",
      "note": "插入语 I think 不占句子成分，删掉也成立；主句主语 the plan 之后直接接谓语 will take，不能再加一个 it 作主语。"
    },
    "examples": [
      { "en": "The new policy, however, will not affect small businesses.", "zh": "然而，新政策不会影响小企业。" },
      { "en": "Many students, especially those in rural areas, lack reliable internet access.", "zh": "许多学生，尤其是农村地区的学生，缺乏稳定的网络。" },
      { "en": "The data, collected over ten years, suggest a clear downward trend.", "zh": "这些数据采集了十年，显示出明显的下降趋势。" }
    ]
  },

  "long-inversion": {
    "label": "长句结构：倒装与前置",
    "definition": "倒装是把谓语或助动词提到主语前面；前置是把状语、表语等本来不居首的成分放到句首。",
    "identify": "句首出现否定词（not、never、hardly、seldom、little）、only 加状语、so/such ... that 或地点状语，而主谓顺序反常，就是倒装；先找助动词，再找真正的主语，语序还原后意思就清楚了。",
    "usage": "拆解步骤：①确认句首成分是否触发倒装；②把助动词、be 或情态动词放回主语后面，还原正常语序；③分清部分倒装和完全倒装，后者多见于 here/there 或地点状语加 be/come/lie。not until 放句首时，倒装发生在主句，不是 until 从句。",
    "translate": "按还原后的正常语序译：Not until ... did ... 译“直到……才……”；Only by ... can ... 译“只有……才……”；Never ... 译“从不……”，不要照搬倒装语序，前置成分只是强调，不影响句子主干。",
    "trap": {
      "wrong": "Not until he left did I realized how much I owed him.",
      "right": "Not until he left did I realize how much I owed him.",
      "note": "did 已经承担了过去时，后面的实义动词必须用原形 realize，不能再加 -ed，这是倒装句最常见的错。"
    },
    "examples": [
      { "en": "Only when the results were published did the public learn the truth.", "zh": "直到结果公布，公众才得知真相。" },
      { "en": "Seldom has the committee faced such a difficult decision.", "zh": "委员会很少面对如此艰难的决定。" },
      { "en": "On the table lay a stack of letters nobody had opened.", "zh": "桌上放着一叠没人拆开过的信。" }
    ]
  },

  "long-ellipsis": {
    "label": "长句结构：省略与替代",
    "definition": "省略是把重复或可推知的成分删掉，替代是用 do/one/that/so 等短词顶替，两者都让长句更紧凑。",
    "identify": "长句里出现“缺主语或缺谓语”却读得通，或出现 do/did/one/that/so 指代前文，就是省略或替代；常见于状语从句、比较结构和并列句。",
    "usage": "拆解步骤：①先找完整的主谓，看哪里缺了；②按语法补回被省的成分，多为“主语 + be”；③把替代词还原成前文的内容再理解。比较句 than 后、状语从句 when/while/if 后、并列句第二分句，是省略最集中的三个位置。",
    "translate": "被省的部分中文常常要补出来才通顺：“如果有必要/被问到时/比预期更……”；替代词不必译，但要把它指代的内容说清楚。",
    "trap": {
      "wrong": "When asking about the delay, he said nothing.",
      "right": "When asked about the delay, he said nothing.",
      "note": "when 从句省略了 he was，主语 he 是被问的人，必须用被动 asked，不能用主动 asking，否则逻辑主语就错了。"
    },
    "examples": [
      { "en": "The results were better than expected, although some data were missing.", "zh": "尽管缺少一些数据，结果还是比预期的好。" },
      { "en": "She can speak French, and her brother can too.", "zh": "她会说法语，她弟弟也会。" },
      { "en": "If necessary, the meeting will be moved online.", "zh": "如果有必要，会议将改到线上举行。" }
    ]
  },

  "long-parallel": {
    "label": "长句结构：并列与对比",
    "definition": "并列是把结构相同、地位对等的成分用 and/but/or 等连起来；对比是并列中带有相反或对照关系。",
    "identify": "看到 and、but、or、not only ... but also、rather than、while、whereas 先找它连接的两端；两端词性或结构必须一致，长句里常被修饰语拉得很远，先跳过中间部分直接看两端。",
    "usage": "拆解步骤：①圈出并列连词，确定它连的是词、短语还是分句；②把连词两边对齐，检查结构是否平行；③遇到 not only ... but also、either ... or、neither ... nor，第二部分要和第一部分形式一致。长句里先跳过中间修饰语，直接找连词两端。",
    "translate": "and 译“和/并且”，but 译“但是”，while/whereas 表对比时译“而/相比之下”，rather than 译“而不是”；中文可重复动词让对比更清楚。",
    "trap": {
      "wrong": "She likes reading, swimming and to paint.",
      "right": "She likes reading, swimming and painting.",
      "note": "and 连接的并列成分要形式一致，前面是动名词 reading、swimming，后面也必须用动名词 painting，不能换成不定式。"
    },
    "examples": [
      { "en": "The report is not only longer than the previous one but also far more detailed.", "zh": "这份报告不仅比上一份长，而且详细得多。" },
      { "en": "Some countries rely on coal, whereas others have shifted to wind and solar power.", "zh": "有些国家依赖煤炭，而另一些国家已转向风能和太阳能。" },
      { "en": "He chose to resign rather than accept the unfair terms.", "zh": "他选择辞职，而不是接受不公平的条款。" }
    ]
  },

  "long-postmodifier": {
    "label": "长句结构：后置修饰叠加",
    "definition": "后置修饰是放在名词后面修饰它的成分，如介词短语、分词短语、定语从句；叠加就是好几个接连跟在一个名词后。",
    "identify": "长句里名词后面连着出现 of/in 介词短语、doing/done 分词、who/which/that 从句，就是后置修饰叠加；先找到名词，再判断每一层修饰到哪里结束。",
    "usage": "拆解步骤：①先锁定中心名词；②把每个后置修饰单独切开，判断它修饰中心名词还是修饰前一个修饰语；③按“由近到远”往里剥，离名词最近的修饰关系最紧。遇到连串 of 短语时从最后一个 of 往前读，再套定语从句就不会乱。",
    "translate": "中文把修饰成分前置成“的”字结构，按从远到近排列，如 the number of students who ... 译“……的学生的数量”；太长时拆成短句另说。",
    "trap": {
      "wrong": "The number of students who studies abroad has risen.",
      "right": "The number of students who study abroad has risen.",
      "note": "定语从句的谓语跟先行词 students 一致，用复数 study；主句谓语才跟 the number 用单数 has，两个主语别混。"
    },
    "examples": [
      { "en": "The number of people who work from home has increased sharply in recent years.", "zh": "近年来居家办公的人数急剧增加。" },
      { "en": "The proposal put forward by the committee at yesterday's meeting was rejected.", "zh": "委员会在昨天会上提出的建议被否决了。" },
      { "en": "The idea that machines might replace teachers worries many parents.", "zh": "机器可能取代老师的想法让许多家长担忧。" }
    ]
  }
}
