import { WebSocket } from 'ws';
import { ClientManager } from './clientManager';
import type { WebSocketMessage, SignalingMessage } from '../types/client';

/**
 * 信令管理器
 * 负责处理WebRTC信令消息的转发和广播
 */
export class SignalingManager {
  constructor(private clientManager: ClientManager) {}

  /**
   * 处理客户端注册
   */
  handleRegister(
    ws: WebSocket,
    name: string | undefined,
    ip: string,
    userAgent?: string,
  ): { clientId: string; name: string; ip: string } {
    const client = this.clientManager.registerClient(ws, name, ip, userAgent);

    // 广播客户端列表更新
    this.broadcastClientList();

    return {
      clientId: client.id,
      name: client.name,
      ip: client.ip,
    };
  }

  /**
   * 处理信令消息转发 (offer, answer, ice-candidate)
   */
  handleSignalingMessage(message: SignalingMessage): boolean {
    const targetClient = this.clientManager.getClient(message.targetId);

    if (!targetClient) {
      console.log(`Target client ${message.targetId} not found`);
      return false;
    }

    if (targetClient.ws.readyState === WebSocket.OPEN) {
      targetClient.ws.send(
        JSON.stringify({
          ...message,
          fromId: message.fromId,
        }),
      );
      return true;
    }

    return false;
  }

  /**
   * 处理客户端断开连接
   */
  handleDisconnect(clientId: string): boolean {
    const removed = this.clientManager.removeClient(clientId);
    if (removed) {
      this.broadcastClientList();
    }
    return removed;
  }

  /**
   * 处理WebSocket连接关闭
   */
  handleWebSocketClose(ws: WebSocket): void {
    const clientId = this.clientManager.removeClientByWs(ws);
    if (clientId) {
      this.broadcastClientList();
    }
  }

  /**
   * 广播客户端列表给所有连接的客户端
   */
  broadcastClientList(): void {
    const clientList = this.clientManager.getClientList();
    const message = JSON.stringify({
      type: 'client-list',
      clients: clientList,
    });

    const allClients = this.clientManager.getAllClients();
    for (const client of allClients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(message);
        } catch (error) {
          console.error(`Failed to send client list to ${client.id}:`, error);
        }
      }
    }
  }

  /**
   * 向特定客户端发送消息
   */
  sendToClient(clientId: string, message: object): boolean {
    const client = this.clientManager.getClient(clientId);

    if (!client) {
      return false;
    }

    if (client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error(`Failed to send message to client ${clientId}:`, error);
      }
    }

    return false;
  }

  /**
   * 广播消息给所有客户端
   */
  broadcast(message: object): void {
    const messageStr = JSON.stringify(message);
    const allClients = this.clientManager.getAllClients();

    for (const client of allClients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(messageStr);
        } catch (error) {
          console.error(`Failed to broadcast to client ${client.id}:`, error);
        }
      }
    }
  }
}
