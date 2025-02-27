import path from "path";
import { fileURLToPath } from "url";

console.log(import.meta.url);// file:///E:/Code/lxw-cli/__test__/path__test__.js

console.log(path.relative('C:\\orandea\\test\\aaa', 'C:\\orandea\\impl\\bbb'));// ..\..\impl\bbb

console.log(path.basename(path.resolve())) //lxw-cli

const fileURL=import.meta.url;

console.log(fileURL)// file:///E:/Code/js/lxw-cli/__test__/path__test__.js
console.log(fileURLToPath(fileURL))
// E:\Code\js\lxw-cli\__test__\path__test__.js
// fileURLToPath 将文件URL 转为路径
console.log(path.resolve(fileURL,"../","template/react"))
// E:\Code\js\lxw-cli\file:\E:\Code\js\lxw-cli\react