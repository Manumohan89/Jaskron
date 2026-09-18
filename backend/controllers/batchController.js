import { Batch } from '../models/Batch.js';
import { Certificate } from '../models/Certificate.js';
import { Exam } from '../models/Exam.js';
import { User } from '../models/User.js';
import { notifyUser } from '../utils/notify.js';

/* ------------------------------ student views ------------------------------ */

// GET /api/batches/me — batches the signed-in user belongs to, with class access
export async function getMyBatches(req, res) {
  try {
    const batches = await Batch.find({ 'members.user': req.user.id })
      .populate('course', 'title slug thumbnail')
      .populate('internship', 'title slug thumbnail durationLabel')
      .populate('exam', 'title examCode durationMinutes passPercent status')
      .sort({ startDate: -1 });

    const shaped = batches.map((b) => {
      const me = b.members.find((m) => String(m.user) === String(req.user.id));
      const paid = me?.paymentStatus === 'paid' || me?.paymentStatus === 'not_required' || me?.paymentStatus === 'waived';

      // Live links and recordings are only handed out once the seat is paid for.
      const sessions = (b.sessions || [])
        .slice()
        .sort((a, c) => (a.order || 0) - (c.order || 0))
        .map((s) => ({
          _id: s._id,
          title: s.title,
          scheduledAt: s.scheduledAt,
          durationMinutes: s.durationMinutes,
          status: s.status,
          liveUrl: paid && s.status === 'live' ? s.liveUrl : '',
          recordingUrl: paid && s.status === 'recorded' ? s.recordingUrl : '',
          notesUrl: paid ? s.notesUrl : '',
          locked: !paid
        }));

      return {
        _id: b._id,
        name: b.name,
        code: b.code,
        programType: b.programType,
        program: b.course || b.internship || null,
        startDate: b.startDate,
        endDate: b.endDate,
        mode: b.mode,
        scheduleNote: b.scheduleNote,
        mentorName: b.mentorName,
        status: b.status,
        liveClassUrl: paid ? b.liveClassUrl : '',
        sessions,
        me: {
          paymentStatus: me?.paymentStatus,
          assessmentApproved: Boolean(me?.assessmentApproved),
          attendancePercent: me?.attendancePercent || 0,
          performanceScore: me?.performanceScore ?? null,
          mentorRemarks: me?.mentorRemarks || '',
          status: me?.status,
          certificate: me?.certificate || null
        },
        // The exam code is only revealed to approved, paid members.
        exam:
          b.exam && me?.assessmentApproved && paid
            ? {
                _id: b.exam._id,
                title: b.exam.title,
                examCode: b.exam.examCode,
                durationMinutes: b.exam.durationMinutes,
                passPercent: b.exam.passPercent,
                status: b.exam.status
              }
            : b.exam
            ? { title: b.exam.title, locked: true }
            : null
      };
    });

    res.json(shaped);
  } catch {
    res.status(500).json({ message: 'Failed to fetch your batches' });
  }
}

/* -------------------------------- admin CRUD ------------------------------- */

export async function adminListBatches(req, res) {
  try {
    const filter = {};
    if (req.query.programType) filter.programType = req.query.programType;
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;

    const batches = await Batch.find(filter)
      .populate('course', 'title slug')
      .populate('internship', 'title slug')
      .populate('exam', 'title examCode')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 });
    res.json(batches);
  } catch {
    res.status(500).json({ message: 'Failed to fetch batches' });
  }
}

export async function getBatch(req, res) {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('course', 'title slug')
      .populate('internship', 'title slug certificateTitle durationLabel')
      .populate('exam', 'title examCode')
      .populate('members.user', 'name email');
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch {
    res.status(500).json({ message: 'Failed to fetch batch' });
  }
}

export async function createBatch(req, res) {
  try {
    const body = { ...req.body };
    if (!body.name || !body.programType) {
      return res.status(400).json({ message: 'Batch name and program type are required' });
    }
    body.code = body.code
      ? String(body.code).toUpperCase().replace(/\s+/g, '')
      : Batch.generateCode(body.programType === 'internship' ? 'INT' : 'CRS');
    if (await Batch.exists({ code: body.code })) {
      return res.status(409).json({ message: 'That batch code is already in use' });
    }
    ['course', 'internship', 'exam'].forEach((k) => {
      if (!body[k]) delete body[k];
    });
    const batch = await Batch.create({ ...body, createdBy: req.user.id });
    res.status(201).json(batch);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create batch' });
  }
}

export async function updateBatch(req, res) {
  try {
    const body = { ...req.body };
    delete body.createdBy;
    delete body.members; // roster changes go through the member endpoints
    if (body.code) body.code = String(body.code).toUpperCase().replace(/\s+/g, '');
    ['course', 'internship', 'exam'].forEach((k) => {
      if (body[k] === '' || body[k] === null) body[k] = undefined;
    });
    const batch = await Batch.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update batch' });
  }
}

