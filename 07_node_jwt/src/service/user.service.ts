import client from '../db/redis';

export const createSession = async (username: string) => {
  try {
    const value = await client.incr('sessionId');
    const key = `session:${username}`;
    await client.set(key, value);
    client.expire(key, 60 * 1000);
  } catch (error) {
    console.log('[debug] error', error);
  }
};

export const querySession = async (username: string) => {
  try {
    const key = `session:${username}`;
    const sessionId = await client.get(key);
    return sessionId;
  } catch (error) {
    console.log('[debug] error', error);
  }
};
