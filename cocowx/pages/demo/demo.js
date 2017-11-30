
//gulpfile.js
//获取应用实例
var app = getApp()
Page({
  data: {
    imgUrls: [
      'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
    ],
    indicatorDots: true,
    circular: true,
    address1: '',
    appKey1: '',
    appKey2: '',
    phone: '',
    userInfo: null
  },
  //事件处理函数
  onLoad (options) {
    this.setData({
      appKey1: app.globalData.appKey,
      appKey2: options.appKey
    })
    let that = this
    app.getUserInfo(function (userInfo) {
      // console.log('userInfo', userInfo)
      //更新数据
      // that.setData({
      //   userInfo: JSON.stringify(userInfo)
      // })
      wx.login({
        success: function (res) {
          if (res.code) {
            console.log('login success res', res)
            // node解密接口
            let encryptedData = userInfo.encryptedData;
            let iv = userInfo.iv
            let code = res.code
            
            let query = `?encryptedData=${encryptedData}&iv=${iv}&code=${code}`
            console.log('query', query)
            app.http.request('GET', 'http://wxapi.cocosurprise.com/wxapi/decrypt/startDecrypt' + query).then(res => {
              console.log('startDecrypt', res)
            })
          } else {
            console.log('获取用户登录态失败！' + res.errMsg)
          }
        }
      });
      
    })
    // getAppInfo--App信息
    app.http.request('GET', app.api.getAppInfo).then(res => {
      // console.log('res', res)
    })
  },
  getPhoneNumber: function (e) {
    console.log('getPhoneNumber', e)
    // console.log(e.detail.errMsg)
    // console.log(e.detail.iv)
    // console.log(e.detail.encryptedData)
    this.setData({
      phone: e.detail.encryptedData
    })
  },
  showAddress () {
    wx.chooseAddress({
      success: res => {
        console.log('res.userName + res.postalCode', res.userName + res.provinceName + res.cityName)
        this.setData({
          address1: res.userName + res.provinceName + res.cityName
        })
        // console.log(res.userName)
        // console.log(res.postalCode)
        // console.log(res.provinceName)
        // console.log(res.cityName)
        // console.log(res.countyName)
        // console.log(res.detailInfo)
        // console.log(res.nationalCode)
        // console.log(res.telNumber)
      }
    })
  },
  wxPay () {
    wx.requestPayment({
      'timeStamp': Date.parse(new Date()).toString(),
      'nonceStr': '5K8264ILTKCH16CQ2502SI8ZNMTM67VS',
      'package': 'prepay_id=wx201612032137135b201de80e0666789657',
      'signType': 'MD5',
      'paySign': 'MD5(appId=wx39b22a6b744b3026&nonceStr=5K8264ILTKCH16CQ2502SI8ZNMTM67VS&package=prepay_id=wx2017033010242291fcfe0db70013231072&signType=MD5&timeStamp=1490840662&key=qazwsxedcrfvtgbyhnujmikolp111111) = 22D9B4E54AB1950F51E0649E8810ACD6',
      'success': function (res) {
        console.log('paySuccess')
      },
      'fail': function (res) {
        console.log(res)
      }
    })
  }
})
