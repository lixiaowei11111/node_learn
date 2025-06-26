import React, { useState, useRef } from 'react';
import { uploadFile } from '../util/upload';
import UploadProgress from './UploadProgress';

interface FileInfo {
  file: File;
  progress: number;
  status: string;
  fileUrl?: string;
}

const FileUploader: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: FileInfo[] = Array.from(e.target.files).map((file) => ({
        file,
        progress: 0,
        status: '等待上传',
      }));

      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0 || uploading) {
      return;
    }

    setUploading(true);

    // 依次上传每个文件
    for (let i = 0; i < files.length; i++) {
      const fileInfo = files[i];

      if (fileInfo.progress === 100) {
        continue; // 跳过已经上传完成的文件
      }

      setFiles((prevFiles) => {
        const newFiles = [...prevFiles];
        newFiles[i] = { ...newFiles[i], status: '上传中' };
        return newFiles;
      });

      try {
        await uploadFile(
          fileInfo.file,
          undefined,
          (progress) => {
            setFiles((prevFiles) => {
              const newFiles = [...prevFiles];
              newFiles[i] = { ...newFiles[i], progress };
              return newFiles;
            });
          },
          (url) => {
            setFiles((prevFiles) => {
              const newFiles = [...prevFiles];
              newFiles[i] = {
                ...newFiles[i],
                status: '上传完成',
                progress: 100,
                fileUrl: url,
              };
              return newFiles;
            });
          },
          (error) => {
            setFiles((prevFiles) => {
              const newFiles = [...prevFiles];
              newFiles[i] = {
                ...newFiles[i],
                status: `上传失败: ${error.message}`,
              };
              return newFiles;
            });
          },
        );
      } catch (error) {
        console.error('上传过程中出错:', error);
      }
    }

    setUploading(false);
  };

  const handleRemoveFile = (index: number) => {
    if (uploading) return;

    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleClearAll = () => {
    if (uploading) return;

    setFiles([]);
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
          disabled={files.length === 0 || uploading}
          className="upload-button"
        >
          {uploading ? '上传中...' : '开始上传'}
        </button>
        <button
          onClick={handleClearAll}
          disabled={files.length === 0 || uploading}
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
            <button
              onClick={() => handleRemoveFile(index)}
              disabled={uploading}
              className="remove-button"
            >
              移除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUploader;
