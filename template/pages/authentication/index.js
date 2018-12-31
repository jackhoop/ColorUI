const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
  },
  getUserInfo:function(){
    wx.getSetting({
      success: res => {
        //授权成功
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              app.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (app.userInfoReadyCallback) {
                app.userInfoReadyCallback(res)
              }
            }
          })
          this.login();
      
          // 回到原来的地方放
          wx.navigateBack();
        }
      }
    })
  },
  login: function () {
    let that = this;
    let token = wx.getStorageSync('token');
    console.log(token)
    if (token) {
      wx.request({
        url: app.globalData.serverUrl + "/wx/user/" + app.globalData.appid + "/check-token",
        data: {
          token: token
        },
        success: function (res) {
          if (res.data.code != 0) {
            wx.removeStorageSync('token')
            that.login();
          }
        }
      })
      return;
    }
    wx.login({
      success: function (res) {
        wx.request({
          url: app.globalData.serverUrl + "/wx/user/" + app.globalData.appid + "/login",
          data: {
            code: res.code
          },
          success: function (res) {
            if (res.data.code == "10000") {
              // 去注册
              that.registerUser();
              return;
            }
            if (res.data.code != 0) {
              // 登录错误
              wx.hideLoading();
              wx.showModal({
                title: '提示',
                content: '无法登录，请重试',
                showCancel: false
              })
              return;
            }

            wx.setStorageSync('token', res.data.token);
          }
        })
      }
    })
  },
  registerUser: function () {
    let that = this;
    wx.login({
      success: function (res) {
        console.log("login:");
        console.log(res);
        let code = res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
        wx.getUserInfo({
          success: function (res) {
            console.log("UserInfo:");
            console.log(res);
            let iv = res.iv;
            let encryptedData = res.encryptedData;
            let signature = res.signature;
            let rawData = res.rawData;
            let referrer = '' // 推荐人
            let referrer_storge = wx.getStorageSync('referrer');
            if (referrer_storge) {
              referrer = referrer_storge;
            }
            // 下面开始调用注册接口
            wx.request({
              url: app.globalData.serverUrl + "/wx/user/" + app.globalData.appid + "/register",
              data: { code: code, encryptedData: encryptedData, iv: iv, signature: signature, rawData: rawData }, // 设置请求的 参数
              success: (res) => {
                wx.hideLoading();
                //that.login();
              }
            })
          }
        })
      }
    })
  }

});