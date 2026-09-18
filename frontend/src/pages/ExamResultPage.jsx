import { useEffect, useState } from 'react';
import { Link, useRoute } from 'wouter';
import { motion } from 'framer-motion';
import { Trophy, XCircle, CheckCircle2, Clock, Award, Loader2, Hourglass } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { examApi } from '@/services/examService';

export default function ExamResultPage() {
  const [, params] = useRoute('/exam/result/:attemptId');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!params?.attemptId) return;
    examApi
      .getAttempt(params.attemptId)
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || 'Could not load this result.'))
      .finally(() => setLoading(false));
  }, [params?.attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="container mx-auto px-4 pt-32 pb-20 text-center">
          <h1 className="text-2xl font-bold mb-3">{error || 'Result not found'}</h1>
          <Link href="/exam" className="btn-neon inline-block">Back to exams</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { attempt, review, resultHidden } = data;
  const passed = attempt.passed;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Exam Result" path="/exam" />
      <Navigation />

      <main className="container mx-auto px-4 pt-28 pb-16 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-3xl border p-8 md:p-10 text-center ${
            resultHidden
              ? 'border-border bg-card'
              : passed
              ? 'border-emerald-500/30 bg-emerald-500/10'
              : 'border-red-500/30 bg-red-500/10'
          }`}
        >
          {resultHidden ? (
            <>
              <Hourglass className="w-14 h-14 text-orange-500 mx-auto mb-4" />
              <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Exam submitted</h1>
              <p className="text-muted-foreground">
                Your instructor will publish results for <strong className="text-foreground">{attempt.examTitle}</strong>.
                You'll get a notification when they're available.
              </p>
            </>
          ) : (
            <>
              {passed ? (
                <Trophy className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
              ) : (
                <XCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
              )}
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{attempt.examTitle}</p>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-1">{attempt.percentage}%</h1>
              <p className={`font-semibold mb-6 ${passed ? 'text-emerald-500' : 'text-red-500'}`}>
                {passed ? 'Passed' : 'Not passed'} · {attempt.score} of {attempt.totalMarks} marks
                {` · pass mark ${attempt.passPercent}%`}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm max-w-md mx-auto">
                <div className="rounded-xl bg-background/60 border border-border p-3">
                  <Clock className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Time taken</p>
                  <p className="font-semibold">{Math.round((attempt.timeSpentSeconds || 0) / 60)} min</p>
                </div>
                <div className="rounded-xl bg-background/60 border border-border p-3">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="font-semibold">
                    {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : '—'}
                  </p>
                </div>
                {attempt.certificate && (
                  <div className="rounded-xl bg-background/60 border border-border p-3">
                    <Award className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Certificate</p>
                    <Link href="/dashboard" className="font-semibold text-orange-500 hover:underline">
                      View
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link href="/dashboard" className="btn-neon">Go to dashboard</Link>
            <Link
              href="/exam"
              className="px-6 py-3 rounded-lg border border-border font-semibold text-sm hover:border-orange-500/50 transition-colors"
            >
              Take another exam
            </Link>
          </div>
        </motion.div>

        {/* Answer review */}
        {review && (
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-4">Answer review</h2>
            <div className="space-y-4">
              {review.map((r, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border p-5 ${
                    r.isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {r.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold text-sm leading-relaxed">
                        {i + 1}. {r.question}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {r.marksAwarded > 0 ? `+${r.marksAwarded}` : r.marksAwarded} mark(s)
                      </p>
                    </div>
                  </div>

                  {r.type === 'short' ? (
                    <div className="text-sm space-y-1 pl-8">
                      <p className="text-muted-foreground">
                        Your answer: <span className="text-foreground">{r.textAnswer || '—'}</span>
                      </p>
                      {r.acceptedAnswers?.length > 0 && (
                        <p className="text-muted-foreground">Accepted: {r.acceptedAnswers.join(', ')}</p>
                      )}
                    </div>
                  ) : (
                    <ul className="space-y-1.5 pl-8">
                      {r.options.map((o) => {
                        const chosen = (r.selectedOptions || []).map(String).includes(String(o._id));
                        return (
                          <li
                            key={o._id}
                            className={`text-sm flex items-center gap-2 ${
                              o.isCorrect
                                ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                                : chosen
                                ? 'text-red-500 line-through'
                                : 'text-muted-foreground'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                            {o.text}
                            {chosen && <span className="text-xs">(your answer)</span>}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {r.explanation && (
                    <p className="mt-3 pl-8 text-sm text-muted-foreground border-l-2 border-orange-500/40 ml-1 pl-4">
                      {r.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
