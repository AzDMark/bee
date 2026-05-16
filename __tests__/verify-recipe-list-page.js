/**
 * TDD 验证脚本：检查食谱列表页 4 个文件是否正确创建
 * 运行：node __tests__/verify-recipe-list-page.js
 */
const fs = require('fs')
const path = require('path')

const base = path.join(__dirname, '..', 'pages', 'recipe')
const files = ['index.js', 'index.wxml', 'index.wxss', 'index.json']

let passed = 0
let failed = 0

function assert(condition, msg) {
  if (condition) {
    console.log('  PASS: ' + msg)
    passed++
  } else {
    console.log('  FAIL: ' + msg)
    failed++
  }
}

console.log('验证食谱列表页文件...\n')

// 检查文件存在
files.forEach(f => {
  assert(
    fs.existsSync(path.join(base, f)),
    'pages/recipe/' + f + ' 文件存在'
  )
})

// 检查 index.json 配置
try {
  const json = JSON.parse(fs.readFileSync(path.join(base, 'index.json'), 'utf-8'))
  assert(
    json.navigationBarTitleText === '食谱',
    'index.json navigationBarTitleText 为 "食谱"'
  )
} catch (e) {
  assert(false, 'index.json 是合法 JSON: ' + e.message)
}

// 检查 index.js 引入了 WXAPI 并包含核心方法
try {
  const js = fs.readFileSync(path.join(base, 'index.js'), 'utf-8')
  assert(js.includes("require('apifm-wxapi')"), 'index.js 引入了 apifm-wxapi')
  assert(js.includes('loadCategories'), 'index.js 包含 loadCategories 方法')
  assert(js.includes('loadRecipes'), 'index.js 包含 loadRecipes 方法')
  assert(js.includes('onReachBottom'), 'index.js 包含 onReachBottom 分页')
  assert(js.includes('goDetail'), 'index.js 包含 goDetail 跳转')
} catch (e) {
  assert(false, 'index.js 读取失败: ' + e.message)
}

// 检查 index.wxml 包含关键结构
try {
  const wxml = fs.readFileSync(path.join(base, 'index.wxml'), 'utf-8')
  assert(wxml.includes('category-sidebar'), 'index.wxml 包含分类侧栏')
  assert(wxml.includes('recipe-card'), 'index.wxml 包含食谱卡片')
  assert(wxml.includes('van-empty'), 'index.wxml 包含空状态组件')
  assert(wxml.includes('bindinput'), 'index.wxml 包含搜索输入绑定')
} catch (e) {
  assert(false, 'index.wxml 读取失败: ' + e.message)
}

// 检查 index.wxss 包含关键样式
try {
  const wxss = fs.readFileSync(path.join(base, 'index.wxss'), 'utf-8')
  assert(wxss.includes('.recipe-container'), 'index.wxss 包含 .recipe-container')
  assert(wxss.includes('.category-sidebar'), 'index.wxss 包含 .category-sidebar')
  assert(wxss.includes('.recipe-card'), 'index.wxss 包含 .recipe-card')
} catch (e) {
  assert(false, 'index.wxss 读取失败: ' + e.message)
}

console.log('\n结果: ' + passed + ' passed, ' + failed + ' failed')
process.exit(failed > 0 ? 1 : 0)
