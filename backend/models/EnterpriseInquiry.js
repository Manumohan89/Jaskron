import mongoose, { Schema } from 'mongoose';

const enterpriseInquirySchema = new Schema({
  companyName: { type: String, required: true, trim: true },
  contactName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  teamSize: { type: String, trim: true }, // e.g. "10-50"
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' }
}, { timestamps: true });

export const EnterpriseInquiry = mongoose.model('EnterpriseInquiry', enterpriseInquirySchema);
