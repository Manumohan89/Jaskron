import { Router } from 'express';
import { authenticate, requireAdmin, verifyToken } from '../middleware/auth.js';
import {
  getJobs, getJob, adminListJobs, createJob, updateJob, deleteJob,
  applyForJob, adminListJobApplications, updateJobApplication
} from '../controllers/siteController.js';

const router = Router();

function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    const payload = verifyToken(header.slice(7));
    if (payload) req.user = payload;
  }
  next();
}

router.get('/admin/all', authenticate, requireAdmin, adminListJobs);
router.get('/applications/all', authenticate, requireAdmin, adminListJobApplications);
router.patch('/applications/:id', authenticate, requireAdmin, updateJobApplication);
router.post('/', authenticate, requireAdmin, createJob);
router.put('/:id', authenticate, requireAdmin, updateJob);
router.delete('/:id', authenticate, requireAdmin, deleteJob);

router.get('/', optionalAuth, getJobs);
router.post('/:id/apply', optionalAuth, applyForJob);
router.get('/:slug', optionalAuth, getJob);

export default router;
