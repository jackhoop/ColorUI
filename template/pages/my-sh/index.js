var QQMapWX = require('../../utils/qqmap-wx-jssdk');
const app = getApp();
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    content: [],
    page: 0,
    isLoad: false,
    loadStatus: true,
    location: null,
    pageSize: 5
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.getShList();
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
  //获取收藏列表
  getShList: function () {
    var token = wx.getStorageSync('token')
    var that = this;
    wx.request({
      url: app.globalData.serverUrl + "/wx/business/" + app.globalData.appid + "/shlist",
      header: {
        'Authorization': token
      },
      data: {
        page: that.data.page,
        pageSize: that.data.pageSize,
   
      },
      success: function (res) {
        if (res.statusCode == "200") {
          console.log(res)
       
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
  //打电话
  callTel: function (e) {
    wx.showModal({
      title: '温馨提示',
      content: '您将要拨打电话:' + e.target.dataset.tel,
      confirmText: "确定",
      cancelText: "取消",
      success: function (res) {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: e.target.dataset.tel //仅为示例，并非真实的电话号码
          })
        }
      }
    });
  },
  //取消动作
  collection: function (e) {
    var that = this;
    wx.showModal({
      title: '温馨提示',
      content: "确定取消收藏该店铺",
      confirmText: "确定",
      cancelText: "取消",
      success: function (res) {
        if (res.confirm) {
          that.del(e.target.dataset.id)
        }
      }
    });
  },
  //取消收藏
  del: function (id) {
    var that = this;
    var token = wx.getStorageSync('token')
    wx.showLoading({
      title: '请求中...',
      mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false  
    })
    wx.request({
      url: app.globalData.serverUrl + "/wx/business/" + app.globalData.appid + "/shlist",
      method: 'get',
      header: {
        'Authorization': token
      },
      data: {
        id: id,
      },
      success: function (res) {
        //在提示的成功函数中初始化当前加载订单页为第一页，清空订单列表数据
        that.setData({ page: 0, content: [] });
        //用onLoad周期方法重新加载，实现当前页面的刷新
        that.onLoad()

      },
      complete: function () {
        wx.hideLoading()
      },
    })
  },
  //商家详细
  toDetailsTap: function (e) {
    console.log(e)
    wx.navigateTo({
      url: "/pages/my-sh-view/index?id=" + e.currentTarget.dataset.id
    })

  },
  //距离计算
  calculateDistance: function (res1, tod) {
    var that = this;
    if (tod.length == 0) {
      that.setData({
        isLoad: res1.data.last,
        content: that.data.content.concat(res1.data.content)
      })
      return;
    }
    qqmapsdk.calculateDistance({
      //mode: 'driving',//可选值：'driving'（驾车）、'walking'（步行），不填默认：'walking',可不填
      //from参数不填默认当前地址
      //获取表单提交的经纬度并设置from和to参数（示例为string格式）
      //  from: fromd, //若起点有数据则采用起点坐标，若为空默认当前地址
      to: tod, //终点坐标
      success: function (res) {//成功后的回调
        console.log(res)
        var elements = res.result.elements;
        for (var index in res1.data.content) {
          console.log(elements[index])
          var jl = '';
          var distance = elements[index].distance
          if (distance < 1000)
            jl = distance + "米"

          else if (distance > 1000)
            jl = (Math.round(distance / 100) / 10).toFixed(1) + "公里"
          var addr = '';
          var city = res1.data.content[index].city
          var address = res1.data.content[index].address
          addr = city.split('-')[1] + city.split('-')[2] + address;
          addr = addr.replace("NaN", "")
          res1.data.content[index].jl = jl
          res1.data.content[index].addr = addr
        }
        that.setData({
          isLoad: res1.data.last,
          content: that.data.content.concat(res1.data.content)
        })
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {

      }
    });
  },

})