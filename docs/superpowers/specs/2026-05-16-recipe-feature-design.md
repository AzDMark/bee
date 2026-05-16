# 食谱功能设计文档

> 日期：2026-05-16
> 状态：待实现

## 1. 需求概述

在餐饮点餐小程序中新增「食谱」功能，用于展示菜品的详细菜单信息（食材原料、口味标签、营养成分、制作步骤），作为独立内容模块，不与现有商品关联。

**第一版范围**：纯展示，列表页 + 详情页，无收藏/点赞/评论等互动功能。

## 2. 方案选择

采用**方案 A：标准双页面方案**，创建 `pages/recipe/index`（列表页）和 `pages/recipe/detail`（详情页），沿用项目标准 4 文件结构。

理由：与现有页面风格一致，职责分离，后续扩展不会导致单文件膨胀。

## 3. API 接口契约

基于 `apifm-wxapi` 调用风格，设计 3 个接口。后端需在 API Factory 中实现。

### 3.1 食谱分类列表

```js
const res = await WXAPI.recipeCategories()
```

**返回格式：**

```json
{
  "code": 0,
  "data": [
    { "id": 1, "name": "汤品", "icon": "https://..." },
    { "id": 2, "name": "主食", "icon": "https://..." },
    { "id": 3, "name": "甜品", "icon": "https://..." }
  ]
}
```

### 3.2 食谱列表（分页 + 分类筛选）

```js
const res = await WXAPI.recipes({
  categoryId: 1,    // 可选，不传返回全部
  page: 1,
  pageSize: 20
})
```

**返回格式：**

```json
{
  "code": 0,
  "data": {
    "result": [
      {
        "id": 101,
        "name": "番茄蛋花汤",
        "categoryId": 1,
        "pic": "https://...",
        "description": "酸甜开胃，营养丰富",
        "tasteTags": ["清淡", "酸甜"],
        "calories": 85
      }
    ],
    "totalPage": 3
  }
}
```

### 3.3 食谱详情

```js
const res = await WXAPI.recipeDetail(101)
```

**返回格式：**

```json
{
  "code": 0,
  "data": {
    "id": 101,
    "name": "番茄蛋花汤",
    "categoryId": 1,
    "categoryName": "汤品",
    "pic": "https://...",
    "description": "酸甜开胃的经典家常汤",
    "tasteTags": ["清淡", "酸甜"],
    "ingredients": [
      { "name": "番茄", "amount": "2个" },
      { "name": "鸡蛋", "amount": "2个" },
      { "name": "盐", "amount": "适量" }
    ],
    "nutrition": {
      "calories": "85 kcal",
      "protein": "6.2g",
      "fat": "4.1g",
      "carbs": "5.8g"
    },
    "steps": [
      { "order": 1, "text": "番茄洗净切块，鸡蛋打散备用", "pic": "https://..." },
      { "order": 2, "text": "锅中加水烧开，放入番茄煮3分钟", "pic": "https://..." },
      { "order": 3, "text": "缓缓倒入蛋液，加盐调味即可", "pic": "https://..." }
    ]
  }
}
```

**接口约定：**
- 响应约定与现有项目一致：`code === 0` 成功，`700` 无数据
- `steps.pic` 为可选字段，允许无图步骤
- `nutrition` 各字段为字符串格式，含单位

## 4. 页面结构

### 4.1 食谱列表页 `pages/recipe/index`

布局：左侧 van-sidebar 分类 + 右侧两列卡片瀑布流。

```
┌─────────────────────────────┐
│ 🔍 搜索栏                    │
├──────┬──────────────────────┤
│ 全部 │  ┌──────┐ ┌──────┐   │
│ 汤品 │  │ 封面  │ │ 封面  │   │
│ 主食 │  │ 名称  │ │ 名称  │   │
│ 甜品 │  │ 标签  │ │ 标签  │   │
│ 小吃 │  └──────┘ └──────┘   │
│ 饮品 │  ┌──────┐ ┌──────┐   │
│      │  │ ...  │ │ ...  │   │
└──────┴──────────────────────┘
```

- 左侧：van-sidebar 分类列表，首个选项为「全部」
- 右侧：两列卡片（封面图 + 名称 + 口味标签），点击跳转详情页
- 顶部：搜索框，输入关键词搜索
- 底部：`onReachBottom` 触底分页加载
- 空状态：van-empty 组件

### 4.2 食谱详情页 `pages/recipe/detail`

布局：纵向长页面，4 个区块。

```
┌─────────────────────────────┐
│        封面大图              │
├─────────────────────────────┤
│  番茄蛋花汤                  │
│  酸甜开胃的经典家常汤         │
│  [清淡] [酸甜]               │
├─────────────────────────────┤
│  · 食材原料                  │
│    番茄 ······· 2个          │
│    鸡蛋 ······· 2个          │
├─────────────────────────────┤
│  · 营养成分（每份）           │
│    热量 85kcal | 蛋白 6.2g   │
│    脂肪 4.1g   | 碳水 5.8g   │
├─────────────────────────────┤
│  · 制作步骤                  │
│    Step 1: ...               │
│    Step 2: ...               │
└─────────────────────────────┘
```

### 4.3 首页入口

在 `pages/home/index.wxml` 的「更多服务」区域增加一个食谱入口按钮。
在 `pages/home/index.js` 增加 `recipe()` 方法跳转至 `/pages/recipe/index`。

## 5. 改动范围

### 新增文件（8 个）

| 文件 | 用途 |
|---|---|
| `pages/recipe/index.js` | 列表页逻辑 |
| `pages/recipe/index.wxml` | 列表页模板 |
| `pages/recipe/index.wxss` | 列表页样式 |
| `pages/recipe/index.json` | 列表页配置 |
| `pages/recipe/detail.js` | 详情页逻辑 |
| `pages/recipe/detail.wxml` | 详情页模板 |
| `pages/recipe/detail.wxss` | 详情页样式 |
| `pages/recipe/detail.json` | 详情页配置 |

### 修改文件（3 个）

| 文件 | 改动内容 |
|---|---|
| `app.json` | 在 `pages` 数组中注册 2 个新页面路径 |
| `pages/home/index.wxml` | 「更多服务」区域增加食谱入口 |
| `pages/home/index.js` | 增加 `recipe()` 跳转方法 |

### 新增资源（1 个）

| 文件 | 用途 |
|---|---|
| `images/recipe.png` | 首页食谱入口图标（如暂无可用 `sc.png` 临时替代） |

## 6. 风险点

1. **后端接口未实现**：前端调用 `WXAPI.recipeCategories()` 等方法时，若后端未配置对应接口会报错。需后端在 API Factory 实现后才能联调
2. **图标资源**：需用户提供食谱图标，暂无可用 `images/sc.png` 临时替代
3. **i18n 国际化**：第一版中文硬编码，后续需加语言包时再补充
4. **空状态处理**：列表为空时使用 van-empty 组件展示
