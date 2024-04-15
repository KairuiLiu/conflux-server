import meetControllers from './ws_meeting.js';
import roomControllers from './ws_room.js';

const wsControllers: Controllers<ControllerKeys, SocketType, ServerType> = {
  ...roomControllers,
  ...meetControllers,
};

export default wsControllers;
