import mongoose, { Schema } from 'mongoose';

const caseStudySchema = new Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  clientName: { type: String, required: true, trim: true },
  industry: { type: String, trim: true },
  summary: { type: String, maxlength: 300 },
  challenge: { type: String, required: true },
  solution: { type: String, required: true },
  results: { type: String, required: true },
  // Headline metrics shown as stat cards, e.g. { label: 'Phishing click-rate', before: '32%', after: '4%' }
  metrics: [{
    label: String,
    before: String,
    after: String
  }],
  coverImage: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  publishedAt: { type: Date }
}, { timestamps: true });

caseStudySchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const CaseStudy = mongoose.model('CaseStudy', caseStudySchema);
