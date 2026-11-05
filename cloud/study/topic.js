// 真题主题识别：纯关键词打分，零依赖、零模型调用
// 只用于题库列表展示，判错也不影响学习内容，因此宁可给一个宽泛主题也不要空着

const THEMES = [
  {
    label: '健康',
    words: ['health', 'healthy', 'disease', 'illness', 'medical', 'medicine', 'patient', 'doctor',
      'hospital', 'sleep', 'diet', 'nutrition', 'obesity', 'exercise', 'cancer', 'vaccine', 'virus',
      'mental', 'depression', 'stress', 'therapy', 'symptom', 'immune', 'surgery', 'food', 'sugar',
      'calorie', 'fitness', 'wellness', 'disorder', 'diagnosis', 'treatment', 'drug', 'infection',
      'pandemic', 'hygiene', 'aging', 'ageing', 'elderly']
  },
  {
    label: '环境',
    words: ['climate', 'environment', 'environmental', 'carbon', 'emission', 'pollution', 'pollutant',
      'plastic', 'waste', 'recycle', 'wildlife', 'species', 'biodiversity', 'forest', 'ocean', 'marine',
      'ecosystem', 'conservation', 'sustainable', 'renewable', 'drought', 'flood', 'temperature', 'extinction',
      'agriculture', 'farm', 'farmer', 'soil', 'water', 'solar', 'wind', 'coal', 'deforestation',
      'pesticide', 'weather', 'hurricane', 'heat', 'glacier', 'green']
  },
  {
    label: '科技',
    words: ['technology', 'technological', 'digital', 'internet', 'online', 'smartphone', 'device',
      'algorithm', 'robot', 'automation', 'artificial', 'intelligence', 'software', 'computer', 'platform',
      'privacy', 'cyber', 'virtual', 'innovation', 'gadget', 'battery', 'screen', 'network', 'machine',
      'engineer', 'engineering', 'satellite', 'chip', 'smart', 'electric']
  },
  {
    label: '教育',
    words: ['education', 'educational', 'student', 'school', 'teacher', 'teaching', 'university', 'college',
      'learning', 'classroom', 'curriculum', 'literacy', 'exam', 'academic', 'tuition', 'homework', 'lecture',
      'pupil', 'campus', 'degree', 'graduate', 'scholarship', 'tutor', 'kindergarten', 'vocational']
  },
  {
    label: '经济',
    words: ['economy', 'economic', 'market', 'consumer', 'consumption', 'income', 'wage', 'salary',
      'business', 'company', 'trade', 'tax', 'financial', 'finance', 'industry', 'employment',
      'unemployment', 'investment', 'poverty', 'wealth', 'inflation', 'retail', 'money', 'rent',
      'debt', 'loan', 'bank', 'stock', 'brand', 'advertising', 'advertisement', 'marketing',
      'shopper', 'afford', 'budget', 'pay']
  },
  {
    label: '社会',
    words: ['society', 'social', 'community', 'urban', 'city', 'inequality', 'gender', 'immigration',
      'policy', 'government', 'public', 'family', 'generation', 'rural', 'housing', 'crime', 'volunteer',
      'demographic', 'welfare', 'neighbourhood', 'citizen', 'resident', 'neighbour', 'neighbor',
      'marriage', 'divorce', 'child', 'children', 'teenager', 'youth', 'retirement', 'pension',
      'charity', 'homeless', 'migration', 'refugee']
  },
  {
    label: '心理',
    words: ['psychology', 'psychological', 'behavior', 'behaviour', 'emotion', 'emotional', 'happiness',
      'motivation', 'attention', 'memory', 'cognitive', 'cognition', 'bias', 'personality', 'anxiety',
      'loneliness', 'habit', 'mindset', 'reward', 'mood', 'brain', 'focus', 'distraction', 'wellbeing',
      'satisfaction', 'confidence', 'fear', 'anger']
  },
  {
    label: '文化',
    words: ['culture', 'cultural', 'museum', 'literature', 'history', 'historical', 'language', 'tradition',
      'music', 'heritage', 'festival', 'novel', 'poetry', 'media', 'journalism', 'artistic', 'craft',
      'book', 'reading', 'writer', 'author', 'film', 'movie', 'television', 'fashion', 'design',
      'photography', 'gallery', 'dance', 'song', 'story', 'religion']
  },
  {
    label: '科学',
    words: ['research', 'researcher', 'scientist', 'science', 'scientific', 'experiment', 'physics',
      'biology', 'evolution', 'genetic', 'space', 'universe', 'discovery', 'laboratory', 'theory',
      'measure', 'sample', 'hypothesis', 'chemical', 'atom', 'planet', 'ancient', 'fossil', 'telescope']
  }
]

// 命中一个关键词记 1 分，标题里的词额外加权：标题最能代表主题
function scoreTheme(theme, title, body) {
  let score = 0
  theme.words.forEach((word) => {
    const pattern = new RegExp(`\\b${word}[a-z]{0,3}\\b`, 'gi')
    const inTitle = (title.match(pattern) || []).length
    const inBody = (body.match(pattern) || []).length
    score += inTitle * 3 + Math.min(inBody, 6)
  })
  return score
}

// 返回「健康」「环境」这类单主题；关键词都没什么命中时归为「综合」，
// 保证题库列表每条都有主题，不出现空白
function guessTopic(text, title) {
  const body = String(text || '').slice(0, 10000)
  const head = String(title || '').slice(0, 200)
  if (!body && !head) return ''
  let best = ''
  let bestScore = 0
  THEMES.forEach((theme) => {
    const score = scoreTheme(theme, head, body)
    // 同分时保留前面的主题，顺序本身就是一个粗略的优先级
    if (score > bestScore) {
      bestScore = score
      best = theme.label
    }
  })
  // 分数太低说明只是零星出现，归入「综合」，不让列表空着
  return bestScore >= 2 ? best : '综合'
}

module.exports = { guessTopic }
