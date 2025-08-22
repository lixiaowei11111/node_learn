import { serve } from '@hono/node-server';
import { createNodeWebSocket } from '@hono/node-ws';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

interface Client {
  id: string;
  name: string;
  ws: WebSocket;
  connected: boolean;
  lastSeen: number;
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

// WebSocket升级
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

// WebSocket连接处理
app.get(
  '/ws',
  upgradeWebSocket((c) => {
    return {
      onOpen: (evt, ws) => {
        console.log('Client connected');
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
              };
              clients.set(clientId, client);

              // 发送注册成功消息
              ws.send(
                JSON.stringify({
                  type: 'registered',
                  clientId: clientId,
                  name: client.name,
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
  }));

  return c.json({
    clients: clientList,
    count: clientList.length,
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
