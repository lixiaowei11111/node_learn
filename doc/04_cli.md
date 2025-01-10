# [参考Vite写一个快速生成webpack+react+ts项目的cli](https://github.dev/vitejs/vite)
[原作者zhi-cli](https://terwergreen.com/post/use-typescript-to-develop-a-custom-nodejs-frontend-development-scaffold-1i5fne.html#commander-%E5%A4%84%E7%90%86%E5%91%BD%E4%BB%A4)


# `path`
+ [`relative`](https://nodejs.org/dist/latest-v18.x/docs/api/path.html#pathrelativefrom-to)
  + path.relative() 方法返回基于当前工作目录从 from 到 to 的相对路径。如果 from 和 to 每个解析为相同的路径（在每个路径上调用 path.resolve() 后），则返回零长度字符串。如果将零长度字符串作为 from 或 to 传递，则使用当前工作目录代替零长度字符串。
  ```js
  //POSIX(IEEE定义的一系列标准)
    path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb');
    // Returns: '../../impl/bbb'
  //windows
    path.relative('C:\\orandea\\test\\aaa', 'C:\\orandea\\impl\\bbb');
    // Returns: '..\\..\\impl\\bbb'
  ```

# `child_process`
+ `spawn`
  + [node 中 使用 `child_process`的 `spawn`来创建一个子进程](https://nodejs.org/dist/latest-v18.x/docs/api/child_process.html#child_processspawncommand-args-options)
  + `git-clone` 使用spawn 方法来拉起git process 进程发起git clone 命令
  + 通常使用 [`cross_spawn`]()来替代node上的spawn命令
  ```lua
    cross_spawn 是一个用于在 Node.js 中替代 child_process.spawn() 的工具。它的目的是解决在不同操作系统上使用 spawn() 时可能出现的一些兼容性问题。
    child_process.spawn() 在 Windows 和 POSIX 系统上的行为略有不同。特别是在 Windows 上，spawn() 使用了不同的命令解析规则，可能导致在某些情况下出现问题。cross_spawn 通过在不同平台上使用正确的命令解析规则来解决这些问题，确保在不同操作系统上的一致性。

    使用 cross_spawn 的好处包括：
    跨平台兼容性：cross_spawn 可以在不同操作系统上产生一致的结果，无需手动处理平台差异。
    命令解析一致性：cross_spawn 在 Windows 上使用与 POSIX 系统相同的命令解析规则，避免了由于差异而引起的问题。
    更好的错误处理：cross_spawn 提供了更好的错误处理机制，可以更准确地捕获和处理与子进程相关的错误。
    综上所述，使用 cross_spawn 可以提供更可靠和一致的子进程管理，尤其是在涉及跨平台开发时。
  ```

# `process`
+ `cwd`
  + 返回Nodejs 进程的当前工作目录(current working directory of the Node.js process.)

+ `env`
  + process.env属性返回一个包含用户环境的对象。如windows环境中配置`java`环境变量，可以通过`set`来设置临时环境变量
  + 返回样例：
  ```json
  {
    TERM: 'xterm-256color',
    SHELL: '/usr/local/bin/bash',
    USER: 'maciej',
    PATH: '~/.bin/:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin',
    PWD: '/Users/maciej',
    EDITOR: 'vim',
    SHLVL: '1',
    HOME: '/Users/maciej',
    LOGNAME: 'maciej',
    _: '/usr/local/bin/node'
  } 
  ```
  + `process.env` 同时也可以用来获取启动node脚本时的自定义变量,如`process.env.NODE_ENV`,和`process.argv`有相同效果,不过前者获取的是属性,后者获取的更加完整且为一个数组

+ [`argv`](https://nodejs.org/dist/latest-v18.x/docs/api/process.html#processargv)
  + 
  ```plaintext
  process.argv 属性返回一个数组，其中包含在启动 Node.js 进程时传递的命令行参数。第一个元素将是 process.execPath。如果需要访问 argv[0] 的原始值，则请参阅 process.argv0。第二个元素将是正在执行的 JavaScript 文件的路径。其余元素将是任何其他命令行参数。
  ```
  + **process.argv.slice(2) 可用于获取node启动时的命令行参数**,`minimist`是一个轻量级的命令行参数解析工具，可以将命令行参数解析成一个JavaScript对象。
  + `process-args.js`
    ```js
    import { argv } from 'node:process';

    // print process.argv
    argv.forEach((val, index) => {
      console.log(`${index}: ${val}`);
    });
    ```
    `Launching the Node.js process as:`\
    ```bash
    $ node process-args.js one two=three four
    ```
    `Would generate the output:`
    ```sh
      0: /usr/local/bin/node
      1: /Users/mjr/work/node/process-args.js
      2: one
      3: two=three
      4: four
    ```

+ [`process.stdin`](https://nodejs.org/dist/latest-v18.x/docs/api/process.html#processstdin)
  + node 中的标准输入流, 相当于cpp中的 `cin`,

+ [`process.stdout`](https://nodejs.org/dist/latest-v18.x/docs/api/process.html#processstdout)
  + node中的标准输出流,相当于cpp中的`cout`
  + node 中 `console.log`和`process.stdout`的关系
    + 首先，console.log() 实际上是对 process.stdout.write() 方法的封装。当我们调用 console.log() 方法时，实际上是将数据写入 process.stdout 流中，然后添加一个换行符 \n 并刷新输出缓冲区。因此，console.log() 方法只是在 process.stdout.write() 方法的基础上添加了一些便捷功能，例如自动添加换行符等。
    ```js
    console.log = function (d) {
      process.stdout.write(d + '\n');
    };
    ```
    其次，process.stdout 可以用于与其他 Node.js 模块一起使用，例如 fs 模块和 child_process 模块，以便将数据写入文件或者其他流中。
  + [使用ANIS转义码,来输出有颜色的字符串](https://learnku.com/articles/26231)
    + 在 Node.js 中，可以使用 \x1b 或 \u001b 转义符来表示 ANSI 转义码。然后，可以使用其他字符来表示不同的 ANSI 命令，例如设置文本颜色、背景颜色等。
      以下是一些常用的 ANSI 转义码命令：
      \x1b[0m 或 \u001b[0m：重置所有属性，即恢复到默认值。
      \x1b[1m 或 \u001b[1m：加粗或者高亮。
      \x1b[2m 或 \u001b[2m：变暗（不是所有终端都支持）。
      \x1b[3m 或 \u001b[3m：斜体（不是所有终端都支持）。
      \x1b[4m 或 \u001b[4m：下划线。
      \x1b[30m - \x1b[37m 或 \u001b[30m - \u001b[37m：设置文本颜色。
      \x1b[40m - \x1b[47m 或 \u001b[40m - \u001b[47m：设置背景颜色。
      例如，以下示例代码可以输出一条红色的错误消息：
        ```js
        console.log('\x1b[31mError: Something went wrong!\x1b[0m');
        // 末尾使用 \x1b[0m 结尾,防止污染其他区域
        ```
      使用 ANSI 转义码 \x1b[31m 将消息设置为红色，然后使用 \x1b[0m 将文本颜色恢复为默认值。最后，我们使用 console.log() 输出消息。
      需要注意的是，不同的终端对 ANSI 转义码的支持程度可能不同，因此在编写带有颜色的命令行程序时，需要考虑兼容性问题。
    + ANSI 和 ASCII 是两个不同的概念。
      ASCII（American Standard Code for Information Interchange）是一种字符编码，用于将字符映射到数字值。ASCII 字符集包含 128 个字符，包括英文字母、数字、标点符号和控制字符等，每个字符都用一个 7 位的二进制数值表示。
      ANSI（American National Standards Institute）是美国国家标准化组织，主要负责制定和推广各种标准。在计算机领域，ANSI 制定了多个标准，例如 ANSI C 标准、ANSI SQL 标准等。
      在计算机领域中，ANSI 经常与控制字符序列（Control Sequence）一起使用。控制字符序列是一组特殊的字符序列，用于向终端发送控制命令，例如设置文本颜色、背景颜色、光标位置等。在 ANSI 控制字符序列中，通常使用 ASCII 字符集中的字符来表示命令和参数。
      需要注意的是，ANSI 控制字符序列和 ASCII 字符编码是两个不同的概念，虽然它们使用了相同的字符集。在 ANSI 控制字符序列中，使用的字符通常是 ASCII 字符集中的控制字符，例如 ESC（Escape）、BEL（Bell）、CR（Carriage Return）、LF（Line Feed）等。
      总之，ASCII 是一种字符编码，用于将字符映射到数字值；而 ANSI 是一个标准化组织，制定了多个标准，其中包括使用 ASCII 控制字符的控制字符序列标准。
# `fs`
+ [`existsSync(path)`](https://nodejs.org/dist/latest-v18.x/docs/api/fs.html#fsexistssyncpath)
  + 如果路径存在，则返回true，否则返回false。有关此API的异步版本的详细信息，请参见文档：fs.exists()。fs.exists()已弃用，但fs.existsSync()未被弃用。
    fs.exists()的回调参数接受与其他Node.js回调不一致的参数。fs.existsSync()不使用回调。
+ [`mkdirSync(path[,options])`](https://nodejs.org/dist/latest-v18.x/docs/api/fs.html#fsmkdirsyncpath-options)
  + 同步创建目录。返回undefined，或者如果recursive为true，则返回第一个创建的目录路径。这是fs.mkdir()的同步版本。
  ```mjs
   fs.mkdirSync(root, { recursive: true })
  ```
  fs.mkdirSync(root, { recursive: true }) 这行代码的作用是在文件系统中创建一个目录。其中，root 是要创建的目录的路径，recursive 是一个可选的参数，用于指定是否要递归地创建目录。当recursive 参数为 false 时，如果要创建的目录的父级目录不存在，会抛出一个错误；当 recursive 参数为 true 时，如果要创建的目录的父级目录不存在，会自动递归地创建它们。在这行代码中，recursive: true 表示要递归地创建目录，即如果要创建的目录的父级目录不存在，会自动递归地创建它们。这样可以确保在创建目录时不会因为父级目录不存在而抛出错误。
+ [`statSync(path)`](https://nodejs.org/dist/latest-v18.x/docs/api/fs.html#class-fsstats)
  + fs.statSync 是 Node.js 文件系统模块 (fs) 中的一个同步方法，用于获取指定路径的文件或目录的状态信息。它的作用是返回一个包含文件或目录状态信息的对象，包括文件大小、创建时间、修改时间等信息。
    + fs.Stats 对象包含了以下属性：
      stats.isFile()：如果是文件则返回 true，否则返回 false。
      stats.isDirectory()：如果是目录则返回 true，否则返回 false。
      stats.isSymbolicLink()：如果是符号链接则返回 true，否则返回 false。
      stats.size：文件大小（字节数）。
      stats.mode：文件或目录的权限和类型信息。
      stats.mtime：文件或目录的修改时间。
      stats.ctime：文件或目录的创建时间。
      stats.atime：文件或目录的访问时间。
+ [`copyFileSync(src,dest[,flag])`](https://nodejs.org/dist/latest-v18.x/docs/api/fs.html#fscopyfilesyncsrc-dest-mode)
  + 将一个文件从源路径复制到目标路径,其中，srcPath 是源文件的路径，destPath 是目标文件的路径，flags 是可选参数，用于指定文件复制时的行为。如果目标路径中的目录不存在，则会抛出一个错误。
+ [`readdirSync(path,[, options])`](https://nodejs.org/dist/latest-v18.x/docs/api/fs.html#fsreaddirsyncpath-options)
  + 读取目标目录下的目录和文件信息
# npm
+ bin 全局命令,需要 npm link来注册到 `node_modules`下的`.bin`文件夹中,**可以在nodejs的安装目录下找到lxw-cli的shell脚本文件**
  + npm link 和 package.json 中 bin 命令之间没有直接的关系，但它们都与模块的可执行脚本相关。
    npm link 命令用于将一个本地模块链接到全局 node_modules 目录中，使得本地模块可以像全局模块一样被其他项目引用。在本地模块中，如果在 package.json 的 bin 属性中定义了可执行脚本，则在全局 node_modules/.bin 目录下也会创建一个符号链接，指向本地模块的可执行脚本。因此，在其他项目中引用本地模块时，可以直接通过 npm run <script_name> 命令来执行 node_modules/.bin 目录下的脚本。
    package.json 中的 bin 属性定义了模块的可执行脚本，它们可以通过 npm run <script_name> 命令来执行。在本地模块中，如果在 package.json 的 bin 属性中定义了可执行脚本，则在执行 npm link 命令时，npm 会在全局 node_modules/.bin 目录下创建一个符号链接，指向本地模块的可执行脚本。这样，在其他项目中引用本地模块时，可以直接通过 npm run <script_name> 命令来执行本地模块的可执行脚本。
    因此，npm link 和 package.json 中 bin 命令之间没有直接的关系，但它们都与模块的可执行脚本相关，可以通过 npm run <script_name> 命令来执行。
+ npm init xxx, npm exec xxx, 和 npx xxx command 是 npm 包管理器中的三种不同命令，它们的作用和使用方式略有不同：
  + npm init xxx 命令用于在当前目录下创建一个新的 Node.js 模块，并生成一个 package.json 文件。 xxx 是一个可选的初始化器，可以是已经存在的模板名称或者是自定义的初始化器名称。通过 npm init xxx 命令，可以快速创建一个新的 Node.js 项目，并自动初始化 package.json 文件。
  + npm exec xxx 命令用于在当前项目环境中执行指定的命令。它会在当前项目的 node_modules/.bin 目录中查找要执行的命令，并在当前项目环境下运行它。这个命令的主要作用是在项目开发过程中，方便地执行项目中安装的命令行工具。
  + npx xxx command 命令可以在不安装全局依赖的情况下，直接运行安装在项目本地 node_modules 目录中的指定命令。它会在当前项目的 node_modules/.bin 目录中查找要执行的命令，并在当前项目环境下运行它。这个命令的主要作用是在需要临时执行某些命令时使用，例如在升级项目依赖项时使用 npx npm-check-updates -u 命令。
  + 因此，这三个命令的区别在于它们的作用和使用方式。npm init xxx 用于初始化一个新项目，npm exec xxx 用于执行项目中安装的命令行工具，npx xxx command 用于在项目本地运行安装在 node_modules 目录中的命令。

+ `npm init react-app app`,`yarn create react-app app`和`npx create-react-app app`
   * npm init和yarn create利用包名规则 create-*，先全局下载到本地再执行
   * npx xxx没有包名约束，临时下载执行后删除
   * npm init react-app my-app 等同于 yarn create react-app my-app

# [`import.meta`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/import.meta#%E8%AF%AD%E6%B3%95)
+ import.meta是一个给 JavaScript 模块暴露特定上下文的元数据属性的对象。它包含了这个模块的信息，比如说这个模块的 URL。浏览器端IE11支持,nodejs 10.6.0以上支持