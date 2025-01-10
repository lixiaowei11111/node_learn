### 0. 通用编程概念Stream,Pipe,Buffer
1. Stream(流)
- 表示一连串连续的数据,这些数据是按照时间顺序依次生成或消费的
- 常见的stream包括:输入流(数据从外部源流向程序)、输出流(数据从程序流向外部目标)
- Stream强调数据的流动性和顺序性,数据可以逐个到达,不需要全部加载到内存中
- 常见的stream操作包括:读取、写入、过滤、转换等
- 很多编程语言都内置了对stream的支持,如Java的InputStream/OutputStream、Python的io模块等

2. Pipe(管道)
- 表示一种用于在不同进程或线程之间传输数据的通信机制
- Pipe提供了一个单向的数据传输通道,一端写入数据,另一端读取数据
- 常见的pipe包括:匿名管道(通常用于父子进程间通信)、命名管道(可用于任意进程间通信)
- Pipe强调数据的流动性和进程/线程间的协作
- 很多操作系统和编程语言都提供了对pipe的支持,如Unix/Linux的pipe命令、Python的multiprocessing模块等

3. Buffer(缓冲区)
- 表示一块用于临时存储数据的内存区域,通常用于I/O操作和数据传输
- Buffer起到缓冲和中转的作用,可以提高数据读写的效率和性能
- 常见的buffer包括:输入缓冲区(暂存从外部读取的数据)、输出缓冲区(暂存要写入外部的数据)
- Buffer强调数据的临时存储和批量处理,可以减少频繁的I/O操作
- 很多编程语言都提供了对buffer的支持,如C++的vector、Java的ByteBuffer等

4. Stream、Pipe和Buffer之间的关系
- Stream强调数据的流动性和顺序性,而Pipe强调进程/线程间的数据传输,Buffer强调数据的临时存储和批量处理
- 它们经常配合使用,形成完整的数据处理和传输方案
- 例如:从文件读取数据(InputStream) -> 经过管道传输给另一个进程(Pipe) -> 写入输出缓冲区(Buffer) -> 最终写入目标文件(OutputStream)

### 1. Nodejs中的Stream是什么,pipe是什么,buf是什么

+ 流(Stream)是Node.js中处理流式数据的抽象接口。流可以是可读的、可写的,或是可读写的。所有的流都是EventEmitter的实例。

+ 管道(pipe)提供了一个输出流到输入流的机制。通常我们用于从一个流中获取数据并将数据传递到另外一个流中。
  > 流就是分段的传输内容，比如从服务端像浏览器返回响应数据的流，读取文件的流,命令行中的标准输入输出流(stdin)等。
  > 流和流之间可以通过管道 pipe 连接，上个流的输出作为下个流的输入。
  > 可以把流想象成水管，水管的一端流入水，另一端流出。
+ 缓冲区(Buffer)是一个类似数组结构的对象,可以通过指定开始写入的索引以及写入的数据长度来往其中写入二进制数据。
  - Buffer 的结构和数组很像,操作的方法也和数组类似
  - 数组中不能存储二进制文件,而buffer就是专门用来存储二进制数据的
  - 使用buffer不需要引入模块,直接使用即可
  - 在buffer中存储的都是二进制数据,但是在显示时都是以16进制的形式显示
    - buffer中每一个元素的范围是从00 - ff   0 - 255
    - 计算机 一个0 或一个1 我们称为1位(bit)
    - 8bit = 1byte(字节)  
    - 1024byte = 1kb
    - 1024kb = 1mb
    - 1024mb = 1gb
    - 1024gb = 1tb
  - buffer的大小一旦确定,则不能修改,实际上是对底层内存的直接操作
  > Buffer其实就是`rust`中的`[u8]`,即`cpp`中的`u8[]`

### 2. 流(Stream)的种类
+ Readable - 可读操作的流,例如 fs.createReadStream()
+ Writable - 可写操作的流,例如 fs.createWriteStream() 
+ Duplex - 可读可写的流,例如 net.Socket
+ Transform - 在读写过程中可以修改和变换数据的 Duplex 流,例如 zlib.createDeflate()

### 3. Readable
+ ReadPipe.pipe方法参数接收一个Writeable实例,pipe方法是一个不阻塞的异步方法,建议使用pipeline方法来替代

### 4. EventEmitter
+ 所有的Stream(Readable,Writeable,Duplex,Transform)都是EventEmitter的实例