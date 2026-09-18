import { Router } from 'express';
import mongoose from 'mongoose';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Contact } from '../models/Contact.js';
import { Workshop } from '../models/Workshop.js';
import { Service } from '../models/Service.js';
import { Certificate } from '../models/Certificate.js';
import { ServiceRequest } from '../models/ServiceRequest.js';
import { Resource } from '../models/Resource.js';
import { BlogPost } from '../models/BlogPost.js';
import { Testimonial } from '../models/Testimonial.js';

const router = Router();
router.use(authenticate, requireAdmin);

// Dashboard stats
router.get('/stats', async (_req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfPrevWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [
      totalUsers,
      activeUsers,
      totalContacts,
      totalWorkshops,
      totalServices,
      totalCertificates,
      pendingServiceRequests,
      totalResources,
      publishedPosts,
      recentContacts,
      newUsersThisWeek,
      newUsersPrevWeek,
      contactsThisWeek,
      contactsPrevWeek,
      certificatesThisWeek,
      certificatesPrevWeek,
      monthlySignups,
      recentCertificates,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Contact.countDocuments(),
      Workshop.countDocuments(),
      Service.countDocuments(),
      Certificate.countDocuments({ status: 'active' }),
      ServiceRequest.countDocuments({ status: 'pending' }),
      Resource.countDocuments(),
      BlogPost.countDocuments({ status: 'published' }),
      Contact.find().sort({ createdAt: -1 }).limit(5),
      User.countDocuments({ createdAt: { $gte: startOfWeek } }),
      User.countDocuments({ createdAt: { $gte: startOfPrevWeek, $lt: startOfWeek } }),
      Contact.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Contact.countDocuments({ createdAt: { $gte: startOfPrevWeek, $lt: startOfWeek } }),
      Certificate.countDocuments({ issueDate: { $gte: startOfWeek } }),
      Certificate.countDocuments({ issueDate: { $gte: startOfPrevWeek, $lt: startOfWeek } }),
      User.aggregate([
        { $match: { createdAt: { $gte: twelveMonthsAgo } } },
        { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.y': 1, '_id.m': 1 } }
      ]),
      Certificate.find({ status: 'active' }).sort({ issueDate: -1 }).limit(5).select('recipientName courseTitle issueDate certificateId'),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt role')
    ]);

    // Build a full 12-month series (fill months with no signups as 0)
    const monthLabels = [];
    const monthMap = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      monthLabels.push({ key, label: d.toLocaleString('en-US', { month: 'short' }) });
      monthMap[key] = 0;
    }
    monthlySignups.forEach((row) => {
      const key = `${row._id.y}-${row._id.m}`;
      if (key in monthMap) monthMap[key] = row.count;
    });
    const userGrowth = monthLabels.map((m) => ({ month: m.label, count: monthMap[m.key] }));

    const pctDelta = (curr, prev) => {
      if (prev === 0) return curr > 0 ? '+100%' : '0%';
      const pct = Math.round(((curr - prev) / prev) * 100);
      return `${pct >= 0 ? '+' : ''}${pct}%`;
    };

    res.json({
      totalUsers,
      activeUsers,
      totalContacts,
      totalWorkshops,
      totalServices,
      totalCertificates,
      pendingServiceRequests,
      totalResources,
      publishedPosts,
      recentContacts,
      recentCertificates,
      recentUsers,
      userGrowth,
      deltas: {
        users: pctDelta(newUsersThisWeek, newUsersPrevWeek),
        contacts: pctDelta(contactsThisWeek, contactsPrevWeek),
        certificates: pctDelta(certificatesThisWeek, certificatesPrevWeek)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Real activity feed — merges recent events from actual collections
// (replaces the old hardcoded fake "security log" demo data)
router.get('/activity', async (req, res) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const [users, certificates, workshops, contacts] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(limit).select('name email createdAt'),
      Certificate.find({ status: 'active' }).sort({ issueDate: -1 }).limit(limit).select('recipientName courseTitle issueDate'),
      Workshop.find().sort({ createdAt: -1 }).limit(limit).select('title createdAt instructor'),
      Contact.find().sort({ createdAt: -1 }).limit(limit).select('name subject createdAt')
    ]);

    const events = [
      ...users.map((u) => ({
        type: 'user_registered',
        level: 'info',
        time: u.createdAt,
        message: `New user registered: ${u.email}`
      })),
      ...certificates.map((c) => ({
        type: 'certificate_issued',
        level: 'info',
        time: c.issueDate,
        message: `Certificate issued to ${c.recipientName} for "${c.courseTitle}"`
      })),
      ...workshops.map((w) => ({
        type: 'workshop_created',
        level: 'info',
        time: w.createdAt,
        message: `Workshop created: "${w.title}" (${w.instructor})`
      })),
      ...contacts.map((c) => ({
        type: 'contact_submitted',
        level: 'info',
        time: c.createdAt,
        message: `Contact form submitted by ${c.name}: "${c.subject}"`
      }))
    ]
      .filter((e) => e.time)
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, limit);

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Real system/config info (replaces hardcoded fake "Site Information" panel)
router.get('/system-info', async (_req, res) => {
  try {
    const dbStateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.json({
      environment: process.env.NODE_ENV || 'development',
      dbStatus: dbStateMap[mongoose.connection.readyState] ?? 'unknown',
      dbName: mongoose.connection.name || null,
      serverUptimeSeconds: Math.floor(process.uptime()),
      accessTokenTtl: '15 minutes',
      refreshTokenTtl: '7 days',
      rateLimit: '5 attempts / 15 minutes on auth routes',
      emailConfigured: Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      paymentsConfigured: Boolean(process.env.RAZORPAY_KEY_ID),
      aiAdvisorConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
      nodeVersion: process.version
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper: build a paginated, searched response
function paginate(query, { page, limit }) {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 10));
  return { p, l, skip: (p - 1) * l };
}

// Manage users — now with working search + pagination (10 per page)
router.get('/users', async (req, res) => {
  try {
    const { search, page, limit } = req.query;
    const { p, l, skip } = paginate({}, { page, limit });
    const filter = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(l),
      User.countDocuments(filter)
    ]);
    res.json({ users, total, page: p, pages: Math.ceil(total / l) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Full detail on one user — workshops, certificates, service requests
router.get('/users/:id/detail', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const [workshops, certificates, serviceRequests] = await Promise.all([
      Workshop.find({ 'registrations.user': user._id }).select('title date level status registrations'),
      Certificate.find({ user: user._id, status: 'active' }).populate('workshop', 'title'),
      ServiceRequest.find({ user: user._id }).populate('service', 'title')
    ]);

    const workshopSummary = workshops.map((w) => {
      const reg = w.registrations.find((r) => r.user.toString() === user._id.toString());
      return {
        _id: w._id,
        title: w.title,
        date: w.date,
        level: w.level,
        status: reg?.status
      };
    });

    res.json({ user, workshops: workshopSummary, certificates, serviceRequests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/users/:id', async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role, isActive }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
