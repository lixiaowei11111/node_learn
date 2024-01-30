exec:

执行 shell 命令
创建新的 shell 进程
获取命令的输出和错误信息

execFile:

执行指定的可执行文件
不通过 shell 执行命令
获取命令的输出和错误信息

fork:

衍生新的 Node.js 子进程
执行 JavaScript 文件
支持父子进程间通过消息进行通信

spawn:

执行命令
不创建 shell 进程
支持流式处理输入输出

exec参数:child_process.exec(command[, options][, callback])
execFile参数: child_process.execFile(file[, args][, options][, callback])
fork参数: child_process.fork(modulePath[, args][, options])
spawn参数: child_process.spawn(command[, args][, options])
这些函数都会返回一个[ChildProcess实例](https://nodejs.org/dist/latest-v18.x/docs/api/child_process.html#class-childprocess),可以用于监听事件以及使用kill等方法