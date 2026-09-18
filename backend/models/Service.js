import mongoose, { Schema } from 'mongoose';
const serviceSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'shield'
  },
  image: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'Security'
  },
  price: {
    type: String,
    default: 'Custom Quote'
  },
  features: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});
export const Service = mongoose.model('Service', serviceSchema);