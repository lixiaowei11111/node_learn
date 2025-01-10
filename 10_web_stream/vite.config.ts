import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      srcDir: 'src/sw', // Service Worker 文件所在的目录
      filename: 'sw.ts', // Service Worker 文件名
      strategies: 'injectManifest', // 使用 injectManifest 模式
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'], // 需要缓存的文件
      },
    }),
  ],
});
