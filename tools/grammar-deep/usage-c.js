// 语法深度讲解（第二组）配套「常见问答」：比较结构、强调、倒装与虚拟语气。
// 每个 key 对应 deep-syntax-2.js 的一个语法点，答案只补讲解未展开的判断细节。

module.exports = {
  "comparative-substitute": {
    "summary": "比较从句用 do/does/did 替代实义动词，形式由前半句的时态和人称决定，be 与情态动词原样保留。",
    "items": [
      {
        "q": "than 后面只留一个名词、不写 do/did，算不算错？",
        "a": "不算错。比较对象与前句结构对称时，整个谓语可以省略，如 faster than her brother。但如果省略后可能把比较对象读成宾语，或代词主宾格会产生歧义，补出 do/did 更稳妥，正式写作也常保留。"
      },
      {
        "q": "前半句是现在完成时，than 后面该用 did 还是 have？",
        "a": "跟着前半句的时态走，用 have/has，不能用 did。替代词只承担时态和人称，不改变原句时间。前半句是一般过去时才用 did；前半句有 can、will 等情态动词时保留情态动词。",
        "good": "She has read more books than I have.",
        "bad": "She has read more books than I did."
      },
      {
        "q": "前半句是 be 动词或情态动词，还能借 do 替代吗？",
        "a": "不能。be 动词保留 be 的相应形式，情态动词保留情态动词：She is taller than I am；He can run faster than I can。只有实义动词才借 do/does/did，混用会把时态和主语关系弄乱。",
        "good": "She is far more careful than I am.",
        "bad": "She is far more careful than I do."
      }
    ]
  },
  "as-as-comparison": {
    "summary": "两个 as 之间只能用原级；第二个 as 后省略谓语时，比较对象要和前句同类，不能拿人和物直接比。",
    "items": [
      {
        "q": "第二个 as 后面接名词时，什么时候必须补 that of 或 those of？",
        "a": "比较双方属性同类时可直接省谓语，如 as tall as her brother；但比较的是气候、价格、人口等属性、对象却是地点或人群时，要补 that of / those of，否则会把属性直接和地点比，逻辑不通。",
        "good": "The climate here is as mild as that of Kunming.",
        "bad": "The climate here is as mild as Kunming."
      },
      {
        "q": "as … as 中间该填形容词还是副词，怎么判断？",
        "a": "看它修饰什么。作表语、说明主语性质用形容词：as happy as；修饰实义动词、说明动作方式用副词：as quickly as。动词后若出现宾语，通常用副词，不能用形容词直接修饰动词。",
        "good": "She speaks English as fluently as a native speaker.",
        "bad": "She speaks English as fluent as a native speaker."
      },
      {
        "q": "as … as 前面能不能加 very 或 too 来加强？",
        "a": "不能。very、too 不与 as … as 搭配；要表示接近或正好，用 almost、nearly、just、every bit，倍数则用 twice、three times 放在第一个 as 前。否定式可在第一个 as 前用 not。",
        "good": "This room is almost as large as that one.",
        "bad": "This room is very as large as that one."
      }
    ]
  },
  "not-so-much-as": {
    "summary": "not so much A as B 重点在 B，A、B 要对等；别与 not as much as 的数量比较混淆。",
    "items": [
      {
        "q": "not so much A as B 里的 A 和 B 必须是什么词性？",
        "a": "A、B 不限于名词，但两边必须对等：名词对名词、形容词对形容词、介词短语对介词短语。形式不对等时句子会失衡，读起来像把两套结构硬拼在一起，考试改错常把这里设为考点。",
        "good": "She was not so much angry as disappointed.",
        "bad": "She was not so much angry as disappointment."
      },
      {
        "q": "not so much as 连在一起、中间没有 A，是什么意思？",
        "a": "这是另一个结构，much 后直接接 as，意为“甚至连……都不”，as 后接动词原形，常与否定词连用。它不表示“与其说……不如说……”，不能按 A、B 对照去分析。",
        "good": "He did not so much as say goodbye.",
        "bad": "He did not so much as said goodbye."
      },
      {
        "q": "not so much A as B 和 rather than 能互换吗？",
        "a": "多数时候不能。not so much A as B 是对同一事物的修正，B 更准确，A 并非完全错误；rather than 是选择或替代，前后是两项不同的做法。前者重心在 B，后者强调舍弃 A。"
      }
    ]
  },
  "comparative-degree": {
    "summary": "very 不能修饰比较级；两者相比用 the + 比较级，三者以上才用最高级，修饰词和冠词都要对位。",
    "items": [
      {
        "q": "a lot of 和 a lot 修饰比较级时怎么选？",
        "a": "修饰比较级只能用 a lot，后面直接跟比较级：a lot heavier。a lot of 是数量短语，只能接名词。类似的还有 a bit、a little、far、much、even、still，都不能带 of。",
        "good": "This bag is a lot heavier than that one.",
        "bad": "This bag is a lot of heavier than that one."
      },
      {
        "q": "两者比较时，用比较级还是最高级？",
        "a": "两者比较用 the + 比较级，表示“两者中较……的那个”；最高级用于三者或三者以上。范围只有 two 时出现 most 就是范围误判，这是选择题的常见陷阱，做题要先数清范围。",
        "good": "She is the more experienced of the two candidates.",
        "bad": "She is the most experienced of the two candidates."
      },
      {
        "q": "fewer 和 less 修饰名词时怎么分？",
        "a": "fewer 接可数名词复数，less 接不可数名词；less 还可修饰形容词构成比较级，如 less expensive。把 less 直接放在复数名词前是口语常见但考试判错，正式写作要用 fewer。",
        "good": "There are fewer cars on the road today.",
        "bad": "There are less cars on the road today."
      }
    ]
  },
  "times-comparison": {
    "summary": "倍数放最前：倍数+as+原级+as、倍数+the size of、倍数+比较级+than；前两种最稳。",
    "items": [
      {
        "q": "三种倍数写法意思完全一样吗？",
        "a": "前两种严格表示“是……的几倍”；倍数 + 比较级 + than 字面是“多出几倍”，常被理解成四倍，母语者也有当三倍用的。考试和写作优先 as … as 或 the size of，避免歧义。"
      },
      {
        "q": "倍数词应该放在 as 的前面还是后面？",
        "a": "必须放在第一个 as 前：twice as many as、three times as large as。放在 as 后或两个 as 中间都不成立；倍数修饰的是整个同级比较，不是形容词本身。",
        "good": "We produced twice as many cars as last year.",
        "bad": "We produced as twice many cars as last year."
      },
      {
        "q": "half、one third 这类分数怎么放进倍数结构？",
        "a": "位置和倍数词一样：half as expensive as、one third the size of。注意 half as many 是“一半数量”，不是“两倍”；the size of 前直接放分数，不加 as。",
        "good": "This flat is half the size of that one.",
        "bad": "This flat is half as the size of that one."
      }
    ]
  },
  "compared-with": {
    "summary": "compared with/to 是过去分词短语，逻辑主语要与主句一致，后面只接名词或名词性成分，不接完整句子。",
    "items": [
      {
        "q": "compared with 和 compared to 有区别吗？",
        "a": "现代英语里基本通用，都表示“与……相比”。传统语法曾区分“比较异同”用 with、“比喻等同”用 to，但考试一般不作区分，选哪个都不算错，关键是别写成 comparing。"
      },
      {
        "q": "句首的 Compared with … 逻辑主语必须和主句一致吗？",
        "a": "必须。compared 的逻辑主语就是主句主语，主句主语应是被比较的那一方。若主句主语换成了另一个概念，就成了悬垂结构，读者不知道是谁和谁比，写作时要回头检查。",
        "good": "Compared with its rivals, the company remains small.",
        "bad": "Compared with its rivals, the company's size remains small."
      },
      {
        "q": "compared with 后面能接一个完整的句子吗？",
        "a": "不能，它后面只接名词、代词或名词性短语。要接从句，可用 compared with what it was …，用 what 从句充当名词性成分，或用 whereas 连接两个完整分句。",
        "good": "Compared with what it was ten years ago, the city has changed a lot.",
        "bad": "Compared with it was ten years ago, the city has changed a lot."
      }
    ]
  },
  "comparative-separated": {
    "summary": "比较级和 than 之间被介词短语隔开时，than 后要重复同一个介词，两个比较对象才清楚。",
    "items": [
      {
        "q": "than 后面的介词能不能承前省略？",
        "a": "一般不能。省略后第二个名词会被读成与前一个名词并列，比较对象就变了。less important for adults than children 会被理解成“对成年人和孩子都 less important”，补上 for 才明确是两边对比。",
        "good": "The rule is less important for adults than for children.",
        "bad": "The rule is less important for adults than children."
      },
      {
        "q": "比较对象是 one's + 名词时，than 后面怎么处理？",
        "a": "用名词所有格或代词所有格对应，不能只留人。His salary is higher than his wife's 中 his wife's 等于 his wife's salary；写成 than his wife 就变成拿薪水和妻子比。",
        "good": "His monthly salary is higher than his wife's.",
        "bad": "His monthly salary is higher than his wife."
      },
      {
        "q": "两个比较对象都带介词短语时，介词短语放句首还倒装吗？",
        "a": "不倒装。For young people, the rule is less important than for adults 只是把状语提前，主句仍是陈述语序。倒装只由否定词、only 等特定成分触发，比较结构本身不触发。",
        "good": "For beginners, this skill is less useful than for experts.",
        "bad": "For beginners, is this skill less useful than for experts."
      }
    ]
  },
  "so-neither-inversion": {
    "summary": "so/neither 放句首要用倒装，助动词与前句的时态、情态保持一致；主语必须换成另一方。",
    "items": [
      {
        "q": "前句是完成时，so 后面用 have 还是 did？",
        "a": "用前句的助动词：前句 has/have done，后句 so have/has + 主语；前句是一般过去时才用 did。替代词的时态跟着前句走，不跟说话时间走。",
        "good": "She has finished the report, and so have I.",
        "bad": "She has finished the report, and so did I."
      },
      {
        "q": "前句是否定句，用 neither 还是 nor？",
        "a": "两者都可以，neither 更常见，nor 更正式；不能用 so 接否定句。助动词仍与前句一致，主语放在助动词后。若前句有 not，也可用 neither + 助动词 + 主语保持简洁。",
        "good": "He cannot swim at all, and neither can she.",
        "bad": "He cannot swim at all, and so can't she."
      },
      {
        "q": "So do I 和 So I do 意思一样吗？",
        "a": "不一样。倒装的 So do I 表示“我也一样”，主语与前句不同；不倒装的 So I do 表示“我确实如此”，主语与前句相同，是对前句的确认。看主语是否相同就能区分。"
      }
    ]
  },
  "emphatic-do": {
    "summary": "强调用 do/does/did + 动词原形，时态和人称由 do 承担，后面的动词不再变化。",
    "items": [
      {
        "q": "祈使句怎么用 do 强调？",
        "a": "在动词原形前加 do，表示“一定、务必”：Do come in. 祈使句没有主语，do 不随人称变化，永远用 do，不能用 does 或 did。语气比直接命令更客气或更急切。",
        "good": "Do come in and sit down for a while.",
        "bad": "Does come in and sit down for a while."
      },
      {
        "q": "do 后面能接 be 动词吗？",
        "a": "可以，结构是 do + be 原形，多用于祈使句：Do be careful. 这里的 be 不能再变成 is 或 are。日常更常见的是 do + 实义动词；do be 语气较强，正式写作少用。",
        "good": "Do please be quiet during the whole exam.",
        "bad": "Do please are quiet during the whole exam."
      },
      {
        "q": "疑问句里想强调谓语，能再加一个 did 吗？",
        "a": "不能。疑问句已经借了 did，后面只能跟原形，不能再出现第二个 did；要强调可加重读、加 actually/really，或改用肯定句的强调形式。两个助动词连用是典型错误。",
        "good": "Did he actually warn you about the risk?",
        "bad": "Did he did warn you about the risk?"
      }
    ]
  },
  "full-inversion": {
    "summary": "完全倒装把整个谓语提到主语前，只用于 here/there/方位短语 + 不及物动词；主语是代词时不倒装。",
    "items": [
      {
        "q": "Here comes the bus 为什么不能说 Here comes it？",
        "a": "主语是名词时才完全倒装，主语是代词时不倒装，代词要放在动词前：Here it comes。因为代词信息轻，不需要后置；名词较长，后置才符合尾重原则，记住这条就能避免主语错位。",
        "good": "Here it comes, right on time as usual.",
        "bad": "Here comes it, right on time as usual."
      },
      {
        "q": "完全倒装和部分倒装怎么一眼区分？",
        "a": "看提前的是整个谓语还是只有助动词。完全倒装把实义动词一起提前，如 On the wall hangs a map；部分倒装只提前助动词，实义动词留在主语后，如 Never have I seen it。",
        "good": "On the wall hangs a large old map.",
        "bad": "On the wall does a large old map hang."
      },
      {
        "q": "这类倒装句能用进行时吗？",
        "a": "通常不用进行时，习惯用一般现在时：Here comes the bus，即使车正在开来。There goes the last train 同理。用 is coming 会显得啰嗦，也不是该句式的常规形式。",
        "good": "There goes the last train of the day.",
        "bad": "There is going the last train of the day."
      }
    ]
  },
  "not-until": {
    "summary": "not … until 意为“直到……才”；Not until 置句首主句倒装，强调句 that 后不倒装。",
    "items": [
      {
        "q": "Not until 放句首，倒装的是主句还是 until 从句？",
        "a": "只倒装主句，until 从句保持陈述语序。结构是 Not until + 从句 + did/does + 主语 + 动词原形。把 did 放进从句里，或让主句保持陈述语序，都是常见错误。",
        "good": "Not until the rain stopped did we leave.",
        "bad": "Not until did the rain stop we left."
      },
      {
        "q": "until 从句本身要用否定吗？",
        "a": "不用。until 从句用肯定形式，否定放在主句：We did not start until everyone arrived。中文“直到……才”是否定意思，但英文否定在主句，从句不能再加 not。",
        "good": "We did not start the meeting until everyone arrived.",
        "bad": "We did not start the meeting until everyone didn't arrive."
      },
      {
        "q": "It was not until … that 后面的句子要倒装吗？",
        "a": "不要。这是强调句，that 后回到正常陈述语序：It was not until 2019 that they met。倒装只发生在 Not until 直接置于句首的句型里，两种形式不能混用。",
        "good": "It was not until 2019 that they met.",
        "bad": "It was not until 2019 that did they meet."
      }
    ]
  },
  "subjunctive-inversion": {
    "summary": "省略 if 时只把 were、had、should 提前；实义动词的过去式不能这样倒装，主句形式保持不变。",
    "items": [
      {
        "q": "哪些词可以提到主语前面构成虚拟倒装？",
        "a": "只有 were、had、should 三个。Had I known；Were I you；Should it rain。从句谓语是其他实义动词的过去式时，不能去掉 if 直接倒装，必须保留 if。",
        "good": "Had I known the answer, I would have told you.",
        "bad": "Knew I the answer, I would have told you."
      },
      {
        "q": "Were I … 后面主句用 would do 还是 would have done？",
        "a": "看假设的时间。Were I you 是对现在或未来的假设，主句用 would/could + 原形；Had I done 是对过去的假设，主句用 would/could have done。倒装不改变时态搭配。",
        "good": "Were I you, I would apologize right now.",
        "bad": "Were I you, I will apologize right now."
      },
      {
        "q": "否定形式的虚拟倒装，not 放在哪里？",
        "a": "not 放在主语后面：Had I not seen it, I would not have believed it。不能说 Had not I seen it。否定词不跟着 had 一起提前，这一点和普通疑问句的缩写形式不同。",
        "good": "Had I not met her, I would have left early.",
        "bad": "Had not I met her, I would have left early."
      }
    ]
  },
  "only-inversion": {
    "summary": "only 修饰状语时主句部分倒装，修饰主语时不倒装；倒装只提前助动词，实义动词位置不变。",
    "items": [
      {
        "q": "Only + 主语放句首，为什么不倒装？",
        "a": "倒装由 only 修饰状语触发，修饰主语时 only 只是限定主语范围，不构成状语前置，所以用正常语序：Only he knows。写成 Only does he know 就把主语限定误当成了状语前置。",
        "good": "Only a few students passed the final test.",
        "bad": "Only did a few students pass the final test."
      },
      {
        "q": "Only when 从句放句首，倒装落在哪一半？",
        "a": "倒装主句，从句内部保持正常语序：Only when he left did I realize the truth。did 属于主句，不能提到 when 从句的主语前面，这是最容易写错的位置。",
        "good": "Only when he left did I realize the truth.",
        "bad": "Only when did he leave I realized the truth."
      },
      {
        "q": "主句没有助动词时，only 倒装要补什么？",
        "a": "补 do/does/did，时态和人称跟原句谓语一致，实义动词回到原形：Only then did she notice the mistake。若原句有 can、will、have 等，直接提前它们，不再补 do。",
        "good": "Only then did she finally notice the obvious mistake.",
        "bad": "Only then she finally noticed the obvious mistake."
      }
    ]
  },
  "wish-ifonly": {
    "summary": "wish/if only 后：过去式表与现在相反，had done 表对过去的遗憾，would do 表希望将来改变。",
    "items": [
      {
        "q": "I wish I would … 这种说法对吗？",
        "a": "一般不对。wish + would 多表示希望别人或外界改变，不用于自己的愿望；说自己的愿望用 could 或过去式：I wish I could speak Japanese。只有希望将来某事发生时才偶见 would。",
        "good": "I wish I could speak Japanese as well as you.",
        "bad": "I wish I would speak Japanese as well as you."
      },
      {
        "q": "wish 后面的 be 动词用 was 还是 were？",
        "a": "正式语法和考试一律用 were：I wish she were here。口语里 was 能听到，但标准化测试通常判 were 正确。if only 后面规则完全相同，也用 were。",
        "good": "I wish she were here with us right now.",
        "bad": "I wish she is here with us right now."
      },
      {
        "q": "if only 和 wish 有什么区别？",
        "a": "时态规则相同，if only 语气更强，常独立成句表示感叹：If only I had listened！wish 必须带主语和从句。两者都可接过去式、had done、would do，选择依据是假设的时间。"
      }
    ]
  },
  "subjunctive": {
    "summary": "与现在相反：过去式+would do；与过去相反：had done+would have done；建议要求用原形。",
    "items": [
      {
        "q": "if 从句和主句的时态怎么配对？",
        "a": "三套固定搭配：与现在相反，if + 过去式，主句 would do；与过去相反，if + had done，主句 would have done；与将来相反，if + were to do/should do，主句 would do。主句不能用 will 或 would have done 乱配。",
        "good": "If I had known the truth, I would have called you.",
        "bad": "If I had known the truth, I will call you."
      },
      {
        "q": "混合虚拟是什么，怎么配时态？",
        "a": "从句说过去、主句说现在时，用 if + had done，主句 would do，常带 now：If I had taken the medicine, I would feel better now。不能因为从句是过去完成就把主句也写成 would have done。",
        "good": "If I had taken the medicine, I would feel better now.",
        "bad": "If I had taken the medicine, I will feel better now."
      },
      {
        "q": "suggest、insist 后面一定用 (should) do 吗？",
        "a": "不一定。表示建议、要求时用 (should) do；insist 表示“坚持说、坚称”时用陈述语气，suggest 表示“暗示、表明”时也不用虚拟。判断依据是词义，不是动词本身。",
        "good": "The doctor insisted that he stay in bed.",
        "bad": "The doctor insisted that he stays in bed."
      }
    ]
  },
  "but-for": {
    "summary": "but for 是介词短语，后接名词或动名词，相当于“要不是”，主句要用虚拟语气。",
    "items": [
      {
        "q": "but for 后面能接句子吗？",
        "a": "不能，它后面只能接名词、代词或动名词。要把动作放进去，用动名词：But for his helping us；或改用 if 从句：If he had not helped us。直接接主语加谓语是介词短语的典型误用。",
        "good": "But for his timely help, we would have missed the train.",
        "bad": "But for he helped us in time, we would have missed the train."
      },
      {
        "q": "but for 和 except for 有什么区别？",
        "a": "but for 表示“要不是”，句子用虚拟语气；except for 表示“除了”，陈述事实，不用虚拟。比较：But for the price, I would buy it；Except for the price, the car is perfect。",
        "good": "Except for the price, the car is perfect.",
        "bad": "But for the price, the car is perfect."
      },
      {
        "q": "but for 后面指现在还是过去，主句怎么定时态？",
        "a": "看事实时间：与现在或将来相反，主句用 would do；与过去相反，主句用 would have done。判断依据是事实发生在什么时候，不是 but for 本身；now 配 would be，yesterday 配 would have done。",
        "good": "But for the traffic, we would be there now.",
        "bad": "But for the traffic, we will be there now."
      }
    ]
  },
  "otherwise-subjunctive": {
    "summary": "otherwise 引出与事实相反的结果：事实在过去用 would have done，事实在现在用 would do。",
    "items": [
      {
        "q": "otherwise 前后时态怎么对齐？",
        "a": "先判断前句事实的时间。前句是过去的事实，otherwise 后用 would have done；前句是现在的事实，用 would do。不能只看 otherwise 本身，它不决定时态，事实时间才决定。",
        "good": "I was ill; otherwise I would have joined the party.",
        "bad": "I was ill; otherwise I would join the party."
      },
      {
        "q": "祈使句 + otherwise，后面也用虚拟吗？",
        "a": "不用。祈使句提出建议，otherwise 后是真实可能发生的结果，用 will 或陈述语气：Hurry up, otherwise you will miss the train。这里没有与事实相反，只是警告。",
        "good": "Hurry up, otherwise you will miss the train.",
        "bad": "Hurry up, otherwise you would have missed the train."
      },
      {
        "q": "otherwise 放句首一定是“否则”吗？",
        "a": "不一定。句首 otherwise 也可表示“在其他方面、除此之外”：The report is short; otherwise, it is well written。判断依据是前句是否提出一个条件或事实，以及后句是否给出相反结果。"
      }
    ]
  }
};
