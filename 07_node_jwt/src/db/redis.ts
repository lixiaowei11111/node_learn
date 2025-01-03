import { config } from 'dotenv';
import { createClient } from 'redis';
import { resolve } from '../util/index';

config({ path: [resolve('.env')] });
const client = createClient({
  url: process.env.REDIS_URL,
});

type RedisType = typeof client;

export const setup = async (client: RedisType) => {
  try {
    client.once('connect', () => {
      console.log('Connected to Redis');
    });
    client.on('error', (err) => {
      console.log('Redis Client Error', err);
      throw err;
    });
    await client.connect();
  } catch (error) {
    throw error;
  }
};

export default client;
