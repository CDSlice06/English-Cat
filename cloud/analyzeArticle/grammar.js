// 语法与句型规则库：命中后生成讲解、例句与双向翻译练习
// 说明文字只讲“怎么理解、怎么翻”，不逐句硬译原文

const RULES = [
  {
    key: 'as-many-as',
    label: 'as many / much … as 同级比较（含省略）',
    re: /\b(half|twice|three\s+times|four\s+times|several\s+times)\s+as\s+(many|much|few|little)\b|\bas\s+(many|much|few|little|early)\b[\s\S]{0,80}?\bas\b/i,
    understanding: '看到 as … as 先找两头：前面的 as 后面是被比较的内容，后面的 as 才是比较对象。完整形式是 as many + 名词 + as + 另一部分，口语和考试里经常把 as 后面的重复成分省掉（如 as many boys as girls (are)），所以会觉得“少了一半”。先把省略的部分补全，句子就通了。',
    translation: '中文一般译成“和……一样多/少”“达到……的程度”。比较对象放在“和”后面；如果 as 后面只剩一个名词或分词，先判断它承接的是哪一部分。',
    examples: [
      { en: 'Half as many students passed the test as last year.', zh: '通过考试的学生人数是去年的一半。' },
      { en: 'The company hired twice as many engineers as it did in 2020.', zh: '这家公司招聘的工程师是 2020 年的两倍。' }
    ],
    en2zh: { prompt: 'The new library holds three times as many books as the old one.', reference: '新图书馆的藏书量是旧馆的三倍。', keywords: ['藏书', '三倍', '旧'] },
    zh2en: { prompt: '今年的报名人数是去年的两倍。', reference: 'Twice as many people signed up this year as last year.', keywords: ['twice', 'as many', 'as'] }
  },
  {
    key: 'with-absolute',
    label: 'with 复合结构（独立主格）',
    re: /\bwith\s+\w+(\s+\w+){0,4}\s+(engaged|doing|done|involved|based|filled|covered|faced|held)\b/i,
    understanding: 'with + 名词 + 分词/形容词，是一个“附带情况”结构，不是介词短语那么简单。它相当于一个状语从句：with half as many boys engaged = 在只有一半男孩参与的情况下。名词是分词的逻辑主语，翻译时通常拆成一个分句。',
    translation: '译成“随着……／在……的情况下／……着”。千万不要译成“和……一起”，要看后面接的是不是动作或状态。',
    examples: [
      { en: 'With the exam approaching, she studied late into the night.', zh: '随着考试临近，她学习到深夜。' },
      { en: 'He sat by the window, with his eyes fixed on the distant hills.', zh: '他坐在窗边，目光凝视着远处的山丘。' }
    ],
    en2zh: { prompt: 'With so many problems unsolved, the project cannot move forward.', reference: '还有这么多问题没有解决，项目无法推进。', keywords: ['问题', '解决', '无法'] },
    zh2en: { prompt: '随着时间一点点过去，他们越来越紧张。', reference: 'With time passing by, they became more and more nervous.', keywords: ['with', 'passing', 'more'] }
  },
  {
    key: 'by-oneself',
    label: 'by + 反身代词 / by oneself',
    re: /\bby\s+(him|her|my|your|them|our|it)self\b|\bby\s+(themselves|ourselves|yourselves|myself|yourself|herself|himself|itself)\b/i,
    understanding: 'by + 反身代词不是“被自己”，而是“独自、靠自己、无人帮助”。by itself 还可以表示“自动地、本身”。判断依据是主语和反身代词是否指同一人。',
    translation: '译成“独自／靠自己／本身”。如果后面还有动作，注意它是方式状语，放在动词前更顺。',
    examples: [
      { en: 'She finished the whole report by herself.', zh: '她独自完成了整份报告。' },
      { en: 'The door opened by itself.', zh: '门自己开了。' }
    ],
    en2zh: { prompt: 'He learned to play the piano by himself.', reference: '他自学了弹钢琴。', keywords: ['自学', '钢琴'] },
    zh2en: { prompt: '这个孩子独自完成了这幅画。', reference: 'The child finished the painting by himself.', keywords: ['by himself', 'finished'] }
  },
  {
    key: 'not-only-but-also',
    label: 'not only … but also 递进并列',
    re: /not\s+only[\s\S]{0,80}?but\s+(also\s+)?/i,
    understanding: '这是并列结构，前后接的成分要对等：not only + A, but also + B。如果 not only 放到句首，前半句要部分倒装（Not only did he …），这是考试常设的“坑”。',
    translation: '译成“不但……而且……”。中文习惯把重点放在“而且”后面，翻译时后置信息不要漏。',
    examples: [
      { en: 'The course not only improves reading speed but also builds vocabulary.', zh: '这门课不但提高阅读速度，而且扩充词汇量。' },
      { en: 'Not only did she finish the task, but she also helped others.', zh: '她不仅完成了任务，还帮助了别人。' }
    ],
    en2zh: { prompt: 'Not only does exercise strengthen the body, but it also improves mood.', reference: '锻炼不仅能强身健体，还能改善情绪。', keywords: ['不仅', '改善', '情绪'] },
    zh2en: { prompt: '这本书不仅有趣，而且很有教育意义。', reference: 'The book is not only interesting but also educational.', keywords: ['not only', 'but also'] }
  },
  {
    key: 'rather-than',
    label: 'rather than / instead of 取舍对比',
    re: /\brather\s+than\b|\binstead\s+of\b/i,
    understanding: 'rather than 连接两个对等成分，表示“是前者而不是后者”，重点在前面的部分；instead of 是介词短语，后面接名词或动名词。两者都常被误译成“代替”。',
    translation: '译成“而不是／并非……”。中文把肯定的部分放前面，否定的部分用“而不是”收尾。',
    examples: [
      { en: 'He chose to walk rather than take a taxi.', zh: '他选择走路而不是打车。' },
      { en: 'The problem lies in the method rather than the data.', zh: '问题出在方法上，而不是数据上。' }
    ],
    en2zh: { prompt: 'Reading carefully rather than quickly is what improves comprehension.', reference: '真正提升理解力的是仔细阅读，而不是快速阅读。', keywords: ['仔细', '而不是', '理解'] },
    zh2en: { prompt: '我们应该解决问题，而不是回避它。', reference: 'We should solve the problem rather than avoid it.', keywords: ['rather than', 'avoid'] }
  },
  {
    key: 'non-restrictive',
    label: '非限制性定语从句（, which / who …）',
    re: /,\s*(which|who|whom|whose)\s+[a-z]/i,
    understanding: '逗号后面的 which/who 从句是补充说明，删掉不影响主句成立。which 指代前面整句或某个名词，判断指代对象是理解的关键；不能译成“哪个”。',
    translation: '拆成两个短句译：“……，这一点……／他/它……”。不要硬塞进定语位置。',
    examples: [
      { en: 'The experiment failed, which surprised everyone.', zh: '实验失败了，这让所有人都很意外。' },
      { en: 'My teacher, who has taught for twenty years, recommends this book.', zh: '我的老师已经教了二十年书，他推荐了这本书。' }
    ],
    en2zh: { prompt: 'The plan was delayed, which cost the company a lot of money.', reference: '计划被推迟了，这让公司损失了很多钱。', keywords: ['推迟', '损失', '这'] },
    zh2en: { prompt: '他迟到了，这让老师很生气。', reference: 'He was late, which made the teacher angry.', keywords: ['which', 'angry'] }
  },
  {
    key: 'wish-ifonly',
    label: 'wish / if only / would rather 的虚拟表达',
    re: /\bif\s+only\b|\bwould\s+rather\s+(i|we|he|she|they|you)\b|\bit(?:'s|s|\s+is)\s+(high|about)\s+time\s+(that\s+)?[a-z]+\b|\bwish\s+(i|we|he|she|they|you)\s+(had|were)\b/i,
    understanding: 'wish / if only + had done 表示对过去的遗憾，+ 过去式（were / did）表示与现在相反；would rather + 过去式表示“宁愿”；It is high time that + 过去式表示“早该做某事了”。',
    translation: 'wish / if only 译“真希望……/要是……就好了”；would rather 译“宁愿”；It is high time 译“早就该……”。',
    examples: [
      { en: 'If only we had started earlier.', zh: '要是我们早点开始就好了。' },
      { en: 'It is high time that the rule was updated.', zh: '这条规定早就该更新了。' }
    ],
    en2zh: { prompt: 'I wish I had kept the original data.', reference: '我真希望当初保留了原始数据。', keywords: ['希望', '保留', '原始'] },
    zh2en: { prompt: '你要是早点告诉我，我就不会犯这个错误了。', reference: 'If only you had told me earlier, I would not have made this mistake.', keywords: ['if only', 'had told'] }
  },
  {
    key: 'noun-clause',
    label: '名词性从句（what / whether / that 引导）',
    re: /\b(?:what\s+(?!a\b|an\b)|whether\s+|that\s+)(the|a|an|it|he|she|they|we|you|people|students|this|these|there)\b/i,
    understanding: '从句在句中充当主语、宾语或表语。what = the thing that（“……的东西/事情”），whether = “是否”，that 只起连接作用、不译。判断方法：把整个从句当成一个名词来看。',
    translation: 'what 从句译成“……的（东西/事）”；whether 译成“是否”；that 从句直接按陈述句译，不译“那个”。',
    examples: [
      { en: 'What matters most is how you respond to failure.', zh: '最重要的是你如何面对失败。' },
      { en: 'Whether the plan works depends on teamwork.', zh: '这个计划是否奏效取决于团队合作。' }
    ],
    en2zh: { prompt: 'What the report suggests is that the market is changing fast.', reference: '这份报告表明，市场正在快速变化。', keywords: ['报告', '市场', '变化'] },
    zh2en: { prompt: '我们需要知道的是这个方法是否有效。', reference: 'What we need to know is whether this method works.', keywords: ['what', 'whether'] }
  },
  {
    key: 'cleft',
    label: '强调句 It is … that …',
    re: /\bit\s+(is|was)\s+(?!(?:\w+\s+)?(surprising|clear|true|obvious|important|possible|likely|necessary|natural|difficult|easy|hard|interesting|evident|apparent|worth|known|said|reported|believed|argued|wonder|time)\b)[\s\S]{0,60}?\s+that\s+/i,
    understanding: '去掉 It is/was 和 that，剩下的部分仍能组成完整句子，就是强调句。被强调的成分放在 It is 和 that 之间，可以是人、时间、地点或原因。',
    translation: '译成“正是……才……”“是……（做）的”。不要译成“它是……的”。',
    examples: [
      { en: 'It was his attitude that impressed the interviewer.', zh: '打动面试官的是他的态度。' },
      { en: 'It is through practice that skills are built.', zh: '技能正是通过练习建立起来的。' }
    ],
    en2zh: { prompt: 'It is the details that decide whether a translation reads naturally.', reference: '决定译文是否自然的正是细节。', keywords: ['细节', '译文', '自然'] },
    zh2en: { prompt: '正是这次经历改变了他的想法。', reference: 'It was this experience that changed his mind.', keywords: ['it was', 'that', 'changed'] }
  },
  {
    key: 'inversion',
    label: '部分倒装（否定词 / only 置于句首）',
    re: /^(not\s+until|hardly|scarcely|no\s+sooner|never|rarely|seldom|only\s+(when|by|then|after))\b/i,
    understanding: '否定词或 only + 状语放句首时，主句要部分倒装：把助动词/情态动词提到主语前（did he / can we / has it）。not until 译“直到……才”；hardly / scarcely … when 和 no sooner … than 译“一……就……”，主句用过去完成时，从句用一般过去时。这是形式变化，意思不变。',
    translation: '按正常语序理解即可，译成“直到……才……”“一……就……”“只有……才……”。',
    examples: [
      { en: 'Not until midnight did he finish the essay.', zh: '直到午夜他才写完文章。' },
      { en: 'Only by reading widely can you write well.', zh: '只有广泛阅读，你才能写得好。' },
      { en: 'No sooner had the announcement been made than shares fell.', zh: '公告刚发布，股价就下跌了。' }
    ],
    en2zh: { prompt: 'Hardly had she sat down when the phone rang.', reference: '她刚坐下，电话就响了。', keywords: ['刚', '坐下', '电话'] },
    zh2en: { prompt: '直到考试结束，他才意识到时间不够。', reference: 'Not until the exam ended did he realize time was short.', keywords: ['not until', 'did'] }
  },
  {
    key: 'so-that',
    label: 'so … that / such … that 结果状语从句',
    re: /\bso\s+(?!that\b)[a-z]+\b[\s\S]{0,45}?\bthat\b|\bsuch\s+[\s\S]{0,45}?\bthat\b/i,
    understanding: 'so 修饰形容词/副词，such 修饰名词：so + adj./adv. + that；such + (a/an) + adj. + n. + that。that 后面是结果，不是目的。若 so + adj./adv. 或 such + n. 提到句首，主句要倒装：So rapid was the change that …；Such was the impact that …。',
    translation: '译成“如此……以至于……”。中文可简化为“……得让/使得……”。',
    examples: [
      { en: 'The lecture was so dense that few students took notes.', zh: '讲座内容太密集，很少有学生记笔记。' },
      { en: 'It was such a long journey that everyone fell asleep.', zh: '旅途太漫长，所有人都睡着了。' },
      { en: 'So rapid was the change that few companies could adapt.', zh: '变化如此之快，很少有公司能适应。' }
    ],
    en2zh: { prompt: 'The instructions were so clear that even beginners could follow them.', reference: '说明非常清楚，连初学者都能照着做。', keywords: ['清楚', '初学者', '照'] },
    zh2en: { prompt: '这个问题太复杂，没人能马上解决。', reference: 'The problem is so complex that nobody can solve it at once.', keywords: ['so', 'that'] }
  },
  {
    key: 'the-more',
    label: 'the more …, the more … 比较句式',
    re: /\bthe\s+(more|less|better|worse|harder|easier|longer|fewer)\b[\s\S]{0,80}?,\s*the\s+(more|less|better|worse|harder|easier|longer|fewer)\b/i,
    understanding: '两个 the + 比较级，前一个是条件，后一个是结果，顺序不能颠倒：The more you read, the faster you read. 中文习惯先说条件。',
    translation: '译成“越……，越……”。前半句用“越……”，后半句用“就越……”。',
    examples: [
      { en: 'The more carefully you plan, the fewer mistakes you make.', zh: '计划得越仔细，犯的错误就越少。' },
      { en: 'The longer he waited, the more anxious he became.', zh: '他等得越久，就越焦虑。' }
    ],
    en2zh: { prompt: 'The earlier you start, the more time you will have.', reference: '开始得越早，拥有的时间就越多。', keywords: ['越早', '越多'] },
    zh2en: { prompt: '练习得越多，进步就越大。', reference: 'The more you practise, the more progress you make.', keywords: ['the more', 'progress'] }
  },
  {
    key: 'participle-adverbial',
    label: '分词作状语（doing / done 开头）',
    re: /^(Faced|Facing|Given|Compared|Judging|Considering|Having|Being|Encouraged|Motivated|Based)\b/i,
    understanding: '句首的分词短语作状语，它的逻辑主语必须和主句主语一致。doing 表示主动或进行，done 表示被动或完成。判断主动/被动是理解的关键。',
    translation: '译成“面对……／考虑到……／与……相比／……之后”。先译状语，再译主句。',
    examples: [
      { en: 'Faced with rising costs, the company cut its staff.', zh: '面对成本上涨，公司裁减了员工。' },
      { en: 'Compared with last year, sales have doubled.', zh: '与去年相比，销售额翻了一番。' }
    ],
    en2zh: { prompt: 'Encouraged by the results, the team decided to continue.', reference: '受到结果的鼓舞，团队决定继续下去。', keywords: ['鼓舞', '团队', '继续'] },
    zh2en: { prompt: '考虑到时间有限，我们只讨论重点。', reference: 'Considering the limited time, we will discuss only the key points.', keywords: ['considering', 'limited', 'key'] }
  },
  {
    key: 'appositive',
    label: '同位语从句（the fact / idea / belief that …）',
    re: /\b(fact|idea|belief|news|hope|possibility|evidence|suggestion|conclusion)\s+that\s+/i,
    understanding: 'that 从句解释前面抽象名词的具体内容，不是定语。判断方法：that 在从句里不作成分，且从句内容 = 那个名词的内容。',
    translation: '译成“……的事实/观点/证据是……”，或直接用冒号引出内容。',
    examples: [
      { en: 'The fact that he apologized changed nothing.', zh: '他道歉了这一事实并没有改变什么。' },
      { en: 'There is evidence that the method works.', zh: '有证据表明这个方法有效。' }
    ],
    en2zh: { prompt: 'The belief that talent decides success is misleading.', reference: '认为天赋决定成功的看法是误导性的。', keywords: ['天赋', '成功', '误导'] },
    zh2en: { prompt: '有证据表明阅读量会影响写作水平。', reference: 'There is evidence that reading affects writing.', keywords: ['evidence', 'that'] }
  },
  {
    key: 'comparative-than',
    label: '比较级 + than 结构（含 than 后省略）',
    re: /\b(?!rather\b|other\b)\w+er\s+than\b|\bmore\s+\w+\s+than\b|\bless\s+\w+\s+than\b/i,
    understanding: 'than 后面常省略与前面重复的成分，只留比较对象。看到 than 后面只有一个名词或代词，先还原被省略的部分，再判断比较的是什么。',
    translation: '译成“比……更……”。注意否定比较 less … than 是“不如……”。',
    examples: [
      { en: 'This approach is more effective than the traditional one.', zh: '这种方法比传统方法更有效。' },
      { en: 'He works harder than anyone else in the group.', zh: '他比组里任何人都努力。' }
    ],
    en2zh: { prompt: 'The second draft is less convincing than the first.', reference: '第二稿不如第一稿有说服力。', keywords: ['第二稿', '不如', '第一稿'] },
    zh2en: { prompt: '这个问题比我们预想的更复杂。', reference: 'The problem is more complex than we expected.', keywords: ['more', 'than'] }
  },
  {
    key: 'passive-modal',
    label: '情态动词 + 被动语态',
    re: /\b(can|may|must|should|could|would|will)\s+be\s+(\w+ed|done|made|seen|used|found|given|taken|chosen|written|shown|known|held|kept|left|brought|thought|bought|taught|caught|built|sent|spent|told|sold|set|put|read|run|won|begun|grown|drawn|driven|forgotten|hidden|lost|meant|met|paid|said|shut|sought|stood|struck|understood|worn)\b/i,
    understanding: '情态动词 + be + 过去分词，表示“可以被/应该被/必须被……”。中文常省略“被”，改成主动表达更自然。',
    translation: '译成“可以……／应该……／必须……”。英文的被动在中文里往往转成主动或无主句。',
    examples: [
      { en: 'The data must be checked before publication.', zh: '数据在发表前必须核对。' },
      { en: 'This problem can be solved in two ways.', zh: '这个问题可以用两种方法解决。' }
    ],
    en2zh: { prompt: 'The results should be interpreted with caution.', reference: '这些结果应该谨慎解读。', keywords: ['结果', '谨慎', '解读'] },
    zh2en: { prompt: '这份报告必须在周五之前提交。', reference: 'The report must be submitted before Friday.', keywords: ['must be', 'submitted'] }
  },
  {
    key: 'as-if',
    label: 'as if / as though 引导方式状语从句',
    re: /\bas\s+(if|though)\b/i,
    understanding: 'as if / as though 意思是“好像”，后面从句用虚拟语气（were / had done / would do）表示与事实不符，用陈述语气表示可能性较大。判断时看它说的是不是真的：不像真的就该用虚拟。',
    translation: '译成“好像……似的”。虚拟语气时中文常加“仿佛、似乎”，不要译成“如果”。',
    examples: [
      { en: 'He talks as if he had seen the whole process himself.', zh: '他说得好像他亲眼看过整个过程似的。' },
      { en: 'It looks as if it is going to rain.', zh: '看起来好像要下雨了。' }
    ],
    en2zh: { prompt: 'She acted as though nothing had happened.', reference: '她表现得好像什么都没发生过。', keywords: ['好像', '什么都', '发生'] },
    zh2en: { prompt: '他对待我好像我是他的亲兄弟一样。', reference: 'He treats me as if I were his own brother.', keywords: ['as if', 'were'] }
  },
  {
    key: 'reflexive-use',
    label: '反身代词（主语和宾语同指）',
    re: /\b(myself|yourself|himself|herself|itself|ourselves|yourselves|themselves)\b/i,
    understanding: '反身代词指回本句的主语，不是另一个人。判断方法：把反身代词换回主语，句子意思不变就是同指。常见搭配有 enjoy oneself（玩得开心）、help oneself（自取）、in itself（本身）、of itself（自发地）。',
    translation: '不要一律译成“自己”。enjoy oneself 译“玩得开心”，help oneself 译“随便吃/自取”，in itself 译“本身”，by oneself 译“独自”。',
    examples: [
      { en: 'She blamed herself for the mistake.', zh: '她因为这次失误责怪自己。' },
      { en: 'The policy is not harmful in itself.', zh: '这项政策本身并没有害处。' }
    ],
    en2zh: { prompt: 'The children enjoyed themselves at the party.', reference: '孩子们在聚会上玩得很开心。', keywords: ['孩子们', '开心', '聚会'] },
    zh2en: { prompt: '他应该为这个决定负责，而不是责怪别人。', reference: 'He should hold himself responsible for the decision instead of blaming others.', keywords: ['himself', 'responsible'] }
  },
  {
    key: 'as-concession',
    label: 'as 引导让步倒装（Much as I like it）',
    re: /(^|[,;]\s*)(much|hard|try|child|fool|young|late|early|fast|carefully|quickly|deeply|rich|poor|student|teacher|scientist)\s+as\s+(i|you|he|she|we|they|it|a|an|the|[a-z]+)\b/i,
    understanding: 'as 表示让步时必须倒装：把形容词、副词、名词或动词原形提到 as 前面，意思是“尽管……”。Much as I like it = 尽管我很喜欢它；Child as he is = 尽管他还是个孩子；Try as he might = 尽管他已经努力了。',
    translation: '译成“尽管……、虽然……”。不要把这里的 as 译成“因为”或“当……时”。',
    examples: [
      { en: 'Much as I admire his courage, I cannot agree with the plan.', zh: '尽管我很佩服他的勇气，但我无法同意这个方案。' },
      { en: 'Try as she might, she could not open the door.', zh: '尽管她努力尝试，还是打不开门。' }
    ],
    en2zh: { prompt: 'Young as he is, he has published three papers.', reference: '尽管他很年轻，已经发表了三篇论文。', keywords: ['尽管', '年轻', '论文'] },
    zh2en: { prompt: '尽管这个方案很好，我们还是负担不起。', reference: 'Good as the plan is, we still cannot afford it.', keywords: ['good as', 'afford'] }
  },
  {
    key: 'comparative-substitute',
    label: '比较从句的替代（as / than + 主语 + do / did）',
    re: /\b(as|than)\s+(i|we|you|he|she|they|it)\s+(do|does|did|can|could|have|has|had|will|would|is|are|was|were)\b|\b(as|than)\s+the\s+[a-z]+\s+(do|does|did)\b/i,
    understanding: '比较从句里为了避免重复，用 do / does / did 代替前面出现过的动词，或用 can / have / will 代替整个谓语。看到 as … as it did、than we do，要先把替代的部分还原成完整谓语再理解。',
    translation: '译成“和……一样”“比……更……”，替代词不必译出来；还原后按中文把比较对象说清楚。',
    examples: [
      { en: 'The company hired more workers this year than it did last year.', zh: '这家公司今年招的工人比去年多。' },
      { en: 'She reads as carefully as her teacher does.', zh: '她读得和她的老师一样仔细。' }
    ],
    en2zh: { prompt: 'Online courses cost less than traditional ones do.', reference: '网络课程比传统课程花费少。', keywords: ['网络课程', '传统', '少'] },
    zh2en: { prompt: '今年的销售额比去年增长得更快。', reference: 'Sales grew faster this year than they did last year.', keywords: ['than', 'did'] }
  },
  {
    key: 'subjunctive',
    label: '虚拟语气（与事实相反 / 建议要求）',
    re: /\bif\s+(i|we|he|she|it|they|you)\s+(were|had\s+[a-z]+)\b|\bhad\s+(i|we|he|she|it|they|you)\s+[a-z]+\b[\s\S]{0,80}?\b(would|could|might)\s+have\b|\b(would|could|might)\s+have\s+[a-z]+\b[\s\S]{0,80}?\bif\b|\bwish\s+(i|we|he|she|they|you)\s+(were|had)\b|\bit\s+is\s+(essential|important|necessary|vital|crucial|imperative)\s+that\s+[a-z]+\s+(be|not\s+be)\b/i,
    understanding: '虚拟语气表示与事实相反、或者只是建议/要求。与现在相反用 were / 过去式；与过去相反用 had done 或 would have done；表示建议要求时 that 从句用 (should) + 动词原形。看到 were / would have done 先判断它是不是在说“实际上没有发生”。',
    translation: '译成“如果……就……”“本来会……”“真希望……”。与事实相反的语气要用“本来、要是”这类词点出来。',
    examples: [
      { en: 'If I were you, I would accept the offer.', zh: '如果我是你，我就会接受这个提议。' },
      { en: 'It is essential that every member be informed.', zh: '每位成员都必须知情，这一点很关键。' }
    ],
    en2zh: { prompt: 'Had they left earlier, they would have caught the train.', reference: '他们要是早点出发，本来能赶上火车。', keywords: ['早点', '本来', '赶上'] },
    zh2en: { prompt: '如果当时我知道答案，我就不会保持沉默了。', reference: 'If I had known the answer, I would not have stayed silent.', keywords: ['had known', 'would not have'] }
  },
  {
    key: 'ellipsis',
    label: '省略结构（if necessary / when asked / than expected）',
    re: /\b(if|when|while|though|unless|as)\s+(necessary|possible|needed|required|asked|compared|expected|planned|usual)\b|\bthan\s+(expected|before|usual|necessary|planned)\b/i,
    understanding: '状语从句常把“主语 + be”省掉，只留形容词或分词：if (it is) necessary、when (they were) asked、than (was) expected。看到这类短语先补回被省的成分，再判断它修饰谁。',
    translation: '译成“如果有必要”“被问到时”“比预期的……”。中文一般补出主语或“情况”，不要直译成“当必要时”。',
    examples: [
      { en: 'Please call me if necessary.', zh: '如果有必要，请给我打电话。' },
      { en: 'When asked about the plan, she gave no answer.', zh: '被问到这个计划时，她没有回答。' }
    ],
    en2zh: { prompt: 'The results were better than expected.', reference: '结果比预期的要好。', keywords: ['结果', '预期', '好'] },
    zh2en: { prompt: '如果可能的话，请提前提交报告。', reference: 'Please submit the report in advance if possible.', keywords: ['if possible', 'submit'] }
  },
  {
    key: 'absolute-noun',
    label: '独立主格（名词 + 分词，无 with）',
    re: /(^|[.;]\s*)(the\s+|his\s+|her\s+|its\s+|their\s+)?[a-z]+\s+(having|being|done|finished|completed|gone|left|remaining)\b[^.;]*[,]/i,
    understanding: '独立主格是“名词 + 分词/形容词”的短语，不带 with，前面的名词是后面分词的逻辑主语，整体相当于一个状语从句。判断方法：这个名词不是主句的主语或宾语，而是独立的一小段。',
    translation: '译成“由于……／……之后／在……的情况下”。先译这个小结构，再译主句。',
    examples: [
      { en: 'The work finished, they went home.', zh: '工作完成后，他们回家了。' },
      { en: 'His health failing, he gave up the job.', zh: '由于健康状况恶化，他辞掉了这份工作。' }
    ],
    en2zh: { prompt: 'The meeting over, everyone left the room quickly.', reference: '会议结束后，大家很快离开了房间。', keywords: ['会议', '结束', '离开'] },
    zh2en: { prompt: '所有问题都解决之后，团队重新开始了计划。', reference: 'All the problems solved, the team restarted the plan.', keywords: ['solved', 'restarted'] }
  },
  {
    key: 'there-be',
    label: 'there be 存在句（含 there is evidence that）',
    re: /\bthere\s+(is|are|was|were|has\s+been|have\s+been|remains?|seems?)\b/i,
    understanding: 'there be 表示“某处存在某物”，be 后面的名词才是真正的主语，谓语单复数跟着它走。there is evidence that … 这种结构后面常接同位语从句，译的时候先译“有……”，再译具体内容。',
    translation: '译成“……有……”“存在……”。不要译成“那里是”；there 在这里没有“那里”的意思。',
    examples: [
      { en: 'There are several reasons for the change.', zh: '这一变化有几个原因。' },
      { en: 'There is evidence that the method works.', zh: '有证据表明这个方法有效。' }
    ],
    en2zh: { prompt: 'There is little doubt that the plan will succeed.', reference: '几乎可以确定这个计划会成功。', keywords: ['确定', '计划', '成功'] },
    zh2en: { prompt: '这座城市有很多值得参观的地方。', reference: 'There are many places worth visiting in this city.', keywords: ['there are', 'worth'] }
  },
  {
    key: 'formal-it',
    label: 'it 作形式主语 / 形式宾语',
    re: /\bit\s+(is|was|seems|remains)\s+(important|necessary|possible|difficult|easy|hard|likely|unlikely|clear|true|worth|essential|vital)\s+(to|that|for)\b|\b(make|makes|made|find|finds|found|consider|considers|considered)\s+it\s+(possible|necessary|difficult|easy|clear|hard)\b/i,
    understanding: 'it 在这里不指具体东西，只是占住主语或宾语的位置，真正的内容在后面：It is important to … / make it possible to …。理解时把 it 划掉，把后面的 to do 或 that 从句当成主语/宾语。',
    translation: '译成“做某事很重要/有可能……”，不要译“它是……”。中文通常把真正的主语提前。',
    examples: [
      { en: 'It is difficult to change a habit overnight.', zh: '一夜之间改掉一个习惯很难。' },
      { en: 'New technology makes it possible to work from home.', zh: '新技术让居家办公成为可能。' }
    ],
    en2zh: { prompt: 'It is worth noting that the data covers only two years.', reference: '值得注意的是，这些数据只覆盖了两年。', keywords: ['值得', '数据', '两年'] },
    zh2en: { prompt: '这项研究让医生更早发现问题成为可能。', reference: 'The study makes it possible for doctors to find problems earlier.', keywords: ['makes it possible', 'doctors'] }
  },
  {
    key: 'so-neither-inversion',
    label: 'so / neither 倒装（So did he）',
    re: /(^|[.;]\s*)(so|neither|nor)\s+(did|do|does|is|are|was|were|has|have|had|can|could|will|would)\s+[a-z]+/i,
    understanding: 'so / neither / nor 放句首表示“也是如此 / 也不”，后面必须倒装：So did he（他也这样）、Neither can we（我们也不能）。助动词要和前一句的时态、情态保持一致。',
    translation: '译成“……也是这样”“……也不……”。不要译成“所以”或“两者都不”。',
    examples: [
      { en: 'She enjoyed the lecture, and so did her classmates.', zh: '她喜欢这场讲座，她的同学也是。' },
      { en: 'He cannot attend, and neither can I.', zh: '他不能参加，我也不能。' }
    ],
    en2zh: { prompt: 'The first plan failed, and so did the second.', reference: '第一个方案失败了，第二个也是。', keywords: ['第一个', '第二个', '也是'] },
    zh2en: { prompt: '她没看过这部电影，她弟弟也没看过。', reference: 'She has not seen the film, and neither has her brother.', keywords: ['neither', 'has'] }
  },
  {
    key: 'as-long-as',
    label: 'as long as 引导条件状语从句',
    re: /\b(as|so)\s+long\s+as\b/i,
    understanding: 'as long as = 只要，引导条件状语从句，相当于 provided that。它不是“和……一样长”：表示长度比较时 as long as 后面直接接名词，而条件从句里必须有主语和谓语。',
    translation: '译成“只要……就……”。从句在前时中文常补一个“就”，不要译成“一样长”。',
    examples: [
      { en: 'You can borrow the book as long as you return it on time.', zh: '只要你按时归还，就可以借这本书。' },
      { en: 'The plan will work as long as everyone cooperates.', zh: '只要大家配合，这个方案就能奏效。' }
    ],
    en2zh: { prompt: 'As long as the data is reliable, the conclusion holds.', reference: '只要数据可靠，这个结论就成立。', keywords: ['只要', '数据', '结论'] },
    zh2en: { prompt: '只要你提前预约，就能用这个会议室。', reference: 'You can use the meeting room as long as you book it in advance.', keywords: ['as long as', 'book'] }
  },
  {
    key: 'as-relative',
    label: 'as 引导定语从句（such / the same / as is known）',
    re: /\b(such|the\s+same)\s+[^.;]{0,40}?\bas\b|\bas\s+(is|was|are|were)\s+(often|well|widely|commonly|generally|expected|shown|known|mentioned|reported|argued|noted|suggested|estimated)\b|\bas\s+(noted|shown|mentioned|described|explained|stated|reported|discussed|indicated|illustrated|suggested|argued|expected)\b|\bas\s+(we|you|they|he|she|i)\s+(all\s+)?(know|knew|saw|expected|mentioned|noted|agree|have\s+seen)\b/i,
    understanding: 'as 也能引导定语从句，指代前面整句话或前面出现过的名词：as is often the case（情况常常如此）、as we all know（众所周知）、such … as（像……这样的）、the same … as（和……相同的）。它和 which 的区别是 as 从句可以放在句首或句中。',
    translation: '译成“正如……”“像……这样的”。as 指代整句时，中文常译“这一点、这种情况”。',
    examples: [
      { en: 'As is often the case, the cheapest option was not the best one.', zh: '正如常见的情况那样，最便宜的选择并不是最好的。' },
      { en: 'We need a tool such as this one.', zh: '我们需要一个像这样的工具。' }
    ],
    en2zh: { prompt: 'As we all know, habits are hard to change.', reference: '众所周知，习惯很难改变。', keywords: ['众所周知', '习惯', '改变'] },
    zh2en: { prompt: '正如报告所指出的，这个问题需要尽快解决。', reference: 'As the report points out, the problem needs to be solved soon.', keywords: ['as', 'points out'] }
  },
  {
    key: 'as-phrase',
    label: 'as 引出的固定短语（as well as / as a result / as for）',
    re: /\bas\s+(well\s+as|a\s+result|a\s+rule|a\s+whole|a\s+matter\s+of\s+fact|for|to|opposed\s+to|regards)\b/i,
    understanding: '这些 as 短语意思各不相同，不能一律译成“作为”：as well as = 以及、除……之外还；as a result = 因此；as a rule = 通常；as a whole = 总体上；as a matter of fact = 事实上；as for / as to = 至于；as opposed to = 与……相对。',
    translation: '按固定含义翻译，注意 as well as 连接的两部分在中文里顺序通常不变，as a result 后面才是结果。',
    examples: [
      { en: 'The course covers listening as well as speaking.', zh: '这门课既包括听力也包括口语。' },
      { en: 'As a result, the company lost two major clients.', zh: '结果，公司失去了两个大客户。' }
    ],
    en2zh: { prompt: 'As for the budget, we will discuss it next week.', reference: '至于预算，我们下周再讨论。', keywords: ['至于', '预算', '下周'] },
    zh2en: { prompt: '这项政策总体上改善了空气质量。', reference: 'As a whole, the policy has improved air quality.', keywords: ['as a whole', 'improved'] }
  },
  {
    key: 'as-time-cause',
    label: 'as 引导时间/原因状语从句（随着；由于）',
    re: /(^|[,;:]\s*)as\s+(?!well\b|such\b|long\b|soon\b|many\b|much\b|few\b|little\b|if\b|though\b|for\b|to\b|of\b|opposed\b|compared\b|regards\b|is\b|was\b|are\b|were\b|noted\b|shown\b|mentioned\b|described\b|explained\b|stated\b|reported\b|discussed\b|indicated\b|illustrated\b|suggested\b|argued\b|expected\b)[a-z]+/i,
    understanding: '位于句首或逗号后的 as 有两种常见用法：表示时间，“随着……、当……时”，强调两个动作同时发生；表示原因，“由于……”，语气比 because 弱。判断方法：从句和主句同时发生→时间；从句解释主句为什么发生→原因。',
    translation: '时间义译“随着、当……时”；原因义译“由于、因为”。如果译成“随着”读不通，就改译“由于”。',
    examples: [
      { en: 'As the population grows, demand for water keeps rising.', zh: '随着人口增长，对水的需求持续上升。' },
      { en: 'As the train was late, we missed the meeting.', zh: '由于火车晚点，我们错过了会议。' }
    ],
    en2zh: { prompt: 'As technology develops, the cost of storage falls.', reference: '随着技术发展，存储成本不断下降。', keywords: ['随着', '技术', '成本'] },
    zh2en: { prompt: '由于没有足够的证据，这项研究被取消了。', reference: 'As there was not enough evidence, the study was cancelled.', keywords: ['as', 'evidence'] }
  },
  {
    key: 'as-as-comparison',
    label: 'as … as 同级比较（形容词/副词原级）',
    re: /\bas\s+(?!soon\b|long\b|well\b|many\b|much\b|few\b|little\b)[a-z]+\s+as\b/i,
    understanding: 'as + 形容词/副词原级 + as 表示“和……一样……”，中间只能用原级，不能用比较级（不能说 as faster as）。否定形式是 not as … as，意思是“不如……”。',
    translation: '译成“和……一样……”。否定式译“不如……”，不要译成“不一样”。',
    examples: [
      { en: 'The second test was as difficult as the first one.', zh: '第二次考试和第一次一样难。' },
      { en: 'She finished the work as quickly as her colleague did.', zh: '她完成工作的速度和同事一样快。' }
    ],
    en2zh: { prompt: 'This method is not as reliable as the traditional one.', reference: '这种方法不如传统方法可靠。', keywords: ['不如', '传统', '可靠'] },
    zh2en: { prompt: '新的系统和其他系统一样安全。', reference: 'The new system is as secure as the others.', keywords: ['as secure as'] }
  },
  {
    key: 'prep-which',
    label: '介词 + which / whom 引导定语从句',
    re: /\b(in|on|at|for|with|by|of|to|from|about|under|through|among|during|after|before|over|into|upon|within|without|against|beyond|despite)\s+(which|whom)\b/i,
    understanding: '介词提到关系词前面，是因为从句里的动词或形容词需要这个介词：the method by which = by the method。还原时把介词放回从句末尾再理解。介词由从句的搭配决定，不能照中文习惯硬套；指人用 whom。',
    translation: '译成“……的……”，把从句提到名词前；介词含义（通过、凭借、关于、在……中）要按搭配译出来。',
    examples: [
      { en: 'The rate at which the ice melts depends on temperature.', zh: '冰融化的速度取决于温度。' },
      { en: 'These are the conditions under which the study was conducted.', zh: '这些就是开展这项研究的条件。' }
    ],
    en2zh: { prompt: 'The tool with which the data were collected is outdated.', reference: '用来收集数据的工具已经过时了。', keywords: ['工具', '收集', '过时'] },
    zh2en: { prompt: '他参考的那份报告来自一家小公司。', reference: 'The report on which he based his work came from a small company.', keywords: ['on which', 'report'] }
  },
  {
    key: 'subject-clause',
    label: '主语从句（That / Whether / What 置于句首）',
    re: /(^|[.;:]\s*)((that)\s+(the|a|an|it|he|she|they|we|you|people|this|these|those|there|his|her|their|our|my|your|its|everyone|nobody|most|many|few|some|all|[a-z]+s)\b|(?:what\s+(?!a\b|an\b)|whether\s+|whatever\s+|whoever\s+)[a-z]+\b)/i,
    understanding: '从句放在句首作主语，谓语一般用单数。that 只起连接作用、不译；whether = 是否；what = ……的东西/事情。因为主语长，后面常接 is / seems / matters / depends on。',
    translation: '译成“……这件事/这一做法”，再用“是/取决于/很重要”接下去；不要译成“那个”。',
    examples: [
      { en: 'That he survived the accident is a miracle.', zh: '他在这场事故中活下来是个奇迹。' },
      { en: 'Whether the plan works depends on teamwork.', zh: '这个计划是否奏效取决于团队合作。' }
    ],
    en2zh: { prompt: 'What the study found surprised many researchers.', reference: '这项研究的发现让许多研究者感到意外。', keywords: ['研究', '发现', '意外'] },
    zh2en: { prompt: '他是否接受这个提议还不确定。', reference: 'Whether he will accept the offer remains uncertain.', keywords: ['whether', 'uncertain'] }
  },
  {
    key: 'predicative-clause',
    label: '表语从句（The reason is that …）',
    re: /\b(is|was|are|were|seems|remains|becomes|remained|became)\s+(that|whether|what)\s+(the|a|an|it|he|she|they|we|you|this|these|those|[a-z]+)\b/i,
    understanding: '表语从句跟在 be / seem / remain 后面，说明主语“是什么”。that 不作成分、不译；whether 译“是否”；what 译“……的东西”。注意 The reason is that …，不能说 The reason is because …。',
    translation: '译成“是……/在于……”；that 不译，whether 译“是否”。',
    examples: [
      { en: 'The problem is that nobody owns the data.', zh: '问题在于没有人对这些数据负责。' },
      { en: 'What matters is whether the method can be repeated.', zh: '关键在于这个方法能否被重复。' }
    ],
    en2zh: { prompt: 'The real issue is that the sample was too small.', reference: '真正的问题在于样本太小。', keywords: ['问题', '样本', '太小'] },
    zh2en: { prompt: '关键是他是否愿意承担责任。', reference: 'The key point is whether he is willing to take responsibility.', keywords: ['whether', 'responsibility'] }
  },
  {
    key: 'concessive-clause',
    label: '让步状语从句（although / though / even if）',
    re: /\b(although|though|even\s+if|even\s+though|whereas)\b/i,
    understanding: 'although / though / even if / even though 引导让步，意思是“虽然、即使”，主句不能再加 but。even if 偏假设（即使），although 偏事实（虽然）。whereas 表示对比（而）。',
    translation: '译成“虽然……但……”“即使……也……”“而……”。让步从句在中文里通常放前面。',
    examples: [
      { en: 'Although the cost fell, demand did not rise.', zh: '虽然成本下降了，需求却没有上升。' },
      { en: 'Even if the data are correct, the conclusion may be wrong.', zh: '即使数据是对的，结论也可能是错的。' }
    ],
    en2zh: { prompt: 'Although the two groups look similar, their results differ sharply.', reference: '尽管两组看起来相似，结果却差别很大。', keywords: ['尽管', '相似', '差别'] },
    zh2en: { prompt: '即使失败，我们也应该继续尝试。', reference: 'Even if we fail, we should keep trying.', keywords: ['even if', 'keep trying'] }
  },
  {
    key: 'conditional-clause',
    label: '条件状语从句（unless / provided that / in case）',
    re: /\b(unless|provided\s+that|providing\s+that|in\s+case(?:\s+that)?|on\s+condition\s+that|supposing\s+that)\b/i,
    understanding: 'unless = if not（除非）；provided / providing that = 只要；in case = 以防万一；on condition that = 条件是。unless 从句本身已含否定，主句不要再加 not。',
    translation: 'unless 译“除非……否则……”，不能译成“如果不”；in case 译“以防”。',
    examples: [
      { en: 'Unless the trend reverses, demand will double.', zh: '除非趋势逆转，否则需求将翻倍。' },
      { en: 'Take an umbrella in case it rains.', zh: '带把伞，以防下雨。' }
    ],
    en2zh: { prompt: 'Unless the two sides agree, the project will be delayed.', reference: '除非双方达成一致，否则项目将被推迟。', keywords: ['除非', '一致', '推迟'] },
    zh2en: { prompt: '只要提前通知我们，就能安排。', reference: 'Provided that we are notified in advance, we can arrange it.', keywords: ['provided that', 'notified'] }
  },
  {
    key: 'purpose-clause',
    label: '目的状语（so that / in order that / in order to）',
    re: /\bso\s+that\s+(?:[a-z]+\s+){0,2}(can|could|may|might|will|would|be)\b|\bin\s+order\s+(that|to)\b/i,
    understanding: 'so that / in order that 引导目的状语从句，从句里常有 can / could / may / might / will / would；in order to 后面接动词原形。目的状语回答“为了什么”，结果状语回答“结果怎样”。',
    translation: '译成“为了……”“以便……”。中文里目的通常放在主句前面。',
    examples: [
      { en: 'The data were checked twice so that errors could be corrected.', zh: '数据被核对了两遍，以便改正错误。' },
      { en: 'In order to reduce noise, the airport moved its runway.', zh: '为了降低噪音，机场迁移了跑道。' }
    ],
    en2zh: { prompt: 'They simplified the form so that users could finish it quickly.', reference: '他们把表格简化了，以便用户能快速填完。', keywords: ['简化', '表格', '以便'] },
    zh2en: { prompt: '为了节省时间，我们只讨论最重要的问题。', reference: 'In order to save time, we will discuss only the most important issues.', keywords: ['in order to', 'save time'] }
  },
  {
    key: 'modal-perfect',
    label: '情态动词 + have done（对过去的推测/评价）',
    re: /\b(must|should|might|may|could|would|cannot|can't)\s+have\s+(\w+ed|done|been|had|made|seen|gone|come|taken|given|known|left|found|thought|said|told|written|built|lost|won|become|begun|risen|fallen)\b/i,
    understanding: '情态动词 + have done 表示对过去的推测或评价：must have done（一定做过）、might have done（可能做过）、should have done（本该做而没做）、could have done（本来能）。',
    translation: 'must have done 译“一定……了”；should have done 译“本应该……”；could have done 译“本来可以……”。',
    examples: [
      { en: 'The data must have been lost during the transfer.', zh: '数据一定是在传输过程中丢失了。' },
      { en: 'We should have checked the sample earlier.', zh: '我们本应该早点检查样本。' }
    ],
    en2zh: { prompt: 'They might have underestimated the cost of the project.', reference: '他们可能低估了项目的成本。', keywords: ['可能', '低估', '成本'] },
    zh2en: { prompt: '他本应该早点告诉我们这个风险。', reference: 'He should have told us about the risk earlier.', keywords: ['should have', 'risk'] }
  },
  {
    key: 'not-so-much-as',
    label: 'not so much A as B（与其说 A 不如说 B）',
    re: /\bnot\s+so\s+much\s+[^.;]{0,50}?\s+as\b/i,
    understanding: 'not so much A as B 意思是“与其说是 A，不如说是 B”，重点在 B。它不是否定的同级比较，不能按“不如……多”理解。',
    translation: '译成“与其说……不如说……”，把 as 后面的内容作为重点。',
    examples: [
      { en: 'The problem is not so much the cost as the delay.', zh: '问题与其说在成本，不如说在延误。' },
      { en: 'Success is not so much about talent as about persistence.', zh: '成功与其说靠天赋，不如说靠坚持。' }
    ],
    en2zh: { prompt: 'He was not so much angry as disappointed.', reference: '与其说他是生气，不如说是失望。', keywords: ['与其说', '不如说', '失望'] },
    zh2en: { prompt: '这与其说是技术问题，不如说是管理问题。', reference: 'It is not so much a technical problem as a management one.', keywords: ['not so much', 'management'] }
  },
  {
    key: 'too-enough',
    label: 'too … to / … enough to 结构',
    re: /\btoo\s+[a-z]+\s+to\b|\b[a-z]+\s+enough\s+to\b|\benough\s+[a-z]+\s+to\b/i,
    understanding: 'too + adj./adv. + to do 表示“太……以至于不能……”；adj./adv. + enough to do 表示“足够……可以做……”。这两类结构本身带否定或肯定含义，不要漏译。',
    translation: 'too … to 译“太……而不能……”；enough to 译“足够……可以……”。',
    examples: [
      { en: 'The evidence is too weak to support the claim.', zh: '证据太薄弱，无法支持这一说法。' },
      { en: 'The sample is large enough to be reliable.', zh: '样本足够大，结果可以是可靠的。' }
    ],
    en2zh: { prompt: 'He was too tired to finish the report.', reference: '他太累了，没能写完报告。', keywords: ['太累', '没能', '报告'] },
    zh2en: { prompt: '这个房间足够大，可以容纳五十人。', reference: 'The room is big enough to hold fifty people.', keywords: ['enough', 'hold'] }
  },
  {
    key: 'wh-ever',
    label: 'wh-ever 引导的让步/名词性从句',
    re: /\b(whatever|whoever|whichever|whenever|wherever)\b|\bhowever\s+(hard|much|long|far|well|carefully|quickly|small|large|important|difficult|easy)\b/i,
    understanding: 'whatever / whoever / whichever = 无论什么/谁/哪个，可引导让步状语从句，也可引导名词性从句；whenever / wherever = 无论何时/何地；however + 形容词/副词 = 无论多么。',
    translation: '译成“无论……”。however 修饰形容词时译“无论多么”，不要译成“然而”。',
    examples: [
      { en: 'Whatever the cause is, the effect is clear.', zh: '无论原因是什么，结果都很清楚。' },
      { en: 'However hard they tried, the team could not meet the deadline.', zh: '无论多努力，团队都没能赶上截止时间。' }
    ],
    en2zh: { prompt: 'Whoever wins the contract will need to hire more staff.', reference: '无论谁赢得这份合同，都需要雇更多的人。', keywords: ['无论谁', '合同', '雇'] },
    zh2en: { prompt: '无论发生什么，我们都按计划进行。', reference: 'Whatever happens, we will proceed as planned.', keywords: ['whatever', 'planned'] }
  },
  {
    key: 'emphatic-do',
    label: 'do / does / did + 动词原形（强调）',
    re: /\b(do|does|did)\s+(indeed\s+)?(matter|make|help|seem|need|want|work|play|come|go|show|suggest|prove|believe|think|hope|agree|support|require|depend|affect|change|increase|reduce|exist|occur|warn|tell|remind|notice|improve|grow|fall|rise|lead|cause|create|provide|offer|allow|enable|prevent|avoid|differ|vary|deserve)\b/i,
    understanding: '肯定句里 do / does / did + 动词原形表示强调，意思是“确实、的确”。它不是疑问或否定，翻译时要把语气译出来。',
    translation: '译成“确实……”“的确……”。不要译成“做”。',
    examples: [
      { en: 'The results do suggest a link between sleep and memory.', zh: '这些结果确实表明睡眠和记忆之间存在联系。' },
      { en: 'She did warn us about the risk.', zh: '她确实提醒过我们这个风险。' }
    ],
    en2zh: { prompt: 'These small habits do make a difference over time.', reference: '这些小的习惯确实会随时间产生差别。', keywords: ['确实', '习惯', '差别'] },
    zh2en: { prompt: '我确实相信这个方案可行。', reference: 'I do believe the plan will work.', keywords: ['do believe'] }
  },
  {
    key: 'full-inversion',
    label: '完全倒装（Here comes… / On the table lies…）',
    re: /(^|[.;]\s*)(here|there|now|then|such|away|down|up|out)\s+(comes?|goes?|lies?|stands?|remains?|follows?|hangs?|is|are|was|were)\b|(^|[.;]\s*)(on|in|at|under|among|between|behind|beyond|along|around)\s+the\s+[a-z]+\s+(lies?|stands?|sits?|rests?|hangs?|hides?|flows?|runs?|is|are|was|were)\b/i,
    understanding: '完全倒装是把整个谓语放到主语前面，常见于 here / there / now / then 开头，或地点状语置首（On the table lies …）。谓语是 be / come / go / lie / stand 这类不及物动词。',
    translation: '按正常语序理解：“……在……上”“……来了”。',
    examples: [
      { en: 'Here comes the hardest part of the process.', zh: '这个过程最难的部分来了。' },
      { en: 'On the wall hangs a map of the region.', zh: '墙上挂着一幅该地区的地图。' }
    ],
    en2zh: { prompt: 'Under the surface lie problems that few people notice.', reference: '表面之下藏着很少有人注意到的问题。', keywords: ['隐藏', '很少', '问题'] },
    zh2en: { prompt: '桌子上放着一份旧报告。', reference: 'On the table lies an old report.', keywords: ['on the table', 'lies'] }
  },
  {
    key: 'subject-verb-agreement',
    label: '主谓一致（the number of / each / neither…nor）',
    re: /\b(the\s+number\s+of|a\s+number\s+of|each\s+of|every\s+(one|student|member|child|person|participant)|neither\s+of|either\s+of|one\s+of\s+the)\s+(?:the\s+)?[a-z]+\s+(is|are|was|were|has|have|does|do)\b|\bneither\s+[a-z]+\s+nor\s+[a-z]+\s+(is|are|was|were|has|have)\b/i,
    understanding: '主谓一致看真正的主语：the number of … 谓语用单数，a number of … 谓语用复数；each / every / either / neither of 用单数；neither … nor 就近一致（看最近的主语）。',
    translation: '翻译不受影响，但分清 the number of（数量）和 a number of（许多）能避免理解偏差。',
    examples: [
      { en: 'The number of applicants has doubled.', zh: '申请人数翻了一番。' },
      { en: 'A number of studies have shown the same pattern.', zh: '许多研究都显示了同样的规律。' }
    ],
    en2zh: { prompt: 'Each of the participants was asked to keep a diary.', reference: '每位参与者都被要求写日记。', keywords: ['每位', '参与者', '日记'] },
    zh2en: { prompt: '学生的数量在过去五年里增加了一倍。', reference: 'The number of students has doubled in the past five years.', keywords: ['the number of', 'doubled'] }
  },
  {
    key: 'relative-clause',
    label: '限制性定语从句（that / which / who）',
    re: /\b(the|a|an|this|these|those|its|their|his|her|people|students|anyone|someone|something|everything|nothing)\s+[a-z]+\s+(that|which|who|whose|whom)\s+(?:[a-z]+\s+){0,3}([a-z]{2,}(?:ed|ing|s)|is|are|was|were|has|have|had|can|could|will|would|do|does|did|be|been|make|makes|made|come|comes|came|go|goes|went|take|takes|took|give|gives|gave|know|knows|knew|think|thinks|say|says|seem|seems|remain|remains|show|shows|require|requires|depend|depends|affect|affects|allow|allows|lead|leads|help|helps|keep|keeps|use|uses|include|includes|involve|involves|produce|produces|cause|causes|support|supports|provide|provides|offer|offers|exist|exists|last|lasts|matter|matters|belong|belongs|refer|refers|represent|represents|suggest|suggests|argue|argues|prove|proves|live|lives|work|works|want|wants|need|needs)\b/i,
    understanding: '限制性定语从句紧贴名词，删掉意思就不完整；that / which 指物，who / whom 指人，whose 指所属。从句谓语动词的单复数由先行词决定。',
    translation: '译成“……的（名词）”，从句放在名词前；从句太长时可拆成两句。',
    examples: [
      { en: 'The people who responded first were the most satisfied.', zh: '最先回应的人是最满意的。' },
      { en: 'A habit that lasts depends on a stable environment.', zh: '能持续的习惯依赖于稳定的环境。' }
    ],
    en2zh: { prompt: 'The tools that scientists use have changed dramatically.', reference: '科学家使用的工具已经发生了巨大变化。', keywords: ['工具', '科学家', '变化'] },
    zh2en: { prompt: '住在附近的居民抱怨噪音。', reference: 'The residents who live nearby complain about the noise.', keywords: ['who', 'residents'] }
  },
  {
    key: 'comparative-degree',
    label: '比较级修饰与最高级（much / far / the most…）',
    re: /\b(much|far|even|still|slightly|significantly|considerably|substantially|a\s+lot)\s+(more|less|better|worse|larger|higher|lower|faster|slower|greater|fewer|stronger|weaker|longer|shorter)\b|\bthe\s+(most|best|worst|largest|highest|lowest|greatest|fastest|strongest)\b/i,
    understanding: '比较级前可以用 much / far / even / still / slightly / significantly 修饰，表示程度差别，这些词不能换成 very。最高级前必须加 the，后面常跟 in / of 表示范围。',
    translation: 'much / far + 比较级译“得多”；slightly 译“稍微”；最高级译“最……”。',
    examples: [
      { en: 'The second method is far more reliable than the first.', zh: '第二种方法比第一种可靠得多。' },
      { en: 'This is the most convincing explanation so far.', zh: '这是目前最有说服力的解释。' }
    ],
    en2zh: { prompt: 'The new model is slightly cheaper but much slower.', reference: '新模型稍便宜一些，但慢得多。', keywords: ['稍', '便宜', '慢得多'] },
    zh2en: { prompt: '这是目前为止最有效的解决办法。', reference: 'This is the most effective solution so far.', keywords: ['the most', 'solution'] }
  },
  {
    key: 'gerund-subject',
    label: '动名词作主语 / 介词宾语（doing）',
    re: /(^|[.;]\s*)(reading|learning|working|teaching|studying|exercising|spending|eating|sleeping|travelling|traveling|using|making|doing|helping|taking|keeping|building|protecting|recycling|writing)\b[^.;,]{0,50}?\b(is|was|are|were|has|have|does|do|can|could|may|might|will|would|helps|requires|means|makes|leads|improves|changes|causes|creates|brings|reduces|increases|benefits|affects|shows|proves|depends)\b/i,
    understanding: '动名词（doing）作主语时，谓语用单数：Reading widely helps …。它也可以作介词宾语（by doing / without doing）。动名词表示习惯性或抽象的动作，不强调正在进行。',
    translation: '译成“……（这件事）”，不必译出“正在”。',
    examples: [
      { en: 'Reading widely helps students build vocabulary.', zh: '广泛阅读能帮助学生积累词汇。' },
      { en: 'Spending more time online does not improve memory.', zh: '上网时间更长并不会改善记忆。' }
    ],
    en2zh: { prompt: 'Working from home has changed how teams communicate.', reference: '居家办公改变了团队的沟通方式。', keywords: ['居家办公', '改变', '沟通'] },
    zh2en: { prompt: '每天练习听力能显著提高理解力。', reference: 'Practising listening every day can improve comprehension significantly.', keywords: ['practising', 'comprehension'] }
  },
  {
    key: 'participle-attribute',
    label: '分词作定语（后置 done / 前置 doing）',
    re: /\b(the|a|an|this|these|those|its|their|his|her)\s+[a-z]+\s+(written|made|used|found|taken|given|known|called|based|required|produced|designed|built|created|published|reported|collected|observed|measured|involved|related)\s+(by|in|on|at|for|from|to|with)\b|\b([a-z]{2,}s|data)\s+(written|made|found|taken|given|known|called|based|required|produced|designed|built|created|published|reported|collected|observed|measured|involved|related)\s+(by|in|on|at|for|from|with|to)\b/i,
    understanding: '过去分词放名词后作定语，等于一个被动定语从句：the data collected by students = the data that were collected by students。前置的分词（rising costs）则相当于主动的定语从句。',
    translation: '译成“……的”放在名词前：collected by students 译“由学生收集的”。',
    examples: [
      { en: 'The data collected by the team were incomplete.', zh: '团队收集的数据并不完整。' },
      { en: 'Costs related to energy have risen sharply.', zh: '与能源相关的成本大幅上升。' }
    ],
    en2zh: { prompt: 'The method used in this study is widely accepted.', reference: '这项研究使用的方法被广泛接受。', keywords: ['方法', '广泛', '接受'] },
    zh2en: { prompt: '由公司发布的报告显示需求在下降。', reference: 'The report published by the company shows that demand is falling.', keywords: ['published', 'demand'] }
  },
  {
    key: 'infinitive-purpose',
    label: '不定式作目的 / 结果 / 定语（to do）',
    re: /\b(to|in\s+order\s+to|so\s+as\s+to)\s+(protect|reduce|improve|increase|avoid|prevent|ensure|help|make|keep|build|create|support|address|solve|explain|understand|measure|test|examine|provide|achieve|maintain|save|cut)\b/i,
    understanding: '不定式常表示目的（为了……）、结果（以至于……）或作后置定语（the ability to adapt）。判断方法：这个动作是谁做的、表示目的还是修饰前面的名词。',
    translation: '作目的时译“为了……”，作定语时译“做……的”。',
    examples: [
      { en: 'The campaign aims to reduce plastic waste.', zh: '这项活动旨在减少塑料垃圾。' },
      { en: 'They arrived early to avoid the crowd.', zh: '他们早到是为了避开人群。' }
    ],
    en2zh: { prompt: 'The policy was designed to protect small businesses.', reference: '这项政策旨在保护小企业。', keywords: ['政策', '保护', '小企业'] },
    zh2en: { prompt: '为了减少浪费，公司改变了包装方式。', reference: 'To reduce waste, the company changed its packaging.', keywords: ['to reduce', 'packaging'] }
  },
  {
    key: 'nested-clauses',
    label: '多层从句嵌套',
    re: null,
    understanding: '一个句子里出现两个以上从句引导词（that/which/who/when/because/although 等），说明从句里还套着从句。做法是：先划出最外层主句的主谓，再把每个引导词带回它修饰的成分，一层一层剥。',
    translation: '按“由外到内”的顺序译：先译主句骨架，再把每层从句按中文习惯前置或后置，不要按英文原序逐词对应。',
    examples: [
      { en: 'The study suggests that people who read regularly are better at tasks that require sustained attention.', zh: '该研究表明，经常阅读的人在需要持续注意力的任务上表现更好。' },
      { en: 'What surprised researchers was that the effect remained even when the original conditions changed.', zh: '令研究者意外的是，即使原始条件改变，这种效应依然存在。' }
    ],
    en2zh: { prompt: 'The report argues that students who plan their reading finish more books than those who do not.', reference: '报告指出，会规划阅读的学生比不会规划的学生读完更多书。', keywords: ['规划', '学生', '更多'] },
    zh2en: { prompt: '研究表明，那些坚持练习的人最终会取得更大的进步。', reference: 'Research shows that those who keep practising will make greater progress.', keywords: ['that', 'who', 'progress'] }
  },

  // ── 补缺批：时态体系 / 一般被动 / 地点状语从句 / 关联连词 / 情态基础 / 插入语 ──
  // 放在数组末尾：同一句话里只要更具体的旧规则能命中，就先让旧规则讲，新规则只兜住“没有其他结构可讲”的句子
  {
    key: 'perfect-tense',
    label: '完成时与完成进行时（have done / have been doing）',
    re: /\b(have|has|had)\s+(?:not\s+|never\s+|already\s+|just\s+|also\s+|only\s+|long\s+)?(?:been|become|begun|broken|brought|built|bought|caught|chosen|come|done|drawn|driven|eaten|fallen|felt|found|forgotten|given|gone|grown|heard|held|hidden|hurt|kept|known|laid|led|lain|left|lost|made|meant|met|paid|put|read|risen|run|said|seen|sent|set|shown|sold|spent|stood|stolen|struck|taken|taught|thought|told|understood|won|worn|written|(?!(?:indeed|need|speed)\b)\w{3,}ed)\b/i,
    understanding: 'have / has + 过去分词是现在完成时，强调“到现在为止已经完成，或一直在持续”；had + 过去分词是过去完成时，表示“在过去的某个时间点之前就已经完成”，常和 by then / before / by the time 呼应。have / has / had been doing 是完成进行时，强调动作持续到某个时间点且可能继续。判断顺序：先看助动词是 have 还是 had，再找动作发生在哪个时间点之前。',
    translation: '译成“已经……”“已经……了”；过去完成时常译“在……之前就已经……”。完成时不要译成“有”，也不要和一般过去时混成一句。',
    examples: [
      { en: 'The city has invested heavily in public transport over the past decade.', zh: '过去十年间，这座城市在公共交通上投入了大量资金。' },
      { en: 'By the time the study was published, the trend had already reversed.', zh: '到这项研究发表时，趋势已经逆转了。' }
    ],
    en2zh: { prompt: 'Researchers have found that sleep plays a key role in memory.', reference: '研究者已经发现，睡眠在记忆中起着关键作用。', keywords: ['已经', '睡眠', '记忆'] },
    zh2en: { prompt: '到去年年底，这家公司已经完成了三份报告。', reference: 'By the end of last year, the company had completed three reports.', keywords: ['had completed', 'by the end'] }
  },
  {
    key: 'progressive-tense',
    label: '进行时（is / are / was / were + doing）',
    re: /\b(is|are|was|were)\s+(?:still\s+|currently\s+|already\s+|also\s+|now\s+|gradually\s+|slowly\s+|rapidly\s+)?(?!(?:something|nothing|everything|anything|willing|missing|convincing|interesting|exciting|surprising|encouraging|disappointing|alarming|demanding|rewarding|challenging|confusing|satisfying|promising|striking|lasting|existing|remaining|underlying|overwhelming|upcoming|ongoing)\b)[a-z]{4,}ing\b/i,
    understanding: 'be + 动词-ing 是进行时，表示“正在发生”或“现阶段一直在持续”。was / were + doing 是过去进行时，常用来铺垫背景：“当时正在……，这时另一件事发生了”。判断时先看 be 的时态，再看这个动作是暂时的还是正在变化中的。',
    translation: '译成“正在……”“不断……”。过去进行常译“当时正在……”。中文里的“正在”可以省略，但“不断、持续、越来越”这层意思要译出来。',
    examples: [
      { en: 'More companies are investing in renewable energy.', zh: '越来越多的公司正在投资可再生能源。' },
      { en: 'She was preparing her notes when the power went out.', zh: '停电时她正在准备笔记。' }
    ],
    en2zh: { prompt: 'The climate is changing faster than scientists expected.', reference: '气候变化的速度比科学家预期的要快。', keywords: ['气候', '变化', '速度'] },
    zh2en: { prompt: '孩子们正在操场上练习跑步。', reference: 'The children are practising running on the playground.', keywords: ['are practising', 'playground'] }
  },
  {
    key: 'future-tense',
    label: '将来时与将来进行/完成（will do / will be doing / will have done）',
    re: /\b(will|shall)\s+(?:also\s+|soon\s+|probably\s+|likely\s+|never\s+|not\s+|only\s+|still\s+|even\s+|just\s+)?(?:be\b|[a-z]{3,}\b)|\b(is|are|am|was|were)\s+(?:not\s+)?going\s+to\s+[a-z]+\b|\b(is|are|am|was|were)\s+about\s+to\s+[a-z]+\b/i,
    understanding: 'will + 动词原形表示将来或意愿；be going to 表示计划，或“已有迹象、即将发生”的预测；will be doing 表示将来某时正在进行；will have done 表示到将来某时已经完成。will / shall 后面永远接动词原形，写成 will + -s / -ed 一定错。',
    translation: '译成“将……”“会……”。be going to 可译“打算、就要”；be about to 译“即将……”。',
    examples: [
      { en: 'The new policy will take effect next month.', zh: '新政策将于下月生效。' },
      { en: 'Prices are going to rise if demand keeps growing.', zh: '如果需求持续增长，价格将会上涨。' }
    ],
    en2zh: { prompt: 'Automation will replace some jobs but also create new ones.', reference: '自动化将取代一些工作，但也会创造新的工作。', keywords: ['取代', '创造', '工作'] },
    zh2en: { prompt: '我们打算下个月开始这项研究。', reference: 'We are going to start the research next month.', keywords: ['are going to', 'research'] }
  },
  {
    key: 'passive-basic',
    label: '一般被动语态（be + 过去分词）',
    re: /\b(is|are|was|were|be|been|being)\s+(?:not\s+|also\s+|still\s+|widely\s+|often\s+|already\s+|gradually\s+|partly\s+|largely\s+|commonly\s+|usually\s+|rarely\s+|constantly\s+)?(?!(?:used\s+to\b|indeed|children|women|men|kitchen|garden|seven|eleven|sudden|wooden|golden|open|foreign|modern|northern|southern|eastern|western|citizen|dozen|even|keen|green)\b)[a-z]+(?:ed|en)\b/i,
    understanding: 'be + 过去分词是最常见的被动语态：主语是动作的承受者，不是执行者。判断方法：问一句“这个动作是谁做的”——如果动作不是主语做的，就是被动。be interested / be based on 这类是形式相同的系表结构，重点在描述状态。',
    translation: '中文可以译“被……”，但更多时候转成主动句或无主句更自然：“被广泛使用”写作“广泛使用”。',
    examples: [
      { en: 'The samples were collected from three different cities.', zh: '这些样本采集自三个不同的城市。' },
      { en: 'English is used as a working language in many companies.', zh: '英语在许多公司里被用作工作语言。' }
    ],
    en2zh: { prompt: 'The plan was approved after a long discussion.', reference: '经过长时间讨论，这个计划获得了批准。', keywords: ['讨论', '计划', '批准'] },
    zh2en: { prompt: '这些数据由两名研究员独立核对。', reference: 'The data were checked independently by two researchers.', keywords: ['were checked', 'independently'] }
  },
  {
    key: 'where-clause',
    label: 'where 引导的从句（地点状语 / 定语从句）',
    re: /\bwhere\s+(?:the|a|an|it|they|we|you|he|she|people|students|there|most|many|some|few|one|two)\b|\b(?:places?|areas?|regions?|cities|countries|sites?|cases?|situations?|stage|scenes?|market|world|environment|fields?|spots?|points?)\s+where\b/i,
    understanding: 'where 有两种用法：紧跟在一个表示地点、阶段或场景的名词后面（the city where he grew up）是定语从句，修饰那个名词；单独出现、带出完整主谓（Where there is demand, supply follows）是地点状语从句。只有直接提问时才是“在哪里”。',
    translation: '定语从句译“……的（地方/阶段）”；状语从句译“在……的地方”。不要一律译成“在哪里”。',
    examples: [
      { en: 'The report focuses on regions where incomes are falling.', zh: '报告聚焦于收入正在下降的地区。' },
      { en: 'Where there is competition, prices tend to fall.', zh: '在有竞争的地方，价格往往趋于下降。' }
    ],
    en2zh: { prompt: 'This is the stage where the plan is likely to fail.', reference: '这正是计划可能失败的阶段。', keywords: ['阶段', '计划', '失败'] },
    zh2en: { prompt: '他们搬到了一个气候更温暖的地方。', reference: 'They moved to a place where the climate is warmer.', keywords: ['where', 'climate'] }
  },
  {
    key: 'correlative',
    label: '关联连词 both … and / either … or / neither … nor',
    re: /\bboth\s+[^.;]{2,60}?\s+and\s+[a-z]|\b(?:either|neither)\s+[^.;,]{2,50}?\s+(?:or|nor)\s+[a-z]/i,
    understanding: '这三对关联连词连接的两个部分必须形式对称：both A and B 两项都成立；either A or B 二选一；neither A nor B 两者都不。neither … nor 本身已经是否定，谓语要用肯定形式（Neither answer is right），不要再加 not。',
    translation: 'both … and 译“既……又……”“……和……都”；either … or 译“要么……要么……”；neither … nor 译“既不……也不……”。',
    examples: [
      { en: 'Both the design and the material were changed.', zh: '设计和材料都改了。' },
      { en: 'Neither the data nor the method was reliable.', zh: '数据和方法的可靠性都不够。' }
    ],
    en2zh: { prompt: 'Either the deadline must be extended or the scope must be cut.', reference: '要么延长截止时间，要么缩减范围。', keywords: ['要么', '延长', '缩减'] },
    zh2en: { prompt: '这个方法既省时又省钱。', reference: 'The method saves both time and money.', keywords: ['both', 'and'] }
  },
  {
    key: 'modal-basic',
    label: '情态动词（can / must / should / may 的能力、义务与推测）',
    re: /\b(can|cannot|can't|could|must|should|shouldn't|may|might|ought\s+to|needn't|have\s+to|has\s+to|had\s+to)\s+(?:not\s+|also\s+|still\s+|only\s+|even\s+|always\s+|never\s+)?(?!i\b|you\b|he\b|she\b|it\b|we\b|they\b|there\b|the\b|a\b|an\b|this\b|that\b|these\b|those\b)[a-z]{2,}\b/i,
    understanding: '情态动词后面必须接动词原形，它表达的不是时间而是“语气”：can / could 表能力或可能，must 表必须或很强的推断，should 表应该，may / might 表不确定的推测。have to 接近 must，但强调客观要求。',
    translation: 'can 译“能、可以”；must 译“必须、一定”；should 译“应该”；may 译“可能、可以”。情态动词没有“要、将”这类将来含义，别混。',
    examples: [
      { en: 'The system must handle thousands of requests per second.', zh: '这个系统必须能每秒处理上千个请求。' },
      { en: 'Such changes may take years to show results.', zh: '这样的变化可能需要数年才能显现效果。' }
    ],
    en2zh: { prompt: 'Students should take responsibility for their own learning.', reference: '学生应该为自己的学习负责。', keywords: ['应该', '学习', '负责'] },
    zh2en: { prompt: '这条规定可能不适用于小公司。', reference: 'The rule may not apply to small companies.', keywords: ['may', 'apply'] }
  },
  {
    key: 'parenthetical',
    label: '插入语（however / therefore / for example 等独立成分）',
    re: /,\s*(?:however|therefore|thus|moreover|furthermore|nevertheless|nonetheless|consequently|in\s+fact|for\s+example|for\s+instance|in\s+other\s+words|that\s+is|in\s+short|indeed|of\s+course|after\s+all|by\s+contrast|in\s+contrast|on\s+the\s+contrary|as\s+a\s+result|in\s+addition|in\s+general|generally\s+speaking|strictly\s+speaking|to\s+be\s+honest|in\s+my\s+view|in\s+brief|that\s+said|in\s+turn|at\s+the\s+same\s+time|as\s+a\s+whole|in\s+essence|in\s+effect)\s*,/i,
    understanding: '被两个逗号夹住的词或短语是插入语，它不充当句子成分，删掉后句子仍然完整。它的作用是标示前后逻辑：however 表转折，therefore 表结果，for example 表举例。读懂它等于读懂了作者的“路标”。',
    translation: '按中文习惯把插入语放到句首或下一句句首：“然而、因此、例如、事实上”。不要把 however 译成“无论如何”，也不要把 therefore 硬塞进句中。',
    examples: [
      { en: 'The cost, however, has continued to rise.', zh: '然而，成本仍在持续上升。' },
      { en: 'Some habits, for example, are easier to change than others.', zh: '例如，有些习惯比另一些更容易改变。' }
    ],
    en2zh: { prompt: 'The results, therefore, should be interpreted with caution.', reference: '因此，这些结果应该谨慎解读。', keywords: ['因此', '结果', '谨慎'] },
    zh2en: { prompt: '然而，这个结论并不适用于所有情况。', reference: 'The conclusion, however, does not apply to every case.', keywords: ['however', 'apply'] }
  },
  {
    key: 'partial-negation',
    label: '部分否定与否定转移（all … not / not … because）',
    re: /\bnot\b[^.!?]{0,30}\b(all|both|every|everyone|everything|always|necessarily)\b|\b(all|both|every|everyone|everything|always|necessarily)\b[^.!?]{0,60}\b(not|never)\b|\bnot\b[^.!?]{0,45}\bbecause\b|\b(cannot|can't)\s+be\s+too\b/i,
    understanding: 'all / both / every / always 与 not 连用通常是“部分否定”，意思是“并非全部都……”，不是“全都不……”。not … because 还常发生否定转移：形式上否定主句，意思上否定 because 从句。cannot … too 则是“再……也不为过”，not necessarily 是“不一定”。',
    translation: 'all … not 译“并非所有……都”；not … because 要根据逻辑译成“不是因为……”或“并不是因为……才……”；cannot be too 译“再……也不过分”；not necessarily 译“不一定”。',
    examples: [
      { en: 'Not all students who work hard get high marks.', zh: '并不是所有努力学习的学生都能取得高分。' },
      { en: 'I did not go because I was tired.', zh: '我不是因为累了才去的。' }
    ],
    en2zh: { prompt: 'All that glitters is not gold.', reference: '闪光的并不都是金子。', keywords: ['并不', '都', '金子'] },
    zh2en: { prompt: '并非所有人都同意这个观点。', reference: 'Not everyone agrees with this view.', keywords: ['not everyone', 'agrees'] }
  },
  {
    key: 'double-negative',
    label: '双重否定（not uncommon / never … without）',
    re: /\bnot\s+(uncommon|unusual|unlikely|unreasonable|unaware|unfamiliar|impossible|without)\b|\bnever\b[^.!?]{0,40}\bwithout\b|\bno\s+\w+\s+without\b|\bnothing\b[^.!?]{0,30}\bwithout\b/i,
    understanding: '两个否定形式表达一个肯定意思，语气通常比直接肯定更强。not uncommon = 很常见；never … without = 每次……都……；no … without = 没有……就没有……。',
    translation: '译成肯定句更自然：“很常见／每次……都／没有……就没有……”。不要机械地保留两个“不”。',
    examples: [
      { en: 'It is not uncommon for students to feel anxious before exams.', zh: '学生在考试前感到焦虑是很常见的。' },
      { en: 'You cannot succeed without effort.', zh: '不努力就不会成功。' }
    ],
    en2zh: { prompt: 'Not everyone is unaware of the risks involved.', reference: '并非所有人都没有意识到其中的风险。', keywords: ['并非', '所有人', '风险'] },
    zh2en: { prompt: '没有努力就不会有收获。', reference: 'There can be no gain without effort.', keywords: ['no', 'without', 'effort'] }
  },
  {
    key: 'it-takes',
    label: 'It takes sb + 时间 + to do',
    re: /\bit\s+(takes|took|will\s+take|has\s+taken|can\s+take)\b[^.!?]{0,45}\bto\s+[a-z]/i,
    understanding: 'it 是形式主语，真正的主语是后面的不定式。takes 后面可以接人（sb）再接时间，也可以直接接时间。翻译时把“做某事”提到前面。',
    translation: '译“做某事需要（某人）多少时间”。不要译成“它拿走了……”。',
    examples: [
      { en: 'It takes time to build trust.', zh: '建立信任需要时间。' },
      { en: 'It took her three years to finish the research.', zh: '她花了三年时间完成这项研究。' }
    ],
    en2zh: { prompt: 'It takes patience and practice to master a language.', reference: '掌握一门语言需要耐心和练习。', keywords: ['需要', '耐心', '练习'] },
    zh2en: { prompt: '养成一个新习惯通常需要几周时间。', reference: 'It usually takes several weeks to form a new habit.', keywords: ['takes', 'weeks', 'habit'] }
  },
  {
    key: 'it-no-use',
    label: 'It is no use / There is no point in doing',
    re: /\bit\s+(is|was)\s+no\s+(use|good|point)\b|\bthere\s+is\s+no\s+(point|use|sense)\s+in\b/i,
    understanding: '这两个句型都表示“做某事没有用/没有意义”。it 是形式主语，真正的主语是动名词；there is no point in 后面也接动名词。',
    translation: '译“做……没有用／没有意义”。注意 in 后面用 doing，不用 to do。',
    examples: [
      { en: 'It is no use arguing with him.', zh: '和他争论没有用。' },
      { en: 'There is no point in blaming others.', zh: '责怪别人没有意义。' }
    ],
    en2zh: { prompt: 'It is no good pretending that the problem does not exist.', reference: '假装问题不存在是没有用的。', keywords: ['假装', '问题', '没有用'] },
    zh2en: { prompt: '再争论下去也没有意义。', reference: 'There is no point in arguing further.', keywords: ['no point', 'arguing'] }
  },
  {
    key: 'have-difficulty',
    label: 'have difficulty / trouble (in) doing',
    re: /\b(have|has|had|having)\s+(difficulty|difficulties|trouble|problems?|a\s+hard\s+time)\b[^.!?]{0,35}\b(in\s+)?[a-z]+ing\b/i,
    understanding: '表示“做某事有困难”。in 常省略，后面必须用动名词。difficulty 可数时用 difficulties，trouble 通常不可数。',
    translation: '译“做……有困难／费劲”。不要按字面译成“有困难在里面做”。',
    examples: [
      { en: 'Many students have difficulty concentrating for long periods.', zh: '许多学生难以长时间集中注意力。' },
      { en: 'She had trouble adapting to the new environment.', zh: '她很难适应新环境。' }
    ],
    en2zh: { prompt: 'He has difficulty understanding the main idea of the article.', reference: '他很难理解这篇文章的主旨。', keywords: ['很难', '理解', '主旨'] },
    zh2en: { prompt: '老年人常常难以适应快速变化的技术。', reference: 'Older people often have difficulty adapting to rapidly changing technology.', keywords: ['difficulty', 'adapting', 'technology'] }
  },
  {
    key: 'spend-time',
    label: 'spend / waste time (in) doing',
    re: /\b(spend|spends|spent|spending|waste|wastes|wasted|wasting)\b[^.!?]{0,45}\b(on\s+)?[a-z]+ing\b/i,
    understanding: 'spend/waste time 后面接动名词，表示“花/浪费时间做某事”；如果接名词，常用 on + 名词。不要把 doing 改成 to do。',
    translation: '译“花/浪费时间做……”。中文习惯把“做某事”放在“花时间”后面。',
    examples: [
      { en: 'She spends hours scrolling through social media.', zh: '她花好几个小时刷社交媒体。' },
      { en: 'They wasted a lot of time arguing about details.', zh: '他们浪费了很多时间争论细节。' }
    ],
    en2zh: { prompt: 'I spend an hour reading English news every day.', reference: '我每天花一小时阅读英文新闻。', keywords: ['花', '阅读', '每天'] },
    zh2en: { prompt: '不要把时间浪费在抱怨上。', reference: 'Do not waste time complaining.', keywords: ['waste', 'complaining'] }
  },
  {
    key: 'prefer-to',
    label: 'prefer A to B / would rather … than',
    re: /\bprefer\b[^.!?]{0,55}\b(to|rather\s+than)\b|\bwould\s+rather\b[^.!?]{0,45}\bthan\b/i,
    understanding: 'prefer A to B 中 to 是介词，A、B 要用对等成分（名词或动名词）；prefer to do rather than do 中 rather than 后接动词原形。would rather … than 也是“宁愿……而不愿……”。',
    translation: '译“比起 B 更喜欢 A／宁愿……也不愿……”。注意 to 不是不定式符号。',
    examples: [
      { en: 'I prefer reading to watching TV.', zh: '比起看电视，我更喜欢读书。' },
      { en: 'She would rather walk than wait for the bus.', zh: '她宁愿走路也不愿等公交。' }
    ],
    en2zh: { prompt: 'Many people prefer working from home to commuting every day.', reference: '比起每天通勤，许多人更喜欢居家办公。', keywords: ['比起', '更喜欢', '居家'] },
    zh2en: { prompt: '我宁愿现在多花点时间准备，也不愿临时抱佛脚。', reference: 'I would rather spend more time preparing now than cram at the last minute.', keywords: ['would rather', 'than', 'preparing'] }
  },
  {
    key: 'be-about-to',
    label: 'be about to do / be on the point of doing',
    re: /\b(be|is|are|was|were|am)\s+(about\s+to|on\s+the\s+point\s+of)\b/i,
    understanding: '表示“即将、正要”，强调时间上非常接近。be about to 后面接动词原形；be on the point of 后面接动名词。一般不与明确的时间状语（如 at 5 o’clock）连用。',
    translation: '译“正要／即将”。语气比 be going to 更近、更急。',
    examples: [
      { en: 'The train is about to leave.', zh: '火车马上就要开了。' },
      { en: 'The company is on the point of launching a new product.', zh: '这家公司即将推出一款新产品。' }
    ],
    en2zh: { prompt: 'The meeting is about to begin.', reference: '会议马上就要开始了。', keywords: ['马上', '开始'] },
    zh2en: { prompt: '我们正要离开，电话响了。', reference: 'We were about to leave when the phone rang.', keywords: ['about to', 'rang'] }
  },
  {
    key: 'while-contrast',
    label: 'while / whereas 对比从句',
    re: /\bwhereas\b|\bwhile\b[^.!?]{0,70},\s*(they|it|he|she|we|others|critics|supporters|opponents|many|some|most|few|the\s+\w+)\b/i,
    understanding: 'while 既可以表示“当……时”，也可以表示对比“而、然而”；whereas 只表示对比。判断依据：前后两个分句是不是同时发生。如果是两种情况的对照，就是对比用法。',
    translation: '对比时译“而、然而、相比之下”，不要译成“当……时候”。',
    examples: [
      { en: 'Some students learn best by listening, while others need to read.', zh: '有些学生靠听学得最好，而另一些学生则需要阅读。' },
      { en: 'The first method is cheap, whereas the second is more accurate.', zh: '第一种方法便宜，而第二种更精确。' }
    ],
    en2zh: { prompt: 'Critics argue that the policy is too costly, while supporters say it is necessary.', reference: '批评者认为这项政策代价太高，而支持者说它是必要的。', keywords: ['而', '支持者', '必要'] },
    zh2en: { prompt: '城市生活节奏快，而乡村生活更安静。', reference: 'City life is fast-paced, whereas country life is quieter.', keywords: ['whereas', 'quieter'] }
  },
  {
    key: 'now-that',
    label: 'now that / given that / seeing that 原因从句',
    re: /\b(now\s+that|given\s+that|seeing\s+that|considering\s+that|in\s+that)\b/i,
    understanding: '这些连词都引导原因或前提：now that 强调“既然现在……”，given that 强调“考虑到……”，seeing that 偏口语“既然”，in that 表示“在于、因为”。',
    translation: '译“既然／考虑到／因为”。now that 常带有“情况已经变化”的意味。',
    examples: [
      { en: 'Now that the data is available, we can test the hypothesis.', zh: '既然数据已经到手，我们就可以检验这个假设了。' },
      { en: 'Given that the evidence is limited, we should be cautious.', zh: '鉴于证据有限，我们应该谨慎。' }
    ],
    en2zh: { prompt: 'Seeing that everyone is tired, we should stop here.', reference: '既然大家都累了，我们就到这里吧。', keywords: ['既然', '累', '这里'] },
    zh2en: { prompt: '既然你已经决定了，就全力以赴吧。', reference: 'Now that you have made a decision, give it your all.', keywords: ['now that', 'decision'] }
  },
  {
    key: 'condition-clause',
    label: 'on condition that / provided that / as long as',
    re: /\b(on\s+condition\s+that|provided\s+that|providing\s+that|as\s+long\s+as|so\s+long\s+as|assuming\s+that|supposing\s+that|what\s+if)\b/i,
    understanding: '这些结构引导条件：on condition that“条件是”，provided/providing that“只要”，as long as“只要”，assuming/supposing that“假设”，what if“万一……怎么办”。provided that 中的 that 有时省略。',
    translation: '译“只要／条件是／假设／万一”。不要把 provided 译成“提供”。',
    examples: [
      { en: 'You can borrow the car on condition that you drive carefully.', zh: '你可以借这辆车，条件是小心驾驶。' },
      { en: 'Provided that the funding is approved, the project will start next month.', zh: '只要资金获批，项目将于下月启动。' }
    ],
    en2zh: { prompt: 'What if the plan fails?', reference: '万一计划失败，我们该怎么办？', keywords: ['万一', '计划', '失败'] },
    zh2en: { prompt: '只要天气允许，比赛将按时举行。', reference: 'As long as the weather permits, the match will take place on time.', keywords: ['as long as', 'permits'] }
  },
  {
    key: 'purpose-lest',
    label: 'lest / for fear that 虚拟目的从句',
    re: /\b(lest|for\s+fear\s+that)\b/i,
    understanding: 'lest 和 for fear that 表示“唯恐、以免”，引导目的状语从句。lest 后面的从句常用 should + 动词原形（should 可省略），for fear that 后面多用 may / might / would。',
    translation: '译“以免／唯恐／生怕”。for fear that 不要译成“害怕那个”。',
    examples: [
      { en: 'Speak quietly lest you wake the baby.', zh: '小声点，以免吵醒孩子。' },
      { en: 'She closed the door quietly for fear that someone might hear her.', zh: '她轻轻关上门，唯恐有人听见。' }
    ],
    en2zh: { prompt: 'They checked the data carefully for fear that a small error might ruin the results.', reference: '他们仔细核对数据，唯恐一个小错误毁掉结果。', keywords: ['唯恐', '错误', '结果'] },
    zh2en: { prompt: '他反复检查数据，唯恐出错。', reference: 'He checked the data again and again for fear that he might make a mistake.', keywords: ['for fear that', 'mistake'] }
  },
  {
    key: 'reason-that',
    label: 'The reason why … is that …',
    re: /\bthe\s+reason\s+(why|that)\b[^.!?]{0,85}\b(is|was)\s+(that|because)\b/i,
    understanding: 'reason 后面的定语从句可以用 why 或 that 引导；表语从句规范写法是 that，不用 because（虽然口语里 because 很常见）。主语是 the reason 时，后面不要再加“because of”。',
    translation: '译“……的原因是……”。中文也常拆成“之所以……，是因为……”。',
    examples: [
      { en: 'The reason why he resigned was that he disagreed with the decision.', zh: '他辞职的原因是他不同意这项决定。' },
      { en: 'The reason that the experiment failed was that the sample was too small.', zh: '实验失败的原因是样本太小。' }
    ],
    en2zh: { prompt: 'The reason why the plan was rejected is that it was too expensive.', reference: '该计划被拒绝的原因是它太昂贵了。', keywords: ['原因', '拒绝', '昂贵'] },
    zh2en: { prompt: '人们不愿改变的原因是他们害怕失去现有的一切。', reference: 'The reason why people resist change is that they fear losing what they have.', keywords: ['reason why', 'fear', 'losing'] }
  },
  {
    key: 'it-is-said',
    label: 'It is said / believed / estimated that …',
    re: /\bit\s+(is|was|has\s+been)\s+(said|reported|believed|thought|estimated|claimed|argued|suggested|expected)\s+that\b/i,
    understanding: 'it 是形式主语，that 从句是真正的主语。这类结构表示“据说/据报道/人们认为/据估计”，用来把消息来源模糊化，是新闻报道和学术写作的常见句式。',
    translation: '译“据说／据报道／人们认为／据估计”。也可以转换成“主语 + is said to do”。',
    examples: [
      { en: 'It is estimated that millions of people lack access to clean water.', zh: '据估计，数百万人无法获得清洁饮用水。' },
      { en: 'It is widely believed that reading aloud helps children develop language skills.', zh: '人们普遍认为，大声朗读有助于儿童发展语言能力。' }
    ],
    en2zh: { prompt: 'It is said that the research has lasted for ten years.', reference: '据说这项研究已经持续了十年。', keywords: ['据说', '研究', '十年'] },
    zh2en: { prompt: '据报道，这家公司正在裁员。', reference: 'It is reported that the company is cutting jobs.', keywords: ['reported', 'company', 'cutting'] }
  },
  {
    key: 'not-until',
    label: 'not … until 直到……才',
    re: /\b(not|never)\b[^.!?]{0,65}\buntil\b/i,
    understanding: 'not … until 表示“直到……才……”。主句用否定，时间由 until 从句给出。把它放到句首时要用倒装（Not until … did …）。中文习惯把“直到”放前面。',
    translation: '译“直到……才……”。不要译成“不……直到……”。',
    examples: [
      { en: 'He did not realize the importance of health until he fell ill.', zh: '直到生病，他才意识到健康的重要性。' },
      { en: 'We did not fully understand the problem until we saw the data.', zh: '直到看到数据，我们才完全理解这个问题。' }
    ],
    en2zh: { prompt: 'She did not stop working until midnight.', reference: '她直到午夜才停止工作。', keywords: ['直到', '午夜', '停止'] },
    zh2en: { prompt: '直到失去自由，他才懂得自由的珍贵。', reference: 'He did not understand the value of freedom until he lost it.', keywords: ['not', 'until', 'freedom'] }
  },
  {
    key: 'relative-whose',
    label: 'whose / of which 所属定语从句',
    re: /\b(whose|of\s+which|of\s+whom)\b/i,
    understanding: 'whose 表示“谁的/其”，既可以指人也可以指物；of which / of whom 是更正式的“其中……的”结构，常放在名词后。理解时先找到先行词，再看 whose 后面的名词属于谁。',
    translation: '译“……的……”或拆成“它的/他们的……”。不要译成“谁的”疑问语气。',
    examples: [
      { en: 'The company whose products we use has changed its policy.', zh: '我们使用其产品的那家公司改变了政策。' },
      { en: 'The study, whose findings were published last week, involved 2,000 participants.', zh: '这项研究的发现上周发表，共有两千名参与者。' }
    ],
    en2zh: { prompt: 'I know a father whose children are studying abroad.', reference: '我认识一位父亲，他的孩子都在国外学习。', keywords: ['父亲', '孩子', '国外'] },
    zh2en: { prompt: '这座城市的名字来源于一条河，河上有一座古桥。', reference: 'The city takes its name from a river, on which there is an ancient bridge.', keywords: ['which', 'ancient', 'bridge'] }
  },
  {
    key: 'relative-adverb',
    label: 'where / when / why 关系副词定语从句',
    re: /\bthe\s+(day|time|moment|year|period|place|city|country|point|stage|situation|case|reason|extent)\s+(when|where|why|that|to\s+which)\b/i,
    understanding: '关系副词 where 指地点，when 指时间，why 指原因，在从句中作状语，而不是主语或宾语。判断方法：把先行词放回从句，看它前面缺不缺介词（in/at/on/for）。',
    translation: '译“在……的地方／……的时候／……的原因”。有时中文不必译出关系词。',
    examples: [
      { en: 'This is the stage where small errors become serious problems.', zh: '在这个阶段，小错误会变成严重问题。' },
      { en: 'I will never forget the day when we first met.', zh: '我永远不会忘记我们第一次见面的那一天。' }
    ],
    en2zh: { prompt: 'The city where the experiment was conducted has changed dramatically.', reference: '进行实验的那座城市发生了巨大变化。', keywords: ['城市', '实验', '变化'] },
    zh2en: { prompt: '我们正处于一个技术迅速改变生活的时代。', reference: 'We are living in an age when technology is rapidly changing our lives.', keywords: ['when', 'technology', 'rapidly'] }
  },
  {
    key: 'as-soon-as',
    label: 'as soon as / the moment 一……就……',
    re: /\b(as\s+soon\s+as|the\s+moment)\b/i,
    understanding: '表示两个动作紧接发生，“一……就……”。as soon as 引导时间状语从句，主句常用一般将来时，从句用一般现在时表将来；the moment 起连词作用，后面直接接句子。',
    translation: '译“一……就……”。不要按字面译成“尽可能快地”。',
    examples: [
      { en: 'As soon as the results came out, the team began analysing them.', zh: '结果一出来，团队就开始分析。' },
      { en: 'The moment the alarm went off, everyone left the building.', zh: '警报一响，所有人就离开了大楼。' }
    ],
    en2zh: { prompt: 'He will call you as soon as he gets home.', reference: '他一到家就给你打电话。', keywords: ['一', '到家', '电话'] },
    zh2en: { prompt: '我一看到邮件就回复了你。', reference: 'I replied to you as soon as I saw the email.', keywords: ['as soon as', 'saw', 'replied'] }
  },
  {
    key: 'times-comparison',
    label: '倍数表达（three times as … as / the size of）',
    re: /\b(twice|three\s+times|four\s+times|five\s+times|several\s+times|half)\s+(as\s+\w+\s+as|the\s+(size|weight|length|number|amount|rate|price)\s+of|\w+er\s+than)\b|\b(twice|three\s+times|four\s+times)\s+(more|less)\b/i,
    understanding: '倍数有三种常见写法：A is three times as large as B；A is three times the size of B；A is three times larger than B（考试中通常也按“是……的三倍”理解）。half 表示“一半”。',
    translation: '译“是……的几倍／比……大几倍”。注意中文“大三倍”和“是三倍大”有时混用，按原句结构判断。',
    examples: [
      { en: 'The new battery lasts three times as long as the old one.', zh: '新电池的续航时间是旧电池的三倍。' },
      { en: 'The population of the city is twice the size of that of the neighbouring town.', zh: '这座城市的人口是邻镇的两倍。' }
    ],
    en2zh: { prompt: 'This machine is three times faster than that one.', reference: '这台机器的速度是那台的三倍。', keywords: ['三倍', '速度', '机器'] },
    zh2en: { prompt: '这栋楼的高度是那栋的两倍。', reference: 'This building is twice as tall as that one.', keywords: ['twice', 'as tall as'] }
  },
  {
    key: 'only-to',
    label: 'only to do 出乎意料的结果',
    re: /\bonly\s+to\s+(find|discover|realize|realise|learn|see|hear)\b/i,
    understanding: 'only to do 作结果状语，表示“结果却……”，通常带有出乎意料、令人失望的意味。它不是目的状语，不能译成“只是为了”。',
    translation: '译“结果却／却没想到”。中文常把这一层意思放在句末。',
    examples: [
      { en: 'She rushed to the station, only to find that the train had left.', zh: '她赶到车站，却发现火车已经开走了。' },
      { en: 'He spent years building the company, only to see it collapse overnight.', zh: '他花了多年建立这家公司，结果却眼睁睁看着它一夜崩塌。' }
    ],
    en2zh: { prompt: 'He arrived at the airport, only to find that the flight had been cancelled.', reference: '他赶到机场，却发现航班已经取消。', keywords: ['却', '发现', '取消'] },
    zh2en: { prompt: '她打开盒子，结果发现里面是空的。', reference: 'She opened the box, only to find that it was empty.', keywords: ['only to', 'empty'] }
  },
  {
    key: 'subjunctive-inversion',
    label: '虚拟语气倒装（Were I … / Had I …）',
    re: /\b(were\s+(i|he|she|we|they|it)|had\s+(i|he|she|we|they)|should\s+(you|he|she|we|they))\b/i,
    understanding: '虚拟条件句省略 if 后，把 were / had / should 提到主语前面：Were I you = If I were you；Had I known = If I had known；Should you need help = If you should need help。',
    translation: '译“如果……／要是……”。先还原成 if 条件句再翻译，语序就不会乱。',
    examples: [
      { en: 'Had I known the truth, I would have acted differently.', zh: '要是我当时知道真相，我就会采取不同的做法。' },
      { en: 'Were the government to raise taxes, public support would fall.', zh: '如果政府增税，公众支持率就会下降。' }
    ],
    en2zh: { prompt: 'Had I been there, I would have stopped him.', reference: '如果我当时在场，我就会阻止他。', keywords: ['如果', '在场', '阻止'] },
    zh2en: { prompt: '如果你需要帮助，请告诉我。', reference: 'Should you need help, please let me know.', keywords: ['should', 'need', 'help'] }
  },
  {
    key: 'concession-no-matter',
    label: 'no matter how / however + 形容词 让步',
    re: /\bno\s+matter\s+(how|what|who|where|when|which)\b|\bhowever\s+(hard|much|far|long|often|difficult|important|small|great|complex|simple)\b/i,
    understanding: 'no matter + wh- 和 wh-ever 都表示“无论……”，引导让步状语从句。however 在这里不是“然而”，而是“无论多么”，后面紧跟形容词或副词。',
    translation: '译“无论多么／不管……”。however + adj. 要译成“无论多么……”，不要译成转折的“然而”。',
    examples: [
      { en: 'No matter how hard he tried, he could not solve the problem.', zh: '无论他多么努力，都无法解决这个问题。' },
      { en: 'However difficult the task is, we must finish it on time.', zh: '无论任务多么困难，我们都必须按时完成。' }
    ],
    en2zh: { prompt: 'No matter what happens, I will support you.', reference: '不管发生什么，我都会支持你。', keywords: ['不管', '发生', '支持'] },
    zh2en: { prompt: '无论这项技术多么先进，它都不能取代人的判断。', reference: 'However advanced the technology is, it cannot replace human judgment.', keywords: ['however', 'advanced', 'replace'] }
  },
  {
    key: 'but-for',
    label: 'But for / Without 含蓄虚拟条件',
    re: /\b(but\s+for|without)\b[^.!?]{0,55}\b(would|could|might|should)\s+have\b/i,
    understanding: 'but for = “要不是”，without = “如果没有”，它们都相当于一个虚拟条件句，主句常用 would/could/might have done。它不是普通的“但是为了”或“没有”。',
    translation: '译“要不是／如果没有……”。主句译“本来就会/可能……”。',
    examples: [
      { en: 'But for your help, we would have failed.', zh: '要不是你的帮助，我们本来会失败的。' },
      { en: 'Without the Internet, modern life would be unimaginable.', zh: '没有互联网，现代生活将难以想象。' }
    ],
    en2zh: { prompt: 'But for your advice, I might have given up.', reference: '要不是你的建议，我可能已经放弃了。', keywords: ['要不是', '建议', '放弃'] },
    zh2en: { prompt: '如果没有那些数据，我们不可能得出这个结论。', reference: 'Without that data, we could not have reached this conclusion.', keywords: ['without', 'could not', 'conclusion'] }
  },
  {
    key: 'elliptical-clause',
    label: '省略结构（if necessary / when possible）',
    re: /\b(if\s+(possible|necessary|any|so|not|needed)|when\s+(necessary|possible|needed)|where\s+(necessary|possible|appropriate)|as\s+(expected|planned|stated|required|scheduled))\b/i,
    understanding: '状语从句中与主句重复的主语和 be 动词常被省略：if necessary = if it is necessary；when possible = when it is possible；as expected = as it was expected。补全后再理解。',
    translation: '译“如有必要／在可能时／如预期”。中文本来就常省略，不必把省略部分硬补出来。',
    examples: [
      { en: 'Check the figures again if necessary.', zh: '如有必要，再核对一遍数字。' },
      { en: 'The event went ahead as planned.', zh: '活动按计划进行了。' }
    ],
    en2zh: { prompt: 'Please contact us when possible.', reference: '方便时请联系我们。', keywords: ['方便', '联系'] },
    zh2en: { prompt: '如果可能的话，请提前预约。', reference: 'If possible, please book in advance.', keywords: ['if possible', 'book'] }
  },
  {
    key: 'fronted-adverbial',
    label: '句首状语前置（In … / For … / At …）',
    re: /^(?:in|on|at|for|with|during|after|before|since|throughout|by|under|among|across|within|despite|because\s+of)\b[^.!?]{2,70},\s*[a-z]/i,
    understanding: '句首的介词短语是状语，交代时间、地点、范围或条件，真正的主语通常紧跟在第一个逗号之后。读到逗号先别急，先认出状语，再找主语和谓语。',
    translation: '按中文习惯把状语放在句首或动词前：“在……／对……来说／为了……”。',
    examples: [
      { en: 'In a small community hall, a dozen people sit at tables.', zh: '在一个小社区礼堂里，十几个人围坐在桌旁。' },
      { en: 'For much of the last century, planners treated the car as the measure of a good street.', zh: '在过去一个世纪的大部分时间里，规划者把汽车当作衡量街道好坏的标准。' }
    ],
    en2zh: { prompt: 'In many cities, the cost of housing has risen faster than wages.', reference: '在许多城市，住房成本的上涨速度快于工资。', keywords: ['许多城市', '住房', '工资'] },
    zh2en: { prompt: '对许多学生来说，最大的困难不是能力，而是习惯。', reference: 'For many students, the biggest difficulty is not ability but habit.', keywords: ['For', 'difficulty', 'habit'] }
  },
  {
    key: 'semicolon-parallel',
    label: '分号并列句（; 连接两个完整分句）',
    re: /;\s*(?:the|they|it|this|these|those|some|others|many|most|we|you|he|she|a|an|but|however|instead|so|therefore|meanwhile|yet)\b/i,
    understanding: '分号连接两个各自完整的分句，前后通常是并列、对比或因果。分号不是逗号，不能当停顿略过；它提示这里换了主语或发生了转折。',
    translation: '分号一般译成“；”“而”，或直接另起一句，按前后关系选择。',
    examples: [
      { en: 'Visitors are not customers waiting for a service; they are participants in a conversation.', zh: '来访者不是等待服务的顾客；他们是这场对话的参与者。' },
      { en: 'It does not remove the need for sleep; it hides it.', zh: '它并没有消除睡眠需求，只是把需求掩盖了。' }
    ],
    en2zh: { prompt: 'One group slept for eight hours; the other stayed awake all night.', reference: '一组睡了八小时；另一组整夜没睡。', keywords: ['一组', '另一组', '整夜'] },
    zh2en: { prompt: '这台机器更便宜；那台更精确。', reference: 'This machine is cheaper; that one is more accurate.', keywords: ['cheaper', 'accurate'] }
  },
  {
    key: 'colon-explain',
    label: '冒号解释与列举（: 后说明前文）',
    re: /:\s*(?:can|the|it|they|a|an|this|these|those|some|not|how|what|why|whether)\b/i,
    understanding: '冒号表示“也就是说、具体如下”，后面解释、列举或提出一个问题。冒号前后是同一个意思的展开，不是另起一个新话题。',
    translation: '译成“：”或“也就是说／例如”，后面的内容顺着前文说下去。',
    examples: [
      { en: 'The test is simple: can a person reach shops, schools and parks within a short walk?', zh: '检验方法很简单：一个人能否在短距离步行内到达商店、学校和公园？' },
      { en: 'Improving the situation requires changes at several points: incentives, training and public support.', zh: '改善现状需要在几个环节做出改变：激励、培训与公众支持。' }
    ],
    en2zh: { prompt: 'The difference is political: it reflects decisions about who bears the risk.', reference: '差别在于政治：它反映了由谁承担风险的决定。', keywords: ['政治', '承担', '风险'] },
    zh2en: { prompt: '问题很简单：谁来付这笔钱？', reference: 'The question is simple: who pays for it?', keywords: ['simple', 'who', 'pays'] }
  },
  {
    key: 'noun-appositive',
    label: '名词短语同位语（, a process called …）',
    re: /,\s*(?:a|an)\s+[a-z][\w-]*(?:\s+[a-z][\w-]*){0,4}\s*(?:,|and\s+(?:a|an)\s|called|known\s+as)/i,
    understanding: '逗号后面的名词短语是在解释前面的名词，二者指同一事物，这叫同位语。它常以 a / an 开头，后面还可能带 called / known as。理解时把它当作“也就是……”。',
    translation: '译“也就是／即……”，或用破折号、括号把解释补出来。',
    examples: [
      { en: 'Leaves lose water through tiny pores, a process called transpiration.', zh: '叶子通过微小的气孔失水，这一过程叫作蒸腾作用。' },
      { en: 'Extreme heat is a public health emergency, a strain on electricity networks and a cause of economic loss.', zh: '极端高温是一场公共卫生紧急事件，也是对电网的压力，还会造成经济损失。' }
    ],
    en2zh: { prompt: 'The city introduced a new policy, a plan called congestion pricing.', reference: '这座城市推出了一项新政策，即名为拥堵收费的方案。', keywords: ['新政策', '名为', '方案'] },
    zh2en: { prompt: '他们研究一种现象，即所谓的“注意力残留”。', reference: 'They study a phenomenon, a process called attention residue.', keywords: ['phenomenon', 'process', 'called'] }
  },
  {
    key: 'not-but',
    label: 'not … but … 不是……而是……',
    re: /\bnot\b[^.!?]{0,70}\bbut\b/i,
    understanding: 'not 和 but 前后是两个对等的成分，否定前者、肯定后者。but 在这里不是转折的“但是”，而是“而是”。先划出对等的两部分，再翻译。',
    translation: '译“不是……而是……”。不要把 but 译成“但是”。',
    examples: [
      { en: 'Progress comes from many easy successes, not from a few heroic struggles.', zh: '进步来自许多次轻松的成功，而不是少数几次英勇的挣扎。' },
      { en: 'The difference is not technological but political.', zh: '差别不在技术，而在政治。' }
    ],
    en2zh: { prompt: 'The goal is not to work longer but to work better.', reference: '目标不是工作更久，而是工作得更好。', keywords: ['不是', '而是', '更好'] },
    zh2en: { prompt: '问题不在于缺乏数据，而在于缺乏判断。', reference: 'The problem is not a lack of data but a lack of judgment.', keywords: ['not', 'but', 'judgment'] }
  },
  {
    key: 'compared-with',
    label: 'compared with / compared to 比较短语',
    re: /\b(?:compared|relative)\s+(?:with|to)\b|\bin\s+contrast\s+(?:with|to)\b/i,
    understanding: 'compared with / compared to 引出比较对象，意思是“与……相比”，常作状语或补语。compared to 也可以表示“比作”，要看宾语是不是同类事物。',
    translation: '译“与……相比／比起……”。',
    examples: [
      { en: 'The amount is still tiny compared with the plastic we shed every day.', zh: '与我们每天掉落的塑料相比，这个量仍然很小。' },
      { en: 'These changes are cheap compared with building a new road.', zh: '与修建一条新路相比，这些改变代价很低。' }
    ],
    en2zh: { prompt: 'Compared with previous years, the number of applicants has doubled.', reference: '与前几年相比，申请人数翻了一番。', keywords: ['相比', '申请', '翻倍'] },
    zh2en: { prompt: '与城市相比，农村地区获得医疗资源的机会更少。', reference: 'Compared with cities, rural areas have less access to medical resources.', keywords: ['Compared with', 'rural', 'access'] }
  },
  {
    key: 'participle-phrase',
    label: '句中分词短语（, doing / done 补充说明）',
    re: /,\s*(?:sometimes\s+|often\s+)?[a-z]+(?:ing|ed)\b[^.!?]{0,70}(?:,|\.|;)/i,
    understanding: '逗号后面的 -ing / -ed 短语不是谓语，而是补充说明前面的动作或名词：-ing 表主动、进行，-ed 表被动、完成。先找到主句的主谓，再把这个短语挂上去。',
    translation: '译成“同时／从而／其中……”或用短句另说，不要把它当成第二个谓语。',
    examples: [
      { en: 'Volunteers move between them, asking questions and offering advice.', zh: '志愿者在他们之间走动，一边询问一边给出建议。' },
      { en: 'University press offices, seeking coverage, translate cautious language into memorable claims.', zh: '大学新闻办公室为了获得报道，把谨慎的措辞转成耸动的说法。' }
    ],
    en2zh: { prompt: 'They retell stories with controlled vocabulary, adding new words gradually.', reference: '他们用受控词汇复述故事，逐步加入新词。', keywords: ['复述', '逐步', '新词'] },
    zh2en: { prompt: '他站在门口，看着人群走过。', reference: 'He stood at the door, watching the crowd pass by.', keywords: ['watching', 'crowd'] }
  },
  {
    key: 'time-clause',
    label: '时间状语从句（when / while / before / after / once）',
    re: /\b(when|whenever|while|before|after|until|till|once|as\s+soon\s+as|the\s+moment)\b[^.!?]{0,70}\b[a-z]+\b/i,
    understanding: '时间状语从句交代主句动作发生的时间。when 可指“当……时”也可指“这时突然”；while 强调同时进行；before / after 表示先后；once 是“一旦”。从句里通常不用将来时，而用一般现在时表将来。',
    translation: '译“当……时／在……之前／……之后／一旦……”。中文习惯把时间从句放前面。',
    examples: [
      { en: 'When the answer is yes, daily life requires less planning.', zh: '如果答案是肯定的，日常生活需要的规划就更少。' },
      { en: 'Trees need years of care before they provide much shade.', zh: '树木需要多年照料才能提供足够的阴凉。' }
    ],
    en2zh: { prompt: 'Once the data is collected, the team will begin the analysis.', reference: '一旦数据收集完毕，团队就会开始分析。', keywords: ['一旦', '数据', '分析'] },
    zh2en: { prompt: '他到家时，晚饭已经做好了。', reference: 'When he got home, dinner was already ready.', keywords: ['When', 'home', 'ready'] }
  },
  {
    key: 'relative-who',
    label: 'who / whom 定语从句（修饰人或人群）',
    re: /\b[a-z]+s?\s+(who|whom)\s+[a-z]/i,
    understanding: 'who / whom 引导定语从句，修饰前面的人或人群：who 在从句中作主语，whom 作宾语（书面语）。先找到先行词，再把从句单独读一遍。',
    translation: '译“……的（人）”，把从句放到先行词前面，或拆成“他们……”另起一句。',
    examples: [
      { en: 'Opposition often comes from shopkeepers who fear fewer parking spaces.', zh: '反对往往来自那些担心停车位减少的店主。' },
      { en: 'Students who read extensively tend to develop larger vocabularies.', zh: '大量阅读的学生往往词汇量更大。' }
    ],
    en2zh: { prompt: 'People who understand the risk are more likely to prepare for it.', reference: '了解风险的人更有可能为此做准备。', keywords: ['了解', '风险', '准备'] },
    zh2en: { prompt: '我们需要的是一套能长期运行的系统。', reference: 'What we need is a system that can work over the long term.', keywords: ['system', 'long term'] }
  },
  {
    key: 'comparative-separated',
    label: '被介词短语隔开的比较（less important for A than for B）',
    re: /\b(less|more)\s+\w+\b[^.!?]{0,45}\bthan\b/i,
    understanding: '比较对象有时会被介词短语隔开，形成 less important for A than for B 这样的结构。看到 than 要往回找它对应的比较词（more / less / -er），中间的内容只是补充说明。',
    translation: '译“在 A 方面不如在 B 方面那么……”。先把比较的两端对齐，再翻译中间部分。',
    examples: [
      { en: 'The cafe is less important for the kilos it saves than for the expectation it creates.', zh: '这家咖啡馆的意义，与其说在于它节省了多少公斤垃圾，不如说在于它带来的期待。' },
      { en: 'The answer depends less on the difficulty of a task than on its composition.', zh: '答案与其说取决于任务的难度，不如说取决于它的构成。' }
    ],
    en2zh: { prompt: 'Success depends more on steady practice than on natural talent.', reference: '成功更多取决于稳定的练习，而不是天赋。', keywords: ['更多', '练习', '天赋'] },
    zh2en: { prompt: '这个问题在技术上不难，难在协调各方。', reference: 'The problem is less technical than organizational.', keywords: ['less', 'technical', 'organizational'] }
  },
  {
    key: 'reason-clause',
    label: '原因状语从句（because / since / now that）',
    re: /\b(because|since)\b[^.!?]{0,70}\b[a-z]+\b/i,
    understanding: 'because 语气最强，直接回答“为什么”；since 语气较弱，表示“既然、由于”，常放在句首；now that 强调“既然现在……”。注意 since 还可以表示“自……以来”，要看后面接的是从句还是时间点。',
    translation: '译“因为／由于／既然”。中文常把原因放在结果前面，也可以后置。',
    examples: [
      { en: 'Teachers sometimes resist the approach because it feels too easy.', zh: '教师有时抵触这种方法，因为它显得太简单。' },
      { en: 'Since the evidence is limited, we should be cautious.', zh: '由于证据有限，我们应该谨慎。' }
    ],
    en2zh: { prompt: 'The plan failed because no one was responsible for the details.', reference: '这项计划失败，是因为没有人负责细节。', keywords: ['失败', '因为', '细节'] },
    zh2en: { prompt: '既然大家都同意，我们就开始吧。', reference: 'Since everyone agrees, let us begin.', keywords: ['Since', 'agrees', 'begin'] }
  },
  {
    key: 'coordination',
    label: '并列句与并列成分（and / but / or / so）',
    re: /,\s*(and|but|or|so|yet)\s+(?:the|they|it|this|these|those|we|you|he|she|a|an|some|many|most|each|there|our|its|their)\b|\b[a-z]+ed\s+and\s+[a-z]+ed\b/i,
    understanding: 'and / but / or / so 连接两个对等的成分或分句：and 表并列或递进，but 表转折，or 表选择，so 表结果。先找出它连接的两端，确认两端成分对等，再翻译。',
    translation: 'and 译“并且／而”，but 译“但是”，or 译“或者”，so 译“因此”。中文常把后半句另起一句。',
    examples: [
      { en: 'Each step is small, and each seems to follow from the last.', zh: '每一步都很小，而且每一步似乎都顺理成章。' },
      { en: 'The fear is understandable, but the evidence rarely supports it.', zh: '这种担忧可以理解，但证据很少支持它。' }
    ],
    en2zh: { prompt: 'The idea began in the Netherlands and has spread to thousands of towns.', reference: '这一想法始于荷兰，并已传播到数千个城镇。', keywords: ['始于', '传播', '城镇'] },
    zh2en: { prompt: '这项技术更便宜，也更可靠。', reference: 'The technology is cheaper and more reliable.', keywords: ['cheaper', 'reliable'] }
  },
  {
    key: 'nothing-but',
    label: 'nothing but / anything but 否定强调结构',
    re: /\b(nothing|none|nobody|no\s+one)\s+but\b|\banything\s+but\b|\bnothing\s+short\s+of\b|\bnone\s+other\s+than\b/i,
    understanding: 'nothing but = only（只不过、仅仅是）；anything but = not at all（一点也不）；nothing short of = 简直是、无异于；none other than = 正是。看到 but 不要一律译成“但是”，要先判断它前面的否定词。',
    translation: 'nothing but 译“只不过／仅仅是”；anything but 译“一点也不”；nothing short of 译“简直是”。',
    examples: [
      { en: 'What we need is nothing but a clear plan.', zh: '我们需要的不过是一个清晰的计划。' },
      { en: 'The result is anything but satisfactory.', zh: '结果一点也不令人满意。' }
    ],
    en2zh: { prompt: 'The delay was nothing short of a disaster.', reference: '这次延误简直是一场灾难。', keywords: ['简直', '灾难'] },
    zh2en: { prompt: '他需要的只是一个安静的房间。', reference: 'What he needs is nothing but a quiet room.', keywords: ['nothing but', 'quiet'] }
  },
  {
    key: 'the-last',
    label: 'the last + 名词 + to do / that …（最不可能……）',
    re: /\bthe\s+last\s+\w+(?:\s+\w+){0,2}\s+(to\s+[a-z]+|that\s+[a-z]+|who\s+[a-z]+)\b/i,
    understanding: 'the last + 名词 + to do / that 从句，字面是“最后一个……”，实际常表示“最不可能……的”。判断依据是语境：如果强调不可能或最不情愿，就按“最不可能”理解。',
    translation: '译“最不可能……的”“最不……的”。不要机械译成“最后一个”。',
    examples: [
      { en: 'She is the last person to complain about hard work.', zh: '她是最不可能抱怨辛苦的人。' },
      { en: 'This is the last thing that we need right now.', zh: '这是我们现在最不需要的东西。' }
    ],
    en2zh: { prompt: 'He is the last person to break a promise.', reference: '他最不可能食言。', keywords: ['最不可能', '食言'] },
    zh2en: { prompt: '这是我最不想听到的消息。', reference: 'This is the last piece of news I want to hear.', keywords: ['last', 'news'] }
  },


  {
    key: 'otherwise-subjunctive',
    label: 'otherwise / or else + 虚拟语气（否则……）',
    re: /\botherwise\b[^.!?]{0,70}\b(would|could|might)\s+(have\s+)?[a-z]+\b|\bor\s+else\b[^.!?]{0,60}\b(would|could|might)\b/i,
    understanding: 'otherwise / or else 前面常隐含一个条件，后面用 would / could / might 构成虚拟：与现在相反用 would do，与过去相反用 would have done。若后面没有情态动词，则只是一般意义的“否则”。',
    translation: '译“否则……”“要不然……”。有 would have done 时译“否则本来会……”。',
    examples: [
      { en: 'We acted quickly; otherwise, the damage would have been worse.', zh: '我们行动迅速，否则损失会更严重。' },
      { en: 'He must have been ill; otherwise he would have come.', zh: '他一定是病了，否则他就来了。' }
    ],
    en2zh: { prompt: 'The system needs reform; otherwise, it will collapse.', reference: '这个体系需要改革，否则就会崩溃。', keywords: ['否则', '崩溃'] },
    zh2en: { prompt: '你必须现在出发，否则就赶不上火车了。', reference: 'You must leave now; otherwise, you will miss the train.', keywords: ['otherwise', 'miss'] }
  },
  {
    key: 'used-to',
    label: 'used to do / be used to doing / be used to do 三组易混',
    re: /\b(used\s+to|be\s+used\s+to|get\s+used\s+to|become\s+used\s+to)\b/i,
    understanding: 'used to do = 过去常常（现在不再）；be / get used to doing = 习惯于做某事（to 是介词，后接动名词）；be used to do = 被用来做某事（被动）。判断关键：to 后面是动词原形还是 -ing。',
    translation: '分别译“过去常常”“习惯于”“被用来”。不要看到 used to 就一律译成“过去常常”。',
    examples: [
      { en: 'People used to believe that the earth was flat.', zh: '人们过去常认为地球是平的。' },
      { en: 'She is used to working under pressure.', zh: '她习惯了在压力下工作。' }
    ],
    en2zh: { prompt: 'This tool is used to measure air quality.', reference: '这种工具被用来测量空气质量。', keywords: ['用来', '测量'] },
    zh2en: { prompt: '我过去常常步行去上班。', reference: 'I used to walk to work.', keywords: ['used to', 'walk'] }
  },
  {
    key: 'be-to-do',
    label: 'be to do（计划 / 安排 / 命令 / 注定）',
    re: /\b(is|are|was|were)\s+to\s+(?:be\s+)?(?:be|do|make|take|start|begin|end|leave|return|remain|appear|report|hold|meet|sign|give|announce|publish|release|decide|change|act|held|signed|published|released|completed|finished|started|begun|launched|announced|decided|expected|seen|found|known|blamed|praised|criticized|considered|regarded|treated)\b/i,
    understanding: 'be to do 可表示按计划或安排“将要”，也可表示命令、规定，或“注定要”。be to be done 则是将来被动。若主语是 aim / goal / purpose，后面的不定式更可能是表语，表示“目标是……”。',
    translation: '译“定于……”“将……”“必须……”“注定……”。根据语境选择，不要一律译成将来时。',
    examples: [
      { en: 'The meeting is to be held next Monday.', zh: '会议定于下周一举行。' },
      { en: 'The report was to be published last week.', zh: '这份报告原定上周发布。' }
    ],
    en2zh: { prompt: 'The new rules are to take effect in July.', reference: '新规定将于七月生效。', keywords: ['将于', '生效'] },
    zh2en: { prompt: '他注定要为此付出代价。', reference: 'He was to pay the price for it.', keywords: ['was to', 'pay'] }
  },
  {
    key: 'active-passive',
    label: '主动形式表被动（sell well / wash easily）',
    re: /\b(sell|sells|sold|read|reads|write|writes|wrote|wash|washes|clean|cleans|open|opens|close|closes|cut|cuts|peel|peels)\s+(well|easily|smoothly|quickly|badly|nicely|beautifully|perfectly|surprisingly|remarkably|astonishingly)\b/i,
    understanding: '某些动词与 well / easily / smoothly 等副词连用时，主动形式表示被动意义，主语通常是物：The book sells well = 这本书卖得好。这类动词包括 sell、read、write、wash、clean、open、close、cut 等。',
    translation: '译成“很耐……”“很容……”“卖得……”，不要硬加“被”。',
    examples: [
      { en: 'This kind of cloth washes well.', zh: '这种布料很耐洗。' },
      { en: 'The book sells surprisingly well.', zh: '这本书卖得意外地好。' }
    ],
    en2zh: { prompt: 'The pen writes smoothly.', reference: '这支笔写起来很顺滑。', keywords: ['写', '顺滑'] },
    zh2en: { prompt: '这种衣服很容易洗。', reference: 'This kind of clothes washes easily.', keywords: ['washes', 'easily'] }
  },
  {
    key: 'get-passive',
    label: 'get + 过去分词（get-passive）',
    re: /\b(get|gets|got|gotten|getting)\s+(paid|fired|hurt|killed|caught|dismissed|arrested|injured|promoted|married|divorced|dressed|changed|replaced|stuck|lost|stolen|rejected|accepted|invited|confused|engaged|involved|elected|appointed)\b/i,
    understanding: 'get + 过去分词构成被动，语气比 be + 过去分词更口语化，常表示意外、不利或状态变化：get fired 被解雇，get hurt 受伤。正式写作中仍以 be 被动为主。',
    translation: '译“被……”“遭到……”“变得……”。根据语境补出“意外、不利”的语气。',
    examples: [
      { en: 'He got fired for repeatedly missing deadlines.', zh: '他因屡次错过截止日期被解雇了。' },
      { en: 'They got married last spring.', zh: '他们去年春天结婚了。' }
    ],
    en2zh: { prompt: 'The window got broken during the storm.', reference: '窗户在暴风雨中被打破了。', keywords: ['被', '打破'] },
    zh2en: { prompt: '她被困在电梯里两个小时。', reference: 'She got stuck in the lift for two hours.', keywords: ['got stuck', 'lift'] }
  },
  {
    key: 'have-sth-done',
    label: 'have / get + 宾语 + 过去分词（请人做 / 让某事被做）',
    re: /\b(have|has|had|get|gets|got)\s+(the|a|an|my|your|his|her|our|their|its|this|that|some|any|it|them|him|her|us|you)\s+(?:[a-z]+\s+){0,2}(done|made|repaired|cleaned|built|fixed|checked|cut|painted|delivered|installed|removed|replaced|translated|published|washed|prepared|served|tested)\b/i,
    understanding: 'have / get + 宾语 + 过去分词，表示“请人或让别人做某事”，宾语是动作的承受者：have my car repaired = 请人修车。它与 have + 过去分词（完成时）不同，中间必须有宾语。',
    translation: '译“请人……”“让……被……”。中文常省略“请人”，直接说“修了车”“剪了头发”。',
    examples: [
      { en: 'I had my car repaired yesterday.', zh: '我昨天请人修了车。' },
      { en: 'They got the report translated into English.', zh: '他们请人把报告译成了英语。' }
    ],
    en2zh: { prompt: 'She had her hair cut short.', reference: '她请人把头发剪短了。', keywords: ['请人', '剪短'] },
    zh2en: { prompt: '我们得请人检查一下这些数据。', reference: 'We need to have these data checked.', keywords: ['have', 'checked'] }
  },
  {
    key: 'make-let-do',
    label: 'make / let / have + 宾语 + 动词原形',
    re: /\b(make|makes|made|let|lets|have|has|had)\s+(me|us|him|her|them|you|it|people|students|workers|children|consumers|employees|everyone|the\s+\w+)\s+(?:not\s+)?(go|do|stay|work|think|believe|know|come|leave|wait|try|use|take|make|feel|see|understand|accept|change|focus|choose|explain|redo|give|cross|enter)\b/i,
    understanding: 'make / let / have 作使役动词时，后面接“宾语 + 动词原形”，不带 to：make him change（使他改变）、let me explain（让我解释）、have him do（让他做）。变成被动后，make 后的 to 要还原：He was made to change.',
    translation: '译“使／让／叫某人做某事”。不要受汉语“让”影响而加 to。',
    examples: [
      { en: 'The evidence made him change his mind.', zh: '证据使他改变了主意。' },
      { en: 'Let me explain the process briefly.', zh: '让我简要解释一下这个过程。' }
    ],
    en2zh: { prompt: 'Nothing can make me give up.', reference: '没有什么能让我放弃。', keywords: ['让', '放弃'] },
    zh2en: { prompt: '老师让学生们重新做实验。', reference: 'The teacher made the students redo the experiment.', keywords: ['made', 'redo'] }
  },
  {
    key: 'perception-verb',
    label: '感官动词 + 宾语 + do / doing / done',
    re: /\b(see|sees|saw|seen|hear|hears|heard|watch|watches|watched|notice|notices|noticed|observe|observes|observed|feel|feels|felt|find|finds|found)\s+(me|us|him|her|them|you|it|people|students|workers|children|someone|something|everyone|the\s+\w+)\s+(do|doing|done|dancing|running|walking|talking|playing|standing|sitting|crying|laughing|working|reading|writing|moving|growing|falling|rising|cross|enter|leave|climb|jump)\b/i,
    understanding: '感官动词（see / hear / watch / notice / observe / feel / find）后接宾语和补足语：do 表示看到或听到动作的全过程，doing 表示动作正在进行，done 表示宾语承受动作。被动语态中，do 前要加 to：He was seen to leave.',
    translation: 'do 译“看见某人做了某事”；doing 译“看见某人正在做某事”；done 译“看见某人被……”。',
    examples: [
      { en: 'I saw him cross the street and enter the bank.', zh: '我看见他穿过街道，走进银行。' },
      { en: 'We heard someone singing in the next room.', zh: '我们听见有人在隔壁房间唱歌。' }
    ],
    en2zh: { prompt: 'She watched the children playing in the garden.', reference: '她看着孩子们在花园里玩耍。', keywords: ['看着', '玩耍'] },
    zh2en: { prompt: '我注意到他正在看手表。', reference: 'I noticed him looking at his watch.', keywords: ['noticed', 'looking'] }
  },
  {
    key: 'adjective-postmodifier',
    label: '形容词后置定语（something important / people present）',
    re: /\b(something|anything|nothing|everything|someone|anyone|everyone|nobody|people|those)\s+(important|possible|available|necessary|responsible|present|involved|concerned|alive|awake|asleep|absent|eligible|capable|similar|different)\b|\bthe\s+(only|first|last|next)\s+\w+\s+(available|responsible|concerned|involved|present|alive|eligible)\b/i,
    understanding: '形容词修饰 something / anything / nothing / everyone 等不定代词时必须后置：something important。present、available、responsible、concerned、involved、alive 等形容词作定语时也常后置：the people present（在场的人）。',
    translation: '按“名词 + 的 + 形容词”译，如 something important = 重要的事，the people present = 在场的人。',
    examples: [
      { en: 'Is there anything important in today\'s paper?', zh: '今天的报纸上有什么重要内容吗？' },
      { en: 'The people present were asked to remain seated.', zh: '在场的人被要求留在座位上。' }
    ],
    en2zh: { prompt: 'We need someone responsible for the project.', reference: '我们需要一个负责这个项目的人。', keywords: ['负责', '项目'] },
    zh2en: { prompt: '所有在场的人都同意了。', reference: 'All the people present agreed.', keywords: ['present', 'agreed'] }
  },

  {
    key: 'exclamatory',
    label: '感叹句（What / How）',
    re: /^\s*(what\s+(a|an)\s+[a-z]|how\s+(?:[a-z]+ly|beautiful|wonderful|quick|fast|slow|difficult|easy|important|strange|interesting|nice|good|bad|cold|hot|long|far|much|many)\b)/i,
    understanding: '感叹句两种基本结构：What + (a/an) + 形容词 + 名词 + 主语 + 谓语；How + 形容词/副词 + 主语 + 谓语。What 修饰名词，How 修饰形容词或副词。',
    translation: '译“多么……啊”“真是……”。中文常把感叹词放在句末。',
    examples: [
      { en: 'What a remarkable achievement this is!', zh: '这是多么了不起的成就啊！' },
      { en: 'How quickly the situation changed!', zh: '形势变化得多快啊！' }
    ],
    en2zh: { prompt: 'What an extraordinary year it has been!', reference: '这是多么不平凡的一年啊！', keywords: ['多么', '不平凡'] },
    zh2en: { prompt: '这个想法多么简单啊！', reference: 'How simple this idea is!', keywords: ['How', 'simple'] }
  },
  {
    key: 'tag-question',
    label: '反意疑问句（…, isn\'t it?）',
    re: /,\s*(isn't|aren't|wasn't|weren't|don't|doesn't|didn't|can't|couldn't|won't|wouldn't|haven't|hasn't|hadn't|shouldn't|mustn't)\s+(it|he|she|they|we|you|there|this|that)\?|\b(is|are|was|were|do|does|did|can|could|will|would|have|has|had|should)\s+(it|he|she|they|we|you|there)\?/i,
    understanding: '反意疑问句遵循“前肯后否、前否后肯”：陈述句是肯定，附加问句用否定；陈述句有否定词，附加问句用肯定。附加问句的主语要用代词，there be 句型用 there。',
    translation: '译“……，不是吗？”“……，是吗？”；前否后肯时常译“难道……吗？”。',
    examples: [
      { en: 'The evidence is convincing, isn\'t it?', zh: '证据很有说服力，不是吗？' },
      { en: 'You have read the report, haven\'t you?', zh: '你已经读过报告了，不是吗？' }
    ],
    en2zh: { prompt: 'She does not like the plan, does she?', reference: '她不喜欢这个计划，是吗？', keywords: ['是吗', '计划'] },
    zh2en: { prompt: '他们会来参加会议，不是吗？', reference: 'They will come to the meeting, won\'t they?', keywords: ['won\'t', 'they'] }
  },
  {
    key: 'indirect-speech',
    label: '间接引语（said / told / asked + 从句）',
    re: /\b(told|tell|tells)\s+(me|us|him|her|them|you|the\s+\w+)\s+(that\b|to\b)|\b(asked|ask|asks)\s+(me|us|him|her|them|you)\s+(whether|if|what|when|where|why|how)\b|\b(said|says)\s+that\b/i,
    understanding: '间接引语把直接引语变成从句：said that / told sb that；一般疑问句用 asked whether / if；特殊疑问句用 asked + 疑问词。主句是过去时，从句时态通常后退一步，人称和时间状语也要相应调整，疑问句改为陈述语序。',
    translation: '译“说……”“告诉某人……”“问……”。不要保留原句的问号或倒装语序。',
    examples: [
      { en: 'She told me that the results would be announced later.', zh: '她告诉我结果稍后公布。' },
      { en: 'He asked whether the data had been verified.', zh: '他问数据是否已经核实。' }
    ],
    en2zh: { prompt: 'The official said that the policy would change.', reference: '官员说政策将会改变。', keywords: ['说', '政策', '改变'] },
    zh2en: { prompt: '她问我为什么迟到。', reference: 'She asked me why I was late.', keywords: ['asked', 'why'] }
  },
  {
    key: 'dash-parenthesis',
    label: '破折号插入语（— 补充说明 —）',
    re: /\s[—–]\s[^—–]{2,90}\s[—–]\s/,
    understanding: '一对破折号中间是插入成分，用来补充、解释或转折，阅读时可以先跳过，抓住主句主干。它与括号作用相近，但语气更强调。',
    translation: '译成“——……——”或“，即……，”。先译主干，再补插入成分。',
    examples: [
      { en: 'The proposal — a bold attempt to reform the system — has divided the party.', zh: '这项提案——一次大胆的制度改革尝试——使党内产生分歧。' },
      { en: 'One group — those who had lost their jobs — was hit hardest.', zh: '其中一个群体——那些失业的人——受到的打击最大。' }
    ],
    en2zh: { prompt: 'The city — once an industrial hub — is now struggling.', reference: '这座城市——曾经是工业中心——如今举步维艰。', keywords: ['城市', '工业中心'] },
    zh2en: { prompt: '这一发现——一个意外的结果——改变了整个领域。', reference: 'The discovery — an unexpected result — transformed the field.', keywords: ['discovery', 'unexpected'] }
  },
  {
    key: 'object-complement',
    label: '宾语补足语（make / find / consider + 宾语 + 形容词 / 名词）',
    re: /\b(make|makes|made|find|finds|found|consider|considers|considered|think|thinks|thought|believe|believes|believed|keep|keeps|kept|leave|leaves|left|call|calls|called|name|names|named|elect|elects|elected|appoint|appoints|appointed|render|renders|rendered)\s+(me|us|him|her|them|you|it|everyone|someone|the\s+\w+|a\s+\w+)\s+(happy|sad|angry|clear|difficult|easy|possible|necessary|important|responsible|aware|able|unable|likely|unlikely|impractical|president|chairman|leader|head|member|director|manager|official|public|open|free|safe|ready|available)\b/i,
    understanding: '宾语补足语补充说明宾语的状态、身份或特征：make everyone happy（使每个人高兴）、elect her president（选她当主席）、consider the plan impractical（认为计划不切实际）。make / find / consider + it + 形容词 + to do 中，it 是形式宾语。',
    translation: '译“使／认为／选……为……”。中文常把补足语译成“得……”“很……”。',
    examples: [
      { en: 'The news made everyone happy.', zh: '这个消息让每个人都很高兴。' },
      { en: 'They elected her president of the association.', zh: '他们选她为协会主席。' }
    ],
    en2zh: { prompt: 'We found the task difficult.', reference: '我们发现这项任务很难。', keywords: ['发现', '很难'] },
    zh2en: { prompt: '他们认为这个计划不切实际。', reference: 'They consider the plan impractical.', keywords: ['consider', 'impractical'] }
  },
  {
    key: 'nominalization',
    label: '名词化结构（the implementation of …）',
    re: /\b(the|a|an|this|that|its|their|our|his|her)\s+\w{4,}(tion|sion|ment|ness|ity|ance|ence|al|ure)\s+of\b/i,
    understanding: '名词化把动作或性质变成名词，是外刊和学术写作的典型特征：the implementation of the policy（实施政策）、the reduction of emissions（减少排放）。名词化会让句子信息密度变高、动作感变弱，翻译时通常还原成动词。',
    translation: '译成“对……的……”“……的……”。优先还原为动词，如 the reduction of emissions = 减少排放。',
    examples: [
      { en: 'The implementation of the policy has been delayed.', zh: '该政策的实施已被推迟。' },
      { en: 'The rapid growth of cities has increased demand for water.', zh: '城市的快速扩张增加了用水需求。' }
    ],
    en2zh: { prompt: 'The reduction of emissions remains a priority.', reference: '减少排放仍然是优先事项。', keywords: ['减少排放', '优先'] },
    zh2en: { prompt: '对这种方法的依赖导致了问题。', reference: 'The reliance on this method has caused problems.', keywords: ['reliance', 'caused'] }
  },
  {
    key: 'only-inversion',
    label: 'Only + 介词短语 / 从句置于句首的部分倒装',
    re: /\bonly\s+(in|by|through|with|after|when|if|once)\b[^.!?]{0,70}\b(can|could|will|would|should|must|did|do|does|is|are|was|were|has|have|had)\s+(the|a|an|it|we|they|he|she|you|i|this|that|its|their|our)\b/i,
    understanding: 'Only + 介词短语或状语从句放在句首时，主句要部分倒装：把助动词、情态动词或 be 动词提到主语前。Only in this way can we…；Only through cooperation can the two sides…。从句本身不倒装。',
    translation: '译“只有……才……”。倒装只影响语序，不影响意思。',
    examples: [
      { en: 'Only in this way can we solve the problem.', zh: '只有这样我们才能解决问题。' },
      { en: 'Only through cooperation can the two sides make progress.', zh: '只有通过合作，双方才能取得进展。' }
    ],
    en2zh: { prompt: 'Only by working together can we meet the challenge.', reference: '只有齐心协力，我们才能迎接挑战。', keywords: ['只有', '齐心协力'] },
    zh2en: { prompt: '只有通过实验才能验证这个假设。', reference: 'Only through experiments can this hypothesis be tested.', keywords: ['Only through', 'hypothesis'] }
  }
]

// 长句兜底：没有任何规则命中，但句子足够长且含从句引导词
const FALLBACK = {
  key: 'long-sentence',
  label: '长句拆解（主干 + 修饰）',
  understanding: '句子长但结构不算特殊，难点在于修饰成分多。先找主句的主语和谓语，把逗号、引导词、介词短语逐个挂到它们修饰的成分上。',
  translation: '先译主干（谁做什么），再把时间、地点、条件、原因按中文顺序补进去。',
  examples: [
    { en: 'In recent years, researchers have found that small changes in daily habits can produce lasting effects on learning.', zh: '近年来，研究者发现日常习惯的微小改变会对学习产生持久影响。' }
  ],
  en2zh: { prompt: 'For many students, the biggest barrier is not ability but the habit of giving up too early.', reference: '对许多学生来说，最大的障碍不是能力，而是过早放弃的习惯。', keywords: ['学生', '障碍', '放弃'] },
  zh2en: { prompt: '对大多数读者来说，真正困难的是坚持读完一整篇文章。', reference: 'For most readers, what is really difficult is finishing a whole article.', keywords: ['difficult', 'finishing', 'article'] }
}

function matchRules(sentence, rules) {
  const list = Array.isArray(rules) ? rules : RULES
  return list.filter((rule) => rule.re && rule.re.test(sentence))
}

function clauseCount(sentence) {
  const tokens = sentence.toLowerCase().match(/[a-z]+/g) || []
  const set = new Set(['that', 'which', 'who', 'whom', 'whose', 'when', 'while', 'where', 'because', 'although', 'though', 'if', 'unless', 'since', 'as', 'than', 'what', 'whether'])
  return tokens.filter((t) => set.has(t)).length
}

module.exports = { RULES, FALLBACK, matchRules, clauseCount }
