import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { CaseStudy } from '../models/CaseStudy.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 9);
    const filter = { status: 'published' };
    const [caseStudies, total] = await Promise.all([
      CaseStudy.find(filter).sort({ publishedAt: -1 }).skip((page - 1) * limit).limit(limit),
      CaseStudy.countDocuments(filter)
    ]);
    res.json({ caseStudies, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/admin/all', authenticate, requireAdmin, async (_req, res) => {
  try {
    const caseStudies = await CaseStudy.find().sort({ createdAt: -1 });
    res.json(caseStudies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const caseStudy = await CaseStudy.findOne({ slug: req.params.slug, status: 'published' });
    if (!caseStudy) return res.status(404).json({ message: 'Case study not found' });
    res.json(caseStudy);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const caseStudy = await CaseStudy.create(req.body);
    res.status(201).json(caseStudy);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const caseStudy = await CaseStudy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!caseStudy) return res.status(404).json({ message: 'Not found' });
    res.json(caseStudy);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await CaseStudy.findByIdAndDelete(req.params.id);
    res.json({ message: 'Case study deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
