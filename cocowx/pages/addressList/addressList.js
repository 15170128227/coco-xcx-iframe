// pages/addressList/addressList.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList: null,
    isEmptyList: null, // 收货地址信息为空--空状态页面
    fromRoute: '', // 前路由
    delBtnWidth: 60, //删除按钮宽度单位（rpx）
    startX: 0,
    startY: 0,
    currentGesture: 0,
    tipPosition: '',
    curAddressId: null, // 当前地址Id
    animationData: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    this.data.fromRoute = options.fromRoute
    this.init()
    app.statistics({url: 'addressList', cUrlName: '收货地址'}) // 统计
  },
  onShow () {
    let that = this
    wx.getStorage({
      key: 'addressRefresh',
      success (res) {
        if (res.data) {
          wx.removeStorageSync('addressRefresh')
          that.init()
        }
      }
    })
    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
    })
    this.animation = animation
  },
  // 初始化
  init () {
    this.getAddressList()
  },
  // 获取地址类别
  getAddressList () {
    app.http.request('GET', app.api.addressList, {
      sessionKey: wx.getStorageSync('sessionKey'),
      // buyerId: wx.getStorageSync('buyerId')
    }).then(({data: {code, message, data}}) => {
      if (code === '200' && message === '0101') {
        if (data) {
          this.setData({
            addressList: data,
            isEmptyList: false
          })
        } else { // 列表数据为空-空状态
          this.setData({
            isEmptyList: true
          })
        }
      } else if (code === '200' && message === '0214') { // 查询数据为空
        this.setData({
          isEmptyList: true
        })
      }
    })
  },
  // 返回订单确认页
  backOrderConfirm (e) {
    if (this.data.fromRoute === 'orderConfirm') {
      let userName = e.currentTarget.dataset.username
      let telNumber = e.currentTarget.dataset.telnumber
      let address = e.currentTarget.dataset.address
      let addressInfo = {
        userName: userName,
        telNumber: telNumber,
        address: address
      }
      // 写入选中的地址信息,方便订单确认更新收货地址
      wx.setStorage({
        key: 'notWxCurAddress',
        data: addressInfo
      })
      wx.navigateTo({
        url: '/pages/orderConfirm/orderConfirm'
      })
    }
  },
  // 编辑地址
  toEditAddress (e) {
    let curAddressId = e.currentTarget.dataset.curaddressid
    let that = this
    let curAddressInf
    that.data.addressList.forEach(v => {
      if (v.id === curAddressId) {
        curAddressInf = {
          receiverAddress: v.areaName,
          provinceId: v.provinceId,
          cityId: v.cityId,
          areaId: v.regionId,
          receiverShortAddress: v.receiverShortAddress,
          receiverName: v.receiverName,
          receiverMobile: v.receiverMobile,
          isdefault: v.isdefault
        }
        wx.setStorage({
          key: 'curEditAddressInfo',
          data: curAddressInf,
          success () {
            wx.navigateTo({
              url: `/pages/addAddress/addAddress?pageType=edit&curAddressId=${curAddressId}`
            })
          }
        })
      }
    })
    
  },
  // 删除地址
  delAddress (e) {
    let that = this
    let addressList = this.data.addressList
    let curAddressId = this.data.curAddressId
    addressList.forEach((o, index) => {
      if (o.id === curAddressId) {
        if (o.isdefault === 1) { // 默认地址
          wx.showModal({
            title: '默认地址不能删除',
            showCancel: false
          })
          return
        } else { // 非默认地址
          wx.showModal({
            content: '确定删除？',
            success (res) {
              if (res.confirm) {
                app.http.request('POST', app.api.deleteAddress, {id: curAddressId}).then(({ data: { code, message, data}}) => {
                  if (code === '200') {
                    addressList.splice(index, 1)
                    that.setData({
                      addressList: addressList,
                      tipPosition: '' // 重置位置
                    })
                    wx.showToast({
                      title: '删除成功',
                      icon: 'success',
                      duration: 2000
                    })
                  }
                })
              } else if (res.cancel) {
                that.setData({
                  tipPosition: ``
                })
                console.log('addressDelete：用户点击取消')
              }
            }
          })
        }
      }
    })
  },
  // 点击隐藏删除弹窗
  hideTipModal (e) {
    console.log('e', e)
      this.setData({
        tipPosition: ``
      })
  },
  // 长按删除弹窗
  delModal (e) {
    let disX = e.detail.x
    let disY = e.detail.y
    this.data.curAddressId = e.currentTarget.dataset.curaddressid
    this.setData({
      tipPosition: `display:block;top:${disY-50}px;left:${disX-30}px`
    })
  },
  // 滑动开始
  touchstart (e) {
    // console.log("touchS", e)
    //判断是否只有一个触摸点
    if (e.touches.length == 1) {
      this.setData({
        //记录触摸起始位置的X坐标
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
      })
    }
  },
  // 滑动
  touchmove (e) {
    // console.log("touchM:", e)
    if (e.touches.length == 1) {
      if (this.data.currentGesture === 1) return
      //记录触摸点位置的X坐标
      let moveX = e.touches[0].clientX
      let moveY = e.touches[0].clientY
      //计算手指起始点的X坐标与当前触摸点的X坐标的差值
      let disX = this.data.startX - moveX
      let disY = this.data.startY - moveY
      if (Math.abs(disX) < Math.abs(disY) && this.data.currentGesture === 0) { // 左右滑动
        //更新列表的状态
        this.setData({
          pageStyle: 'position:fixed;overflow-y:hidden;'
        })
      }
      this.data.currentGesture = 1
    }
  },
  // 滑动结束
  touchend (e) {
    // console.log("touchE", e)
    this.setData({
      pageStyle: ''
    })
    if (e.changedTouches.length == 1) {
      this.data.currentGesture = 0
      //手指移动结束后触摸点位置的X坐标
      let endX = e.changedTouches[0].clientX
      //触摸开始与结束，手指移动的距离
      let disX = this.data.startX - endX
      let delBtnWidth = this.data.delBtnWidth
      
      
      //获取手指触摸的是哪一项
      let index = e.currentTarget.dataset.index
      let list = this.data.addressList
      list.forEach((o, item) => {
        if (item === index) {
          if (disX < 0){ // 右滑
            this.animation.translateX(0).step()
          } else if (disX > 0){ // 左滑
            this.animation.translateX(-delBtnWidth).step()
          }
          o.animationData = this.animation.export()
        } else {
          o.animationData = this.animation.translateX(0).step().export()
        }
      })
      //更新列表的状态
      this.setData({
        addressList: list
      })
    }
    
  }
})