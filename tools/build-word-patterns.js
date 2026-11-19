// 生成 miniprogram/pkgWords/data/wordPatterns.js：单词的常用搭配 / 句型。
// 词组本里不再收「strive to do sth」这类句型，它们统一挂到单词卡上。
// 用法：node tools/build-word-patterns.js
const fs = require('fs')
const path = require('path')
const GLOSS = require('./word-pattern-gloss')
const ROOT = path.join(__dirname, '..')
const TARGET = path.join(ROOT, 'miniprogram/pkgWords/data/wordPatterns.js')

// 动词句型
const VERB_TO_DO = `afford agree aim appear arrange attempt choose decide demand deserve determine
expect fail happen hesitate hope intend learn long manage mean need offer plan prepare pretend promise
refuse resolve seem strive tend threaten want wish claim consent decline volunteer yearn opt`.trim().split(/\s+/)

const VERB_DOING = `admit appreciate avoid consider delay deny enjoy escape excuse fancy finish imagine
involve keep mention mind miss postpone practise practice prevent quit recommend report resist resume
risk suggest tolerate understand advocate anticipate`.trim().split(/\s+/)

const VERB_SB_TO_DO = `advise allow ask beg cause command encourage expect forbid force instruct invite
order permit persuade remind request require teach tell urge want warn enable entitle inspire motivate
oblige prompt train trust compel drive empower press lead`.trim().split(/\s+/)

const VERB_SB_BARE = `have make let help notice observe see watch hear feel`.trim().split(/\s+/)

const VERB_SB_DOING = `see watch hear notice observe feel find catch keep leave set send start get`.trim().split(/\s+/)

const VERB_FROM_DOING = `prevent stop keep discourage prohibit ban hinder restrain protect save deter
excuse exempt`.trim().split(/\s+/)

const VERB_SB_OF = `accuse suspect convict acquit cure deprive inform remind rob warn convince notify
reassure strip clear`.trim().split(/\s+/)

const VERB_SB_FOR = `blame thank praise punish scold forgive admire compensate criticize reward`.trim().split(/\s+/)

const VERB_SB_WITH = `charge provide supply equip furnish present credit burden confront arm infect
satisfy reward`.trim().split(/\s+/)

const VERB_STH_TO_SB = `give offer show send lend hand pass bring take tell teach promise award grant
owe mail deliver introduce recommend explain describe suggest`.trim().split(/\s+/)

const VERB_SB_STH = `give offer show send lend hand pass bring take tell teach promise award grant owe
mail deliver`.trim().split(/\s+/)

