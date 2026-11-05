// 翻译练习评估器：零依赖，靠整句结构与相似度校验，而不是关键词命中。
// 设计目标：拦住「堆关键词」「只写半句」「乱写」「直接抄原句」；
// 失败反馈只说明问题类型，绝不列出答案用词，避免泄题。

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'nor', 'not', 'only', 'also', 'so',
  'very', 'really', 'quite', 'just', 'even', 'still', 'too', 'then', 'than',
  'as', 'more', 'most', 'much', 'many', 'be', 'do', 'have',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'yourselves', 'themselves', 'own',
  'my', 'your', 'his', 'its', 'our', 'their', 'this', 'that', 'these', 'those',
  'there', 'here', 'of', 'to', 'in', 'on', 'at', 'for', 'with', 'by', 'from',
  'about', 'into', 'over', 'under', 'after', 'before', 'while', 'when', 'where',
  'why', 'how', 'if', 'whether', 'what', 'which', 'who', 'whom', 'whose',
  'up', 'down', 'out', 'off', 'away', 'back', 'through', 'across', 'along',
  'again', 'once', 'all', 'any', 'some', 'each', 'every', 'both', 'either',
  'neither', 'no', 'yes'
])

// 常见不规则变形，统一回原形后再比较
const IRREGULAR = {
  was: 'be', were: 'be', is: 'be', are: 'be', am: 'be', been: 'be', being: 'be',
  had: 'have', has: 'have', having: 'have',
  did: 'do', does: 'do', done: 'do',
  went: 'go', gone: 'go',
  made: 'make', took: 'take', taken: 'take', came: 'come', saw: 'see',
  seen: 'see', gave: 'give', given: 'give', found: 'find', thought: 'think',
  told: 'tell', said: 'say', knew: 'know', known: 'know', got: 'get',
  gotten: 'get', became: 'become', left: 'leave', felt: 'feel',
  brought: 'bring', began: 'begin', begun: 'begin', kept: 'keep',
  held: 'hold', wrote: 'write', written: 'write', spent: 'spend',
  grew: 'grow', grown: 'grow', taught: 'teach', lost: 'lose', met: 'meet',
  paid: 'pay', sat: 'sit', stood: 'stand', understood: 'understand',
  won: 'win', ran: 'run', built: 'build', sent: 'send', broke: 'break',
  broken: 'break', spoke: 'speak', spoken: 'speak', drove: 'drive',
  driven: 'drive', fell: 'fall', fallen: 'fall', rose: 'rise', risen: 'rise',
  led: 'lead', bought: 'buy', caught: 'catch', fought: 'fight', heard: 'hear',
  meant: 'mean', sold: 'sell', wore: 'wear', worn: 'wear', threw: 'throw',
  thrown: 'throw', flew: 'fly', flown: 'fly', forgot: 'forget', forgotten: 'forget',
  ate: 'eat', eaten: 'eat', drank: 'drink', drunk: 'drink', sang: 'sing',
  sung: 'sing', swam: 'swim', swum: 'swim', rode: 'ride', ridden: 'ride',
  woke: 'wake', woken: 'wake', hid: 'hide', hidden: 'hide', shot: 'shoot',
  stole: 'steal', stolen: 'steal', sought: 'seek', lent: 'lend', bent: 'bend',
  dealt: 'deal', fed: 'feed', hung: 'hang', lit: 'light', rang: 'ring',
  rung: 'ring', shook: 'shake', shaken: 'shake', slept: 'sleep', struck: 'strike',
  swore: 'swear', sworn: 'swear', swept: 'sweep', tore: 'tear', torn: 'tear'
}

// 常见近义替换，避免正确改写因为换了词而被误判
const SYNONYMS = {
  complete: 'finish', completed: 'finish', completes: 'finish', completing: 'finish',
  kid: 'child', kids: 'child', children: 'child',
  draw: 'paint', drawing: 'paint', drew: 'paint', drawn: 'paint',
  picture: 'paint', pictures: 'paint',
  large: 'big', huge: 'big',
  little: 'small', tiny: 'small',
  begin: 'start', began: 'start', begun: 'start', starting: 'start',
  purchase: 'buy', purchased: 'buy',
  assist: 'help', assisted: 'help',
  demonstrate: 'show', demonstrated: 'show',
  employ: 'use', employed: 'use', using: 'use', used: 'use',
  significant: 'important',
  hard: 'difficult',
  simple: 'easy',
  quick: 'fast', quickly: 'fast',
  obtain: 'get', obtained: 'get', gain: 'get',
  create: 'make', created: 'make', produce: 'make', produced: 'make',
  believe: 'think', believed: 'think',
  require: 'need', required: 'need', requires: 'need',
  alter: 'change', changed: 'change',
  continue: 'keep', continued: 'keep', continuing: 'keep',
  resolve: 'solve', solved: 'solve', solving: 'solve',
  enhance: 'improve', improved: 'improve', improving: 'improve',
  determine: 'decide', decided: 'decide', deciding: 'decide',
  permit: 'allow', permitted: 'allow',
  decrease: 'reduce', decreased: 'reduce',
  grow: 'increase', grew: 'increase', grown: 'increase',
  select: 'choose', chose: 'choose', chosen: 'choose', choosing: 'choose',
  illustrate: 'explain', explained: 'explain',
  issue: 'problem', issues: 'problem',
  method: 'way', approach: 'way', methods: 'way',
  people: 'person', persons: 'person',
  practice: 'practise', practicing: 'practise', practised: 'practise',
  artwork: 'paint', artworks: 'paint',
  volume: 'book', volumes: 'book',
  entertaining: 'interesting', entertain: 'interesting', fun: 'interesting',
  instructive: 'educational', instruct: 'educational',
  complicated: 'complex', complication: 'complex',
  youngster: 'child', youngsters: 'child', youth: 'child',
  tardiness: 'late', tardy: 'late',
  infuriate: 'angry', infuriated: 'angry', infuriates: 'angry',
  register: 'sign', registered: 'sign', registers: 'sign', registration: 'sign', registrations: 'sign',
  double: 'twice',
  reply: 'answer', replied: 'answer',
  display: 'show', displayed: 'show',
  view: 'see', viewed: 'see',
  state: 'say', stated: 'say',
  finished: 'finish', finishes: 'finish', finishing: 'finish'
}

// 缩写还原，让 "we'll"、"can't" 也能对上助动词
const CONTRACTIONS = {
  "n't": 'not',
  "'ll": 'will',
  "'re": 'be',
  "'ve": 'have',
  "'m": 'be',
  "'d": 'would'
}

// 常见短语的等价写法，只收录语义无歧义的替换
const PHRASE_VARIANTS = [
  ['by himself', 'on his own'],
  ['by herself', 'on her own'],
  ['by myself', 'on my own'],
  ['by yourself', 'on your own'],
  ['by themselves', 'on their own'],
  ['by ourselves', 'on our own'],
  ['by itself', 'on its own'],
  ['rather than', 'instead of']
]

