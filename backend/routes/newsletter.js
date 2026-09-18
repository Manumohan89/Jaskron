import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { generalLimiter } from '../middleware/rateLimiter.js';
import { Subscriber } from '../models/Subscriber.js';

const router = Router();

router.post('/subscribe', generalLimiter, async (req, res) => {
  try {
    const { email, source } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'A valid email is required' });
    }
    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
      }
      return res.json({ message: "You're already subscribed!" });
    }
    await Subscriber.create({ email: email.toLowerCase(), source: source || 'footer' });
    res.status(201).json({ message: 'Subscribed! Watch your inbox for our security digest.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/unsubscribe', generalLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    await Subscriber.findOneAndUpdate({ email: (email || '').toLowerCase() }, { isActive: false });
    res.json({ message: 'You have been unsubscribed.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: list + export subscribers
router.get('/admin/subscribers', authenticate, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, parseInt(req.query.limit) || 50);
    const filter = { isActive: true };
    const [subscribers, total] = await Promise.all([
      Subscriber.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Subscriber.countDocuments(filter)
    ]);
    res.json({ subscribers, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/admin/subscribers/export.csv', authenticate, requireAdmin, async (_req, res) => {
  try {
    const subscribers = await Subscriber.find({ isActive: true }).sort({ createdAt: -1 });
    const rows = ['email,source,subscribed_at', ...subscribers.map((s) => `${s.email},${s.source},${s.createdAt.toISOString()}`)];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');
    res.send(rows.join('\n'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
