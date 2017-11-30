// pages/logistics /logistics .js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    logisticsInfo: null,
    isEmptyList: null, // 物流信息为空--空状态页面
    mallOrderId: '', // 订单Id
    mainPic: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    this.setData({
      mainPic: options.mainPic
    })
    this.data.mallOrderId = options.mallOrderId
    this.getLogisticsInfo()
    app.statistics({url: 'logistics', cUrlName: '物流信息', argument: this.data.mallOrderId}) // 统计
  },
  // 获取物流信息
  getLogisticsInfo () {
    app.http.request('GET', app.api.deliveryInfo, {mallOrderId: this.data.mallOrderId}).then(({data: {code, message, data}}) => {
      if (code === '200' && message === '0101') {
        console.log('物流信息接口请求成功')
        if (data.expressContent.toString()) {
          data.expressContent.forEach((o, index) => {
            o.day = o.time.substring(0, 10)
            o.time = o.time.substring(10, 19)
            if (index === 0) {
              o.active = 'active'
            } else {
              o.active = ''
            }
          })
          this.setData({
            logisticsInfo: data,
            isEmptyList: false
          })
        } else { // 列表数据为空-空状态
          this.setData({
            isEmptyList: true
          })
        }
      }
    })
    
  }
})