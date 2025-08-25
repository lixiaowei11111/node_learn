import { WebSocket } from 'ws';

export interface Client {
  id: string;
  name: string;
  ws: WebSocket;
  connected: boolean;
  lastSeen: number;
  ip: string;
  userAgent?: string;
  roomId?: string; // 添加房间ID
}

export interface ClientInfo {
  id: string;
  name: string;
  ip: string;
  connected: boolean;
  lastSeen: string;
  userAgent?: string;
}

export interface RegisterMessage {
  type: 'register';
  name?: string;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate';
  targetId: string;
  fromId: string;
  [key: string]: any;
}

export interface DisconnectMessage {
  type: 'disconnect';
  clientId: string;
}

export type WebSocketMessage = RegisterMessage | SignalingMessage | DisconnectMessage;
