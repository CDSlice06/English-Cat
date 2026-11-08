// 词组与固定搭配库：在文章里按变体匹配，命中后生成词组卡
// alts 为原文中可能出现的写法（小写），meaning 必带词性 phr.

const RAW_PHRASES = [
  { alts: ['account for'], meaning: '解释；占（比例）', note: '既能表示“说明原因”，也能表示“占据多少比例”' },
  { alts: ['result in'], meaning: '导致，造成', note: 'result in 后接结果；result from 后接原因' },
  { alts: ['result from'], meaning: '由……造成，起因于', note: '与 result in 方向相反' },
  { alts: ['lead to'], meaning: '导致，通向', note: 'to 是介词，后接名词或动名词' },
  { alts: ['contribute to'], meaning: '促成，有助于；投稿', note: '褒义时译“有助于”，也可表示“是……的原因之一”' },
  { alts: ['engage in', 'engaged in', 'engaging in'], meaning: '参与，从事；忙于', note: 'be engaged in 强调“正投入其中”' },
  { alts: ['focus on', 'focused on', 'focusing on'], meaning: '专注于，聚焦于' },
  { alts: ['depend on', 'depends on', 'depending on', 'depended on'], meaning: '取决于，依赖' },
  { alts: ['rely on', 'relies on', 'relied on', 'relying on'], meaning: '依靠，依赖' },
  { alts: ['refer to', 'refers to', 'referred to', 'referring to'], meaning: '指的是；参考；提到' },
  { alts: ['consist of'], meaning: '由……组成', note: 'consist of 只用主动形式' },
  { alts: ['consist in'], meaning: '在于，存在于' },
  { alts: ['deal with', 'deals with', 'dealt with', 'dealing with'], meaning: '处理，应对；涉及' },
  { alts: ['cope with'], meaning: '应付，处理（困难）' },
  { alts: ['carry out'], meaning: '执行，实施（计划、研究）' },
  { alts: ['bring about'], meaning: '带来，引起（变化）' },
  { alts: ['take on'], meaning: '承担；呈现（面貌）' },
  { alts: ['take up'], meaning: '开始从事；占用（时间/空间）' },
  { alts: ['take over'], meaning: '接管，接手' },
  { alts: ['take place'], meaning: '发生，举行', note: '不及物，不能用于被动' },
  { alts: ['put up with'], meaning: '忍受，容忍' },
  { alts: ['come up with'], meaning: '想出，提出（办法、主意）' },
  { alts: ['make up for'], meaning: '弥补，补偿' },
  { alts: ['make up'], meaning: '组成；编造；化妆' },
  { alts: ['bring up'], meaning: '抚养；提出（话题）' },
  { alts: ['break down'], meaning: '出故障；分解；崩溃' },
  { alts: ['turn out'], meaning: '结果是，证明是' },
  { alts: ['turn to'], meaning: '求助于；转向' },
  { alts: ['point out'], meaning: '指出' },
  { alts: ['figure out'], meaning: '弄清楚，算出' },
  { alts: ['find out'], meaning: '查明，发现' },
  { alts: ['give up'], meaning: '放弃' },
  { alts: ['give in'], meaning: '屈服，让步' },
  { alts: ['set up'], meaning: '建立，设立' },
  { alts: ['set out'], meaning: '出发；着手做' },
  { alts: ['stick to'], meaning: '坚持，遵守' },
  { alts: ['adapt to'], meaning: '适应', note: 'adapt to 适应；adapt … for 改编为' },
  { alts: ['adjust to'], meaning: '适应，调整以适应' },
  { alts: ['apply for'], meaning: '申请' },
  { alts: ['apply to'], meaning: '适用于；向……申请' },
  { alts: ['approve of'], meaning: '赞成，同意' },
  { alts: ['argue for'], meaning: '主张，支持' },
  { alts: ['argue against'], meaning: '反对，据理力争反对' },
  { alts: ['call for'], meaning: '需要；呼吁' },
  { alts: ['care about'], meaning: '关心，在乎' },
  { alts: ['come across'], meaning: '偶然遇到，碰见' },
  { alts: ['compete with'], meaning: '与……竞争' },
  { alts: ['concentrate on'], meaning: '集中于，专心于' },
  { alts: ['connect with'], meaning: '与……联系，产生共鸣' },
  { alts: ['date back to'], meaning: '追溯到' },
  { alts: ['differ from'], meaning: '与……不同' },
  { alts: ['draw on'], meaning: '利用，借鉴（经验、资源）' },
  { alts: ['end up'], meaning: '最终成为，最终处于' },
  { alts: ['get rid of'], meaning: '摆脱，去除' },
  { alts: ['go through'], meaning: '经历；仔细检查' },
  { alts: ['hold back'], meaning: '阻碍；抑制（情感）' },
  { alts: ['keep up with'], meaning: '跟上，保持同步' },
  { alts: ['look into'], meaning: '调查，研究' },
  { alts: ['look forward to'], meaning: '期待', note: 'to 是介词，后接名词或动名词' },
  { alts: ['pay attention to'], meaning: '注意，关注' },
  { alts: ['pick up'], meaning: '学会；捡起；接人' },
  { alts: ['put off'], meaning: '推迟' },
  { alts: ['put forward'], meaning: '提出（观点、建议）' },
  { alts: ['rely upon'], meaning: '依靠' },
  { alts: ['run into'], meaning: '遇到（困难）；偶然碰到' },
  { alts: ['stand for'], meaning: '代表，象征' },
  { alts: ['stand out'], meaning: '突出，显眼' },
  { alts: ['take advantage of'], meaning: '利用（机会、优势）' },
  { alts: ['take into account'], meaning: '考虑到' },
  { alts: ['take part in'], meaning: '参加' },
  { alts: ['work out'], meaning: '解决；锻炼；结果良好' },
  { alts: ['in terms of'], meaning: '就……而言，在……方面' },
  { alts: ['in contrast'], meaning: '相比之下', note: '常与 to/with 连用' },
  { alts: ['in addition'], meaning: '此外，另外' },
  { alts: ['in particular'], meaning: '尤其，特别是' },
  { alts: ['in general'], meaning: '总的来说，通常' },
  { alts: ['in fact'], meaning: '事实上' },
  { alts: ['in reality'], meaning: '实际上' },
  { alts: ['in practice'], meaning: '在实践中，实际上' },
  { alts: ['in theory'], meaning: '理论上' },
  { alts: ['in short'], meaning: '简而言之' },
  { alts: ['in other words'], meaning: '换句话说' },
  { alts: ['in response to'], meaning: '作为对……的回应' },
  { alts: ['in relation to'], meaning: '关于，与……有关' },
  { alts: ['in line with'], meaning: '与……一致，符合' },
  { alts: ['in favor of'], meaning: '支持，赞成' },
  { alts: ['in charge of'], meaning: '负责，掌管' },
  { alts: ['in need of'], meaning: '需要' },
  { alts: ['in spite of'], meaning: '尽管', note: '后接名词，不能接句子' },
  { alts: ['as a result'], meaning: '因此，结果' },
  { alts: ['as a whole'], meaning: '作为一个整体' },
  { alts: ['as well as'], meaning: '以及；除……之外还' },
  { alts: ['at the expense of'], meaning: '以……为代价' },
  { alts: ['at the cost of'], meaning: '以……为代价' },
  { alts: ['at the same time'], meaning: '同时；然而' },
  { alts: ['at present'], meaning: '目前' },
  { alts: ['at least'], meaning: '至少' },
  { alts: ['at first glance'], meaning: '乍一看' },
  { alts: ['by contrast'], meaning: '相比之下' },
  { alts: ['by means of'], meaning: '通过，借助' },
  { alts: ['by no means'], meaning: '绝不', note: '置于句首时句子要倒装' },
  { alts: ['for instance'], meaning: '例如' },
  { alts: ['for the sake of'], meaning: '为了……的缘故' },
  { alts: ['on average'], meaning: '平均而言' },
  { alts: ['on behalf of'], meaning: '代表' },
  { alts: ['on the contrary'], meaning: '相反' },
  { alts: ['on the whole'], meaning: '总体上' },
  { alts: ['regardless of'], meaning: '不管，不顾' },
  { alts: ['apart from'], meaning: '除……之外（还）；除了' },
  { alts: ['due to'], meaning: '由于，因为' },
  { alts: ['thanks to'], meaning: '多亏，由于' },
  { alts: ['prior to'], meaning: '在……之前' },
  { alts: ['according to'], meaning: '根据' },
  { alts: ['compared with', 'compared to'], meaning: '与……相比' },
  { alts: ['along with'], meaning: '连同，与……一起' },
  { alts: ['rather than'], meaning: '而不是' },
  { alts: ['other than'], meaning: '除了；不同于' },
  { alts: ['more than'], meaning: '超过；不仅仅是' },
  { alts: ['no longer'], meaning: '不再' },
  { alts: ['not necessarily'], meaning: '不一定' },
  { alts: ['play a role in', 'plays a role in', 'played a role in', 'playing a role in'], meaning: '在……中起作用' },
  { alts: ['make a difference'], meaning: '产生影响，起作用' },
  { alts: ['make sense'], meaning: '有道理，讲得通' },
  { alts: ['take steps'], meaning: '采取措施' },
  { alts: ['draw a conclusion'], meaning: '得出结论' },
  { alts: ['raise awareness'], meaning: '提高意识' },
  { alts: ['shed light on'], meaning: '阐明，使……清楚' },
  { alts: ['give rise to'], meaning: '引起，导致' },
  { alts: ['have access to'], meaning: '有机会接触，能够使用' },
  { alts: ['be aware of', 'is aware of', 'are aware of', 'was aware of', 'were aware of'], meaning: '意识到' },
  { alts: ['be capable of', 'is capable of', 'are capable of'], meaning: '有能力做' },
  { alts: ['be responsible for', 'is responsible for', 'are responsible for'], meaning: '对……负责' },
  { alts: ['be subject to', 'is subject to', 'are subject to'], meaning: '受制于，易受……影响' },
  { alts: ['be exposed to', 'is exposed to', 'are exposed to', 'exposed to'], meaning: '接触到，暴露于' },
  { alts: ['be committed to', 'is committed to', 'are committed to', 'committed to'], meaning: '致力于' },
  { alts: ['be likely to', 'is likely to', 'are likely to'], meaning: '很可能' },
  { alts: ['be bound to', 'is bound to', 'are bound to'], meaning: '必定，一定会' },
  { alts: ['be worth'], meaning: '值得', note: 'be worth doing 用主动表被动' },
  { alts: ['tend to'], meaning: '倾向于，往往会' },
  { alts: ['be used to', 'is used to', 'are used to', 'was used to', 'were used to'], meaning: '习惯于', note: '后接名词或动名词；不要和 used to（过去常常）混淆' },
  { alts: ['used to'], meaning: '过去常常', note: '后接动词原形' },
  { alts: ['would rather'], meaning: '宁愿' },
  { alts: ['as long as'], meaning: '只要' },
  { alts: ['as soon as'], meaning: '一……就……' },
  { alts: ['even if', 'even though'], meaning: '即使，尽管' },
  { alts: ['so far'], meaning: '到目前为止' },
  { alts: ['so that'], meaning: '以便；结果' },
  { alts: ['such as'], meaning: '例如，诸如' },
  { alts: ['whether or not'], meaning: '是否' },

  // ── 关联连词必须成对收录 ──
  // not only 几乎不会单独出现，只收前半截等于把结构讲残；
  // 统一按「前半 + {gap} + 后半」收录，{gap} 至少要有一个单词，避免命中 so that 这类固定短语
  {
    alts: ['not only {gap} but also', 'not only {gap} but'],
    canonical: 'not only … but also',
    meaning: '不仅……而且……',
    note: '前后连接的成分要对称；口语里 but also 的 also 常省略，只留 but'
  },
  {
    alts: ['not just {gap} but also'],
    canonical: 'not just … but also',
    meaning: '不仅……而且……',
    note: '和 not only … but also 同义，语气更口语'
  },
  { alts: ['either {gaps} or'], canonical: 'either … or', meaning: '要么……要么……' },
  { alts: ['neither {gaps} nor'], canonical: 'neither … nor', meaning: '既不……也不……' },
  { alts: ['both {gaps} and'], canonical: 'both … and', meaning: '既……又……，两者都' },
  { alts: ['so {gap} that'], canonical: 'so … that', meaning: '如此……以至于……' },
  { alts: ['hardly {gap} when'], canonical: 'hardly … when', meaning: '刚一……就……' },
  { alts: ['no sooner {gap} than'], canonical: 'no sooner … than', meaning: '刚……就……' },
  { alts: ['the more {gap} the more'], canonical: 'the more … the more', meaning: '越……越……' },

  // ── 学术议论类文章的高频搭配（四六级阅读、外刊评论里反复出现）──
  { alts: ['a range of'], meaning: '一系列，各种' },
  { alts: ['a variety of'], meaning: '各种各样的' },
  { alts: ['a series of'], meaning: '一连串，一系列' },
  { alts: ['a number of'], meaning: '许多，若干', note: '接可数名词复数，谓语用复数' },
  { alts: ['a handful of'], meaning: '少量的，一把' },
  { alts: ['a matter of'], meaning: '……的问题；关乎' },
  { alts: ['the majority of'], meaning: '大多数' },
  { alts: ['the vast majority of'], meaning: '绝大多数' },
  { alts: ['the absence of'], meaning: '缺乏，没有' },
  { alts: ['the rise of'], meaning: '……的兴起' },
  { alts: ['the impact of'], meaning: '……的影响' },
  { alts: ['in the long run'], meaning: '从长远看' },
  { alts: ['in the short term', 'in the short run'], meaning: '短期内' },
  { alts: ['in the long term'], meaning: '长期来看' },
  { alts: ['in the face of'], meaning: '面对，在……面前' },
  { alts: ['in the wake of'], meaning: '在……之后，随……而来', note: '多指某事发生后的直接影响' },
  { alts: ['in light of'], meaning: '鉴于，根据' },
  { alts: ['in the absence of'], meaning: '在没有……的情况下' },
  { alts: ['in the name of'], meaning: '以……的名义' },
  { alts: ['in the meantime'], meaning: '在此期间，同时' },
  { alts: ['in turn'], meaning: '反过来；依次' },
  { alts: ['in return'], meaning: '作为回报' },
  { alts: ['in vain'], meaning: '徒劳，白费' },
  { alts: ['in essence'], meaning: '本质上' },
  { alts: ['in effect'], meaning: '实际上；生效' },
  { alts: ['in decline'], meaning: '在衰退中' },
  { alts: ['in demand'], meaning: '有需求的，抢手的' },
  { alts: ['on the rise'], meaning: '在上升，在增加' },
  { alts: ['on the decline'], meaning: '在下降' },
  { alts: ['on the edge of'], meaning: '在……边缘' },
  { alts: ['at odds with'], meaning: '与……不一致，与……相矛盾' },
  { alts: ['at stake'], meaning: '处于危险中，事关重大' },
  { alts: ['at random'], meaning: '随机地' },
  { alts: ['at all costs'], meaning: '不惜一切代价' },
  { alts: ['by and large'], meaning: '总的来说' },
  { alts: ['to some extent', 'to a certain extent'], meaning: '在某种程度上' },
  { alts: ['to a great extent'], meaning: '在很大程度上' },
  { alts: ['as opposed to'], meaning: '而不是，与……相对' },
  { alts: ['as a matter of fact'], meaning: '事实上' },
  { alts: ['with respect to', 'with regard to'], meaning: '关于，就……而言' },
  { alts: ['with the exception of'], meaning: '除……之外' },
  { alts: ['without exception'], meaning: '无一例外' },
  { alts: ['not to mention'], meaning: '更不用说' },
  { alts: ['no wonder'], meaning: '难怪' },
  { alts: ['no doubt'], meaning: '毫无疑问' },
  { alts: ['once and for all'], meaning: '一劳永逸地，最终' },
  { alts: ['make use of'], meaning: '利用' },
  { alts: ['make the most of'], meaning: '充分利用' },
  { alts: ['make a living'], meaning: '谋生' },
  { alts: ['make ends meet'], meaning: '勉强维持生计' },
  { alts: ['make way for'], meaning: '给……让路' },
  { alts: ['give way to'], meaning: '让位于，被……取代' },
  { alts: ['take for granted'], meaning: '认为理所当然' },
  { alts: ['take effect'], meaning: '生效，起作用' },
  { alts: ['take root'], meaning: '扎根，确立' },
  { alts: ['take shape'], meaning: '成形，初具规模' },
  { alts: ['take a toll'], meaning: '造成损害' },
  { alts: ['keep track of'], meaning: '记录，掌握……的动态' },
  { alts: ['lose track of'], meaning: '失去……的线索，记不清' },
  { alts: ['keep in mind'], meaning: '记住，考虑到' },
  { alts: ['bear in mind'], meaning: '牢记' },
  { alts: ['draw attention to'], meaning: '引起对……的注意' },
  { alts: ['call into question'], meaning: '对……提出质疑' },
  { alts: ['bridge the gap'], meaning: '缩小差距' },
  { alts: ['set the stage for'], meaning: '为……做好准备，为……铺路' },
  { alts: ['pave the way for'], meaning: '为……铺平道路' },
  { alts: ['play a part in'], meaning: '在……中起作用' },
  { alts: ['come to terms with'], meaning: '逐渐接受，妥协于' },
  { alts: ['come down to'], meaning: '归结为' },
  { alts: ['amount to'], meaning: '总计为；等同于' },
  { alts: ['add up to'], meaning: '合计达；意味着' },
  { alts: ['stem from'], meaning: '源于，由……造成' },
  { alts: ['arise from'], meaning: '由……引起' },
  { alts: ['derive from'], meaning: '源自，从……得到' },
  { alts: ['originate from'], meaning: '起源于' },
  { alts: ['be rooted in'], meaning: '根植于' },
  { alts: ['be associated with'], meaning: '与……有关联' },
  { alts: ['be linked to'], meaning: '与……相关' },
  { alts: ['be prone to'], meaning: '易于，有……倾向' },
  { alts: ['be immune to'], meaning: '对……免疫，不受……影响' },
  { alts: ['be essential to'], meaning: '对……至关重要' },
  { alts: ['be central to'], meaning: '是……的核心' },
  { alts: ['be reluctant to'], meaning: '不愿，勉强' },
  { alts: ['be willing to'], meaning: '愿意' },
  { alts: ['be supposed to'], meaning: '应该，本应' },
  { alts: ['be meant to'], meaning: '旨在，本该' },
  { alts: ['be about to'], meaning: '即将' },
  { alts: ['be worse off'], meaning: '处境更差' },
  { alts: ['be better off'], meaning: '境况更好' },
  { alts: ['allow for'], meaning: '考虑到，为……留出余地' },
  { alts: ['opt for'], meaning: '选择' },
  { alts: ['settle for'], meaning: '勉强接受' },
  { alts: ['resort to'], meaning: '诉诸，求助于' },
  { alts: ['adhere to'], meaning: '坚持，遵守' },
  { alts: ['conform to'], meaning: '符合，遵从' },
  { alts: ['comply with'], meaning: '遵守，服从' },
  { alts: ['interfere with'], meaning: '干扰，妨碍' },
  { alts: ['coincide with'], meaning: '与……同时发生；与……一致' },
  { alts: ['distinguish between'], meaning: '区分' },
  { alts: ['cater to'], meaning: '迎合，满足（需求）' },
  { alts: ['appeal to'], meaning: '吸引；呼吁' },
  { alts: ['rule out'], meaning: '排除' },
  { alts: ['phase out'], meaning: '逐步淘汰' },
  { alts: ['scale up'], meaning: '扩大规模' },
  { alts: ['single out'], meaning: '挑出，单独指出' },
  { alts: ['carry on'], meaning: '继续' },
  { alts: ['bring down'], meaning: '降低；使垮台' },
  { alts: ['wear off'], meaning: '逐渐消失，效力减退' },
  { alts: ['die out'], meaning: '灭绝，逐渐消失' },
  { alts: ['fade away'], meaning: '逐渐消失' },
  { alts: ['pay off'], meaning: '取得成功，得到回报；还清' },
  { alts: ['spring up'], meaning: '涌现，迅速出现' },

  // ── 常考「动词 + 宾语 + 介词」搭配：模型漏收时由规则兜底 ──
  // {sb} 是宾语占位，只匹配人称/人群类名词，避免把 turn a blind eye to 误收成 blind sb to
  { alts: ['tip {sb} into'], canonical: 'tip somebody into', meaning: '使某人陷入……', note: 'tip sb into sth：使某人陷入某种处境，into 后接名词或动名词' },
  { alts: ['tip into'], meaning: '陷入……；把……倒入', note: '无宾语时是「陷入」，带宾语时是「把某物倒入」' },
  {
    alts: ['blind {sb} to'],
    canonical: 'blind somebody to',
    meaning: '使某人看不见……，使某人对……视而不见',
    note: 'blind sb to sth：让人意识不到某事物的存在'
  },

  // ── 动词 + 宾语 + 介词：模型最容易漏收的一类 ──
  { alts: ['prevent {sb} from'], canonical: 'prevent somebody from', meaning: '阻止某人做……' },
  { alts: ['protect {sb} from'], canonical: 'protect somebody from', meaning: '保护某人免受……' },
  { alts: ['discourage {sb} from'], canonical: 'discourage somebody from', meaning: '劝阻某人做……' },
  { alts: ['accuse {sb} of'], canonical: 'accuse somebody of', meaning: '指控某人……' },
  { alts: ['remind {sb} of'], canonical: 'remind somebody of', meaning: '使某人想起……' },
  { alts: ['deprive {sb} of'], canonical: 'deprive somebody of', meaning: '剥夺某人……' },
  { alts: ['convince {sb} of'], canonical: 'convince somebody of', meaning: '使某人确信……' },
  { alts: ['inform {sb} of'], canonical: 'inform somebody of', meaning: '告知某人……' },
  { alts: ['warn {sb} against'], canonical: 'warn somebody against', meaning: '警告某人提防……' },
  { alts: ['expose {sb} to'], canonical: 'expose somebody to', meaning: '使某人接触到……' },

  // ── be + 分词/形容词：四六级阅读里的固定评价结构 ──
  { alts: ['be attributed to'], meaning: '被归因于' },
  { alts: ['be subjected to'], meaning: '遭受，经受' },
  { alts: ['be related to'], meaning: '与……有关' },
  { alts: ['be relevant to'], meaning: '与……相关' },
  { alts: ['be similar to'], meaning: '与……相似' },
  { alts: ['be different from'], meaning: '与……不同' },
  { alts: ['be dependent on'], meaning: '依赖于' },
  { alts: ['be independent of'], meaning: '不受……影响，独立于' },
  { alts: ['be consistent with'], meaning: '与……一致' },
  { alts: ['be compatible with'], meaning: '与……相容，与……相符' },
  { alts: ['be confined to'], meaning: '局限于' },
  { alts: ['be limited to'], meaning: '限于' },
  { alts: ['be characterized by'], meaning: '以……为特征' },
  { alts: ['be defined as'], meaning: '被定义为' },
  { alts: ['be regarded as'], meaning: '被视为' },
  { alts: ['be seen as'], meaning: '被视为' },
  { alts: ['be known as'], meaning: '被称为' },
  { alts: ['be referred to as'], meaning: '被称为' },
  { alts: ['be described as'], meaning: '被描述为' },
  { alts: ['be perceived as'], meaning: '被视为' },
  { alts: ['be accompanied by'], meaning: '伴随着' },
  { alts: ['be confronted with'], meaning: '面临' },
  { alts: ['be faced with'], meaning: '面临' },
  { alts: ['be involved in'], meaning: '参与，涉及' },
  { alts: ['be accused of'], meaning: '被指控' },
  { alts: ['be blamed for'], meaning: '因……受到责备' },
  { alts: ['be credited with'], meaning: '被认为有……的功劳' },
  { alts: ['be accountable for'], meaning: '对……负责' },
  { alts: ['be obliged to'], meaning: '不得不，有义务' },
  { alts: ['be inclined to'], meaning: '倾向于' },
  { alts: ['be tempted to'], meaning: '忍不住想，很想' },
  { alts: ['be entitled to'], meaning: '有权享有' },
  { alts: ['be eligible for'], meaning: '有资格获得' },
  { alts: ['be resistant to'], meaning: '抵制，对……有抵抗力' },
  { alts: ['be sensitive to'], meaning: '对……敏感' },
  { alts: ['be vulnerable to'], meaning: '易受……伤害' },
  { alts: ['be accustomed to'], meaning: '习惯于', note: 'to 是介词，后接名词或动名词' },
  { alts: ['be addicted to'], meaning: '沉迷于' },
  { alts: ['be attached to'], meaning: '依恋；附属于' },
  { alts: ['be devoted to'], meaning: '致力于，专心于' },
  { alts: ['be dedicated to'], meaning: '致力于' },
  { alts: ['be opposed to'], meaning: '反对' },
  { alts: ['be open to'], meaning: '愿意接受，对……开放' },
  { alts: ['be absorbed in'], meaning: '全神贯注于' },

  // ── 动词短语补充：议论与说明里高频 ──
  { alts: ['dedicate to'], meaning: '把……用于，致力于' },
  { alts: ['devote to'], meaning: '致力于，献身于' },
  { alts: ['engage with'], meaning: '与……互动，应对' },
  { alts: ['interact with'], meaning: '与……互动，交流' },
  { alts: ['compete for'], meaning: '争夺' },
  { alts: ['compensate for'], meaning: '弥补，补偿' },
  { alts: ['substitute for'], meaning: '代替' },
  { alts: ['correspond to'], meaning: '与……对应，相当于' },
  { alts: ['correspond with'], meaning: '与……一致；与……通信' },
  { alts: ['relate to'], meaning: '涉及，与……有关' },
  { alts: ['call on'], meaning: '呼吁，号召；拜访' },
  { alts: ['count on'], meaning: '依靠，指望' },
  { alts: ['build on'], meaning: '以……为基础发展' },
  { alts: ['insist on'], meaning: '坚持要求' },
  { alts: ['embark on'], meaning: '着手，开始（事业）' },
  { alts: ['comment on'], meaning: '评论' },
  { alts: ['reflect on'], meaning: '反思，思考' },
  { alts: ['elaborate on'], meaning: '详细说明' },
  { alts: ['impose on'], meaning: '把……强加于' },
  { alts: ['hinge on'], meaning: '取决于' },
  { alts: ['touch on'], meaning: '谈及，涉及' },
  { alts: ['settle on'], meaning: '选定' },
  { alts: ['capitalize on'], meaning: '利用（机会、优势）' },
  { alts: ['act on'], meaning: '按照……行事' },
  { alts: ['agree on'], meaning: '就……达成一致' },
  { alts: ['object to'], meaning: '反对' },
  { alts: ['respond to'], meaning: '回应，应对' },
  { alts: ['add to'], meaning: '增加，加剧' },
  { alts: ['point to'], meaning: '表明，指向' },
  { alts: ['belong to'], meaning: '属于' },
  { alts: ['give away'], meaning: '泄露；赠送' },
  { alts: ['give off'], meaning: '散发出（气味、光）' },
  { alts: ['put up'], meaning: '搭建；张贴；提高' },
  { alts: ['put down'], meaning: '放下；记下；镇压' },
  { alts: ['take off'], meaning: '起飞；迅速增长' },
  { alts: ['take in'], meaning: '理解；吸收；欺瞒' },
  { alts: ['turn down'], meaning: '拒绝；调低' },
  { alts: ['turn up'], meaning: '出现；调高' },
  { alts: ['turn around'], meaning: '扭转，好转' },
  { alts: ['break out'], meaning: '爆发' },
  { alts: ['break through'], meaning: '突破' },
  { alts: ['bring in'], meaning: '引进，带来（收入）' },
  { alts: ['call off'], meaning: '取消' },
  { alts: ['cut down'], meaning: '削减，砍倒' },
  { alts: ['cut off'], meaning: '切断，中断' },
  { alts: ['drop out'], meaning: '退学，退出' },
  { alts: ['fill in'], meaning: '填写' },
  { alts: ['get across'], meaning: '把……讲清楚，使被理解' },
  { alts: ['get over'], meaning: '克服；从……中恢复' },
  { alts: ['go on'], meaning: '继续；发生' },
  { alts: ['grow up'], meaning: '长大，成熟' },
  { alts: ['hold on'], meaning: '坚持；稍等' },
  { alts: ['hold up'], meaning: '支撑；延误；举出' },
  { alts: ['look after'], meaning: '照顾' },
  { alts: ['look up'], meaning: '查阅；好转' },
  { alts: ['make out'], meaning: '辨认出；理解' },
  { alts: ['pass on'], meaning: '传递，转达' },
  { alts: ['run out of'], meaning: '用完，耗尽' },
  { alts: ['set aside'], meaning: '留出；搁置' },
  { alts: ['set off'], meaning: '出发；引发' },
  { alts: ['show up'], meaning: '出现，露面' },
  { alts: ['think over'], meaning: '仔细考虑' },
  { alts: ['work on'], meaning: '从事，致力于' },
  { alts: ['wrap up'], meaning: '结束；包起来' },
  { alts: ['back up'], meaning: '支持；备份' },
  { alts: ['catch up with'], meaning: '赶上' },
  { alts: ['come about'], meaning: '发生，产生' },
  { alts: ['come out'], meaning: '出版；结果是' },
  { alts: ['go along with'], meaning: '赞同，配合' },
  { alts: ['live up to'], meaning: '不辜负，符合（期望）' },
  { alts: ['sort out'], meaning: '解决；整理' },
  { alts: ['step up'], meaning: '加强，加大' },
  { alts: ['tear down'], meaning: '拆除，推翻' },
  { alts: ['fall behind'], meaning: '落后，跟不上' },
  { alts: ['keep pace with'], meaning: '与……保持同步' },

  // ── 动词 + 名词：论述类文章的核心搭配 ──
  { alts: ['strike a balance'], meaning: '取得平衡' },
  { alts: ['set an example'], meaning: '树立榜样' },
  { alts: ['take responsibility'], meaning: '承担责任' },
  { alts: ['take the lead'], meaning: '带头，领先' },
  { alts: ['shift the blame'], meaning: '推卸责任' },
  { alts: ['meet the needs'], meaning: '满足需求' },
  { alts: ['meet the deadline'], meaning: '按期完成' },
  { alts: ['make an effort'], meaning: '努力' },
  { alts: ['make progress'], meaning: '取得进展' },
  { alts: ['make a decision'], meaning: '做决定' },
  { alts: ['reach a conclusion'], meaning: '得出结论' },
  { alts: ['reach an agreement'], meaning: '达成一致' },
  { alts: ['gain insight into'], meaning: '深入了解' },
  { alts: ['have an impact on'], meaning: '对……产生影响' },
  { alts: ['take action'], meaning: '采取行动' },
  { alts: ['raise concerns'], meaning: '引起担忧' },
  { alts: ['pose a threat'], meaning: '构成威胁' },
  { alts: ['pose a challenge'], meaning: '构成挑战' },
  { alts: ['address the issue'], meaning: '应对问题' },
  { alts: ['tackle the problem'], meaning: '解决难题' },

  // ── 社会与科技话题的名词搭配：外刊改写文章绕不开 ──
  { alts: ['climate change'], meaning: '气候变化' },
  { alts: ['global warming'], meaning: '全球变暖' },
  { alts: ['carbon emission', 'carbon emissions'], meaning: '碳排放' },
  { alts: ['fossil fuel', 'fossil fuels'], meaning: '化石燃料' },
  { alts: ['renewable energy'], meaning: '可再生能源' },
  { alts: ['greenhouse gas', 'greenhouse gases'], meaning: '温室气体' },
  { alts: ['natural resources'], meaning: '自然资源' },
  { alts: ['food security'], meaning: '粮食安全' },
  { alts: ['water scarcity'], meaning: '水资源短缺' },
  { alts: ['air pollution'], meaning: '空气污染' },
  { alts: ['public health'], meaning: '公共卫生' },
  { alts: ['mental health'], meaning: '心理健康' },
  { alts: ['health care'], meaning: '医疗保健' },
  { alts: ['life expectancy'], meaning: '预期寿命' },
  { alts: ['living standard', 'living standards'], meaning: '生活水平' },
  { alts: ['standard of living'], meaning: '生活水准' },
  { alts: ['social mobility'], meaning: '社会流动性' },
  { alts: ['income inequality'], meaning: '收入不平等' },
  { alts: ['economic growth'], meaning: '经济增长' },
  { alts: ['labor market'], meaning: '劳动力市场' },
  { alts: ['supply chain'], meaning: '供应链' },
  { alts: ['consumer behavior'], meaning: '消费者行为' },
  { alts: ['public opinion'], meaning: '公众舆论' },
  { alts: ['social media'], meaning: '社交媒体' },
  { alts: ['peer pressure'], meaning: '同辈压力' },
  { alts: ['critical thinking'], meaning: '批判性思维' },
  { alts: ['work-life balance'], meaning: '工作与生活的平衡' },
  { alts: ['digital divide'], meaning: '数字鸿沟' },
  { alts: ['academic performance'], meaning: '学业表现' },
  { alts: ['job satisfaction'], meaning: '工作满意度' },
  { alts: ['cost of living'], meaning: '生活成本' },
  { alts: ['minimum wage'], meaning: '最低工资' },
  { alts: ['urban sprawl'], meaning: '城市无序扩张' },
  { alts: ['public transport'], meaning: '公共交通' },
  { alts: ['energy consumption'], meaning: '能源消耗' },
  { alts: ['side effect', 'side effects'], meaning: '副作用' },
  { alts: ['root cause'], meaning: '根本原因' },
  { alts: ['social norm', 'social norms'], meaning: '社会规范' },
  { alts: ['cultural identity'], meaning: '文化认同' },
  { alts: ['sense of belonging'], meaning: '归属感' },
  { alts: ['quality of life'], meaning: '生活质量' },
  { alts: ['gender gap'], meaning: '性别差距' },
  { alts: ['generation gap'], meaning: '代沟' },
  { alts: ['research findings'], meaning: '研究结果' },
  { alts: ['case study', 'case studies'], meaning: '案例研究' },
  { alts: ['public interest'], meaning: '公众利益' },
  { alts: ['policy maker', 'policy makers', 'policymaker', 'policymakers'], meaning: '政策制定者' },

  // ── 论述与衔接：段落之间的路标词 ──
  { alts: ['above all'], meaning: '首先，最重要的是' },
  { alts: ['after all'], meaning: '毕竟，终究' },
  { alts: ['in any case'], meaning: '无论如何' },
  { alts: ['at any rate'], meaning: '无论如何，至少' },
  { alts: ['for the most part'], meaning: '大部分情况下' },
  { alts: ['in large part'], meaning: '在很大程度上' },
  { alts: ['more often than not'], meaning: '往往，多半' },
  { alts: ['if anything'], meaning: '说起来反倒，甚至可以说' },
  { alts: ['let alone'], meaning: '更不用说' },
  { alts: ['not least'], meaning: '尤其是' },
  { alts: ['on balance'], meaning: '权衡之后，总的来说' },
  { alts: ['by the same token'], meaning: '同理，出于同样的原因' },
  { alts: ['in hindsight'], meaning: '事后看来' },
  { alts: ['in the first place'], meaning: '首先；起初' },
  { alts: ['that is to say'], meaning: '也就是说' },
  { alts: ['in this regard'], meaning: '在这方面' },
  { alts: ['all in all'], meaning: '总的来说' },
  { alts: ['first and foremost'], meaning: '首要的是' },
  { alts: ['last but not least'], meaning: '最后但同样重要的是' },
  { alts: ['on the other hand'], meaning: '另一方面' },
  { alts: ['in comparison'], meaning: '相比之下' },
  { alts: ['in contrast to'], meaning: '与……形成对比' },
  { alts: ['contrary to'], meaning: '与……相反' },
  { alts: ['in accordance with'], meaning: '依照，按照' },
  { alts: ['in compliance with'], meaning: '遵照，符合' },
  { alts: ['with the aim of'], meaning: '目的是' },
  { alts: ['for the purpose of'], meaning: '为了……的目的' },
  { alts: ['in an attempt to'], meaning: '试图' },
  { alts: ['in a bid to'], meaning: '力图，为了' },
  { alts: ['with a view to'], meaning: '为了，着眼于' },
  { alts: ['so as to'], meaning: '以便，为了' },
  { alts: ['in order to'], meaning: '为了' },
  { alts: ['as a consequence'], meaning: '因此，结果' },
  { alts: ['as a result of'], meaning: '由于，作为……的结果' },
  { alts: ['on the grounds of'], meaning: '以……为理由' },
  { alts: ['in the event of'], meaning: '如果发生' },
  { alts: ['given that'], meaning: '鉴于，考虑到' },
  { alts: ['provided that'], meaning: '假如，只要' },
  { alts: ['even so'], meaning: '即便如此' },
  { alts: ['to name a few'], meaning: '仅举几例' },
  { alts: ['as such'], meaning: '因此；作为这样的' },
  { alts: ['in part'], meaning: '部分地' },

  // ── 第三批：考研与六级阅读高频（补漏 + 常用搭配）──
  { alts: ['cut down on'], meaning: '削减，减少', note: '比 cut down 更常接被削减的对象：cut down on sugar' },
  { alts: ['take care of'], meaning: '照顾；处理，负责' },
  { alts: ['in addition to'], meaning: '除……之外（还）', note: '后接名词或动名词；in addition 单独用时是状语「此外」' },
  { alts: ['make a difference to'], meaning: '对……产生影响' },
  { alts: ['attend to'], meaning: '处理，照料；注意' },
  { alts: ['attribute to'], meaning: '把……归因于', note: 'attribute A to B：把 A 归因于 B' },
  { alts: ['fall short of'], meaning: '未达到（标准、期望）' },
  { alts: ['owing to'], meaning: '由于，因为', note: '后接名词，不接句子' },
  { alts: ['aside from'], meaning: '除……之外；除……以外还', note: '与 apart from 同义' },
  { alts: ['but for'], meaning: '要不是，如果没有', note: '常用于虚拟语气：But for your help, I would have failed.' },
  { alts: ['in case of'], meaning: '万一，如果发生', note: '后接名词；in case 后面则接句子' },
  { alts: ['in case'], meaning: '以防，万一', note: '后面接句子：Take an umbrella in case it rains.' },
  { alts: ['on the verge of'], meaning: '濒临，即将进入' },
  { alts: ['at the mercy of'], meaning: '任由……摆布，完全受……支配' },
  { alts: ['an array of'], meaning: '一系列，大量' },
  { alts: ['the bulk of'], meaning: '大部分' },
  { alts: ['to a large extent'], meaning: '在很大程度上' },
  { alts: ['take measures'], meaning: '采取措施' },
  { alts: ['take the initiative'], meaning: '主动采取行动' },
  { alts: ['arrive at'], meaning: '达成（结论、协议）；到达' },
  { alts: ['reach out to'], meaning: '主动联系，向……伸出援手' },
  { alts: ['look up to'], meaning: '仰慕，尊敬' },
  { alts: ['look down on', 'look down upon'], meaning: '轻视，看不起' },
  { alts: ['get through'], meaning: '通过；度过（难关）' },
  { alts: ['get by'], meaning: '勉强维持，凑合过' },
  { alts: ['take to'], meaning: '开始喜欢；养成……的习惯' },
  { alts: ['bring out'], meaning: '使显现；出版，推出' },
  { alts: ['give priority to'], meaning: '优先考虑' },
  { alts: ['attach importance to'], meaning: '重视' },
  { alts: ['put emphasis on', 'place emphasis on'], meaning: '强调，注重' },
  { alts: ['take note of'], meaning: '注意到，留心' },
  { alts: ['make sense of'], meaning: '理解，弄懂' },
  { alts: ['lose sight of'], meaning: '忽略，忘记（初衷、目标）' },
  { alts: ['come to mind'], meaning: '浮现在脑海中' },
  { alts: ['come into being'], meaning: '形成，产生' },
  { alts: ['come into effect'], meaning: '生效，开始实施' },
  { alts: ['come into play'], meaning: '开始起作用' },
  { alts: ['come to light'], meaning: '被发现，被揭露' },
  { alts: ['put into practice'], meaning: '把……付诸实践' },
  { alts: ['a wealth of'], meaning: '大量的，丰富的' },
  { alts: ['a growing number of'], meaning: '越来越多的' },
  { alts: ['the advent of'], meaning: '……的到来，……的出现' },
  { alts: ['the pursuit of'], meaning: '对……的追求' },
  { alts: ['the notion of'], meaning: '……的观念，……的概念' },
  { alts: ['the prospect of'], meaning: '……的前景，……的可能性' },
  { alts: ['the essence of'], meaning: '……的本质，……的精髓' },
  { alts: ['the scale of'], meaning: '……的规模，……的程度' },
  { alts: ['be short of'], meaning: '缺少，不足' },
  { alts: ['be wary of'], meaning: '对……警惕' },
  { alts: ['be mindful of'], meaning: '留意，注意' },
  { alts: ['be typical of'], meaning: '是……的典型，具有……的典型特征' },
  { alts: ['be indicative of'], meaning: '表明，显示出' },
  { alts: ['be renowned for'], meaning: '以……闻名' },
  { alts: ['be notorious for'], meaning: '因……而臭名昭著' },
  { alts: ['be noted for'], meaning: '以……著称' },
  { alts: ['be liable to'], meaning: '易于，可能' },
  { alts: ['to date'], meaning: '迄今为止' },
  { alts: ['for the time being'], meaning: '暂时，眼下' },
  { alts: ['in due course'], meaning: '在适当的时候，到时候' },
  { alts: ['at hand'], meaning: '在手边；即将到来' },
  { alts: ['at length'], meaning: '最终；详细地' },
  { alts: ['on occasion'], meaning: '有时，偶尔' },
  { alts: ['at the outset'], meaning: '在一开始' },
  { alts: ['in the midst of'], meaning: '在……之中，在……过程中' },
  { alts: ['by virtue of'], meaning: '凭借，由于' },
  { alts: ['in proportion to'], meaning: '与……成比例，与……相称' },
  { alts: ['up to date'], meaning: '最新的，跟上时代的' },
  { alts: ['at intervals'], meaning: '间隔地，不时' },
  { alts: ['irrespective of'], meaning: '不论，不管' },
  { alts: ['what is more', "what's more"], meaning: '而且，更重要的是' },
  { alts: ['in itself'], meaning: '本身，本质上' },
  { alts: ['needless to say'], meaning: '不用说，显然' },
  { alts: ['that being said'], meaning: '话虽如此' },
  { alts: ['all things considered'], meaning: '综合考虑，总的来说' },
  { alts: ['when it comes to'], meaning: '谈到，涉及' },
  { alts: ['as far as {gap} concerned'], canonical: 'as far as … be concerned', meaning: '就……而言', note: '中间接人：as far as I am concerned 就我而言' },

  // ── 第四批：动词短语补漏（真题与外刊改写高频）──
  { alts: ['care for'], meaning: '照顾；喜欢' },
  { alts: ['come up'], meaning: '出现；被提出', note: '问题 come up 是「被提出」；come up with 才是「想出」' },
  { alts: ['turn into'], meaning: '变成，转变为' },
  { alts: ['go over'], meaning: '复习；检查' },
  { alts: ['see through', 'saw through'], meaning: '看穿，识破' },
  { alts: ['draw up'], meaning: '起草，拟定（文件、计划）' },
  { alts: ['put out'], meaning: '扑灭；熄灭' },
  { alts: ['break up'], meaning: '分手；解散，散会' },
  { alts: ['build up'], meaning: '积累，逐步增强' },
  { alts: ['die down'], meaning: '逐渐平息，减弱' },
  { alts: ['play down'], meaning: '淡化，轻描淡写' },
  { alts: ['stand by'], meaning: '支持，站在……一边；袖手旁观' },
  { alts: ['stand up for'], meaning: '维护，为……辩护' },
  { alts: ['hold onto'], meaning: '抓住不放；保住' },
  { alts: ['make room for'], meaning: '为……腾出空间' },
  { alts: ['take pride in'], meaning: '以……为自豪', note: 'pride 前可加 great 等修饰：take great pride in' },
  { alts: ['take delight in'], meaning: '以……为乐' },
  { alts: ['take account of'], meaning: '考虑到，顾及', note: '与 take into account 同义' },
  { alts: ['keep an eye on'], meaning: '留意，照看' },
  { alts: ['pay tribute to'], meaning: '赞扬，致敬' },
  { alts: ['give thought to'], meaning: '认真考虑' },
  { alts: ['have a say', 'has a say'], meaning: '有发言权，有决定权', note: '常与 in / on 连用：have a say in the matter' },
  { alts: ['spark debate'], meaning: '引发争论' },
  { alts: ['gain ground'], meaning: '取得进展，占上风' },
  { alts: ['gain momentum'], meaning: '势头增强，加速发展' },

  // ── 第四批：be + 分词/形容词 补漏 ──
  { alts: ['be to blame'], meaning: '该受责备，责任在……' },
  { alts: ['be under way'], meaning: '在进行中', note: '也写作 underway' },

  // ── 第四批：介词与衔接固定表达补漏 ──
  { alts: ['in advance'], meaning: '提前，预先' },
  { alts: ['ahead of time', 'ahead of schedule'], meaning: '提前，早于预定时间' },
  { alts: ['in a sense'], meaning: '在某种意义上' },
  { alts: ['in a row'], meaning: '连续地，接连' },
  { alts: ['in the process of'], meaning: '在……的过程中' },
  { alts: ['in the course of'], meaning: '在……期间，在……过程中' },
  { alts: ['in search of'], meaning: '寻找，寻求' },
  { alts: ['in honor of'], meaning: '为纪念；向……致敬' },
  { alts: ['in memory of'], meaning: '为纪念' },
  { alts: ['in place of'], meaning: '代替' },
  { alts: ['instead of'], meaning: '代替；而不是', note: '后接名词或动名词，不接句子' },
  { alts: ['in exchange for'], meaning: '作为……的交换' },
  { alts: ['in view of'], meaning: '鉴于，考虑到' },
  { alts: ['in excess of'], meaning: '超过，多于' },
  { alts: ['in control of'], meaning: '控制着，掌管' },
  { alts: ['under control'], meaning: '处于控制之中' },
  { alts: ['under no circumstances'], meaning: '在任何情况下都不', note: '置于句首时句子要倒装' },
  { alts: ['on no account'], meaning: '决不', note: '置于句首时句子要倒装' },
  { alts: ['in no way'], meaning: '决不，一点也不', note: '置于句首时句子要倒装' },
  { alts: ['at the risk of'], meaning: '冒着……的风险' },
  { alts: ['for fear of'], meaning: '以免，唯恐', note: '后接名词或动名词；for fear that 后面才接句子' },
  { alts: ['more or less'], meaning: '或多或少，大约' },
  { alts: ['sooner or later'], meaning: '迟早，早晚' },
  { alts: ['from time to time'], meaning: '不时，偶尔' },
  { alts: ['once in a while'], meaning: '偶尔，有时' },
  { alts: ['by chance'], meaning: '偶然地，碰巧' },
  { alts: ['by accident'], meaning: '偶然地，意外地' },
  { alts: ['far from'], meaning: '远非，一点也不', note: 'far from enough 远不够；字面义是「离……远」' },
  { alts: ['anything but'], meaning: '绝不是，一点也不', note: 'anything but easy 一点也不容易；对比 nothing but 只是' },
  { alts: ['all but'], meaning: '几乎，差不多', note: 'all but disappeared 几乎消失；后接名词时意为「除……外全部」' },
  { alts: ['out of date'], meaning: '过时的' },
  { alts: ['on purpose'], meaning: '故意地' },

  // ── 第四批：话题名词搭配补漏 ──
  { alts: ['aging population', 'ageing population'], meaning: '人口老龄化' },
  { alts: ['birth rate'], meaning: '出生率' },
  { alts: ['death rate'], meaning: '死亡率' },
  { alts: ['greenhouse effect'], meaning: '温室效应' },
  { alts: ['interest rate'], meaning: '利率' },
  { alts: ['labor force', 'labour force'], meaning: '劳动力' },
  { alts: ['carbon footprint'], meaning: '碳足迹' },
  { alts: ['life span', 'lifespan'], meaning: '寿命' },
  { alts: ['mass media'], meaning: '大众传媒' },
  { alts: ['social welfare'], meaning: '社会福利' },
  { alts: ['public awareness'], meaning: '公众意识' },
  { alts: ['physical activity'], meaning: '体育活动，身体活动' },
  { alts: ['mental illness'], meaning: '精神疾病' },
  { alts: ['natural disaster', 'natural disasters'], meaning: '自然灾害' },
  { alts: ['extreme weather'], meaning: '极端天气' }
]

