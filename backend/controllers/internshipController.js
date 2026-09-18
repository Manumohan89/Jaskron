import mongoose from 'mongoose';
import { Internship } from '../models/Internship.js';
import { InternshipApplication } from '../models/InternshipApplication.js';
import { Batch } from '../models/Batch.js';
import { notifyUser } from '../utils/notify.js';

const byIdOrSlug = (key) =>
  mongoose.isValidObjectId(key) ? { _id: key } : { slug: String(key).toLowerCase() };

const payable = (internship) =>
  internship.discountFee > 0 ? internship.discountFee : internship.fee;

/* ---------------------------------- public --------------------------------- */

// GET /api/internships
export async function getInternships(req, res) {
  try {
    const { domain, track, featured } = req.query;
    const filter = { status: 'published' };
    if (req.user?.role === 'admin' && req.query.status) filter.status = req.query.status;
    if (domain && domain !== 'all') filter.domain = domain;
    if (track && track !== 'all') filter.track = track;
    if (featured === 'true') filter.isFeatured = true;

    const internships = await Internship.find(filter).sort({ isFeatured: -1, createdAt: -1 });
    res.json(internships);
  } catch {
    res.status(500).json({ message: 'Failed to fetch internships' });
  }
}

// GET /api/internships/:idOrSlug
export async function getInternship(req, res) {
  try {
    const internship = await Internship.findOne(byIdOrSlug(req.params.id));
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    if (internship.status !== 'published' && req.user?.role !== 'admin') {
      return res.status(404).json({ message: 'Internship not found' });
    }

    let application = null;
    if (req.user?.id) {
      application = await InternshipApplication.findOne({
        internship: internship._id,
        user: req.user.id
      }).populate('batch', 'name code startDate status');
    }

    // Upcoming batches a student could be placed into
    const batches = await Batch.find({
      internship: internship._id,
      status: { $in: ['upcoming', 'ongoing'] }
    })
      .select('name code startDate endDate mode scheduleNote capacity members status')
      .lean();

    res.json({
      internship,
      application,
      amountPayable: payable(internship),
      batches: batches.map((b) => ({
        _id: b._id,
        name: b.name,
        code: b.code,
        startDate: b.startDate,
        endDate: b.endDate,
        mode: b.mode,
        scheduleNote: b.scheduleNote,
        seatsLeft: Math.max(0, (b.capacity || 0) - (b.members?.length || 0)),
        status: b.status
      }))
    });
  } catch {
    res.status(500).json({ message: 'Failed to fetch internship' });
  }
}

/* ------------------------------ student actions ----------------------------- */

// POST /api/internships/:id/apply
export async function applyForInternship(req, res) {
  try {
    const internship = await Internship.findOne(byIdOrSlug(req.params.id));
    if (!internship || internship.status !== 'published') {
      return res.status(404).json({ message: 'Internship not found' });
    }

    const existing = await InternshipApplication.findOne({
      internship: internship._id,
      user: req.user.id
    });
    if (existing) {
      return res.status(409).json({ message: 'You have already applied for this internship', application: existing });
    }

    const { college, course, yearOfStudy, phone, resumeUrl, motivation, preferredStart } = req.body;

    const application = await InternshipApplication.create({
      internship: internship._id,
      user: req.user.id,
      college,
      course,
      yearOfStudy,
      phone,
      resumeUrl,
      motivation,
      preferredStart,
      amountPayable: payable(internship),
      paymentStatus: payable(internship) > 0 ? 'pending' : 'waived',
      status: payable(internship) > 0 ? 'payment_pending' : 'applied'
    });

    internship.applicationCount = await InternshipApplication.countDocuments({ internship: internship._id });
    await internship.save();

    try {
      await notifyUser(req.user.id, {
        title: 'Application received',
        message:
          payable(internship) > 0
            ? `We have your application for ${internship.title}. Complete the ₹${payable(internship)} fee payment to confirm your seat.`
            : `We have your application for ${internship.title}. Our team will be in touch.`,
        type: 'system',
        link: '/dashboard?tab=internships'
      });
    } catch {
      /* best effort */
    }

    res.status(201).json({ message: 'Application submitted', application, amountPayable: payable(internship) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'You have already applied' });
    res.status(500).json({ message: 'Failed to submit application' });
  }
}

// GET /api/internships/me/applications
export async function getMyApplications(req, res) {
  try {
    const applications = await InternshipApplication.find({ user: req.user.id })
      .populate('internship', 'title slug thumbnail durationLabel track fee discountFee')
      .populate('batch', 'name code startDate endDate status scheduleNote')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch {
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
}

/* ------------------------------ admin: catalog ----------------------------- */

export async function adminListInternships(_req, res) {
  try {
    const internships = await Internship.find().sort({ createdAt: -1 }).lean();
    const withCounts = await Promise.all(
      internships.map(async (i) => ({
        ...i,
        applicationCount: await InternshipApplication.countDocuments({ internship: i._id }),
        batchCount: await Batch.countDocuments({ internship: i._id })
      }))
    );
    res.json(withCounts);
  } catch {
    res.status(500).json({ message: 'Failed to fetch internships' });
  }
}

export async function createInternship(req, res) {
  try {
    const body = { ...req.body };
    if (!body.title || !body.description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    let slug = Internship.slugify(body.slug || body.title);
    if (await Internship.exists({ slug })) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    const internship = await Internship.create({ ...body, slug, createdBy: req.user.id });
    res.status(201).json(internship);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create internship' });
  }
}

export async function updateInternship(req, res) {
  try {
    const body = { ...req.body };
    delete body.createdBy;
    if (body.slug) body.slug = Internship.slugify(body.slug);
    const internship = await Internship.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true
    });
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    res.json(internship);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update internship' });
  }
}

export async function deleteInternship(req, res) {
  try {
    const internship = await Internship.findByIdAndDelete(req.params.id);
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    await InternshipApplication.deleteMany({ internship: internship._id });
    res.json({ message: 'Internship deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete internship' });
  }
}

/* --------------------------- admin: applications --------------------------- */

// GET /api/internships/applications/all?status=&internship=
export async function adminListApplications(req, res) {
  try {
    const filter = {};
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
    if (req.query.internship) filter.internship = req.query.internship;

    const applications = await InternshipApplication.find(filter)
      .populate('user', 'name email')
      .populate('internship', 'title slug fee discountFee')
      .populate('batch', 'name code')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch {
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
}

// PATCH /api/internships/applications/:id
export async function updateApplication(req, res) {
  try {
    const allowed = ['status', 'paymentStatus', 'adminNotes', 'batch', 'amountPayable'];
    const patch = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    });
    if (patch.paymentStatus === 'paid') patch.paidAt = new Date();
    if (patch.batch === '' || patch.batch === null) patch.batch = undefined;

    const application = await InternshipApplication.findByIdAndUpdate(req.params.id, patch, { new: true })
      .populate('user', 'name email')
      .populate('internship', 'title');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Placing an approved applicant into a batch also adds them to the roster.
    if (patch.batch && patch.status === 'enrolled') {
      const batch = await Batch.findById(patch.batch);
      if (batch && !batch.members.some((m) => String(m.user) === String(application.user._id))) {
        batch.members.push({
          user: application.user._id,
          paymentStatus: application.paymentStatus === 'paid' ? 'paid' : 'pending'
        });
        await batch.save();
      }
    }

    try {
      await notifyUser(application.user._id, {
        title: 'Internship application updated',
        message: `${application.internship?.title}: status is now "${application.status}".`,
        type: 'system',
        link: '/dashboard?tab=internships'
      });
    } catch {
      /* best effort */
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update application' });
  }
}
