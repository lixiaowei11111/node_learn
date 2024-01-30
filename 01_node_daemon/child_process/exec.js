

const {exec} = require('child_process');
const iconv=require('iconv-lite');
const child=exec('dir',{ encoding: "gbk" },(error,stdout,stderr)=>{
   // stdout stdin stderr 对应的是cpp中的 std::cout std::cin std::cerr
  // 执行windows下的默认shell脚本时使用encoding:gbk 的解码配置无法生效,需要使用三方库iconv-lite来解析输出Buffer对象
  if(error){
    console.log(`执行出错：${error}`);
  }
  const stdoutString = iconv.decode(stdout, 'gbk');
  const  stderrString = iconv.decode(stderr, 'gbk');
  // 在 Windows 上，Node.js 的 child_process 模块中的 exec 方法并不支持直接更改输出的编码
  console.log(`stdout: ${stdoutString}`);
  console.log(`stderr: ${stderrString}`); // stderr是 运行shell脚本时返回的错误, error是当前程序运行时导致的错误
  /** 例如执行dir -l时shell脚本会输出标准错误流(stderr时),会打印输出 stderr: 找不到文件 */
  /** 执行dir时 stderr则不会输出 */
})

console.log(child,'child_process.exec的返回');