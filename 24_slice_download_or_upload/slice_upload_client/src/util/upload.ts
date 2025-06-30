import SparkMD5 from 'spark-md5';
import { Map2Enum } from './types';
import request from './request';

interface AxiosResponseType<T> {
  code: number;
  message?: string;
  data: T;
}

interface UploadChunkParams {
  file: File;
  chunkSize: number;
  chunkIndex: number;
  fileHash: string;
  filename: string;
  chunkHash?: string;
  onProgress?: (progress: number) => void;
}

interface MergeChunksParams {
  fileHash: string;
  filename: string;
}

interface VerifyChunkParams {
  fileHash: string;
  chunkHash?: string;
}

const verifyStatusMap = {
  /** 已完全上传 */
  SUCCESS: 'success',
  /** 上传了一部分 */
  PENDING: 'pending',
  /** 分片已上传,但是未合并 */
  READY: 'ready',
  /** 部分上传 */
  PARTIAL: 'partial',
} as const;

type VerifyStatusEnum = Map2Enum<typeof verifyStatusMap>;

interface VerifyResponseType {
  status: VerifyStatusEnum;
  uploadedChunkIndexes: number[];
  url?: string;
}

interface MergeResponseType {
  url: string;
}

interface RequestVerifyType {
  fileHash: string;
  filename: string;
  fileSize: number;
  chunkSize: number;
  chunkTotal: number;
  fileType?: string;
}

// 默认分片大小 5MB
const DEFAULT_CHUNK_SIZE = 2 * 1024 * 1024;

interface ChunkType {
  chunk: Blob;
  hash: string;
}

export const processFile = (
  file: File,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
): Promise<{
  fileHash: string;
  chunks: ChunkType[];
}> => {
  return new Promise((resolve, reject) => {
    // 用于计算整个文件的哈希值
    const fileSpark = new SparkMD5.ArrayBuffer();
    // 用于存储每个分块的信息
    const chunks: { chunk: Blob; hash: string }[] = [];
    // 预先创建所有的分块
    let cur = 0;
    while (cur < file.size) {
      chunks.push({
        chunk: file.slice(cur, cur + chunkSize),
        hash: '', // 先初始化为空，后面计算
      });
      cur += chunkSize;
    }

    const fileReader = new FileReader();
    let currentChunk = 0;
    const totalChunks = chunks.length;

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
      fileReader.readAsArrayBuffer(chunks[currentChunk].chunk);
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

// 验证文件上传状态，返回已上传的分片信息
export const verifyChunk = async ({
  fileHash,
  file,
  chunkSize,
}: VerifyChunkParams & {
  file: File;
  chunkSize: number;
}): Promise<VerifyResponseType | void> => {
  try {
    // 计算总分片数
    const chunkTotal = Math.ceil(file.size / chunkSize);

    const params: RequestVerifyType = {
      fileHash,
      filename: file.name,
      fileSize: file.size,
      chunkSize,
      chunkTotal,
      fileType: file.type || '',
    };

    const response = await request.post<AxiosResponseType<VerifyResponseType>>(
      '/verify',
      params,
    );
    console.log('[debug] response', response);
    // 根据后端返回的数据结构直接返回结果
    return response.data.data;
  } catch (error) {
    console.error('验证文件上传状态失败:', error);
    throw error;
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
}: UploadChunkParams & { chunkHash?: string }): Promise<boolean> => {
  const chunk = file.slice(
    chunkIndex * chunkSize,
    (chunkIndex + 1) * chunkSize,
  );

  // 计算总分片数
  const chunkTotal = Math.ceil(file.size / chunkSize);

  // 创建一个FormData用于文件上传
  const formData = new FormData();
  formData.append('file', chunk);
  formData.append('fileHash', fileHash);
  formData.append('filename', filename);
  formData.append('chunkIndex', chunkIndex.toString());
  formData.append('chunkTotal', chunkTotal.toString());
  formData.append('chunkSize', chunkSize.toString());
  formData.append('fileSize', file.size.toString());
  formData.append('fileType', file.type || '');

  // 实际发送请求
  try {
    // 如果需要进度报告，使用axios的onUploadProgress
    if (onProgress) {
      const response = await request.post<
        AxiosResponseType<{
          chunkIndex: number;
          uploadedCount: number;
          chunkTotal: number;
        }>
      >('/chunk', formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentComplete =
              (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(percentComplete);
          }
        },
      });

      return response.status === 201;
    } else {
      // 如果不需要进度报告
      const response = await request.post<
        AxiosResponseType<{
          chunkIndex: number;
          uploadedCount: number;
          chunkTotal: number;
        }>
      >('/chunk', formData);

      return response.status === 201;
    }
  } catch (error) {
    console.error(`上传分片${chunkIndex}失败:`, error);
    return false;
  }
};

// 请求合并分片
export const mergeChunks = async ({
  fileHash,
  filename,
}: MergeChunksParams): Promise<string> => {
  try {
    const response = await request.post<AxiosResponseType<MergeResponseType>>(
      '/merge',
      {
        fileHash,
        filename,
      },
    );

    return response.data.data.url || '';
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
    const { fileHash, chunks } = await processFile(file, chunkSize);
    const filename = file.name;

    console.log('[debug] fileHash:', fileHash);
    console.log('[debug] chunks:', chunks);
    const totalChunks = chunks.length;

    // 3. 一次性验证文件hash
    const verifyResult = await verifyChunk({
      fileHash,
      file,
      chunkSize,
    });

    // 已经上传了的分片索引
    const uploadedChunkIndexes: boolean[] = Array(totalChunks).fill(false);

    if (
      verifyResult?.status === verifyStatusMap.SUCCESS ||
      verifyResult?.status === verifyStatusMap.READY
    ) {
      // 文件已完全上传，文件上传完成但是并未合并
      uploadedChunkIndexes.fill(true);
    } else if (verifyResult?.status === verifyStatusMap.PARTIAL) {
      // 上传部分
      verifyResult.uploadedChunkIndexes.forEach((index: number) => {
        uploadedChunkIndexes[index] = true;
      });
    }

    // 计算已经上传的进度
    const alreadyUploadedChunks = uploadedChunkIndexes.filter(Boolean).length;
    let uploadedProgress = (alreadyUploadedChunks / totalChunks) * 100;

    if (onProgress) {
      onProgress(uploadedProgress);
    }

    // 如果所有分片都已上传但是未合并，则直接请求合并
    if (
      alreadyUploadedChunks === totalChunks &&
      verifyResult?.status === verifyStatusMap.READY
    ) {
      const url = await mergeChunks({
        fileHash,
        filename,
      });

      if (onSuccess) {
        onSuccess(url);
      }

      return;
    }

    // 4. 如果上传了部分,则上传未上传的分片
    const uploadTasks: Promise<boolean>[] = [];

    for (let i = 0; i < totalChunks; i++) {
      if (!uploadedChunkIndexes[i]) {
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
    console.log('[debug] results', results);

    // 检查是否所有分片都上传成功
    if (results.every(Boolean)) {
      // 5. 请求合并分片
      const url = await mergeChunks({
        fileHash,
        filename,
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
