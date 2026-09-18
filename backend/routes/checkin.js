import { Router } from 'express';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { Workshop } from '../models/Workshop.js';
import { notifyUser } from '../utils/notify.js';

const router = Router();

// Admin/instructor: get (or lazily generate) the QR check-in code image for a workshop
router.get('/workshops/:id/qr', authenticate, requireAdmin, async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    if (!workshop.checkInCode) {
      workshop.checkInCode = crypto.randomBytes(12).toString('hex');
      await workshop.save();
    }
    const payload = JSON.stringify({ workshopId: workshop._id.toString(), code: workshop.checkInCode });
    const dataUrl = await QRCode.toDataURL(payload, { width: 320, margin: 1 });
    res.json({ qrDataUrl: dataUrl, checkInCode: workshop.checkInCode });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin/instructor scans (or manually enters) a participant's user ID + the workshop's code
router.post('/workshops/:id/check-in', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId, code } = req.body;
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    if (!workshop.checkInCode || workshop.checkInCode !== code) {
      return res.status(400).json({ message: 'Invalid or stale QR code for this workshop' });
    }
    const reg = workshop.registrations.find((r) => r.user.toString() === userId);
    if (!reg) return res.status(404).json({ message: 'This user is not registered for this workshop' });
    if (reg.status === 'cancelled') return res.status(400).json({ message: 'This registration was cancelled' });

    reg.status = 'attended';
    reg.checkedInAt = new Date();
    await workshop.save();

    notifyUser(userId, {
      title: 'Checked in!',
      message: `You've been checked in to "${workshop.title}". Your certificate can now be issued.`,
      type: 'workshop'
    });

    res.json({ message: 'Checked in successfully', registration: reg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
