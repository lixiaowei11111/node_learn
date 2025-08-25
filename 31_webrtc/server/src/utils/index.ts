import { type Context } from 'hono';

/**
 * 获取客户端真实IP地址
 */
export function getClientIP(c: Context): string {
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

/**
 * 生成客户端显示名称
 */
export function generateClientName(clientId: string, providedName?: string): string {
  return providedName || `Client-${clientId.substring(0, 8)}`;
}
