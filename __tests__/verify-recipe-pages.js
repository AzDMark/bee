/**
 * TDD 验证脚本：检查 app.json 中是否注册了食谱页面路由
 * 运行：node __tests__/verify-recipe-pages.js
 */
const fs = require('fs')
const path = require('path')

const appJsonPath = path.join(__dirname, '..', 'app.json')
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'))

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

console.log('验证 app.json 食谱页面注册...\n')

assert(
  appJson.pages.includes('pages/recipe/index'),
  'pages 数组中包含 pages/recipe/index'
)

assert(
  appJson.pages.includes('pages/recipe/detail'),
  'pages 数组中包含 pages/recipe/detail'
)

console.log('\n结果: ' + passed + ' passed, ' + failed + ' failed')
process.exit(failed > 0 ? 1 : 0)
