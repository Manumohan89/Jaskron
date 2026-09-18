import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  getGallery, adminListGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem
} from '../controllers/siteController.js';

const router = Router();
router.get('/', getGallery);
router.get('/admin/all', authenticate, requireAdmin, adminListGallery);
router.post('/', authenticate, requireAdmin, createGalleryItem);
router.put('/:id', authenticate, requireAdmin, updateGalleryItem);
router.delete('/:id', authenticate, requireAdmin, deleteGalleryItem);
export default router;
