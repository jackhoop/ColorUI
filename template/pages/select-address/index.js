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
    title: '地址',
    content: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    var that = this;
    that.getAddressList()
   
    if (e.type) {
      that .setData({
        title: '选择地址',
        type: e.type
      })
    }
    console.log(e) 
  },
  select: function (e) { 
    var that = this;
    if (that.data.type =='select') { 
      var address = that.data.content[e.currentTarget.dataset.index] 
      wx.setStorageSync('address', address)
      wx.redirectTo({
        url: "/pages/oder-confirm/index"
      })
    }
  },
  delAddress: function (e) {
    var that = this;
    wx.showModal({
      title: '温馨提示',
      content: '确认删除数据',
      confirmText: "确定",
      cancelText: "取消",
      success: function (res) {
        if (res.confirm) {
          that.del(e);
        }
      }
    });
  },
  del(e) {
    var id = e.currentTarget.dataset.id;
    var that = this;
    wx.showLoading({
      title: '删除中...',
      mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false  
    })
    var token = wx.getStorageSync('token')
    wx.request({
      url: app.globalData.serverUrl + "/wx/account/" + app.globalData.appid + "/del",
      method: 'get',
      header: {
        'Authorization': token
      },
      data: {
        id: id
      },
      complete: function () {
        setTimeout(function () {
          wx.hideLoading()
        }, 2000)
      },
      success: (res) => {
        if (res.data.code == "0") {
          wx.showToast({
            title: res.data.msg,//提示文字
            duration: 2000,//显示时长
            mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false  
            icon: 'success', //图标，支持"success"、"loading"  
            success: function () {
              wx.hideLoading()
              that.setData({
                content: [],
                page: 0,
                isLoad: false,
                loadStatus: true,
              })
              that.getAddressList()
            },//接口调用成功
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
  },
  
  mz(id) {
    console.log(id)
    var that = this;
    wx.showLoading({
      title: '设置中...',
      mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false  
    })
    var token = wx.getStorageSync('token')
    wx.request({
      url: app.globalData.serverUrl + "/wx/account/" + app.globalData.appid + "/mz",
      method: 'post',
      header: {
        'Authorization': token,
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        id: id
      },
      complete: function () {
        setTimeout(function () {
          wx.hideLoading()
        }, 2000)
      },
      success: (res) => {
        if (res.data.code == "0") {
          wx.showToast({
            title: res.data.msg,//提示文字
            duration: 2000,//显示时长
            mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false  
            icon: 'success', //图标，支持"success"、"loading"  
            success: function () {
              wx.hideLoading()
              that.setData({
                content: [],
                page: 0,
                isLoad: false,
                loadStatus: true,
              })
              that.getAddressList()
            },//接口调用成功
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
  },
  edit(e) {
    wx.navigateTo({
      url: "/pages/address-add/index?id=" + e.currentTarget.dataset.id
    })
  },
  radiochange: function (e) {
    var that = this;
    that.mz(e.detail.value)
    console.log('radio发生change事件，携带的value值为：', e.detail.value)
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
    var that = this;
    wx.navigateTo({
      url: "/pages/address-add/index?type=" + that.data.type
    })
  },
})