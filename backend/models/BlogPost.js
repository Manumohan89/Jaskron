import mongoose, { Schema } from 'mongoose';

const blogPostSchema = new Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  excerpt: { type: String, maxlength: 300 },
  content: { type: String, required: true },
  coverImage: { type: String },
  tags: [{ type: String }],
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  publishedAt: { type: Date }
}, { timestamps: true });

blogPostSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const BlogPost = mongoose.model('BlogPost', blogPostSchema);
