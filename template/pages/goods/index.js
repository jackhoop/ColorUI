// pages/goods/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    TabCur: 0,
    page: 0,
    search:'',
    isLoad: false,
    loadStatus: true,
    pageSize: 5,
    content:[],
    tabs: [{
      id: 0,
      name: '在售'
    }, {
      id: 1,
      name: '仓库中'
    }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.getGoodsList()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    if (that.data.loadStatus && !that.data.isLoad) {
      that.setData({
        loadStatus: false
      })
      that.setData({
        page: that.data.page + 1
      })
      // 上拉获取更多数据
      this.getGoodsList()
    }
  },
  getGoodsList: function () {
    var that = this;
    var token = wx.getStorageSync('token')
    wx.request({
      url: app.globalData.serverUrl + "/wx/goods/" + app.globalData.appid + "/list",
      header: {
        'Authorization': token
      },
      data: {
        name: that.data.search,
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
  goodsStatus(e){


  },
  search(e){
    let that = this;
    that.setData({
      content: [],
      page: 0,
      isLoad: false,
      loadStatus: true,
    })
    that.getGoodsList()
  },
  inputSearch: function (e) {
    this.setData({
      search: e.detail.value
    });
  },
  del(e){
    var id = e.currentTarget.dataset.id;
    var that = this;
    wx.showLoading({
      title: '删除中...',
      mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false  
    })
    var token = wx.getStorageSync('token')
    wx.request({
      url: app.globalData.serverUrl + "/wx/goods/" + app.globalData.appid + "/del",
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
              that.getGoodsList()
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
  edit(e){
    wx.navigateTo({
      url: "/pages/goods-add/index?id=" + e.currentTarget.dataset.id
    })
  },
  //添加商品
  goodsAdd(e){
    wx.redirectTo({
      url: "/pages/goods-add/index"
    })
  },
  tabSelect(e) {
    var that = this;
    if (e.currentTarget.dataset.id != that.data.TabCur) {
      that.setData({
        page: 0,
        isLoad: false,  
        content: [],
        loadType: e.currentTarget.dataset.type,
        TabCur: e.currentTarget.dataset.id,
        scrollLeft: (e.currentTarget.dataset.id - 1) * 60
      })

      that.getBusinessList();
    }

  },
  
})