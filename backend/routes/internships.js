import { Router } from 'express';
import { authenticate, requireAdmin, verifyToken } from '../middleware/auth.js';
import {
  getInternships, getInternship, applyForInternship, getMyApplications,
  adminListInternships, createInternship, updateInternship, deleteInternship,
  adminListApplications, updateApplication
} from '../controllers/internshipController.js';

const router = Router();

function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    const payload = verifyToken(header.slice(7));
    if (payload) req.user = payload;
  }
  next();
}

// Learner-scoped (before /:id)
router.get('/me/applications', authenticate, getMyApplications);

// Admin
router.get('/admin/all', authenticate, requireAdmin, adminListInternships);
router.get('/applications/all', authenticate, requireAdmin, adminListApplications);
router.patch('/applications/:id', authenticate, requireAdmin, updateApplication);
router.post('/', authenticate, requireAdmin, createInternship);
router.put('/:id', authenticate, requireAdmin, updateInternship);
router.delete('/:id', authenticate, requireAdmin, deleteInternship);

// Public
router.get('/', optionalAuth, getInternships);
router.get('/:id', optionalAuth, getInternship);

// Student
router.post('/:id/apply', authenticate, applyForInternship);

export default router;
