import { MeetingInfoMongo } from '@/types/meeting';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const MeetingInfoSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  organizer: {
    type: {
      uuid: { type: String, required: true },
      muid: String,
      name: { type: String, required: true },
    },
    required: true,
  },
  start_time: { type: Number, required: true },
  passcode: String,
  participants: {
    type: [
      {
        muid: { type: String, required: true },
        uuid: { type: String, required: true },
        scid: { type: String, required: true },
        name: { type: String, required: true },
        role: {
          type: String,
          required: true,
          enum: ['HOST', 'PARTICIPANT'],
        },
        state: {
          required: true,
          type: {
            mic: { type: Boolean, required: true },
            screen: { type: Boolean, required: true },
            camera: { type: Boolean, required: true },
          },
        },
        expandCamera: { type: Boolean, required: true },
        mirrorCamera: { type: Boolean, required: true },
        avatar: String,
      },
    ],
    required: true,
  },
});

export const MeetingInfo = mongoose.model('Meeting', MeetingInfoSchema);

export function meetingInfoFilter(data: MeetingInfoMongo) {
  const res = JSON.parse(JSON.stringify(data)) as MeetingInfoMongo;
  if (res?.organizer?.uuid) res.organizer.uuid = '';
  res?.participants?.forEach((p) => {
    if (p.uuid) p.uuid = '';
  });
  return res;
}
