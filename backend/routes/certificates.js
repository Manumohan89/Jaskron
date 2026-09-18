import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  generateCertificate,
  getMyCertificates,
  getAllCertificates,
  verifyCertificate,
  revokeCertificate
} from '../controllers/certificateController.js';

const router = Router();

// Public verification (no auth) — for verification links
router.get('/verify/:certificateId', verifyCertificate);

// Logged-in user: their own certificates
router.get('/mine', authenticate, getMyCertificates);

// Admin only
router.get('/', authenticate, requireAdmin, getAllCertificates);
router.post('/', authenticate, requireAdmin, generateCertificate);
router.patch('/:id/revoke', authenticate, requireAdmin, revokeCertificate);

export default router;
