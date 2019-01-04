const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    cardCur: 0,
    TabCur: 0,
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
  onLoad() {
    this.towerSwiper('tower');
    // 初始化towerSwiper 传已有的数组名即可


    var that = this;
    var token = wx.getStorageSync('token')
    wx.request({
      url: app.globalData.serverUrl + "/wx/business/" + app.globalData.appid + "/getBusiness",
      method: 'get',
      header: {
        'Authorization': token
      },
      success: function (res) {
        if (res.data.business&&res.data.business.adImages){
          var arr = JSON.parse(res.data.business.adImages)
          that.setData({
            tower: arr
          });
        }

        that.setData({
          business: res.data.business
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
    
    wx.openLocation({
      latitude: 23.362490,
      longitude: 116.715790,
      scale: 18,
      //name: '华乾大厦',
     // address: '金平区长平路93号'
    })
  },
  //电话
  callTel: function (e) {
    wx.makePhoneCall({
      phoneNumber: '18285053934' //仅为示例，并非真实的电话号码
    })
  },
});