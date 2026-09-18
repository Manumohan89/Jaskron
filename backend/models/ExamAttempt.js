import mongoose, { Schema } from 'mongoose';

const answerSchema = new Schema(
  {
    question: { type: Schema.Types.ObjectId, required: true },
    selectedOptions: [{ type: Schema.Types.ObjectId }],
    textAnswer: { type: String, default: '' },
    isCorrect: { type: Boolean, default: false },
    marksAwarded: { type: Number, default: 0 }
  },
  { _id: false }
);

const examAttemptSchema = new Schema(
  {
    exam: { type: Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    attemptNumber: { type: Number, default: 1 },
    answers: [answerSchema],

    score: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ['in_progress', 'submitted', 'auto_submitted', 'abandoned'],
      default: 'in_progress'
    },

    startedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    submittedAt: { type: Date },
    timeSpentSeconds: { type: Number, default: 0 },

    // simple integrity signal — how many times the tab lost focus
    focusLostCount: { type: Number, default: 0 },

    certificate: { type: Schema.Types.ObjectId, ref: 'Certificate' }
  },
  { timestamps: true }
);

examAttemptSchema.index({ exam: 1, user: 1, attemptNumber: 1 }, { unique: true });

export const ExamAttempt = mongoose.model('ExamAttempt', examAttemptSchema);
