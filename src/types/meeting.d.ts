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
  };
}

declare interface MeetingGetRequest extends ExpComRequest, AuthRequest {
  query: {
    id: string;
  };
}

declare interface MeetingInfo {
  id: string;
  title: string;
  organizer: Pick<ParticipantState, ['muid', 'uuid', 'name']>;
  participants: Participant[];
  start_time: number;
}
