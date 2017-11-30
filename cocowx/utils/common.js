/**
 * 公共函数 common.js 
*/
const common = {};

common.serialize = function (obj) {
  if (Object.prototype.toString.call(obj).slice(8, -1).toLowerCase() === 'object') {
    let str = '';
    for (var k in obj) {
      if (obj[k].toString()) str += k + '=' + obj[k] + '&';
    }
    return str.replace(/&$/g, '')
  }
}

common.isTypeof = function (obj) {
  return Object.prototype.toString().call(obj).slice(8, -1).toLowerCase();
}

/**
 * nonceStr 随机字符串生成
 * @params len number 生成的字符串长度
 * @params radix number 生成的字符串的基数
 * */
common.nonceStr = function (len) {
  let baseStr = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  let baseArr = []
  let i
  let length = baseStr.length
  let srtLen

  if (len) {
    srtLen = len
  } else {
    srtLen = Math.floor(Math.random()*26 + 5) // 限制长度
  }
  for (i = 0; i < srtLen; i++) baseArr[i] = baseStr[0 | Math.random()*length];
  return baseArr.join('');
}

module.exports = common
  