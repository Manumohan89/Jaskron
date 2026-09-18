import mongoose, { Schema } from 'mongoose';

/**
 * A paid internship programme. Students apply, pay the fee, get placed in a
 * batch, receive training, complete an assessment, and are issued a
 * certificate graded on performance.
 */
const internshipSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    subtitle: { type: String, default: '' },
    description: { type: String, required: true },
    thumbnail: { type: String, default: '' },

    domain: {
      type: String,
      enum: ['full-stack', 'data-analytics', 'ai-ml', 'cybersecurity', 'cloud-devops', 'other'],
      default: 'other'
    },
    track: {
      type: String,
      enum: ['short-term', 'long-term', 'project-based', 'research'],
      default: 'short-term'
    },
    durationLabel: { type: String, default: '4 weeks' },
    durationWeeks: { type: Number, default: 4 },
    mode: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'online' },

    // Paid programme — fee is mandatory in practice, but 0 is allowed for scholarships.
    fee: { type: Number, required: true, default: 0 }, // INR
    discountFee: { type: Number, default: 0 },
    feeNote: { type: String, default: 'Includes training, mentorship, assessment, and certification.' },

    seatsPerBatch: { type: Number, default: 30 },

    whatYouGet: [{ type: String }],
    curriculum: [{ title: String, detail: String }],
    deliverables: [{ type: String }],
    eligibility: [{ type: String }],

    mentorName: { type: String, default: 'JASKRON Mentor Team' },
    mentorTitle: { type: String, default: '' },

    certificateEnabled: { type: Boolean, default: true },
    certificateTitle: { type: String, default: '' }, // falls back to the internship title

    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    isFeatured: { type: Boolean, default: false },

    applicationCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

internshipSchema.statics.slugify = function (title) {
  return String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
};

export const Internship = mongoose.model('Internship', internshipSchema);
