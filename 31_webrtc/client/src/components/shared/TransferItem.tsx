import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Download, Trash2 } from 'lucide-react';
import { FileTransfer } from '@/types/webRTC';
import { formatFileSize, formatTimestamp } from '@/lib/formatters';

interface TransferItemProps {
  transfer: FileTransfer;
  onDownload: (transferId: string) => void;
  onRemove: (transferId: string) => void;
  isMobile?: boolean;
}

export function TransferItem({
  transfer,
  onDownload,
  onRemove,
  isMobile = false,
}: TransferItemProps) {
  const getStatusVariant = (
    status: FileTransfer['status'],
  ): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'transferring':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: FileTransfer['status']): string => {
    switch (status) {
      case 'completed':
        return '完成';
      case 'transferring':
        return '传输中';
      case 'failed':
        return '失败';
      case 'pending':
        return '等待';
      default:
        return '未知';
    }
  };

  if (isMobile) {
    return (
      <div className="p-3 rounded-lg border bg-card">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium truncate flex-1">
              {transfer.fileName}
            </span>
            <div className="flex gap-1 ml-2">
              <Badge
                variant={
                  transfer.direction === 'send' ? 'default' : 'secondary'
                }
              >
                {transfer.direction === 'send' ? '发送' : '接收'}
              </Badge>
              <Badge variant={getStatusVariant(transfer.status)}>
                {getStatusText(transfer.status)}
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(transfer.fileSize)} |{' '}
            {formatTimestamp(transfer.timestamp)}
          </p>
          <Progress value={transfer.progress} className="h-2" />
          <div className="flex gap-2">
            {transfer.direction === 'receive' &&
              transfer.status === 'completed' && (
                <Button
                  size="sm"
                  onClick={() => onDownload(transfer.id)}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-1" />
                  下载
                </Button>
              )}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onRemove(transfer.id)}
              className={
                transfer.direction === 'receive' &&
                transfer.status === 'completed'
                  ? ''
                  : 'flex-1'
              }
            >
              <Trash2 className="w-4 h-4 mr-1" />
              删除
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">{transfer.fileName}</span>
            <Badge
              variant={transfer.direction === 'send' ? 'default' : 'secondary'}
            >
              {transfer.direction === 'send' ? '发送' : '接收'}
            </Badge>
            <Badge variant={getStatusVariant(transfer.status)}>
              {getStatusText(transfer.status)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            大小: {formatFileSize(transfer.fileSize)} | 时间:{' '}
            {formatTimestamp(transfer.timestamp)}
          </p>
          <Progress value={transfer.progress} className="h-2" />
        </div>
        <div className="flex gap-2 ml-4">
          {transfer.direction === 'receive' &&
            transfer.status === 'completed' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" onClick={() => onDownload(transfer.id)}>
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>下载文件</TooltipContent>
              </Tooltip>
            )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onRemove(transfer.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>删除记录</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
