//app.js
const common = require('./utils/common'); 
const request = require('./utils/fetch') 
const {api, msg} = require('./utils/api')

App({
  /**
   * Global shared
   * 可以定义任何成员，用于在整个应用中共享
   */
  globalData: {
    appTitle: '',
    mallUserId: '', // 商城用户id
    userInfo: null, // 用户信息
    appEncrypt: '', // 应用唯一标识
    defaultAppEncrypt: 'bGpNUHA5MTNkWGYzMWJBNWcxMjQ5', // 默认渠道商appid
    loginState: '', // 登录状态
    loginCode: null, // 已登录的code
    loginSession: null,
    swiperCurActiveColor: '#ffffff', // swiper轮播图选中圆点的颜色
    swiperCurColor: 'rgba(0,0,0,.4)', // swiper轮播图未选中圆点的颜色
    themeType: 'theme-default', // App主题
    protocol: 'http:',
    scopeUserInfo: '', // 用户授权状态
    scopeAddress: '', // 地址授权状态
    touristState: false, // 是否游客
    touristName: '匿名' // 游客默认名称
  },
  common: common, // 公共函数api
  http: request, // 异步请求api
  api: api, // api接口对象api
  msg: msg, // api接口信息提示
 /**
 * 生命周期函数--监听小程序初始化
 * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
 */
  onLaunch (options) {
    if (options.query.appEncrypt) {
      this.globalData.appEncrypt = options.query.appEncrypt // 获取应用唯一标识
    } else {
      this.globalData.appEncrypt = this.globalData.defaultAppEncrypt // 默认渠道商appid
    }
    // 唯一标识写到本地存储
    wx.setStorageSync('appEncrypt', this.globalData.appEncrypt)
    this.init()
  },
  // 初始化
  init () {
    this.getAppInfo()
    this.globalData.loginSession = wx.getStorageSync('sessionKey')
    if (this.globalData.loginSession) {
      this.globalData.loginState = true
    }
  },
  /**
   * 信息统计接口
   * @params argument string 参数
   * @params cUrlName string 别名
   * @params url string 参数 模块名
   * @params userId string|number 登录后的用户id（未登录传''）
   * Demo: this.statistics({argument:'',cUrlName:'首页',url:'index'})
  */
  statistics (options) {
    Object.assign(options, {userId: ''})
    this.http.request('GET', this.api.statistics, options).catch(res => console.log('统计接口', res))
  },
  getAppInfo (cb) {
    this.http.request('GET', this.api.appInfo).then(({data: {code, message, data}}) => {
      if (code === '200' && message === '0101' && data) {
        this.globalData.appTitle = data.imTitle // 应用的首页标题
        this.globalData.mallUserId = data.mallUserId // 商城用户id
        typeof cb === 'function' && cb()
      }
    })
  },
  // 获取登录态
  getLoginState (cb) {
    var that = this
    // let loginSession = wx.getStorageSync('sessionKey') // 后台返回的微信登录态--sessionKey
    wx.checkSession({ // 判断登录是否失效
      success (res) { // 登录态未过期 session 未过期，并且在本生命周期一直有效---仅传输用户的明文数据
        console.log('checkSession.success', res)
        wx.getSetting({
          success(res) {
            that.globalData.scopeUserInfo = res.authSetting['scope.userInfo']
            that.globalData.scopeAddress = res.authSetting['scope.address']
            console.log('that.globalData.scopeAddress', that.globalData.scopeAddress)
            that.globalData.loginState = true // 保存未过期登录态到全局变量 loginState
            if (!that.globalData.scopeUserInfo) { // 登录态-拒绝授权用户
              that.globalData.userInfo = { // 渲染静态游客数据
                avatarUrl: '/images/tourist.png',
                nickName: that.globalData.touristName
              }
              typeof cb == "function" && cb()
            } else { // 登录态-允许授权用户
              that.login(cb, true)
            }
          }
        })
      },
      fail (res) { // 登录态过期 需重新登录---仅传输用户的： 1.加密数据 2.code 3.初始向量iv
        console.log('checkSession.fail', res)
        if (typeof cb === 'string' && cb === 'init') return
        that.globalData.loginState = false // 保存过期登录态到全局变量 loginState
        that.login(cb) // 登录
      }
    })
  },
  // 登录 @params 2.activeStatus:登录态是否过期参数 为true:登录态未过期，其他则表示登录过期或未登录
  login (cb, activeStatus) {
    var that = this
    if (activeStatus) {
      that.getUserInfo(res => {
        // let userInfo = res.userInfo
        let userInfo = res
        let params = {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          province: userInfo.province,
          city: userInfo.city,
          isLogin: '0',
          sessionKey: wx.getStorageSync('sessionKey')
        }
        that.saveUserInfo(params, cb) // 调起后台登录接口
      }, true)
    } else {
      wx.login({
        success (res) { // 成功登录
          console.log('获取用户登录态-成功登录！', res) // 刷新 
          if (res.code) {
            let code = res.code
            that.getUserInfo(res => {
              if (res.errMsg.indexOf('fail') > -1) { // 拒绝授权
                let params = {
                  isLogin: '1',
                  code: code
                }
                that.saveUserInfo(params, cb) // 调起后台登录接口
              } else { // 已授权
                let params = {
                  isLogin: '1',
                  code: code,
                  encryptedData: res.encryptedData,
                  iv: res.iv
                }
                that.saveUserInfo(params, cb) // 调起后台登录接口
              }
            })
          } else {
            console.log('获取用户登录态失败！' + res.errMsg) // 刷新 
          }
        }
      })
    }
  },
  // 获取用户信息
  getUserInfo (cb, activeStatus) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      if (activeStatus) {
        //调用登录接口--无加密数据
        wx.getUserInfo({  
          withCredentials: false,
          success (res) {
            that.globalData.userInfo = res.userInfo
            typeof cb == "function" && cb(res)
          }
        })
      } else {
        //调用登录接口--包含加密数据
        wx.getUserInfo({
          withCredentials: true,
          success (res) { // 已授权
            that.globalData.userInfo = res.userInfo
            typeof cb == "function" && cb(res)
          },
          fail (res) { // 拒绝授权
            that.globalData.userInfo = {
              avatarUrl: '/images/tourist.png',
              nickName:  that.globalData.touristName
            }
            typeof cb == "function" && cb(res)
          }
        })
      }
    }
  },
  // 调起后台登录接口
  saveUserInfo (userInfo, cb) {
    // 请求后台登录接口--存入用户数据
    this.http.request('POST', this.api.login, userInfo).then(({data: {code, message, data}}) => {
      if (code === '200' && message ==='0101') { // 登录成功
        this.globalData.loginState = true  // 记录已成功登录的状态
        if (data) {
          wx.setStorage({ // 后台返回的sessionKey 用于后台解析
            key: "sessionKey",
            data: data.sessionKey
            // data: data.sessionKey || 'KTQrn8DZUC57hnnpIM2hoc9I2p8lcVwaoXpqqFr2Rahdsgkra3SHh2CpV1YdpGcnRAGFGgO9L96Wk57bWfSPFNCi1NYxVk0HQ0E7jU3wHZfZIMtuRrU5UDsSPXgzIF42b91NCxbeubL6bUjAK1XrCITrIeipExVFOCRjjGdx'
          })
          wx.setStorage({ // 用户地址标识
            key: "buyerId",
            data: data.buyerId  
          })
          wx.setStorage({ // 用户Id
            key: "userId",
            data: data.userId  
          })
          wx.setStorage({ // 游客方式
            key: "visitorsState",
            data: data.visitorsState  
          })
        }
      }

      typeof cb == "function" && cb()
    })
  }
})
