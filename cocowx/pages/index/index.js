//gulpfile.js
//获取应用实例
import {bannerList, goodsList}  from '../../utils/service'

let app = getApp()
let scrollTimeState = null
Page({
  data: {
    isPullDownRefresh: false,
    pullDownRefreshState: false, // 下拉刷新之后的弹出信息状态
    pullDownRefreshText: '与品质生活不期而遇 更新10件', // '刷新失败了 换个姿势再来一次'
    // banner
    bannerList: null, // banner列表
    bannerImageQuery: '', // 图片服务器banner图片截取参数 ?x-oss-process=image/resize,m_fill,w_375,h_190,q_60
    indicatorDots: true, // swiper 是否显示面板指示点
    autoplay: true, // swiper 自动轮播
    circular: true, // swiper 是否采用衔接滑动
    interval: 3000, // swiper 自动切换时间间隔
    indicatorColor: app.globalData.swiperCurColor, // swiper 圆点颜色
    indicatorActiveColor: app.globalData.swiperCurActiveColor, // swiper 圆点选中的颜色
    // 商品列表
    goodsList: null, // 商品列表
    isEmptyList: null, // 商品列表为空--空状态页面
    imageQuery: '?x-oss-process=image/resize,m_fill,w_275,h_275,q_60', // 图片服务器商品列表图片截取参数 ?x-oss-process=image/resize,m_fill,w_300,h_300,q_60
    // 滚动加载参数
    scrollEleHeight: '', // 滚动元素的高度
    scrollTop: 0, // 滚动元素的滚动高度
    scrollLoadDis: true, // true允许加载，false禁止加载
    timeState: null, // 定时器状态
    pageNumber: 1, // 商品列表页码
    pageSize: 10, // 商品列表每页商品数量
    hasMore: true, // 是否还有下一页数据
    hideTip: false, // 列表元素总长度小于3个，隐藏底部的 我是有底线的元素 false:显示  true:隐藏
    // 个人中心列表--抽屉式列表
    showAside: false, // 个人中心显示状态 false:隐藏 true:显示
    loginState: null,
    userInfo: null, // 用户信息
    userName: '', // 用户名
    orderCount: null, // 订单数量
    selectState: false,
    selectStateTime: null,
    selectStateNum: 0,
    shareTitle: '西柚集 - 让你与品质生活不期而遇',
    indexTitle: '西柚集 - 精选好货',
    listArr: [],
    queue: null, // 判断是否是最后一页
    // 专题活动对应的数据
    goodsSpecData: [
      {text:'默认', bgColor: 'none'},
      {text:'推荐', bgColor: 'stateThree'},
      {text:'种草', bgColor: 'stateOne'},
      {text:'活动', bgColor: 'stateFour'},
      {text:'攻略', bgColor: 'stateTwo'},
    ],
    isload: true // 数据请求完成继续加载
  },
  //事件处理函数
  onLoad (options) {
    wx.removeStorageSync('fromGoodsDetailRrefsh') // 移除fromGoodsDetailRrefsh
    this.init()
  },
  // 
  onShow () {
    let that = this
    this.data.selectStateNum = 0 // 重置个人中心点击状态
    wx.getStorage({
      key: 'fromGoodsDetailRrefsh', // 商品详情|活动详情失效标识
      success (res) {
        wx.removeStorageSync('fromGoodsDetailRrefsh') // 移除当前本地存储的key:fromGoodsDetailRrefsh 避免后续其他订单详情的同类操作冲突
        if (res.data) {
          that.data.goodsList.forEach((o, index) => {
            if (o.displayId === Number(res.data)) {
              that.data.goodsList.splice(index, 1)
            }
          })
          that.setData({
            goodsList: that.data.goodsList
          })
        }
      } 
    })
    wx.getStorage({
      key: 'fromGoodsDetailRrefshSmile', // 商品详情|活动详情 点赞次数刷新
      success (res) {
        wx.removeStorageSync('fromGoodsDetailRrefshSmile') // 移除当前本地存储的key:fromGoodsDetailRrefsh 避免后续其他订单详情的同类操作冲突
        if (res.data) {
          that.data.goodsList.forEach(o => {
            if (o.displayId === Number(res.data)) {
              o.pvNumber++
            }
          })
          that.setData({
            goodsList: that.data.goodsList
          })
        }
      } 
    })
  },
  // 用户点击右上角分享
  onShareAppMessage (res) {
    let that = this
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log('来自页面内转发按钮', res.target)
    }
    console.log('that.data.shareTitle', that.data.shareTitle)
    return {
      title: that.data.shareTitle,
      path: `/pages/index/index?appEncrypt=${app.globalData.appEncrypt}`,
      // imageUrl: app.globalData.protocol + that.data.bannerList[0].bannerPic,
      success (res) {
        // 转发成功
        console.log('转发成功', res)
      },
      fail (res) {
        // 转发失败
        console.log('转发失败', res)
      }
    }
  },
  // 初始化
  init () {
    let that = this
    app.statistics({url: 'home', cUrlName: '首页'}) // 统计
    app.getAppInfo(function () {
      wx.setNavigationBarTitle({ // 动态设置标题
        // title: app.globalData.appTitle
        title: that.data.indexTitle // 
      })
    })
    // 刷新前重置列表参数
    this.data.goodsList = [] // 重置商品列表数据
    this.data.pageNumber = 2 // 重置页码
    this.data.hasMore = true
    this.data.hideTip = false
    this.getBannerList() // banner列表
    this.getGoodsList(2, 1) // 商品列表
    // this.data.loginState = app.globalData.loginState // 从入口app.js获取判断登录态
    // if (this.data.loginState) this.login('init')
  },
  // 获取banner列表数据
  getBannerList () {
    bannerList().then(({ data: { code, message, data}}) => {
      console.log("data", data)
      if (code === '200' && message === '0101') {
        // 遍历过滤出 1.活动详情 2.商品详情链接（后续需要衡量是否开启更多的不同方式的链接跳转）
        if (!data.listDistThemeBanner) return
        data.listDistThemeBanner.forEach(v => {
          if (v.linkUrl && v.linkUrl.indexOf('marketingId') > -1) {
            let url = v.linkUrl.split('marketingId')[1]
            let linkUrl = ''
            if (url.indexOf('=') > -1) linkUrl = url.replace('=', '')
            else linkUrl = decodeURIComponent(url).replace('=', '')
            if (v.linkUrl.indexOf('type') > -1) {
              v.linkUrl = `/pages/goodsDetail/goodsDetail?productId=${linkUrl}`
            } else {
              v.linkUrl = `/pages/activityDetail/activityDetail?marketingId=${linkUrl}`
            }
          } else if (v.linkUrl && v.linkUrl.indexOf('productId') > -1) {
            let url = v.linkUrl.split('productId')[1]
            let linkUrl = ''
            if (url.indexOf('=') > -1) linkUrl = url.replace('=', '')
            v.linkUrl = `/pages/goodsDetail/goodsDetail?productId=${linkUrl}`
          } else { // 非配置项清空该链接
            v.linkUrl = ''
          }
        })
        wx.stopPullDownRefresh() // 停止下拉刷新
        this.data.indicatorDots = data.listDistThemeBanner && data.listDistThemeBanner.length === 1 ? false : true // banner列表数量为1时，隐藏banner面板圆点
        this.setData({
          bannerList: data.listDistThemeBanner,
          indicatorDots: this.data.indicatorDots
        })
      }
    }).catch(e => {
      console.log('error', e)
    })
  },
  getGoodsList (number, refresh) {
    if (this.data.queue === 0) {
      wx.stopPullDownRefresh()
      if (number === 1) {
        this.setData({
          pullDownRefreshState: true,
          pullDownRefreshText: '数据已经全部加载'
        })
        setTimeout(() => { // 2s后自动隐藏弹窗提示
          this.setData({
            pullDownRefreshState: false,
          })
        },2000)
      }
      return
    }
    this.data.isload = false
    this.data.scrollLoadDis = false // 触发上拉加载，状态false
    goodsList(number, this.data.pageSize, refresh).then(({data: {code, message, data}}) => {
      let hasData = false
      this.data.queue = data.queue
      if (code === '200' && message === '0101' && data.pageView.dataList) {
        hasData = true
        if (data.pageView.dataList.length < 3 && this.data.pageNumber === 2) { // 当前页为第一页，且列表数只有1-2个，隐藏列表底部的信息提示栏
          this.data.hideTip = true
        }
        this.data.hasMore = true
        if (data.queue === 0) { // 判断是否最后一页
          this.data.hasMore = false
          this.data.hideTip = false
        }
        if (number === 1) {
          this.data.goodsList = data.pageView.dataList.concat(this.data.goodsList)
        } else {
          this.data.goodsList = this.data.goodsList.concat(data.pageView.dataList)
        }
        this.setData({
          hasMore: this.data.hasMore,
          hideTip: this.data.hideTip,
          goodsList: this.data.goodsList
        })
      } else {
        hasData = false
      }
      if (!data.pageView.dataList) { // 列表数据为空-空状态
        this.setData({
          hideTip: true,
          isEmptyList: true
        })
      }
      this.data.scrollLoadDis = true // 数据加载完成，状态为true
      if (this.data.isPullDownRefresh) {
        wx.stopPullDownRefresh()
        this.data.isPullDownRefresh = false // 重置状态
        this.setData({
          pullDownRefreshState: true,
          pullDownRefreshText: hasData ? '与品质生活不期而遇 更新10件': '刷新失败了 换个姿势再来一次'
        })
        setTimeout(() => { // 2s后自动隐藏弹窗提示
          this.setData({
            pullDownRefreshState: false,
          })
        }, 2000)
      }
      setTimeout(() => {
        this.data.isload = true
      }, 1000)
    })
  },
  // 下拉
  onPullDownRefresh () { 
    this.data.isPullDownRefresh = true // 刷新后的文本模块状态 true执行，默认：false 不执行相应事件
    if (this.data.isload) {
      wx.stopPullDownRefresh()
      this.getGoodsList(1, 0)
    }
  }, 
  // 上拉
  onReachBottom () {
    if (!this.data.scrollLoadDis) return // 状态为false，禁用数据加载
    // Do something when page reach bottom.
    this.loadMore()
  },
  // 上拉加载
  loadMore (){
    clearTimeout(scrollTimeState) // 清除滚动加载的定时器
    scrollTimeState = setTimeout(() => {
      this.getGoodsList()
    }, 200)
  },
  //************************** 侧栏-个人中心 **************************/
  // 显示个人中心
  showAsideFn () {
    this.setData({
      showAside: true
    })
    this.login('init')
  },
  // 隐藏个人中心
  hideAsideFn() {
    this.setData({
      showAside: false
    })
  },
  login (cb, option) {
    var that = this
    if (app.globalData.loginState) {
      app.getLoginState(() => {
        that.setData({
          userInfo: app.globalData.userInfo
        })
        that.getOrderCount() // 获取订单数量
        typeof cb == "function" && cb()
      })
    } else {
      if (cb === 'init') return
      app.getLoginState(() => {
        that.setData({
          userInfo: app.globalData.userInfo
        })
        that.getOrderCount() // 获取订单数量
        typeof cb == "function" && cb()
      })
    }
  },
  // 获取订单数量
  getOrderCount () {
    let that = this
    wx.getStorage({
      key: 'sessionKey',
      success (res) {
        app.http.request('GET', app.api.orderCount, {
          sessionKey: res.data
          // 'buyerId': wx.getStorageSync('buyerId')
        }).then(({data: {code, message, data}}) => {
          if (code === '200' && message === "0101" && data) {
            let orderCount = {}
            Object.keys(data).forEach(v => {
              if (data[v] > 99) {
                orderCount[v] = {
                  count: '99+', // 添加新的key count 订单数量
                  style: 'active', // 添加新的key style 控制样式
                  hide: true // 添加新的key hide 控制是否显示
                }
              } else if (data[v] > 0) {
                orderCount[v] = {
                  count: data[v], // 把数字转换成字符串
                  style: '',
                  hide: true
                }
              } else if (!data[v]) {
                orderCount[v] = {
                  count: 0, // 把数字转换成字符串
                  style: '',
                  hide: false
                }
              }
            })
            // 渲染
            that.setData({
              orderCount: Object.assign({}, orderCount)
            })
          }
        })
      } 
    })
  },
  // 跳转到订单列表
  toOrderList(e) {
    if (this.data.selectStateNum === 1) return // 次数为1返回
    this.data.selectStateNum = 1 // 第一次点击后记录次数为1
    let that = this
    let orderType = ''
    let id = e.target.id
    setTimeout(() => {
      that.data.selectState = 0
    }, 5000)
    this.login(() => {
      // 根据id判断订单类型
      if (id === 'all') orderType = '999' // 全部
      else if (id === 'noPay') orderType = '0' // 待付款
      else if (id === 'waitToSend') orderType = '1' // 待发货
      else if (id === 'sendOut') orderType = '2' // 待收货
      // 跳转
      wx.navigateTo({
        url: `/pages/orderList/orderList?orderType=${orderType}`,
        success () {
        }
      })
    })
  },
  // 跳转到地址列表
  toAddressList () {
    console.log('selectStateNum',this.data.selectStateNum)
    if (this.data.selectStateNum === 1) return // 次数为1返回
    this.data.selectStateNum = 1 // 第一次点击后记录次数为1
    setTimeout(() => {
      that.data.selectState = 0
    }, 5000)
    let that = this
    this.login(() => {
      if (app.globalData.scopeAddress === false) { // 微信地址授权
        wx.navigateTo({
          url: '/pages/addressList/addressList',
          success ()  {
            that.hideAsideFn()
          }
        })
      } else { // 微信地址未授权
        wx.chooseAddress({
          complete () {
            that.data.selectStateNum = 0
          }
        })
      }
    }, 'toAddress')
  }
})
