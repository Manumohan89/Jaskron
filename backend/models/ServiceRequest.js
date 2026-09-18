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
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'waived'],
    default: 'pending'
  },
  paidAt: { type: Date },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  status: {
    type: String,
    enum: ['payment_pending', 'pending', 'contacted', 'in-progress', 'completed', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);
