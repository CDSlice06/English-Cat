// 语法点「常被问到的点」（生成文件，勿手改）：来源 tools/grammar-deep/usage-*.js
// 每条包含：summary（一句话提醒）、items（2-3 个问答，部分带正误对比）

const USAGE_NOTES = {
  "subject-verb-agreement": {
    "summary": "谓语跟真正的主语走，先找主语中心词，再看就近、整体还是成员。",
    "items": [
      {
        "q": "the number of 和 a number of 后面谓语到底用单数还是复数？",
        "a": "看中心词。the number of + 复数名词，中心词是 number，谓语用单数；a number of + 复数名词，相当于 many，谓语用复数。判断时先把短语划掉，只留中心词再配谓语。",
        "good": "The number of students who failed the exam is surprisingly small.",
        "bad": "The number of students who failed the exam are surprisingly small."
      },
      {
        "q": "either...or 连接两个主语，谓语跟哪一个走？",
        "a": "就近原则，谓语跟离它最近的主语一致。Neither the teacher nor the students were late. 中靠近谓语的是 students，用 were；there be 句型同样就近。",
        "good": "Neither the teacher nor the students were late for the lecture.",
        "bad": "Neither the teacher nor the students was late for the lecture."
      },
      {
        "q": "news、physics、police 这些词怎么快速定单复数？",
        "a": "分三类记：news、physics、mathematics 形式是复数但作单数；police、people、cattle 作复数；family、team、class 强调整体用单数，强调成员用复数。做题先看它指整体还是一个个成员。",
        "good": "The police are looking into the case.",
        "bad": "The police is looking into the case."
      }
    ]
  },
  "nominalization": {
    "summary": "动词变名词能让句子更正式，但介词、冠词后必须用名词形式。",
    "items": [
      {
        "q": "作文里想把 because 从句写高级，怎么改成名词化？",
        "a": "三步：从句主语变所有格或 of 短语；动词变名词；连词换成 because of、lead to、result in。例 Because the company expanded rapidly 可改成 The rapid expansion of the company。",
        "good": "His sudden refusal to answer the question surprised everyone.",
        "bad": "His suddenly refuse to answer the question surprised everyone."
      },
      {
        "q": "名词化是不是用得越多越像高级作文？",
        "a": "不是。能用一个动词说清就别绕成 make a decision about the improvement of...。一篇里有一两处名词化作主语或介词宾语就够，连续几个 of 短语会让句子空、难读。判断标准：读者能不能一眼找到“谁做了什么”。"
      },
      {
        "q": "什么时候不得不用名词形式？",
        "a": "介词后、冠词后、形容词或所有格后都必须用名词，不能直接塞动词原形。after his arrival、the failure of the plan、rapid growth 都对；after he arrived 只能作从句，不能作介词宾语。",
        "good": "The sudden arrival of the guests caught us unprepared.",
        "bad": "The suddenly arrive of the guests caught us unprepared."
      }
    ]
  },
  "reflexive-use": {
    "summary": "主语和宾语是同一人就用 -self；反身代词不能单独作主语。",
    "items": [
      {
        "q": "I hurt me 为什么老师说错？",
        "a": "宾语和主语指同一个人时，宾语必须用反身代词。判断方法：把宾语换成人名，如果还是主语本人，就用 myself/yourself/himself 等。He cut himself.、She blamed herself. 都是这个道理。",
        "good": "He cut himself while shaving this morning.",
        "bad": "He cut him while shaving this morning."
      },
      {
        "q": "enjoy 后面到底加不加 myself？",
        "a": "看意思。enjoy oneself 表示“玩得开心”，主语是别人就换 yourself/himself；enjoy doing sth 表示“喜欢做”，后面直接跟动名词，不加反身代词。enjoy 是及物动词，宾语不能空着。",
        "good": "Did you enjoy yourself at the party last night?",
        "bad": "Did you enjoy at the party last night?"
      },
      {
        "q": "反身代词能不能放句首作主语？",
        "a": "不能单独作主语，只能作宾语、表语或同位语。要强调主语，把反身代词放在名词或代词后面：I myself saw it.、He himself did it.。Myself saw it 是典型错误。",
        "good": "I myself saw the accident happen.",
        "bad": "Myself saw the accident happen."
      }
    ]
  },
  "by-oneself": {
    "summary": "by + 反身代词 = 独自、靠自己；反身代词必须和主语指同一个人。",
    "items": [
      {
        "q": "by myself 和 on my own 有区别吗？",
        "a": "意思基本一样，可以互换；by oneself 更书面，on one's own 更口语。",
        "good": "She finished the whole report by herself.",
        "bad": "She finished the whole report by her."
      },
      {
        "q": "by myself 和 for myself 怎么区分？",
        "a": "by 强调“没有人帮”，for 强调“为自己”，两者不能混。",
        "good": "He learned to play the piano by himself.",
        "bad": "He learned to play the piano for himself."
      },
      {
        "q": "主语换了，反身代词要跟着变吗？",
        "a": "要。he → himself，they → themselves，we → ourselves，而且人称和单复数都要对上。",
        "good": "They built the house themselves.",
        "bad": "They built the house himself."
      }
    ]
  },
  "formal-it": {
    "summary": "长主语先挪到句尾，句首用 it 占位；形式宾语也是同理。",
    "items": [
      {
        "q": "To master a language is important 和 It is important to master a language 哪个好？",
        "a": "意思一样，但英语忌头重脚轻，考试和写作优先用 it 形式主语。检验方法：去掉 it，把 to do 或 that 从句放回句首，句子仍成立，就说明 it 只是占位。",
        "good": "It is important to master a foreign language.",
        "bad": "To master a foreign language are important."
      },
      {
        "q": "it 作形式宾语什么时候必须用？",
        "a": "宾语是不定式或从句，后面还有宾语补足语时，必须先用 it 占位：find/think/make/consider + it + 形容词或名词 + to do/that...。不能说 I find to learn English hard.。",
        "good": "I find it hard to get up early in winter.",
        "bad": "I find to get up early in winter hard."
      },
      {
        "q": "It is...that 有时是强调句，怎么和形式主语区分？",
        "a": "去掉 It is 和 that，剩下的词能组成完整句子就是强调句；剩下不成句、that 从句完整的是形式主语。如 It was Tom that broke the window. 去掉后成句；It is clear that he lied. 去掉后不成句。"
      }
    ]
  },
  "it-takes": {
    "summary": "It takes sb + 时间 + to do；主语是 it，真正的事放在后面。",
    "items": [
      {
        "q": "It took me two hours to finish 还是 finishing？",
        "a": "固定句型 It takes sb some time to do sth，to 不能省，也不能换成 doing。提问用 How long does it take you to...?。记住顺序：it + take + 人 + 时间 + to do。",
        "good": "It took me two hours to finish the report.",
        "bad": "It took me two hours finishing the report."
      },
      {
        "q": "spend、take、cost 三个怎么换？",
        "a": "人作主语用 spend：sb spends time/money on sth 或 (in) doing；it 作主语用 take：It takes sb time to do；物作主语用 cost：sth costs sb money。先看主语是人、it 还是物。",
        "good": "She spent three hours preparing the report.",
        "bad": "She took three hours to preparing the report."
      },
      {
        "q": "It takes 后面能不能直接接人再跟时间？",
        "a": "可以，顺序就是 take + 人 + 时间 + to do，例如 It took him three days to repair the bike.。不要把时间提到人前面说 take three days him，也不要丢了句末的 to do。",
        "good": "It took him three days to repair the old bike.",
        "bad": "It took three days him to repair the old bike."
      }
    ]
  },
  "it-no-use": {
    "summary": "It is no use / no good doing 是固定搭配，后面只接动名词。",
    "items": [
      {
        "q": "It is no use 后面能接 to do 吗？",
        "a": "标准句型是 It is no use doing sth，use 在这里是名词，后面接动名词。同类还有 It is no good doing、There is no point in doing。考试和写作统一按 doing 填。",
        "good": "It is no use crying over spilt milk.",
        "bad": "It is no use to crying over spilt milk."
      },
      {
        "q": "no use 和 useless 要怎么选？",
        "a": "It is no use doing 是固定句型，use 是名词；useless 是形容词，后面可接 to do 或 doing。遇到空格前是 no use，就填 doing；遇到 is useless，再按后面给的结构判断。",
        "good": "It is useless to argue with him about it.",
        "bad": "It is no use argue with him about it."
      },
      {
        "q": "这个句型怎么改成主动说法？",
        "a": "可换成 What's the use of doing...? 或 There is no point in doing...，介词 of/in 后面仍然用动名词。改写时只换外壳，doing 不变。",
        "good": "What's the use of arguing with him?",
        "bad": "What's the use of argue with him?"
      }
    ]
  },
  "it-is-said": {
    "summary": "It is said that 可改成 sb is said to do，注意不定式的先后。",
    "items": [
      {
        "q": "It is said that he has moved abroad 怎么改成简单句？",
        "a": "把从句主语提上来：He is said to have moved abroad.。从句动作先于“据说”，用 to have done；同时发生用 to do；正在进行用 to be doing。先比两个动作的先后，再定形式。",
        "good": "He is said to have moved abroad last year.",
        "bad": "He is said to moved abroad last year."
      },
      {
        "q": "It is reported / believed / thought 用法一样吗？",
        "a": "一样，都是 It is + 过去分词 + that...；said、reported、believed、thought 常转成 sb/sth is + 过去分词 + to do。hoped 转个人主语少见，优先用 it 句型；不能说 It is said him to...。",
        "good": "The company is reported to be planning a new factory.",
        "bad": "It is reported the company to be planning a new factory."
      },
      {
        "q": "There is said to be 这种写法对吗？",
        "a": "对。它来自 It is said that there is...，there be 结构原样保留，只把 is 提到 said 后面。不能说 There is said that...，这是把两种句型混在一起；there 只能保留在 to be 后面。",
        "good": "There is said to be a secret tunnel under the castle.",
        "bad": "There is said that a secret tunnel lies under the castle."
      }
    ]
  },
  "articles": {
    "summary": "冠词看特指还是泛指、可数还是不可数，抽象活动常零冠词。",
    "items": [
      {
        "q": "go to school 和 go to the school 差在哪？",
        "a": "不加冠词指“上学”这个活动，加 the 指“那所学校”这个地点。同类 go to bed/hospital/church 零冠词表用途；如果说去学校接孩子、参观校舍，就要用 the。先判断说的是活动还是建筑。"
      },
      {
        "q": "play piano 前面要不要加 the？",
        "a": "乐器前加 the：play the piano、play the violin；球类、棋类前不加：play football、play chess。判断先看是乐器还是运动项目。",
        "good": "She has played the piano since she was six.",
        "bad": "She has played a piano since she was six."
      },
      {
        "q": "最高级前一定要 the 吗？",
        "a": "通常加，但副词最高级可省：He runs fastest.；名词前有物主代词或所有格时不加：my best friend。看最高级修饰的是名词还是副词，再看前面有没有别的限定词。",
        "good": "This is the most interesting book I have ever read.",
        "bad": "This is most interesting book I have ever read."
      }
    ]
  },
  "prepositions": {
    "summary": "时间按 in/on/at 从长到短，地点按 in/at 从大到小。",
    "items": [
      {
        "q": "in the morning 为什么到 Monday morning 就变成 on？",
        "a": "at 指时刻，on 指具体某天或某天的上下午，in 指较长时段。Monday morning 被限定到具体一天，所以用 on；单独说 morning 用 in。口诀：越长越用 in，越具体越用 on/at。",
        "good": "We will meet on Monday morning at nine.",
        "bad": "We will meet in Monday morning at nine."
      },
      {
        "q": "arrive in 和 arrive at 怎么选？",
        "a": "arrive 是不及物动词，必须带介词：大地方（城市、国家）用 in，小地方（车站、机场、学校）用 at。reach 是及物动词，直接接宾语，不加介词；arrive 不能直接接宾语。",
        "good": "We arrived at the airport two hours early.",
        "bad": "We arrived the airport two hours early."
      },
      {
        "q": "since 和 for 后面分别接什么？",
        "a": "since 接时间点：since 2010、since he left；for 接时间段：for three years。两者都常与完成时连用。看到具体年份、日期用 since，看到 a week、two months 这类长度用 for。",
        "good": "I have worked here for five years.",
        "bad": "I have worked here since five years."
      }
    ]
  },
  "pronoun-types": {
    "summary": "it 指同一物，one 指同类任一个，that 指同类且常带定语。",
    "items": [
      {
        "q": "it、one、that 都能代替前面名词，怎么分？",
        "a": "it 是同一个东西；one 是同类中的另一个，相当于 a/an + 名词；that 是同类但特指，常跟 of 或后置定语，多用于单数或不可数。例 The weather here is colder than that in Beijing。",
        "good": "The weather here is colder than that in Beijing.",
        "bad": "The weather here is colder than it in Beijing."
      },
      {
        "q": "none 和 neither 怎么选？",
        "a": "neither 只用于两者，谓语通常用单数；none 用于三者及以上或不可数，none of 后谓语可单可复。回答 How many...? 用 none，回答 Which of the two...? 用 neither。",
        "good": "Neither of the two answers is correct.",
        "bad": "Neither of the three answers is correct."
      },
      {
        "q": "somebody 和 anybody 在疑问句里怎么用？",
        "a": "一般疑问句和否定句用 anybody；但表示请求、邀请或期待对方答应时用 somebody。Would you like something to drink? 就是期待肯定回答。先判断句子是不是真在提问。"
      }
    ]
  },
  "perfect-tense": {
    "summary": "有明确过去时间用过去时，强调对现在的影响或持续用完成时。",
    "items": [
      {
        "q": "I have seen him yesterday 为什么错？",
        "a": "yesterday 是明确过去时间，和现在完成时不相容，要用一般过去时 saw。判断：句中有 ago、yesterday、last week、in 2020 就选过去时；有 already、yet、ever、since、for 才考虑完成时。",
        "good": "I saw him at the library yesterday.",
        "bad": "I have seen him at the library yesterday."
      },
      {
        "q": "since 从句该用过去时还是完成时？",
        "a": "主句用现在完成时，since 从句一般用一般过去时：I have lived here since I moved to Beijing.。从句动作如果一直持续到现在，也可用现在完成时。先看主句是不是完成时，再定从句。",
        "good": "I have lived here since I moved to Beijing.",
        "bad": "I have lived here since I have moved to Beijing."
      },
      {
        "q": "have been to 和 have gone to 差在哪？",
        "a": "have been to 表示去过已回来，可与 I/you 连用；have gone to 表示去了还没回来，通常不用第一、二人称。说“去过两次”用 have been to，说“人去楼空”用 have gone to。",
        "good": "He has been to Beijing twice.",
        "bad": "He has gone to Beijing twice."
      }
    ]
  },
  "progressive-tense": {
    "summary": "进行时强调此刻、暂时和反复，状态动词一般不用进行时。",
    "items": [
      {
        "q": "进行时能表示将来吗？",
        "a": "能，但限于已经安排好的动作，常带时间状语：I'm leaving for Shanghai tomorrow.。临时决定用 will，事先计划可用 be doing 或 be going to。没有安排就不能硬用进行时表将来。",
        "good": "I'm leaving for Shanghai tomorrow morning.",
        "bad": "I'm knowing the answer tomorrow morning."
      },
      {
        "q": "always 加进行时是什么味道？",
        "a": "表示抱怨、厌烦或赞叹，带感情色彩：He is always losing his keys. 比 He always loses his keys. 更强调不满。看到 always、constantly 加进行时，先想“说话人在吐槽”。",
        "good": "He is always losing his keys.",
        "bad": "He is always lose his keys."
      },
      {
        "q": "know、belong 这些词能加 ing 吗？",
        "a": "表示状态时一般不用进行时：I know the answer. 不说 I am knowing.。但表示临时变化或强调时，口语里可用 I'm loving this song.。考试遇到 know、belong、contain，优先用一般时。",
        "good": "This dictionary belongs to my sister.",
        "bad": "This dictionary is belonging to my sister."
      }
    ]
  },
  "future-tense": {
    "summary": "will 偏临时和预测，be going to 偏计划和迹象，从句用现在时表将来。",
    "items": [
      {
        "q": "will 和 be going to 考试选哪个？",
        "a": "临时决定、单纯预测、承诺用 will；事先计划、有明显迹象用 be going to。看语境有没有“已经打算好”或“现在看得见”。没有把握时，书面预测多用 will。"
      },
      {
        "q": "时间状语从句里能写 will 吗？",
        "a": "不能，主将从现：When he comes, I will tell him.。if 条件句同理。但宾语从句不受限制：I don't know if he will come.。先判断从句是时间/条件状语还是宾语。",
        "good": "When he comes, I will tell him the news.",
        "bad": "When he will come, I will tell him the news."
      },
      {
        "q": "will be doing 和 will have done 怎么用？",
        "a": "will be doing 指将来某时正在进行；will have done 指到将来某时已经完成，常带 by then、by 2027。看到 by + 将来时间，优先考虑将来完成时。",
        "good": "By the end of next month, we will have finished the project.",
        "bad": "By the end of next month, we will have finish the project."
      }
    ]
  },
  "used-to": {
    "summary": "过去常做、习惯于、被用来，三种结构靠 be 和 to 后形式区分。",
    "items": [
      {
        "q": "used to、be used to、be used to do 三个怎么一眼分？",
        "a": "看 used 前有没有 be。没有 be，used to do 是“过去常常”；有 be，to 后是 doing 或名词就是“习惯于”；有 be 且 to do，是被动“被用来做”。先找 be，再看 to 后面。",
        "good": "I used to walk to school when I was young.",
        "bad": "I am used to walk to school when I was young."
      },
      {
        "q": "be used to 后面接 doing 还是 do？",
        "a": "这里 to 是介词，后接名词或动名词：be used to getting up early。区分：Wood is used to make paper. 中 to make 是不定式，属被动“被用来”。看主语是“人习惯”还是“物被用”。",
        "good": "She is used to getting up early.",
        "bad": "She is used to get up early."
      },
      {
        "q": "used to 的否定和疑问怎么写？",
        "a": "否定用 didn't use to 或 used not to；疑问用 Did you use to...? 更常见。注意否定和疑问里写 use，不写 used。看到 did 就还原成 use。",
        "good": "I didn't use to like coffee.",
        "bad": "I didn't used to like coffee."
      }
    ]
  },
  "be-to-do": {
    "summary": "be to do 表示已定安排、命令或注定，比 be going to 正式。",
    "items": [
      {
        "q": "be to do 到底表示什么？",
        "a": "常见四种：计划安排（The meeting is to be held on Friday.）、命令（You are to wait here.）、禁止（not to do）、注定（He was to become a doctor.）。看语境是“已定好”还是“被要求”。",
        "good": "The meeting is to be held on Friday morning.",
        "bad": "The meeting is to hold on Friday morning."
      },
      {
        "q": "be to do 的被动和否定怎么写？",
        "a": "否定是 be not to do；被动是 be to be done。The report is to be finished by Friday.。先把 be 变否定或保留，再把主动的 do 改成 be done。",
        "good": "The report is to be finished by Friday.",
        "bad": "The report is to finish by Friday."
      },
      {
        "q": "were to do 为什么出现在 if 从句里？",
        "a": "虚拟条件句用 were to do 表示对将来的假设，比 should do 更正式：If he were to come, we would start at once.。看到 if + were to，就按虚拟语气配 would/could/might。",
        "good": "If he were to come, we would start at once.",
        "bad": "If he was to come, we will start at once."
      }
    ]
  },
  "passive-basic": {
    "summary": "被动＝be + 过去分词，be 随时态变，只有及物结构才有被动。",
    "items": [
      {
        "q": "被动语态到底怎么变？",
        "a": "两步：把原宾语提到句首作主语；动词改成 be + 过去分词，be 的时态跟原句一致，原主语放到 by 后且可省略。先找宾语，再定时态，最后检查过去分词。",
        "good": "The letter was written by Tom.",
        "bad": "The letter was wrote by Tom."
      },
      {
        "q": "带双宾语的句子怎么变被动？",
        "a": "两种都行：间接宾语作主语最常见（He was given a book.）；直接宾语作主语时，间接宾语前补 to 或 for（A book was given to him.）。buy、make 这类“替谁做”用 for。",
        "good": "He was given a book on his birthday.",
        "bad": "He was given to a book on his birthday."
      },
      {
        "q": "不及物动词能变被动吗？",
        "a": "单独的不及物动词不能，happen、appear、arrive 都没有被动。但“不及物动词 + 介词”构成的及物短语可以：The baby was looked after by grandma.。先看动词能不能带宾语。",
        "good": "The baby was looked after by grandma.",
        "bad": "The accident was happened last night."
      }
    ]
  },
  "passive-modal": {
    "summary": "情态动词 + be + 过去分词：情态动词后面永远是 be，不能写 been / being。",
    "items": [
      {
        "q": "情态动词的被动怎么写？",
        "a": "must / should / can / may + be + 过去分词，be 不能再变形。",
        "good": "The report must be submitted before Friday.",
        "bad": "The report must been submitted before Friday."
      },
      {
        "q": "两个情态动词能连用吗？",
        "a": "不能。要表达“将会能够”，换成 will be able to；要表达“必须能够”，用 have to be able to。",
        "good": "He will be able to finish it tomorrow.",
        "bad": "He will can finish it tomorrow."
      },
      {
        "q": "被动里的 by 什么时候省略？",
        "a": "执行者不知道、不重要或显而易见时就省略；需要强调“是谁做的”才保留。",
        "good": "The bridge was built in 1990.",
        "bad": "The bridge was built by someone in 1990 by people."
      }
    ]
  },
  "active-passive": {
    "summary": "sell、wash 等与 well/easily 连用时，主动形式表被动。",
    "items": [
      {
        "q": "This book sells well 为什么不用 is sold？",
        "a": "这类动词与 well、easily、smoothly 等副词连用时，主动形式表被动意义，说明主语本身的属性：The cloth washes easily.、The pen writes smoothly.。加了 well 再说 is sold well 就重复且错误。",
        "good": "This book sells well among teenagers.",
        "bad": "This book is sold well among teenagers."
      },
      {
        "q": "哪些动词常这样用？",
        "a": "常见 sell、wash、clean、wear、read、write、cut、lock、translate、open、close。判断：主语是物，后面跟副词，句子说“好卖、好洗、好写”。不跟副词时通常仍用被动。",
        "good": "This kind of cloth washes easily.",
        "bad": "This kind of cloth washes easy."
      },
      {
        "q": "The door opened 是被动吗？",
        "a": "不是。open 这里是不及物动词，主动表被动，强调门自己开了；若说 The door was opened by Tom，才是有施动者的被动。看有没有 by 短语和主语是不是施动者。"
      }
    ]
  },
  "get-passive": {
    "summary": "get + 过去分词是口语被动，强调动作、变化或意外遭遇。",
    "items": [
      {
        "q": "get hurt 和 be hurt 有什么不同？",
        "a": "意思接近，get 更口语，强调“遭遇/发生变化”这个动作；be 强调状态。get 被动常出现在意外、不利或状态变化的事：get hurt、get lost、get fired、get married。正式书面语多用 be。",
        "good": "He got hurt in the accident.",
        "bad": "He got hurted in the accident."
      },
      {
        "q": "get 被动后面能加 by 吗？",
        "a": "语法上可以，但 get 被动多不强调施动者，所以 by 短语较少见。需要说明谁做的，用 be 被动更自然。看到 get + 过去分词，先按“遭遇了什么”理解。"
      },
      {
        "q": "get dressed 也是被动吗？",
        "a": "是 get + 过去分词结构，但已固定表示“穿好衣服”，类似 get changed、get started、get prepared。这类短语要整体记，不要拆成“被穿”。",
        "good": "She got dressed and went downstairs.",
        "bad": "She got dress and went downstairs."
      }
    ]
  },
  "have-sth-done": {
    "summary": "have sth done 表示请别人做，也可表示遭遇不幸或已完成。",
    "items": [
      {
        "q": "I had my hair cut 是我自己剪的吗？",
        "a": "不是。have sth done 是使役被动，主语不执行动作，而是让别人做：I had my car repaired. 等于我请人修了车。要自己动手，说 I cut my hair myself.。",
        "good": "I had my car repaired yesterday.",
        "bad": "I had my car repair yesterday."
      },
      {
        "q": "have sth done 还有别的意思吗？",
        "a": "三种：请人做（have the room painted）、遭遇不幸（He had his wallet stolen.）、完成（I'll have the report finished by noon.）。看主语是受益、受害还是做事的人。"
      },
      {
        "q": "have sth done 和 get sth done 有什么区别？",
        "a": "意思基本相同，get 更口语、更强调结果；have 更中性。两者都表示让别人完成某事。考试写作里 have sth done 更稳。",
        "good": "We got the broken window replaced the same day.",
        "bad": "We got the broken window replace the same day."
      }
    ]
  },
  "make-let-do": {
    "summary": "make/let/have 主动省 to；make 变被动时要还原 to。",
    "items": [
      {
        "q": "make me clean 还是 make me to clean？",
        "a": "主动语态中 make、let、have 后接宾语 + 动词原形，省 to。变被动时 make 要还原 to：I was made to clean the room.；let 被动常用 be allowed to。先看主动还是被动。",
        "good": "My mother made me clean my room.",
        "bad": "My mother made me to clean my room."
      },
      {
        "q": "help 后面加不加 to？",
        "a": "加不加都行：help me (to) carry the box。但 help 不属于必须省 to 的使役动词，不能拿 make 的规则硬套。看到 help，两种形式都算对。",
        "good": "Could you help me carry this box?",
        "bad": "Could you help me carrying this box?"
      },
      {
        "q": "have sb do 和 get sb to do 怎么选？",
        "a": "have sb do 省 to，get sb to do 带 to，意思都是“让某人做”。get 更口语，还可表示“说服”。先看动词是 have 还是 get，再决定 to 的有无。",
        "good": "I got him to help me with the report.",
        "bad": "I got him help me with the report."
      }
    ]
  },
  "modal-basic": {
    "summary": "情态动词后接原形，按必须、能够、可能、应该四类记语义。",
    "items": [
      {
        "q": "must 和 have to 怎么选？",
        "a": "must 偏主观“我认为必须”，只有现在时；have to 偏客观“外界要求”，有时态变化（had to、will have to）。否定意思不同：mustn't 是禁止，don't have to 是不必。",
        "good": "She must finish her homework before dinner.",
        "bad": "She must to finish her homework before dinner."
      },
      {
        "q": "can 和 be able to 有什么区别？",
        "a": "can 只有现在和过去（could），不能与其他助动词连用；be able to 可用于各种时态，且 was/were able to 常表示“成功做到”。看到 will、have 后面，只能用 be able to。",
        "good": "He was able to escape from the burning building.",
        "bad": "He could escaped from the burning building."
      },
      {
        "q": "may 和 might 表可能谁更弱？",
        "a": "might 语气更弱、更不确定；may 较正式。推测过去用 may/might have done。看到“也许、可能”且把握不大，优先 might。",
        "good": "She might be at home now, but I'm not sure.",
        "bad": "She might is at home now, but I'm not sure."
      }
    ]
  },
  "modal-perfect": {
    "summary": "情态动词 + have done 都说过去：must 肯定推测，should 本该。",
    "items": [
      {
        "q": "must have done 和 should have done 怎么分？",
        "a": "must have done 是对过去的肯定推测“一定做过”；should have done 是“本该做却没做”，含责备。看句子要推测还是评理。要推测用 must，要批评用 should。",
        "good": "You should have told me earlier.",
        "bad": "You should told me earlier."
      },
      {
        "q": "can't have done 和 needn't have done 呢？",
        "a": "can't have done 表示“不可能做过”，是对过去的否定推测；needn't have done 表示“本不必做却做了”。前者否定推测，后者承认已做。",
        "good": "You needn't have bought so much food for the party.",
        "bad": "You needn't have buy so much food for the party."
      },
      {
        "q": "might have done 有几种意思？",
        "a": "两种：对过去的不确定推测“可能做过”；在虚拟语气中表示“本来可能”。看后面有没有 but、otherwise 这类转折，有就是虚拟。",
        "good": "He might have missed the train, or he may simply be late.",
        "bad": "He might has missed the train, or he may simply be late."
      }
    ]
  },
  "modal-advanced": {
    "summary": "need/dare 可情态可实义；had better 后直接跟动词原形。",
    "items": [
      {
        "q": "need 什么时候不加 to？",
        "a": "作情态动词时多用于否定和疑问，后接原形、无 do：You needn't worry.、Need I go?；作实义动词时要 to do，并借 do 提问：You don't need to worry.。看有没有 do 和 to。",
        "good": "You needn't worry about the exam.",
        "bad": "You needn't to worry about the exam."
      },
      {
        "q": "dare 后面加 to 吗？",
        "a": "情态动词 dare 用于否定、疑问，后接原形：He dare not say it.；实义动词 dare 常接 to do：He doesn't dare to say it.。判断看有没有 do 助动词：有 doesn't/didn't 就按实义动词，接 to do 最稳。",
        "good": "He dare not say it in public.",
        "bad": "He dare not to say it in public."
      },
      {
        "q": "had better 后面能加 to 吗？",
        "a": "不能，had better do sth；否定是 had better not do。它不是过去时，指现在或将来。看到 had better，后面直接上动词原形。",
        "good": "You had better see a doctor at once.",
        "bad": "You had better to see a doctor at once."
      }
    ]
  },
  "gerund-subject": {
    "summary": "动名词作主语谓语用单数；只接 doing 的动词要成组记。",
    "items": [
      {
        "q": "Reading books 作主语，谓语用单数还是复数？",
        "a": "单个动名词或动名词短语作主语，谓语用单数：Reading books is helpful.；两个并列动名词指两件事时用复数：Reading and writing are basic skills.。看主语是一件事还是两件事。",
        "good": "Reading books is helpful for improving your writing.",
        "bad": "Reading books are helpful for improving your writing."
      },
      {
        "q": "哪些动词后面只能接 doing？",
        "a": "常见 enjoy、mind、finish、avoid、practise、suggest、consider、imagine、keep。记法：这些动作都指向“已经在做或设想做”。遇到它们，先把 to do 排除。",
        "good": "She enjoys listening to music after class.",
        "bad": "She enjoys to listen to music after class."
      },
      {
        "q": "remember doing 和 remember to do 怎么分？",
        "a": "doing 表示动作已发生，即“记得做过”；to do 表示动作还没做，即“记得去做”。同类 forget、regret、stop、try 都用这个先后判断。"
      }
    ]
  },
  "participle-attribute": {
    "summary": "分词作定语看主动被动：doing 主动进行，done 被动完成。",
    "items": [
      {
        "q": "developing country 和 developed country 为什么意思差很多？",
        "a": "developing 表示“正在发展”，developed 表示“已经发展”，前者主动进行，后者被动完成。判断名词与动词的关系：动作还在进行用 doing，动作已完成或被动用 done。"
      },
      {
        "q": "分词作定语放名词前还是后？",
        "a": "单个分词放前：a sleeping baby、a broken window；分词短语放后：the man standing at the door、the book written by Lu Xun。先看是一个词还是一个短语。",
        "good": "The man standing at the door is my uncle.",
        "bad": "The man stand at the door is my uncle."
      },
      {
        "q": "boiling water 和 boiled water 怎么选？",
        "a": "boiling water 是正在沸腾的水；boiled water 是烧开过的水，可能已经凉了。看动作是否正在进行：正在冒泡用 boiling，烧开过用 boiled。"
      }
    ]
  },
  "participle-phrase": {
    "summary": "分词短语的逻辑主语必须与主句主语一致，否则就是悬垂。",
    "items": [
      {
        "q": "Walking down the street, the flowers looked beautiful 错在哪？",
        "a": "分词 walking 的逻辑主语应该是主句主语，但 flowers 不会 walk，形成悬垂分词。改成 Walking down the street, I found the flowers beautiful.。判断方法：把主句主语放进分词前，看能不能说通。",
        "good": "Walking down the street, I found the flowers beautiful.",
        "bad": "Walking down the street, the flowers looked beautiful."
      },
      {
        "q": "句中用 doing 还是 done 怎么判断？",
        "a": "看主句主语和分词动词是主动还是被动：主动、进行用 doing；被动、完成用 done。Seen from the hill, the city looks beautiful. 中城市是“被看”，所以用 seen。",
        "good": "Seen from the hill, the city looks beautiful.",
        "bad": "Seeing from the hill, the city looks beautiful."
      },
      {
        "q": "分词短语能表示哪些关系？",
        "a": "时间、原因、条件、让步、伴随、结果都可以。判断时把它还原成状语从句：Having finished his work, he went home. 等于 After he had finished his work, he went home.。",
        "good": "Having finished his work, he went home.",
        "bad": "Finished his work, he went home."
      }
    ]
  },
  "participle-adverbial": {
    "summary": "分词作状语，逻辑主语必须和主句主语一致；主动用 doing，被动用 done。",
    "items": [
      {
        "q": "doing 和 done 怎么选？",
        "a": "看主句主语：主语主动做这个动作 → doing；主语被这个动作作用 → done。",
        "good": "Seen from the hill, the town looks small.",
        "bad": "Seeing from the hill, the town looks small."
      },
      {
        "q": "逻辑主语对不上怎么办？",
        "a": "不能硬用分词，要改成状语从句，或者用 with 复合结构把主语补出来。",
        "good": "When the work was finished, we went home.",
        "bad": "Finishing the work, the machine broke down."
      },
      {
        "q": "having done 什么时候用？",
        "a": "分词动作发生在主句谓语之前时用，强调先后顺序。",
        "good": "Having finished his homework, he went out to play.",
        "bad": "Finishing his homework yesterday, he went out to play tomorrow."
      }
    ]
  },
  "infinitive-purpose": {
    "summary": "to do 可表目的，也可在名词后作定语；否定用 in order not to。",
    "items": [
      {
        "q": "表目的用 to do 还是 for doing？",
        "a": "to do 表目的“为了做”；for + 名词或动名词表用途、对象：This knife is for cutting bread.。说“为了通过考试”通常用 to pass the exam，不用 for passing 表目的。先看是目的还是用途。",
        "good": "I went to the station to meet her.",
        "bad": "I went to the station for meet her."
      },
      {
        "q": "不定式作定语放在名词后有什么条件？",
        "a": "名词与不定式常有动宾或介宾关系：something to eat（eat something）、a chance to go、a pen to write with（write with a pen）。没有这种关系就不能硬套。先还原成句子验证。",
        "good": "I have something important to eat.",
        "bad": "I have something important eat."
      },
      {
        "q": "in order to 和 so as to 有什么区别？",
        "a": "都表目的，in order to 可放句首，so as to 一般不放在句首；否定分别是 in order not to、so as not to。放句首时优先 in order to。"
      }
    ]
  },
  "only-to": {
    "summary": "only to do 表示出乎意料的、常令人失望的结果，不是目的。",
    "items": [
      {
        "q": "only to do 到底是什么意思？",
        "a": "表示“结果却……”，强调结果出人意料，常带失望色彩：He hurried to the station, only to find the train had left.。不是“只为了做”。看到 only to 先找前面的动作和后面的反转。",
        "good": "He hurried to the station, only to find the train had left.",
        "bad": "He hurried to the station, only to finding the train had left."
      },
      {
        "q": "only doing 和 only to do 怎么分？",
        "a": "only doing 表示自然产生的结果或伴随状态；only to do 强调意外、转折的结果。看前后是不是“没想到”。有转折意味用 only to do。"
      },
      {
        "q": "only to 前面一定要逗号吗？",
        "a": "通常用逗号把结果状语和主句隔开，避免与“only + 不定式”表目的混淆。没有逗号时句子容易读成“仅仅为了做”，意思就变了。"
      }
    ]
  },
  "perception-verb": {
    "summary": "感官动词后 do 表全过程、doing 表正在进行、done 表被动。",
    "items": [
      {
        "q": "see him cross 和 see him crossing 差在哪？",
        "a": "do 强调看见动作全过程或事实；doing 强调看见动作正在进行的一个片段。看到“从开始到结束”用 do，看到“正做到一半”用 doing。",
        "good": "I saw him cross the street and enter the bank.",
        "bad": "I saw him to cross the street and enter the bank."
      },
      {
        "q": "感官动词变被动后 to 要不要加回来？",
        "a": "要。主动省 to，被动还原：He was seen to enter the room.。判断：句子是不是被动，被动就补 to。see、hear、watch、notice 都遵循这条。",
        "good": "He was seen to enter the room at midnight.",
        "bad": "He was seen enter the room at midnight."
      },
      {
        "q": "see sth done 表示什么？",
        "a": "宾语和分词是被动关系：I saw the window broken. 表示看见窗户被打破。宾语自己不做动作、而是承受动作，就用 done。",
        "good": "I saw the window broken by the ball.",
        "bad": "I saw the window breaking by the ball."
      }
    ]
  },
  "nonfinite-advanced": {
    "summary": "非谓语看先后和主被动：having done 先发生，being done 正在被。",
    "items": [
      {
        "q": "Having finished 和 Finishing 作状语有什么不同？",
        "a": "having done 明确表示该动作先于主句发生；doing 常表示与主句同时或几乎同时。先发生的动作用 having done，同时进行的用 doing。",
        "good": "Having finished his homework, he went out to play.",
        "bad": "Finish his homework, he went out to play."
      },
      {
        "q": "being done 和 done 怎么选？",
        "a": "being done 表示“正在被”，与主句同时；done 表示“已经被”，先于主句或表状态。看动作是正在进行还是已经完成。"
      },
      {
        "q": "having been done 什么时候用？",
        "a": "动作既先于主句、又与主语是被动关系时：Having been warned many times, he still made the same mistake.。两个条件同时满足才用，缺一个就换 having done 或 done。",
        "good": "Having been warned many times, he still made the same mistake.",
        "bad": "Having warned many times, he still made the same mistake."
      }
    ]
  },
  "have-difficulty": {
    "summary": "have difficulty (in) doing 是固定搭配，difficulty 后接动名词。",
    "items": [
      {
        "q": "have difficulty 后面接 to do 还是 doing？",
        "a": "接 doing，in 可省略：have difficulty (in) understanding。difficulty 是名词，后面不能直接跟不定式。看到 have difficulty，先把 to 排除。",
        "good": "I have difficulty understanding spoken English.",
        "bad": "I have difficulty to understand spoken English."
      },
      {
        "q": "difficulty 用单数还是复数？",
        "a": "泛指“困难”时不可数，用 difficulty；指具体一件件难题时用 difficulties。句型 have difficulty doing 中通常用单数。看是抽象困难还是具体难题。",
        "good": "She had little difficulty finding the address.",
        "bad": "She had little difficulties finding the address."
      },
      {
        "q": "类似结构还有哪些？",
        "a": "have trouble (in) doing、have fun doing、have a hard time doing、have problems doing。它们后面都接动名词，可成组记。",
        "good": "We had fun playing football after school.",
        "bad": "We had fun to play football after school."
      }
    ]
  },
  "spend-time": {
    "summary": "spend 的主语是人，后接时间或钱 + (in) doing / on sth。",
    "items": [
      {
        "q": "spend time 后面接 doing 还是 to do？",
        "a": "接 doing，介词 in 可省：spend two hours (in) reading。不能接 to do。判断：spend 后是时间或钱，后面表示做的事就用动名词。",
        "good": "She spends two hours reading every day.",
        "bad": "She spends two hours to read every day."
      },
      {
        "q": "spend 和 take 怎么互相改写？",
        "a": "sb spends time (in) doing sth 等于 It takes sb time to do sth。主语不同：spend 用人，take 用 it；后面一个接 doing，一个接 to do。改写时两种形式一起换。",
        "good": "It takes her two hours to read every day.",
        "bad": "It spends her two hours to read every day."
      },
      {
        "q": "cost 的主语是什么？",
        "a": "cost 用物作主语：sth costs sb money；人不能作 cost 的主语。花钱的主语是人时用 spend。先看主语是人还是物。",
        "good": "The ticket cost me fifty yuan.",
        "bad": "I cost fifty yuan for the ticket."
      }
    ]
  },
  "prefer-to": {
    "summary": "prefer A to B 的 to 是介词，后接名词或 doing，不接原形。",
    "items": [
      {
        "q": "prefer A to B 的 to 后面能接 do 吗？",
        "a": "不能，to 是介词，后接名词或动名词：I prefer reading to watching TV.。要接不定式就用 prefer to do rather than do。先看 to 前后是不是对等的名词性成分。",
        "good": "I prefer reading to watching TV.",
        "bad": "I prefer reading to watch TV."
      },
      {
        "q": "prefer to do rather than 后面接什么？",
        "a": "接动词原形：prefer to stay at home rather than go out。rather than 后省 to，和前面的 to do 形成对比。不要把 rather than 后面也写成 to do。"
      },
      {
        "q": "prefer A to B 和 like A better than B 能互换吗？",
        "a": "意思相同，但 prefer 更正式；like 后接名词或 doing，than 后保持一致形式。改写时把 to 换成 than，前面加 better。",
        "good": "She likes tea better than coffee.",
        "bad": "She likes tea better to coffee."
      }
    ]
  },
  "be-about-to": {
    "summary": "be about to do 表示马上，一般不与具体将来时间状语连用。",
    "items": [
      {
        "q": "be about to 能和 tomorrow 一起用吗？",
        "a": "一般不能。be about to 表示眼下的即刻将来，和 tomorrow、next week 这类具体时间状语冲突；要说计划用 be going to。看到 about to，就不要再加具体将来时间。",
        "good": "We are about to start the meeting.",
        "bad": "We are about to start the meeting tomorrow morning."
      },
      {
        "q": "be about to do 和 be going to do 怎么选？",
        "a": "about to 表示几分钟内就发生；going to 表示有计划或已有迹象，时间可远可近。看事情是不是“立刻、马上”。",
        "good": "The train is about to leave, so hurry up.",
        "bad": "The train is about to leave next Monday, so hurry up."
      },
      {
        "q": "be about to ... when 是什么句型？",
        "a": "表示“正要……这时……”，when 从句用一般过去时：We were about to leave when it began to rain.。when 前面用逗号隔开，主句常用过去时。",
        "good": "We were about to leave when it began to rain.",
        "bad": "We were about to leave when it begins to rain."
      }
    ]
  },
  "too-enough": {
    "summary": "too...to 本身含否定；enough 修饰形容词放后，修饰名词放前。",
    "items": [
      {
        "q": "too...to 结构还要不要再加 not？",
        "a": "不用。too...to do 本身表示“太……以致不能”，是否定含义：He is too young to go to school.。要表达肯定用 ... enough to do。看到 too...to，就按“不能”理解。"
      },
      {
        "q": "enough 放形容词前还是后？",
        "a": "修饰形容词、副词时放后面：old enough、quickly enough；修饰名词时放前面：enough money。先看它修饰的是什么词性。",
        "good": "He is old enough to drive a car.",
        "bad": "He is enough old to drive a car."
      },
      {
        "q": "too...to 怎么改成 so...that？",
        "a": "too + 形容词 + to do 改成 so + 形容词 + that + 否定句：He is too tired to walk. 等于 He is so tired that he can't walk.。改写时把 to do 变成 that 从句并加否定。",
        "good": "He is so tired that he can't walk any further.",
        "bad": "He is so tired that he can walk any further."
      }
    ]
  },
  "nothing-but": {
    "summary": "nothing but 是只有，anything but 是绝不是，all but 是几乎。",
    "items": [
      {
        "q": "nothing but 和 anything but 意思一样吗？",
        "a": "相反。nothing but 等于 only；anything but 等于 not at all、far from。He is nothing but a child. 他只是个孩子；He is anything but a child. 他绝不是孩子。看 nothing 还是 anything。"
      },
      {
        "q": "nothing but 后面接 do 还是 to do？",
        "a": "接名词或代词；如果前面有 do，后接动词原形：He did nothing but complain.。不能说 did nothing but to complain。先看 but 前有没有 do。",
        "good": "He did nothing but complain about the food.",
        "bad": "He did nothing but to complain about the food."
      },
      {
        "q": "all but 又是什么意思？",
        "a": "all but 可表示“几乎”（all but impossible），也可表示“除……外全部”。看后面接的是形容词还是名词：接形容词多为“几乎”，接名词多为“除……外都”。"
      }
    ]
  },
  "the-last": {
    "summary": "the last + 名词 + to do 多表示最不可能做，不是最后一个。",
    "items": [
      {
        "q": "the last person to do 是最后一个做的人吗？",
        "a": "多数语境是“最不可能做、最不愿做的人”：He is the last person to tell a lie. 等于他最不可能撒谎。要表达时间顺序上的最后一个，需要上下文明确支持。先看句子有没有评价意味。"
      },
      {
        "q": "the last 后面为什么用 to do？",
        "a": "序数词、最高级、the only、the next 等后面的名词常用不定式作定语：the first to arrive、the only one to help。看到这类限定词，先想 to do。",
        "good": "He was the first to arrive at school.",
        "bad": "He was the first to arrived at school."
      },
      {
        "q": "the last 后面能用 doing 吗？",
        "a": "一般用 to do 表示“要做、能做”；doing 会变成进行或主动修饰，意思不同。考试遇到 the first/last/only + 名词，优先填 to do。"
      }
    ]
  },
  "adjective-postmodifier": {
    "summary": "形容词修饰复合不定代词或 a- 开头词时要后置，enough 修饰形容词也后置。",
    "items": [
      {
        "q": "something important 还是 important something？",
        "a": "复合不定代词 something、anything、nothing、everything 被形容词修饰时，形容词后置：something important、nothing new。先找不定代词，再把形容词往后放。",
        "good": "I have something important to tell you.",
        "bad": "I have important something to tell you."
      },
      {
        "q": "asleep、alive、afraid 能放名词前吗？",
        "a": "这些以 a- 开头的形容词多作表语或后置定语：the baby asleep、the only man alive；不说 an asleep baby。看到 a- 开头形容词，先考虑放系动词后或名词后。",
        "good": "The baby asleep on the sofa is my nephew.",
        "bad": "The asleep baby on the sofa is my nephew."
      },
      {
        "q": "enough 和 else 放在哪？",
        "a": "enough 修饰形容词、副词时后置（good enough）；else 修饰复合不定代词时后置（something else）；若还有形容词，顺序是 something else important。记顺序：不定代词 + else + 形容词。",
        "good": "Is there anything else important to discuss?",
        "bad": "Is there important anything else to discuss?"
      }
    ]
  },
  "five-patterns": {
    "summary": "五种句型只看谓语后面跟了什么；两个名词未必是双宾语，中间能加 be 的才是补语。",
    "items": [
      {
        "q": "give me a book 和 elect him chairman 都是“动词 + 两个名词”，怎么一眼分清？",
        "a": "在两个成分中间插 be：能说成 He is chairman 的是宾补，说不通的是双宾语。再看被动：双宾语可拿间接宾语作主语，宾补只能拿宾语作主语，如 He was elected chairman。也可试换序：能改成 give a book to me 的是双宾语。",
        "good": "They elected him chairman.",
        "bad": "They elected him to chairman."
      },
      {
        "q": "explain、suggest 后面为什么不能接“人 + 物”？",
        "a": "双宾语只对部分动词开放，主要是 give、buy、show、offer、teach、tell 这类“给予/告知”动词。explain、suggest、describe 不在此列，必须用 explain/suggest something to somebody。判断时查词典，别照中文逐字排。",
        "good": "He explained the rule to us.",
        "bad": "He explained us the rule."
      },
      {
        "q": "I am agree with you 错在哪？主语后面为什么不能有两个动词？",
        "a": "agree 是实义动词，只能作谓语，不能作表语；be 后须接名词、形容词或介词短语。一句只能有一个谓语，第二个动作要用 to do、doing 或从句降级。同类错误还有 I am very like it。去掉 be，说 I agree with you. 即可。",
        "good": "I agree with you.",
        "bad": "I am agree with you."
      }
    ]
  },
  "sentence-elements": {
    "summary": "定语答“哪一个”，状语答“何时何地如何”，补语答“怎么样”；位置不是判断标准。",
    "items": [
      {
        "q": "名词后面的介词短语，是定语还是状语？",
        "a": "看它修饰谁。修饰名词、能改写成定语从句的是定语：the girl in red 即 the girl who is in red。修饰动词或整句、能移到句首而意思不变的是状语：in the morning 可提到句首。同一短语位置变，作用也可能变。",
        "good": "The man with a hat is my uncle."
      },
      {
        "q": "表语和宾语怎么区分？",
        "a": "看前面的动词。be 以及 become、seem、look、feel、taste、sound、remain 这类系动词后面是表语，说明主语是什么或怎么样；及物动词后面才是宾语，是动作的承受者。另一个参照是语态：宾语一般能提成被动句的主语，表语不能。",
        "good": "The soup tastes good.",
        "bad": "The soup tastes well."
      },
      {
        "q": "宾语补足语删掉句子也成立，为什么还非有不可？",
        "a": "补语删掉后语法上不缺成分，但意思残缺：They made him 没说完，他到底怎么了。而且补语和宾语之间有逻辑上的主谓或主表关系，him 和 happy 可以说成 He is happy。宾语只是动作的对象，补语是对这个对象的说明，两者分工不同，别把补语当成第二个宾语。",
        "good": "The news made him happy."
      }
    ]
  },
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
  "non-restrictive": {
    "summary": "非限制性定语从句用逗号隔开，只补充信息，不能用 that；which 还能指代前面整句话。",
    "items": [
      {
        "q": "非限制性从句能用 that 吗？",
        "a": "不能。有逗号时只能用 which / who / whom / whose。",
        "good": "The book, which came out last year, sold well.",
        "bad": "The book, that came out last year, sold well."
      },
      {
        "q": "which 指代整句怎么用？",
        "a": "逗号 + which，指代前面整句话，译成“这一点／这”。这种用法只能用 which，不能用 what。",
        "good": "He passed the exam, which surprised everyone.",
        "bad": "He passed the exam, what surprised everyone."
      },
      {
        "q": "逗号能不能省？",
        "a": "不能随便省。有逗号是“顺便补充”，没逗号是“限定只有那些”。省掉逗号会改变整句意思。",
        "good": "My brother, who lives in Beijing, is a doctor.",
        "bad": "My brother who lives in Beijing, is a doctor."
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
  "noun-clause": {
    "summary": "whether 和 that 的位置完全一样，都引导名词性从句；区别是 whether 多一层“是否”的意思，而且从句内部永远用陈述语序。",
    "items": [
      {
        "q": "whether 到底要不要跟 or not 连用？",
        "a": "加不加都对，or not 只是把“两种可能”说满，考试和写作里省略也很常见。三种写法都成立：Whether or not he comes, we start on time.（or not 紧跟 whether）；I do not know whether he will come or not.（or not 放从句末尾）；I do not know whether he will come or stay home.（or 后面换成另一个选项）。",
        "good": "I do not know whether he will come.",
        "bad": "I do not know if or not he will come."
      },
      {
        "q": "whether 能接在哪些位置？",
        "a": "凡是能放名词的地方都能放：主语 Whether he agrees matters.、宾语 I do not know whether he agrees.、表语 The question is whether he agrees.、同位语 the question whether he agrees。介词后面只能用 whether，不能用 if。",
        "good": "It depends on whether it rains.",
        "bad": "It depends on if it rains."
      },
      {
        "q": "whether 和 if 什么时候不能互换？",
        "a": "只有宾语从句里两者可以换。主语从句、表语从句、同位语从句、介词后面、以及后面直接接不定式（whether to do）时，只能用 whether。",
        "good": "I have not decided whether to take the job.",
        "bad": "I have not decided if to take the job."
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
  "appositive": {
    "summary": "同位语紧跟在名词后面、解释它是什么，用逗号隔开；同位语从句用 that，that 不作成分。",
    "items": [
      {
        "q": "同位语和定语从句有什么区别？",
        "a": "同位语直接等于前面的名词，中间不用谓语；定语从句是对名词的描述，必须有主谓结构。",
        "good": "Mr Li, our teacher, is very patient.",
        "bad": "Mr Li, our teacher is very patient, teaches us."
      },
      {
        "q": "that 引导同位语从句要注意什么？",
        "a": "常跟在 fact / news / idea / belief / hope 后面，that 不作任何成分，书面语里一般不省。",
        "good": "The fact that he lied shocked us.",
        "bad": "The fact he lied that shocked us."
      },
      {
        "q": "同位语从句和 that 定语从句怎么区分？",
        "a": "同位语从句里 that 后面是完整句子；定语从句里 that 要充当主语或宾语，后面必有空缺。",
        "good": "The news that our team won excited us.",
        "bad": "The news that our team won it excited us."
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
    "summary": "so + 形容词／副词 + that，such + (a/an) + 形容词 + 名词 + that，两条中间都要有内容。",
    "items": [
      {
        "q": "so 和 such 怎么选？",
        "a": "so 后面跟形容词或副词，such 后面跟名词短语。名词前有 many / much / few / little 时反而用 so。",
        "good": "It was so cold that we stayed home.",
        "bad": "It was such cold that we stayed home."
      },
      {
        "q": "so 和 that 中间能不断开吗？",
        "a": "表“如此……以至于”时中间必须夹形容词或副词；so that 连写是“为了”，表目的，意思完全不同。",
        "good": "He ran so fast that nobody could catch him.",
        "bad": "He ran so that fast nobody could catch him."
      },
      {
        "q": "that 能省略吗？",
        "a": "口语里偶尔省，但写作里保留更清楚；一旦省掉，很容易被读成“目的”结构。",
        "good": "She was so tired that she fell asleep at once.",
        "bad": "She was so tired so that she fell asleep at once."
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
  },
  "as-many-as": {
    "summary": "as many/much + 名词 + as + 比较对象：前面管数量，后面管对象，两个 as 缺一不可。",
    "items": [
      {
        "q": "many 和 much 怎么选？",
        "a": "many 接可数名词复数，much 接不可数名词；名词后面的 as 后面接比较对象。",
        "good": "She has as many books as her brother.",
        "bad": "She has as much books as her brother."
      },
      {
        "q": "第二个 as 后面能不能省？",
        "a": "能省重复的谓语（as her brother 相当于 as her brother does），但 as 本身不能省，也不能换成 than。",
        "good": "He works as hard as anyone in the team.",
        "bad": "He works as hard than anyone in the team."
      },
      {
        "q": "倍数和一半放在哪？",
        "a": "放第一个 as 前面：twice as many ... as、half as much ... as。",
        "good": "The new library holds three times as many books as the old one.",
        "bad": "The new library holds as many books three times as the old one."
      }
    ]
  },
  "the-more": {
    "summary": "the + 比较级 + 主语 + 谓语, the + 比较级 + 主语 + 谓语：前一个是条件，后一个是结果，两个 the 都不能省。",
    "items": [
      {
        "q": "两个 the 都能省略吗？",
        "a": "都不能。the more ... the more ... 是固定搭配，少一个 the 结构就不成立。",
        "good": "The more you practise, the better you become.",
        "bad": "More you practise, better you become."
      },
      {
        "q": "后面的语序要倒装吗？",
        "a": "不需要。the + 比较级 后面直接跟主语和谓语，保持正常语序。",
        "good": "The harder he works, the luckier he seems.",
        "bad": "The harder does he work, the luckier he seems."
      },
      {
        "q": "比较级后面可以接名词吗？",
        "a": "可以：the more + 名词 + 主语 + 谓语，名词紧跟比较级。",
        "good": "The more books you read, the wider your view becomes.",
        "bad": "The more books do you read, the wider your view becomes."
      }
    ]
  },
  "comparative-than": {
    "summary": "比较级 + than，than 后面接比较对象；比较的两边要对等，程度用 much / far / even 修饰。",
    "items": [
      {
        "q": "比较级前面能不能用 very？",
        "a": "不能。very 修饰原级；比较级要用 much、far、even、still、a lot。",
        "good": "This problem is much harder than that one.",
        "bad": "This problem is very harder than that one."
      },
      {
        "q": "than 后面用主格还是宾格？",
        "a": "口语里常用宾格（than me），正式写作里用主格加助动词（than I do）更严谨。",
        "good": "She runs faster than I do.",
        "bad": "She runs faster than me do."
      },
      {
        "q": "比较对象要对等吗？",
        "a": "要对等：人和人比，物和物比。不能拿“人”和“人的作品”或“城市”和“城市的人口”直接比。",
        "good": "The population of Beijing is larger than that of Tianjin.",
        "bad": "The population of Beijing is larger than Tianjin."
      }
    ]
  },
  "comparative-substitute": {
    "summary": "比较从句用 do/did 替代重复动词，形式随前半句时态和人称，be 动词和情态动词不能换成 do。",
    "items": [
      {
        "q": "than 后面什么时候用 do，什么时候用 does？",
        "a": "看前半句主语的人称和时态，不看 than 后面的主语。前半句是第三人称单数、现在时，用 does；其他现在时主语用 do；前半句是过去时，一律用 did。比如 colleagues 虽是复数，前半句 works 是第三人称单数，仍然用 does。",
        "good": "He works harder than his colleagues do.",
        "bad": "He works harder than his colleagues does."
      },
      {
        "q": "前半句是 be 动词或情态动词，还能用 do 替代吗？",
        "a": "不能。be 动词保留 be 的相应形式，情态动词保留情态动词：She is more careful than I am. / He can run faster than I can. 只有实义动词才借 do/does/did。把 than I am 写成 than I do 是最常见的混用错误。",
        "good": "She is more careful than I am.",
        "bad": "She is more careful than I do."
      },
      {
        "q": "than 后面直接跟名词、省掉 do/did，算错吗？",
        "a": "不算错。比较对象与前句结构对称时，整个谓语都可以省略：She reads faster than her brother. 口语和考试都成立。但省略后若可能产生歧义，保留 do/did 或补全谓语更清楚，正式写作里也更稳妥。"
      }
    ]
  },
  "as-as-comparison": {
    "summary": "两个 as 之间只能用原级；否定 not as … as 是“不如”，不是“不一样”。",
    "items": [
      {
        "q": "as … as 中间能不能用比较级？",
        "a": "不能。第一个 as 后必须是形容词或副词原级，比较级只跟 than 搭配。要表达“一样难”用 as hard as，“不如难”用 not as hard as，不能写成 as harder as。想加强“一样”可在第一个 as 前加 just、almost、nearly，中间仍是原级。",
        "good": "This test is as hard as the last one.",
        "bad": "This test is as harder as the last one."
      },
      {
        "q": "not as … as 和 not so … as 有区别吗？",
        "a": "意思基本相同，都表示“不如……”，现代英语里两者通用。区别在分布：so … as 一般只出现在否定句或疑问句，肯定句要用 as … as。写作中肯定用 as … as，否定两种都行，not as … as 更常见。"
      },
      {
        "q": "第二个 as 后面接代词，用主格还是宾格？",
        "a": "正式写作多用主格，因为可看作省略谓语的从句：She is as tall as I (am). 口语里 as me 也常见，但语法题多判主格正确；代词后若保留动词，只能用主格，不能写 as me am。比较对象是宾语时另说：as much as her 与 as much as she 不同。",
        "good": "She is as tall as I am.",
        "bad": "She is as tall as me am."
      }
    ]
  },
  "not-so-much-as": {
    "summary": "not so much A as B 的重点在 B，前后成分要对等；它比的是性质，不是数量。",
    "items": [
      {
        "q": "怎么和 not as much … as 区分？",
        "a": "看 as 前有没有 many/much 直接修饰名词。not as much money as 是数量比较，“钱不如……多”；not so much money as time 是性质对照，“与其说是钱，不如说是时间”。前者 much 是数量词，后者是固定句式。",
        "good": "The delay was not so much a technical problem as a management one.",
        "bad": "The delay was not so much a technical problem than a management one."
      },
      {
        "q": "A 和 B 的位置能换成 not so much B as A 吗？",
        "a": "不能随意换。句式固定为 not so much A as B，B 才是说话人真正想强调的内容，换成 B as A 会把重点移到 A，意思就反了。翻译按“与其说 A，不如说 B”处理，B 落在后半句。想强调 A，可用 rather than 或 more A than B。"
      },
      {
        "q": "not so much 后面只能接名词吗？",
        "a": "不限于名词。A、B 可以是名词、形容词、介词短语，甚至从句，但两边形式要对等：not so much angry as disappointed 是形容词对形容词；not so much by words as by actions 是介词短语对介词短语。一边名词一边从句就不平衡，读起来别扭。"
      }
    ]
  },
  "comparative-degree": {
    "summary": "very 不能修饰比较级，要用 much、far、even；最高级前一般要加 the。",
    "items": [
      {
        "q": "哪些词能修饰比较级，哪些不能？",
        "a": "修饰比较级用 much、far、a lot、a bit、even、still、rather；不能用 very、quite、too、so。very 只修饰原级：very difficult 对，very more difficult 错。“难得多”用 much more difficult。",
        "good": "This problem is much more difficult than that one.",
        "bad": "This problem is very more difficult than that one."
      },
      {
        "q": "最高级前的 the 什么时候可以省？",
        "a": "形容词最高级作定语或表语一般要 the：the tallest boy。副词最高级可省 the：She runs fastest. 前面有物主代词或所有格时不用 the：his best friend。most 表示“非常”而非“最”时也不加 the。",
        "good": "He is my best friend.",
        "bad": "He is my the best friend."
      },
      {
        "q": "one of the + 最高级后面的名词用单数还是复数？",
        "a": "必须用复数名词，因为“其中之一”意味着整体至少有两个以上。谓语动词跟 one 一致，用单数：One of the best students is...。常见错误是名词写成单数，或者谓语跟着复数名词用 are。",
        "good": "This is one of the most common mistakes.",
        "bad": "This is one of the most common mistake."
      }
    ]
  },
  "times-comparison": {
    "summary": "倍数词放最前，as … as 用原级；three times as large as 是“三倍大”。",
    "items": [
      {
        "q": "three times larger than 到底是三倍还是四倍？",
        "a": "传统语法认为它是“四倍”（大出三倍），但现代实际使用中多数人当“三倍”理解，存在争议。考试和写作建议改用无歧义的 three times as large as 或 three times the size of，避免在正式文章里用 larger than 表达倍数。"
      },
      {
        "q": "倍数词能放在 as 后面吗？",
        "a": "不能。倍数词必须放在第一个 as 前：three times as long as；也可放在 the size of 前：three times the size of。放到中间或后面都不合语法。twice 位置相同：twice as many books as。",
        "good": "The new hall is three times as large as the old one.",
        "bad": "The new hall is as three times large as the old one."
      },
      {
        "q": "倍数 + the size/length/weight of 后面能换成形容词吗？",
        "a": "不能。这个结构固定用名词：the size、the length、the weight、the height。要接形容词就改用 as … as：three times as heavy as，不能说 three times the heavy of。两种结构不能混搭。"
      }
    ]
  },
  "compared-with": {
    "summary": "compared with/to 是过去分词短语，逻辑主语要与主句一致，不能用 comparing。",
    "items": [
      {
        "q": "compared with 和 compared to 有区别吗？",
        "a": "现代英语基本通用，都表示“与……相比”。传统上 compared with 强调同类事物比高低，compared to 强调把不同类事物比作另一类。考试中两者一般都可接受；要表达“把 A 比作 B”时用 compare A to B，不用 with。"
      },
      {
        "q": "句首用 Compared with 时，主句主语有什么要求？",
        "a": "逻辑主语必须是被比较的那一方，否则成悬垂结构。Compared with last year, sales rose. 对，因为 sales 正是与去年相比的对象。判断方法：把短语补成完整从句，看主句主语能不能直接作 compare 的宾语，能就合格。",
        "good": "Compared with other cities, the cost of living here is low.",
        "bad": "Comparing with other cities, the cost of living here is low."
      },
      {
        "q": "compared with 能放在句尾吗？",
        "a": "可以。放句尾时前面通常不加逗号：The cost is low compared with other cities. 放句首要加逗号：Compared with other cities, the cost is low. 两种位置意思相同，句首更正式，句尾更自然。"
      }
    ]
  },
  "comparative-separated": {
    "summary": "比较级被介词短语隔开时，than 后面要重复同一个介词，比较对象才不乱。",
    "items": [
      {
        "q": "怎么判断 than 后面要不要重复介词？",
        "a": "看比较级后面是否先出现了介词短语。若是 less important for A than B，B 会被读成与 A 并列，关系含混；补上 for 成 than for B，两个对象各自跟介词，意思才明确。原则是 than 前后同一个介词都要出现，不能只留前半。",
        "good": "The policy is more helpful for beginners than for experts.",
        "bad": "The policy is more helpful for beginners than experts."
      },
      {
        "q": "这种句子怎么翻译才不乱？",
        "a": "先把介词短语分别挂到两边：less important for A than for B 就是“对 A 不如对 B 重要”。中文要把两个“对……”都说出来，不能合成“对 A 比 B 重要”，那样比较对象就错位了。"
      },
      {
        "q": "除了介词短语，还有哪些成分会把比较级和 than 隔开？",
        "a": "常见的有状语、宾语或补语：She works more efficiently in the morning than in the evening. 判断方法相同：than 后重复前面那个介词或结构，保证两边对称。"
      }
    ]
  },
  "cleft": {
    "summary": "强调句：It is/was + 被强调部分 + that/who + 其余部分；抽掉 It is 和 that 后，剩下的仍是完整句子。",
    "items": [
      {
        "q": "强调人用 that 还是 who？",
        "a": "都可以，强调人时 who 更自然；强调物、时间、地点一律用 that。",
        "good": "It was Mary who broke the window.",
        "bad": "It was Mary which broke the window."
      },
      {
        "q": "强调时间或地点能用 when / where 吗？",
        "a": "不能。强调句里时间、地点后面仍然用 that，用 when / where 就变成定语从句了。",
        "good": "It was in 2020 that he moved here.",
        "bad": "It was in 2020 when he moved here."
      },
      {
        "q": "怎么判断是不是强调句？",
        "a": "把 It is/was 和 that 去掉，剩下的词能重新组成一个完整句子，就是强调句；缺胳膊少腿就不是。",
        "good": "It was the noise that woke me up.",
        "bad": "It was the noise that woke me up because of it."
      }
    ]
  },
  "inversion": {
    "summary": "句首否定或 only 类状语后面要部分倒装：状语 + 助动词 + 主语 + 谓语，只倒前半句。",
    "items": [
      {
        "q": "哪些词放句首要倒装？",
        "a": "never、hardly、scarcely、seldom、little、not only、not until、no sooner，以及 only + 状语、so + 形容词。它们只是普通状语时就不用倒装。",
        "good": "Never have I seen such a view.",
        "bad": "Never I have seen such a view."
      },
      {
        "q": "句子里没有助动词怎么办？",
        "a": "借 do / does / did，后面的动词回到原形。",
        "good": "Seldom does he complain.",
        "bad": "Seldom he complains."
      },
      {
        "q": "not only 和 not until 倒装的是哪半句？",
        "a": "not only 倒前半句；not until 放在句首时，倒的是主句，until 从句本身用正常语序。",
        "good": "Not until he left did I realize the truth.",
        "bad": "Not until did he leave I realized the truth."
      }
    ]
  },
  "so-neither-inversion": {
    "summary": "so/neither 置句首要倒装，助动词复制前句的时态和情态，主语要换成新的。",
    "items": [
      {
        "q": "前句是实义动词，so 后面用 do 还是 does？",
        "a": "跟前句主语的人称和时态走，不跟新主语走。前句 She likes tea 是第三人称单数现在时，后句用 does：So does he. 前句 They liked tea 是过去时，用 did：So did she. 新主语是复数也不改成 do，因为助动词复制的是前句的形态。",
        "good": "She likes tea, and so does he.",
        "bad": "She likes tea, and so he does."
      },
      {
        "q": "so 和 neither 后面能不能直接用实义动词？",
        "a": "不能。倒装结构里只出现助动词、情态动词或 be，实义动词不再重复：So do I，不能说 So like I；neither 同理：Neither can I。前句没有助动词时，借 do/does/did 代替整个谓语。"
      },
      {
        "q": "So it is. 和 So is it. 有什么区别？",
        "a": "So is it. 是倒装，表示“它也是这样”，主语是新信息；So it is. 不倒装，表示“确实如此”，是对前句的确认，主语指同一对象。同理 So I do. 是“我确实如此”，So do I. 是“我也如此”。看主语是否与前句相同即可区分。",
        "good": "He is a doctor, and so is she.",
        "bad": "He is a doctor, and so does she."
      }
    ]
  },
  "emphatic-do": {
    "summary": "do/does/did 后面一律用动词原形，时态和人称由 do 承担，不能再加 -s 或 -ed。",
    "items": [
      {
        "q": "强调用的 do 能出现在哪些时态？",
        "a": "只有一般现在时和一般过去时：do/does 表现在，did 表过去。进行时、完成时、将来时不用这种强调，它们本身已有助动词，直接把重音放在助动词上即可：I am working. / I have finished. 不能说 I do am working。"
      },
      {
        "q": "祈使句里加 do 是什么意思？",
        "a": "Do + 动词原形用于祈使句，表示“一定要、务必”，语气更恳切：Do come in. / Do be careful. 否定祈使仍用 Don't + 动词原形，不用 do not 来强调。回答别人的请求时也可用 I do. 表示“我确实愿意”。"
      },
      {
        "q": "强调的 do 和替代的 do 怎么区分？",
        "a": "强调的 do 后面一定跟动词原形，去掉 do 句子仍完整：I do believe it 变成 I believe it 照样成立。替代的 do 后面没有动词，它本身就代替前面的谓语：She runs faster than I do，去掉 do 就缺谓语。看 do 后有没有动词原形即可。",
        "good": "He did warn us about the risk.",
        "bad": "He did warned us about the risk."
      }
    ]
  },
  "full-inversion": {
    "summary": "完全倒装把整个谓语放到主语前；主语是代词时不倒装，说 Here he comes。",
    "items": [
      {
        "q": "Here comes the bus. 和 Here it comes. 为什么不一样？",
        "a": "规则是主语为名词时倒装，主语为代词时不倒装。the bus 是名词短语，放到动词后：Here comes the bus. it 是代词，必须放在动词前：Here it comes. 同理 There goes the bell. / There it goes. 代词太短，倒装反而别扭。",
        "good": "Here comes the bus.",
        "bad": "Here comes it."
      },
      {
        "q": "完全倒装只能用一般现在时吗？",
        "a": "不是，但 here/there + come/go 这类句子多用一般现在时。方位短语开头的句子可以用过去时：On the wall hung a large map. / On the table lay a letter. 描述正在进行的场景也可用进行时，但不如一般时常见。"
      },
      {
        "q": "哪些动词常用于完全倒装？",
        "a": "多为不及物动词：be、come、go、lie、stand、sit、hang。及物动词不能这样用，因为倒装后宾语位置会混乱。判断时看动词本来是否没有宾语：On the hill stands a temple. 对，On the hill built a temple. 错。",
        "good": "On the top of the hill stands an old temple.",
        "bad": "On the top of the hill built an old temple."
      }
    ]
  },
  "not-until": {
    "summary": "Not until 置句首要部分倒装；It was not until … that 后接正常语序。",
    "items": [
      {
        "q": "Not until 倒装怎么还原成正常语序？",
        "a": "把 not until 放回句尾，主句恢复陈述语序。Not until midnight did he finish the essay. 还原为 He did not finish the essay until midnight. did 还原成 finished。",
        "good": "Not until midnight did he finish the essay.",
        "bad": "Not until midnight he finished the essay."
      },
      {
        "q": "It was not until … that 后面的 that 从句要倒装吗？",
        "a": "不要。强调句的 that 后用正常语序：It was not until 2019 that the two sides reached an agreement. 倒装只发生在 Not until 直接置于句首时。另外强调句用 that，不用 when，即使 until 指的是时间。"
      },
      {
        "q": "until 和 till 有区别吗？not … until 的谓语用什么时态？",
        "a": "till 与 until 意思相同，until 更正式，置句首时一般用 until。短暂动词的 not … until 表示动作到那时才发生，常用一般过去时；强调已完成可用过去完成时：He had not finished until midnight. 持续动词则表示状态延续到那时。"
      }
    ]
  },
  "subjunctive-inversion": {
    "summary": "省略 if 后把 were/had/should 提前；从句是其他实义动词过去式时不能倒装。",
    "items": [
      {
        "q": "Were I you 和 If I were you 完全一样吗？",
        "a": "意思完全相同，Were I you 更书面、更正式，多用于演讲和正式文章。口语和日常写作直接用 If I were you 更自然。倒装后仍用 were，不能用 Was I you；主句结构不变：Were I you, I would accept the offer.",
        "good": "Were I you, I would accept the offer.",
        "bad": "Was I you, I would accept the offer."
      },
      {
        "q": "哪些情况可以省略 if 倒装，哪些不行？",
        "a": "只有从句谓语含 were、had、should 时可以：Were I... / Had I known... / Should it rain...。从句谓语是实义动词过去式时不行，If he came 不能写成 Came he，If I knew 不能写成 Knew I，这类句子只能保留 if。"
      },
      {
        "q": "Had I known 后面主句用什么形式？",
        "a": "这是与过去相反的虚拟，主句用 would/could/might have done：Had I known the deadline, I would have started earlier. 主句不能写成 would start，那会变成与现在相反。had done 已表明过去未实现。",
        "good": "Had I known the deadline, I would have started earlier.",
        "bad": "Had I known the deadline, I would start earlier."
      }
    ]
  },
  "only-inversion": {
    "summary": "Only + 状语置句首，主句部分倒装；Only 修饰主语时句子不倒装。",
    "items": [
      {
        "q": "Only he knows the answer. 为什么不倒装？",
        "a": "因为 only 修饰的是主语 he，不是状语。规则是 only + 状语（副词、介词短语、状语从句）置句首才引起主句倒装；only + 主语只是限定“只有他”，句子照常用陈述语序。对比 Only then did he realize. 中 then 是状语，所以要倒装。",
        "good": "Only he knows the answer.",
        "bad": "Only does he know the answer."
      },
      {
        "q": "Only when 从句放句首，倒装发生在主句还是从句？",
        "a": "只倒装主句，从句保持陈述语序：Only when the data were rechecked did the error appear. when 从句用 were rechecked，是正常语序；主句 did the error appear 才倒装。不要把从句也倒装。"
      },
      {
        "q": "Only + 状语倒装时，原句没有助动词怎么办？",
        "a": "补 do/does/did，时态和人称由它承担，实义动词用原形：Only then did he realize. 若原句有情态动词或 be，直接把情态动词或 be 提前：Only in this way can we solve it. 不能保留陈述语序。",
        "good": "Only after the meeting did she tell me the truth.",
        "bad": "Only after the meeting she told me the truth."
      }
    ]
  },
  "wish-ifonly": {
    "summary": "wish 后与现在相反用过去式（be 用 were），与过去相反用 had done，不用现在时。",
    "items": [
      {
        "q": "wish 后面用 was 还是 were？",
        "a": "正式语法要求 were，尤其 I wish I were...；口语里 was 也常听到，但考试和写作一律用 were。主语是 I/he/she/it 都用 were：I wish he were here. wish 作“祝愿”时则接名词：I wish you good luck.",
        "good": "I wish I were taller.",
        "bad": "I wish I am taller."
      },
      {
        "q": "wish 后面能接 would 吗？",
        "a": "可以，wish + would do 表示希望将来有所改变，常带不满或请求语气：I wish it would stop raining. 但主语不能与 wish 的主语相同，不能说 I wish I would...，应改用 I wish I could...。"
      },
      {
        "q": "if only 和 wish 用法一样吗？",
        "a": "时态规则一样：if only + 过去式表现在遗憾，+ had done 表过去遗憾，+ would do 表将来愿望。区别是 if only 语气更强，常独立成句：If only I had studied harder! 而 wish 必须带主语和从句。",
        "good": "If only I had studied harder.",
        "bad": "If only I studied harder yesterday."
      }
    ]
  },
  "subjunctive": {
    "summary": "与现在相反用过去式（be 用 were），与过去相反用 had done；suggest 后接原形。",
    "items": [
      {
        "q": "suggest 后面的从句什么时候用虚拟，什么时候不用？",
        "a": "表示“建议”时用 (should) + 动词原形：He suggested that we (should) leave early. 表示“指出、表明”时用陈述语气，时态照常：The data suggest that the method works. 看它能否换成“建议”即可。",
        "good": "He suggested that we leave early.",
        "bad": "He suggested that we left early."
      },
      {
        "q": "insist 后面一定用虚拟吗？",
        "a": "不一定。insist 表示“坚持要求”时用 (should) + 原形：She insisted that he (should) apologize. 表示“坚持说、坚称”时用陈述语气，时态照常：She insisted that he was innocent. 看语义是“要求”还是“声称”。"
      },
      {
        "q": "It is necessary that 后面的 should 能省吗？",
        "a": "可以省，尤其美式英语：It is necessary that every student (should) attend. 同类词还有 important、essential、vital。注意从句动词一律用原形，不随主语变化：that he go，不是 that he goes。",
        "good": "It is necessary that every student attend the meeting.",
        "bad": "It is necessary that every student attends the meeting."
      }
    ]
  },
  "but-for": {
    "summary": "but for 接名词或动名词；主句按时间选 would do 或 would have done。",
    "items": [
      {
        "q": "but for 后面能不能接句子？",
        "a": "不能，它是介词短语，只能接名词或动名词：But for your help... / But for the rain...。接完整句子要改用 if it had not been for：If it had not been for your help, I would have failed.",
        "good": "But for the heavy rain, we would have arrived on time.",
        "bad": "But for it rained heavily, we would have arrived on time."
      },
      {
        "q": "but for 和 without 完全一样吗？",
        "a": "意思和用法基本相同，都可接名词或动名词。差别在语体：but for 更正式、更书面，且多用于虚拟；without 更中性，也可用于真实情况，如 Without water, plants cannot grow. 这是客观事实，不用虚拟。看是否与事实相反来决定主句形式。"
      },
      {
        "q": "but for 后面主句用 would do 还是 would have done？",
        "a": "看所指时间。现在或将来相反用 would/could do：But for the noise, I would sleep well. 过去相反用 would/could have done：But for the warning, it would have been worse.",
        "good": "But for the traffic, we would have caught the train yesterday.",
        "bad": "But for the traffic, we would catch the train yesterday."
      }
    ]
  },
  "otherwise-subjunctive": {
    "summary": "otherwise 后的虚拟结果要与前半句事实时态对齐，过去事实配 would have done。",
    "items": [
      {
        "q": "otherwise 后面一定要用虚拟语气吗？",
        "a": "不一定。前半句是真实情况、otherwise 表示“否则”时，后面用虚拟：I was ill; otherwise I would have come. 但 otherwise 表示“在其他方面”时用陈述语气：The room is small but otherwise comfortable."
      },
      {
        "q": "otherwise 和 or else 有什么区别？",
        "a": "意思相同，都可译“否则”。otherwise 更正式，前面常用分号或逗号；or else 更口语，常与祈使句连用：Hurry up, or else you will be late. or else 后的结果若与事实相反才用虚拟，若只是可能发生的后果，用陈述语气即可。"
      },
      {
        "q": "otherwise 前面用分号还是逗号？",
        "a": "两者都可，但连接两个独立分句时用分号更规范：The road was blocked; otherwise we would have arrived on time. 用逗号加 otherwise 在非正式写作中常见，正式写作建议用分号或句号。otherwise 放句首时，后面通常加逗号。",
        "good": "She reminded me; otherwise I would have forgotten the appointment.",
        "bad": "She reminded me; otherwise I would forget the appointment."
      }
    ]
  },
  "not-only-but-also": {
    "summary": "not only A but also B：前后要接同类的成分；not only 放到句首时，前半句必须部分倒装。",
    "items": [
      {
        "q": "not only 放句首要怎么变？",
        "a": "Not only + 助动词 + 主语 + 谓语，后半句照常语序。没有助动词就借 do / does / did。",
        "good": "Not only did she finish the task, but she also helped others.",
        "bad": "Not only she finished the task, but she also helped others."
      },
      {
        "q": "but also 里的 also 能省吗？",
        "a": "also 可以省，只留 but 也正确；但 not only 不能拆开写，也不能只留 not。",
        "good": "He is not only a teacher but a friend.",
        "bad": "He is not a only teacher but also a friend."
      },
      {
        "q": "前后接的成分有什么要求？",
        "a": "必须对等：名词配名词，动词配动词，从句配从句。一个接短语、一个接完整从句读起来就断了。",
        "good": "The course not only improves reading speed but also builds vocabulary.",
        "bad": "The course not only improves reading speed but also it builds vocabulary."
      }
    ]
  },
  "rather-than": {
    "summary": "rather than 连接两个对等成分，前面是选中的、后面是舍弃的；instead of 是介词，后面要接动名词。",
    "items": [
      {
        "q": "rather than 后面接什么形式？",
        "a": "和前面保持平行：前面是动词原形，后面也用原形；前面是动名词，前后都用动名词。",
        "good": "He chose to walk rather than take a taxi.",
        "bad": "He chose to walk rather than takes a taxi."
      },
      {
        "q": "rather than 和 instead of 能互换吗？",
        "a": "意思接近，但 instead of 是介词，后面接名词或动名词，不能接动词原形。",
        "good": "He walked instead of taking a taxi.",
        "bad": "He walked instead of take a taxi."
      },
      {
        "q": "rather than 放句首要注意什么？",
        "a": "后面通常接动词原形，构成“与其……不如……”的对比，前后结构仍要保持一致。",
        "good": "Rather than wait, she left at once.",
        "bad": "Rather than waits, she left at once."
      }
    ]
  },
  "ellipsis": {
    "summary": "省略的前提是被省成分能从主句补回来；主语不一致、主动被动搞反，都会写出垂悬结构。",
    "items": [
      {
        "q": "if necessary 补回去是 if it is necessary，这个 it 到底指什么？",
        "a": "it 泛指前面提到的“情况”，不指某个具体名词；when possible 同理，补成 when it is possible。判断办法是把 it 换回主句主语，若句意通顺、逻辑不变，说明省略合法；换完意思变了，就必须写完整从句，不能硬省。",
        "good": "Check the figures again if necessary.",
        "bad": "Check the figures again if being necessary."
      },
      {
        "q": "than expected 后面为什么既没有主语也没有 be 动词？",
        "a": "than 在比较结构里只保留比较项，省掉与主句重复的主语和 be。better than expected 可补成 better than it was expected。注意主句是系表结构时才省 be；行为动词则补成 than 加主语加助动词。",
        "good": "Sales were higher than expected in the first quarter.",
        "bad": "Sales were higher than expecting in the first quarter."
      },
      {
        "q": "省略句里到底用 -ing 还是 -ed？",
        "a": "看被省掉的主语和动词是什么关系：主动或进行用 -ing，被动或完成用 -ed。把从句补全就能验证，he waits 对应 waiting，the metal is heated 对应 heated。拿不准时先补全再决定分词形式，比凭语感可靠。",
        "good": "While waiting for the bus, he read the news.",
        "bad": "While waited for the bus, he read the news."
      }
    ]
  },
  "correlative": {
    "summary": "both…and 谓语用复数，neither…nor 已含否定，再加 not 就成了双重否定。",
    "items": [
      {
        "q": "both … and 连接两个单数主语，谓语也一定用复数吗？",
        "a": "是。both A and B 在意义上等于两个人或两件事，谓语一律用复数，不受 A、B 单复数影响。另外 both … and 只用于肯定句；要表达“两个都不”，必须换成 neither … nor，不能写成 both … not，那样只是部分否定。",
        "good": "Both the teacher and the student were surprised.",
        "bad": "Both the teacher and the student was surprised."
      },
      {
        "q": "neither … nor 本身已经是否定，后面还能再加 not 吗？",
        "a": "不能。neither 本身已是否定，再加 not 就是双重否定，意思反而变肯定。neither 只能配 nor，不能配 or。neither 连接主语时谓语按就近原则；连接两个分句且 neither 放句首时，两个分句都要部分倒装。",
        "good": "Neither answer is correct.",
        "bad": "Neither answer isn't correct."
      },
      {
        "q": "either … or 在否定句里要改成什么？",
        "a": "否定句中一般不用 either … or 表示“都不”，而用 neither … nor；如果谓语已经有 not，也可以保留 either … or，写成 not … either A or B。判断看谓语：句中没有否定词、意思又是“都不”，就用 neither … nor。",
        "good": "He didn't call either his parents or his sister.",
        "bad": "He didn't call neither his parents nor his sister."
      }
    ]
  },
  "semicolon-parallel": {
    "summary": "分号只能连接两个完整分句；和 but 连用、连接短语、后接 however 不加逗号，都是常见错。",
    "items": [
      {
        "q": "分号和逗号到底有什么区别？",
        "a": "逗号本身不能连接两个完整分句，直接连就是逗号粘连；分号可以，而且暗示两边关系紧密、地位对等。判断方法：两边都能独立成句、中间又没有 and/but/so，就用分号；已经有并列连词，则用逗号。",
        "good": "The first draft was long; the second was concise.",
        "bad": "The first draft was long, the second was concise."
      },
      {
        "q": "分号后面可以直接跟 however 吗？",
        "a": "可以，但 however 是连接副词而不是连词，后面必须加逗号；它前面也必须是完整分句。常见错误是用逗号加 however 连接两句，那仍然是逗号粘连。同类的 therefore、moreover、nevertheless 都按这个规则处理。",
        "good": "The sample was small; however, the results were consistent.",
        "bad": "The sample was small, however, the results were consistent."
      },
      {
        "q": "分号能连接一个句子和一个短语吗？",
        "a": "不能，分号两边都必须是独立分句。若后面只是名词短语或列表，应改用冒号；若只是补充说明，也可以用破折号。写完后把分号两边分别读一遍，有一边读不成句，就说明用错了。",
        "good": "The plan had one weakness: its cost.",
        "bad": "The plan had one weakness; its cost."
      }
    ]
  },
  "colon-explain": {
    "summary": "冒号左边必须是完整分句，右边可以是短语或句子；such as 后面不能再加冒号。",
    "items": [
      {
        "q": "冒号后面能不能接一个完整句子？",
        "a": "能。冒号前是完整分句时，后面可以是名词短语、列表，也可以是一个完整句，用来具体说明前文。此时后句首字母一般小写，因为冒号不结束整个句子；只有专有名词或需要特别强调时才大写。考试中冒号后接完整句同样成立。",
        "good": "The result was unmistakable: the treatment worked.",
        "bad": "The result was unmistakable: The treatment worked."
      },
      {
        "q": "一个句子里能连用两个冒号吗？",
        "a": "标准书面语中一个句子只用一个冒号。需要再分层时，改用分号或破折号，或者拆成两句。冒号的作用是引出并说明，连续使用会让层次混乱，读者分不清哪一层才是解释。确实要列举两层，最好在外层改句号另起一句。",
        "good": "The report had one flaw: its sample was tiny.",
        "bad": "The report had one flaw: its sample was tiny: only five cases."
      },
      {
        "q": "冒号前面可以只是一个短语吗？",
        "a": "正式写作中不行，冒号左边必须是能独立成句的分句。像“包括、例如”这类词后面直接接例子，不加冒号。标题和表格引导语可以例外，但考试作文按完整分句处理最稳妥。",
        "good": "He packed three things: a tent, a stove and a map.",
        "bad": "He packed: a tent, a stove and a map."
      }
    ]
  },
  "not-but": {
    "summary": "not 与 but 后成分要对等；谓语随 but 后主语；别混 not only…but also。",
    "items": [
      {
        "q": "not … but 和 not only … but also 意思差在哪？",
        "a": "not … but 是否定 A、肯定 B，只有 B 成立；not only … but also 是两者都成立，后者更进一步。判断看事实：只能二选一时用前者，两者兼有且递进时用后者。两种结构都要求前后成分对等。",
        "good": "What we need is not more talk but action.",
        "bad": "What we need is not more talk but to act."
      },
      {
        "q": "not 后面的介词可以省掉吗？",
        "a": "不能随便省。not 和 but 后接介词短语时要各自保留介词，保持结构对称；只在 but 后省略，读者会以为 but 直接带名词。判断办法是删掉 not 部分，剩下的 but 短语仍应能独立成立。",
        "good": "Success depends not on luck but on effort.",
        "bad": "Success depends not on luck but effort."
      },
      {
        "q": "not … but 连接两个主语时，谓语跟谁一致？",
        "a": "跟 but 后面的主语一致，因为那才是被肯定的一方，这也符合就近原则。反过来，如果真正想肯定的是前者，就该调整语序，不要靠谓语去暗示。这类句子在正式写作中最好让 but 后的主语靠近谓语。",
        "good": "Not the students but the teacher was responsible.",
        "bad": "Not the students but the teacher were responsible."
      }
    ]
  },
  "coordination": {
    "summary": "两个完整句之间不能只用逗号；用了 because 就不能再加 so，中文“因为…所以”不能直译。",
    "items": [
      {
        "q": "逗号直接连接两个完整句子为什么算错？",
        "a": "这叫逗号粘连。英语里逗号没有连接分句的功能，必须补并列连词 and/but/so，或者改用分号、句号。判断很简单：逗号两边都能独立成句、且中间没有连词，就是粘连；有连词才是合法的并列句。",
        "good": "The rain stopped, and the match resumed.",
        "bad": "The rain stopped, the match resumed."
      },
      {
        "q": "只有两项并列时，and 前面要不要加逗号？",
        "a": "不用。只有两项词或短语并列时，直接写 A and B，中间不加逗号；三项以上才写成 A, B and C。唯一的例外是 and 连接两个完整分句，这时前面必须有逗号。判断顺序是先看两边是短语还是分句，再看项数。",
        "good": "She bought bread and cheese.",
        "bad": "She bought bread, and cheese."
      },
      {
        "q": "so 和 because 能出现在同一个句子里吗？",
        "a": "不能。because 引导原因状语从句，so 连接结果分句，两者只能选一个，否则逻辑重复、句子有两个连词。中文“因为……所以……”是固定搭配，直译成英文就会多出一个连词。although 与 but 也是同样的道理。",
        "good": "Because the sample was small, the results are tentative.",
        "bad": "Because the sample was small, so the results are tentative."
      }
    ]
  },
  "elliptical-clause": {
    "summary": "省略后留下的助动词要承担时态，后面接原形；肯定用 too、否定用 either，别混。",
    "items": [
      {
        "q": "so do I 和 so I do 有什么区别？",
        "a": "so do I 表示“我也一样”，前后主语不同，用倒装；so I do 是“我确实如此”，主语与对方相同，用来确认，不倒装。否定形式用 neither/nor do I，同样倒装。判断关键就看两边是不是同一个人。",
        "good": "She likes coffee, and so do I.",
        "bad": "She likes coffee, and so like I."
      },
      {
        "q": "否定句里表示“也不”，用 too 还是 either？",
        "a": "否定句用 either，放在句末；肯定句用 too。也可以用 neither/nor 加倒装，如 neither does she。不能把 too 用在否定句里，也不能在已经有了 not 的句子里再用 neither，那样是否定叠加。",
        "good": "He doesn't drive, and his wife doesn't either.",
        "bad": "He doesn't drive, and his wife doesn't too."
      },
      {
        "q": "前半句是 be 动词，后半句省略时用 do 还是 be？",
        "a": "沿用前半句的助动词或 be，不能换成 do。前半句是 be，后半句也用 be；前半句是情态动词，后半句用同一个情态动词。替代词只承担语法功能，实义部分由前半句提供。",
        "good": "The room was clean, and the kitchen was too.",
        "bad": "The room was clean, and the kitchen did too."
      }
    ]
  },
  "substitution": {
    "summary": "替代是用短词顶替前面出现过的内容：do so 代动作、one 代可数名词、that 代带修饰的名词、so 代从句或形容词。",
    "items": [
      {
        "q": "one 和 ones 什么时候用？",
        "a": "one 替代单数可数名词，ones 替代复数可数名词，前面常带形容词或 the。判断关键是看被替代的名词可不可数：可数才能用 one，不可数要用 that 或直接重复。",
        "good": "I do not like this dictionary; please show me a smaller one.",
        "bad": "I need some advice; can you give me a useful one."
      },
      {
        "q": "替代动作时，什么时候用 do so，什么时候不能用？",
        "a": "do so 替代前面出现过的动词短语，主语可以换，语气偏正式。但 be 动词、被动结构、情态动词后面的省略不能用 do so 顶，要改成 be too / so is she 或直接保留助动词。",
        "good": "He asked me to leave, and I did so.",
        "bad": "She is a teacher, and her sister does so too."
      },
      {
        "q": "that 和 those 后面为什么常跟 of？",
        "a": "因为要限定比较或指代的范围，避免指代不明。that 代前面提到的单数名词或不可数名词，those 代复数名词，后面常接 of / in 短语说明是哪一部分。",
        "good": "The rules of this game are simpler than those of chess.",
        "bad": "The rules of this game are simpler than that of chess."
      }
    ]
  },
  "there-be": {
    "summary": "there be 单复数看后面名词，不能用 have；evidence 不可数，别加 an。",
    "items": [
      {
        "q": "there be 后面跟两个名词，谓语用 is 还是 are？",
        "a": "按就近原则，看最靠近 be 的那个名词：单数用 is，复数用 are。正式写作中也有按整体意义用 are 的，但考试按就近最稳。想彻底避免争议，可以把复数名词放前面，或改写成普通主谓句，让主语自己决定谓语。"
      },
      {
        "q": "There are many students study here 这句话为什么错？",
        "a": "因为 be 已经是谓语，后面再跟一个没有引导词的 study，句子就成了双谓语。要说明“谁在做什么”，得用定语从句或分词，或者干脆改写成普通主谓句。判断办法是数一数限定动词的个数。",
        "good": "There are many students who study in the library.",
        "bad": "There are many students study in the library."
      },
      {
        "q": "evidence 是可数名词吗？",
        "a": "不可数，没有复数形式，也不能加 a/an，要计量用 a piece of evidence 或 two pieces of evidence。在 there be 句型里同样按不可数处理，谓语用单数。research、information、advice 也是同一类。",
        "good": "There is little evidence to support the claim.",
        "bad": "There are many evidences to support the claim."
      }
    ]
  },
  "partial-negation": {
    "summary": "not 与 all、both、every 连用表部分否定；全否用 none、neither。",
    "items": [
      {
        "q": "not all 到底是部分否定还是全部否定？",
        "a": "部分否定，意思是“并非全部”，等于 some … not。全部否定要用 none、no one、neither。同理 not both 是“并非两个都”，not every 是“并非每个”。看到 not 与总括词同句，先按部分否定理解。",
        "good": "Not all the answers are correct.",
        "bad": "All the answers are not correct."
      },
      {
        "q": "all … not 和 none 的意思是同一回事吗？",
        "a": "不是。all … not 传统上按部分否定处理，句子里仍有一部分成立；none 才是全部否定，一个都不成立。不过 all … not 的语序确实容易读成全否，正式写作建议把 not 放到句首，或直接用 none，避免歧义。",
        "good": "None of the students failed the exam.",
        "bad": "All of the students didn't fail the exam."
      },
      {
        "q": "not … because 到底否定主句还是否定原因？",
        "a": "要看逻辑，两种读法都可能。想明确否定原因，用 not because … but because … 的对称结构；想明确否定主句，就在 because 前加逗号，或把原因单独放到句末。翻译时先按“并不是因为”试，通顺就否定原因。",
        "good": "She left not because she was tired but because she was bored.",
        "bad": "She left because not she was tired but because she was bored."
      }
    ]
  },
  "double-negative": {
    "summary": "两个否定相加等于肯定；口语的 I don't need no help 非标准，写作别用。",
    "items": [
      {
        "q": "not uncommon 到底是“常见”还是“不常见”？",
        "a": "是“常见”，语气比直接说 common 更谨慎、更客观。not unusual 同理，表示“并不少见”。理解方法：把 not 和 un- 两个否定抵消，剩下的就是肯定意义。不能把它当成单纯的 uncommon 去理解。",
        "good": "It is not uncommon for new staff to feel nervous.",
        "bad": "It is not uncommon that new staff don't feel nervous."
      },
      {
        "q": "cannot … too 该怎么译？",
        "a": "译“再……也不为过”“越……越好”，不是“不能太……”。You cannot be too careful 意思是越小心越好。同义结构还有 cannot … enough 和 never … too。翻译时把两个否定合起来看，改成肯定句最自然。",
        "good": "You cannot be too careful when handling these chemicals.",
        "bad": "You cannot too careful when handling these chemicals."
      },
      {
        "q": "I don't need no help 算不算双重否定？",
        "a": "算，但它是非标准英语：两个否定仍然表示否定，属于方言或口语强调，考试和正式写作都算错。标准写法是只保留一个否定，即 I don't need any help 或 I need no help。判断看语体，学术写作一律单否定。",
        "good": "I don't need any help.",
        "bad": "I don't need no help."
      }
    ]
  },
  "exclamatory": {
    "summary": "What 修饰名词，How 修饰形容词或副词；单数可数名词别漏 a/an，不可数名词别加 a。",
    "items": [
      {
        "q": "How 后面能不能直接跟名词？",
        "a": "不能。How 只修饰形容词或副词，名词要用 What 引出。判断办法：把感叹部分还原成陈述句，中心词是名词就用 What，中心词是形容词或副词就用 How。两种结构不能混着写。",
        "good": "How beautiful the flowers are!",
        "bad": "What beautiful the flowers are!"
      },
      {
        "q": "What 后面什么时候要加 a 或 an？",
        "a": "只有单数可数名词才加，如 What a good idea；复数名词和不可数名词都不加，如 What lovely flowers、What fine weather。判断时先看名词类型，再看有没有形容词，形容词不影响 a 的有无。",
        "good": "What a remarkable idea it is!",
        "bad": "What remarkable idea it is!"
      },
      {
        "q": "感叹句可以省略主语和谓语吗？",
        "a": "口语里可以，如 What a day、How nice，语境清楚时很自然；书面语尤其是考试作文，最好写完整的主谓结构，避免被当成残缺句。省略时也只省主谓，What/How 与名词、形容词的先后顺序不能乱。",
        "good": "What a lovely day!",
        "bad": "What lovely a day!"
      }
    ]
  },
  "tag-question": {
    "summary": "前句含 never、hardly、little 就算否定，后句用肯定；助动词必须与前句一致。",
    "items": [
      {
        "q": "前句有 never，后面的反意疑问用肯定还是否定？",
        "a": "用肯定。never、hardly、seldom、rarely、few、little、nothing、nobody 都让句子带上否定意义，按“前否后肯”处理。判断时不要只找 not，要看整句是不是否定意思，含否定副词或否定代词就算否定句。",
        "good": "She hardly ever complains, does she?",
        "bad": "She hardly ever complains, doesn't she?"
      },
      {
        "q": "I am … 后面用 am not I 还是 aren't I？",
        "a": "正式书面语用 am I not，口语常用 aren't I；amn't I 不是标准形式，考试不要写。否定疑问部分的主语必须用代词 I，不能重复前面的名词。",
        "good": "I am late, aren't I?",
        "bad": "I am late, amn't I?"
      },
      {
        "q": "Let's 和普通祈使句的反意疑问分别用什么？",
        "a": "Let's 用 shall we，因为包括说话对象；Let us 表示请求对方允许、不包括对方时用 will you。普通祈使句一律用 will you，否定祈使句也一样，不要因为句中有 not 就换成肯定形式。",
        "good": "Let's take a break, shall we?",
        "bad": "Let's take a break, will we?"
      }
    ]
  },
  "indirect-speech": {
    "summary": "said 后面不接人，told 必须接人；疑问从句用陈述语序，句末别留问号。",
    "items": [
      {
        "q": "said 和 told 后面接人有什么区别？",
        "a": "told 必须带宾语，即 told somebody that …；said 后面直接跟 that 从句，不能加人，要加人得用 said to somebody。判断时看有没有间接宾语：有就用 told，没有就用 said。",
        "good": "She told me that the room was ready.",
        "bad": "She told that the room was ready."
      },
      {
        "q": "直接引语是一般疑问句，转述时用什么引导？",
        "a": "用 whether 或 if 引导，从句用陈述语序，句末改成句号。原句里的 did、do 要去掉，谓语回到相应时态。特殊疑问句则保留疑问词，同样用陈述语序，不能保留助动词提前。",
        "good": "He asked me whether I had finished the report.",
        "bad": "He asked me whether had I finished the report."
      },
      {
        "q": "主句是过去时，从句时态一定要跟着后退吗？",
        "a": "一般要后退，但客观真理、至今仍成立的事实、习惯性动作可以保留现在时；主句本身是现在时则完全不变。判断标准是从句内容现在是否仍然为真，而不是机械地把每个动词都改成过去式。",
        "good": "The teacher said that water boils at 100 degrees Celsius.",
        "bad": "The teacher said that water was boiling at 100 degrees Celsius."
      }
    ]
  },
  "fronted-adverbial": {
    "summary": "状语前置后主句一般不用倒装；只有 only 加状语、否定副词、here/there 才倒装。",
    "items": [
      {
        "q": "句首状语后面一定要加逗号吗？",
        "a": "不一定。较长的介词短语或从句放句首时通常加逗号，能避免读者把状语末尾的词误当成主句主语；很短的时间副词可以不加。判断标准是清楚：不加逗号会让读者一开始判断错结构，就加。"
      },
      {
        "q": "状语放到句首，主句要不要倒装？",
        "a": "一般不倒装，主句仍用正常语序。只有 only 加状语、否定副词（never、seldom、hardly）以及 here、there、方位短语放句首时才倒装，而且多为部分倒装。不要把“状语前置”和“倒装”当成一回事。",
        "good": "Only in this way can we solve the problem.",
        "bad": "Only in this way we can solve the problem."
      },
      {
        "q": "For many students 里的 for 是“为了”吗？",
        "a": "不是，这里表示“对……来说”，引出看问题的角度，相当于 from the perspective of。表示目的时才译“为了”，后面多接动作或目标。判断看 for 后面是人还是目的，是人的话通常译“对……而言”。",
        "good": "For many students, part-time work is a necessity.",
        "bad": "For many students, part-time work is a necessity for earn money."
      }
    ]
  },
  "object-complement": {
    "summary": "宾补说明宾语的状态，用形容词不用副词；在宾语和补语之间加 be，通顺才是宾补。",
    "items": [
      {
        "q": "find it hard to concentrate 里的 it 是什么成分？",
        "a": "it 是形式宾语，真正宾语是后面的不定式 to concentrate，hard 是宾语补足语。结构为 find/think/make + it + 形容词 + to do 或 that 从句。不能省掉 it，也不能把形容词改成副词。",
        "good": "I find it hard to concentrate in noisy rooms.",
        "bad": "I find hard to concentrate in noisy rooms."
      },
      {
        "q": "宾语补足语和双宾语怎么区分？",
        "a": "双宾语是两个名词，如 give me a book，可以改写成 give a book to me；宾补说明宾语的状态或身份，两个成分之间有逻辑主谓关系，不能这样转换。判断办法是在中间加 be，通顺就是宾补。",
        "good": "They call him a hero.",
        "bad": "They call him as a hero."
      },
      {
        "q": "see him crossing 和 see him cross 有什么不同？",
        "a": "crossing 强调动作正在进行、只看到片段；cross 强调看见整个过程。感官动词后接 -ing 表进行，接不带 to 的不定式表全过程。变成被动语态时要补回 to，如 he was seen to cross the street。",
        "good": "I saw him crossing the street when the light turned red.",
        "bad": "I saw him to cross the street."
      }
    ]
  },
  "with-absolute": {
    "summary": "with + 名词 + 分词／形容词：名词是分词的逻辑主语，整体相当于一个状语从句。",
    "items": [
      {
        "q": "分词用 doing 还是 done？",
        "a": "名词自己主动做这个动作 → doing；名词被做 → done。看名词和动作的关系，不看主句主语。",
        "good": "With the work finished, we went home.",
        "bad": "With the work finishing, we went home."
      },
      {
        "q": "这个结构在句子里作什么成分？",
        "a": "作状语，说明时间、原因、条件或伴随情况，放句首或句尾都可以，但不能当主语。",
        "good": "With time passing by, they became more and more nervous.",
        "bad": "With time passing by made them more and more nervous."
      },
      {
        "q": "和 and 并列有什么区别？",
        "a": "with 结构是从属的附带情况，主干只有主句；用 and 并列就成了两个同等的主干。",
        "good": "He sat by the window, with his eyes fixed on the hills.",
        "bad": "He sat by the window, with his eyes fixing on the hills."
      }
    ]
  },
  "absolute-noun": {
    "summary": "独立主格的名词和分词是逻辑主谓关系；它不是句子，加了 be 或 and 就散架。",
    "items": [
      {
        "q": "独立主格和 with 复合结构有什么区别？",
        "a": "意思和功能相同，都作状语，区别在语体：with 版本更口语、更常见，独立主格更书面、更紧凑。两者可以互换，如 With the work finished 与 The work finished。分词的选择规则也完全一致。",
        "good": "With the work finished, they went home.",
        "bad": "With the work finish, they went home."
      },
      {
        "q": "独立主格里能不能用形容词或介词短语？",
        "a": "可以。形容词如 His eyes wide open，介词短语如 Book in hand，都属于独立主格，只是没有分词而已。判断标准仍是前面的名词和后面的成分能否构成逻辑主谓关系，能构成就成立。",
        "good": "He sat in the corner, his eyes wide open.",
        "bad": "He sat in the corner, his eyes wide opened."
      },
      {
        "q": "独立主格前面能不能补个 be 动词或加 and？",
        "a": "不能。独立主格是短语不是分句，加了 be 就变成完整句子，再用逗号接主句就成了逗号粘连；加 and 则变成并列句，需要另加主语。想保留原结构，名词后面只能接分词、形容词或介词短语。",
        "good": "The meeting over, everyone left the room.",
        "bad": "The meeting was over, everyone left the room."
      }
    ]
  },
  "nested-clauses": {
    "summary": "嵌套从句一层套一层：先找最外层主句的主语和谓语，再顺着引导词往里剥。",
    "items": [
      {
        "q": "怎么断句？",
        "a": "每个引导词（that / which / who / whether / what / because）都开启一个新层级，先标出层级再翻译。",
        "good": "He said that the plan which we proposed would work.",
        "bad": "He said that the plan which we proposed it would work."
      },
      {
        "q": "一个 that 管到哪里？",
        "a": "管到下一个引导词出现或句子结束为止；里面的从句各自有自己的主谓，不要混成一层。",
        "good": "I know that what he said is true.",
        "bad": "I know that what he said it is true."
      },
      {
        "q": "翻译顺序怎么排？",
        "a": "中文一般先译外层主干，再把内层从句按“……的”放到被修饰的名词前面，或者单独拆成一句。",
        "good": "The idea that machines can learn is no longer new.",
        "bad": "The idea machines that can learn is no longer new."
      }
    ]
  },
  "long-sentence": {
    "summary": "长句难点不在生词，而在修饰成分多；先抓主干，再把修饰按中文习惯重排。",
    "items": [
      {
        "q": "怎么快速找到主干？",
        "a": "先找第一个实义动词，它前面是主语，后面是宾语或表语；其余成分都是修饰，先搁一边。",
        "good": "Researchers have found that small habits matter.",
        "bad": "Researchers have found small habits that matter have found."
      },
      {
        "q": "修饰成分放哪？",
        "a": "中文习惯先说时间、地点、条件，再落到主干；英文常把修饰往后放，翻译时顺序要换过来。",
        "good": "In recent years, researchers have found that daily habits matter.",
        "bad": "Researchers have found that daily habits matter in recent years, researchers."
      },
      {
        "q": "长句要不要拆开译？",
        "a": "一句中文装不下时，可以按从句拆成两三句，只要逻辑关系（因果、转折、条件）用连接词交代清楚。",
        "good": "The study shows that people who sleep well learn faster.",
        "bad": "The study shows that people who sleep well learn faster and the study shows."
      }
    ]
  },
  "long-insertion": {
    "summary": "插入语用一对逗号、破折号或括号夹住，删掉句子仍完整；先跳过它找主谓。",
    "items": [
      {
        "q": "插入语把主语和谓语隔得很远，谓语该跟谁一致？",
        "a": "跟原主语一致，插入语里的人或物不算主语：The students, especially those from rural areas, need help. 主语仍是 the students，用 need。判断时把插入语划掉，剩下的主谓须能独立成句；划掉后不成句，说明删的是句子成分。",
        "good": "The students, especially those from rural areas, need help.",
        "bad": "The students, especially those from rural areas, needs help."
      },
      {
        "q": "however 能不能像 but 一样连接两个句子？",
        "a": "不能，however 是副词，不是连词。它前面要用句号或分号断开：The plan was cheap; however, it failed.。只用逗号接上去就成了逗号粘连。though、although、but 才是连词，可以直接带从句，但 although 和 but 不能同时出现。",
        "good": "The plan was cheap; however, it failed.",
        "bad": "The plan was cheap, however it failed."
      },
      {
        "q": "逗号、破折号、括号夹住的插入语，有什么区别？",
        "a": "信息的重要程度不同。逗号最中性，表示顺带补充；破折号表示强调或突然转折，语气最重；括号表示次要旁注，可以完全不读。三者都必须成对使用，不能前面用逗号、后面用破折号，否则读者不知道插入语在哪里结束。",
        "good": "The data, collected over ten years, suggest a clear trend."
      }
    ]
  },
  "long-inversion": {
    "summary": "完全倒装是谓语整体提前，部分倒装只提前助动词；句首否定和 only 加状语都要倒。",
    "items": [
      {
        "q": "Here comes the bus 为什么不能说 Here comes it？",
        "a": "这是完全倒装：主语是名词，整个谓语才提到主语前；主语是代词则不倒装，说 Here it comes.。同类还有 There goes the bell. / There it goes.。地点状语提前也要求主语是名词，如 On the wall hangs a picture.",
        "good": "Here comes the bus.",
        "bad": "Here comes it."
      },
      {
        "q": "Only 放句首就一定倒装吗？",
        "a": "不一定，看 only 管什么。only 加状语放句首要部分倒装：Only then did I understand.；only 加主语不倒装：Only he knew the answer.。only 修饰状语从句时，倒装发生在主句，从句保持正常语序。",
        "good": "Only then did I understand.",
        "bad": "Only then I understood."
      },
      {
        "q": "hardly ... when 和 no sooner ... than 怎么用？",
        "a": "都表示“一……就……”：主句过去完成时，从句一般过去时。hardly/no sooner 放句首时主句部分倒装：Hardly had he arrived when it began to rain.。搭配固定，hardly 配 when，no sooner 配 than；倒装只在主句。",
        "good": "Hardly had he arrived when it began to rain.",
        "bad": "Hardly he had arrived when it began to rain."
      }
    ]
  },
  "long-ellipsis": {
    "summary": "省略要能原样补回；补回后主语、时态、比较对象都得对得上，否则就是漏词。",
    "items": [
      {
        "q": "than 后面到底省了什么，怎么判断补得对不对？",
        "a": "省的是与前文重复的部分，补回后要能成句：better than expected 即 than they were expected to be。关键是比较对象对等：The population of China is larger than that of India.，不能拿人口比国家。",
        "good": "The results were better than expected."
      },
      {
        "q": "if necessary、when possible 这类省略有条件吗？",
        "a": "有。从句主语和主句主语一致，而且从句谓语含 be 时，才能省掉“主语 + be”：If it is necessary, call me. 可以写成 If necessary, call me.。主语不一致就不能省，否则读者会错认逻辑主语。主动被动也不能混，省略后留下的分词要和逻辑主语对应。",
        "good": "If necessary, call me."
      },
      {
        "q": "省略不定式时，to 什么时候必须留着？",
        "a": "在 want、would like、hope、try 后，to 要留下：I didn't want to.。情态动词和助动词后的动词直接省：She can swim and he can too.。expect、hope 也可用 so/not 替代从句。",
        "good": "He asked me to stay, but I didn't want to.",
        "bad": "He asked me to stay, but I didn't want."
      }
    ]
  },
  "long-parallel": {
    "summary": "并列连词两端必须同类同级；not only 连接主语时谓语就近一致。",
    "items": [
      {
        "q": "not only ... but also 连接两个主语，谓语用单数还是复数？",
        "a": "按就近原则，跟 but also 后的主语一致：Not only the students but also the teacher was late.。顺序反过来就用 were。not only 放句首时前半句部分倒装，但连接主语时不倒装，照正常语序写。",
        "good": "Not only the students but also the teacher was late.",
        "bad": "Not only the students but also the teacher were late."
      },
      {
        "q": "rather than 和 prefer to 后面各接什么形式？",
        "a": "rather than 两边要平行：He decided to walk rather than drive.，前面是不定式，后面也用原形，不再加 to。prefer A to B 的 to 是介词，两边用名词或动名词：I prefer reading to watching TV.。",
        "good": "I prefer reading to watching TV.",
        "bad": "I prefer reading to watch TV."
      },
      {
        "q": "although 和 but 能一起用吗？",
        "a": "不能。although 是从属连词，已带出从句；but 是并列连词，两个一起用成了双重连接：Although he was tired, he kept working. 或 He was tired, but he kept working.。同理 because 和 so 也不能连用。",
        "good": "Although he was tired, he kept working.",
        "bad": "Although he was tired, but he kept working."
      }
    ]
  },
  "long-postmodifier": {
    "summary": "后置修饰由近到远层层套；从句谓语跟先行词一致，不看前面的 the number。",
    "items": [
      {
        "q": "one of the students who study 还是 who studies？",
        "a": "从句修饰最近的 students，用复数 study：He is one of the students who study hard.。若有 the only one of，中心词变成 one，从句改用单数：the only one ... who studies hard。",
        "good": "He is one of the students who study hard.",
        "bad": "He is one of the students who studies hard."
      },
      {
        "q": "名词后面用 doing 还是 done 修饰，怎么定？",
        "a": "看名词与动作是主动还是被动。名词自己做动作，用 doing：the man standing at the door；名词承受动作，用 done：the book written by Lu Xun。不及物动词的 done 只表完成，如 the fallen leaves。",
        "good": "The problems discussed at the meeting were serious.",
        "bad": "The problems discussing at the meeting were serious."
      },
      {
        "q": "定语从句和同位语从句都跟在名词后，怎么分？",
        "a": "看 that 在从句里作不作成分。定语从句的 that 作主语或宾语，可换成 which：the news that he told me；同位语从句的 that 不作成分，从句完整，只说明名词内容：the news that he had won。能换 which 的是定语从句。",
        "good": "The fact that he lied surprised us.",
        "bad": "The fact which he lied surprised us."
      }
    ]
  }
}

module.exports = { USAGE_NOTES }
