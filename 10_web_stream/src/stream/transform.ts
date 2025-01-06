// 手动实现transformStream

const channel = new MessageChannel();

export const writableStream = new WritableStream({
  write(chunk) {
    channel.port1.postMessage(chunk);
  },
});

export const readableStream = new ReadableStream({
  start(controller) {
    channel.port2.onmessage = ({ data }) => {
      controller.enqueue(data);
      console.log('[debug] readableStream data', data);
    };
  },
});

const writer = writableStream.getWriter();
const reader = readableStream.getReader();
await writer.write('hello');
await reader.read();

// 浏览器提供的transformStream

const transformStream = new TransformStream();

transformStream.writable.getWriter().write('hello');
transformStream.readable.getReader().read();
