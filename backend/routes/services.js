import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  requestService,
  getMyServiceRequests,
  getAllServiceRequests,
  updateServiceRequestStatus
} from '../controllers/serviceController.js';

const router = Router();

// Public — list all
router.get('/', getServices);

// Logged-in user — my requests (must come before /:id)
router.get('/requests/mine', authenticate, getMyServiceRequests);

// Admin — all requests
router.get('/requests/all', authenticate, requireAdmin, getAllServiceRequests);
router.patch('/requests/:id', authenticate, requireAdmin, updateServiceRequestStatus);

// Admin — create
router.post('/', authenticate, requireAdmin, createService);

// Public — single service
router.get('/:id', getServiceById);

// Logged-in user — request a service
router.post('/:id/request', authenticate, requestService);

// Admin — manage a specific service
router.put('/:id', authenticate, requireAdmin, updateService);
router.delete('/:id', authenticate, requireAdmin, deleteService);

export default router;
