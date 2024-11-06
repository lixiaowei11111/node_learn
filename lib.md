# 常见的工具库

## node增强
1. [`chokidar`](https://github.com/paulmillr/chokidar) 是一个监听文件系统变化的工具，替代原始的fs.watch / fs.watchFile
2. [`fs-extra`](https://github.com/jprichardson/node-fs-extra)完全可用于替代原始的fs模块,为fs的API添加了promise

## 命令行
1. [rimraf](https://github.com/isaacs/rimraf) 
    `node`的删除文件的第三方库,当使用`webpack`进行`build`操作之前,预先删除之前残留的`dist`文件夹, `rimraf 5.0.1` 版本返回的是一个`Promsie`
2. [chalk version](https://www.npmjs.com/package/chalk?activeTab=versions)
	`node`的命令行美化工具,在命令行输出不同颜色的文字,`5.x`版本只支持es6的`import`语法,`4.x`才支持`CommonJs`导入语法
3. [`ora`](https://github.com/sindresorhus/ora)
	语法支持类似于`chalk`,`6.x`版本支持`import`,`6.x`以及以下支持`require()`;用于在命令行界面显示加载中、等待、成功、失败等状态的动画效果
4. [`minimist`](https://github.com/minimistjs/minimist)
   + `minimist` 是一个 `Node.js` 工具库，用于解析命令行参数。它可以将命令行参数转换为一个简单易用的 `JavaScript` 对象，方便开发者使用和处理命令行参数。通过 
   + `minimist`，开发者可以轻松地获取和解析命令行参数，并在程序中进行相应的处理。它特别适用于编写命令行工具和脚本。
   + 在`minimist`中，第二个参数是一个配置对象，用于指定一些解析选项。其中，`string`选项可以将指定的参数名解析成字符串类型，而不是默认的布尔类型或数值类型。
   + example

    ```ts
      const argv = minimist<{
      t?: string;
      template?: string;
      }>(process.argv.slice(2), { string: ["_"] });
    ```

     + 在这个例子中，`string: ["_"]`的意思是将命令行参数中不带参数名的部分（即_数组）的所有元素都解析成字符串类型。默认情况下，`minimist`会将不带参数名的部分解析成布尔类型或数值类型，具体类型取决于参数的值。
     + 例如，假设命令行参数是`node index.js foo 42`，那么默认情况下，_数组的元素会被解析成以下类型：

      ```ts
        const argv = minimist(process.argv.slice(2));
        console.log(argv); // { _: [ 'foo', 42 ] }
        console.log(typeof argv._[0]); // 'string'
        console.log(typeof argv._[1]); // 'number'
      ```
     + 可以看到，\_数组的第一个元素被解析成了字符串类型，而第二个元素被解析成了数值类型。如果希望将所有的不带参数名的部分都解析成字符串类型，可以使用`string: ["_"]`选项：

      ```ts
        const argv = minimist(process.argv.slice(2), { string: ["_"] });
        console.log(argv); // { _: [ 'foo', '42' ] }
        console.log(typeof argv._[0]); // 'string'
        console.log(typeof argv._[1]); // 'string'
      ```

     + 可以看到，现在_数组的所有元素都被解析成了字符串类型。

      ```JavaScript
          console.log(process.argv,'process.env.argv');// bash execute node index.js --trace-warnings name=aaa 
          /**
          * 返回的是一个数组,数组的前两项固定是node路径和运行的js文件的路径
          * [
            'C:\\Users\\wb.lixiaowei01\\AppData\\Roaming\\nvm\\v14.21.2\\node.exe',
            'E:\\node_learn\\01_node_daemon\\process\\index.js',
            '--trace-warnings',
            'name=aaa'
          ] process.env.argv
          */
          // 使用minimist来处理接收的命令行参数
          const  argv = require('minimist')(process.argv.slice(2));//忽略位置0,1的参数 
          console.log('minimist',argv);// node index.js -x 3 -y 4 -n5 -abc --beep=boop foo bar baz
          /**
          minimist {
            _: [ 'foo', 'bar', 'baz' ],
            x: 3,
            y: 4,
            n: 5,
            a: true,
            b: true,
            c: true,
            beep: 'boop'
          }
          */
        ```

    + 其实上面的例子分别介绍了解析参数中 number bool string array 的用法
      -x 3 -y4 -n5 都是number类型, `-<变量名><数字值>`或者`-<变量名> <数字值>`
      -abc 相当于 -a -b -c 但是后面没有参数,会被赋值为`bool` 
      --beep=boop 则是 `--<属性值>=<字符串>`
      foo bar baz 则是既没有 `-`,和 `--`前缀,也就不存在赋值会被列为默认属性 `-`的数组值

5. [`cross_spawn`](https://www.npmjs.com/package/cross-spawn)
      + `cross_spawn` 是一个`Node.js` 模块，用于在跨平台的环境下启动子进程。它类似于 `Node.js` 内置的`child_process.spawn` 方法，但提供了更好的跨平台支持。在 `Windows` 平台上，`child_process.spawn` 可能无法正确地执行命令，而 `cross_spawn` 可以确保命令在所有平台上都能正确执行。因此，`cross_spawn` 是一个非常有用的工具，特别是在编写跨平台的 `Node.js` 应用程序时。

6. [`kolorist`](https://github.com/marvinhagemeister/kolorist) 将颜色输出到标准输入/输出的小型库

7. [`inquirer`](https://github.com/SBoudrias/Inquirer.js)
      + 用于创建交互式命令行界面（`CLI`）的询问提示。通过`Inquirer`，开发者可以在`CLI`中向用户提出问题，获取用户的输入，并根据用户的响应执行相应的操作。`Inquirer`提供了多种不同类型的问题，例如多选、单选、输入、确认等等，同时还支持自定义问题类型和答案验证。
8. [`prompts`](https://github.com/terkelg/prompts)
      + 用于收集用户输入，验证输入数据的格式，以及在需要时提示用户重新输入。它还可以处理复杂的用户交互流程，例如嵌套提示和动态提示。`prompts` 库提供了许多不同类型的提示，包括文本输入、多选、单选、确认等，使开发者可以轻松地构建交互式命令行工具。
     + inquirer 与 prompts的区别
        + `prompts` 提供了一些 `inquirer` 不具备的特性，例如支持动态提示和嵌套提示。
        + `prompts` 的代码量更少，因为它只是 `inquirer` 的一个子集，而`inquirer` 的功能更为全面。
        + 一个简单、易于使用的库来处理命令行交互，可以选择 `prompts`。如果需要更多的功能和更全面的支持，可以选择 `inquirer`。



## 开发
1. [typescript]内置了tsc工具,只要`pnpm add typescript`,就可以直接在命令行中使用`tsc`来编译
2. [`ts-node`](https://github.com/TypeStrong/ts-node) 是一个node版本的ts运行时
3. [`nodemon`](https://github.com/remy/nodemon) 是一个node版本的自动重启服务器
4. [`tsconfig-paths`](https://github.com/dividab/tsconfig-paths) 由于`ts-node`[不支持识别路径alias](https://juejin.cn/post/6963800542615175182),需要配合`tsconfig-paths`来解决该问题
5. [`pm2`](https://pm2.fenxianglu.cn/docs/start/#google_vignette)PM2 是一个用于 Node.js 应用程序的生产过程管理器，具有内置的负载均衡器。它允许您使应用程序永久保持活动状态，无需停机重新加载它们，并简化常见的系统管理任务。