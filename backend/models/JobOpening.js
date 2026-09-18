import mongoose, { Schema } from 'mongoose';

const jobOpeningSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    department: { type: String, default: 'Engineering' },
    location: { type: String, default: 'Bengaluru, India' },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
      default: 'full-time'
    },
    experience: { type: String, default: '0–2 years' },
    salaryRange: { type: String, default: '' },

    summary: { type: String, default: '' },
    description: { type: String, required: true },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
    niceToHave: [{ type: String }],

    openings: { type: Number, default: 1 },
    applyEmail: { type: String, default: '' },
    status: { type: String, enum: ['open', 'closed', 'draft'], default: 'draft' },
    postedOn: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

jobOpeningSchema.statics.slugify = function (title) {
  return String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
};

export const JobOpening = mongoose.model('JobOpening', jobOpeningSchema);
