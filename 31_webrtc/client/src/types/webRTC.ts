export interface Client {
  id: string;
  name: string;
  ip?: string;
}

export interface ExtendedClient extends Client {
  isCurrentDevice?: boolean;
}

export interface FileTransfer {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  chunks: ArrayBuffer[];
  receivedChunks: number;
  totalChunks: number;
  progress: number;
  status: 'pending' | 'transferring' | 'completed' | 'failed';
  direction: 'send' | 'receive';
  timestamp: number;
}

export interface SignalingMessage {
  type:
    | 'register'
    | 'registered'
    | 'client-list'
    | 'offer'
    | 'answer'
    | 'ice-candidate'
    | 'disconnect';
  [key: string]: unknown;
}

export interface RegisterMessage extends SignalingMessage {
  type: 'register';
  name: string;
}

export interface RegisteredMessage extends SignalingMessage {
  type: 'registered';
  clientId: string;
  name: string;
  ip?: string;
}

export interface ClientListMessage extends SignalingMessage {
  type: 'client-list';
  clients: Client[];
}

export interface OfferMessage extends SignalingMessage {
  type: 'offer';
  offer: RTCSessionDescriptionInit;
  fromId: string;
  targetId: string;
}

export interface AnswerMessage extends SignalingMessage {
  type: 'answer';
  answer: RTCSessionDescriptionInit;
  fromId: string;
  targetId: string;
}

export interface IceCandidateMessage extends SignalingMessage {
  type: 'ice-candidate';
  candidate: RTCIceCandidate;
  fromId: string;
  targetId: string;
}

export interface FileInfoMessage {
  type: 'file-info';
  fileName: string;
  fileSize: number;
  fileType: string;
  totalChunks: number;
}

export interface FileChunkMessage {
  type: 'file-chunk';
  chunkIndex: number;
  totalChunks: number;
}

export interface ConnectionState {
  isConnected: boolean;
  clientId: string;
  clientName: string;
  clientIP?: string;
  error: string | null;
}

export interface UseWebRTCOptions {
  serverUrl?: string;
  iceServers?: RTCIceServer[];
  chunkSize?: number;
}

export interface UseWebRTCReturn {
  // 连接状态
  connectionState: ConnectionState;
  clients: Client[];
  transfers: FileTransfer[];

  // 连接方法
  connect: (name: string) => Promise<void>;
  disconnect: () => void;

  // 文件传输方法
  sendFile: (targetId: string, file: File) => Promise<void>;
  downloadFile: (transferId: string) => void;

  // 状态管理
  clearTransfers: () => void;
  removeTransfer: (transferId: string) => void;
}
