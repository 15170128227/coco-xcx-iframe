// wx fn 封装

// 用户登录 login
const login = function () {
  return new Promise((resolve, rejecet) => {
    wx.login({
      success: resolve,
      fail: reject
    })
  })
}

// 获取用户数据 getUserInfo
const getUserInfo = function () {
  return new Promise((resolve, reject) => {
    wx.getUserInfo({
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 存储数据 setStorage
 * @params {string}  key 键
 * @params {string}  value 值
*/
const setStorage = function (key, value) {
  return new Promise((resolve, reject) => {
    wx.setStorage({
      key: key, 
      data: value, 
      success: resolve, 
      fail: reject 
    })
  })
}

/**
 * 从存储中获取数据 getStorage
 * @params {string}  key 键
*/
const getStorage = function (key) {
  return new Promise((resolve, reject) => {
    wx.getStorage({
      key: key,
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 获取位置 getLocation
 * @params {string}  type 键
*/
const getLocation = function (type) {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: type,
      success: resolve,
      fail: reject
    })
  })
}

module.exports = {
  login,
  getUserInfo,
  setStorage,
  getStorage,
  getLocation,
  original: wx
}