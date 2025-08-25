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
  // 移除内存中的 chunks 数组，改用 IndexedDB 存储
  // chunks: ArrayBuffer[];
  receivedChunks: number;
  totalChunks: number;
  progress: number;
  status: 'pending' | 'transferring' | 'completed' | 'failed' | 'assembling';
  direction: 'send' | 'receive';
  timestamp: number;
  // 新增速度检测相关字段
  startTime?: number;
  lastUpdateTime?: number;
  transferredBytes: number;
  speed: number; // 当前传输速度 (bytes/second)
  avgSpeed: number; // 平均传输速度 (bytes/second)
  estimatedTimeRemaining?: number; // 预估剩余时间 (seconds)
  // 新增：是否使用优化存储
  useOptimizedStorage?: boolean;
  // 新增：组装进度（0-100）
  assemblingProgress?: number;
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
  roomId?: string; // 添加房间ID
}

export interface RegisteredMessage extends SignalingMessage {
  type: 'registered';
  clientId: string;
  name: string;
  ip?: string;
  roomId?: string; // 添加房间ID
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
  autoFetchICEServers?: boolean; // 是否自动从服务器获取 ICE 服务器配置
}

export interface ICEServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
  credentialType?: 'password' | 'oauth';
}

export interface WebRTCConfig {
  iceServers: ICEServerConfig[];
  timestamp: string;
}

export interface UseWebRTCReturn {
  // 连接状态
  connectionState: ConnectionState;
  clients: Client[];
  transfers: FileTransfer[];

  // 连接方法
  connect: (name: string, roomId?: string) => Promise<void>;
  disconnect: () => void;

  // 文件传输方法
  sendFile: (targetId: string, file: File) => Promise<void>;
  downloadFile: (transferId: string) => void;

  // 状态管理
  clearTransfers: () => void;
  removeTransfer: (transferId: string) => void;
}
