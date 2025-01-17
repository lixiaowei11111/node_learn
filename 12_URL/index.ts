/**
 * node 18.17.0开始有这个模块了
 * 浏览器端基本上全部兼容URL构造函数, 不兼容可以使用window.URL
 * API基本没有多大差异,Node对web端几乎所有属性和方法都做了兼容
 *
 */

console.log('[debug] ', Bun.version);

const ybb = new URL('./', import.meta.url);

console.log('[debug] ybb', ybb);
/*
[debug] ybb URL {
  href: "file:///home/lxw/code_project/node_learn/12_URL/",
  origin: "null",
  protocol: "file:",
  username: "",
  password: "",
  host: "",
  hostname: "",
  port: "",
  pathname: "/home/lxw/code_project/node_learn/12_URL/",
  hash: "",
  search: "",
  searchParams: URLSearchParams {},
  toJSON: [Function: toJSON],
  toString: [Function: toString],
}
*/

const hbb = new URL('./file', 'https://example.com');

console.log('[debug] hbb', hbb);
/*
[debug] hbb URL {
  href: "https://example.com/file",
  origin: "https://example.com",
  protocol: "https:",
  username: "",
  password: "",
  host: "example.com",
  hostname: "example.com",
  port: "",
  pathname: "/file",
  hash: "",
  search: "",
  searchParams: URLSearchParams {},
  toJSON: [Function: toJSON],
  toString: [Function: toString],
}
*/
