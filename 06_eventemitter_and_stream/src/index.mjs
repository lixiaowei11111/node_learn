import http from 'node:http';
import fs from 'node:fs';

console.log('[debug] import.meta', import.meta);
const server = http.createServer(async function (req, res) {
  // 网络请求和文件读取,标准输入输出流(stdin,stdout)都可以以stream来操作
  // 文件较小时可以同步读取,文件较大时则需要使用stream来操作
  //   const data = fs.createReadStream(import.meta.dirname + '/data.txt', 'utf-8');
  //   res.end(data);
  // response header返回Content-Length:6

  const readStream = fs.createReadStream(import.meta.dirname + '/data.txt', 'utf-8');
  // 通过管道传输给可写流
  readStream.pipe(res); //ReadStream.pipe方法参数接受一个stream.WriteSrteam(而http的response模板恰好就是可写流)
  //response header不再返回ContentLength而是返回 transfer-encoding:chunked
  readStream.on('end', () => {
    console.log('Pipe ended');
  });
  console.log('Pipe started');
  // pipe方法是异步的,并且不会返回Promise
  //返回promise版本的可以使用pipeline方法
});

server.listen(8000);
