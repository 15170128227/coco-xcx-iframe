// pages/orderList/orderList.js
let app = getApp()
let scrollTimeState = null
let scrollTop = { // 订单定列表定位
  all: 0,
  penddingPay: 0,
  penddingSend: 0,
  penddingReceive: 0,
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    buyerId: '',
    sessionKey: '',
    initOrderType: '', // 订单初始化状态的类型 
    currentOrderType: 'type1', // 当前活动状态的订单类型 样式状态 type1:全部 type2:待付款 type3:待发货 type4:待收货
    currentOrderNum: '999', // 当前活动状态的类型数值（接口参数）
    // 订单类型列表数据
    orderTypeList: [
      {
        id: 'all',
        active: 'active',
        text: '全部',
        orderType: 999
      },
      {
        id: 'penddingPay',
        active: '',
        text: '待付款',
        orderType: 0
      },
      {
        id: 'penddingSend',
        active: '',
        text: '待发货',
        orderType: 1
      },
      {
        id: 'penddingReceive',
        active: '',
        text: '待收货',
        orderType: 2
      },
    ],
    // 订单列表
    orderList: null,
    isEmptyList: null, // 订单列表信息为空--空状态页面
    scrollLoadDis: true, // true允许加载，false禁止加载
    toggleOrderList: true, // 
    allList: null, // 全部列表
    penddingPayList: null, // 待付款列表
    penddingSendList: null, // 待发货列表
    penddingReceiveList: null, // 待收货列表
    // 滚动加载参数
    scrollEleHeight: '100vh', // 滚动元素的高度
    scrollTop: 0, // 滚动元素的滚动高度
    timeState: null, // 定时器状态
    pageNo: 1, // 当前页码
    pageSize: 10, // 每页数量
    hasNextPage: true, // 是否有下一页的状态
    hasMore: true, // 是否最后一页数据
    hideTip: true, // 列表元素总长度小于3个，隐藏底部的 我是有底线的元素 false:显示  true:隐藏
    tipCenter: true,
    countArr: [] // 订单列表对应的倒计时集合
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    this.data.buyerId = wx.getStorageSync('buyerId')
    this.data.sessionKey = wx.getStorageSync('sessionKey')
    this.data.currentOrderNum = this.data.initOrderType = options.orderType || '999' // 无参数则默认参数为全部订单（orderType=999）
    this.init() // 初始化列表
    app.statistics({url: 'orderList', cUrlName: '订单列表'}) // 统计
  },
  onShow () {
    let that = this
    let orderList = this.data.orderList
    wx.getStorage({
      key: 'fromOrderDetailRrefsh',
      success (res) {
        that.data.currentOrderNum
        that.orderParamsReset() // 重置订单列表参数
        that.init() // 刷新列表
        wx.removeStorageSync('fromOrderDetailRrefsh') // 移除当前本地存储的key:fromOrderDetailRrefsh 避免后续其他订单详情的同类操作冲突
      }
    })
  },
  init() {
    this.orderTypeStyleFn(this.data.currentOrderNum)
    this.getOrderList(this.data.currentOrderNum)
  },
  // 订单列表重新渲染前的参数重置到初始
  orderParamsReset () {
    // 刷新前重置列表参数
    this.data.orderList = null, // 重置列表
    this.data.hasMore = true, // 重置是否是最后一页数据
    // this.data.hideTip = true // 重置列表个数小于3时的状态为true
    this.data.pageNo = 1 // 重置列表页码为1
    this.data.hasNextPage = true // 重置是否有下一页的状态为true
    this.data.isEmptyList = null // 重置空状态
    this.setData({
      hideTip: true,
      isEmptyList: false
    })
    /* // 清空列表中的定时器状态
    this.data.countArr.forEach(v => {
      if (v && v.timerState) {
        clearInterval(v.timerState)
      }
    }) */
  },
  // 获取订单列表信息 type:订单类型（全部|待付款|待发货|待收货）
  getOrderList(orderType, reset) {
    /* wx.showLoading({
      title: '加载中',
    }) */
    if (!this.data.hasMore) return
    this.data.scrollLoadDis = false // 触发上拉加载，状态false
    if (!this.data.toggleOrderList) return
    this.data.toggleOrderList = false
    console.log('tettetsttsas')
    if (reset) {
     this.orderParamsReset() // 重置订单列表参数
    }
    app.http.request('GET', app.api.orderList, {
      buyerId: this.data.buyerId,
      pageNo: this.data.pageNo,
      pageSize: this.data.pageSize,
      hasNextPage: this.data.hasNextPage,
      orderStatus: orderType
    }).then(({data: {code, message, data}}) => {
      if (code === '200' && message === '0101') {
        this.data.toggleOrderList = true
        this.data.scrollLoadDis = true // 数据加载完成，状态为true
        wx.stopPullDownRefresh() // 停止下拉刷新
        
        if (reset) {
          this.setData({
            orderList: null
          })
         }
        
        if (!data) { // 数据为空
          if (this.data.pageNo === 1) { // 列表数据为空-空状态
            // 显示空白页
            this.setData({ // 列表数据为空-空状态
              orderList: null,
              isEmptyList: true
            })
          } else {
            this.setData({ 
              orderList: null,
              isEmptyList: false
            })
          }
          return
        }
        if (this.data.pageNo === 1) { // 第一页
          console.log('this.data.pageNo111',this.data.pageNo)
          this.data.orderList = data.orderInfoList
        } else { // 非第一页
          console.log('this.data.pageNo222',this.data.pageNo)
          this.data.orderList = this.data.orderList.concat(data.orderInfoList)
        }
        this.data.pageNo++ // 页码+1
        this.data.hasNextPage = data.paginator.hasNextPage // 是否有下一页
        if (this.data.pageNo > data.paginator.totalPages) {
          this.setData({
            hasMore: false,
            orderList: this.data.orderList
          })
        } else {
          this.setData({
            hasMore: true,
            orderList: this.data.orderList
          })
        }
        if (data.orderInfoList.length < 3 && this.data.pageNo === 2) {
          this.setData({
            hideTip: true
          })
        } else {
          this.setData({
            hideTip: false
          })
        }
        this.setData({
          tipCenter: false,
          isEmptyList: false
        })
        
        /* // 遍历订单--有付款功能的添加倒计时
        this.data.orderList.forEach((o, index) => {
          if (o.payStatus === 0 && o.orderStatus !== -1 && o.orderStatus !== 4) {
            let createTime = new Date(o.addTime)
            let obj = {
              mm: Math.round(Math.random() * 29),
              ss: Math.round(Math.random() * 59),
              timerState: null
            }
            this.timer(obj, index)
          }
        }) */
      }
     
    })
  },
  // 下拉
  onPullDownRefresh () {  
    this.orderParamsReset() // 重置订单列表参数
    this.init() // 刷新列表
  }, 
  // 上拉
  onReachBottom () {
    if (!this.data.scrollLoadDis) return // 状态为false，禁用数据加载
    this.loadMore()
  },
  // 滚动到底部加载
  loadMore () {
    clearTimeout(scrollTimeState)
    scrollTimeState = setTimeout(() => {
      this.getOrderList(this.data.currentOrderNum)
    }, 200)
  },
  /* // 倒计时
  timer (obj, index) {
    let mm = obj.mm
    let ss = obj.ss
    obj.timerState = setInterval(() => {
      if (mm === 0 && ss === 0) {
        clearInterval(obj.timerState)
        return
      }
      if (mm >= 0) {
        if (ss !== 0) {
          ss = ss-1
        } else {
          mm = mm-1
          ss = 59
        }
      }
      Object.assign(obj, {
        mm: mm,
        ss: ss
      })
      this.data.countArr[index] = Object.assign({}, obj)
      this.setData({
        countArr: this.data.countArr
      })
    }, 1000)
  }, */
  // 当前订单列表的订单类型（wxml顶部动画渲染）
  orderTypeStyleFn(orderType = 999) {
    orderType = Number(orderType)
    let orderTypeStyle
    if (orderType === 999) {
      orderTypeStyle = 'type1'
    } else if (orderType === 0) {
      orderTypeStyle = 'type2'
    } else if (orderType === 1) {
      orderTypeStyle = 'type3'
    } else if (orderType === 2) {
      orderTypeStyle = 'type4'
    }
    this.data.orderTypeList.forEach(o => {
      if (Number(orderType) === o.orderType) o.active = 'active'
      else o.active = ''
    })
    this.setData({
      // initOrderType: orderTypeStyle,
      orderTypeList: this.data.orderTypeList,
      currentOrderType: orderTypeStyle
    })
  },
  // 选择不同类型订单列表
  selectOrderType (e) {
    console.log('selectOrderType',this.data.toggleOrderList)
    if (!this.data.toggleOrderList) return
    this.data.orderTypeList.forEach(o => {
      if (o.id === e.target.id) {
        this.orderParamsReset() // 重置订单列表参数
        this.setData({ // 加载等待条居中显示
          orderList: null
        })
        o.active = 'active'
        this.data.currentOrderNum = o.orderType
        this.orderTypeStyleFn(o.orderType)
        this.getOrderList(o.orderType, true)
      } else {
        o.active = ''
      }
    })
    this.setData({
      orderTypeList: this.data.orderTypeList
    }) 
  },
  // 跳转到订单详情
  toOrderDetail (e) {
    let dataset = e.currentTarget.dataset
    let orderId = dataset.orderid
    let orderSn = dataset.ordersn
    let orderStatus = dataset.orderstatus
    let payStatus = dataset.paystatus
    wx.navigateTo({
      url: `/pages/orderDetail/orderDetail?orderId=${orderId}&prevOrderListType=${this.data.currentOrderNum}&orderSn=${orderSn}&orderStatus=${orderStatus}&payStatus=${payStatus}`
    })
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
  // 取消订单--全部订单/待付款
  cacelOrder (e) {
    let that = this
    let orderId = e.currentTarget.dataset.orderid
    that.handleOrder({
      content: '是否取消订单？',
      title: '已成功取消订单!',
      api: app.api.cancelOrder,
      params: {
        buyerId: that.data.buyerId,
        orderId: orderId
      },
      success: function () {
        that.cancelFinishCallback(orderId)
      }
    })
  },
  // 取消订单后不刷新渲染（不重新请求接口）
  cancelFinishCallback (orderId) {
    let that = this
    let currentOrderNum = that.data.currentOrderNum // 当前订单类型
    let list = that.data.orderList // 当前订单列表
    if (Number(currentOrderNum) === 0) { // 待取消订单列表
      list.forEach((o, index) => {
        if (o.orderId === orderId) {
          list.splice(index, 1) // 删除此订单
        }
      })
      if (list.length === 0) {
        that.data.isEmptyList = true
      }
    } else if (Number(currentOrderNum) === 999) { // 全部订单列表
      list.forEach(o => {
        if (o.orderId === orderId) {
          o.orderStatusName = '已取消' // 更改此订单状态
          o.orderStatus = -1 // 更改此订单状态
        }
      })
    }
    that.setData({
      orderList: list,
      isEmptyList: that.data.isEmptyList
    })
  },
  // 删除订单--全部订单
  delOrder (e) {
    let that = this
    let orderId = e.currentTarget.dataset.orderid
    that.handleOrder({
      content: '是否删除订单？',
      title: '已删除订单!',
      api: app.api.deleteOrder,
      params: {
        buyerId: that.data.buyerId,
        orderId: orderId
      },
      success: function () {
        that.delFinishCallback(orderId)
      }
    })
  },
  // 删除订单后不刷新渲染（不重新请求接口）
  delFinishCallback (orderId) {
    let that = this
    let currentOrderNum = that.data.currentOrderNum // 当前订单类型
    let list = that.data.orderList // 当前订单列表
    if (Number(currentOrderNum) === 999) { // 全部订单列表
      list.forEach((o, index)  => {
        if (o.orderId === orderId) {
          list.splice(index, 1) // 删除此订单
        }
      })
      if (list.length === 0) {
        that.data.isEmptyList = true
      }
    }
    that.setData({
      orderList: list,
      isEmptyList: that.data.isEmptyList
    })
  },
  // 确认收货--全部订单/待收货
  receive (e) {
    let that = this
    let orderId = e.currentTarget.dataset.orderid
    that.handleOrder({
      content: '是否确认收货？',
      title: '收货成功!',
      api: app.api.orderReceive,
      params: {
        buyerId: that.data.buyerId,
        orderId: orderId
      },
      success: function () {
        that.receiveFinishCallback(orderId)
      }
    })
  },
  // 确认收货后不刷新渲染（不重新请求接口）
  receiveFinishCallback (orderId) {
    let that = this
    let currentOrderNum = that.data.currentOrderNum // 当前订单类型
    let list = that.data.orderList // 当前订单列表
    if (Number(currentOrderNum) === 2) { // 待收货列表
      list.forEach((o, index)  => {
        if (o.orderId === orderId) {
          list.splice(index, 1) // 删除此订单
        }
      })
      if (list.length === 0) {
        that.data.isEmptyList = true
      }
    } else if (Number(currentOrderNum) === 999) { // 全部订单列表
      list.forEach(o => {
        if (o.orderId === orderId) {
          o.orderStatusName = '已完成' // 更改此订单状态
          o.orderStatus = 4 // 更改此订单状态--
        }
      })
    }
    that.setData({
      orderList: list,
      isEmptyList: that.data.isEmptyList
    })
  },
  // 支付订单（付款）
  payOrder (e) {
    let that = this
    let orderId = e.currentTarget.dataset.orderid
    let points = e.currentTarget.dataset.points || '0' // 需删除
    let buyerId = e.currentTarget.dataset.buyerid
    let orderItems = e.currentTarget.dataset.orderitems
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
        console.log('paySubmit', code, message, data)
        // 调用支付
        wx.requestPayment({ 
          'timeStamp': data.payTradeItemNotifyPO.timeStamp, // 时间戳
          'nonceStr': data.payTradeItemNotifyPO.nonceStr, // 随机字符串
          'package': data.payTradeItemNotifyPO.packages, // 订单惟一标识
          'signType': data.payTradeItemNotifyPO.signType, // 
          'paySign': data.payTradeItemNotifyPO.sign,
          success (res) { // 支付成功
            console.log('支付成功')
            // 刷新当前列表
            // that.getOrderList(that.data.currentOrderNum, true)
            that.payFinishCallback(orderId)
          }
        })
      })
    })
  },
  // 支付成功后不刷新渲染（不重新请求接口）
  payFinishCallback (orderId) {
    let that = this
    let currentOrderNum = that.data.currentOrderNum // 当前订单类型
    let list = that.data.orderList // 当前订单列表
    if (Number(currentOrderNum) === 0) { // 待付款列表
      list.forEach((o, index)  => {
        if (o.orderId === orderId) {
          list.splice(index, 1) // 删除此订单
        }
      })
      if (list.length === 0) {
        that.data.isEmptyList = true
      }
    } else if (Number(currentOrderNum) === 999) { // 全部订单列表
      list.forEach(o => {
        if (o.orderId === orderId) {
          o.orderStatusName = '待发货' // 更改此订单状态
          o.orderStatus = 1 // 更改此订单状态--待收货
          o.payStatus = 1
        }
      })
    }
    that.setData({
      orderList: list,
      isEmptyList: that.data.isEmptyList
    })
  }
})