// ── 词组分类：按词条开头的词判类型，卡片上显示成小标签 ──
// 加载时派生而不是逐条手写：以后往表里补词条会自动归类，不会漏标
const TYPE_GAP_RE = /\{gap\}|\{gaps\}|…/
const TYPE_PREP_HEADS = new Set([
  'in', 'on', 'at', 'by', 'for', 'with', 'of', 'to', 'as', 'from', 'without', 'despite',
  'during', 'through', 'over', 'under', 'after', 'before', 'beyond', 'apart', 'due',
  'thanks', 'prior', 'regardless', 'according', 'compared', 'along', 'between', 'among',
  'against', 'about', 'into', 'since', 'until', 'unless', 'per', 'instead'
])
const TYPE_NOUN_HEADS = new Set([
  'a', 'an', 'the', 'climate', 'global', 'carbon', 'fossil', 'renewable', 'greenhouse',
  'natural', 'food', 'water', 'air', 'public', 'mental', 'health', 'life', 'living',
  'standard', 'social', 'income', 'economic', 'labor', 'labour', 'supply', 'consumer',
  'peer', 'critical', 'work-life', 'digital', 'academic', 'job', 'cost', 'minimum',
  'urban', 'energy', 'side', 'root', 'gender', 'generation', 'research', 'case', 'policy',
  'sense', 'quality', 'cultural', 'mass', 'birth', 'death', 'interest', 'aging', 'ageing', 'extreme'
])
const TYPE_EXPR_HEADS = new Set([
  'above', 'all', 'but', 'even', 'first', 'last', 'not', 'no', 'more', 'most', 'much',
  'other', 'rather', 'such', 'so', 'than', 'that', 'whether', 'while', 'if', 'let',
  'once', 'twice', 'half', 'up', 'what', "what's", 'needless', 'irrespective',
  'given', 'provided', 'contrary', 'owing', 'aside'
])

