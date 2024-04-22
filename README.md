<div align="center">
  <img src="./doc/images/logo_color.svg" width="128" height="128"/>
  <h2 style="margin-top: 0;">ConFlux Server</h2>
  <p>
    <strong>🎥 Another meeting and collaboration platform</strong>
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



### ✨ Feature

- Multi-person P2P video conferencing based on WebRTC
- Local users, no registration required, no login required
- Supports screen sharing
- Supports audio and video device testing and switching
- Supports meeting invitations
- Supports meeting member permission management (setting co-hosts, muting, kicking out)
- Real-time traffic monitoring

### 🛠️ Install

```bash
# Install MongoDB, coturn, and write userinfo into `.env`

# Install dependencies
> pnpm install

# Run
> pnpm dev

# Build
> pnpm build

# Execute server programs (if process management tools such as PM2 are not required)
> node ./dist/index.js

# Install PM2
> pnpm install -g pm2

# Register PM2 monitoring
> pm2 start --watch ecosystem.config.js

# If a reverse proxy is needed, please proxy:
#   /api/* to localhost:9876
#   /socket.io/* to localhost:9876
#   /api/peer_signal to localhost:9877
```
