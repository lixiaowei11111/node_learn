import { Readable } from 'node:stream';

// Readable 要实现 _read 方法，通过 push 返回具体的数据。
// http 服务的 request 就是 Readable 的实例

// 1. 通过实例然后重写 _read方法
// const readableStream = new Readable();

// readableStream._read = function () {
//   this.push('114514');
//   this.push('1919810');
//   this.push(null); //传null表示结束流,不传递null会一直读入导致内存泄漏
// };

//2. 最优雅的方式是通过继承的方式
// class ReadableStream extends Readable {
//   _read() {
//     this.push('114514');
//     this.push('1919810');
//     this.push(null); //传null表示结束流,不传递null会一直读入导致内存泄漏
//   }
// }

// const readableStream = new ReadableStream();

// 3. 和yield结合
class ReadableStream extends Readable {
  constructor(iterator) {
    super();
    this.iterator = iterator;
  }

  _read() {
    const next = this.iterator.next();
    if (next.done) {
      return this.push(null);
    } else {
      this.push(next.value);
    }
  }
}

function* countGenerator() {
  yield '114514，';
  yield '23145，';
  yield '123456，';
  yield '116654。';
}

const countIterator = countGenerator();

// const readableStream = new ReadableStream(countIterator);

// 4. 封装一个createReadableStream的工厂方法,就和fs.createReadStream一样了
function createReadStream(interator) {
  return new ReadableStream(interator);
}

const readableStream = createReadStream(countIterator);

readableStream.on('data', (chunk) => {
  console.log('[debug] chunk', chunk.toString());
});

readableStream.on('end', (chunk) => {
  console.log('[debug] end', chunk);
});

// [debug] chunk 114514
// [debug] chunk 1919810
// [debug] end undefined
