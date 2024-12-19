import process from 'node:process';

const asyncFunc = () => {
  return new Promise((resolve, _reject) => {
    setTimeout(() => {
      console.log('[debug] timeout');
    }, 2000);
    resolve(null);
  });
};

process.on('exit', async () => {
  // 'exit' 事件只能执行同步函数
  console.log('[debug] exiting');
  await asyncFunc();
});

process.exitCode = 2;

process.exit(1);
