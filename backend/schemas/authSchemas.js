import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  organization: z.string().trim().max(150).optional().or(z.literal(''))
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128)
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(128)
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  otp: z.string().trim().regex(/^\d{6}$/, 'Code must be 6 digits')
});

export const verifyLoginOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  otp: z.string().trim().regex(/^\d{6}$/, 'Code must be 6 digits')
});

export const resendOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase()
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().toLowerCase(),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  organization: z.string().trim().max(200).optional().or(z.literal('')),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(5).max(5000)
});
