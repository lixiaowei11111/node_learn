import React from 'react';
import './index.css';
import {
  TaskStatus,
  taskStatusTextMap,
  taskStatusMap,
} from '../util/uploadQueue';

interface UploadProgressProps {
  filename: string;
  progress: number;
  status: TaskStatus;
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
    if (status === taskStatusMap.ERROR) return '#f44336'; // 失败 - 红色
    if (status === taskStatusMap.PAUSED) return '#ff9800'; // 暂停 - 橙色
    if (status === taskStatusMap.COMPLETED) return '#4caf50'; // 完成 - 绿色
    return '#2196f3'; // 默认 - 蓝色
  };

  return (
    <div className="upload-progress">
      <div className="file-info">
        <div className="filename">
          {filename}&nbsp;
          {fileUrl && (
            <a href={fileUrl} target="_blank" rel="noreferrer">
              (查看)
            </a>
          )}
        </div>
        <div className="status-text">{taskStatusTextMap[status]}</div>
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