// 判断句子有没有谓语的动词表（常见原形）
const VERBS = new Set([
  'accept', 'achieve', 'add', 'affect', 'agree', 'allow', 'answer', 'appear', 'apply',
  'argue', 'arrive', 'ask', 'avoid', 'become', 'begin', 'believe', 'belong', 'bring',
  'build', 'buy', 'call', 'carry', 'cause', 'change', 'check', 'choose', 'come',
  'compare', 'complete', 'consider', 'contain', 'continue', 'create', 'decide',
  'delay', 'describe', 'discuss', 'do', 'draw', 'drive', 'educate', 'encourage',
  'end', 'enjoy', 'explain', 'fail', 'fall', 'feel', 'find', 'finish', 'focus',
  'follow', 'get', 'give', 'go', 'grow', 'happen', 'have', 'hear', 'help', 'hold',
  'hope', 'improve', 'include', 'increase', 'interest', 'interpret', 'keep', 'know',
  'learn', 'leave', 'let', 'like', 'live', 'look', 'lose', 'make', 'mean', 'meet',
  'mention', 'move', 'need', 'notice', 'offer', 'open', 'pass', 'pay', 'plan',
  'play', 'point', 'practise', 'prefer', 'prepare', 'produce', 'provide', 'put',
  'reach', 'read', 'realize', 'receive', 'reduce', 'register', 'remain', 'remember',
  'require', 'result', 'return', 'run', 'say', 'see', 'seem', 'sell', 'send',
  'serve', 'set', 'show', 'sign', 'solve', 'speak', 'spend', 'stand', 'start',
  'stay', 'stop', 'study', 'submit', 'suggest', 'support', 'take', 'talk', 'teach',
  'tell', 'think', 'try', 'turn', 'understand', 'use', 'visit', 'wait', 'walk',
  'want', 'watch', 'work', 'write', 'appeal', 'delight', 'infuriate',
  'display', 'exhibit', 'examine', 'analyze', 'assess', 'evaluate', 'conduct',
  'perform', 'establish', 'maintain', 'emphasize', 'indicate', 'reveal',
  'reflect', 'publish', 'announce', 'confirm', 'respond', 'review', 'satisfy',
  'strengthen', 'simplify', 'monitor', 'observe', 'predict', 'promote',
  'recognize', 'record', 'replace', 'protect', 'prevent', 'enable', 'inspire',
  'motivate', 'suffer', 'survive', 'treat', 'vary', 'witness', 'expand',
  'extend', 'measure', 'illustrate', 'present', 'obtain', 'purchase', 'employ',
  'assist', 'demonstrate', 'require', 'alter', 'resolve', 'enhance', 'determine',
  'permit', 'decrease', 'select', 'reply', 'view', 'register', 'double'
])

const AUXILIARIES = new Set([
  'be', 'do', 'have', 'can', 'could', 'will', 'would', 'shall', 'should',
  'may', 'might', 'must', 'need', 'ought'
])

// 以 -ing 结尾但通常作形容词的词，不能算谓语
const ING_ADJECTIVES = new Set([
  'interesting', 'exciting', 'boring', 'tiring', 'amazing', 'surprising',
  'confusing', 'convincing', 'disappointing', 'embarrassing', 'encouraging',
  'frightening', 'relaxing', 'rewarding', 'satisfying', 'worrying',
  'challenging', 'misleading', 'outstanding'
])

// be 动词有限形式的单复数
const BE_FORMS = {
  am: 'singular',
  is: 'singular',
  are: 'plural',
  was: 'singular',
  were: 'plural'
}

