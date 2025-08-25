import { serve } from '@hono/node-server';
import { createNodeWebSocket } from '@hono/node-ws';
import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { iceServerManager } from './services/iceServerManager.js';
import { getICEServers, getConfig, updateConfig, addPresetServers, testICEServers } from './routes/iceConfig.js';

interface Client {
  id: string;
  name: string;
  ws: WebSocket;
  connected: boolean;
  lastSeen: number;
  ip: string;
  userAgent?: string;
}

const app = new Hono();
const clients = new Map<string, Client>();

// 启用CORS
app.use(
  '/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
);

// 获取客户端真实IP地址的函数
function getClientIP(c: Context): string {
  // 检查各种可能包含真实IP的头部
  const forwarded = c.req.header('x-forwarded-for');
  const realIP = c.req.header('x-real-ip');
  const cfConnectingIP = c.req.header('cf-connecting-ip');

  if (forwarded) {
    // x-forwarded-for 可能包含多个IP，第一个是客户端真实IP
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // 如果都没有，尝试从连接信息获取
  return c.req.header('remote-addr') || 'unknown';
}

// WebSocket升级
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

// WebSocket连接处理
app.get(
  '/ws',
  upgradeWebSocket((c) => {
    // 获取客户端IP和User-Agent
    const clientIP = getClientIP(c);
    const userAgent = c.req.header('user-agent') || '';

    return {
      onOpen: (evt, ws) => {
        console.log(`Client connected from IP: ${clientIP}`);
      },
      onMessage: (evt, ws) => {
        try {
          const data = JSON.parse(evt.data.toString());
          console.log('Received message:', data.type);

          switch (data.type) {
            case 'register': {
              // 在注册客户端时
              if (!ws.raw) {
                console.error('WebSocket raw is undefined');
                ws.send(
                  JSON.stringify({
                    type: 'error',
                    message: 'WebSocket connection invalid',
                  }),
                );
                return;
              }

              const clientId = uuidv4();
              const client: Client = {
                id: clientId,
                name: data.name || `Client-${clientId.substring(0, 8)}`,
                ws: ws.raw,
                connected: true,
                lastSeen: Date.now(),
                ip: clientIP,
                userAgent: userAgent,
              };
              clients.set(clientId, client);

              console.log(`Client registered: ${client.name} (${clientId}) from IP: ${clientIP}`);

              // 发送注册成功消息，包含IP信息
              ws.send(
                JSON.stringify({
                  type: 'registered',
                  clientId: clientId,
                  name: client.name,
                  ip: clientIP,
                }),
              );

              // 广播客户端列表更新
              broadcastClientList();
              break;
            }

            case 'offer':
            case 'answer':
            case 'ice-candidate':
              // 转发信令消息给目标客户端
              const targetClient = clients.get(data.targetId);
              if (targetClient) {
                targetClient.ws.send(
                  JSON.stringify({
                    ...data,
                    fromId: data.fromId,
                  }),
                );
              }
              break;

            case 'disconnect':
              handleDisconnect(data.clientId);
              break;
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      },
      onClose: (evt, ws) => {
        // 找到并移除断开连接的客户端
        for (const [id, client] of clients.entries()) {
          if (client.ws === ws.raw) {
            clients.delete(id);
            broadcastClientList();
            console.log(`Client ${id} disconnected`);
            break;
          }
        }
      },
      onError: (evt, ws) => {
        console.error('WebSocket error:', evt);
      },
    };
  }),
);

// 广播客户端列表
function broadcastClientList() {
  const clientList = Array.from(clients.values()).map((client) => ({
    id: client.id,
    name: client.name,
  }));

  const message = JSON.stringify({
    type: 'client-list',
    clients: clientList,
  });

  for (const client of clients.values()) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  }
}

// 处理客户端断开连接
function handleDisconnect(clientId: string) {
  if (clients.has(clientId)) {
    clients.delete(clientId);
    broadcastClientList();
  }
}

// 获取客户端列表的HTTP接口
app.get('/clients', (c) => {
  const clientList = Array.from(clients.values()).map((client) => ({
    id: client.id,
    name: client.name,
    ip: client.ip,
    connected: client.connected,
    lastSeen: new Date(client.lastSeen).toISOString(),
    userAgent: client.userAgent,
  }));

  return c.json({
    clients: clientList,
    count: clientList.length,
  });
});

// 新增：获取特定客户端详细信息的接口
app.get('/clients/:id', (c) => {
  const clientId = c.req.param('id');
  const client = clients.get(clientId);

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

// ICE 服务器管理 API 路由
app.get('/api/ice-servers', getICEServers);
app.get('/api/ice-config', getConfig);
app.post('/api/ice-config', updateConfig);
app.post('/api/ice-servers/preset', addPresetServers);
app.get('/api/ice-servers/test', testICEServers);

// 特殊路由：为客户端提供 ICE 服务器配置
app.get('/api/webrtc-config', (c) => {
  const iceServers = iceServerManager.getICEServers();
  return c.json({
    iceServers,
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (c) => {
  return c.text('WebRTC File Transfer Signaling Server is running!');
});

const port = process.env.PORT || 3000;

// 启动服务器
const server = serve({
  fetch: app.fetch,
  port: Number(port),
  hostname: '0.0.0.0', // 可选：指定主机名
});

injectWebSocket(server);

// 直接输出启动信息
console.log(`🚀 Signaling server is running on http://localhost:${port}`);
console.log(`� WebSocket endpoint: wss://localhost:${port}/ws`);
console.log(`📡 Server accepting connections on all interfaces`);

// 如果需要处理服务器关闭
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});
