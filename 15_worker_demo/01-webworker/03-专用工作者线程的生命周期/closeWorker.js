self.postMessage("1");
self.close();
self.postMessage("2");
setTimeout(() => self.postMessage("3"), 0);
