import { Certificate } from '../models/Certificate.js';
import { User } from '../models/User.js';
import { Workshop } from '../models/Workshop.js';
import { sendMail, certificateIssuedEmail } from '../utils/email.js';
import { notifyUser } from '../utils/notify.js';

// Admin: issue a new certificate
export async function generateCertificate(req, res) {
  try {
    const {
      userId, courseTitle, workshop, grade, issuedBy,
      performanceScore, attendancePercent, durationLabel, mentorRemarks
    } = req.body;
    if (!userId || !courseTitle) {
      return res.status(400).json({ error: 'userId and courseTitle are required' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Paid workshops (item 9): certificates only issue after payment is confirmed
    if (workshop) {
      const workshopDoc = await Workshop.findById(workshop);
      if (workshopDoc?.isPaid) {
        const reg = workshopDoc.registrations.find((r) => r.user.toString() === userId);
        if (!reg || reg.paymentStatus !== 'paid') {
          return res.status(400).json({ error: 'This workshop is paid and the participant has not completed payment yet — certificate cannot be issued.' });
        }
      }
    }

    let certificateId = Certificate.generateCertificateId();
    // Extremely unlikely to collide, but guard anyway
    while (await Certificate.findOne({ certificateId })) {
      certificateId = Certificate.generateCertificateId();
    }

    const certificate = new Certificate({
      certificateId,
      user: user._id,
      recipientName: user.name,
      courseTitle,
      workshop: workshop || undefined,
      grade: grade || 'Pass',
      issuedBy: issuedBy || 'JASKRON Technologies Pvt. Ltd.',
      programType: workshop ? 'workshop' : 'other',
      durationLabel: durationLabel || '',
      mentorRemarks: mentorRemarks || '',
      performanceScore: performanceScore !== undefined && performanceScore !== '' ? Number(performanceScore) : undefined,
      attendancePercent: attendancePercent !== undefined && attendancePercent !== '' ? Number(attendancePercent) : undefined
    });
    await certificate.save();

    sendMail({
      to: user.email,
      subject: 'Your certificate is ready',
      html: certificateIssuedEmail(user.name, certificate)
    });
    notifyUser(user._id, {
      title: 'Certificate issued',
      message: `Your certificate for "${certificate.courseTitle}" is ready to download`,
      type: 'certificate',
      link: '/dashboard'
    });

    res.status(201).json(certificate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
}

// Logged-in user: list my certificates
export async function getMyCertificates(req, res) {
  try {
    const certificates = await Certificate.find({ user: req.user.id, status: 'active' })
      .populate('workshop', 'title')
      .sort({ issueDate: -1 });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
}

// Admin: list all certificates — search + pagination (10 per page)
export async function getAllCertificates(req, res) {
  try {
    const { search, page, limit } = req.query;
    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const filter = search
      ? {
          $or: [
            { certificateId: { $regex: search, $options: 'i' } },
            { recipientName: { $regex: search, $options: 'i' } },
            { courseTitle: { $regex: search, $options: 'i' } }
          ]
        }
      : {};
    const [certificates, total] = await Promise.all([
      Certificate.find(filter)
        .populate('user', 'name email')
        .populate('workshop', 'title')
        .sort({ issueDate: -1 })
        .skip((p - 1) * l)
        .limit(l),
      Certificate.countDocuments(filter)
    ]);
    res.json({ certificates, total, page: p, pages: Math.ceil(total / l) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
}

// Public: verify a certificate by its certificateId (no auth — for verification links/QR)
export async function verifyCertificate(req, res) {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
      .populate('workshop', 'title');
    if (!certificate || certificate.status !== 'active') {
      return res.status(404).json({ valid: false, message: 'Certificate not found or revoked' });
    }
    res.json({
      valid: true,
      certificateId: certificate.certificateId,
      recipientName: certificate.recipientName,
      courseTitle: certificate.courseTitle,
      grade: certificate.grade,
      issueDate: certificate.issueDate,
      issuedBy: certificate.issuedBy,
      programType: certificate.programType,
      durationLabel: certificate.durationLabel,
      performanceScore: certificate.performanceScore,
      attendancePercent: certificate.attendancePercent
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify certificate' });
  }
}

// Admin: revoke/delete a certificate
export async function revokeCertificate(req, res) {
  try {
    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      { status: 'revoked' },
      { new: true }
    );
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    res.json({ message: 'Certificate revoked', certificate });
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke certificate' });
  }
}
