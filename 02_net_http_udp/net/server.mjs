import net from 'net'
// net上的createServer方法基本和http模块一样,
const server=net.createServer((socket)=>{
  socket.on('data',data=>{
    console.log("server saved", data.toString());
  })
  socket.write("hello this is a tcp server by nodejs net createServer");
})

server.listen(8080,()=>{
  console.log("tcp server is running at port 8080");
})