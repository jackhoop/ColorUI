// pages/select-address/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    isLoad: false,
    loadStatus: true,
    page: 0,
    pageSize: 5,
    content: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.getAddressList()
  },

  getAddressList: function () {
    var that = this;
    var token = wx.getStorageSync('token')
    wx.request({
      url: app.globalData.serverUrl + "/wx/account/" + app.globalData.appid + "/list",
      header: {
        'Authorization': token
      },
      data: {
        page: that.data.page,
        pageSize: that.data.pageSize
      },
      success: function (res) {
        if (res.statusCode == "200") {
          that.setData({
            isLoad: res.data.last,
            content: that.data.content.concat(res.data.content)
          })
        }
      },
      complete: function () {
        that.setData({
          loadStatus: true
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  addAddress: function () {
    wx.navigateTo({
      url: "/pages/address-add/index"
    })
  },
})