const worker = new Worker("./worker.js");
worker.onerror = console.log;

// ErrorEvent 对象,如下
// isTrusted: true
// bubbles: false
// cancelBubble: false
// cancelable: true
// colno: 1
// composed: false
// currentTarget: Window {window: Window, self: Window, document: document, name: '', location: Location, …}
// defaultPrevented: false
// error: null
// eventPhase: 0
// filename: "http://127.0.0.1:5500/webworker/08-%E5%A4%84%E7%90%86%E5%B7%A5%E4%BD%9C%E8%80%85%E7%BA%BF%E7%A8%8B%E9%94%99%E8%AF%AF/worker.js"
// lineno: 1
// message: "Uncaught Error: this is a error"
// path: [Window]
// returnValue: true
// srcElement: Window {window: Window, self: Window, document: document, name: '', location: Location, …}
// target: Window {window: Window, self: Window, document: document, name: '', location: Location, …}
// timeStamp: 106.09999999962747
// type: "error"
// [[Prototype]]: ErrorEvent

