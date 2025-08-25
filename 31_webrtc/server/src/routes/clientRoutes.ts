import { Hono } from 'hono';
import type { ClientManager } from '../services/clientManager';
import { getClientIP } from '../utils/index';

/**
 * 创建客户端相关的路由
 */
export function createClientRoutes(app: Hono, clientManager: ClientManager) {
  // 获取所有客户端列表
  app.get('/clients', (c) => {
    const clients = clientManager.getClientInfoList();
    return c.json({
      success: true,
      data: clients,
      count: clients.length,
    });
  });

  // 获取客户端详细信息
  app.get('/clients/:id', (c) => {
    const clientId = c.req.param('id');
    const client = clientManager.getClient(clientId);

    if (!client) {
      return c.json(
        {
          success: false,
          error: 'Client not found',
        },
        404,
      );
    }

    return c.json({
      success: true,
      data: {
        id: client.id,
        name: client.name,
        ip: client.ip,
        connected: client.connected,
        lastSeen: new Date(client.lastSeen).toISOString(),
        userAgent: client.userAgent,
      },
    });
  });

  // 获取当前客户端的IP地址
  app.get('/api/my-ip', (c) => {
    const clientIP = getClientIP(c);
    return c.json({
      success: true,
      ip: clientIP,
      timestamp: new Date().toISOString(),
      headers: {
        'x-forwarded-for': c.req.header('x-forwarded-for'),
        'x-real-ip': c.req.header('x-real-ip'),
        'cf-connecting-ip': c.req.header('cf-connecting-ip'),
        'user-agent': c.req.header('user-agent'),
      },
    });
  });
}
