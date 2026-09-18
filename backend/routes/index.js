import { Router } from 'express';
import authRouter from './auth.js';
import usersRouter from './users.js';
import servicesRouter from './services.js';
import workshopsRouter from './workshops.js';
import teamRouter from './team.js';
import contactsRouter from './contacts.js';
import adminRouter from './admin.js';
import certificatesRouter from './certificates.js';
import notificationsRouter from './notifications.js';
import resourcesRouter from './resources.js';
import testimonialsRouter from './testimonials.js';
import blogRouter from './blog.js';
import paymentsRouter from './payments.js';
import checkinRouter from './checkin.js';
import aiRouter from './ai.js';
import partnersRouter from './partners.js';
import caseStudiesRouter from './caseStudies.js';
import newsletterRouter from './newsletter.js';
import enterpriseRouter from './enterprise.js';
import scorecardRouter from './scorecard.js';
import coursesRouter from './courses.js';
import examsRouter from './exams.js';
import internshipsRouter from './internships.js';
import batchesRouter from './batches.js';
import galleryRouter from './gallery.js';
import careersRouter from './careers.js';
import bookingsRouter from './bookings.js';

const router = Router();
router.use('/api/auth', authRouter);
router.use('/api/users', usersRouter);
router.use('/api/services', servicesRouter);
router.use('/api/workshops', workshopsRouter);
router.use('/api/team', teamRouter);
router.use('/api/contacts', contactsRouter);
router.use('/api/admin', adminRouter);
router.use('/api/certificates', certificatesRouter);
router.use('/api/notifications', notificationsRouter);
router.use('/api/resources', resourcesRouter);
router.use('/api/testimonials', testimonialsRouter);
router.use('/api/blog', blogRouter);
router.use('/api/payments', paymentsRouter);
router.use('/api/checkin', checkinRouter);
router.use('/api/ai', aiRouter);
router.use('/api/partners', partnersRouter);
router.use('/api/case-studies', caseStudiesRouter);
router.use('/api/newsletter', newsletterRouter);
router.use('/api/enterprise', enterpriseRouter);
router.use('/api/scorecard', scorecardRouter);
router.use('/api/courses', coursesRouter);
router.use('/api/exams', examsRouter);
router.use('/api/internships', internshipsRouter);
router.use('/api/batches', batchesRouter);
router.use('/api/gallery', galleryRouter);
router.use('/api/careers', careersRouter);
router.use('/api/bookings', bookingsRouter);

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'JASKRON Technologies Pvt. Ltd. API running'
  });
});
export default router;
