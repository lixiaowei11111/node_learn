import { DesktopHeader } from './DesktopHeader';
import { FileUpload } from '../shared/FileUpload';
import { TransferHistory } from '../shared/TransferHistory';
import { ControlPanel } from '../shared/ControlPanel';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ConnectionState, ExtendedClient, FileTransfer } from '@/types/webRTC';

interface DesktopLayoutProps {
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

export function DesktopLayout({
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
}: DesktopLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <DesktopHeader
        connectionState={connectionState}
        displayClients={displayClients}
      />

      {connectionState.error && (
        <div className="container px-6 pt-4">
          <Alert className="w-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{connectionState.error}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 border-r bg-muted/30 p-6">
          <ControlPanel
            connectionState={connectionState}
            displayClients={displayClients}
            selectedFile={selectedFile}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
            onSendFile={onSendFile}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
          <FileUpload
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
            isMobile={false}
          />

          <TransferHistory
            transfers={transfers}
            onDownload={onDownloadFile}
            onRemove={onRemoveTransfer}
            onClearAll={onClearTransfers}
            isMobile={false}
          />
        </main>
      </div>
    </div>
  );
}
