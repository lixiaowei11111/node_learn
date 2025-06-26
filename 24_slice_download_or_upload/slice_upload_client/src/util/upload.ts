interface UploadChunkParams {
  file: File;
  chunkSize: number;
  chunkIndex: number;
  fileHash: string;
  filename: string;
  onProgress?: (progress: number) => void;
}

interface MergeChunksParams {
  fileHash: string;
  filename: string;
  size: number;
  chunkSize: number;
}

interface VerifyChunkParams {
  fileHash: string;
  chunkIndex: number;
}

// 默认分片大小 5MB
const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024;
const API_BASE_URL = '';

// 计算文件的哈希值
export const calculateFileHash = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    // 在实际应用中，使用更完整的哈希算法
    // 这里使用文件的名称、大小和最后修改时间的组合作为简单的哈希
    const hashValue = `${file.name}-${file.size}-${file.lastModified}`;
    resolve(hashValue);
  });
};

// 将文件分割成多个块
export const createFileChunks = (
  file: File,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
): Blob[] => {
  const chunks: Blob[] = [];
  let cur = 0;

  while (cur < file.size) {
    chunks.push(file.slice(cur, cur + chunkSize));
    cur += chunkSize;
  }

  return chunks;
};

// 验证分片是否已上传
export const verifyChunk = async ({
  fileHash,
  chunkIndex,
}: VerifyChunkParams): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/upload/verify-chunk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileHash,
        chunkIndex,
      }),
    });

    const result = await response.json();
    return result.exists || false;
  } catch (error) {
    console.error('验证分片失败:', error);
    return false;
  }
};

// 上传单个分片
export const uploadChunk = async ({
  file,
  chunkSize,
  chunkIndex,
  fileHash,
  filename,
  onProgress,
}: UploadChunkParams): Promise<boolean> => {
  const chunk = file.slice(
    chunkIndex * chunkSize,
    (chunkIndex + 1) * chunkSize,
  );
  const formData = new FormData();

  formData.append('file', chunk);
  formData.append('fileHash', fileHash);
  formData.append('chunkIndex', String(chunkIndex));
  formData.append('filename', filename);
  formData.append('chunkSize', String(chunkSize));
  formData.append('totalSize', String(file.size));

  try {
    const xhr = new XMLHttpRequest();

    // 使用 Promise 包装 XHR 请求，以便跟踪上传进度
    return new Promise((resolve, reject) => {
      xhr.open('POST', `${API_BASE_URL}/api/upload/chunk`, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          // 计算单个分片的上传进度
          const chunkProgress = (e.loaded / e.total) * 100;
          onProgress(chunkProgress);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(true);
        } else {
          reject(new Error(`上传失败：HTTP状态码 ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('网络错误'));
      };

      xhr.send(formData);
    });
  } catch (error) {
    console.error(`分片 ${chunkIndex} 上传失败:`, error);
    return false;
  }
};

// 请求合并分片
export const mergeChunks = async ({
  fileHash,
  filename,
  size,
  chunkSize,
}: MergeChunksParams): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/upload/merge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileHash,
        filename,
        size,
        chunkSize,
      }),
    });

    const result = await response.json();
    return result.url || '';
  } catch (error) {
    console.error('合并分片失败:', error);
    throw error;
  }
};

// 管理整个上传过程，包括断点续传
export const uploadFile = async (
  file: File,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  onProgress?: (progress: number) => void,
  onSuccess?: (url: string) => void,
  onError?: (error: Error) => void,
): Promise<void> => {
  try {
    // 1. 计算文件哈希
    const fileHash = await calculateFileHash(file);
    const filename = file.name;

    // 2. 创建文件分片
    const chunks = createFileChunks(file, chunkSize);
    const totalChunks = chunks.length;
    const uploadedChunks: boolean[] = Array(totalChunks).fill(false);

    // 3. 验证已上传的分片
    for (let i = 0; i < totalChunks; i++) {
      const exists = await verifyChunk({ fileHash, chunkIndex: i });
      uploadedChunks[i] = exists;
    }

    // 计算已经上传的进度
    const alreadyUploadedChunks = uploadedChunks.filter(Boolean).length;
    let uploadedProgress = (alreadyUploadedChunks / totalChunks) * 100;

    if (onProgress) {
      onProgress(uploadedProgress);
    }

    // 如果所有分片都已上传，则直接请求合并
    if (alreadyUploadedChunks === totalChunks) {
      const url = await mergeChunks({
        fileHash,
        filename,
        size: file.size,
        chunkSize,
      });

      if (onSuccess) {
        onSuccess(url);
      }

      return;
    }

    // 4. 上传未上传的分片
    const uploadTasks: Promise<boolean>[] = [];

    for (let i = 0; i < totalChunks; i++) {
      if (!uploadedChunks[i]) {
        const task = uploadChunk({
          file,
          chunkSize,
          chunkIndex: i,
          fileHash,
          filename,
          onProgress: (chunkProgress) => {
            // 更新总体进度
            const chunkWeight = 1 / totalChunks;
            const additionalProgress = chunkProgress * chunkWeight;
            uploadedProgress =
              (alreadyUploadedChunks / totalChunks) * 100 + additionalProgress;

            if (onProgress) {
              onProgress(Math.min(uploadedProgress, 99)); // 保留最后的1%用于合并操作
            }
          },
        });

        uploadTasks.push(task);
      }
    }

    // 等待所有分片上传完成
    const results = await Promise.all(uploadTasks);

    // 检查是否所有分片都上传成功
    if (results.every(Boolean)) {
      // 5. 请求合并分片
      const url = await mergeChunks({
        fileHash,
        filename,
        size: file.size,
        chunkSize,
      });

      // 6. 上传完成，更新进度为100%
      if (onProgress) {
        onProgress(100);
      }

      if (onSuccess) {
        onSuccess(url);
      }
    } else {
      throw new Error('部分分片上传失败');
    }
  } catch (error) {
    console.error('上传过程中出错:', error);
    if (onError) {
      onError(error as Error);
    }
  }
};