function typeOfPhrase(item) {
  const alts = item && Array.isArray(item.alts) ? item.alts : []
  const flat = [item && item.canonical ? item.canonical : ''].concat(alts).join(' | ')
  if (TYPE_GAP_RE.test(flat)) return '关联连词'
  const first = String((item && (item.canonical || alts[0])) || '').toLowerCase().replace(/[{}…]/g, ' ').trim().split(/\s+/)[0] || ''
  if (first === 'be') return 'be 结构'
  if (TYPE_PREP_HEADS.has(first)) return '介词短语'
  if (TYPE_NOUN_HEADS.has(first)) return '名词搭配'
  if (TYPE_EXPR_HEADS.has(first)) return '固定表达'
  return '动词短语'
}

const PHRASES = RAW_PHRASES.map((item) => Object.assign({ type: typeOfPhrase(item) }, item))

// 常见不规则动词的变形，用于让词组匹配能认出 took / taken / taking 这类写法
const IRREGULAR = {
  take: ['takes', 'took', 'taken', 'taking'],
  make: ['makes', 'made', 'making'],
  come: ['comes', 'came', 'coming'],
  give: ['gives', 'gave', 'given', 'giving'],
  get: ['gets', 'got', 'gotten', 'getting'],
  find: ['finds', 'found', 'finding'],
  keep: ['keeps', 'kept', 'keeping'],
  hold: ['holds', 'held', 'holding'],
  bring: ['brings', 'brought', 'bringing'],
  break: ['breaks', 'broke', 'broken', 'breaking'],
  run: ['runs', 'ran', 'running'],
  go: ['goes', 'went', 'gone', 'going'],
  stand: ['stands', 'stood', 'standing'],
  draw: ['draws', 'drew', 'drawn', 'drawing'],
  lead: ['leads', 'led', 'leading'],
  deal: ['deals', 'dealt', 'dealing'],
  pay: ['pays', 'paid', 'paying'],
  set: ['sets', 'setting'],
  put: ['puts', 'putting'],
  rise: ['rises', 'rose', 'risen', 'rising'],
  arise: ['arises', 'arose', 'arisen', 'arising'],
  lose: ['loses', 'lost', 'losing'],
  mean: ['means', 'meant', 'meaning'],
  bear: ['bears', 'bore', 'borne', 'bearing'],
  stick: ['sticks', 'stuck', 'sticking'],
  wear: ['wears', 'wore', 'worn', 'wearing'],
  lie: ['lies', 'lay', 'lain', 'lying'],
  choose: ['chooses', 'chose', 'chosen', 'choosing'],
  seek: ['seeks', 'sought', 'seeking'],
  fight: ['fights', 'fought', 'fighting'],
  spring: ['springs', 'sprang', 'sprung', 'springing'],
  tip: ['tips', 'tipped', 'tipping'],
  build: ['builds', 'built', 'building'],
  catch: ['catches', 'caught', 'catching'],
  cut: ['cuts', 'cutting'],
  fall: ['falls', 'fell', 'fallen', 'falling'],
  grow: ['grows', 'grew', 'grown', 'growing'],
  let: ['lets', 'letting'],
  strike: ['strikes', 'struck', 'striking'],
  tear: ['tears', 'tore', 'torn', 'tearing']
}

