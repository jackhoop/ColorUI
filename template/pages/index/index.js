var QQMapWX = require('../../utils/qqmap-wx-jssdk');
const app = getApp();
var qqmapsdk;
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    cardCur: 0,
    TabCur: 0,
    loadType:'',
    district:'',
    scrollLeft: 0,
    page: 0,
    isLoad: false,
    loadStatus: true,
    pageSize: 5,
    content: [],
    tabs: [{
      id: 0,
      name: '附近发现',
      type: 'jl'
    }, {
      id: 1,
      name: '人气最高',
      type:'hot'
    }],
    tower: [{
      id: 0,
      url: 'https://image.weilanwl.com/img/4x3-1.jpg'
    }, {
      id: 1,
      url: 'https://image.weilanwl.com/img/4x3-2.jpg'
    }, {
      id: 2,
      url: 'https://image.weilanwl.com/img/4x3-3.jpg'
    }, {
      id: 3,
      url: 'https://image.weilanwl.com/img/4x3-4.jpg'
    }, {
      id: 4,
      url: 'https://image.weilanwl.com/img/4x3-2.jpg'
    }, {
      id: 5,
      url: 'https://image.weilanwl.com/img/4x3-4.jpg'
    }, {
      id: 6,
      url: 'https://image.weilanwl.com/img/4x3-2.jpg'
    }]
  },
  onLoad() {
    qqmapsdk = new QQMapWX({
      key: '6CXBZ-QNVRU-ITIVQ-4ALSI-WV7QQ-KHFNQ' // 必填
    });

    this.towerSwiper('tower');
    // 初始化towerSwiper 传已有的数组名即可
    var that = this;
    app.getPermissionLocation(function(data){
      console.log(data)
      // 调用接口
      qqmapsdk.reverseGeocoder({
        location: {
          latitude: data.latitude,
          longitude: data.longitude
        },
        success: function (res) {
          console.log(res);
          that.setData({
            district: res.result
          })
          that.getBusinessList()
        }
      });

    
    });
   
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let that = this;
    if (that.data.loadStatus && !that.data.isLoad) {
      that.setData({
        loadStatus: false
      })
      that.setData({
        page: that.data.page + 1
      })
      // 上拉获取更多数据

      that.getBusinessList()
    }
  },
  //获取商户列表
  getBusinessList: function () {
    var that = this;
    console.log(that.data.district)
    wx.request({
      url: app.globalData.serverUrl + "/wx/business/" + app.globalData.appid + "/list",
      data: {
        sortStr: that.data.loadType,
        page: that.data.page, 
        pageSize: that.data.pageSize,
        lat: that.data.district.location.lat,
        lon: that.data.district.location.lng,
      },
      success: function(res) {
        if (res.statusCode == "200") {
          for (var index in res.data.content) {
            var jl='';
            var distance = res.data.content[index].distance
            if (distance < 1000)
              jl = distance + "米"

            else if (distance > 1000)
              jl = (Math.round(distance / 100) / 10).toFixed(1) + "公里"
            var addr = '';
            var city = res.data.content[index].city
            var address = res.data.content[index].address
            addr = city.split('-')[1] + city.split('-')[2] +address;
            addr = addr.replace("NaN","") 
            res.data.content[index].jl = jl
            res.data.content[index].addr = addr
          }
         
         
          console.log(res.data.content)
          that.setData({
            isLoad: res.data.last,
            content: that.data.content.concat(res.data.content)
          })
        }
      },
      complete: function() {
        that.setData({
          loadStatus: true
        })
      }
    })
  },
  //商家详细
  toDetailsTap: function (e) {
    console.log(e)
    wx.navigateTo({
      url: "/pages/business-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  //打电话
  callTel: function (e) {
    console.log(e.target.dataset.tel)
    wx.showModal({
      title: '温馨提示',
      content: '您将要拨打电话:' + e.target.dataset.tel,
      confirmText: "确定",
      cancelText: "取消",
      success: function (res) {
        console.log(res);
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: e.target.dataset.tel //仅为示例，并非真实的电话号码
          })
        }
      }
    });
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
    var that = this;
    if (e.currentTarget.dataset.id != that.data.TabCur){
      console.log(e.currentTarget.dataset.type)
      that.setData({
        page: 0,
        isLoad: false,
        content: [],
        loadType: e.currentTarget.dataset.type,
        TabCur: e.currentTarget.dataset.id,
        scrollLeft: (e.currentTarget.dataset.id - 1) * 60
      })

      that.getBusinessList()
    }
   
  }
});