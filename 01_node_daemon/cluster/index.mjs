import cluster from 'node:cluster';
import http from 'node:http';
import { availableParallelism } from 'node:os';
import process from 'node:process';

const numCPUS = availableParallelism();

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // 根据cpu核心fork对应数量的subprocess
  for (let i = 0; i < numCPUS; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  http
    .createServer((req, res) => {
      res.writeHead(200);
      res.end(`${process.pid} is worker process: ${cluster.isPrimary} \n`);
    })
    .listen(14514);
  console.log(`Worker ${process.pid} started`);
}
