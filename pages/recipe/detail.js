const WXAPI = require('apifm-wxapi')
Page({
  data: {
    recipe: null
  },
  onLoad(e) {
    if (e.id) {
      this.loadRecipeDetail(e.id)
    } else {
      wx.showToast({
        title: '食谱不存在',
        icon: 'none'
      })
      setTimeout(function() {
        wx.navigateBack()
      }, 1500)
    }
  },
  async loadRecipeDetail(id) {
    wx.showLoading({ title: '' })
    try {
      const res = await WXAPI.recipeDetail(id)
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
    } catch (e) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
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
