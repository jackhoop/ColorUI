const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    page:null,
  },
  onLoad(e) {
    let that = this;
    console.log("onLoad：" + decodeURIComponent(e.page));
    that.setData({
      page: decodeURIComponent(e.page)
    })
    that.handler()
  },
  handler: function (data){
    let that = this;
    if (data&&data.detail.authSetting["scope.userLocation"] === true){
      console.log("0000" + that.data.page);
      var page = that.data.page ? that.data.page : "/pages/index/index";
      console.log("1111111"+page);
      if (page.indexOf("pages/index/index") != -1 || page.indexOf("pages/business/index") != -1 || page.indexOf("pages/my/index") != -1) {
        wx.switchTab({
          url: '/pages/index/index'　　// 首页
        })

     }else{
        wx.redirectTo({
          url: "/"+page
        })
     }
    }
  }

});