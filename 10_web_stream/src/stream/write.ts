let concurrentWrites = 0;
let maxConcurrentWrites = 0;

const createWritable = () =>
  new WritableStream(
    {
      async write(chunk) {
        concurrentWrites++;
        maxConcurrentWrites = Math.max(maxConcurrentWrites, concurrentWrites);
        console.log(`[debug] Starting write: ${chunk}, Current concurrent writes: ${concurrentWrites}`);
        console.log(chunk);

        // 模拟耗时操作
        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log(`[debug] Finished write: ${chunk}`);
        console.log(chunk);
        concurrentWrites--;
      },
    },
    new CountQueuingStrategy({ highWaterMark: 2 }),
    // new ByteLengthQueuingStrategy({ highWaterMark: 2 }),
  );
// 设置最多同时写入两个chunk,也可以用ByteLengthQueuingStrategy来设置最大的并发写入的字节数
export default createWritable;
