// pages/orderConfirm/orderConfirm.js
let app = getApp();
Page({
  // 页面的初始数据
  data: {
    addressBarState: '', // undefined:未开始授权 true:微信授权 false:微信未授权
    addressInfo: {
      isFirst: true, // 是否新增收货地址
      userName: '', // 收货人姓名
      address: '', // 收货人地址
      telNumber: '', // 收货人电话号码
    }, // 收货人地址信息
    orderBaseInfo: null, // 订单确认的基本订单信息
    quantity: null, // 订单的最新商品数量
    limitNum: null, // 当前商品限购数
    postage: '0', // 邮费
    remarks: '', // 订单备注
    totalPrice: '',
    // 按钮禁用状态
    disabled: {
      reduce: true, // 商品数量减少
      add: false, // 商品数量添加
      submit: false // 结算提交btn状态
    },
    rextareaTop: ''
  },
  // 生命周期函数--监听页面加载
  onLoad (options) {
    this.init()
    app.statistics({url: 'orderConfirm', cUrlName: '订单确认'}) // 统计
  },
  // 初始化
  init () {
    this.getSysInfo()
    this.getAddressInfo()
    this.getOrderBaseInfo()
  },
  // 获取设备系统信息
  getSysInfo () {
    let that = this
    wx.getSystemInfo({
      success: function(res) {
        // 根据ios|Android版本渲染样式（解决wx textarea标签兼容问题）
        if (res.system.indexOf('Android') > -1) { //
          that.setData({
            rextareaTop: '0'
          })
        } else {
          that.setData({
            rextareaTop: '-16'
          })
        }
      }
    })
  },
  // 判断微信地址授权状态
  getAddressInfo () {
    let that = this
    wx.getSetting({
      success (res) { // 成功获取用户所有授权状态scope
        let addressBarState = that.data.addressBarState = res.authSetting['scope.address']
        console.log('addressBarState', addressBarState)
        if (addressBarState === undefined) { // 微信地址授权(未允许|未拒绝)
          that.data.addressInfo.isFirst= true // 新增
        } else if (addressBarState === true) { // 微信地址授权
          let wxCurAddress = wx.getStorageSync('wxCurAddress')
          if (wxCurAddress) { // 如果微信已授权 且有默认地址
            that.data.addressInfo.isFirst = false // false:编辑
            that.data.addressInfo.userName = wxCurAddress.userName // 收货人名称
            that.data.addressInfo.address = wxCurAddress.provinceName + wxCurAddress.cityName + wxCurAddress.countyName + wxCurAddress.detailInfo // 收货人地址信息
            that.data.addressInfo.telNumber = wxCurAddress.telNumber // 收货人手机号码
            // 渲染
            that.setData({
              addressInfo: that.data.addressInfo
            })
          }
        } else if (addressBarState === false){ // 微信地址未授权
          let notWxCurAddress = wx.getStorageSync('notWxCurAddress') // 非微信下的当前地址
          wx.removeStorage('notWxCurAddress') // 异步移除缓存
          if (notWxCurAddress) { // 地址列表某个地址选中后的跳转/新增地址保存的跳转
            that.data.addressInfo.isFirst = false // 显示地址信息
            that.data.addressInfo.userName = notWxCurAddress.userName // 收货人姓名
            that.data.addressInfo.telNumber = notWxCurAddress.telNumber // 收货人电话号码
            that.data.addressInfo.address = notWxCurAddress.address // 收货人地址
            that.setData({
              addressInfo: that.data.addressInfo
            })
          } else {
            app.http.request('GET', app.api.addressList, {
              sessionKey: wx.getStorageSync('sessionKey'),
              buyerId: wx.getStorageSync('buyerId')
            }).then(({ data: { code, message, data}}) => {
              if (code === '200' && message === '0101') { // 成功会返回数据
                if (data) {
                  that.data.addressInfo.isFirst = false // 显示地址信息
                  that.data.addressInfo.userName = data[0].receiverName // 收货人姓名
                  that.data.addressInfo.telNumber = data[0].receiverMobile // 收货人电话号码
                  that.data.addressInfo.address = data[0].receiverAddress // 收货人地址
                  that.setData({
                    addressInfo: that.data.addressInfo
                  })
                } else {
                  that.data.addressInfo.isFirst = true // 显示地址信息
                  that.setData({
                    addressInfo: that.data.addressInfo
                  })
                }
              } else if (code === '400' && message === '0102') {
                wx.showModal({
                  content: app.msg[message],
                  showCancel: false
                })
              }
            })
          }
        }
      }
    })
  },
  // 从本地存储中获取商品详情中的基本订单商品信息
  getOrderBaseInfo () {
    wx.getStorage({
      key: 'orderBaseInfo',
      success: res => {
        this.setData({
          quantity: res.data.quantity,
          limitNum: res.data.limitNum,
          totalPrice: (Number(res.data.price) * res.data.quantity).toFixed(2),
          orderBaseInfo: res.data,
        })
        console.log('orderBaseInfo', this.data.orderBaseInfo)
      },
      fail: res => {

      }
    })
  },
  // 跳转到地址列表
  address () {
    let addressBarState = this.data.addressBarState // 
    let isFirst = this.data.addressInfo.isFirst // 是否新增地址状态
    console.log('addressBarStat2222e,', addressBarState, isFirst)
    if (isFirst) { // to新增
      if (addressBarState === false) { //
        wx.navigateTo({
          url: '/pages/addAddress/addAddress?fromRoute=orderConfirm&pageType=-1'
        })
      } else {
        this.selectAddress()
      }
    } else { // to列表
      if (addressBarState === false) { //
        wx.navigateTo({
          url: '/pages/addressList/addressList?fromRoute=orderConfirm'
        })
      } else {
        this.selectAddress()
      }
    }
  },
  // 选择地址-微信地址
  selectAddress () {
    let that = this
    wx.chooseAddress({
      // 调用微信地址信息
      success (res) {
        let addressInfo = {
          userName: res.userName,
          postalCode: res.postalCode,
          provinceName: res.provinceName,
          cityName: res.cityName,
          countyName: res.countyName,
          detailInfo: res.detailInfo,
          nationalCode: res.nationalCode,
          telNumber: res.telNumber
        }
        // 写入选中的地址信息
        wx.setStorage({
          key: 'wxCurAddress',
          data: addressInfo
        })
        that.data.addressInfo.isFirst = false // 显示地址信息
        that.data.addressInfo.userName = res.userName // 收货人姓名
        that.data.addressInfo.address = res.provinceName + res.cityName + res.countyName + res.detailInfo // 收货人地址信息
        that.data.addressInfo.telNumber = res.telNumber // 收货人电话号码
        that.setData({
          addressInfo: that.data.addressInfo
        })
      },
      fail (res) { // 取消授权
        console.log('取消选择微信地址', res)
        if (res.errMsg.indexOf('cancel') > -1) { // 允许授权，但是取消选择地址
          that.data.addressBarState = true
        } else { // 拒绝授权微信地址，使用自定义地址
          that.data.addressBarState = false
        }
        // that.data.addressBarState = false
      }
    })
  },
  // 输入数量
  bindQuantity(e) {
    let quantity = Number(e.detail.value)
    if (quantity > 1) {
      quantity = quantity > this.data.limitNum ? this.data.limitNum : quantity
      this.data.disabled.reduce = false
      this.setData({
        disabled: this.data.disabled,
        quantity: quantity
      })
    } else {
      if (quantity <= 0) quantity = 1
      this.setData({
        quantity: quantity
      })
    }
  },
  // 数量减少
  reduceQuantity(e) {
    let quantity = Number(this.data.quantity) - 1
    this.data.orderBaseInfo.quantity = quantity
    if (quantity === 1) {
      this.data.disabled.reduce = true
      this.setData({
        quantity: quantity,
        totalPrice: (Number(this.data.orderBaseInfo.price) * quantity).toFixed(2),
        orderBaseInfo: this.data.orderBaseInfo,
        disabled: this.data.disabled
      })
    } else if (quantity > 1) {
      this.setData({
        quantity: quantity,
        totalPrice: (Number(this.data.orderBaseInfo.price) * quantity).toFixed(2),
        orderBaseInfo: this.data.orderBaseInfo,
      })
    }
  },
  // 数量增加
  addQuantity(e) {
    let quantity = Number(this.data.quantity) + 1
    let limitNum = this.data.limitNum // 当前购买限制数
    if (quantity <= limitNum) { // 商品选择的数量小于等于限制数
      this.data.disabled.reduce = false // 减少的按钮置为默认
      this.data.disabled.add = true // 增加的按钮置为默认
      this.data.orderBaseInfo.quantity = quantity
      this.setData({
        quantity: quantity, // 重新渲染数量
        orderBaseInfo: this.data.orderBaseInfo,
        totalPrice: (Number(this.data.orderBaseInfo.price) * quantity).toFixed(2),
        disabled: this.data.disabled // 重新渲染禁用状态
      })
    }
  },
  // 留言
  updateRemarks (e) {
    this.data.remarks = e.detail.value 
  },
  // 结算支付
  paySubmit () {
    if (this.data.addressInfo.isFirst) { // 收货地址为空
      wx.showModal({
        content: '收货地址为空',
        showCancel: false
      })
    }
    // 点击后禁用支付按钮，防止出现重复提交操作
    this.data.disabled.submit = true
    this.setData({
      disabled: this.data.disabled
    })
    // 提交的参数
    let orderArray = [{
      "supplyCode": this.data.orderBaseInfo.supplyCode, // 供应商编号
      "totalMoney": this.data.orderBaseInfo.price * this.data.orderBaseInfo.quantity, // 订单总价格
      "totalPoints": 0,
      "quantity": this.data.orderBaseInfo.quantity, // 订单的商品总数量
      "buyerMessage": this.data.remarks, // 订单备注
      'productSkuCode': this.data.orderBaseInfo.skuCode, // 订单当前商品的skuCode
    }]
    let shoppingCartDtos = [{
      'productSkuId': this.data.orderBaseInfo.skuId + '', // 订单当前商品的skuId(数字转成字符串)
      'productSkuCode': this.data.orderBaseInfo.skuCode, // 订单当前商品的skuCode
      'quantity': this.data.orderBaseInfo.quantity, // 订单的商品总数量
    }]
    let params = Object.assign({}, {
      "payCode": 'payCode', // 支付方式的code --------（此参数可以移除）
      "payClientType": 'payClientType', // 是否是微信环境参数 --------（此参数可以移除）
      "buyerName": this.data.addressInfo.userName, // 收货人
      "buyerTel": this.data.addressInfo.telNumber, // 收货人手机号码
      "buyerAddress": this.data.addressInfo.address, // 收货人地址
      "layerType": 'exchange',
      "buyerMessageList": orderArray,
      "shoppingCartDtos": shoppingCartDtos,
      skuImage: this.data.orderBaseInfo.mainPic, // 订单此规格商品主图
      sessionKey: wx.getStorageSync('sessionKey'), // 后台返回的微信session
      buyerId: wx.getStorageSync('buyerId'), // 用户标识
      mallUserId: app.globalData.mallUserId,
      userId: wx.getStorageSync('userId')
    })
    // 支付接口
    app.http.request('POST', app.api.createdAndPayOrder, params).then(({data: {code, message, data}}) => {
      console.log('创建订单成功', code, message, data)
      if (code === '200') {
        console.log('发起支付调用成功')
        if (code === '200' && message === '0215') { // 0元订单支付成功
          wx.showToast({
            title: '支付成功，2s后自动跳转',
            icon: 'success',
            duration: 4000,
            success (res) {
               // 跳转到订单列表
               wx.redirectTo({
                url: '/pages/orderList/orderList',
              })
            }
          })
          return
        }
        // 调用支付
        wx.requestPayment({ 
          'timeStamp': data.payTradeItemNotifyPO.timeStamp, // 时间戳
          'nonceStr': data.payTradeItemNotifyPO.nonceStr, // 随机字符串
          'package': data.payTradeItemNotifyPO.packages, // 订单惟一标识
          'signType': data.payTradeItemNotifyPO.signType, // 
          'paySign': data.payTradeItemNotifyPO.sign,
          success (res) { // 支付成功
            console.log('支付成功')
            // 请求接口更新订单状态
            app.http.request('POST', app.api.updatePayState, {
              orderId: data.payTradeItemNotifyPO.orderId
            }).then(({data: {code, message, data}}) => {
              // 跳转到订单列表
              wx.redirectTo({ 
                url: '/pages/orderList/orderList',
              })
            })
          },
          fail (res) {
            console.log('fail', res)
            console.log('支付失败')
            wx.showModal({
              content: '支付失败',
              showCancel: false
            })
            // 请求接口更新订单状态
            app.http.request('POST', app.api.updatePayState, {
              orderId: data.payTradeItemNotifyPO.orderId
            }).then(({data: {code, message, data}}) => {
              // 跳转到订单列表
              wx.redirectTo({ 
                url: '/pages/orderList/orderList',
              })
            })
          }
        })
      } else if (code === '400') {
        if (message.indexOf('已经超过单个用户限购数量') > -1) {
          wx.showModal({
            content: '已经超过单个用户限购数量!',
            showCancel: false,
            success (res) {
              wx.navigateBack({
                delta: 1
              })
            }
          })
        } else if (message.indexOf('该商品已经超过限购总数量') > -1) {
          wx.showModal({
            content: '该商品已经超过限购总数量!',
            showCancel: false,
            success (res) {
              wx.navigateBack({
                delta: 1
              })
            }
          })
        }
      }
      // 支付按钮禁用取消
      this.data.disabled.submit = false
      this.setData({
        disabled: this.data.disabled
      })
    })
  }
})