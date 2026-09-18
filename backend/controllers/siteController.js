import { GalleryItem } from '../models/GalleryItem.js';
import { JobOpening } from '../models/JobOpening.js';
import { JobApplication } from '../models/JobApplication.js';
import { ResourcePersonBooking } from '../models/ResourcePersonBooking.js';

/* ================================== GALLERY ================================= */

// GET /api/gallery?category=
export async function getGallery(req, res) {
  try {
    const filter = { isPublished: true };
    if (req.query.category && req.query.category !== 'all') filter.category = req.query.category;
    const items = await GalleryItem.find(filter).sort({ isFeatured: -1, order: 1, takenOn: -1, createdAt: -1 });
    res.json(items);
  } catch {
    res.status(500).json({ message: 'Failed to fetch gallery' });
  }
}

export async function adminListGallery(_req, res) {
  try {
    res.json(await GalleryItem.find().sort({ order: 1, createdAt: -1 }));
  } catch {
    res.status(500).json({ message: 'Failed to fetch gallery' });
  }
}

export async function createGalleryItem(req, res) {
  try {
    if (!req.body.title || !req.body.imageUrl) {
      return res.status(400).json({ message: 'Title and image URL are required' });
    }
    const item = await GalleryItem.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to add photo' });
  }
}

export async function updateGalleryItem(req, res) {
  try {
    const item = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Photo not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update photo' });
  }
}

export async function deleteGalleryItem(req, res) {
  try {
    const item = await GalleryItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Photo not found' });
    res.json({ message: 'Photo removed' });
  } catch {
    res.status(500).json({ message: 'Failed to remove photo' });
  }
}

/* ================================== CAREERS ================================= */

// GET /api/careers
export async function getJobs(req, res) {
  try {
    const filter = req.user?.role === 'admin' && req.query.all === 'true' ? {} : { status: 'open' };
    const jobs = await JobOpening.find(filter).sort({ postedOn: -1 });
    res.json(jobs);
  } catch {
    res.status(500).json({ message: 'Failed to fetch openings' });
  }
}

// GET /api/careers/:slug
export async function getJob(req, res) {
  try {
    const job = await JobOpening.findOne({ slug: String(req.params.slug).toLowerCase() });
    if (!job || (job.status !== 'open' && req.user?.role !== 'admin')) {
      return res.status(404).json({ message: 'Opening not found' });
    }
    res.json(job);
  } catch {
    res.status(500).json({ message: 'Failed to fetch opening' });
  }
}

export async function adminListJobs(_req, res) {
  try {
    const jobs = await JobOpening.find().sort({ createdAt: -1 }).lean();
    const withCounts = await Promise.all(
      jobs.map(async (j) => ({ ...j, applicationCount: await JobApplication.countDocuments({ job: j._id }) }))
    );
    res.json(withCounts);
  } catch {
    res.status(500).json({ message: 'Failed to fetch openings' });
  }
}

export async function createJob(req, res) {
  try {
    const body = { ...req.body };
    if (!body.title || !body.description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    let slug = JobOpening.slugify(body.slug || body.title);
    if (await JobOpening.exists({ slug })) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    const job = await JobOpening.create({ ...body, slug, createdBy: req.user.id });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create opening' });
  }
}

export async function updateJob(req, res) {
  try {
    const body = { ...req.body };
    delete body.createdBy;
    if (body.slug) body.slug = JobOpening.slugify(body.slug);
    const job = await JobOpening.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!job) return res.status(404).json({ message: 'Opening not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update opening' });
  }
}

export async function deleteJob(req, res) {
  try {
    const job = await JobOpening.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: 'Opening not found' });
    await JobApplication.deleteMany({ job: job._id });
    res.json({ message: 'Opening deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete opening' });
  }
}

// POST /api/careers/:id/apply  (public)
export async function applyForJob(req, res) {
  try {
    const job = await JobOpening.findById(req.params.id);
    if (!job || job.status !== 'open') return res.status(404).json({ message: 'Opening not found' });

    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });

    const application = await JobApplication.create({
      ...req.body,
      job: job._id,
      user: req.user?.id
    });
    res.status(201).json({ message: 'Application received — we will be in touch.', id: application._id });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to submit application' });
  }
}

export async function adminListJobApplications(req, res) {
  try {
    const filter = {};
    if (req.query.job) filter.job = req.query.job;
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
    const apps = await JobApplication.find(filter).populate('job', 'title slug').sort({ createdAt: -1 });
    res.json(apps);
  } catch {
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
}

export async function updateJobApplication(req, res) {
  try {
    const app = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, adminNotes: req.body.adminNotes },
      { new: true }
    );
    if (!app) return res.status(404).json({ message: 'Application not found' });
    res.json(app);
  } catch {
    res.status(500).json({ message: 'Failed to update application' });
  }
}

/* =========================== RESOURCE PERSON BOOKING ======================== */

// POST /api/bookings  (public — institutions book a trainer)
export async function createBooking(req, res) {
  try {
    const { institutionName, contactName, contactEmail } = req.body;
    if (!institutionName || !contactName || !contactEmail) {
      return res.status(400).json({ message: 'Institution name, contact name, and email are required' });
    }
    const body = { ...req.body };
    if (typeof body.skills === 'string') {
      body.skills = body.skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    const booking = await ResourcePersonBooking.create(body);
    res.status(201).json({
      message: 'Request received — our team will contact you within two working days.',
      id: booking._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to submit request' });
  }
}

export async function adminListBookings(req, res) {
  try {
    const filter = {};
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
    res.json(await ResourcePersonBooking.find(filter).sort({ createdAt: -1 }));
  } catch {
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
}

export async function updateBooking(req, res) {
  try {
    const allowed = ['status', 'assignedResourcePerson', 'scheduledOn', 'adminNotes'];
    const patch = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    });
    const booking = await ResourcePersonBooking.findByIdAndUpdate(req.params.id, patch, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch {
    res.status(500).json({ message: 'Failed to update booking' });
  }
}

export async function deleteBooking(req, res) {
  try {
    const booking = await ResourcePersonBooking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking removed' });
  } catch {
    res.status(500).json({ message: 'Failed to remove booking' });
  }
}
