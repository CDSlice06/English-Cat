// 每篇外刊一张独立封面，图片托管在云存储（压缩后约 60KB/张，主包放不下）。
// 云存储读不到时，journals.js 会回退到 assets/journal 里的 12 张主题图。
const BUCKET = 'cloud://cloud1-d6gaxobvw48339447.636c-cloud1-d6gaxobvw48339447-1522177942/journal-covers'

const COVERS = {}
for (let i = 1; i <= 82; i++) {
  const id = 'journal-' + (i < 10 ? '00' : '0') + i
  COVERS[id] = BUCKET + '/' + id + '.jpg'
}

module.exports = { COVERS }
