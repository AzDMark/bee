# 食谱功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在餐饮点餐小程序中新增「食谱」功能——独立分类体系下的食谱列表页和详情页，纯展示，首页入口。

**Architecture:** 新增 2 个标准页面（`pages/recipe/index` + `pages/recipe/detail`），沿用项目 WXML + WXSS + JS 四文件结构。数据通过 `apifm-wxapi` SDK 调用 3 个食谱接口。首页「更多服务」区域增加入口。

**Tech Stack:** 微信小程序原生（WXML/WXSS/JS）、apifm-wxapi SDK、Vant Weapp 组件库

---

## 文件清单

**新增文件（8 个）：**
- `pages/recipe/index.js` — 列表页逻辑（分类加载、食谱列表、搜索、分页）
- `pages/recipe/index.wxml` — 列表页模板（sidebar + 卡片瀑布流）
- `pages/recipe/index.wxss` — 列表页样式
- `pages/recipe/index.json` — 列表页配置
- `pages/recipe/detail.js` — 详情页逻辑（加载食谱详情数据）
- `pages/recipe/detail.wxml` — 详情页模板（封面 + 食材 + 营养 + 步骤）
- `pages/recipe/detail.wxss` — 详情页样式
- `pages/recipe/detail.json` — 详情页配置

**修改文件（3 个）：**
- `app.json` — 注册 2 个新页面路径
- `pages/home/index.js` — 增加 `recipe()` 跳转方法
- `pages/home/index.wxml` — 「更多服务」区域增加食谱入口

---

### Task 1: 注册页面路由

**Files:**
- Modify: `app.json`

- [ ] **Step 1: 在 app.json 的 pages 数组中添加 2 个新页面路径**

在 `app.json` 的 `"pages"` 数组末尾（`"pages/card/receive"` 之后）添加：

```json
"pages/recipe/index",
"pages/recipe/detail"
```

修改后的 pages 数组末尾：

```json
  "pages": [
    ...,
    "pages/card/receive",
    "pages/recipe/index",
    "pages/recipe/detail"
  ],
```

- [ ] **Step 2: 验证**

检查 `app.json` 是合法 JSON，pages 数组中路径格式正确、无重复。

---

### Task 2: 创建食谱列表页基础结构

**Files:**
- Create: `pages/recipe/index.json`
- Create: `pages/recipe/index.js`
- Create: `pages/recipe/index.wxml`
- Create: `pages/recipe/index.wxss`

- [ ] **Step 1: 创建 `pages/recipe/index.json`**

```json
{
  "navigationBarTitleText": "食谱"
}
```

- [ ] **Step 2: 创建 `pages/recipe/index.js` — 页面骨架**

```js
const WXAPI = require('apifm-wxapi')
Page({
  data: {
    categories: [],       // 分类列表
    currentCategory: 0,   // 当前选中分类ID，0=全部
    recipes: [],          // 食谱列表
    page: 1,              // 当前页码
    name: '',             // 搜索关键词
    loading: false        // 是否正在加载
  },
  onLoad() {
    this.loadCategories()
    this.loadRecipes()
  },
  async loadCategories() {
    const res = await WXAPI.recipeCategories()
    if (res.code == 0) {
      this.setData({
        categories: res.data
      })
    }
  },
  async loadRecipes() {
    if (this.data.loading) return
    this.setData({ loading: true })
    wx.showLoading({ title: '' })
    const _data = {
      page: this.data.page,
      pageSize: 20
    }
    if (this.data.currentCategory) {
      _data.categoryId = this.data.currentCategory
    }
    if (this.data.name) {
      _data.k = this.data.name
    }
    const res = await WXAPI.recipes(_data)
    wx.hideLoading()
    this.setData({ loading: false })
    if (res.code == 0) {
      if (this.data.page == 1) {
        this.setData({
          recipes: res.data.result
        })
      } else {
        this.setData({
          recipes: this.data.recipes.concat(res.data.result)
        })
      }
    } else {
      if (this.data.page == 1) {
        this.setData({
          recipes: []
        })
      }
    }
  },
  onCategoryTap(e) {
    const id = e.currentTarget.dataset.id
    this.setData({
      currentCategory: id,
      page: 1
    })
    this.loadRecipes()
  },
  bindinput(e) {
    this.setData({
      name: e.detail.value
    })
  },
  bindconfirm(e) {
    this.setData({
      page: 1,
      name: e.detail.value
    })
    this.loadRecipes()
  },
  onReachBottom() {
    this.setData({
      page: this.data.page + 1
    })
    this.loadRecipes()
  },
  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/recipe/detail?id=' + id
    })
  }
})
```

