import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { ExtendedClient } from '@/types/webRTC';

interface DeviceListProps {
  displayClients: ExtendedClient[];
  onSendFile: (targetId: string) => void;
  selectedFile: File | null;
}

export function DeviceList({
  displayClients,
  onSendFile,
  selectedFile,
}: DeviceListProps) {
  return (
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
                <div key={client.id} className="p-3 rounded-lg border bg-card">
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
                      onClick={() => onSendFile(client.id)}
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
  );
}
