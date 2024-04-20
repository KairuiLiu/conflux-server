import express from 'express';
import { Server } from 'socket.io';
import 'dotenv/config';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { ExpressPeerServer } from 'peer';

// http server
export const app = express();
const port = normalizePort(process.env.SERVER_PORT || '9876');
const httpServer = createServer(app);

httpServer.listen(port);
httpServer.on('error', onError);
httpServer.on('listening', onListening);

function normalizePort(val: string) {
  return isNaN(parseInt(val, 10)) ? val : parseInt(val, 10);
}

function onError(error: any) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
    default:
      throw error;
  }
}

function onListening() {
  var addr = httpServer.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr!.port;
  console.log('Listening on ' + bind);
}

// socket server
export const io = new Server(httpServer, {
  pingInterval: 10000,
  pingTimeout: 50000,
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// peer server
export const appPeer = express();
const portPeer = normalizePort(process.env.PEERJS_PORT || '9877');
const httpServerPeer = createServer(appPeer);
httpServerPeer.listen(portPeer);
export const serverPeer = ExpressPeerServer(httpServerPeer, { path: '' });

// db
mongoose.connect(process.env.MONGO_URI!, {
  dbName: process.env.MONGO_DBNAME,
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASS,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', console.log.bind(console, 'Connected successfully to MongoDB'));
