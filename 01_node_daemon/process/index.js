console.log(process.env,'process.env');// 输出操作系统的环境变量
console.log(process.env.NODE_ENV,'process.env.NODE_ENV');//bash下执行 NODE_ENV=production node index.js,cmd执行 set NODE_ENV=production node index.js
console.log(process.argv,'process.env.argv');// bash execute node index.js --trace-warnings name=aaa 
/**
 * 返回的是一个数组,数组的前两项固定是node路径和运行的js文件的路径
 * [
  'C:\\Users\\wb.lixiaowei01\\AppData\\Roaming\\nvm\\v14.21.2\\node.exe',
  'E:\\node_learn\\01_node_daemon\\process\\index.js',
  '--trace-warnings',
  'name=aaa'
] process.env.argv
 */
// 使用minimist来处理接收的命令行参数
const  argv = require('minimist')(process.argv.slice(2));//忽略位置0,1的参数 
console.log('minimist',argv);// node index.js -x 3 -y 4 -n5 -abc --beep=boop foo bar baz
/**
 minimist {
  _: [ 'foo', 'bar', 'baz' ],
  x: 3,
  y: 4,
  n: 5,
  a: true,
  b: true,
  c: true,
  beep: 'boop'
}
其实上面的例子分别介绍了解析参数中 number bool string array 的用法
-x 3 -y4 -n5 都是number类型, `-<变量名><数字值>`或者`-<变量名> <数字值>`
-abc 相当于 -a -b -c 但是后面没有参数,会被赋值为bool 
--beep=boop 则是 `--<属性值>=<字符串>`
foo bar baz 则是既没有 `-`,和 `--`前缀,也就不存在赋值会被列为默认属性 `-`的数组值
 */
console.log(process.cwd(),'process.cwd');// E:\node_learn\01_node_daemon\process 输出当前工作目录
console.log(process.config,'process.config');// 输出node的配置信息
console.log(process.pid,'process.pid');// 11976 process.pid 返回当前运行的进程的id 16274
console.log(process.version,'process.version');// v14.21.2 process.version // 返回node的版本号
console.log(process.versions,'process.versions');// 返回node的版本号以及依赖库的版本号
/*
{
  node: '14.21.2',
  v8: '8.4.371.23-node.88',
  uv: '1.42.0',
  zlib: '1.2.11',
  brotli: '1.0.9',
  ares: '1.18.1',
  modules: '83',
  nghttp2: '1.42.0',
  napi: '8',
  llhttp: '2.1.6',
  openssl: '1.1.1s',
  cldr: '40.0',
  icu: '70.1',
  tz: '2022f',
  unicode: '14.0'
} process.versions
*/
console.log(process.arch,'process.arch');// x64 process.arch 返回当前系统的处理器架构（字符串），比如'arm', 'ia32', or 'x64'。
console.log(process.platform,'process.platform');// win32 process.platform 返回当前系统的平台（字符串），比如'win32', 'linux', or 'darwin'。

process.stdin.setEncoding("utf8");
// 监听读取
process.stdin.on("readable", () => {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    process.stdout.write(`data: ${chunk}`);
  }
});

// 读关闭
process.stdin.on("end", () => {
  process.stdout.write("stdin end");
});

// 执行程序，可以看到，程序通过 process.stdin 读取用户输入的同时，通过 process.stdout 将内容输出到控制台