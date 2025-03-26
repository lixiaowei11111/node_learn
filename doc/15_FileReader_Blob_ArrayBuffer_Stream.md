### JS中二进制和流式操作系统性归纳

#### 已系统性总结的知识

##### ArrayBuffer & TypedArray

+ ArrayBuffer为原生数组, DataView和TypedArray作为ArrayBuffer的视图提供I/O能力

##### Stream

+ 在浏览器环境包含 Readable, Writable和Transform 三个接口



#### Fetch API

+ 包含 fetch()方法, Headers, Request, Response接口

##### fetch()

##### Headers

##### Response

##### Request
+ Request.body为主体内容的`ReadableStream`,这在BS环境其实是一致的,nodejs中的request.body也是Stream

#### URL

+ 在BS环境中的行为是一致的,用于拼接URL,不过浏览器端有个`createObjectURL(object)`和`revokeObjectURL(object)`的静态方法(object是用于创建 URL 的 File、Blob 或 MediaSource 对象。这两个方法在nodejs 23.10.0中还处于 [Experimental阶段](https://nodejs.org/docs/latest/api/url.html#urlcreateobjecturlblob)),用于将URL转为blob协议链接, 也就是说是Blob转为Object URL

#### Blob 和 File
+ File继承于Blob, 可以用来读取文件
+ Blob.stream()可以转换为ReadableStream

#### FileReader


