const worker = new Worker("./globalScopeWorker.js");
console.log("create Worker:", worker);

// 先打印 main.js , 在打印专用工作者线程里面的东西
// create Worker: Worker   || main.js
/** inside worker: DedicatedWorkerGlobalScope 
  {name: '', onmessage: null, onmessageerror: null, cancelAnimationFrame: ƒ, close: ƒ, …} 
  || gobalScopeWorker.js */