// 固定介词搭配：动词
const VERB_PREP = {
  depend: ['depend on sb/sth'],
  rely: ['rely on sb/sth'],
  insist: ['insist on doing sth'],
  object: ['object to doing sth'],
  refer: ['refer to sb/sth'],
  result: ['result in sth', 'result from sth'],
  lead: ['lead to sth'],
  contribute: ['contribute to sth'],
  consist: ['consist of sth'],
  deal: ['deal with sth'],
  cope: ['cope with sth'],
  focus: ['focus on sth'],
  concentrate: ['concentrate on sth'],
  benefit: ['benefit from sth'],
  suffer: ['suffer from sth'],
  adapt: ['adapt to sth'],
  adjust: ['adjust to sth'],
  devote: ['devote oneself to sth'],
  dedicate: ['dedicate oneself to sth'],
  attribute: ['attribute sth to sth'],
  compare: ['compare A with B', 'compare A to B'],
  replace: ['replace A with B'],
  substitute: ['substitute A for B'],
  charge: ['charge sb with sth', 'charge sb for sth'],
  apply: ['apply for sth', 'apply to sb/sth'],
  account: ['account for sth'],
  approve: ['approve of sth'],
  believe: ['believe in sth'],
  belong: ['belong to sb/sth'],
  care: ['care about sb/sth', 'care for sb'],
  count: ['count on sb/sth'],
  engage: ['engage in sth'],
  look: ['look after sb/sth', 'look into sth', 'look forward to doing sth'],
  make: ['make up for sth'],
  pay: ['pay for sth'],
  point: ['point out sth'],
  put: ['put up with sb/sth'],
  run: ['run out of sth'],
  take: ['take advantage of sth', 'take care of sb/sth'],
  think: ['think of sth', 'think about sth'],
  wait: ['wait for sb/sth'],
  worry: ['worry about sb/sth'],
  work: ['work on sth'],
  agree: ['agree to do sth', 'agree on sth'],
  aim: ['aim at sth'],
  apologize: ['apologize to sb for sth'],
  arrive: ['arrive at/in a place'],
  ask: ['ask for sth'],
  complain: ['complain about sth'],
  comply: ['comply with sth'],
  conform: ['conform to sth'],
  contrast: ['contrast with sth'],
  cooperate: ['cooperate with sb'],
  differ: ['differ from sth'],
  distinguish: ['distinguish between A and B', 'distinguish A from B'],
  dream: ['dream of doing sth'],
  escape: ['escape from sth'],
  excel: ['excel at/in sth'],
  experiment: ['experiment with sth'],
  feed: ['feed on sth'],
  get: ['get rid of sth', 'get used to doing sth'],
  give: ['give up doing sth', 'give in to sth'],
  go: ['go through sth'],
  hear: ['hear from sb', 'hear about sth'],
  interfere: ['interfere with sth'],
  invest: ['invest in sth'],
  join: ['join in sth'],
  laugh: ['laugh at sb/sth'],
  live: ['live on sth'],
  major: ['major in sth'],
  participate: ['participate in sth'],
  persist: ['persist in doing sth'],
  prefer: ['prefer A to B', 'prefer doing to doing'],
  prepare: ['prepare for sth'],
  protest: ['protest against sth'],
  recover: ['recover from sth'],
  regard: ['regard sb/sth as sth'],
  relate: ['relate to sth'],
  reply: ['reply to sth'],
  resort: ['resort to doing sth'],
  respond: ['respond to sth'],
  search: ['search for sth'],
  settle: ['settle down'],
  specialize: ['specialize in sth'],
  stick: ['stick to sth'],
  subscribe: ['subscribe to sth'],
  succeed: ['succeed in doing sth'],
  turn: ['turn to sb for help'],
  vote: ['vote for sb/sth'],
  warn: ['warn sb against doing sth'],
  wonder: ['wonder at sth'],
  yield: ['yield to sth'],
  keep: ['keep on doing sth', 'keep in touch with sb'],
  meet: ['meet the need of sth'],
  argue: ['argue with sb about sth'],
  come: ['come from sth'],
  communicate: ['communicate with sb'],
  compete: ['compete with sb', 'compete for sth'],
  congratulate: ['congratulate sb on sth'],
  date: ['date back to sth'],
  die: ['die of/from sth'],
  disagree: ['disagree with sb/sth'],
  divide: ['divide sth into sth'],
  feel: ['feel like doing sth'],
  pay: ['pay attention to sth', 'pay for sth'],
  protect: ['protect sb from sth'],
  provide: ['provide sb with sth', 'provide sth for sb'],
  spend: ['spend time on sth', 'spend time doing sth'],
  thank: ['thank sb for sth'],
  use: ['use sth to do sth']
}

