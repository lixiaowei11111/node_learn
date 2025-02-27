import path from "path";
import fs from "fs"
import * as readline from "readline"

console.log( '\x1b[31mError: Something went wrong!\x1b[0m' );
console.log( "aa" );

console.log( process.cwd(), "process.cwd()" );
const cwd = process.cwd()
const argv = process.argv.slice( 2 );
const projetName = argv[ 0 ] || "defaultDir/app"

const targetDir = path.join( cwd, projetName )

console.log( targetDir, "targetDir" );
if ( fs.existsSync( targetDir ) ) {
  const rl = readline.createInterface( {
    input: process.stdin,
    output: process.stdout,
  } )
  rl.question( "\x1b[34m The current directory already exists. Do you want to delete and continue?\x1b[0m", answers => {
    console.log( "answer", answers );
    rl.close();
  } )
} else {
  // fs.mkdirSync(targetDir)// node xxx.js myapp/app
  // 当终端启动时,使用 node __test__/xxx.js myapp/app,多级目录时,mkdirSync不添加rescursive:true(默认值为false),就会创建失败,抛出错误
  fs.mkdirSync( targetDir, { recursive: true } )// node xxx.js myapp/app 会创建多级目录 myapp下创建app
}

console.log( process.env.npm_config_user_agent );

export default fs;