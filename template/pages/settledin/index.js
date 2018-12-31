import WxValidate from '../../utils/WxValidate.js'
var QQMapWX = require('../../utils/qqmap-wx-jssdk');
var qqmapsdk;
const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    index: null,
    files: [],//轮播图片
    jcfiles: [],//介绍图片
    displayWarn: 'display:none'
  },
  onLoad: function (options) {
    // 校验规则 -rules
    this.initValidate();

    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: '6CXBZ-QNVRU-ITIVQ-4ALSI-WV7QQ-KHFNQ' // 必填
    });
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
    console.log(error)
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
  submitForm(params) {
    console.log(params);

    wx.showToast({
      title: '提交吧~Q!',
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
  },
  //地址选择
  chooseLocation: function (e) {
    var that = this;
    wx.chooseLocation({
      success: function (res) {

        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
        });
        // 调用接口
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function (res) {
            that.setData({
              ad_info: res.result.ad_info,
              pcd: res.result.address_component.province + res.result.address_component.city + res.result.address_component.district,
              city: res.result.ad_info.province + "-" + res.result.ad_info.city + "-" + res.result.ad_info.district,
              cityCode: res.result.ad_info.adcode,
              address: res.result.address_component.street + res.result.address_component.street_number.replace(res.result.address_component.street, "")
            });
          },
          fail: function (res) {
            console.log(res);
          },
          complete: function (res) {
            console.log(res);
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
        var formData = {
          "dataType": "bus"
        }
        that.imgUpdate(res.tempFilePaths, formData, function (data) {
          that.setData({
            mmimg: data.path
          });
        });
      }
    })
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
    console.log(e.currentTarget.dataset);
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