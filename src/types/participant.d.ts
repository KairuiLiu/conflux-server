enum ParticipantRole {
  HOST,
  PARTICIPANT,
}

type ParticipantState = {
  mic: boolean;
  camera: boolean;
  screen: boolean;
};

interface Participant {
  muid: string;
  uuid: string;
  name: string;
  role: ParticipantRole;
  state: ParticipantState;
}
