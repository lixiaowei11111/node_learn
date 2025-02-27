import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/ybb": {
        target: "http://127.0.0.1:4567", //nginx地址
        changeOrigin: true,
        rewrite: path => {
          console.log(path,path.replace(/\/ybb/, ''),'path');
          
          return path.replace(/\/ybb/, '')
        } // 去掉 /ybb 前缀
      },
    },
  },
});
