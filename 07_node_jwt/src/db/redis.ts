import { config } from 'dotenv';
import { createClient } from 'redis';
import { resolve } from '../util/index';
import logger from '../logger';

config({ path: [resolve('.env')] });
const client = createClient({
  url: process.env.REDIS_URL,
});

client.on('error', (err) => {
  console.log('Redis Client Error', err);
  logger.error(err);
});

export type RedisType = typeof client;

export const setup = async (client: RedisType): Promise<RedisType> => {
  try {
    if (client.isOpen) {
      return client;
    }
    await client.connect();
    await client.ping();
    console.log('[debug] connected redis');
    return client;
  } catch (error) {
    logger.error(error);
    process.exit();
  }
};

export default client;
