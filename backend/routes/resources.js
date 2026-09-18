import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { uploadResourceFile } from '../middleware/upload.js';
import {
  getResources,
  uploadResource,
  deleteResource,
  downloadResource
} from '../controllers/resourceController.js';

const router = Router();

// Public list (frontend hides gated ones from logged-out users if isPublic=false)
router.get('/', getResources);
router.get('/:id/download', downloadResource);

// Admin: upload / delete
router.post('/', authenticate, requireAdmin, (req, res, next) => {
  uploadResourceFile(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, uploadResource);
router.delete('/:id', authenticate, requireAdmin, deleteResource);

export default router;
