/**
 * Created by Administrator on 2017/8/21.
 */

const path = require('path')

const resolve = function (src) {
    return path.resolve(__dirname, '..', src)
}
const rules = {

}
const plugins = {}
module.exports = {
    entry: {
        'main': './main.js'
    },
    output: {
        path: resolve('dist'),
        filename: '[name].js'
    },
    modules: Object.assign({}, rules)
}