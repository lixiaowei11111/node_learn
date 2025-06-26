## 前置
### linux/shell中的环境(全局)变量和局部变量
  + 全局变量: 所谓全局变量，就是指变量在当前的整个 Shell 进程中都有效。每个 Shell 进程都有自己的作用域，彼此之间互不影响。在 Shell 中定义的变量，默认就是全局变量。
  需要强调的是，全局变量的作用范围是当前的 Shell 进程，而不是当前的 Shell 脚本文件，它们是不同的概念。打开一个 Shell 窗口就创建了一个 Shell 进程，打开多个 Shell 窗口就创建了多个 Shell 进程，每个 Shell 进程都是独立的，拥有不同的进程 ID。在一个 Shell 进程中可以使用 source 命令执行多个 Shell 脚本文件，此时全局变量在这些脚本文件中都有效。
  + 局部变量: 在函数内部定义的变量，局部变量只能在当前函数中使用。
  + 环境变量: 全局变量只在当前 Shell 进程中有效，对其它 Shell 进程和子进程都无效。**如果使用export命令将全局变量导出**，那么它就在所有的子进程中也有效了，这称为“环境变量”。
  环境变量被创建时所处的 Shell 进程称为父进程，如果在父进程中再创建一个新的进程来执行 Shell 命令，那么这个新的进程被称作 Shell 子进程。当 Shell 子进程产生时，它会继承父进程的环境变量为自己所用，所以说环境变量可从父进程传给子进程。不难理解，环境变量还可以传递给孙进程。
```bash
[net]$ a=22       #定义一个全局变量
[net]$ echo $a    #在当前Shell中输出a，成功
22
[net]$ bash       #进入Shell子进程
[net]$ echo $a    #在子进程中输出a，失败

[net]$ exit       #退出Shell子进程，返回上一级Shell
exit
[net]$ export a   #将a导出为环境变量
[net]$ bash       #重新进入Shell子进程
[net]$ echo $a    #在子进程中再次输出a，成功
22
[net]$ exit       #退出Shell子进程
exit
[net]$ exit       #退出父进程，结束整个Shell会话
```
#### 临时添加环境变量
● 在当前shell命令行中执行export命令,仅作用于当前Shell及其子进程（如脚本），终端关闭后消失
```bash
export VARIABLE_NAME="value"  # 例：export DEBUG_MODE="true"
```
特点
  ○ ⏱️ 即时性：命令执行后立即生效。
  ○ 🚫 临时性：仅作用于当前Shell及其子进程（如脚本），终端关闭后消失。
  ○ 适用场景：调试程序、临时覆盖系统变量（如PATH）、测试不同环境配置。

#### linux下如何添加系统级别和用户级别的永久环境变量?
● 永久变量需**写入配置文件**，按作用范围分为用户级和系统级。

##### 用户级别的永久环境变量(仅当前用户有效)
配置文件：`~/.bashrc`（Bash默认）或`~/.profile`
步骤：
1. 编辑配置文件：
```bash
nano ~/.bashrc  # 或 vim ~/.bashrc
```
2. 在文件末尾添加：
```bash
export VARIABLE_NAME="value"  # 例：export JAVA_HOME="/usr/lib/jvm/java-11"
```
3. 刷新配置：
```bash
source ~/.bashrc  # 立即生效
```
##### 系统级别的永久环境变量
配置文件：
● `/etc/environment`：仅支持`KEY=value`格式，无export。
● `/etc/profile` 或 `/etc/profile.d/`：支持脚本和export。
步骤（以`/etc/environment`为例）：

1. 编辑文件（需sudo权限）：
```bash
sudo nano /etc/environment
```
2. 添加变量（每行一个）：
```bash
VARIABLE_NAME="value"  # 例：HTTP_PROXY="http://proxy.example.com:8080"
```
3. 刷新配置：
```bash
source /etc/environment  # 或重启系统
```



## package.json中的bin字段

### bin属性的类型
+ [`bin`](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#bin)属性在`package.json`在可以是一个字符串,也可以是一个对象,但是属性值必须是一个当前项目存在的shebang文件**路径**
+ bin的作用是定义了**命令名称与实际执行脚本的映射关系**
**bin的值为string时**
```json
{
  "name": "my-program",
  "version": "1.2.5",
  "bin": "path/to/program"
}
```
**bin的值为对象时**
```json
{
  "name": "my-program",
  "version": "1.2.5",
  "bin": {
    "my-program": "path/to/program"
  }
}
```

### `.bin目录`
+ 以上面的`package.json`为例子,在执行`npm i my-program`的时候:

1. npm在install的时候会在和`package.json`同级的`node_modules`里面生成一个`.bin`目录
2. npm会读取`my-program`包中的`package.json`中的`bin`字段
3. npm在`node_modules/.bin`目录中创建可执行文件（**Windows上是.cmd文件，Unix系统上是符号链接**）
4. 当执行script命令(如`"start":"my-program"`)时,npm会临时将`node_modules/.bin`临时加入到PATH环境变量,命令执行完成后，这个临时环境变量修改会失效
> 要直接使用本地bin命令，可以用npx my-program或./node_modules/.bin/my-program

+ 在执行`npm i -g my-program`的命令时,npm会将bin映射的文件链接/复制到全局bin目录(linux如`/usr/local/bin`,windows则是系统环境变量path添加的npm目录)或npm配置的全局prefix路径,这些目录已经在系统PATH中，所以命令可全局使用