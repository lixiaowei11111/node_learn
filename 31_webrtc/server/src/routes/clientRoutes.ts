import { Hono } from 'hono';
import { ClientManager } from '../services/clientManager';
import { iceServerManager } from '../services/iceServerManager';

/**
 * 客户端管理路由
 */
export function createClientRoutes(app: Hono, clientManager: ClientManager): void {
  // 获取客户端列表的HTTP接口
  app.get('/clients', (c) => {
    const clientList = clientManager.getClientInfoList();

    return c.json({
      clients: clientList,
      count: clientManager.getClientCount(),
    });
  });

  // 获取特定客户端详细信息的接口
  app.get('/clients/:id', (c) => {
    const clientId = c.req.param('id');
    const client = clientManager.getClient(clientId);

    if (!client) {
      return c.json({ error: 'Client not found' }, 404);
    }

    return c.json({
      id: client.id,
      name: client.name,
      ip: client.ip,
      connected: client.connected,
      lastSeen: new Date(client.lastSeen).toISOString(),
      userAgent: client.userAgent,
    });
  });
}
