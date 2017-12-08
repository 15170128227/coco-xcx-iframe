// pages/addAddress/addAddress.js
import addressJson from '../../utils/addressList'

let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageType: '', // 页面类型 空为新增 edit:编辑
    addressInfoBase: '（省份、城市、区县）', // 省市区
    active: 'active', // 省市区元素是否为空状态
    addressInfoDetail: '', // 地址详细信息
    receiveName: '', // 收货人
    telphone: '', // 手机号码
    selecting: false, // 默认地址选中状态
    // 地址信息
    curAddressId: '', // 当前编辑地址id
    addressShow: false, // 地址组件显示状态
    addressState: true, // 地址组件顶部栏状态
    addressList: [], // 地址全部数据
    currentAdsList: [], // 地址组件当前地址栏显示的地址
    province: '', // 省
    curProvId: '', // 省Id
    provActive: '', // 省字段选中状态
    city: '', // 城市
    curCityId: '', // 城市Id
    cityActive: '', // 城市字段选中状态
    area: '', // 市县
    curAreaId: '', // 市县Id
    areaActive: '', // 市县字段选中状态
    disabled: false // 保存按钮禁用
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    
    this.data.curAddressId = Number(options.curAddressId)
    console.log('option', options)
    this.data.pageType = options.pageType // 区分是否是编辑页面，pageType存在则为编辑页面
    this.init() // 初始化
  },
  // 初始化
  init() {
    if (this.data.pageType && this.data.pageType !== '-1') {// pageType存在则为编辑页面，则修改标题为编辑地址
      wx.setNavigationBarTitle({
        title: '编辑地址'
      })
      this.getEditAddressList()
      app.statistics({url: 'editAddress', cUrlName: '地址编辑'}) // 统计
    } else { // 新增
      this.setData({
        addressShow: true
      })
      app.statistics({url: 'addAddress', cUrlName: '地址添加'}) // 统计
    }
    this.getAddressList() // 获取地址数据
  },
  // 获取当前收货地址的信息--编辑
  getEditAddressList () {
    let editAddressInfo = wx.getStorageSync('curEditAddressInfo')
    let addressArr = editAddressInfo.receiverAddress.split(' ')
    this.data.addressInfoBase = editAddressInfo.receiverAddress
    this.data.province = addressArr[0]
    this.data.curProvId = editAddressInfo.provinceId
    this.data.city = addressArr[1]
    this.data.curCityId = editAddressInfo.cityId
    this.data.area = addressArr[2]
    this.data.curAreaId = editAddressInfo.areaId
    this.data.addressInfoDetail = editAddressInfo.receiverShortAddress
    this.data.receiveName = editAddressInfo.receiverName
    this.data.telphone = editAddressInfo.receiverMobile
    this.data.selecting = editAddressInfo.isdefault == 1 ? true : false
    this.setData({
      addressInfoBase: this.data.addressInfoBase,
      active: '',
      province: this.data.province,
      city: this.data.city,
      area: this.data.area,
      addressInfoDetail: this.data.addressInfoDetail,
      receiveName: this.data.receiveName,
      telphone: this.data.telphone,
      selecting: this.data.selecting
    })
    wx.removeStorageSync('curEditAddressInfo') // 获取到信息之后移除本地存储里面的编辑地址的信息
  },
  // 显示地址选择列表
  showAddress (e) {
    this.openAddressList()
  },
  // 绑定详细地址
  bingAddressDetail (e) {
    this.setData({
      addressInfoDetail: e.detail.value
    })
  },
  // 绑定姓名
  bingName (e) {
    this.setData({
      receiveName: e.detail.value
    })
  },
  // 绑定手机号码
  bindPhone (e) {
    this.setData({
      telphone: e.detail.value.toString() // 把手机号转换成字符串
    })
  },
  // 设置默认地址
  setDefaultAddress () {
    let selecting = !this.data.selecting // 取反设置
    this.setData({
      selecting: selecting
    })
  },
  // 保存新增地址
  save () {
    let validatePhone = phone => /^1[3-8]\d{9}/g.test(phone) // 验证手机号码格式
    if (!this.data.receiveName) {
      wx.showModal({
        content: '姓名不能为空！',
        showCancel: false,
      })
      return
    }
    if (!this.data.telphone) {
      wx.showModal({
        content: '手机号码不能为空！',
        showCancel: false,
      })
      return
    }
    if (!validatePhone(this.data.telphone)) {
      wx.showModal({
        content: '请输入正确的手机号码！',
        showCancel: false,
      })
      return
    }
    if (!(this.data.province || this.data.city || this.data.area)) {
      wx.showModal({
        content: '请选择正确的地址！',
        showCancel: false,
      })
      return
    }
    if (!this.data.addressInfoDetail) {
      wx.showModal({
        content: '详细地址不能为空！',
        showCancel: false,
      })
      return
    }
    this.setData({
      disabled: true
    })

    let params = {
      buyerId: wx.getStorageSync('buyerId'),
      isdefault: this.data.selecting ? 1 : 0, // 默认地址标识
      receiverName: this.data.receiveName, // 收货人
      receiverMobile: this.data.telphone, // 收货人手机号
      areaName: this.data.addressInfoBase, // 地址基本信息--省市区
      receiverShortAddress: this.data.addressInfoDetail,// 地址详细部分--详细地址
      receiverAddress: this.data.addressInfoBase + ' ' + this.data.addressInfoDetail, // 全地址
      provinceId: this.data.curProvId, // 省id
      cityId: this.data.curCityId, // 市id
      regionId: this.data.curAreaId // 县id
    }
    // 新增|编辑请求
    if (this.data.pageType && this.data.pageType !== '-1') { // 编辑
      Object.assign(params, { id: this.data.curAddressId}) // 添加一个编辑地址id属性
      app.http.request('POST', app.api.updateAddress, params).then(({data: {code, message, data}}) => {
        this.setData({
          disabled: false
        })
        if (code === '200') { // 返回刷新
          wx.setStorage({
            key: 'addressRefresh',
            data: true
          })
          wx.navigateBack({
            delta: 1
          })
        }
      })
    } else { // 新增 两种情况：this.data.pageType === '-1'(前路由是订单确认页); this.data.pageType 不存在，(前路由是地址列表页)
      app.http.request('POST', app.api.addAddress, params).then(({data: {code, message, data}}) => {
        this.setData({
          disabled: false
        })
        if (code === '200') {
          if (this.data.pageType === '-1') { // 前路由是订单确认页，保存后返回订单确认页
            let userName = params.receiverName
            let telNumber = params.receiverMobile
            let address = params.receiverAddress.replace(' ', '')
            let addressInfo = {
              userName: userName,
              telNumber: telNumber,
              address: address
            }
            try {
              wx.setStorageSync('notWxCurAddress', addressInfo) // 写入选中的地址信息,方便订单确认更新收货地址
              wx.setStorageSync('refreshCurAdds', true)
            } catch(e) {}
            wx.navigateBack({ // 返回订单确认页
              delta: 1
            })
          } else { // 前路由是地址列表页，保存后返回地址列表页
            wx.setStorage({
              key: 'addressRefresh',
              data: true
            })
            wx.navigateBack({
              delta: 1
            })
          }
        }
      }).catch(res => {
        console.log('addAddress fail', res)
      })
    }
  },
  // 取消新增|编辑地址返回上一页
  cancel () {
    wx.navigateBack({
      delta: 1
    })
  },
  /********************************** 地址组件 ****************************/
  // 获取静态地址数据
  getAddressList() {
    /* app.http.request('GET', app.api.address).then(res => {
      console.log('app.api.address', app.api.address, res)
      this.data.addressList = this.data.currentAdsList = res.data
      this.setData({
        currentAdsList: this.data.currentAdsList
      })
    }) */
    this.setData({
      currentAdsList: addressJson
    })
  },
  // 打开地址组件
  openAddressList () {
    this.setData({
      addressShow: true
    })
  },
  // 关闭地址组件
  closeAddressList() {
    this.setData({
      addressShow: false
    })
  },
  // 选择省列表
  selectPro (e) {
    let curProvId = e.target.dataset.curCityId
    this.setData({
      curCityId: '', // 当前城市id
      city: '', // 当前城市
      cityActive: '', // 城市样式状态
      curAreaId: '', // 当前区县id
      area: '', // 当前区县
      areaActive: '', // 当前区县样式状态
      addressState: true, // 
      currentAdsList: this.data.addressList // 当前地址列表--省列表
    })
  },
  // 选择城市列表
  selectCity (e) {
    let curCityId = e.target.dataset.curCityId
    let curProvId = this.data.curProvId
    let nextList = null
    this.data.addressList.some((o, index) => {
      if (o.id === curProvId) {
        nextList = this.data.addressList[index].children
      }
    })
    this.setData({
      curAreaId: '',
      area: name,
      areaActive: '',
      addressState: false,
      currentAdsList: nextList
    })
  },
  // 选择地址（省市区当前列表当前元素） parId:父级Id 区分省市区 0:省 
  selectAddress (e) {
    let parId = e.target.dataset.parid
    let id = e.target.dataset.id
    let name = e.target.dataset.name
    let nextList = null
    console.log('address', parId, id, name, parId.toString().length)
    if (parId === 0) { // 省
      this.data.currentAdsList.some((o, index) => {
        if (o.id === id) {
          nextList = this.data.currentAdsList[index].children
          // console.log('addressList', this.data.currentAdsList[index].children)
        }
      })
      this.setData({
        curProvId: id,
        province: name,
        provActive: 'active',
        addressState: false,
        currentAdsList: nextList
      })
    } else if (parId.toString().length === 2) { // 城市
      this.data.currentAdsList.some((o, index) => {
        if (o.id === id) {
          nextList = this.data.currentAdsList[index].children
          // console.log('addressList', this.data.currentAdsList[index])
        }
      })
      this.setData({
        curCityId: id,
        city: name,
        cityActive: 'active',
        addressState: false,
        currentAdsList: nextList
      })
    } else if (parId.toString().length === 4) { // 区县 --- 选择区县后自动关闭地址列表选择
      let addressInfoBase = this.data.province + ' ' + this.data.city + ' ' + name
      this.setData({
        curAreaId: id,
        area: name,
        areaActive: 'active',
        addressInfoBase: addressInfoBase,
        active: '',
        addressState: false,
        addressShow: false
      })
    }
  },
  // 选中地址
  saveAddress () {
    this.closeAddressList() // 关闭地址组件
    let addressInfoBase = this.data.province + ' ' + this.data.city + ' ' + this.data.area
    this.setData({
      addressInfoBase: addressInfoBase,
      active: ''
    })

  }
})