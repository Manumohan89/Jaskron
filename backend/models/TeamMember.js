import mongoose, { Schema } from 'mongoose';
const teamMemberSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  certifications: [{
    type: String,
    trim: true
  }],
  social: {
    twitter: {
      type: String,
      default: ''
    },
    linkedin: {
      type: String,
      default: ''
    },
    github: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true
});
export const TeamMember = mongoose.model('TeamMember', teamMemberSchema);