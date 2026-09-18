import mongoose, { Schema } from 'mongoose';

const internshipApplicationSchema = new Schema(
  {
    internship: { type: Schema.Types.ObjectId, ref: 'Internship', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // Applicant-supplied details
    college: { type: String, default: '' },
    course: { type: String, default: '' }, // degree / branch
    yearOfStudy: { type: String, default: '' },
    phone: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    motivation: { type: String, default: '' },
    preferredStart: { type: String, default: '' },

    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'payment_pending', 'enrolled', 'rejected', 'withdrawn'],
      default: 'applied'
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'waived'],
      default: 'pending'
    },
    amountPayable: { type: Number, default: 0 },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    paidAt: { type: Date },

    batch: { type: Schema.Types.ObjectId, ref: 'Batch' },
    adminNotes: { type: String, default: '' }
  },
  { timestamps: true }
);

internshipApplicationSchema.index({ internship: 1, user: 1 }, { unique: true });

export const InternshipApplication = mongoose.model(
  'InternshipApplication',
  internshipApplicationSchema
);