export async function deleteBatch(req, res) {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json({ message: 'Batch deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete batch' });
  }
}

/* ------------------------------ roster handling ---------------------------- */

// POST /api/batches/:id/members  { userId, paymentStatus }
export async function addMember(req, res) {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const { userId, paymentStatus = 'pending' } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (batch.members.some((m) => String(m.user) === String(userId))) {
      return res.status(409).json({ message: 'That student is already in this batch' });
    }
    if (batch.members.length >= batch.capacity) {
      return res.status(400).json({ message: 'This batch is full' });
    }

    batch.members.push({ user: userId, paymentStatus });
    await batch.save();

    try {
      await notifyUser(userId, {
        title: 'Added to a batch',
        message: `You've been added to ${batch.name}. Your classes appear in your dashboard.`,
        type: 'system',
        link: '/dashboard?tab=classes'
      });
    } catch {
      /* best effort */
    }

    res.status(201).json({ message: `${user.name || user.email} added to ${batch.name}` });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to add member' });
  }
}

// PATCH /api/batches/:id/members/:memberId
export async function updateMember(req, res) {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const member = batch.members.id(req.params.memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const before = member.assessmentApproved;
    ['paymentStatus', 'attendancePercent', 'performanceScore', 'mentorRemarks', 'status'].forEach((k) => {
      if (req.body[k] !== undefined) member[k] = req.body[k];
    });

    if (req.body.assessmentApproved !== undefined) {
      member.assessmentApproved = Boolean(req.body.assessmentApproved);
      if (member.assessmentApproved && !before) member.assessmentApprovedAt = new Date();
    }

    await batch.save();

    // Approving assessment access is worth telling the student about.
    if (member.assessmentApproved && !before) {
      try {
        await notifyUser(member.user, {
          title: 'Assessment unlocked',
          message: `You've been approved to take the assessment for ${batch.name}.`,
          type: 'exam',
          link: '/dashboard?tab=assessments'
        });
      } catch {
        /* best effort */
      }
    }

    res.json({ message: 'Member updated', member });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update member' });
  }
}

// DELETE /api/batches/:id/members/:memberId
export async function removeMember(req, res) {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    const member = batch.members.id(req.params.memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    member.deleteOne();
    await batch.save();
    res.json({ message: 'Member removed' });
  } catch {
    res.status(500).json({ message: 'Failed to remove member' });
  }
}

// POST /api/batches/:id/approve-all — unlock the assessment for every paid member
export async function approveAllForAssessment(req, res) {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    let approved = 0;
    batch.members.forEach((m) => {
      const paid = ['paid', 'waived', 'not_required'].includes(m.paymentStatus);
      if (paid && !m.assessmentApproved) {
        m.assessmentApproved = true;
        m.assessmentApprovedAt = new Date();
        approved += 1;
      }
    });
    await batch.save();

    await Promise.allSettled(
      batch.members
        .filter((m) => m.assessmentApproved)
        .map((m) =>
          notifyUser(m.user, {
            title: 'Assessment unlocked',
            message: `You've been approved to take the assessment for ${batch.name}.`,
            type: 'exam',
            link: '/dashboard?tab=assessments'
          })
        )
    );

    res.json({ message: `Approved ${approved} member(s)`, approved });
  } catch {
    res.status(500).json({ message: 'Failed to approve members' });
  }
}

/* --------------------------- certificate issuing --------------------------- */

/**
 * POST /api/batches/:id/members/:memberId/certificate
 * Issues a performance-graded certificate for one member.
 * body: { performanceScore?, grade?, remarks?, courseTitle? }
 */
export async function issueMemberCertificate(req, res) {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('course', 'title')
      .populate('internship', 'title certificateTitle durationLabel');
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const member = batch.members.id(req.params.memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const user = await User.findById(member.user);
    if (!user) return res.status(404).json({ message: 'Student account not found' });

    const score = req.body.performanceScore ?? member.performanceScore;
    if (score === undefined || score === null || score === '') {
      return res.status(400).json({
        message: 'Record a performance score for this student before issuing a certificate'
      });
    }

    const program = batch.programType === 'internship' ? batch.internship : batch.course;
    const title =
      req.body.courseTitle ||
      (batch.programType === 'internship'
        ? program?.certificateTitle || program?.title
        : program?.title) ||
      batch.name;

    const existing = await Certificate.findOne({
      user: user._id,
      batch: batch._id,
      status: 'active'
    });
    if (existing) {
      return res.status(409).json({
        message: 'This student already has a certificate for this batch',
        certificate: existing
      });
    }

    const certificate = await Certificate.create({
      certificateId: Certificate.generateCertificateId(),
      user: user._id,
      recipientName: user.name || user.email,
      courseTitle: title,
      programType: batch.programType,
      course: batch.programType === 'course' ? batch.course?._id : undefined,
      internship: batch.programType === 'internship' ? batch.internship?._id : undefined,
      batch: batch._id,
      performanceScore: Number(score),
      attendancePercent: member.attendancePercent,
      mentorRemarks: req.body.remarks ?? member.mentorRemarks,
      durationLabel: batch.programType === 'internship' ? program?.durationLabel || '' : '',
      grade: req.body.grade || Certificate.gradeForScore(score)
    });

    member.certificate = certificate._id;
    member.performanceScore = Number(score);
    member.status = 'completed';
    if (req.body.remarks) member.mentorRemarks = req.body.remarks;
    await batch.save();

    try {
      await notifyUser(user._id, {
        title: 'Certificate issued',
        message: `Your ${batch.programType} certificate for ${title} is ready (${certificate.grade}).`,
        type: 'certificate',
        link: '/dashboard?tab=certificates'
      });
    } catch {
      /* best effort */
    }

    res.status(201).json({ message: 'Certificate issued', certificate });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to issue certificate' });
  }
}

