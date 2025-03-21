## JS二进制之: TypedArray
+ JS中跟二进制相关的概念包括:ArrayBuffer,TypedArray,Stream,Blob,Buffer(Nodejs)

### [字节序](https://www.ruanyifeng.com/blog/2022/06/endianness-analysis.html)

#### 字节序的定义与核心概念
字节序（Endianness）是指多字节数据（如整型、浮点型等）在计算机内存或网络传输中**各字节的存储顺序**，主要分为大端序（Big-Endian）和小端序（Little-Endian）两种。

#### 核心差异：
• **大端序**：数据的高位字节存储在内存低地址端，低位字节存储在内存高地址端。例如，32位整数 `0x12345678` 存储为 `0x12 0x34 0x56 0x78`（低地址→高地址）。
• **小端序**：数据的低位字节存储在内存低地址端，高位字节存储在内存高地址端。例如，`0x12345678` 存储为 `0x78 0x56 0x34 0x12`。

这种差异本质上是**字节顺序的完全相反**，而非单个二进制位的存储位置不同。每个字节内部的位序（bit order）通常固定为高位在前，例如字节 `0b10110101` 的二进制位顺序不变。

---

#### 大端序与小端序的具体对比

##### 数值本身的位序
+ 对于人类而言:`0x12345678`,`0x12`是高位,`0x78`是低位和10进制相同,
+ 但是字节序是**内存中的存储顺序**,小端序更符合计算机的读取规则

##### **存储示例**
| 数据示例（0x12345678） | 内存地址（低→高） | 存储顺序              |
| ---------------------- | ----------------- | --------------------- |
| 大端序                 | 0x1000 → 0x1003   | `0x12 0x34 0x56 0x78` |
| 小端序                 | 0x1000 → 0x1003   | `0x78 0x56 0x34 0x12` |

##### 大端序验证（以0x12345678为例）
| 内存地址(从低->高) | 存储内容 | 说明                                           |
| ------------------ | -------- | ---------------------------------------------- |
| 0x1000             | 0x12     | **最高位字节**(0x12)存储在**最低地址**(0x1000) |
| 0x1001             | 0x34     | 次高位字节(0x34)存储在次低地址(0x1001)         |
| 0x1002             | 0x56     | 次低位字节(0x56)存储在次高地址(0x1002)         |
| 0x1003             | 0x78     | **最低位字节**(0x78)存储在**最高地址**(0x1003) |

符合大端序的定义：**高位字节在低地址，低位字节在高地址**。

---

##### 小端序验证（以0x12345678为例）
| 内存地址(从低->高) | 存储内容 | 说明                                           |
| ------------------ | -------- | ---------------------------------------------- |
| 0x1000             | 0x78     | **最低位字节**(0x78)存储在**最低地址**(0x1000) |
| 0x1001             | 0x56     | 次低位字节(0x56)存储在次低地址(0x1001)         |
| 0x1002             | 0x34     | 次高位字节(0x34)存储在次高地址(0x1002)         |
| 0x1003             | 0x12     | **最高位字节**(0x12)存储在**最高地址**(0x1003) |

符合小端序的定义：**低位字节在低地址，高位字节在高地址**。


##### **典型应用场景**
• **大端序**：
  • **网络协议**（如TCP/IP）统一采用大端序（网络字节序），确保跨平台兼容性。
  • **Java虚拟机（JVM）** 默认使用大端序处理数据。
• **小端序**：
  • **x86/x64架构计算机**（如Intel、AMD处理器）采用小端序，因其在处理低字节运算时效率更高。
  • **嵌入式系统**（如ARM核心）也普遍使用小端序。

---

#### 字节序的影响与处理
##### **跨平台与网络通信**
• 若不同字节序的设备直接通信（如大端序的PowerPC与小端序的x86），需通过 `htonl`、`ntohl` 等函数进行字节序转换，否则数据会被错误解析。例如，`0x1234` 不转换时可能被误读为 `0x3412`。
• **网络传输规范**：所有数据需转换为大端序（网络字节序）后再发送。

##### **编程中的判断与兼容**
• **判断方法**：可通过联合体（union）或指针操作检测当前系统的字节序。
  ```c
  union Test { short a; char b; } c;
  c.a = 0x1234;
  if (c.b == 0x34) { /* 小端序 */ }
  ```

### ArrayBuffer

+ ArrayBuffer其实就是类似于c语言中的malloc,提前开辟出一块固定大小的内存区域,用于存储数据,故此叫做 `缓冲`
  + malloc()在分配失败时会返回一个 null 指针。ArrayBuffer 在分配失败时会抛出错误。
  + malloc()可以利用虚拟内存，因此最大可分配尺寸只受可寻址系统内存限制。ArrayBuffer分配的内存不能超过 Number.MAX_SAFE_INTEGER（253  1）字节。
  + malloc()调用成功不会初始化实际的地址。声明 ArrayBuffer 则会将所有二进制位初始化为 0。
  + 通过 malloc()分配的堆内存除非调用 free()或程序退出，否则系统不能再使用。而通过声明ArrayBuffer 分配的堆内存可以被当成垃圾回收，不用手动释放。

+ 在WebGL中使用JS数组和原生数组不匹配会产生性能问题,于是Mozilla为了解决这个问题实现了CanvasFloatArray,这是一个提供JavaScript 接口的、C 语言风格的浮点值数组。JavaScript 运行时使用这个类型可以分配、读取和写入数组。这个数组可以直接传给底层图形驱动程序 API，也可以直接从底层获取到。最终，CanvasFloatArray变成了 Float32Array，也就是今天定型数组中可用的第一个“类型”。

