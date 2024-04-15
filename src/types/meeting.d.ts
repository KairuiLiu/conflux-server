import { Request } from 'express';
import { AuthRequest } from './auth';

interface MeetingCreateRequest extends Request, AuthRequest {
  body: {
    title: string;
  };
}

interface MeetingGetRequest extends Request, AuthRequest {
  query: {
    id: string;
  };
}

interface MeetingInfo {
  id: string;
  title: string;
  organizer: Pick<ParticipantState, ['muid', 'uuid', 'name']>;
  participants: ParticipantState[];
}
