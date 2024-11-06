import process from "node:process";

const asyncFunc=()=>{
  return new Promise((resolve,reject)=>{
    setTimeout(()=>{
      console.log('[debug] timeout')
    },2000)
    resolve(null)
  })
}


process.on('exit',async ()=>{
  console.log('[debug] exiting')
  await asyncFunc()
})

process.exitCode=2;

process.exit(1)