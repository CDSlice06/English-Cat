#!/usr/bin/env node
/**
 * 生成外刊内容包 cloud/journal/pack.json。
 *
 * 用途：外刊清单和正文不再只靠小程序版本更新。发布新外刊的流程是：
 *   1. 在 miniprogram/content/journals.js 里加文章（中文摘要放 journalMeta.js，封面放 journalCovers.js）
 *   2. 跑本脚本：node tools/build-journal-pack.js
 *   3. 在开发者工具里重新部署 cloud/journal 云函数
 * 小程序端每 6 小时静默检查一次清单版本，用户不用更新小程序也能读到新文章。
 *
 * 说明：打成单个 pack.json 而不是多层目录。开发者工具在 Windows 上打包子目录时
 * 会把路径写成 `pack\articles\x.json` 这种反斜杠文件名，上传到 Linux 运行环境后
 * 目录结构就没了，云函数 require 会直接报错。
 */
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'cloud', 'journal', 'pack.json')

const { JOURNALS } = require(path.join(ROOT, 'source/journals.js'))
const { META } = require(path.join(ROOT, 'miniprogram/content/journalMeta.js'))
const { COVERS } = require(path.join(ROOT, 'miniprogram/content/journalCovers.js'))

// 与 services/journals.js 的 SUMMARY_KEYS 保持一致
const SUMMARY_KEYS = ['id', 'level', 'title', 'source', 'sourceUrl', 'license', 'date', 'topic', 'words']

function summaryOf(item) {
  const summary = {}
  SUMMARY_KEYS.forEach((key) => { summary[key] = item[key] })
  const meta = META[item.id] || {}
  summary.zhTitle = meta.zhTitle || ''
  summary.summary = meta.summary || ''
  summary.fallbackCover = meta.cover ? `/assets/journal/${meta.cover}.jpg` : ''
  summary.cover = COVERS[item.id] || summary.fallbackCover
  return summary
}

function hash(text) {
  return crypto.createHash('sha1').update(text).digest('hex').slice(0, 12)
}

function main() {
  const ordered = JOURNALS.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))
    || String(a.id).localeCompare(String(b.id)))
  if (!ordered.length) throw new Error('content/journals.js 里没有外刊')

  const items = ordered.map(summaryOf)

  // 版本号由「清单（含中文标题/导读/分类）+ 每篇正文」算出：
  // 只要改了分类或导读，版本就会变，客户端才会重新拉取清单。
  const signature = ordered
    .map((item, index) => `${hash(JSON.stringify(items[index]))}:${hash(String(item.text || ''))}`)
    .join('|')

  const articles = {}
  ordered.forEach((item) => { articles[item.id] = item })

  const pack = {
    version: hash(signature),
    updatedAt: new Date().toISOString(),
    total: ordered.length,
    items: ordered.map(summaryOf),
    articles
  }

  fs.rmSync(path.join(ROOT, 'cloud', 'journal', 'pack'), { recursive: true, force: true })
  fs.writeFileSync(OUT, JSON.stringify(pack))

  const size = Buffer.byteLength(JSON.stringify(pack))
  console.log(`已生成 ${ordered.length} 篇外刊 -> ${path.relative(ROOT, OUT)}`)
  console.log(`版本 ${pack.version} · 内容包 ${(size / 1024).toFixed(1)}KB`)
  console.log('下一步：在开发者工具里重新部署 cloud/journal 云函数')
}

main()
