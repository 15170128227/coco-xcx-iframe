// pages/goodsDetail/goodsDetail.js
let WxParse = require('../../wxParse/wxParse.js'); // 小程序原生html标签解析插件js引用
let app = getApp();

Page({
  // 页面的初始数据
  data: {
    themeType: app.globalData.themeType, // 应用的主题类型（不同颜色主题）
    productId: '', // 商品Id
    goodsDetailInfo: null, // 商品信息
    isEmptyList: null, // 商品详情信息为空--空状态页面
    buyBtnText: '', // 去购买按钮文本
    buyBtnTextArr: ['去购买', '已售罄', ''], // 去购买按钮文本状态
    skuList: null, // skuList列表
    protocol: 'https:', // app.globalData.protocol
    imgQuery: '', // banner图自图片服务器裁切参数 ?x-oss-process=image/resize,m_fill,w_375,h_250,q_60
    indicatorDots: true, // swiper组件参数
    circular: true, // swiper组件参数
    // 按钮禁用状态
    disabled: {
      buy: true, // 去购买btn状态
      submit: false, // 购买提交btn状态
      reduce: true, // 商品数量减少
      add: false // 商品数量添加
    },
    modalShow: false, // 模态窗状态
    goodsNormList: null, // 商品规格列表（颜色|尺码）
    curSkuMainPic: '', // 当前sku主图
    stockAllInfo: null, // 当前商品库存信息(所有)
    stockInfo: null, // 当前商品库存信息(价格/库存)
    curSkuCode: '', // 当前商品选中规格的skuCode
    curSkuId: '', // 当前商品选中规格的skuId
    quantity: 1, // 商品购买数量
    limitNum: null, // 当前商品的限购数
    limitTextShow: '', // 当前商品限购书文本
    // bar
    smileActive: false
  },
  // 生命周期函数--监听页面初始化加载
  onLoad (options) {
    let productId = this.data.productId = options.productId // 当前页面商品id
    wx.setStorage({
      key: 'fromGoodsDetailRrefshSmile',
      data: productId
    })
    // this.verifyProduct(productId) // 验证商品是否失效
    this.init(productId) // 页面初始化
  },
  onShow () {
    // 页面返回后 重置页面状态
    this.data.disabled.submit = false
    this.setData({
      disabled: this.data.disabled
    })
  },
  // 初始化
  init (productId) {
    this.getGoodsDetailInfo(productId)
  },
  // 用户点击右上角分享
  onShareAppMessage (res) {
    let that = this
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log('来自页面内转发按钮', res.target)
    }
    return {
      title: that.data.goodsDetailInfo.productName,
      path: `/pages/goodsDetail/goodsDetail?appEncrypt=${app.globalData.appEncrypt}&productId=${that.data.productId}`,
      imageUrl: that.data.goodsDetailInfo.mainPic,
      success (res) {
        // 转发成功
        console.log('转发成功')
      },
      fail (res) {
        // 转发失败
        console.log('转发失败')
      }
    }
  },
  // 点赞/取消点赞
  toggleSmileState () {
    let that = this
    if (!that.data.smileActive) that.data.goodsDetailInfo.pvNumber = Number(that.data.goodsDetailInfo.pvNumber) + 1
    that.setData({
      smileActive: true,
      goodsDetailInfo: that.data.goodsDetailInfo
    })
  },
  // 获取商品详情信息
  getGoodsDetailInfo (productId) {
    var that = this; // 保存this指针到that变量，方便之后指针改变调用
    var article = ''; // html代码变量
    // 商品详情接口
    app.http.request('GET', app.api.goodsDetail, { productId: productId}).then(({data: {code, message, data}}) => {
      if (code === '200' && message === '0101' && data) {
        let article = decodeURIComponent(data.productDesc).replace(/%20/g, ' ').replace(/<style[^>]*>[^<]*<\/style>/i, '') // 替换掉代码中style样式
        let butBtnDisabled = null // 购买按钮禁用状态
        if (data.buyFlag === 0 && data.recentlyBuyTime === null) { // 已售罄
          this.data.buyBtnText = this.data.buyBtnTextArr[1]
          butBtnDisabled = true
        } else if (data.buyFlag === 0 && data.recentlyBuyTime !== null) { // 限购时间
          this.data.buyBtnText = this.data.buyBtnTextArr[2] = data.recentlyBuyTime.substring(5,7) + '月' + data.recentlyBuyTime.substring(8, 10) + '日 ' + data.recentlyBuyTime.substring(11, 16) + '开抢'
          butBtnDisabled = true
        } else {
          this.data.buyBtnText = this.data.buyBtnTextArr[0]
          butBtnDisabled = false
        }
        data.mainPic = this.data.protocol + data.mainPic // 添加主图
        // data.pvNumber =  Math.round(Math.random() * 80 + 1) // mock点赞数据pvNumber
        let newData = Object.assign(data, { productDesc: article }) // 更新data数据
        WxParse.wxParse('article', 'html', article, that, 5); // 渲染html代码
        let skuList = this.data.skuList = data.skuList // skuList列表
        
        this.data.supplyCode = data.supplyCode // 供应商编号
        if (skuList[0]) { // skuList存在则取第一个规格商品库存
          let normFirstList = [], normSecondList = [] // 定义规格类别变量
          skuList.forEach(o =>{
            if (o.skuAttributeValue1) normFirstList = normFirstList.concat(o.skuAttributeValue1) // 第一类规格列表元素存在则添加到数组
            if (o.skuAttributeValue2) normSecondList = normSecondList.concat(o.skuAttributeValue2) // 第二类规格列表元素存在则添加到数组
          })
          normFirstList = new Set(normFirstList) // set对象去重
          normSecondList = new Set(normSecondList) // set对象去重
          let arr1 = [], arr2 = []
          normFirstList.forEach(o => {
            arr1 = arr1.concat({ text: o, state: 'default' })
          })
          normSecondList.forEach(o => {
            arr2 = arr2.concat({ text: o, state: 'default' })
          })
          let goodsNormList = { // 规格列表信息
            normFirst: data.skuAttributeName1, // 商品第一类规格标题
            normFirstList: arr1, // 第一类规格列表
            normFirstSelect: false,
            normSecond: data.skuAttributeName2, // 商品第二类规格标题
            normSecondList: arr2, // 第二类规格列表
            normSecondSelect: false,
          }
          this.data.goodsNormList = goodsNormList
         
          this.getStockInfo(skuList[0].skuCode)
        }
        // 渲染
        this.data.disabled.buy = butBtnDisabled  
        this.setData({
          goodsDetailInfo: newData,
          buyBtnText: this.data.buyBtnText,
          disabled: this.data.disabled,
          isEmptyList: false
        })

        app.statistics({url: 'goodsDetail', cUrlName: '商品详情', argument: data.productCode}) // 统计
    
      } else if (code === '200' && message === '0214') { // 查询商品数据为空--空状态页面
        this.setData({
          isEmptyList: true
        })
        // 记录首页列表刷新态，返回刷新列表
        wx.setStorage({
          key: 'fromGoodsDetailRrefsh',
          data: true
        })
      }
    })
  },
  // 当前sku获取库存信息
  getStockInfo (skuCode) {
    this.data.disabled.submit = true // 购买按钮禁用（不渲染到视图，仅是提供给按钮点击的判断）
    /* this.setData({
      disabled: this.data.disabled
    }) */
    console.log('skuCode',skuCode)
    app.http.request('GET', app.api.goodsStock, { skuCode: skuCode}).then(({data: {code, message, data}}) => {
      if (code === '200' && message === '0101' && data) {
        let mainPic = ''
        this.data.skuList.forEach(o => {
          if (o.skuCode === skuCode) {
            mainPic = o.imageOPList[0].imagePath + '/' + o.imageOPList[0].imageName + o.imageOPList[0].imageType
          }
        })
        let stock = Number(data.stock) // 库存
        let stockInfo = {
          price: data.price,
          stock: stock
        }
        
        let singleCashLimit = Number(data.singleCashLimit) // 当前sku单个限制
        let totalCashLimit = Number(data.totalCashLimit) // 总限购数
        let limitNum // 当前购买限购数
        if (data.singleCashLimit) {
          limitNum = Math.min(stock, Number(data.singleCashLimit))
          this.data.limitTextShow = true
        } else if (!data.singleCashLimit && data.totalCashLimit){
          limitNum = Math.min(stock, Number(data.totalCashLimit))
          this.data.limitTextShow = true
        } else if (!data.singleCashLimit && !data.totalCashLimit) {
          limitNum = stock
          this.data.limitTextShow = false
        }
        
        this.data.disabled.submit = stock === 0 ? true : false
        this.setData({
          curSkuMainPic: mainPic,
          stockAllInfo: data,
          stockInfo: stockInfo,
          limitNum: limitNum,
          limitTextShow: this.data.limitTextShow,
          goodsNormList: this.data.goodsNormList,
          disabled: this.data.disabled
        })
      }
    })
  },
  // 第一类规格选择
  selectNormFirst (e) {
    let normFirstList = this.data.goodsNormList.normFirstList // 第一类规格列表
    let normFirstSelect = this.data.goodsNormList.normFirstSelect // 第一类规格元素选中状态
    let normSecond = this.data.goodsNormList.normSecond // 第二类规格名称
    let normSecondList = this.data.goodsNormList.normSecondList // 第二类规格列表
    let normSecondSelect = this.data.goodsNormList.normSecondSelect // 第二类规格元素选中状态
    let skuList = this.data.skuList // 此商品的全部skuList列表
    let text = e.target.dataset.value // 当前选中元素的文本
    if (normFirstSelect === text) { // 当前元素处于选中状态点击则取消点击状态
      normFirstList.forEach(o => {
        o.state = 'default'
      })
      this.data.goodsNormList.normFirstList = normFirstList
      this.data.goodsNormList.normFirstSelect = '' // 清空第一类规格列表选中状态
      this.setData({
        goodsNormList: this.data.goodsNormList
      })
      return
    } else {
      let state = e.currentTarget.dataset.state
      if (state === 'disabled') return
    }
    // 当前元素非选中状态
    normFirstList.forEach(o => {
      if (text === o.text) {
        o.state = 'active'
        this.data.goodsNormList.normFirstSelect = normFirstSelect = text
      } else {
        o.state = 'default'
      }
    })
    this.data.goodsNormList.normFirstList = normFirstList

    if (!normSecondSelect && normSecond) { // 第二类规格列表非选中状态
      normSecondList.forEach(k => {
        let state = skuList.some(o => {
          if (o.skuAttributeValue1 === text && o.skuAttributeValue2 === k.text) {
            return true
          }
        })
        k.state = state ? 'default': 'disabled'
      })
      console.log('test1', normSecondList)
      this.data.goodsNormList.normSecondList = normSecondList
      this.data.goodsNormList.normSecondSelect = ''
      this.setData({
        goodsNormList: this.data.goodsNormList
      })
    } else if (normSecondSelect && normSecond) { // 第二类规格列表选中状态
      skuList.forEach(o => {
        if (o.skuAttributeValue1 === normFirstSelect && o.skuAttributeValue2 === normSecondSelect) {
          this.data.curSkuId = o.skuId
          this.data.curSkuCode = o.skuCode
          this.getStockInfo(o.skuCode)
        }
      })
    } else if (!normSecond) { // 无第二类规格
      skuList.forEach(o => {
        if (o.skuAttributeValue1 === normFirstSelect) {
          this.data.curSkuId = o.skuId
          this.data.curSkuCode = o.skuCode
          this.getStockInfo(o.skuCode)
        }
      })
    }
  },
  // 第二类规格选择
  selectNormSecond (e) {
    let normFirstList = this.data.goodsNormList.normFirstList // 第一类规格列表
    let normFirstSelect = this.data.goodsNormList.normFirstSelect // 第一类规格元素选中状态
    let normSecondList = this.data.goodsNormList.normSecondList // 第二类规格列表
    let normSecondSelect = this.data.goodsNormList.normSecondSelect // 第二类规格元素选中状态
    let skuList = this.data.skuList // 此商品的全部skuList列表
    let text = e.target.dataset.value // 当前选中元素的文本
    if (normSecondSelect === text) { // 当前元素处于选中状态点击则取消点击状态
      normSecondList.forEach(o => {
        o.state = 'default'
      })
      this.data.goodsNormList.normSecondList = normSecondList
      this.data.goodsNormList.normSecondSelect = '' // 清空第二类规格列表选中状态
      this.setData({
        goodsNormList: this.data.goodsNormList
      })
      return
    } else {
      let state = e.target.dataset.state
      if (state === 'disabled') return
    }
    // 当前元素非选中状态
    normSecondList.forEach(o => {
      if (text === o.text) {
        o.state = 'active'
        this.data.goodsNormList.normSecondSelect = normSecondSelect = text
      } else {
        o.state = 'default'
      }
    })
    this.data.goodsNormList.normSecondList = normSecondList

    if (!normFirstSelect) { // 第一类规格列表非选中状态
      normFirstList.forEach(k => {
        let state = skuList.some(o => {
          if (o.skuAttributeValue2 === text && o.skuAttributeValue1 === k.text) {
            return true
          }
        })
        k.state = state ? 'default': 'disabled'
      })
      this.data.goodsNormList.normFirstList = normFirstList
      this.data.goodsNormList.normFirstSelect = ''
      this.setData({
        goodsNormList: this.data.goodsNormList
      })
    } else { // 第二类规格列表选中状态
      skuList.forEach(o => {
        if (o.skuAttributeValue1 === normFirstSelect && o.skuAttributeValue2 === normSecondSelect) {
          this.data.curSkuId = o.skuId
          this.data.curSkuCode = o.skuCode
          this.getStockInfo(o.skuCode)
        }
      })
    }
  },
  // 输入数量
  bindQuantity (e) {
    let quantity = Number(e.detail.value)
    if (quantity > 1) {
      quantity = quantity > this.data.limitNum ? this.data.limitNum : quantity
      console.log('test111s', quantity)
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
  reduceQuantity (e) {
    let quantity = Number(this.data.quantity) - 1
    if (quantity === 1) {
      this.data.disabled.reduce = true
      this.setData({
        quantity: quantity,
        disabled: this.data.disabled
      })
    } else if (quantity > 1) {
      this.setData({
        quantity: quantity
      })
    }
  },
  // 数量增加
  addQuantity (e) {
    let quantity = Number(this.data.quantity) + 1 // 
    if (quantity <= this.data.limitNum) { // 商品选择的数量小于等于限制数
      this.data.disabled.reduce = false // 减少的按钮置为默认
      this.setData({
        quantity: quantity, // 重新渲染数量
        disabled: this.data.disabled // 重新渲染禁用状态
      })
    }
  },
  // 登录
  getLoginState(cb) {
    let loginState = app.globalData.loginState // 从入口app.js获取判断登录态
    console.log('loginState', loginState)
    if (!loginState) { // 未登录/登录态已过去  重新登录
      wx.login({
        success (res) { // 成功登录
          console.log('res.code', res.code)
          if (res.code) {
            // 获取用户信息
            app.getUserInfo(userRes => {
              // 请求后台登录接口--存入用户数据
              app.http.request('POST', app.api.login, {
                isLogin: '1',
                code: res.code, // 登录code
                encryptedData: decodeURIComponent(userRes.encryptedData), // 用户加密数据
                iv: userRes.iv, // 初始向量
              }).then(({data: {code, message, data}}) => {
                if (code === '200' && message ==='0101') { // 登录成功
                  wx.setStorage({ // 后台返回的sessionKey 用于后台解析
                    key: "sessionKey",
                    data: data.sessionKey
                  })
                  wx.setStorage({ // 当前用户标识
                    key: "buyerId",
                    data: data.buyerId  
                  })
                }
              })
              typeof cb == "function" && cb()
            })
          } else {
            console.log('获取用户登录态失败！' + res.errMsg)
          }
        }
      })
    } else { // 已登录
      typeof cb == "function" && cb()
    }
  },
  /**********************  商品规格信息弹窗 Module  **********************/
  // 显示商品规格信息弹窗
  showModal () {
    this.setData({
      modalShow: true,
      quantity: 1 // 打开弹窗后，重置商品数量为1
    })
  },
  // 关闭弹窗
  closeModal () {
    this.setData({
      modalShow: false
    })
  },
  // 校验商品是否失效/下架
  verifyProduct (productId, cb) {
    app.http.request('GET', app.api.verifyProduct, { productId: productId, skuCode: this.data.curSkuCode}).then(({ data: { code, message}}) => {
      if (code === '400' && message === '0217') {
        // this.data.productLose = true
        wx.showModal({
          content: '商品已下架', // 也可能是商品失效...
          showCancel: false,
          success (res) {
           if (res.confirm) { // 点击确认后返回上一页
             // 确认后返回到首页，同时刷新商品列表
             wx.setStorage({
               key: 'fromGoodsDetailRrefsh',
               data: true,
               success() {
                wx.navigateBack({
                  url: '/pages/index/index'
                })
               }
             })
           }
          }
        })
      } else {
        typeof cb === 'function' && cb()
      }
    })
  },
  // 购买提交
  paySubmit () {
    if (this.data.disabled.submit) return
    this.data.disabled.submit = true
    this.setData({
      disabled: this.data.disabled
    })
    this.verifyProduct(this.data.productId, () => {
      if (!this.data.goodsNormList.normFirstSelect && this.data.goodsNormList.normFirst) { // 第一类规格为空
        wx.showModal({
          content: '请选择' + this.data.goodsNormList.normFirst,
          showCancel: false
        })
        this.data.disabled.submit = true
        this.setData({
          disabled: this.data.disabled
        })
        return
      }
      if (!this.data.goodsNormList.normSecondSelect && this.data.goodsNormList.normSecond) { // 第二类规格为空
        wx.showModal({
          content: '请选择' + this.data.goodsNormList.normSecond,
          showCancel: false
        })
        this.data.disabled.submit = true
        this.setData({
          disabled: this.data.disabled
        })
        return
      }
      let submit = () => {
        let params = {
          skuId: this.data.curSkuId, // 当前商品规格skuId
          skuCode: this.data.curSkuCode,  // 当前商品规格skuCode
          supplyCode: this.data.goodsDetailInfo.supplyCode,  // 当前商品供应商编号
          title: this.data.goodsDetailInfo.productName, // 当前商品名称
          normFirst: this.data.goodsNormList.normFirst, // 当前商品第一类规格
          normFirstSelect: this.data.goodsNormList.normFirstSelect, // 当前商品第一类规格中的选中规格
          normSecond: this.data.goodsNormList.normSecond, // 当前商品第二类规格
          normSecondSelect: this.data.goodsNormList.normSecondSelect, // 当前商品第二类规格中的选中规格
          price: this.data.stockInfo.price, // 当前商品价格
          quantity: this.data.quantity, // 当前商品购买数量
          mainPic: this.data.curSkuMainPic, // 当前商品缩略主图
          limitNum: this.data.limitNum // 当前商品限购数
        }
        try {
          wx.setStorageSync('orderBaseInfo', params) // 设置基本订单商品信息到存储
        } catch (e) {
        }
        // 跳转到订单确认页面
        wx.navigateTo({
          url: `/pages/orderConfirm/orderConfirm`,
          success: res => {
            this.closeModal() // 关闭弹窗
            this.data.disabled.submit = true
            this.setData({
              disabled: this.data.disabled
            })
          }
        })
      }
      // 判断登录
      if (app.globalData.loginState) {
        submit()
      } else {
        app.getLoginState(submit)
      }
    })
  }
})