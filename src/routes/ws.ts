import meetControllers from './ws_meeting';
import roomControllers from './ws_room';

const wsControllers: Controllers<ControllerKeys, SocketType, ServerType> = {
  ...roomControllers,
  ...meetControllers,
};

export default wsControllers;
