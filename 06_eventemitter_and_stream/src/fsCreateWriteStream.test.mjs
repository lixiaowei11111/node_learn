import fs from 'node:fs';

const writeStream = fs.createWriteStream('tmp.txt', 'utf-8');

writeStream.on('finish', () => console.log('done'));

writeStream.write('阿门阿前一棵葡萄树，');
writeStream.write('阿东阿东绿的刚发芽，');
writeStream.write('阿东背着那重重的的壳呀，');
writeStream.write('一步一步地往上爬。');
writeStream.end();
