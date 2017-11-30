const common = require('./common'); // 公共函数

/**
 * 抓取远端API的结构
 * https://developers.douban.com/wiki/?title=movie_v2
 * @param  {String} method    method 方法名['get', 'post']
 * @param  {String} api    api 根地址
 * @param  {Objece} params 参数
 */
const request = function (method, urls, param) {
  'use strict'
  let url = '';
  let methods = method.toLowerCase();
  let params
  // if (methods !== 'get' || methods !== 'post') return
  if (methods === 'get') {
    params = common.serialize(param);
    params = params ? '?' + params : ''
    // url = `$(urls)/?$(params)`
    url = urls + params;
  } else {
    url = urls;
  }
  return new Promise((resolve, reject) => {
    let appEncrypt = wx.getStorageSync('appEncrypt')
    wx.request({
      url: url,
      method: method,
      data: methods === 'get' ? {} : Object.assign({}, param),
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

module.exports = { request }