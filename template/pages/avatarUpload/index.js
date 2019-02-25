import WeCropper from '../we-cropper/we-cropper.js'

const app = getApp()
const config = app.globalData.config

const device = wx.getSystemInfoSync()
const width = device.windowWidth
const height = device.windowHeight +10

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    cropperOpt: {
      id: 'cropper',
      targetId: 'targetCropper',
      pixelRatio: device.pixelRatio,
      width,
      height,
      scale: 2.5,
      zoom: 8,
      cut: {
        x: (width - app.globalData.windowWidth) / 2,
        y: (height - app.globalData.windowWidth) / 2,
        width: app.globalData.windowWidth,
        height: app.globalData.windowWidth
      },
      boundStyle: {
        color: config.getThemeColor(),
        mask: 'rgba(0,0,0,0.8)',
        lineWidth: 1
      }
    }
  },
  touchStart(e) {
    this.cropper.touchStart(e)
  },
  touchMove(e) {
    this.cropper.touchMove(e)
  },
  touchEnd(e) {
    this.cropper.touchEnd(e)
  },
  getCropperImage() {
    var that = this;
    this.cropper.getCropperImage((avatar) => {
      if (avatar) {
        console.log(avatar);
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1];   //当前页面
        var prevPage = pages[pages.length - 2];  //上一个页面

        var formData = {
          "dataType": "bus"
        }
        that.imgUpdate(avatar, formData, function (data) {
          //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
          prevPage.setData({
            ["business.facadeImage"]: data.path
          })

          wx.navigateBack();   //返回上一个页面
        
        });
      } else {
        console.log('获取图片失败，请稍后重试')
      }
    })
  },
  //图片上传
  imgUpdate(tempFilePath, formData, callBack) {
    var that = this;
    wx.showLoading({
      title: '上传中...',
    })

    // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
    wx.uploadFile({
      url: app.globalData.serverUrl + "/wx/media/" + app.globalData.appid + "/uploadImg",
      filePath: tempFilePath,
      name: 'img',
      formData: formData,
      success: function (res) {
        var data = JSON.parse(res.data);
        callBack(data);
        wx.hideLoading();
      }
    })
  },
  uploadTap() {
    const self = this

    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(res) {
        const src = res.tempFilePaths[0]
        //  获取裁剪图片资源后，给data添加src属性及其值

        self.cropper.pushOrign(src)
      }
    })
  },
  onLoad(option) {
   
    console.log(option.src)
    const { cropperOpt } = this.data

    cropperOpt.boundStyle.color = config.getThemeColor()

    this.setData({ cropperOpt })

    if (option.src) {
      cropperOpt.src = option.src
      this.cropper = new WeCropper(cropperOpt)
        .on('ready', (ctx) => {
          console.log(`wecropper is ready for work!`)
        })
        .on('beforeImageLoad', (ctx) => {
          console.log(`before picture loaded, i can do something`)
          console.log(`current canvas context:`, ctx)
          wx.showToast({
            title: '上传中',
            icon: 'loading',
            duration: 20000
          })
        })
        .on('imageLoad', (ctx) => {
          console.log(`picture loaded`)
          console.log(`current canvas context:`, ctx)
          wx.hideToast()
        })
        .on('beforeDraw', (ctx, instance) => {
          console.log(`before canvas draw,i can do something`)
          console.log(`current canvas context:`, ctx)
        })
    }
  }
})
