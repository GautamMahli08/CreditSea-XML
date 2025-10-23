import multer from 'multer';
import path from 'path';
import os from 'os';
import { env } from '../config/env.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, os.tmpdir()),   // <— use OS temp dir
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

function fileFilter (req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.xml') return cb(Object.assign(new Error('Only .xml files allowed'), { status: 415 }));
  cb(null, true);
}

export const upload = multer({
  storage,
  limits: { fileSize: env.maxUploadMB * 1024 * 1024 },
  fileFilter
});
