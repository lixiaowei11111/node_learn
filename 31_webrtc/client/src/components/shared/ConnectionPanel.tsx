import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { User, Loader2 } from 'lucide-react';
import { ConnectionState } from '@/types/webRTC';

interface ConnectionPanelProps {
  connectionState: ConnectionState;
  onConnect: (clientName: string) => Promise<void>;
  onDisconnect: () => void;
}

export function ConnectionPanel({
  connectionState,
  onConnect,
  onDisconnect,
}: ConnectionPanelProps) {
  const [clientName, setClientName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleConnect = useCallback(async () => {
    if (!clientName.trim()) {
      throw new Error('请输入客户端名称');
    }

    setIsConnecting(true);
    try {
      await onConnect(clientName);
    } finally {
      setIsConnecting(false);
    }
  }, [clientName, onConnect]);

  const handleDisconnect = useCallback(() => {
    setIsDisconnecting(true);
    try {
      onDisconnect();
    } catch (error) {
      console.error('Disconnect error:', error);
    } finally {
      // 短暂显示loading效果，然后重置
      setTimeout(() => {
        setIsDisconnecting(false);
      }, 200);
    }
  }, [onDisconnect]);

  return (
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
            {isConnecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            连接服务器
          </Button>
        ) : (
          <Button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            variant="destructive"
            className="w-full"
          >
            {isDisconnecting && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            断开连接
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
