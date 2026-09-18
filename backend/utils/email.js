import nodemailer from 'nodemailer';

// Just email + Gmail app password — no SMTP host/port to configure.
// EMAIL_USER is the Gmail address, EMAIL_PASS is a 16-character Gmail "App
// Password" (Google Account → Security → 2-Step Verification → App passwords).
// A normal Gmail login password will NOT work here; it has to be an app password.
// If unset, emails just log to console instead of failing — dev-friendly default.
let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  return transporter;
}

export async function sendMail({ to, subject, html, attachments }) {
  const t = getTransporter();
  if (!t) {
    console.log(`✉️  [email disabled — set EMAIL_USER/EMAIL_PASS in .env] Would send "${subject}" to ${to}`);
    return { skipped: true };
  }
  try {
    return await t.sendMail({
      from: process.env.EMAIL_FROM || `"JASKRON Technologies Pvt. Ltd." <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
    return { error: err.message };
  }
}

export function welcomeEmail(name) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:auto">
      <h2 style="color:#D9601A">Welcome to JASKRON Technologies Pvt. Ltd., ${name}!</h2>
      <p>Your account has been created. You can now browse workshops, register for training, and download your certificates from your dashboard.</p>
      <p style="color:#64748b;font-size:13px">If you didn't create this account, please contact support immediately.</p>
    </div>`;
}

export function workshopConfirmationEmail(name, workshop) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:auto">
      <h2 style="color:#D9601A">You're registered!</h2>
      <p>Hi ${name}, your seat for <strong>${workshop.title}</strong> is confirmed.</p>
      <p>📅 ${new Date(workshop.date).toLocaleString()}<br/>👤 Instructor: ${workshop.instructor}</p>
      <p style="color:#64748b;font-size:13px">A calendar invite (.ics) is attached — add it to your calendar so you don't miss it.</p>
    </div>`;
}

export function buildICS(workshop) {
  const start = new Date(workshop.date);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JASKRON Technologies Pvt. Ltd.//Workshop//EN',
    'BEGIN:VEVENT',
    `UID:${workshop._id}@jaskron.com`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${workshop.title}`,
    `DESCRIPTION:${(workshop.description || '').replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

export function contactAdminNotifyEmail(contact) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:auto">
      <h2 style="color:#D9601A">New contact form submission</h2>
      <p><strong>${contact.name}</strong> (${contact.email})</p>
      <p><strong>${contact.subject}</strong></p>
      <p>${contact.message}</p>
    </div>`;
}

export function certificateIssuedEmail(name, certificate) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:auto">
      <h2 style="color:#D9601A">Your certificate is ready 🎉</h2>
      <p>Hi ${name}, your certificate for <strong>${certificate.courseTitle}</strong> has been issued.</p>
      <p>Certificate ID: <strong>${certificate.certificateId}</strong></p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${certificate.certificateId}">View & verify your certificate</a></p>
    </div>`;
}

export function passwordResetEmail(name, resetUrl) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:auto">
      <h2 style="color:#D9601A">Reset your password</h2>
      <p>Hi ${name}, click the link below to reset your password. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}" style="background:#D9601A;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Reset Password</a></p>
      <p style="color:#64748b;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
    </div>`;
}

export function otpVerificationEmail(name, otp) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:auto">
      <h2 style="color:#D9601A">Verify your email</h2>
      <p>Hi ${name}, use the code below to verify your email and finish creating your account. It expires in 10 minutes.</p>
      <div style="text-align:center;margin:24px 0">
        <span style="display:inline-block;font-size:32px;font-weight:700;letter-spacing:10px;background:#D9601A;color:#fff;padding:14px 24px;border-radius:8px">${otp}</span>
      </div>
      <p style="color:#64748b;font-size:13px">If you didn't try to create an account, you can safely ignore this email.</p>
    </div>`;
}

export function loginOtpEmail(name, otp) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:auto">
      <h2 style="color:#D9601A">Your login code</h2>
      <p>Hi ${name}, someone is trying to sign in to your account. If this was you, use the code below. It expires in 10 minutes.</p>
      <div style="text-align:center;margin:24px 0">
        <span style="display:inline-block;font-size:32px;font-weight:700;letter-spacing:10px;background:#D9601A;color:#fff;padding:14px 24px;border-radius:8px">${otp}</span>
      </div>
      <p style="color:#64748b;font-size:13px">If this wasn't you, change your password immediately — someone else has it.</p>
    </div>`;
}
