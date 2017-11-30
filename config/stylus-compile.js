var fs = require("fs"); // 文件模块

//path模块，可以生产相对和绝对路径
var path = require("path");

var stylusFilePath = 'cocowx'; // 需要编译的目录

//获取当前目录绝对路径，这里resolve()不传入参数
var filePath = path.join(path.resolve(), stylusFilePath);

var ignoreDir = ['components', 'images', '.idea', 'utils', 'stylus', 'wxParse']; // 不执行编译的目录

var stylus = require('stylus'); // stylus模块

var oldFile = '.styl';
var outFile = '.wxss';

//读取文件存储数组
var fileArr = [];

//读取文件目录
fs.readdir(filePath, function (err, files) {
  if (err) {
    console.log(err);
    return;
  }
  var count = files.length;
  //console.log(files);
  var results = {};
  files.forEach(function (filename, index) {

    //filePath+"/"+filename不能用/直接连接，Unix系统是”/“，Windows系统是”\“
    fs.stat(path.join(filePath, filename), function (err, stats) {
      if (err) throw err;
      //文件
      if (stats.isFile()) {
        if (getdir(filename) == 'styl') {
          stylusRender(filePath, filename, true) // stylus渲染
        }
      } else if (stats.isDirectory()) {
        if (ignoreDir.indexOf(filename) === -1) {
          var name = filename;
          readFile(path.join(filePath, filename), name);
        }
        // console.log("%s is a directory文件目录", filename);
        　　　　　　　　　//返回指定文件名的扩展名称 
        //console.log(path.extname("pp/index.html"));
        //var readurl = filePath+'/'+filename;
        //filePath+"/"+filename不能用/直接连接，Unix系统是”/“，Windows系统是”\“
        //    console.log(path.join(filePath,filename));
       
      }
    });
  });
});


//获取后缀名
function getdir(url) {
  var arr = url.split('.');
  var len = arr.length;
  return arr[len - 1];
}
// 创建目录
function createFolder (to) { //文件写入
  var sep = path.sep
  var folders = path.dirname(to).split(sep);
  var p = '';
  while (folders.length) {
      p += folders.shift() + sep;
      if (!fs.existsSync(p)) {
          fs.mkdirSync(p);
      }
  }
};
function creatCssFile (curName, stylName) { // 创建css文件
  let str = fs.readFileSync(stylName, 'utf8')
  stylus.render(str, function(err, css) {
    if (err) throw err;
    fs.writeFile(curName, css, function (err) {
      if (err) console.error(err);
        console.log('数据写入的数据');
        console.log('-------------------');
    });
  });
}
function stylusRender (readurl, name, last) {
  let curName, stylName
  if (last) {
    stylName = path.join(readurl, name)
    curName = stylName.replace(oldFile, '') + outFile;
  } else {
    stylName = path.join(readurl, name) + oldFile;
    curName = path.join(readurl, name) + outFile;
  }
  console.log('stylusRender', curName, stylName)
  fs.exists(curName, function(exists) {   // 文件校验是否存在
    if (exists) { // 存在
      creatCssFile(curName, stylName) // stylus渲染
    } else {
      console.log('文件不存在');
      createFolder(curName);
      fs.createWriteStream(curName);
      creatCssFile(curName, stylName) // stylus渲染
    }
  });
}

//获取文件数组
function readFile(readurl, name) {
  console.log('readurl', readurl, name);
  var name = name;
  fs.readdir(readurl, function (err, files) {
    if (err) { console.log(err); return; }

    files.forEach(function (filename) {
      fs.stat(path.join(readurl, filename), function (err, stats) {
        if (err) throw err;
        //是文件
        if (stats.isFile()) {
          if (getdir(filename) == 'styl') {
            stylusRender(readurl, name) // stylus渲染
          }
        } else if (stats.isDirectory()) {
          var dirName = filename;
          // readFile(path.join(filePath, filename), name);
          // readFile(path.join(readurl, filename), name + '/' + dirName);
          readFile(path.join(readurl, filename), dirName);
          //利用arguments.callee(path.join())这种形式利用自身函数，会报错
          //arguments.callee(path.join(readurl,filename),name+'/'+dirName);
        }
      });
    });
  });
}
