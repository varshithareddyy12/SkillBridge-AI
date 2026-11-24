import multer from 'multer';
import { Request } from 'express';
import { ENV } from '../config/env.js';

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (
    allowedMimeTypes.includes(file.mimetype) ||
    file.originalname.endsWith('.pdf') ||
    file.originalname.endsWith('.docx') ||
    file.originalname.endsWith('.doc') ||
    file.originalname.endsWith('.txt')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF, DOCX, DOC and TXT files are supported.'));
  }
};

export const uploadResumeMiddleware = multer({
  storage,
  limits: {
    fileSize: ENV.MAX_FILE_SIZE, // 5MB limit
  },
  fileFilter,
});
