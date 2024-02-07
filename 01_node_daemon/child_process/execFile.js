

const {execFile} = require('child_process');
const child=execFile('node',['--version'],(error,stdout,stderr)=>{
  if(error){
    console.log(`执行出错：${error}`);
  }
  console.log(`stdout: ${stdout}`);// stdout: v14.21.2
  console.log(`stderr: ${stderr}`); //  stderr:
})
console.log();