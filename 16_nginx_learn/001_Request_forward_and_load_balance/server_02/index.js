/**
 * node 原生 创建 http实例的写法
 * 
 * const http = require("http");

 * const hostname = "127.0.0.1"; // 监听指定的端口
 * const port = 6666; // 监听指定的端口

 * // 创建 http服务实例
 * const server = http.createServer((req, res) => {
 * res.statusCode = 200; // 设置响应状态码
 * res.setHeader("Content-Type", "text/plain"); // 设置响应头的 Content-Type
 * res.end("port=6666"); // 返回响应数据
 * });

 * // 监听指定的地址和端口
 * server.listen(port, hostname, () => {
 *   console.log(`SERVER_01 running at http://${hostname}:${port}`);
 * });
 */

const express = require("express");
const app = express();
const port = 6666;

app.get("/admin", (req, res) => {
  res.send("admin port=6666");
});

app.post("/admin/login", (req, res) => {
  console.log(req.hostname,'req.hostname');// 测试nginx 转发后的host是否生效
  const userName = req.body;
  console.log(userName, "userName");
  res.send("port=6666 admin/login");
});

app.listen(port, () => {
  console.log("App listening at http://localhost:6666");
});
