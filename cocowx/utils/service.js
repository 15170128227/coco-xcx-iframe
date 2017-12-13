// service.js
import {get, post} from './fetch'
import {api} from './api'

/* 
 * 后台接口默认第一层数据结构
 * {
 *   code: '200', // 200:成功 400:错误 配合具体编码确认错误信息
 *   data: Object|Array|String|null, // 具体数据结构看对应的接口
 *   message: '0101', // 编码 详情请看'./api.js'
 * } 
 */

/*************************************************************  public  *************************************************************/ 
// opendid 微信用户惟一标识
/**
 * 统计
 * return Function get(api.statistics) Promise 
 * result data null
*/
export const statistics = () => get(api.statistics)

/*************************************************************  入口js  *************************************************************/ 
/**
 * 应用信息
 * return Function get(api.appInfo) Promise
 * result data Object 应用信息
*/
export const appInfo = () => get(api.appInfo)

/**
 * 登录
 * params isLogin String 必须 登录状态 isLogin='1':未登录（授权用户/未授权用户（游客）） isLogin='0':已登录
 * params code String isLogin='1'时必须(包括允许授权/拒绝授权) 微信login接口返回的code码（用于获取微信sessionKey） 
 * params encryptedData String isLogin='1'且允许授权时必须 微信用户信息授权接口返回的加密数据  
 * params iv String  isLogin='1'且允许授权时必须 微信用户信息授权接口返回的iv向量
 * 
 * params nickName String isLogin='0'时必须 用户名 微信用户信息接口返回的明文数据 
 * params avatarUrl String isLogin='0'时必须 头像地址
 * params province String isLogin='0'时必须 用户地址-省
 * params city String isLogin='0'时必须 用户地址-市
 * params sessionKey String isLogin='0'时必须 后台返回的sessionKey（用于后台取opendid）
 * 
 * return post(api.appInfo, params) Promise Function
*/
export const login = ({isLogin, code, encryptedData, iv, nickName, avatarUrl, province, city, sessionKey}) => {
  if (isLogin === '1') {
    if (encryptedData) return post(api.login, {isLogin, code, encryptedData, iv})
    else return post(api.login, {isLogin, code})
  } else if (isLogin === '0') {
    return post(api.login, {isLogin, nickName, avatarUrl, province, city, sessionKey})
  }
}

/*************************************************************  首页  *************************************************************/ 
/**
 * banner列表
 * return get(api.queryMainList) Promise Function
*/
export const bannerList = () => get(api.queryMainList) // banner列表
/**
 * goodsList 商品列表
 * params pageNo String 必须 页码
 * params pageSize String 必须 每页数量
 * return get(api.queryList, {pageNo, pageSize}) Promise Function
*/
export const goodsList = (pageNumber = 2, pageSize = 10, refresh = 0 ) => get(api.queryList, {pageNumber, pageSize, refresh}) // 商品列表

/*************************************************************  商品详情  *************************************************************/ 
/**
 * 商品基本详情
 * params productId String 必须 商品id
 * return get(api.verifyProduct, {marketingId}) Promise Function
*/
export const goodsDetail = productId => get(api.goodsDetail, {productId})

/**
 * 库存
 * params skuCode String 必须 商品skuCode
 * return get(api.goodsStock, {skuCode}) Promise Function
*/
export const goodsStock = skuCode => get(api.goodsStock, {skuCode}) // 库存

/**
 * 校验商品是否生效并已上架
 * params marketingId String 必须 商品id
 * return get(api.verifyProduct, {marketingId}) Promise Function
*/
export const verifyProduct = productId => get(api.verifyProduct, {productId})

/*************************************************************  活动详情  *************************************************************/ 
/**
 * 详情
 * params marketingId String 必须 专题id
 * return get(api.marketingDetail, {marketingId}) Promise Function
*/
export const marketing = marketingId => get(api.marketingDetail, {marketingId}) // 详情

/*************************************************************  订单  *************************************************************/ 
/**
 * 订单商品校验
 * params sessionKey String 必须 登录成功后，后台返回的sessionKey（用于后台取opendid）
 * return get(api.validateOrder, {sessionKey})  Promise Function
 * result data null
*/
export const validateOrder = sessionKey => get(api.validateOrder, {sessionKey}) // 订单商品校验

/**
 * 创建并支付订单
 * params sessionKey String 必须 后台返回的微信session
 * params buyerId String 必须 用户标识
 * params mallUserId String 必须 
 * params userId String 必须 
 * params payCode String 必须 默认:'payCode' 支付方式的code --------（此参数可以移除）
 * params payClientType String 必须 默认:'payClientType' 是否是微信环境参数 --------（此参数可以移除）
 * params buyerName String 必须 收货人
 * params buyerTel String 必须 收货人手机号码
 * params buyerAddress String 必须 收货人地址
 * params layerType String 必须 默认:'exchange' 是否启用积分兑换（待定）
 * params skuImage String 必须 订单此规格商品主图
 * params buyerMessageList Array 必须 收货人
 *    buyerMessageList: [{
 *      supplyCode String 必须 供应商编号
 *      totalMoney String 必须 订单总价格
 *      totalPoints String 必须 订单总积分
 *      quantity Number 必须 订单总数量
 *      buyerMessage String 必须 订单备注
 *    }]
 * params shoppingCartDtos Object 必须 收货人
 *    buyerMessageList: [{
 *      productSkuId String 必须 订单列表中此商品的skuId(数字转成字符串)
 *      productSkuCode String 必须 订单列表中此商品的skuCode
 *      quantity String 必须 订单列表中此商品总数量
 *    }]
 * return post(api.createdAndPayOrder, params)  Promise Function
 * result data Object 已生成的订单信息 {timeStamp, nonceStr, package, signType, paySign}
*/
export const createdAndPayOrder = params => post(api.createdAndPayOrder, params) // 创建并支付订单

