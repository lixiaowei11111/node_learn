#!/bin/bash

# chmod +x dev.sh
# ./dev.sh
echo "启动开发环境..."

# 并行启动所有服务
(cd ws_browser_client && pnpm dev) &
(cd ws_server && pnpm dev) &  
(cd ws_server_client && cargo run) &

echo "所有服务已启动！按 Ctrl+C 停止所有服务"

# 等待所有后台进程
wait