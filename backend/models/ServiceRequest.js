import mongoose, { Schema } from 'mongoose';

const serviceRequestSchema = new Schema({
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  message: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'in-progress', 'completed', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);
