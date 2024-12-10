import { name } from './package.json';
import path from 'path';

export default {
  apps: [
    {
      name,
      script: path.resolve(__dirname, './dist/index.js'),
      instances: require('os').cpus().length,
      autorestart: true,
      watch: true,
      env_production: {
        NODE_ENV: 'production',
        PORT: 9999,
      },
    },
  ],
};