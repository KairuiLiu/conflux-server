<div align="center">
  <img src="./doc/images/logo_color.svg" width="128" height="128"/>
  <h2 style="margin-top: 0;">ConFlux Server</h2>
  <p>
    <strong>🎥 又一个视频会议与协作平台</strong>
  </p>
  <p>
    <img alt="Socket.io" src="https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=Socket.io&logoColor=white"/>
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=TypeScript&logoColor=white"/>
  </p>
  <h4>
    <a href="https://conflux.liukairui.me/">Live Demo</a>
    <span> | </span>
    <a href="./README.md">English</a>
    <span> | </span>
    <a href="./README-CN.md">简体中文</a>
  </h4>
</div>



### ✨ 特性

- 基于 WebRTC 的多人 P2P 视频会议
- 本地用户, 无需注册, 无需登录
- 支持屏幕共享
- 支持音视频设备测试与切换
- 支持会议邀请
- 支持会议成员权限管理 (设置联席主持人, 禁言, 踢出)
- 实时流量监控

### 🛠️ 安装

```bash
# 安装 MongoDB, coturn. 将用户名密码写入 `.env` 文件

# 安装全部依赖
> pnpm install

# 运行
> pnpm dev

# 构建
> pnpm build

# 执行后端程序(如果不需要PM2等进程管理工具)
> node ./dist/index.js

# 安装PM2
> pnpm install -g pm2

# 注册PM2监视
> pm2 start --watch ecosystem.config.js

# 如需反向代理, 请将 :
#   /api/* 代理到 localhost:9876
#   /socket.io/* 代理到 localhost:9876
#   /api/peer_signal 代理到 localhost:9877
```
