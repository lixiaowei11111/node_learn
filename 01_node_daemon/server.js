const http = require('http');

http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('hello world111');
	res.end('test');
}).listen(8000);

/**
 * 39. 后台运行node(守护进程)和直接运行node的区别
  a. 后台运行node程序 ,比如使用PM2,forever,或者使用egg.js的--daemon守护进程模式
  b. https://developer.aliyun.com/article/1203022#slide-23
  c. 【笔记】守护进程与Nodejs | Wayne的博客
  d. https://tiven.cn/p/e430c734/
 */