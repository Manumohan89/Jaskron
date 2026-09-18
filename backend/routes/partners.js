import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { Partner } from '../models/Partner.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const partners = await Partner.find({ isPublished: true }).sort({ order: 1, createdAt: -1 });
    res.json(partners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/admin/all', authenticate, requireAdmin, async (_req, res) => {
  try {
    const partners = await Partner.find().sort({ order: 1, createdAt: -1 });
    res.json(partners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const partner = await Partner.create(req.body);
    res.status(201).json(partner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!partner) return res.status(404).json({ message: 'Not found' });
    res.json(partner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await Partner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Partner removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
