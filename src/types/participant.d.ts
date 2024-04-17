type ParticipantState = {
  mic: boolean;
  camera: boolean;
  screen: boolean;
};

declare interface Participant {
  muid?: string;
  scid?: string;
  uuid: string;
  name: string;
  role: 'HOST' | 'PARTICIPANT';
  state: ParticipantState;
  avatar?: string;
}
