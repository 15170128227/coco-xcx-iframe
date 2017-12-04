const common = require('./common'); // 公共函数

/**
 * 抓取远端API的结构
 * https://developers.douban.com/wiki/?title=movie_v2
 * @param  {String} method    method 方法名['get', 'post']
 * @param  {String} api    api 根地址
 * @param  {Objece} params 参数
 */
const request = function (method, url, param) {
  'use strict'
  method = method.toLowerCase();
  // if (methods !== 'get' || methods !== 'post') return
  if (method === 'get') {
    param = common.serialize(param);
    param = param ? '?' + param : ''
    url = url + param;
  }
  return new Promise((resolve, reject) => {
    let appEncrypt = wx.getStorageSync('appEncrypt')
    wx.request({
      url: url,
      method: method,
      data: method === 'get' ? {} : Object.assign({}, param),
      header: {
        'appEncrypt': appEncrypt, // 小程序新增请求头
        // 'x-auth-token': '1130c789-8005-4539-9a51-0af51b068d57', // 原接口请求必须（小程序后期需删掉）
        'Content-Type': 'application/json;charset=utf-8' // 定义公共请求头 Content-Type
      },
      success: resolve, // Promose 的resolve方法
      fail: reject // Promose 的reject方法
    })
  })
} 

// reWrite
const base = ({url, method, data, header}) => {
  return new Promise((resolve, reject) => {
    let appEncrypt = wx.getStorageSync('appEncrypt')
    wx.request({
      url: url,
      method: method,
      data: data,
      header: Object.assign({
        'appEncrypt': appEncrypt // 小程序新增请求头
      }, header),
      success: resolve, // Promose 的resolve方法
      fail: reject // Promose 的reject方法
    })
  })
}
const get = function (url, param) {
  'use strict'
  param = common.serialize(param) ? '?' + common.serialize(param) : ''
  url = url + param
  return base({
    url: url ,
    method: 'get',
    data: {}
  })
} 
const post = function (url, param) {
  'use strict'
  return base({
    url: url ,
    method: 'post',
    data: param,
    header: {
      'Content-Type': 'application/json;charset=utf-8' // 定义公共请求头 Content-Type
    }
  })
} 

module.exports = { request, get, post}