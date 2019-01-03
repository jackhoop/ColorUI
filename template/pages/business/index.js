const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    business:null,
    modalTitle:"",
    modalMsg: "",
  },

  onLoad: function () {
    var that = this;
    var token = wx.getStorageSync('token')
    wx.request({
      url: app.globalData.serverUrl + "/wx/business/" + app.globalData.appid + "/getBusiness",
      method: 'get',
      header: {
        'Authorization': token
      },
      success: function(res) {
        that.setData({
          business: res.data.business
        });
        console.log(that.data.business);
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
    if (that.data.business.useStatus == "审核中"){
      that.setData({
        modalTitle: "提示",
        modalMsg: "店铺审核中不能编辑！",
        modalName: e.currentTarget.dataset.target
      })
      return ;
    }
  },
  //查看店铺
  ckAdmin:function(e){
    var that = this;
    if (!that.data.business) {
      that.setData({
        modalTitle: "提示",
        modalMsg: "你还没有店铺！，请先入驻",
        modalName: e.currentTarget.dataset.target
      })
      return;
    }
  },
  //商品管理
  spAdmin:function(e){
    var that = this;
    if (!that.data.business) {
      that.setData({
        modalTitle: "提示",
        modalMsg: "你还没有店铺！，请先入驻",
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
  },
  //店铺二维码
  qrAdmin:function(e){
    var that = this;
    if (!that.data.business) {
      that.setData({
        modalTitle: "提示",
        modalMsg: "你还没有店铺！，请先入驻",
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
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
});