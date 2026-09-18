import mongoose, { Schema } from 'mongoose';

/**
 * Institutions book a JASKRON resource person (trainer / guest speaker) for a
 * skill, a workshop, or a campus programme.
 */
const resourcePersonBookingSchema = new Schema(
  {
    // Requesting institution
    institutionName: { type: String, required: true, trim: true },
    institutionType: {
      type: String,
      enum: ['college', 'university', 'school', 'company', 'other'],
      default: 'college'
    },
    contactName: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    contactPhone: { type: String, default: '' },
    designation: { type: String, default: '' },
    city: { type: String, default: '' },

    // What they want
    skills: [{ type: String, trim: true }], // e.g. ['React', 'Power BI']
    programType: {
      type: String,
      enum: ['workshop', 'bootcamp', 'guest-lecture', 'fdp', 'seminar', 'hackathon', 'other'],
      default: 'workshop'
    },
    preferredDates: { type: String, default: '' },
    durationDays: { type: Number, default: 1 },
    mode: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'offline' },
    expectedParticipants: { type: Number, default: 50 },
    departmentOrYear: { type: String, default: '' },
    budgetNote: { type: String, default: '' },
    message: { type: String, default: '' },

    status: {
      type: String,
      enum: ['new', 'contacted', 'proposal_sent', 'confirmed', 'delivered', 'declined'],
      default: 'new'
    },
    assignedResourcePerson: { type: String, default: '' },
    scheduledOn: { type: Date },
    adminNotes: { type: String, default: '' }
  },
  { timestamps: true }
);

export const ResourcePersonBooking = mongoose.model(
  'ResourcePersonBooking',
  resourcePersonBookingSchema
);
