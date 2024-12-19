'strict';

const path = require('path');

require('dotenv').config();

module.exports = {
  apps: [
    {
      cwd: path.resolve(__dirname),
      name: require('./package.json').name,
      script: './src/index.ts',
      interpreter: './node_modules/.bin/ts-node',
      watch: true,
      exec_mode: 'fork', //用cluster就会崩溃,感觉应该是端口问题
      instances: require('os').cpus().length,
      autorestart: true,
    },
  ],
};
