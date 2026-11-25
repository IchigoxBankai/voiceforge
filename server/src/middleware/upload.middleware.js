import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.storage.tempDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp3';
    cb(null, `upload_${Date.now()}_${uuidv4()}${ext}`);
  }
});

const allowedMimeTypes = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/m4a',
  'audio/x-m4a',
  'audio/webm',
  'audio/ogg',
  'audio/flac',
  'audio/aac',
  'video/webm', // MediaRecorder often uses video/webm for audio streams
  'application/octet-stream' // In case browser sends raw stream
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype) || file.originalname.match(/\.(mp3|wav|m4a|webm|ogg|flac|aac)$/i)) {
    cb(null, true);
  } else {
    const error = new Error(`Unsupported audio file type: ${file.mimetype}. Allowed formats: MP3, WAV, M4A, WEBM, OGG, FLAC.`);
    error.status = 400;
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

export const audioUpload = multer({
  storage,
  limits: {
    fileSize: config.storage.maxUploadSizeMb * 1024 * 1024
  },
  fileFilter
});

