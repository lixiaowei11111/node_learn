const http = require("http");

const hostname = "127.0.0.1"; // 监听指定的端口
const port = 3000; // 监听指定的端口

// 创建 http服务实例
const server = http.createServer((req, res) => {
  res.statusCode = 200; // 设置响应状态码
  res.setHeader("Content-Type", "text/plain"); // 设置响应头的 Content-Type

  // 手动写一个原生的 get 或者 post
  const { method, url: path } = req;
  if (method === "GET" && path === "/api/admin") {
    // 1. GET请求， 路径为 /api/admin
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(`port=${port},method=GET,path=/api/admin`);
  } else if (method === "POST" && path === "/api/admin/login") {
    // 2. POST 请求 ，路径为 /api/admin/login
    let body = "";
    req.on("data", (chunk) => {
      body = body + chunk.toString();
    });
    req.on("end", () => {
      const user = JSON.parse(body);
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(`port=${port},method=GET,path=/api/admin/login,userName=${user}`);
    });
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end(`port=${port},NotFound`); // 返回响应数据
});

// 监听指定的地址和端口
server.listen(port, hostname, () => {
  console.log(`SERVER_01 running at http://${hostname}:${port}`);
});
