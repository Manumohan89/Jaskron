import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoPath = path.resolve(__dirname, '../../frontend/public/logo-full.png');
const logoCid = 'jaskron-logo';

// GoDaddy Professional Email SMTP. Override the host/port/SSL settings through
// SMTP_HOST, SMTP_PORT, and SMTP_SECURE when deploying to another provider.
let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim();
  if (!emailUser || !emailPass) {
    return null;
  }
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
    throw new Error('SMTP_PORT must be a valid TCP port number.');
  }
  const smtpSecure = String(process.env.SMTP_SECURE ?? (smtpPort === 465)).trim().toLowerCase() === 'true';
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST?.trim() || 'smtpout.secureserver.net',
    port: smtpPort,
    secure: smtpSecure,
    requireTLS: !smtpSecure,
    auth: { user: emailUser, pass: emailPass }
  });
  return transporter;
}

export async function sendMail({ to, subject, html, attachments }) {
  const t = getTransporter();
  if (!t) {
    throw new Error('Email service is not configured. Set EMAIL_USER, EMAIL_PASS, and SMTP settings.');
  }
  const emailAttachments = [...(attachments || [])];
  if (fs.existsSync(logoPath)) {
    emailAttachments.push({ filename: 'jaskron-logo.png', path: logoPath, cid: logoCid });
  }
  return t.sendMail({
    from: process.env.EMAIL_FROM?.trim() || `"JASKRON Technologies Pvt. Ltd." <${process.env.EMAIL_USER.trim()}>`,
    to,
    subject,
    html,
    attachments: emailAttachments
  });
}

const siteUrl = (process.env.FRONTEND_URL || 'https://jaskron.com').replace(/\/+$/, '');
function brandedEmail(content) {
  return `
    <!doctype html>
    <html lang="en">
      <body style="margin:0;background:#f4f6f8;color:#17202a;font-family:Arial,Helvetica,sans-serif">
        <div style="display:none;max-height:0;overflow:hidden;color:transparent">${content.preheader || 'JASKRON Technologies notification'}</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f8;padding:32px 12px">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
                <tr>
                  <td style="background:#0a0e14;padding:22px 28px;border-bottom:4px solid #f2721f">
                    <a href="${siteUrl}" style="text-decoration:none">
                      <img src="cid:${logoCid}" width="190" alt="JASKRON Technologies Pvt. Ltd." style="display:block;width:190px;max-width:100%;height:auto;border:0" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:34px 32px 30px">
                    ${content.body}
                  </td>
                </tr>
                <tr>
                  <td style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:22px 28px;text-align:center">
                    <p style="margin:0 0 8px;color:#475569;font-size:12px;line-height:1.5">JASKRON Technologies Pvt. Ltd.</p>
                    <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.5">Learn &middot; Build &middot; Innovate</p>
                    <p style="margin:10px 0 0;color:#94a3b8;font-size:11px;line-height:1.5">This is an automated message. Please do not reply directly to this email.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;
}

export function welcomeEmail(name) {
  return brandedEmail({
    preheader: 'Welcome to JASKRON Technologies Pvt. Ltd.',
    body: `<h1 style="margin:0 0 16px;color:#0f172a;font-size:24px;line-height:1.3">Welcome, ${name}!</h1>
      <p style="margin:0 0 14px;color:#475569;font-size:15px;line-height:1.7">Your account has been created successfully. You can now browse workshops, register for training, and download your certificates from your dashboard.</p>
      <p style="margin:22px 0 0;color:#64748b;font-size:13px;line-height:1.6">If you did not create this account, please contact support immediately.</p>`
  });
}

export function workshopConfirmationEmail(name, workshop) {
  return brandedEmail({
    preheader: `Your seat for ${workshop.title} is confirmed`,
    body: `<h1 style="margin:0 0 16px;color:#0f172a;font-size:24px;line-height:1.3">You're registered!</h1>
      <p style="margin:0 0 14px;color:#475569;font-size:15px;line-height:1.7">Hi ${name}, your seat for <strong>${workshop.title}</strong> is confirmed.</p>
      <p style="margin:18px 0;color:#334155;font-size:14px;line-height:1.7"><strong>Date:</strong> ${new Date(workshop.date).toLocaleString()}<br/><strong>Instructor:</strong> ${workshop.instructor}</p>
      <p style="margin:22px 0 0;color:#64748b;font-size:13px;line-height:1.6">A calendar invite is attached. Add it to your calendar so you don't miss it.</p>`
  });
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
  return brandedEmail({
    preheader: `New contact form submission from ${contact.name}`,
    body: `<h1 style="margin:0 0 20px;color:#0f172a;font-size:24px;line-height:1.3">New contact form submission</h1>
      <p style="margin:0 0 10px;color:#334155;font-size:14px;line-height:1.7"><strong>${contact.name}</strong> (${contact.email})</p>
      <p style="margin:0 0 10px;color:#334155;font-size:14px;line-height:1.7"><strong>${contact.subject}</strong></p>
      <div style="margin-top:18px;padding:16px;background:#f8fafc;border-left:3px solid #f2721f;color:#475569;font-size:14px;line-height:1.7">${contact.message}</div>`
  });
}

