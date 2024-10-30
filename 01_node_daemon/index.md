# `node`实现一个守护进程

## 1. [node的command line options](https://nodejs.org/dist/latest-v18.x/docs/api/cli.html#--trace-warnings)和环境变量

+ `--trace-warnings` 打印进程警告的堆栈跟踪（包括弃用）;
+ 后台执行`node`程序,执行 `node listen.js &`  加上一个 `&` 即可实现`node`的后台运行;打印日志需要写入日志文件中来读取

> 在类Unix系统中,可以使用`nohup`命令或者`&`符号来实现后台运行,`nohup`命令可以让程序在关闭终端后继续运行,`&`符号则标识将程序放到后台运行

+ 实现监听文件改变自动重启进程的两个主要方法 `child_process`启动`node`进程 和 `fs.watch`来监听启动`node`进程的js文件
  + fs.watch 的监听是 调度操作系统上暴露的文件系统的接口, 如linux上的inotify来 监听文件的修改删除等操作
  + node下的 childr_process , cluster,worker_thread
  + node下的process
  + node下的file system模块

## 2. `process`

1. `process.env`
`process.env`读取的是操作系统上的环境变量(其实可以理解为windows上的操作系统- 系统环境变量设置里面的`PATH`的`JAVA_HOME`等相关键值对,``)
`process.env.NODE_ENV`实际不是`node`特殊处理了,而是需要先设置环境变量才能读取到,
所以一般看到的是这样的,本质上是先执行设置系统环境变量语句,再执行node脚本的操作语句 `cross-env NODE_ENV=production node --trace-warnings ./build/build.js`

2. `cross-env`
  但是设置环境变量时,不同shell的语法规则不一样,需要使用`cross-env`这样的工具来抹平不同操作系统或者不同[`shell`](https://www.runoob.com/linux/linux-shell.html)差异,
  如在windows操作系统上使用cmd需要加上set才会生效, `set NODE_ENV=production`,使用具有跨平台性质的`bash`设置环境 `NODE_ENV=production`即可

## 3. child_process

1. exec:
  执行 shell 命令
  创建新的 shell 进程
  获取命令的输出和错误信息

2. execFile:
  执行指定的可执行文件
  不通过 shell 执行命令
  获取命令的输出和错误信息

3. fork:
  衍生新的 Node.js 子进程
  执行 JavaScript 文件
  支持父子进程间通过消息进行通信

4. spawn:
  执行命令
  不创建 shell 进程
  支持流式处理输入输出

5. 参数和返回
   + exec参数:child_process.exec(command\[, options]\[, callback])
   + execFile参数: child_process.execFile(file\[, args]\[, options]\[, callback])
   + fork参数: child_process.fork(modulePath\[, args]\[, options])
   + spawn参数: child_process.spawn(command\[, args]\[, options])
   + 这些函数都会返回一个[ChildProcess实例](https://nodejs.org/dist/latest-v18.x/docs/api/child_process.html#class-childprocess),可以用于监听事件以及使用kill等方法
