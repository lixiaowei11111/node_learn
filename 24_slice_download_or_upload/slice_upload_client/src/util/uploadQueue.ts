import SparkMD5 from 'spark-md5';
import { Map2Enum } from './types';
import request from './request';
import { AxiosError, AxiosRequestConfig } from 'axios';

interface AxiosResponseType<T> {
  code: number;
  message?: string;
  data: T;
}

// 任务状态枚举
export const taskStatusMap = {
  PENDING: 'pending', // 等待中
  PROCESSING: 'processing', // 处理中
  PAUSED: 'paused', // 已暂停
  COMPLETED: 'completed', // 已完成
  ERROR: 'error', // 错误
} as const;

export const taskStatusTextMap = {
  [taskStatusMap.PENDING]: '等待上传',
  [taskStatusMap.PROCESSING]: '上传中',
  [taskStatusMap.PAUSED]: '已暂停',
  [taskStatusMap.COMPLETED]: '上传完成',
  [taskStatusMap.ERROR]: '上传失败',
};

export type TaskStatus = Map2Enum<typeof taskStatusMap>;

// 默认分片大小 2MB
const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024;

interface ChunkType {
  chunk: Blob;
  hash: string;
}

interface WorkerChunkType {
  hash: string;
  size: number;
  start: number;
  end: number;
}

interface VerifyChunkParams {
  fileHash: string;
  chunkHash?: string;
}

interface MergeChunksParams {
  fileHash: string;
  filename: string;
}

interface UploadChunkParams {
  file: File;
  chunkSize: number;
  chunkIndex: number;
  fileHash: string;
  filename: string;
  chunkHash: string;
  onProgress?: (progress: number) => void;
  abortController?: AbortController;
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

// 上传任务接口
export interface UploadTask {
  id: string; // 任务ID（通常使用文件hash）
  file: File; // 要上传的文件
  fileHash: string; // 文件哈希
  chunkSize: number; // 分片大小
  chunks: ChunkType[]; // 所有分片
  uploadedChunks: boolean[]; // 已上传的分片标记
  currentChunkIndex: number; // 当前上传的分片索引
  status: TaskStatus; // 任务状态
  progress: number; // 上传进度
  error?: Error; // 错误信息
  abortController?: AbortController; // 用于取消上传请求
}

const processFileWithWorker = (
  file: File,
  chunkSize: number,
): Promise<{
  fileHash: string;
  chunks: ChunkType[];
}> => {
  return new Promise((resolve, reject) => {
    // 创建WebWorker
    const worker = new Worker(
      /** new URL()必须写在里面,不能拆开 https://rspack.rs/zh/guide/features/web-workers#%E4%BD%BF%E7%94%A8%E6%96%B9%E5%BC%8F */
      new URL('../worker/generateHash.ts', import.meta.url),
      { type: 'module' },
    );

    // 监听Worker消息
    worker.onmessage = (e) => {
      const { type, data, error, progress } = e.data;

      if (type === 'complete') {
        // 处理完成，将Worker返回的数据转换为所需格式
        // 由于Worker中无法传输Blob对象，需要在这里重新创建分片Blob
        const chunks: ChunkType[] = data.chunks.map(
          (chunkInfo: WorkerChunkType) => ({
            chunk: file.slice(chunkInfo.start, chunkInfo.end),
            hash: chunkInfo.hash,
          }),
        );

        resolve({
          fileHash: data.fileHash,
          chunks,
        });

        // 终止Worker
        worker.terminate();
      } else if (type === 'progress') {
        // 这里可以处理进度更新，但当前函数不接受进度回调参数
        // 未来可以扩展该函数以支持进度报告
        console.log(`文件处理进度: ${progress.toFixed(2)}%`);
      } else if (type === 'error') {
        reject(new Error(error));
        worker.terminate();
      }
    };

    // 处理Worker错误
    worker.onerror = (err) => {
      reject(new Error(`Worker错误: ${err.message}`));
      worker.terminate();
    };

    // 发送数据到Worker
    worker.postMessage({
      file,
      chunkSize,
    });
  });
};

// 处理文件，计算哈希并分片
export const processFile = (
  file: File,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  useWorker?: boolean,
): Promise<{
  fileHash: string;
  chunks: ChunkType[];
}> => {
  if (useWorker) {
    return processFileWithWorker(file, chunkSize);
  }
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
    console.log('[debug] 验证文件完成', response);
    // 根据后端返回的数据结构直接返回结果
    return response.data.data;
  } catch (error) {
    console.error('验证文件上传状态失败:', error);
    throw error;
  }
};

