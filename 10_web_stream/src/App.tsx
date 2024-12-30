import { ChangeEventHandler, useEffect } from 'react';
import createWritable from './stream/write';
import createReadable from './stream/read';

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

  const readInit = async () => {
    const response = await fetch('www.example.org');
    const readable = response.body;
    if (!readable) return;
    const reader = readable.getReader();
    const stream = createReadable(reader);
    const res = await new Response(stream, { headers: { 'Content-Type': 'text/html' } }).text();
    console.log('[debug] res', res);
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file: File = e.target.files![0];
    console.log('[debug] files', e.target.files);
    const reader = file?.stream().getReader();
    const readableStream = createReadable(reader);
    console.log('[debug] ', readableStream);
  };

  useEffect(() => {
    readInit();
    // writeInit();
  }, []);

  return (
    <>
      <div>流的core concepts: https://developer.mozilla.org/zh-CN/docs/Web/API/Streams_API/Concepts</div>
      <div>使用WritableStream: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_writable_streams</div>
      <div>使用ReadableStream: https://developer.mozilla.org/zh-CN/docs/Web/API/Streams_API/Using_readable_streams</div>
      <input type="file" id="file" onChange={handleChange} />
    </>
  );
}

export default App;
