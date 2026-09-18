import { Router } from 'express';
import { authenticate, requireAdmin, verifyToken } from '../middleware/auth.js';
import { uploadLessonVideoFile } from '../middleware/upload.js';
import {
  getCourses,
  getCourse,
  enrollInCourse,
  getMyEnrollments,
  updateProgress,
  reviewCourse,
  adminListCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  courseEnrollments,
  uploadLessonVideo
} from '../controllers/courseController.js';

const router = Router();

/** Attaches req.user when a token is present, but never rejects. */
function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    const payload = verifyToken(header.slice(7));
    if (payload) req.user = payload;
  }
  next();
}

// Learner-scoped routes must come before "/:id"
router.get('/me/enrollments', authenticate, getMyEnrollments);

// Admin
router.get('/admin/all', authenticate, requireAdmin, adminListCourses);
router.post('/upload-video', authenticate, requireAdmin, (req, res, next) => {
  uploadLessonVideoFile(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, uploadLessonVideo);
router.post('/', authenticate, requireAdmin, createCourse);
router.put('/:id', authenticate, requireAdmin, updateCourse);
router.delete('/:id', authenticate, requireAdmin, deleteCourse);
router.get('/:id/enrollments', authenticate, requireAdmin, courseEnrollments);

// Public catalog
router.get('/', optionalAuth, getCourses);
router.get('/:id', optionalAuth, getCourse);

// Learner actions
router.post('/:id/enroll', authenticate, enrollInCourse);
router.post('/:id/progress', authenticate, updateProgress);
router.post('/:id/review', authenticate, reviewCourse);

export default router;
