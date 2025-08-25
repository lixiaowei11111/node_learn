import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Upload,
  Download,
  User,
  Wifi,
  WifiOff,
  Trash2,
  X,
  Menu,
  Users,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Toaster } from 'sonner';
import { toast } from '@/lib/toast';
import { useWebRTC } from './hooks/useWebRTC';
import { useMobile, mobileUtils } from './hooks/useMobile';
import { FileTransfer, ExtendedClient } from './types/webRTC';

function App() {
  const [clientName, setClientName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mobileInfo = useMobile();
  const { isMobile, isIOS } = mobileInfo;

  // 移动端优化初始化
  useEffect(() => {
    if (isMobile) {
      // 应用移动端性能优化
      mobileUtils.optimizePerformance();

      // iOS Safari特殊处理
      if (isIOS) {
        mobileUtils.hideAddressBar();
      }

      // 防止页面缩放
      document.addEventListener('gesturestart', (e) => e.preventDefault());
      document.addEventListener('gesturechange', (e) => e.preventDefault());
      document.addEventListener('gestureend', (e) => e.preventDefault());
    }
  }, [isMobile, isIOS]);

  const {
    connectionState,
    clients,
    transfers,
    connect,
    disconnect,
    sendFile,
    downloadFile,
    clearTransfers,
    removeTransfer,
  } = useWebRTC({
    serverUrl: 'ws://localhost:3000/ws',
  });

  const handleConnect = useCallback(async () => {
    if (!clientName.trim()) {
      toast.error('请输入客户端名称');
      return;
    }

    setIsConnecting(true);
    try {
      await connect(clientName);
      toast.success('连接成功');
    } catch (error) {
      toast.error('连接失败');
      console.error(error);
    } finally {
      setIsConnecting(false);
    }
  }, [clientName, connect]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    toast.info('已断开连接');
  }, [disconnect]);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setSelectedFile(file);
      }
    },
    [],
  );

  const handleSendFile = useCallback(
    async (targetId: string) => {
      if (!selectedFile) {
        toast.error('请先选择文件');
        return;
      }

      try {
        await sendFile(targetId, selectedFile);
        toast.success('文件发送完成');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        if (isMobile) {
          setDrawerVisible(false);
        }
      } catch (error) {
        toast.error('文件发送失败');
        console.error(error);
      }
    },
    [selectedFile, sendFile, isMobile],
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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

  // 生成显示用的客户端列表，包含本设备
  const displayClients = useMemo((): ExtendedClient[] => {
    if (!connectionState.isConnected || !connectionState.clientId) {
      return [];
    }

    // 过滤掉服务器返回的本地设备，避免重复显示
    const otherClients: ExtendedClient[] = clients.filter(
      (client) => client.id !== connectionState.clientId,
    );

    // 添加本设备到列表顶部
    const allClients: ExtendedClient[] = [
      {
        id: connectionState.clientId,
        name: connectionState.clientName,
        ip: connectionState.clientIP,
        isCurrentDevice: true,
      },
      ...otherClients,
    ];

    return allClients;
  }, [
    clients,
    connectionState.isConnected,
    connectionState.clientId,
    connectionState.clientName,
    connectionState.clientIP,
  ]);

  // 控制面板组件
  const controlPanelContent = useMemo(
    () => (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-4 h-4" />
              连接设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="输入客户端名称"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              disabled={connectionState.isConnected}
            />
            {!connectionState.isConnected ? (
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                连接服务器
              </Button>
            ) : (
              <Button
                onClick={handleDisconnect}
                variant="destructive"
                className="w-full"
              >
                断开连接
              </Button>
            )}
          </CardContent>
        </Card>

        {connectionState.isConnected && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                设备列表 ({displayClients.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {displayClients.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  暂无其他客户端在线
                </p>
              ) : (
                <div className="space-y-3">
                  {displayClients.map((client) => {
                    const isCurrentDevice = client.isCurrentDevice ?? false;
                    return (
                      <div
                        key={client.id}
                        className="p-3 rounded-lg border bg-card"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{client.name}</span>
                            {isCurrentDevice && <Badge>本设备</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {client.id.substring(0, 8)}...
                          </p>
                          {client.ip && (
                            <p className="text-xs text-muted-foreground">
                              IP: {client.ip}
                            </p>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleSendFile(client.id)}
                            disabled={!selectedFile || isCurrentDevice}
                            className="w-full"
                            variant={isCurrentDevice ? 'secondary' : 'default'}
                          >
                            {isCurrentDevice ? '本设备' : '发送文件'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    ),
    [
      clientName,
      connectionState.isConnected,
      isConnecting,
      handleConnect,
      handleDisconnect,
      displayClients,
      handleSendFile,
      selectedFile,
    ],
  );

  // 移动端布局
  if (isMobile) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <Sheet open={drawerVisible} onOpenChange={setDrawerVisible}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>控制面板</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">{controlPanelContent}</div>
                  </SheetContent>
                </Sheet>
                <h1 className="text-lg font-semibold">文件传输</h1>
              </div>
              <div>
                {connectionState.isConnected ? (
                  <Badge variant="default" className="gap-1">
                    <Wifi className="w-3 h-3" />
                    {displayClients.length - 1}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <WifiOff className="w-3 h-3" />
                    离线
                  </Badge>
                )}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="container px-4 py-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  文件选择
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full h-20 border-dashed"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-6 h-6" />
                      <span>选择文件</span>
                    </div>
                  </Button>
                  {selectedFile && (
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="space-y-1">
                        <p className="font-medium">已选择文件：</p>
                        <p className="text-sm text-muted-foreground break-all">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    传输记录
                  </span>
                  {transfers.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <X className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认清除</AlertDialogTitle>
                          <AlertDialogDescription>
                            确定要清除所有传输记录吗？此操作无法撤销。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={clearTransfers}>
                            确认清除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transfers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    暂无传输记录
                  </p>
                ) : (
                  <div className="space-y-3">
                    {transfers.map((transfer) => (
                      <div
                        key={transfer.id}
                        className="p-3 rounded-lg border bg-card"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium truncate flex-1">
                              {transfer.fileName}
                            </span>
                            <div className="flex gap-1 ml-2">
                              <Badge
                                variant={
                                  transfer.direction === 'send'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {transfer.direction === 'send'
                                  ? '发送'
                                  : '接收'}
                              </Badge>
                              <Badge
                                variant={getStatusVariant(transfer.status)}
                              >
                                {getStatusText(transfer.status)}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(transfer.fileSize)} |{' '}
                            {new Date(transfer.timestamp).toLocaleTimeString()}
                          </p>
                          <Progress value={transfer.progress} className="h-2" />
                          <div className="flex gap-2">
                            {transfer.direction === 'receive' &&
                              transfer.status === 'completed' && (
                                <Button
                                  size="sm"
                                  onClick={() => downloadFile(transfer.id)}
                                  className="flex-1"
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  下载
                                </Button>
                              )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeTransfer(transfer.id)}
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
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    );
  }

  // 桌面端布局
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-6">
            <h1 className="text-2xl font-bold">局域网文件传输</h1>
            <div className="flex items-center gap-4">
              {connectionState.isConnected ? (
                <Badge variant="default" className="gap-1">
                  <Wifi className="w-4 h-4" />
                  已连接 ({displayClients.length - 1} 个其他客户端在线)
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <WifiOff className="w-4 h-4" />
                  未连接
                </Badge>
              )}
              {connectionState.error && (
                <Alert className="w-auto">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{connectionState.error}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-80 border-r bg-muted/30 p-6">
            {controlPanelContent}
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  文件选择
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="h-32 border-dashed border-2 w-full"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8" />
                      <span>选择文件</span>
                    </div>
                  </Button>
                  {selectedFile && (
                    <div className="p-4 rounded-lg bg-muted">
                      <div className="space-y-2">
                        <p className="font-medium">已选择文件：</p>
                        <p className="text-sm text-muted-foreground">
                          名称：{selectedFile.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          大小：{formatFileSize(selectedFile.size)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          类型：{selectedFile.type || '未知'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    传输记录
                  </span>
                  {transfers.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <X className="w-4 h-4 mr-2" />
                          清除所有
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认清除</AlertDialogTitle>
                          <AlertDialogDescription>
                            确定要清除所有传输记录吗？此操作无法撤销。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={clearTransfers}>
                            确认清除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transfers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    暂无传输记录
                  </p>
                ) : (
                  <div className="space-y-4">
                    {transfers.map((transfer) => (
                      <div
                        key={transfer.id}
                        className="p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {transfer.fileName}
                              </span>
                              <Badge
                                variant={
                                  transfer.direction === 'send'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {transfer.direction === 'send'
                                  ? '发送'
                                  : '接收'}
                              </Badge>
                              <Badge
                                variant={getStatusVariant(transfer.status)}
                              >
                                {getStatusText(transfer.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              大小: {formatFileSize(transfer.fileSize)} | 时间:{' '}
                              {new Date(
                                transfer.timestamp,
                              ).toLocaleTimeString()}
                            </p>
                            <Progress
                              value={transfer.progress}
                              className="h-2"
                            />
                          </div>
                          <div className="flex gap-2 ml-4">
                            {transfer.direction === 'receive' &&
                              transfer.status === 'completed' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      onClick={() => downloadFile(transfer.id)}
                                    >
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
                                  onClick={() => removeTransfer(transfer.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>删除记录</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
