import ts from '@/utils/time_stemp';
function emitRoom(room_id: string, io: ServerType, data: any) {
  io.sockets.in(room_id).emit(data.type, {
    ...data,
    time: ts.t,
  });
  ts.tick();
}

export default emitRoom;
