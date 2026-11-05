// 语法卡「用法要点」：按语法点 key 索引，随语法本卡片一起展示。
// 只回答「这个词该接在哪、要不要连用、两种写法怎么选」，例句统一用通用句，不复用原文。

const USAGE_NOTES = {
  'noun-clause': {
    summary: 'whether 和 that 的位置完全一样，都引导名词性从句；区别是 whether 多一层“是否”的意思，而且从句内部永远用陈述语序。',
    items: [
      {
        q: 'whether 到底要不要跟 or not 连用？',
        a: '加不加都对，or not 只是把“两种可能”说满，考试和写作里省略也很常见。三种写法都成立：Whether or not he comes, we start on time.（or not 紧跟 whether）；I do not know whether he will come or not.（or not 放从句末尾）；I do not know whether he will come or stay home.（or 后面换成另一个选项）。',
        good: 'I do not know whether he will come.',
        bad: 'I do not know if or not he will come.',
      },
      {
        q: 'whether 能接在哪些位置？',
        a: '凡是能放名词的地方都能放：主语 Whether he agrees matters.、宾语 I do not know whether he agrees.、表语 The question is whether he agrees.、同位语 the question whether he agrees。介词后面只能用 whether，不能用 if。',
        good: 'It depends on whether it rains.',
        bad: 'It depends on if it rains.',
      },
      {
        q: 'whether 和 if 什么时候不能互换？',
        a: '只有宾语从句里两者可以换。主语从句、表语从句、同位语从句、介词后面、以及后面直接接不定式（whether to do）时，只能用 whether。',
        good: 'I have not decided whether to take the job.',
        bad: 'I have not decided if to take the job.',
      },
      {
        q: '前面已经有了 that，还能再放 whether 吗？',
        a: '不能，同一个从句只能由一个引导词带，whether 本身就顶替了 that 的位置：要么 The question is whether this works.（对），要么 The fact is that this works.（对），不能写成 that whether 叠在一起。只有 whether 从句再充当主语时才会和 that 分层，比如 I know that whether he comes is important.——这里 that 带的是整个「whether he comes is important」。',
        good: 'The question is whether this method works.',
        bad: 'The question is that whether this method works.',
      },
      {
        q: 'whether 后面的语序要注意什么？',
        a: '从句一律用陈述语序：whether + 主语 + 谓语。中文里是“是否……”，很多人会顺手写成疑问句语序，这是最常见的错。',
        good: 'I wonder whether the method works.',
        bad: 'I wonder whether does the method work.',
      },
      {
        q: 'what 和 that 怎么区分？',
        a: 'what 在从句里本身充当成分（主语或宾语），意思是“……的东西／事情”；that 只起连接作用，从句本身已经是完整的，不译出来。',
        good: 'What matters is whether we can finish on time.',
        bad: 'That matters is whether we can finish on time.',
      },
    ],
  },

  'not-only-but-also': {
    summary: 'not only A but also B：前后要接同类的成分；not only 放到句首时，前半句必须部分倒装。',
    items: [
      {
        q: 'not only 放句首要怎么变？',
        a: 'Not only + 助动词 + 主语 + 谓语，后半句照常语序。没有助动词就借 do / does / did。',
        good: 'Not only did she finish the task, but she also helped others.',
        bad: 'Not only she finished the task, but she also helped others.',
      },
      {
        q: 'but also 里的 also 能省吗？',
        a: 'also 可以省，只留 but 也正确；但 not only 不能拆开写，也不能只留 not。',
        good: 'He is not only a teacher but a friend.',
        bad: 'He is not a only teacher but also a friend.',
      },
      {
        q: '前后接的成分有什么要求？',
        a: '必须对等：名词配名词，动词配动词，从句配从句。一个接短语、一个接完整从句读起来就断了。',
        good: 'The course not only improves reading speed but also builds vocabulary.',
        bad: 'The course not only improves reading speed but also it builds vocabulary.',
      },
    ],
  },

  inversion: {
    summary: '句首否定或 only 类状语后面要部分倒装：状语 + 助动词 + 主语 + 谓语，只倒前半句。',
    items: [
      {
        q: '哪些词放句首要倒装？',
        a: 'never、hardly、scarcely、seldom、little、not only、not until、no sooner，以及 only + 状语、so + 形容词。它们只是普通状语时就不用倒装。',
        good: 'Never have I seen such a view.',
        bad: 'Never I have seen such a view.',
      },
      {
        q: '句子里没有助动词怎么办？',
        a: '借 do / does / did，后面的动词回到原形。',
        good: 'Seldom does he complain.',
        bad: 'Seldom he complains.',
      },
      {
        q: 'not only 和 not until 倒装的是哪半句？',
        a: 'not only 倒前半句；not until 放在句首时，倒的是主句，until 从句本身用正常语序。',
        good: 'Not until he left did I realize the truth.',
        bad: 'Not until did he leave I realized the truth.',
      },
    ],
  },

  'so-that': {
    summary: 'so + 形容词／副词 + that，such + (a/an) + 形容词 + 名词 + that，两条中间都要有内容。',
    items: [
      {
        q: 'so 和 such 怎么选？',
        a: 'so 后面跟形容词或副词，such 后面跟名词短语。名词前有 many / much / few / little 时反而用 so。',
        good: 'It was so cold that we stayed home.',
        bad: 'It was such cold that we stayed home.',
      },
      {
        q: 'so 和 that 中间能不断开吗？',
        a: '表“如此……以至于”时中间必须夹形容词或副词；so that 连写是“为了”，表目的，意思完全不同。',
        good: 'He ran so fast that nobody could catch him.',
        bad: 'He ran so that fast nobody could catch him.',
      },
      {
        q: 'that 能省略吗？',
        a: '口语里偶尔省，但写作里保留更清楚；一旦省掉，很容易被读成“目的”结构。',
        good: 'She was so tired that she fell asleep at once.',
        bad: 'She was so tired so that she fell asleep at once.',
      },
    ],
  },

  'as-many-as': {
    summary: 'as many/much + 名词 + as + 比较对象：前面管数量，后面管对象，两个 as 缺一不可。',
    items: [
      {
        q: 'many 和 much 怎么选？',
        a: 'many 接可数名词复数，much 接不可数名词；名词后面的 as 后面接比较对象。',
        good: 'She has as many books as her brother.',
        bad: 'She has as much books as her brother.',
      },
      {
        q: '第二个 as 后面能不能省？',
        a: '能省重复的谓语（as her brother 相当于 as her brother does），但 as 本身不能省，也不能换成 than。',
        good: 'He works as hard as anyone in the team.',
        bad: 'He works as hard than anyone in the team.',
      },
      {
        q: '倍数和一半放在哪？',
        a: '放第一个 as 前面：twice as many ... as、half as much ... as。',
        good: 'The new library holds three times as many books as the old one.',
        bad: 'The new library holds as many books three times as the old one.',
      },
    ],
  },

  'with-absolute': {
    summary: 'with + 名词 + 分词／形容词：名词是分词的逻辑主语，整体相当于一个状语从句。',
    items: [
      {
        q: '分词用 doing 还是 done？',
        a: '名词自己主动做这个动作 → doing；名词被做 → done。看名词和动作的关系，不看主句主语。',
        good: 'With the work finished, we went home.',
        bad: 'With the work finishing, we went home.',
      },
      {
        q: '这个结构在句子里作什么成分？',
        a: '作状语，说明时间、原因、条件或伴随情况，放句首或句尾都可以，但不能当主语。',
        good: 'With time passing by, they became more and more nervous.',
        bad: 'With time passing by made them more and more nervous.',
      },
      {
        q: '和 and 并列有什么区别？',
        a: 'with 结构是从属的附带情况，主干只有主句；用 and 并列就成了两个同等的主干。',
        good: 'He sat by the window, with his eyes fixed on the hills.',
        bad: 'He sat by the window, with his eyes fixing on the hills.',
      },
    ],
  },

  'by-oneself': {
    summary: 'by + 反身代词 = 独自、靠自己；反身代词必须和主语指同一个人。',
    items: [
      {
        q: 'by myself 和 on my own 有区别吗？',
        a: '意思基本一样，可以互换；by oneself 更书面，on one\'s own 更口语。',
        good: 'She finished the whole report by herself.',
        bad: 'She finished the whole report by her.',
      },
      {
        q: 'by myself 和 for myself 怎么区分？',
        a: 'by 强调“没有人帮”，for 强调“为自己”，两者不能混。',
        good: 'He learned to play the piano by himself.',
        bad: 'He learned to play the piano for himself.',
      },
      {
        q: '主语换了，反身代词要跟着变吗？',
        a: '要。he → himself，they → themselves，we → ourselves，而且人称和单复数都要对上。',
        good: 'They built the house themselves.',
        bad: 'They built the house himself.',
      },
    ],
  },

  'rather-than': {
    summary: 'rather than 连接两个对等成分，前面是选中的、后面是舍弃的；instead of 是介词，后面要接动名词。',
    items: [
      {
        q: 'rather than 后面接什么形式？',
        a: '和前面保持平行：前面是动词原形，后面也用原形；前面是动名词，前后都用动名词。',
        good: 'He chose to walk rather than take a taxi.',
        bad: 'He chose to walk rather than takes a taxi.',
      },
      {
        q: 'rather than 和 instead of 能互换吗？',
        a: '意思接近，但 instead of 是介词，后面接名词或动名词，不能接动词原形。',
        good: 'He walked instead of taking a taxi.',
        bad: 'He walked instead of take a taxi.',
      },
      {
        q: 'rather than 放句首要注意什么？',
        a: '后面通常接动词原形，构成“与其……不如……”的对比，前后结构仍要保持一致。',
        good: 'Rather than wait, she left at once.',
        bad: 'Rather than waits, she left at once.',
      },
    ],
  },

  'non-restrictive': {
    summary: '非限制性定语从句用逗号隔开，只补充信息，不能用 that；which 还能指代前面整句话。',
    items: [
      {
        q: '非限制性从句能用 that 吗？',
        a: '不能。有逗号时只能用 which / who / whom / whose。',
        good: 'The book, which came out last year, sold well.',
        bad: 'The book, that came out last year, sold well.',
      },
      {
        q: 'which 指代整句怎么用？',
        a: '逗号 + which，指代前面整句话，译成“这一点／这”。这种用法只能用 which，不能用 what。',
        good: 'He passed the exam, which surprised everyone.',
        bad: 'He passed the exam, what surprised everyone.',
      },
      {
        q: '逗号能不能省？',
        a: '不能随便省。有逗号是“顺便补充”，没逗号是“限定只有那些”。省掉逗号会改变整句意思。',
        good: 'My brother, who lives in Beijing, is a doctor.',
        bad: 'My brother who lives in Beijing, is a doctor.',
      },
    ],
  },

  cleft: {
    summary: '强调句：It is/was + 被强调部分 + that/who + 其余部分；抽掉 It is 和 that 后，剩下的仍是完整句子。',
    items: [
      {
        q: '强调人用 that 还是 who？',
        a: '都可以，强调人时 who 更自然；强调物、时间、地点一律用 that。',
        good: 'It was Mary who broke the window.',
        bad: 'It was Mary which broke the window.',
      },
      {
        q: '强调时间或地点能用 when / where 吗？',
        a: '不能。强调句里时间、地点后面仍然用 that，用 when / where 就变成定语从句了。',
        good: 'It was in 2020 that he moved here.',
        bad: 'It was in 2020 when he moved here.',
      },
      {
        q: '怎么判断是不是强调句？',
        a: '把 It is/was 和 that 去掉，剩下的词能重新组成一个完整句子，就是强调句；缺胳膊少腿就不是。',
        good: 'It was the noise that woke me up.',
        bad: 'It was the noise that woke me up because of it.',
      },
    ],
  },

  'the-more': {
    summary: 'the + 比较级 + 主语 + 谓语, the + 比较级 + 主语 + 谓语：前一个是条件，后一个是结果，两个 the 都不能省。',
    items: [
      {
        q: '两个 the 都能省略吗？',
        a: '都不能。the more ... the more ... 是固定搭配，少一个 the 结构就不成立。',
        good: 'The more you practise, the better you become.',
        bad: 'More you practise, better you become.',
      },
      {
        q: '后面的语序要倒装吗？',
        a: '不需要。the + 比较级 后面直接跟主语和谓语，保持正常语序。',
        good: 'The harder he works, the luckier he seems.',
        bad: 'The harder does he work, the luckier he seems.',
      },
      {
        q: '比较级后面可以接名词吗？',
        a: '可以：the more + 名词 + 主语 + 谓语，名词紧跟比较级。',
        good: 'The more books you read, the wider your view becomes.',
        bad: 'The more books do you read, the wider your view becomes.',
      },
    ],
  },

  'participle-adverbial': {
    summary: '分词作状语，逻辑主语必须和主句主语一致；主动用 doing，被动用 done。',
    items: [
      {
        q: 'doing 和 done 怎么选？',
        a: '看主句主语：主语主动做这个动作 → doing；主语被这个动作作用 → done。',
        good: 'Seen from the hill, the town looks small.',
        bad: 'Seeing from the hill, the town looks small.',
      },
      {
        q: '逻辑主语对不上怎么办？',
        a: '不能硬用分词，要改成状语从句，或者用 with 复合结构把主语补出来。',
        good: 'When the work was finished, we went home.',
        bad: 'Finishing the work, the machine broke down.',
      },
      {
        q: 'having done 什么时候用？',
        a: '分词动作发生在主句谓语之前时用，强调先后顺序。',
        good: 'Having finished his homework, he went out to play.',
        bad: 'Finishing his homework yesterday, he went out to play tomorrow.',
      },
    ],
  },

  appositive: {
    summary: '同位语紧跟在名词后面、解释它是什么，用逗号隔开；同位语从句用 that，that 不作成分。',
    items: [
      {
        q: '同位语和定语从句有什么区别？',
        a: '同位语直接等于前面的名词，中间不用谓语；定语从句是对名词的描述，必须有主谓结构。',
        good: 'Mr Li, our teacher, is very patient.',
        bad: 'Mr Li, our teacher is very patient, teaches us.',
      },
      {
        q: 'that 引导同位语从句要注意什么？',
        a: '常跟在 fact / news / idea / belief / hope 后面，that 不作任何成分，书面语里一般不省。',
        good: 'The fact that he lied shocked us.',
        bad: 'The fact he lied that shocked us.',
      },
      {
        q: '同位语从句和 that 定语从句怎么区分？',
        a: '同位语从句里 that 后面是完整句子；定语从句里 that 要充当主语或宾语，后面必有空缺。',
        good: 'The news that our team won excited us.',
        bad: 'The news that our team won it excited us.',
      },
    ],
  },

  'comparative-than': {
    summary: '比较级 + than，than 后面接比较对象；比较的两边要对等，程度用 much / far / even 修饰。',
    items: [
      {
        q: '比较级前面能不能用 very？',
        a: '不能。very 修饰原级；比较级要用 much、far、even、still、a lot。',
        good: 'This problem is much harder than that one.',
        bad: 'This problem is very harder than that one.',
      },
      {
        q: 'than 后面用主格还是宾格？',
        a: '口语里常用宾格（than me），正式写作里用主格加助动词（than I do）更严谨。',
        good: 'She runs faster than I do.',
        bad: 'She runs faster than me do.',
      },
      {
        q: '比较对象要对等吗？',
        a: '要对等：人和人比，物和物比。不能拿“人”和“人的作品”或“城市”和“城市的人口”直接比。',
        good: 'The population of Beijing is larger than that of Tianjin.',
        bad: 'The population of Beijing is larger than Tianjin.',
      },
    ],
  },

  'passive-modal': {
    summary: '情态动词 + be + 过去分词：情态动词后面永远是 be，不能写 been / being。',
    items: [
      {
        q: '情态动词的被动怎么写？',
        a: 'must / should / can / may + be + 过去分词，be 不能再变形。',
        good: 'The report must be submitted before Friday.',
        bad: 'The report must been submitted before Friday.',
      },
      {
        q: '两个情态动词能连用吗？',
        a: '不能。要表达“将会能够”，换成 will be able to；要表达“必须能够”，用 have to be able to。',
        good: 'He will be able to finish it tomorrow.',
        bad: 'He will can finish it tomorrow.',
      },
      {
        q: '被动里的 by 什么时候省略？',
        a: '执行者不知道、不重要或显而易见时就省略；需要强调“是谁做的”才保留。',
        good: 'The bridge was built in 1990.',
        bad: 'The bridge was built by someone in 1990 by people.',
      },
    ],
  },

  'nested-clauses': {
    summary: '嵌套从句一层套一层：先找最外层主句的主语和谓语，再顺着引导词往里剥。',
    items: [
      {
        q: '怎么断句？',
        a: '每个引导词（that / which / who / whether / what / because）都开启一个新层级，先标出层级再翻译。',
        good: 'He said that the plan which we proposed would work.',
        bad: 'He said that the plan which we proposed it would work.',
      },
      {
        q: '一个 that 管到哪里？',
        a: '管到下一个引导词出现或句子结束为止；里面的从句各自有自己的主谓，不要混成一层。',
        good: 'I know that what he said is true.',
        bad: 'I know that what he said it is true.',
      },
      {
        q: '翻译顺序怎么排？',
        a: '中文一般先译外层主干，再把内层从句按“……的”放到被修饰的名词前面，或者单独拆成一句。',
        good: 'The idea that machines can learn is no longer new.',
        bad: 'The idea machines that can learn is no longer new.',
      },
    ],
  },

  'long-sentence': {
    summary: '长句难点不在生词，而在修饰成分多；先抓主干，再把修饰按中文习惯重排。',
    items: [
      {
        q: '怎么快速找到主干？',
        a: '先找第一个实义动词，它前面是主语，后面是宾语或表语；其余成分都是修饰，先搁一边。',
        good: 'Researchers have found that small habits matter.',
        bad: 'Researchers have found small habits that matter have found.',
      },
      {
        q: '修饰成分放哪？',
        a: '中文习惯先说时间、地点、条件，再落到主干；英文常把修饰往后放，翻译时顺序要换过来。',
        good: 'In recent years, researchers have found that daily habits matter.',
        bad: 'Researchers have found that daily habits matter in recent years, researchers.',
      },
      {
        q: '长句要不要拆开译？',
        a: '一句中文装不下时，可以按从句拆成两三句，只要逻辑关系（因果、转折、条件）用连接词交代清楚。',
        good: 'The study shows that people who sleep well learn faster.',
        bad: 'The study shows that people who sleep well learn faster and the study shows.',
      },
    ],
  },
}

module.exports = { USAGE_NOTES }
