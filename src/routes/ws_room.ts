import { MeetingInfo, meetingInfoFilter } from '@/model/meeting_info';
import { MeetingInfoMongo } from '@/types/meeting';
import checkNoneHost from '@/utils/check_none_host';
import wsBaseHandler from '@/utils/ws_base_handler';
import emitRoom from '@/utils/emit_room';

const roomControllers: Controllers<ClientRoomKeys, SocketType, ServerType> = {
  JOIN_MEETING: async (data, sc, io) => {
    const {
      room_id,
      user_name,
      muid,
      token,
      state,
      avatar,
      expandCamera,
      mirrorCamera,
      passcode,
    } = data;

    const { success, err } = await wsBaseHandler(
      token,
      room_id,
      'RES_JOIN_MEETING',
    );

    if (err) return err;
    const { uuid, meetInfo } = success!;

    if (passcode !== meetInfo.passcode)
      return {
        message: 'Invalid passcode.',
        data: null,
        code: 401,
        type: 'RES_JOIN_MEETING',
      };

    if (~meetInfo.participants.findIndex((d) => d.name === user_name)) {
      return {
        message: 'Name already in use. Please choose another.',
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
      expandCamera,
      mirrorCamera,
    });

    await meetInfo.save();
    sc.join(room_id);

    const meetingInfoOut = meetingInfoFilter(meetInfo);

    emitRoom(meetInfo.id, io, {
      type: 'USER_UPDATE',
      data: meetingInfoOut,
    });

    return {
      message: 'SUCCESS',
      data: meetingInfoOut,
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

    const meetingInfoOut = meetingInfoFilter(meetInfo);

    emitRoom(meetInfo.id, io, {
      type: 'USER_UPDATE',
      data: meetingInfoOut,
    });

    meetInfo.save();

    return {
      message: 'SUCCESS',
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
        message: 'Permission denied.',
        data: null,
        type: 'RES_FINISH_MEETING',
        code: 403,
      };
    }

    emitRoom(room_id, io, { type: 'FINISH_MEETING' });
    io.socketsLeave(room_id);
    await MeetingInfo.deleteOne({ id: room_id }).exec();
    return {
      message: 'SUCCESS',
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
      emitRoom(d.id, io, {
        type: 'USER_UPDATE',
        data: d,
      });
      sc.leave(d.id);
    });
  },
};

export default roomControllers;
