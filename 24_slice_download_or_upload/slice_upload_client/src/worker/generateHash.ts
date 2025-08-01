import SparkMD5 from 'spark-md5';

interface WorkerChunkType {
  hash: string;
  size: number;
  start: number;
  end: number;
}

// Worker文件处理消息
self.onmessage = async (event) => {
  const { file, chunkSize } = event.data;

  try {
    const result = await processFile(file, chunkSize);
    // 返回处理结果
    self.postMessage({
      type: 'complete',
      data: result,
    });
  } catch (error) {
    // 发送错误信息
    self.postMessage({
      type: 'error',
      error: error,
    });
  }
};

const processFile = (
  file: File,
  chunkSize: number,
): Promise<{
  fileHash: string;
  chunks: WorkerChunkType[];
}> => {
  return new Promise((resolve, reject) => {
    // 用于计算整个文件的哈希值
    const fileSpark = new SparkMD5.ArrayBuffer();
    // 用于存储每个分块的信息（注意：在worker中不能传输Blob对象，只存储信息）
    const chunks: WorkerChunkType[] = [];

    // 预先创建所有的分块信息
    let cur = 0;
    while (cur < file.size) {
      const end = Math.min(cur + chunkSize, file.size);
      chunks.push({
        hash: '', // 先初始化为空，后面计算
        size: end - cur,
        start: cur,
        end: end,
      });
      cur += chunkSize;
    }

    const fileReader = new FileReader();
    let currentChunk = 0;
    const totalChunks = chunks.length;

    // 报告进度
    const reportProgress = () => {
      self.postMessage({
        type: 'progress',
        progress: (currentChunk / totalChunks) * 100,
      });
    };

    fileReader.onload = async (e) => {
      if (e.target?.result) {
        const arrayBuffer = e.target.result as ArrayBuffer;

        // 添加到整个文件的哈希计算
        fileSpark.append(arrayBuffer);

        // 计算当前分块的哈希
        const chunkSpark = new SparkMD5.ArrayBuffer();
        chunkSpark.append(arrayBuffer);
        chunks[currentChunk].hash = chunkSpark.end();

        currentChunk++;
        reportProgress();

        if (currentChunk < totalChunks) {
          // 继续读取下一个分块
          loadNext();
        } else {
          // 完成所有分块读取和哈希计算
          resolve({
            fileHash: fileSpark.end(),
            chunks,
          });
        }
      }
    };

    fileReader.onerror = (e) => {
      reject(new Error('文件读取失败：' + e.target?.error?.message));
    };

    function loadNext() {
      const chunk = file.slice(
        chunks[currentChunk].start,
        chunks[currentChunk].end,
      );
      fileReader.readAsArrayBuffer(chunk);
    }

    // 开始读取第一个分块
    if (chunks.length > 0) {
      loadNext();
    } else {
      // 文件为空的情况
      resolve({
        fileHash: new SparkMD5.ArrayBuffer().end(),
        chunks: [],
      });
    }
  });
};
