// listen.js
const fs = require('fs');
const exec = require('child_process').exec;

console.log(process.argv,'process.argv');
function watch () {
	const child = exec('node server.js');
	let watcher = fs.watch('./server.js', (event) => {
    console.log(`监听到server.js文件改变了`);
    fs.appendFile('log.txt', 'server.js 文件发生了改变\n'+event, (err) => {
      if (err) throw err;
      console.log('变化已写入日志文件');
    });
		child.kill();
		watcher.close();
		watch();
	});
}

//实现监听文件改变自动重启进程的两个主要方法 child_process 和 fs.watch
watch();
// 执行 node listen.js &  加上一个 & 即可实现node的后台运行
// fs.watch 的监听是 调度操作系统上暴露的文件系统的接口, 如linux上的inotify来 监听文件的修改删除等操作
// node下的 childr_process , cluster,worker_thread
// node下的process