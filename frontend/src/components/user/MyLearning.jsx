import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { PlayCircle, Award, KeyRound, Loader2, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { courseApi } from '@/services/courseService';
import { examApi } from '@/services/examService';

export default function MyLearning() {
  const [enrollments, setEnrollments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      courseApi.myEnrollments().catch(() => []),
      examApi.myAttempts().catch(() => [])
    ])
      .then(([e, a]) => {
        setEnrollments(Array.isArray(e) ? e : []);
        setAttempts(Array.isArray(a) ? a : []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  const inProgress = enrollments.filter((e) => e.status !== 'completed');
  const completed = enrollments.filter((e) => e.status === 'completed');

  return (
    <div className="space-y-10">
      {/* Courses */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-white">My courses</h2>
          <Link href="/courses" className="text-sm text-orange-500 hover:underline inline-flex items-center gap-1">
            Browse catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
            <PlayCircle className="w-9 h-9 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-300 font-medium mb-1">You haven't enrolled in anything yet</p>
            <p className="text-sm text-gray-500 mb-5">
              Pick a track and start with the first recorded module.
            </p>
            <Link href="/courses" className="btn-neon inline-block">Explore courses</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {[...inProgress, ...completed].map((e) => {
              const c = e.course || {};
              return (
                <div key={e._id} className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden flex">
                  <img
                    src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?fm=jpg&q=80&w=400&auto=format&fit=crop'}
                    alt={c.title}
                    className="w-28 object-cover shrink-0"
                  />
                  <div className="p-4 flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white truncate">{c.title || 'Course'}</p>
                    <p className="text-xs text-gray-500 mb-3">{c.instructorName}</p>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-orange-500" style={{ width: `${e.progressPercent}%` }} />
                      </div>
                      <span className="text-[11px] text-gray-400 shrink-0">{e.progressPercent}%</span>
                    </div>

                    {c.slug && (
                      <Link href={`/learn/${c.slug}`} className="text-xs font-medium text-orange-500 hover:underline inline-flex items-center gap-1">
                        {e.status === 'completed' ? 'Review course' : e.progressPercent > 0 ? 'Continue' : 'Start'}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Exams */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-white">My exams</h2>
          <Link href="/exam" className="text-sm text-orange-500 hover:underline inline-flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5" /> Enter exam code
          </Link>
        </div>

        {attempts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
            <KeyRound className="w-8 h-8 text-gray-500 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              No attempts yet. When your instructor shares an exam code, enter it to begin.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 divide-y divide-white/10 overflow-hidden">
            {attempts.map((a) => (
              <Link
                key={a._id}
                href={`/exam/result/${a._id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.04] transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{a.exam?.title || 'Exam'}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="font-mono">{a.exam?.examCode}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : '—'}
                    </span>
                  </p>
                </div>
                <div className="ml-auto text-right shrink-0">
                  {a.exam?.showResultImmediately === false ? (
                    <span className="text-xs text-gray-500">Pending release</span>
                  ) : (
                    <>
                      <p className={`text-sm font-bold ${a.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                        {a.percentage}%
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {a.score}/{a.totalMarks} marks
                      </p>
                    </>
                  )}
                </div>
                {a.passed && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              </Link>
            ))}
          </div>
        )}
      </section>

      {completed.length > 0 && (
        <p className="text-xs text-gray-500 flex items-center gap-2">
          <Award className="w-4 h-4 text-orange-500" />
          Certificates for completed courses appear under the Certificates tab.
        </p>
      )}
    </div>
  );
}
