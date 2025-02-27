navigator.serviceWorker
  .register("./emptyServiceWorker.js")
  .then(console.log, console.error);

// ServiceWorkerRegistration 对象
