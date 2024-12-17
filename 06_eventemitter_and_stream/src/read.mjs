process.stdin.on('readable', () => {
  const buf = process.stdin.read();
  console.log('[debug] buf', buf?.toString('UTF-8'));
});

/**

流就是分段的传输内容，比如从服务端像浏览器返回响应数据的流，读取文件的流等。

流和流之间可以通过管道 pipe 连接，上个流的输出作为下个流的输入。

可以把流想象成水管，水管的一端流入水，另一端流出。

 */
