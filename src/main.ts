import { app, io, peerServer } from './www';
import configRouter from './routes/config';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import express from 'express';
import meetingRouter from './routes/meeting';
import wsController from './routes/ws';

// PeerJS server
app.use('/peer_signal', peerServer);

// WS Server
io.on('connection', (socket) => {
  Object.keys(wsController).forEach((key) => {
    socket.on(key, async (args) => {
      console.log(`[SOCKERT-${socket.id}] ${key}`);
      const { type, data } = args;
      const res = await wsController[type as ControllerKeys](data, socket, io);
      if (res) socket.emit(res.type, res);
    });
  });
});

// HTTP Server
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/config', configRouter);
app.use('/meeting', meetingRouter);
