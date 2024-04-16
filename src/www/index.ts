import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { ExpressPeerServer } from 'peer';
import 'dotenv/config';
import mongoose from 'mongoose';

// http server
export const app = express();
const port = normalizePort(process.env.SERVER_PORT || '9876');
const server = app.listen(port);

server.on('error', onError);
server.on('listening', onListening);

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
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr!.port;
  console.log('Listening on ' + bind);
}

// peer server
export const peerServer = ExpressPeerServer(server, { path: '/' });

// socket server
export const io = new SocketIOServer(server, {
  pingInterval: 10000,
  pingTimeout: 50000,
});

// db
mongoose.connect(process.env.MONGO_URI!, {
  dbName: process.env.MONGO_DBNAME,
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASS,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', console.log.bind(console, 'Connected successfully to MongoDB'));
