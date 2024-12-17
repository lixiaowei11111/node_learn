import { Writable } from 'node:stream';

// Readable 是实现 _read 方法，通过 this.push 返回内容
// Writable 则要实现 _write 方法，接收写入的内容。
// http 服务的 response 就是 Writable 的实例

class WritableStream extends Writable {
  constructor(iterator) {
    super();
    this.iterator = iterator;
  }

  _write(chunk, encoding, cb) {
    // chunk 是 Buffer 类型
    console.log('[debug] data', chunk, chunk.toString());
    setTimeout(() => {
      cb();
    }, 1000);
  }
}

function createWriteStream(iterator) {
  return new WritableStream(iterator);
}

const writeStream = createWriteStream();

writeStream.on('finish', () => console.log('[debug] done'));

writeStream.write('114514');
writeStream.write('1919810');
// Writable 的特点是可以自己控制消费数据的频率，只有调用 next 方法的时候，才会处理下一部分数据。
writeStream.end();
