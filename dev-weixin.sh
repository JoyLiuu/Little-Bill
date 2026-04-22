#!/bin/bash

# 启动开发服务器（后台运行）
npm run dev:mp-weixin &

# 等待编译完成（5秒）
sleep 5

# 复制 static 文件夹
if [ -d "dist/dev/mp-weixin" ]; then
  cp -r static dist/dev/mp-weixin/
  echo "✅ Static files copied successfully!"
else
  echo "⚠️ Target directory not found, waiting for compilation..."
  sleep 5
  cp -r static dist/dev/mp-weixin/
  echo "✅ Static files copied!"
fi

# 保持脚本运行
wait
