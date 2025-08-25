import { ConnectionPanel } from './ConnectionPanel';
import { DeviceList } from './DeviceList';
import { ConnectionState, ExtendedClient } from '@/types/webRTC';

interface ControlPanelProps {
  connectionState: ConnectionState;
  displayClients: ExtendedClient[];
  selectedFile: File | null;
  onConnect: (clientName: string) => Promise<void>;
  onDisconnect: () => void;
  onSendFile: (targetId: string) => void;
}

export function ControlPanel({
  connectionState,
  displayClients,
  selectedFile,
  onConnect,
  onDisconnect,
  onSendFile,
}: ControlPanelProps) {
  return (
    <div className="space-y-6">
      <ConnectionPanel
        connectionState={connectionState}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
      />

      {connectionState.isConnected && (
        <DeviceList
          displayClients={displayClients}
          onSendFile={onSendFile}
          selectedFile={selectedFile}
        />
      )}
    </div>
  );
}
