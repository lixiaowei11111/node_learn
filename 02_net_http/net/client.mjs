import net from 'net'

const client=net.createConnection({port:8080},()=>{
  console.log("client connected");
  client.write("hello this is a tcp client by nodejs net createConnection");
})
client.on('data',(data)=>{
  console.log("client received", data.toString());
  client.end();
})

client.on('end',()=>{
  console.log("client disconnected");
})