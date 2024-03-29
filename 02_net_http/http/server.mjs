import http2 from 'node:http2'
const server=http2.createServer()

server.on('stream',(stream,head)=>{
  stream.respond({
    'content-type':"text/html;charset=utf-8",
    ":status":200,
  });
  stream.end("<h1>hello world</h1>");
})

server.listen(8000,()=>{
  console.log("http2 server is running at http://localhost:8000");
})