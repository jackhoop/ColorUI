const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    business:null,
    modalTitle:"",
    modalMsg: "",
  },
  onPullDownRefresh: function () {
    var that = this;
    var token = wx.getStorageSync('token')
    wx.request({
      url: app.globalData.serverUrl + "/wx/business/" + app.globalData.appid + "/getBusiness",
      method: 'get',
      header: {
        'Authorization': token
      },
      complete: function () {
        // 隐藏导航栏加载框
        wx.hideNavigationBarLoading();
        // 停止下拉动作
        wx.stopPullDownRefresh();
      },
      success: function (res) {
        that.setData({
          business: res.data.business
        });
      }
    })
  
  },
  onLoad: function () {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userInfo']) {
          wx.redirectTo({
            url: '/pages/authentication/index'
          })
        }
      }
    })
    wx.showLoading({
      title: '加载中',
      mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false  
    })
    var that = this;
    var token = wx.getStorageSync('token')
    wx.request({
      url: app.globalData.serverUrl + "/wx/business/" + app.globalData.appid + "/getBusiness",
      method: 'get',
      header: {
        'Authorization': token
      },
      complete: function () {
        wx.hideLoading()
      },
      success: function(res) {
        console.log(res)
        that.setData({
          business: res.data.business
        });
      }
    })
  },
  //店铺入驻
  businessrz:function(){
    wx.navigateTo({
      url: "/pages/settledin/index"
    })
  },
  //店铺管理
  businessAdmin:function(e){
    var that = this;
    if (that.data.business.useStatus == "审核中" ){
      that.setData({
        modalTitle: "提示",
        modalMsg: "店铺审核中不能编辑！",
        modalName: e.currentTarget.dataset.target
      })
      return;
    }
    if (that.data.business.useStatus == "注销") {
      that.setData({
        modalTitle: "提示",
        modalMsg: "店铺已注销不能编辑！",
        modalName: e.currentTarget.dataset.target
      })
      return;
    }
    
    wx.navigateTo({
      url: "/pages/settledin/index?id=" + e.currentTarget.dataset.id
    })
  },

  //查看店铺
  ckAdmin:function(e){
    var that = this;
    if (!that.data.business) {
      that.setData({
        modalTitle: "提示",
        modalMsg: "你还没有店铺，请先入驻",
        modalName: e.currentTarget.dataset.target
      })
      return;
    }
    wx.navigateTo({
      url: "/pages/business-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  //商品管理
  spAdmin:function(e){
    var that = this;
    if (!that.data.business) {
      that.setData({
        modalTitle: "提示",
        modalMsg: "你还没有店铺，请先入驻",
        modalName: e.currentTarget.dataset.target
      })
      return;
    }

    if (that.data.business.useStatus == "审核中") {
      that.setData({
        modalTitle: "提示",
        modalMsg: "店铺审核中，不能进行商品管理！",
        modalName: e.currentTarget.dataset.target
      })
      return;
    }
    if (that.data.business.useStatus == "未通过") {
      that.setData({
        modalTitle: "提示",
        modalMsg: "店铺审核未通过不能编辑！",
        modalName: e.currentTarget.dataset.target
      })
      return;
    }


    wx.navigateTo({
      url: "/pages/goods/index"
    })
  },
  //店铺二维码
  qrAdmin:function(e){
    var that = this;
    if (!that.data.business) {
      that.setData({
        modalTitle: "提示",
        modalMsg: "你还没有店铺，请先入驻",
        modalName: e.currentTarget.dataset.target
      })
      return;
    }

    if (that.data.business.useStatus == "审核中") {
      that.setData({
        modalTitle: "提示",
        modalMsg: "店铺审核中，不能查看二维码！",
        modalName: e.currentTarget.dataset.target
      })
      return;
    }
    if (that.data.business.useStatus == "未通过") {
      that.setData({
        modalTitle: "提示",
        modalMsg: "店铺审核未通过，不能查看二维码！",
        modalName: e.currentTarget.dataset.target
      })
      return;
    }

    // this.setData({
    //   modalName:"Image"
    // })
    wx.previewImage({
      current: that.data.business.logoQrCode, // 当前显示图片的http链接  
      urls: [that.data.business.logoQrCode] // 需要预览的图片http链接列表  
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
});