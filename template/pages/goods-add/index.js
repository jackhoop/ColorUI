import WxValidate from '../../utils/WxValidate.js'
const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    index: null,
    files: [],//轮播图片
    jcfiles: [],//介绍图片
    displayWarn: 'display:none',
    title:'添加商品'
  },
  onLoad: function (e) {
    var that = this;
    // 校验规则 -rules
    this.initValidate();

    if (e.id){
      that.setData({
        title: '编辑商品'
      })
      that.getGoodsInfo(e.id)
    }
  },
  getGoodsInfo: function (id) {
    wx.showLoading({
      title: '加载中',
      mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false  
    })

    var that = this;
    var token = wx.getStorageSync('token')
    wx.request({
      url: app.globalData.serverUrl + "/wx/goods/" + app.globalData.appid + "/getGoods",
      method: 'get',
      header: {
        'Authorization': token
      },
      data: {
        id: id
      },
      complete: function () {
        wx.hideLoading()
      },
      success: function (res) {
       if (res.data.goodsInfo){
          that.setData({
            goods: res.data.goodsInfo,
            yyimg: res.data.goodsInfo.image
          });
       }
       
      }
    })
  },
  /**
 * 表单-提交前的(校验)
 */
  submitCheckInfo(e) {
    var that = this;
    const params = e.detail.value

    // 传入表单数据，调用验证方法
    if (!that.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0]
      this.showWarnInfo(error)
      return false
    }
    // 验证通过以后
    this.submitForm(params);
  },
  showModal(error) {
    wx.showModal({
      content: error.msg,
      showCancel: false,
    })
  },

  /**
   * 表单验证->(可自定义验证形式)
   */
  showWarnInfo(error) {
    // 当前page是this对象
    let page = this;
    // 延时时间等待
    let delayTime = 1;
    // 延时等待毫秒,现设置为1000
    let delayMillsecond = 1000;
    // 调用显示警告函数
    showWran(page, error, delayTime, delayMillsecond);
  },


  /**
   * 表单-提交(到后端)
   */
  submitForm(goods) {
    var that = this;
    wx.showLoading({
      title: '保存中...',
      mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false  
    })


    goods.goodsStatus = goods.goodsStatus==true?"上架":"下架"

    var token = wx.getStorageSync('token')
    wx.request({
      url: app.globalData.serverUrl + "/wx/goods/" + app.globalData.appid + "/goodsAdd",
      method: 'POST',
      header: {
        'Authorization': token
      },
      data: goods,
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
              wx.redirectTo({
                url: "/pages/goods/index"
              })
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
  /**
   * 表单-验证字段
   */
  initValidate() {
    const rules = {
      name: {
        required: true,
      },
      price: {
        required: true,
        number: true
      },
      specification: {
        required: true,
      },
      image: {
        required: false,
        hiddenv: true
      }
    }
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      name: {
        required: '请输入商品名称',
      },
      price: {
        required: '请输入商品价格',
        number:'请输入有效的商品价格'
      },
      specification: {
        required: '请输入商品规格',
      },
      image: {
        required: '请上传商品图片',
        hiddenv: "请上传商品图片"
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
    this.WxValidate.addMethod('hiddenv', (value, param) => {
      if (!value) {
        return false
      }
      return true;
    })
    this.WxValidate.addMethod('imgs', (value, param) => {
      if (this.data.files.length == 0) {
        return false
      }
      return true;
    })
  },
  
  //商品图片
  yychooseImage: function () {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {

        var formData = {
          "dataType": "bus"
        }
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.imgUpdate(res.tempFilePaths, formData, function (data) {
          that.setData({
            yyimg: data.path
          });
        });
      }
    })
  },
  //图片上传
  imgUpdate(tempFilePaths, formData, callBack) {
    var that = this;
    wx.showLoading({
      title: '上传中...',
    })

    for (var i = 0; i < tempFilePaths.length; i++) {
      // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
      wx.uploadFile({
        url: app.globalData.serverUrl + "/wx/media/" + app.globalData.appid + "/uploadImg",
        filePath: tempFilePaths[i],
        name: 'img',
        formData: formData,
        success: function (res) {
          var data = JSON.parse(res.data);
          callBack(data);
          wx.hideLoading();
        }
      })
    }
  },
 
  bindTextAreaBlur: function (e) {
    var that = this;
    that.setData({
      content: e.detail.value
    });
  }
})
/**
 * 可加入工具集-减少代码量
 */
function showWran(page, error, delayTime, delayMillsecond) {
  let timesRun = 0;
  let interval = setInterval(function () {
    timesRun += delayTime;
    if (timesRun === delayTime) {
      clearInterval(interval);
    }
    page.setData({
      warnInfo: error.msg,
      displayWarn: 'display:none'
    });
  }, delayMillsecond);
  page.setData({
    warnInfo: error.msg,
    displayWarn: 'display:block'
  });
}