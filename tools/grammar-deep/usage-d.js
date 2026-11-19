module.exports = {
  "correlative": {
    "summary": "关联词作主语看就近：both...and 用复数，either...or、neither...nor 随最近主语。",
    "items": [
      {
        "q": "both...and 连接两个单数主语，谓语为什么反而用复数？",
        "a": "both...and 表示两者都包括，整体是复数概念，谓语一律用复数，不受两个主语单复数影响。即使换成 Both the teacher and the student，也用 are。注意 both...and 不用于否定句，否定两者应改用 neither...nor。",
        "good": "Both the teacher and the student are coming.",
        "bad": "Both the teacher and the student is coming."
      },
      {
        "q": "either...or 连接的主语，谓语到底跟哪一个？",
        "a": "遵循就近原则，谓语与最靠近动词的主语一致。Either you or he is right. 反过来 Either he or you are right. neither...nor、not only...but also 连接主语时同样就近。判断时别再看第一个主语，直接看 or 后面的名词。",
        "good": "Either the students or the teacher is going to attend the meeting.",
        "bad": "Either the students or the teacher are going to attend the meeting."
      },
      {
        "q": "not only...but also 的谓语看哪边，not only 放句首要不要倒装？",
        "a": "连接主语时按就近原则，看 but also 后面的主语，如 Not only the students but also the teacher was late。若 not only 提到句首连接分句，前半句部分倒装，后半句不倒：Not only did he come, but he also stayed.",
        "good": "Not only the students but also the teacher was late.",
        "bad": "Not only the students but also the teacher were late."
      }
    ]
  },

  "semicolon-parallel": {
    "summary": "分号连接两个能独立成句的分句；逗号不能单独承担这个任务，否则就是逗号粘连。",
    "items": [
      {
        "q": "分号和逗号都能隔开句子，到底差在哪？",
        "a": "逗号不能单独连接两个完整句子，硬连就是逗号粘连；分号可以，因为它的分隔力更强，前后都必须是能独立成句的分句。I came; I saw; I conquered. 若一边只是短语，就不能用分号。分号后接 however、therefore 时，分号在前、逗号在后。",
        "good": "The weather was bad; however, we went out.",
        "bad": "The weather was bad, however, we went out."
      },
      {
        "q": "分号两边的分句必须结构完全一样吗？",
        "a": "不要求语法完全对称，但最好结构相近、长度相当，读起来才平衡。真正要求严格平行的是 not only...but also、either...or 这类关联词。另外，列举项内部本身含逗号时，要用分号分隔各项，否则逗号层级混乱，读者分不清哪几个是一组。",
        "good": "We bought apples, which were fresh; pears, which were ripe; and grapes.",
        "bad": "We bought apples, which were fresh, pears, which were ripe, and grapes."
      },
      {
        "q": "分号后面能不能直接跟 because、that 这类从句？",
        "a": "不能。分号后必须能独立成句，而 because、that、which 引导的是从属分句，不能单独站住。Because it rained; we stayed home 是错的，应改成 Because it rained, we stayed home。要用分号表因果，后半句得写成完整句，用 therefore 连接。",
        "good": "It rained heavily; therefore, we stayed at home.",
        "bad": "Because it rained heavily; we stayed at home."
      }
    ]
  },

  "colon-explain": {
    "summary": "冒号引出解释、列举或结论，后面可以接完整句子；冒号前必须是完整分句。",
    "items": [
      {
        "q": "冒号后面能不能接一个完整的句子？",
        "a": "能，而且很常见。冒号后的完整句用来解释前句、给出原因或结论，如 He failed: he had not studied. 冒号前的部分必须能独立成句，所以不能说 He failed because: ...。冒号后首字母可大写也可小写，同一篇里统一即可；冒号一句中通常只出现一次。",
        "good": "He was late: the traffic was terrible.",
        "bad": "He was late because: the traffic was terrible."
      },
      {
        "q": "冒号和分号都放在句中，选择时看什么？",
        "a": "看后半句和前半句的逻辑关系。冒号后是对前句的解释、列举或结果，是从属说明，能换成 namely、that is；分号连接的是地位对等的两个分句，能换成 and、but。前者是“也就是说”，后者是“另外一件事”，逻辑不同，不能凭手感随便换。",
        "good": "She brought three things: a pen, a map, and a camera.",
        "bad": "She brought three things; a pen, a map, and a camera."
      },
      {
        "q": "冒号后面能直接列名词吗，前面能不能加 such as？",
        "a": "能直接列举名词或短语，如 three tools: a hammer, a saw, and a drill。但冒号前不能再出现 such as、including、like，否则功能重复。冒号也不能插在动词和宾语之间，不能说 He bought: milk and eggs。",
        "good": "The kit contains three tools: a hammer, a saw, and a drill.",
        "bad": "The kit contains three tools such as: a hammer, a saw, and a drill."
      }
    ]
  },

  "not-but": {
    "summary": "not A but B 中 B 才是重点，谓语随 B；两部分必须同类同形，不能一边名词一边句子。",
    "items": [
      {
        "q": "not...but 两边为什么必须写成同一种成分？",
        "a": "因为它是并列结构，not 和 but 后必须接同类成分：名词对名词、介词短语对介词短语、从句对从句。可以说 He is not a teacher but a doctor，不能说 not a teacher but he is a doctor。下笔前先看 not 后是什么，再让 but 后完全对称。",
        "good": "She wants not money but the respect of her colleagues.",
        "bad": "She wants not money but she wants the respect of her colleagues."
      },
      {
        "q": "not A but B 作主语时，谓语跟 A 还是跟 B？",
        "a": "跟 B，也就是 but 后面的名词，按就近原则处理。Not the students but the teacher is responsible. 这与 either...or 一致。若 not...but 连接的是宾语、表语或状语，谓语仍随原来的主语，不涉及一致性，只有连接主语时才需要判断。",
        "good": "Not the students but the teacher is responsible for the mistake.",
        "bad": "Not the students but the teacher are responsible for the mistake."
      },
      {
        "q": "not...but 和 not only...but also 意思一样吗？",
        "a": "不一样。not...but 否定前者、肯定后者，是取舍：He is not clever but diligent 是“不聪明但勤奋”。not only...but also 两者都成立，后者更进一步：He is not only clever but also diligent 是“既聪明又勤奋”。混用会改变句意。",
        "good": "He is not lazy but careless.",
        "bad": "He is not only lazy but careless."
      }
    ]
  },

  "coordination": {
    "summary": "and、or、but 连接的成分要同级同形；and 连接不同主语用复数，or 按就近原则。",
    "items": [
      {
        "q": "and 两边一个用 doing、一个用 to do，算不算错？",
        "a": "算。并列连词前后要同词性、同结构：She enjoys singing and dancing 对，singing and to dance 错。成分一长容易忘，可把两边各缩成一个词比较，能对上才算平行。介词和冠词也常要重复，如 in the morning and in the evening。",
        "good": "She enjoys singing and dancing at weekend parties.",
        "bad": "She enjoys singing and to dance at weekend parties."
      },
      {
        "q": "and 连接两个主语，谓语一定用复数吗？",
        "a": "一般用复数，如 Tom and I are friends。但指同一个人或同一概念时用单数：The writer and poet is here 是作家兼诗人一个人；The writer and the poet are here 是两个人。判断看第二个名词前有没有冠词，有 the 通常指两个人。",
        "good": "The writer and poet is giving a talk tonight.",
        "bad": "The writer and poet are giving a talk tonight."
      },
      {
        "q": "or 除了“或者”，还有什么用法？",
        "a": "or 还能表示“否则”，常用于祈使句加 or 加陈述句：Hurry up, or you will be late。表选择时它连接对等成分，主语一致按就近原则；表否则时 or 相当于 otherwise，两边都是完整分句。两种用法的逗号位置不同，前者通常有逗号，后者连接词或短语时没有。",
        "good": "Take an umbrella, or you will get wet.",
        "bad": "Take an umbrella, and you will get wet."
      }
    ]
  },

  "elliptical-clause": {
    "summary": "状语从句省略的条件是主语与主句一致且含 be；主动留 doing，被动留 done。",
    "items": [
      {
        "q": "when、while、if 引导的从句，什么时候能省掉主语和 be？",
        "a": "两个条件同时满足才行：从句主语与主句主语相同，且从句谓语含 be。When (he was) young, he lived here. 省略后主动关系用 doing，被动关系用 done：When asked, he kept silent。主语不同就不能省，否则补回去会变成另一个意思。",
        "good": "When asked about the accident, he said nothing.",
        "bad": "When asking about the accident, he said nothing."
      },
      {
        "q": "being 能不能一起省？if 从句的省略有什么特别？",
        "a": "从句是 being 加表语时，being 常和主语一起省，如 While (he was) at school。但 if 条件句里的 were、had、should 省略后必须倒装：Were I you、Had he come、Should it rain，不能只删词不倒装。两种规则不同，别混着用。",
        "good": "Were I in your position, I would accept the offer.",
        "bad": "If I in your position, I would accept the offer."
      },
      {
        "q": "省略以后怎么检查主语到底一不一致？",
        "a": "把省掉的部分补回去，看主语是否与主句一致。While reading the book, the phone rang 补回去成了 While the phone was reading the book，显然荒谬，所以错；应说 While I was reading the book, the phone rang。动笔前先还原一遍。",
        "good": "While reading the book, she took careful notes.",
        "bad": "While reading the book, the phone rang loudly."
      }
    ]
  },

  "ellipsis": {
    "summary": "省略要能还原：助动词替代谓语，不定式常留 to，比较句补全后不能有歧义。",
    "items": [
      {
        "q": "不定式后面的动词什么时候可以省，只留 to？",
        "a": "前面已出现同一个动词、避免重复时可只留 to：You may go if you want to. 但句末的 be 保留更清楚，如 He is taller than he used to be。前面是情态动词或助动词时，整个谓语可一起省，只留助动词。",
        "good": "You may leave early if you want to.",
        "bad": "You may leave early if you want to leave to."
      },
      {
        "q": "重复谓语时用 do 替代，有什么限制？",
        "a": "替代词要与前句的人称和时态对应，不能一律用 do：She works harder than he does；前面是 be 动词就直接重复 be，如 She is taller than I am。这种替代只换谓语，主语仍要出现，不能把整个主谓都删掉，否则比较对象就断了。",
        "good": "She works much harder than her brother does.",
        "bad": "She works much harder than her brother do."
      },
      {
        "q": "比较句省略以后产生歧义，怎么处理？",
        "a": "补全成完整分句即可。I like him more than she 是“我比她更喜欢他”，I like him more than her 是“我更喜欢他而不是她”，省略不同，意思不同。写作时若可能误解，就写成 than she does 或 than I like her，别让读者猜。",
        "good": "I like him more than she does.",
        "bad": "I like him more than her does."
      }
    ]
  },

  "there-be": {
    "summary": "there be 表存在，谓语与后面第一个名词一致；它不能和 have“拥有”混用。",
    "items": [
      {
        "q": "There is a pen and two books 这种写法到底对不对？",
        "a": "按就近原则是对的，谓语与最近的主语 a pen 一致用 is。口语里也常一律用 is，但正式写作最好调整语序，让单复数对得上，如 There are two books and a pen。考试按就近原则判，别按“后面总共几样东西”来定。",
        "good": "There is a pen and two books on the desk.",
        "bad": "There are a pen and two books on the desk."
      },
      {
        "q": "there be 和 have 都是“有”，为什么不能互换？",
        "a": "there be 表某处存在，have 表某人拥有。不能说 There has a book on the desk，应说 There is a book on the desk 或 The desk has a book on it。there be 还可带情态动词和完成式：There must be a mistake。",
        "good": "There are two chairs and a desk in the room.",
        "bad": "There have two chairs and a desk in the room."
      },
      {
        "q": "修饰 there be 主语的定语从句用什么关系词？",
        "a": "关系代词作主语时常用 that，也可用 who 或 which；作宾语时可省。There is nothing that can stop us. 还要区分 there be 和 it is：It is a book on the desk 强调“它是”，There is a book 才是“桌上有本书”。",
        "good": "There is nothing that can stop us now.",
        "bad": "There is nothing which can stop us now."
      }
    ]
  },

  "partial-negation": {
    "summary": "not 与 all、both、every 连用多为部分否定；全部否定要用 none、neither、no one。",
    "items": [
      {
        "q": "Not all students passed 是“都没过”还是“没全过”？",
        "a": "是“没全过”，即有些过了、有些没过，属于部分否定。要表达“全都没过”，得用 None of the students passed 或 No student passed。同理 not every 是“并非每个”，全部否定用 no one 或 none，别把 not all 理解成 all not。",
        "good": "Not all the students passed the final exam.",
        "bad": "Not all the students failed the final exam."
      },
      {
        "q": "I don't know both of them 到底是认识几个？",
        "a": "是“并非两个都认识”，通常指只认识其中一个。要表达两个都不认识，用 I know neither of them 或 I don't know either of them。注意 both 前有 not 时不能再用 neither，否则两个否定叠加，句子就错了。",
        "good": "I don't know both of the twin brothers.",
        "bad": "I don't know neither of the twin brothers."
      },
      {
        "q": "All that glitters is not gold 这种 all...not 算不算错？",
        "a": "这是谚语式的部分否定，意思是“并非所有闪光的都是金子”，不算错。但现代英语里 All...not 容易产生歧义，正式写作最好改成 Not all...。口语中 I don't like all of them 一般也理解为部分否定，重音位置会改变意思，书面语应避免这种模糊。",
        "good": "Not all that glitters is gold.",
        "bad": "All that glitters are not gold."
      }
    ]
  },

  "double-negative": {
    "summary": "标准英语里两个否定词相互抵消；要表否定只保留一个否定词，方言用法不算标准。",
    "items": [
      {
        "q": "I don't know nothing 为什么会被理解成“我什么都懂”？",
        "a": "标准英语中两个否定词相互抵消，否定加否定等于肯定，所以这句话字面是“我没有不知道的事”。要表否定只留一个：I don't know anything 或 I know nothing。口语和非标准方言里双重否定可加强否定，但考试和正式写作一律按抵消处理。",
        "good": "I didn't see anybody in the empty classroom.",
        "bad": "I didn't see nobody in the empty classroom."
      },
      {
        "q": "除了 not 和 no，还有哪些词算否定词？",
        "a": "never、nothing、nobody、neither、nor、hardly、barely、without 都带否定含义，句中只能用一个。不能说 He hardly never speaks，应说 He hardly ever speaks。hardly 已是否定，附加问句用肯定式：He hardly speaks, does he?",
        "good": "He hardly ever speaks at public meetings.",
        "bad": "He hardly never speaks at public meetings."
      },
      {
        "q": "not uncommon 这种双重否定是不是也错了？",
        "a": "不是。有些固定结构两个否定表强调肯定，如 not uncommon 是“并不罕见”、not impossible 是“并非不可能”、There is no smoke without fire。这类是修辞性的弱肯定，意思等于肯定，但语气更谨慎。既然已经等于肯定，就不要再叠加第三个否定词。",
        "good": "Such mistakes are not uncommon among beginners.",
        "bad": "Such mistakes are not not uncommon among beginners."
      }
    ]
  },

  "exclamatory": {
    "summary": "感叹名词用 What，感叹形容词或副词用 How；感叹句保持陈述语序，不倒装。",
    "items": [
      {
        "q": "What 和 How 到底看什么来选？",
        "a": "看感叹的中心词。中心词是名词用 What：What a beautiful day! 中心词是形容词或副词用 How：How beautiful the day is! 名词前有 a/an 时，顺序是 What a + 形容词 + 名词。不要按中文“多么”一律用 How，先找中心词再定。",
        "good": "What a clever and hardworking boy he is!",
        "bad": "How a clever and hardworking boy he is!"
      },
      {
        "q": "感叹句要不要像疑问句那样倒装？",
        "a": "不要。感叹句保持陈述语序：What a day it is! 不能写成 What a day is it! 只有 How 直接修饰谓语、省略主谓时才像倒装，如 How time flies! 那是固定说法，不是把主语和谓语调换。看到感叹号不等于要倒装。",
        "good": "What a wonderful time we had at the party!",
        "bad": "What a wonderful time did we have at the party!"
      },
      {
        "q": "How 后面能不能直接跟名词？",
        "a": "不能。How 后接形容词或副词，感叹名词得用 What，或 How + 形容词 + 主语 + be：How lovely the flowers are! 不能说 How lovely flowers! so 和 such 也常混：such a lovely flower，so lovely a flower。",
        "good": "How lovely the flowers in the garden are!",
        "bad": "How lovely flowers in the garden are!"
      }
    ]
  },

  "tag-question": {
    "summary": "反意疑问句前肯后否、前否后肯；答语 Yes/No 看事实，不按中文习惯。",
    "items": [
      {
        "q": "陈述部分有 never、hardly，后面用肯定还是否定问句？",
        "a": "用肯定式。陈述部分含 not、never、hardly、few、little、nobody 等否定词时，附加问句要反过来用肯定：He never smokes, does he? 注意带否定前缀的词如 unhappy 不算否定词，仍用否定问句：She is unhappy, isn't she?",
        "good": "She hardly ever eats meat at home, does she?",
        "bad": "She hardly ever eats meat at home, doesn't she?"
      },
      {
        "q": "He isn't a doctor, is he? 该怎么回答才不按中文说反？",
        "a": "英语答语只看事实：事实肯定就用 Yes，事实否定就用 No，与问句是否否定无关。若他不是医生，答 No, he isn't；中文会顺着说“是的，他不是”，英语不能这样。这是最容易按中文习惯答错的地方，回答前先想事实。",
        "good": "No, he isn't. He works in a bank.",
        "bad": "Yes, he isn't. He works in a bank."
      },
      {
        "q": "I am 和祈使句的附加问句怎么加？",
        "a": "I am 的附加问句用 aren't I，不用 amn't I：I am late, aren't I? 祈使句用 will you，否定的 Don't... 也用 will you。Let's 开头用 shall we，Let us 开头用 will you，意思不同。",
        "good": "I am on the list, aren't I?",
        "bad": "I am on the list, amn't I?"
      }
    ]
  },

  "indirect-speech": {
    "summary": "转述过去的话时态一般后退一步；客观真理、过去完成时和虚拟语气不退。",
    "items": [
      {
        "q": "转述别人的话，时态到底要不要退？",
        "a": "主句是过去时，转述时态通常后退：现在时变过去时，一般过去变过去完成，将来变 would。但客观真理、自然规律不退：He said the earth goes around the sun。过去完成时和 would、could 等本身已无更早形式，保持原样即可。",
        "good": "He said that the earth moves around the sun.",
        "bad": "He said that the earth moved around the sun."
      },
      {
        "q": "now、today、tomorrow 这些词转述时都要改吗？",
        "a": "常规变化是 now 变 then、today 变 that day、tomorrow 变 the next day、yesterday 变 the day before、here 变 there、this 变 that。如果说话时间和地点没变，也可保留原词。考试一般按常规变化处理。",
        "good": "She said she would finish the report the next day.",
        "bad": "She said she will finish the report tomorrow."
      },
      {
        "q": "转述疑问句和祈使句，语序要怎么处理？",
        "a": "转述疑问句要用陈述语序，问句不再倒装，并选 if/whether 或疑问词：He asked if I was ready。转述祈使句用 ask/tell/order somebody to do：She told me to wait，否定用 not to do。不要把原问句的助动词位置照搬过来。",
        "good": "He asked me where I lived the year before.",
        "bad": "He asked me where did I live the year before."
      }
    ]
  },

  "fronted-adverbial": {
    "summary": "普通状语置首不倒装；否定或半否定副词置首才部分倒装，only 修饰状语也如此。",
    "items": [
      {
        "q": "把时间、地点状语放到句首，谓语要不要倒装？",
        "a": "普通状语提前不倒装：Yesterday I met him. 只有否定或半否定副词置首才部分倒装：Never have I seen such a sight。触发词如 never、seldom、hardly、not until。地点状语置首、谓语是 be 或 come、go 时可全部倒装：Here comes the bus。",
        "good": "Never have I seen such a beautiful sunset.",
        "bad": "Never I have seen such a beautiful sunset."
      },
      {
        "q": "only 放在句首，什么时候倒装、什么时候不倒？",
        "a": "only 修饰状语并置于句首时，主句部分倒装：Only then did I understand、Only when he left did she relax。若 only 修饰主语，则不倒装：Only he knew the answer。判断看 only 后是不是状语，是就倒，不是就不倒。",
        "good": "Only then did I realize how serious the problem was.",
        "bad": "Only then I realized how serious the problem was."
      },
      {
        "q": "句首状语后面要不要加逗号？",
        "a": "较短的状语可加可不加：In 2020 he moved abroad。较长或作评注的状语通常加逗号：To be honest, I disagreed。但 not until 置首时主句必须倒装，且不用逗号隔开主从：Not until he apologized did she speak to him。",
        "good": "Not until he apologized did she speak to him.",
        "bad": "Not until he apologized, she spoke to him."
      }
    ]
  },

  "object-complement": {
    "summary": "宾补说明宾语是什么或怎么样，与宾语有主谓关系；双宾语则是两个独立对象。",
    "items": [
      {
        "q": "give me a book 和 elect him chairman 都是两个名词，怎么分？",
        "a": "在宾语和后面的成分之间加 be：通顺的是宾补，We elected him chairman 可说成 He is chairman；双宾语的两个名词各自独立，He gave me a book 不能说 I am a book。被动句也能验证：宾补结构只能以宾语作主语，双宾语可拿间接宾语作主语。",
        "good": "They elected him chairman of the committee.",
        "bad": "They elected him to chairman of the committee."
      },
      {
        "q": "哪些动词后面常接宾补？",
        "a": "使役动词 make、let、have、get，感官动词 see、hear、watch、feel、notice，以及 keep、find、leave、consider、elect 等。感官动词接 doing 表进行片段，接 do 表全过程，接 done 表被动：I saw him cross the street 与 crossing the street 画面不同。",
        "good": "We found the room completely empty after the party.",
        "bad": "We found the room completely emptily after the party."
      },
      {
        "q": "宾补用 to do 还是不带 to 的 do？",
        "a": "主动语态中，make、let、have、see、hear 后的宾补用不带 to 的不定式；变被动后 to 要还原：He was made to work late。help 后的 to 可留可省。形容词、名词、介词短语也能作宾补，如 keep the door open。",
        "good": "The teacher made the students rewrite the essay.",
        "bad": "The teacher made the students to rewrite the essay."
      }
    ]
  }
};
