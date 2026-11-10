// 写译题库：四六级翻译真题整理，参考译文与采分点只保存在云端，判题前不下发。
// 新增题目时按同样字段追加即可，前端会自动出现新题。
const WRITING_QUESTIONS = [
  {
    id: 'c4-2019-06-jianzhi',
    level: 'cet4',
    levelLabel: '四级',
    year: '2019.06',
    topic: '民间艺术 · 剪纸',
    mode: 'zh2en',
    minutes: 20,
    prompt: '剪纸是中国民间艺术的一种独特形式，已有2000多年历史。剪纸很可能源于汉代，继纸张发明之后。从此，它在中国的许多地方得到了普及。剪纸用的材料和工具很简单：纸和剪刀。剪纸作品通常是用红纸做成的，因为红色在中国传统文化中与幸福相连。因此，在婚礼、春节等喜庆场合，红颜色的剪纸是门窗装饰的首选。',
    reference: 'Paper cutting is a unique form of Chinese folk art with a history of more than 2,000 years. It most probably originated in the Han Dynasty, shortly after paper was invented. Since then, it has spread to many parts of China. The materials and tools used for paper cutting are very simple: paper and scissors. Paper-cutting works are usually made of red paper, because red is associated with happiness in traditional Chinese culture. Therefore, on joyful occasions such as weddings and the Spring Festival, red paper cuttings are the first choice for decorating doors and windows.',
    points: ['剪纸的历史与起源', '材料与工具简单', '红色与幸福的联系', '婚礼、春节等场合的用途']
  },
  {
    id: 'c4-2019-06-denglong',
    level: 'cet4',
    levelLabel: '四级',
    year: '2019.06',
    topic: '传统器物 · 灯笼',
    mode: 'zh2en',
    minutes: 20,
    prompt: '灯笼起源于东汉，最初主要用于照明。在唐代，人们用红灯笼来庆祝安定的生活。从那时起，灯笼在中国的许多地方流行起来。灯笼通常用色彩鲜艳的薄纸制作，形状和尺寸各异。在中国传统文化中，红灯笼象征生活美满和生意兴隆，通常在春节、元宵节和国庆等节日期间悬挂。如今，世界上许多其他地方也能看到红灯笼。',
    reference: 'Lanterns originated in the Eastern Han Dynasty and were mainly used for lighting at first. During the Tang Dynasty, people used red lanterns to celebrate a stable life. Since then, lanterns have become popular in many parts of China. Lanterns are usually made of brightly coloured thin paper and come in different shapes and sizes. In traditional Chinese culture, red lanterns symbolise a happy life and a booming business, and they are usually hung during festivals such as the Spring Festival, the Lantern Festival and National Day. Today, red lanterns can also be seen in many other parts of the world.',
    points: ['灯笼的起源与最初用途', '唐代与红灯笼', '制作材料与形状', '象征意义与悬挂场合', '如今在世界的传播']
  },
  {
    id: 'c4-2019-06-wushi',
    level: 'cet4',
    levelLabel: '四级',
    year: '2019.06',
    topic: '民间表演 · 舞狮',
    mode: 'zh2en',
    minutes: 20,
    prompt: '舞狮作为中国传统民间表演已有2000多年历史。在狮子舞中，两位表演者同披一件狮子服，一个舞动头部，另一个舞动身体和尾巴。他们熟练配合，模仿狮子的各种动作。狮子是兽中之王，象征幸福和好运，所以人们通常在春节和其他节日期间表演狮子舞。狮子舞也可能出现在其他重要场合，如商店开业和结婚典礼，往往吸引许多人观赏。',
    reference: 'As a traditional Chinese folk performance, lion dancing has a history of more than 2,000 years. In the lion dance, two performers share one lion costume: one moves the head while the other moves the body and tail. They cooperate skilfully to imitate various movements of a lion. The lion is the king of animals and symbolises happiness and good luck, so people usually perform the lion dance during the Spring Festival and other festivals. It may also appear on other important occasions, such as the opening of a shop or a wedding ceremony, and it often attracts large crowds.',
    points: ['舞狮的历史', '两位表演者的分工', '狮子的象征意义', '表演场合与观众']
  },
  {
    id: 'c6-2019-06-hanyu',
    level: 'cet6',
    levelLabel: '六级',
    year: '2019.06',
    topic: '语言文化 · 汉语',
    mode: 'zh2en',
    minutes: 20,
    prompt: '汉语是世界上用作本族语人数最多的语言。汉语与西方语言的一个重要区别在于它是以方块字而不是以字母构成的。目前仍在使用的书写系统中，汉字是最古老的。在中国，越来越多的人学习英语，同时，世界上越来越多的人开始学习汉语。汉语热正在世界范围内兴起。',
    reference: 'Chinese is the language spoken as a mother tongue by more people than any other language in the world. An important difference between Chinese and Western languages is that it is made up of characters rather than letters. Among the writing systems still in use today, Chinese characters are the oldest. In China, more and more people are learning English, while in the rest of the world an increasing number of people are beginning to learn Chinese. A Chinese-language fever is rising across the world.',
    points: ['汉语的使用人数', '方块字与字母的区别', '汉字的历史地位', '中外语言学习热潮']
  },
  {
    id: 'c6-2019-06-chengyu',
    level: 'cet6',
    levelLabel: '六级',
    year: '2019.06',
    topic: '语言文化 · 成语',
    mode: 'zh2en',
    minutes: 20,
    prompt: '成语是汉语中的一种独特的表达方式，大多由四个汉字组成。它们高度简练，含义深刻，而且读起来朗朗上口。成语大多来源于中国古代的文学作品，通常与某些历史事件或人物有关。它们中有许多已经使用了数千年，至今仍被广泛使用。',
    reference: 'Idioms are a unique form of expression in Chinese, most of which consist of four characters. They are highly concise, carry deep meanings and read smoothly. Most idioms come from ancient Chinese literature and are usually related to certain historical events or figures. Many of them have been in use for thousands of years and are still widely used today.',
    points: ['成语的定义与字数', '简练、含义深、读起来顺口', '来源于古代文学与历史', '沿用数千年']
  },
  {
    id: 'c6-2019-06-fangyan',
    level: 'cet6',
    levelLabel: '六级',
    year: '2019.06',
    topic: '语言文化 · 方言',
    mode: 'zh2en',
    minutes: 20,
    prompt: '中国土地广阔，人口众多。尽管全国都讲汉语，但是不同地区的人们有时很难听懂对方讲的话。这种语言差别是由于不同的方言造成的。中国方言的差异不仅表现在发音上，还表现在词汇和语法方面。普通话是全国通用的语言，也是中国政府推广的官方语言。',
    reference: 'China has a vast territory and a large population. Although Chinese is spoken throughout the country, people from different regions sometimes have difficulty understanding each other. This language difference is caused by different dialects. Differences among Chinese dialects are reflected not only in pronunciation but also in vocabulary and grammar. Putonghua, or Mandarin, is the language commonly used across the country and is the official language promoted by the Chinese government.',
    points: ['中国地域与人口', '不同地区互相听不懂', '方言造成差异', '发音、词汇、语法三方面', '普通话的地位']
  },
  {
    id: 'c6-2017-06-tangchao',
    level: 'cet6',
    levelLabel: '六级',
    year: '2017.06',
    topic: '历史朝代 · 唐朝',
    mode: 'zh2en',
    minutes: 20,
    prompt: '唐朝始于618年，终于907年，是中国历史上最灿烂的时期之一。经过三百年的发展，唐代中国成为世界上最繁荣的国家之一，其首都长安是当时世界上最大的都市。这一时期，中国的艺术、文学和科技都取得了巨大成就，对周边国家产生了深远影响。',
    reference: 'The Tang Dynasty began in 618 and ended in 907, and was one of the most glorious periods in Chinese history. After three hundred years of development, Tang China became one of the most prosperous countries in the world, and its capital, Chang\'an, was the largest city of its time. During this period, China made great achievements in art, literature and technology, which had a profound influence on neighbouring countries.',
    points: ['唐朝起止时间', '繁荣程度与长安的地位', '艺术、文学、科技成就', '对周边国家的影响']
  },
  {
    id: 'c6-2017-06-songchao',
    level: 'cet6',
    levelLabel: '六级',
    year: '2017.06',
    topic: '历史朝代 · 宋朝',
    mode: 'zh2en',
    minutes: 20,
    prompt: '宋朝始于960年，一直延续到1279年。这一时期，中国经济大幅增长，成为世界上最先进的经济体之一。宋朝的科技发展达到了新的高度，指南针、火药和活字印刷术都得到了广泛应用。与此同时，城市生活日益繁荣，文化艺术也取得了辉煌成就。',
    reference: 'The Song Dynasty began in 960 and lasted until 1279. During this period, China\'s economy grew substantially and became one of the most advanced in the world. Science and technology in the Song Dynasty reached a new height, with the compass, gunpowder and movable-type printing widely used. At the same time, urban life became increasingly prosperous, and brilliant achievements were made in culture and the arts.',
    points: ['宋朝起止时间', '经济增长与先进地位', '三大发明得到应用', '城市生活与文化艺术']
  },
  {
    id: 'c6-2017-06-mingchao',
    level: 'cet6',
    levelLabel: '六级',
    year: '2017.06',
    topic: '历史朝代 · 明朝',
    mode: 'zh2en',
    minutes: 20,
    prompt: '明朝始于1368年，终于1644年。明朝初期，中国经济迅速发展，国力强盛。明朝的造船和航海技术十分发达，郑和曾率领庞大的船队七下西洋，加强了中外交流。明朝还修建了长城的重要段落，留下了许多珍贵的文化遗产。',
    reference: 'The Ming Dynasty began in 1368 and ended in 1644. In the early Ming period, China\'s economy developed rapidly and the country became powerful. Shipbuilding and navigation were highly advanced, and Zheng He led huge fleets on seven voyages to the Western Ocean, strengthening exchanges between China and other countries. The Ming Dynasty also built important sections of the Great Wall and left behind many valuable cultural legacies.',
    points: ['明朝起止时间', '初期经济与国力', '造船航海与郑和下西洋', '长城与文化遗产']
  },
  // —— 以下由历年四六级真题翻译自动导入，重新生成时整段替换 ——
  {
    "id": "tr-cet4-2025-12-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2025.12",
    "topic": "经济",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "近年来，中国政府高度重视民营经济(private economy)的发展，出台了一系列政策支持民营企业。截至2025年3月底，全国民营企业数量超过5700万家，占企业总量的92.3%。民营企业不仅数量稳步增长，质量和结构也在不断提升。民营企业的研发投入不断增加，在新一代信息技术、人工智能等领域发展迅速。民营企业核心竞争力的增强为中国经济的高质量发展提供了有力支撑。",
    "reference": "In recent years, the Chinese government has attached great importance to the development of the private economy and introduced a series of policies to support private enterprises. As of the end of March 2025, the number of private enterprises nationwide has exceeded 57 million, accounting for 92.3% of the total number. Private enterprises have achieved not only steady growth in quantity but also continuous improvement in quality and structure. With increasing investment in research and development, private enterprises have expanded rapidly in fields such as new-generation information technology and artificial intelligence. The enhanced core competitiveness of private enterprises has provided strong support for China’s high-quality economic development.",
    "points": [
      "近年来，中国政府高度重视民营经济(private…",
      "截至2025年3月底，全国民营企业数量超过570…",
      "民营企业不仅数量稳步增长，质量和结构也在不断提升",
      "民营企业的研发投入不断增加，在新一代信息技术、人…",
      "民营企业核心竞争力的增强为中国经济的高质量发展提…"
    ]
  },
  {
    "id": "tr-cet6-2025-12-1",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2025.12",
    "topic": "历史文化 · 尊老",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "尊老是中华民族的传统美德，深深植根于中国人的思想和行为中，是人们普遍遵守的行为规范和社会准则。在当今的中国，这种美德得到广泛传承。社会各界积极营造敬老助老的社会氛围。为老年人提供便利服务已成为社会共识，例如社区专门开设长者食堂，公共场所配置优先座位。政府还出台了一系列政策，为老年人的权益提供有力保障。尊老是社会和谐与发展的重要基石，有助于培育良好的社会氛围，推动整个社会文明进步。",
    "reference": "Respecting the elderly is a traditional virtue of the Chinese nation, deeply rooted in the thoughts and actions of Chinese people, acting as a widely observed behavioral norm and social principle. In contemporary China, this virtue continues to be widely passed down. All sectors of society actively foster a social atmosphere of valuing and supporting the elderly. Providing convenient services for older adults has become a societal consensus—for instance, communities have established dedicated senior canteens, and priority seating is available in public spaces. The government has also implemented a series of policies to provide strong safeguards for the rights and interests of the elderly. Respecting the elderly serves as a crucial cornerstone for social harmony and development, contributing to the cultivation of a positive social atmosphere and promoting social progress and civilization.",
    "points": [
      "尊老是中华民族的传统美德，深深植根于中国人的思想…",
      "在当今的中国，这种美德得到广泛传承",
      "社会各界积极营造敬老助老的社会氛围",
      "为老年人提供便利服务已成为社会共识，例如社区专门…",
      "政府还出台了一系列政策，为老年人的权益提供有力保…"
    ]
  },
  {
    "id": "tr-cet4-2025-12-2",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2025.12",
    "topic": "历史文化",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "近年来，“城市漫步(citywalk)”在中国的年轻人中悄然兴起，已成为一种旅游新潮流。与传统旅游不同，城市漫步不追求在短时间内游览尽可能多的景点，而是随意行走或按照主题路线漫步在城市的大街小巷。漫步者品尝地道小吃，欣赏特色建筑，了解当地生活方式。他们还用相机或手机记录城市的风景和人物。这种旅游方式能让城市漫步者更深入了解城市的历史与文化。",
    "reference": "In recent years, “city walk” has quietly emerged among young people in China, becoming a new travel trend. Unlike traditional tourism, city walk does not aim to visit as many attractions as possible in a short period. Instead, it involves strolling casually or following themed routes through the streets and alleys of a city. Walkers sample local snacks, admire distinctive architecture, and learn about the local way of life. They also capture the city’s scenery and people with cameras or smartphones. This form of travel allows city walkers to gain a deeper understanding of the city’s history and culture.",
    "points": [
      "近年来，“城市漫步(citywalk)”在中国的…",
      "与传统旅游不同，城市漫步不追求在短时间内游览尽可…",
      "漫步者品尝地道小吃，欣赏特色建筑，了解当地生活方…",
      "他们还用相机或手机记录城市的风景和人物",
      "这种旅游方式能让城市漫步者更深入了解城市的历史与…"
    ]
  },
  {
    "id": "tr-cet6-2025-12-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2025.12",
    "topic": "历史文化",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "中华民族崇尚自强自立的精神，这一精神深植于中国文化之中，是民族生存与发展的重要支撑。改革开放以来，中国在自强自立的征程上，持续加大科研投入，在信息技术、人工智能、航天工程等领域不断取得新突破。5G网络覆盖全国，远程医疗发展迅速，电子支付的使用全球领先，嫦娥探月工程展现了航天领域引人注目的发展。",
    "reference": "The Chinese nation upholds the spirit of self-improvement and self-reliance, which is deeply rooted in Chinese culture and serves as a vital pillar for the nation’s survival and development. Since the reform and opening-up, China has continuously increased investment in scientific research in its journey of self-improvement and selfreliance, achieving new breakthroughs in fields such as information technology, artificial intelligence, and aerospace engineering. 5G networks now cover the entire country; telemedicine has developed rapidly; the adoption of electronic payment leads the world, and Chang’e lunar exploration program has demonstrated remarkable progress in aerospace. The spirit of self-improvement and self-reliance has become a powerful driving force in advancing the nation’s modernization, inspiring the Chinese people to strive relentlessly toward realizing the Chinese Dream of national rejuvenation.",
    "points": [
      "中华民族崇尚自强自立的精神，这一精神深植于中国文…",
      "改革开放以来，中国在自强自立的征程上，持续加大科…",
      "5G网络覆盖全国，远程医疗发展迅速，电子支付的使…"
    ]
  },
  {
    "id": "tr-cet4-2025-12-3",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2025.12",
    "topic": "经济 · 健康等产业的发展",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "健康等产业的发展，创造了可观的经济效益。如今，生态环境与人类社会和谐共存的观念在中国已深人人心。绿色经济的推进不仅能为中国可持续发展做出贡献，也为全球环境保护提供了宝贵经验。",
    "reference": "The Chinese government places great emphasis on the development of the green economy. Through a series of measures, such as strengthening the protection of forest resources and intensifying pollution control, the ecological environment in many regions has been significantly improved. Lucid waters and lush mountains have boosted the growth of local industries like tourism and healthcare, generating substantial economic benefits. Today, the concept of harmonious coexistence between the ecological environment and human society has taken deep root in China. The advancement of the green economy not only contributes to China’s sustainable development but also provides valuable experience for global environmental protection.",
    "points": [
      "健康等产业的发展，创造了可观的经济效益",
      "如今，生态环境与人类社会和谐共存的观念在中国已深…",
      "绿色经济的推进不仅能为中国可持续发展做出贡献，也…"
    ]
  },
  {
    "id": "tr-cet6-2025-12-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2025.12",
    "topic": "历史文化 · 节俭",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "节俭（frugality）是中华民族的传统美德。在中国古代，生产力低下，先人们深知劳动成果来之不易，因而秉持节俭的理念。到了物质极大丰富的今天，中国人民依然坚持节俭的生活方式，体现了理性消费的生活理念和对劳动的尊重。近年来，中国政府持续加强节约型社会的建设，倡导“光盘行动”，减少食物浪费，提倡简约低碳的生活方式，推进资源循环利用，反对过度消费。节约型社会的建设有力地推动了中国经济的高质量发展。",
    "reference": "Frugality is a traditional virtue of the Chinese nation. In ancient China, due to low productivity, our ancestors were deeply aware of the hard-earned nature involved in creating the fruits of labor and thus upheld the principle of thrift. Even today, amid material abundance, the Chinese people still adhere to a frugal lifestyle, embodying the life concept of rational consumption and respect for labor. In recent years, the Chinese government has continuously strengthened the construction of a conservation-oriented society. In this context, it advocates the “Clean Plate Campaign” to reduce food waste, promotes a simple and low-carbon lifestyle, advances resources recycling, and opposes excessive consumption. The construction of a conservation-oriented society has provided strong impetus for China’s high-quality economic growth.",
    "points": [
      "节俭（frugality）是中华民族的传统美德",
      "在中国古代，生产力低下，先人们深知劳动成果来之不…",
      "到了物质极大丰富的今天，中国人民依然坚持节俭的生…",
      "近年来，中国政府持续加强节约型社会的建设，倡导“…",
      "节约型社会的建设有力地推动了中国经济的高质量发展"
    ]
  },
  {
    "id": "tr-cet4-2025-06-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2025.06",
    "topic": "环境",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "被誉为“杂交水稻(hybridrice)之父”的袁隆平和他的科研团队克服重重困难，研发出了一种超级杂交水稻。这项技术获得了举世公认的巨大成功。通过这项技术的应用，水稻抗旱抗病能力更强，能适应不同的气候和土壤条件，产量可提高20-30%。超级杂交水稻营养丰富，口感更佳。目前，这项技术已经在许多国家得到广泛应用，为全球粮食安全做出了重大贡献。",
    "reference": "Yuan Longping, known globally as the “Father of Hybrid Rice”, and his research team overcame numerous challenges to successfully develop a super hybrid rice variety. This technology has been universally recognized as a tremendous success. Through the application of this technology, the rice exhibits stronger drought and disease resistance, adapts to diverse climatic and soil conditions, and achieves a 20-30% increase in yield.",
    "points": [
      "被誉为“杂交水稻(hybridrice)之父”的…",
      "这项技术获得了举世公认的巨大成功",
      "通过这项技术的应用，水稻抗旱抗病能力更强，能适应…",
      "超级杂交水稻营养丰富，口感更佳",
      "目前，这项技术已经在许多国家得到广泛应用，为全球…"
    ]
  },
  {
    "id": "tr-cet6-2025-06-1",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2025.06",
    "topic": "经济 · 驻留三名宇航员",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "驻留三名宇航员，在距地球表面400-450公里的轨道上运行。天宫空间站已实施180多个科学研究与应用项目，涉及空间生命科学、太空医学、空间材料科学等领域。天宫空间站的研究成果在我国得到了广泛应用,产生了显著的经济效益。例如，太空育种创造的直接经济效益高达数千亿元。这不仅标志中国在航天技术上取得了巨大进步，也表明中国为全球的太空研究和应用做出了重大贡献。",
    "reference": "M: Good morning. My name is Bob Fetterman. Tm the computer technician. W: Didn't I call for you last week? M: Maybe? I work fbr Alpha Maintenance. I imagine someone from your office called our central office and I'm the engineer designated to your case. W: [1] Yeah, I spoke to a lady there last Tuesday, which is now 10 days ago. I made it clear it was an urgent matter and please send someone as soon as possible. Couldn't you or someone else have come sooner? M: I'm sorry, but Fm not in charge of scheduling all logistics. I simply do not know. [2] All I can tell you is I got the call this week and came as soon as I could. W: I see. [3] Well, I'll have you know, my manager is rather indignant that it's taken you this long to come. I understand it might not be your fault, but nevertheless, you should know what the feeling is around here. M: I understand, and I'm sorry for any inconvenience. I will try to resolve your computer problem as swiftly and optimally as I can. What and where is the issue? W: Ifs this machine right here. It was running slow for a while, I guess, and gradually got worse and worse. Last Tuesday, it just stopped working altogether. If you switch it on, you will see what I mean. M: Okay. [4] Do you know if it's backed up? W: Backed up? M: I mean, do you know if its contents have been copied and saved somewhere else? W: I don't know. M: Well, depending on the ensuing operative scenario, if I need to wipe the system directories clean in order to reconfigure default protocols, then my first intervention should be to intricately retrieve all inventories that I can. Otherwise, all data that was stored on its hard drive will be forever lost. W: [4] My manager would know. Let me go get him.",
    "points": [
      "驻留三名宇航员，在距地球表面400-450公里的…",
      "天宫空间站已实施180多个科学研究与应用项目，涉…",
      "天宫空间站的研究成果在我国得到了广泛应用,产生了…",
      "例如，太空育种创造的直接经济效益高达数千亿元",
      "这不仅标志中国在航天技术上取得了巨大进步，也表明…"
    ]
  },
  {
    "id": "tr-cet4-2025-06-2",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2025.06",
    "topic": "历史文化",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "近年来，中国东北地区正在大力开发冰雪资源。例如，哈尔滨利用丰富的冰雪资源打造了极具地方特色的“冰雪大世界”，让游客在欣赏冰雪之美的同时也能体验当地独特的民俗文化。如今，曾令人畏惧的冰天雪地正吸引着四面八方的游客，成为深受欢迎的旅游胜地。冰雪旅游业正为当地的经济发展做出越来越大的贡献。",
    "reference": "In recent years, Northeast China has been vigorously developing its ice and snow resources. For instance, Harbin has created the highly distinctive “Ice and Snow World” by leveraging its abundant ice and snow resources, allowing visitors to appreciate the beauty of ice and snow while experiencing the region’s unique folk culture. What was once an intimidating frozen landscape is now attracting tourists from all directions, becoming a highly popular tourist destination. The ice and snow tourism industry is making an increasingly significant contribution to local economic development.",
    "points": [
      "近年来，中国东北地区正在大力开发冰雪资源",
      "例如，哈尔滨利用丰富的冰雪资源打造了极具地方特色…",
      "如今，曾令人畏惧的冰天雪地正吸引着四面八方的游客…",
      "冰雪旅游业正为当地的经济发展做出越来越大的贡献"
    ]
  },
  {
    "id": "tr-cet6-2025-06-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2025.06",
    "topic": "经济",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "完善的交通基础设施和丰富的产业资源。大湾区是中国开放程度最高、经济活力最强的区域之一，在国家经济发展中具有重要的战略地位。大湾区不仅将建成充满活力的世界级城市群和具有全球影响力的国际科技创新中心，还将打造成适合工作、购物、旅游的优质生活圈。随着改革开放的不断深入，大湾区的建设将进一步推动区域经济发展。到2035年，大湾区将实现成为国际一流湾区的目标。",
    "reference": "The Guangdong-Hong Kong-Macao Greater Bay Area is endowed with exceptional geographic location, well-developed transportation infrastructure, and abundant industrial resources. As one of China’s most open and economically vibrant regions, the Greater Bay Area holds significant strategic importance in the nation’s economic development. It will be developed not only into a dynamic world-class city cluster and an international technology innovation hub with global influence, but also into a high-quality living circle ideal for working, shopping, and tourism. With the deepening of reform and opening-up, the construction of the Greater Bay Area will further propel regional economic growth. By 2035, the Greater Bay Area will achieve its goal of becoming a world-class bay area.",
    "points": [
      "完善的交通基础设施和丰富的产业资源",
      "大湾区是中国开放程度最高、经济活力最强的区域之一…",
      "大湾区不仅将建成充满活力的世界级城市群和具有全球…",
      "随着改革开放的不断深入，大湾区的建设将进一步推动…",
      "到2035年，大湾区将实现成为国际一流湾区的目标"
    ]
  },
  {
    "id": "tr-cet4-2025-06-3",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2025.06",
    "topic": "教育",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "居民步行15分钟就能享受到日常所需的公共服务。生活圈内建有便利店、公园、健身场地、图书馆、学校、社区食堂、诊所等。生活圈的建立能够为居民提供更加便利、舒适、友好、愉悦的生活环境，更好地满足城市居民多元化的日常生活服务需求，提升居民的生活品质和幸福感。",
    "reference": "In recent years, an increasing number of cities in China have been focusing on building the“15-minute convenient living circles”. Local communities can access daily public services within a 15-minute walk. These living circles include facilities such as convenience stores, parks, fitness areas, libraries, schools, community canteens, and clinics. These living circles are built to provide residents with a more convenient, comfortable, friendly, and enjoyable living environment, better meeting the needs of diverse everyday services of urban dwellers while enhancing their quality of life and sense of happiness.",
    "points": [
      "居民步行15分钟就能享受到日常所需的公共服务",
      "生活圈内建有便利店、公园、健身场地、图书馆、学校…",
      "生活圈的建立能够为居民提供更加便利、舒适、友好、…"
    ]
  },
  {
    "id": "tr-cet6-2025-06-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2025.06",
    "topic": "经济 · 大水利工程",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "大水利工程。历经数十年的规划与筹备，工程于2002年开工建设，分为东、中、西三条线路，总长4350公里，惠及人口将超过4亿。自2014年通水以来，工程向北方调水累计已超500亿立方米，为北方地区的人民提供了可靠的水资源，同时也极大地改善了这一地区的生态环境，促进了经济的可持续健康发展。",
    "reference": "Since ancient times, China has faced an uneven distribution of water resources, with the north being water- scarce and the south water-abundant. To effectively address the critical water shortage in the northern regions, the Chinese government implemented the South-to-North Water Diversion Project. This is a grand water conservancy project for allocating water resources across regions. After decades of planning and preparation, construction on the project began in 2002 and is divided into three routes: East, Central, and West, with a total length of 4,350 kilometers, benefiting a population of over 400 million. Since its operational launch in 2014, the project has transferred more than 50 billion cubic meters of water to the north, providing a reliable water supply for the people in northern regions while significantly improving the local ecological environment and promoting sustainable and healthy economic development.",
    "points": [
      "大水利工程",
      "历经数十年的规划与筹备，工程于2002年开工建设…",
      "自2014年通水以来，工程向北方调水累计已超50…"
    ]
  },
  {
    "id": "tr-cet4-2024-12-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2024.12",
    "topic": "城市交通",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "中国政府十分重视环境保护。近年来，中国在减少空气、水和土壤污染上取得了显著成效。为了不断改善人们的生活环境，中国采取了一系列有效措施，包括大力发展清洁能源，改善公共交通，推广共享单车，实施垃圾分类。通过这些措施，中国的城市和农村正在绿起来、美起来。中国还积极参与国际合作，为全球环境保护做出了重要贡献。",
    "reference": "The Chinese government places great emphasis on environmental protection. In recent years, China has made remarkable progress in reducing air, water, and soil pollution. To continuously enhance people’s living environment, China has implemented a series of effective measures, such as vigorously developing clean energy, improving public transportation, promoting shared cycling, and introducing garbage classification. Through these initiatives, China’s cities and rural areas are becoming greener and more beautiful. Additionally, China actively participates in international cooperation, making significant contributions to global environmental protection.",
    "points": [
      "中国政府十分重视环境保护",
      "近年来，中国在减少空气、水和土壤污染上取得了显著…",
      "为了不断改善人们的生活环境，中国采取了一系列有效…",
      "通过这些措施，中国的城市和农村正在绿起来、美起来",
      "中国还积极参与国际合作，为全球环境保护做出了重要…"
    ]
  },
  {
    "id": "tr-cet4-2024-12-3",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2024.12",
    "topic": "历史文化",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "敦煌莫高窟（MogaoGrottoes）数字展示中心于2014年开放启用，是莫高窟保护利用工程的重要组成部分。展示中心采用数字技术和多媒体展示手段，使游客进入洞窟参观之前就能了解莫高窟的历史文化，鉴赏莫高窟的艺术经典。这将减少开放洞窟的数量，缩短游客在洞窟内的逗留时间，减轻参观对莫高窟造成的影响，以使这一世界文化遗产得到妥善保护、长久利用。",
    "reference": "The Digital Exhibition Center of the Dunhuang Mogao Grottoes, which opened in 2014, serves as a crucial component of the Mogao Grottoes conservation and utilization project. By utilizing digital technology and multimedia displays, the exhibition center enables visitors to familiarize themselves with the history and culture of the Mogao Grottoes and appreciate its artistic masterpieces prior to entering the actual grottoes for sightseeing. This will reduce the number of grottoes open to visitors, shorten their stay within the grottoes, and minimize the impact of visiting, thereby ensuring the proper conservation and sustainable utilization of this world cultural heritage.",
    "points": [
      "敦煌莫高窟（MogaoGrottoes）数字展示…",
      "展示中心采用数字技术和多媒体展示手段，使游客进入…",
      "这将减少开放洞窟的数量，缩短游客在洞窟内的逗留时…"
    ]
  },
  {
    "id": "tr-cet4-2024-06-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2024.06",
    "topic": "历史文化 · 四合院",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "四合院(siheyuan)是中国一种传统的住宅建筑,其特点是房屋建造在一个院子的四周,将院子合围在中间.四合院通常冬暖夏凉,环境舒适,尤其适合大家庭居住.四合院在中国各地有多种类型,其中以北京的四合院最为典型.如今,随着现代城市的发展,传统的四合院已逐渐减少,但因其独特的建筑风格,四合院对中国文化的传承和中国历史的研究具有重要意义.",
    "reference": "Siheyuan is a kind of traditional Chinese residential building, which is characterized by houses built around a courtyard, enclosing the courtyard in the middle. Siheyuan is usually warm in winter and cool in summer, offering a comfortable environment, especially suitable for large families to live in. There are many types of Siheyuan in different parts of China, of which the most typical one is in Beijing. Nowadays, with the development of modern cities, the number of traditional Siheyuan has gradually decreased, but because of its unique architectural style, Siheyuan is of great significance to the inheritance of Chinese culture and the study of Chinese history.",
    "points": [
      "四合院(siheyuan)是中国一种传统的住宅建…"
    ]
  },
  {
    "id": "tr-cet4-2024-06-2",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2024.06",
    "topic": "节日习俗 · 农历起源",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "农历（thelunarcalendar）起源于数千年前的中国，根据太阳和月亮的运行规律制定。长期以来，农历在农业生产和人们日常生活中发挥着重要作用。古人依据农历记录日期、安排农活，以便最有效地利用自然资源和气候条件，提高农作物的产量和质量。中国的春节、中秋节等传统节日的日期都基于农历。农历是中国传统文化的重要组成部分，当今依然广为使用。",
    "reference": "The lunar calendar, which originated in China thousands of years ago, was formulated based on the movements of the sun and the moon. For a long time, the lunar calendar has played an important role in agricultural production and people’s daily lives. Ancient people recorded dates and arranged farm work according to the lunar calendar in order to make the most efficient use of natural resources and climatic conditions to improve the yield and quality of crops. The Chinese Spring Festival, Mid-Autumn Festival and other traditional festivals are based on the lunar calendar. It is an important component of traditional Chinese culture and is still widely used today.",
    "points": [
      "农历（thelunarcalendar）起源于数…",
      "长期以来，农历在农业生产和人们日常生活中发挥着重…",
      "古人依据农历记录日期、安排农活，以便最有效地利用…",
      "中国的春节、中秋节等传统节日的日期都基于农历",
      "农历是中国传统文化的重要组成部分，当今依然广为使…"
    ]
  },
  {
    "id": "tr-cet6-2024-06-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2024.06",
    "topic": "环境 · 盛产竹子",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "中国盛产竹子，是最早开发利用竹资源的国家。竹子在中国分布广泛，品种丰富。竹子实用性强，用于生产和生活的许多方面，如筷子、桌椅的制作和桥梁、房屋的建造。中国人爱竹，自古以来就有无数文人以竹为主题，创作了绚丽多彩的文学和绘画作品。竹子主干(stem)笔直，象征正直的品格。竹子具有强大的生命力和适应能力，无论环境多么恶劣，都能够顽强生存，因而寓意坚韧不拔的精神。几千年来，竹子一直被视为中华民族品格的象征。",
    "reference": "China is rich in bamboo and is the first country to exploit and utilize bamboo resources. Bamboo is extensively distributed and diverse in variety within China. Bamboo is highly versatile and is used in various aspects of production and daily life, such as the making of chopsticks, tables, and chairs, as well as the construction of bridges and houses. The Chinese have a deep affection for bamboo, and since ancient times, numerous scholars have created colorful literature and paintings on the theme of bamboo. The stem of bamboo is straight, symbolizing integrity. Bamboo exhibits remarkable vitality and adaptability, able to survive toughly no matter how harsh the environment is, thus embodying the spirit of unwavering perseverance. For thousands of years, bamboo has been esteemed as a representation of the character of the Chinese nation.",
    "points": [
      "中国盛产竹子，是最早开发利用竹资源的国家",
      "竹子在中国分布广泛，品种丰富",
      "竹子实用性强，用于生产和生活的许多方面，如筷子、…",
      "中国人爱竹，自古以来就有无数文人以竹为主题，创作…",
      "竹子主干(stem)笔直，象征正直的品格"
    ]
  },
  {
    "id": "tr-cet4-2024-06-3",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2024.06",
    "topic": "节日习俗 · 汉语中的福字包表",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "汉语中的“福”字(thecharacter包)表示幸福和好运,是中国传统文化中最常用的吉祥(auspicious)符号之一。人们通常将一个大大的福字写在红纸上,语意期盼家庭幸福社会安定、国家昌盛。春节贴福字是民间由来已久的习俗。为了欢庆春节,家家户户都会将福字贴在门上或墙上,表达对幸福生活的向往、对美好未来的期待。人们有时还将福字倒过来贴,表示幸福已到、好运已到。",
    "reference": "As one of the most commonly used auspicious symbols in traditional Chinese culture, the Chinese character fu means happiness and good fortune. People usually write a large fu on red paper, hoping for a happy family. a stable society, and a prosperous nation, Pasting fw during the Spring Festival has been a long-standing folk tradition. In celebration of the festival, every household pastes the character on the door or the wall, expressing their longing for a happy life and a beautiful future. Sometimes people paste the character upside down, which signifies the arrival of blessing and good luck.",
    "points": [
      "汉语中的“福”字(thecharacter包)表…",
      "人们通常将一个大大的福字写在红纸上,语意期盼家庭…",
      "春节贴福字是民间由来已久的习俗",
      "为了欢庆春节,家家户户都会将福字贴在门上或墙上,…",
      "人们有时还将福字倒过来贴,表示幸福已到、好运已到"
    ]
  },
  {
    "id": "tr-cet6-2024-06-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2024.06",
    "topic": "民间艺术",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "扇子自古以来就深受中国人喜爱，但现在已不只是消暑纳凉的工具，而更多地作为艺术品供人欣赏。许多扇子造型优美、做工精良，并绘有山水、花鸟、人物等精美图案，具有很高的艺术价值。中国许多著名画家和书法家喜欢在扇子上作诗绘画，展示其艺术品味。扇子常作为礼物赠予他人，表达美好的祝福和真挚的情感。如今，扇子的实用功能已大为减弱，但作为一种文化符号和艺术形式，扇子仍然在中国传统文化中扮演着重要角色。",
    "reference": "Fans have been cherished by the Chinese people since ancient times, yet now they are no longer merely tools for relieving summer heat; instead, they are increasingly admired as works of art. Many fans feature elegant shapes, fine craftsmanship, and are painted with intricate designs of landscapes, flowers, birds, and figures, holding high artistic value. Many renowned Chinese painters and calligraphers delight in inscribing poems and painting pictures on fans, showing their artistic taste. Fans are frequently presented as gifts, conveying delightful blessings and heartfelt emotions. Today, the practical utility of fans has significantly diminished, yet as a cultural icon and a form of art, they continue to play an important role in traditional Chinese culture.",
    "points": [
      "扇子自古以来就深受中国人喜爱，但现在已不只是消暑…",
      "许多扇子造型优美、做工精良，并绘有山水、花鸟、人…",
      "中国许多著名画家和书法家喜欢在扇子上作诗绘画，展…",
      "扇子常作为礼物赠予他人，表达美好的祝福和真挚的情…",
      "如今，扇子的实用功能已大为减弱，但作为一种文化符…"
    ]
  },
  {
    "id": "tr-cet4-2023-12-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2023.12",
    "topic": "健康",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "中国政府十分重视人民的健康饮食（diet）o通过大力提倡健康饮食，人们对合理营养增进健康的重要性有了更加深刻的认识。“吃得安全、吃得营养、吃得健康”是人民对美好生活的基本需要，是提升人民幸福感的必然要求，也为食品产业的发展提供了新机遇。目前，各级政府都在采取多种举措确保人民饮食健康，推进健康中国的建设。",
    "reference": "The Chinese government attaches great importance to the healthy diet of people. By vigorously advocating healthy diet, people have gained a deeper understanding of the importance of reasonable nutrition in promoting health. “Eating safely, nutritiously, and healthily^^ is a basic need for people to have a better life, an inevitable requirement fbr enhancing people's sense of happiness, and also provides new opportunities fbr the development of the food industry. At present, governments at all levels are taking various measures to ensure the healthy diet of people and promote the construction of a healthy China.",
    "points": [
      "中国政府十分重视人民的健康饮食（diet）o通过…",
      "“吃得安全、吃得营养、吃得健康”是人民对美好生活…",
      "目前，各级政府都在采取多种举措确保人民饮食健康，…"
    ]
  },
  {
    "id": "tr-cet6-2023-12-1",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2023.12",
    "topic": "社会生活",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "在中国，随着老龄化社会的到来，养老受到普遍关注。人们谈论最多的是应当采取什么样的养老模式。多数人认为，养老模式需要多元化。可以通过政府引导和社会参与，建立更多更好的养老服务机构，改进社区服务中心，鼓励居家自助养老，还可以推行家庭养老与社会养老相结合的模式。",
    "reference": "In China, with the arrival of an aging society, the elderly care has received widespread attention. What people talk about the most is what kind of elderly care model should be adopted. Most people believe that the elderly care model needs to be diversified. Through government guidance and social participation, we can establish more and better elderly care service institutions, improve community service centers, encourage home-based self-help elderly care, and promote a model combining family and social elderly care. With the increasing investment in elderly care services from the government and society, elderly care facilities will continue to be upgraded, service quality will be gradually improved, and the elderly will live a more convenient, more comfortable, healthier and happier life.",
    "points": [
      "在中国，随着老龄化社会的到来，养老受到普遍关注",
      "人们谈论最多的是应当采取什么样的养老模式",
      "多数人认为，养老模式需要多元化",
      "可以通过政府引导和社会参与，建立更多更好的养老服…"
    ]
  },
  {
    "id": "tr-cet4-2023-12-2",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2023.12",
    "topic": "经济 · 改革开放以来",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "改革开放以来，中国人的饮食（diet）发生了显著变化。过去由于经济落后，食品种类有限、数量不足，人们仅仅满足于吃得饱。如今中国经济快速发展，食品不仅更加丰富多样，质量也大幅提高。随着生活水平不断提升，人们对饮食的要求越来越高，更加注重吃得营养健康。因此，目前市场上推出的低脂、低糖、有机食品受到人们的普遍欢迎。",
    "reference": "Since the reform and opening up, the diet of the Chinese people has undergone significant changes. In the past, due to economic backwardness, the variety and quantity of food were limited, and people were only satisfied with having enough to eat. Nowadays, with the rapid development of China's economy, food is not only more diverse but also of much higher quality. With the continuous improvement of living standards, people have higher requirements for diet and pay more attention to eating nutritiously and healthily. Therefore, the low-fat, low-sugar, and organic foods currently launched in the market are widely welcomed by people.",
    "points": [
      "改革开放以来，中国人的饮食（diet）发生了显著…",
      "过去由于经济落后，食品种类有限、数量不足，人们仅…",
      "如今中国经济快速发展，食品不仅更加丰富多样，质量…",
      "随着生活水平不断提升，人们对饮食的要求越来越高，…",
      "因此，目前市场上推出的低脂、低糖、有机食品受到人…"
    ]
  },
  {
    "id": "tr-cet6-2023-12-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2023.12",
    "topic": "经济 · 经济与社会的发展",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "随着经济与社会的发展，中国人口结构发生了显著变化，逐渐步入老龄化社会。中国老年人口将持续增加，人口老龄化趋势将更加明显。为了应对人口老龄化带来的种种挑战，国家正积极采取措施，加大对养老的支持。通过改革社会保障(socialsecurity)制度，政府不断增加社会保障经费,逐步扩大社会保障覆盖范围，使更多老年人受益。政府还鼓励各种社会团体为老年人提供服务。",
    "reference": "With the development of the economy and society, China's population structure has undergone significant changes, and the country is gradually entering an aging society. The elderly population in China will continue to increase, and the trend of population aging will become more apparent. In order to address the various challenges brought by population aging, the country is actively taking measures to increase support for elderly care. By reforming the social security system, the government continuously increases social security funds and gradually expands the coverage of social security to benefit more elderly people. The government also encourages various social organizations to provide services fbr the elderly. With the joint efforts of the government and social organizations, the elderly will live a happier life.",
    "points": [
      "随着经济与社会的发展，中国人口结构发生了显著变化…",
      "中国老年人口将持续增加，人口老龄化趋势将更加明显",
      "为了应对人口老龄化带来的种种挑战，国家正积极采取…",
      "通过改革社会保障(socialsecurity)…",
      "政府还鼓励各种社会团体为老年人提供服务"
    ]
  },
  {
    "id": "tr-cet4-2023-12-3",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2023.12",
    "topic": "健康 · 改革开放以来",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "改革开放以来，中国人民生活水平不断提高，这在人们的饮食（diet）变化上得到充分体现。如今,人们不再满足于吃得饱，而是追求吃得更加安全、更加营养、更加健康，食物也愈来愈丰富多样，不再限于本地的农产品。",
    "reference": "Since the reform and opening up, the living standards of the Chinese people have been continuously improving, which is fully reflected in the changes in people's diets. Nowadays, people are no longer satisfied with having enough to eat, but pursue safer, more nutritious, and healthier food. Food is becoming increasingly diverse as well, without being limited to local agricultural products.",
    "points": [
      "改革开放以来，中国人民生活水平不断提高，这在人们…",
      "如今,人们不再满足于吃得饱，而是追求吃得更加安全…"
    ]
  },
  {
    "id": "tr-cet6-2023-12-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2023.12",
    "topic": "城市交通",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "近年来，中国老龄人口持续增长。中国政府正采取各种措施，推进养老服务体系建设，使老年人晚年生活健康幸福。全国兴建了各类养老服务机构。为了提升养老机构的服务质量，政府颁布了一系列标准，加强对养老机构的监管。许多城市为方便老年人用餐，开设了社区食堂，为他们提供价格实惠的饭菜。行动不便的老年人还能享受上门送餐服务。",
    "reference": "In recent years, the elderly population in China has continued to grow. The Chinese government is taking various measures to promote the construction of the elderly care service system, so that the elderly can live a healthy and happy life in their later years. Various elderly care service institutions have been built nationwide. In order to improve the service quality of elderly care institutions, the government has issued a series of standards to strengthen the supervision of elderly care institutions. Many cities have opened community canteens to facilitate dining for the elderly, providing them with affordable meals. Elderly people with limited mobility can also enjoy door-to-door meal delivery services. At the same time, China is actively exploring other elderly care models such as home- and community-based elderly care to ensure that all elderly people are supported in old age.",
    "points": [
      "近年来，中国老龄人口持续增长",
      "中国政府正采取各种措施，推进养老服务体系建设，使…",
      "全国兴建了各类养老服务机构",
      "为了提升养老机构的服务质量，政府颁布了一系列标准…",
      "许多城市为方便老年人用餐，开设了社区食堂，为他们…"
    ]
  },
  {
    "id": "tr-cet4-2023-06-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2023.06",
    "topic": "教育",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "中国越来越重视终身教育,发展继续教育是构建终身教育体系的有效途径。高校作为人才培养的基地,拥有先进的教学理念和优越的教学资源,理应成为继续教育的办学主体。",
    "reference": "China attaches more and more importance to lifelong education, and the development of continuing education is an effective way to build a lifelong education system. As the base for talent cultivation, universities have advanced teaching concepts and superior teaching resources, so they should become the main providers of continuing education. Therefore, in recent years, a number of universities have been trying to explore a new path for developing continuing education that suits to China’s specific conditions by catering to social needs and _ strengthening communications with employers, so that continuing education can play a greater role in the national development strategy.",
    "points": [
      "中国越来越重视终身教育,发展继续教育是构建终身教…",
      "高校作为人才培养的基地,拥有先进的教学理念和优越…"
    ]
  },
  {
    "id": "tr-cet6-2023-06-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2023.06",
    "topic": "经济",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "随着中国经济的快速发展和人们生活水平的稳步提高,城市居民对环境和生活品质的要求越来越高。中国地方政府更加注重公共设施的建设和改进,以更好地满足人们的需求。通过兴建新的广场,公园和公共绿地或对原有公共场地重新加以规划改造,许多城市为市民提供了更多休闲和社交的场所。",
    "reference": "With the rapid development of China’s economy and the steady improvement of people’s living standards, urban residents have increasingly higher demands for the environment and quality of life. Local governments in China are placing greater emphasis on constructing and enhancing public facilities to better meet the needs of the people. By building new squares, parks, and public green spaces or transforming existing public areas, many cities provide residents with more recreational and social spaces. Nowadays, government-funded fitness equipment and paved fitness trails can be seen everywhere in many cities, which not only greatly enhances the conditions of outdoor activities of the residents but also makes the city more beautiful.",
    "points": [
      "随着中国经济的快速发展和人们生活水平的稳步提高,…",
      "中国地方政府更加注重公共设施的建设和改进,以更好…",
      "通过兴建新的广场,公园和公共绿地或对原有公共场地…"
    ]
  },
  {
    "id": "tr-cet4-2023-06-3",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2023.06",
    "topic": "教育",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "自1986年《义务教育法》生效以来,经过不懈努力,实现了在全国推行义务教育的目标。如今,在中国,儿童年满六周岁开始上小学,从小学到初中一共接受九年义务教育。从2008年秋季学期开始,义务教育阶段学生无须缴纳学费。",
    "reference": "The Chinese government has been vigorously carrying out compulsory education all the time so that every child can have access to education. Since the Compulsory Education Law came into effect in 1986, the government has worked diligently to achieve the goal of making compulsory education available throughout the country. Today, children in China, starting school at the age of six, receive a total of nine years of compulsory education from primary school to junior high school. Since the fall semester of 2008, students during compulsory education don’t have to pay tuition fees. With the implementation of a series of educational reform measures, the quality of China’s compulsory education has also been significantly improved.",
    "points": [
      "自1986年《义务教育法》生效以来,经过不懈努力…",
      "如今,在中国,儿童年满六周岁开始上小学,从小学到…",
      "从2008年秋季学期开始,义务教育阶段学生无须缴…"
    ]
  },
  {
    "id": "tr-cet6-2023-06-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2023.06",
    "topic": "城市交通",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "近年来,中国城市加快发展,城市人居环境得到显著改善。许多城市努力探索中国特色的城市高质量发展之路,城市功能不断完善,治理水平明显提高。",
    "reference": "In recent years, China’s cities have accelerated their development and the urban living environment has been significantly improved. Many cities have been making great efforts to explore the path of high-quality urban development with Chinese characteristics, resulting in continuous improvement of urban functions and a noticeable increase in the level of governance. China continues to carry out urban _ ecological restoration and functional repair, fully implement the renovation of old urban neighborhoods, and vigorously promote urban landscaping to eliminate pollution. At the same time, China vigorously promotes the systematic construction of urban infrastructure, carries out surveys of housing buildings and municipal facilities as well as the investigation and rectification of potential safety hazards, and strives to create a high-quality living environment for citizens and make the city more beautiful, safer and more livable.",
    "points": [
      "近年来,中国城市加快发展,城市人居环境得到显著改…",
      "许多城市努力探索中国特色的城市高质量发展之路,城…"
    ]
  },
  {
    "id": "tr-cet4-2023-03",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2023.03",
    "topic": "历史文化 · 生活水平的提高",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "随着生活水平的提高，更多人开始加入到自驾游的行列之中。自驾游者既可驾驶自家车也可借车或租车出游。司机可能是车主或结伴出游者。自驾游与传统的组团旅游不同，它能够更好地满足旅游者的个性化需求，使他们更好地享受旅游的过程。自驾游尤其受到年轻出游者的欢迎。年轻人追求独立自由的生活，而自驾游恰好满足了他们的这一需求。",
    "reference": "In recent years, more and more young people enjoy various self-help traveling. Many self-help tourists choose to travel on foot or by bike. They design their own routes and bring their own tents, kitchenware and other daily necessities. During the journey, self-help tourists can often find some new beautiful scenic spots, but sometimes they can also encounter unexpected difficulties or emergencies. Tourists embrace nature and enjoy the beautiful scenery during their travels while they strengthen their courage to overcome difficulties and the ability to survive in the wild.",
    "points": [
      "随着生活水平的提高，更多人开始加入到自驾游的行列…",
      "自驾游者既可驾驶自家车也可借车或租车出游",
      "司机可能是车主或结伴出游者",
      "自驾游与传统的组团旅游不同，它能够更好地满足旅游…",
      "自驾游尤其受到年轻出游者的欢迎"
    ]
  },
  {
    "id": "tr-cet6-2023-03",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2023.03",
    "topic": "环境 · 徐霞客",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "徐霞客是中国明代的著名地理学家。他花费了三十多年的时间游遍了大半个中国。他主要靠徒步跋涉，寻访了许多荒远偏僻的地区。他把自己的见闻和考察结果详细记录下来，为后人留下了珍贵的考察资料。他通过对许多河流的实地调查，纠正了文献中关于水源的错误。他还详细地描述了地形、气候等因素对植物的影响，生动地描绘了各地的名胜古迹和风土人情。他的考察记录由后人整理成了《徐霞客游记》，在国内外产生了广泛的影响。",
    "reference": "Zhang Qian was China's first great explorer. Braving hardships and overcoming difficulties, he made two diplomatic missions to the Western Regions, opened up trade relations between China and West Asia and Europe, shipped Chinese silk and silk fabrics to West Asia and Europe, and opened up the famous “Silk Road“ in history. At the same time, he also introduced the customs, geographical culture and unique species of the Western Regions to the Central Plains, which greatly broadened people's horizons. As historians have pointed out, without Zhang Qian's missions to the Western Regions, the opening of the Silk Road would not have been possible, and there would not have been cultural exchanges between the Han Dynasty and the Western Regions or Europe.",
    "points": [
      "徐霞客是中国明代的著名地理学家",
      "他花费了三十多年的时间游遍了大半个中国",
      "他主要靠徒步跋涉，寻访了许多荒远偏僻的地区",
      "他把自己的见闻和考察结果详细记录下来，为后人留下…",
      "他通过对许多河流的实地调查，纠正了文献中关于水源…"
    ]
  },
  {
    "id": "tr-cet4-2022-12-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2022.12",
    "topic": "社会生活 · 农历中立秋",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "在中国农历中,立秋(StartofAutumn)意味着夏天的结束和秋天的开始。立秋带来的首先是天气的变化,气温逐渐下降。人们看到树叶开始变黄球落时,知道秋天已经来临,这就是所谓的“一叶知秋”。但此时酷热的天气并未完全结束,高温通常还会持续一段时间,被称为“秋老虎?\"。",
    "reference": "Start of Autumn means the end of summer and the beginning of autumn in the Chinese lunar calendar. The first thing that comes with Start of Autumn is the change of weather—the gradual drop of temperature. People know that autumn has arrived when they see the leaves begin to turn yellow and fall, which is called “A falling leaf heralds autumn”. But at this time, the hot weather is not completely over, and the high temperature usually lasts for a period of time, which is known as “afterheat”. Start of Autumn is of great significance to farmers, during which a variety of autumn crops grow rapidly and begin to mature, and the harvest season is approaching.",
    "points": [
      "在中国农历中,立秋(StartofAutumn)…",
      "立秋带来的首先是天气的变化,气温逐渐下降",
      "人们看到树叶开始变黄球落时,知道秋天已经来临,这…",
      "但此时酷热的天气并未完全结束,高温通常还会持续一…"
    ]
  },
  {
    "id": "tr-cet6-2022-12-1",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2022.12",
    "topic": "环境 · 上被称为世界屋背",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "上,被称为“世界屋背”。青藏高原自然资源丰富,风景秀丽,拥有多种珍稀野生动物。青藏高原气温很低,形成了大面积高山冰川。这里是亚洲许多著名河流的源头,是中国和东南亚的主由于气候变化的影响,青藏高原的冰川正在加速融化。",
    "reference": "The Qinghai-Tibet Plateau is situated in the southwest of China, covering an area of about 2.3 million square kilometers, with an average altitude of over 4,000 meters. It is known as the “Roof of the World”. The Qinghai-Tibet Plateau is abundant in natural resources, boasts beautiful scenery and has a variety of rare wild animals. The low temperature of the plateau has created a large area of alpine glaciers. It is the source of many famous rivers in Asia and is the main source of fresh water supply in China and Southeast Asia. The Qinghai-Tibet Plateau is vital to the global ecosystem. Glaciers on the Qinghai-Tibet Plateau are melting at an accelerated rate due to climate change.",
    "points": [
      "上,被称为“世界屋背”",
      "青藏高原自然资源丰富,风景秀丽,拥有多种珍稀野生…",
      "青藏高原气温很低,形成了大面积高山冰川",
      "这里是亚洲许多著名河流的源头,是中国和东南亚的主…"
    ]
  },
  {
    "id": "tr-cet6-2022-12-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2022.12",
    "topic": "经济 · 黄土高原",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "黄土高原(theLoessPlateau)是中国第三大高原,面积约60万平方公里,平均海拔1000—2000米,绝大部分覆盖着50一80米厚的黄土,是世界上黄土分布最集中、覆盖厚度最大的区域。这是大自然创造的一个奇迹,在世界上也是绝无仅有的。黄土高原是中华民族的发祥地之一。早在5500年前,人们就已经在黄土高原上开始农耕。随着农耕业的持续发展,黄土高原人口不断增加,在秦汉时期就成为中国的政治和经济中心。",
    "reference": "The Loess Plateau is the third largest plateau in China, with an area of about 600,000 square kilometers and an average altitude of 1, 000 - 2, 000 meters. Most of the plateau is covered with 50— 80 meters thick loess, which has the most concentrated distribution and the greatest thickness in the world. This is a miracle created by nature, and it is unique in the world. The Loess Plateau is one of the birthplaces of the Chinese nation. As early as 5,500 years ago, people have already started farming on the Loess Plateau. With the continuous development of farming, the population of the Loess Plateau continued to increase, and it became the political and economic center of China during the Qin and Han Dynasties. Nowadays, with the implementation of strategy for large- scale development of western China, the economy of the Loess Plateau region has been developing rapidly.",
    "points": [
      "黄土高原(theLoessPlateau)是中国…",
      "这是大自然创造的一个奇迹,在世界上也是绝无仅有的",
      "黄土高原是中华民族的发祥地之一",
      "早在5500年前,人们就已经在黄土高原上开始农耕",
      "随着农耕业的持续发展,黄土高原人口不断增加,在秦…"
    ]
  },
  {
    "id": "tr-cet6-2022-12-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2022.12",
    "topic": "历史文化 · 海拔一米",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "海拔2000一4000米,是中国第四大高原。云贵高原西高东低,河流众多,形成了许多又深又陡的峡谷(canyon)。峡谷中许多地方土壤肥沃,非常有利于多种农作物生长。云贵高原独特的自然环境造就了生物和文化的多样性。它是中国森林和丰产资源类型十分丰富的地区,也是古人类起源的重要地区。",
    "reference": "Most of the Yunnan-Guizhou Plateau is located in Yunnan and Guizhou provinces. With a total area of about 500, 000 square kilometers and an average elevation of 2,000 — 4,000 meters, it is the fourth largest plateau in China. Being high in the west and low in the east with numerous rivers flowing through, the plateau has thus allowed the formation of many deep and steep canyons. The fertile soil in many parts of the canyon is very conducive to the growth of many kinds of crops. The unique natural environment of the Yunnan-Guizhou Plateau has created biological and cultural diversity. It is not only an area with abundant types of forest and mineral resources in China, but also an important place witnessing the origin of ancient humans. Besides, it embraces the largest number of ethnic minorities in China, each of which has preserved its rich and diverse cultural traditions.",
    "points": [
      "海拔2000一4000米,是中国第四大高原",
      "云贵高原西高东低,河流众多,形成了许多又深又陡的…",
      "峡谷中许多地方土壤肥沃,非常有利于多种农作物生长",
      "云贵高原独特的自然环境造就了生物和文化的多样性",
      "它是中国森林和丰产资源类型十分丰富的地区,也是古…"
    ]
  },
  {
    "id": "tr-cet6-2022-09-1",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2022.09",
    "topic": "历史文化 · 组成诗句和",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "(horizontalscrolD)组成,诗句和横批用金色或黑色写在红纸上,红色代表幸运,金色代表财富。春联贴在大门左右两侧和门框上方。春联的诗句体现中国传统诗词的特点,两句诗的字数相同、内容相关。横批凸显春联的主题,更是锦上添花。春联以简洁的文字描绘生动的形象,抒发美好的愿望。",
    "reference": "Pasting the Spring Festival couplets is an important custom for Chinese people to celebrate the Spring Festival. The Spring Festival couplets consist of a pair of poems and a four-character horizontal scroll written in gold or black on red paper, with red representing luck and gold representing wealth. The Spring Festival couplets are pasted on the left and right sides of the gate and above the door frame. The lines of the Spring Festival couplets embody the characteristics of traditional Chinese poetry, with two lines having the same number of characters and related content. The horizontal scroll highlighting the theme of the Spring Festival couplets is even the icing on the cake. People depict vivid images in simple words in the Spring Festival couplets, expressing a beautiful vision. When every household puts up the Spring Festival couplets, people will realize that the Spring Festival has officially kicked off.",
    "points": [
      "(horizontalscrolD)组成,诗句和…",
      "春联贴在大门左右两侧和门框上方",
      "春联的诗句体现中国传统诗词的特点,两句诗的字数相…",
      "横批凸显春联的主题,更是锦上添花",
      "春联以简洁的文字描绘生动的形象,抒发美好的愿望"
    ]
  },
  {
    "id": "tr-cet4-2022-06-3",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2022.06",
    "topic": "社会生活 · 从前",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "从前，有个农夫正在地里耕作,突然看见一只兔子飞奔而过，撞在一棵大树上死了。农夫毫不费力就吃到了兔肉，心里非常高兴。他想,“如果总是这样该多好啊!”于是，他不再耕作，每天守候在那棵树下，等待着能再捡到撞死在树上的兔子。他等呀等，等了一天又一天，田地也荒芜了,却再也没有等到第二只兔子。人们因而都嘲笑他把偶然当成了必然。",
    "reference": "There was once a peasant who was ploughing in the field. Suddenly he saw that a hare darting past bumped against a large tree and died. He enjoyed a meal of hare meat without any effort and was so pleased that he thought, “How wonderful it would be to have this all the time!” So he stopped plowing and waited by that tree every day for picking up another hare that bumped into the tree. He waited and waited day after day, only to have the field waste rather than a second hare. Therefore, people all laughed at him for taking the accidental for the inevitable.",
    "points": [
      "从前，有个农夫正在地里耕作,突然看见一只兔子飞奔…",
      "农夫毫不费力就吃到了兔肉，心里非常高兴",
      "他想,“如果总是这样该多好啊!”于是，他不再耕作…",
      "他等呀等，等了一天又一天，田地也荒芜了,却再也没…",
      "人们因而都嘲笑他把偶然当成了必然"
    ]
  },
  {
    "id": "tr-cet6-2022-06-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2022.06",
    "topic": "历史文化 · 赵州桥建",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "赵州桥建于隋朝，公元605年左右，长50.82米，宽9.6米，跨度37.37米。天才建筑师李春设计并监督了桥的建设。赵州桥结构新颖、造型优美。桥有一个大拱，在大拱的两端有两个小拱，帮助排泄洪水、减轻桥梁重量并节省石材。建成以来，该桥经受了多次洪水和地震,但其主体结构仍然完好无损，至今仍在使用。",
    "reference": "The Zhaozhou Bridge, which was constructed in the Sui Dynasty around 605 AD, is 50. 82 meters long, 9.6 meters wide with a span of 37.37 meters. Li Chun, a genius architect, designed and supervised its construction. The Zhaozhou Bridge features a novel structure and graceful shape. The bridge has a main arch with two minor arches ends release on its to help floodwater, reduce the total weight of the bridge and save the stone. Since its completion, the bridge has stood the tests of numerous floods and earthquakes, but its main structure remains intact and still in use today. The Zhaozhou Bridge is a pioneering undertaking in the history of world bridge construction, and an outstanding achievement in the history of the Chinese ancient civilization. Bridges with similar design did not appear in Europe until the 14th century, 700 years later than the Zhaozhou Bridge.",
    "points": [
      "赵州桥建于隋朝，公元605年左右，长50.82米…",
      "天才建筑师李春设计并监督了桥的建设",
      "赵州桥结构新颖、造型优美",
      "桥有一个大拱，在大拱的两端有两个小拱，帮助排泄洪…",
      "建成以来，该桥经受了多次洪水和地震,但其主体结构…"
    ]
  },
  {
    "id": "tr-cet4-2021-12-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2021.12",
    "topic": "历史文化 · 大运河",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "大运河(GrandCanal)是世界上最长的人工河,北起北京,南至杭州。它是中国历史上最宏伟的工程之一。大运河始建于公元前4世纪,公元13世纪末建成。修建之初是为了运输粮食,后来也用于运输其他商品。大运河沿线区域逐渐发展成为中国的工商业中心。长久以来,大运河对中国的经济发展发挥了重要作用,有力地促进了南北地区之间的人员往来和文化交流。",
    "reference": "The Grand Canal, the longest man-made river the world has ever seen, stretches from Beijing in the north to Hangzhou in the south. It is hailed as one of the magnificent projects throughout the history of China. Launched in the 4th century BC, it was completed at the end of the 13th century AD with the original purpose of grain transportation. Later, its scope of shipment included other commodities. Gradually, the areas along the Grand Canal developed into the industrial and commercial hubs of China.",
    "points": [
      "大运河(GrandCanal)是世界上最长的人工…",
      "它是中国历史上最宏伟的工程之一",
      "大运河始建于公元前4世纪,公元13世纪末建成",
      "修建之初是为了运输粮食,后来也用于运输其他商品",
      "大运河沿线区域逐渐发展成为中国的工商业中心"
    ]
  },
  {
    "id": "tr-cet4-2021-12-2",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2021.12",
    "topic": "环境 · 坎儿并",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "坎儿并(Karez)是新疆干旱地区的一种水利系统,由地下渠道将水井连接而成。该系统将春夏季节渗入(seepinto)地下的大量雨水及积雪融水收集起来,通过山体的自然坡度引到地面,用于灌溉农田和满足人们的日常用水需求。坎儿并减少了水在地面的蒸发(evaporation),对地表破坏很小,因而有效地保护了自然资源与生态环境。坎儿并体现了我国人民与自然和谐共存的智慧,是对人类文明的一大贡献。",
    "reference": "Karez, a kind of water conservancy system in the droughty area of Xinjiang, is formed with wells connected by underground channels. This system collects lots of rainwater and snowmelt seeping into the ground in spring and summer and drains it to the ground surface through the natural slope of the mountain to irrigate the farmland and meet people’s daily needs. Karez reduces the evaporation of water on the ground surface with minimal damage to it, thus effectively protecting the natural resources and ecological environment. It embodies the wisdom of the Chinese people to coexist in harmony with nature and is a great contribution to the human civilization.",
    "points": [
      "坎儿并(Karez)是新疆干旱地区的一种水利系统…",
      "该系统将春夏季节渗入(seepinto)地下的大…",
      "坎儿并减少了水在地面的蒸发(evaporatio…",
      "坎儿并体现了我国人民与自然和谐共存的智慧,是对人…"
    ]
  },
  {
    "id": "tr-cet6-2021-12-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2021.12",
    "topic": "历史文化 · 延安",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "延安位于陕西省北部,地处黄河中游,是中国革命的圣地。和毛泽东等老一辈革命家曾在这里生活战斗了十三个春秋，领导了抗日战争和解放战争,培育了延安精神,为中国革命做出了巨大贡献。延安的革命旧址全国数量最大、分布最广、级别最高。延安是全国爱国主义革命传统和延安精神教育基地。延安有9个革命纪念馆,珍藏着中共中央和老一辈革命家在延安时期留存下来的大量重要物品,因此享有“中国革命博物馆城”的美誉。",
    "reference": "Yan’an is located in the north of Shaanxi Province and in the middle reaches of the Yellow River, which is the holy land of the Chinese revolution. Mao Zedong and other revolutionaries of the older generation used to live and fight here for 13 years, leading the War of Resistance Against Japanese Aggression and the War of Liberation, cultivating the Yan’an spirit and making great contributions to the Chinese revolution. With the largest number of revolutionary sites in the widest distribution and with the highest level ‘across China, Yan’an is considered as a national educational base for patriotism, revolutionary traditions and the Yan’an spirit. There are nine revolutionary memorial halls in Yan’an, which collect a large number of important items left by the Central Committee of the Communist Party of China and the revolutionaries of the older generation in the Yan’an period. Therefore, it enjoys the reputation of “ the city of revolutionary museums” .",
    "points": [
      "延安位于陕西省北部,地处黄河中游,是中国革命的圣…",
      "和毛泽东等老一辈革命家曾在这里生活战斗了十三个春…",
      "延安的革命旧址全国数量最大、分布最广、级别最高",
      "延安是全国爱国主义革命传统和延安精神教育基地",
      "延安有9个革命纪念馆,珍藏着中共中央和老一辈革命…"
    ]
  },
  {
    "id": "tr-cet4-2021-12-3",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2021.12",
    "topic": "农业",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "都江卉(Dujiangyan)坐落在成都平原西部的岷江上,距成都市约50公里，始建于公元前三世纪。它的独特之处在于无需用堤坝调控水流。两千多年来,都江卉一直有效地发挥着防洪与灌溉作用,使成都平原成为旱涝保收的沃土和中国最重要的粮食产地之一。都江堰工程体现了我国人民与自然和谐共存的智慧,是全世界年代最和久、仍在使用\\无坝控水的水利工程。",
    "reference": "Dujiangyan is located on the Minjiang River in the western part of the Chengdu Plain, about 50 kilometers from Chengdu. Its construction began in the third century BC. What characterizes it most is that it can regulate the flow of water without a dam. For more than 2, 000 years, Dujiangyan has effectively served the purposes of flood prevention and irrigation, making the Chengdu Plain a fertile land that ensures stable yields despite drought or excessive rain and one of the major grain-producing areas in China. This project embodies the wisdom of the Chinese people to coexist in harmony with nature and is the oldest water conservancy project in the world that is still in use and controls water without a dam.",
    "points": [
      "都江卉(Dujiangyan)坐落在成都平原西部…",
      "它的独特之处在于无需用堤坝调控水流",
      "两千多年来,都江卉一直有效地发挥着防洪与灌溉作用…",
      "都江堰工程体现了我国人民与自然和谐共存的智慧,是…"
    ]
  },
  {
    "id": "tr-cet4-2021-06-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2021.06",
    "topic": "社会生活",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "但该县不同地区生产的铁观音又各具风味。铁观音一年四季均可采摘,尤以春秋两季采摘的茶叶品质最佳。铁观音的加工非常复杂,需要专门的技术和丰富的经验。铁观音含有多种维生素,喝起来口感独特。常饮铁观音有助于预防心脏病、降低血压、增强记忆力。",
    "reference": "Tieguanyin，one of the most favored types of tea in China, is native to Xiping Town, Anxi County, Fujian Province. Now planted throughout Anxi County, the tea varies in its flavor in different regions of the county. Tieguanyin can be gathered through all seasons, tasting the best particularly when picked in spring and fall. The complex processing of the tea calls for specialized skills and abundant experience. The drink, rich in vitamins and with a distinct taste, helps prevent heart diseases, lower blood pressure and enhance memory if consumed regularly.",
    "points": [
      "但该县不同地区生产的铁观音又各具风味",
      "铁观音一年四季均可采摘,尤以春秋两季采摘的茶叶品…",
      "铁观音的加工非常复杂,需要专门的技术和丰富的经验",
      "铁观音含有多种维生素,喝起来口感独特",
      "常饮铁观音有助于预防心脏病、降低血压、增强记忆力"
    ]
  },
  {
    "id": "tr-cet6-2021-06-1",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2021.06",
    "topic": "经济 · 海南",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "海南是仅次于台湾的中国第二大岛，是位于中国最南端的省份。海南岛风景秀丽，气候宜人，阳光充足，生物多样，温泉密布，海水清澈，大部分海滩几乎全年都是游泳和日光浴的理想场所，因而被誉为中国的四季花园和度假胜地，每年都吸引了大批中外游客。海南1988年建省以来，旅游业、服务业、高新技术产业飞速发展，是中国唯一的省级经济特区.。在中央政府和全国人民的大力支持下海南将律成中国最大的自由贸易试验区.",
    "reference": "Hainan is China’s second largest island after Taiwan, and the southernmost province of China. Hainan Island is blessed with charming landscape, pleasant climate, sufficient sunshine, rich biodiversity, abundant hot springs, and crystal clear sea water. Most of its beaches are ideal places for swimming and sunbathing almost all year round. Therefore, it is known as China’s all-season garden and holiday resort, attracting a large number of Chinese and overseas tourists every year. Since Hainan was established as a province in 1988. its tourism. service and high-tech industries have developed rapidly. It is the only provincial-level special economic zone in China. With the strong support of the central government and the entire nation, Hainan will be built into China’s largest pilot free trade zone.",
    "points": [
      "海南是仅次于台湾的中国第二大岛，是位于中国最南端…",
      "海南岛风景秀丽，气候宜人，阳光充足，生物多样，温…",
      "海南1988年建省以来，旅游业、服务业、高新技术…",
      "在中央政府和全国人民的大力支持下海南将律成中国最…"
    ]
  },
  {
    "id": "tr-cet4-2021-06-2",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2021.06",
    "topic": "健康",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "普洱(Puer)茶深受中国人喜爱。最好的普洱茶产自云南的西双版纳(Xishuangbanna),那里的茶泡(brew)的时间越长越有味道。许多爱喝茶的人尤其喜欢其独特的香味和口感。普洱茶含有多种有益健康的元素,常饮普洱茶有助于保护心脏和血管,还有减肥、消除疲劳和促进消化的功效。",
    "reference": "Pu'er tea is hugely popular among Chinese, the best of which is native to Xishuangbanna, Yunnan Province, where climate and environment are the best for the growth of Pu’er tea trees. The tea takes on a darker color and a markedly flavor different from many other types of tea. The longer the tea is brewed, the better it tastes. Its unique aroma and taste are especially adored by its lovers. With numerous elements that promote good health, the tea helps regular drinkers with weight loss, recovery from fatigue and digestion, as well as protection of the heart and blood vessels.",
    "points": [
      "普洱(Puer)茶深受中国人喜爱",
      "最好的普洱茶产自云南的西双版纳(Xishuang…",
      "许多爱喝茶的人尤其喜欢其独特的香味和口感",
      "普洱茶含有多种有益健康的元素,常饮普洱茶有助于保…"
    ]
  },
  {
    "id": "tr-cet6-2021-06-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2021.06",
    "topic": "经济 · 青海",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "青海是中国西北部的一个省份，平均海拔3000米以上，大部分地区为高山和高原。青海省得名于全国最大的咸水湖青海湖。青海湖被誉为“中国最美的湖泊＂，是最受欢迎的旅游景点之一，也是摄影师和艺术家的天堂。青海山川壮丽，地大物博，石油和天然气储量最丰富，省内许多城市的经济在石油和天然气工业带动下得到了长足发展。青海尤以水资源丰富而闻名，是中国三大河流长江、黄河和澜沧江的发源地，在中国的水生态中发挥着重要作用。",
    "reference": "Qinghai is a province in the northwest of China with an average altitude of over 3,000 meters, most of which consists of mountains and plateaus. The province derives its name from Qinghai Lake, the largest saltwater lake in the country. Credited as “China’s most beautiful lake”, it is one of the most popular tourist attractions and also a paradise for photographers and artists. Qinghai boasts magnificent mountains and rivers, great size and abundant natural resources. Thanks to its rich reserves of petroleum and natural gas, a large number of cities in the province have witnessed substantial and rapid economic growth with the development of oil and natural gas industries. Qinghai is especially well-known for its abundant water resources. It is the origin of China’s three great rivers—the Yangtze River, the Yellow River and the Lancang River—and plays an important role in China’s water ecology.",
    "points": [
      "青海是中国西北部的一个省份，平均海拔3000米以…",
      "青海省得名于全国最大的咸水湖青海湖",
      "青海湖被誉为“中国最美的湖泊＂，是最受欢迎的旅游…",
      "青海山川壮丽，地大物博，石油和天然气储量最丰富，…",
      "青海尤以水资源丰富而闻名，是中国三大河流长江、黄…"
    ]
  },
  {
    "id": "tr-cet6-2021-06-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2021.06",
    "topic": "节日习俗 · 云南",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "云南是位于中国西南的一个省份，平均海拔1500米。云南历史悠久，风景秀丽，气候宜人。云南生态环境优越，生物多种多样，被誉为野生动植物的天堂。云南还有多种矿藏和充足的水资源，为全省经济的可待续发展提供了有利条件。云南居住着25个少数民族，他们大多有自己的语言、习俗和宗教。云南独特的自然景色和丰富的民族文化使其成为中国最受欢迎的旅游目的地之一，每年都吸引着大批国内外游客前往观光旅游。",
    "reference": "Yunnan is a province situated in southwestern China, with an average elevation of 1,500 meters. It boasts a long history, beautiful scenery and a pleasant climate. With its superior ecological conditions and rich biodiversity, Yunnan is acclaimed as the paradise for wild animals and plants. In addition, it abounds in mineral and water resources, which provide favorable conditions for the sustainable economic development of the whole province. Yunnan is home to 25 ethnic minorities, most of which have their own languages, conventions and religions. The combination of distinctive natural landscape and rich ethnic cultures has made Yunnan one of the most popular tourist destinations in China, attracting a large number of tourists from home and abroad every year.",
    "points": [
      "云南是位于中国西南的一个省份，平均海拔1500米",
      "云南历史悠久，风景秀丽，气候宜人",
      "云南生态环境优越，生物多种多样，被誉为野生动植物…",
      "云南还有多种矿藏和充足的水资源，为全省经济的可待…",
      "云南居住着25个少数民族，他们大多有自己的语言、…"
    ]
  },
  {
    "id": "tr-cet4-2020-12-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2020.12",
    "topic": "健康",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "生活在中国不同地区的人们饮食多种多样。北方人主要吃面食,南方人大多吃米饭。在沿海地区，,海鲜和淡水水产品在人们饮食中占有相当大的比例,而在其他地区人们的饮食中,内类和奶制品更为常见。四川.湖南等省份的居民普遍爱吃辛辣食物,而江苏和浙江人更喜欢甜食。然而,因为谈饪方式各异,同类食物的味道可能会有所不同。",
    "reference": "People living in different parts of China have a variety of eating habits. People in the north mainly eat food made from flour, while people in the south mostly eat rice. In coastal areas, seafood and freshwater products account for a large proportion of peoples diet, while in other areas, meat and dairy products are more common. Residents in provinces such as Sichuan and Hunan generally prefer spicy food, while people in Jiangsu and Zhejiang have a sweet tooth.",
    "points": [
      "生活在中国不同地区的人们饮食多种多样",
      "北方人主要吃面食,南方人大多吃米饭",
      "在沿海地区，,海鲜和淡水水产品在人们饮食中占有相…",
      "四川.湖南等省份的居民普遍爱吃辛辣食物,而江苏和…",
      "然而,因为谈饪方式各异,同类食物的味道可能会有所…"
    ]
  },
  {
    "id": "tr-cet6-2020-12-1",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2020.12",
    "topic": "经济 · 青藏铁路",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "青藏铁路是世界上最高最长的高原铁路，全长1956公里，其中有960公里在海拔4000多米之上，是连接西藏和中国其他地区的第一条铁路。由于铁路穿越世界上最脆弱的生态系统，在建设期间和建成后都采取了生态保护措施，以确保其成为一条“绿色铁路”。青藏铁路大大缩短了中国内地与西藏之间的旅行时间。更重要的是，它极大地促进了西藏的经济发展，改善了当地居民的生活。铁路开通后，愈来愈多的人选择乘火车前往西藏，这样还有机会欣赏沿线的美景。",
    "reference": "The Qinghai-Tibet Railway, the world’s highest and longest plateau railway, has a total length of 1,956 kilometers, with 960 kilometers of it at an altitude of over 4,000 meters. It is the first railway connecting Tibet and other parts of China. As the railway passes through one of the world’s most vulnerable ecosystems, ecological conservation measures have been taken during and after its construction to ensure that it becomes a “green railway”. The railway has greatly shortened the travel time between inland China and Tibet. More importantly, it has greatly promoted Tibet’s economic growth and bettered the lives of local residents. Since the opening of the railway, a growing number of people have opted to travel to Tibet by train, thus allowing them to enjoy the beautiful scenery along the way.",
    "points": [
      "青藏铁路是世界上最高最长的高原铁路，全长1956…",
      "由于铁路穿越世界上最脆弱的生态系统，在建设期间和…",
      "青藏铁路大大缩短了中国内地与西藏之间的旅行时间",
      "更重要的是，它极大地促进了西藏的经济发展，改善了…",
      "铁路开通后，愈来愈多的人选择乘火车前往西藏，这样…"
    ]
  },
  {
    "id": "tr-cet4-2020-12-2",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2020.12",
    "topic": "节日习俗 · 春节前夕吃团圆饭",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "春节前夕吃团圆饭是中国人的传统。团圆饭是一年中最重要的晚餐,也是家庭团聚的最佳时机,家人生活在不同地方的家庭尤其如此。团圆饭上的菜肴丰富多样,其中有些菜肴有特殊含义。例如,鱼是不可缺少的一道菜,因为汉语中的“鱼”字和”“余”字听上去一样。在中国的许多地方,饺子也是一道重要的主食,因为饺子象征着财富和好运。",
    "reference": "It is a tradition for the Chinese to have the family reunion dinner on the eve of the Spring Festival. The reunion dinner is the most important dinner of the year and the best moment for the family reunion, especially for families whose members live in different places. The dishes for the reunion dinner are richly varied, some of which have special meanings. For example, fish is indispensable to the reunion dinner, because the Chinese characters for “fish” and “surplus” sound the same. In many places of China, dumplings are also an important delicacy, for the reason that they symbolize wealth and good luck.",
    "points": [
      "春节前夕吃团圆饭是中国人的传统",
      "团圆饭是一年中最重要的晚餐,也是家庭团聚的最佳时…",
      "团圆饭上的菜肴丰富多样,其中有些菜肴有特殊含义",
      "例如,鱼是不可缺少的一道菜,因为汉语中的“鱼”字…",
      "在中国的许多地方,饺子也是一道重要的主食,因为饺…"
    ]
  },
  {
    "id": "tr-cet6-2020-12-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2020.12",
    "topic": "历史文化 · 港珠澳大桥",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "港珠澳大桥(HongKong-Zhuhai-MacauBridge)全长55公里，是我国一项不同寻常的工程壮举。大桥将三个城市连接起来，是世界上最长的跨海桥梁和隧道系统。大桥将三个城市之间的旅行时间从3小时缩短到30分钟。这座跨度巨大的钢筋混凝土大桥充分证明中国有能力建造创纪录的巨型建筑。它将助推区域一体化，促进经济增长。大桥是中国发展自己的大湾区总体规划的关键。中国希望将大湾区建成在技术创新和经济繁荣上能与旧金山、纽约和东京的湾区相媲美的地区。",
    "reference": "The Hong Kong-Zhuhai-Macau Bridge. which spans 55 kilometers, is an extraordinary feat of engineering in China, It is the world’s longest sea-crossing bridge and tunnel system, which connects Hong Kong with Zhuhai and Macau, cutting the travel time between the three cities from 3 hours to 30 minutes. This massive span of steel and concrete is ample proof of China’s ability to build record-setting megastructures. The bridge will help spur regional integration and drive economic growth. It is a key component of China’s master plan to develop its own Greater Bay Area, a region that China hopes will develop to rival the bay areas of San Francisco, New York and Tokyo in terms of technological innovation and economic success.",
    "points": [
      "港珠澳大桥(HongKong-Zhuhai-Ma…",
      "大桥将三个城市连接起来，是世界上最长的跨海桥梁和…",
      "大桥将三个城市之间的旅行时间从3小时缩短到30分…",
      "这座跨度巨大的钢筋混凝土大桥充分证明中国有能力建…",
      "它将助推区域一体化，促进经济增长"
    ]
  },
  {
    "id": "tr-cet6-2020-12-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2020.12",
    "topic": "社会生活 · 北京大兴国际机场",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "北京大兴国际机场位于天安门广场以南46公里处，于2019年9月30日投入使用。该巨型工程于2014年开工建设，高峰时工地上有4万多工人。航站楼设计紧凑，可以允许最大数量的飞机直接停靠在最靠近航站楼中心的位置，这给乘客提供了极大的方便。航站楼共有82个登机口，但乘客通过安检后，只需不到8分钟就能抵达任何一个登机口。机场的设计可确保每小时300架次起降。机场年客运量2040年将达到1亿人次，有望成为世界上最繁忙的机场。",
    "reference": "Beijing Daxing International Airport, located 46 kilometers south of Tian’anmen Square, came into use on September 30, 2019. Construction of this mega-project began in 2014, with more than 40,000 workers on site at its peak. The compact design of the terminal allows a maximum number of aircraft to be parked directly at the terminal with minimum distances from the center of the building, providing exceptional convenience for passengers. There are 82 boarding gates in the terminal. but it takes less than 8 minutes for passengers to get to each boarding gate after passing through the security check. The airport is designed to handle 300 takeoffs and landings per hour. It will be capable of handling 100 million passengers annually by 2040 and is expected to become the busiest airport in the world.",
    "points": [
      "北京大兴国际机场位于天安门广场以南46公里处，于…",
      "该巨型工程于2014年开工建设，高峰时工地上有4…",
      "航站楼设计紧凑，可以允许最大数量的飞机直接停靠在…",
      "航站楼共有82个登机口，但乘客通过安检后，只需不…",
      "机场的设计可确保每小时300架次起降"
    ]
  },
  {
    "id": "tr-cet4-2020-09-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2020.09",
    "topic": "历史文化 · 茅台",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "茅台(Moutai)是中国最有名的白酒,在新中国成立前夕,被选为国宴用酒。据说赤水沿岸的村民四千年前就开始酿造茅台。在西汉时期,那里的人们生产出了高质量的茅台,并把它贡给皇帝。自唐朝开始,这种地方酒通过海上丝绸之路运往海外。茅台味道柔和,有一种特殊的香味;适量饮用可以帮助缓解疲劳，有了镇静作用,因而广受国内外消费者的喜爱。",
    "reference": "Use of electronics has also been lmown to lead to a decline in hwnan interactions. Rather than having real-life conversations, many express emotions and engage in deep conversations through social media sites. Many students use their phones and computers during class for non-academic activities, which leads to poor grades. (24) Perha s the most dramatic im act is the reduction in the amount of sleep, which leads to poor health and weight gain.",
    "points": [
      "茅台(Moutai)是中国最有名的白酒,在新中国…",
      "据说赤水沿岸的村民四千年前就开始酿造茅台",
      "在西汉时期,那里的人们生产出了高质量的茅台,并把…",
      "自唐朝开始,这种地方酒通过海上丝绸之路运往海外",
      "茅台味道柔和,有一种特殊的香味;适量饮用可以帮助…"
    ]
  },
  {
    "id": "tr-cet6-2020-09-1",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2020.09",
    "topic": "社会生活 · 西游记也",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "《西游记》(JourneytotheWest)也许是中国文学四大经典小说中最具影响力的一部，当然也是在国外最广为人知的一部小说。这部小说描绘了著名僧侣玄奘在三个随从的陪同下穿越中国西部地区前往印度取经(Buddhistscripture)的艰难历程。虽然故事的主题基于佛教，但这部小说采用了大量中国民间故事和神话的素材，创造了各种栩栩如生的人物和动物形象。其中最著名的是孙悟空，他与各种各样妖魔作斗争的故事几乎为每个中国孩子所熟知。",
    "reference": "Journey to the West is perhaps the most influential of the Four Great Classical Novels of Chinese literature, and certainly the most widely known beyond China’s borders. It depicts the tough journey of the famous monk Xuanzang, who, accompanied by his three followers, travelled across Western China to India for Buddhist scriptures. While the theme of the story is based on Buddhism, the novel draws on a host of Chinese folk tales and mythology to create various vivid and lifelike human and animal characters. The best known among them is the monkey Sun Wukong, whose tales of fighting against all kinds of monsters and demons are well known to just about every child in China.",
    "points": [
      "《西游记》(JourneytotheWest)也…",
      "这部小说描绘了著名僧侣玄奘在三个随从的陪同下穿越…",
      "虽然故事的主题基于佛教，但这部小说采用了大量中国…",
      "其中最著名的是孙悟空，他与各种各样妖魔作斗争的故…"
    ]
  },
  {
    "id": "tr-cet4-2020-09-2",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2020.09",
    "topic": "历史文化 · 茶拥",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "茶拥有5,000年的历史。传说，神农氏(ShenNong)喝开水时，几片野树叶子落进壶里，开水顿时散发出宜人的香味。他喝了几口，觉得很提神。茶就这样发现了。自此，茶在中国开始流行。茶园遍布全国，茶商变得富有。昂贵、雅致的茶具成了地位的象征。今天，茶不仅是一种健康的饮品，而且是中国文化的一个组成部分。越来越多的国际游客一边品茶，一边了解中国文化。",
    "reference": "Tea has been in existence for 5 000 years. According to legend, a few leaves of wild trees fell into his pot while Shen Nong was drinking boiling water, and the boiling water immediately released a pleasant fragrance. He took a few sips, feeling quite refreshed. Thus tea was discovered. Since then, tea has become popular in China.",
    "points": [
      "茶拥有5,000年的历史",
      "传说，神农氏(ShenNong)喝开水时，几片野…",
      "他喝了几口，觉得很提神",
      "茶就这样发现了",
      "自此，茶在中国开始流行"
    ]
  },
  {
    "id": "tr-cet6-2020-09-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2020.09",
    "topic": "社会生活 · 红楼梦",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "《红楼梦》(DreamoftheRedChamber)是18世纪曹雪芹创作的一部小说。曹雪芹基于自己痛苦的个人经历,讲述了贾宝玉和林黛玉之间的悲剧性爱情故事。书中有大约30个主要人物和400多个次要人物,每个人物都刻画得栩栩如生,具有鲜明的个性。小说详尽地描述了四个贵族世家兴衰的历程,反映了封建社会隐藏的种种危机和错综复杂的社会冲突。《红楼梦》融合了现实主义和浪漫主义,具有很强的艺术感染力。它被普遍认为是中国最伟大的小说,也是世界上最伟大的文学创作之一。",
    "reference": "Water Margin is one of the four great classic novels of Chinese literature. Based on the stories of the historical figure Song Jiang and his companions, who rebelled against the feudal emperor, this novel has been popular among the Chinese readers for hundreds of years. It is no exaggeration to say that almost every Chinese is familiar with some of the main characters in the novel. Its highlights are repeatedly told in teahouses, on theatrical stages. on radio and television. on movie sereens, and in numerous homes. In fact, its influence has extended far beyond national boundaries as more and more foreign readers are also stirred and intrigued by the stories of the novel.",
    "points": [
      "《红楼梦》(DreamoftheRedChamb…",
      "曹雪芹基于自己痛苦的个人经历,讲述了贾宝玉和林黛…",
      "书中有大约30个主要人物和400多个次要人物,每…",
      "小说详尽地描述了四个贵族世家兴衰的历程,反映了封…",
      "《红楼梦》融合了现实主义和浪漫主义,具有很强的艺…"
    ]
  },
  {
    "id": "tr-cet6-2020-09-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2020.09",
    "topic": "历史文化 · 水浒传",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "《水浒传》（WaterMargin）是中国文学四大经典小说之一。这部小说基于历史人物宋江及其伙伴反抗封建帝王的故事，数百年来一直深受中国读者的喜爱。毫不夸张地说，几乎每个中国人都熟悉小说中的一些主要人物。这部小说中的精彩故事在茶馆、戏剧舞台、广播电视、电影屏幕和无数家庭中反复讲述。事实上，这部小说的影响已经远远超出了国界。越来越多的外国读者也感到这部小说里的故事生动感人、趣味盎然。",
    "reference": "Water Margin is one of the four great classic novels of Chinese literature. Based on the stories of the historical figure Song Jiang and his companions, who rebelled against the feudal emperor, this novel has been popular among the Chinese readers for hundreds of years. It is no exaggeration to say that almost every Chinese is familiar with some of the main characters in the novel. Its highlights are repeatedly told in teahouses, on theatrical stages. on radio and television. on movie sereens, and in numerous homes. In fact, its influence has extended far beyond national boundaries as more and more foreign readers are also stirred and intrigued by the stories of the novel.",
    "points": [
      "《水浒传》（WaterMargin）是中国文学四…",
      "这部小说基于历史人物宋江及其伙伴反抗封建帝王的故…",
      "毫不夸张地说，几乎每个中国人都熟悉小说中的一些主…",
      "这部小说中的精彩故事在茶馆、戏剧舞台、广播电视、…",
      "事实上，这部小说的影响已经远远超出了国界"
    ]
  },
  {
    "id": "tr-cet4-2020-07",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2020.07",
    "topic": "历史文化 · 火锅已",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "在中国,火锅已有2,000多年的历史,最早流行于最寒冷的地区,然后在很多地区盛行,出现了具有地方特色的种类。吃火锅时,家人和朋友围坐在桌边,桌子中间放着热腾腾的火锅。吃火锅时,人们可以根据自己的口味放肉海鲜、蔬菜和其他配料,自己京饪。人们可以一边尽情地聊天,一边享受美餐。",
    "reference": "Hot pot has a history of more than 2,000 years in China. It first enjoyed popularity in the coldest regions, and then prevailed greatly in many regions with the emergence of many varieties of local features. When having hot pot, family members and friends sit around the table. with a boiling hot pot in the middle. When enjoying hot pot, people can add meat, seafood, vegetables and other ingredients according to their own taste and cook by themselves. People could be free to chat with each other while enjoying a good meal.",
    "points": [
      "在中国,火锅已有2,000多年的历史,最早流行于…",
      "吃火锅时,家人和朋友围坐在桌边,桌子中间放着热腾…",
      "吃火锅时,人们可以根据自己的口味放肉海鲜、蔬菜和…",
      "人们可以一边尽情地聊天,一边享受美餐"
    ]
  },
  {
    "id": "tr-cet4-2019-12-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2019.12",
    "topic": "教育",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "中国家庭十分重视孩子的教育。许多父母认为应该努力工作，确保孩子受到良好教育。他们不仅非常情愿为孩子的教育投资而且花很多时间督促他们学习。多数家长希望孩子能上名牌大学。",
    "reference": "Chinese families attach great importance to their children’s education. Many parents believe that they should work hard to ensure that their children are well educated. Not only are they very willing to invest in their children’s education, but they also spend a lot of time urging them to learn. Most parents hope that their children will attend a prestigious university. Due to the reform and opening-up, more and more parents can send their children abroad to study or participate in international exchange programs to broaden their horizons. Through these efforts, they expect their children to grow healthily and contribute to the development and prosperity of the country.",
    "points": [
      "中国家庭十分重视孩子的教育",
      "许多父母认为应该努力工作，确保孩子受到良好教育",
      "他们不仅非常情愿为孩子的教育投资而且花很多时间督…",
      "多数家长希望孩子能上名牌大学"
    ]
  },
  {
    "id": "tr-cet6-2019-12-1",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2019.12",
    "topic": "环境 · 荷花",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "荷花（lotusflower）是中国的名花之一，深受人们喜爱。中国许多地方的湖泊和池塘都适宜荷花生长。荷花色彩鲜艳，夏日清晨绽放，夜晚闭合。花期长达两三个月，吸引来自各地的游客前往观赏。荷花具有多种功能，既能绿化水面，又能美化庭园，还可净化水质、减少污染、改善环境。荷花迎骄阳而不惧，出污泥而不染，象征纯洁、高雅，常常用来比喻人的高尚品德，历来是诗人画家创作的重要题材。荷花盛开的地方也是许多摄影爱好者经常光顾之地。",
    "reference": "The peony. boasting bright colors and an elegant appearance, is a symbol of peace and prosperity and thus recognized as “king of the flowers” in China. Peonies are bred and grown in many parts of the country. Over the centuries. numerous poems and paintings have been created to praise the flower. Peonies were particularly popular during the Tang Dynasty, when they were extensively cultivated in the imperial gardens and praised as the national flower. In the tenth century, the ancient city of Luoyang became the center for peony cultivation. a position it still holds today. Nowadays, thousands of tourists from home and abroad flock to Luoyang for the annual Peony Festival to both admire the unique beauty of the city’s peonies and explore the history of the ancient capital of nine dynasties. 1, 5 = 8] 85 wT ds] HABE AE AE OY HAE IPL RAMEE MAE HOR EK On CP A KARE BL)",
    "points": [
      "荷花（lotusflower）是中国的名花之一，…",
      "中国许多地方的湖泊和池塘都适宜荷花生长",
      "荷花色彩鲜艳，夏日清晨绽放，夜晚闭合",
      "花期长达两三个月，吸引来自各地的游客前往观赏",
      "荷花具有多种功能，既能绿化水面，又能美化庭园，还…"
    ]
  },
  {
    "id": "tr-cet4-2019-12-2",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2019.12",
    "topic": "节日习俗",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "中国的家庭观念与其文化传统有关。和睦的大家庭曾非常令人羡慕。过去四代同堂并不少见。由于这个传统,许多年轻人婚后继续与父母同住。今天,这个传统正在改变。随着住房条件的改善,越来越多年轻夫妇选择与父母分开住。但他们之间的联系仍然很密切。许多老年人仍然帮着照看孙辈。年轻夫妇也抽时间探望父母,特别是在春节和中秋节等重要节日。",
    "reference": "Chinese concepts of family are related to Chinese cultural traditions. A harmonious large family used to be an object of envy. In the past, it was not uncommon for four generations to live together. Because of this tradition, many young people continued to live with their parents after getting married. Today , this tradition is changing. As housing conditions improve, more and more young couples choose to live separately from their parents. However, they still have a close relationship. Many of the elderly still help look after their grandchildren. Young couples also make time to visit their parents, especially during important festivals such as the Spring Festival and Mid-Autumn Festival.",
    "points": [
      "中国的家庭观念与其文化传统有关",
      "和睦的大家庭曾非常令人羡慕",
      "过去四代同堂并不少见",
      "由于这个传统,许多年轻人婚后继续与父母同住",
      "今天,这个传统正在改变"
    ]
  },
  {
    "id": "tr-cet6-2019-12-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2019.12",
    "topic": "历史文化 · 牡丹花色艳丽",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "牡丹花色艳丽，形象高雅，象征着和平与繁荣，因而在中国被称为“花中之王”。中国许多地方都培育和种植牡丹。千百年来，创造了许多诗歌和绘画赞美牡丹。唐代时期，牡丹在皇家园林普遍种植并被誉为国花，因而特别风行。十世纪时，洛阳古城成为牡丹栽培中心，而且这一地位一直保持到今天。现在，成千上万的国内游客蜂拥到洛阳参加一年一度的牡丹节，欣赏洛阳牡丹独特之美，同时探索九朝古都的历史。",
    "reference": "The plum blossom, the king of China's top ten famous flowers, originated in southern China and has been cultivated for over 3000 years. In the depths of winter. colorful plum blossoms bloom vibrantly amidst the wind and snow, unhindered by severe frost. The plum blossom, a symbol of strength, purity and elegance in traditional Chinese culture. motivates people to brave hardship and forge ahead. Since ancient times. many poets and painters have been drawing inspirations from plum blossoms and created countless immortal works. Plum blossoms are also very popular with the general public and often used as home decoration during the Spring Festival. Nanjing has designated the plum blossom as the city flower and holds the Plum Blossom Festival each year, which attracts thousands of people to Plum Blossom Hill to enjoy the full bloom in the snow irrespective of the severe cold.",
    "points": [
      "牡丹花色艳丽，形象高雅，象征着和平与繁荣，因而在…",
      "中国许多地方都培育和种植牡丹",
      "千百年来，创造了许多诗歌和绘画赞美牡丹",
      "唐代时期，牡丹在皇家园林普遍种植并被誉为国花，因…",
      "十世纪时，洛阳古城成为牡丹栽培中心，而且这一地位…"
    ]
  },
  {
    "id": "tr-cet4-2019-12-3",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2019.12",
    "topic": "社会生活",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "中国汉族人的全名由姓和名组成。中文姓名的特点是，姓总是在前，名跟在其后。千百年来，父姓一直世代相传。然而，如今，孩子跟母亲姓并不罕见。一般来说名有一个或两个汉字，通常承载父母对孩子的愿望。从孩子的名字可以推断出父母希望孩子成为什么样的人，或者期望他们过什么样的生活。父母非常重视给孩子取名，因为名字往往会伴随孩子一生。",
    "reference": "The full name of the Han people in China consists of their first name and last name. A characteristic of the Chinese name is that the last name always comes first and is followed by the first name. For thousands of years, fathers’ family name has been passed down from generation to generation. Today, however, it’s not uncommon for children to take their mothers’ family name. Generally speaking, a first name includes one or two Chinese characters, which usually reflects the parents’ wishes and expectations for their children. From the first name of a child we can infer what kind of people the parents want the child to be or what kind of life they expect the child to live. Parents attach great importance to naming their children for the reason that names often accompany their whole lives.",
    "points": [
      "中国汉族人的全名由姓和名组成",
      "中文姓名的特点是，姓总是在前，名跟在其后",
      "千百年来，父姓一直世代相传",
      "然而，如今，孩子跟母亲姓并不罕见",
      "一般来说名有一个或两个汉字，通常承载父母对孩子的…"
    ]
  },
  {
    "id": "tr-cet6-2019-12-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2019.12",
    "topic": "节日习俗 · 梅花",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "梅花位居中国十大名花之首，源于中国南方，已有三千多年的栽培历史和种植历史。隆冬时节，五颜六色的梅花不畏严寒，迎着风雪傲然绽放。在中国传统文化中，梅花象征着坚强、纯洁、高雅，激励人们不畏艰难、砥砺前行。自古以来，许多诗人和画家从梅花中获取灵感，创作了无数不朽的作品。普通大众也都喜爱梅花，春节期间常用于家庭装饰。南京市已将梅花定为市花，每年举办梅花节，成千上万的人冒着严寒到梅花山踏雪赏梅。",
    "reference": "The lotus flower. one of China’s famous flowers. has been deeply loved by Chinese people. Lakes and ponds in many parts of China are suitable for the growth of lotus plants. The lotus flower, which is bright in color, blooms in the early morning and closes at night in summer. with the flowering lasting up to two or three months, attracting visitors from all over the country. The lotus has multiple uses. including purifying water. reducing pollution and improving the environment. as well as greening water surfaces and beautifying gardens. The flower is characterized by its abilities to tolerate intense sun exposure and emerge pure and clean from the murky water, thus symbolizing purity and elegance. So it is often used as a metaphor for a person's noble character and has been a main subject for poets and painters throughout history. Places with lotus flowers in full bloom are also frequented by many photography enthusiasts.",
    "points": [
      "梅花位居中国十大名花之首，源于中国南方，已有三千…",
      "隆冬时节，五颜六色的梅花不畏严寒，迎着风雪傲然绽…",
      "在中国传统文化中，梅花象征着坚强、纯洁、高雅，激…",
      "自古以来，许多诗人和画家从梅花中获取灵感，创作了…",
      "普通大众也都喜爱梅花，春节期间常用于家庭装饰"
    ]
  },
  {
    "id": "tr-cet4-2019-06-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2019.06",
    "topic": "民间艺术",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "舞狮作为中国传统民间表演已有2,000多年历史。在狮子舞中，两位表演者同披一件狮子服，一个舞动头部，另一个舞动身体和尾巴。他们熟练配合，模仿狮子的各种动作。狮子是兽中之王，象征幸福和好运，所以人们通常在春节和其他节日期间表演狮子舞。狮子舞也可能出现在其他重要场合，如商店开业和结婚典礼，往往吸引许多人观赏。",
    "reference": "Chinese lanterns, originating in the Eastern Han Dynasty, were primarily used for lighting in early times. In the Tang Dynasty, red lanterns were used to celebrate the peaceful life. From then on, lanterns have gained popularity in many places of China. Lanterns are usually made of colorful thin paper, and vary in shape and size. In traditional Chinese culture, red lanterns symbolize booming life and prosperous business, so they are often hung on festivals such as Spring Festival, Lantern Festival, and National Day. Today, red lanterns can also be seen in many other parts of the world.",
    "points": [
      "舞狮作为中国传统民间表演已有2,000多年历史",
      "在狮子舞中，两位表演者同披一件狮子服，一个舞动头…",
      "他们熟练配合，模仿狮子的各种动作",
      "狮子是兽中之王，象征幸福和好运，所以人们通常在春…",
      "狮子舞也可能出现在其他重要场合，如商店开业和结婚…"
    ]
  },
  {
    "id": "tr-cet6-2019-06-1",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2019.06",
    "topic": "历史文化 · 成语",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "成语（Chineseidioms）是汉语中的一种独特的表达方式，大多由四个汉字组成。它们高度简练且形式固定，但通常能形象地表达深刻的含义。成语大多数来源于中国古代的文学作品，通常与某些神话、传说或者历史事件有关。如果不知道某个成语的出处，就很难理解其确切含义。因为，学习成语有助于人们更好地理解中国传统文化。成语在日常会话和文学创作中广泛使用。恰当使用成语可以使一个人的语言更具表现力，交流更有效。",
    "reference": "Chinese idioms are a unique type of Chinese expression, most of which consist of four characters. Though highly compact and structurally fixed, they usually can express profound meanings vividly. Chinese idioms are mostly derived from ancient literature. and often linked with certain myths, stories or historical facts. The precise meaning of an idiom can be difficult to understand without the knowledge of its origin. Therefore, learning Chinese idioms helps people better understand traditional Chinese culture. Chinese idioms are widely used in daily conversations and literary works. Proper use of Chinese idioms can make one’s words more expressive and communication more effective.",
    "points": [
      "成语（Chineseidioms）是汉语中的一种…",
      "它们高度简练且形式固定，但通常能形象地表达深刻的…",
      "成语大多数来源于中国古代的文学作品，通常与某些神…",
      "如果不知道某个成语的出处，就很难理解其确切含义",
      "因为，学习成语有助于人们更好地理解中国传统文化"
    ]
  },
  {
    "id": "tr-cet4-2019-06-2",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2019.06",
    "topic": "民间艺术 · 灯笼起源",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "灯笼起源于东汉，最初主要用于照明。在唐代，人们用红灯笼来庆祝安定的生活。从那时起，灯笼在中国的许多地方流行起来。灯笼通常用色彩鲜艳的薄纸，形状和尺寸各异。在中国传统文化中，红灯笼象征生活美满和生意兴隆，通常在春节、元宵节和国庆等节日期间悬挂。如今，世界上许多其他地方也能看到红灯笼。",
    "reference": "Lion dance is a traditional folk performance in China with a history of over 2,000 years. In the dance, two performers share one lion costume with one waving the lion's head and the other waving the lion's body and tail. They cooperate skillfully to imitate a lion's various movements. As the lion, king of beasts, symbolizes happiness and good luck, the lion dance is usually performed during the Spring Festival and other festivals. It may also be performed at other important occasions such as business opening events and wedding ceremonies, often attracting a large audience.",
    "points": [
      "灯笼起源于东汉，最初主要用于照明",
      "在唐代，人们用红灯笼来庆祝安定的生活",
      "从那时起，灯笼在中国的许多地方流行起来",
      "灯笼通常用色彩鲜艳的薄纸，形状和尺寸各异",
      "在中国传统文化中，红灯笼象征生活美满和生意兴隆，…"
    ]
  },
  {
    "id": "tr-cet6-2019-06-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2019.06",
    "topic": "历史文化 · 幅员辽阔",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "中国幅员辽阔，人口众多，很多地方人们都说自己的方言。方言在发音上差别很大，词汇和语法差别较小。有些方言，特别是北方和南方的方言，差异很大，以致于说不同方言的人常常很难听懂彼此的讲话。方言被认为是当地文化的一个组成部分，但近年来能说方言的人数不断减少。为了鼓励人们更多说本地语言，一些地方政府已经采取措施，如在学校开设方言课，在广播和电视上播放方言节目，以期保存本地的文化遗产。",
    "reference": "China has a vast territory and a large population. People in many places of China speak their own dialects. Chinese dialects differ most in pronunciation, and to a lesser extent in vocabulary and grammar. Some dialects, especially northern dialects and southern dialects, vary so much that they are often not mutually intelligible with each other. Dialects are considered an integral part of local cultures, but the number of people who can speak in dialects has been decreasing in recent years. In order to encourage people to speak local dialects more often, some local governments have taken measures such as offering dialect courses in schools and broadcasting dialect programs on radio and television in the hope of preserving local cultural heritage.",
    "points": [
      "中国幅员辽阔，人口众多，很多地方人们都说自己的方…",
      "方言在发音上差别很大，词汇和语法差别较小",
      "有些方言，特别是北方和南方的方言，差异很大，以致…",
      "方言被认为是当地文化的一个组成部分，但近年来能说…",
      "为了鼓励人们更多说本地语言，一些地方政府已经采取…"
    ]
  },
  {
    "id": "tr-cet4-2019-06-3",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2019.06",
    "topic": "民间艺术 · 剪纸",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "剪纸是中国民间艺术的一种独特形式，已有2000多年历史。剪纸很可能源于汉代，继纸张发明之后。从此，它在中国的许多地方得到了普及。剪纸用的材料和工具很简单：纸和剪刀。剪纸作品通常是用红纸做成的，因为红色在中国传统文化中与幸福相联。因此，在婚礼、春节等喜庆场合，红颜色的剪纸是门窗装饰的首选。",
    "reference": "Hope Elementary School Nowadays, there are an increasing number of students in college choosing to participate in various kinds of volunteer work. Last week the student union organized an activity of visiting a Hope Elementary School, which made a deep impression on me. It is with great satisfaction to see the positive development of the children in the Hope Elementary School. By taking part in this activity, I learned more about what a Hope Elementary School can benefit children. Firstly, more opportunities are offered to them. The Hope Elementary school aims to help dropouts go back to school and improve educational conditions in poor regions. Secondly, The Hope Elementary School can contribute to the improvement of national quality. More and more children can have the chance to enjoy high-quality education resources. In a word, I hope more and more Hope Elementary Schools can be built to benefit more and more children.",
    "points": [
      "剪纸是中国民间艺术的一种独特形式，已有2000多…",
      "剪纸很可能源于汉代，继纸张发明之后",
      "从此，它在中国的许多地方得到了普及",
      "剪纸用的材料和工具很简单：纸和剪刀",
      "剪纸作品通常是用红纸做成的，因为红色在中国传统文…"
    ]
  },
  {
    "id": "tr-cet6-2019-06-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2019.06",
    "topic": "历史文化 · 汉语现在",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "汉语现在是世界上用作本族语人数最多的语言。汉语与西方语言的一个重要区别在于它是以方块字(character)而不是以字母构成的。目前仍在使用的书写系统中，汉语是最古老的。在中国，来自不同地区的人可能听不懂对方的方言，但由于汉子有统一的书写形式，他们交流起来几乎没有任何困难。汉语历史上对团结中华民族发挥了重要作用。今天，随着中国经济的快速增长和全球影响力的增强，越来越多其他国家的人也开始学习汉语。",
    "reference": "Chinese is now the language with the largest number of native speakers in the world. One important way in which Chinese differs from western languages is that, instead of letters, it uses characters. Chinese is the oldest script still in use. In China, people from different regions may find it difficult to understand each other s dialects, but they have little difficulty in communicating through written Chinese, because Chinese characters share a common written form, Chinese has played an important role in uniting the Chinese nation in history. Today, with the rapid growth of China’s economy and the increase in its global influence, a rising number of people from other countries also start learning Chinese.",
    "points": [
      "汉语现在是世界上用作本族语人数最多的语言",
      "汉语与西方语言的一个重要区别在于它是以方块字(c…",
      "目前仍在使用的书写系统中，汉语是最古老的",
      "在中国，来自不同地区的人可能听不懂对方的方言，但…",
      "汉语历史上对团结中华民族发挥了重要作用"
    ]
  },
  {
    "id": "tr-cet4-2018-12-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2018.12",
    "topic": "历史文化",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "由于通信网络的快速发展，中国智能手机用户数量近年来以惊人度增长。这极大地改变了许多人的阅读方式。他们现在经常智能手机上看新闻和文章，而不买传统报刊。大量移动应用程序的开发使人们能用手机读小说和其他形式的文学作品。因此，纸质书籍的销售受到了影响。但调查显示，尽管能手机阅读市场稳步增长，超半数成年人仍喜欢读纸质书。",
    "reference": "Because of the rapid development of communication network, the number of smartphone users in China has increased at an astonishing rate in recent years, which has significantly changed the way many people read. Nowadays they often read news and articles on smartphones instead of buying traditional newspapers and periodicals. The development of numerous mobile apps has enabled people to read novels and other forms of literary works on their mobile phones. Therefore, the sales of paper books have been affected.",
    "points": [
      "由于通信网络的快速发展，中国智能手机用户数量近年…",
      "这极大地改变了许多人的阅读方式",
      "他们现在经常智能手机上看新闻和文章，而不买传统报…",
      "大量移动应用程序的开发使人们能用手机读小说和其他…",
      "因此，纸质书籍的销售受到了影响"
    ]
  },
  {
    "id": "tr-cet6-2018-12-1",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2018.12",
    "topic": "社会生活",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "近年来。中国越来越多的博物馆免费向公众开放。博物馆展览次数和参观人数都明显增长。在一些广受欢迎的博物馆门前，排长队已很常见。这些博物馆必须采取措施限制参观人数。如今，展览形式越来越多样。一些大型博物馆利用多媒体和虚拟现实等先进技术，使展览更具吸引力。不少博物馆还举办在线展览，人们可在网上观赏珍稀展品。然而，现场观看展品的体验对大多数参观者还是更具吸引力。",
    "reference": "In recent years, more and more museums in China have been open to the public free of charge. The number of exhibitions and visitors to museums has seen an obvious increase. It has become common to see that people stand in long queues in front of some popular museums. Therefore, these museums must take measures to restrict the number of visitors. Nowadays, the forms of exhibitions become increasingly diverse. Some large museums use advanced technologies such as multimedia and virtual reality to make their exhibitions more attractive. Quite a few museums also hold online exhibitions where people can appreciate rare and precious exhibits. However, the experience of viewing the exhibits on site is still more appealing to most visitors.",
    "points": [
      "近年来",
      "中国越来越多的博物馆免费向公众开放",
      "博物馆展览次数和参观人数都明显增长",
      "在一些广受欢迎的博物馆门前，排长队已很常见",
      "这些博物馆必须采取措施限制参观人数"
    ]
  },
  {
    "id": "tr-cet4-2018-12-2",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2018.12",
    "topic": "历史文化",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "越来越多的中国人现在的确离不开手机了。他们中的许多人，包括老年人，都使用手机应用程序(apps)保持联系并拓宽朋友圈。他们也用手机购物、查找信息，因为手机便于携带。此外，使用手机应用程序通信比传统电话便宜。然而，这种新趋势导致人们在社交时过度依赖手机。事实上，一些年轻人已经变得十分上瘾，以至于忽视了与家人和朋友面对面的交流。",
    "reference": "It is a fact that more and more Chinese can hardly live without their mobile phones nowadays. Many of them, including senior citizens, use mobile apps to keep in touch with others and expand their circles of friends. They also use mobile phones to shop online and search for information because they are portable. What’s more, communication through mobile apps costs less than traditional phone calls. However, this new trend results in the over-reliance on mobile phones when people are socializing. As a matter of fact, some young people have become so addicted to mobile phones that they have neglected the face-to-face communication with their family and friends.",
    "points": [
      "越来越多的中国人现在的确离不开手机了",
      "他们中的许多人，包括老年人，都使用手机应用程序(…",
      "他们也用手机购物、查找信息，因为手机便于携带",
      "此外，使用手机应用程序通信比传统电话便宜",
      "然而，这种新趋势导致人们在社交时过度依赖手机"
    ]
  },
  {
    "id": "tr-cet6-2018-12-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2018.12",
    "topic": "科技",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "中国越来越重视公共图书馆，并鼓励人们充分加以利用。新近公布的统计数字表明中国的公共图书馆数量在逐年增长。许多图书馆通过翻新和扩建，为读者创造了更为安静、舒适的环境。大型公共图书馆不仅提供种类繁多的参考资料，而目定期举办讲座、展览等活动。近年来，也出现了许多数字图书馆，从而节省了存放图书所需的空间。一些图书馆还推出了自助服务系统，使读者借书还书更加方便，进一步满足了读者的需求。",
    "reference": "China attaches increasing importance to public libraries and encourages people to make full use of them. The newly released statistics indicate that the number of public libraries in China is on an increase year by year. Many libraries have created a quieter and more comfortable environment for readers through renovation and expansion. Not only do large-scale public libraries provide a wide range of reference materials, but they also regularly hold lectures, exhibitions and other activities. In recent years, there have also been many digital libraries, thus saving the space needed to store books.",
    "points": [
      "中国越来越重视公共图书馆，并鼓励人们充分加以利用",
      "新近公布的统计数字表明中国的公共图书馆数量在逐年…",
      "许多图书馆通过翻新和扩建，为读者创造了更为安静、…",
      "大型公共图书馆不仅提供种类繁多的参考资料，而目定…",
      "近年来，也出现了许多数字图书馆，从而节省了存放图…"
    ]
  },
  {
    "id": "tr-cet4-2018-12-3",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2018.12",
    "topic": "经济 · 过去几年",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "过去几年里，移动支付市场在中国蓬勃发展。随着移动互联网的出现，手机购物逐渐成为一种趋势。18到30岁的年轻人构成了移动支付市场的最大群体。由于现在用手机付款很容易，许多消费者在购物时宁愿用手机付款，而不愿用现金或信用卡。为了鼓励人们多消费，许多商店给使用移动支付的顾客打折。专家预测，中国移动支付市场未来仍有很大发展潜力。",
    "reference": "The mobile paym Internet, mobile shopping has gradually bec the largest group of the mobile payment market. Because it is quite easy to mak ers would rather pay by mobile phone than in cash or by credit card. In order to encourage people to counts to consumers who use the mobile payment. As is predicted by evelopment in the future. ent market has thrived in China during the past few years. With the advent of the mobile ome a trend.",
    "points": [
      "过去几年里，移动支付市场在中国蓬勃发展",
      "随着移动互联网的出现，手机购物逐渐成为一种趋势",
      "18到30岁的年轻人构成了移动支付市场的最大群体",
      "由于现在用手机付款很容易，许多消费者在购物时宁愿…",
      "为了鼓励人们多消费，许多商店给使用移动支付的顾客…"
    ]
  },
  {
    "id": "tr-cet6-2018-12-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2018.12",
    "topic": "历史文化",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "近年来，中国政府进一步加大体育馆建设投资，以更好地满足人们快速增长的健身需求。除了新建体育馆外，许多城市还采取了改造旧日工厂和商业建筑等措施，来增加当地体育馆的数量。在政府资金的支持下，越来越多的体育馆向公众免费开放，或者只收取少量费用。许多体育馆通过应用现代信息技术大大提高了服务质量。人们可以方便地在线预订场地和付费。可以预见，随着运动设施的不断完善，愈来愈多的人将会去体育馆健身。",
    "reference": "In recent years, the Chinese government has further increased its investment in gymnasium construction to better meet people’s rapidly growing demand for fitness. In addition to building new gyms, many cities have also taken measures to transform old factories and commercial buildings into gyms to increase the number of local gyms. Thanks to the government grant, more and more gyms are open to the public free of charge or for a small fee. Many gyms have greatly improved their service quality by applying modern information technology. People can conveniently book venues and pay for them online. It can be predicted that with the continuous improvement of sports facilities, more and more people will go to gyms to work out.",
    "points": [
      "近年来，中国政府进一步加大体育馆建设投资，以更好…",
      "除了新建体育馆外，许多城市还采取了改造旧日工厂和…",
      "在政府资金的支持下，越来越多的体育馆向公众免费开…",
      "许多体育馆通过应用现代信息技术大大提高了服务质量",
      "人们可以方便地在线预订场地和付费"
    ]
  },
  {
    "id": "tr-cet4-2018-06-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2018.06",
    "topic": "经济 · 过去",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "过去，乘飞机出行对大多数中国人来说是难以想象的。如今，随着经济的发展和生活水平的提高，越来越多的中国人包括许多农民和外出务工人员都能乘飞机出行。他们可以乘飞机到达所有大城市，还有很多城市也在筹建机场。航空服务不断改进，而且经常会有廉价机票。近年来，节假日期间选择乘飞机外出旅游的人数在不断增加。",
    "reference": "In the past, traveling by plane was unimaginable for most Chinese people. Nowadays, with the development of China’s economy and the improvement of people’s living standards, more and more Chinese people, including many farmers and migrant workers, can travel by air. They can fly to all major cities, and many other cities are also planning to build airports. Air services continue to improve, and there are often cheap flights. So in recent years, the number of people choosing to travel by air during holidays has been increasing.",
    "points": [
      "过去，乘飞机出行对大多数中国人来说是难以想象的",
      "如今，随着经济的发展和生活水平的提高，越来越多的…",
      "他们可以乘飞机到达所有大城市，还有很多城市也在筹…",
      "航空服务不断改进，而且经常会有廉价机票",
      "近年来，节假日期间选择乘飞机外出旅游的人数在不断…"
    ]
  },
  {
    "id": "tr-cet6-2018-06-1",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2018.06",
    "topic": "城市交通 · 过去",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "过去，拥有一辆私家车对大部分中国人而言是件奢侈的事。如今，私家车在中国随处可见。汽车成了人们生活中不可或缺的一部分，他们不仅开车上下班，还经常驾车出游。有些城市的汽车增长速度过快。以至于交通拥堵和停车位不足的问题日益严峻，这些城市的市政府不得不出台新规，限制上路汽车的数量。由于空气污染日益严重，现在越来越多的人选择购买新能源汽车，中国政府也采取了一些措施，支持新能源汽车的发展。",
    "reference": "In the past,owning a private car was a luxury for most Chinese people.Today,private cars are everywhere in China. Cars have become an indispensable part of people's lives: they not only drive to commute,but also take self-drive trips frequently.In some cities,the number of cars is growing so fast that traffic congestion and parking space shortage are becoming rising problems,so the municipal governments of these cities have to introduce new regulations to limit the number of vehicles on the road. Due to the ever-increasing air pollution,a growing number of people choose to purchase new energy vehicles nowadays,and the Chinese government has also adopted some measures to provide incentives for new energy vehicles to grow.",
    "points": [
      "过去，拥有一辆私家车对大部分中国人而言是件奢侈的…",
      "如今，私家车在中国随处可见",
      "汽车成了人们生活中不可或缺的一部分，他们不仅开车…",
      "有些城市的汽车增长速度过快",
      "以至于交通拥堵和停车位不足的问题日益严峻，这些城…"
    ]
  },
  {
    "id": "tr-cet4-2018-06-2",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2018.06",
    "topic": "城市交通 · 公交车曾",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "公交车曾是中国人出行的主要交通工具。近年来，由于私家车数量不断增多，城市的交通问题越来越严重。许多城市为了鼓励更多人乘坐公交车出行，一直在努力改善公交车的服务质量。车辆的设施不断更新，车速也有了显著提高。然而，公交车的票价却依然相当低廉。现在，在大多数城市，许多当地老年市民都可以免费乘坐公交车。",
    "reference": "Buses used to be the main means of transportation for the Chinese people. In recent years, with the number of private cars increasing, cities have been facing increasingly severe traffic problems. To encourage more people to travel by bus, many cities have been making efforts to improve their bus service quality. Bus facilities have been continuously renovated, and the bus speed has also increased dramatically. However, the prices of buses are still quite cheap. Noe, in most cities, many local elderly citizens can take a bus for free.",
    "points": [
      "公交车曾是中国人出行的主要交通工具",
      "近年来，由于私家车数量不断增多，城市的交通问题越…",
      "许多城市为了鼓励更多人乘坐公交车出行，一直在努力…",
      "车辆的设施不断更新，车速也有了显著提高",
      "然而，公交车的票价却依然相当低廉"
    ]
  },
  {
    "id": "tr-cet6-2018-06-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2018.06",
    "topic": "城市交通 · 目前拥",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "中国目前拥有世界上最大最快的高速铁路网。高铁列车的运行速度还将继续提升，更多的城市将修建高铁站。高铁大大缩短了人们出行的时间。相对飞机而言，高铁列车的突出优势在于准时，因为基本不受天气或交通管制的影响。高铁极大地改变了中国人的生活方式。如今，它已经成了很多人商务旅行的首选交通工具。越来越多的人也在假日乘高铁外出旅游。还有不少年轻人选择在一个城市工作而在邻近城市居住，每天乘高铁上下班。",
    "reference": "China currently has the world's largest and fastest high-speed rail network.The running speed of high-speed trains will continue to increase,and more cities will build high-speed rail stations.High-speed rail has greatly shortened passengers'travel time. Different from flights,high-speed trains have a prominent advantage of being able to arrive on time,as they are hardly influenced by weather or traffic control. High-speed rail has greatly changed Chinese people's lifestyle. Today,it has become the preferred means of transportation for many people on business trips. A growing number of people take high-speed trains for their holiday trips as well.In addition,many young people,who opt to work in a city and live in a nearby city,take high-speed trains for commuting every day.",
    "points": [
      "中国目前拥有世界上最大最快的高速铁路网",
      "高铁列车的运行速度还将继续提升，更多的城市将修建…",
      "高铁大大缩短了人们出行的时间",
      "相对飞机而言，高铁列车的突出优势在于准时，因为基…",
      "高铁极大地改变了中国人的生活方式"
    ]
  },
  {
    "id": "tr-cet4-2018-06-3",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2018.06",
    "topic": "科技",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "近年来，中国有越来越多的城市开始建设地铁。发展地铁有助于减少城市的交通拥堵和空气污染。地铁具有安全、快捷和舒适的优点。越来越多的人选择地铁作为每天上班或上学的主要交通工具。如今，在中国乘坐地铁正变得越来越方便。在有些城市里，乘客只需用卡或手机就可以乘坐地铁。许多当地老年市民还可以免费乘坐地铁。",
    "reference": "In recent years, more and more cities in China have begun to build subways. The development of subways can help reduce traffic congestion and air pollution in cities. The subway has the advantages of safety, speed and comfort. A gowing number of prople choose the subway as the main means of transportation to work or school every day. Nowadays, it is becoming increasingly convenient to take the subway in China. In some cities, passengers can use a transportation card or mobile phone to take the subeay. Many local elderly citizens can also take the subway for free.",
    "points": [
      "近年来，中国有越来越多的城市开始建设地铁",
      "发展地铁有助于减少城市的交通拥堵和空气污染",
      "地铁具有安全、快捷和舒适的优点",
      "越来越多的人选择地铁作为每天上班或上学的主要交通…",
      "如今，在中国乘坐地铁正变得越来越方便"
    ]
  },
  {
    "id": "tr-cet6-2018-06-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2018.06",
    "topic": "历史文化 · 自行车曾经",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "自行车曾经是中国城乡最主要的交通工具，中国一度被称为“自行车王国”。如今，随着城市交通拥堵和空气污染日益严重，骑自行车又开始流行起来。近来，中国企业家将移动互联网技术与传统自行车结合在一起，发明了一种称为共享单车（sharedbikes）的商业模式。共享单车的出现使骑车出行更加方便，人们仅需一部手机就可以随时使用共享单车。为了鼓励人们骑车出行，很多城市修建了自行车道。现在，越来越多的中国人也喜欢通过骑车健身。",
    "reference": "Bicycles used to be the most important means of transportation in China's urban and rural areas. Hence for a time China was referred to as the\"Kingdom of Bicycles\". Nowadays,as traffic congestion and air pollution become increasingly pressing in cities,cycling is making a comeback. Recently,Chinese entrepreneurs have invented a business model known as shared bikes by combining the technology of mobile Internet with traditional bicycles. The emergence of shared bikes makes it more convenient to get around by bike:people can readily access shared bikes by simply using a mobile phone. In order to encourage people to ride bicycles,many cities have built bicycle paths. These days,more and more Chinese people also enjoy cycling as a workout.",
    "points": [
      "自行车曾经是中国城乡最主要的交通工具，中国一度被…",
      "如今，随着城市交通拥堵和空气污染日益严重，骑自行…",
      "近来，中国企业家将移动互联网技术与传统自行车结合…",
      "共享单车的出现使骑车出行更加方便，人们仅需一部手…",
      "为了鼓励人们骑车出行，很多城市修建了自行车道"
    ]
  },
  {
    "id": "tr-cet4-2017-12-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2017.12",
    "topic": "历史文化 · 泰山",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "泰山位于山东省西部。海拔1500余米,方圆约400平方公里。泰山不仅雄伟壮观,而且是一座历史文化名山,过去3000多年一直是人们前往朝拜的地方。据记载,共有72位帝王曾来此游览。许多作家到泰山获取灵感,写诗作文,艺术家也来此绘画。山上因此留下了许许多多的文物古迹。泰山如今已成为中国一处主要的旅游景点。",
    "reference": "Mount Tai is situated in the western Shandong Province at a height of about 1500 meters with a coverage of about 400 square kilometers. Mount Tai is not only magnificent in landscape but also is a famous historical and cultural mountain, which was a place of worship in the past 3000 years. According to the record, a total of 72 emperors came visiting the Mount Tai. And many writers came to it for inspiration for their poems and writings and artists for their paintings. Therefore, there left a lot of cultural relics.",
    "points": [
      "泰山位于山东省西部",
      "海拔1500余米,方圆约400平方公里",
      "泰山不仅雄伟壮观,而且是一座历史文化名山,过去3…",
      "据记载,共有72位帝王曾来此游览",
      "许多作家到泰山获取灵感,写诗作文,艺术家也来此绘…"
    ]
  },
  {
    "id": "tr-cet6-2017-12-1",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2017.12",
    "topic": "历史文化 · 太湖",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "太湖是中国东部的一个淡水湖，占地面积2250平方公里，是中国第三大淡水湖.仅次于鄱阳和洞庭。太湖约有90个岛屿，大小从几平方米到几平方公里不等。太湖以其独特的\"太湖石\"而闻名，太湖石常用于装饰中国传统园林。太湖也以高产的捕鱼业闻名。自上世纪70年代后期以来，捕捞鱼蟹对沿湖的居民来说极为重要，并对周边地区的经济作出了重大贡献。",
    "reference": "Lake Tai is a freshwater lake located in the east of China. With an area of 2,250 square kilometers, it is the third-largest freshwater lake in China, after Poyang and Dongting. The lake houses about 90 islands, ranging in size from a few square meters to several square kilometers. The lake is famous for its unique “Taihu stones”, which are often used as a decorating material for traditional Chinese gardens, It is also known for its productive fishing industry. Since the late 1970s, harvesting food products such as fish and crabs has been invaluable to people living along the lake and has contributed significantly to the economy of the surrounding area. The lake region is home to one of the ceramics-industry bases in China, including the Yixing pottery-factory, which produces the world-renowned Yixing clay teapots.",
    "points": [
      "太湖是中国东部的一个淡水湖，占地面积2250平方…",
      "太湖约有90个岛屿，大小从几平方米到几平方公里不…",
      "太湖以其独特的\"太湖石\"而闻名，太湖石常用于装饰…",
      "太湖也以高产的捕鱼业闻名",
      "自上世纪70年代后期以来，捕捞鱼蟹对沿湖的居民来…"
    ]
  },
  {
    "id": "tr-cet4-2017-12-2",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2017.12",
    "topic": "城市交通 · 华山",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "华山位于华阴市，距西安120公里。华山是秦岭的一部分，秦岭不仅分割陕南与陕北，也分隔华南与华北。与从前人们常去朝拜的泰山不同，华山过去很少有人光临，因为上山的道路极其危险。然而，希望长寿的人却经常上山，因为山上生长着许多草药，特别是一些稀有的药草。自上世纪90年代安装缆车以来，参观人数大大增加。",
    "reference": "Huashan(Mount Hua) is situated in Huayin City, 120 kilometers away from Xi'an. It is part of the Qinling Mountains, which divides not only Southern and Northern Shaanxi, but also South and North China. Unlike Taishan, which became a popular place of pilgrimage, Huashan was not well visited in the past because it is dangerous for the climbers to reach its summit. Huashan was also an important place frequented by immortality seekers, as many herbs grow there especially some rare ones. Since the installation of the cable cars in the 1990s, the number of visitors has increased significantly.",
    "points": [
      "华山位于华阴市，距西安120公里",
      "华山是秦岭的一部分，秦岭不仅分割陕南与陕北，也分…",
      "与从前人们常去朝拜的泰山不同，华山过去很少有人光…",
      "然而，希望长寿的人却经常上山，因为山上生长着许多…",
      "自上世纪90年代安装缆车以来，参观人数大大增加"
    ]
  },
  {
    "id": "tr-cet6-2017-12-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2017.12",
    "topic": "旅游地理 · 青海湖",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "青海湖位于海拔3，205米、青海省省会西宁以西约100公里处，是中国最大的咸水湖，面积4，317平方公里，最深处25.5米。有23条河注入湖中，其中大部分是季节性的。百分之八十的湖水源于五条主要河流。青海湖位干跨越亚洲的几，条候鸟计徙路线的交叉处。许多鸟类把青海湖作为迁徙过程中的暂息地。湖的西侧是著名的\"鸟岛\"，吸引着来自全世界各地的观鸟者。每年夏天，游客们也来这里观看国际自行车比赛。",
    "reference": "Lake Qinghai is located about 100 kilometers west of Xining, the capital of Qinghai province, at an altitude of 3205 meters. With an area of 4317 square kilometers and a maximum depth of 25.5 meters, it is the largest saline lake in China. There are 23 rivers emptying into it, most of which are seasonal. 80 percent of the lake’s water comes from five major rivers. The lake is located at the crossroads of several bird migration routes across Asia. Many species use Lake Qinghai as an intermediate stop during migration. On the western side of the lake are the famous “Bird Islands”, which attract bird-watchers from different parts of the world. In addition, every summer, tourists come here to watch the international cycling race.",
    "points": [
      "青海湖位于海拔3，205米、青海省省会西宁以西约…",
      "有23条河注入湖中，其中大部分是季节性的",
      "百分之八十的湖水源于五条主要河流",
      "青海湖位干跨越亚洲的几，条候鸟计徙路线的交叉处",
      "许多鸟类把青海湖作为迁徙过程中的暂息地"
    ]
  },
  {
    "id": "tr-cet4-2017-12-3",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2017.12",
    "topic": "民间艺术 · 黄山",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "黄山位于安徽省南部。它风景独特，尤以其日出和云海著称。要欣赏大山的宏伟壮丽，通常得向上看。但要欣赏黄山美景，得向下看。黄山的湿润气候有利于茶树生成，是中国主要产茶地之一。这里还有许多温泉，其泉水有助于防治皮肤病。黄山是中国主要旅游目的地之一，也是摄影和传统国画最受欢迎的主题。",
    "reference": "Huangshan(Yellow Mountain) is located in southern Anhui Province. The area is well known for its unique scenery, especially sunrise and sea of clouds. To enjoy the magnificence of a mountain, you have to look upwards in most cases. To enjoy Huangshan, however, you've got to look downward. Furthermore, Huangshan's moist climate facilitates the growing of tea trees, thereforethe mountain is one of China's premier tea-growing areas. In addition, Huangshan has multiple hot springswhich help prevent and cure skin illness. Huangshan is one of China's major tourist destinations and the most frequent subject of photography and traditional Chinese painting.",
    "points": [
      "黄山位于安徽省南部",
      "它风景独特，尤以其日出和云海著称",
      "要欣赏大山的宏伟壮丽，通常得向上看",
      "但要欣赏黄山美景，得向下看",
      "黄山的湿润气候有利于茶树生成，是中国主要产茶地之…"
    ]
  },
  {
    "id": "tr-cet6-2017-12-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2017.12",
    "topic": "旅游地理 · 青海湖",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "青海湖位于海拔3,205米、青海省省会西宁以西约100公里处，是中国最大的咸水湖，面积4,317平方公里，最深处25.5米。有23条河注入湖中，其中大部分是季节性的。百分之八十的湖水源于五条主要河流。青海湖位于跨越亚洲的几条候鸟迁徙路线的交叉处。许多鸟类把青海湖作为迁徙过程中的暂息地。湖的西侧是著名的“鸟岛”，吸引着来自世界各地的观鸟者。每年夏天，游客们也来这里观看国际自行车比赛。",
    "reference": "Lake Dongting is a large but shallow lake in northeastern Hunan province. It is a flood basin of the Yangtze River. Hence the lake’s size depends largely on the season. The provinces of Hubei and Hunan are named after their location relative to the lake: Hubei means “North of the Lake” and Hunan, “South of the Lake”. Lake Dongting is famous in Chinese culture as the place of origin of dragon boat racing. The dragon boat racing is said to have begun on the eastern shore of Lake Dongting as a search for the body of Qu Yuan, a patriotic Chu poet. Together with the lake and its surrounding scenic beauty, the racing appeals to thousands of tourists from others parts of China and beyond each year.",
    "points": [
      "青海湖位于海拔3,205米、青海省省会西宁以西约…",
      "有23条河注入湖中，其中大部分是季节性的",
      "百分之八十的湖水源于五条主要河流",
      "青海湖位于跨越亚洲的几条候鸟迁徙路线的交叉处",
      "许多鸟类把青海湖作为迁徙过程中的暂息地"
    ]
  },
  {
    "id": "tr-cet4-2017-06-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2017.06",
    "topic": "历史文化 · 黄河",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "黄河是亚洲第三、世界第六长的河流。“黄”这个字描述的是其河水浑浊的颜色。黄河发源于青海，流经九个省份，最后注入渤海。黄河是中国赖以生存的几条河流之一。黄河流域(riverbasin)是中国古代文明的诞生地，也是中国早期历史上最繁荣的地区。然而，由于极具破坏力的洪水频发，黄河曾造成多次灾害。在过去几十年里，政府采取了各种措施防止灾害发生。",
    "reference": "The Yellow River is the third-longest in Asia and the sixth-longest in the world. “Yellow” describes the color of the muddy river. The river originates in Qinghai, runs through nine provinces before it empties into the Bohai Sea. The Yellow River is one of the several rivers that sustain life and livelihood in China. The river basin is the cradle of China’s ancient civilization and was once the most prosperous region in early history of China. However, the Yellow River had triggered many disasters due to frequent catastrophic floods. As such, over the past several decades, the Chinese government has taken a host of steps to prevent such disasters.",
    "points": [
      "黄河是亚洲第三、世界第六长的河流",
      "“黄”这个字描述的是其河水浑浊的颜色",
      "黄河发源于青海，流经九个省份，最后注入渤海",
      "黄河是中国赖以生存的几条河流之一",
      "黄河流域(riverbasin)是中国古代文明的…"
    ]
  },
  {
    "id": "tr-cet6-2017-06-1",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2017.06",
    "topic": "历史文化 · 明朝统治中国年",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "明朝统治中国276年，被人们描绘成人类历史上治理有序、社会稳定的最伟大的时代之一。这一时期，手工业的发展促进了市场经济和城市化。大量商品，包括酒和丝绸，都在市场销售。同时，还进口许多外国商品，如时钟和烟草。北京、南京、扬州、苏州这样的大商业中心相继形成。也是在明代，由郑和率领的船队曾到印度洋进行了七次大规模探险航行。还值得一提的是，中国文学的四大经典名著中有三部写于明代。",
    "reference": "The Ming Dynasty, which ruled China for 276 years, is described as one of the greatest eras of orderly governance and social stability in human history. During this period, the development of handicraft industry promoted the market economy and urbanization. A large number of commodities, including alcohol and silk, were sold in the market. Meanwhile, many foreign goods such as clocks and tobacco were also imported. A series of commercial metropolises including Beijing, Nanjing, Yangzhou and Suzhou were successively formed. It was also in the Ming Dynasty that the fleets led by Zheng He made seven large-scale expeditionary voyages to the Indian Ocean, It is also worth mentioning that three of the four great classical masterpieces of Chinese literature were written during this time.",
    "points": [
      "明朝统治中国276年，被人们描绘成人类历史上治理…",
      "这一时期，手工业的发展促进了市场经济和城市化",
      "大量商品，包括酒和丝绸，都在市场销售",
      "同时，还进口许多外国商品，如时钟和烟草",
      "北京、南京、扬州、苏州这样的大商业中心相继形成"
    ]
  },
  {
    "id": "tr-cet4-2017-06-2",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2017.06",
    "topic": "历史文化 · 长江",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "长江是亚洲最长、世界上第三长的河流。长江流经多种不同的生态系统，是诸多濒危物种的栖息地，灌溉了中国五分之一的土地。长江流域(riverbasin)居住着三分之一的人口。长江在中国历史、文化和经济上起着很大的作用。长江三角洲(delta)产出多达20%的中国国民生产总值。几千年来，长江一直被用于供水、运输和工业生产。长江上还坐落着世界最大的水电站。",
    "reference": "The Yangtze River is the longest in Asia and the third longest in the world. The river, which flows through varied ecosystems along its passage, offers habitats for many endangered species and provides irrigation for 1/5 of China’s land. The Yangtze River basin is home to 1/3 of China’s population. The river plays a very important role in China historically, culturally and economically. The Yangtze River Delta contributes up to 20% of China’s GDP. For millennia, the Yangtze River has been used for water supply, shipment and industrial activities. The world’s largest hydropower station is also built on the river.",
    "points": [
      "长江是亚洲最长、世界上第三长的河流",
      "长江流经多种不同的生态系统，是诸多濒危物种的栖息…",
      "长江流域(riverbasin)居住着三分之一的…",
      "长江在中国历史、文化和经济上起着很大的作用",
      "长江三角洲(delta)产出多达20%的中国国民…"
    ]
  },
  {
    "id": "tr-cet6-2017-06-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2017.06",
    "topic": "历史文化 · 宋朝始",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "宋朝始于960年，一直延续到1279年。这一时期，中国经济大幅增长，成为世界上最先进的经济体，科学、技术、哲学和数学蓬勃发展。宋代中国是世界历史上首先发行纸币的国家。宋朝还最早使用火药并发明了活字（movable-type）印刷。人口增长迅速，越来越多的人住进城市，那里有热闹的娱乐场所。社会生活多种多样。人们聚集在一起观看和交易珍贵艺术品。宋朝的政府体制在当时也是先进的。政府官员均通过竞争性考试选拔任用。",
    "reference": "The Song dynasty began in 960 and continued until 1279. Over the course of this dynasty, the Chinese economy grew significantly and became the most advanced economy in the world. Science, technology, philosophy, and mathematics also flourished during this period. Song China was the first in world history to issue paper money nationally. It also saw the first use of gunpowder, as well as the invention of movable-type printing. The population grew rapidly during this time, and more and more people moved to cities, which had lively entertainment quarters. Social life during the Song dynasty was rich and varied; people gathered to view and trade precious artworks.",
    "points": [
      "宋朝始于960年，一直延续到1279年",
      "这一时期，中国经济大幅增长，成为世界上最先进的经…",
      "宋代中国是世界历史上首先发行纸币的国家",
      "宋朝还最早使用火药并发明了活字（movable-…",
      "人口增长迅速，越来越多的人住进城市，那里有热闹的…"
    ]
  },
  {
    "id": "tr-cet4-2017-06-3",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2017.06",
    "topic": "经济 · 珠江",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "珠江是华南一大河系，流经广州市，是中国第三长的河流，仅次于长江和黄河。珠江三角洲（delta）是中国最发达的地区之一，面积约11,000平方公里。它在面积和人口方面也是世界上最大的城市聚集区。珠江三角洲九个最大城市共有5,700多万人口。上世纪70年代末中国改革开放以来，珠江三角洲已成为中国和世界主要经济区域和制造中心之一。",
    "reference": "As a major river system in southern China that runs through Guangzhou, capital of Guangdong Province, the Pearl River is the third longest in China, after the Yangtze River and the Yellow River. The Pearl River Delta, which covers an area of 11,000 square kilometers, represents one of the most developed regions in China. It is also the world’s largest city cluster in terms of size and population. Put together, the nine largest cities in the Delta are home to a combined population of over 57 million. Since reform and opening up was initiated in the late 1970s, the Pearl River Delta has become one of the leading regional economies and manufacturing centers in China and around the world.",
    "points": [
      "珠江是华南一大河系，流经广州市，是中国第三长的河…",
      "珠江三角洲（delta）是中国最发达的地区之一，…",
      "它在面积和人口方面也是世界上最大的城市聚集区",
      "珠江三角洲九个最大城市共有5,700多万人口",
      "上世纪70年代末中国改革开放以来，珠江三角洲已成…"
    ]
  },
  {
    "id": "tr-cet6-2017-06-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2017.06",
    "topic": "历史文化 · 唐朝始",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "唐朝始于618年，终于907年，是中国历史上最灿烂的时期。经过近三百年的发展，唐代中国成为世界上最繁荣的强国，其首都长安是当时世界上最大的都市。这一时期，经济发达、商业繁荣、社会秩序稳定，甚至边境也对外开放。随着城市化和财富的增加，艺术和文学也繁荣起来。李白和杜甫是以作品简洁自然而著称的诗人。他们的诗歌打动了学者和普通人的心。即使在今天，他们的许多诗歌仍广为儿童及成人阅读背诵。",
    "reference": "The Tang Dynasty, which started in 618 and ended in 907, is the most splendid period in Chinese history. After nearly three hundred years of development, China in Tang Dynasty became the most prosperous power in the world, and its capital Chang’an was the world’s largest metropolis. During this time, China enjoyed a developed economy, prosperous commerce and a stable social order, and even opened its borders to the outside world. Along with urbanization and the increase in wealth, art and literature also flourished. Li Bai and Du Fu were poets renowned for the conciseness and naturalness of their works. Their poems touched the hearts of scholars and ordinary people alike. Even today, many of their poems are still widely read and recited by both children and adults.",
    "points": [
      "唐朝始于618年，终于907年，是中国历史上最灿…",
      "经过近三百年的发展，唐代中国成为世界上最繁荣的强…",
      "这一时期，经济发达、商业繁荣、社会秩序稳定，甚至…",
      "随着城市化和财富的增加，艺术和文学也繁荣起来",
      "李白和杜甫是以作品简洁自然而著称的诗人"
    ]
  },
  {
    "id": "tr-cet4-2016-12-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2016.12",
    "topic": "节日习俗 · 文化",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "在中国文化中，红色通常象征着好运、长寿和幸福。在春节和其他喜庆场合，红色到处可见。人们把现金作为礼物送给家人或亲密朋友时，通常放在红信封里。红色在中国流行的另一个原因是人们把它与中国革命和共产党相联系。然而，红色并不总是代表好运和快乐。因为从前死者的名字常用红色书写，用红墨水书写中国人名被看成是一种冒犯行为。",
    "reference": "The color of red in Chinese culture usually symbolizes good luck, longevity, and happiness. Red can be found everywhere during Chinese Spring Festival and other joyous occasions. Cashes are often put in red envelopes and sent to family members or close friends as gifts. The popularity of red in China can also be attributed to the fact that people associate it with the Chinese Revolution and the Communist Party. However, red does not signify good luck and joy all the time in that the name of the dead used to be written in red. Thus it is regarded as an offense to write the names of Chinese people in red ink.",
    "points": [
      "在中国文化中，红色通常象征着好运、长寿和幸福",
      "在春节和其他喜庆场合，红色到处可见",
      "人们把现金作为礼物送给家人或亲密朋友时，通常放在…",
      "红色在中国流行的另一个原因是人们把它与中国革命和…",
      "然而，红色并不总是代表好运和快乐"
    ]
  },
  {
    "id": "tr-cet6-2016-12-1",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2016.12",
    "topic": "经济 · 生活水平的提高",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "随着生活水平的提高，度假在中国人生活中的作用越来越重要。过去，中国人的时间主要花在谋生上，很少有机会外出旅行。然而，近年来中国旅游业发展迅速。经济的繁荣和富裕中产阶级的出现，引发了一个前所未有的旅游热潮。中国人不仅在国内旅游，出国旅游也越来越普遍。2016年国庆节假日期间，旅游消费总计超过4000亿元。据世界贸易组织估计，2020年中国将成为世界上最大的旅游国，在未来几年里将成为出境旅游支出增长最快的国家。",
    "reference": "With Chinese people’s living standards improving, taking a vacation is playing an increasingly important role in Chinese people’s lives. In the past, Chinese people spent most of their time making a living and rarely got the chance to go on a trip. In recent years, however, China’s tourism industry has been growing by leaps and bounds. A booming economy and the emergence of a newly rich middle class have led to an unprecedented tourism boom. While Chinese people’s domestic trips keep increasing, travelling abroad is also becoming an increasingly popular choice for them, During the 2016 National Day holiday, total spending by Chinese tourists exceeded 400 billion yuan. The World Trade Organization predicts that China will become the world’s largest travel destination by 2020, and will have the world’s fastest-growing overseas travel spending in the next few years.",
    "points": [
      "随着生活水平的提高，度假在中国人生活中的作用越来…",
      "过去，中国人的时间主要花在谋生上，很少有机会外出…",
      "然而，近年来中国旅游业发展迅速",
      "经济的繁荣和富裕中产阶级的出现，引发了一个前所未…",
      "中国人不仅在国内旅游，出国旅游也越来越普遍"
    ]
  },
  {
    "id": "tr-cet4-2016-12-2",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2016.12",
    "topic": "历史文化 · 中国的改革开放",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "随着中国的改革开放，如今很多年轻人都喜欢举行西式婚礼。新娘在婚礼上穿着白色婚纱，因为白色被认为是纯洁的象征。然而，在中国传统文化中，白色经常是葬礼上使用的颜色。因此务必记住，白花一定不要用作祝人康复的礼物，尤其不要送给老年人或危重病人。同样，礼金也不能装在白色的信封里，而要装在红色的信封里。",
    "reference": "With China’s reform and opening up, nowadays quite a number of youngsters would like to celebrate their weddings in western style. The bride wears a white wedding dress at the ceremony, as white is regarded as a symbol of purity. However, in traditional Chinese culture, white is a color that is often used in funerals. That’s why it’s necessary to keep in mind that white flowers must not be gifts for patients, especially not for the elders or critically ill patients. Similarly, the cash gift shouldn’t be packed in a white envelope, but in a red one instead.",
    "points": [
      "随着中国的改革开放，如今很多年轻人都喜欢举行西式…",
      "新娘在婚礼上穿着白色婚纱，因为白色被认为是纯洁的…",
      "然而，在中国传统文化中，白色经常是葬礼上使用的颜…",
      "因此务必记住，白花一定不要用作祝人康复的礼物，尤…",
      "同样，礼金也不能装在白色的信封里，而要装在红色的…"
    ]
  },
  {
    "id": "tr-cet6-2016-12-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2016.12",
    "topic": "历史文化",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "随着中国经济的蓬勃发展，学汉语的人数迅速增加，使汉语成了世界上人们最爱学的语言之一。近年来，中国大学在国际上的排名也有了明显的提高。由于中国教育的巨大进步，中国成为最受海外学生欢迎的留学目的地之一就不足为奇了。2015年，近四十万国际学生蜂拥来到中国学习。他们学习的科目已不再限于中国语言和文化，而包括科学与工程。在全球教育市场上，美国和英国仍占主导地位，但中国正在迅速赶上。",
    "reference": "With the vigorous development of China’s economy, the number of people learning Chinese has rapidly increased, making Chinese one of the most popular languages in the world. In recent years, the international rankings of Chinese universities have also markedly improved. Due to the tremendous progress in China’s education, it is not surprising that China has become one of the most popular destinations for overseas students. In 2015, nearly 400 thousand international students flocked to China to study. The subjects they study are no longer limited to Chinese language and culture but include science and engineering. In the global education market, America and Britain still dominate, but China is catching up quickly.",
    "points": [
      "随着中国经济的蓬勃发展，学汉语的人数迅速增加，使…",
      "近年来，中国大学在国际上的排名也有了明显的提高",
      "由于中国教育的巨大进步，中国成为最受海外学生欢迎…",
      "2015年，近四十万国际学生蜂拥来到中国学习",
      "他们学习的科目已不再限于中国语言和文化，而包括科…"
    ]
  },
  {
    "id": "tr-cet4-2016-12-3",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2016.12",
    "topic": "历史文化 · 文化",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "在中国文化中，黄颜色是一种很重要的颜色，因为它具有独特的象征意义。在封建(feudal)社会中，它象征统治者的权力和权威。那时，黄色是专为皇帝使用的颜色，皇家宫殿全部漆成黄色，皇袍总是黄色的，而普通老百姓是禁止穿黄色衣服的。在中国，黄色也是收获的象征。秋天庄稼成熟时，田野变得一片金黄。人们兴高采烈，庆祝丰收。",
    "reference": "In Chinese culture, yellow is a color occupying a fairly prominent position, which is endowed with unique symbolic significance. During feudal times, yellow stands for the ruler’s power and authority. At that time, yellow was exclusively designed for the emperor, with the royal palace painted yellow and the imperial robe always being yellow, while ordinary people were never be permitted to wear yellow clothes. In China, yellow is also the symbol of harvest. When crops are ripening in the fall, people celebrate the harvest in high spirits, with the fields taking on a vast expanse of golden appearance.",
    "points": [
      "在中国文化中，黄颜色是一种很重要的颜色，因为它具…",
      "在封建(feudal)社会中，它象征统治者的权力…",
      "那时，黄色是专为皇帝使用的颜色，皇家宫殿全部漆成…",
      "在中国，黄色也是收获的象征",
      "秋天庄稼成熟时，田野变得一片金黄"
    ]
  },
  {
    "id": "tr-cet6-2016-12-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2016.12",
    "topic": "健康 · 农业",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "农业是中国的一个重要产业，从业者超过3亿。中国农业产量全球第一，主要生产水稻、小麦和豆类。虽然中国的农业用地仅占世界的百分之十，但为世界百分之二十的人口提供了粮食。中国7700年前开始种植水稻。早在使用机械和化肥之前，勤劳和富有创造性的中国农民就已经采用各种各样的方法来增加农作物产量。中国农业最新的发展是推进有机农业。有机农业可以同时服务于多种目的，包括食品安全、大众健康和可持续发展。",
    "reference": "Agriculture is a vital industry in China, employing over 300 million farmers. China ranks first worldwide in farm output, primarily producing rice, wheat, and beans. Although China’s agricultural land represents 10% of the total agricultural land in the world, it feeds 20% of the world’s population. The history of rice cultivation in China dates back to 7,700 years ago. Industrious and creative Chinese farmers had adopted various methods to boost crop yields long before they began to use machinery and fertilizers.",
    "points": [
      "农业是中国的一个重要产业，从业者超过3亿",
      "中国农业产量全球第一，主要生产水稻、小麦和豆类",
      "虽然中国的农业用地仅占世界的百分之十，但为世界百…",
      "中国7700年前开始种植水稻",
      "早在使用机械和化肥之前，勤劳和富有创造性的中国农…"
    ]
  },
  {
    "id": "tr-cet4-2016-06-2",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2016.06",
    "topic": "民间艺术 · 在山东省潍坊市",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "在山东省潍坊市，风筝不仅仅是玩具，而且还是这座城市文化的标志。潍坊以“风筝之都”而闻名，已有将近2,400年放飞风筝的历史。传说中国古代哲学家墨子用了三年时间在潍坊制作了世界上首个风筝，但放飞的第一天风筝就坠落并摔坏了。也有人相信风筝是中国古代木匠鲁班发明的。据说他的风筝用木头和竹子制作，飞了三天后才落地。",
    "reference": "In Weifang, Shandong Province, kites are not only for entertainment, but are also taken as the symbol for the culture of the city. Weifang, known as the “capital of kites”, has a history of nearly 2,400 years in flying kites. According to the legend, the ancient Chinese philosopher Mozi took 3 years to make the first kite in Weifang. However, on its first day of flying, it fell and broke. Some also believe that kite was invented by the ancient Chinese carpenter Lu Ban. It’s said that his kite was made of wood and bamboo and it only landed after 3 days’ flying.",
    "points": [
      "在山东省潍坊市，风筝不仅仅是玩具，而且还是这座城…",
      "潍坊以“风筝之都”而闻名，已有将近2,400年放…",
      "传说中国古代哲学家墨子用了三年时间在潍坊制作了世…",
      "也有人相信风筝是中国古代木匠鲁班发明的",
      "据说他的风筝用木头和竹子制作，飞了三天后才落地"
    ]
  },
  {
    "id": "tr-cet4-2016-06-3",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2016.06",
    "topic": "历史文化 · 乌镇",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "乌镇是浙江的一座古老水镇，坐落在京杭大运河畔。这是一处迷人的地方，有许多古桥、中式旅店和餐馆。在过去一千年里，乌镇的水系和生活方式并未经历多少变化，是一座展现古文明的博物馆。乌镇所有房屋都用石木建造。数百年来，当地人沿着河边建起了住宅和集市。无数宽敞美丽的庭院藏身于屋舍之间，游客们每到一处都有会惊喜的发现。",
    "reference": "Wuzhen, an ancient watertown in Zhejiang Province, is located on the riverside of the Beijing-Hangzhou Grand Canal. It is a charming place with many ancient bridges, Chinese-style hotels and restaurants. In the past 1,000 years, the water system and the lifestyle there changed little, and the town is thus a museum of ancient civilization. All the houses of Wuzhen are made of stone and wood. Over hundreds of years, the locals have built houses and markets along the river. Many beautiful and spacious courtyards are hidden among the houses, offering the tourists surprises everywhere they go.",
    "points": [
      "乌镇是浙江的一座古老水镇，坐落在京杭大运河畔",
      "这是一处迷人的地方，有许多古桥、中式旅店和餐馆",
      "在过去一千年里，乌镇的水系和生活方式并未经历多少…",
      "乌镇所有房屋都用石木建造",
      "数百年来，当地人沿着河边建起了住宅和集市"
    ]
  },
  {
    "id": "tr-cet6-2016-06-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2016.06",
    "topic": "经济 · 深圳",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "深圳是中国广东省一座新开发的城市。在改革开放之前，深圳不过是一个渔村，仅有三万多人。20世纪80年代，中国政府创建了深圳经济特区，作为实施社会主义市场经济的试验田。如今，深圳的人口已超过1000万，整个城市发生了巨大的变化。到2014年，深圳的人均(per-capita)GDP已达25000美元，相当于世界上一些发达国家的水平。就综合经济实力而言，深圳居于中国顶尖城市之列。由于其独特的地位，深圳也是国内外企业家创业的理想之地。",
    "reference": "Shenzhen is a newly-developed city in Guangdong province, China.’ Before the reform and opening-up policy, it was merely a fishing village with only a population of over 30,000.” In the 1980s, Chinese government established Shenzhen Special Economic Zone as the experimental field for the implementation of socialist market economy.’ Today, with a population of over 10 million, Shenzhen as a whole has undergone tremendous changes.* By 2014, the per-capita GDP of Shenzhen has reached 25,000 dollars, equivalent to that of some developed countries in the world.> As for its comprehensive economic strength, Shenzhen is among the top cities in China.° Due to its unique status, it is also an ideal place to start businesses for entrepreneurs at home and abroad.”",
    "points": [
      "深圳是中国广东省一座新开发的城市",
      "在改革开放之前，深圳不过是一个渔村，仅有三万多人",
      "20世纪80年代，中国政府创建了深圳经济特区，作…",
      "如今，深圳的人口已超过1000万，整个城市发生了…",
      "到2014年，深圳的人均(per-capita)…"
    ]
  },
  {
    "id": "tr-cet4-2015-12-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2015.12",
    "topic": "教育 · 父母往往过",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "中国父母往往过于关注孩子的学习，以至于不要他们帮忙做家务。他们对孩子的首要要求就是努力学习，考得好，能上名牌大学。他们相信这是为孩子好，因为在中国这样竞争激烈的社会里，只有成绩好才能保证前途光明。中国父母还认为，如果孩子能在社会上取得大的成就，父母就会受到尊敬。因此，他们愿意牺牲自己的时间、爱好和兴趣，为孩子提供更好的条件。",
    "reference": "Chinese parents usually intend to pay too much attention to their children’s study to such an extent that they even don’t require their children to help them do the chores. Their primary requirement for their children is to study hard, get good grades and go to famous universities. They believe this does good to their children because in the society of China which is full of intense competition, only perfect academic performance can ensure a bright future. Chinese parents also believe if their children can make great achievements in the society, they will receive respect accordingly. Therefore, they are willing to sacrifice their own time, hobbies and interests to provide better conditions for their children.",
    "points": [
      "中国父母往往过于关注孩子的学习，以至于不要他们帮…",
      "他们对孩子的首要要求就是努力学习，考得好，能上名…",
      "他们相信这是为孩子好，因为在中国这样竞争激烈的社…",
      "中国父母还认为，如果孩子能在社会上取得大的成就，…",
      "因此，他们愿意牺牲自己的时间、爱好和兴趣，为孩子…"
    ]
  },
  {
    "id": "tr-cet6-2015-12-1",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2015.12",
    "topic": "教育",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "在中国，父母总是竭力帮助孩子，甚至为孩手做重要决定，而不管孩子想要什么，因为他们相信这样做是为孩子好。结果，孩子的成长和教育往往屈从于父母的意愿。如果父母决定为孩子报名参加一个课外班，以增加其被重点学校录取的机会，他们会坚持自己的决定，即使孩子根本不感兴趣。然而在美国，父母很可能会尊重孩子的意见，并在决策时更注重他们的意见。中国父母十分重视教育或许值得称赞。然而，他们应向美国父母学习在涉及教育时如何平衡父母与子女间的关系。",
    "reference": "In China, parents always try every means to help their children, and even make important decisions for them. They never care what their children really want, because they believe that it is good for them. As a result, children’s growth and education tend to surrender to the wills of their parents. If parents decide to sign up for their children to take an extra class to increase their chances of being admitted to a key school, they will stick to their decisions, even if their children are not interested in. While in the United States, parents are likely to respect their children’s opinions，and pay more attention to their opinions in making decisions. It may be worthy of praise for the Chinese parents to attach great importance to education. When it comes to education, however, they should learn how to balance the relationship between parents and their children from American parents.",
    "points": [
      "在中国，父母总是竭力帮助孩子，甚至为孩手做重要决…",
      "结果，孩子的成长和教育往往屈从于父母的意愿",
      "如果父母决定为孩子报名参加一个课外班，以增加其被…",
      "然而在美国，父母很可能会尊重孩子的意见，并在决策…",
      "中国父母十分重视教育或许值得称赞"
    ]
  },
  {
    "id": "tr-cet4-2015-12-2",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2015.12",
    "topic": "历史文化 · 云南省的丽江古镇",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "云南省的丽江古镇是中国著名的旅游目的地之一。那里的生活节奏比大多数中国城市都要缓慢。丽江到处都是美丽的自然风光，众多的少数民族同胞提供了各式各样、丰富多彩的文化让游客体验。历史上，丽江还以“爱之城”而闻名。当地人中流传着许多关于因爱而生、为爱而死的故事。如今，在中外游客眼中，这个古镇被视为爱情和浪漫的天堂(paradise)。注意：此部分试题请在答题卡2上作答。",
    "reference": "LiJjiang, an ancient town in Yunnan Province, is one of the most famous tourist attractions in China. The life tempo there is slower than that of most Chinese cities. There is beautiful natural scenery everywhere in Lijiang, and many minorities provide tourists with various and colorful cultural experience. It has also been known as the “City of Love” in history. Numerous legends about people who were bom for love and died for love circulate among the local folk. Nowadays, this ancient town is regarded as the paradise of love and romance in the eyes of both Chinese and foreign visitors.",
    "points": [
      "云南省的丽江古镇是中国著名的旅游目的地之一",
      "那里的生活节奏比大多数中国城市都要缓慢",
      "丽江到处都是美丽的自然风光，众多的少数民族同胞提…",
      "历史上，丽江还以“爱之城”而闻名",
      "当地人中流传着许多关于因爱而生、为爱而死的故事"
    ]
  },
  {
    "id": "tr-cet6-2015-12-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2015.12",
    "topic": "经济 · 最近",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "最近，中国政府决定将其工业升级。中国现在涉足建造高速列车、远洋船舶、机器人，甚至飞机。不久前，中国获得了在印度尼西亚(Indonesia)建造一条高铁的合同；中国还与马来西亚(Malaysia)签署了为其提供高速列车的合同。这证明人们信赖中国造产品。中国造产品越来越受欢迎。中国为此付出了代价，但这确实有助于消除贫困，同时还为世界各地的人们提供了就业机会。这是一件好事，值得称赞。下次你去商店时，可能想看一看你所购商品的出产国名。",
    "reference": "Recently, the Chinese government decided to upgrade its industry. China is now involved in the construction of high-speed trains, ocean ships, robots, and even aircraft. Not long ago, China signed a contract to build a high-speed rail in Indonesia. China also signed a contract with Malaysia to provide high-speed trains. These facts prove that, people rely on Chinese-made products. Products made in China are becoming more and more popular. China has paid a price for it, but it does help to eliminate poverty. At the same time, it provides employment opportunities for people all over the world. This is a good thing to be praised. The next time you go to the store, you may want to take a look at the home of your purchase. Chances are that it is made in China.",
    "points": [
      "最近，中国政府决定将其工业升级",
      "中国现在涉足建造高速列车、远洋船舶、机器人，甚至…",
      "不久前，中国获得了在印度尼西亚(Indonesi…",
      "中国还与马来西亚(Malaysia)签署了为其提…",
      "这证明人们信赖中国造产品"
    ]
  },
  {
    "id": "tr-cet4-2015-12-3",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2015.12",
    "topic": "历史文化",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "今年在长沙举行了一年一度的外国人汉语演讲比赛。这项比赛证明是促进中国和世界其他地区文化交流的好方法。它为世界各地的年轻人提供了更好地了解中国的机会。来自87个国家共计126位选手聚集在湖南省省会参加了从7月6日到8月5日进行的半决赛和决赛。比赛并不是唯一的活动，选手们还有机会参观了中国其他地区的著名景点和历史名胜。注意：此部分试题请在答题卡2上作答。",
    "reference": "An annual Chinese speech contest for foreigners was held in Changsha this year, which proved to be a good way of promoting the cultural communication between China and other areas of the world. It offered young people all over the world a good opportunity to learn better about China. A total of 126 contestants from 87 countries gathered in the capital of Hunan Province and took part in both the semi-final and the final from July 6 to August 5. The competition was not the only activity. The contestants also got chances to visit the famous scenicspots and historical resorts in other parts of China.",
    "points": [
      "今年在长沙举行了一年一度的外国人汉语演讲比赛",
      "这项比赛证明是促进中国和世界其他地区文化交流的好…",
      "它为世界各地的年轻人提供了更好地了解中国的机会",
      "来自87个国家共计126位选手聚集在湖南省省会参…",
      "比赛并不是唯一的活动，选手们还有机会参观了中国其…"
    ]
  },
  {
    "id": "tr-cet6-2015-12-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2015.12",
    "topic": "教育 · 在帮助国际社会",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "在帮助国际社会于2030年前消除极端贫困过程中，中国正扮演着越来越重要的角色。自20世纪70年代末实施改革开放以来，中国已使多达四亿人摆脱了贫困。在未来五年中，中国将向其他发展中国家在减少贫困、发展教育、农业现代化、环境保护和医疗保健等方面提供援助。中国在减少贫困方面取得了显著进步，并在促进经济增长方面做出了不懈努力，这将鼓励其他贫困国家应对自身发展中的挑战。在寻求具有自身特色的发展道路时，这些国家可以借鉴中国的经验。",
    "reference": "China is playing an increasingly important role in helping the international community to eliminate extreme poverty by 2030. Since the implementation of the reform and opening up in the late 1970s, China has helped as many as four hundred million people out of poverty. Over the next five years, China will provide assistance to other developing countries in poverty reduction, education development, agricultural modernization, environmental protection and health care. China has made remarkable progress in reducing poverty, and has made unremitting efforts to promote economic growth, which will encourage other poor countries to respond to the challenges of their own developments. These countries can learn from the experience of China when they seek paths of development with their own characteristics.",
    "points": [
      "在帮助国际社会于2030年前消除极端贫困过程中，…",
      "自20世纪70年代末实施改革开放以来，中国已使多…",
      "在未来五年中，中国将向其他发展中国家在减少贫困、…",
      "中国在减少贫困方面取得了显著进步，并在促进经济增…",
      "在寻求具有自身特色的发展道路时，这些国家可以借鉴…"
    ]
  },
  {
    "id": "tr-cet4-2015-06-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2015.06",
    "topic": "经济",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "中国是世界上最古老的文明之一。构成现代世界基础的许多元素都起源于中国。中国现在拥有世界上发展最快的经济，并正经历着一次新的工业革命。中国还启动了雄心勃勃的太空探索计划，其中包括到2020年建成一个太空站。目前,中国是世界最大的出口国之一，并正在吸引大量外国投资。同时,它也在海外投资数十亿美元。2011年，中国超越日本成为世界第二大经济体。",
    "reference": "China is one of the most ancient civilizations across the world，from which many elements that construct the foundation of the modem world are derived. Now China has the world’s fastest growing economy and is experiencing a new industrial revolution. It has also launched an ambitious space exploration plan, including the building of a space station by 2020. Currently, being one of the largest exporters in the world, China is attracting massive foreign investment. Meanwhile, it has invested billions of dollars overseas as well. In 2011, China surpassed Japan, becoming the second largest economic entity in the world.",
    "points": [
      "中国是世界上最古老的文明之一",
      "构成现代世界基础的许多元素都起源于中国",
      "中国现在拥有世界上发展最快的经济，并正经历着一次…",
      "中国还启动了雄心勃勃的太空探索计划，其中包括到2…",
      "目前,中国是世界最大的出口国之一，并正在吸引大量…"
    ]
  },
  {
    "id": "tr-cet4-2015-06-2",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2015.06",
    "topic": "经济 · 据报道",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "据报道，今年中国快递服务（courierservices)将递送大约120亿件包裹。这将使中国有可能超越美国成为世界上最大的快递市场。大多数包裹里装着网上订购的物品。中国给数百万在线零售商以极具竞争力的价格销售商品的机会。仅在11月11日，中国消费者就从国内最大的购物平台购买了价值90亿美元的商品。中国有不少这样的特殊购物日。因此,快递业在中国扩展就不足为奇了。",
    "reference": "It is reported that courier services in China will deliver about 12 billion parcels this year, which makes it possible for China to overtake the United States and become the largest market for courier services in the world. Most of the parcels contain items purchased online. China offers millions of online retailers opportunities to sell their products at significantly competitive prices. Chinese consumers bought $ 9 billion worth of commodities from the nation’s largest shopping platform just on the day of 11th November. Since there are many such special shopping days in China, it is no wonder that China5s courier services have expanded.",
    "points": [
      "据报道，今年中国快递服务（courierserv…",
      "这将使中国有可能超越美国成为世界上最大的快递市场",
      "大多数包裹里装着网上订购的物品",
      "中国给数百万在线零售商以极具竞争力的价格销售商品…",
      "仅在11月11日，中国消费者就从国内最大的购物平…"
    ]
  },
  {
    "id": "tr-cet6-2015-06-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2015.06",
    "topic": "历史文化",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "2011年是中国城市化(urbanization)进程中的历史性时刻，其城市人口首次超过农村人口。在未来20年里，预计约有3.5亿农村人口将移居到城市。如此规模的城市发展对城市交通来说既是挑战，也是机遇。中国政府一直提倡“以人为本”的发展理念，强调人们以公交而不是私家车出行。它还号召建设“资源节约和环境友好型”社会。有了这个明确的目标，中国城市就可以更好地规划其发展，并把大量投资转向安全、清洁和经济型交通系统的发展上。",
    "reference": "The year of 2011 is a historic moment in the process of urbanization in China, when the urban population exceeds the rural population for the first time. In the next 20 years, it is estimated that about 350 million rural populations will migrate to cities. Such a scale of urban development is both a challenge and an opportunity for urban transportation. The Chinese government has always been advocating the concept of “people-oriented” development，stressing that people should travel by buses instead of private cars. It also calls for the construction of“ resource-saving and environment-friendly society”. With this explicit goal, Chinese cities can make better plans for their development, and turn a massive investment to the development of safe, clean and economical transportation system.",
    "points": [
      "2011年是中国城市化(urbanization…",
      "在未来20年里，预计约有3.5亿农村人口将移居到…",
      "如此规模的城市发展对城市交通来说既是挑战，也是机…",
      "中国政府一直提倡“以人为本”的发展理念，强调人们…",
      "它还号召建设“资源节约和环境友好型”社会"
    ]
  },
  {
    "id": "tr-cet4-2015-06-3",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2015.06",
    "topic": "健康 · 在西方人心目",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "在西方人心目中，和中国联系最为密切的基本食物是大米。长期以来，大米在中国人的饮食中占据很重要的地位，以至于有谚语说“巧妇难为无米之炊”。中国南方大多种植水稻，人们通常以大米为主食；而华北大部分地区因为过于寒冷或过于干燥,无法种植水稻，那里的主要作物是小麦。",
    "reference": "In the eyes of the western people, the basic food that is mostly related to China is rice. For a long time, rice has played a very important part in Chinese people’s diet, so that there is a proverb that goes like this: One can’t make bricks without straw. Rice is mainly grown in southern China and people usually eat rice as the staple food. Since it is too cold or too dry to grow rice in most areas of northern China, wheat is the main crop. In China, some people use flour to make bread, but for most people, it is used to make steamed buns and noodles.",
    "points": [
      "在西方人心目中，和中国联系最为密切的基本食物是大…",
      "长期以来，大米在中国人的饮食中占据很重要的地位，…",
      "中国南方大多种植水稻，人们通常以大米为主食",
      "而华北大部分地区因为过于寒冷或过于干燥,无法种植…"
    ]
  },
  {
    "id": "tr-cet6-2015-06-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2015.06",
    "topic": "历史文化 · 汉朝",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "汉朝是中国历史上最重要的朝代之一。汉朝统治期间有很多显著的成就。它最先向其他文化敞开大门，对外贸易兴旺。汉朝开拓的丝绸之路通向了中西亚乃至罗马。各类艺术一派繁荣，涌现了很多文学、历史、哲学巨著。公元100年中国第一部字典编撰完成，收入9000个字，提供释义并列举不同的写法。其间，科技方面也取得了很大进步，发明了纸张、水钟、日晷（sundials)以及测量地震的仪器。汉朝历经400年，但统治者的腐败最终导致了它的灭亡。",
    "reference": "The Han dynasty is one of the most important dynasties in Chinese history. There are lots of remarkable achievements during the reign of the Han dynasty. Being the first dynasty to open the door to other cultures, it excelled in foreign trade. The Silk Road opened in the Han dynasty led to Central and Western Asia， even Rome. With all sorts of art schools flourishing, there appeared many great works in literary, history, and philosophy. In 100 AD，China’s first dictionary was completed which included 9 000 characters, providing definitions and different way to write the characters. During the period, the science and technology had also made grade progress, with paper water clock, sundials and instruments used to measure earthquakes invented. Though The Han dynasty had a history of 400 years, the corruption of its rulers finally contributed to its collapse.",
    "points": [
      "汉朝是中国历史上最重要的朝代之一",
      "汉朝统治期间有很多显著的成就",
      "它最先向其他文化敞开大门，对外贸易兴旺",
      "汉朝开拓的丝绸之路通向了中西亚乃至罗马",
      "各类艺术一派繁荣，涌现了很多文学、历史、哲学巨著"
    ]
  },
  {
    "id": "tr-cet4-2014-12-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2014.12",
    "topic": "历史文化",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "越来越多的中国年轻人正对旅游产生兴趣，这是近年来的新趋势。年轻游客数量的不断增加，可以归因于他们迅速提高的收入和探索外部世界的好奇心。随着旅行多了，年轻人在大城市和著名景点花的时间少了，他们反而更为偏远的地方所吸引。有些人甚至选择长途背包旅行。最近调查显示，很多年轻人想要通过旅行体验不同的文化、丰富知识、拓宽视野。",
    "reference": "It is a new trend in recent years that more and more Chinese young people are getting interested in traveling. The increasing number of young travelers can be attributed to the rapid growth of their income and their curiosity for exploring the outside world. While traveling more, youngsters spend less time in big cities and famous scenic spots. Instead, they are attracted to remoter places. Some of them would even choose long-distance backpacking. A recent survey shows that many young people want to experience different cultures, enlarge their knowledge and broaden their horizons through traveling.",
    "points": [
      "越来越多的中国年轻人正对旅游产生兴趣，这是近年来…",
      "年轻游客数量的不断增加，可以归因于他们迅速提高的…",
      "随着旅行多了，年轻人在大城市和著名景点花的时间少…",
      "有些人甚至选择长途背包旅行",
      "最近调查显示，很多年轻人想要通过旅行体验不同的文…"
    ]
  },
  {
    "id": "tr-cet6-2014-12-1",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2014.12",
    "topic": "民间艺术",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "反映在艺术和文学中的乡村生活理想是中国文明的重要特征。这在很大程度上归功于道家（Taoist)对自然的情感。传统中国画有两个最受青睐的主题，一是家庭生活的各种幸福场景，画中往往有老人在饮茶下棋，男人在耕耘收割，妇女在织布缝衣，小孩在户外玩耍。另一个则是乡村生活的种种乐趣，画有渔夫在湖上打渔，农夫在山上欲柴采药，或是书生坐在松树下呤诗作画。这两个主题可以分别代表儒家(Confucian)和道家的生活理想。",
    "reference": "The ideal of rural life reflected in the arts and literature is an important feature of Chinese civilization, which to a large extent can be attributed to Taoist affection for nature. There are two favorite themes in traditional Chinese paintings. One theme depicts various happy scenes of family life in which the seniors are drinking tea and playing chess, men are sowing and reaping, women are weaving and sewing, and the children are playing outside. The other theme depicts all kinds of joys of the country life. In the paintings, fishermen are fishing on the lake； farmers are cutting firewood or gathering herbs in the mountains; or scholars are chanting poetry and painting pictures under the pines. These two themes can respectively represent Confucian and Taoist ideals of life.",
    "points": [
      "反映在艺术和文学中的乡村生活理想是中国文明的重要…",
      "这在很大程度上归功于道家（Taoist)对自然的…",
      "传统中国画有两个最受青睐的主题，一是家庭生活的各…",
      "另一个则是乡村生活的种种乐趣，画有渔夫在湖上打渔…",
      "这两个主题可以分别代表儒家(Confucian)…"
    ]
  },
  {
    "id": "tr-cet4-2014-12-2",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2014.12",
    "topic": "科技 · 的互联网社区",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "中国的互联网社区是全世界发展最快的。2010年，中国约有4.2亿网民（netizen)，而且人数还在迅速增长。互联网的日渐流行带来了重大的社会变化。中国网民往往不同于美国网民。美国网民更多的是受实际需要的驱使，用互联网为工具发电子邮件、买卖商品、做研究、规划旅程或付款。中国网民更多是出于社交原因使用互联网，因而更广泛地使用论坛、博客、聊天室等。",
    "reference": "The Internet community of China develops fastest all over the world. The number of Chinese netizens has reached about 420 million in 2010 and it is still on the dramatic increase. The growing popularity of the Internet results in great social changes. Chinese netizens are usually different from American netizens. The latter is more often driven by practical needs, using the Internet as a tool to send e-mails, buy and sell goods, make researches, arrange trips and make payments. The former are more likely to use the Internet for the reason of social contacts, so they use forums, blogs and chat rooms on a larger scale.",
    "points": [
      "中国的互联网社区是全世界发展最快的",
      "2010年，中国约有4.2亿网民（netizen…",
      "互联网的日渐流行带来了重大的社会变化",
      "中国网民往往不同于美国网民",
      "美国网民更多的是受实际需要的驱使，用互联网为工具…"
    ]
  },
  {
    "id": "tr-cet6-2014-12-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2014.12",
    "topic": "教育",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "自从1978年启动改革以来，中国已从计划经济转为以市场为基础的经济，并经历了经济和社会的快速发展。年均10%的GDP增长已使五亿多人脱贫。联合国的“千年(millennium)发展目标”在中国均已达到或即将达到。目前，中国的第十二个五年规划强调发展服务业和解决环境及社会不平衡的问题。政府已设定目标减少污染，提高能源效率，改善得到教育和医保的机会，并扩大社会保障。中国现在7%的经济年增长目标表明政府意在重视生活质量而不是增长速度。",
    "reference": "Since the very beginning of the reform in 1978, China has transformed its planned economy to an economy based on the market and undergone a rapid development of economy and society. The average annual growth rate of GDP is 10%, which has brought more than 500 million people out of poverty. “The Millennium Development Goals” of the UN have been achieved or will be soon achieved in China. Currently, the twelfth Five-Year Plan of China emphasizes the development of service industry, the solutions to environmental and social imbalance. The government has set goals to reduce pollution, enhance energy efficiency, increase chances for education and medical insurance and expand social security. The current annual economic growth target of 7% in China shows the government attaches importance to the quality of life rather than the speed of economic growth.",
    "points": [
      "自从1978年启动改革以来，中国已从计划经济转为…",
      "年均10%的GDP增长已使五亿多人脱贫",
      "联合国的“千年(millennium)发展目标”…",
      "目前，中国的第十二个五年规划强调发展服务业和解决…",
      "政府已设定目标减少污染，提高能源效率，改善得到教…"
    ]
  },
  {
    "id": "tr-cet4-2014-12-3",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2014.12",
    "topic": "社会生活 · 大熊猫",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "大熊猫(giantpanda)是一种温顺的动物，长着独特的黑白皮毛。因其数量极少，大熊猫已被列为濒危物种。大熊猫对于世界自然基金会(WWF)有着特殊意义。自1961年该基金会成立以来，大熊猫就一直是它的徽标。大熊猫是熊科中最稀有的成员，主要生活在中国西南部的森林里。目前,世界上大约有1000只大熊猫。这些以竹为食的动物正面临许多威胁。因此，确保大熊猫的生存比以往更重要。",
    "reference": "The giant panda is a kind of gentle animal with a unique black-and-white coat. It has been listed as an endangered species due to its very limited number. The giant panda is of special significance to WWF (World Wide Fund for Nature). And it has been its symbol since its establishment in 1961. The giant panda is the rarest member of bear family, mainly living in the forests of Southwest China. Now, there are approximately 1,000 giant pandas in the world. The animal that mainly eats bamboo is facing many threats. Therefore, to ensure its survival is of greater importance than ever before.",
    "points": [
      "大熊猫(giantpanda)是一种温顺的动物，…",
      "因其数量极少，大熊猫已被列为濒危物种",
      "大熊猫对于世界自然基金会(WWF)有着特殊意义",
      "自1961年该基金会成立以来，大熊猫就一直是它的…",
      "大熊猫是熊科中最稀有的成员，主要生活在中国西南部…"
    ]
  },
  {
    "id": "tr-cet4-2014-06-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2014.06",
    "topic": "社会生活 · 应进一步发展核能",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "中国应进一步发展核能，因为核电目前只占其总发电量的2%。该比例在所有核国家中居第30位，几乎是最低的。2011年3月日本核电站事故后，中国的核能开发停了下来，中止审批新的核电站，并开展全国性的核安全检查。到2012年10月，审批才又谨慎地恢复。",
    "reference": "China should further develop nuclear energy, because nuclear power currently accounts for only 2% of its total generating capacity. The proportion ranks the 30th among all countries possessing nuclear energy, which is almost the lowest. Chinas nuclear power development stopped after the nuclear power station accident in Japan in March, 2011. The approval of new nuclear power plants was suspended, and the nationwide nuclear energy safety inspection started. It wasn’t until October, 2012 that examination and approval was restored cautiously. With the improvement of technology and safety measures, the possibility of nuclear accidents can definitely be minimized. In other words, the nuclear energy can be exploited and utilized safely.",
    "points": [
      "中国应进一步发展核能，因为核电目前只占其总发电量…",
      "该比例在所有核国家中居第30位，几乎是最低的",
      "2011年3月日本核电站事故后，中国的核能开发停…",
      "到2012年10月，审批才又谨慎地恢复"
    ]
  },
  {
    "id": "tr-cet6-2014-06-1",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2014.06",
    "topic": "历史文化",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "北京计划未来三年投资7600亿元治理污染，从减少PM2.5排放入手。这一新公布的计划旨在减少四种主要污染源，包括500多万辆机动车的尾气(exhaust)排放、周边地区燃煤、来自北方的沙尘暴和本地的建筑灰尘。另850亿元用于新建或升级城市垃圾处理和污水（sewage)处理设施，加上300亿元投资未来三年的丝树造林（forestation)。市政府还计划建造一批水循环利用工厂，并制止违章建筑，以改善环境。另外，北京还将更严厉地处罚违反限排规定的行为。",
    "reference": "Beijing is planning to invest 760 billion yuan to control pollution in the next three years, starting from reducing the emission of PM2. 5. The newly announced plan is aimed at reducing four major sources of pollution, including exhaust emissions of over 5 million motor vehicles, coal-burning in surrounding areas, sandstorms from the north and local construction dust. Another 85 billion yuan will be used to establish or upgrade the facilities for municipal waste treatment and sewage treatment. Besides, 30 billion yuan will be invested in the forestation program in the coming three years. In order to improve the environment, the municipal government also plans to construct a number of water-recycling plants and to ban illegal construction. In addition, Beijing will impose tougher punishments on those who violate the emission-reduction regulations.",
    "points": [
      "北京计划未来三年投资7600亿元治理污染，从减少…",
      "这一新公布的计划旨在减少四种主要污染源，包括50…",
      "另850亿元用于新建或升级城市垃圾处理和污水（s…",
      "市政府还计划建造一批水循环利用工厂，并制止违章建…",
      "另外，北京还将更严厉地处罚违反限排规定的行为"
    ]
  },
  {
    "id": "tr-cet4-2014-06-2",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2014.06",
    "topic": "教育",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "中国教育工作者早就认识到读书对于国家的重要意义。有些教育工作者2003年就建议设立全民读书日。他们强调，人们应当读好书，尤其是经典著作。通过阅读，人们能更好地学会感恩、有责任心和与人合作，而教育的目的正是要培养这些基本素质。阅读对于中小学生尤为重要,假如他们没有在这个关键时期培养阅读的兴趣，以后要养成阅读的习惯就很难了。",
    "reference": "Chinese educators have long realized that reading is of great importance to a nation. Some of them even proposed to establish the National Reading Day in 2003. They emphasized that people shotild read good books, especially the classic ones. By reading, people can better learn to be grateful, responsible and cooperative, the very basic qualities education intends to foster. Reading is especially important for students in the primary school and middle school; if the interest of reading is not fostered at that critical period, it will be quite difficult to cultivate the habit of reading later.",
    "points": [
      "中国教育工作者早就认识到读书对于国家的重要意义",
      "有些教育工作者2003年就建议设立全民读书日",
      "他们强调，人们应当读好书，尤其是经典著作",
      "通过阅读，人们能更好地学会感恩、有责任心和与人合…",
      "阅读对于中小学生尤为重要,假如他们没有在这个关键…"
    ]
  },
  {
    "id": "tr-cet6-2014-06-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2014.06",
    "topic": "历史文化",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "中文热词通常反映社会变化和文化，有些在外国媒体上愈来愈流行。例如,土豪（tuhao)和大妈（dama)都是老词，但已获取了新的意义。土豪以前指欺压佃户和仆人的乡村地主，现在用于指花钱如流水或喜欢炫耀财富的人。也就是说，土豪有钱，但没有品位。大妈是对中年妇女的称呼，但现在特指不久前金价下跌时大量购买黄金的中国妇女。土豪和大妈可能会被收入新版牛津(Oxford)英语词典。至今已有约120个中文词被加进了牛津英语词典,成了英语语言的一部分。",
    "reference": "Chinese hot words, some of which are increasingly popular with foreign media，usually reflect social changes and culture. For instance, tuhao and dama are old words, but they have acquired new meanings. In the past, the word tuhao referred to village landlords who oppressed peasants and servants, but now it is used to describe people who spend money unwisely or like to show off their wealth. In other words, tuhaos are wealthy but don’t have good taste. The word dama is used to call middle-aged women, but now it especially refers to Chinese women who bought large amounts of gold when the price of gold fell not long ago. The words tuhao and dama may be included in the next edition of Oxford English Dictionary. Until now, about 120 Chinese words have been added to the dictionary, becoming a part of the English language.",
    "points": [
      "中文热词通常反映社会变化和文化，有些在外国媒体上…",
      "例如,土豪（tuhao)和大妈（dama)都是老…",
      "土豪以前指欺压佃户和仆人的乡村地主，现在用于指花…",
      "也就是说，土豪有钱，但没有品位",
      "大妈是对中年妇女的称呼，但现在特指不久前金价下跌…"
    ]
  },
  {
    "id": "tr-cet4-2014-06-3",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2014.06",
    "topic": "教育 · 促进教育公平",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "为了促进教育公平，中国已投入360亿元,用于改善农村地区教育设施和加强中西部地区农村义务教育(compulsoryeducation)。这些资金用于改善教学设施、购买书籍，使16万多所中小学受益。资金还用于购置音乐和绘画器材。现在农村和山区的儿童可以与沿海城市的儿童一样上音乐和绘画课。一些为接受更好教育而转往城市上学的学生如今又回到了本地农村学校就读。",
    "reference": "In order to promote education equity, China has invested 36 billion yuan to improve the education facilities in rural areas and strengthen rural compulsory education in the central and western regions. The funds is used to better the school’s teaching facilities and purchase books, from which more than 160,000 middle and primaiy schools have gained benefits. The funding is also spent on acquiring musical and painting instruments. Nowadays, children in rural and mountainous areas can have access to music and drawing lessons just like children in coastal cities.",
    "points": [
      "为了促进教育公平，中国已投入360亿元,用于改善…",
      "这些资金用于改善教学设施、购买书籍，使16万多所…",
      "资金还用于购置音乐和绘画器材",
      "现在农村和山区的儿童可以与沿海城市的儿童一样上音…",
      "一些为接受更好教育而转往城市上学的学生如今又回到…"
    ]
  },
  {
    "id": "tr-cet6-2014-06-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2014.06",
    "topic": "社会生活",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "系列报告包括三部分:科学发展报告、高技术发展报告、中国可持续发展战略报告。第一份报告包含中国科学家的最新发现，诸如新粒子研究与H7N9病毒研究的突破。该报告还突出强调了未来几年需要关注的问题。第二份报告公布了一些应用科学研究的热门领域，如3D打印和人造器官研究。第三份报告呼吁加强顶层设计，以消除工业升级中的结构性障碍，并促进节能减排。",
    "reference": "Recently, the Chinese Academy of Sciences released a series of annual reports concerning its latest scientific findings and the prospect of the next year. The reports consisted of three parts： scientific development , hi-tech development and the sustainable development strategy of China, The first report included the latest findings of Chinese scientists,such as the breakthrough in the research fields of new particles and H7N9 virus. The report also highlighted some issues that we need to pay attention to in the coming years. The second report announced several hot fields of the applied scientific research, such as the study of 3D printing and artificial organs. The third report called on the improvement in top-level design so as to get rid of the structural barriers of industrial upgrading and contribute to energy conservation and emission reduction.",
    "points": [
      "系列报告包括三部分:科学发展报告、高技术发展报告…",
      "第一份报告包含中国科学家的最新发现，诸如新粒子研…",
      "该报告还突出强调了未来几年需要关注的问题",
      "第二份报告公布了一些应用科学研究的热门领域，如3…",
      "第三份报告呼吁加强顶层设计，以消除工业升级中的结…"
    ]
  },
  {
    "id": "tr-cet4-2013-12-1",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2013.12",
    "topic": "健康",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "许多人喜欢中餐,在中国,烹饪不仅被视为一种技能,而且也被视为一种艺术。精心准备的中餐既可口又好看,烹饪技艺和配料在中国各地差别很大。但好的烹饪都有一个共同点,总是要考虑到颜色、味道、口感和营养(nutrition)。由于食物对健康至关重要,好的厨师总是努力在谷物、肉类和蔬菜之间取得平衡,所以中餐既味美又健康。",
    "reference": "Many people are fond of Chinese cuisine. In China, cooking is regarded not on ly as acraftsmanship, but also as an art. 'Well-prepaied Chinese cuisine is bot h tasty and good-looking. The culinary skills and dish ingredients vary in diff erent regions of China. However,good Chinese cuisine always shares somethin g in common, that is, the color, aroma, taste andnutrition. As food is vital f or one's health, a good chef is always trying to strike a balanceamong grain, meat and vegetables. That's why Chinese cuisine is tasty and healthy.",
    "points": [
      "许多人喜欢中餐,在中国,烹饪不仅被视为一种技能,…",
      "精心准备的中餐既可口又好看,烹饪技艺和配料在中国…",
      "但好的烹饪都有一个共同点,总是要考虑到颜色、味道…",
      "由于食物对健康至关重要,好的厨师总是努力在谷物、…"
    ]
  },
  {
    "id": "tr-cet6-2013-12-1",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2013.12",
    "topic": "历史文化 · 闻名",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "闻名于世的丝绸之路是一系列连接东西方的路线。丝绸之路延伸6,000多公里，得名于古代中国的丝绸贸易。丝绸之路上的贸易在中国、南亚、欧洲和中东文明发展中发挥了重要作用。正是通过丝绸之路，中国的造纸、火药、指南针、印刷术等四大发明才被引介到世界各地。同样，中国的丝绸、茶叶和瓷器(porcelain)也传遍全球。物质文化。",
    "reference": "The world-renowned Silk Road is a series of routes connecting the East and the West. Extending more than 6,000 kilometers, the Silk Road got its name from the silk trade of ancient China. The trade which was carried out along this route played an important role in the civilization development of China, South Asia, Europe and the Middle East. It was through the Silk Road that the four great inventions of ancient China, namely papermaking, gunpowder, compass and printing, were introduced to the world. Similarly, Chinese silk, tea and porcelain were spread all over the world.",
    "points": [
      "闻名于世的丝绸之路是一系列连接东西方的路线",
      "丝绸之路延伸6,000多公里，得名于古代中国的丝…",
      "丝绸之路上的贸易在中国、南亚、欧洲和中东文明发展…",
      "正是通过丝绸之路，中国的造纸、火药、指南针、印刷…",
      "同样，中国的丝绸、茶叶和瓷器(porcelain…"
    ]
  },
  {
    "id": "tr-cet4-2013-12-2",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2013.12",
    "topic": "历史文化 · 结最初",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "中国结（theChineseknot）最初是由手工艺人发明的，经过数百年不断的改进，已经成为一种优雅多彩的艺术和工艺。在古代，人们用它来记录事件，但现在主要是用于装饰的目的。“结”在中文里意味这爱情、姻和团聚，中国结常常作为礼物交换或作用饰品祈求好运和辟邪。这种形式的手工艺（handicraft）代代相传，现在已经在中国和世界各地越来越受欢迎。",
    "reference": "The Chinese knot, originally invented by the craftsmen, has become an elegant and colorful art and craft over hundreds of years' improvement. In ancient times’ it was used to record events, but nowadays it is mainly functioning as decorations. \"Knot\" signifies love, marriage and reunion in Chinese. Often used as gift exchanges or decorations, the Chinese knot is believed to bring good luck as well as ward off evil spirits. The handicraft has been passed down from one generation to another and now is gaining popularity both at home and abroad.",
    "points": [
      "中国结（theChineseknot）最初是由手…",
      "在古代，人们用它来记录事件，但现在主要是用于装饰…",
      "“结”在中文里意味这爱情、姻和团聚，中国结常常作…",
      "这种形式的手工艺（handicraft）代代相传…"
    ]
  },
  {
    "id": "tr-cet6-2013-12-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2013.12",
    "topic": "历史文化",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "为皇室成员享乐而建造的大型花园，也包括学者、商人和卸任的政府官员为摆脱嘈杂的外部世界而建造的私家花园。这些花园构成了一种意在表达人与自然之间应有的和谐关系的微缩景观。典型的中国园林四周有围墙，园内有池塘、假山(rockwork)、树木、花草以及各种各样由蜿蜒的小路和走廊连接的建筑。漫步在花园中，人们可以看到一系列精心设计的景观犹如山水画卷（scroll)一般展现在面前。",
    "reference": "After 3,000 years of evolution, the Chinese garden has become a unique landscape. It includes both large gardens built as entertainment venues for royal family, and private gardens built as secluded retreats for scholars, merchants and retired government officials. These gardens have constituted a miniature that is designed in praise of the harmony between man and nature.",
    "points": [
      "为皇室成员享乐而建造的大型花园，也包括学者、商人…",
      "这些花园构成了一种意在表达人与自然之间应有的和谐…",
      "典型的中国园林四周有围墙，园内有池塘、假山(ro…",
      "漫步在花园中，人们可以看到一系列精心设计的景观犹…"
    ]
  },
  {
    "id": "tr-cet4-2013-12-3",
    "level": "cet4",
    "levelLabel": "四级",
    "year": "2013.12",
    "topic": "历史文化 · 要茶还",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "“要茶还是要咖啡？”是用餐人常被问到的问题。许多西方人会选咖啡，而中国人则会选茶。相传，中国的一位帝王于五千多年前发现了茶，并用来治病。在明清（theMingandQingDynasties）期间，茶馆遍布全国。饮茶在六世纪传到日本，但直到十七、十八世纪才传到欧美。如今，茶是世界上最流行的饮料（beverage）之一。茶是中国的民族饮品，也是中国传统和文化的重要组成部分。",
    "reference": "“Tea or coffee?” That?s a question often asked when people have a meal. Many Westerners would choose coffee, while the Chinese would choose tea. Legend has it that tea was discovered by a Chinese emperor five thousand years ago, and was used to cure disease. During the Ming and Qing Dynasties, tea houses were all over the country. Tea drinking was introduced to Japan in the 6th century, but it was not until the 17th or the 18th century that it spread to Europe and America. Nowadays, tea is one of the most popular beverages in the world. It is not only the national beverage of China, but also an important part of Chinese tradition and culture.",
    "points": [
      "“要茶还是要咖啡",
      "”是用餐人常被问到的问题",
      "许多西方人会选咖啡，而中国人则会选茶",
      "相传，中国的一位帝王于五千多年前发现了茶，并用来…",
      "在明清（theMingandQingDynast…"
    ]
  },
  {
    "id": "tr-cet6-2013-12-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2013.12",
    "topic": "节日习俗",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "中国人自古以来就在中秋时节庆祝丰收。这与北美地区庆祝感恩节的习俗十分相似。过中秋节的习俗于唐代早期在中国各地开始流行。中秋节在农历八月十五，是人们拜月的节日:这天夜晚皓月当空，人们合家团聚，共赏明月。2006年，中秋节被列为中国的文化遗产，2008年又被定为公共假日。月饼被视为中秋节不可或缺的美食。人们将月饼作为礼物馈赠亲友或在家庭聚会上享用。",
    "reference": "Since ancient times, the Chinese people have celebrated bumper harvest on the Mid-Autumn Festival. This custom resembles that of Thanksgiving Day in the North America. The custom of celebrating the Mid-Autumn Festival became popular all over China in the early Tang Dynasty. Celebrated on the 15th day of the eighth lunar month, the Mid-Autumn Festival is a day for worshiping the moon. At night, family members get together and enjoy the bright moon in the sky. In 2006, the Mid-Autumn Festival was listed as a Chinese cultural heritage, and in 2008 designated as a public holiday. The mooncake, an indispensable food of the Festival, is often used as a gift for relatives and friends or enjoyed at family gatherings. Traditional mooncakes are imprinted with Chinese characters with such meanings as “longevity”, “happiness” or “harmony” etc.",
    "points": [
      "中国人自古以来就在中秋时节庆祝丰收",
      "这与北美地区庆祝感恩节的习俗十分相似",
      "过中秋节的习俗于唐代早期在中国各地开始流行",
      "中秋节在农历八月十五，是人们拜月的节日:这天夜晚…",
      "2006年，中秋节被列为中国的文化遗产，2008…"
    ]
  },
  {
    "id": "tr-cet6-2013-06-1",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2013.06",
    "topic": "历史文化",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "construction)以及其他技巧为特色的风格。一般来讲，中国的传统建筑风格可分为几个类别：皇家宫殿、宅居厅室、寺庙佛塔（pagoda)、墓园陵寝及园林建筑。然而，中国不同地区和不同民族的建筑风格可能在特色和功能上有所不同。从中国北方到南方，从黄河到长江，一路上你会被中国建筑师们的杰作所感动。勤劳的中国劳动人民创造了很多建筑奇迹，如长城、故宫。",
    "reference": "During its long evolution process, Chinese architecture gradually developed a style which featured timberwork combining stone carving，rammed earth construction，and many other techniques. Generally speaking, traditional Chinese architectural style can be classified into several categories: royal palaces, residential houses, religious temples and pagodas, tombs, and garden architectures. However, the architectural styles of different regions and ethnic groups in China may vary in characteristics and functions. Travelling the way from the Northern China to the South, from the Yellow River down to the Yangtze River, you will be moved by the works of Chinese architects. Industrious Chinese labouring people created many architectural miracles such as the Great Wall and the Palace Museum.",
    "points": [
      "construction)以及其他技巧为特色的风…",
      "一般来讲，中国的传统建筑风格可分为几个类别：皇家…",
      "然而，中国不同地区和不同民族的建筑风格可能在特色…",
      "从中国北方到南方，从黄河到长江，一路上你会被中国…",
      "勤劳的中国劳动人民创造了很多建筑奇迹，如长城、故…"
    ]
  },
  {
    "id": "tr-cet6-2013-06-2",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2013.06",
    "topic": "历史文化 · 明朝第三",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "明朝第三位皇帝朱棣在夺取（usurp)帝位后，从南京迁都北京，于1406年开始建造紫禁城这座宫殿，至明永乐十八年（1420年）落成。随着1924年清朝的最后一位皇帝溥仪退位（abdication)后被驱逐出皇宫，它失去了原有的功能。在这五百余年中，共有24位皇帝曾在此居住，统治全国。今天，紫禁城是一个博物院，也是世界上最受欢迎的旅游景点之一。游客们可以看到传统的宫殿建筑，可以欣赏保存在宫殿里的珍宝，还可以听到一些关于皇族和朝廷的传说和轶事。",
    "reference": "The Forbidden City was built from 1406 to 1420 by the third Ming Emperor Zhu Di who, upon usurping the throne, determined to move his capital north from Nanjing to Beijing. It lost its original function in the year 1924 when Puyi, the last emperor of the Qing Dynasty, was expelled from this palace after his abdication. During its 500-year span, twenty-four emperors lived and ruled from this palace. Today, the Forbidden City is a public museum and has become one of the most popular tourist attractions in the world. Visitors can see the traditional palace architecture, enjoy the treasures kept in the palace, and learn of the legend and anecdotes about the imperial family and the court.",
    "points": [
      "明朝第三位皇帝朱棣在夺取（usurp)帝位后，从…",
      "随着1924年清朝的最后一位皇帝溥仪退位（abd…",
      "在这五百余年中，共有24位皇帝曾在此居住，统治全…",
      "今天，紫禁城是一个博物院，也是世界上最受欢迎的旅…",
      "游客们可以看到传统的宫殿建筑，可以欣赏保存在宫殿…"
    ]
  },
  {
    "id": "tr-cet6-2013-06-3",
    "level": "cet6",
    "levelLabel": "六级",
    "year": "2013.06",
    "topic": "历史文化",
    "mode": "zh2en",
    "minutes": 20,
    "prompt": "中国是最早生产丝绸的国家。考古学家们认为，中国的桑蚕丝织技术，至少有4000多年的历史。丝绸很早就成为了古代宫廷贵族的主要衣料和对外贸易的重要商品。中国古代丝绸品种丰富多彩。西方人十分喜爱中国丝绸。据说，公元1世纪，一位古罗马皇帝曾穿着中国的丝绸袍去看戏，顿时轰动了整个剧场。从此，人们都希望能穿上中国的丝绸衣服，中国也因此被称为“丝国”。",
    "reference": "China is the earliest country to have produced silk. Archaeologists believe the technology of silk weaving has at least a history of more than 4,000 years. Silk had been the main materials to make clothes for the noblemen and their families as well as an important commodity for export since long ago. There are various kinds of ancient Chinese silk. Westerners were very fond of Chinese silk. It is said that during the first century AD, a Roman emperor went to the theatre wearing silk, which made a great stir in the audience. Since then, people wished to wear clothes made of Chinese silk. China, therefore, was called the “Silk Country”. Silk has made people’s life beautiful and promoted friendly exchanges between China and other countries.",
    "points": [
      "中国是最早生产丝绸的国家",
      "考古学家们认为，中国的桑蚕丝织技术，至少有400…",
      "丝绸很早就成为了古代宫廷贵族的主要衣料和对外贸易…",
      "中国古代丝绸品种丰富多彩",
      "西方人十分喜爱中国丝绸"
    ]
  }
]

function writingQuestionById(id) {
  const key = String(id || '').trim()
  return WRITING_QUESTIONS.find((item) => item.id === key) || null
}

// 下发到前端的题目：去掉参考译文、采分点，避免提前看到答案
function publicWritingQuestion(item) {
  return {
    id: item.id,
    level: item.level,
    levelLabel: item.levelLabel,
    year: item.year,
    topic: item.topic,
    mode: item.mode,
    minutes: item.minutes,
    prompt: item.prompt,
    chars: (item.prompt.match(/[\u4e00-\u9fa5]/g) || []).length
  }
}

module.exports = { WRITING_QUESTIONS, writingQuestionById, publicWritingQuestion }
