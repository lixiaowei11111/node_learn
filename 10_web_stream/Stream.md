背压策略:
+ 背压（Backpressure）是指**在流处理中，当生产者（写入数据的一方）生成数据的速度超过消费者（读取数据的一方）处理数据的速度时，系统采取的一种控制策略**。

+ 背压策略的目的是**防止生产者过快地生成数据，从而避免内存溢出或其他资源耗尽的问题**。

+ 在 Web Streams API 中，背压策略通过 `QueuingStrategy` 来实现。[`CountQueuingStrategy`](https://developer.mozilla.org/zh-CN/docs/Web/API/CountQueuingStrategy) 是其中一种策略，它基于队列中的数据块数量来控制背压。

+ 以下是 `CountQueuingStrategy` 的基本概念：

1. **高水位线（highWaterMark）**：这是一个阈值，表示队列中可以容纳的最大数据块(chunk)数量。当队列中的数据块数量达到或超过这个阈值时，流会施加背压，暂停写入操作，直到队列中的数据块数量减少到低于阈值。

2. **队列大小（queueSize）**：这是当前队列中的数据块数量。
当使用 `CountQueuingStrategy` 时，流会根据队列中的数据块数量来决定是否施加背压。如果队列中的数据块数量超过了 `highWaterMark`，流会返回一个未解决的 `Promise`，表示当前不允许写入数据。只有当队列中的数据块数量减少到低于 `highWaterMark` 时，流才会解决这个 `Promise`，允许继续写入数据。

以下是一个使用 `CountQueuingStrategy` 的示例：

```typescript
let concurrentWrites = 0;
let maxConcurrentWrites = 0;

const writableStream = new WritableStream({
  async write(chunk) {
    concurrentWrites++;
    maxConcurrentWrites = Math.max(maxConcurrentWrites, concurrentWrites);
    console.log(`[debug] Starting write: ${chunk}, Type: ${chunk.constructor.name}, Current concurrent writes: ${concurrentWrites}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`[debug] Finished write: ${chunk}`);
    concurrentWrites--;
  }
}, new CountQueuingStrategy({ highWaterMark: 2 }));

const writer = writableStream.getWriter();

console.log('Starting writes...');

Promise.all([
  writer.write('字符串'),
  writer.write(new Uint8Array([1, 2, 3])),
  writer.write(new ArrayBuffer(4)),
  writer.write({ key: 'value' })
]).then(() => {
  console.log('All writes completed');
  console.log(`Max concurrent writes: ${maxConcurrentWrites}`);
});
```
+ 这一段代码验证了`CountQueuingStrategy`的`highWaterMark:2`的功能,限制最大并发写入数为2个chunk
+ ,Promise.all的这段代码在尝试并发写入4个chunk每次写入操作会持续1秒记录同时进行的写入操作数量,如果highWaterMark设置正确（为2），我们应该观察到：最大并发写入数为2,`'字符串'`和`new Uint8Array([1, 2, 3])`会作为第一组立即开始并发写入,`new ArrayBuffer(4)`和`{ key: 'value' }`会在前两个完成后才开始写入


+ 除了`CountQueuingStrategy`,还可以考虑使用[`ByteLengthQueuingStrategy`](https://developer.mozilla.org/zh-CN/docs/Web/API/ByteLengthQueuingStrategy),它基于数据的字节长度而不是chunk数量来控制背压

```typescript
const writableStream = new WritableStream({
  write(chunk) {
    console.log('[debug] chunk', chunk);
  }
}, new ByteLengthQueuingStrategy({ highWaterMark: 1024 })); // 允许最多1KB的数据
```

+ 总结来说，背压策略是为了控制数据流的写入速度，确保消费者能够及时处理数据，避免资源耗尽的问题。