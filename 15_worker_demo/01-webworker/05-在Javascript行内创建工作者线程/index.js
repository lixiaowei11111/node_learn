// 创建要执行的 JavaScript 代码字符串
const workerScript = `
 self.onmessage = ({data}) => console.log(data);
`;
// 基于脚本字符串生成 Blob 对象
const workerScriptBlob = new Blob([workerScript]);
// 基于 Blob 实例创建对象 URL
const workerScriptBlobUrl = URL.createObjectURL(workerScriptBlob);
// 基于对象 URL 创建专用工作者线程
const worker = new Worker(workerScriptBlobUrl);
worker.postMessage("blob worker script");
// blob worker script

const worker = new Worker(
  URL.createObjectURL(
    new Blob([
      `self.onmessage =
({data}) => console.log(data);`,
    ])
  )
);
worker.postMessage("blob worker script");
// blob worker script

function fibonacci(n) {
  return n < 1 ? 0 : n <= 2 ? 1 : fibonacci(n - 1) + fibonacci(n - 2);
}
const workerScript = `
  self.postMessage(
  (${fibonacci.toString()})(9)
  );
 `;
const worker = new Worker(URL.createObjectURL(new Blob([workerScript])));
worker.onmessage = ({ data }) => console.log(data);
// 34