- [ ] **Step 3: 创建 `pages/recipe/index.wxml`**

```html
<view class="recipe-container">
  <!-- 搜索栏 -->
  <view class="search-bar">
    <input type="text" placeholder="搜索食谱" value="{{name}}" bindinput="bindinput" bindconfirm="bindconfirm" />
    <image src="/images/icon/search.svg" bindtap="bindconfirm" data-val="{{name}}"></image>
  </view>

  <view class="main-content">
    <!-- 左侧分类 -->
    <scroll-view class="category-sidebar" scroll-y>
      <view class="category-item {{currentCategory == 0 ? 'active' : ''}}" data-id="0" bindtap="onCategoryTap">全部</view>
      <view class="category-item {{currentCategory == item.id ? 'active' : ''}}" wx:for="{{categories}}" wx:key="id" data-id="{{item.id}}" bindtap="onCategoryTap">{{item.name}}</view>
    </scroll-view>

    <!-- 右侧列表 -->
    <view class="recipe-list">
      <van-empty wx:if="{{recipes.length == 0 && !loading}}" description="暂无食谱" />
      <view class="recipe-grid">
        <view class="recipe-card" wx:for="{{recipes}}" wx:key="id" data-id="{{item.id}}" bindtap="goDetail">
          <image class="recipe-img" mode="aspectFill" src="{{item.pic}}"></image>
          <view class="recipe-info">
            <view class="recipe-name van-multi-ellipsis--l2">{{item.name}}</view>
            <view class="recipe-tags" wx:if="{{item.tasteTags && item.tasteTags.length > 0}}">
              <text class="tag" wx:for="{{item.tasteTags}}" wx:for-item="tag" wx:key="*this">{{tag}}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</view>
```

- [ ] **Step 4: 创建 `pages/recipe/index.wxss`**

```css
page {
  background: #f5f5f5;
  min-height: 100vh;
}

.recipe-container {
  min-height: 100vh;
}

/* 搜索栏 */
.search-bar {
  position: relative;
  padding: 20rpx 32rpx;
  background: #fff;
}

.search-bar input {
  width: 100%;
  height: 72rpx;
  border-radius: 36rpx;
  padding-left: 32rpx;
  padding-right: 72rpx;
  background: #f5f5f5;
  font-size: 28rpx;
}

.search-bar image {
  width: 36rpx;
  height: 36rpx;
  position: absolute;
  top: 38rpx;
  right: 52rpx;
}

/* 主体内容区 */
.main-content {
  display: flex;
  height: calc(100vh - 112rpx);
}

/* 左侧分类栏 */
.category-sidebar {
  width: 180rpx;
  height: 100%;
  background: #f8f8f8;
  flex-shrink: 0;
}

.category-item {
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 26rpx;
  color: #666;
  position: relative;
  transition: all 0.2s;
}

.category-item.active {
  background: #fff;
  color: #333;
  font-weight: 600;
}

.category-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6rpx;
  height: 36rpx;
  background: #e64340;
  border-radius: 0 3rpx 3rpx 0;
}

/* 右侧食谱列表 */
.recipe-list {
  flex: 1;
  padding: 16rpx;
  overflow-y: auto;
}

.recipe-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.recipe-card {
  width: 340rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.recipe-card:active {
  transform: scale(0.98);
}

.recipe-img {
  width: 340rpx;
  height: 340rpx;
  background: #f0f0f0;
}

.recipe-info {
  padding: 16rpx;
}

.recipe-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 12rpx;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.tag {
  font-size: 22rpx;
  color: #e64340;
  background: #fff0f0;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}
```

- [ ] **Step 5: 验证**

在微信开发者工具中访问 `/pages/recipe/index`，确认：
- 页面能正常打开，导航栏标题显示「食谱」
- 搜索栏、左侧分类、右侧卡片区域布局正确
- 空状态正常显示 van-empty（因后端接口未实现，列表为空是预期行为）

---

### Task 3: 创建食谱详情页

**Files:**
- Create: `pages/recipe/detail.json`
- Create: `pages/recipe/detail.js`
- Create: `pages/recipe/detail.wxml`
- Create: `pages/recipe/detail.wxss`

