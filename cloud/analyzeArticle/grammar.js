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
    re: /\b(what|whether|that)\s+(the|a|an|it|he|she|they|we|you|people|students|this|these|there)\b/i,
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
    understanding: '否定词或 only + 状语放句首时，主句要部分倒装：把助动词/情态动词提到主语前（did he / can we / has it）。这是形式变化，意思不变。',
    translation: '按正常语序理解即可，译成“直到……才……”“一……就……”“只有……才……”。',
    examples: [
      { en: 'Not until midnight did he finish the essay.', zh: '直到午夜他才写完文章。' },
      { en: 'Only by reading widely can you write well.', zh: '只有广泛阅读，你才能写得好。' }
    ],
    en2zh: { prompt: 'Hardly had she sat down when the phone rang.', reference: '她刚坐下，电话就响了。', keywords: ['刚', '坐下', '电话'] },
    zh2en: { prompt: '直到考试结束，他才意识到时间不够。', reference: 'Not until the exam ended did he realize time was short.', keywords: ['not until', 'did'] }
  },
  {
    key: 'so-that',
    label: 'so … that / such … that 结果状语从句',
    re: /\bso\s+(?!that\b)[a-z]+\b[\s\S]{0,45}?\bthat\b|\bsuch\s+[\s\S]{0,45}?\bthat\b/i,
    understanding: 'so 修饰形容词/副词，such 修饰名词：so + adj./adv. + that；such + (a/an) + adj. + n. + that。that 后面是结果，不是目的。',
    translation: '译成“如此……以至于……”。中文可简化为“……得让/使得……”。',
    examples: [
      { en: 'The lecture was so dense that few students took notes.', zh: '讲座内容太密集，很少有学生记笔记。' },
      { en: 'It was such a long journey that everyone fell asleep.', zh: '旅途太漫长，所有人都睡着了。' }
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
    re: /(^|[.;:]\s*)((that)\s+(the|a|an|it|he|she|they|we|you|people|this|these|those|there|his|her|their|our|my|your|its|everyone|nobody|most|many|few|some|all|[a-z]+s)\b|(whether|what|whatever|whoever)\s+[a-z]+\b)/i,
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
