import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const dest = path.join(process.cwd(), 'uploads', 'resources');
fs.mkdirSync(dest, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dest),
  filename: (_req, file, cb) => {
    const unique = crypto.randomBytes(8).toString('hex');
    cb(null, `${Date.now()}-${unique}${path.extname(file.originalname)}`);
  }
});

const allowedExt = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.zip', '.png', '.jpg', '.jpeg'];

export const uploadResourceFile = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExt.includes(ext)) return cb(new Error('File type not allowed'));
    cb(null, true);
  }
}).single('file');

// --- Course/lesson video uploads ---------------------------------------
// Render's filesystem is ephemeral (wiped on every deploy/restart), so this
// NEVER touches disk — the file is held in memory just long enough to be
// streamed straight through to Cloudinary (see controllers/courseController.js
// -> uploadLessonVideo). Nothing under /uploads is used for videos.
const allowedVideoExt = ['.mp4', '.mov', '.webm', '.mkv', '.avi', '.m4v'];
const allowedVideoMime = [
  'video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska', 'video/x-msvideo', 'video/x-m4v'
];

export const uploadLessonVideoFile = multer({
  storage: multer.memoryStorage(),
  // Kept conservative on purpose: the whole file is briefly held in server RAM before being
  // streamed to Cloudinary, and Render's free/starter plans only give ~512MB total. Raise this
  // only if you've sized up the Render instance (and your Cloudinary plan allows larger uploads).
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedVideoExt.includes(ext) && !allowedVideoMime.includes(file.mimetype)) {
      return cb(new Error('Only video files (mp4, mov, webm, mkv, avi, m4v) are allowed'));
    }
    cb(null, true);
  }
}).single('video');
