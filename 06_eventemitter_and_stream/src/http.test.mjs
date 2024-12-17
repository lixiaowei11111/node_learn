import http from 'node:http';

import fs from 'node:fs';

const server = http.createServer(async function (req, res) {
  // 将data.txt文件作为一个可写流实例导出
  const writeStream = fs.createWriteStream(import.meta.dirname + '/data.txt', 'utf-8');
  // req就是一个Readable可读流,将req的输入通过管道传给data.txt这个文件进行覆写
  req.pipe(writeStream);
  res.end('done');
});

server.listen(8000);
