`ts-node`: `node`的`TypeScript`支持;
`@types/express`: `express`的 `TypeScript`支持;

`node`环境下的`ORM`框架对比选型

1. `typeorm` 
   1. support TypeScript;
   2. github start :32k;fork 6k;commits:5283;issue:2087 open,5604 cloesd;
2. `Prisma`
   1. support TypeScript;
   2. github start :34k;fork 1.3k;commits:9772;issue:2779 open,6333 cloesd;
3. `Sequelize`
   1. supprot TypeScript;
   2. github start :28.4k;fork 4.2k;commits:10324;issue:793 open,9361 cloesd;


`tsconfig-paths`
+ `ts-node`[不支持识别路径alias](https://juejin.cn/post/6963800542615175182),需要配合`tsconfig-paths`来解决该问题