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

// DataView读取内存数据时,需要指定数据类型即ElementType,每个ElementType都有对应的get和set方法

// 1. 在内存中分配两个字节大小的内存缓冲区,并声明DataView视图用于IO
const buf4 = new ArrayBuffer(2);
const view = new DataView(buf4);

// 2. ArrayBuffer开辟的内存区内默认值都为0
// 说明整个缓冲确实所有二进制位都是 0
// 检查第一个和第二个字符
console.log('[debug] view.getInt8(0)', view.getInt8(0)); //0
console.log('[debug] view.getInt8(1)', view.getInt8(1)); //0
// 也可以利用16位检查两个字节
console.log('[debug] view.getUint16(0)', view.getInt16(0)); //0

// 3. 将整个缓冲区数据都设置为1
view.setUint8(0, 255);
view.setUint8(1, 0xff);

// 4.如果把它当成二补数的有符号整数，则应该是-1
console.log('[debug] ', view.getInt16(0)); //-1

console.log('[debug] ', view);

// DataView开启小端序

view.setInt8(0, 0x80);
view.setInt8(1, 0x01);
// 缓冲内容（为方便阅读，人为加了空格）
// 0x8 0x0 0x0 0x1
// 1000 0000 0000 0001

// DataView默认按照大端序读取Uint16
// 按大端字节序读取 Uint16
// 0x80 是高字节，0x01 是低字节
// 0x8001 = 2^15 + 2^0 = 32768 + 1 = 32769
console.log('[debug] DataView默认为大端序读取', view.getUint16(0)); //32769

//开启little endian
// 按小端字节序读取 Uint16
// 0x01 是高字节，0x80 是低字节
// 0x0180 = 2^8 + 2^7 = 256 + 128 = 384
console.log(
  '[debug] DataView Uint16方法按照小端序组装',
  view.getUint16(0, true),
); //384

// 按照大端序写入数据

view.setUint16(0, 0x0004);
console.log(
  '[debug] DataView默认大端序写入:  view.getUint8, 地址位:0 ',
  view.getUint8(0),
); //0
console.log(
  '[debug] DataView默认大端序写入:  view.getUint8, 地址位:1 ',
  view.getUint8(1), //4
);

// 按照小端序写入数据
view.setUint16(0, 0x0010, true);
// 真值 0000 0000 0001 0000
// 小端序存储时
// 低低地址位 -> 高地址位
// 0001 0000 0000 0000

console.log(
  '[debug] 按照大端序的方式读取按照小端序存储的数据 getUint16(0)',
  view.getUint16(0),
); //4096 2的12次方

console.log(
  '[debug] 读取按照小端序存储的数据 view.getUint8(0), 低地址位:0',
  view.getUint8(0),
); //16 2的4次方
console.log(
  '[debug] 读取按照小端序存储的数据 view.getUint8(1) 高地址位:1',
  view.getUint8(1),
); //0

// DataView边界情况
// 1.越界读取或者访问
// 2. 缓冲区写入数字越界或者类型错误

const buf5 = new ArrayBuffer(4);
const view2 = new DataView(buf5);

// 越界访问会导致错误
// view2.setInt32(1, 255); //Uncaught RangeError: Offset is outside the bounds of the DataViewat DataView.prototype.setInt32

// 写入数据时数字大小越界会进行取模运算
view2.setUint8(0, 300);

console.log('[debug] view2.setUint8(0, 300);', view2.getUint8(0)); //44

// 传入不能转换为数字的类型时会导致类型错误
// view2.setUint8(1, Symbol.for('123')); //Uncaught TypeError: Cannot convert a Symbol value to a number at DataView.prototype.setUint8

// 一般情况下hi自动转换为数字类型,转换不了就会报错
// view2.setUint8(1, '259'); //3
console.log('[debug] view2.setUint8(0, 300);', view2.getUint8(1)); //82

// 定型数组
// 1.基于ArrayBuffer的引用创建
// 开启一个16 byte大小的内存缓冲区
const buf6 = new ArrayBuffer(16);
// 创建一个引用该缓冲的Uint32Array
const uInt32Array = new Uint32Array(buf6);
// 这个定型数组知道自己的每个元素需要 4 字节,因此长度为4
console.log('[debug] uInt32Array.length', uInt32Array.length); //4

//2. 直接创建固定长度的定型数组
const uInt16Array = new Uint16Array(6);
// 因为每个单位的大小是 2byte,所以uInt16Array的大小为 12byte
console.log(
  '[debug] Uint16Array(6)',
  uInt16Array,
  uInt16Array.length,
  uInt16Array.byteLength,
); //6 12

// 3. 基于普通数组创建
const int32 = new Uint32Array([2, 4, 6, 8]);
