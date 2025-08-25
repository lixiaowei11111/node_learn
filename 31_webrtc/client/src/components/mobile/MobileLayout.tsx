import { useState } from 'react';
import { MobileHeader } from './MobileHeader';
import { ControlPanel } from '../shared/ControlPanel';
import { FileUpload } from '../shared/FileUpload';
import { TransferHistory } from '../shared/TransferHistory';
import { ICEServerManager } from '../shared/ICEServerManager';
import { RoomManager } from '../shared/RoomManager';
import { Button } from '@/components/ui/button';
import { Home, Settings } from 'lucide-react';
import { ConnectionState, ExtendedClient, FileTransfer } from '@/types/webRTC';

interface MobileLayoutProps {
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
  onPauseTransfer?: (transferId: string) => void;
  onResumeTransfer?: (transferId: string) => void;
  onCancelTransfer?: (transferId: string) => void;
  onClearTransfers: () => void;
}

export function MobileLayout({
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
  onPauseTransfer,
  onResumeTransfer,
  onCancelTransfer,
  onClearTransfers,
}: MobileLayoutProps) {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'settings'>('home');
  const [clientName, setClientName] = useState('');

  const getTitle = () => {
    switch (activeTab) {
      case 'home':
        return '文件传输';
      case 'settings':
        return '服务器设置';
      default:
        return '文件传输';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileHeader
        connectionState={connectionState}
        displayClients={displayClients}
        drawerVisible={drawerVisible}
        setDrawerVisible={setDrawerVisible}
        title={getTitle()}
      >
        <ControlPanel
          connectionState={connectionState}
          displayClients={displayClients}
          selectedFile={selectedFile}
          clientName={clientName}
          onClientNameChange={setClientName}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          onSendFile={onSendFile}
        />
      </MobileHeader>

      {/* Tab Navigation */}
      <div className="border-b bg-background">
        <div className="container px-4 py-2">
          <div className="flex space-x-1">
            <Button
              variant={activeTab === 'home' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2 flex-1"
            >
              <Home className="h-4 w-4" />
              传输
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-2 flex-1"
            >
              <Settings className="h-4 w-4" />
              设置
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <main className="flex-1 container px-4 py-6">
        {activeTab === 'home' && (
          <div className="space-y-6">
            <RoomManager isConnected={connectionState.isConnected} />

            <FileUpload
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
              onFileClear={onFileClear}
              isMobile={true}
            />

            <TransferHistory
              transfers={transfers}
              onDownload={onDownloadFile}
              onRemove={onRemoveTransfer}
              onPause={onPauseTransfer}
              onResume={onResumeTransfer}
              onCancel={onCancelTransfer}
              onClearAll={onClearTransfers}
              isMobile={true}
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <RoomManager isConnected={connectionState.isConnected} />
            <ICEServerManager serverUrl="http://localhost:3000" />
          </div>
        )}
      </main>
    </div>
  );
}
