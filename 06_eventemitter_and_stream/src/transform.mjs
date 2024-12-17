import { Transform } from 'node:stream';
// Transform 流要实现 _transform
class ReverseStream extends Transform {
  _transform(buf, enc, next) {
    const res = buf.toString().split('').reverse().join('');
    this.push(res);

    next();
  }
}

var transformStream = new ReverseStream();

transformStream.on('data', (data) => console.log(data.toString()));
transformStream.on('end', (data) => console.log('read done'));

transformStream.write('阿门阿前一棵葡萄树');
transformStream.write('阿东阿东绿的刚发芽');
transformStream.write('阿东背着那重重的的壳呀');
transformStream.write('一步一步地往上爬');
transformStream.end();

transformStream.on('finish', (data) => console.log('write done'));
