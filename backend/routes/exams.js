import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  adminListExams,
  adminGetExam,
  createExam,
  updateExam,
  regenerateCode,
  deleteExam,
  examResults,
  lookupExam,
  startExam,
  submitExam,
  getAttempt,
  myAttempts
} from '../controllers/examController.js';

const router = Router();

// Student — exam-code flow
router.post('/lookup', authenticate, lookupExam);
router.post('/start', authenticate, startExam);
router.post('/attempt/:attemptId/submit', authenticate, submitExam);
router.get('/attempt/:attemptId', authenticate, getAttempt);
router.get('/me/attempts', authenticate, myAttempts);

// Admin — authoring and results
router.get('/admin/all', authenticate, requireAdmin, adminListExams);
router.get('/admin/:id', authenticate, requireAdmin, adminGetExam);
router.post('/', authenticate, requireAdmin, createExam);
router.put('/:id', authenticate, requireAdmin, updateExam);
router.post('/:id/regenerate-code', authenticate, requireAdmin, regenerateCode);
router.delete('/:id', authenticate, requireAdmin, deleteExam);
router.get('/:id/results', authenticate, requireAdmin, examResults);

export default router;
