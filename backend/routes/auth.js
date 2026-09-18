import { Router } from 'express';
import {
  register, login, getMe, refresh, forgotPassword, resetPassword, changePassword,
  verifyOtp, resendOtp, verifyLoginOtp, getSessions, revokeSession, logoutAll
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import {
  registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema,
  changePasswordSchema, verifyOtpSchema, resendOtpSchema, verifyLoginOtpSchema
} from '../schemas/authSchemas.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), verifyOtp);
router.post('/resend-otp', authLimiter, validate(resendOtpSchema), resendOtp);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/verify-login-otp', authLimiter, validate(verifyLoginOtpSchema), verifyLoginOtp);
router.post('/refresh', refresh);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);

// Session / device management
router.get('/sessions', authenticate, getSessions);
router.delete('/sessions/:id', authenticate, revokeSession);
router.post('/logout-all', authenticate, logoutAll);

export default router;
