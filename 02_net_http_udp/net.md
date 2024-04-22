# NET

+ `node`中`net`模块的可以用于 `IPC`(进程之间通信),也可以用于 `TCP`作为 `client`或者`server`
+ `net`中的`createServer`用于创建服务端,`createConnection`(`create`的别名)或者`create` 创建客户端
+ `http`中的`createServer`同样用于创建服务端,但是`http`的客户端使用 `http.request`来创建
