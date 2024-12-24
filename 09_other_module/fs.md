## fs模块


### 1. 创建文件

#### 前置知识

+ 在讲解软/硬链接之前，先了解一个 linux 系统中重要的概念 inode 。众所周知，文件存储在硬盘上，硬盘的最小存储单位叫做 “扇区”（ Sector,每个扇区存储 512 字节）.操作系统读取硬盘的时候，不会一个个扇区地读取，因为这样效率太低，而是一次性连续读取多个扇区,这种一次性读取的连续多个扇区就是"块"( block )。这种由多个扇区组成的"块"，是文件存取的最小单位。"块"的大小，最常见的是 4KB，即连续八个 sector 组成一个 block。 

+ 文件数据都储存在 "块" 中，那么很显然，我们还必须找到一个地方储存文件的元信息，比如文件的创建者、文件的创建日期、文件的大小等等。这种储存文件元信息的区域就叫做 inode ，中文译名为 "索引节点"。

>https://luzhaoyang.com/zh/posts/node.js-ru-he-chuang-jian-ruan-lian-jie-yu-ying-lian-jie-you-shi-me-qu-bie-.html

+ 软链接/符号链接


+ 硬链接

#### 生成符号链接
+ fsPromises.symlink(target, path[, type])
+ fs.symlink(target, path[, type], callback)
+ fs.symlinkSync(target, path[, type])

+ type: "dir" | "file" | "junction" | null
+ junction只能对文件夹使用,并自动将target和path标准化为 absolute oath

+ 注意: 在windows中生成软链接时,需要使用绝对路径,不能生成的软链接文件可能会找不到原文件所在位置
```mjs
import { symlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(function () {
  const targetPath = resolve(__dirname, './server.js');
  const linkPath = resolve(__dirname, '../softlink.js');
  symlinkSync(targetPath, linkPath, 'file');
})();
```

### 2. 复制文件/文件夹

#### 1. 复制文件
