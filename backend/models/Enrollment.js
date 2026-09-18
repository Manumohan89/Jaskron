import mongoose, { Schema } from 'mongoose';

const enrollmentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },

    // lesson _ids the learner has marked complete
    completedLessons: [{ type: Schema.Types.ObjectId }],
    lastLesson: { type: Schema.Types.ObjectId },

    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active'
    },

    paymentStatus: {
      type: String,
      enum: ['not_required', 'pending', 'paid'],
      default: 'not_required'
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },

    rating: { type: Number, min: 1, max: 5 },
    review: { type: String, default: '' },

    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
