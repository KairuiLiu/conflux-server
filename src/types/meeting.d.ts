import { Document } from 'mongoose';

type ExpComRequest = Request<
  ParamsDictionary,
  any,
  any,
  QueryString.ParsedQs,
  Record<string, any>
>;

declare interface MeetingCreateRequest extends ExpComRequest, AuthRequest {
  body: {
    title: string;
    organizer_name: string;
    start_time: number;
    passcode: string;
  };
}

declare interface MeetingGetRequest extends ExpComRequest, AuthRequest {
  query: {
    id: string;
    name: string;
    passcode: string;
  };
}

declare interface MeetingInfo {
  id: string;
  title: string;
  organizer: Pick<ParticipantState, 'muid' | 'uuid' | 'name'>;
  participants: Participant[];
  start_time: number;
  passcode: string;
}

declare interface Chat {
  muid: string;
  message: string;
  time: number;
}

declare type MeetingInfoMongo = Document & MeetingInfo;
