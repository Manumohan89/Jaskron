import mongoose from 'mongoose';
import streamifier from 'streamifier';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { Certificate } from '../models/Certificate.js';
import { User } from '../models/User.js';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';

const byIdOrSlug = (key) =>
  mongoose.isValidObjectId(key) ? { _id: key } : { slug: String(key).toLowerCase() };

function countLessons(course) {
  return (course.modules || []).reduce((n, m) => n + (m.lessons?.length || 0), 0);
}

/** Hide lesson bodies for people who haven't enrolled (previews stay visible). */
function lockCourse(courseDoc, enrolled) {
  const course = courseDoc.toObject ? courseDoc.toObject() : courseDoc;
  if (enrolled) return course;
  course.modules = (course.modules || []).map((m) => ({
    ...m,
    lessons: (m.lessons || []).map((l) =>
      l.isPreview
        ? l
        : { ...l, videoUrl: '', resourceUrl: '', content: '', locked: true }
    )
  }));
  return course;
}

/* ---------------------------------- public --------------------------------- */

// GET /api/courses?domain=&level=&q=&featured=
export async function getCourses(req, res) {
  try {
    const { domain, level, q, featured, status } = req.query;
    const filter = {};
    // Admins can ask for drafts; everyone else only sees published courses.
    filter.status = req.user?.role === 'admin' && status ? status : 'published';
    if (domain && domain !== 'all') filter.domain = domain;
    if (level && level !== 'all') filter.level = level;
    if (featured === 'true') filter.isFeatured = true;
    if (q) filter.$or = [
      { title: new RegExp(q, 'i') },
      { subtitle: new RegExp(q, 'i') },
      { tags: new RegExp(q, 'i') }
    ];

    const courses = await Course.find(filter).select('-modules.lessons.content').sort({ isFeatured: -1, createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
}

// GET /api/courses/:idOrSlug
export async function getCourse(req, res) {
  try {
    const course = await Course.findOne(byIdOrSlug(req.params.id));
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.status !== 'published' && req.user?.role !== 'admin') {
      return res.status(404).json({ message: 'Course not found' });
    }

    let enrollment = null;
    if (req.user?.id) {
      enrollment = await Enrollment.findOne({ user: req.user.id, course: course._id });
    }
    // A paid course with a payment still pending doesn't unlock content —
    // only a free enrollment or a confirmed payment counts as "enrolled".
    const isEnrolled =
      req.user?.role === 'admin' ||
      (Boolean(enrollment) && enrollment.paymentStatus !== 'pending');

    res.json({
      course: lockCourse(course, isEnrolled),
      enrollment,
      isEnrolled
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch course' });
  }
}

/* ----------------------------- learner endpoints ---------------------------- */

// POST /api/courses/:id/enroll
export async function enrollInCourse(req, res) {
  try {
    const course = await Course.findOne(byIdOrSlug(req.params.id));
    if (!course || course.status !== 'published') {
      return res.status(404).json({ message: 'Course not found' });
    }

    const existing = await Enrollment.findOne({ user: req.user.id, course: course._id });
    if (existing) return res.json({ message: 'Already enrolled', enrollment: existing });

    const enrollment = await Enrollment.create({
      user: req.user.id,
      course: course._id,
      paymentStatus: course.isPaid ? 'pending' : 'not_required'
    });

    course.enrolledCount = await Enrollment.countDocuments({ course: course._id });
    await course.save();

    res.status(201).json({ message: `Enrolled in ${course.title}`, enrollment });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Already enrolled' });
    res.status(500).json({ message: 'Failed to enroll' });
  }
}

// GET /api/courses/me/enrollments
export async function getMyEnrollments(req, res) {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate('course', 'title slug thumbnail domain level instructorName modules status')
      .sort({ updatedAt: -1 });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch enrollments' });
  }
}

// POST /api/courses/:id/progress  { lessonId, completed }
export async function updateProgress(req, res) {
  try {
    const { lessonId, completed = true } = req.body;
    const course = await Course.findOne(byIdOrSlug(req.params.id));
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const enrollment = await Enrollment.findOne({ user: req.user.id, course: course._id });
    if (!enrollment) return res.status(403).json({ message: 'You are not enrolled in this course' });
    if (enrollment.paymentStatus === 'pending') {
      return res.status(402).json({ message: 'Complete your payment to unlock this course' });
    }

    const set = new Set(enrollment.completedLessons.map(String));
    if (completed) set.add(String(lessonId));
    else set.delete(String(lessonId));

    enrollment.completedLessons = [...set];
    enrollment.lastLesson = lessonId;

    const total = countLessons(course) || 1;
    enrollment.progressPercent = Math.min(100, Math.round((enrollment.completedLessons.length / total) * 100));

    if (enrollment.progressPercent === 100 && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();

      // Issue a completion certificate if the course allows it
      if (course.certificateEnabled) {
        const user = await User.findById(req.user.id);
        const already = await Certificate.findOne({ user: req.user.id, courseTitle: course.title });
        if (!already && user) {
          await Certificate.create({
            certificateId: Certificate.generateCertificateId(),
            user: user._id,
            recipientName: user.name || user.email,
            courseTitle: course.title
          });
        }
      }
    }

    await enrollment.save();
    res.json({ enrollment });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update progress' });
  }
}

// POST /api/courses/:id/review  { rating, review }
export async function reviewCourse(req, res) {
  try {
    const { rating, review } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    const course = await Course.findOne(byIdOrSlug(req.params.id));
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const enrollment = await Enrollment.findOne({ user: req.user.id, course: course._id });
    if (!enrollment || enrollment.paymentStatus === 'pending') {
      return res.status(403).json({ message: 'Only enrolled learners can review' });
    }

    enrollment.rating = rating;
    enrollment.review = review || '';
    await enrollment.save();

    const agg = await Enrollment.aggregate([
      { $match: { course: course._id, rating: { $gte: 1 } } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    course.ratingAverage = agg[0] ? Math.round(agg[0].avg * 10) / 10 : 0;
    course.ratingCount = agg[0]?.count || 0;
    await course.save();

    res.json({ message: 'Thanks for the review', enrollment });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save review' });
  }
}

/* ------------------------------ admin endpoints ----------------------------- */

// POST /api/courses/upload-video (multipart, field name "video")
// Streams the uploaded file straight to Cloudinary — never written to disk,
// which matters on Render since its filesystem is wiped on every deploy/restart.
export async function uploadLessonVideo(req, res) {
  if (!isCloudinaryConfigured) {
    return res.status(500).json({
      message: 'Video upload is not configured. Set CLOUDINARY_URL (or CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET) on the backend.'
    });
  }
  if (!req.file) return res.status(400).json({ message: 'No video file uploaded' });

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'jaskron/course-videos',
          chunk_size: 6 * 1024 * 1024 // stream large files to Cloudinary in 6MB chunks
        },
        (err, uploadResult) => (err ? reject(err) : resolve(uploadResult))
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    res.status(201).json({
      videoUrl: result.secure_url,
      publicId: result.public_id,
      durationSeconds: result.duration ? Math.round(result.duration) : 0,
      bytes: result.bytes
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Video upload failed' });
  }
}

// GET /api/courses/admin/all
export async function adminListCourses(_req, res) {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
}

// POST /api/courses
export async function createCourse(req, res) {
  try {
    const body = { ...req.body };
    if (!body.title || !body.description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    let slug = body.slug ? Course.slugify(body.slug) : Course.slugify(body.title);
    if (await Course.exists({ slug })) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    const course = await Course.create({ ...body, slug, createdBy: req.user.id });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create course' });
  }
}

// PUT /api/courses/:id
export async function updateCourse(req, res) {
  try {
    const body = { ...req.body };
    delete body.createdBy;
    if (body.slug) body.slug = Course.slugify(body.slug);
    const course = await Course.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update course' });
  }
}

// DELETE /api/courses/:id
export async function deleteCourse(req, res) {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    await Enrollment.deleteMany({ course: course._id });
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete course' });
  }
}

// GET /api/courses/:id/enrollments  (admin)
export async function courseEnrollments(req, res) {
  try {
    const course = await Course.findOne(byIdOrSlug(req.params.id));
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const enrollments = await Enrollment.find({ course: course._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch enrollments' });
  }
}
