'strict';

const path = require('path');
const { name } = require('./package.json');

require('dotenv').config();

module.exports = {
  apps: [
    // ts-node 适配性和PM2不太好,需要安装ts-node适配器 package.json.script添加: "prestart": "pm2 install typescript"
    // {
    //   cwd: path.resolve(__dirname),
    //   name,
    //   script: './src/index.ts',
    //   interpreter: './node_modules/.bin/ts-node',
    //   watch: true,
    //   exec_mode: 'fork', //用cluster就会崩溃,感觉应该是端口问题
    //   instances: require('os').cpus().length - 1,
    //   autorestart: true,
    //   error_file: './logs/app-err.log',
    //   out_file: './logs/app-out.log',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss',
    // },
    // tsx 和PM2配合使用反而更快,问题也更少
    {
      cwd: path.resolve(__dirname),
      name,
      script: './src/index.ts',
      interpreter: 'node',
      interpreter_args: '--import tsx', //使用node custom hooks: https://nodejs.org/api/module.html#customization-hooks来处理ESM,node版本要求
      // 获取直接使用tsx,需要全局安装
      // interpreter: 'tsx',
      // interpreter: './node_modules/.bin/tsx',
      exec_mode: 'cluster',
      // exec_mode: 'fork',
      instances: 2,
      watch: true,
      autorestart: true,
      error_file: './logs/app-err.log',
      out_file: './logs/app-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
