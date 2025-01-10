import { ChangeEventHandler, useEffect } from 'react';
import createWritable from './stream/write';
import createReadable from './stream/read';
import { writableStream, readableStream } from './stream/transform';
import { createDownload } from './sw/invoke';

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

  const transformInit = async () => {
    const writer = writableStream.getWriter();
    const reader = readableStream.getReader();
    await writer.write('hello');
    await reader.read();
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file: File = e.target.files![0];
    console.log('[debug] files', e.target.files);
    const reader = file?.stream().getReader();
    const readableStream = createReadable(reader);
    console.log('[debug] ', readableStream);
  };

  const handleStreamChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files: FileList = e.target!.files!;
    if (files.length === 0) return;

    const file = files.item(0)!;
    const reader = file.stream().getReader();

    console.log('[debug] file', file);
    const writableStream = await createDownload(file.name);
    const writable = writableStream.getWriter();

    const pump = async () => {
      console.log('读取本地文件数据');
      const { done, value } = await reader.read();
      if (done) return writable.close();
      console.log('向下载线程写入数据');
      await writable.write(value);
      pump();
    };

    pump();
  };

  useEffect(() => {
    // readInit();
    // writeInit();
    transformInit();
  }, []);

  return (
    <>
      <div>流的core concepts: https://developer.mozilla.org/zh-CN/docs/Web/API/Streams_API/Concepts</div>
      <div>使用WritableStream: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_writable_streams</div>
      <div>使用ReadableStream: https://developer.mozilla.org/zh-CN/docs/Web/API/Streams_API/Using_readable_streams</div>
      {/* <input type="file" id="file" onChange={handleChange} /> */}
      <input type="file" onChange={handleStreamChange} />
    </>
  );
}

export default App;