/**
 * 订单列表
 * params buyerId String  必须 关联的收货地址id
 * params orderStatus String 订单类型 999:全部 0: 待付款 1:待发货 2:待收货
 * params pageNo String 页码 默认:1
 * params pageSize String 每页的数量 默认: 20
 * params hasNextPage Boolean 是否有下一页 默认:true
 * return get(api.orderList, {buyerId, orderStatus})  Promise Function
 * result data Array|null|'' (空值待定)
*/
export const orderList = ({buyerId, orderStatus, pageNo = '1', pageSize = '10', hasNextPage = true}) => get(api.orderList, {buyerId, orderStatus, pageNo, pageSize, hasNextPage}) // 订单列表

/**
 * 订单详情
 * params orderId String 必须 订单Id
 * params mallUserId String 可选 未知
 * params platformType String 可选 未知
 * return get(api.orderDetail, {orderId, mallUserId, platformType})  Promise Function
 * result data Array|null|'' (空值待定)
*/
export const orderDetail = (orderId, {mallUserId, platformType}) => get(api.orderDetail, {orderId, mallUserId, platformType})

/**
 * 支付确认
 * params sessionKey String 必须 后台返回的微信sessionKey
 * params orderId String 必须 订单id
 * params payCode String 必须 默认:'payCode' 支付方式的code --------（此参数可以移除）
 * params payClientType String 必须 默认:'payClientType' 是否是微信环境参数 --------（此参数可以移除）
 * return post(api.paySubmit, {sessionKey})  Promise Function
 * result data Object 已生成的订单信息 {timeStamp, nonceStr, package, signType, paySign}
*/
export const paySubmit = (sessionKey, orderId, payCode = 'payCode', payClientType = 'payClientType') => post(api.paySubmit, {sessionKey, orderId, payCode, payClientType}) // 支付确认
/**
 * 取消订单
 * params buyerId String 必须 关联的收货地址id
 * params orderId String 必须 订单id
 * return post(api.cancelOrder, {buyerId, orderId})  Promise Function
 * result data null|'' (空值待定)
*/
export const cancelOrder = (buyerId, orderId) => post(api.cancelOrder, {buyerId, orderId}) // 取消订单

/**
 * 确认收货
 * params buyerId String 必须 关联的收货地址id
 * params orderId String 必须 订单id
 * return post(api.orderReceive, {buyerId, orderId})  Promise Function
 * result data null|'' (空值待定)
*/
export const orderReceive = (buyerId, orderId) => post(api.orderReceive, {buyerId, orderId})

/**
 * 删除订单
 * params buyerId String 必须 关联的收货地址id
 * params orderId String 必须 订单id
 * return post(api.deleteOrder, {buyerId, orderId})  Promise Function
 * result data null|'' (空值待定)
*/
export const deleteOrder = (buyerId, orderId) => post(api.deleteOrder, {buyerId, orderId})

/**
 * 订单数量统计(不同订单状态下的数量)
 * return get(api.orderCount)  Promise Function
 * result data Array|null|'' (空值待定)
*/
export const orderCount = () => get(api.orderCount) // 订单数量统计(不同订单状态下)

/**
 * 删除订单
 * params mallOrderId String 必须 订单id
 * return get(api.deliveryInfo, {orderId})  Promise Function
 * result data null|'' (空值待定)
*/
export const deliveryInfo = mallOrderId => get(api.deliveryInfo, {mallOrderId})

/**
 * 支付后订单状态变更(支付中)
 * params orderId String 必须 订单id
 * return get(api.deliveryInfo, {orderId})  Promise Function
 * result data null|'' (空值待定)
*/
export const updatePayState = orderId => post(api.updatePayState, {orderId})

/*************************************************************  收货地址  *************************************************************/ 
/**
 * 地址列表
 * params sessionKey String 必须 登录成功后，后台返回的sessionKey（用于后台取opendid）
 * return get(api.addressList, {sessionKey})  Promise Function
 * result data Array|null|'' (空值待定)
*/
export const addressList = sessionKey => get(api.addressList, {sessionKey})

/**
 * 地址新增
 * params isdefault String 必须 默认地址标识
 * params receiverName String 必须 收货人
 * params receiverMobile String 必须 收货人手机号
 * params areaName String 必须 地址基本信息--省市区
 * params receiverShortAddress String 必须 地址详细部分--详细地址
 * params receiverAddress String 必须 全地址
 * params provinceId String 必须 省id
 * params cityId String 必须 市id
 * params regionId String 必须 县id
 * return post(api.addAddress, {buyerId})  Promise Function
 * result data null|'' (空值待定)
*/
export const addAddress = params => post(api.addAddress, params) 

/**
 * 地址编辑
 * params buyerId String 必须 关联的收货地址id
 * params isdefault String 必须 默认地址标识
 * params receiverName String 必须 收货人
 * params receiverMobile String 必须 收货人手机号
 * params areaName String 必须 地址基本信息--省市区
 * params receiverShortAddress String 必须 地址详细部分--详细地址
 * params receiverAddress String 必须 全地址
 * params provinceId String 必须 省id
 * params cityId String 必须 市id
 * params regionId String 必须 县id
 * return post(api.updateAddress, {buyerId})  Promise Function
 * result data null|'' (空值待定)
*/
export const updateAddress = params => post(api.updateAddress, params)

/**
 * 地址列表
 * params id String 必须 地址id
 * returnpost(api.deleteAddress, {id})  Promise Function
 * result data null|'' (空值待定)
*/
export const deleteAddress = id => post(api.deleteAddress, {id}) // 地址删除
                                                                                                                                            