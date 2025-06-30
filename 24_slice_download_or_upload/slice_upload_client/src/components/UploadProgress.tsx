import React from 'react';

interface UploadProgressProps {
  progress: number;
  status: string;
  filename: string;
  fileUrl?: string;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  status,
  filename,
  fileUrl,
}) => {
  return (
    <div className="upload-progress">
      <div className="file-info">
        <span className="filename">{filename}</span>
        <span className="status">{status}</span>
      </div>

      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
        <span className="progress-text">{Math.round(progress)}%</span>
      </div>

      {fileUrl && (
        <div className="file-url">
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            查看文件
          </a>
        </div>
      )}
    </div>
  );
};

export default UploadProgress;
