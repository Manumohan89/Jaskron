import mongoose, { Schema } from 'mongoose';

const subscriberSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  source: { type: String, default: 'footer' }, // where they signed up
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Subscriber = mongoose.model('Subscriber', subscriberSchema);
