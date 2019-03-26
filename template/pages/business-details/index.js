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
    selectAll:true,
    editType:"编辑",
    pageSize: 5,
    content: [],
    gwc: [],
    scrollLeft: 0, 
    buyNumber: 1,
    buyNumMin: 1,
    buyNumMax: 1000,
    token: wx.getStorageSync('token'),
    tabs: [{
      id: 0,
      name: '桶装水'
    }, {
      id: 1,
      name: '饮水机'
    }],
    tower: []
  },
  onUnload(e){
    var that = this;
    if (that.data.business.id){
      wx.setStorageSync(that.data.business.id+"gwc", that.data.gwc)
      var countDown = Date.parse(new Date())
      wx.setStorageSync(that.data.business.id + "time", countDown)
    }
  },
  onLoad(e) {
    this.towerSwiper('tower');
    // 初始化towerSwiper 传已有的数组名即可


    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: '6CXBZ-QNVRU-ITIVQ-4ALSI-WV7QQ-KHFNQ' // 必填
    });

    var that = this;
    var id = e.id;
   // id ="2c9f6afe68ffc4e10168ffcfd89f0002";
    that.getBusinessInfo(id)

    that.getGoodsList(id)

    
   
  },
  onShareAppMessage(res) {
    var that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }

    return {
      title: that.data.business.name,
      path: '/pages/business-details/index?id=' + that.data.business.id
    }
  },
  getGoodsList: function (id) {
    var that = this;
    var token = wx.getStorageSync('token')
    wx.request({
      url: app.globalData.serverUrl + "/wx/goods/" + app.globalData.appid + "/list",
      data: {
        name: that.data.search,
        page: that.data.page,
        businessId:id,
        goodsStatus:"上架",
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
  //收藏
  collection:function(e){
    var that = this;
    if (!that.data.business.id){
      wx.showModal({
        title: '温馨提示',
        content: "确定取消收藏该店铺",
        cancelText: "取消",
      });
      return;
    }
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
    var time = wx.getStorageSync(id);
    wx.setStorageSync(id, new Date().getTime());

    var token = wx.getStorageSync('token')  
    wx.request({
      url: app.globalData.serverUrl + "/wx/business/" + app.globalData.appid + "/getBusinessById",
      method: 'get',
      header: {
        'Authorization': token
      },
      data:{
        id: id,
        t: time
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
        var gwc = wx.getStorageSync(res.data.business.id+"gwc");
        gwc = gwc ? gwc:[];
        var time = wx.getStorageSync(res.data.business.id + "time");
        time = time ? time:0;
        var countDown = Date.parse(new Date())
        var diff = countDown - time;
        var day = diff / (24 * 60 * 60 * 1000);
        if (day ==1){
          wx.setStorageSync(res.data.business.id + "gwc", [])
          wx.setStorageSync(res.data.business.id + "time",0)
        }
        that.setData({
          business: res.data.business,
          collection: res.data.collection,
          gwc: gwc
        });
        app.openPermissionLocation();
        var to = [{
            latitude: that.data.business.lat,
            longitude: that.data.business.lng
          }]
        that.calculateDistance(null, to);
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
      longitude: that.data.business.lng,
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
            //  from: fromd, //若起点有数据则采用起点坐标，若为空默认当前地址
              to: tod, //终点坐标
              success: function (res) {//成功后的回调
                  console.log(res)
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
  
  },
  showModal(e) {
    var that = this;
    var item = that.data.content[e.currentTarget.dataset.index];
    console.log(item)
    this.setData({
      modalName: e.currentTarget.dataset.target,
      goods: item,
    })
  },
  showGWZModal(e) {
    var that = this;
    var total = 0;
    var totalMoney = 0;
    for (var i = 0; i < that.data.gwc.length; i++) {
      var goods = that.data.gwc[i];
      if (goods.active){
        total++
        totalMoney += goods.price * goods.number
      }
    }
    var selectAll = total == that.data.gwc.length ? true : false
    this.setData({
      modalName: e.currentTarget.dataset.target,
      gwc: that.data.gwc,
      total: total,
      totalMoney: totalMoney.toFixed(2),
      selectAll: selectAll
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null,
      editType: "编辑"
    })
  },
  numJianTap: function () {
    if (this.data.buyNumber > this.data.buyNumMin) {
      var currentNum = this.data.buyNumber;
      currentNum--;
      this.setData({
        buyNumber: currentNum
      })
    }
  },
  numJiaTap: function () {
    console.log(this.data.buyNumber);
    if (this.data.buyNumber < this.data.buyNumMax) {
      var currentNum = this.data.buyNumber;
      currentNum++;
      this.setData({
        buyNumber: currentNum
      })
    }
  },
  numJianTapGwc: function (e) {
    var that = this;
    var item = that.data.gwc[e.currentTarget.dataset.index];
    console.log(item);
    if (item.number > this.data.buyNumMin) {
      item.number = item.number-1;
      var key = "gwc[" + e.currentTarget.dataset.index + "]"
      this.setData({
        key: item,
        gwc: that.data.gwc
      })
    }
  
  },
  numJiaTapGwc: function (e) {
    var that = this;
    var item = that.data.gwc[e.currentTarget.dataset.index];
    console.log(item)
    if (item.number < this.data.buyNumMax) {
      item.number = item.number + 1;
      var key = "gwc[" + e.currentTarget.dataset.index + "]"
      this.setData({
        key: item,
        gwc: that.data.gwc
      })
    }
  },
  //购物车
  addGWC:function(){
    var that = this;
    var item = that.data.goods;
    item.number = that.data.buyNumber;
    item.active = true;
    var flag = false;
    for (var i = 0; i < that.data.gwc.length; i++) {
      var goods = that.data.gwc[i];
      if (item.id == goods.id) {
        goods.number = goods.number + that.data.buyNumber;
        var key = "gwc[" + i + "]"
        that.setData({
          key: goods,
          modalName: null,
          buyNumber: 1,
          goods:{}
        })
        console.log(that.data.gwc)
        flag = true;
        break;
      }
    }
    if (flag==true){
      return;
    }
    that.setData({
      gwc: that.data.gwc.concat(item),
      modalName: null,
      buyNumber:1,
      goods:{}
    })
    console.log(that.data.gwc)
  },
  //购物车编辑
  gwcEdit:function(e){
    var that = this;
    var type = e.currentTarget.dataset.type;
    if (type =="编辑"){
      that.setData({
        editType: "完成",
      })
    }else{
      that.setData({
        editType: "编辑",
      })
    }
   
    var total = 0;
    var totalMoney = 0;
    for (var i = 0; i < that.data.gwc.length; i++) {
      var goods = that.data.gwc[i];
      if (goods.active) {
        total++
        totalMoney += goods.price * goods.number
      }
    }
    var selectAll = total == that.data.gwc.length ? true : false
    this.setData({
      gwc: that.data.gwc,
      total: total,
      totalMoney: totalMoney.toFixed(2),
      selectAll: selectAll
    })



  },
  //点击商品
  selectGoods:function(e){
    var that = this;
    var total = 0;
    var totalMoney = 0;
    var index = e.currentTarget.dataset.index
    var goods1 = that.data.gwc[index];
    that.data.gwc[index].active = goods1.active ? false : true;
    for (var i = 0; i < that.data.gwc.length; i++) {
      var goods = that.data.gwc[i];
      if (goods.active) {
        total++
        totalMoney += goods.price * goods.number
      }
    }
    var selectAll = total == that.data.gwc.length?true:false
  
    this.setData({
      gwc: that.data.gwc,
      total: total,
      totalMoney: totalMoney.toFixed(2),
      selectAll: selectAll
    })
  },
  selectAll:function(){
    var that = this;
    var select = that.data.selectAll?false:true;
    var total = 0;
    var totalMoney=0;
    for (var i = 0; i < that.data.gwc.length; i++) {
       that.data.gwc[i].active = select;
      if (select){
        total++
        totalMoney += that.data.gwc[i].price * that.data.gwc[i].number
      }
    }
    that.setData({
      gwc: that.data.gwc,
      selectAll: select,
      total:total,
      totalMoney: totalMoney.toFixed(2)
    })
  },
  
  jsm: function (e) {
    var that = this;
    if (that.data.gwc.length == 0 || that.data.total==0) { 
      return;
    }
    var arr = [];
    var totalNumber=0;
    for (var i = 0; i < that.data.gwc.length; i++) {
      var goods = that.data.gwc[i];
      if (goods.active) {
          arr.push(goods)
          totalNumber += goods.number
      }
    }

    var orderconfirm = {
      goods: arr,
      totalMoney: that.data.totalMoney,
      totalNumber: totalNumber,
      business: that.data.business
     }
    console.log(orderconfirm)

    wx.setStorageSync('orderconfirm', orderconfirm)
    wx.setStorageSync('address', '')
    wx.navigateTo({
      url: "/pages/oder-confirm/index"
    })
  },
  //删除购物车商品
  delGoods:function(){
    var that = this;
    var arr = [];
    for (var i = 0; i < that.data.gwc.length; i++) {
      var goods = that.data.gwc[i];
      if (!goods.active) {
        arr.push(goods)
      }
    }

    that.setData({
      gwc: arr
    })
  }
});