- [ ] **Step 1: 创建 `pages/recipe/detail.json`**

```json
{
  "navigationBarTitleText": "食谱详情"
}
```

- [ ] **Step 2: 创建 `pages/recipe/detail.js`**

```js
const WXAPI = require('apifm-wxapi')
Page({
  data: {
    recipe: null
  },
  onLoad(e) {
    if (e.id) {
      this.loadRecipeDetail(e.id)
    }
  },
  async loadRecipeDetail(id) {
    wx.showLoading({ title: '' })
    const res = await WXAPI.recipeDetail(id)
    wx.hideLoading()
    if (res.code == 0) {
      wx.setNavigationBarTitle({
        title: res.data.name
      })
      this.setData({
        recipe: res.data
      })
    } else {
      wx.showToast({
        title: res.msg || '食谱不存在',
        icon: 'none'
      })
    }
  },
  previewImage(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      current: url,
      urls: [url]
    })
  }
})
```

- [ ] **Step 3: 创建 `pages/recipe/detail.wxml`**

```html
<view class="detail-container" wx:if="{{recipe}}">
  <!-- 封面大图 -->
  <image class="cover-img" mode="widthFix" src="{{recipe.pic}}" bindtap="previewImage" data-url="{{recipe.pic}}"></image>

  <!-- 基本信息 -->
  <view class="info-section">
    <view class="recipe-title">{{recipe.name}}</view>
    <view class="recipe-desc" wx:if="{{recipe.description}}">{{recipe.description}}</view>
    <view class="tags-row" wx:if="{{recipe.tasteTags && recipe.tasteTags.length > 0}}">
      <text class="taste-tag" wx:for="{{recipe.tasteTags}}" wx:key="*this">{{item}}</text>
    </view>
  </view>

  <!-- 食材原料 -->
  <view class="section" wx:if="{{recipe.ingredients && recipe.ingredients.length > 0}}">
    <view class="section-title">食材原料</view>
    <view class="ingredient-list">
      <view class="ingredient-item" wx:for="{{recipe.ingredients}}" wx:key="name">
        <text class="ingredient-name">{{item.name}}</text>
        <text class="ingredient-amount">{{item.amount}}</text>
      </view>
    </view>
  </view>

  <!-- 营养成分 -->
  <view class="section" wx:if="{{recipe.nutrition}}">
    <view class="section-title">营养成分（每份）</view>
    <view class="nutrition-grid">
      <view class="nutrition-item" wx:if="{{recipe.nutrition.calories}}">
        <text class="nutrition-value">{{recipe.nutrition.calories}}</text>
        <text class="nutrition-label">热量</text>
      </view>
      <view class="nutrition-item" wx:if="{{recipe.nutrition.protein}}">
        <text class="nutrition-value">{{recipe.nutrition.protein}}</text>
        <text class="nutrition-label">蛋白质</text>
      </view>
      <view class="nutrition-item" wx:if="{{recipe.nutrition.fat}}">
        <text class="nutrition-value">{{recipe.nutrition.fat}}</text>
        <text class="nutrition-label">脂肪</text>
      </view>
      <view class="nutrition-item" wx:if="{{recipe.nutrition.carbs}}">
        <text class="nutrition-value">{{recipe.nutrition.carbs}}</text>
        <text class="nutrition-label">碳水</text>
      </view>
    </view>
  </view>

  <!-- 制作步骤 -->
  <view class="section" wx:if="{{recipe.steps && recipe.steps.length > 0}}">
    <view class="section-title">制作步骤</view>
    <view class="step-list">
      <view class="step-item" wx:for="{{recipe.steps}}" wx:key="order">
        <view class="step-number">{{item.order}}</view>
        <view class="step-content">
          <text class="step-text">{{item.text}}</text>
          <image wx:if="{{item.pic}}" class="step-img" mode="aspectFill" src="{{item.pic}}" bindtap="previewImage" data-url="{{item.pic}}"></image>
        </view>
      </view>
    </view>
  </view>
</view>

<van-empty wx:if="{{!recipe}}" description="加载中..." />
```

- [ ] **Step 4: 创建 `pages/recipe/detail.wxss`**

