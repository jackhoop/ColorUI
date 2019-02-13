// pages/my/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: app.globalData.userInfo
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
  
    if (!that.data.userInfo){
      // 获取用户信息
      wx.getSetting({
        success: res => {
          console.log("appsetting", res);
          if (!res.authSetting['scope.userInfo']) {
            wx.redirectTo({
              url: '/pages/authentication/index'
            })
          }
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                that.setData({
                  userInfo: res.userInfo
                })
                console.log(res.userInfo)
              }
            })
          }
        }
      })
    }
    
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
  //我的收藏
  mysc:function(){
    wx.navigateTo({
      url: "/pages/my-sc/index"
    })
  },
  //联系我们
  mycontact: function () {
    wx.navigateTo({
      url: "/pages/my-contact/index"
    })
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  copyText:function(e){
    wx.setClipboardData({
      data: e.currentTarget.dataset.text,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      }
    })
  },
   //打电话
  callTel: function (e) {
    wx.makePhoneCall({
      phoneNumber: e.target.dataset.tel //仅为示例，并非真实的电话号码
    })
  },

})