// 上传单个分片，支持取消
export const uploadChunk = async ({
  file,
  chunkSize,
  chunkIndex,
  chunkHash,
  fileHash,
  filename,
  onProgress,
  abortController,
}: UploadChunkParams): Promise<boolean> => {
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
  formData.append('chunkHash', chunkHash);
  formData.append('filename', filename);
  formData.append('chunkIndex', chunkIndex.toString());
  formData.append('chunkTotal', chunkTotal.toString());
  formData.append('chunkSize', chunkSize.toString());
  formData.append('fileSize', file.size.toString());
  formData.append('fileType', file.type || '');

  // 实际发送请求
  try {
    // 准备请求选项，包括可能的取消令牌
    const requestOptions: AxiosRequestConfig<unknown> = {};
    if (abortController) {
      requestOptions.signal = abortController.signal;
    }

    // 如果需要进度报告，使用axios的onUploadProgress
    if (onProgress) {
      requestOptions.onUploadProgress = (progressEvent) => {
        if (progressEvent.total) {
          const percentComplete =
            (progressEvent.loaded / progressEvent.total) * 100;
          onProgress(percentComplete);
        }
      };

      const response = await request.post<
        AxiosResponseType<{
          chunkIndex: number;
          uploadedCount: number;
          chunkTotal: number;
        }>
      >('/chunk', formData, requestOptions);

      return response.status === 201;
    } else {
      // 如果不需要进度报告
      const response = await request.post<
        AxiosResponseType<{
          chunkIndex: number;
          uploadedCount: number;
          chunkTotal: number;
        }>
      >('/chunk', formData, requestOptions);

      return response.status === 201;
    }
  } catch (error) {
    // 区分取消操作和其他错误
    if (error instanceof AxiosError && error.name === 'AbortError') {
      console.log(`分片${chunkIndex}上传被取消`);
      return false;
    }

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

interface UploadQueueCbType {
  onProgress?: (taskId: string, progress: number) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onComplete?: (taskId: string, url: string) => void;
  onError?: (taskId: string, error: Error) => void;
}

// 上传队列类，管理上传任务
export class UploadQueue {
  private tasks: Map<string, UploadTask> = new Map();
  private isProcessing: boolean = false;
  private concurrentLimit: number = 1; // 同时上传的任务数，默认为1（按顺序上传）

  // 事件回调
  private onTaskProgressCallback?: (taskId: string, progress: number) => void;
  private onTaskStatusChangeCallback?: (
    taskId: string,
    status: TaskStatus,
  ) => void;
  private onTaskCompleteCallback?: (taskId: string, url: string) => void;
  private onTaskErrorCallback?: (taskId: string, error: Error) => void;

  constructor(concurrentLimit: number = 1) {
    this.concurrentLimit = concurrentLimit;
    // 尝试从本地存储恢复上传任务
    this.restoreTasksFromStorage();
  }

  // 设置回调函数
  public setCallbacks({
    onProgress,
    onStatusChange,
    onComplete,
    onError,
  }: UploadQueueCbType) {
    this.onTaskProgressCallback = onProgress;
    this.onTaskStatusChangeCallback = onStatusChange;
    this.onTaskCompleteCallback = onComplete;
    this.onTaskErrorCallback = onError;
  }

  // 删除任务
  public removeTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    // 如果任务正在处理中，先中断上传
    if (task.status === taskStatusMap.PROCESSING && task.abortController) {
      task.abortController.abort();
    }

    // 从队列中移除任务
    this.tasks.delete(taskId);

    // 保存任务状态
    this.saveTasksToStorage();

    // 尝试处理队列
    this.processQueue();

    return true;
  }

  // 获取当前任务
  public getTask(taskId: string): UploadTask | undefined {
    return this.tasks.get(taskId);
  }

  // 获取任务状态
  public getTaskStatus(taskId: string): TaskStatus | undefined {
    return this.tasks.get(taskId)?.status;
  }

  // 获取任务进度
  public getTaskProgress(taskId: string): number {
    return this.tasks.get(taskId)?.progress || 0;
  }

  // 获取所有任务
  public getAllTasks(): UploadTask[] {
    return Array.from(this.tasks.values());
  }

  // 添加上传任务
  public async addTask(
    file: File,
    chunkSize: number = DEFAULT_CHUNK_SIZE,
  ): Promise<string> {
    // 处理文件，计算哈希并分块
    const start = performance.now();
    const { fileHash, chunks } = await processFile(file, chunkSize, true);
    const end = performance.now();
    console.log(
      '[debug] 文件分片完成',
      fileHash,
      chunks,
      this.tasks,
      this.tasks.has(fileHash),
      `耗时：${end - start}ms`,
    );
    const taskId = fileHash;

    let task: UploadTask;

    // 检查是否已存在相同的任务
    if (this.tasks.has(taskId)) {
      task = this.tasks.get(taskId)!;
    } else {
      // 创建新任务
      task = {
        id: taskId,
        file,
        fileHash,
        chunkSize,
        chunks,
        uploadedChunks: Array(chunks.length).fill(false),
        currentChunkIndex: 0,
        status: taskStatusMap.PENDING,
        progress: 0,
      };
    }

    console.log('[debug] verify start task:', task);

    // 验证文件上传状态
    try {
      const verifyResult = await verifyChunk({
        fileHash,
        file,
        chunkSize,
      });

      // 更新已上传的分片信息
      if (
        verifyResult?.status === verifyStatusMap.SUCCESS ||
        verifyResult?.status === verifyStatusMap.READY
      ) {
        // 文件已完全上传，或分片全部上传但是未合并
        task.uploadedChunks.fill(true);
        task.progress = 100;

        if (verifyResult.status === verifyStatusMap.SUCCESS) {
          task.status = taskStatusMap.COMPLETED;
          if (verifyResult.url && this.onTaskCompleteCallback) {
            this.onTaskCompleteCallback(taskId, verifyResult.url);
          }
        } else {
          // 已上传所有分片但未合并，需要继续处理
          task.status = taskStatusMap.PENDING;
        }
      } else if (verifyResult?.status === verifyStatusMap.PARTIAL) {
        // 部分上传
        verifyResult.uploadedChunkIndexes.forEach((index: number) => {
          task.uploadedChunks[index] = true;
        });

        // 更新进度
        const uploadedCount = task.uploadedChunks.filter(Boolean).length;
        task.progress = (uploadedCount / chunks.length) * 100;

        // 寻找第一个未上传的分片作为当前索引
        task.currentChunkIndex = task.uploadedChunks.findIndex(
          (uploaded) => !uploaded,
        );
        if (task.currentChunkIndex === -1) {
          task.currentChunkIndex = 0; // 所有分片都已上传，但可能需要合并
        }
      }
    } catch (error) {
      console.error('验证文件上传状态失败:', error);
      // 验证失败，默认全部重新上传
    }

    // 将任务添加到队列
    this.tasks.set(taskId, task);

    // 保存任务状态
    this.saveTasksToStorage();

    // 尝试开始处理队列
    this.processQueue();

    return taskId;
  }

  // 暂停任务
  public pauseTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    // 如果任务正在处理中，则中断上传
    if (task.status === taskStatusMap.PROCESSING) {
      if (task.abortController) {
        task.abortController.abort();
        task.abortController = undefined;
      }

      task.status = taskStatusMap.PAUSED;

      // 触发状态变更回调
      if (this.onTaskStatusChangeCallback) {
        this.onTaskStatusChangeCallback(taskId, task.status);
      }

      // 保存任务状态
      this.saveTasksToStorage();

      // 处理队列中的下一个任务
      this.processQueue();

      return true;
    } else if (task.status === taskStatusMap.PENDING) {
      // 如果任务还在等待，直接标记为暂停
      task.status = taskStatusMap.PAUSED;

      // 触发状态变更回调
      if (this.onTaskStatusChangeCallback) {
        this.onTaskStatusChangeCallback(taskId, task.status);
      }

      // 保存任务状态
      this.saveTasksToStorage();

      return true;
    }

    return false;
  }

  // 恢复任务
  public resumeTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== taskStatusMap.PAUSED) return false;

    // 将任务状态设置为等待处理
    task.status = taskStatusMap.PENDING;

    // 触发状态变更回调
    if (this.onTaskStatusChangeCallback) {
      this.onTaskStatusChangeCallback(taskId, task.status);
    }

    // 保存任务状态
    this.saveTasksToStorage();

    // 尝试处理队列
    this.processQueue();

    return true;
  }

  // 处理上传队列
  private async processQueue() {
    // 如果已经在处理队列，则退出
    if (this.isProcessing) return;

    this.isProcessing = true;

    try {
      // 获取所有待处理的任务
      const pendingTasks = Array.from(this.tasks.values()).filter(
        (task) => task.status === taskStatusMap.PENDING,
      );

      // 如果没有待处理的任务，退出
      if (pendingTasks.length === 0) {
        this.isProcessing = false;
        return;
      }

      // 处理并发限制数量的任务
      const tasksToProcess = pendingTasks.slice(0, this.concurrentLimit);

      // 处理选定的任务
      await Promise.all(tasksToProcess.map((task) => this.processTask(task)));

      // 处理完成后，尝试处理队列中的下一批任务
      this.isProcessing = false;
      this.processQueue();
    } catch (error) {
      console.error('处理上传队列时出错:', error);
      this.isProcessing = false;
    }
  }

  // 处理单个上传任务
  private async processTask(task: UploadTask) {
    // 更新任务状态
    task.status = taskStatusMap.PROCESSING;

    // 触发状态变更回调
    if (this.onTaskStatusChangeCallback) {
      this.onTaskStatusChangeCallback(task.id, task.status);
    }

    try {
      //1.  若所有分片都已上传，则尝试合并
      if (task.uploadedChunks.every(Boolean)) {
        // 请求合并分片
        const url = await mergeChunks({
          fileHash: task.fileHash,
          filename: task.file.name,
        });

        // 更新任务状态
        task.status = taskStatusMap.COMPLETED;
        task.progress = 100;

        // 触发回调
        if (this.onTaskProgressCallback) {
          this.onTaskProgressCallback(task.id, 100);
        }

        if (this.onTaskStatusChangeCallback) {
          this.onTaskStatusChangeCallback(task.id, task.status);
        }

        if (this.onTaskCompleteCallback) {
          this.onTaskCompleteCallback(task.id, url);
        }

        // 保存任务状态
        this.saveTasksToStorage();

        return;
      }

      // 2. 分片只上传了部分，则按照顺序继续上传未上传的分片
      while (task.currentChunkIndex < task.chunks.length) {
        // 检查任务是否被暂停
        if (task.status !== taskStatusMap.PROCESSING) {
          break;
        }

        // 如果当前分片已上传，跳过
        if (task.uploadedChunks[task.currentChunkIndex]) {
          task.currentChunkIndex++;
          continue;
        }

        // 创建 AbortController 用于取消请求
        task.abortController = new AbortController();

        // 上传当前分片
        const success = await uploadChunk({
          file: task.file,
          chunkSize: task.chunkSize,
          chunkIndex: task.currentChunkIndex,
          chunkHash: task.chunks[task.currentChunkIndex].hash,
          fileHash: task.fileHash,
          filename: task.file.name,
          abortController: task.abortController,
          onProgress: (chunkProgress) => {
            // 计算总体进度
            const uploadedChunks = task.uploadedChunks.filter(Boolean).length;
            const totalProgress =
              ((uploadedChunks + chunkProgress / 100) / task.chunks.length) *
              100;

            task.progress = totalProgress;

            // 触发进度回调
            if (this.onTaskProgressCallback) {
              this.onTaskProgressCallback(task.id, totalProgress);
            }
          },
        });

        // 清除 AbortController
        task.abortController = undefined;

        if (success) {
          // 标记当前分片为已上传
          task.uploadedChunks[task.currentChunkIndex] = true;

          // 更新进度
          const uploadedChunks = task.uploadedChunks.filter(Boolean).length;
          task.progress = (uploadedChunks / task.chunks.length) * 100;

          // 保存任务状态
          this.saveTasksToStorage();

          // 移动到下一个分片
          task.currentChunkIndex++;
        } else if (task.status === taskStatusMap.PROCESSING) {
          // 如果上传失败且不是由于暂停导致的，标记为错误
          task.status = taskStatusMap.ERROR;
          task.error = new Error(`分片 ${task.currentChunkIndex} 上传失败`);

          // 触发错误回调
          if (this.onTaskStatusChangeCallback) {
            this.onTaskStatusChangeCallback(task.id, task.status);
          }

          if (this.onTaskErrorCallback && task.error) {
            this.onTaskErrorCallback(task.id, task.error);
          }

          // 保存任务状态
          this.saveTasksToStorage();

          return;
        } else {
          // 任务被暂停，退出循环
          break;
        }
      }

      // 3. 上传以后，检查是否所有分片都已上传
      if (
        task.status === taskStatusMap.PROCESSING &&
        task.uploadedChunks.every(Boolean)
      ) {
        // 请求合并分片
        const url = await mergeChunks({
          fileHash: task.fileHash,
          filename: task.file.name,
        });

        // 更新任务状态
        task.status = taskStatusMap.COMPLETED;
        task.progress = 100;

        // 触发回调
        if (this.onTaskProgressCallback) {
          this.onTaskProgressCallback(task.id, 100);
        }

        if (this.onTaskStatusChangeCallback) {
          this.onTaskStatusChangeCallback(task.id, task.status);
        }

        if (this.onTaskCompleteCallback) {
          this.onTaskCompleteCallback(task.id, url);
        }
      }
    } catch (error) {
      console.error(`处理任务 ${task.id} 时出错:`, error);

      // 更新任务状态
      task.status = taskStatusMap.ERROR;
      task.error = error as Error;

      // 触发错误回调
      if (this.onTaskStatusChangeCallback) {
        this.onTaskStatusChangeCallback(task.id, task.status);
      }

      if (this.onTaskErrorCallback && error instanceof Error) {
        this.onTaskErrorCallback(task.id, error);
      }
    }

    // 保存任务状态
    this.saveTasksToStorage();
  }

  // 保存任务到本地存储
  private saveTasksToStorage() {
    try {
      // 创建可序列化的任务数据
      const tasksData = Array.from(this.tasks.entries()).map(([id, task]) => {
        // 排除不可序列化的属性
        console.log('[debug] id', id);
        const { file, chunks, ...serializableTask } = task;

        return {
          ...serializableTask,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          chunksCount: chunks.length,
        };
      });

      localStorage.setItem('uploadTasks', JSON.stringify(tasksData));
    } catch (error) {
      console.error('保存任务状态到本地存储失败:', error);
    }
  }

  // 从本地存储恢复任务
  private restoreTasksFromStorage() {
    try {
      const tasksData = localStorage.getItem('uploadTasks');
      if (!tasksData) return;

      const parsedTasks = JSON.parse(tasksData);

      // 由于文件对象无法序列化，我们只保留任务ID和状态信息
      // 这里将恢复的任务标记为暂停状态，用户需要重新添加文件才能继续上传
      for (const taskData of parsedTasks) {
        // 保留原始状态，尤其是已完成的任务
        const originalStatus = taskData.status;

        this.tasks.set(taskData.id, {
          ...taskData,
          file: new File([], taskData.fileName), // 仅占位，需要用户重新选择文件
          chunks: [], // 占位，需要重新处理文件
          status:
            // 如果任务原本是已完成状态，保持完成状态；否则设置为暂停状态
            originalStatus === taskStatusMap.COMPLETED
              ? taskStatusMap.COMPLETED
              : taskStatusMap.PAUSED,
        } as UploadTask);
      }
    } catch (error) {
      console.error('从本地存储恢复任务失败:', error);
    }
  }
}

// 全局上传队列实例
export const globalUploadQueue = new UploadQueue();
