const WXAPI = require('apifm-wxapi')
Page({
  data: {
    categories: [],       // 分类列表
    currentCategory: 0,   // 当前选中分类ID，0=全部
    recipes: [],          // 食谱列表
    page: 1,              // 当前页码
    totalPage: 1,         // 总页数
    name: '',             // 搜索关键词
    loading: false        // 是否正在加载
  },
  onLoad() {
    this.loadCategories()
    this.loadRecipes()
  },
  async loadCategories() {
    try {
      const res = await WXAPI.recipeCategories()
      if (res.code == 0) {
        this.setData({
          categories: res.data
        })
      }
    } catch (e) {
      // 分类加载失败不影响列表展示
    }
  },
  async loadRecipes() {
    if (this.data.loading) return
    this.setData({ loading: true })
    wx.showLoading({ title: '' })
    try {
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
      if (res.code == 0) {
        if (this.data.page == 1) {
          this.setData({
            recipes: res.data.result,
            totalPage: res.data.totalPage || 1
          })
        } else {
          this.setData({
            recipes: this.data.recipes.concat(res.data.result)
          })
        }
      } else {
        if (this.data.page == 1) {
          this.setData({ recipes: [] })
        }
      }
    } catch (e) {
      if (this.data.page == 1) {
        this.setData({ recipes: [] })
      }
    } finally {
      wx.hideLoading()
      this.setData({ loading: false })
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
    if (this.data.page >= this.data.totalPage) return
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