// 这些词开头的词组不做动词变形，否则会把介词短语误伤成动词短语
const NOT_VERB_HEAD = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'by', 'for', 'with', 'of', 'to', 'as', 'from',
  'not', 'no', 'more', 'most', 'other', 'rather', 'such', 'so', 'than', 'that', 'there',
  'whether', 'while', 'without', 'prior', 'due', 'thanks', 'according', 'compared',
  'regardless', 'apart', 'along', 'half', 'twice', 'once', 'be', 'used',
  // 新一批以连接词/副词/代词开头的固定短语：不做动词变形，避免 butted / ups / what'sing 这类误命中
  'but', 'owing', 'aside', 'up', 'much', 'what', "what's", 'irrespective'
])

function escapeRe(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 一个单词的原形 + 常见变形，前三个都限定词边界，避免 parts 命中 partial
function inflections(word) {
  if (IRREGULAR[word]) return [word].concat(IRREGULAR[word])
  const forms = [word]
  if (/[^aeiou]y$/.test(word)) {
    const stem = word.slice(0, -1)
    forms.push(`${stem}ies`, `${stem}ied`, `${word}ing`)
    return forms
  }
  if (/e$/.test(word)) {
    forms.push(`${word}s`, `${word}d`, `${word.slice(0, -1)}ing`)
    return forms
  }
  if (/(s|x|z|ch|sh|o)$/.test(word)) forms.push(`${word}es`, `${word}ed`, `${word}ing`)
  else forms.push(`${word}s`, `${word}ed`, `${word}ing`)
  return forms
}

// 宾语占位：只匹配人称代词和常见人群名词，避免把普通名词硬塞进搭配
const OBJECT_PLACEHOLDER = '(?:us|them|you|him|her|me|people|students|consumers|workers|children|readers|voters|users|customers|patients|parents|drivers|farmers|employees|families|households|communities|individuals|teenagers|adults|women|men|graduates|borrowers|the\\s+public|young\\s+people)'

// 关联连词中间的间隔：至少含一个英文单词，避免 "so that" 被当成 "so … that"
const GAP = '[^.!?;]*?[A-Za-z]{2}[^.!?;]{0,120}?'
// both/either/neither 连接的是对等的短语，间隔不能跨逗号，否则会一口吞掉半句话
const GAP_SHORT = '[^.!?,;:]*?[A-Za-z]{2}[^.!?,;:]{0,60}?'

function phraseToRegExp(alt) {
  const words = alt.trim().split(/\s+/)
  let source = ''
  let strictGap = false
  words.forEach((word, index) => {
    if (word === '{gap}' || word === '{gaps}') {
      source += word === '{gaps}' ? GAP_SHORT : GAP
      // 短间隔后面也不允许再来逗号，否则「both A, and B」会被硬凑成搭配
      strictGap = word === '{gaps}'
      return
    }
    let piece
    if (index === 0 && word === 'be') piece = '(?:be|is|are|was|were|being|been)'
    else if (word === '{sb}') piece = OBJECT_PLACEHOLDER
    else if (index === 0 && !NOT_VERB_HEAD.has(word)) piece = `(?:${inflections(word).map(escapeRe).join('|')})`
    else piece = escapeRe(word)
    source += (source ? (strictGap ? '[\\s]+' : '[\\s,]+') : '') + piece
    strictGap = false
  })
  return new RegExp(`\\b${source}\\b`, 'gi')
}

const REGEXP_CACHE = new Map()

function matchPhrases(text) {
  const found = []
  for (const item of PHRASES) {
    for (const alt of item.alts) {
      let re = REGEXP_CACHE.get(alt)
      if (!re) {
        re = phraseToRegExp(alt)
        REGEXP_CACHE.set(alt, re)
      }
      // 同一个正则带 g 标志，重复用之前必须重置 lastIndex
      re.lastIndex = 0
      let hit
      while ((hit = re.exec(text))) {
        // not only … but also 的 also 常被省略，展示形式跟着原文走
        let label = item.canonical || item.alts[0]
        if (/also$/.test(label) && !/also/i.test(hit[0])) label = label.replace(/\s*also$/, '')
        found.push({
          key: label,
          canonical: label,
          matched: hit[0],
          start: hit.index,
          end: hit.index + hit[0].length,
          item
        })
      }
    }
  }
  return found
}

// 同一处文字只保留最长的那个搭配：take up with 不该同时报 take up 和 take up with
function pickLongest(matches) {
  const sorted = matches.slice().sort((a, b) => {
    const diff = (b.end - b.start) - (a.end - a.start)
    return diff !== 0 ? diff : a.start - b.start
  })
  const taken = []
  const picked = []
  for (const match of sorted) {
    const overlapped = taken.some((span) => match.start < span.end && match.end > span.start)
    if (overlapped) continue
    taken.push({ start: match.start, end: match.end })
    picked.push(match)
  }
  return picked.sort((a, b) => a.start - b.start)
}

function findPhrases(text) {
  const source = String(text || '')
  if (!source) return []
  const picked = pickLongest(matchPhrases(source))
  const used = new Set()
  const result = []
  for (const hit of picked) {
    if (used.has(hit.key)) continue
    used.add(hit.key)
    // 取包含该词组的原句，便于在卡片里回看语境
    const before = source.lastIndexOf('.', hit.start)
    const after = source.indexOf('.', hit.end)
    const start = before >= 0 ? before + 1 : 0
    const end = after >= 0 ? after + 1 : source.length
    result.push({
      key: hit.key,
      phrase: hit.matched,
      canonical: hit.canonical,
      meaning: hit.item.meaning,
      note: hit.item.note || '',
      type: hit.item.type || '',
      sentence: source.slice(start, end).trim()
    })
  }
  return result
}

module.exports = { PHRASES, findPhrases, typeOfPhrase }
