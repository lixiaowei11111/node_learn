// 适用场景：并行执行 JavaScript 文件，父子进程间通过消息通信。
const { fork } = require('child_process');
const path = require('path');
const child = fork(path.join(__dirname,'./forkChild.js'));

child.on('message', message => {
  console.log(`Parent received message: ${message}`);
});

child.send('Hello from parent!');// send方法触发其对应fork进程的message事件