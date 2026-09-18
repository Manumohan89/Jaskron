import mongoose, { Schema } from 'mongoose';

/**
 * A lesson is one item inside a module. `type` decides how the player renders it:
 *  - video     → recorded session (videoUrl: YouTube/Vimeo/MP4/any embeddable URL)
 *  - document  → downloadable/readable resource (resourceUrl)
 *  - text      → inline rich-text/markdown content
 *  - lab       → hands-on lab brief with instructions
 */
const lessonSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['video', 'document', 'text', 'lab'],
      default: 'video'
    },
    videoUrl: { type: String, default: '' },
    videoPublicId: { type: String, default: '' }, // Cloudinary public_id, used to delete the asset if the lesson/video is replaced
    resourceUrl: { type: String, default: '' },
    content: { type: String, default: '' },
    durationMinutes: { type: Number, default: 0 },
    isPreview: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  },
  { _id: true }
);

const moduleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, default: '' },
    order: { type: Number, default: 0 },
    lessons: [lessonSchema]
  },
  { _id: true }
);

const courseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    subtitle: { type: String, default: '' },
    description: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    promoVideoUrl: { type: String, default: '' },

    domain: {
      type: String,
      enum: ['full-stack', 'data-analytics', 'ai-ml', 'cybersecurity', 'cloud-devops', 'other'],
      default: 'other'
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },
    language: { type: String, default: 'English' },
    tags: [{ type: String, trim: true }],

    instructorName: { type: String, default: 'JASKRON Faculty' },
    instructorTitle: { type: String, default: '' },
    instructorAvatar: { type: String, default: '' },

    whatYouWillLearn: [{ type: String }],
    requirements: [{ type: String }],

    isPaid: { type: Boolean, default: false },
    price: { type: Number, default: 0 }, // INR
    discountPrice: { type: Number, default: 0 },

    modules: [moduleSchema],

    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    isFeatured: { type: Boolean, default: false },

    // denormalised counters kept in sync by the controllers
    enrolledCount: { type: Number, default: 0 },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    certificateEnabled: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

courseSchema.virtual('lessonCount').get(function () {
  return (this.modules || []).reduce((n, m) => n + (m.lessons?.length || 0), 0);
});

courseSchema.virtual('totalMinutes').get(function () {
  return (this.modules || []).reduce(
    (n, m) => n + (m.lessons || []).reduce((s, l) => s + (l.durationMinutes || 0), 0),
    0
  );
});

courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

courseSchema.statics.slugify = function (title) {
  return String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
};

courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Course = mongoose.model('Course', courseSchema);
