import mongoose, { Schema } from 'mongoose';
const workshopSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    required: true
  },
  instructor: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    default: 30
  },
  enrolledCount: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  category: {
    type: String,
    default: 'Cybersecurity'
  },
  duration: {
    type: String,
    default: '2 hours'
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  },
  isPaid: { type: Boolean, default: false },
  price: { type: Number, default: 0 }, // in INR
  checkInCode: { type: String }, // unique code embedded in the workshop's QR check-in code
  registrations: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: function () { return !this.guestEmail; } // guest seats (team bookings) don't need an account
    },
    // Set when this seat was booked as part of a team/bulk registration by another user
    bookedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    guestName: { type: String, trim: true },
    guestEmail: { type: String, trim: true, lowercase: true },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'completed', 'cancelled'],
      default: 'registered'
    },
    paymentStatus: {
      type: String,
      enum: ['not_required', 'pending', 'paid'],
      default: 'not_required'
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    checkedInAt: { type: Date }
  }]
}, {
  timestamps: true
});
export const Workshop = mongoose.model('Workshop', workshopSchema);