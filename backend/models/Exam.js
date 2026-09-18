import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';

/**
 * Questions support four types.
 *  - mcq        → exactly one correct option
 *  - multiple   → one or more correct options
 *  - truefalse  → rendered as two fixed options
 *  - short      → free text, matched case-insensitively against acceptedAnswers
 */
const questionSchema = new Schema(
  {
    text: { type: String, required: true },
    type: {
      type: String,
      enum: ['mcq', 'multiple', 'truefalse', 'short'],
      default: 'mcq'
    },
    image: { type: String, default: '' },
    options: [
      {
        text: { type: String, required: true },
        isCorrect: { type: Boolean, default: false }
      }
    ],
    acceptedAnswers: [{ type: String }], // for `short`
    marks: { type: Number, default: 1 },
    negativeMarks: { type: Number, default: 0 },
    explanation: { type: String, default: '' },
    order: { type: Number, default: 0 }
  },
  { _id: true }
);

const examSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },

    // Students join with this code — short, uppercase, unique.
    examCode: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },

    course: { type: Schema.Types.ObjectId, ref: 'Course' }, // optional link
    domain: { type: String, default: 'other' },

    durationMinutes: { type: Number, default: 30 },
    totalMarks: { type: Number, default: 0 },
    passPercent: { type: Number, default: 40 },

    maxAttempts: { type: Number, default: 1 },
    shuffleQuestions: { type: Boolean, default: true },
    shuffleOptions: { type: Boolean, default: true },
    showResultImmediately: { type: Boolean, default: true },
    showAnswersAfterSubmit: { type: Boolean, default: false },

    // Access window — null means "always open while status is published"
    availableFrom: { type: Date },
    availableUntil: { type: Date },

    // 'open'        → anyone with the code (must be signed in)
    // 'enrolled'    → only learners enrolled in the linked course
    // 'invite'      → only emails on the allowlist
    access: { type: String, enum: ['open', 'enrolled', 'invite'], default: 'open' },
    allowedEmails: [{ type: String, lowercase: true, trim: true }],

    requireFullScreen: { type: Boolean, default: false },
    certificateOnPass: { type: Boolean, default: false },

    questions: [questionSchema],

    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'draft'
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

examSchema.statics.generateCode = function () {
  // 6 chars, no ambiguous 0/O/1/I
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i += 1) out += alphabet[bytes[i] % alphabet.length];
  return out;
};

examSchema.methods.computeTotalMarks = function () {
  return (this.questions || []).reduce((n, q) => n + (q.marks || 0), 0);
};

examSchema.pre('save', function (next) {
  this.totalMarks = this.computeTotalMarks();
  next();
});

/** Strips correct answers — what a student is allowed to see. */
examSchema.methods.toStudentJSON = function (shuffle = true) {
  const pick = (arr) => (shuffle ? [...arr].sort(() => Math.random() - 0.5) : arr);
  const questions = pick(
    (this.questions || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0))
  ).map((q) => ({
    _id: q._id,
    text: q.text,
    type: q.type,
    image: q.image,
    marks: q.marks,
    negativeMarks: q.negativeMarks,
    options:
      q.type === 'short'
        ? []
        : (this.shuffleOptions && shuffle ? [...q.options].sort(() => Math.random() - 0.5) : q.options).map(
            (o) => ({ _id: o._id, text: o.text })
          )
  }));

  return {
    _id: this._id,
    title: this.title,
    description: this.description,
    examCode: this.examCode,
    durationMinutes: this.durationMinutes,
    totalMarks: this.totalMarks,
    passPercent: this.passPercent,
    requireFullScreen: this.requireFullScreen,
    questionCount: questions.length,
    questions
  };
};

export const Exam = mongoose.model('Exam', examSchema);
