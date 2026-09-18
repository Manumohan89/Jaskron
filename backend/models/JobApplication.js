import mongoose, { Schema } from 'mongoose';

const jobApplicationSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: 'JobOpening', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    coverNote: { type: String, default: '' },
    experience: { type: String, default: '' },

    status: {
      type: String,
      enum: ['new', 'reviewing', 'interview', 'offered', 'hired', 'rejected'],
      default: 'new'
    },
    adminNotes: { type: String, default: '' },
    user: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
