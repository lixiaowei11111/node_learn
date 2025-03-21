const buf1 = new ArrayBuffer(16);

console.log('[debug] buf1', buf1, buf1.byteLength);

const buf2 = buf1.slice(0, 8); //slice方法会创建一个副本即复制,而不是引用

console.log('[debug] buf2', buf2, buf2.byteLength); //不能直接读取ArrayBuffer的实例

// DataView 视图

const buf3 = new ArrayBuffer(16);

// 默认使用全部
const fullView = new DataView(buf3); //默认使用整个ArrayBuffer
console.log('[debug] ', fullView.buffer === buf3); //true
console.log(
  '[debug] ',
  fullView.byteLength === buf3.byteLength,
  fullView.byteLength,
); //true 2

console.log('[debug] fullView.byteOffset', fullView.byteOffset); //0
// 构造函数的第二个参数为偏移量起始点,第三个参数为字节长度,而不是偏移量结束点
const halfView = new DataView(buf3, 2, 8);
console.log('[debug] halfView.buffer === buf3', halfView.buffer === buf3); //true
console.log('[debug] halfView.byteOffset', halfView.byteOffset); //2
console.log('[debug] halfView.byteLength', halfView.byteLength); //8

// 如果只设置了偏移量,不设置字节长度,则会使用剩余的缓冲区
const restView = new DataView(buf3, 10);
console.log('[debug] restView.buffer === buf3', restView.buffer === buf3); //true
console.log('[debug] restView.byteOffset', restView.byteOffset); //10
console.log('[debug] restView.byteLength', restView.byteLength); //6
