import { parseToken } from './token';
import { MeetingInfo } from '@/model/meeting_info';
import { MeetingInfoMongo } from '@/types/meeting';

async function wsBaseHandler(
  token: string,
  room_id: string,
  return_type: string,
  uuids: string[] = [],
  muids: string[] = [],
  selfUUID: boolean = false,
): Promise<{
  success?: {
    uuid: string;
    meetInfo: MeetingInfoMongo;
  };
  err?: {
    message: string;
    data: null;
    code: number;
    type: string;
  };
}> {
  const tokenInfo = parseToken(token);
  if (!tokenInfo) {
    return {
      err: {
        message: 'INVALID_TOKEN',
        data: null,
        code: 401,
        type: return_type,
      },
    };
  }
  const { uuid } = tokenInfo;

  const meetInfo = (await MeetingInfo.findOne({
    id: room_id,
  }).exec()) as MeetingInfoMongo;
  if (
    !room_id ||
    !meetInfo ||
    !uuid ||
    uuids.some((d) => !meetInfo.participants.find((p) => p.uuid === d)) ||
    muids.some((d) => !meetInfo.participants.find((p) => p.muid === d)) ||
    (selfUUID && !meetInfo.participants.find((d) => d.uuid === uuid))
  ) {
    return {
      err: {
        message: `ROOM_NOT_FOUND ${room_id} ${!!meetInfo} ${uuid} `,
        data: null,
        code: 404,
        type: return_type,
      },
    };
  }
  return {
    success: {
      uuid,
      meetInfo,
    },
  };
}

export default wsBaseHandler;
