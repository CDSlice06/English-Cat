// 提分金句：同一意思用六级/考研水平的词汇与句式表达，考场可直接改写套用。
const advanced = [
  {
    id: 'a1',
    topic: '传统文化与非遗',
    zh: '中国非物质文化遗产数量位居世界前列，这既体现了文化多样性，也对系统性保护提出了更高要求。',
    en: "China ranks among the world's leaders in intangible cultural heritage, a distinction that both reflects its cultural diversity and underscores the imperative to pursue systematic preservation.",
    note: '提分点：同位语；underscore；imperative'
  },
  {
    id: 'a2',
    topic: '传统文化与非遗',
    zh: '许多传统手艺一度濒临失传，直到近年年轻人开始关注，才重新焕发生机。',
    en: "Not until young people began to show interest in recent years did a multitude of traditional crafts, once on the verge of extinction, regain their vitality.",
    note: '提分点：Not until 倒装；a multitude'
  },
  {
    id: 'a3',
    topic: '传统文化与非遗',
    zh: '只有在保护原真性的前提下适度开发，非遗才能真正成为地方发展的动力。',
    en: "Only by pursuing moderate development while preserving authenticity can intangible heritage genuinely serve as a driving force for local growth, rather than a mere commodity for tourists.",
    note: '提分点：Only by 倒装；while 分词'
  },
  {
    id: 'a4',
    topic: '传统文化与非遗',
    zh: '昆曲、京剧等传统戏曲以程式化的表演，承载着中国人的审美情趣与价值观念。',
    en: "Traditional operas such as Kunqu and Peking opera, with their highly stylized performance conventions, carry the aesthetic sensibilities and value systems of the Chinese people across centuries.",
    note: '提分点：with 复合状语；stylized'
  },
  {
    id: 'a5',
    topic: '传统文化与非遗',
    zh: '虽然申遗成功带来了关注，但若缺乏持续投入，许多遗产地仍面临过度商业化的风险。',
    en: "Granted that World Heritage listing brings considerable attention, a multitude of sites still run the risk of over-commercialization in the absence of sustained investment, which may erode their authenticity.",
    note: '提分点：Granted that 让步；erode'
  },
  {
    id: 'a6',
    topic: '传统文化与非遗',
    zh: '数字化手段让敦煌壁画得以永久保存，也让更多人有机会近距离欣赏这一艺术瑰宝。',
    en: "Digital technology has made it possible to preserve the Dunhuang murals permanently and, in doing so, has enabled a far wider audience to appreciate this artistic treasure at close range.",
    note: '提分点：it 形式宾语；in doing so'
  },
  {
    id: 'a7',
    topic: '历史与地理',
    zh: '丝绸之路不仅是商品流通的通道，更是东西方文明交流互鉴的桥梁。',
    en: "The Silk Road served not merely as a channel for the circulation of commodities but as a bridge across which Eastern and Western civilizations exchanged and enriched one another.",
    note: '提分点：not merely…but；circulation'
  },
  {
    id: 'a8',
    topic: '历史与地理',
    zh: '黄河孕育了中华文明，却也不时泛滥成灾，历代治理从未停止。',
    en: "While the Yellow River gave birth to Chinese civilization, it has repeatedly flooded the surrounding plains, which explains why successive dynasties devoted themselves to harnessing it.",
    note: '提分点：while 对比；harness'
  },
  {
    id: 'a9',
    topic: '历史与地理',
    zh: '中国地势西高东低，呈三级阶梯分布，这一特征深刻影响了人口与经济的格局。',
    en: "China's terrain descends from west to east in three distinct steps, a geographical feature that has profoundly shaped the distribution of its population and the pattern of its economy.",
    note: '提分点：同位语；descend；profoundly'
  },
  {
    id: 'a10',
    topic: '历史与地理',
    zh: '长城始建于两千多年前，历代不断修筑，如今已成为中华民族坚韧不拔的象征。',
    en: "First built over two thousand years ago and extended by successive dynasties, the Great Wall has come to symbolize the resilience and perseverance of the Chinese nation.",
    note: '提分点：过去分词状语；come to do'
  },
  {
    id: 'a11',
    topic: '历史与地理',
    zh: '大运河贯通南北，使粮食与物资源源不断地运往京城，促进了沿线城市的繁荣。',
    en: "The Grand Canal linked the north and the south, allowing grain and other supplies to flow to the capital without interruption and spurring the prosperity of the cities along its route.",
    note: '提分点：分词并列状语；spur'
  },
  {
    id: 'a12',
    topic: '历史与地理',
    zh: '正是这些山脉与河流的阻隔，塑造了各地迥异的方言与生活方式。',
    en: "It is precisely the barriers formed by these mountains and rivers that have shaped the markedly different dialects and ways of life found in different regions.",
    note: '提分点：It is…that 强调；markedly'
  },
  {
    id: 'a13',
    topic: '经济与发展',
    zh: '改革开放以来，中国经济持续快速增长，数亿人因此摆脱了贫困。',
    en: "Since the launch of reform and opening-up, China's economy has expanded at a sustained pace, lifting hundreds of millions of people out of poverty and reshaping the global economic landscape.",
    note: '提分点：名词化 launch；lifting 分词'
  },
  {
    id: 'a14',
    topic: '经济与发展',
    zh: '数字经济已成为增长的新引擎，传统产业若不加快转型，就可能在竞争中被淘汰。',
    en: "The digital economy has become a new engine of growth, and traditional industries that fail to accelerate their transformation run the risk of being squeezed out of an increasingly fierce competition.",
    note: '提分点：定语从句；run the risk of'
  },
  {
    id: 'a15',
    topic: '经济与发展',
    zh: '区域发展不平衡依然突出，缩小城乡差距需要长期而系统的努力。',
    en: "The imbalance in regional development remains conspicuous, and narrowing the gap between urban and rural areas calls for sustained and systematic efforts rather than short-term remedies.",
    note: '提分点：动名词主语；call for'
  },
  {
    id: 'a16',
    topic: '经济与发展',
    zh: '高铁网络将偏远地区纳入全国市场，为当地经济注入了新的活力。',
    en: "By integrating remote regions into the national market, the high-speed rail network has injected fresh vitality into local economies and given rise to a multitude of business opportunities.",
    note: '提分点：By doing 状语；give rise to'
  },
  {
    id: 'a17',
    topic: '经济与发展',
    zh: '消费升级促使企业不断改进产品质量，而固守旧模式的企业则逐渐失去市场。',
    en: "As consumption patterns upgrade, enterprises are compelled to improve product quality, whereas those that cling to outmoded business models are gradually losing their market share and, in some cases, being forced to withdraw altogether.",
    note: '提分点：whereas 对比；cling to'
  },
  {
    id: 'a18',
    topic: '经济与发展',
    zh: '中小企业提供了大量就业岗位，但其融资难的问题仍未得到根本解决。',
    en: "Small and medium-sized enterprises generate a substantial number of jobs, but the difficulty they face in obtaining financing has yet to be resolved at its root.",
    note: '提分点：have yet to；省略关系词'
  },
  {
    id: 'a19',
    topic: '科技与创新',
    zh: '人工智能正深刻改变生产方式，但随之而来的伦理问题同样不容忽视。',
    en: "Artificial intelligence is profoundly transforming the way products and services are produced and consumed, yet the ethical issues that accompany it are equally deserving of attention.",
    note: '提分点：yet 对比；deserving of'
  },
  {
    id: 'a20',
    topic: '科技与创新',
    zh: '只有把核心技术掌握在自己手中，企业才能在激烈的国际竞争中立于不败之地。',
    en: "Only by mastering core technologies at home can enterprises secure a firm foothold in fierce international competition and thus avoid being held hostage to foreign suppliers.",
    note: '提分点：Only by 倒装；hold hostage'
  },
  {
    id: 'a21',
    topic: '科技与创新',
    zh: '5G 技术的普及催生了大量新业态，远程医疗与在线教育因此惠及更多人群。',
    en: "The proliferation of 5G technology has given rise to a multitude of new business forms, through which telemedicine and online education now benefit a markedly wider population.",
    note: '提分点：proliferation；give rise to'
  },
  {
    id: 'a22',
    topic: '科技与创新',
    zh: '科研人员反复实验，终于突破了这一技术瓶颈，使成本大幅下降。',
    en: "Having conducted repeated experiments and overcome one technical obstacle after another, the researchers eventually broke through the bottleneck, bringing about a substantial reduction in production costs.",
    note: '提分点：Having done 分词；bring about'
  },
  {
    id: 'a23',
    topic: '科技与创新',
    zh: '如果科技成果不能转化为实际产品，再多的投入也难以产生应有的效益。',
    en: "Unless scientific achievements are translated into marketable products, even substantial investment will fail to deliver the economic and social benefits it is supposed to produce in the end.",
    note: '提分点：Unless 条件；translate into'
  },
  {
    id: 'a24',
    topic: '科技与创新',
    zh: '平台经济的迅速扩张便利了生活，却也带来了数据安全与垄断方面的隐忧。',
    en: "The rapid expansion of the platform economy has made daily life far more convenient, albeit at the expense of data security and fair competition—concerns that regulators can no longer afford to ignore.",
    note: '提分点：albeit 让步；expense 搭配'
  },
  {
    id: 'a25',
    topic: '生态与环保',
    zh: '经济发展不能以牺牲环境为代价，否则治理成本终将超过所得收益。',
    en: "Economic growth must not be achieved at the expense of the environment, for the cost of remediation would eventually outweigh the gains it brings in the long run.",
    note: '提分点：at the expense of；outweigh'
  },
  {
    id: 'a26',
    topic: '生态与环保',
    zh: '随着公众环保意识增强，一次性塑料制品的使用正受到越来越严格的限制。',
    en: "As public awareness of environmental protection grows, the use of single-use plastics is being subjected to increasingly stringent restrictions, a trend that has been reinforced by both legislation and consumer choice.",
    note: '提分点：be subjected to；同位语 trend'
  },
  {
    id: 'a27',
    topic: '生态与环保',
    zh: '只有把生态保护纳入发展规划，良好环境才能真正转化为持续的经济优势。',
    en: "Only when ecological protection is built into development planning can a sound environment be translated into a lasting economic advantage rather than a slogan invoked on ceremonial occasions.",
    note: '提分点：Only when 倒装；be built into'
  },
  {
    id: 'a28',
    topic: '生态与环保',
    zh: '近年来可再生能源装机容量迅速扩大，煤炭在能源结构中的比重逐步下降。',
    en: "Recent years have witnessed a rapid expansion of installed renewable capacity, whereas the share of coal in the energy mix has declined steadily, a shift driven by both policy incentives and technological advances.",
    note: '提分点：witnessed 拟人；whereas'
  },
  {
    id: 'a29',
    topic: '生态与环保',
    zh: '垃圾分类看似琐碎，却能显著减少资源浪费，其成效取决于居民的日常配合。',
    en: "Seemingly trivial as waste sorting may appear, it can markedly reduce the waste of resources, and its effectiveness hinges on the daily cooperation of ordinary residents.",
    note: '提分点：as 倒装让步；hinge on'
  },
  {
    id: 'a30',
    topic: '生态与环保',
    zh: '若不加遏制，塑料污染将进一步蔓延至海洋，危及整个生态系统。',
    en: "Unless curbed in time, plastic pollution will spread further into the oceans and endanger the entire ecosystem, the consequences of which may prove irreversible for decades to come.",
    note: '提分点：Unless+分词；curb'
  },
  {
    id: 'a31',
    topic: '健康与体育',
    zh: '久坐不动的生活方式显著增加了慢性病风险，而规律锻炼则能有效缓解这一问题。',
    en: "A sedentary lifestyle markedly increases the risk of chronic diseases, whereas regular exercise, if sustained over the years, can alleviate the problem and enhance overall well-being.",
    note: '提分点：whereas 对比；alleviate'
  },
  {
    id: 'a32',
    topic: '健康与体育',
    zh: '全民健身已上升为国家战略，越来越多的城市把体育设施纳入社区规划。',
    en: "Fitness for all has been elevated to a national strategy, with a growing number of cities incorporating sports facilities into community planning so that residents can exercise within walking distance.",
    note: '提分点：with 复合结构；so that'
  },
  {
    id: 'a33',
    topic: '健康与体育',
    zh: '中医药强调防病于未然，其整体观念正受到越来越多海外研究者的关注。',
    en: "Traditional Chinese medicine stresses preventing illness before it arises, and its holistic approach is attracting mounting attention from overseas researchers, who regard it as a valuable complement to conventional treatment.",
    note: '提分点：mounting；非限定从句'
  },
  {
    id: 'a34',
    topic: '健康与体育',
    zh: '大型体育赛事不仅带动了基础设施建设，也提升了主办城市的国际知名度。',
    en: "Hosting major sporting events not only spurs the construction of infrastructure but also enhances the international visibility of the host city, albeit at a considerable financial cost.",
    note: '提分点：not only…but also；albeit'
  },
  {
    id: 'a35',
    topic: '健康与体育',
    zh: '心理健康问题长期被忽视，如今社会对它的认识正逐步改善，患者也更愿意主动发声。',
    en: "Mental health problems were long neglected, yet public understanding of them is gradually improving, thanks in part to wider media coverage and to the willingness of patients to speak out.",
    note: '提分点：yet 对比；thanks in part to'
  },
  {
    id: 'a36',
    topic: '健康与体育',
    zh: '与其生病后再治疗，不如通过合理饮食与充足睡眠提前预防，这一习惯使人终身受益。',
    en: "Rather than seek treatment after illness sets in, people would do better to prevent it through a balanced diet and adequate sleep, a habit that pays off over a lifetime.",
    note: '提分点：Rather than 前置；pay off'
  },
  {
    id: 'a37',
    topic: '教育与社会',
    zh: '教育的价值不只在于传授知识，更在于培养学生独立思考的能力。',
    en: "The value of education lies not merely in imparting knowledge but in cultivating the capacity for independent thought, which students will draw on throughout their lives.",
    note: '提分点：not merely…but；draw on'
  },
  {
    id: 'a38',
    topic: '教育与社会',
    zh: '城乡教育资源差距仍然存在，唯有加强教师流动才能逐步缩小这一差距。',
    en: "The gap in educational resources between urban and rural areas persists, and only by encouraging teacher mobility can it be narrowed step by step rather than through short-lived campaigns.",
    note: '提分点：only by 倒装；step by step'
  },
  {
    id: 'a39',
    topic: '教育与社会',
    zh: '过度应试使学生的创造力受到压抑，这已引起教育界的普遍反思。',
    en: "Excessive exam-oriented instruction tends to stifle students' creativity, a problem that has prompted widespread reflection among educators and parents alike and given rise to a series of reforms.",
    note: '提分点：同位语；stifle；give rise to'
  },
  {
    id: 'a40',
    topic: '教育与社会',
    zh: '职业教育长期被低估，然而制造业的升级恰恰需要大量高技能人才。',
    en: "Vocational education has long been undervalued, whereas the upgrading of manufacturing urgently requires a substantial number of highly skilled workers capable of operating sophisticated equipment on modern production lines.",
    note: '提分点：whereas 对比；capable of'
  },
  {
    id: 'a41',
    topic: '教育与社会',
    zh: '家庭的教育观念直接影响孩子的成长，父母与其施加压力，不如以身作则。',
    en: "Parents' attitudes towards education bear directly on their children's growth, and instead of imposing pressure, they would do better to set an example through their own conduct.",
    note: '提分点：bear on；would do better to'
  },
  {
    id: 'a42',
    topic: '教育与社会',
    zh: '高等教育的普及提高了国民素质，但也带来了就业市场的结构性矛盾。',
    en: "The expansion of higher education has raised the quality of the workforce, yet it has also given rise to structural mismatches in the job market, which graduates feel acutely.",
    note: '提分点：名词化 expansion；yet 对比'
  },
  {
    id: 'a43',
    topic: '国际交流',
    zh: '共建“一带一路”倡议促进了沿线国家的互联互通，也为世界经济注入了动力。',
    en: "The Belt and Road Initiative has bolstered connectivity among the countries along the routes and injected fresh momentum into the global economy at a time when protectionism is on the rise.",
    note: '提分点：bolster；inject momentum'
  },
  {
    id: 'a44',
    topic: '国际交流',
    zh: '文化交流有助于消除偏见，让不同国家的人民在相互理解的基础上建立信任。',
    en: "Cultural exchanges help dispel prejudice and enable people of different countries to build trust on the basis of mutual understanding, which no amount of official rhetoric can substitute for.",
    note: '提分点：dispel；on the basis of'
  },
  {
    id: 'a45',
    topic: '国际交流',
    zh: '只有在平等互利的基础上开展合作，国际合作才能持久，并惠及各方而非少数人。',
    en: "Only when cooperation is conducted on the basis of equality and mutual benefit can it endure and deliver benefits to all parties concerned rather than serving the interests of a few.",
    note: '提分点：Only when 倒装；be conducted'
  },
  {
    id: 'a46',
    topic: '国际交流',
    zh: '越来越多的中国青年赴海外求学，他们既是学习者，也是文化的传播者。',
    en: "A growing number of Chinese young people pursue their studies overseas, serving both as learners and as messengers of their own culture, a role that is often underestimated.",
    note: '提分点：serving as 分词；both…and'
  },
  {
    id: 'a47',
    topic: '国际交流',
    zh: '中国积极参与全球治理，在气候变化等议题上承担了与发展阶段相称的责任。',
    en: "China takes an active part in global governance and has shouldered responsibilities commensurate with its stage of development on issues such as climate change, rather than evading them.",
    note: '提分点：commensurate with；shoulder'
  },
  {
    id: 'a48',
    topic: '国际交流',
    zh: '面对分歧，对话远比对抗有效，这一点已被历史反复证明，也值得各方决策者牢记。',
    en: "Where differences arise, dialogue proves far more effective than confrontation, a lesson that history has repeatedly confirmed and that policy-makers on both sides would do well to remember.",
    note: '提分点：Where 条件；would do well to'
  },
  {
    id: 'a49',
    topic: '民生与城市',
    zh: '老旧小区改造改善了居民的居住条件，也让城市面貌焕然一新。',
    en: "The renovation of dilapidated residential compounds has improved living conditions and lent a new look to the urban landscape, while preserving the social ties that long-time residents value.",
    note: '提分点：dilapidated；while 分词'
  },
  {
    id: 'a50',
    topic: '民生与城市',
    zh: '养老服务供给不足，如何让独居老人得到妥善照料已成为迫切的社会课题。',
    en: "Care services for the elderly remain inadequate, and how to provide proper support for those living alone has become a pressing social issue that calls for both public investment and community involvement.",
    note: '提分点：how to 主语从句；call for'
  },
  {
    id: 'a51',
    topic: '民生与城市',
    zh: '城市交通拥堵不仅浪费时间，也加剧了空气污染，发展公共交通势在必行。',
    en: "Urban traffic congestion not only wastes time but also aggravates air pollution, which makes the expansion of public transport an imperative rather than a matter of choice.",
    note: '提分点：not only…but；aggravate'
  },
  {
    id: 'a52',
    topic: '民生与城市',
    zh: '移动支付与网上办事极大地方便了居民，让公共服务更加可及。',
    en: "Mobile payment and online administrative services have markedly facilitated daily life, rendering public services far more accessible to ordinary residents, including older people in remote areas.",
    note: '提分点：markedly；render；accessible'
  },
  {
    id: 'a53',
    topic: '民生与城市',
    zh: '保障性住房的建设缓解了部分家庭的住房压力，但供需矛盾依然存在。',
    en: "The construction of subsidized housing has eased the pressure on some families, yet the mismatch between supply and demand persists, particularly in large cities where prices remain prohibitive.",
    note: '提分点：yet 对比；mismatch'
  },
  {
    id: 'a54',
    topic: '民生与城市',
    zh: '随着人口老龄化加快，社区服务体系的完善显得尤为紧迫，对子女不在身边的老人更是如此。',
    en: "With the ageing population accelerating, improving the community service system has become all the more urgent, especially for those who live far from their children.",
    note: '提分点：With 复合结构；all the more'
  },
  {
    id: 'a55',
    topic: '政策与成就',
    zh: '精准扶贫政策使近亿农村人口摆脱贫困，这一成就得到国际社会广泛认可。',
    en: "Targeted poverty alleviation has lifted nearly one hundred million rural residents out of poverty, an achievement widely recognized by the international community and cited as a model for other developing countries.",
    note: '提分点：lift out of；同位语'
  },
  {
    id: 'a56',
    topic: '政策与成就',
    zh: '绿水青山就是金山银山，这一理念已成为生态环境保护的基本遵循。',
    en: "The notion that lucid waters and lush mountains are invaluable assets has become a guiding principle for ecological conservation across the country, shaping decisions at all levels of government.",
    note: '提分点：同位语从句；invaluable'
  },
  {
    id: 'a57',
    topic: '政策与成就',
    zh: '供给侧结构性改革旨在提高供给质量，使经济结构更好地适应需求变化。',
    en: "Supply-side structural reform is designed to improve the quality of supply so that the economic structure may better adapt to shifting demand, thereby sustaining long-term growth.",
    note: '提分点：be designed to；so that'
  },
  {
    id: 'a58',
    topic: '政策与成就',
    zh: '共同富裕不是整齐划一的平均，而是让全体人民共享发展成果。',
    en: "Common prosperity does not mean uniform equality but rather an arrangement in which all citizens share the fruits of development, with nobody left behind in the course of modernization.",
    note: '提分点：not…but rather；with 独立结构'
  },
  {
    id: 'a59',
    topic: '政策与成就',
    zh: '乡村振兴战略既要发展产业，也要留住人才，二者缺一不可，资金再充足也无法替代。',
    en: "The rural revitalization strategy must both develop local industries and retain talented people, for neither can succeed without the other, however generous the funding may be.",
    note: '提分点：both…and；for 因果；however 倒装'
  },
  {
    id: 'a60',
    topic: '政策与成就',
    zh: '中国坚持对外开放的基本国策，以更短的负面清单吸引外资，跨国公司信心随之增强。',
    en: "China remains committed to opening-up as a basic national policy and has shortened the negative list to attract foreign investment, a measure that has bolstered the confidence of multinationals.",
    note: '提分点：be committed to；bolstered'
  }
]
module.exports = { advanced }
