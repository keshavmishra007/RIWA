import { Router } from 'express';
import multer from 'multer';
import {
  getMyReports,
  getReportById,
  reconcileComplaint,
  submitReport,
  uploadReportImage,
} from '../controllers/reportController.js';
import { requireAuth } from '../middleware/auth.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (allowed.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'));
    }
  },
});

// Middleware to accept either 'image' or 'file' field name
const handleUpload = (req: any, res: any, next: any) => {
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 10MB limit.' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        req.file = req.files.image[0];
      } else if (req.files.file && req.files.file[0]) {
        req.file = req.files.file[0];
      }
    }
    next();
  });
};

const router = Router();

// Dedicated evidence upload endpoint
router.post('/upload', handleUpload, uploadReportImage);

// Citizen report submission & retrieval
router.post('/', submitReport);
router.post('/:id/reconcile', reconcileComplaint);
router.get('/my', requireAuth, getMyReports);
router.get('/my-reports', requireAuth, getMyReports);
router.get('/:id', getReportById);

export default router;