+ Float32Array 实际上是一种“视图”，可以允许 JavaScript 运行时访问一块名为 ArrayBuffer 的预分配内存。ArrayBuffer 是所有定型数组及视图引用的基本单位。
+ ArrayBuffer是一个构造函数,且**一旦创建就不能变更大小,也不能直接变更ArrayBuffer实例的内容**,要对ArrayBuffer开辟的内存进行Write/Read(或者I/O)操作,需要使用View类型的数组,View有DataView和TypedArray两种类型
+ View实例持有的是ArrayBuffer实例的引用,而非ArrayBuffer的副本,而ArrayBuffer.prototpye.slice方法是复制一个ArrayBuffer的数据,开辟一个新的内存缓存区域

```TypeScript
const buf1 = new ArrayBuffer(16);

console.log('[debug] buf1',buf1, buf1.byteLength);

const buf2=buf1.slice(0, 8);//slice方法会创建一个副本即复制,而不是引用

console.log('[debug] buf2',buf2,buf2.byteLength );//不能直接读取ArrayBuffer的实例
```

### [DataView](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/DataView)
+ 第一种允许你读写ArrayBuffer的视图是DataView。这个视图专为文件I/O和网络I/O设计，其API 支持对缓冲数据的高度控制，但相比于其他类型的视图性能也差一些。DataView 对缓冲内容没有任何预设，也不能迭代。
+ 必须在对已有的ArrayBuffer读取或写入时才能创建DataView 实例。这个实例可以使用全部或部分ArrayBuffer，且维护着对该缓冲实例的引用，以及视图在缓冲中开始的位置。

#### DataView的创建
+ DataView是一个获取缓冲区引用的构造函数, 该构造函数的第二个参数为偏移量起始点,**第三个参数是该DataView截取的缓冲区长度,而不是偏移量结束点**

```TypeScript
// DataView 视图

const buf3 = new ArrayBuffer(16);

// 默认使用全部
const fullView = new DataView(buf3); //默认使用整个ArrayBuffer
console.log('[debug] ', fullView.buffer === buf3); //true
console.log(
  '[debug] ',
  fullView.byteLength === buf3.byteLength,
  fullView.byteLength,
); //true 2

console.log('[debug] fullView.byteOffset', fullView.byteOffset); //0
// 构造函数的第二个参数为偏移量起始点,第三个参数为字节长度,而不是偏移量结束点
const halfView = new DataView(buf3, 2, 8);
console.log('[debug] halfView.buffer === buf3', halfView.buffer === buf3); //true
console.log('[debug] halfView.byteOffset', halfView.byteOffset); //2
console.log('[debug] halfView.byteLength', halfView.byteLength); //8

// 如果只设置了偏移量,不设置字节长度,则会使用剩余的缓冲区
const restView = new DataView(buf3, 10);
console.log('[debug] restView.buffer === buf3', restView.buffer === buf3); //true
console.log('[debug] restView.byteOffset', restView.byteOffset); //10
console.log('[debug] restView.byteLength', restView.byteLength); //6
```


+ DataView.prototype.buffer: 由于DataView只是ArrayBuffer的引用,所以DataView.prototype.buffer一定等于创建时传入的buffer
```TypeScript
const buf3 = new ArrayBuffer(16);

// 默认使用全部
const fullView = new DataView(buf3); //默认使用整个ArrayBuffer
console.log('[debug] ', fullView.buffer === buf3); //true
```

#### DataView的读写
+ 要通过 DataView 读取缓冲，还需要几个组件。
  + 首先是要读或写的字节偏移量。可以看成 DataView 中的某种“地址”。
  + DataView 应该使用 ElementType 来实现 JavaScript 的 Number 类型到缓冲内二进制格式的转换。
  + 最后是内存中值的字节序。默认为大端字节序。

+ 对ElementType的理解
  + 为什么需要ElementType,ElementType的作用类似于指针变量的类型,如rust从指定的内存地址处读取一个值,然后需要一个类型来接受内存地址上存储的值
  + 如:
  ```rust
  let mem_address = 0x012345usize;
  let r = mem_address as *const i32;//
  ```


##### ElementType
+ DataView 对存储在缓冲内的数据类型没有预设。它暴露的 API 强制开发者在读、写时指定一个ElementType，然后 DataView 就会忠实地为读、写而完成相应的转换。

| **ElementType** | 字节 | 说明                  | 等价的 C 类型  | **Rust 类型** | 值的范围                      |
| --------------- | ---- | --------------------- | -------------- | ------------- | ----------------------------- |
| Int8            | 1    | 8 位有符号整数        | signed char    | `i8`          | -128~127                      |
| Uint8           | 1    | 8 位无符号整数        | unsigned char  | `u8`          | 0~255                         |
| Int16           | 2    | 16 位有符号整数       | short          | `i16`         | -32 768~32 767                |
| Uint16          | 2    | 16 位无符号整数       | unsigned short | `u16`         | 0~65 535                      |
| Int32           | 4    | 32 位有符号整数       | int            | `i32`         | -2 147 483 648~2 147 483 647  |
| Uint32          | 4    | 32 位无符号整数       | unsigned int   | `u32`         | 0~4 294 967 295               |
| Float32         | 4    | 32 位 IEEE-754 浮点数 | float          | `f32`         | -3.4e+38~+3.4e+38（单精度）   |
| Float64         | 8    | 64 位 IEEE-754 浮点数 | double         | `f64`         | -1.7e+308~+1.7e+308（双精度） |


+ DataView 为上表中的每种类型都暴露了 get 和 set 方法，这些方法使用 byteOffset（字节偏移量）定位要读取或写入值的位置。类型是可以互换使用的
