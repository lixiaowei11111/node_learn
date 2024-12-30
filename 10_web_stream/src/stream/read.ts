const createReadable = (reader: ReadableStreamDefaultReader<Uint8Array>) => {
  return new ReadableStream({
    start(controller) {
      const push = async () => {
        const { done, value } = await reader?.read();
        if (done) {
          console.log('[debug] done', done);
          controller.close();
          return;
        }
        controller.enqueue(value);

        console.log('[debug] ', done, value);
        push();
      };
      push();
    },
  });
};

export default createReadable;
