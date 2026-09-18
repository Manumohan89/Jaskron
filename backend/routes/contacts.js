import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { generalLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { contactSchema } from '../schemas/authSchemas.js';
import { getContacts, getContactById, createContact, updateContactStatus, deleteContact } from '../controllers/contactController.js';

const router = Router();

// Public: submit the contact form
router.post('/', generalLimiter, validate(contactSchema), createContact);

// Admin only: everything else (previously this was wide open — anyone could read all
// contact submissions without logging in, which leaked customer PII)
router.get('/', authenticate, requireAdmin, getContacts);
router.get('/:id', authenticate, requireAdmin, getContactById);
router.patch('/:id/status', authenticate, requireAdmin, updateContactStatus);
router.delete('/:id', authenticate, requireAdmin, deleteContact);

export default router;
