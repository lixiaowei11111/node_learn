export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const fileUtils = {
  clearFileInput: (inputRef: React.RefObject<HTMLInputElement>) => {
    if (inputRef.current) {
      inputRef.current.value = '';
      const event = new Event('change', { bubbles: true });
      inputRef.current.dispatchEvent(event);
    }
  },

  createObjectURL: (blob: Blob): string => {
    return URL.createObjectURL(blob);
  },

  revokeObjectURL: (url: string) => {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.warn('Failed to revoke object URL:', error);
    }
  },

  downloadBlob: (blob: Blob, fileName: string) => {
    const url = fileUtils.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      fileUtils.revokeObjectURL(url);
    }, 1000);
  },

  clearFileChunks: (chunks: ArrayBuffer[]) => {
    if (Array.isArray(chunks)) {
      chunks.length = 0;
    }
  },

  releaseFileReference: (fileRef: { current: File | null }) => {
    if (fileRef.current) {
      fileRef.current = null;
    }
  },
};
