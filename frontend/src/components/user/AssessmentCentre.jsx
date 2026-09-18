import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  KeyRound, Lock, Loader2, ArrowRight, Clock, ListChecks, Target, AlertTriangle,
  CheckCircle2, ClipboardCheck, Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { examApi } from '@/services/examService';
import { batchApi } from '@/services/batchService';

/**
 * The post-login Assessment Centre. Replaces the old public /exam page:
 * codes are only handed out to approved batch members, and anyone can still
 * type a code they were given directly.
 */
export default function AssessmentCentre() {
  const [, navigate] = useLocation();
  const [batches, setBatches] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    Promise.all([batchApi.mine().catch(() => []), examApi.myAttempts().catch(() => [])])
      .then(([b, a]) => {
        setBatches(Array.isArray(b) ? b : []);
        setAttempts(Array.isArray(a) ? a : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const check = async (e, preset) => {
    e?.preventDefault();
    const clean = String(preset || code).trim().toUpperCase();
    if (clean.length < 4) {
      setError('Assessment codes are at least 4 characters.');
      return;
    }
    setChecking(true);
    setError('');
    setInfo(null);
    try {
      setInfo(await examApi.lookup(clean));
      setCode(clean);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not find that assessment.');
    } finally {
      setChecking(false);
    }
  };

  const copy = (value) => {
    navigator.clipboard?.writeText(value);
    toast.success(`Copied ${value}`);
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>;
  }

  const withExams = batches.filter((b) => b.exam);

  return (
    <div className="space-y-8">
      {/* Assessments released to your batches */}
      <section>
        <h2 className="text-lg font-bold text-white mb-1">Released to your batches</h2>
        <p className="text-sm text-gray-500 mb-4">
          Your admin approves assessment access once your batch has finished the training.
        </p>

        {withExams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
            <ClipboardCheck className="w-8 h-8 text-gray-500 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              No assessment has been released to your batches yet. If your instructor gave you a code
              directly, enter it below.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {withExams.map((b) => {
              const unlocked = Boolean(b.exam?.examCode);
              return (
                <div key={b._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-wide text-orange-500 font-semibold mb-1">
                        {b.name}
                      </p>
                      <h3 className="font-semibold text-white">{b.exam.title}</h3>
                      {unlocked && (
                        <p className="text-xs text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {b.exam.durationMinutes} min</span>
                          <span className="flex items-center gap-1"><Target className="w-3 h-3" /> pass {b.exam.passPercent}%</span>
                        </p>
                      )}
                    </div>

                    {unlocked ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => copy(b.exam.examCode)}
                          className="inline-flex items-center gap-1.5 font-mono text-sm font-bold text-orange-500 border border-orange-500/40 rounded-lg px-3 py-2 hover:bg-orange-500/10"
                        >
                          {b.exam.examCode} <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => navigate(`/exam/take/${b.exam.examCode}`)}
                          className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
                        >
                          Start <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 shrink-0">
                        <Lock className="w-3.5 h-3.5" /> Awaiting admin approval
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Manual code entry */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">Have a code?</h2>
        <form onSubmit={check} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                ref={inputRef}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
                placeholder="ENTER CODE"
                autoComplete="off"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/15 bg-black/20 text-white font-mono text-lg tracking-[0.3em] uppercase placeholder:tracking-normal placeholder:text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <button
              type="submit"
              disabled={checking}
              className="sm:w-40 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold px-6 py-3.5 rounded-xl"
            >
              {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Find
            </button>
          </div>

          {error && (
            <p className="mt-3 flex items-start gap-2 text-sm text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
            </p>
          )}
        </form>

        {info && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="font-bold text-white mb-1">{info.exam.title}</h3>
            {info.exam.description && <p className="text-sm text-gray-400 mb-4">{info.exam.description}</p>}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { icon: Clock, label: 'Duration', value: `${info.exam.durationMinutes} min` },
                { icon: ListChecks, label: 'Questions', value: info.exam.questionCount },
                { icon: Target, label: 'Pass mark', value: `${info.exam.passPercent}%` },
                { icon: CheckCircle2, label: 'Attempts', value: `${info.attemptsUsed}/${info.exam.maxAttempts}` }
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 p-3">
                  <s.icon className="w-4 h-4 text-orange-500 mb-1.5" />
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">{s.label}</p>
                  <p className="font-bold text-sm text-white">{s.value}</p>
                </div>
              ))}
            </div>

            {info.canStart ? (
              <button
                onClick={() => navigate(`/exam/take/${info.exam.examCode}`)}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl"
              >
                Start assessment <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <p className="flex items-start gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                {info.reason || 'This assessment is not available to you right now.'}
              </p>
            )}
          </div>
        )}
      </section>

      {/* History */}
      {attempts.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-4">Your results</h2>
          <div className="rounded-2xl border border-white/10 divide-y divide-white/10 overflow-hidden">
            {attempts.map((a) => (
              <Link
                key={a._id}
                href={`/exam/result/${a._id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.04] transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{a.exam?.title || 'Assessment'}</p>
                  <p className="text-xs text-gray-500">
                    <span className="font-mono">{a.exam?.examCode}</span>
                    {a.submittedAt ? ` · ${new Date(a.submittedAt).toLocaleDateString()}` : ''}
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
                      <p className="text-[11px] text-gray-500">{a.score}/{a.totalMarks}</p>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
