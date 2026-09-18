import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { generalLimiter } from '../middleware/rateLimiter.js';
import { EnterpriseInquiry } from '../models/EnterpriseInquiry.js';
import { User } from '../models/User.js';
import { sendMail } from '../utils/email.js';
import { notifyUser } from '../utils/notify.js';

const router = Router();

router.post('/inquiries', generalLimiter, async (req, res) => {
  try {
    const { companyName, contactName, email, phone, teamSize, message } = req.body;
    if (!companyName || !contactName || !email || !message) {
      return res.status(400).json({ message: 'Company name, contact name, email, and message are required' });
    }
    const inquiry = await EnterpriseInquiry.create({ companyName, contactName, email, phone, teamSize, message });

    const admins = await User.find({ role: 'admin' });
    await Promise.all(admins.map((admin) => Promise.all([
      sendMail({
        to: admin.email,
        subject: `New enterprise inquiry: ${companyName}`,
        html: `<div style="font-family:sans-serif"><h2>New enterprise inquiry</h2><p><strong>${companyName}</strong> — ${contactName} (${email})</p><p>Team size: ${teamSize || 'n/a'}</p><p>${message}</p></div>`
      }),
      notifyUser(admin._id, {
        title: 'New enterprise inquiry',
        message: `${companyName} is interested in corporate training`,
        type: 'contact',
        link: '/admin?tab=enterprise'
      })
    ])));

    res.status(201).json(inquiry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/inquiries', authenticate, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const [inquiries, total] = await Promise.all([
      EnterpriseInquiry.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      EnterpriseInquiry.countDocuments()
    ]);
    res.json({ inquiries, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/inquiries/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const inquiry = await EnterpriseInquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!inquiry) return res.status(404).json({ message: 'Not found' });
    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
