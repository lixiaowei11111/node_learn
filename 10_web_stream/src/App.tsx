import { useEffect } from 'react';
import createWritable from './stream/write';

function App() {
  const writeInit = async () => {
    const writable = createWritable();
    const writer = writable.getWriter();
    // await writer.write( 'hello' );
    // await writer.write( 'world' );
    // await Promise.all( [writer.write( "114514" ), writer.write( "adadaqeqweqeq" )] )
    // 并发写入,由于设置highWaterMark为2,所以最大只能并发两个
    await Promise.all([
      writer.write('我是sssss'),
      writer.write('我是猪'),
      writer.write(new Uint8Array([1, 2, 3])),
      writer.write(new ArrayBuffer(100)),
    ]);
  };
  useEffect(() => {
    writeInit();
  }, []);

  return (
    <>
      <div>流的core concepts: https://developer.mozilla.org/zh-CN/docs/Web/API/Streams_API/Concepts</div>
      <div>使用WritableStream: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_writable_streams</div>
      <div>使用ReadableStream: https://developer.mozilla.org/zh-CN/docs/Web/API/Streams_API/Using_readable_streams</div>
    </>
  );
}

export default App;
