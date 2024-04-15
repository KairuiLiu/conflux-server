import { Router, Response } from 'express';
import { MeetingCreateRequest, MeetingGetRequest } from '@/types/meeting';
import { generateMeetingId } from '@/utils/gen_meeting_id';
import { authenticate } from '@/utils/gen_token';
import { genErrorResponse, genSuccessResponse } from '@/utils/gen_response';

const router = Router();

router.post('/', authenticate, (req: MeetingCreateRequest, res: Response) => {
  const uuid = req.auth!.uuid;
  const { title } = req.body;

  if (!title)
    return res.status(400).json(genErrorResponse('Meeting title is required.'));

  const meeting_id = generateMeetingId();
  // TODO: check and save room_id to database
  console.log(`User ${uuid} created meet ${meeting_id} with title ${title}`);

  res.json(genSuccessResponse({ id: meeting_id }));
});

router.get('/', authenticate, async (req: MeetingGetRequest, res: Response) => {
  const { id } = req.query;

  if (typeof id !== 'string')
    return res
      .status(400)
      .json(genErrorResponse('Meeting ID is required as a query parameter.'));

  const meetInfo = {
    id: id,
    title: 'Meeting Title',
    participants: [
      {
        uuid: 'user1',
        name: 'User 1',
      },
      {
        uuid: 'user2',
        name: 'User 2',
      },
    ],
  };

  if (meetInfo) res.json(genSuccessResponse(meetInfo));
  else res.status(404).json(genErrorResponse('Meeting not found.'));
});

export default router;
