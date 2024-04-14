import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { ExpressPeerServer } from 'peer';
import 'dotenv/config';

const app = express();
const server = app.listen(process.env.PORT || 9000, () => {
  console.log(
    `Server is running on http://localhost:${process.env.PORT || 9000}`,
  );
});
const io = new SocketIOServer(server);

// PeerJS server
const peerServer = ExpressPeerServer(server, { path: '/' });
app.use('/peer_signal', peerServer);

// WS Server
io.on('connection', (socket) => {
  console.log('A user connected with Socket.IO');
  socket.on('message', (msg) => {
    console.log('Message received:', msg);
    io.emit('message', msg);
  });
});

// HTTP Server
app.get('/', (req, res) => {
  res.send('Hello from Express, PeerJS, and Socket.IO!');
});
