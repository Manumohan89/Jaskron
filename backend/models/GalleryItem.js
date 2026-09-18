import mongoose, { Schema } from 'mongoose';

/**
 * Photos for the public gallery — batch photos, workshops, campus visits,
 * office/company pictures. Admin-managed.
 */
const galleryItemSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    caption: { type: String, default: '' },
    imageUrl: { type: String, required: true },

    category: {
      type: String,
      enum: ['batch', 'workshop', 'company', 'campus', 'event', 'team', 'other'],
      default: 'other'
    },

    // Optional links so a photo can point back to the batch or institution
    batch: { type: Schema.Types.ObjectId, ref: 'Batch' },
    institution: { type: String, default: '' },
    takenOn: { type: Date },

    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

galleryItemSchema.index({ category: 1, order: 1 });

export const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema);
