import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  getWorkshops,
  getWorkshopById,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  registerForWorkshop,
  registerTeamForWorkshop,
  cancelRegistration,
  getMyWorkshops,
  getWorkshopRegistrations,
  updateRegistrationStatus,
  enrollWorkshop
} from '../controllers/workshopController.js';

const router = Router();

// Public — list all
router.get('/', getWorkshops);

// Logged-in user — specific routes BEFORE the generic /:id catch-all
router.get('/mine/registrations', authenticate, getMyWorkshops);

// Admin only — create
router.post('/', authenticate, requireAdmin, createWorkshop);

// Public — single workshop (must come after /mine/registrations)
router.get('/:id', getWorkshopById);

// Logged-in user actions on a specific workshop
router.post('/:id/register', authenticate, registerForWorkshop);
router.post('/:id/register-team', authenticate, registerTeamForWorkshop);
router.post('/:id/cancel', authenticate, cancelRegistration);
router.post('/:id/enroll', authenticate, enrollWorkshop); // back-compat alias

// Admin only — manage a specific workshop
router.put('/:id', authenticate, requireAdmin, updateWorkshop);
router.delete('/:id', authenticate, requireAdmin, deleteWorkshop);
router.get('/:id/registrations', authenticate, requireAdmin, getWorkshopRegistrations);
router.patch('/:id/registrations/:regId', authenticate, requireAdmin, updateRegistrationStatus);

export default router;
