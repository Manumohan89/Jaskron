import mongoose, { Schema } from 'mongoose';

const partnerSchema = new Schema({
  name: { type: String, required: true, trim: true },
  logo: { type: String, required: true }, // URL or /uploads path
  website: { type: String, default: '' },
  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

export const Partner = mongoose.model('Partner', partnerSchema);
