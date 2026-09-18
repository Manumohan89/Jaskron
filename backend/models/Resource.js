import mongoose, { Schema } from 'mongoose';

const resourceSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['Guide', 'Checklist', 'Template', 'Whitepaper', 'Slides', 'Other'],
    default: 'Other'
  },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true }, // served from /uploads/resources/<filePath>
  fileType: { type: String },
  fileSize: { type: Number },
  downloadCount: { type: Number, default: 0 },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  isPublic: { type: Boolean, default: true } // if false, requires login to download
}, { timestamps: true });

export const Resource = mongoose.model('Resource', resourceSchema);
