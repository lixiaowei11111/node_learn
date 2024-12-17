import { Duplex } from 'node:stream';

// Duplex 是可读可写，同时实现 _read 和 _write 就可以了，也就是双工流

class DuplexStream extends Duplex {
  _read() {
    this.push('114514');
    this.push('1919810');
    this.push(null);
  }
  _write(chunk, encoding, cb) {
    console.log('[debug] data', chunk, chunk.toString());
    setTimeout(() => {
      cb();
    }, 1000);
  }
}

const duplexStream = new DuplexStream();

duplexStream.on('data', (chunk) => {
  console.log('[debug] chunk', chunk.toString());
});

duplexStream.on('end', () => {
  console.log('[debug] read end');
});

duplexStream.write('114514');
duplexStream.write('1919810');
duplexStream.end();

duplexStream.on('finish', () => {
  console.log('[debug] write done');
});

// 整合了 Readable 流和 Writable 流的功能，这就是双工流 Duplex。

// UDP 协议会用 socket 来做双向通信，它就是 Duplex 的实现
