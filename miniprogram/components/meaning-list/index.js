// 词性色板：让释义一眼分清 v. / n. / adj. / adv.
const TONES = {
  n: 'n',
  v: 'v',
  adj: 'adj',
  adv: 'adv',
  phr: 'phr',
  conj: 'conj',
  prep: 'prep'
}

// 可数性标记：C 可数 / U 不可数 / C/U 两种用法都常见
const COUNT_LABELS = {
  C: '可数',
  U: '不可数',
  'C/U': '可数/不可数'
}

function toneOf(pos) {
  const value = String(pos || '').toLowerCase().replace(/\s/g, '')
  if (!value) return 'other'
  if (value.indexOf('phr') === 0) return TONES.phr
  if (value.indexOf('adj') === 0) return TONES.adj
  if (value.indexOf('adv') === 0) return TONES.adv
  if (value.indexOf('prep') === 0) return TONES.prep
  if (value.indexOf('conj') === 0) return TONES.conj
  if (value.indexOf('pron') === 0) return 'other'
  if (value.indexOf('num') === 0) return 'other'
  if (value.indexOf('n') === 0) return TONES.n
  if (value.indexOf('v') === 0) return TONES.v
  return 'other'
}

function decorate(meanings) {
  return (meanings || []).map((item, index) => ({
    key: `${index}-${item.pos || ''}`,
    pos: item.pos || '',
    definition: item.definition || '',
    rare: !!item.rare,
    count: COUNT_LABELS[item.count] || '',
    tone: toneOf(item.pos)
  }))
}

Component({
  properties: {
    meanings: {
      type: Array,
      value: [],
      observer(value) {
        this.setData({ list: decorate(value) })
      }
    },
    compact: { type: Boolean, value: false }
  },
  data: { list: [] },
  lifetimes: {
    attached() {
      this.setData({ list: decorate(this.data.meanings) })
    }
  }
})
