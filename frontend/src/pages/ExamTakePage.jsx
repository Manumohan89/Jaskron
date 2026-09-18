import { useCallback, useEffect, useRef, useState } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { Clock, Flag, ChevronLeft, ChevronRight, Loader2, AlertTriangle, Send } from 'lucide-react';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import { examApi } from '@/services/examService';
import { useAuth } from '@/contexts/AuthContext';

function formatTime(seconds) {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export default function ExamTakePage() {
  const [, params] = useRoute('/exam/take/:code');
  const [, navigate] = useLocation();
  const { user, isLoading: authLoading } = useAuth();

  const [state, setState] = useState('loading'); // loading | ready | submitting | error
  const [errorMsg, setErrorMsg] = useState('');
  const [exam, setExam] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({}); // questionId -> { selectedOptions:[], textAnswer:'' }
  const [flagged, setFlagged] = useState(new Set());
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const focusLost = useRef(0);
  const submittedRef = useRef(false);

  /* ------------------------------ start attempt ----------------------------- */
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    let cancelled = false;
    examApi
      .start(params.code)
      .then((data) => {
        if (cancelled) return;
        setExam(data.exam);
        setAttemptId(data.attemptId);
        setSecondsLeft(Math.max(0, Math.round((new Date(data.expiresAt).getTime() - Date.now()) / 1000)));
        setState('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMsg(err.response?.data?.message || 'Could not start this exam.');
        setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [params?.code, user, authLoading, navigate]);

  /* --------------------------------- submit --------------------------------- */
  const submit = useCallback(
    async (auto = false) => {
      if (submittedRef.current || !attemptId) return;
      submittedRef.current = true;
      setState('submitting');
      try {
        const payload = Object.entries(answers).map(([question, a]) => ({
          question,
          selectedOptions: a.selectedOptions || [],
          textAnswer: a.textAnswer || ''
        }));
        const result = await examApi.submit(attemptId, payload, focusLost.current);
        if (auto) toast.info('Time is up — your exam was submitted automatically.');
        navigate(`/exam/result/${result.attemptId || attemptId}`);
      } catch (err) {
        submittedRef.current = false;
        setState('ready');
        toast.error(err.response?.data?.message || 'Submission failed. Try again.');
      }
    },
    [answers, attemptId, navigate]
  );

  /* --------------------------------- timer ---------------------------------- */
  useEffect(() => {
    if (state !== 'ready') return undefined;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          submit(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [state, submit]);

  /* ------------------------ tab-switch + unload guards ----------------------- */
  useEffect(() => {
    if (state !== 'ready') return undefined;
    const onVisibility = () => {
      if (document.hidden) {
        focusLost.current += 1;
        toast.warning('Leaving the exam tab is recorded.');
      }
    };
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [state]);

  /* -------------------------------- answering -------------------------------- */
  const setChoice = (q, optionId) => {
    setAnswers((prev) => {
      const existing = prev[q._id]?.selectedOptions || [];
      let next;
      if (q.type === 'multiple') {
        next = existing.includes(optionId) ? existing.filter((o) => o !== optionId) : [...existing, optionId];
      } else {
        next = [optionId];
      }
      return { ...prev, [q._id]: { ...prev[q._id], selectedOptions: next } };
    });
  };

  const setText = (q, value) =>
    setAnswers((prev) => ({ ...prev, [q._id]: { ...prev[q._id], textAnswer: value } }));

  const toggleFlag = (id) =>
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  /* --------------------------------- render --------------------------------- */
  if (state === 'loading' || authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="text-sm text-muted-foreground">Preparing your exam…</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500" />
        <h1 className="text-xl font-bold">{errorMsg}</h1>
        <Link href="/exam" className="btn-neon">Back to exam code</Link>
      </div>
    );
  }

  const questions = exam?.questions || [];
  const q = questions[current];
  const answered = Object.keys(answers).filter((k) => {
    const a = answers[k];
    return (a.selectedOptions?.length || 0) > 0 || (a.textAnswer || '').trim().length > 0;
  }).length;
  const lowTime = secondsLeft <= 60;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SEO title="Exam in progress" path="/exam" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Logo size={30} />
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{exam.title}</p>
            <p className="text-xs text-muted-foreground font-mono">{exam.examCode}</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden sm:block text-xs text-muted-foreground">
              {answered}/{questions.length} answered
            </span>
            <span
              className={`flex items-center gap-2 font-mono font-bold text-sm px-3 py-1.5 rounded-lg border ${
                lowTime
                  ? 'text-red-500 border-red-500/40 bg-red-500/10 animate-pulse'
                  : 'text-foreground border-border bg-muted/50'
              }`}
            >
              <Clock className="w-4 h-4" /> {formatTime(secondsLeft)}
            </span>
            <button
              onClick={() => setConfirmOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <Send className="w-3.5 h-3.5" /> Submit
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-[1fr_260px] gap-8 flex-1">
        {/* Question */}
        <main>
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-orange-500 font-semibold">
                  Question {current + 1} of {questions.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {q.marks} mark{q.marks === 1 ? '' : 's'}
                  {q.negativeMarks ? ` · −${q.negativeMarks} if wrong` : ''}
                  {q.type === 'multiple' ? ' · select all that apply' : ''}
                </p>
              </div>
              <button
                onClick={() => toggleFlag(q._id)}
                className={`shrink-0 p-2 rounded-lg border transition-colors ${
                  flagged.has(q._id)
                    ? 'border-amber-500 text-amber-500 bg-amber-500/10'
                    : 'border-border text-muted-foreground hover:border-amber-500/50'
                }`}
                title="Flag for review"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-lg font-semibold leading-relaxed mb-6 whitespace-pre-line">{q.text}</h2>
            {q.image && <img src={q.image} alt="" className="rounded-xl border border-border mb-6 max-h-72 object-contain" />}

            {q.type === 'short' ? (
              <textarea
                value={answers[q._id]?.textAnswer || ''}
                onChange={(e) => setText(q, e.target.value)}
                rows={4}
                placeholder="Type your answer…"
                className="w-full rounded-xl border border-border bg-background p-4 text-sm focus:outline-none focus:border-orange-500"
              />
            ) : (
              <ul className="space-y-3">
                {q.options.map((o, oi) => {
                  const selected = (answers[q._id]?.selectedOptions || []).includes(o._id);
                  return (
                    <li key={o._id}>
                      <button
                        onClick={() => setChoice(q, o._id)}
                        className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border transition-all ${
                          selected
                            ? 'border-orange-500 bg-orange-500/10'
                            : 'border-border hover:border-orange-500/40 hover:bg-muted/40'
                        }`}
                      >
                        <span
                          className={`shrink-0 w-6 h-6 flex items-center justify-center text-xs font-bold border ${
                            q.type === 'multiple' ? 'rounded-md' : 'rounded-full'
                          } ${selected ? 'bg-orange-500 border-orange-500 text-white' : 'border-border text-muted-foreground'}`}
                        >
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span className="text-sm leading-relaxed pt-0.5">{o.text}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-border">
              <button
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                disabled={current === 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm disabled:opacity-40 hover:border-orange-500/50"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {current === questions.length - 1 ? (
                <button
                  onClick={() => setConfirmOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold"
                >
                  Review & submit <Send className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </main>

        {/* Question palette */}
        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold text-sm mb-4">Question palette</h3>
            <div className="grid grid-cols-6 lg:grid-cols-5 gap-2 mb-5">
              {questions.map((item, i) => {
                const a = answers[item._id];
                const isAnswered = (a?.selectedOptions?.length || 0) > 0 || (a?.textAnswer || '').trim();
                const isFlagged = flagged.has(item._id);
                return (
                  <button
                    key={item._id}
                    onClick={() => setCurrent(i)}
                    className={`aspect-square rounded-lg text-xs font-bold border transition-all ${
                      i === current
                        ? 'ring-2 ring-orange-500 border-orange-500'
                        : isFlagged
                        ? 'border-amber-500 text-amber-500 bg-amber-500/10'
                        : isAnswered
                        ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'border-border text-muted-foreground hover:border-orange-500/40'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <ul className="space-y-1.5 text-xs text-muted-foreground mb-5">
              <li className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-500/50" /> Answered</li>
              <li className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500" /> Flagged</li>
              <li className="flex items-center gap-2"><span className="w-3 h-3 rounded border border-border" /> Not answered</li>
            </ul>

            <button
              onClick={() => setConfirmOpen(true)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              Submit exam
            </button>
          </div>
        </aside>
      </div>

      {/* Confirm dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6">
            <h3 className="text-lg font-bold mb-2">Submit your exam?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              You've answered <strong className="text-foreground">{answered}</strong> of {questions.length} questions
              {flagged.size > 0 ? `, with ${flagged.size} flagged for review` : ''}. You can't change answers after submitting.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted"
              >
                Keep working
              </button>
              <button
                onClick={() => submit(false)}
                disabled={state === 'submitting'}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2"
              >
                {state === 'submitting' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Submit now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
