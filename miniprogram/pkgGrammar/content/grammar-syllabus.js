// 语法大纲：词法 → 句法 → 长难句，覆盖全部语法点。
// 大纲只负责「体系 + 顺序 + 考点」，每个知识点的完整讲解在 grammar-kb.js 里，
// 由 tools/build-grammar-kb.js 从 miniprogram/content/deep-*.js 合并生成。
const SYLLABUS = [
  {
    id: 'word',
    name: '词法',
    intro: '先打底：词怎么变、怎么搭。这一层不稳，句子看懂也写不对。',
    modules: [
      {
        id: 'agreement',
        guide: '先解决「谓语跟谁一致」。主语越长、后面附加成分越多，越要先圈出中心词；名词化结构则教你把动作写成名词，是学术句的主干来源。学完再进时态。',
        title: '名词、主谓一致与名词化',
        keys: ['subject-verb-agreement', 'nominalization'],
        goal: '能判断真正的主语是谁，长主语、插入语、集合名词都不会选错谓语。',
        exam: '四六级翻译和改错最爱在这里设错：主语后面塞一个 with / as well as 短语。',
        traps: '主语后跟 with / as well as / together with 时，谓语仍跟最前面的主语一致。'
      },
      {
        id: 'pronoun',
        guide: 'it 是英语的「占位工具」，先把形式主语、形式宾语、it takes / it is said 这几套模具练熟，再区分反身代词和 by oneself。这一模块直接影响翻译句式。',
        title: '代词、it 与反身代词',
        keys: ['reflexive-use', 'by-oneself', 'formal-it', 'it-takes', 'it-no-use', 'it-is-said'],
        goal: '会用 it 占位，把「做某事花多久」「据说」这类句子写顺。',
        exam: 'it takes sb some time to do、it is said that、it is no use doing 是翻译高频句式。',
        traps: '反身代词不能单独作主语；by oneself 是「独自」，不是「自己」。'
      },
      {
        id: 'determiner',
        guide: '冠词和介词是最容易被忽略的扣分点。先记「可数单数必须带冠词」和「特指用 the」，再用固定搭配整块记介词；代词细类只抓 some/any、few/little、both/either/neither。',
        title: '冠词、介词与代词细类',
        keys: ['articles', 'prepositions', 'pronoun-types'],
        goal: 'a / an / the 和零冠词不再凭语感，常见介词搭配和代词指代能对上。',
        exam: '冠词误用、介词搭配错误是改错和翻译的高频扣分点；代词指代是阅读细节题的关键。',
        traps: '泛指用 a / an，特指用 the，抽象名词泛指一般不加冠词；in the morning 但 at night。'
      },
      {
        id: 'tense',
        guide: '时间（过去 / 现在 / 将来）乘上状态（一般 / 进行 / 完成 / 完成进行），就是全部时态。先按时间标志定时态，再单独记 used to / be to do 两组替代说法，不要通篇一般过去。',
        title: '时态与体',
        keys: ['perfect-tense', 'progressive-tense', 'future-tense', 'used-to', 'be-to-do'],
        goal: '看到时间标志能立刻定时态，不再通篇一般过去。',
        exam: '现在完成与一般过去的分界、将来时的替代表达（be to do / be about to）常一起考。',
        traps: 'used to do 是「过去常常」，be used to doing 是「习惯于」，别混。'
      },
      {
        id: 'voice',
        guide: '先判断主语是动作发出者还是承受者，再决定主动被动。have sth done 和 make / let / have do 是使役重点，注意变被动时要把省略的 to 还原。',
        title: '语态与使役',
        keys: ['passive-basic', 'passive-modal', 'active-passive', 'get-passive', 'have-sth-done', 'make-let-do'],
        goal: '知道什么时候必须用被动，have sth done 不再写成 have sth do。',
        exam: '汉译英里「被」字句、have sth done（让某事被做）是固定考点。',
        traps: 'make / let / see 后接不带 to 的不定式，变被动时要把 to 还原。'
      },
      {
        id: 'modal',
        guide: '情态动词只有「能力、义务、推测」三条主线；加上完成式就变成对过去的推测或评价。先把 must have done 和 needn\'t have done 的差别分清，再补 need / dare / ought to。',
        title: '情态动词',
        keys: ['modal-basic', 'modal-perfect', 'modal-advanced'],
        goal: '情态动词 + 完成式能读出「猜测」还是「本该做却没做」。',
        exam: 'must have done、needn\'t have done 这类「情态 + 完成式」表推测或虚拟。',
        traps: '情态动词后直接跟动词原形，不加 to，也不随人称变位。'
      },
      {
        id: 'nonfinite',
        guide: '一个句子只有一个谓语，其余动词按「主动 doing、被动 done、目的 to do、先后 having done」四选一。分词作状语时，逻辑主语必须和主句主语一致。',
        title: '非谓语动词',
        keys: ['gerund-subject', 'participle-attribute', 'participle-phrase', 'participle-adverbial', 'infinitive-purpose', 'only-to', 'perception-verb', 'nonfinite-advanced'],
        goal: '一个句子只有一个谓语，其余动词知道该变成 to do、doing 还是 done。',
        exam: '分词作状语、only to find（结果却）、感官动词 + 分词，是长难句的骨架。',
        traps: '分词作状语时，逻辑主语必须和主句主语一致，否则就是悬垂分词。'
      },
      {
        id: 'chunk',
        guide: '这些是整块背、整块用的结构，不要临时拼。先记 have difficulty doing、spend time doing、too...to 三类高频，再处理 nothing but / the last 这类否定强调。',
        title: '固定词块与固定句式',
        keys: ['have-difficulty', 'spend-time', 'prefer-to', 'be-about-to', 'too-enough', 'nothing-but', 'the-last', 'adjective-postmodifier'],
        goal: '把「花时间做」「太…而不能」「只好」这些整块结构直接写出来。',
        exam: '「花时间做…」「忍不住…」「只好…」「太…而不能…」这类整块结构，翻译时直接套。',
        traps: 'spend time doing 不是 to do；too...to 本身含否定意思。'
      }
    ]
  },
  {
    id: 'syntax',
    name: '句法',
    intro: '再成句：从句、比较、倒装、虚拟。决定阅读能不能拆开、翻译能不能写对。',
    modules: [
      {
        id: 'basic',
        guide: '所有长句都能还原成五种基本句型。先练「找谓语、数它后面跟什么」，再分清双宾语和宾语补足语，这是后面拆长句的地基。',
        title: '句子骨架：五种基本句型与成分',
        keys: ['five-patterns', 'sentence-elements'],
        goal: '拿到一个句子，能立刻说出它属于哪种基本句型，主谓宾补各是谁。',
        exam: '汉译英写残句、主谓不一致，多半是基本句型没立住；写作评分也看句式是否完整。',
        traps: '系动词后接形容词作表语，不接副词；双宾语和宾语补足语别混，中间能加 be 的是补语。'
      },
      {
        id: 'relative',
        guide: '定语从句就是「名词 + 一个不完整的句子」。先找先行词，再看从句缺什么成分：缺主宾用 who / which / that，缺状语用 where / when / why。',
        title: '定语从句',
        keys: ['relative-clause', 'non-restrictive', 'relative-whose', 'relative-adverb', 'relative-who', 'where-clause', 'as-relative', 'prep-which'],
        goal: '看到 which / who / whose 知道它指谁，能拆成两个中文短句。',
        exam: '介词 + which、as / which 指代整句、非限制性定语从句，是阅读长句的主干修饰。',
        traps: 'that 不能引导非限制性定语从句，也不能直接放在介词后面。'
      },
      {
        id: 'nounclause',
        guide: '把从句当名词用，放在主语、宾语、表语、同位语四个位置。核心判断是从句里缺不缺成分：缺用 what，不缺用 that 或 whether。',
        title: '名词性从句',
        keys: ['noun-clause', 'subject-clause', 'predicative-clause', 'wh-ever'],
        goal: '把从句当名词用，whether / that / what 不再乱选。',
        exam: '主语从句与 it 形式主语互换、表语从句、whether 与 that 的分工。',
        traps: '名词性从句一律用陈述语序，疑问词后面不倒装。'
      },
      {
        id: 'appositive',
        guide: '同位语是「换个说法解释前面的名词」，插入语是「删掉也不影响句子」。读长句时先把它们括起来跳过，主干立刻显形。',
        title: '同位语与插入语',
        keys: ['appositive', 'noun-appositive', 'parenthetical', 'dash-parenthesis'],
        goal: '能识别插入语，读长句时先划掉再找主干。',
        exam: '长难句里插入语经常被误当主干，先划掉再找主谓。',
        traps: '两个逗号、两个破折号之间的内容多为补充说明，删掉不影响句子成立。'
      },
      {
        id: 'adverbial',
        guide: '状语从句的关键不是背连词，而是判断关系：时间、原因、条件、让步、目的、结果。as / while / since 都要结合语境定意思，不要一律译成「当……时」。',
        title: '状语从句',
        keys: ['time-clause', 'as-soon-as', 'reason-clause', 'reason-that', 'condition-clause', 'conditional-clause', 'concessive-clause', 'as-concession', 'concession-no-matter', 'purpose-clause', 'purpose-lest', 'so-that', 'while-contrast', 'now-that', 'as-long-as', 'as-if', 'as-phrase', 'as-time-cause'],
        goal: 'as / while / since 的多义能结合语境定下来，不会一律当「当…时」。',
        exam: 'as 的多义（当…时 / 因为 / 虽然 / 正如）、while 表对比、so that 表目的或结果。',
        traps: 'so that 从句里带情态动词多为目的，不带多为结果。'
      },
      {
        id: 'comparison',
        guide: '先确认「谁和谁比」，再检查比较对象是否对等。倍数、the more...the more、not so much A as B 各有固定公式，套公式比凭语感稳。',
        title: '比较结构',
        keys: ['as-many-as', 'the-more', 'comparative-than', 'comparative-substitute', 'as-as-comparison', 'not-so-much-as', 'comparative-degree', 'times-comparison', 'compared-with', 'comparative-separated'],
        goal: '倍数、比较级、the more... the more 都能对号入座。',
        exam: '倍数表达（twice as many as）、the more... the more、比较对象一致。',
        traps: '比较级不能和自身比较；than 后面省略的部分要能还原出来。'
      },
      {
        id: 'inversion',
        guide: '倒装分两种：只提前助动词的部分倒装（否定词、only 开头），和整个谓语提前的完全倒装（here / on the table）。先还原正常语序再翻译。',
        title: '倒装与强调',
        keys: ['cleft', 'inversion', 'so-neither-inversion', 'emphatic-do', 'full-inversion', 'not-until', 'subjunctive-inversion', 'only-inversion'],
        goal: '看到句首否定词或 only，能反应过来要倒装，也能还原成正常语序。',
        exam: 'Not until 置于句首用部分倒装、It is...that 强调句、do 强调谓语动词。',
        traps: '部分倒装只把助动词提前，实义动词留在原位。'
      },
      {
        id: 'subjunctive',
        guide: '先判断「与现在、过去还是将来相反」，再套三套时态；建议要求类的 (should) do 是另一条线，不要和 if 虚拟混在一起。',
        title: '虚拟语气',
        keys: ['wish-ifonly', 'subjunctive', 'but-for', 'otherwise-subjunctive'],
        goal: '按「与现在 / 过去 / 将来相反」三套公式写虚拟。',
        exam: '三种时间的三套时态，以及 but for / otherwise 的含蓄虚拟。',
        traps: '主句和从句时间不一致时，各按各的时间调整，不要一律用过去完成。'
      },
      {
        id: 'ellipsis',
        guide: '省略和替代是长句「变短」的两种手段。看到 if necessary、when asked 先补全；看到 do so / one / that 先确认它替代的是什么。',
        title: '省略、替代与并列',
        keys: ['not-only-but-also', 'rather-than', 'ellipsis', 'correlative', 'semicolon-parallel', 'colon-explain', 'not-but', 'coordination', 'elliptical-clause', 'substitution'],
        goal: '并列项能对齐，省略掉的成分能补回来。',
        exam: '并列项结构对称、not only 置于句首前半句倒装、冒号与分号的解释关系。',
        traps: '并列成分必须同层级、同形式，不能一个名词一个从句。'
      },
      {
        id: 'special',
        guide: 'there be、部分否定、双重否定、反意疑问、间接引语，都是固定套路。重点记 not all 是「并非都」，以及间接引语里疑问句要用陈述语序。',
        title: '特殊句式与否定',
        keys: ['there-be', 'partial-negation', 'double-negative', 'exclamatory', 'tag-question', 'indirect-speech'],
        goal: 'there be、部分否定、反义疑问句不踩坑。',
        exam: 'there be 句型、全部否定与部分否定、反义疑问句、间接引语时态后移。',
        traps: 'not all / not every 是「并非都」，不是「都不」。'
      },
      {
        id: 'order',
        guide: '中英文语序差异主要在状语和补语。句首状语不一定倒装，只有否定词或 only 开头才倒装；宾语补足语紧跟宾语，别和双宾语混。',
        title: '语序与句子成分',
        keys: ['fronted-adverbial', 'object-complement'],
        goal: '汉译英时知道状语放哪、补语放哪。',
        exam: '状语前置后的语序、宾语补足语的位置，是汉译英调整语序的关键。',
        traps: '地点状语前置不一定倒装，只有否定词或 only 开头才倒装。'
      },
      {
        id: 'absolute',
        guide: 'with 复合结构和独立主格都是「名词 + 分词 / 形容词」的浓缩状语，译成「随着…… / 在……情况下」。注意它没有谓语，不能再加连词。',
        title: '独立主格与 with 复合结构',
        keys: ['with-absolute', 'absolute-noun'],
        goal: 'with 复合结构能译成「随着… / 在…情况下」。',
        exam: 'with + 名词 + 分词 / 形容词作伴随状语，翻译时常处理成「随着…」「在…情况下」。',
        traps: '独立主格不是完整句子，不能再加连词或谓语。'
      }
    ]
  },
  {
    id: 'long',
    name: '长难句',
    intro: '最后拔高：把词法和句法合起来，处理真题里的长句。',
    modules: [
      {
        id: 'nested',
        guide: '从句套从句时，先找最外层主句的主谓，再一层层往里剥。每层只回答「这个从句修饰谁」，不要从头逐词翻译。',
        title: '嵌套从句',
        keys: ['nested-clauses'],
        goal: '三层从句套在一起，也能找到主干。',
        exam: '从句套从句，先抓主谓，再一层层剥修饰，是阅读细节题的核心能力。',
        traps: '谓语找错就会把整句意思翻反，先找主句主干再看从句。'
      },
      {
        id: 'longsentence',
        guide: '四步法是固定流程：圈修饰、找主谓、定关系、分块译。练熟后任何 40 词长句都按同一顺序处理，不靠语感硬读。',
        title: '长难句拆解',
        keys: ['long-sentence'],
        goal: '按四步法把 40 词长句拆开再翻译。',
        exam: '四六级翻译与阅读的长句结构：主干 + 修饰 + 插入，按块翻译再拼接。',
        traps: '照中文语序硬翻会堆成流水句，要先断句再定主谓。'
      },
      {
        id: 'longstruct',
        guide: '插入、倒装、省略、并列、后置修饰，是长句变难的五个来源。先识别是哪一类，再用对应手法还原，比逐词硬翻快得多。',
        title: '五类典型长句结构',
        keys: ['long-insertion', 'long-inversion', 'long-ellipsis', 'long-parallel', 'long-postmodifier'],
        goal: '遇到插入、倒装、省略、并列、后置修饰，知道先处理哪一层。',
        exam: '真题长句几乎都是这几类结构叠加，先识别结构再找主干，比逐词翻译快得多。',
        traps: '倒装先还原语序再译；省略要按上下文补全，不能凭感觉猜。'
      }
    ]
  }
]

