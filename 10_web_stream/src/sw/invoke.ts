// 不能直接写getRegistration('./sw.ts),https://www.cnblogs.com/CyLee/p/17407587.html
const swPath = new URL('./sw.ts', import.meta.url);

export const register = async () => {
  const registration = await navigator.serviceWorker.getRegistration(swPath);
  if (registration?.active) return registration.active;
  console.log('[debug] registering service worker');
  const swRegistration = await navigator.serviceWorker.register(swPath, { scope: './' });

  const sw = swRegistration.installing! || swRegistration.waiting!;
  let listen: () => void;

  return new Promise<ServiceWorker>((resolve) => {
    sw.addEventListener(
      'statechange',
      (listen = () => {
        if (sw.state === 'activated') {
          sw.removeEventListener('statechange', listen);
          resolve(swRegistration.active!);
        }
      }),
    );
  });
};

export const createDownload = async (filename: string) => {
  const { port1, port2 } = new MessageChannel();

  const sw = await register();
  console.log('[debug] apply download resource');

  sw.postMessage({ filename }, [port2]);

  return new Promise<WritableStream>((resolve) => {
    port1.onmessage = (e) => {
      console.log('[debug] launch request');
      const iframe = document.createElement('iframe');
      iframe.hidden = true;
      iframe.src = e.data.download;
      iframe.name = 'iframe';
      document.body.appendChild(iframe);
      resolve(e.data.writable);
    };
  });
};
