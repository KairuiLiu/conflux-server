import 'dotenv/config';
import { app, sc, peerServer } from './www';
import configRouter from './routes/config';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import express from 'express';
import { joinMeeting } from './routes/ws_meeting';
import meetingRouter from './routes/meeting';

// PeerJS server
app.use('/peer_signal', peerServer);

// WS Server
sc.add('join_meeting', joinMeeting);
sc.init();

// HTTP Server
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/config', configRouter);
app.use('/meeting', meetingRouter);
