import { Router } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { Workshop } from '../models/Workshop.js';
import { InternshipApplication } from '../models/InternshipApplication.js';
import { Internship } from '../models/Internship.js';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { Batch } from '../models/Batch.js';
import { Service } from '../models/Service.js';
import { ServiceRequest } from '../models/ServiceRequest.js';
import { serviceAmount } from '../controllers/serviceController.js';
import { notifyUser } from '../utils/notify.js';

const router = Router();

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

/** Verifies a Razorpay checkout signature. Throws nothing — returns a bool. */
function signatureValid(orderId, paymentId, signature) {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expected === signature;
}

// Create a Razorpay order for a service request. Service delivery is unlocked only after verification.
router.post('/services/:requestId/order', authenticate, async (req, res) => {
  try {
    const razorpay = getRazorpay();
    if (!razorpay) return res.status(503).json({ message: 'Payments are not configured on this server yet.' });
    const request = await ServiceRequest.findById(req.params.requestId).populate('service');
    if (!request) return res.status(404).json({ message: 'Service request not found' });
    if (String(request.user) !== String(req.user.id)) return res.status(403).json({ message: 'This is not your service request' });
    if (request.paymentStatus === 'paid') return res.status(400).json({ message: 'This service request is already paid for' });
    const amount = serviceAmount(request.service);
    if (!amount) return res.status(400).json({ message: 'No payment amount is configured for this service' });
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `service_${request._id}`,
      notes: { requestId: request._id.toString(), userId: req.user.id }
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID, serviceTitle: request.service.title });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/services/:requestId/verify', authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!signatureValid(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }
    const request = await ServiceRequest.findById(req.params.requestId).populate('service', 'title');
    if (!request) return res.status(404).json({ message: 'Service request not found' });
    if (String(request.user) !== String(req.user.id)) return res.status(403).json({ message: 'This is not your service request' });
    request.paymentStatus = 'paid';
    request.paidAt = new Date();
    request.razorpayOrderId = razorpay_order_id;
    request.razorpayPaymentId = razorpay_payment_id;
    request.status = 'pending';
    await request.save();
    res.json({ message: 'Payment verified. Our team can now begin this service.', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a Razorpay order for a paid workshop registration
router.post('/workshops/:id/order', authenticate, async (req, res) => {
  try {
    const razorpay = getRazorpay();
    if (!razorpay) return res.status(503).json({ message: 'Payments are not configured on this server yet (set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).' });

    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    if (!workshop.isPaid || !workshop.price) return res.status(400).json({ message: 'This workshop is free — no payment needed' });

    const order = await razorpay.orders.create({
      amount: Math.round(workshop.price * 100), // paise
      currency: 'INR',
      receipt: `wksp_${workshop._id}_${req.user.id}`,
      notes: { workshopId: workshop._id.toString(), userId: req.user.id }
    });

    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify payment signature and register the user
router.post('/workshops/:id/verify', authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!signatureValid(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });

    let reg = workshop.registrations.find((r) => r.user.toString() === req.user.id);
    if (!reg) {
      workshop.registrations.push({
        user: req.user.id,
        paymentStatus: 'paid',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id
      });
      workshop.enrolledCount += 1;
    } else {
      reg.paymentStatus = 'paid';
      reg.razorpayOrderId = razorpay_order_id;
      reg.razorpayPaymentId = razorpay_payment_id;
    }
    await workshop.save();

    res.json({ message: 'Payment verified, registration confirmed', workshop });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ------------------------------ internships ------------------------------ */

// Create a Razorpay order for an internship application's fee
router.post('/internships/:applicationId/order', authenticate, async (req, res) => {
  try {
    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(503).json({ message: 'Payments are not configured on this server yet (set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).' });
    }

    const application = await InternshipApplication.findById(req.params.applicationId).populate('internship', 'title');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (String(application.user) !== String(req.user.id)) {
      return res.status(403).json({ message: 'This is not your application' });
    }
    if (application.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'This application is already paid for' });
    }
    if (!application.amountPayable || application.amountPayable <= 0) {
      return res.status(400).json({ message: 'No fee is due on this application' });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(application.amountPayable * 100), // paise
      currency: 'INR',
      receipt: `intern_${application._id}`,
      notes: { applicationId: application._id.toString(), userId: req.user.id }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      programTitle: application.internship?.title || 'Internship programme'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify payment signature, mark the application paid, and enrol the student
router.post('/internships/:applicationId/verify', authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!signatureValid(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const application = await InternshipApplication.findById(req.params.applicationId).populate('internship', 'title');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (String(application.user) !== String(req.user.id)) {
      return res.status(403).json({ message: 'This is not your application' });
    }

    application.paymentStatus = 'paid';
    application.paidAt = new Date();
    application.razorpayOrderId = razorpay_order_id;
    application.razorpayPaymentId = razorpay_payment_id;
    if (application.status === 'applied' || application.status === 'shortlisted' || application.status === 'payment_pending') {
      application.status = 'enrolled';
    }
    await application.save();

    // If the applicant was already placed in a batch, flip their roster
    // payment status too, which is what unlocks class access.
    if (application.batch) {
      const batch = await Batch.findById(application.batch);
      const member = batch?.members.find((m) => String(m.user) === String(req.user.id));
      if (member) {
        member.paymentStatus = 'paid';
        await batch.save();
      }
    }

    try {
      await notifyUser(req.user.id, {
        title: 'Payment received',
        message: `Your payment for ${application.internship?.title || 'your internship'} is confirmed. Your seat is reserved.`,
        type: 'system',
        link: '/dashboard?tab=internships'
      });
    } catch {
      /* best effort */
    }

    res.json({ message: 'Payment verified — your seat is confirmed', application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* --------------------------------- courses -------------------------------- */

// Create a Razorpay order for a paid course enrollment
router.post('/courses/:id/order', authenticate, async (req, res) => {
  try {
    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(503).json({ message: 'Payments are not configured on this server yet (set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!course.isPaid || !course.price) return res.status(400).json({ message: 'This course is free — no payment needed' });

    const amount = course.discountPrice > 0 ? course.discountPrice : course.price;

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `course_${course._id}_${req.user.id}`,
      notes: { courseId: course._id.toString(), userId: req.user.id }
    });

    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID, courseTitle: course.title });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify payment signature and confirm the enrollment
router.post('/courses/:id/verify', authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!signatureValid(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    let enrollment = await Enrollment.findOne({ user: req.user.id, course: course._id });
    if (!enrollment) {
      enrollment = await Enrollment.create({
        user: req.user.id,
        course: course._id,
        paymentStatus: 'paid',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id
      });
      course.enrolledCount = await Enrollment.countDocuments({ course: course._id });
      await course.save();
    } else {
      enrollment.paymentStatus = 'paid';
      enrollment.razorpayOrderId = razorpay_order_id;
      enrollment.razorpayPaymentId = razorpay_payment_id;
      await enrollment.save();
    }

    res.json({ message: 'Payment verified — you are enrolled', enrollment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
