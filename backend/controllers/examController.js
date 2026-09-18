import mongoose from 'mongoose';
import { Exam } from '../models/Exam.js';
import { ExamAttempt } from '../models/ExamAttempt.js';
import { Enrollment } from '../models/Enrollment.js';
import { Certificate } from '../models/Certificate.js';
import { User } from '../models/User.js';
import { notifyUser } from '../utils/notify.js';

/* ------------------------------ helpers ------------------------------ */

async function uniqueCode() {
  for (let i = 0; i < 10; i += 1) {
    const code = Exam.generateCode();
    // eslint-disable-next-line no-await-in-loop
    if (!(await Exam.exists({ examCode: code }))) return code;
  }
  return `${Exam.generateCode()}${Date.now().toString(36).slice(-2).toUpperCase()}`;
}

function windowState(exam) {
  const now = Date.now();
  if (exam.status !== 'published') return 'This exam is not open right now.';
  if (exam.availableFrom && now < new Date(exam.availableFrom).getTime()) {
    return `This exam opens on ${new Date(exam.availableFrom).toLocaleString()}.`;
  }
  if (exam.availableUntil && now > new Date(exam.availableUntil).getTime()) {
    return 'This exam has closed.';
  }
  return null;
}

async function assertCanTake(exam, user) {
  const closed = windowState(exam);
  if (closed) return closed;

  if (exam.access === 'invite') {
    const allowed = (exam.allowedEmails || []).includes(String(user.email).toLowerCase());
    if (!allowed) return 'Your account is not on the invite list for this exam.';
  }
  if (exam.access === 'enrolled' && exam.course) {
    const enrolled = await Enrollment.exists({ user: user.id, course: exam.course });
    if (!enrolled) return 'You must be enrolled in the linked course to take this exam.';
  }
  return null;
}

/** Grades one answer against its question. */
function gradeAnswer(question, answer) {
  const marks = question.marks || 1;

  if (question.type === 'short') {
    const given = String(answer?.textAnswer || '').trim().toLowerCase();
    const ok =
      given.length > 0 &&
      (question.acceptedAnswers || []).some((a) => String(a).trim().toLowerCase() === given);
    return { isCorrect: ok, marksAwarded: ok ? marks : -(question.negativeMarks || 0) };
  }

  const correctIds = question.options.filter((o) => o.isCorrect).map((o) => String(o._id));
  const selected = (answer?.selectedOptions || []).map(String);
  if (selected.length === 0) return { isCorrect: false, marksAwarded: 0 };

  const ok =
    correctIds.length === selected.length && correctIds.every((id) => selected.includes(id));
  return { isCorrect: ok, marksAwarded: ok ? marks : -(question.negativeMarks || 0) };
}

/* ------------------------------ admin CRUD ------------------------------ */

// GET /api/exams/admin/all
export async function adminListExams(_req, res) {
  try {
    const exams = await Exam.find()
      .populate('course', 'title slug')
      .sort({ createdAt: -1 })
      .lean();
    const withCounts = await Promise.all(
      exams.map(async (e) => ({
        ...e,
        questionCount: (e.questions || []).length,
        attemptCount: await ExamAttempt.countDocuments({ exam: e._id, status: { $ne: 'in_progress' } })
      }))
    );
    res.json(withCounts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch exams' });
  }
}

// GET /api/exams/admin/:id — full exam including answer keys
export async function adminGetExam(req, res) {
  try {
    const exam = await Exam.findById(req.params.id).populate('course', 'title slug');
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch exam' });
  }
}

// POST /api/exams
export async function createExam(req, res) {
  try {
    const body = { ...req.body };
    if (!body.title) return res.status(400).json({ message: 'Exam title is required' });
    body.examCode = body.examCode
      ? String(body.examCode).toUpperCase().replace(/\s+/g, '')
      : await uniqueCode();
    if (await Exam.exists({ examCode: body.examCode })) {
      return res.status(409).json({ message: 'That exam code is already in use' });
    }
    if (!body.course) delete body.course;
    const exam = await Exam.create({ ...body, createdBy: req.user.id });
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create exam' });
  }
}

// PUT /api/exams/:id
export async function updateExam(req, res) {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const body = { ...req.body };
    delete body.createdBy;
    if (body.examCode) {
      body.examCode = String(body.examCode).toUpperCase().replace(/\s+/g, '');
      const clash = await Exam.findOne({ examCode: body.examCode, _id: { $ne: exam._id } });
      if (clash) return res.status(409).json({ message: 'That exam code is already in use' });
    }
    if (body.course === '' || body.course === null) body.course = undefined;

    Object.assign(exam, body);
    await exam.save(); // pre-save recomputes totalMarks
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update exam' });
  }
}

// POST /api/exams/:id/regenerate-code
export async function regenerateCode(req, res) {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    exam.examCode = await uniqueCode();
    await exam.save();
    res.json({ examCode: exam.examCode });
  } catch (error) {
    res.status(500).json({ message: 'Failed to regenerate code' });
  }
}