```css
page {
  background: #f5f5f5;
}

.detail-container {
  padding-bottom: 40rpx;
}

/* 封面大图 */
.cover-img {
  width: 100%;
  background: #f0f0f0;
}

/* 基本信息 */
.info-section {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.recipe-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 12rpx;
}

.recipe-desc {
  font-size: 28rpx;
  color: #999;
  line-height: 1.6;
  margin-bottom: 16rpx;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.taste-tag {
  font-size: 24rpx;
  color: #e64340;
  background: #fff0f0;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}

/* 通用区块 */
.section {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
  padding-left: 12rpx;
  border-left: 6rpx solid #e64340;
}

/* 食材原料 */
.ingredient-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.ingredient-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.ingredient-item:last-child {
  border-bottom: none;
}

.ingredient-name {
  font-size: 28rpx;
  color: #333;
}

.ingredient-amount {
  font-size: 28rpx;
  color: #999;
}

/* 营养成分 */
.nutrition-grid {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.nutrition-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.nutrition-value {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.nutrition-label {
  font-size: 24rpx;
  color: #999;
}

/* 制作步骤 */
.step-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.step-item {
  display: flex;
  gap: 20rpx;
}

.step-number {
  width: 48rpx;
  height: 48rpx;
  line-height: 48rpx;
  text-align: center;
  background: #e64340;
  color: #fff;
  font-size: 26rpx;
  font-weight: 600;
  border-radius: 50%;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
}

.step-img {
  width: 100%;
  height: 320rpx;
  border-radius: 12rpx;
  margin-top: 16rpx;
  background: #f0f0f0;
}
```

- [ ] **Step 5: 验证**

在微信开发者工具中手动访问 `/pages/recipe/detail?id=1`，确认：
- 页面能正常打开，导航栏标题显示「食谱详情」
- van-empty 加载中状态正确显示（因后端接口未实现，无数据是预期行为）
- WXML 中 wx:if 条件渲染逻辑正确，各区块在无数据时均不渲染

---

### Task 4: 添加首页入口

**Files:**
- Modify: `pages/home/index.js`
- Modify: `pages/home/index.wxml`

- [ ] **Step 1: 在 `pages/home/index.js` 中添加 `recipe` 方法**

在 `card()` 方法之后（约第 99 行后）添加：

```js
  recipe() {
    wx.navigateTo({
      url: '/pages/recipe/index',
    })
  },
```

- [ ] **Step 2: 在 `pages/home/index.wxml` 的「更多服务」区域添加食谱入口**

在 `features-grid` 中的最后一个 `feature-item`（`bind:tap="card"` 那个）之后添加：

```html
      <view class="feature-item" bind:tap="recipe">
        <view class="feature-icon-box">
          <image class="feature-icon" src="/images/sc.png"></image>
        </view>
        <view class="feature-name">食谱</view>
      </view>
```

使用 `/images/sc.png`（素材图标）临时替代，后续用户提供 `recipe.png` 后替换 `src`。

- [ ] **Step 3: 验证**

在微信开发者工具中打开首页：
- 「更多服务」区域显示 5 个入口（含新增的「食谱」）
- 点击「食谱」入口可正常跳转到食谱列表页
- 点击左上角返回可正常回到首页

---

### Task 5: 整体联调检查

**Files:**
- All recipe pages + modified home page

- [ ] **Step 1: 检查页面路径注册完整性**

确认 `app.json` 的 `pages` 数组中包含：
- `pages/recipe/index`
- `pages/recipe/detail`

确认 4 个列表页文件和 4 个详情页文件均存在于 `pages/recipe/` 目录下。

- [ ] **Step 2: 检查导航链路完整性**

验证以下跳转链路均可工作：
1. 首页 → 食谱列表页（首页入口点击）
2. 食谱列表页 → 食谱详情页（卡片点击，带 `?id=xxx`）
3. 食谱详情页 → 返回（左上角返回按钮）

- [ ] **Step 3: 检查空状态和边界情况**

- 食谱列表为空时：显示 van-empty「暂无食谱」
- 后端接口失败时：wx.showToast 提示错误信息
- 详情页无数据时：显示 van-empty「加载中...」
- 搜索关键词为空时：显示全部食谱

- [ ] **Step 4: 检查代码风格一致性**

确认：
- API 调用使用 `await WXAPI.xxx()` 风格
- 响应判断使用 `res.code == 0`（非 `===`），与项目惯例一致
- 页面内图片使用 `mode="aspectFill"`（列表卡片）和 `mode="widthFix"`（详情封面）
- 样式使用 `rpx` 单位，与项目一致
