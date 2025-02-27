const factorialWorker = new Worker("./factorialWorker.js");

factorialWorker.onmessage = ({ data }) => console.log(data);
factorialWorker.postMessage(5);
factorialWorker.postMessage(7);
factorialWorker.postMessage(10);

// 5!=120
// 7!=5040
// 10!=3628800