// DELETE /api/exams/:id
export async function deleteExam(req, res) {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    await ExamAttempt.deleteMany({ exam: exam._id });
    res.json({ message: 'Exam deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete exam' });
  }
}

// GET /api/exams/:id/results — admin results table
export async function examResults(req, res) {
  try {
    const attempts = await ExamAttempt.find({ exam: req.params.id, status: { $ne: 'in_progress' } })
      .populate('user', 'name email')
      .sort({ percentage: -1, submittedAt: 1 });

    const submitted = attempts.length;
    const passed = attempts.filter((a) => a.passed).length;
    const avg = submitted ? Math.round(attempts.reduce((n, a) => n + a.percentage, 0) / submitted) : 0;

    res.json({ attempts, stats: { submitted, passed, failed: submitted - passed, averagePercent: avg } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch results' });
  }
}

/* --------------------------- student: code flow --------------------------- */

// POST /api/exams/lookup  { examCode }  — validate a code before starting
export async function lookupExam(req, res) {
  try {
    const code = String(req.body.examCode || '').toUpperCase().replace(/\s+/g, '');
    if (!code) return res.status(400).json({ message: 'Enter an exam code' });

    const exam = await Exam.findOne({ examCode: code }).populate('course', 'title slug');
    if (!exam) return res.status(404).json({ message: 'No exam found for that code. Check it and try again.' });

    const problem = await assertCanTake(exam, req.user);
    const attemptsUsed = await ExamAttempt.countDocuments({
      exam: exam._id,
      user: req.user.id,
      status: { $ne: 'in_progress' }
    });

    res.json({
      exam: {
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        examCode: exam.examCode,
        durationMinutes: exam.durationMinutes,
        totalMarks: exam.totalMarks,
        passPercent: exam.passPercent,
        questionCount: exam.questions.length,
        maxAttempts: exam.maxAttempts,
        requireFullScreen: exam.requireFullScreen,
        course: exam.course
      },
      attemptsUsed,
      canStart: !problem && attemptsUsed < exam.maxAttempts,
      reason:
        problem ||
        (attemptsUsed >= exam.maxAttempts
          ? `You have used all ${exam.maxAttempts} attempt(s) for this exam.`
          : null)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to look up exam' });
  }
}

// POST /api/exams/start  { examCode }
export async function startExam(req, res) {
  try {
    const code = String(req.body.examCode || '').toUpperCase().replace(/\s+/g, '');
    const exam = await Exam.findOne({ examCode: code });
    if (!exam) return res.status(404).json({ message: 'No exam found for that code' });

    const problem = await assertCanTake(exam, req.user);
    if (problem) return res.status(403).json({ message: problem });

    if (!exam.questions.length) {
      return res.status(400).json({ message: 'This exam has no questions yet.' });
    }

    // Resume an unfinished attempt rather than burning another one.
    const open = await ExamAttempt.findOne({ exam: exam._id, user: req.user.id, status: 'in_progress' });
    if (open) {
      if (open.expiresAt && Date.now() > new Date(open.expiresAt).getTime()) {
        await finalizeAttempt(open, exam, 'auto_submitted');
        return res.status(409).json({ message: 'Your previous attempt timed out and was submitted.', attemptId: open._id });
      }
      return res.json({
        attemptId: open._id,
        expiresAt: open.expiresAt,
        exam: exam.toStudentJSON(exam.shuffleQuestions)
      });
    }

    const used = await ExamAttempt.countDocuments({ exam: exam._id, user: req.user.id, status: { $ne: 'in_progress' } });
    if (used >= exam.maxAttempts) {
      return res.status(403).json({ message: `You have used all ${exam.maxAttempts} attempt(s).` });
    }

    const attempt = await ExamAttempt.create({
      exam: exam._id,
      user: req.user.id,
      attemptNumber: used + 1,
      totalMarks: exam.totalMarks,
      expiresAt: new Date(Date.now() + exam.durationMinutes * 60 * 1000)
    });

    res.status(201).json({
      attemptId: attempt._id,
      expiresAt: attempt.expiresAt,
      exam: exam.toStudentJSON(exam.shuffleQuestions)
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'An attempt is already in progress.' });
    res.status(500).json({ message: 'Failed to start exam' });
  }
}

/** Shared grading path used by submit and auto-submit. */
async function finalizeAttempt(attempt, exam, status, answers = null, focusLostCount = 0) {
  const qById = new Map(exam.questions.map((q) => [String(q._id), q]));

  const graded = (answers || attempt.answers || []).map((a) => {
    const q = qById.get(String(a.question));
    if (!q) return { question: a.question, selectedOptions: [], textAnswer: '', isCorrect: false, marksAwarded: 0 };
    const { isCorrect, marksAwarded } = gradeAnswer(q, a);
    return {
      question: q._id,
      selectedOptions: a.selectedOptions || [],
      textAnswer: a.textAnswer || '',
      isCorrect,
      marksAwarded
    };
  });

  const score = Math.max(0, graded.reduce((n, a) => n + a.marksAwarded, 0));
  const totalMarks = exam.totalMarks || exam.computeTotalMarks() || 1;
  const percentage = Math.round((score / totalMarks) * 100);

  attempt.answers = graded;
  attempt.score = score;
  attempt.totalMarks = totalMarks;
  attempt.percentage = percentage;
  attempt.passed = percentage >= (exam.passPercent || 0);
  attempt.status = status;
  attempt.submittedAt = new Date();
  attempt.timeSpentSeconds = Math.round((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);
  if (focusLostCount) attempt.focusLostCount = focusLostCount;
  await attempt.save();
  return attempt;
}

// POST /api/exams/attempt/:attemptId/submit  { answers: [...], focusLostCount }
export async function submitExam(req, res) {
  try {
    const attempt = await ExamAttempt.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    if (String(attempt.user) !== String(req.user.id)) {
      return res.status(403).json({ message: 'This is not your attempt' });
    }
    if (attempt.status !== 'in_progress') {
      return res.status(409).json({ message: 'This attempt has already been submitted' });
    }

    const exam = await Exam.findById(attempt.exam);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const late = attempt.expiresAt && Date.now() > new Date(attempt.expiresAt).getTime() + 5000;
    await finalizeAttempt(
      attempt,
      exam,
      late ? 'auto_submitted' : 'submitted',
      req.body.answers || [],
      req.body.focusLostCount || 0
    );

    // Certificate on pass, when the exam is configured for it
    if (attempt.passed && exam.certificateOnPass) {
      const user = await User.findById(req.user.id);
      const existing = await Certificate.findOne({ user: user._id, courseTitle: exam.title });
      if (!existing) {
        const cert = await Certificate.create({
          certificateId: Certificate.generateCertificateId(),
          user: user._id,
          recipientName: user.name || user.email,
          courseTitle: exam.title,
          grade: attempt.percentage >= 85 ? 'Distinction' : attempt.percentage >= 70 ? 'Merit' : 'Pass'
        });
        attempt.certificate = cert._id;
        await attempt.save();
      }
    }

    try {
      await notifyUser(req.user.id, {
        title: attempt.passed ? 'Exam passed' : 'Exam submitted',
        message: `${exam.title}: ${attempt.score}/${attempt.totalMarks} (${attempt.percentage}%)`,
        type: 'exam',
        link: `/exam/result/${attempt._id}`
      });
    } catch {
      /* notifications are best-effort */
    }

    if (!exam.showResultImmediately) {
      return res.json({ message: 'Submitted. Results will be published by your instructor.', attemptId: attempt._id, resultHidden: true });
    }

    res.json({
      attemptId: attempt._id,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      passed: attempt.passed
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit exam' });
  }
}

// GET /api/exams/attempt/:attemptId — student's own result
export async function getAttempt(req, res) {
  try {
    const attempt = await ExamAttempt.findById(req.params.attemptId).populate('exam', 'title examCode passPercent showAnswersAfterSubmit showResultImmediately questions durationMinutes');
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

    const isOwner = String(attempt.user) === String(req.user.id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const exam = attempt.exam;
    const reveal = req.user.role === 'admin' || exam.showAnswersAfterSubmit;
    const hideScore = !isOwner ? false : !exam.showResultImmediately && req.user.role !== 'admin';

    const review = reveal
      ? attempt.answers.map((a) => {
          const q = exam.questions.id(a.question);
          return {
            question: q?.text,
            type: q?.type,
            options: (q?.options || []).map((o) => ({ text: o.text, isCorrect: o.isCorrect, _id: o._id })),
            acceptedAnswers: q?.acceptedAnswers || [],
            explanation: q?.explanation || '',
            selectedOptions: a.selectedOptions,
            textAnswer: a.textAnswer,
            isCorrect: a.isCorrect,
            marksAwarded: a.marksAwarded
          };
        })
      : null;

    res.json({
      attempt: {
        _id: attempt._id,
        examTitle: exam.title,
        examCode: exam.examCode,
        status: attempt.status,
        score: hideScore ? null : attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: hideScore ? null : attempt.percentage,
        passed: hideScore ? null : attempt.passed,
        passPercent: exam.passPercent,
        submittedAt: attempt.submittedAt,
        timeSpentSeconds: attempt.timeSpentSeconds,
        certificate: attempt.certificate
      },
      resultHidden: hideScore,
      review
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attempt' });
  }
}

// GET /api/exams/me/attempts — student's exam history
export async function myAttempts(req, res) {
  try {
    const attempts = await ExamAttempt.find({ user: req.user.id, status: { $ne: 'in_progress' } })
      .populate('exam', 'title examCode passPercent showResultImmediately')
      .sort({ submittedAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attempts' });
  }
}

export { mongoose };
