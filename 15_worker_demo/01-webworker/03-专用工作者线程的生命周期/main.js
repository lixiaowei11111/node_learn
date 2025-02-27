/**
 * @description 1.  worker 实例 通过postMessage 向 工作者线程 通信传参
 */
// const worker = new Worker("./initializingWorker.js");
// // Worker 可能仍处于初始化状态
// // 但 postMessage()数据可以正常处理
// worker.postMessage("1");
// worker.postMessage("2");
// worker.postMessage("3");
// //1
// //2
// //3

// /**
//  * @description 2. 自我终止(self.close())工作者线程 通过 self上的postMessage 向 worker 实例传参
//  */

// const worker = new Worker("./closeWorker.js");
// console.log(worker);
// worker.onmessage = ({ data }) => console.log(data);
// //1
// //2

/**
 * @description 3. 外部终止(worker.terminate())worker 实例 通过postMessage 向 工作者线程 通信传参
 */

const terminateWorker = new Worker("./03-terminateWorker.js");

setTimeout(() => {
  terminateWorker.postMessage("1");
  terminateWorker.terminate();
  terminateWorker.postMessage("2");
  setTimeout(() => terminateWorker.postMessage("3"), 0);
}, 1000);
//1
