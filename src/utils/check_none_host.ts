import { MeetingInfoMongo } from '@/types/meeting';

function checkNoneHost(meetInfo: MeetingInfoMongo) {
  if (meetInfo.participants.length === 0) return;
  const exitHost = meetInfo.participants.find((d) => d.role === 'HOST');
  if (!exitHost) meetInfo.participants[0].role = 'HOST';
}

export default checkNoneHost;