/**
 * POST /api/batches/:id/certificates — bulk issue for everyone with a score
 * who has completed and doesn't already hold one.
 */
export async function issueBatchCertificates(req, res) {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('course', 'title')
      .populate('internship', 'title certificateTitle durationLabel');
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const program = batch.programType === 'internship' ? batch.internship : batch.course;
    const baseTitle =
      (batch.programType === 'internship' ? program?.certificateTitle || program?.title : program?.title) ||
      batch.name;

    const issued = [];
    const skipped = [];

    for (const member of batch.members) {
      const score = member.performanceScore;
      if (score === undefined || score === null) {
        skipped.push({ member: member._id, reason: 'no performance score' });
        continue;
      }
      if (member.certificate) {
        skipped.push({ member: member._id, reason: 'already issued' });
        continue;
      }
      // eslint-disable-next-line no-await-in-loop
      const user = await User.findById(member.user);
      if (!user) {
        skipped.push({ member: member._id, reason: 'user missing' });
        continue;
      }

      // eslint-disable-next-line no-await-in-loop
      const certificate = await Certificate.create({
        certificateId: Certificate.generateCertificateId(),
        user: user._id,
        recipientName: user.name || user.email,
        courseTitle: baseTitle,
        programType: batch.programType,
        course: batch.programType === 'course' ? batch.course?._id : undefined,
        internship: batch.programType === 'internship' ? batch.internship?._id : undefined,
        batch: batch._id,
        performanceScore: Number(score),
        attendancePercent: member.attendancePercent,
        mentorRemarks: member.mentorRemarks,
        durationLabel: batch.programType === 'internship' ? program?.durationLabel || '' : '',
        grade: Certificate.gradeForScore(score)
      });

      member.certificate = certificate._id;
      member.status = 'completed';
      issued.push(certificate);
    }

    await batch.save();

    await Promise.allSettled(
      issued.map((c) =>
        notifyUser(c.user, {
          title: 'Certificate issued',
          message: `Your certificate for ${c.courseTitle} is ready (${c.grade}).`,
          type: 'certificate',
          link: '/dashboard?tab=certificates'
        })
      )
    );

    res.json({
      message: `Issued ${issued.length} certificate(s), skipped ${skipped.length}`,
      issued: issued.length,
      skipped
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to issue certificates' });
  }
}

/* --------------------------------- sessions -------------------------------- */

// POST /api/batches/:id/sessions
export async function addSession(req, res) {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    batch.sessions.push({ ...req.body, order: batch.sessions.length });
    await batch.save();
    res.status(201).json(batch.sessions[batch.sessions.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to add session' });
  }
}

// PATCH /api/batches/:id/sessions/:sessionId
export async function updateSession(req, res) {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    const session = batch.sessions.id(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const wasLive = session.status === 'live';
    ['title', 'scheduledAt', 'durationMinutes', 'liveUrl', 'recordingUrl', 'notesUrl', 'status', 'order'].forEach(
      (k) => {
        if (req.body[k] !== undefined) session[k] = req.body[k];
      }
    );
    await batch.save();

    // Going live is worth a push to the roster.
    if (session.status === 'live' && !wasLive) {
      await Promise.allSettled(
        batch.members
          .filter((m) => ['paid', 'waived', 'not_required'].includes(m.paymentStatus))
          .map((m) =>
            notifyUser(m.user, {
              title: 'Class is live',
              message: `${session.title} has started for ${batch.name}.`,
              type: 'system',
              link: '/dashboard?tab=classes'
            })
          )
      );
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update session' });
  }
}

// DELETE /api/batches/:id/sessions/:sessionId
export async function deleteSession(req, res) {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    const session = batch.sessions.id(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    session.deleteOne();
    await batch.save();
    res.json({ message: 'Session removed' });
  } catch {
    res.status(500).json({ message: 'Failed to remove session' });
  }
}
