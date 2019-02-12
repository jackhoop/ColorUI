var QQMapWX = require('../../utils/qqmap-wx-jssdk');
const app = getApp();
var qqmapsdk;
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    cardCur: 0,
    TabCur: 0,
    page: 0,
    search: '',
    isLoad: false,
    loadStatus: true,
    pageSize: 5,
    content: [],
    scrollLeft: 0,
    tabs: [{
      id: 0,
      name: '商品信息'
    }, {
      id: 1,
      name: '店铺介绍'
    }],
    tower: []
  },
  onLoad(e) {
    this.towerSwiper('tower');
    // 初始化towerSwiper 传已有的数组名即可

    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: '6CXBZ-QNVRU-ITIVQ-4ALSI-WV7QQ-KHFNQ' // 必填
    });

    var that = this;
    that.getBusinessInfo(e.id)

    that.getGoodsList()
   
  },
  onShareAppMessage(res) {
    var that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }

    return {
      title: that.data.business.name,
      path: '/pages/business-details/index?id=' + that.data.business.id
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
        goodsStatus:"上架",
        pageSize: that.data.pageSize
      },
      success: function (res) {
        if (res.statusCode == "200") {
          console.log(res.data.content)
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
  //收藏
  collection:function(e){
    var that = this;
    var token = wx.getStorageSync('token')
    wx.showLoading({
      title: '请求中...',
      mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false  
    })
    wx.request({
      url: app.globalData.serverUrl + "/wx/business/" + app.globalData.appid + "/collection",
      method: 'get',
      header: {
        'Authorization': token
      },
      data: {
        id: that.data.business.id,
        type: e.currentTarget.dataset.type
      },
      success: function (res) {
        that.setData({
          collection: res.data.collection
        });
      },
       complete: function () {
        wx.hideLoading()
      },
    })
  },
  getBusinessInfo:function(id){
    wx.showLoading({
      title: '加载中',
      mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false  
    })

    var that = this;
    var token = wx.getStorageSync('token')
    wx.request({
      url: app.globalData.serverUrl + "/wx/business/" + app.globalData.appid + "/getBusinessById",
      method: 'get',
      header: {
        'Authorization': token
      },
      data:{
        id: id
      },
      complete: function () {
        wx.hideLoading()
      },
      success: function (res) {
        if (res.data.business && res.data.business.adImages) {
          var arr = JSON.parse(res.data.business.adImages)
          that.setData({
            tower: arr
          });
        }
        if (res.data.business && res.data.business.jcImages) {
          var arr = JSON.parse(res.data.business.jcImages)
          that.setData({
            jcImages: arr
          });
        }
        that.setData({
          business: res.data.business,
          collection: res.data.collection
        });

        app.getPermissionLocation(function (res) {
          console.log(res);
          var from = {
            latitude: res.latitude,
            longitude: res.longitude
          }
          var to = [{
            latitude: that.data.business.lat,
            longitude: that.data.business.lon
          }]
          console.log(to)

          that.calculateDistance(from, to);
        });
        console.log(that.data.tower);
      }
    })
  },
  DotStyle(e) {
    this.setData({
      DotStyle: e.detail.value
    })
  },
  // cardSwiper
  cardSwiper(e) {
    this.setData({
      cardCur: e.detail.current
    })
  },
  // towerSwiper
  // 初始化towerSwiper
  towerSwiper(name) {
    let list = this.data[name];
    for (let i = 0; i < list.length; i++) {
      list[i].zIndex = parseInt(list.length / 2) + 1 - Math.abs(i - parseInt(list.length / 2))
      list[i].mLeft = i - parseInt(list.length / 2)
    }
    this.setData({
      towerList: list
    })
  },

  // towerSwiper触摸开始
  towerStart(e) {
    this.setData({
      towerStart: e.touches[0].pageX
    })
  },

  // towerSwiper计算方向
  towerMove(e) {
    this.setData({
      direction: e.touches[0].pageX - this.data.towerStart > 0 ? 'right' : 'left'
    })
  },

  // towerSwiper计算滚动
  towerEnd(e) {
    let direction = this.data.direction;
    let list = this.data.towerList;
    if (direction == 'right') {
      let mLeft = list[0].mLeft;
      let zIndex = list[0].zIndex;
      for (let i = 1; i < list.length; i++) {
        list[i - 1].mLeft = list[i].mLeft
        list[i - 1].zIndex = list[i].zIndex
      }
      list[list.length - 1].mLeft = mLeft;
      list[list.length - 1].zIndex = zIndex;
      this.setData({
        towerList: list
      })
    } else {
      let mLeft = list[list.length - 1].mLeft;
      let zIndex = list[list.length - 1].zIndex;
      for (let i = list.length - 1; i > 0; i--) {
        list[i].mLeft = list[i - 1].mLeft
        list[i].zIndex = list[i - 1].zIndex
      }
      list[0].mLeft = mLeft;
      list[0].zIndex = zIndex;
      this.setData({
        towerList: list
      })
    }
  },
  tabSelect(e) {
    console.log(e);
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
  },
  //导航
  toAddress: function (e) {
    var that = this;
    wx.openLocation({
      latitude: that.data.business.lat,
      longitude: that.data.business.lon,
      scale: 18,
      //name: '华乾大厦',
     // address: '金平区长平路93号'
    })
  },
  //电话
  callTel: function (e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.tel //仅为示例，并非真实的电话号码
    })
  },
  //距离计算
  calculateDistance: function (fromd,tod) {
    var that = this;
     qqmapsdk.calculateDistance({
              //mode: 'driving',//可选值：'driving'（驾车）、'walking'（步行），不填默认：'walking',可不填
              //from参数不填默认当前地址
              //获取表单提交的经纬度并设置from和to参数（示例为string格式）
              from: fromd, //若起点有数据则采用起点坐标，若为空默认当前地址
              to: tod, //终点坐标
              success: function (res) {//成功后的回调
                  console.log(res);
                  var res = res.result;
                  var distance = res.elements[0].distance;
                  var jl = '';
                  if (distance < 1000)
                    jl = distance + "米"
                   
                  else if (distance > 1000)
                    jl = (Math.round(distance / 100) / 10).toFixed(1) + "公里"
                   
                 
                 that.setData({ //设置并更新distance数据
                   distance: jl
                  });
              },
              fail: function (error) {
                  console.error(error);
              },
              complete: function (res) {
                  console.log(res);
              }
        });
  },
  /**   
     * 预览图片  
     */
  previewImage: function (e) {
    var that = this;
   
    if (e.target.dataset.src){
      var current = e.target.dataset.src;
      wx.previewImage({
        current: current, // 当前显示图片的http链接  
        urls: that.data.jcImages // 需要预览的图片http链接列表  
      })
    }
    if (e.target.dataset.sp){
      var current = e.target.dataset.sp;
      wx.previewImage({
        current: current, // 当前显示图片的http链接  
        urls: [current] // 需要预览的图片http链接列表  
      })
    }
  
  }
});