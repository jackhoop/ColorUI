const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
  },
  onLoad() {
    let that = this;
    that.handler()
  },
  handler: function (data){
    console.log(data)
    if (data&&data.detail.authSetting["scope.userLocation"] === true){
      wx.switchTab({
        url: '/pages/index/index'　　// 首页
      })
    }
  }

});