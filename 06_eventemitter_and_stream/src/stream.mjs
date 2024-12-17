import { stream } from 'node:stream';

// 在 node 里，流一共有 4 种：可读流 Readable、可写流 Writable、双工流 Duplex、转换流 Transform

const Readable = stream.Readable;

const Writable = stream.Writable;

const Duplex = stream.Duplex;

const Transform = stream.Transform;

// 其余的流都是基于这 4 种流封装出来的。

// 虽然各种流有很多，但底层的 stream 只有 4 种：

// Readable：实现 _read 方法，通过 push 传入内容
// Writable：实现 _write 方法，通过 next 消费内容
// Duplex：实现 _read、_write，可读可写
// Transform：实现 _transform，对写入的内容做转换再传出去，继承自 Duplex
