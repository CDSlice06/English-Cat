// 语法点深度讲解：统一分层结构（定义 / 识别 / 用法 / 翻译 / 易错 / 例句）
// 按语法点 key 索引，供语法本详情页展示。
module.exports = {
  "subject-verb-agreement": {
    "label": "主谓一致（the number of / each / neither…nor）",
    "definition": "主谓一致指谓语单复数跟真正的主语保持一致，不看离它最近的名词。",
    "identify": "先找到主语中心词，再看 the number of、each、neither…nor 这类结构：数量短语看中心词，就近结构看最近的主语。",
    "usage": "三步：一、划掉介词短语找中心词；二、the number of 作主语用单数，a number of 用复数；三、each、either 用单数，neither…nor 连接主语时就近一致。",
    "translate": "中文没有数的变化；但要分清 the number of 是“……的数量”，a number of 是“许多”。",
    "trap": {
      "wrong": "The number of students who attend the lecture are increasing.",
      "right": "The number of students who attend the lecture is increasing.",
      "note": "主语中心词是 the number，不是 students，谓语要用单数 is。"
    },
    "examples": [
      { "en": "The number of applicants has doubled over the past five years.", "zh": "过去五年里，申请人数翻了一番。" },
      { "en": "Neither the manager nor the employees were informed of the change.", "zh": "经理和员工都没有被告知这项变动。" }
    ]
  },
  "nominalization": {
    "label": "名词化结构（the implementation of …）",
    "definition": "名词化是把动词或形容词变成名词来表达，使句子更正式、信息更密集。",
    "identify": "看到 the implementation of 这类“the+名词+of”，后面还跟着动作对象，就是名词化。",
    "usage": "公式：the+动作名词+of+宾语，如 the implementation of the policy。原主语可用 by 引出。多个 of 叠加时，先找中心词，再还原成动词句理解。",
    "translate": "中文常还原成动词：“实施这项政策”，不要机械译成“……的实施”，否则句子又长又绕。",
    "trap": {
      "wrong": "The company announced the implement of the new policy.",
      "right": "The company announced the implementation of the new policy.",
      "note": "implement 是动词，名词化要用 implementation，不能直接加 of。"
    },
    "examples": [
      { "en": "The rapid development of artificial intelligence has changed the job market.", "zh": "人工智能的快速发展改变了就业市场。" },
      { "en": "The successful application of the theory depends on accurate data.", "zh": "这一理论能否成功应用取决于数据是否准确。" }
    ]
  },
  "reflexive-use": {
    "label": "反身代词（主语和宾语同指）",
    "definition": "反身代词指回句子主语，表示动作的承受者就是发出者，如 myself、itself。",
    "identify": "句中出现 myself、yourself、himself、itself 等，且它指的人和主语是同一个，就是反身代词。",
    "usage": "判断法：把反身代词换回主语，意思不变就是同指。它可作宾语、同位语，也用于固定搭配：enjoy oneself 玩得开心，in itself 本身，by oneself 独自。主语是复数时，反身代词也用复数。",
    "translate": "不要一律译“自己”：enjoy oneself 译“玩得开心”，in itself 译“本身”。",
    "trap": {
      "wrong": "The students taught himself to play the guitar.",
      "right": "The students taught themselves to play the guitar.",
      "note": "主语是复数 students，反身代词要用 themselves，不能用 himself。"
    },
    "examples": [
      { "en": "She found herself unable to answer the question.", "zh": "她发现自己回答不了这个问题。" },
      { "en": "The children behaved themselves during the long journey.", "zh": "孩子们在漫长的旅途中很守规矩。" }
    ]
  },
  "by-oneself": {
    "label": "by + 反身代词 / by oneself",
    "definition": "by+反身代词表示“独自、靠自己、不需要别人帮助”，by itself 还可表示“自动地”。",
    "identify": "看到 by oneself、by myself、by themselves 放在动词后，说明动作是主语独自完成的。",
    "usage": "结构是 by+反身代词，反身代词必须和主语一致。它回答 how，相当于 alone 或 without help。注意它不是“被自己”；被动语态才用 by+名词表示动作发出者。by itself 指物时可译“自动地”。",
    "translate": "译成“独自、靠自己、无人帮助”；指物时 by itself 可译“自动地”或“本身”。",
    "trap": {
      "wrong": "He finished the project by him.",
      "right": "He finished the project by himself.",
      "note": "by 表示“独自”时必须接反身代词，不能用人称代词宾格 him。"
    },
    "examples": [
      { "en": "She learned to cook by herself after moving abroad.", "zh": "出国后她学着自己做饭。" },
      { "en": "The machine will shut down by itself if it overheats.", "zh": "如果过热，这台机器会自动关机。" }
    ]
  },
  "formal-it": {
    "label": "it 作形式主语 / 形式宾语",
    "definition": "it 作形式主语或形式宾语时不指任何东西，只占位置，真正内容在后面。",
    "identify": "句首 It is+形容词+to do，或 make/find/think+it+形容词+to do，这里 it 都是形式主语或宾语。",
    "usage": "划掉 it，把后面的 to do 或 that 从句搬到 it 的位置，句子仍成立。常见：It is important to do…；make it possible to do…；find it hard to do…。",
    "translate": "中文把真正内容提前：“做某事很重要”“使……成为可能”，不要译“它是……”。",
    "trap": {
      "wrong": "Is important to protect personal data.",
      "right": "It is important to protect personal data.",
      "note": "英语句子必须有主语，用 it 占位，真正的主语是后面的不定式。"
    },
    "examples": [
      { "en": "It is difficult to predict how the market will react.", "zh": "很难预测市场会如何反应。" },
      { "en": "The new policy makes it easier for small firms to borrow money.", "zh": "新政策让小公司更容易借到钱。" }
    ]
  },
  "it-takes": {
    "label": "It takes sb + 时间 + to do",
    "definition": "It takes sb+时间+to do 表示“做某事花了某人多少时间”，it 是形式主语。",
    "identify": "看到 It takes/took/will take，后面出现人、时间段，再跟 to do，就是这一句型。",
    "usage": "公式：It takes+人+时间+to do。人可省略：It takes time to build trust。时态由 takes 变化。问句 How long does it take to do…？注意 spend 的主语必须是人。",
    "translate": "译成“做某事需要（某人）多少时间”或“某人花了多少时间做某事”。",
    "trap": {
      "wrong": "It takes me two hours finish the report.",
      "right": "It takes me two hours to finish the report.",
      "note": "takes 后面的动作要用不定式 to do，不能直接接动词原形。"
    },
    "examples": [
      { "en": "It took the team six months to complete the experiment.", "zh": "团队花了六个月完成这项实验。" },
      { "en": "It takes patience to learn a foreign language well.", "zh": "学好一门外语需要耐心。" }
    ]
  },
  "it-no-use": {
    "label": "It is no use / There is no point in doing",
    "definition": "两个句型都表示“做某事没有用、没有意义”，后面都接动名词 doing。",
    "identify": "句首是 It is no use/no good，或 There is no point in，后面直接跟动词-ing。",
    "usage": "固定结构：It is no use/no good+doing；There is no point in+doing。后面必须用动名词，不能用 to do。前者更口语，后者更强调“没有意义”。",
    "translate": "译成“做……没有用”“做……没有意义”，不要按字面译“没有使用”。",
    "trap": {
      "wrong": "It is no use to argue with him.",
      "right": "It is no use arguing with him.",
      "note": "no use 后面固定接动名词 doing，不能换成不定式 to do，这是固定搭配。"
    },
    "examples": [
      { "en": "It is no use complaining about problems you cannot change.", "zh": "抱怨你改变不了的问题没有用。" },
      { "en": "There is no point in buying a car you rarely drive.", "zh": "买一辆很少开的车没有意义。" }
    ]
  },
  "it-is-said": {
    "label": "It is said / believed / estimated that …",
    "definition": "It is said/believed/estimated that… 用 it 引出传言或估计。",
    "identify": "句首出现 It is said/reported/believed/estimated，后面紧跟 that 从句，就是这类结构。",
    "usage": "公式：It is+过去分词+that+完整句子。可转换成“主语+is said to do”：It is said that he lives abroad=He is said to live abroad。学术写作中用它使语气客观。",
    "translate": "译成“据说、据报道、人们认为、据估计”，不要译成“它被说”。",
    "trap": {
      "wrong": "It is said that he is living abroad for ten years.",
      "right": "It is said that he has lived abroad for ten years.",
      "note": "for ten years 表示持续到现在，从句要用现在完成时 has lived。"
    },
    "examples": [
      { "en": "It is estimated that the project will cost two billion dollars.", "zh": "据估计，这个项目将耗资二十亿美元。" },
      { "en": "It is widely believed that sleep improves memory and learning.", "zh": "人们普遍认为睡眠能改善记忆和学习。" }
    ]
  },
  "perfect-tense": {
    "label": "完成时与完成进行时（have done / have been doing）",
    "definition": "完成时用 have/has/had+过去分词，表示到某时间点已完成或持续；完成进行时强调持续。",
    "identify": "看到 have/has/had+过去分词，或 have been doing，再找 since、for、by the time。",
    "usage": "先看助动词：have/has 是现在完成，had 是过去完成。现在完成强调“到现在为止”，配 since、for、so far；过去完成强调“在过去某点之前”，配 by then、before。have been doing 强调持续。",
    "translate": "译成“已经……”“一直……”。过去完成常译“在……之前就已经……”。",
    "trap": {
      "wrong": "I have seen him yesterday.",
      "right": "I saw him yesterday.",
      "note": "yesterday 是明确的过去时间，不能用现在完成时，要用一般过去时。"
    },
    "examples": [
      { "en": "She has worked in the same company for over ten years.", "zh": "她在同一家公司工作了十多年。" },
      { "en": "By the time we arrived, the lecture had already ended.", "zh": "我们到达时，讲座已经结束了。" },
      { "en": "It has been raining heavily since early this morning.", "zh": "从清早开始就一直在下大雨。" }
    ]
  },
  "progressive-tense": {
    "label": "进行时（is / are / was / were + doing）",
    "definition": "进行时由 be+动词-ing 构成，表示某时刻正在发生或现阶段持续的动作。",
    "identify": "看到 am/is/are/was/were+doing，就是进行时；常和 now、at the moment、when、while 连用。",
    "usage": "公式：be+doing，be 的时态决定时间：is doing 现在进行，was doing 过去进行。表示状态的动词（know、own）一般不用进行时。过去进行常和一般过去时搭配：was doing…when did…。",
    "translate": "译成“正在……”“不断……”。过去进行常译“当时正在……”，when 从句译“这时……”。",
    "trap": {
      "wrong": "She is knowing the answer.",
      "right": "She knows the answer.",
      "note": "know 表示状态而不是动作，一般不用进行时，应该用一般现在时 knows。"
    },
    "examples": [
      { "en": "More people are working from home than ever before.", "zh": "现在居家办公的人比以往任何时候都多。" },
      { "en": "I was walking to the station when I met an old friend.", "zh": "我正走去车站时遇到了一位老朋友。" }
    ]
  },
  "future-tense": {
    "label": "将来时与将来进行/完成（will do / will be doing / will have done）",
    "definition": "将来时用 will+动词原形；be going to 表计划；will be doing 表将来。",
    "identify": "看到 will、be going to、will be doing，再找 tomorrow、next year、by 2030。",
    "usage": "will do 表单纯将来或临时决定；be going to 表计划或明显迹象；will be doing 表将来某时正在进行；will have done 表到将来某时已完成，常配 by+将来时间。will 后永远接原形。",
    "translate": "译成“将……”“会……”“打算……”。will have done 译“到……时已经……”。",
    "trap": {
      "wrong": "He will goes to Beijing next week.",
      "right": "He will go to Beijing next week.",
      "note": "will 是情态助动词，后面必须接动词原形，不能加 -es。"
    },
    "examples": [
      { "en": "The new rules will take effect at the beginning of next year.", "zh": "新规定将于明年年初生效。" },
      { "en": "By 2030, the city will have built three new subway lines.", "zh": "到 2030 年，这座城市将建成三条新地铁线。" }
    ]
  },
  "used-to": {
    "label": "used to do / be used to doing / be used to do 三组易混",
    "definition": "used to 过去常常；be used to doing 习惯；be used to do 被动。",
    "identify": "先看 used 前有没有 be：无 be 接原形是“过去常常”；有 be 接 doing 是“习惯于”；接 to do 是“被用来”。",
    "usage": "三组分清：used to+原形，只指过去的习惯；be used to+名词/doing，to 是介词，表示习惯于；be used to do 是被动，表示被用来做。否定和疑问用 did：didn't use to。",
    "translate": "分别译“过去常常”“习惯于”“被用来做”，不要把 be used to doing 译成“被用来做”。",
    "trap": {
      "wrong": "She is used to get up early.",
      "right": "She is used to getting up early.",
      "note": "be used to 表示习惯于时，to 是介词，后面要接动名词 getting。"
    },
    "examples": [
      { "en": "He used to walk to school when he lived in the village.", "zh": "他住在村里时常常步行上学。" },
      { "en": "This software is used to analyze large amounts of data.", "zh": "这款软件被用来分析大量数据。" }
    ]
  },
  "be-to-do": {
    "label": "be to do（计划 / 安排 / 命令 / 注定）",
    "definition": "be to do 表示按计划或安排将要发生的事，也可表示命令、要求或注定。",
    "identify": "看到 am/is/are/was/were+to do，而不是 will，就是 be to do，多见于通知、规定和新闻。",
    "usage": "四种含义：计划安排（is to be held）、命令要求（are to report）、注定（was never to see）、禁止（are not to smoke）。它比 will 正式，语气更确定。",
    "translate": "译成“定于……”“将要……”“必须……”“注定……”，按上下文选，不要一律译“是去……”。",
    "trap": {
      "wrong": "The meeting is to holding next Monday.",
      "right": "The meeting is to be held next Monday.",
      "note": "be to 后面必须接动词原形；会议是被举行的，所以用被动 to be held。"
    },
    "examples": [
      { "en": "The president is to visit three European countries next month.", "zh": "总统定于下月访问三个欧洲国家。" },
      { "en": "You are not to leave the room without permission.", "zh": "未经允许你不得离开这个房间。" }
    ]
  },
  "passive-basic": {
    "label": "一般被动语态（be + 过去分词）",
    "definition": "被动语态由 be+过去分词构成，主语是动作的承受者，不是发出者。",
    "identify": "看谓语是不是 be+过去分词，再问一句动作是谁做的：不是主语做的，就是被动语态。",
    "usage": "公式：be+过去分词，be 负责时态和单复数：is done、was done、will be done。动作发出者用 by 引出，不重要可省略。be interested in 这类是状态，不强调动作。",
    "translate": "中文可译“被……”，但更常转成主动句或无主句，“广泛使用”比“被广泛使用”自然。",
    "trap": {
      "wrong": "The bridge was build in 1990.",
      "right": "The bridge was built in 1990.",
      "note": "被动语态要用过去分词 built，build 是不规则动词，不能写原形。"
    },
    "examples": [
      { "en": "Many ancient buildings were damaged in the earthquake.", "zh": "许多古建筑在地震中受损。" },
      { "en": "English is spoken as a second language in many countries.", "zh": "英语在许多国家被当作第二语言使用。" }
    ]
  },
  "passive-modal": {
    "label": "情态动词 + 被动语态",
    "definition": "情态动词+be+过去分词构成情态被动，表示“可以被、应该被、必须被……”。",
    "identify": "看到 can/must/should/may+be+过去分词，就是情态被动；看主语是不是动作承受者。",
    "usage": "公式：情态动词+be+过去分词。can be solved 可以被解决，must be checked 必须被检查。情态动词后永远是 be，不能换成 am/is/are。否定把 not 放在情态动词后。",
    "translate": "译成“可以……”“应该……”“必须……”，中文常省掉“被”字，改成主动句。",
    "trap": {
      "wrong": "The problem can solved in two ways.",
      "right": "The problem can be solved in two ways.",
      "note": "情态动词后面必须先接 be，再接过去分词，不能省掉 be 这一步。"
    },
    "examples": [
      { "en": "All applications must be submitted before the deadline.", "zh": "所有申请都必须在截止日期前提交。" },
      { "en": "Such behavior should not be tolerated in any workplace.", "zh": "这种行为在任何工作场所都不应被容忍。" }
    ]
  },
  "active-passive": {
    "label": "主动形式表被动（sell well / wash easily）",
    "definition": "主动形式表被动指某些动词用主动形式，意义上却是被动，常说明主语的属性。",
    "identify": "看到 sell、wash、read、write、open 等动词，后跟 well、easily 等副词，主语又是物，就按被动理解。",
    "usage": "结构：主语（物）+动词+副词。This book sells well 这本书很畅销；The cloth washes easily 这种布很好洗。这类句子强调事物属性，不能改成被动，也不能加 by。",
    "translate": "译成“很好卖、很好洗、写起来很顺”，用“起来”“好……”表达，不要硬译“被卖”。",
    "trap": {
      "wrong": "This kind of shirt is washed easily.",
      "right": "This kind of shirt washes easily.",
      "note": "说明衣物本身的属性时用主动形式 washes，加 is 反而变成一次具体动作。"
    },
    "examples": [
      { "en": "This new novel sells well among young readers.", "zh": "这本新小说在年轻读者中很畅销。" },
      { "en": "The new fabric washes easily and dries quickly.", "zh": "这种新面料很好洗，干得也快。" }
    ]
  },
  "get-passive": {
    "label": "get + 过去分词（get-passive）",
    "definition": "get+过去分词构成 get 被动，意思接近 be 被动，但更口语，常强调变化或意外。",
    "identify": "看到 get+过去分词，如 get paid、get hurt、get promoted，且主语是承受者，就是 get 被动。",
    "usage": "公式：get+过去分词，时态由 get 变化：got married、will get fired。它比 be 被动更口语，多用于不好的或突然的事：get hurt、get lost。正式文体仍用 be。",
    "translate": "译成“被……”“遭到……”“变得……”，如 get paid 译“拿到报酬”。",
    "trap": {
      "wrong": "He got injure in the accident.",
      "right": "He got injured in the accident.",
      "note": "get 后面要接过去分词 injured，不能用动词原形，get 被动也要分词。"
    },
    "examples": [
      { "en": "She got promoted after working there for only two years.", "zh": "她在那里只工作了两年就升职了。" },
      { "en": "Several houses got badly damaged during the storm last night.", "zh": "昨晚的暴风雨中，好几栋房子严重受损。" }
    ]
  },
  "have-sth-done": {
    "label": "have / get + 宾语 + 过去分词（请人做 / 让某事被做）",
    "definition": "have/get+宾语+过去分词表示请别人做某事，或某事被（意外）做在自己身上。",
    "identify": "看到 have 或 get 后先接名词，再接过去分词，如 have my hair cut，就是使役被动结构。",
    "usage": "公式：have/get+宾语+过去分词。宾语和分词是被动关系。三种意思：请人做（have my car repaired）、遭遇不幸（have my wallet stolen）、完成（get the work finished）。",
    "translate": "译成“请人……”“让……被……”“遭遇到……”，根据语境选，不要译“有……”。",
    "trap": {
      "wrong": "I had my hair cutting yesterday.",
      "right": "I had my hair cut yesterday.",
      "note": "宾语 hair 和 cut 是被动关系，要用过去分词 cut，不能用 cutting。"
    },
    "examples": [
      { "en": "They had the old house painted before moving in.", "zh": "搬进去之前他们请人把老房子粉刷了一遍。" },
      { "en": "She got her phone stolen on the crowded bus.", "zh": "她在拥挤的公交车上被人偷了手机。" }
    ]
  },
  "make-let-do": {
    "label": "make / let / have + 宾语 + 动词原形",
    "definition": "make/let/have+宾语+动词原形表示“使、让、叫某人做某事”，不定式不带 to。",
    "identify": "看到 make、let、have 后先接人或物，再直接接动词原形、中间没有 to，就是使役结构。",
    "usage": "公式：make/let/have+sb+do sth。make 偏“迫使”，let 偏“允许”，have 偏“安排”。变被动时 make 后的 to 要还原：He was made to work overtime。",
    "translate": "译成“使/让/叫某人做某事”。被动句里 make 要译“被迫……”，别漏语气。",
    "trap": {
      "wrong": "My parents let me to choose my own major.",
      "right": "My parents let me choose my own major.",
      "note": "let 后面接动词原形，不能加 to，这是使役动词的共同特点。"
    },
    "examples": [
      { "en": "The teacher made us rewrite the whole essay.", "zh": "老师让我们把整篇文章重写一遍。" },
      { "en": "Let me explain to you why the plan failed.", "zh": "让我向你解释这个计划为什么失败。" }
    ]
  },
  "modal-basic": {
    "label": "情态动词（can / must / should / may 的能力、义务与推测）",
    "definition": "情态动词表示能力、义务、允许或推测，后面必须接动词原形，没有人称变化。",
    "identify": "看到 can、may、must、should、would，后面直接跟动词原形；它不加 -s，也不用 do 提问。",
    "usage": "按功能记：can/could 表能力或可能；must 表必须或强推测；should 表应该；may/might 表允许或弱推测。否定：cannot、must not 禁止、need not 不必。推测由强到弱：must>may>might。",
    "translate": "can 译“能、可以”，must 译“必须、一定”，should 译“应该”，may 译“可能”。",
    "trap": {
      "wrong": "He can plays the piano very well.",
      "right": "He can play the piano very well.",
      "note": "情态动词没有人称和数的变化，后面必须用动词原形，不能加 -s。"
    },
    "examples": [
      { "en": "You must wear a helmet when riding a motorcycle.", "zh": "骑摩托车时必须戴头盔。" },
      { "en": "Such an error may occur when the data are incomplete.", "zh": "数据不完整时可能出现这种错误。" }
    ]
  },
  "modal-perfect": {
    "label": "情态动词 + have done（对过去的推测/评价）",
    "definition": "情态动词+have done 表示对过去情况的推测或评价，动作发生在过去。",
    "identify": "看到 must/may/might/could/should/needn't+have+过去分词，就是情态完成式，讨论已发生的事。",
    "usage": "must have done 一定做过；may have done 可能做过；could have done 本来能做而没做；should have done 本该做而没做。重点在推断或评价，不能换成一般过去时。",
    "translate": "must have done 译“一定……”；should have done 译“本应该……”。",
    "trap": {
      "wrong": "You should went to see the doctor earlier.",
      "right": "You should have gone to see the doctor earlier.",
      "note": "对过去的评价要用 should have+过去分词，不能直接接过去式 went。"
    },
    "examples": [
      { "en": "The lights are off; they must have left already.", "zh": "灯关着，他们一定已经走了。" },
      { "en": "We needn't have booked the tickets so early.", "zh": "我们本不必这么早订票。" }
    ]
  },
  "gerund-subject": {
    "label": "动名词作主语 / 介词宾语（doing）",
    "definition": "动名词 doing 可作主语或介词宾语，表示习惯性、抽象的动作，不作谓语。",
    "identify": "句首是动词-ing 且后跟 helps、is 等谓语，或者介词后面出现动词-ing，就是动名词。",
    "usage": "动名词作主语，谓语用单数：Reading widely helps…。介词后必须用动名词：by doing、without doing、look forward to doing。注意 to 也可能是介词。",
    "translate": "译成“……（这件事）”，不必译“正在”；作介词宾语时按中文语序调整。",
    "trap": {
      "wrong": "Read widely help students build vocabulary.",
      "right": "Reading widely helps students build vocabulary.",
      "note": "动词原形不能作主语，要改成动名词 Reading，谓语也用单数 helps。"
    },
    "examples": [
      { "en": "Learning a second language takes years of practice.", "zh": "学习第二语言需要多年的练习。" },
      { "en": "She improved her English by watching films without subtitles.", "zh": "她通过看无字幕电影提高了英语。" }
    ]
  },
  "participle-attribute": {
    "label": "分词作定语（后置 done / 前置 doing）",
    "definition": "分词作定语是用 doing 或 done 修饰名词，doing 表主动，done 表被动。",
    "identify": "单个分词常放名词前（rising prices），分词短语常放名词后（the data collected），修饰该名词。",
    "usage": "判断主动还是被动：名词发出动作用 doing，承受动作用 done。后置 done 短语相当于被动定语从句：the data collected=the data that were collected。先找逻辑主语。",
    "translate": "译成“……的”放名词前：“收集到的数据”“上涨的成本”，不要译“正在被……”那么生硬。",
    "trap": {
      "wrong": "The data collecting by the team were incomplete.",
      "right": "The data collected by the team were incomplete.",
      "note": "data 是被收集的，要用过去分词 collected，不能用表示主动的 collecting。"
    },
    "examples": [
      { "en": "The report published last week attracted wide attention.", "zh": "上周发表的那份报告引起了广泛关注。" },
      { "en": "Rising costs have forced many small shops to close.", "zh": "不断上涨的成本迫使许多小店关门。" }
    ]
  },
  "participle-phrase": {
    "label": "句中分词短语（, doing / done 补充说明）",
    "definition": "句中分词短语用逗号隔开，对主句作补充说明，可表原因、伴随、结果或条件。",
    "identify": "看到逗号后面出现 doing 或 done 短语，而且它的逻辑主语就是主句主语，就是分词短语。",
    "usage": "两步：先找主句主语，再看它和分词是主动还是被动。主动用 doing，被动用 done。位置可在句末或句中：The plan, designed by experts, was approved。",
    "translate": "译成一个短句：“……着”“由于……”“这一……由……设计”，不要硬塞进定语位置。",
    "trap": {
      "wrong": "Having finished the report, the computer was turned off.",
      "right": "Having finished the report, she turned off the computer.",
      "note": "分词短语的逻辑主语必须和主句主语一致，电脑不会写报告，否则句子就错了。"
    },
    "examples": [
      { "en": "The company, founded in 1998, now employs over five thousand people.", "zh": "这家公司成立于 1998 年，现在雇有五千多人。" },
      { "en": "He sat by the window, watching the rain fall.", "zh": "他坐在窗边，看着雨落下来。" }
    ]
  },
  "participle-adverbial": {
    "label": "分词作状语（doing / done 开头）",
    "definition": "分词作状语放句首或句末，用 doing 或 done 表时间、原因、条件、让步或伴随。",
    "identify": "句首出现 Doing…或 Done…，后面用逗号接主句，且分词逻辑主语就是主句主语，就是分词作状语。",
    "usage": "主动关系用 doing，被动关系用 done；先发生的动作用 having done。常见：Faced with…面对，Compared with…与……相比。一定要检查逻辑主语，否则会出现悬垂分词。",
    "translate": "译成“面对……”“考虑到……”“与……相比”，先译状语，再译主句。",
    "trap": {
      "wrong": "Walking along the street, the accident was seen by him.",
      "right": "Walking along the street, he saw the accident.",
      "note": "走路的只能是人，分词逻辑主语要和主句主语 he 一致，不能用被动句。"
    },
    "examples": [
      { "en": "Faced with strong competition, the firm changed its strategy.", "zh": "面对激烈的竞争，这家公司改变了策略。" },
      { "en": "Compared with last year, online sales have doubled.", "zh": "与去年相比，线上销售额翻了一番。" }
    ]
  },
  "infinitive-purpose": {
    "label": "不定式作目的 / 结果 / 定语（to do）",
    "definition": "不定式 to do 可表目的、结果，也可放名词后作定语，说明要做的动作。",
    "identify": "看到 to+动词原形，先判断它是否回答“为了什么”，或紧跟 ability、chance、way 等名词。",
    "usage": "作目的：He left early to catch the train；作结果：He woke up to find everyone gone；作定语：the ability to adapt。不定式作定语时常和名词有动宾或主谓关系。",
    "translate": "作目的译“为了……”；作定语译“做……的”；作结果译“结果却……”。",
    "trap": {
      "wrong": "She studies hard for passing the exam.",
      "right": "She studies hard to pass the exam.",
      "note": "表示目的用不定式 to do，不用 for+doing，for 后一般接名词。"
    },
    "examples": [
      { "en": "Many students take part-time jobs to gain work experience.", "zh": "许多学生做兼职是为了获得工作经验。" },
      { "en": "He returned home to find the door wide open.", "zh": "他回到家，却发现门大开着。" }
    ]
  },
  "only-to": {
    "label": "only to do 出乎意料的结果",
    "definition": "only to do 表示“结果却……”，引出出乎意料、往往令人失望的结果。",
    "identify": "看到逗号后出现 only to+动词原形，前面是完整动作，就是“结果却”，不是“仅仅为了”。",
    "usage": "公式：主句+only to do。它表示前面的动作产生了意外结果，常带遗憾：He hurried to the station only to find the train had left。这里 only 不表示“仅仅”，to 后接原形。",
    "translate": "译成“结果却……”“不料……”，不要译成“只是为了……”，要译出意外。",
    "trap": {
      "wrong": "She opened the box, only finding it empty.",
      "right": "She opened the box, only to find it empty.",
      "note": "only 表示意外结果时固定接不定式 to do，不能换成 doing。"
    },
    "examples": [
      { "en": "He rushed to the airport only to discover his flight was cancelled.", "zh": "他赶到机场，却发现航班取消了。" },
      { "en": "She searched the whole house only to find the keys in her pocket.", "zh": "她找遍了整座房子，结果发现钥匙就在自己口袋里。" }
    ]
  },
  "perception-verb": {
    "label": "感官动词 + 宾语 + do / doing / done",
    "definition": "感官动词 see/hear/watch 后接宾语，再接 do、doing 或 done。",
    "identify": "看到 see、hear、watch、notice、feel 后先接人或物，再直接接动词，就要判断用 do、doing 还是 done。",
    "usage": "三种形式：+do 表看到整个动作；+doing 表动作正在进行；+done 表宾语和动作是被动关系。如 I saw him cross、I saw him crossing、I saw him taken away。",
    "translate": "do 译“看见某人做了”，doing 译“看见某人正在做”，done 译“看见某人被……”。",
    "trap": {
      "wrong": "I saw him to cross the street.",
      "right": "I saw him cross the street.",
      "note": "感官动词主动句中接动词原形，不加 to；只有变被动时才还原 to。"
    },
    "examples": [
      { "en": "We watched the children playing football in the park.", "zh": "我们看着孩子们在公园里踢球。" },
      { "en": "I heard my name called from across the room.", "zh": "我听到房间另一头有人叫我的名字。" }
    ]
  },
  "have-difficulty": {
    "label": "have difficulty / trouble (in) doing",
    "definition": "have difficulty/trouble doing 表示“做某事有困难、很费劲”。",
    "identify": "看到 have difficulty、trouble、problems，后面跟动词-ing，就是这一结构，in 可省略。",
    "usage": "公式：have difficulty/trouble (in)+doing。difficulty 可数时用 difficulties。否定 have no difficulty doing 表示毫无困难。不能用 to do。",
    "translate": "译成“做……有困难”“做……很费劲”，不要按字面译“在里面有困难”。",
    "trap": {
      "wrong": "Many students have difficulty to concentrate in class.",
      "right": "Many students have difficulty concentrating in class.",
      "note": "have difficulty 后面固定接动名词 doing，不能接不定式 to do。"
    },
    "examples": [
      { "en": "She had difficulty understanding the professor's accent at first.", "zh": "起初她很难听懂教授的口音。" },
      { "en": "Few people have trouble finding the station from here.", "zh": "很少有人会从这里找不到车站。" }
    ]
  },
  "spend-time": {
    "label": "spend / waste time (in) doing",
    "definition": "spend/waste time (in) doing 表示“花/浪费时间做某事”，后面接动名词。",
    "identify": "看到 spend、waste 后面先接时间，再接动词-ing，就是这一结构；也常见 spend time on+名词。",
    "usage": "公式：spend/waste+时间+(in)+doing sth；spend+钱+on+名词。主语必须是人，in 可省略。不能把 doing 改成 to do，也不能说 spend time to do。",
    "translate": "译成“花/浪费时间做某事”，中文把“做某事”放后面，不要把 in 译出来。",
    "trap": {
      "wrong": "She spends two hours to read every evening.",
      "right": "She spends two hours reading every evening.",
      "note": "spend time 后面固定接动名词 doing，不能接不定式 to do。"
    },
    "examples": [
      { "en": "He spends most of his free time reading and writing.", "zh": "他把大部分空闲时间都用来读书和写作。" },
      { "en": "They wasted three hours waiting for a bus that never came.", "zh": "他们白等了三个小时，那趟公交始终没来。" }
    ]
  },
  "prefer-to": {
    "label": "prefer A to B / would rather … than",
    "definition": "prefer A to B 表示“比起 B 更喜欢 A”，to 是介词，前后要用对等成分。",
    "identify": "看到 prefer 后接两个名词或两个动名词，中间用 to 连接，就是“比起……更喜欢……”。",
    "usage": "三种形式：prefer+名词/doing+to+名词/doing；prefer to do+rather than+do；would rather+do+than+do。to 是介词，前后成分要对等。",
    "translate": "译成“比起 B 更喜欢 A”“宁愿……而不愿……”，A 放在“喜欢”后面。",
    "trap": {
      "wrong": "I prefer reading to watch TV.",
      "right": "I prefer reading to watching TV.",
      "note": "prefer A to B 中 to 是介词，前后要对称，都用动名词。"
    },
    "examples": [
      { "en": "She prefers working with numbers to dealing with customers.", "zh": "比起和客户打交道，她更喜欢和数字打交道。" },
      { "en": "He would rather resign than accept such unfair terms.", "zh": "他宁愿辞职也不愿接受这样不公平的条件。" }
    ]
  },
  "be-about-to": {
    "label": "be about to do / be on the point of doing",
    "definition": "be about to do 和 be on the point of doing 都表示“即将”。",
    "identify": "看到 am/is/are/was/were about to+动词原形，或 on the point of+doing，就是“即将”结构。",
    "usage": "公式：be about to do；be on the point of doing。它比 be going to 更近、更急。常见：I was about to leave when the phone rang。",
    "translate": "译成“正要……”“即将……”，when 从句译“这时突然……”，把紧迫感译出来。",
    "trap": {
      "wrong": "We are about to leaving when it started to rain.",
      "right": "We are about to leave when it started to rain.",
      "note": "be about to 后面接动词原形，不能接 doing；on the point of 后才接 doing。"
    },
    "examples": [
      { "en": "The train is about to depart from platform three.", "zh": "火车即将从三号站台发车。" },
      { "en": "She was on the point of giving up when the results arrived.", "zh": "她正要放弃时，结果送到了。" }
    ]
  },
  "too-enough": {
    "label": "too … to / … enough to 结构",
    "definition": "too…to 表示“太……以至于不能……”，…enough to 表示“足够……可以……”。",
    "identify": "看到 too+形容词/副词+to do，或形容词/副词+enough+to do，就是这两种结果结构。",
    "usage": "too+adj./adv.+to do 形式没有 not，意思却是否定：The box is too heavy to carry。enough 放在形容词后：old enough to drive。for sb 可插在 to do 前。",
    "translate": "too…to 译“太……而不能……”；enough to 译“足够……可以做……”。",
    "trap": {
      "wrong": "The box is too heavy to carry it.",
      "right": "The box is too heavy to carry.",
      "note": "不定式 carry 的宾语就是前面的 the box，后面再加 it 会重复。"
    },
    "examples": [
      { "en": "The evidence is too weak to support such a strong claim.", "zh": "证据太薄弱，无法支持这样有力的论断。" },
      { "en": "He is old enough to make his own decisions.", "zh": "他已经到了可以自己做决定的年龄。" }
    ]
  },
  "nothing-but": {
    "label": "nothing but / anything but 否定强调结构",
    "definition": "nothing but 表示“只不过、仅仅是”，anything but 表示“绝不是”。",
    "identify": "看到 nothing but 或 anything but，后接名词、代词或动词原形，先判断是“只是”还是“绝不是”。",
    "usage": "nothing but=only，强调“仅仅”：He is nothing but a beginner。anything but=not at all，强烈否定：The task is anything but easy。",
    "translate": "nothing but 译“只不过是”；anything but 译“绝不是、一点也不”。",
    "trap": {
      "wrong": "The exam was nothing but easy; everyone struggled.",
      "right": "The exam was anything but easy; everyone struggled.",
      "note": "句意是“一点也不容易”，要用 anything but；nothing but 是“只是”。"
    },
    "examples": [
      { "en": "The problem is anything but simple; it involves several departments.", "zh": "这个问题绝不简单，它涉及好几个部门。" },
      { "en": "What he said was nothing but an excuse.", "zh": "他所说的不过是个借口。" }
    ]
  },
  "the-last": {
    "label": "the last + 名词 + to do / that …（最不可能……）",
    "definition": "the last+名词+to do/that… 表示“最不可能……的”，不是“最后一个”。",
    "identify": "看到 the last person/thing+to do，或 the last+名词+that 从句，且句意是“绝不会”，就是这一用法。",
    "usage": "the last+名词+to do 表示“最不可能做某事的”：He is the last person to tell a lie。它靠上下文表强烈否定，不能按字面译“最后一个”。",
    "translate": "译成“最不可能……的”“绝不会……的”，不要按字面译“最后一个……”。",
    "trap": {
      "wrong": "She is the last person to telling lies.",
      "right": "She is the last person to tell lies.",
      "note": "the last+名词 后接不定式 to do，不能接 doing；这里意为“最不可能”。"
    },
    "examples": [
      { "en": "He is the last person to complain about working late.", "zh": "他是最不可能抱怨加班的人。" },
      { "en": "This is the last place I would expect to meet him.", "zh": "这是我最不可能想到会遇见他的地方。" }
    ]
  },
  "adjective-postmodifier": {
    "label": "形容词后置定语（something important / people present）",
    "definition": "形容词后置定语指形容词放在名词后修饰它，常见于复合不定代词后。",
    "identify": "看到 something、anything 后跟形容词，或 people present 这类结构，就是形容词后置。",
    "usage": "两类情况：一、修饰 something/anything/nothing/everything 时形容词必须后置：something important；二、present 后置更具体：the people present。",
    "translate": "译成“……的（东西/人）”，按中文习惯把形容词放回名词前，如“重要的事”。",
    "trap": {
      "wrong": "I have important something to tell you.",
      "right": "I have something important to tell you.",
      "note": "修饰复合不定代词时形容词必须后置，放在 something 后面。"
    },
    "examples": [
      { "en": "Is there anything else you would like to add?", "zh": "你还有什么想补充的吗？" },
      { "en": "All the people present agreed with the proposal.", "zh": "所有在场的人都同意这项提议。" }
    ]
  }
};
