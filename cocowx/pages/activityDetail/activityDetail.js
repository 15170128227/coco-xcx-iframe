// pages/activityDetail/activityDetail.js
let WxParse = require('../../wxParse/wxParse.js'); // 小程序原生html标签解析插件js引用
let app = getApp();
Page({
  // 页面的初始数据
  data: {
    marketingId: '', // 活动详情id
    marketingDetail: null, // 活动详情信息
    isEmptyList: null, // 物流信息为空--空状态页面
    protocol: 'http:',
    imgQuery: '', // banner图自图片服务器裁切参数 ?x-oss-process=image/resize,m_fill,w_375,h_375,q_60
    bannerPreviewImgs: [], // banner栏预览图片数组
    clearMb: ''
  },
  // 生命周期函数--监听页面加载
  onLoad(options) {
    this.setData({
      clearMb: options.clearMb
    })
    this.data.marketingId = options.marketingId
    app.statistics({url: 'activityDetail', cUrlName: '活动详情', argument: this.data.marketingId}) // 统计
    // console.log('this.data.marketingId', this.data.marketingId)
    this.getMarketingDetail()
  },
  // 用户点击右上角分享`
  onShareAppMessage (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log('来自页面内转发按钮', res.target)
    }
    return {
      title: this.data.marketingDetail.marketingName,
      path: `/pages/activityDetail/activityDetail?appEncrypt=${app.globalData.appEncrypt}&marketingId=${this.data.marketingId}`,
      imageUrl: this.data.marketingDetail.marketingDetailsImg,
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
  // 活动详情接口
  getMarketingDetail() {
    app.http.request('GET', app.api.marketingDetail, { marketingId: this.data.marketingId }).then(({ data: { code, message, data } }) => {
     if (code === '200' && message === '0101') {
        wx.setNavigationBarTitle({ // 动态设置标题
          title: data.marketingName
        })
        this.data.bannerPreviewImgs.push(data.marketingDetailsImg) // 需要预览的banner图片添加到预览图数组
        let article = decodeURIComponent(data.marketingDesc).replace(/%20/g, ' ').replace(/<style[^>]*>[^<]*<\/style>/i, '')
      //  let article = data.marketingDesc
        WxParse.wxParse('article', 'html', article, this, 5);
        let newData = Object.assign(data, { marketingDesc: article })
        this.setData({
          marketingDetail: newData,
          isEmptyList: false
        })
      } else if (code === '200' && (message === '0214' || message === '0217')) { // 查询活动详情数据为空-空状态
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
  previewImg (e) {
    let src = e.target.dataset.src
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: this.data.bannerPreviewImgs // 需要预览的图片http链接列表
    })
  }
})