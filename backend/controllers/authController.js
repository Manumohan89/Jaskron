import crypto from 'crypto';
import { User } from '../models/User.js';
import { createToken, createRefreshToken, verifyToken } from '../middleware/auth.js';
import { sendMail, welcomeEmail, passwordResetEmail, otpVerificationEmail } from '../utils/email.js';

const MAX_SESSIONS = 8; // cap stored sessions per user so the array can't grow unbounded

function generateOtp() {
  return String(crypto.randomInt(100000, 999999));
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

// New-account signups log straight in — no OTP step, in every environment.
// This only affects registration/email verification; it is intentionally
// separate from admin login 2FA below, which still emails a login code.
function otpBypassEnabled() {
  return true;
}

// Issues a fresh access+refresh token pair AND records the session server-side
// (activeSessions) so "log out of all devices" can actually revoke it later —
// refresh tokens are otherwise stateless HMACs with no server-side record.
async function issueTokensWithSession(user, req) {
  const jti = crypto.randomUUID();
  const claims = { id: user._id, role: user.role, name: user.name, email: user.email, jti };
  const token = createToken(claims);
  const refreshToken = createRefreshToken(claims, jti);

  user.activeSessions = user.activeSessions || [];
  user.activeSessions.push({ jti, userAgent: req?.headers?.['user-agent']?.slice(0, 200) || 'Unknown device', createdAt: new Date(), lastUsedAt: new Date() });
  if (user.activeSessions.length > MAX_SESSIONS) {
    user.activeSessions = user.activeSessions.slice(-MAX_SESSIONS);
  }
  await user.save();

  return { token, refreshToken };
}

// Registration: create the account, mark it verified immediately, and log
// the user straight in with tokens — no OTP step. A welcome email still goes
// out, but it's informational, not a gate.
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, organization } = req.body;
    const existing = await User.findOne({ email });

    if (existing) {
      if (existing.emailVerified) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      // A row left over from before this change (created but never verified).
      // Finish it off the same way a fresh signup would.
      existing.emailVerified = true;
      existing.name = name || existing.name;
      if (password) existing.password = password;
      existing.lastLogin = new Date();
      const { token, refreshToken } = await issueTokensWithSession(existing, req);
      return res.status(200).json({
        token, refreshToken,
        user: { id: existing._id, name: existing.name, email: existing.email, role: existing.role }
      });
    }

    const user = new User({ name, email, password, phone, organization, emailVerified: true });
    user.lastLogin = new Date();
    await user.save();
    sendMail({ to: user.email, subject: 'Welcome to JASKRON Technologies Pvt. Ltd.', html: welcomeEmail(user.name) });
    const { token, refreshToken } = await issueTokensWithSession(user, req);
    res.status(201).json({
      token, refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Step 2 of registration: confirm the OTP, mark the account verified, and log the user in.
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and code are required' });

    const user = await User.findOne({ email }).select('+otpCodeHash +otpExpires +otpAttempts');
    if (!user) return res.status(404).json({ message: 'No pending registration found for this email' });
    if (user.emailVerified) return res.status(400).json({ message: 'This email is already verified — please log in.' });

    if (!user.otpCodeHash || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Code expired. Please request a new one.', code: 'OTP_EXPIRED' });
    }
    if (user.otpAttempts >= 5) {
      return res.status(429).json({ message: 'Too many incorrect attempts. Please request a new code.', code: 'OTP_LOCKED' });
    }
    if (hashOtp(String(otp)) !== user.otpCodeHash) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: 'Incorrect code. Please try again.' });
    }

    user.emailVerified = true;
    user.otpCodeHash = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.lastLogin = new Date();

    sendMail({ to: user.email, subject: 'Welcome to JASKRON Technologies Pvt. Ltd.', html: welcomeEmail(user.name) });

    const { token, refreshToken } = await issueTokensWithSession(user, req);
    res.json({
      message: 'Email verified successfully',
      token,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Resend a fresh registration OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.emailVerified) {
      return res.json({ message: 'If a pending registration exists for this email, a new code has been sent.' });
    }
    const otp = generateOtp();
    user.otpCodeHash = hashOtp(otp);
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otpAttempts = 0;
    await user.save();
    sendMail({ to: user.email, subject: 'Your new verification code — JASKRON Technologies Pvt. Ltd.', html: otpVerificationEmail(user.name, otp) });
    res.json({ message: 'If a pending registration exists for this email, a new code has been sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login step 1: verify credentials. Admins (and anyone with 2FA enabled) get a
// login OTP emailed instead of tokens; everyone else logs straight in.
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Registration no longer requires OTP verification, so this should never
    // trip for accounts created going forward — kept only for any pre-existing
    // unverified rows from before this change.
    if (!user.emailVerified && !otpBypassEnabled()) {
      return res.status(403).json({ message: 'Please verify your email before logging in.', code: 'EMAIL_NOT_VERIFIED', email: user.email });
    }
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' });

    // Login no longer requires a 2FA email code for any role — admin or not.
    // Signing in is direct; role alone decides where the app sends the user
    // afterwards (an admin lands on the admin dashboard, everyone else on
    // their regular dashboard).
    if (!user.emailVerified) user.emailVerified = true;
    user.lastLogin = new Date();
    const { token, refreshToken } = await issueTokensWithSession(user, req);
    res.json({
      token,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login step 2 (2FA accounts only): confirm the emailed login code and issue tokens.
export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select('+loginOtpHash +loginOtpExpires');
    if (!user) return res.status(404).json({ message: 'Account not found' });
    if (!user.loginOtpHash || !user.loginOtpExpires || user.loginOtpExpires < new Date()) {
      return res.status(400).json({ message: 'Code expired. Please log in again.', code: 'OTP_EXPIRED' });
    }
    if (hashOtp(String(otp)) !== user.loginOtpHash) {
      return res.status(400).json({ message: 'Incorrect code. Please try again.' });
    }

    user.loginOtpHash = undefined;
    user.loginOtpExpires = undefined;
    user.lastLogin = new Date();
    const { token, refreshToken } = await issueTokensWithSession(user, req);
    res.json({
      token,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Exchanges a valid refresh token for a fresh access token, rotating the
// session's jti. If the session was revoked (e.g. via "log out of all
// devices"), the refresh is rejected even though the token itself is still
// cryptographically valid.
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'refreshToken is required' });
    const payload = verifyToken(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
    const user = await User.findById(payload.id);
    if (!user || !user.isActive) return res.status(401).json({ message: 'User not found or deactivated' });

    const session = (user.activeSessions || []).find((s) => s.jti === payload.jti);
    if (!session) {
      return res.status(401).json({ message: 'Session has been revoked. Please log in again.', code: 'SESSION_REVOKED' });
    }

    // Rotate: drop the old session record, issue a new token pair + jti
    user.activeSessions = user.activeSessions.filter((s) => s.jti !== payload.jti);
    const { token, refreshToken: newRefreshToken } = await issueTokensWithSession(user, req);
    res.json({ token, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ message: 'If that email is registered, a reset link has been sent.' });

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${rawToken}`;
    await sendMail({ to: user.email, subject: 'Reset your password', html: passwordResetEmail(user.name, resetUrl) });

    res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() }
    }).select('+resetPasswordToken +resetPasswordExpires');
    if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    // A password reset invalidates every existing session — if someone else had
    // access, this locks them out too.
    user.activeSessions = [];
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List this user's active sessions/devices (for a "Sessions" settings screen)
export const getSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json((user.activeSessions || []).map((s) => ({
      id: s._id,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      lastUsedAt: s.lastUsedAt,
      isCurrent: s.jti === req.currentJti
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Revoke a single session by id
export const revokeSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.activeSessions = (user.activeSessions || []).filter((s) => String(s._id) !== req.params.id);
    await user.save();
    res.json({ message: 'Session revoked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Log out of all devices — clears every active session at once
export const logoutAll = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.activeSessions = [];
    await user.save();
    res.json({ message: 'Logged out of all devices' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