// 形容词句型
const ADJ_PREP = {
  afraid: ['be afraid of sth', 'be afraid to do sth'],
  aware: ['be aware of sth'],
  capable: ['be capable of doing sth'],
  fond: ['be fond of sth'],
  full: ['be full of sth'],
  guilty: ['be guilty of sth'],
  proud: ['be proud of sth'],
  short: ['be short of sth'],
  tired: ['be tired of sth'],
  typical: ['be typical of sth'],
  worthy: ['be worthy of sth'],
  used: ['be used to doing sth', 'used to do sth'],
  accustomed: ['be accustomed to sth'],
  addicted: ['be addicted to sth'],
  committed: ['be committed to sth'],
  devoted: ['be devoted to sth'],
  exposed: ['be exposed to sth'],
  opposed: ['be opposed to sth'],
  subject: ['be subject to sth'],
  similar: ['be similar to sth'],
  superior: ['be superior to sth'],
  inferior: ['be inferior to sth'],
  sensitive: ['be sensitive to sth'],
  equal: ['be equal to sth'],
  loyal: ['be loyal to sb'],
  relevant: ['be relevant to sth'],
  responsible: ['be responsible for sth'],
  famous: ['be famous for sth'],
  ready: ['be ready for sth', 'be ready to do sth'],
  suitable: ['be suitable for sth'],
  eligible: ['be eligible for sth'],
  anxious: ['be anxious about sth'],
  concerned: ['be concerned about sth'],
  curious: ['be curious about sth'],
  enthusiastic: ['be enthusiastic about sth'],
  optimistic: ['be optimistic about sth'],
  pessimistic: ['be pessimistic about sth'],
  serious: ['be serious about sth'],
  upset: ['be upset about sth'],
  dependent: ['be dependent on sth'],
  based: ['be based on sth'],
  keen: ['be keen on sth'],
  intent: ['be intent on sth'],
  good: ['be good at doing sth'],
  skilled: ['be skilled at doing sth'],
  expert: ['be expert at doing sth'],
  able: ['be able to do sth'],
  willing: ['be willing to do sth'],
  supposed: ['be supposed to do sth'],
  bound: ['be bound to do sth'],
  likely: ['be likely to do sth'],
  eager: ['be eager to do sth'],
  reluctant: ['be reluctant to do sth'],
  quick: ['be quick to do sth'],
  slow: ['be slow to do sth'],
  difficult: ['be difficult to do sth'],
  easy: ['be easy to do sth'],
  enough: ['adj/adv + enough to do sth'],
  busy: ['be busy doing sth'],
  worth: ['be worth doing sth'],
  ashamed: ['be ashamed of sth'],
  allergic: ['be allergic to sth'],
  available: ['be available to sb'],
  beneficial: ['be beneficial to sb/sth'],
  close: ['be close to sth'],
  confident: ['be confident of sth'],
  conscious: ['be conscious of sth'],
  convenient: ['be convenient for sb'],
  different: ['be different from sth'],
  familiar: ['be familiar with sth'],
  fit: ['be fit for sth'],
  free: ['be free from sth', 'be free to do sth'],
  harmful: ['be harmful to sb/sth'],
  independent: ['be independent of sth'],
  interested: ['be interested in sth'],
  jealous: ['be jealous of sb/sth'],
  kind: ['be kind to sb'],
  known: ['be known for sth', 'be known as sth'],
  married: ['be married to sb'],
  necessary: ['be necessary for sth'],
  open: ['be open to sth'],
  popular: ['be popular with sb'],
  present: ['be present at sth'],
  qualified: ['be qualified for sth'],
  related: ['be related to sth'],
  rich: ['be rich in sth'],
  satisfied: ['be satisfied with sth'],
  scared: ['be scared of sth'],
  strict: ['be strict with sb', 'be strict in sth'],
  sure: ['be sure of sth', 'be sure to do sth'],
  surprised: ['be surprised at sth'],
  thankful: ['be thankful for sth'],
  useful: ['be useful for sth'],
  vital: ['be vital to sth'],
  worried: ['be worried about sth']
}

