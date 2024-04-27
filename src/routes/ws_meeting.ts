import checkNoneHost from '@/utils/check_none_host';
import wsBaseHandler from '@/utils/ws_base_handler';
import emitRoom from '@/utils/emit_room';

const meetControllers: Controllers<ClientMeetingKeys, SocketType, ServerType> =
  {
    UPDATE_USER_STATE: async (data, sc, io) => {
      const { room_id, token, muid, ...participant_diff } = data;

      const { success, err } = await wsBaseHandler(
        token,
        room_id,
        'RES_UPDATE_USER_STATE',
        [],
        [muid],
        true,
      );

      if (err) return err;
      const { uuid, meetInfo } = success!;

      const requestUser = meetInfo.participants.find((d) => d.uuid === uuid)!;
      const isHostRequest = requestUser?.role === 'HOST';
      const targetUser = meetInfo.participants.find((d) => d.muid === muid)!;

      if (requestUser?.muid !== muid && !isHostRequest) {
        return {
          message: 'Permission denied.',
          data: null,
          code: 403,
          type: 'RES_UPDATE_USER_STATE',
        };
      }

      let dulplicatName = false;
      if (participant_diff.name !== undefined) {
        if (meetInfo.participants.find((d) => d.name === participant_diff.name))
          dulplicatName = true;
        else targetUser.name = participant_diff.name;
      }
      if (participant_diff.expandCamera !== undefined) {
        targetUser.expandCamera = participant_diff.expandCamera;
      }
      if (participant_diff.mirrorCamera !== undefined) {
        targetUser.mirrorCamera = participant_diff.mirrorCamera;
      }
      if (participant_diff.role !== undefined && isHostRequest)
        targetUser.role = participant_diff.role;
      if (participant_diff.state !== undefined) {
        console.log('user state changed', targetUser);
        (['mic', 'camera', 'screen'] as (keyof ParticipantState)[]).forEach(
          (k) => {
            if (participant_diff.state[k] !== undefined)
              targetUser.state[k] = participant_diff.state[k];
          },
        );
      }

      const multiScreenShare =
        meetInfo.participants.filter((d) => d.state.screen).length > 1;
      if (multiScreenShare) targetUser.state.screen = false;

      checkNoneHost(meetInfo);
      await meetInfo.save();

      if (
        participant_diff.name !== undefined ||
        participant_diff.role !== undefined
      )
        emitRoom(room_id, io, {
          type: 'USER_UPDATE', // change multiple user state
          data: meetInfo,
        });
      else
        emitRoom(room_id, io, {
          type: 'USER_STATE_UPDATE',
          data: {
            muid,
            state: participant_diff.state,
            expandCamera: participant_diff.expandCamera,
            mirrorCamera: participant_diff.mirrorCamera,
          },
        });

      if (dulplicatName)
        return {
          message: 'Name already in use. Please choose another.',
          data: null,
          code: 400,
          type: 'RES_UPDATE_USER_STATE',
        };
      if (multiScreenShare)
        return {
          message: 'Other user is screen sharing',
          data: null,
          code: 400,
          type: 'RES_UPDATE_USER_STATE',
        };
      return {
        message: 'SUCCESS',
        data: null,
        code: 200,
        type: 'RES_UPDATE_USER_STATE',
      };
    },
    REMOVE_USER: async (data, sc, io) => {
      const { room_id, token, muid } = data;

      const { success, err } = await wsBaseHandler(
        token,
        room_id,
        'RES_UPDATE_USER_STATE',
        [],
        [muid],
        true,
      );

      if (err) return err;
      const { uuid, meetInfo } = success!;

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

      checkNoneHost(meetInfo);

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
    BOARDCAST_CHAT: async (data, sc, io) => {
      const { room_id, token, muid, message, time } = data;

      const { success, err } = await wsBaseHandler(
        token,
        room_id,
        'RES_UPDATE_USER_STATE',
        [],
        [muid],
        true,
      );
      if (err) return err;
      const { uuid, meetInfo } = success!;

      emitRoom(room_id, io, {
        type: 'CHAT',
        data: { muid, message, time },
      });
    },
  };

export default meetControllers;
