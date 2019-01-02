const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    business:null,
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
  }
});