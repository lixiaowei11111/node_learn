# win11 安装wsl2+zsh+oh-my-zsh+p10k+nerd font+vscode连接

## 1. [Win11安装WSL2在非C盘的办法](https://www.cnblogs.com/ubirdy/articles/18246999)
   1. 控制面板 - 程序和功能 - 启用或关闭Windows功能(左侧菜单) - 选择“适用于Linux的Windows子系统”与 “虚拟机平台”与“Hyper-V" - 重启
   2. 安装内核更新包
      1. 升级到最新版本 `wsl --update`
      2. 将 WSL 默认版本设置为 WSL 2 `wsl --set-default-version 2`
   3. 打开Microsoft Store,安装Ubuntu,**我选择的是`Ubuntu-24.04`**, 如果是第一次安装,需要在菜单栏中点击该Ubuntu快捷方式先安装到系统盘,期间需要设置用户名和密码
   4. 安装到自定义路径,我是E盘,`E:\User\wsl`
      1. 导出镜像,现在E盘新建上述目录 `wsl --export Ubuntu-24.04 E:\User\wsl\ubuntu.tar`
      2. 导入镜像,取一个和原镜像不同的名字,如`Ubuntu24.04`
      ```bash
        # 导入命令格式  wsl --import <导入Linux名称> <导入盘的路径> <导入tar包路径> 版本(代表wsl2)
        wsl --import Ubuntu24.04 E:\User\wsl E:\User\wsl\ubuntu.tar --version 2
      ``` 
      会显示：“正在导入，这可能需要几分钟时间。”
      导入盘的路径可以理解为安装的位置。可以看到`E:\User\wsl`文件夹下多一个`ext4.vhdx`文件
    5. **这时候可以把原来安装在系统的`Ubuntu-24.04`删除掉**
       1. wsl卸载指定镜像 `wsl --unregister Ubuntu-24.04`
       2. 菜单栏右击卸载`Ubuntu-24.04`
    6. wsl2 设置默认启动系统 `wsl --set-default Ubuntu24.04`或`wsl -s Ubuntu-22.04`
    7. wsl 有多个系统的情况下,指定一个镜像启动`wsl -d Ubuntu-22.04`
    8. 重置用户密码
       1. `PowerShell`输入`wsl -u root`,然后输入`passwd root`即可修改`root`密码
    9.  在路径`C:\Users\用户名`下新建`.wslconfig`文件,,并导入如下内容来解决[代理问题](https://www.stormlee.top/docs/wsl2/wsl2-new-install.html#%E4%BF%AE%E6%94%B9%E5%9F%BA%E7%A1%80%E9%85%8D%E7%BD%AE)
    ```toml
    [wsl2]
    memory=20GB                   #限制最大内存，可自行修改
    processors=8                  #限制线程数，可自行修改
    #localhostforwarding=true
    nestedVirtualization=true
    #useWindowsDnsCache=true       #与dnsTunneling相关，建议不改
    guiApplications=true
    swap=20GB                     #限制最大交换空间，可自行修改

    dnsTunneling=true             #新版dns隧道，DNS 隧道是一种通过 DNS 协议来传输其他协议流量的方法，通常用于绕过网络限制或进行数据传输。可以在网络受限的环境中绕过部分网络审查。
    firewall=true                 #同步windows防火墙。开启防火墙可以对网络流量进行过滤和控制，提高系统的安全性。这一配置可以限制或允许特定的网络连接，以防止未经授权的访问。
    networkingMode=mirrored       #将网络模式设置为“镜像模式”。在镜像模式下，所有的网络流量会镜像到指定的网络接口或设备。这通常用于流量监控、数据备份或网络隔离等用途。
    autoProxy=true                #启用自动代理设置。在自动代理模式下，系统会自动检测并配置最佳的代理服务器，以加速网络访问或绕过网络限制。
    [experimental]
    autoMemoryReclaim=gradual     #表示自动内存回收策略为“渐进”模式。具体来说，这个配置控制系统如何释放不再使用的缓存或临时数据，以减轻内存使用。 在“渐进”模式下，系统会逐步回收内存，而不是一次性释放大量内存，避免影响系统性能。在“渐进”模式下，系统会逐步回收内存，而不是一次性释放大量内存，避免影响系统性能。
    hostAddressLoopback=true      #分配给主机的 IP 地址允许容器连接到主机，建议不改

    bestEffortDnsParsing=true     #与dnsTunneling相关，建议不改
    sparseVhd=true                #自动清理磁盘空间，建议不改
    ```
> `~`对应的windows路径一般是`\\wsl.localhost\Ubuntu24.04\root`

## 2. [WSL唤醒VsCode](https://code.visualstudio.com/docs/remote/wsl-tutorial)

+ 需要的`VsCode`插件,注意都为Microsoft官方发布的插件: `WSL`,`Remote - SSH`,`Dev Containers`或者直接安装一个三合一插件`Remote Development`

+ 可能遇到的问题,[在WSL中通过`code .`唤醒不了VsCode并报出如下错误](https://github.com/microsoft/vscode-remote-release/issues/7050): 
```bash
$ code .
/mnt/c/Users/jared/AppData/Local/Programs/Microsoft VS Code/Code.exe: Invalid argument
```
  + 解决方案: 需要在终端 - 设置 - Ubuntu24.04<对应镜像> - 开启 **以管理员身份运行此配置文件**

## 3. 安装zsh, oh-my-zsh, nerd font

1. 直接通过`apt`安装`zsh`
```bash
sudo apt-get install zsh
chsh -s /bin/zsh ## 设为默认终端
```

2. 安装[`ohmyzsh`](https://github.com/ohmyzsh/ohmyzsh)
  
+ 使用官方提供的curl来安装即可`sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"`
> 如果使用代理遇到github下载不通的问题,查看上述`.wslconfig`的相关配置

3. 安装[`powerlevel10k`](https://github.com/romkatv/powerlevel10k?tab=readme-ov-file#meslo-nerd-font-patched-for-powerlevel10k)和[`nerd-fonts`](https://github.com/ryanoasis/nerd-fonts)

+ 使用`p10k`需要先安装`nerd-fonts`的四种字体,`p10k`官方文档有连接可[下载](https://github.com/romkatv/powerlevel10k?tab=readme-ov-file#manual-font-installation)
+ 下载并将这四个`.ttf`字体文件安装在windows上,右击即可安装.然后打开终端 - `Ubuntu24.04` - 其它设置外观 - 字体选择`MesloLGS NF` - 店家保存即可

+ `p10k`安装参考[官方文档](https://github.com/romkatv/powerlevel10k?tab=readme-ov-file#manual)

```bash
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ~/powerlevel10k
echo 'source ~/powerlevel10k/powerlevel10k.zsh-theme' >>~/.zshrc
```

4. VsCode终端正确显示`nerd-fonts`字体
   1. 设置 - 选择**远程[WSL: Ubuntu24.04]** - 全局搜索 `font family` - 找到`Terminal > Integrated: Font Family` - 输入`'Cascadia Code', Consolas, 'Courier New', monospace,'MesloLGS NF'`

## 4. 配置安装NVM,PNPM
+ 跟随[NVM文档](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)配置安装即可
+ 需要运行`source ~/.zshrc`重新加载`.zshrc`配置文件
+ [PNPM](https://pnpm.io/installation#installing-a-specific-version)安装同上

## 5. 全局安装`commitizen`
+ 全局安装 `npm install -g cz-conventional-changelog`
+ 全局添加适配器 `commitizen init cz-conventional-changelog --save-dev --save-exact`
+ 全局模式下, 需要 ~/.czrc 配置文件, 为 commitizen 指定 Adapter`echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc`

> 参考文章
> [windows11 安装WSL2全流程](https://www.cnblogs.com/ubirdy/articles/18246999)
> [Remote development in WSL](https://code.visualstudio.com/docs/remote/wsl-tutorial)
> [WSL2是最好的linux发行版！新版wsl2安装教程，并搭建前端开发环境](https://www.stormlee.top/docs/wsl2/wsl2-new-install.html)
> [Windows11 Terminal: 配置与美化 Powershell7、WSL2、WSA](https://www.meow-2.com/posts/records/terminals#_1-powershell-%E5%AE%89%E8%A3%85-oh-my-posh)