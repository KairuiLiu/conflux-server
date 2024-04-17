import { app, io, peerServer } from './www';
import configRouter from './routes/config';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import express from 'express';
import meetingRouter from './routes/meeting';
import wsController from './routes/ws';

const dev = process.env.MODE === 'DEV';

// PeerJS server
app.use('/peer_signal', peerServer);

// WS Server
io.on('connection', (socket) => {
  dev && console.log(`[CONNECT-${socket.id}]`);
  Object.keys(wsController).forEach((event) => {
    socket.on(event, async (data) => {
      try {
        dev &&
          console.log(
            `[SOCKERT-${socket.id}] ${event} ${JSON.stringify(data)}`,
          );
        const res = await wsController[event as ControllerKeys](
          data,
          socket,
          io,
        );
        if (res) {
          dev &&
            console.log(
              `[SOCKERT-${socket.id}] ${res.type} ${JSON.stringify(res)}`,
            );
          socket.emit(res.type, res);
        }
      } catch (e) {
        dev && console.error(e);
      }
    });
  });
});

// HTTP Server
app.use(logger(dev ? 'dev' : 'common'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/config', configRouter);
app.use('/meeting', meetingRouter);
