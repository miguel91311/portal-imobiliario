import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import fs from 'fs';

const UPLOAD_DIR = path.resolve(__dirname, '../../uploads/documents');

// Garantir que o diretório existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/octet-stream', // DWG sometimes sends this
  ];
  if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.dwg')) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de ficheiro não suportado. Use PDF, JPG, PNG, WEBP ou DWG.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
});

export const UPLOAD_URL_PATH = '/uploads/documents';