// 名词句型
const NOUN_PREP = {
  access: ['access to sth'],
  advantage: ['the advantage of sth'],
  approach: ['an approach to sth'],
  attitude: ['attitude to/towards sth'],
  awareness: ['awareness of sth'],
  capacity: ['capacity for sth'],
  contribution: ['contribution to sth'],
  demand: ['demand for sth'],
  effect: ['effect on sth'],
  emphasis: ['emphasis on sth'],
  evidence: ['evidence of sth'],
  impact: ['impact on sth'],
  influence: ['influence on sth'],
  insight: ['insight into sth'],
  interest: ['interest in sth'],
  knowledge: ['knowledge of sth'],
  lack: ['lack of sth'],
  need: ['need for sth'],
  opportunity: ['opportunity to do sth'],
  reason: ['reason for sth'],
  respect: ['respect for sth'],
  response: ['response to sth'],
  solution: ['solution to sth'],
  tendency: ['tendency to do sth'],
  threat: ['threat to sth'],
  alternative: ['alternative to sth'],
  answer: ['answer to sth'],
  application: ['application for sth'],
  attempt: ['attempt to do sth'],
  benefit: ['benefit of sth'],
  cause: ['cause of sth'],
  chance: ['chance of doing sth'],
  choice: ['choice of sth'],
  consequence: ['consequence of sth'],
  damage: ['damage to sth'],
  difference: ['difference between A and B'],
  difficulty: ['difficulty in doing sth'],
  doubt: ['doubt about sth'],
  effort: ['effort to do sth'],
  example: ['example of sth'],
  experience: ['experience in doing sth'],
  explanation: ['explanation for sth'],
  faith: ['faith in sth'],
  increase: ['increase in sth'],
  key: ['key to sth'],
  means: ['means of doing sth'],
  method: ['method of doing sth'],
  purpose: ['purpose of sth'],
  reaction: ['reaction to sth'],
  reduction: ['reduction in sth'],
  risk: ['risk of doing sth'],
  role: ['role in sth'],
  success: ['success in sth'],
  way: ['way to do sth'],
  willingness: ['willingness to do sth'],
  ability: ['the ability to do sth'],
  advice: ['advice on sth'],
  agreement: ['agreement on sth'],
  aim: ['the aim of sth'],
  amount: ['the amount of sth'],
  belief: ['belief in sth'],
  challenge: ['the challenge of doing sth'],
  comment: ['comment on sth'],
  confidence: ['confidence in sb/sth'],
  control: ['control over sth'],
  decision: ['decision on sth'],
  excuse: ['an excuse for sth'],
  fear: ['fear of sth'],
  focus: ['focus on sth'],
  harm: ['harm to sth'],
  hope: ['hope of doing sth'],
  idea: ['the idea of doing sth'],
  importance: ['the importance of sth'],
  improvement: ['improvement in sth'],
  love: ['love for sb/sth'],
  memory: ['memory of sth'],
  opinion: ['opinion on sth'],
  plan: ['plan for sth'],
  pressure: ['pressure on sb/sth'],
  progress: ['progress in sth'],
  protection: ['protection from sth'],
  relationship: ['relationship with sb'],
  responsibility: ['responsibility for sth'],
  result: ['the result of sth'],
  skill: ['skill in doing sth'],
  stress: ['stress on sth'],
  support: ['support for sth'],
  talent: ['talent for sth'],
  trust: ['trust in sb/sth'],
  view: ['view on sth']
}

const CURATED = {}
function add(word, pattern) {
  if (!CURATED[word]) CURATED[word] = []
  if (CURATED[word].indexOf(pattern) < 0) CURATED[word].push(pattern)
}

VERB_TO_DO.forEach((word) => add(word, `${word} to do sth`))
VERB_DOING.forEach((word) => add(word, `${word} doing sth`))
VERB_SB_TO_DO.forEach((word) => add(word, `${word} sb to do sth`))
VERB_SB_BARE.forEach((word) => {
  add(word, `${word} sb do sth`)
})
VERB_SB_DOING.forEach((word) => {
  add(word, `${word} sb doing sth`)
})
VERB_FROM_DOING.forEach((word) => add(word, `${word} sb from doing sth`))
VERB_SB_OF.forEach((word) => add(word, `${word} sb of sth`))
VERB_SB_FOR.forEach((word) => add(word, `${word} sb for sth`))
VERB_SB_WITH.forEach((word) => add(word, `${word} sb with sth`))
VERB_STH_TO_SB.forEach((word) => add(word, `${word} sth to sb`))
VERB_SB_STH.forEach((word) => add(word, `${word} sb sth`))
Object.keys(VERB_PREP).forEach((word) => {
  VERB_PREP[word].forEach((pattern) => add(word, pattern))
})
Object.keys(ADJ_PREP).forEach((word) => {
  ADJ_PREP[word].forEach((pattern) => add(word, pattern))
})
Object.keys(NOUN_PREP).forEach((word) => {
  NOUN_PREP[word].forEach((pattern) => add(word, pattern))
})

// 保留之前从词组表拆出来的句型
function existingPatterns() {
  if (!fs.existsSync(TARGET)) return {}
  let raw = ''
  try {
    raw = require(TARGET)
  } catch (error) {
    return {}
  }
  const map = {}
  String(raw || '').split('\n').forEach((line) => {
    if (!line) return
    const parts = line.split('|')
    // 第二列可能已经带 ~释义，合并前先剥掉，避免重复生成
    map[parts[0]] = (parts[1] || '').split(';').filter(Boolean).map((item) => item.split('~')[0])
  })
  return map
}

