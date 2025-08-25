import { useState } from 'react';
import { MobileHeader } from './MobileHeader';
import { FileUpload } from '../shared/FileUpload';
import { TransferHistory } from '../shared/TransferHistory';
import { ControlPanel } from '../shared/ControlPanel';
import { ConnectionState, ExtendedClient, FileTransfer } from '@/types/webRTC';

interface MobileLayoutProps {
  connectionState: ConnectionState;
  displayClients: ExtendedClient[];
  selectedFile: File | null;
  transfers: FileTransfer[];
  onFileSelect: (file: File) => void;
  onConnect: (clientName: string) => Promise<void>;
  onDisconnect: () => void;
  onSendFile: (targetId: string) => void;
  onDownloadFile: (transferId: string) => void;
  onRemoveTransfer: (transferId: string) => void;
  onClearTransfers: () => void;
}

export function MobileLayout({
  connectionState,
  displayClients,
  selectedFile,
  transfers,
  onFileSelect,
  onConnect,
  onDisconnect,
  onSendFile,
  onDownloadFile,
  onRemoveTransfer,
  onClearTransfers,
}: MobileLayoutProps) {
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader
        connectionState={connectionState}
        displayClients={displayClients}
        drawerVisible={drawerVisible}
        setDrawerVisible={setDrawerVisible}
      >
        <ControlPanel
          connectionState={connectionState}
          displayClients={displayClients}
          selectedFile={selectedFile}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          onSendFile={onSendFile}
        />
      </MobileHeader>

      <main className="container px-4 py-6 space-y-6">
        <FileUpload
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
          isMobile={true}
        />

        <TransferHistory
          transfers={transfers}
          onDownload={onDownloadFile}
          onRemove={onRemoveTransfer}
          onClearAll={onClearTransfers}
          isMobile={true}
        />
      </main>
    </div>
  );
}