// 长难句方法论：不挂在某个语法点上，单独作为方法卡展示
const LONG_METHOD = {
  title: '长难句四步拆解法',
  subtitle: '顺序固定，练熟以后读任何长句都按这个流程走。',
  steps: [
    { title: '一圈修饰', detail: '介词短语、定语从句、状语从句、插入语，先全部圈起来。圈完剩下的就是主干，句子立刻短一半。' },
    { title: '二找主谓', detail: '在主干里找谓语动词。一个句子只有一个真正的谓语，其余要么是从句谓语，要么是非谓语。' },
    { title: '三定关系', detail: '逐个看圈起来的部分修饰谁：which / who 往前找名词，分词看逻辑主语，状语看它说明主句的什么。' },
    { title: '四分块译', detail: '主干先译成一句，再把修饰按中文习惯（时间、地点、条件、原因在前）插进去，最后检查有没有漏译。' }
  ],
  tips: [
    '先找谓语，再找主语，不要从头逐词翻译。',
    '看到 that 先判断它引导从句还是指代前面的名词。',
    '中文允许拆成两三个短句，不必硬塞成一个长句。'
  ],
  demo: {
    en: 'In recent years, researchers have found that small changes in daily habits can produce lasting effects on learning.',
    zh: '近年来，研究者发现日常习惯的微小改变会对学习产生持久的影响。',
    chunks: [
      { label: '一圈修饰', text: 'In recent years（时间状语）、in daily habits（修饰 changes）、on learning（修饰 effects）先圈掉。' },
      { label: '二找主谓', text: '主句是 researchers have found；that 从句里是 small changes can produce。' },
      { label: '三定关系', text: 'that 是 found 的宾语从句；in daily habits 说明哪些 changes；on learning 说明什么 effects。' },
      { label: '四分块译', text: '时间放句首，主干「研究者发现」，从句「日常习惯的微小改变会产生持久影响」，连起来即可。' }
    ]
  }
}

// key → 模块 / 分类，页面按卡片 key 和知识点 key 直接取
const KEY_MODULE = {}
const KEY_CATEGORY = {}
const MODULE_MAP = {}
let moduleIndex = 0
SYLLABUS.forEach((group) => {
  group.modules.forEach((module) => {
    moduleIndex += 1
    MODULE_MAP[module.id] = { ...module, category: group.id, categoryName: group.name, order: moduleIndex }
    module.keys.forEach((key) => {
      KEY_MODULE[key] = module.id
      KEY_CATEGORY[key] = group.id
    })
  })
})

module.exports = { SYLLABUS, LONG_METHOD, KEY_MODULE, KEY_CATEGORY, MODULE_MAP }