// 用法例句：只给最常用的词手工造一句，演示它最典型的搭配；
// 没有的词不显示例句，不用语料库里的长句凑数
const EXAMPLES = {
  able: 'He is able to solve the problem by himself.',
  access: 'Students need free access to the library.',
  accuse: 'They accused him of stealing the money.',
  afraid: 'The little girl is afraid of the dark.',
  afford: 'Many families cannot afford to buy a house.',
  agree: 'They agreed to meet at the school gate.',
  aim: 'The course aims to improve your writing skills.',
  allow: 'The teacher allowed us to leave early.',
  appear: 'She appears to know the answer.',
  apply: 'He applied for a job in a foreign company.',
  approach: 'We need a new approach to teaching English.',
  argue: 'They argued with each other about the plan.',
  attempt: 'He attempted to solve the problem alone.',
  available: 'The book is available to all students.',
  avoid: 'You should avoid making the same mistake.',
  based: 'The film is based on a true story.',
  beneficial: 'Reading is beneficial to your growth.',
  benefit: 'Both sides will benefit from the agreement.',
  blame: 'Do not blame him for the accident.',
  busy: 'She is busy preparing for the exam.',
  cause: 'Heavy rain caused the river to rise.',
  challenge: 'She enjoys the challenge of learning a new language.',
  charge: 'The police charged him with theft.',
  choose: 'She chose to study abroad after graduation.',
  claim: 'He claims to have finished the work.',
  compare: 'Compare this picture with that one, and you will see the difference.',
  concerned: 'Parents are concerned about their children\'s safety.',
  confident: 'He is confident of winning the match.',
  conscious: 'She was conscious of the danger ahead.',
  consider: 'We are considering moving to another city.',
  contribute: 'Regular exercise contributes to good health.',
  control: 'He has little control over his temper.',
  deal: 'We must deal with the problem as soon as possible.',
  decide: 'They decided to cancel the trip.',
  demand: 'The workers demanded to know the truth.',
  describe: 'Could you describe your hometown to us?',
  determine: 'She determined to finish the race.',
  devote: 'He devoted himself to helping poor children.',
  devoted: 'She is devoted to her teaching work.',
  differ: 'Their opinions differ from ours.',
  difference: 'What is the difference between these two words?',
  different: 'City life is different from country life.',
  dream: 'She dreams of becoming a doctor.',
  eager: 'She is eager to learn new things.',
  effect: 'The new policy had a great effect on small businesses.',
  effort: 'He made an effort to explain the rule clearly.',
  encourage: 'Our teacher encourages us to ask questions.',
  engage: 'Students should engage in more outdoor activities.',
  enjoy: 'I enjoy reading English novels in my spare time.',
  expect: 'We expect to hear from you soon.',
  experience: 'She has rich experience in teaching children.',
  explain: 'Please explain this sentence to me.',
  exposed: 'Children are often exposed to too much screen time.',
  fail: 'He failed to pass the driving test.',
  familiar: 'I am familiar with this software.',
  fear: 'She fears to speak in front of the class.',
  feed: 'Cows feed on grass.',
  focus: 'You should focus on your studies.',
  force: 'The bad weather forced us to stay at home.',
  free: 'You are free to ask any questions.',
  good: 'She is good at playing the piano.',
  happen: 'I happened to meet an old friend on the street.',
  harm: 'Smoking does great harm to your health.',
  harmful: 'Smoking is harmful to your health.',
  hope: 'I hope to see you again soon.',
  imagine: 'Can you imagine living without a phone?',
  impact: 'Social media has a deep impact on young people.',
  increase: 'There has been an increase in online shopping.',
  independent: 'College students should be independent of their parents.',
  influence: 'Parents have a great influence on their children.',
  insist: 'He insisted on paying for the meal.',
  interest: 'She shows great interest in modern art.',
  interested: 'I am interested in Chinese history.',
  involve: 'The job involves working with children.',
  lack: 'The project failed because of a lack of money.',
  lead: 'This road leads to the train station.',
  likely: 'It is likely to rain tomorrow.',
  manage: 'She managed to finish the report on time.',
  method: 'This is an effective method of learning new words.',
  notice: 'I noticed him leave the room.',
  object: 'She objected to being treated like a child.',
  offer: 'He offered to drive us to the airport.',
  opportunity: 'This is a good opportunity to practice your English.',
  opposed: 'Most parents are opposed to the new rule.',
  participate: 'All students are encouraged to participate in the discussion.',
  permit: 'The rules do not permit smoking here.',
  persuade: 'I persuaded him to see a doctor.',
  point: 'The teacher pointed out several mistakes in my essay.',
  popular: 'This song is popular with young people.',
  prepare: 'We are preparing for the final exam.',
  prevent: 'Regular exercise can prevent us from getting sick.',
  provide: 'The school provides students with free lunch.',
  qualified: 'She is well qualified for the position.',
  refer: 'You can refer to the dictionary when you meet a new word.',
  refuse: 'He refused to answer the question.',
  relate: 'The report relates to the environment.',
  related: 'Health is closely related to lifestyle.',
  rely: 'You can rely on him to keep his word.',
  require: 'The job requires you to work at weekends.',
  respond: 'He did not respond to my question.',
  response: 'Her response to the news was surprisingly calm.',
  result: 'The accident resulted in serious injuries.',
  risk: 'He risked losing everything to start his own business.',
  role: 'Parents play an important role in their children\'s education.',
  satisfied: 'The teacher was satisfied with our performance.',
  save: 'The new treatment saved her from going blind.',
  serious: 'We should be serious about protecting the environment.',
  settle: 'After years of traveling, he finally settled down.',
  skill: 'She has great skill in handling difficult customers.',
  solution: 'We are still looking for a solution to the problem.',
  stick: 'You should stick to your plan.',
  strict: 'Our teacher is strict with us.',
  strive: 'We should strive to improve our spoken English.',
  suffer: 'Many people suffer from stress at work.',
  support: 'The plan won strong support from local people.',
  supposed: 'You are supposed to hand in your homework on time.',
  sure: 'Be sure to lock the door before you leave.',
  surprised: 'I was surprised at how quickly he changed his mind.',
  tend: 'People tend to believe what they want to believe.',
  threat: 'Climate change is a serious threat to wildlife.',
  treat: 'Do not treat this problem as a joke.',
  trust: 'I trust her to keep the secret.',
  useful: 'This dictionary is useful for beginners.',
  view: 'Many people view failure as a chance to learn.',
  vital: 'Practice is vital to learning a language.',
  vote: 'Most students voted for the new plan.',
  warn: 'The teacher warned us against cheating.',
  willing: 'She is willing to help anyone in need.',
  wonder: 'We wondered at the beauty of the starry sky.',
  worth: 'This book is worth reading twice.',
  worried: 'She is worried about her son\'s health.'
}

