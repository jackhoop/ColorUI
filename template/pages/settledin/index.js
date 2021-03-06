import WxValidate from '../../utils/WxValidate.js'
var QQMapWX = require('../../utils/qqmap-wx-jssdk');
var qqmapsdk;
const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    index: null,
    business:{},
    title:'店铺入住',
    files: [],//轮播图片
    jcfiles: [],//介绍图片
    // start: '00:00',
    // end:'23:59',
    displayWarn: 'display:none',
    region: ['', '', ''],
  },
  onLoad: function (e) {
    var that = this;
    that.setData({
      ["business.start"]: "00:00",
      ["business.end"]: "23:59",
    })

    // 校验规则 -rules
    this.initValidate();

    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: '6CXBZ-QNVRU-ITIVQ-4ALSI-WV7QQ-KHFNQ' // 必填
    });
    if (e.id) {
      that.setData({
        title: '编辑店铺'
      })
      that.getBusiness();
    }
  },
  getBusiness(){
    wx.showLoading({
      title: '加载中',
      mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false  
    })
    var that = this;
    var token = wx.getStorageSync('token')
    wx.request({
      url: app.globalData.serverUrl + "/wx/business/" + app.globalData.appid + "/getBusiness",
      method: 'get',
      header: {
        'Authorization': token
      },
      complete: function () {
        wx.hideLoading()
      },
      success: function (res) {
        if (res.data.business){
          that.setData({
            business: res.data.business,
            files: JSON.parse(res.data.business.adImages),
            jcfiles: JSON.parse(res.data.business.jcImages),
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
    params.formId = e.detail.formId

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
    wx.showLoading({
      title: '保存中...',
      mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false  
    })

    var that = this;
    goods.adImages = JSON.stringify(that.data.files);
    goods.jcImages = JSON.stringify(that.data.jcfiles);
    var token = wx.getStorageSync('token')
  
    wx.request({
      url: app.globalData.serverUrl + "/wx/business/" + app.globalData.appid + "/register",
      method: 'POST',
      header: {
        'Authorization': token
      },
      data: goods,
      complete: function () {
        // setTimeout(function () {
        //   wx.hideLoading()
        // }, 2000)
      },
      success: (res) => {
        if (res.data.code=="0"){
          wx.showToast({
            title: res.data.msg,//提示文字
            duration: 2000,//显示时长
            mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false  
            icon: 'success', //图标，支持"success"、"loading"  
            success: function () {
              wx.hideLoading()
              wx.switchTab({
                url: '/pages/business/index',
                success: function (e) {
                  
                  let page = getCurrentPages()[0];
                  if (page == undefined || page == null) return;
                  page.onLoad(e);
                }
              });
            },//接口调用成功
          }) 
        
        }else{
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
      contacts: {
        required: true,
      },
      contactsTel: {
        required: true,
        tel: true,
      },
      city: {
        required: false,
        hiddenv:true
      },
      facadeImage: {
        required: false,
        hiddenv: true
      },
      licenseImage: {
        required: false,
        hiddenv: true
      },
      content: {
        required: false,
        hiddenv: true
      }, 
      lbimg: {
        imgs: true
      }
      
    }
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      name: {
        required: '请输入门店名称',
      },
      contacts: {
        required: '请输入联系人',
      },
      contactsTel: {
        required: '请输入手机号码',
        tel: '请输入正确的手机号',
      },
      city: {
        required: '请选择地址',
        hiddenv:"请选择地址"
      },
      facadeImage: {
        required: '请上传门面头照',
        hiddenv: "请上传门面头照"
      },
      licenseImage: {
        required: '请上传营业执照',
        hiddenv: "请上传营业执照"
      },
      content: {
        hiddenv: '请输入介绍信息',
      },
      lbimg: {
        imgs: "请上传轮播图片"
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
    this.WxValidate.addMethod('hiddenv', (value, param) => {
      if (!value){
        return false
      }
        return true;
    },)
    this.WxValidate.addMethod('imgs', (value, param) => {
      if(this.data.files.length==0){
        return false
      }
      return true;
    })
  },
  //地址选择
  chooseLocation: function (e) {
    var that = this;
    // app.getPermission(that);
    wx.chooseLocation({
      success: function (res) {
        
        that.setData({
          ["business.lat"]: res.latitude,
          ["business.lng"]: res.longitude
        });
        // 调用接口
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function (res) {
            var region =[];
            region[0] = res.result.ad_info.province
            region[1] = res.result.ad_info.city
            region[2] = res.result.ad_info.district

            that.setData({
              region: region,
              ["business.city"]: res.result.ad_info.province + "-" + res.result.ad_info.city + "-" + res.result.ad_info.district,
              ["business.ad_info"]: res.result.ad_info,
              ["business.cityCode"]: res.result.ad_info.adcode,
              ["business.address"]: res.result.formatted_addresses.recommend.replace(res.result.ad_info.district, "")
            });
          },
          fail: function (res) {
          },
          complete: function (res) {
          }
        });
      },
    })
  },
  //门面图片上传
  mmchooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        const src = res.tempFilePaths[0]
        var formData = {
          "dataType": "bus"
        }
        wx.navigateTo({
          url: `/pages/avatarUpload/index?src=${src}`
        })
        
      }
    })
  },
  //食品执照
  foodImage: function () {
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
            ["business.foodImage"]: data.path,
          });
        });
      }
    })
  },
  TimeChangeStart(e) {
    this.setData({
      ["business.start"]: e.detail.value,
    })
  },
  TimeChangeEnd(e) {
    this.setData({
      ["business.end"]: e.detail.value,
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
  //营业执照
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
            ["business.licenseImage"]: data.path,
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
  //轮播图片
  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      count: 3,
      success: function (res) {
        if (res.tempFilePaths.length + that.data.files.length>3){
          var error={
            msg:"只能上传3张图片"
          }
          that.showWarnInfo(error)
          return false
        }

        var formData = {
          "dataType": "bus"
        }
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.imgUpdate(res.tempFilePaths, formData, function (data) {
          that.setData({
            files: that.data.files.concat(data.path)
          });
        });
      }
    })
  },
  //介绍图片
  jcchooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      count: 3,
      success: function (res) {
        if (res.tempFilePaths.length + that.data.jcfiles.length > 3) {
          var error = {
            msg: "只能上传3张图片"
          }
          that.showWarnInfo(error)
          return false
        }

        var formData = {
          "dataType": "bus"
        }
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.imgUpdate(res.tempFilePaths, formData, function (data) {
          that.setData({
            jcfiles: that.data.jcfiles.concat(data.path)
          });
        });
      }
    })
  },
    deleteImg: function (e){
    var index = e.currentTarget.dataset.index;
   
    if (e.currentTarget.dataset.imgtype =="adImages"){
      var files = this.data.files;
      files.splice(index, 1);
      this.setData({
        files: files
      });
    
    }
    if (e.currentTarget.dataset.imgtype == "jcImages") {
      var jcfiles = this.data.jcfiles;
  
      jcfiles.splice(index, 1);
      this.setData({
        jcfiles: jcfiles
      });

    }
  },
  bindTextAreaBlur: function (e) {
    var that = this;
    that.setData({
      ["business.content"]: e.detail.value,
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