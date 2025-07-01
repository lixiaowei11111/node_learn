import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  globalUploadQueue,
  taskStatusMap,
  TaskStatus,
} from '../util/uploadQueue';
import UploadProgress from './UploadProgress';
import { AxiosError } from 'axios';

interface FileInfo {
  file: File;
  progress: number;
  status: TaskStatus;
  fileUrl?: string;
  taskId?: string; // 新增：关联上传任务ID
  isPaused?: boolean; // 新增：是否暂停状态
  error?: unknown; //错误信息
}

const FileUploader: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkAllFilesUploaded = useCallback(() => {
    // 检查是否所有文件都已上传完成或失败
    const allDone = files.every(
      (file) =>
        file.progress === 100 ||
        file.status === taskStatusMap.ERROR ||
        file.status === taskStatusMap.COMPLETED,
    );

    if (allDone) {
      setUploading(false);
    }
  }, [files]);

  // 监听上传队列状态变化
  useEffect(() => {
    globalUploadQueue.setCallbacks({
      onProgress: (taskId, progress) => {
        // 更新对应文件的进度
        setFiles((prevFiles) => {
          return prevFiles.map((file) => {
            if (file.taskId === taskId) {
              return { ...file, progress };
            }
            return file;
          });
        });
      },
      onStatusChange: (taskId, status) => {
        // 更新对应文件的状态
        setFiles((prevFiles) => {
          return prevFiles.map((file) => {
            if (file.taskId === taskId) {
              let fileStatus: TaskStatus = taskStatusMap.PROCESSING;
              let isPaused = false;

              fileStatus = status;
              if (status === taskStatusMap.PAUSED) {
                isPaused = true;
              }

              return { ...file, status: fileStatus, isPaused };
            }
            return file;
          });
        });
      },
      onComplete: (taskId, url) => {
        // 更新对应文件为已完成状态
        setFiles((prevFiles) => {
          return prevFiles.map((file) => {
            if (file.taskId === taskId) {
              return {
                ...file,
                status: taskStatusMap.COMPLETED,
                progress: 100,
                fileUrl: url,
              };
            }
            return file;
          });
        });

        // 检查是否所有文件都上传完成
        checkAllFilesUploaded();
      },
      onError: (taskId, error) => {
        // 更新对应文件为失败状态
        setFiles((prevFiles) => {
          return prevFiles.map((file) => {
            if (file.taskId === taskId) {
              return {
                ...file,
                status: taskStatusMap.ERROR,
                error,
              };
            }
            return file;
          });
        });
      },
    });
  }, [checkAllFilesUploaded]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: FileInfo[] = Array.from(e.target.files).map((file) => ({
        file,
        progress: 0,
        status: taskStatusMap.PENDING,
      }));

      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0 || uploading) {
      return;
    }

    setUploading(true);

    // 找出需要上传的文件（排除已完成的）
    const filesToUpload = files.filter(
      (file) => file.progress !== 100 && !file.isPaused,
    );

    // 依次添加到上传队列
    for (const fileInfo of filesToUpload) {
      try {
        // 如果已经有任务ID，先检查状态
        if (fileInfo.taskId) {
          const status = globalUploadQueue.getTaskStatus(fileInfo.taskId);

          // 如果任务已暂停，恢复它
          if (status === taskStatusMap.PAUSED) {
            globalUploadQueue.resumeTask(fileInfo.taskId);
            continue;
          }

          // 如果任务已经完成或错误状态，跳过
          if (
            status === taskStatusMap.COMPLETED ||
            status === taskStatusMap.ERROR
          ) {
            continue;
          }
        }

        // 否则创建新的上传任务
        const taskId = await globalUploadQueue.addTask(fileInfo.file);

        // 更新文件信息，关联上传任务ID
        setFiles((prevFiles) => {
          return prevFiles.map((file) => {
            if (file.file === fileInfo.file) {
              return { ...file, taskId, status: taskStatusMap.PROCESSING };
            }
            return file;
          });
        });
      } catch (error) {
        console.error('添加上传任务失败:', error);

        // 更新文件状态为失败
        setFiles((prevFiles) => {
          return prevFiles.map((file) => {
            if (file.file === fileInfo.file && error instanceof AxiosError) {
              return {
                ...file,
                status: taskStatusMap.ERROR,
                error: error.message,
              };
            }
            return file;
          });
        });
      }
    }
  };

  // 暂停指定文件的上传
  const handlePauseFile = (index: number) => {
    const fileInfo = files[index];
    if (!fileInfo.taskId) return;

    // 调用上传队列的暂停方法
    globalUploadQueue.pauseTask(fileInfo.taskId);
  };

  // 恢复指定文件的上传
  const handleResumeFile = (index: number) => {
    const fileInfo = files[index];
    if (!fileInfo.taskId) return;

    // 调用上传队列的恢复方法
    globalUploadQueue.resumeTask(fileInfo.taskId);
  };

  const handleRemoveFile = (index: number) => {
    const fileInfo = files[index];

    // 如果有任务ID，先从队列中移除
    if (fileInfo.taskId) {
      globalUploadQueue.removeTask(fileInfo.taskId);
    }

    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      return newFiles;
    });

    // 如果没有文件了，设置上传状态为false
    if (files.length === 1) {
      setUploading(false);
    }
  };

  const handleClearAll = () => {
    // 从队列中移除所有任务
    files.forEach((fileInfo) => {
      if (fileInfo.taskId) {
        globalUploadQueue.removeTask(fileInfo.taskId);
      }
    });

    setFiles([]);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="file-uploader">
      <div className="file-input-container">
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="file-input"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="select-button"
        >
          选择文件
        </button>
        <button
          onClick={handleUpload}
          disabled={files.length === 0}
          className="upload-button"
        >
          {uploading ? '上传中...' : '开始上传'}
        </button>
        <button
          onClick={handleClearAll}
          disabled={files.length === 0}
          className="clear-button"
        >
          清空
        </button>
      </div>

      <div className="files-list">
        {files.map((fileInfo, index) => (
          <div key={`${fileInfo.file.name}-${index}`} className="file-item">
            <UploadProgress
              filename={fileInfo.file.name}
              progress={fileInfo.progress}
              status={fileInfo.status}
              fileUrl={fileInfo.fileUrl}
            />
            <div className="file-actions">
              {fileInfo.isPaused ? (
                <button
                  onClick={() => handleResumeFile(index)}
                  className="resume-button"
                >
                  继续
                </button>
              ) : (
                fileInfo.progress < 100 &&
                fileInfo.progress > 0 && (
                  <button
                    onClick={() => handlePauseFile(index)}
                    className="pause-button"
                  >
                    暂停
                  </button>
                )
              )}
              <button
                onClick={() => handleRemoveFile(index)}
                className="remove-button"
              >
                移除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUploader;
