import mongoose, { Schema } from 'mongoose';

const testimonialSchema = new Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, trim: true },
  company: { type: String, trim: true },
  quote: { type: String, required: true, maxlength: 600 },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  avatar: { type: String },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

export const Testimonial = mongoose.model('Testimonial', testimonialSchema);
