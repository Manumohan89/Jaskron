import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { KeyRound, Clock, ListChecks, Target, AlertTriangle, Loader2, ArrowRight, History } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { examApi } from '@/services/examService';
import { useAuth } from '@/contexts/AuthContext';

const CODE_LENGTH = 6;

export default function ExamEntryPage() {
  const [, navigate] = useLocation();
  const { user, isLoading: authLoading } = useAuth();

  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (user) {
      examApi.myAttempts().then(setHistory).catch(() => setHistory([]));
    }
  }, [user]);

  const check = async (e) => {
    e?.preventDefault();
    const clean = code.trim().toUpperCase();
    if (clean.length < 4) {
      setError('Exam codes are at least 4 characters.');
      return;
    }
    if (!user) {
      navigate('/login');
      return;
    }
    setChecking(true);
    setError('');
    setInfo(null);
    try {
      const data = await examApi.lookup(clean);
      setInfo(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not find that exam.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SEO
        title="Enter Exam Code"
        description="Enter the exam code shared by your JASKRON instructor to start your assessment."
        path="/exam"
      />
      <Navigation />

      <main className="flex-1 container mx-auto px-4 pt-28 pb-16 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mx-auto mb-5">
            <KeyRound className="w-7 h-7 text-orange-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Enter your exam code</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Your instructor shares a short code when an exam opens. Type it below to see the details and begin.
          </p>
        </motion.div>

        <form onSubmit={check} className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <label htmlFor="examCode" className="block text-sm font-medium mb-3">
            Exam code
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="examCode"
              ref={inputRef}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
              placeholder="E.G. 7KQPM4"
              autoComplete="off"
              maxLength={10}
              className="flex-1 text-center sm:text-left font-mono text-2xl tracking-[0.4em] uppercase px-4 py-4 rounded-xl border border-border bg-background focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              disabled={checking}
              className="sm:w-44 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold px-6 py-4 rounded-xl transition-colors"
            >
              {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Find exam
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Codes are {CODE_LENGTH} characters and are not case sensitive.
          </p>

          {error && (
            <p className="mt-4 flex items-start gap-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
            </p>
          )}

          {!user && !authLoading && (
            <p className="mt-4 text-sm text-muted-foreground">
              You'll need to{' '}
              <Link href="/login" className="text-orange-500 font-medium hover:underline">
                sign in
              </Link>{' '}
              first — results are recorded against your account.
            </p>
          )}
        </form>

        {/* Exam details */}
        {info && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-border bg-card p-6 md:p-8"
          >
            <h2 className="text-xl font-bold mb-1">{info.exam.title}</h2>
            {info.exam.course?.title && (
              <p className="text-sm text-muted-foreground mb-3">Course: {info.exam.course.title}</p>
            )}
            {info.exam.description && (
              <p className="text-sm text-muted-foreground mb-5">{info.exam.description}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { icon: Clock, label: 'Duration', value: `${info.exam.durationMinutes} min` },
                { icon: ListChecks, label: 'Questions', value: info.exam.questionCount },
                { icon: Target, label: 'Pass mark', value: `${info.exam.passPercent}%` },
                { icon: History, label: 'Attempts', value: `${info.attemptsUsed}/${info.exam.maxAttempts}` }
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border p-4">
                  <s.icon className="w-4 h-4 text-orange-500 mb-2" />
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                  <p className="font-bold text-sm mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground mb-6 space-y-1.5">
              <p className="font-medium text-foreground">Before you start</p>
              <p>· The timer starts immediately and keeps running if you close the tab.</p>
              <p>· Your answers are submitted automatically when time runs out.</p>
              <p>· Switching tabs is recorded and visible to your instructor.</p>
            </div>

            {info.canStart ? (
              <button
                onClick={() => navigate(`/exam/take/${info.exam.examCode}`)}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                Start exam <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <p className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                {info.reason || 'This exam is not available to you right now.'}
              </p>
            )}
          </motion.div>
        )}

        {/* Past attempts */}
        {history.length > 0 && (
          <div className="mt-10">
            <h2 className="font-bold mb-4">Your previous attempts</h2>
            <div className="rounded-2xl border border-border divide-y divide-border overflow-hidden">
              {history.slice(0, 6).map((a) => (
                <Link
                  key={a._id}
                  href={`/exam/result/${a._id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{a.exam?.title || 'Exam'}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.exam?.examCode} · {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <span className="ml-auto text-sm font-bold shrink-0">
                    {a.exam?.showResultImmediately === false ? (
                      <span className="text-muted-foreground text-xs font-normal">Pending release</span>
                    ) : (
                      <span className={a.passed ? 'text-emerald-500' : 'text-red-500'}>{a.percentage}%</span>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
