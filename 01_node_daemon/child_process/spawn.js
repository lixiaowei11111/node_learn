'use strict'

const {spawn} = require('child_process');
const child=spawn('node',['--version'])
child.stdout.on('data',(data)=>{
  console.log(`stdout: ${data}`);
});