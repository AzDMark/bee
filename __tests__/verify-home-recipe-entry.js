/**
 * TDD 验证脚本：检查首页是否添加了食谱入口
 * 运行：node __tests__/verify-home-recipe-entry.js
 */
const fs = require('fs')
const path = require('path')

const homeDir = path.join(__dirname, '..', 'pages', 'home')

let passed = 0
let failed = 0

function assert(condition, msg) {
  if (condition) { console.log('  PASS: ' + msg); passed++ }
  else { console.log('  FAIL: ' + msg); failed++ }
}

console.log('验证首页食谱入口...\n')

try {
  const js = fs.readFileSync(path.join(homeDir, 'index.js'), 'utf-8')
  assert(js.includes('recipe()'), 'index.js 包含 recipe() 方法')
  assert(js.includes("url: '/pages/recipe/index'"), 'index.js 跳转到 /pages/recipe/index')
} catch (e) { assert(false, 'index.js 读取失败: ' + e.message) }

try {
  const wxml = fs.readFileSync(path.join(homeDir, 'index.wxml'), 'utf-8')
  assert(wxml.includes("bind:tap=\"recipe\""), 'index.wxml 包含 recipe 点击绑定')
  assert(wxml.includes('食谱'), 'index.wxml 包含"食谱"文字')
} catch (e) { assert(false, 'index.wxml 读取失败: ' + e.message) }

console.log('\n结果: ' + passed + ' passed, ' + failed + ' failed')
process.exit(failed > 0 ? 1 : 0)
