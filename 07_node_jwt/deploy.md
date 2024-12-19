1. 如何不编译直接使用PM2部署启动TS项目

+ 配合PM2的配置文件`ecosystem.config.js`中的[`interpreter`](https://pm2.keymetrics.io/docs/usage/application-declaration/)属性指定编译器
> 使用`PM2`的`Configuration File`配置文件时,需要更改`script`命令来指定`ecosystem.config.js`文件的路
>   `"start": "pm2 start ecosystem.config.js --env production"`,
>   `"stop": "pm2 stop ecosystem.config.ts"`
> 使用`PM2`的`Configuration File`不能为`ts`或者`mjs`文件,即不支持`ts`和`ESM`

+ 使用tsc构建js文件时的的ecosystem.config.js配置
```cjs
'strict';
const { resolve } = require('path');
const { name } = require('./package.json');

module.exports = {
  apps: [
    {
      name,
      script: resolve(__dirname, './dist/index.js'),
      instances: require('os').cpus().length,
      autorestart: true,
      watch: true,
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

+ 直接使用ts-node启动的ecosystem.config.js需要指定解释器即interpreter的路径
```cjs
'strict';
const { resolve } = require('path');
const { name } = require('./package.json');

module.exports = {
  apps: [
    {
      name,
      script: './src/index.ts',
      interpreter: './node_modules/.bin/ts-node',
      instances: require('os').cpus().length,
      autorestart: true,
      watch: true,
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```