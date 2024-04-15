import { io } from '@/www';

export function joinMeeting(msg: any): ScCb {
  console.log('Message received:', msg);
  io.emit('message', msg);
}
