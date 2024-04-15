import { Router } from 'express';
import 'dotenv/config';
import { genErrorResponse, genSuccessResponse } from '@/utils/gen_response';
import { createToken } from '@/utils/token';

const router = Router();

router.get('/', (req, res) => {
  const uuidQuery = req.query.uuid as string;

  if (!uuidQuery)
    return res
      .status(400)
      .json(genErrorResponse('UUID query parameter is required.'));

  const token = createToken(uuidQuery);

  res.json(
    genSuccessResponse({
      token: token,
      COTURN_PATH: process.env.COTURN_PATH,
      PEER_SERVER_PATH: process.env.PEER_SERVER_PATH,
      COTURN_USERNAME: process.env.COTURN_USERNAME,
      COTURN_PASSWORD: process.env.COTURN_PASSWORD,
    }),
  );
});

export default router;
