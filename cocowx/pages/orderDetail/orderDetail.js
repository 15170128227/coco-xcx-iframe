// pages/orderDetail/orderDetail.js
let app = getApp();
let timeState = null
Page({
  /**
   * 页面的初始数据
   */
  data: {
    buyerId: '',
    sessionKey: '',
    orderId: null, // 当前订单的id
    addressInfo: null,
    orderInfo: null,
    prevOrderListType: null, // 跳转到订单详情之前订单列表的订单列表类型
    showTime: { // 倒计时
      mm: 0,
      ss: 0
    },
    timeState: null // 倒计时定时器状态
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    this.data.buyerId = wx.getStorageSync('buyerId')
    this.data.sessionKey = wx.getStorageSync('sessionKey')
    this.data.orderId = options.orderId // 当前订单id
    this.data.orderStatus = options.orderStatus // 
    this.data.payStatus = options.payStatus // 
    this.data.prevOrderListType = options.prevOrderListType || null // 跳转到订单详情之前订单列表的订单列表类型--方便删除订单删除后跳回到之前类型的订单列表
    this.init()
    app.statistics({url: 'orderDetail', cUrlName: '订单详情', argument: options.orderSn}) // 统计
  },
  // 初始化
  init () {
    this.getOrderDetail()
  },
  // 获取订单详情信息
  getOrderDetail () {
    app.http.request('GET', app.api.orderDetail, {orderId: this.data.orderId}).then(({data: {code, message, data}}) => {
      if (code === '200' && message === '0101') {
        if (data.orderInfo.payStatus === 0 && data.orderInfo.orderStatus !== -1 && data.orderInfo.orderStatus !== 4) { // 当前订单为付款中订单
          this.countTime(data.currentTime, data.orderInfo.createTime)
        }
        if (!(this.data.orderStatus == data.orderInfo.orderStatus && this.data.payStatus == data.orderInfo.orderStatus)) wx.setStorageSync('fromOrderDetailRrefsh', 'refresh') // 订单列表订单状态与订单详情状态不一致，记录返回刷新态
        this.data.addressInfo = {
          isFirst: false,
          hasArrow: true,
          userName: data.orderInfo.buyerName,
          address: data.orderInfo.buyerAddress,
          telNumber: data.orderInfo.buyerTel,
        }
        this.data.orderInfo = Object.assign(data.orderInfo, {
          goodsList: {
            mainPic: data.orderItems[0].productThumbnail,
            title: data.orderItems[0].productName,
            normFirstSelect: data.orderItems[0].skuStr,
            price: data.orderItems[0].salePrice,
            quantity: data.orderItems[0].quantity,
          },
          orderItems: data.orderItems
        })
        this.setData({
          addressInfo: this.data.addressInfo,
          orderInfo: this.data.orderInfo
        })
      }
    })
  },
  // 付款倒计时
  countTime (currentTime, createTime) {
    let that = this
    let curTime = new Date(currentTime)
    let oldTime = new Date(createTime.replace(/-/g, '/'))
    let timeSs = (curTime -oldTime)/1000
    let m = Math.floor(timeSs/60)
    let s = Math.floor(timeSs%60)
    let o = {
      mm: 29 - m,
      ss: 59 - s
    }
    if (o.mm < 0) return
    this.data.showTime.mm = o.mm < 29 ? o.mm : 29
    this.data.showTime.ss = o.ss
    timeState = setInterval(() => {
      if (that.data.showTime.mm === 0 && that.data.showTime.ss === 0) {
        this.data.orderInfo.orderStatusName = '已取消'
        this.data.orderInfo.orderStatus = -1
        clearInterval(timeState)
        this.setData({
          orderInfo: this.data.orderInfo
        })
        // that.init() // 重新初始化页面
        return
      } else if (that.data.showTime.mm !== -1) {
        if (this.data.showTime.ss === 0) {
          this.data.showTime.mm--
          this.data.showTime.ss = 59
        } else {
          this.data.showTime.ss--
        }
        this.setData({
          showTime: this.data.showTime
        })
      }
    }, 1000)
  },
  // 查看物流
  toLogistics (e) {
    let mallOrderId = e.currentTarget.dataset.mallorderid
    let mainPic = e.currentTarget.dataset.mainpic
    wx.navigateTo({
      url: `/pages/logistics/logistics?mallOrderId=${mallOrderId}&mainPic=${mainPic}`
    })
  },
  // 取消/删除/确认收货
  handleOrder (options) {
    let that = this
    wx.showModal({
      content: options.content,
      success (res) {
        if (res.confirm) { // 用户点击确定
          app.http.request('POST', options.api, options.params).then(({data: {code, message, data}}) => {
            typeof options.success === 'function' && options.success()
            wx.showToast({
              title: options.title,
              icon: 'success'
            })
          })
        }
      }
    })
  },
  // 取消订单
  cacelOrder (e) {
    let that = this
    let orderId = e.currentTarget.dataset.orderid
    that.handleOrder({
      content: '是否取消订单？',
      api: app.api.cancelOrder,
      params: {
        buyerId: that.data.buyerId,
        orderId: e.currentTarget.dataset.orderid
      },
      title: '已成功取消订单!',
      success (res) { // 支付成功
        that.data.orderInfo.orderStatusName = '已取消'
        that.data.orderInfo.orderStatus = -1
        that.setData({
          orderInfo: that.data.orderInfo
        })
        wx.setStorageSync('fromOrderDetailRrefsh', 'refresh')
      }
    })
  },
  // 删除订单
  delOrder (e) {
    let that = this
    let orderId = e.currentTarget.dataset.orderid
    that.handleOrder({
      content: '是否删除订单？',
      title: '已删除订单!',
      api: app.api.deleteOrder,
      params: {
        buyerId: that.data.buyerId,
        orderId: e.currentTarget.dataset.orderid
      },
      success: function () {
        wx.navigateBack({
          delta: 1, // 回退前 delta(默认为1) 页面
          success (res) { // 支付成功
            wx.setStorageSync('fromOrderDetailRrefsh', 'refresh')
          }
        })
      }
    })
  },
  // 确认收货
  receive (e) {
    let that = this
    let orderId = e.currentTarget.dataset.orderid
    that.handleOrder({
      content: '是否确认收货？',
      api: app.api.orderReceive,
      params: {
        buyerId: that.data.buyerId,
        orderId: e.currentTarget.dataset.orderid
      },
      title: '收货成功!',
      success (res) { // 支付成功
        that.data.orderInfo.orderStatusName = '已完成'
        that.data.orderInfo.orderStatus = 4
        that.setData({
          orderInfo: that.data.orderInfo
        })
        wx.setStorageSync('fromOrderDetailRrefsh', 'refresh')
      }
    })
  },
  // 支付订单（付款）
  payOrder (e) {
    let that = this
    let orderId = e.currentTarget.dataset.orderid
    let points = e.currentTarget.dataset.points || '0' // 需删除
    let buyerId = e.currentTarget.dataset.buyerid
    let orderItems = e.currentTarget.dataset.orderitems
    console.log('orderItems', orderItems)
    // 校验后弹出支付菜单
    let str = ''
    for (let i = 0, len = orderItems.length; i < len; i++) {
      str += orderItems[i].productSkuCode + ','
    }
    str = str.replace(/，|,$/, '')
    // 商品校验是否可以购买
    app.http.request('GET', app.api.validateOrder, {
      orderId: orderId,
      points: points,
      buyerId: buyerId,
      productList: str,
      sessionKey: that.data.sessionKey
    }).then(({data: {code, message, data}}) => {
      console.log('商品校验通过')
      app.http.request('POST', app.api.paySubmit, {
        orderId: orderId, 
        payCode: 'payCode', 
        payClientType: 'payClientType',
        sessionKey: that.data.sessionKey
      }).then(({data: {code, message, data}}) => {
        // 调用支付
        wx.requestPayment({ 
          'timeStamp': data.payTradeItemNotifyPO.timeStamp, // 时间戳
          'nonceStr': data.payTradeItemNotifyPO.nonceStr, // 随机字符串
          'package': data.payTradeItemNotifyPO.packages, // 订单惟一标识
          'signType': data.payTradeItemNotifyPO.signType, // 
          'paySign': data.payTradeItemNotifyPO.sign,
          success (res) { // 支付成功
            that.data.orderInfo.orderStatusName = '待发货'
            that.data.orderInfo.orderStatus = 1
            that.data.orderInfo.payStatus = 1
            that.setData({
              orderInfo: that.data.orderInfo
            })
            wx.setStorageSync('fromOrderDetailRrefsh', 'refresh')
            /* wx.setStorage({
              key: 'fromOrderDetailRrefsh',
              data: { // value:当前订单Id
                type: 'pay',
                orderId: orderId
              },
              success (res) {
                wx.navigateBack({
                  delta: 1
                })
              }
            }) */
          }
        })
      })
    })
  }
})