const MERGED = existingPatterns()
Object.keys(CURATED).forEach((word) => {
  const list = MERGED[word] || []
  CURATED[word].forEach((pattern) => {
    if (list.indexOf(pattern) < 0) list.push(pattern)
  })
  MERGED[word] = list
})

const words = Object.keys(MERGED).sort()
const missing = []
const lines = words.map((word) => {
  const patterns = MERGED[word].slice(0, 5).map((pattern) => {
    const gloss = GLOSS[pattern]
    if (!gloss) missing.push(pattern)
    return gloss ? `${pattern}~${gloss}` : pattern
  }).join(';')
  if (!patterns) return ''
  return `${word}|${patterns}|${EXAMPLES[word] || ''}`
}).filter(Boolean)
const text = lines.join('\n')

fs.writeFileSync(TARGET,
  `// 单词常用句型（生成文件，勿手改）：格式 word|pattern~释义;pattern~释义|用法例句\n`
  + `// 由 tools/build-word-patterns.js 生成：动词/形容词/名词的常用句式与介词搭配。\n`
  + `// 中文释义来自 tools/word-pattern-gloss.js；第三列是手工造的短句，只覆盖常用词，没有就留空。\n`
  + `module.exports = ${JSON.stringify(text)}\n`, 'utf8')

if (missing.length) console.warn('缺中文释义的句型', missing.length, missing)
console.log('单词', words.length, '句型条数', lines.reduce((sum, line) => sum + line.split('|')[1].split(';').length, 0))
console.log('体积', Math.round(Buffer.byteLength(text) / 1024), 'KB')
console.log('strive', MERGED.strive, '\naccuse', MERGED.accuse, '\naccess', MERGED.access, '\nafraid', MERGED.afraid)
