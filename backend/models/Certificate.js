import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';

const certificateSchema = new Schema({
  certificateId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientName: {
    type: String,
    required: true
  },
  courseTitle: {
    type: String,
    required: true
  },
  workshop: {
    type: Schema.Types.ObjectId,
    ref: 'Workshop'
  },
  // What the certificate was earned for
  programType: {
    type: String,
    enum: ['course', 'internship', 'workshop', 'exam', 'other'],
    default: 'course'
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course'
  },
  internship: {
    type: Schema.Types.ObjectId,
    ref: 'Internship'
  },
  batch: {
    type: Schema.Types.ObjectId,
    ref: 'Batch'
  },
  // Performance the grade was derived from (admin-entered or exam-derived)
  performanceScore: {
    type: Number,
    min: 0,
    max: 100
  },
  attendancePercent: {
    type: Number,
    min: 0,
    max: 100
  },
  mentorRemarks: {
    type: String,
    default: ''
  },
  durationLabel: {
    type: String,
    default: ''
  },
  grade: {
    type: String,
    enum: ['Pass', 'Merit', 'Distinction'],
    default: 'Pass'
  },
  issuedBy: {
    type: String,
    default: 'JASKRON Technologies Pvt. Ltd.'
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'revoked'],
    default: 'active'
  }
}, {
  timestamps: true
});

/** Maps a 0-100 performance score onto the certificate grade bands. */
certificateSchema.statics.gradeForScore = function (score) {
  const n = Number(score);
  if (!Number.isFinite(n)) return 'Pass';
  if (n >= 85) return 'Distinction';
  if (n >= 70) return 'Merit';
  return 'Pass';
};

// Generate a human-friendly, unique certificate ID before saving
certificateSchema.statics.generateCertificateId = function () {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `JSO-${year}-${random}`;
};

export const Certificate = mongoose.model('Certificate', certificateSchema);
