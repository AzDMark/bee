/**
 * TDD 验证脚本：检查食谱详情页 4 个文件是否正确创建
 * 运行：node __tests__/verify-recipe-detail-page.js
 */
const fs = require('fs')
const path = require('path')

const base = path.join(__dirname, '..', 'pages', 'recipe')
const files = ['detail.js', 'detail.wxml', 'detail.wxss', 'detail.json']

let passed = 0
let failed = 0

function assert(condition, msg) {
  if (condition) { console.log('  PASS: ' + msg); passed++ }
  else { console.log('  FAIL: ' + msg); failed++ }
}

console.log('验证食谱详情页文件...\n')

files.forEach(f => {
  assert(fs.existsSync(path.join(base, f)), 'pages/recipe/' + f + ' 文件存在')
})

try {
  const json = JSON.parse(fs.readFileSync(path.join(base, 'detail.json'), 'utf-8'))
  assert(json.navigationBarTitleText === '食谱详情', 'detail.json navigationBarTitleText 为 "食谱详情"')
} catch (e) { assert(false, 'detail.json 合法: ' + e.message) }

try {
  const js = fs.readFileSync(path.join(base, 'detail.js'), 'utf-8')
  assert(js.includes("require('apifm-wxapi')"), 'detail.js 引入了 apifm-wxapi')
  assert(js.includes('loadRecipeDetail'), 'detail.js 包含 loadRecipeDetail 方法')
  assert(js.includes('previewImage'), 'detail.js 包含 previewImage 方法')
} catch (e) { assert(false, 'detail.js 读取失败: ' + e.message) }

try {
  const wxml = fs.readFileSync(path.join(base, 'detail.wxml'), 'utf-8')
  assert(wxml.includes('cover-img'), 'detail.wxml 包含封面图')
  assert(wxml.includes('ingredients'), 'detail.wxml 包含食材区块')
  assert(wxml.includes('nutrition'), 'detail.wxml 包含营养区块')
  assert(wxml.includes('step'), 'detail.wxml 包含步骤区块')
} catch (e) { assert(false, 'detail.wxml 读取失败: ' + e.message) }

try {
  const wxss = fs.readFileSync(path.join(base, 'detail.wxss'), 'utf-8')
  assert(wxss.includes('.cover-img'), 'detail.wxss 包含 .cover-img')
  assert(wxss.includes('.ingredient-item'), 'detail.wxss 包含 .ingredient-item')
  assert(wxss.includes('.nutrition-grid'), 'detail.wxss 包含 .nutrition-grid')
  assert(wxss.includes('.step-item'), 'detail.wxss 包含 .step-item')
} catch (e) { assert(false, 'detail.wxss 读取失败: ' + e.message) }

console.log('\n结果: ' + passed + ' passed, ' + failed + ' failed')
process.exit(failed > 0 ? 1 : 0)
