import React from 'react';
import './index.css';
import {
  TaskStatus,
  taskStatusTextMap,
  taskStatusMap,
} from '../../util/uploadQueue';

import { Button } from 'antd';

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

  const handleDownload = () => {
    if (fileUrl) {
      const downloadLink = document.createElement('a');

      // 完整URL，包含服务器地址和文件路径
      const fullUrl = `${process.env.SERVER_HOST}/api${fileUrl}`;

      // 设置下载属性，提供默认文件名
      downloadLink.href = fullUrl;
      downloadLink.download = filename;

      // 可选：添加rel="noopener"提高安全性
      downloadLink.rel = 'noopener noreferrer';

      // 触发下载
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="upload-progress">
      <div className="file-info">
        <div className="filename">
          {filename}&nbsp;
          {fileUrl && status === taskStatusMap.COMPLETED && (
            <Button
              type="link"
              onClick={handleDownload}
              className="download-button"
            >
              查看
            </Button>
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
