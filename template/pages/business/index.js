const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
  },

  onLoad: function () {
    // wx.request({
    //   url: 'https://api.it120.cc/' + app.globalData.subDomain + '/banner/list',
    //   data: {
    //     key: 'mallName'
    //   },
    //   success: function(res) {
    //     if (res.data.code == 404) {
    //       wx.showModal({
    //         title: '提示',
    //         content: '请在后台添加 banner 轮播图片',
    //         showCancel: false
    //       })
    //     } else {
    //       that.setData({
    //         banners: res.data.data
    //       });
    //     }
    //   }
    // })
  }
});