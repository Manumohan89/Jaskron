import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  getMyBatches, adminListBatches, getBatch, createBatch, updateBatch, deleteBatch,
  addMember, updateMember, removeMember, approveAllForAssessment,
  issueMemberCertificate, issueBatchCertificates,
  addSession, updateSession, deleteSession
} from '../controllers/batchController.js';

const router = Router();

// Student — my cohorts, live classes, recordings, assessment access
router.get('/me', authenticate, getMyBatches);

// Admin
router.get('/', authenticate, requireAdmin, adminListBatches);
router.post('/', authenticate, requireAdmin, createBatch);
router.get('/:id', authenticate, requireAdmin, getBatch);
router.put('/:id', authenticate, requireAdmin, updateBatch);
router.delete('/:id', authenticate, requireAdmin, deleteBatch);

// Roster
router.post('/:id/members', authenticate, requireAdmin, addMember);
router.patch('/:id/members/:memberId', authenticate, requireAdmin, updateMember);
router.delete('/:id/members/:memberId', authenticate, requireAdmin, removeMember);
router.post('/:id/approve-all', authenticate, requireAdmin, approveAllForAssessment);

// Certificates
router.post('/:id/members/:memberId/certificate', authenticate, requireAdmin, issueMemberCertificate);
router.post('/:id/certificates', authenticate, requireAdmin, issueBatchCertificates);

// Live / recorded sessions
router.post('/:id/sessions', authenticate, requireAdmin, addSession);
router.patch('/:id/sessions/:sessionId', authenticate, requireAdmin, updateSession);
router.delete('/:id/sessions/:sessionId', authenticate, requireAdmin, deleteSession);

export default router;
