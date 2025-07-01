import { globalUploadQueue, uploadFileWithQueue } from './uploadQueue';

// 维持兼容性的上传函数
export const uploadFile = async (
  file: File,
  chunkSize?: number,
  onProgress?: (progress: number) => void,
  onSuccess?: (url: string) => void,
  onError?: (error: Error) => void,
): Promise<void> => {
  try {
    await uploadFileWithQueue(
      globalUploadQueue,
      file,
      chunkSize,
      onProgress,
      onSuccess,
      onError,
    );
  } catch (error) {
    console.error('上传过程中出错:', error);
    if (onError) {
      onError(error as Error);
    }
  }
};
