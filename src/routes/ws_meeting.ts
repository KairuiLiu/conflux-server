import { MeetingInfo } from '@/model/meeting_info';
import { parseToken } from '@/utils/token';

const meetControllers: Controllers<ClientMeetingKeys, SocketType, ServerType> =
  {
    UPDATE_USER_STATE: async (data, sc, io) => {
      const { room_id, token, muid, ...participant_diff } = data;
      const { uuid } = parseToken(token);

      const meetInfo = await MeetingInfo.findOne({ id: room_id }).exec();
      if (
        !room_id ||
        !meetInfo ||
        !uuid ||
        ~meetInfo.participants.findIndex((d) => d.uuid === uuid) ||
        ~meetInfo.participants.findIndex((d) => d.muid === muid)
      ) {
        return {
          message: 'ROOM_NOT_FOUND',
          data: null,
          code: 404,
          type: 'RES_UPDATE_USER_STATE',
        };
      }

      const requestUser = meetInfo.participants.find((d) => d.uuid === uuid)!;
      const isHostRequest = requestUser?.role === 'HOST';
      const targetUser = meetInfo.participants.find((d) => d.muid === muid)!;

      if (requestUser.muid !== muid && !isHostRequest) {
        return {
          message: 'INVALID_REQUEST',
          data: null,
          code: 403,
          type: 'RES_UPDATE_USER_STATE',
        };
      }

      if (participant_diff.name !== undefined)
        targetUser.name = participant_diff.name;
      if (participant_diff.role !== undefined && isHostRequest)
        targetUser.role = participant_diff.role;
      if (participant_diff.state !== undefined)
        targetUser.state = {
          ...targetUser.state,
          ...participant_diff.state,
        };

      const multiScreenShare =
        meetInfo.participants.filter((d) => d.state.screen).length > 1;
      if (multiScreenShare) targetUser.state.screen = false;

      await meetInfo.save();

      if (
        participant_diff.name !== undefined ||
        participant_diff.role !== undefined
      )
        io.sockets.in(room_id).emit('USER_UPDATE', {
          type: 'USER_UPDATE',
          data: meetInfo,
        });
      else
        io.sockets.in(room_id).emit('USER_STATE_UPDATE', {
          type: 'USER_STATE_UPDATE',
          data: { muid, state: participant_diff.state },
        });

      return multiScreenShare
        ? {
            message: 'MULTI_SCREEN_SHARE',
            data: null,
            code: 400,
            type: 'RES_UPDATE_USER_STATE',
          }
        : {
            message: 'SUCCESS',
            data: null,
            code: 200,
            type: 'RES_UPDATE_USER_STATE',
          };
    },
    REMOVE_USER: async (data, sc, io) => {
      const { room_id, token, muid } = data;
      const { uuid } = parseToken(token);

      const meetInfo = await MeetingInfo.findOne({ id: room_id }).exec();
      if (
        !room_id ||
        !meetInfo ||
        !uuid ||
        ~meetInfo.participants.findIndex((d) => d.uuid === uuid) ||
        ~meetInfo.participants.findIndex((d) => d.muid === muid)
      ) {
        return {
          message: 'ROOM_NOT_FOUND',
          data: null,
          code: 404,
          type: 'RES_UPDATE_USER_STATE',
        };
      }

      const requestUser = meetInfo.participants.find((d) => d.uuid === uuid)!;
      const isHostRequest = requestUser?.role === 'HOST';

      if (!isHostRequest) {
        return {
          message: 'NO_PERMISSION',
          data: null,
          code: 403,
          type: 'RES_REMOVE_USER',
        };
      }

      meetInfo.participants = meetInfo.participants.filter(
        (d) => d.muid !== muid,
      );

      await meetInfo.save();
      io.sockets.in(room_id).emit('USER_UPDATE', {
        type: 'USER_UPDATE',
        data: meetInfo,
      });

      return {
        message: 'SUCCESS',
        data: null,
        code: 200,
        type: 'RES_REMOVE_USER',
      };
    },
  };

export default meetControllers;
