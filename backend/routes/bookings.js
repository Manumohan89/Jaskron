import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { createBooking, adminListBookings, updateBooking, deleteBooking } from '../controllers/siteController.js';

const router = Router();
router.post('/', createBooking); // public — institutions submit a request
router.get('/', authenticate, requireAdmin, adminListBookings);
router.patch('/:id', authenticate, requireAdmin, updateBooking);
router.delete('/:id', authenticate, requireAdmin, deleteBooking);
export default router;
