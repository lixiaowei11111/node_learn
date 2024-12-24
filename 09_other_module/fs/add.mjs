import { symlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );
//增
// 1. symmlink
const symlink = () => {
  symlinkSync( './index.mjs', '../softlink.js', 'junction' )
}

// 2. copy
import fsPromise, { constants } from "node:fs/promises";
/**
fs.constants.COPYFILE_EXCL：如果目标已经存在，则复制操作将失败。

fs.constants.COPYFILE_FICLONE：复制操作将尝试创建写时复制引用链接。如果平台不支持写时复制，则会使用备用复制机制。

fs.constants.COPYFILE_FICLONE_FORCE：复制操作将尝试创建写时复制引用链接。如果平台不支持写时复制，则操作将失败。
*/

const copyFile = async () => {
  await fsPromise.copyFile( "../fs.md", "../fs copy.md", constants.COPYFILE_EXCL )
  await fsPromise.copyFile( "../fs.md", "../fs copy.md", constants.COPYFILE_EXCL )// 第二次会报错,因为dest已经存在
}

// await copyFile()

const cp = async () => {
  await fsPromise.cp( "./de", './de recursive copy ', {
    recursive: true
  } )
  await fsPromise.cp( "./de", './de copy ' )// 报错SystemError [ERR_FS_EISDIR]: Path is a directory: cp returned EISDIR ,如果文件夹里面有文件夹需要开启递归
}

// await cp()

// 3. create
import { Buffer } from "node:buffer";
const create = async () => {
  await fsPromise.writeFile( "./xxx.js", new Uint16Array( Buffer.from( "console.log(\"hello world\")" ) ) )
  const projectFolder = new URL( './test/project/', import.meta.url );
  await fsPromise.mkdir( projectFolder, { recursive: true } )
}

await create();