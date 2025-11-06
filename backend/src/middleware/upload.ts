import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'cvs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId-timestamp-originalname
    const userId = (req as any).userId || 'unknown';
    const uniqueName = `${userId}-${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter - allow PDF, Word, ODT, RTF, and plain text
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.oasis.opendocument.text', // .odt
    'application/rtf', // .rtf
    'text/rtf', // .rtf (alternative MIME type)
    'text/plain', // .txt
  ];

  // Also check file extension as fallback (some systems may not set MIME type correctly)
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.odt', '.rtf', '.txt'];
  const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));

  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed formats: PDF, DOC, DOCX, ODT, RTF, TXT. Received: ${file.mimetype || 'unknown'}`));
  }
};

const uploadCVMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

export const uploadCV = uploadCVMiddleware;
export const uploadsDirPath = uploadsDir;

