import React from 'react';
import './index.css';

interface UploadProgressProps {
  filename: string;
  progress: number;
  status: string;
  fileUrl?: string;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  filename,
  progress,
  status,
  fileUrl,
}) => {
  // 根据状态选择进度条颜色
  const getProgressBarColor = () => {
    if (status.includes('失败')) return '#f44336'; // 失败 - 红色
    if (status === '已暂停') return '#ff9800'; // 暂停 - 橙色
    if (status === '上传完成') return '#4caf50'; // 完成 - 绿色
    return '#2196f3'; // 默认 - 蓝色
  };

  return (
    <div className="upload-progress">
      <div className="file-info">
        <div className="filename">
          {filename}{' '}
          {fileUrl && (
            <a href={fileUrl} target="_blank" rel="noreferrer">
              (查看)
            </a>
          )}
        </div>
        <div className="status-text">{status}</div>
      </div>
      <div className="progress-container">
        <div
          className="progress-bar"
          style={{
            width: `${progress}%`,
            backgroundColor: getProgressBarColor(),
          }}
        ></div>
      </div>
      <div className="progress-percentage">{Math.round(progress)}%</div>
    </div>
  );
};

export default UploadProgress;
