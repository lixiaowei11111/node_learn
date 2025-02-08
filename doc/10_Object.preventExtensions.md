## JS中防止属性扩展的三种方法:

+ 这三种方法分别是`[Object.preventExtensions](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions)`,`[Object.seal](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/seal)`,`[Object.freeze](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)`
+ 要注意这三种方法都是浅层阻止,即属性如果是对象的话(冻结的是引用地址这个地址),需要使用递归来重复操作才能实现[深冻结](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze),如下

```javascript
const a=[1,2,3,4];
const obj={
  vector:a
};
Object.freeze(obj);
obj.vector=[2,3,4,5];// chrome不会报错,但是会更改失败
console.log(obj.vector);//[1,2,3,4]

obj.vector.push(5);// vector属性更改成功,因为push导致的引用地址的值没有改变
console.log(obj.vector)// [1,2,3,4,5]
```

### Object.preventExtensions
+ `preventExtensions`与其他两个方法(`seal`和`freeze`)的本质区别: **直接操作对象内部插槽 [[IsExtensible]]，这是引擎级别的原子操作，无法通过组合其他 API 实现**
    - **此特性与以下核心机制绑定：**
        * **修改对象内部标记 [[PreventExtensions]]（不可逆操作）**
        * **影响原型链查找的快速路径优化（引擎内部优化）**
+ `**<font style="color:rgb(27, 27, 27);">Object.preventExtensions()</font>**`<font style="color:rgb(27, 27, 27);"> 静态方法可以防止新属性被添加到对象中（即防止该对象被扩展）。它还可以防止对象的原型被重新指定.</font>
+ **<font style="color:rgb(27, 27, 27);">可以修改和删除现有属性,也可以在对象原型上增加现有属性</font>**
+ <font style="color:rgb(27, 27, 27);">可通过</font>`<font style="color:rgb(27, 27, 27);">Object.isExtensible</font>`<font style="color:rgb(27, 27, 27);">查询是否可扩展</font>

```javascript
const obj={
  b:234
};
Object.preventExtensions(obj)
// obj.a=123;//增加属性失败
// console.log(obj.a)//undefined

// obj={}//Uncaught TypeError: Assignment to constant variable;不能重新指定原型
obj.b=123;//可以更改属性
delete obj.b; //可以删除
```



### Object.seal
+ `**<font style="color:rgb(27, 27, 27);">Object.seal()</font>**`<font style="color:rgb(27, 27, 27);"> 静态方法</font>_<font style="color:rgb(27, 27, 27);">密封</font>_<font style="color:rgb(27, 27, 27);">一个对象。密封一个对象会</font>[阻止其扩展](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions)<font style="color:rgb(27, 27, 27);">并且使得现有属性不可配置。密封对象有一组固定的属性：</font>**<font style="color:rgb(27, 27, 27);">不能添加新属性、不能删除现有属性或更改其可枚举性和可配置性、不能重新分配其原型</font>**<font style="color:rgb(27, 27, 27);">。只要现有属性的值是可写的，它们仍然可以更改。</font>`<font style="color:rgb(27, 27, 27);">seal()</font>`<font style="color:rgb(27, 27, 27);"> 返回传入的同一对象。</font>

<font style="color:rgb(27, 27, 27);"></font>

+ <font style="color:rgb(27, 27, 27);">密封一个对象等价于</font>[阻止其扩展](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions)<font style="color:rgb(27, 27, 27);">，然后将现有的</font>[属性描述符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#%E6%8F%8F%E8%BF%B0)<font style="color:rgb(27, 27, 27);">更改为 </font>`<font style="color:rgb(27, 27, 27);">configurable: false</font>`<font style="color:rgb(27, 27, 27);">。</font>

```javascript
const c=[1,2,3,4];
const obj={a:123,b:c};
Object.seal(obj);
delete obj.a;//删除密封对象的属性会静默失败
console.log(obj.a);//123
obj.e=114514;//添加属性静默失败
console.log(obj.e)//undefined

Object.defineProperty(obj, "b", {
  get() {
    return "g";
  },
});//VM957:9 Uncaught TypeError: Cannot redefine property: b
```

### Object.freeze
+ <font style="color:rgb(27, 27, 27);">冻结一个对象相当于</font>[阻止其扩展](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions)<font style="color:rgb(27, 27, 27);">然后将所有现有</font>[属性的描述符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#%E6%8F%8F%E8%BF%B0)<font style="color:rgb(27, 27, 27);">的 </font>`<font style="color:rgb(27, 27, 27);">configurable</font>`<font style="color:rgb(27, 27, 27);"> 特性更改为 </font>`<font style="color:rgb(27, 27, 27);">false</font>`<font style="color:rgb(27, 27, 27);">——对于数据属性，将同时把 </font>`<font style="color:rgb(27, 27, 27);">writable</font>`<font style="color:rgb(27, 27, 27);"> 特性更改为 </font>`<font style="color:rgb(27, 27, 27);">false</font>`<font style="color:rgb(27, 27, 27);">。</font>

### 为什么有Reflect.preventExtensions,没有Reflect.seal/Reflect.freeze
1. 非原子操作
+ seal 和 freeze 包含多个步骤（阻止扩展 + 修改属性描述符），无法通过单一 Proxy 捕获器拦截。
2. 与 Proxy 拦截器不匹配
+ ES 规范中未定义 seal 或 freeze 的独立捕获器，因此无需对应的 Reflect 方法。
3. 设计一致性
+ Reflect 只暴露 可直接映射到语言基础操作 的方法，高阶操作留给 Object。

```javascript
// Object.seal 等价于：
function seal(obj) {
  Object.preventExtensions(obj);
  Object.keys(obj).forEach(key => {
    Object.defineProperty(obj, key, { configurable: false });
  });
}

// Object.freeze 等价于：
function freeze(obj) {
  seal(obj);
  Object.keys(obj).forEach(key => {
    if (obj[key]?.constructor === Object) freeze(obj[key]); // 递归
    Object.defineProperty(obj, key, { writable: false });
  });
}
```

### 三者关系
由上可知: `seal`,`freeze`方法都是基于preventExtensions这个方法封装出来的,

seal = preventExtensions + configurable:false

freeze = seal + writable:false