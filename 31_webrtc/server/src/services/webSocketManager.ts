import { createNodeWebSocket } from '@hono/node-ws';
import { Hono, type Context } from 'hono';
import { WebSocket } from 'ws';
import { ClientManager } from './clientManager';
import { SignalingManager } from './signalingManager';
import type { WebSocketMessage } from '../types/client';
import { getClientIP } from '../utils/index';

/**
 * WebSocket连接管理器
 * 负责处理WebSocket连接和消息路由
 */
export class WebSocketManager {
  private clientManager: ClientManager;
  private signalingManager: SignalingManager;
  public injectWebSocket: any;
  public upgradeWebSocket: any;

  constructor(app: Hono) {
    this.clientManager = new ClientManager();
    this.signalingManager = new SignalingManager(this.clientManager);

    // 初始化WebSocket
    const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });
    this.injectWebSocket = injectWebSocket;
    this.upgradeWebSocket = upgradeWebSocket;
  }

  /**
   * 获取客户端管理器实例
   */
  getClientManager(): ClientManager {
    return this.clientManager;
  }

  /**
   * 获取信令管理器实例
   */
  getSignalingManager(): SignalingManager {
    return this.signalingManager;
  }

  /**
   * 创建WebSocket路由处理器
   */
  createWebSocketHandler() {
    return this.upgradeWebSocket((c: Context) => {
      // 获取客户端IP和User-Agent
      const clientIP = getClientIP(c);
      const userAgent = c.req.header('user-agent') || '';

      return {
        onOpen: (evt: any, ws: any) => {
          console.log(`Client connected from IP: ${clientIP}`);
        },

        onMessage: (evt: any, ws: any) => {
          try {
            const data: WebSocketMessage = JSON.parse(evt.data.toString());
            console.log('Received message:', data.type);

            this.handleMessage(data, ws, clientIP, userAgent);
          } catch (error) {
            console.error('Error parsing message:', error);
            this.sendError(ws, 'Invalid message format');
          }
        },

        onClose: (evt: any, ws: any) => {
          this.signalingManager.handleWebSocketClose(ws.raw);
        },

        onError: (evt: any, ws: any) => {
          console.error('WebSocket error:', evt);
        },
      };
    });
  }

  /**
   * 处理WebSocket消息
   */
  private handleMessage(data: WebSocketMessage, ws: any, clientIP: string, userAgent: string): void {
    switch (data.type) {
      case 'register':
        this.handleRegisterMessage(data, ws, clientIP, userAgent);
        break;

      case 'offer':
      case 'answer':
      case 'ice-candidate':
        this.handleSignalingMessage(data, ws);
        break;

      case 'disconnect':
        this.handleDisconnectMessage(data);
        break;

      default:
        console.warn('Unknown message type:', (data as any).type);
        this.sendError(ws, 'Unknown message type');
    }
  }

  /**
   * 处理注册消息
   */
  private handleRegisterMessage(data: any, ws: any, clientIP: string, userAgent: string): void {
    if (!ws.raw) {
      console.error('WebSocket raw is undefined');
      this.sendError(ws, 'WebSocket connection invalid');
      return;
    }

    const result = this.signalingManager.handleRegister(ws.raw, data.name, clientIP, userAgent);

    // 发送注册成功消息
    ws.send(
      JSON.stringify({
        type: 'registered',
        ...result,
      }),
    );
  }

  /**
   * 处理信令消息
   */
  private handleSignalingMessage(data: any, ws: any): void {
    const success = this.signalingManager.handleSignalingMessage(data);

    if (!success) {
      this.sendError(ws, `Target client ${data.targetId} not found or unavailable`);
    }
  }

  /**
   * 处理断开连接消息
   */
  private handleDisconnectMessage(data: any): void {
    this.signalingManager.handleDisconnect(data.clientId);
  }

  /**
   * 发送错误消息
   */
  private sendError(ws: any, message: string): void {
    try {
      ws.send(
        JSON.stringify({
          type: 'error',
          message,
        }),
      );
    } catch (error) {
      console.error('Failed to send error message:', error);
    }
  }
}
