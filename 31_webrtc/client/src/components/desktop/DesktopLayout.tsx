import { useState } from 'react';
import { DesktopHeader } from './DesktopHeader';
import { FileUpload } from '../shared/FileUpload';
import { TransferHistory } from '../shared/TransferHistory';
import { ControlPanel } from '../shared/ControlPanel';
import { ICEServerManager } from '../shared/ICEServerManager';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Settings, Home } from 'lucide-react';
import { ConnectionState, ExtendedClient, FileTransfer } from '@/types/webRTC';

interface DesktopLayoutProps {
  connectionState: ConnectionState;
  displayClients: ExtendedClient[];
  selectedFile: File | null;
  transfers: FileTransfer[];
  onFileSelect: (file: File) => void;
  onFileClear: () => void;
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
  onFileClear,
  onConnect,
  onDisconnect,
  onSendFile,
  onDownloadFile,
  onRemoveTransfer,
  onClearTransfers,
}: DesktopLayoutProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'settings'>('home');

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
        <main className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b">
            <div className="px-6 py-3">
              <div className="flex space-x-1">
                <Button
                  variant={activeTab === 'home' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('home')}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  文件传输
                </Button>
                <Button
                  variant={activeTab === 'settings' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('settings')}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  服务器设置
                </Button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6">
            {activeTab === 'home' && (
              <div className="space-y-6">
                <FileUpload
                  selectedFile={selectedFile}
                  onFileSelect={onFileSelect}
                  onFileClear={onFileClear}
                  isMobile={false}
                />

                <TransferHistory
                  transfers={transfers}
                  onDownload={onDownloadFile}
                  onRemove={onRemoveTransfer}
                  onClearAll={onClearTransfers}
                  isMobile={false}
                />
              </div>
            )}

            {activeTab === 'settings' && (
              <ICEServerManager serverUrl="http://localhost:3000" />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
