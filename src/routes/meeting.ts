import { Router, Response } from 'express';
import { generateMeetingId } from '@/utils/gen_meeting_id';
import { authenticate } from '@/utils/token';
import { genErrorResponse, genSuccessResponse } from '@/utils/gen_response';
import { MeetingInfo, meetingInfoFilter } from '@/model/meeting_info';
import {
  MeetingCreateRequest,
  MeetingGetRequest,
  MeetingInfoMongo,
} from '@/types/meeting';

const router = Router();

router.post(
  '/',
  authenticate,
  async (req: MeetingCreateRequest, res: Response) => {
    const uuid = req.auth!.uuid;
    const { title, organizer_name, start_time, passcode } = req.body;

    if (!title)
      return res
        .status(400)
        .json(genErrorResponse('Meeting title is required.', 400));

    let meeting_id;
    do {
      meeting_id = generateMeetingId();
    } while (await MeetingInfo.exists({ id: meeting_id }));

    const meetingInfo = new MeetingInfo({
      id: meeting_id,
      title,
      organizer: {
        muid: '',
        uuid,
        name: organizer_name,
      },
      participants: [],
      start_time: start_time,
      passcode,
    });
    meetingInfo.save();

    res.json(genSuccessResponse({ id: meeting_id }));
  },
);

router.get('/', authenticate, async (req: MeetingGetRequest, res: Response) => {
  const { id, name, passcode } = req.query;

  if (typeof id !== 'string')
    return res
      .status(400)
      .json(genErrorResponse('Meeting ID is required as a query parameter.'));

  const meetInfo = await MeetingInfo.findOne({ id: id }).exec();
  if (meetInfo?.participants.find((d) => d.name === name))
    return res.json(
      genErrorResponse('Name already in use. Please choose another.'),
    );

  if (meetInfo && meetInfo?.passcode !== passcode) {
    if (passcode === '')
      return res.status(401).json(genErrorResponse('Passcode needed', 401));
    return res.status(401).json(genErrorResponse('Invalid passcode.', 401));
  }
  if (meetInfo)
    res.json(
      genSuccessResponse(meetingInfoFilter(meetInfo as MeetingInfoMongo)),
    );
  else res.status(404).json(genErrorResponse('Meeting not found.', 404));
});

export default router;
