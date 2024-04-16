import { MeetingInfo } from '@/model/meeting_info';
import { parseToken } from '@/utils/token';

const roomControllers: Controllers<ClientRoomKeys, SocketType, ServerType> = {
  JOIN_MEETING: async (data, sc, io) => {
    const { room_id, user_name, muid, token } = data;
    const { uuid } = parseToken(token);
    const meetInfo = await MeetingInfo.findOne({ id: room_id }).exec();

    if (!meetInfo) {
      return {
        message: 'ROOM_NOT_FOUND',
        data: null,
        code: 404,
        type: 'RES_JOIN_ROOM',
      };
    }

    if (~meetInfo.participants.findIndex((d) => d.name === user_name)) {
      return {
        message: 'DUPlATE_NAME',
        data: null,
        code: 1,
        type: 'RES_JOIN_ROOM',
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
      state: {
        mic: false,
        screen: false,
        camera: false,
      },
    });

    await meetInfo.save();
    sc.join(room_id);

    io.sockets.in(meetInfo.id).emit('USER_UPDATE', {
      type: 'USER_UPDATE',
      data: meetInfo,
    });
    return {
      message: 'JOIN_SUCCESS',
      data: { room: meetInfo },
      type: 'RES_JOIN_ROOM',
    };
  },
  LEAVE_MEETING: async (data, sc, io) => {
    let { room_id, token } = data;
    const { uuid } = parseToken(token);

    const meetInfo = await MeetingInfo.findOne({ id: room_id }).exec();
    if (
      !room_id ||
      !meetInfo ||
      !uuid ||
      ~meetInfo.participants.findIndex((d) => d.uuid === uuid)
    ) {
      return {
        message: 'ROOM_NOT_FOUND',
        data: null,
        code: 404,
        type: 'RES_LEAVE_ROOM',
      };
    }

    meetInfo.participants = meetInfo.participants.filter(
      (d) => d.uuid !== uuid,
    );
    sc.leave(room_id);

    io.sockets.in(meetInfo.id).emit('USER_UPDATE', {
      type: 'USER_UPDATE',
      data: meetInfo,
    });
    meetInfo.save();

    return {
      message: 'LEAVE_SUCCESS',
      data: null,
      type: 'RES_LEAVE_ROOM',
    };
  },
  FINISH_MEETING: async (data, sc, io) => {
    let { room_id, token } = data;
    const { uuid } = parseToken(token);
    const meetInfo = await MeetingInfo.findOne({ id: room_id }).exec();
    if (
      !room_id ||
      !meetInfo ||
      !uuid ||
      ~meetInfo.participants.findIndex((d) => d.uuid === uuid)
    ) {
      return {
        message: 'ROOM_NOT_FOUND',
        data: null,
        code: 404,
        type: 'RES_LEAVE_ROOM',
      };
    }

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