export function certificateIssuedEmail(name, certificate) {
  const verifyUrl = `${siteUrl}/verify/${certificate.certificateId}`;
  return brandedEmail({
    preheader: `Your certificate for ${certificate.courseTitle} is ready`,
    body: `<h1 style="margin:0 0 16px;color:#0f172a;font-size:24px;line-height:1.3">Your certificate is ready</h1>
      <p style="margin:0 0 14px;color:#475569;font-size:15px;line-height:1.7">Hi ${name}, your certificate for <strong>${certificate.courseTitle}</strong> has been issued.</p>
      <p style="margin:18px 0;color:#334155;font-size:14px;line-height:1.7">Certificate ID: <strong>${certificate.certificateId}</strong></p>
      <p style="margin:24px 0 0"><a href="${verifyUrl}" style="display:inline-block;background:#f2721f;color:#ffffff;padding:12px 18px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:700">View and verify certificate</a></p>`
  });
}

export function passwordResetEmail(name, resetUrl) {
  return brandedEmail({
    preheader: 'Reset your JASKRON account password',
    body: `<h1 style="margin:0 0 16px;color:#0f172a;font-size:24px;line-height:1.3">Reset your password</h1>
      <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7">Hi ${name}, click the button below to choose a new password. This link expires in 1 hour.</p>
      <p style="margin:0 0 22px"><a href="${resetUrl}" style="display:inline-block;background:#f2721f;color:#ffffff;padding:12px 18px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:700">Reset password</a></p>
      <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6">If you did not request this, you can safely ignore this email.</p>`
  });
}

export function otpVerificationEmail(name, otp) {
  return brandedEmail({
    preheader: 'Your JASKRON email verification code',
    body: `<h1 style="margin:0 0 16px;color:#0f172a;font-size:24px;line-height:1.3">Verify your email</h1>
      <p style="margin:0 0 18px;color:#475569;font-size:15px;line-height:1.7">Hi ${name}, use the verification code below to finish creating your account. It expires in 10 minutes.</p>
      <div style="margin:24px 0;text-align:center"><span style="display:inline-block;background:#f2721f;color:#ffffff;padding:14px 24px;border-radius:8px;font-size:32px;font-weight:700;letter-spacing:10px">${otp}</span></div>
      <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6">If you did not try to create an account, you can safely ignore this email.</p>`
  });
}

export function loginOtpEmail(name, otp) {
  return brandedEmail({
    preheader: 'Your JASKRON login verification code',
    body: `<h1 style="margin:0 0 16px;color:#0f172a;font-size:24px;line-height:1.3">Your login code</h1>
      <p style="margin:0 0 18px;color:#475569;font-size:15px;line-height:1.7">Hi ${name}, someone is trying to sign in to your account. If this was you, use the code below. It expires in 10 minutes.</p>
      <div style="margin:24px 0;text-align:center"><span style="display:inline-block;background:#f2721f;color:#ffffff;padding:14px 24px;border-radius:8px;font-size:32px;font-weight:700;letter-spacing:10px">${otp}</span></div>
      <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6">If this was not you, change your password immediately and contact support.</p>`
  });
}
