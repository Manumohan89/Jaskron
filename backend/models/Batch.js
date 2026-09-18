import mongoose, { Schema } from 'mongoose';

/**
 * A batch is a cohort running a course or an internship over fixed dates.
 * It owns the live-class schedule, the recordings, and the roster.
 * Assessment access is gated per-member by admin approval.
 */
const sessionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    scheduledAt: { type: Date },
    durationMinutes: { type: Number, default: 60 },
    // Live class: a meeting link (Zoom / Meet / Teams). Visible to batch members only.
    liveUrl: { type: String, default: '' },
    // After the session, the recording goes here and the session flips to 'recorded'.
    recordingUrl: { type: String, default: '' },
    notesUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'recorded', 'cancelled'],
      default: 'scheduled'
    },
    order: { type: Number, default: 0 }
  },
  { _id: true }
);

const memberSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, default: Date.now },

    paymentStatus: {
      type: String,
      enum: ['not_required', 'pending', 'paid', 'waived'],
      default: 'pending'
    },

    // Admin has to approve a member before they can sit the assessment.
    assessmentApproved: { type: Boolean, default: false },
    assessmentApprovedAt: { type: Date },

    attendancePercent: { type: Number, default: 0, min: 0, max: 100 },
    performanceScore: { type: Number, min: 0, max: 100 }, // admin-entered, drives the grade
    mentorRemarks: { type: String, default: '' },

    status: {
      type: String,
      enum: ['active', 'completed', 'dropped'],
      default: 'active'
    },
    certificate: { type: Schema.Types.ObjectId, ref: 'Certificate' }
  },
  { _id: true }
);

const batchSchema = new Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "MERN — Batch 12 (Jan 2026)"
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },

    programType: { type: String, enum: ['course', 'internship'], required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    internship: { type: Schema.Types.ObjectId, ref: 'Internship' },

    startDate: { type: Date },
    endDate: { type: Date },
    mode: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'online' },
    scheduleNote: { type: String, default: '' }, // "Mon/Wed/Fri 7–8:30pm IST"

    capacity: { type: Number, default: 30 },
    mentorName: { type: String, default: '' },

    // Standing meeting link for recurring live classes
    liveClassUrl: { type: String, default: '' },
    sessions: [sessionSchema],
    members: [memberSchema],

    // The assessment members sit at the end of the batch
    exam: { type: Schema.Types.ObjectId, ref: 'Exam' },

    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming'
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

batchSchema.statics.generateCode = function (prefix = 'JSK') {
  return `${prefix}-${Date.now().toString(36).toUpperCase().slice(-5)}`;
};

batchSchema.virtual('seatsLeft').get(function () {
  return Math.max(0, (this.capacity || 0) - (this.members?.length || 0));
});

batchSchema.set('toJSON', { virtuals: true });
batchSchema.set('toObject', { virtuals: true });

export const Batch = mongoose.model('Batch', batchSchema);
