import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import {
  Radio, PlayCircle, FileText, Calendar, Lock, Loader2, Users, Clock, AlertTriangle, ExternalLink
} from 'lucide-react';
import { batchApi } from '@/services/batchService';

function SessionRow({ session }) {
  const when = session.scheduledAt ? new Date(session.scheduledAt) : null;

  return (
    <li className="flex items-start gap-3 px-4 py-3 border-b border-white/10 last:border-0">
      <span className="shrink-0 mt-0.5">
        {session.status === 'live' ? (
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-500/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </span>
        ) : session.status === 'recorded' ? (
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/15">
            <PlayCircle className="w-4 h-4 text-orange-500" />
          </span>
        ) : (
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5">
            <Calendar className="w-4 h-4 text-gray-400" />
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white truncate">{session.title}</p>
        <p className="text-xs text-gray-500 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
          {when && <span>{when.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>}
          {session.durationMinutes ? (
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {session.durationMinutes}m</span>
          ) : null}
          <span className="capitalize">{session.status}</span>
        </p>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        {session.locked ? (
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <Lock className="w-3.5 h-3.5" /> Locked
          </span>
        ) : (
          <>
            {session.status === 'live' && session.liveUrl && (
              <a
                href={session.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
              >
                <Radio className="w-3.5 h-3.5" /> Join live
              </a>
            )}
            {session.status === 'recorded' && session.recordingUrl && (
              <a
                href={session.recordingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 border border-orange-500/50 text-orange-500 hover:bg-orange-500/10 text-xs font-medium px-3 py-1.5 rounded-lg"
              >
                <PlayCircle className="w-3.5 h-3.5" /> Watch
              </a>
            )}
            {session.notesUrl && (
              <a
                href={session.notesUrl}
                target="_blank"
                rel="noreferrer"
                title="Notes"
                className="p-1.5 text-gray-400 hover:text-orange-500"
              >
                <FileText className="w-4 h-4" />
              </a>
            )}
          </>
        )}
      </div>
    </li>
  );
}

export default function MyClasses() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    batchApi
      .mine()
      .then((d) => setBatches(Array.isArray(d) ? d : []))
      .catch(() => setBatches([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>;
  }

  if (batches.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
        <Users className="w-9 h-9 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-300 font-medium mb-1">You're not in a batch yet</p>
        <p className="text-sm text-gray-500 mb-5">
          Once you enrol in a course or internship and your seat is confirmed, your live classes and
          recordings appear here.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/courses" className="btn-neon inline-block">Browse courses</Link>
          <Link href="/internships" className="px-5 py-3 rounded-lg border border-white/15 text-sm font-semibold text-gray-300 hover:border-orange-500/50">
            Paid internships
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {batches.map((b) => {
        const unpaid = !['paid', 'waived', 'not_required'].includes(b.me.paymentStatus);
        return (
          <div key={b._id} className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <div className="p-5 border-b border-white/10">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wide text-orange-500 font-semibold mb-1">
                    {b.programType === 'internship' ? 'Internship' : 'Course'} batch
                  </p>
                  <h3 className="font-bold text-white">{b.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    <span className="font-mono">{b.code}</span>
                    {b.scheduleNote && <span>{b.scheduleNote}</span>}
                    <span className="capitalize">{b.mode}</span>
                    {b.mentorName && <span>Mentor: {b.mentorName}</span>}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-md font-medium shrink-0 capitalize ${
                  b.status === 'ongoing' ? 'bg-emerald-500/15 text-emerald-400'
                    : b.status === 'upcoming' ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-white/10 text-gray-400'
                }`}>
                  {b.status}
                </span>
              </div>

              {unpaid && (
                <p className="mt-4 flex items-start gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  Your fee payment is pending, so class links and recordings are locked. Contact us once you've paid
                  and we'll unlock access.
                </p>
              )}

              {!unpaid && b.liveClassUrl && (
                <a
                  href={b.liveClassUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-orange-500 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Standing class link for this batch
                </a>
              )}

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="rounded-xl bg-white/[0.04] p-3 text-center">
                  <p className="text-lg font-bold text-white">{b.me.attendancePercent}%</p>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">Attendance</p>
                </div>
                <div className="rounded-xl bg-white/[0.04] p-3 text-center">
                  <p className="text-lg font-bold text-white">
                    {b.me.performanceScore ?? '—'}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">Performance</p>
                </div>
                <div className="rounded-xl bg-white/[0.04] p-3 text-center">
                  <p className={`text-lg font-bold ${b.me.assessmentApproved ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {b.me.assessmentApproved ? 'Open' : 'Locked'}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">Assessment</p>
                </div>
              </div>

              {b.me.mentorRemarks && (
                <p className="mt-3 text-xs text-gray-400 italic border-l-2 border-orange-500/40 pl-3">
                  Mentor: {b.me.mentorRemarks}
                </p>
              )}
            </div>

            {b.sessions.length > 0 ? (
              <ul>
                {b.sessions.map((s) => <SessionRow key={s._id} session={s} />)}
              </ul>
            ) : (
              <p className="p-5 text-sm text-gray-500">
                No sessions scheduled yet — your mentor will add the timetable shortly.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
