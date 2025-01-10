# [Unix环境NodeJs下的Shebang(#!)](https://alexewerlof.medium.com/node-shebang-e1d4b02f731d)

## 1. 像运行二进制文件一样,运行js文件

+ 通常node运行一个js文件的方式

  ```bash
    node main.js
  ```

  需要node在后台运行,需要在命令行后添加`&`符号

  ```bash
    node main.js &
  ```

+ 如果需要像直接运行二进制文件一样运行这个脚本`./main.js`,就需要具有执行权限(类似于`chmod u+x yourfile.js`),并且设置了正确的 `shebang`时才可以

## 2. shabang和env


+ shebang or hashbang(#!)用于**文件的第一行**,用来告诉OS要使用哪个解释器(interpreter),类似于下面这样

  ```bash
  #!/absolute/path/to/the/interpreter [optional params]
  ```

+ shabang是OS的一个feature,通常用于执行解释型语言,node执行可以这样 `#!/usr/bin/node`,如果放在js文件的第一行,node的interpreter会作为注释忽略掉它
  一般情况下路径 /usr/bin/node 会安装好了一个node的二进制文件或者软链接(unix系统的symlink,类似于windows下的快捷方式),如果没有,OS则会报错`bad interpreter: No such file or directory script won't execute`
+ `#!node`是不会生效的,因为shabang要求绝对路径

+ 无论node安装在哪里都可以运行js脚本的方式`#!/usr/bin/env node`
  使用`env`命令(env相当于OS自带的程序),env基本上都会位于`/usr/bin/env`这个路径下面, 不使用受到安装路径限制的`#!/usr/bin/node`命令,而是使用`#!/usr/bin/env node`命令,告诉 `env`来运行`node`,然后`node`再执行脚本
+ node脚本最常见的shebang: `#!/usr/bin/env node`

## 3. env的一些其他参数(-S)

### 1. `env` 使用`-S`选项,**将参数传递给命令**

+ 例如运行当前文件时(`main.js`),需要给[node传递一个命令行参数](https://nodejs.org/docs/latest/api/cli.html)来启用ESM模块,可以使用以下shebang

  ```bash
    #!/usr/bin/env -S node --experimental-module
  ```

+ 使用node自带参数[`-r`或者`--require module`](https://nodejs.org/docs/latest/api/cli.html#-r---require-module),作用是在执行当前脚本时先预加载并执行其他的脚本
  
  ```bash
    #!/usr/bin/env -S node -r ./other.js
  ```

+ 或者开启 inspect,用于启用调试器和性能分析器。当在运行 Node.js 脚本时使用 --inspect，Node.js 会启动一个调试器服务器，允许调试器客户端连接到该服务器以进行调试。这使得你可以通过 Chrome 开发者工具或其他兼容的调试器客户端来检查代码、设置断点、分析性能等操作。

  ```bash
    #!/usr/bin/env -S node --inspect
  ```

+ 直接执行 `node main.js`这样执行时,node将不会尝试解析 shebang 中的参数，而是会忽略它。实际上，在这种情况下，shebang 中的参数是由内核利用来确定如何执行该文件的。也就是说，Node.js 不会直接使用 shebang 中的参数，而是由操作系统内核来解释并执行 shebang 中指定的解释器和参数。

### 2. 设置环境变量

  ```bash
    #!/usr/binenv -S NODE_ENV=production node
  ```

+ 使用`-i`或者`i`来从 `empty environment`执行 `#!/usr/binenv -S -i node`或者`#!/usr/binenv -S - node`

### 3. 指定NodeJs运行时的版本

  可以在js文件中使用`npx`和`#!/usr/bin/env`,如下`#!/usr/bin/env -S npx node@6`,这样做可以指定在运行脚本时使用特定版本的 Node.js。需要注意的是，这种方法在运行脚本时可能会尝试下载所请求的 Node 版本（如果 NPX 缓存中不存在该特定版本的 Node，则在没有互联网连接的情况下无法运行）。另外，你可以使用 process.version 来检查 Node.js 的版本。

## 4. 运行TS文件

+ 假设全局安装了TypeScript和ts-node（npm -i g typescript ts-node），可以将ts-node指定为解释器：`#!/usr/bin/env ts-node`

## 5.windows

在 Windows 上，shebang 行会被忽略掉，因为 Windows 不会使用它来执行脚本。如果你没有给脚本文件添加文件扩展名，Windows 会根据文件关联进行执行。例如，如果你的脚本是 JavaScript 文件，Windows 会使用默认关联的程序（比如 Node.js）来执行它。
