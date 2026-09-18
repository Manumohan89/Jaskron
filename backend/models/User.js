import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['admin', 'user', 'moderator'], default: 'user' },
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  phone: { type: String },
  organization: { type: String },
  bio: { type: String, maxlength: 500 },
  // Password reset flow
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },
  // Email verification via OTP sent at registration
  emailVerified: { type: Boolean, default: false },
  otpCodeHash: { type: String, select: false },
  otpExpires: { type: Date, select: false },
  otpAttempts: { type: Number, default: 0, select: false },
  // Login 2FA (email OTP) — required for admin accounts, optional opt-in for others
  twoFactorEnabled: { type: Boolean, default: false },
  loginOtpHash: { type: String, select: false },
  loginOtpExpires: { type: Date, select: false },
  // Active refresh-token sessions, so "log out of all devices" can actually revoke them
  // (refresh tokens are otherwise stateless HMACs with no server-side record)
  activeSessions: [{
    jti: { type: String },
    userAgent: { type: String },
    createdAt: { type: Date, default: Date.now },
    lastUsedAt: { type: Date, default: Date.now }
  }],
  // Notification / settings preferences
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    workshopReminders: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    language: { type: String, enum: ['en', 'hi', 'kn'], default: 'en' }
  }
}, { timestamps: true });

// bcrypt is slow-by-design (unlike SHA-256), which is what you want for passwords
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model('User', userSchema);
