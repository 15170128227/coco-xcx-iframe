/**
 * 接口对象 api.js
 * 
*/
const xcxBaseApi5 = 'https://www.cocosurprise.com/tsh-api'; // 正式 appEncrypt=bGpNUHA5MTNkWGYzMWJBNWcxMjQ4  bGpNUHA5MTNkWGYzMWJBNWcxMjQ5
const xcxBaseApi3 = 'https://www.stage.cocosurprise.com/tsh-api'; // 预发布 appEncrypt=bGpNUHA5MTNkWGYzMWJBNWcxMjI5
const baseApi = 'https://www.test.cocosurprise.com/tsh-api'; // 测试 appEncrypt=bGpNUHA5MTNkWGYzMWJBNWcxMjM0
const xcxBaseApi2 = 'https://www.test.cocosurprise.com/tsh-api'; // 测试 appEncrypt=bGpNUHA5MTNkWGYzMWJBNWcxMjM0
const baseApi5 = 'http://192.168.1.180:8005/tsh-api'; // 测试
const baseApi3 = 'https://wxapi.cocosurprise.com'; // 支付
const xcxBaseApi = 'http://192.168.1.25:8005/tsh-api'; // 后端测试
const xcxBaseApi4 = 'http://192.168.1.29:8005/tsh-api'; // 后端测试
const localhostApi = 'http://localhost'; // 本地
// --------------- 原数据
const api1 = {
  // 解密
  startDecrypt: baseApi3 + '/wxapi/decrypt/startDecrypt',
  // 初始化入口
  getAppInfo: baseApi + '/h5Product/getAppInfo', // 应用信息接口
  getLayerAndOpen: baseApi + '/h5Product/getLayerAndOpen', // 应用浮层接口
  // 首页
  queryMainList: baseApi + '/h5Product/queryH5MainList', // banner列表
  queryList: baseApi + '/h5Product/queryH5NewMainAllGoodsList', // 商品列表
  // 商品详情
  queryGoodsDetail: baseApi + '/h5Product/queryH5GoodDetail', // 商品详情
  stockPrice: baseApi + '/stock/getStockPrice', // 商品单个规格的库存信息
  verifyProduct: baseApi + '/h5Product/verifyProduct', // 校验商品是否下架

  // 活动页详情x
  queryMarketingDetail: baseApi + '/h5Product/queryMarketingDetail',

  // 订单列表
  myList: baseApi + '/v1/shopping/order/myList', // 订单列表
  orderCount: baseApi + `/v1/shopping/order/queryUserOrderCount`, // 订单数量
  orderDetail: baseApi + `/v1/shopping/order/detail`, // 订单详情
  orderDelete: baseApi + `/v1/shopping/order/delete`, // 订单删除
  orderCancel: baseApi + `/v1/shopping/order/cancel`, // 订单取消
  orderReceive: baseApi + `/v1/shopping/order/receive`, // 确认收货

  // 地址
  addressList: baseApi + '/v1/buyer/address/list', // 地址列表
  addressAdd: baseApi + '/v1/buyer/address/add', // 新增
  addressUpdate: baseApi + '/v1/buyer/address/update', // 编辑
  addressDelete: baseApi + '/v1/buyer/address/delete', // 删除

  // 支付
  validateProduct: baseApi + `/v1/shopping/order/validateOrderProduct`, // 校验商品是否可以购买
  createdAndPayOrder: baseApi + `/v1/shopping/order/createdAndPayOrder`, // 生成订单并跳转到相应的支付页面
  paySubmit: baseApi + `/v1/shopping/order/paySubmit`, // 商品的支付

  // static--静态数据
  address: 'https://imagecache.cocosurprise.com/js/address/addressList.js' // 地址数据
}
// --------------- 原数据
const api = {
  // 解密
  startDecrypt: baseApi3 + '/wxapi/decrypt/startDecrypt',

  // 应用
  appInfo: xcxBaseApi + '/program/getAppInfo', // 应用信息接口
  // 统计
  statistics: xcxBaseApi + '/program/insertVisit', // 统计 @params {argument:'具体参数',cUrlName:'别名',url:'模块名',userId:'登陆后的用户id'} method:'GET'
  
  // 首页
  queryMainList: xcxBaseApi + '/program/product/queryMainList', // 首页banner列表 + 推荐列表 method:'GET'
  queryProductList: xcxBaseApi + '/program/product/queryProductList', // 首页营销缓存商品列表 method:'GET'
  // queryList: xcxBaseApi + '/program/product/queryList', // 首页营销活动列表 method:'GET'
  queryList: xcxBaseApi + '/program/product/queryRandomList', // 首页营销活动列表 method:'GET'

  // 商品详情
  goodsDetail: xcxBaseApi + '/program/product/queryGoodsDetail', // 商品详情 @params {productId:'商品id'} method:'GET'
  goodsStock: xcxBaseApi + '/program/product/getStockPrice', // 商品库存 @params {skuCode: 'sku编码'} method: 'GET'
  verifyProduct: xcxBaseApi + '/program/product/verifyProduct', // 校验商品是否生效并已上架 @params {marketingId:'商品id'} method:'GET'

  // 活动详情
  marketingDetail: xcxBaseApi + '/program/product/queryMarketingDetail', // 活动详情 @params {marketingId:'商品id'} method:'GET'

  // 主题
  // themeList: xcxBaseApi + '/program/product/queryThemeList', //  method:'GET' --- 主题列表页面待定

  // 订单
  validateOrder: xcxBaseApi + '/program/order/validateOrderProduct', // 订单商品校验 @params {sessionKey:'微信session'} method:'GET'
  createdAndPayOrder: xcxBaseApi + '/program/order/createdAndPayOrder', // 创建并支付订单 @params {marketingId:'商品id'} method:'POST'
  orderList: xcxBaseApi + '/program/order/orderList', // 订单列表 @params {buyerId:'用户标识', orderStatus:'订单状态'} method:'GET'
  orderDetail: xcxBaseApi + '/program/order/detail', // 订单详情  @params {mallUserId:'(可选)', orderId:'订单id',platformType: '(可选)'} method:'GET'
  paySubmit: xcxBaseApi + '/program/order/paySubmit', // 支付确认 @params {sessionKey:'微信session'} method:'POST'
  cancelOrder: xcxBaseApi + '/program/order/cancel', // 取消订单 @params {buyerId:'用户标识', orderId:'订单id'} method:'POST'
  orderReceive: xcxBaseApi + '/program/order/receive', // 确认收货 @params {buyerId:'用户标识', orderId:'订单id'} method:'POST'
  deleteOrder: xcxBaseApi + '/program/order/delete', // 删除订单 @params {buyerId:'用户标识', orderId:'订单id'} method:'POST'
  orderCount: xcxBaseApi + '/program/order/queryUserOrderCount', // 订单数量统计(不同订单状态下) method:'GET'
  deliveryInfo: xcxBaseApi + '/program/order/deliveryInfoList', // 物流信息 @params {orderId:'订单id'} method:'GET'

  // 支付
  updatePayState: xcxBaseApi + '/program/payResult', // 支付后订单状态变更(支付中)  @params {orderId:'订单id'} method:'POST'

  // 用户
  login: xcxBaseApi + '/program/user/login', // 登录 @params {code:'登录code', encryptedData: '加密数据', iv: '初始向量'} method:'POST'
  // 用户地址
  addressList: xcxBaseApi + '/program/user/address/list', // 地址列表 @params {sessionKey:'后台返回的微信sessionKey'} method:'GET'
  addAddress: xcxBaseApi + '/program/user/address/add', // 地址新增 @params {buyerId:''} method:'POST'
  updateAddress: xcxBaseApi + '/program/user/address/update', // 地址编辑 @params {buyerId:'用户id', id:'地址id'} method:'POST'
  deleteAddress: xcxBaseApi + '/program/user/address/delete', // 地址删除 @params {id:'地址id'} method:'POST'

  // static--静态数据
  address: 'https://imagecache.cocosurprise.com/js/address/addressList.js' // 地址数据
}
const refreshMsg = '网络错误，请稍后重试！';
const msg = {
  '0101': '请求成功', // 200 请求成功 false
  '0102': refreshMsg, // 400 非法请求--(参数不能为空) true
  '0103': refreshMsg, // 400 系统错误 true
  '0201': '手机号为空', // 200 手机号为空
  '0202': '手机号格式不正确', // 200 手机号格式不正确 true
  '0203': '账号或密码错误！', // 200 账号或密码错误！true
  '0204': '密码格式不正确', // 200 密码格式不正确 true
  '0205': '短信验证码错误', // 200 短信验证码错误 true
  '0206': '短信发送过于频繁（小于60S）', // 200 true
  '0207': '手机号未注册', // 200 用户不存在 false
  '0208': '手机号已注册', // 200 用户已存在 true
  '0209': '自有用户体系登录已失效', // 200 自有用户体系登录已失效 false
  '0210': '非自有用户体系登录已失效', // 200 非自有用户体系登录已失效 false
  '0211': refreshMsg, // 400 应用失效 false
  '0212': 'openid未绑定', // 200 openid未绑定 false
  '0213': '手机号已绑定其他微信号！', // 400 OpenId与手机号未进行绑定 true
  '0214': refreshMsg, // 400 查询数据获取为空！ true
  '0215': '支付成功，返回落地页！', // 200 支付成功，返回落地页！ false
  '0216': refreshMsg, // 400 签名值无效！ true
  '0217': '该商品已失效！', // 400 商品校验不存在 true
  '0220': '此规格商品已售罄', // 400 该商品库存不足true
}
module.exports = { api, msg }