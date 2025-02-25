# [`pnpm workspaces`的基础使用](https://juejin.cn/post/7425420976487415846)

0. `package.json`中的`packageManager`是node的[corepack](https://nodejs.org/docs/latest/api/corepack.html)功能,用于指定包管理器

1. 安装所有packages的公共依赖,使用`-w`/`--workspace-root`
   + `pnpm add lodash -w`

2. `package`引用公共依赖,正常引用即可
   + `import _ from "lodash`

3. 项目根目录下给指定package添加依赖,使用 `--filter`/`-F` 指定package
   + `pnpm add @types/express --filter 03_pnpm_workspaces_demo1`
   + 或者`cd`到apckage目录下`pnpm add xxx`

4. package之间的互相引用
   + 通过3的方式使用,**前提是需要在`.npmrc`配置`link-workspace-packages = true`**
     + `pnpm add 03_pnpm_workspaces_demo1 -F 04_pnpm_workspaces_demo2`
   + 想要和和上述效果一样,但是不开启`link-workspace-packages`,需要手动在`04_pnpm_workspaces_demo2`目录下的`package.json`中的`dependencies`中手动添加依赖`"03_pnpm_workspaces_demo1": "workspace:*"`
   
5. 项目根目录引用单个`package`
   通过结合`1`和`4`的方式在根目录安装`package`,然后在根目录的文件引用

6. 根目录运行package的script命令
   类似于第三步`3`,使用`--filter <package_name>`或者`-F <package_name>`来过滤
   如: `pnpm run -F 05_process dev`


# [`pnpm`结合`lerna`使用](https://lerna.nodejs.cn/docs/recipes/using-pnpm-with-lerna)


# [`git submodule`](https://iphysresearch.github.io/blog/post/programing/git/git_submodule/) 
+ 使用`git submodule`解决monorepo导致git单体仓库体积膨胀的问题

+ 添加submodule
  `$ git submodule add https://github.com/iphysresearch/GWToolkit.git GWToolkit`

+ 查看submodule
  `git submodule`

+ 更新submodule

  + 更新项目内子模块到最新版本：
   `git submodule update`

  + 更新子模块为远程项目的最新版本
   `git submodule update --remote`

+ 删除submodule

1. 删除子模块文件夹

```bash
$ git rm --cached GWToolkit
$ rm -rf GWToolkit
```

2. 删除 .gitmodules 文件中相关子模块的信息，类似于：
```bash
[submodule "GWToolkit"]
        path = GWToolkit
        url = https://github.com/iphysresearch/GWToolkit.git
```

3. 删除 .git/config 中相关子模块信息，类似于：
```bash
[submodule "GWToolkit"]
        url = https://github.com/iphysresearch/GWToolkit.git
        active = true
```

4. 删除 .git 文件夹中的相关子模块文件
```bash
$ rm -rf .git/modules/GWToolkit
```

+ clone带有submodule的仓库

对于主仓库项目合作者来说，如果只是`git clone`去下载主仓库的内容，那么你会发现子模块仓库的文件夹内是空的！

此时，可以像上面「添加子模块」中说到的在项目根目录下使用`git submodule update --init --recursive`来递归的初始化并下载子模块仓库的内容。

也可以分初始化和更新子模块两步走的方式来下载子模块仓库的内容：
```bash
$ git submodule init		# 初始化子模块
$ git submodule update	# 更新子模块
```

但是，如果你是第一次使用`git clone`下载主仓库的所有项目内容的话，我建议你可以使用如下的代码格式来把主仓库和其中子模块的所有内容，都一步到位的下载下来：

```bash
$ git clone --recursive <project url>
```

以后可以在子模块仓库目录下使用 git pull origin main 或者 git push 等来进行更新与合并等操作。


#[`Pre&Post Script`](https://docs.npmjs.com/cli/v8/using-npm/scripts#pre--post-scripts)

+ 要为`package.json`中"`scripts`"部分定义的任何脚本创建"`pre`"或"`post`"脚本，只需创建另一个具有相同名称的脚本，并在它们的开头添加 "`pre`" 或 "`post`"。

+ 如`postinstall`:在执行完`npm i`命令以后执行的命令,属于`npm`的`hooks`: `preinstall`是`npm install`执行之前的hook;`postinstall`是`npm install`执行完成以后执行的`hook`;

   ```json
   {
      "scripts": {
         "precompress": "{{ executes BEFORE the `compress` script }}",
         "compress": "{{ run command to compress files }}",
         "postcompress": "{{ executes AFTER `compress` script }}"
      }
   }
   ```

> 参考文档
> https://juejin.cn/post/7425420976487415846
> https://juejin.cn/post/7197767400098758717
> https://github.com/ashleydavis/pnpm-workspace-examples
> https://blog.csdn.net/qq_36694183/article/details/136745688