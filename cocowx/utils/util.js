/**
 * 格式化时间
 * @param  {Datetime} date 时间对象
 * @param  {String} format 格式
 * @return {String}        格式化过后的时间
 * Demo: formatNumber(data, '-', 'ss')  argument[0]:事件对象date; argument[1]:格式（-）;argument[2]:控制显示包括到秒的时间;
 */

const formatNumber = n => n.toString()[1] ? n.toString() : '0' + n.toString()

const formatTime = (date, format = '/', limit = 'ss') => {
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()

  let hour = date.getHours()
  let minute = date.getMinutes()
  let second = date.getSeconds()

  switch (limit.toLowerCase()) {
    case 'y' :
      return [year].map(formatNumber).join(format)
      break
    case 'm' :
      return [year, month].map(formatNumber).join(format)
      break
    case 'd':
      return [year, month, day].map(formatNumber).join(format)
      break  
    case 'hms':
      return [hour, minute, second].map(formatNumber).join(':')
      break   
    case 'mm':
      return [year, month, day].map(formatNumber).join(format) + ' ' + [hour, minute].map(formatNumber).join(':')
      break  
    case 'ss':
      return [year, month, day].map(formatNumber).join(format) + ' ' + [hour, minute, second].map(formatNumber).join(':')
      break   
      
    default :  
      return [year, month, day].map(formatNumber).join(format) + ' ' + [hour, minute, second].map(formatNumber).join(':')
  }
}

module.exports = { formatTime }
 