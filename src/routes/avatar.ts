import { Router } from 'express';
import { genErrorResponse, genSuccessResponse } from '@/utils/gen_response';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';

const router = Router();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_, file, cb) => {
    const uniqueSuffix = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 300 * 1024 },
});

router.post(
  '/',
  (req, res, next) => {
    upload.single('image')(req, res, function (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE')
        return res.status(400).json(genErrorResponse('File size too large'));
      else if (err) return res.status(400).json(genErrorResponse(err.message));
      next();
    });
  },
  (req, res) => {
    if (req.file) res.status(200).json(genSuccessResponse(req.file.filename));
    else res.status(400).json(genErrorResponse('No file uploaded'));
  },
);

router.get('/', (req, res) => {
  const fileName = req.query.fileName as string;

  if (!fileName) {
    return res.status(400).json(genErrorResponse('File name not provided'));
  }

  const filePath = path.join('uploads', fileName);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(404).json(genErrorResponse('Image not found'));
    }

    const fileExtension = path.extname(filePath).slice(1);
    const contentType = mime.lookup(fileExtension) || `image/${fileExtension}`;
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Content-Type', contentType);
    res.send(data);
  });
});

export default router;