const BE_FORMS_SET = new Set(['am', 'is', 'are', 'was', 'were', 'be', 'been', 'being'])
const DO_FORMS_SET = new Set(['do', 'does', 'did', 'done', 'doing'])
const HAVE_FORMS_SET = new Set(['have', 'has', 'had', 'having'])
const MODALS = new Set(['can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'ought'])

// 轻量词性判断用的词表（只覆盖判定需要的类别）
const DETERMINERS = new Set([
  'a', 'an', 'the', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her',
  'its', 'our', 'their', 'some', 'any', 'each', 'every', 'no', 'both', 'either',
  'neither', 'another', 'such', 'what', 'which', 'whose'
])

const PRONOUNS = new Set([
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'us', 'them',
  'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'yourselves',
  'themselves', 'there'
])

const PREPOSITIONS = new Set([
  'of', 'to', 'in', 'on', 'at', 'for', 'with', 'by', 'from', 'about', 'into',
  'over', 'under', 'after', 'before', 'through', 'across', 'along', 'between',
  'among', 'during', 'without', 'within', 'against', 'toward', 'towards', 'upon',
  'as', 'than', 'like', 'since', 'until', 'till', 'despite', 'per', 'via', 'off',
  'out', 'up', 'down'
])

const ADVERBS = new Set([
  'very', 'really', 'quite', 'just', 'even', 'still', 'too', 'then', 'also', 'not',
  'only', 'always', 'never', 'often', 'sometimes', 'soon', 'already', 'yet', 'again',
  'once', 'twice', 'here', 'there', 'now', 'immediately', 'right', 'away', 'back',
  'together', 'almost', 'nearly', 'especially', 'particularly', 'actually',
  'probably', 'perhaps', 'maybe', 'instead', 'rather', 'hardly', 'scarcely'
])

const ADJECTIVES = new Set([
  'interesting', 'educational', 'complex', 'complicated', 'difficult', 'hard',
  'easy', 'simple', 'clear', 'important', 'significant', 'big', 'large', 'small',
  'little', 'new', 'old', 'good', 'bad', 'great', 'high', 'low', 'long', 'short',
  'fast', 'slow', 'early', 'late', 'young', 'able', 'available', 'possible',
  'impossible', 'likely', 'unlikely', 'necessary', 'different', 'similar', 'same',
  'whole', 'entire', 'main', 'key', 'limited', 'detailed', 'natural', 'real',
  'true', 'false', 'common', 'general', 'public', 'private', 'modern', 'recent',
  'current', 'certain', 'sure', 'obvious', 'misleading', 'convincing'
])

const PHRASE_LOOKUP = PHRASE_VARIANTS.reduce((lookup, group) => {
  const variants = group.map((phrase) => phrase.split(' ').map(canonical))
  group.forEach((phrase) => {
    lookup[phrase.split(' ').map(canonical).join(' ')] = variants
  })
  return lookup
}, {})

// 汉译英：整句规模与参考译文的比例门槛
const ZH2EN_MIN_WORD_RATIO = 0.6
// 汉译英：实词覆盖率
const ZH2EN_MIN_COVERAGE = 0.5
// 汉译英：词序一致度（最长公共子序列）
const ZH2EN_MIN_ORDER = 0.5
// 汉译英：相邻词对重合度
const ZH2EN_MIN_PAIR = 0.35
// 英译汉：中文字数比例门槛（防止只写几个关键词就通过）
const EN2ZH_MIN_CHAR_RATIO = 0.7
// 英译汉：中文二元组重合度门槛（配合字数门槛，拦住无关内容和复读）
const EN2ZH_MIN_BIGRAM = 0.2
// 英译汉：重合度足够高时不再要求关键词齐全
const EN2ZH_STRONG_BIGRAM = 0.65
// 英译汉：关键词命中比例
const EN2ZH_MIN_KEYWORD_RATIO = 0.5

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[\u2019]/g, "'")
    .replace(/[^a-z']+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function canonical(word) {
  const clean = String(word || '').replace(/[^a-z']/g, '')
  if (!clean) return ''
  const suffix = Object.keys(CONTRACTIONS).find((key) => clean.length > key.length && clean.slice(-key.length) === key)
  if (suffix) return CONTRACTIONS[suffix]
  return SYNONYMS[clean] || IRREGULAR[clean] || clean
}

// 还原动词原形：直接查词表，或通过近义词表、-s / -ed / -ing 后缀反推
// 这样 display / displays / displayed 这类词表外的动词也能被识别
function verbBase(word) {
  if (!word) return ''
  if (VERBS.has(word)) return word
  if (SYNONYMS[word] && VERBS.has(SYNONYMS[word])) return SYNONYMS[word]
  const candidates = []
  if (word.length > 3 && word.slice(-2) === 'ed') {
    const stem = word.slice(0, -2)
    candidates.push(stem, stem + 'e')
    if (stem.length > 2 && stem.slice(-1) === stem.slice(-2)) candidates.push(stem.slice(0, -1))
    if (stem.slice(-1) === 'i') candidates.push(stem.slice(0, -1) + 'y')
  }
  if (word.length > 4 && word.slice(-3) === 'ing') {
    const stem = word.slice(0, -3)
    candidates.push(stem, stem + 'e')
    if (stem.length > 2 && stem.slice(-1) === stem.slice(-2)) candidates.push(stem.slice(0, -1))
  }
  if (word.length > 3 && word.slice(-1) === 's') {
    const stem = word.slice(0, -1)
    candidates.push(stem)
    if (word.slice(-2) === 'es') candidates.push(word.slice(0, -2))
    if (stem.slice(-1) === 'i') candidates.push(stem.slice(0, -1) + 'y')
  }
  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i]
    if (!candidate || candidate === word) continue
    if (VERBS.has(candidate)) return candidate
    if (SYNONYMS[candidate] && VERBS.has(SYNONYMS[candidate])) return SYNONYMS[candidate]
  }
  return ''
}

// 对齐用的词元：先做近义词/不规则归一，再把动词各种变形折算成同一个原形
function lemma(word) {
  const base = canonical(word)
  if (SYNONYMS[base]) return SYNONYMS[base]
  const verb = verbBase(base)
  if (!verb) return base
  return SYNONYMS[verb] || verb
}

// 判断两个词是否同源：短词是长词的前缀，例如 finish / finished、child / children
function sameStem(a, b) {
  if (!a || !b) return false
  if (a === b) return true
  const short = a.length <= b.length ? a : b
  const long = a.length <= b.length ? b : a
  if (short.length < 3) return false
  return long.indexOf(short) === 0
}

function contentWords(tokens) {
  return tokens.map(canonical).filter((word) => word && !STOPWORDS.has(word))
}

function coverage(referenceWords, answerWords) {
  const unique = Array.from(new Set(referenceWords))
  if (!unique.length) return 1
  let hit = 0
  unique.forEach((word) => {
    if (answerWords.some((candidate) => sameStem(word, candidate))) hit += 1
  })
  return hit / unique.length
}

// 在 tokens 里从 start 开始找连续短语，返回起始下标
// 用同源比较，允许 finished / finish、passing / pass 这类词形变化
function findPhraseFrom(tokens, phraseTokens, start) {
  if (!phraseTokens.length) return -1
  for (let i = Math.max(0, start); i + phraseTokens.length <= tokens.length; i += 1) {
    let matched = true
    for (let j = 0; j < phraseTokens.length; j += 1) {
      if (!sameStem(tokens[i + j], phraseTokens[j])) {
        matched = false
        break
      }
    }
    if (matched) return i
  }
  return -1
}

// 粗判谓语：助动词、常见动词、-ed / -ing / 第三人称 -s 形式
function isVerbLike(token) {
  const word = canonical(token)
  if (!word) return false
  if (AUXILIARIES.has(word)) return true
  // -ing 形容词（interesting / educational 这类）不能当谓语
  if (ING_ADJECTIVES.has(word)) return false
  if (verbBase(word)) return true
  if (word.length > 3 && word.slice(-2) === 'ed') return true
  if (word.length > 4 && word.slice(-3) === 'ing') return true
  return false
}

// 相邻词对重合度：词堆或错序会明显掉分
function pairCoverage(referenceTokens, answerTokens) {
  if (referenceTokens.length < 2) return 1
  const answerPairs = new Set()
  for (let i = 0; i < answerTokens.length - 1; i += 1) {
    answerPairs.add(`${answerTokens[i]} ${answerTokens[i + 1]}`)
  }
  const referencePairs = new Set()
  for (let i = 0; i < referenceTokens.length - 1; i += 1) {
    referencePairs.add(`${referenceTokens[i]} ${referenceTokens[i + 1]}`)
  }
  let hit = 0
  referencePairs.forEach((pair) => {
    if (answerPairs.has(pair)) hit += 1
  })
  return hit / referencePairs.size
}

// 最长公共子序列占比：衡量整句词序是否与参考译文一致
function orderRatio(referenceTokens, answerTokens) {
  const n = referenceTokens.length
  const m = answerTokens.length
  if (!n) return 1
  if (!m) return 0
  let prev = new Array(m + 1).fill(0)
  let current = new Array(m + 1).fill(0)
  for (let i = 1; i <= n; i += 1) {
    for (let j = 1; j <= m; j += 1) {
      current[j] = referenceTokens[i - 1] === answerTokens[j - 1]
        ? prev[j - 1] + 1
        : Math.max(prev[j], current[j - 1])
    }
    const swap = prev
    prev = current
    current = swap
    current.fill(0)
  }
  return prev[m] / n
}

function cjkChars(text) {
  return String(text || '').match(/[\u4e00-\u9fa5]/g) || []
}

function cjkBigrams(text) {
  const chars = cjkChars(text).join('')
  const set = new Set()
  for (let i = 0; i < chars.length - 1; i += 1) set.add(chars.slice(i, i + 2))
  return set
}

function bigramCoverage(reference, answer) {
  const referenceSet = cjkBigrams(reference)
  if (!referenceSet.size) return 1
  const answerSet = cjkBigrams(answer)
  let hit = 0
  referenceSet.forEach((gram) => {
    if (answerSet.has(gram)) hit += 1
  })
  return hit / referenceSet.size
}

function pass(feedback) {
  return { result: 'pass', feedback }
}

// 失败时附带的「正确用法」：只讲规则和通用例句，不出现本题答案里的具体用词
function fail(feedback, tip) {
  return { result: 'fail', feedback, tip: tip || '' }
}

const RULE_TIPS = {
  incomplete: '完整句子要有主语和谓语；whether / if / 介词 / 冠词 / 助动词后面必须还有成分。例：I don\'t know whether he will come.',
  tail: '题目里的每一部分都要译出来，不能只写前半句就停下。',
  clause: 'whether / if 引导的是陈述语序：whether + 主语 + 谓语。例：I don\'t know whether he will come.（✗ whether will he come）',
  'clause-predicate': 'whether / if 后面必须是一个完整从句，从句要有自己的主语和谓语。例：I don\'t know whether he is ready.',
  'clause-subject': 'whether / if 本身就是引导词，一个从句只用一个，不能再和 that 叠加；后面必须接「主语 + 谓语」。例：I don\'t know whether he will come.（✗ whether is right）',
  subjectOrder: '陈述句里主语在谓语前面。例：The plan works well.（✗ Works the plan well.）',
  subjectGap: '主语和谓语要连在一起，介词短语（时间、地点、方式）放句首或句尾。例：She went to the park in the morning.',
  tense: '描述过去发生的事，谓语要用过去式；不规则动词要单独记。例：She finished the task yesterday.（✗ She finish the task yesterday.）',
  modal: '情态动词后面接动词原形，不加 -ed / -s。例：You must finish it today.（✗ must finished）',
  agreement: '主语是第三人称单数、时态是现在时，动词要加 -s。例：He works here.（✗ He work here.）',
  determiner: '可数名词单数前面要有 a / an / the 或物主代词。例：This is a book.（✗ This is book.）',
  quantity: '表示「很多」时，可数名词用复数形式，前面用 many。例：Many students joined.（✗ many student）',
  inversion: '句首否定/only 类状语后面要部分倒装：状语 + 助动词 + 主语 + 谓语。例：Not only did he come, but he also stayed.',
  soThat: 'so + 形容词/副词 + that + 从句。例：It is so cold that we stayed home.（✗ so that cold）',
  order: '按「主语 + 谓语 + 其他成分」的顺序组织句子，先摆主干再补修饰。',
  info: '先把句子的主干（谁、做什么、怎么样）译出来，再补细节。'
}

// 反向索引：讲解文案 → 错误类型 key，供重写循环和学习报告统计使用
const RULE_BY_TIP = Object.keys(RULE_TIPS).reduce((map, key) => {
  map[RULE_TIPS[key]] = key
  return map
}, {})

// 规则日志：云端日志统一前缀，控制台按 [translate-eval] 过滤，排查误判/漏判
// 本地跑测试时设置 EVAL_LOG=off 可以关掉，避免刷屏
const LOG_ENABLED = !(typeof process !== 'undefined' && process.env && process.env.EVAL_LOG === 'off')

function logRule(rule, detail) {
  if (!LOG_ENABLED) return
  try {
    console.log(`[translate-eval][${rule}] ${JSON.stringify(detail)}`)
  } catch (error) {
    console.log(`[translate-eval][${rule}] detail=unserializable`)
  }
}

// 旧数据兜底：没有参考译文时只能做最基本的关键词与语言校验
function evaluateLegacy(raw, question) {
  const keywords = (Array.isArray(question.keywords) ? question.keywords : [])
    .map((keyword) => String(keyword || '').trim())
    .filter(Boolean)
  if (!keywords.length) return fail('这道练习缺少参考译文，暂时无法判定，可以先对照语法卡检查。')
  const lower = raw.toLowerCase()
  const hit = keywords.filter((keyword) => lower.indexOf(keyword.toLowerCase()) >= 0).length
  if (hit < keywords.length) return fail('句子里的关键信息还没有写全，回到语法卡对照结构再改一遍。')
  return pass('关键信息都写到了，表达通过。')
}

// ---------- 轻量词性判断（词表 + 后缀，不做完整句法分析） ----------

function isAdjective(word) {
  if (!word) return false
  if (ADJECTIVES.has(word) || ING_ADJECTIVES.has(word)) return true
  if (word.length > 5 && (word.slice(-3) === 'ful' || word.slice(-3) === 'ous'
    || word.slice(-3) === 'ive' || word.slice(-4) === 'able' || word.slice(-4) === 'ible'
    || word.slice(-4) === 'less' || word.slice(-3) === 'ary' || word.slice(-3) === 'ent'
    || word.slice(-3) === 'ant')) return true
  if (word.length > 4 && (word.slice(-2) === 'al' || word.slice(-2) === 'ic')) return true
  return false
}

function isPastTense(word) {
  if (BE_FORMS_SET.has(word) || DO_FORMS_SET.has(word) || HAVE_FORMS_SET.has(word) || MODALS.has(word)) return false
  if (isAdjective(word)) return false
  const base = IRREGULAR[word]
  if (base && base !== 'be' && base !== 'do' && base !== 'have' && VERBS.has(base)) return true
  if (word.length > 3 && word.slice(-2) === 'ed') return true
  return false
}

function isThirdPersonVerb(word) {
  if (BE_FORMS_SET.has(word) || DO_FORMS_SET.has(word) || HAVE_FORMS_SET.has(word)) return false
  if (word.slice(-1) !== 's' || word.slice(-2) === 'ss' || word.slice(-2) === 'us' || word.slice(-2) === 'is') return false
  return !!verbBase(word)
}

function tagWord(word) {
  if (!word) return 'NN'
  if (DETERMINERS.has(word)) return 'DT'
  if (PRONOUNS.has(word)) return 'PRP'
  if (BE_FORMS_SET.has(word)) return 'BE'
  if (DO_FORMS_SET.has(word)) return 'DO'
  if (HAVE_FORMS_SET.has(word)) return 'HV'
  if (MODALS.has(word)) return 'MD'
  if (isAdjective(word)) return 'JJ'
  if (isPastTense(word)) return 'VBD'
  if (isThirdPersonVerb(word)) return 'VBZ'
  if (word.length > 4 && word.slice(-3) === 'ing') return 'VBG'
  if (verbBase(word)) return 'VBP'
  if (PREPOSITIONS.has(word)) return 'IN'
  if (ADVERBS.has(word) || (word.length > 4 && word.slice(-2) === 'ly')) return 'RB'
  if (word.length > 3 && word.slice(-1) === 's' && word.slice(-2) !== 'ss') return 'NNS'
  return 'NN'
}

// 把答案与参考译文中相同的词对齐，返回 [参考下标, 答案下标] 列表
function alignIndexes(a, b) {
  const n = a.length
  const m = b.length
  if (!n || !m) return []
  const dp = []
  for (let i = 0; i <= n; i += 1) dp.push(new Array(m + 1).fill(0))
  for (let i = 1; i <= n; i += 1) {
    for (let j = 1; j <= m; j += 1) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  const pairs = []
  let i = n
  let j = m
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      pairs.push([i - 1, j - 1])
      i -= 1
      j -= 1
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i -= 1
    } else {
      j -= 1
    }
  }
  return pairs.reverse()
}

// 时态对齐：参考译文用过去式，答案同一位置写成原形或第三人称单数
function checkTenseForm(reference, answer) {
  const refWords = tokenize(reference)
  const ansWords = tokenize(answer)
  const refTags = refWords.map(tagWord)
  const ansTags = ansWords.map(tagWord)
  const pairs = alignIndexes(refWords.map(lemma), ansWords.map(lemma))
  logRule('tense', {
    refWords,
    refTags,
    ansWords,
    ansTags,
    // 对齐结果压成 "参考词/标签->答案词/标签"，方便一眼看出被比较的是哪两个词
    pairs: pairs.map(([i, j]) => `${refWords[i]}/${refTags[i]}->${ansWords[j]}/${ansTags[j]}`)
  })
  for (let k = 0; k < pairs.length; k += 1) {
    const i = pairs[k][0]
    const j = pairs[k][1]
    if (refTags[i] !== 'VBD') continue
    if (ansTags[j] !== 'VBP' && ansTags[j] !== 'VBZ') {
      logRule('tense-skip', {
        ref: refWords[i], refTag: refTags[i], ans: ansWords[j], ansTag: ansTags[j],
        reason: 'answer-not-base-or-third-person'
      })
      continue
    }
    const before = ansWords.slice(Math.max(0, j - 2), j)
    if (before.some((word) => MODALS.has(word) || BE_FORMS_SET.has(word)
      || DO_FORMS_SET.has(word) || HAVE_FORMS_SET.has(word) || word === 'to')) {
      logRule('tense-skip', {
        ref: refWords[i], ans: ansWords[j], before, reason: 'auxiliary-or-infinitive-before-verb'
      })
      continue
    }
    logRule('tense-hit', {
      ref: refWords[i], refTag: refTags[i], ans: ansWords[j], ansTag: ansTags[j], before,
      rule: 'reference-past-answer-base'
    })
    return fail('这句该用过去式，检查一下动词是不是写成了原形或第三人称单数。', RULE_TIPS.tense)
  }
  // 词形变化对不上（ask / asked）时，退一步看整句：参考用了过去式，答案一个过去式都没有
  if (refTags.indexOf('VBD') >= 0 && ansTags.indexOf('VBD') < 0
    && (ansTags.indexOf('VBP') >= 0 || ansTags.indexOf('VBZ') >= 0)) {
    logRule('tense-hit', {
      reason: 'no-past-in-answer', refWords, ansWords, refTags, ansTags
    })
    return fail('这句该用过去式，检查一下动词是不是写成了原形或第三人称单数。', RULE_TIPS.tense)
  }
  logRule('tense-pass', { refHasPast: refTags.indexOf('VBD') >= 0, ansHasPast: ansTags.indexOf('VBD') >= 0 })
  return null
}

// 主谓一致：参考译文动词是三单，答案同一个动词写成原形，且前面没有助动词
function checkAgreement(reference, answer) {
  const refWords = tokenize(reference)
  const ansWords = tokenize(answer)
  const refTags = refWords.map(tagWord)
  const ansTags = ansWords.map(tagWord)
  const pairs = alignIndexes(refWords.map(lemma), ansWords.map(lemma))
  for (let k = 0; k < pairs.length; k += 1) {
    const i = pairs[k][0]
    const j = pairs[k][1]
    if (refTags[i] !== 'VBZ' || ansTags[j] !== 'VBP') continue
    const before = ansWords.slice(Math.max(0, j - 2), j)
    if (before.some((word) => MODALS.has(word) || BE_FORMS_SET.has(word)
      || DO_FORMS_SET.has(word) || HAVE_FORMS_SET.has(word) || word === 'to')) {
      logRule('agreement-skip', {
        ref: refWords[i], ans: ansWords[j], before, reason: 'auxiliary-or-infinitive-before-verb'
      })
      continue
    }
    if (j === 0) {
      logRule('agreement-skip', { ref: refWords[i], ans: ansWords[j], reason: 'no-subject-before-verb' })
      continue
    }
    const subject = ansWords[j - 1]
    if (subject === 'i' || subject === 'you' || subject === 'we' || subject === 'they') {
      logRule('agreement-skip', { ref: refWords[i], ans: ansWords[j], subject, reason: 'plural-pronoun-subject' })
      continue
    }
    if (subject.length > 3 && subject.slice(-1) === 's' && subject.slice(-2) !== 'ss') {
      logRule('agreement-skip', { ref: refWords[i], ans: ansWords[j], subject, reason: 'plural-noun-subject' })
      continue
    }
    logRule('agreement-hit', {
      ref: refWords[i], refTag: refTags[i], ans: ansWords[j], ansTag: ansTags[j], subject,
      rule: 'reference-third-person-answer-base'
    })
    return fail('主语是第三人称单数时，动词要加 -s，检查一下主谓一致。', RULE_TIPS.agreement)
  }
  logRule('agreement-pass', { refHasThirdPerson: refTags.indexOf('VBZ') >= 0 })
  return null
}

// 情态动词后面必须接动词原形，must submitted / should finished 这类直接拦下
function checkModalVerb(reference, answer) {
  const ansWords = tokenize(answer)
  for (let i = 0; i < ansWords.length - 1; i += 1) {
    if (!MODALS.has(ansWords[i])) continue
    const nextTag = tagWord(ansWords[i + 1])
    logRule('modal', { index: i, modal: ansWords[i], next: ansWords[i + 1], nextTag })
    if (nextTag === 'VBD') {
      logRule('modal-hit', { modal: ansWords[i], next: ansWords[i + 1], nextTag })
      return fail('情态动词后面要用动词原形，检查一下 must / should / can 后面那个动词。', RULE_TIPS.modal)
    }
  }
  return null
}

// ---------- 限定词高置信子集：只查 a / an / the + 单数名词、many + 复数名词 ----------

const ARTICLE_DETERMINERS = new Set(['a', 'an', 'the'])
const QUANTITY_DETERMINERS = new Set(['many'])

// 答案里名词前出现这些词，就认为限定词没有丢
const DETERMINER_WORDS = new Set([
  ...DETERMINERS,
  'many', 'much', 'few', 'little', 'several', 'more', 'most', 'other', 'same',
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'hundred', 'thousand', 'million', 'first', 'second', 'third', 'last', 'next',
  'all', 'both', 'half', 'own'
])

// many 分支：名词前 3 个词内出现这些词，就算保留了数量限定
const QUANTITY_WORDS = new Set([
  'many', 'much', 'few', 'little', 'several', 'some', 'any', 'numerous', 'plenty',
  'lot', 'lots', 'number', 'dozens', 'hundreds', 'thousands', 'more', 'most',
  'all', 'both', 'half', 'couple'
])

// 本身是复数、但词形不带 -s 的名词
const IRREGULAR_PLURALS = new Set([
  'people', 'children', 'men', 'women', 'teeth', 'feet', 'mice', 'geese', 'police'
])

// 这些名词在固定搭配里本来就可以不加冠词，直接跳过避免误伤
const BARE_NOUN_EXCEPTIONS = new Set([
  'school', 'hospital', 'church', 'prison', 'bed', 'home', 'work', 'college',
  'university', 'class', 'court', 'sea', 'town', 'market', 'camp', 'breakfast',
  'lunch', 'dinner', 'night', 'day', 'summer', 'winter', 'spring', 'autumn'
])

// 不可数名词：加不加冠词都可能合法，不纳入判定
const UNCOUNTABLE_NOUNS = new Set([
  'information', 'advice', 'news', 'music', 'research', 'evidence', 'equipment',
  'furniture', 'luggage', 'baggage', 'homework', 'money', 'water', 'food', 'time',
  'experience', 'knowledge', 'education', 'health', 'weather', 'traffic', 'progress',
  'practice', 'life', 'art', 'history', 'science', 'literature', 'vocabulary',
  'grammar', 'language', 'english', 'chinese', 'reading', 'writing', 'listening',
  'speaking', 'training', 'shopping', 'swimming'
])

function hasQuantityBefore(words, index) {
  for (let k = Math.max(0, index - 3); k < index; k += 1) {
    if (QUANTITY_WORDS.has(words[k])) return true
  }
  return false
}

// 收集参考译文里带 a / an / the 的单数名词和带 many 的复数名词
function collectDeterminerTargets(refWords, refTags) {
  const targets = []
  for (let i = 0; i < refWords.length; i += 1) {
    const nounTag = refTags[i]
    const irregularPlural = IRREGULAR_PLURALS.has(refWords[i])
    if (nounTag !== 'NN' && nounTag !== 'NNS' && !irregularPlural) continue
    if (UNCOUNTABLE_NOUNS.has(refWords[i])) continue
    let k = i - 1
    while (k >= 0 && (refTags[k] === 'JJ' || refTags[k] === 'RB')) k -= 1
    if (k < 0) continue
    const determiner = refWords[k]
    if (ARTICLE_DETERMINERS.has(determiner) && nounTag === 'NN' && !irregularPlural) {
      targets.push({ noun: refWords[i], determiner, nounTag })
    } else if (QUANTITY_DETERMINERS.has(determiner) && (nounTag === 'NNS' || irregularPlural)) {
      targets.push({ noun: refWords[i], determiner, nounTag })
    }
  }
  return targets
}

// 答案里同一个名词前面既没有冠词也没有数量词，才算漏限定词
function checkMissingDeterminer(reference, answer) {
  const refWords = tokenize(reference)
  const refTags = refWords.map(tagWord)
  const targets = collectDeterminerTargets(refWords, refTags)
  logRule('determiner', { targets })
  if (!targets.length) return null

  const ansWords = tokenize(answer)
  const ansTags = ansWords.map(tagWord)
  for (let j = 0; j < ansWords.length; j += 1) {
    const word = ansWords[j]
    const tag = ansTags[j]
    const plural = tag === 'NNS' || IRREGULAR_PLURALS.has(word)
    if (tag !== 'NN' && !plural) continue
    if (UNCOUNTABLE_NOUNS.has(word) || BARE_NOUN_EXCEPTIONS.has(word)) continue
    const target = targets.find((item) => sameStem(item.noun, word))
    if (!target) continue
    let k = j - 1
    while (k >= 0 && (ansTags[k] === 'JJ' || ansTags[k] === 'RB')) k -= 1
    const previous = k >= 0 ? ansWords[k] : ''
    if (previous && DETERMINER_WORDS.has(previous)) {
      logRule('determiner-ok', { word, previous, determiner: target.determiner })
      continue
    }
    if (target.determiner === 'many') {
      if (!plural) continue
      if (hasQuantityBefore(ansWords, j)) {
        logRule('determiner-ok', { word, reason: 'quantity-present', determiner: 'many' })
        continue
      }
      logRule('determiner-hit', { word, determiner: 'many', previous, reason: 'quantity-missing' })
      return fail('参考译文里的这个名词带 many，答案里没有体现数量，检查一下是不是漏了限定词。', RULE_TIPS.quantity)
    }
    if (tag !== 'NN') continue
    logRule('determiner-hit', { word, determiner: target.determiner, previous, reason: 'article-missing' })
    return fail('这个单数名词前面缺少 a / an / the，检查一下名词短语是否完整。', RULE_TIPS.determiner)
  }
  logRule('determiner-pass', {})
  return null
}

// ---------- 句子完整性：没写完的句子不能算通过 ----------

// 完整的英语句子不会以这些词收尾：冠词、并列/从属连词、介词、助动词
// 只要答案结尾停在这里，说明后面还有成分没写，直接判未完成
const DANGLING_END_WORDS = new Set([
  'a', 'an', 'the',
  'and', 'or', 'but', 'nor',
  'of', 'to', 'from', 'with', 'about', 'into', 'through', 'across', 'along',
  'between', 'among', 'during', 'without', 'within', 'against', 'toward',
  'towards', 'upon', 'despite', 'via', 'beneath', 'underneath', 'except',
  'besides', 'throughout', 'regarding', 'concerning', 'including',
  'whether', 'what', 'which', 'who', 'whom', 'whose', 'because', 'although',
  'though', 'if', 'whenever', 'wherever', 'whereas', 'unless',
  'is', 'am', 'are', 'was', 'were', 'been', 'being',
  'do', 'does', 'did', 'have', 'has', 'had',
  'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must',
  'ought'
])

function checkIncompleteEnd(answer) {
  const words = tokenize(answer)
  if (!words.length) return null
  const last = words[words.length - 1]
  logRule('incomplete', { last, dangling: DANGLING_END_WORDS.has(last) })
  if (!DANGLING_END_WORDS.has(last)) return null
  logRule('incomplete-hit', { last, reason: 'dangling-ending' })
  return fail('句子还没写完，结尾停在一个不能结束句子的词上，把后面的成分补上再提交。', RULE_TIPS.incomplete)
}

// 只写了半句的典型形态：答案正好是参考答案的前缀，比例指标刚好压线通过
// 这里用「参考译文最后一个实词必须被答案覆盖」兜底
// 只在答案比参考译文更短时才查，避免把「works → is effective」这类同义改写误判成没写完
function checkTailCoverage(reference, answer) {
  const refWords = tokenize(reference)
  const ansWords = tokenize(answer)
  if (ansWords.length >= refWords.length) {
    logRule('tail-skip', { reason: 'answer-not-shorter', refLength: refWords.length, ansLength: ansWords.length })
    return null
  }
  const refContent = contentWords(refWords)
  if (!refContent.length) return null
  const tail = refContent[refContent.length - 1]
  const answerContent = contentWords(ansWords)
  const covered = answerContent.some((word) => sameStem(tail, word)
    || sameStem(lemma(tail), lemma(word)))
  logRule('tail', { tail, answerContent, covered })
  if (covered) return null
  logRule('tail-hit', { tail, answerContent, reason: 'reference-tail-missing' })
  return fail('句子只写了前半段，题目里最后那部分信息还没有表达出来。', RULE_TIPS.tail)
}

// whether / if 引导的从句：必须自带谓语，且要用陈述语序
function checkWhetherClause(answer) {
  const words = tokenize(answer)
  const tags = words.map(tagWord)
  for (let i = 0; i < words.length; i += 1) {
    const connector = words[i]
    if (connector !== 'whether' && connector !== 'if') continue
    const rest = words.slice(i + 1)
    if (!rest.length) {
      logRule('clause-hit', { connector, reason: 'connector-at-end' })
      return fail('句子还没写完：whether / if 后面还要接一个完整的从句。', RULE_TIPS['clause-predicate'])
    }
    const firstTag = tags[i + 1]
    const secondTag = i + 2 < tags.length ? tags[i + 2] : ''
    // 助动词紧跟连接词、后面又是主语，说明写成了疑问句语序
    const auxFirst = firstTag === 'BE' || firstTag === 'DO' || firstTag === 'HV' || firstTag === 'MD'
    const subjectNext = secondTag === 'PRP' || secondTag === 'DT'
    logRule('clause', {
      connector, first: words[i + 1], firstTag, second: words[i + 2] || '', secondTag,
      auxFirst, subjectNext
    })
    if (auxFirst && subjectNext) {
      logRule('clause-hit', { connector, reason: 'interrogative-order' })
      return fail('whether / if 引导的从句要用陈述语序：主语在前、动词在后，不要把助动词提到主语前面。', RULE_TIPS.clause)
    }
    // that 与 whether / if 叠加：同一个从句被两个引导词带。
    // 从句后面如果还有第二个谓语（I know that whether he comes is important），
    // 说明 that 带的是更高一层，属于合法嵌套，这里放过。
    const prevThat = words.lastIndexOf('that', i)
    const between = prevThat >= 0 ? words.slice(prevThat + 1, i) : []
    if (prevThat >= 0 && !between.some((word) => isVerbLike(word))
      && countPredicateGroups(tags.slice(i + 1)) <= 1) {
      logRule('clause-hit', { connector, prevThat, between, reason: 'double-conjunction' })
      return fail('that 和 whether 叠在同一个从句里了，两个引导词只能留一个：去掉 that，让 whether 直接引导后面的从句。', RULE_TIPS['clause-subject'])
    }
    // 从句一开头就是谓语：这个从句根本没有主语
    if (PREDICATE_TAGS.has(firstTag)) {
      logRule('clause-hit', {
        connector, first: words[i + 1], firstTag, reason: 'clause-without-subject'
      })
      return fail('whether / if 后面这个从句缺少主语，不能直接接 is / are / does 这类动词。', RULE_TIPS['clause-subject'])
    }
    if (!rest.some((word) => isVerbLike(word))) {
      logRule('clause-hit', { connector, rest, reason: 'clause-without-predicate' })
      return fail('whether / if 后面这个从句还不完整，缺少它自己的谓语动词。', RULE_TIPS['clause-predicate'])
    }
    // whether + 不定式（whether to do）本身没有主语，不做骨架比对
    if (rest[0] === 'to') {
      logRule('clause-skip', { connector, reason: 'infinitive' })
      continue
    }
    // 从句骨架：主语要在谓语前面（whether work this method 这类语序要拦下）
    const clauseSubject = findSubjectIndex(rest, tags.slice(i + 1))
    const clausePredicate = findPredicateIndex(tags.slice(i + 1))
    logRule('clause-skeleton', { connector, rest, clauseSubject, clausePredicate })
    if (clauseSubject >= 0 && clausePredicate >= 0 && clausePredicate < clauseSubject) {
      logRule('clause-hit', { connector, rest, reason: 'predicate-before-subject' })
      return fail('whether / if 从句里要把主语放在谓语前面，不能倒过来写。', RULE_TIPS.clause)
    }
  }
  return null
}

// ---------- 句子骨架比对：只看主谓宾与从句骨架，忽略状语位置 ----------
// 逐词比词序时，状语一挪、同义词一换就掉分；这里改成比「骨架」：
// 主语和谓语谁在前、主干中间有没有被介词短语切开。修饰语位置完全不影响判定。

const PREDICATE_TAGS = new Set(['BE', 'DO', 'HV', 'MD', 'VBD', 'VBZ', 'VBP'])

// 只有主格代词能做主语，me / him / us / them 这类宾格代词不能
const SUBJECT_PRONOUNS = new Set(['i', 'you', 'he', 'she', 'it', 'we', 'they', 'there', 'who'])

// 第一个主语候选：主格代词，或「限定词 + （形容词）+ 名词」的开头
function findSubjectIndex(words, tags) {
  for (let i = 0; i < words.length; i += 1) {
    if (tags[i] === 'PRP') {
      if (SUBJECT_PRONOUNS.has(words[i])) return i
      continue
    }
    if (tags[i] !== 'DT') continue
    for (let k = i + 1; k < Math.min(tags.length, i + 4); k += 1) {
      if (tags[k] === 'JJ') continue
      if (tags[k] === 'NN' || tags[k] === 'NNS') return i
      break
    }
  }
  return -1
}

// 第一个谓语（系动词 / 助动词 / 情态动词 / 实义动词）
function findPredicateIndex(tags) {
  for (let i = 0; i < tags.length; i += 1) {
    if (PREDICATE_TAGS.has(tags[i])) return i
  }
  return -1
}

// 谓语组数：情态动词和它后面的原形算同一组（will come 只算一个谓语）
function countPredicateGroups(tags) {
  let groups = 0
  for (let i = 0; i < tags.length; i += 1) {
    if (!PREDICATE_TAGS.has(tags[i])) continue
    if (i > 0 && tags[i - 1] === 'MD') continue
    groups += 1
  }
  return groups
}

// 句首倒装标志词：这样开头时主谓倒置是合法的，交给 checkInversion 单独判定
const INVERSION_HEADS = new Set(['so', 'never', 'hardly', 'scarcely', 'seldom', 'little'])

function startsWithInversion(words) {
  const head = words[0] || ''
  if (INVERSION_HEADS.has(head)) return true
  if (head === 'not' && (words[1] === 'only' || words[1] === 'until')) return true
  if (head === 'only' && (words[1] === 'when' || words[1] === 'after' || words[1] === 'if')) return true
  if (head === 'no' && words[1] === 'sooner') return true
  return false
}

// 主谓顺序：答案把谓语提到主语前面，而参考译文是正常语序，判错
// 参考译文本身是倒装（Not only is he …）时两边都倒，自动放行
function checkSubjectVerbOrder(reference, answer) {
  const refWords = tokenize(reference)
  const refTags = refWords.map(tagWord)
  const refSubject = findSubjectIndex(refWords, refTags)
  const refPredicate = findPredicateIndex(refTags)

  const words = tokenize(answer)
  const tags = words.map(tagWord)
  const subject = findSubjectIndex(words, tags)
  const predicate = findPredicateIndex(tags)
  logRule('skeleton-subject', {
    answer: words, subject, predicate,
    answerWord: subject >= 0 ? words[subject] : '',
    predicateWord: predicate >= 0 ? words[predicate] : '',
    refSubject, refPredicate
  })
  if (subject < 0 || predicate < 0) return null
  // 句首倒装（So complex is …）不算语序错
  if (startsWithInversion(words)) {
    logRule('skeleton-skip', { reason: 'answer-starts-with-inversion' })
    return null
  }
  // 参考译文本身不是「主语在前」的语序，说明这题就考倒装，不做主谓顺序判定
  if (refSubject < 0 || refPredicate < 0 || refPredicate < refSubject) {
    logRule('skeleton-skip', { reason: 'reference-not-subject-first' })
    return null
  }
  if (predicate < subject) {
    logRule('skeleton-hit', { reason: 'predicate-before-subject' })
    return fail('主语和谓语的顺序反了，陈述句要把主语放在谓语前面。', RULE_TIPS.subjectOrder)
  }
  return null
}

// 主干连续性：主语和谓语之间被介词短语切开，判错
function checkDiscontinuousSubject(reference, answer) {
  const refWords = tokenize(reference)
  const refTags = refWords.map(tagWord)
  const refSubject = findSubjectIndex(refWords, refTags)
  const refPredicate = findPredicateIndex(refTags)
  if (refSubject < 0 || refPredicate < 0 || refPredicate < refSubject) return null

  const words = tokenize(answer)
  const tags = words.map(tagWord)
  const subject = findSubjectIndex(words, tags)
  const predicate = findPredicateIndex(tags)
  if (subject < 0 || predicate < 0 || predicate <= subject) return null
  const between = words.slice(subject + 1, predicate)
  const hasPreposition = between.some((word) => PREPOSITIONS.has(word))
  logRule('skeleton-gap', {
    subject: words[subject], predicate: words[predicate], between, hasPreposition
  })
  if (!hasPreposition) return null
  logRule('skeleton-hit', { reason: 'preposition-between-subject-and-verb' })
  return fail('主语和谓语之间插进了介词短语，句子主干要连在一起写。', RULE_TIPS.subjectGap)
}

// 常见倒装位置：Not only / So + 形容词 / Not until 提到句首时的助动词位置
function checkInversion(reference, answer) {
  const refLower = String(reference || '').toLowerCase()
  const lower = String(answer || '').trim().toLowerCase()
  if (!lower) return null

  if (/^not only\b/.test(lower)) {
    const next = lower.replace(/^not only\s+/, '').split(/\s+/)[0] || ''
    const nextIsAux = AUXILIARIES.has(canonical(next))
    logRule('inversion', { branch: 'not-only', next, nextIsAux })
    if (!nextIsAux) {
      logRule('inversion-hit', { branch: 'not-only', next, reason: 'auxiliary-not-fronted' })
      return fail('Not only 放在句首时，主语和助动词要倒装，比如 Not only is …。', RULE_TIPS.inversion)
    }
  }

  const soHead = /\bso\s+[a-z'-]+\s+that\b/.test(refLower)
  if (soHead) {
    const soPattern = /^so\s+[a-z'-]+\s+(the|this|that|these|those|my|your|his|her|its|our|their|he|she|it|they|we|i)(\s+\w+)?\s+(am|is|are|was|were|do|does|did|have|has|had|can|could|will|would|should)\b/
    const matched = soPattern.test(lower)
    logRule('inversion', { branch: 'so-head', head: lower.slice(0, 40), matched })
    if (matched) {
      logRule('inversion-hit', { branch: 'so-head', reason: 'subject-before-be' })
      return fail('So + 形容词放在句首时，be 动词或助动词要提到主语前面。', RULE_TIPS.inversion)
    }
  }

  if (/^not until\b/.test(lower) && /\bnot until\b/.test(refLower)) {
    const comma = lower.indexOf(',')
    if (comma >= 0) {
      const main = lower.slice(comma + 1).trim()
      const firstWord = main.split(/\s+/)[0] || ''
      const mainStartsAux = firstWord ? AUXILIARIES.has(canonical(firstWord)) : false
      logRule('inversion', { branch: 'not-until', firstWord, mainStartsAux })
      if (firstWord && !mainStartsAux) {
        logRule('inversion-hit', { branch: 'not-until', firstWord, reason: 'main-clause-not-inverted' })
        return fail('Not until 放在句首时，主句要倒装：助动词在前，主语在后。', RULE_TIPS.inversion)
      }
    } else {
      logRule('inversion-skip', { branch: 'not-until', reason: 'no-comma' })
    }
  }
  logRule('inversion-pass', { head: lower.slice(0, 40) })
  return null
}

// so…that 结构：so 后面必须跟形容词或副词，不能直接接 that
function checkSoThat(reference, answer) {
  const refSoAdj = /\bso\s+[a-z'-]+\s+that\b/i.test(reference)
  logRule('so-that', { refSoAdj, reference })
  if (!refSoAdj) {
    logRule('so-that-skip', { reason: 'reference-not-so-adj-that' })
    return null
  }
  const ansSoAdj = /\bso\s+[a-z'-]+\s+that\b/i.test(answer)
  const ansSoThat = /\bso\s+that\b/i.test(answer)
  logRule('so-that', { ansSoAdj, ansSoThat })
  if (ansSoThat && !ansSoAdj) {
    logRule('so-that-hit', { reason: 'so-directly-followed-by-that' })
    return fail('这里的 so…that 表示“如此……以至于”，so 后面要接形容词或副词，不能直接接 that。', RULE_TIPS.soThat)
  }
  return null
}

function evaluateZhenToEn(raw, question) {
  const letters = (raw.match(/[a-zA-Z]/g) || []).length
  const chinese = cjkChars(raw).length
  if (letters < 3) return fail('答案太短了，先用英文写出一个完整句子。', RULE_TIPS.incomplete)
  if (chinese >= letters) return fail('请用英文作答，不要写中文。')

  const reference = typeof question.reference === 'string' ? question.reference.trim() : ''
  if (!reference) return evaluateLegacy(raw, question)

  const tokens = tokenize(raw).map(canonical)
  const referenceTokens = tokenize(reference).map(canonical)
  const minWords = Math.max(4, Math.ceil(referenceTokens.length * ZH2EN_MIN_WORD_RATIO))
  if (tokens.length < minWords) {
    return fail('句子信息太少，题目里的主干内容还没有表达完整。', RULE_TIPS.info)
  }

  // 没写完的句子先拦掉，避免「答案正好是参考答案前缀」时比例指标压线通过
  const incomplete = checkIncompleteEnd(raw)
  if (incomplete) return incomplete

  const keywordPhrases = (Array.isArray(question.keywords) ? question.keywords : [])
    .map((keyword) => tokenize(keyword).map(canonical))
    .filter((phrase) => phrase.length)
  const missingStructure = keywordPhrases.some((phrase) => {
    const variants = PHRASE_LOOKUP[phrase.join(' ')] || [phrase]
    return !variants.some((variant) => findPhraseFrom(tokens, variant, 0) >= 0)
  })
  if (missingStructure) {
    return fail('这个语法点的固定结构还没有完整写出来，回到语法卡看看它由哪几部分组成。', RULE_TIPS.order)
  }

  if (!tokens.some(isVerbLike)) {
    return fail('句子缺少谓语动词，先补上完整的主谓结构。', RULE_TIPS.incomplete)
  }

  // 参考译文与答案都出现 be 动词时，检查单复数是否一致（中文原题看不出时态，不判时态）
  const referenceSurface = tokenize(reference)
  const answerSurface = tokenize(raw)
  const referenceBe = referenceSurface.filter((word) => BE_FORMS[word])
  const answerBe = answerSurface.filter((word) => BE_FORMS[word])
  if (referenceBe.length && answerBe.length
    && !answerBe.some((word) => referenceBe.indexOf(word) >= 0)) {
    const referencePast = referenceBe.some((word) => word === 'was' || word === 'were')
    const answerPast = answerBe.some((word) => word === 'was' || word === 'were')
    if (referencePast === answerPast) {
      return fail('be 动词的单复数要和主语保持一致，检查一下主谓搭配。', RULE_TIPS.agreement)
    }
  }

  const referenceContent = contentWords(referenceTokens)
  const answerContent = contentWords(tokens)
  if (coverage(referenceContent, answerContent) < ZH2EN_MIN_COVERAGE) {
    return fail('句子意思和题目差距较大，先想清楚主干信息，再把细节补上。', RULE_TIPS.info)
  }

  const partial = checkTailCoverage(reference, raw)
  if (partial) return partial

  const clauseIssue = checkWhetherClause(raw)
  if (clauseIssue) return clauseIssue

  // 骨架比对：主谓顺序与主干连续性
  const skeletonIssue = checkSubjectVerbOrder(reference, raw)
    || checkDiscontinuousSubject(reference, raw)
  if (skeletonIssue) return skeletonIssue

  if (orderRatio(referenceTokens, tokens) < ZH2EN_MIN_ORDER
    || pairCoverage(referenceTokens, tokens) < ZH2EN_MIN_PAIR) {
    return fail('句子成分的语序和这个句型不匹配，先把主语、谓语和结构部分按顺序摆好。', RULE_TIPS.order)
  }

  // 词性小规则：只拦高置信度的时态、主谓一致、冠词、倒装问题，拿不准就不判错
  logRule('grammar-start', { id: question.id || '', reference, answer: raw })
  const grammarIssue = checkTenseForm(reference, raw)
    || checkModalVerb(reference, raw)
    || checkAgreement(reference, raw)
    || checkMissingDeterminer(reference, raw)
    || checkInversion(reference, raw)
    || checkSoThat(reference, raw)
  if (grammarIssue) {
    logRule('grammar-hit', { id: question.id || '', feedback: grammarIssue.feedback })
    return grammarIssue
  }
  logRule('grammar-pass', { id: question.id || '' })

  return pass('结构用对了，整句意思也完整，这个句型你已经会用。')
}

function evaluateEnToZh(raw, question) {
  const chinese = cjkChars(raw).length
  const letters = (raw.match(/[a-zA-Z]/g) || []).length
  if (chinese < 4 || letters > chinese) {
    return fail('请用中文写出译文，不要直接抄英文原句。')
  }

  const reference = typeof question.reference === 'string' ? question.reference.trim() : ''
  if (!reference) return evaluateLegacy(raw, question)

  const referenceChars = cjkChars(reference).length
  const minChars = Math.max(6, Math.ceil(referenceChars * EN2ZH_MIN_CHAR_RATIO))
  if (chinese < minChars) {
    return fail('译文信息太少，原句里的内容还没有译完整。')
  }

  const overlap = bigramCoverage(reference, raw)
  if (overlap < EN2ZH_MIN_BIGRAM) {
    return fail('译文和原句的意思有偏差，先找准主干，再按中文语序重新组织。')
  }

  if (overlap < EN2ZH_STRONG_BIGRAM) {
    // 只保留确实出现在参考译文里的关键词，避免旧数据里的错误关键词造成误判
    const compactReference = reference.replace(/\s+/g, '')
    const compactAnswer = raw.replace(/\s+/g, '')
    const keywords = (Array.isArray(question.keywords) ? question.keywords : [])
      .map((keyword) => String(keyword || '').replace(/[^\u4e00-\u9fa5]/g, ''))
      .filter((keyword) => keyword.length >= 2 && compactReference.indexOf(keyword) >= 0)
    if (keywords.length) {
      const hit = keywords.filter((keyword) => compactAnswer.indexOf(keyword) >= 0).length
      if (hit / keywords.length < EN2ZH_MIN_KEYWORD_RATIO) {
        return fail('原句里的主要信息点还没有译出来，先找准主干再组织中文。')
      }
    }
  }

  return pass('原句的主要信息都译出来了，整句理解到位。')
}

function evaluate(question = {}, answer = '') {
  const mode = question.mode === 'en2zh' ? 'en2zh' : 'zh2en'
  const raw = typeof answer === 'string' ? answer.trim() : ''
  if (!raw) return { result: 'pending', feedback: '暂未判定：请先写下你的翻译。', tip: '', rule: '', mode }
  const outcome = mode === 'en2zh'
    ? evaluateEnToZh(raw, question)
    : evaluateZhenToEn(raw, question)
  // tip 只在失败时给，内容是这条语法的正确写法，不含本题答案用词；
  // rule 是错误类型 key，前端据此做重写循环，学习报告据此做错误分布统计。
  const tip = outcome.tip || ''
  return {
    result: outcome.result,
    feedback: outcome.feedback,
    tip,
    rule: RULE_BY_TIP[tip] || '',
    mode
  }
}

module.exports = {
  evaluate,
  RULE_TIPS,
  tokenize,
  canonical,
  sameStem,
  coverage,
  pairCoverage,
  orderRatio,
  bigramCoverage
}
