// pages/address-add/index.js
import WxValidate from '../../utils/WxValidate.js'
var QQMapWX = require('../../utils/qqmap-wx-jssdk');
var qqmapsdk;
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    address: {},
    title: '新增地址',
    displayWarn: 'display:none',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    var that = this;
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: '6CXBZ-QNVRU-ITIVQ-4ALSI-WV7QQ-KHFNQ' // 必填
    });
    // 校验规则 -rules
    that.initValidate();
    
    that.setData({
      type: e.type
    })

    if (e.id) {
      that.setData({
        title: '编辑地址',
        type: e.type
      })
      that.getAddressInfo(e.id)
    }
   },
  getAddressInfo: function (id) {
    wx.showLoading({
      title: '加载中',
      mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false  
    })

    var that = this;
    var token = wx.getStorageSync('token')
    wx.request({
      url: app.globalData.serverUrl + "/wx/account/" + app.globalData.appid + "/getAddress",
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
        if (res.data.address) {
          var address = res.data.address;
          address.ssq = address.province + '-' + address.city + '-' + address.district;
          console.log(address)
          that.setData({
            address: address,
          });
        }

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
  /**
   * 表单-提交(到后端)
   */
  submitForm(address) {
    console.log(address)
    //return
    wx.showLoading({
      title: '保存中...',
      mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false  
    })

    var that = this;
 
    var token = wx.getStorageSync('token')

    wx.request({
      url: app.globalData.serverUrl + "/wx/account/" + app.globalData.appid + "/addAddress",
      method: 'POST',
      header: {
        'Authorization': token
      },
      data: address,
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
                url: '/pages/select-address/index?type=' + that.data.type,
                // success: function (e) {
                //   let page = getCurrentPages()[0];
                //   if (page == undefined || page == null) return;
                //   page.onLoad(e);
                // }
              });
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
  checkboxChange: function (e) {
    console.log(e.target)
  },
  //地址选择
  chooseLocation: function (e) {
    var that = this;
    // app.getPermission(that);
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          ["address.lat"]: res.latitude,
          ["address.lng"]: res.longitude
        });
        // 调用接口
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function (res) {
            that.setData({
              ["address.province"]: res.result.ad_info.province,
              ["address.city"]: res.result.ad_info.city,
              ["address.district"]: res.result.ad_info.district,
              ["address.ssq"]: res.result.ad_info.province + "-" + res.result.ad_info.city + "-" + res.result.ad_info.district,
              ["address.ad_info"]: res.result.ad_info,
              ["address.adcode"]: res.result.ad_info.adcode,
              ["address.address"]: res.result.formatted_addresses.recommend.replace(res.result.ad_info.district, "")
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
   * 表单-验证字段
   */
  initValidate() {
    const rules = {
      userName: {
        required: true,
      },
      phone: {
        required: true,
        tel: true,
      },
      province: {
        required: false,
        hiddenv: true
      },
      address: {
        required: true,
        hiddenv: true
      }
    }
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      userName: {
        required: '请输入姓名',
      },
      phone: {
        required: '请输入手机号码',
      },
      contactsTel: {
        required: '请输入手机号码',
        tel: '请输入正确的手机号',
      },
      province: {
        required: '请选择地区',
        hiddenv: "请选择地区"
      },
      address: {
        required: "请输入详细地址"
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
