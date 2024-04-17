import { MeetingInfo } from '@/model/meeting_info';
import { MeetingInfoMongo } from '@/types/meeting';
import checkNoneHost from '@/utils/check_none_host';
import { parseToken } from '@/utils/token';
import wsBaseHandler from '@/utils/ws_base_handler';

const roomControllers: Controllers<ClientRoomKeys, SocketType, ServerType> = {
  JOIN_MEETING: async (data, sc, io) => {
    const { room_id, user_name, muid, token, state, avatar } = data;

    const { success, err } = await wsBaseHandler(
      token,
      room_id,
      'RES_JOIN_MEETING',
    );

    if (err) return err;
    const { uuid, meetInfo } = success!;

    if (~meetInfo.participants.findIndex((d) => d.name === user_name)) {
      return {
        message: 'DUPlATE_NAME',
        data: null,
        code: 1,
        type: 'RES_JOIN_MEETING',
      };
    }

    const isOrganizer = meetInfo.organizer.uuid === uuid;
    if (isOrganizer) {
      meetInfo.organizer.muid = muid;
      meetInfo.organizer.name = user_name;
    }

    meetInfo.participants.push({
      uuid,
      muid,
      scid: sc.id,
      name: user_name,
      role: isOrganizer ? 'HOST' : 'PARTICIPANT',
      state,
      avatar,
    });

    await meetInfo.save();
    sc.join(room_id);

    io.sockets.in(meetInfo.id).emit('USER_UPDATE', {
      type: 'USER_UPDATE',
      data: meetInfo,
    });

    return {
      message: 'JOIN_SUCCESS',
      data: meetInfo,
      type: 'RES_JOIN_MEETING',
    };
  },
  LEAVE_MEETING: async (data, sc, io) => {
    let { room_id, token } = data;

    const { success, err } = await wsBaseHandler(
      token,
      room_id,
      'RES_LEAVE_MEETING',
      [],
      [],
      true,
    );

    if (err) return err;
    const { uuid, meetInfo } = success!;

    meetInfo.participants = meetInfo.participants.filter(
      (d) => d.uuid !== uuid,
    );

    sc.leave(room_id);

    checkNoneHost(meetInfo);

    io.sockets.in(meetInfo.id).emit('USER_UPDATE', {
      type: 'USER_UPDATE',
      data: meetInfo,
    });

    meetInfo.save();

    return {
      message: 'LEAVE_SUCCESS',
      data: null,
      type: 'RES_LEAVE_MEETING',
    };
  },
  FINISH_MEETING: async (data, sc, io) => {
    let { room_id, token } = data;

    const { success, err } = await wsBaseHandler(
      token,
      room_id,
      'RES_FINISH_MEETING',
      [],
      [],
      true,
    );

    if (err) return err;
    const { uuid, meetInfo } = success!;

    const user = meetInfo.participants.find((d) => d.uuid === uuid);
    if (user?.role !== 'HOST') {
      return {
        message: 'PERMISSION_DENIED',
        data: null,
        type: 'RES_FINISH_MEETING',
        code: 403,
      };
    }

    io.sockets.in(room_id).emit('FINISH_MEETING', null);
    io.socketsLeave(room_id);
    await MeetingInfo.deleteOne({ id: room_id }).exec();
    return {
      message: 'ROOM_DISSOLVED',
      data: null,
      type: 'RES_FINISH_MEETING',
    };
  },
  disconnect: async (data, sc, io) => {
    const { id } = sc;
    const meetings = await MeetingInfo.find({
      'participants.scid': id,
    }).exec();
    const updates = meetings.map((d) => {
      d.participants = d.participants.filter((p) => p.scid !== id);
      checkNoneHost(d as MeetingInfoMongo);
      return d.save();
    });

    await Promise.all(updates);

    meetings.forEach((d) => {
      io.sockets.in(d.id).emit('USER_UPDATE', {
        type: 'USER_UPDATE',
        data: d,
      });
      sc.leave(d.id);
    });
  },
};

export default roomControllers;
