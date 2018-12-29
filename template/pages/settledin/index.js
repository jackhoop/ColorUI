import WxValidate from '../../utils/WxValidate.js'
const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    index: null,
    displayWarn: 'display:none'
  },
  onLoad: function (options) {
    // 校验规则 -rules
    this.initValidate();
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
        rangelength: [2, 4]
      },
      contactsTel: {
        required: true,
        tel: true,
      },
      city: {
        required: false,
      },
      assistance: {
        required: true,
        assistance: true,
      },
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
        required: '请输入11位手机号码',
        tel: '请输入联系电话',
      },
      city: {
        required: '请选择地址',
      },
      assistance: {
        required: '请勾选 《顺风男服务协议》'
      },
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
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