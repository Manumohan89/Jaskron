import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['certificate', 'workshop', 'course', 'exam', 'service', 'system', 'contact'],
    default: 'system'
  },
  link: { type: String }, // optional in-app link, e.g. /dashboard/certificates
  read: { type: Boolean, default: false }
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);
