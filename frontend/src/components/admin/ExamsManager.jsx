import { useEffect, useState } from 'react';
import {
  Plus, Trash2, Pencil, X, Loader2, Save, RefreshCw, Copy, BarChart3, KeyRound, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { examApi } from '@/services/examService';
import { courseApi } from '@/services/courseService';

const EMPTY_EXAM = {
  title: '',
  description: '',
  examCode: '',
  course: '',
  durationMinutes: 30,
  passPercent: 40,
  maxAttempts: 1,
  shuffleQuestions: true,
  shuffleOptions: true,
  showResultImmediately: true,
  showAnswersAfterSubmit: false,
  access: 'open',
  allowedEmails: '',
  certificateOnPass: false,
  availableFrom: '',
  availableUntil: '',
  status: 'draft',
  questions: []
};

const newQuestion = () => ({
  text: '',
  type: 'mcq',
  marks: 1,
  negativeMarks: 0,
  explanation: '',
  acceptedAnswers: [],
  options: [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]
});

const input =
  'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-orange-500';
const label = 'block text-xs font-medium text-muted-foreground mb-1.5';

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 16) : '');

function toForm(exam) {
  return {
    ...EMPTY_EXAM,
    ...exam,
    course: exam.course?._id || exam.course || '',
    allowedEmails: (exam.allowedEmails || []).join(', '),
    availableFrom: toDateInput(exam.availableFrom),
    availableUntil: toDateInput(exam.availableUntil),
    questions: (exam.questions || []).map((q) => ({
      ...q,
      acceptedAnswers: q.acceptedAnswers || [],
      options: q.options || []
    }))
  };
}

function fromForm(form) {
  const payload = {
    ...form,
    allowedEmails: String(form.allowedEmails || '').split(',').map((e) => e.trim()).filter(Boolean),
    durationMinutes: Number(form.durationMinutes) || 30,
    passPercent: Number(form.passPercent) || 0,
    maxAttempts: Number(form.maxAttempts) || 1,
    questions: (form.questions || []).map((q, i) => ({
      ...q,
      order: i,
      marks: Number(q.marks) || 1,
      negativeMarks: Number(q.negativeMarks) || 0,
      acceptedAnswers:
        q.type === 'short'
          ? String(q.acceptedAnswersRaw ?? (q.acceptedAnswers || []).join(', '))
              .split(',').map((a) => a.trim()).filter(Boolean)
          : [],
      options: q.type === 'short' ? [] : q.options.filter((o) => o.text.trim())
    }))
  };
  if (!payload.course) delete payload.course;
  if (!payload.availableFrom) delete payload.availableFrom;
  if (!payload.availableUntil) delete payload.availableUntil;
  delete payload.questionCount;
  delete payload.attemptCount;
  return payload;
}

export default function ExamsManager() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [e, c] = await Promise.all([examApi.adminGetAll(), courseApi.adminGetAll().catch(() => [])]);
      setExams(e);
      setCourses(c);
    } catch {
      toast.error('Could not load exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = async (exam) => {
    try {
      const full = await examApi.adminGetOne(exam._id);
      setEditing(toForm(full));
    } catch {
      toast.error('Could not open that exam');
    }
  };

  const save = async () => {
    if (!editing.title) return toast.error('Give the exam a title');
    if (editing.status === 'published' && editing.questions.length === 0) {
      return toast.error('Add at least one question before publishing');
    }
    setSaving(true);
    try {
      const payload = fromForm(editing);
      const saved = editing._id ? await examApi.update(editing._id, payload) : await examApi.create(payload);
      toast.success(`Exam saved — code ${saved.examCode}`);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (exam) => {
    if (!window.confirm(`Delete "${exam.title}" and all its attempts?`)) return;
    try {
      await examApi.remove(exam._id);
      toast.success('Exam deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const regenerate = async (exam) => {
    try {
      const { examCode } = await examApi.regenerateCode(exam._id);
      toast.success(`New code: ${examCode}`);
      load();
    } catch {
      toast.error('Could not regenerate the code');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code);
    toast.success(`Copied ${code}`);
  };

  const showResults = async (exam) => {
    try {
      const data = await examApi.results(exam._id);
      setResults({ exam, ...data });
    } catch {
      toast.error('Could not load results');
    }
  };

  /* --------------------------- question helpers --------------------------- */
  const patchQuestions = (fn) => setEditing((e) => ({ ...e, questions: fn(e.questions || []) }));
  const updateQuestion = (qi, patch) => patchQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, ...patch } : q)));
  const updateOption = (qi, oi, patch) =>
    updateQuestion(qi, { options: editing.questions[qi].options.map((o, i) => (i === oi ? { ...o, ...patch } : o)) });

  const setCorrect = (qi, oi, checked) => {
    const q = editing.questions[qi];
    if (q.type === 'multiple') updateOption(qi, oi, { isCorrect: checked });
    else updateQuestion(qi, { options: q.options.map((o, i) => ({ ...o, isCorrect: i === oi })) });
  };

  const changeType = (qi, type) => {
    if (type === 'truefalse') {
      updateQuestion(qi, {
        type,
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false }
        ]
      });
    } else if (type === 'short') {
      updateQuestion(qi, { type, options: [] });
    } else {
      const q = editing.questions[qi];
      updateQuestion(qi, {
        type,
        options: q.options?.length >= 2 ? q.options : newQuestion().options
      });
    }
  };

  /* --------------------------------- render -------------------------------- */

  if (editing) {
    const totalMarks = (editing.questions || []).reduce((n, q) => n + (Number(q.marks) || 0), 0);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-lg font-bold">{editing._id ? 'Edit exam' : 'New exam'}</h2>
          {editing.examCode && (
            <span className="font-mono text-sm bg-orange-500/15 text-orange-500 px-3 py-1 rounded-lg border border-orange-500/30">
              {editing.examCode}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {editing.questions.length} questions · {totalMarks} marks
          </span>
          <div className="ml-auto flex gap-2">
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted">Cancel</button>
            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save exam
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="rounded-2xl border border-border p-5 space-y-4">
          <h3 className="font-semibold text-sm">Exam settings</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={label}>Title *</label>
              <input className={input} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div>
              <label className={label}>Exam code (leave blank to auto-generate)</label>
              <input
                className={`${input} font-mono uppercase`}
                placeholder="AUTO"
                value={editing.examCode}
                onChange={(e) => setEditing({ ...editing, examCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
              />
            </div>
          </div>
          <div>
            <label className={label}>Instructions shown before starting</label>
            <textarea rows={2} className={input} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className={label}>Duration (minutes)</label>
              <input type="number" className={input} value={editing.durationMinutes} onChange={(e) => setEditing({ ...editing, durationMinutes: e.target.value })} />
            </div>
            <div>
              <label className={label}>Pass mark (%)</label>
              <input type="number" className={input} value={editing.passPercent} onChange={(e) => setEditing({ ...editing, passPercent: e.target.value })} />
            </div>
            <div>
              <label className={label}>Max attempts</label>
              <input type="number" min={1} className={input} value={editing.maxAttempts} onChange={(e) => setEditing({ ...editing, maxAttempts: e.target.value })} />
            </div>
            <div>
              <label className={label}>Status</label>
              <select className={input} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="published">Published (code works)</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={label}>Linked course (optional)</label>
              <select className={input} value={editing.course} onChange={(e) => setEditing({ ...editing, course: e.target.value })}>
                <option value="">None</option>
                {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Opens at</label>
              <input type="datetime-local" className={input} value={editing.availableFrom} onChange={(e) => setEditing({ ...editing, availableFrom: e.target.value })} />
            </div>
            <div>
              <label className={label}>Closes at</label>
              <input type="datetime-local" className={input} value={editing.availableUntil} onChange={(e) => setEditing({ ...editing, availableUntil: e.target.value })} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={label}>Who can take it</label>
              <select className={input} value={editing.access} onChange={(e) => setEditing({ ...editing, access: e.target.value })}>
                <option value="open">Anyone with the code</option>
                <option value="enrolled">Only learners enrolled in the linked course</option>
                <option value="invite">Only invited email addresses</option>
              </select>
            </div>
            {editing.access === 'invite' && (
              <div>
                <label className={label}>Allowed emails (comma separated)</label>
                <input className={input} value={editing.allowedEmails} onChange={(e) => setEditing({ ...editing, allowedEmails: e.target.value })} />
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {[
              ['shuffleQuestions', 'Shuffle question order'],
              ['shuffleOptions', 'Shuffle answer options'],
              ['showResultImmediately', 'Show score immediately'],
              ['showAnswersAfterSubmit', 'Reveal correct answers after submit'],
              ['certificateOnPass', 'Issue certificate on pass'],
              ['requireFullScreen', 'Recommend full-screen mode']
            ].map(([key, text]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={Boolean(editing[key])} onChange={(e) => setEditing({ ...editing, [key]: e.target.checked })} />
                {text}
              </label>
            ))}
          </div>
        </div>

        {/* Questions */}
        <div className="rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Questions</h3>
            <button onClick={() => patchQuestions((qs) => [...qs, newQuestion()])} className="flex items-center gap-1.5 text-sm text-orange-500 font-medium hover:underline">
              <Plus className="w-4 h-4" /> Add question
            </button>
          </div>

          <div className="space-y-4">
            {editing.questions.map((q, qi) => (
              <div key={qi} className="rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-orange-500/15 text-orange-500 text-xs font-bold flex items-center justify-center mt-1">
                    {qi + 1}
                  </span>
                  <textarea
                    rows={2}
                    className={input}
                    placeholder="Question text"
                    value={q.text}
                    onChange={(e) => updateQuestion(qi, { text: e.target.value })}
                  />
                  <button onClick={() => patchQuestions((qs) => qs.filter((_, i) => i !== qi))} className="p-1.5 text-red-500 hover:text-red-400 shrink-0 mt-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 pl-10">
                  <select className={input} value={q.type} onChange={(e) => changeType(qi, e.target.value)}>
                    <option value="mcq">Single choice</option>
                    <option value="multiple">Multiple correct</option>
                    <option value="truefalse">True / False</option>
                    <option value="short">Short answer</option>
                  </select>
                  <input type="number" className={input} placeholder="Marks" value={q.marks} onChange={(e) => updateQuestion(qi, { marks: e.target.value })} />
                  <input type="number" className={input} placeholder="Negative marks" value={q.negativeMarks} onChange={(e) => updateQuestion(qi, { negativeMarks: e.target.value })} />
                </div>

                {q.type === 'short' ? (
                  <div className="pl-10">
                    <input
                      className={input}
                      placeholder="Accepted answers, comma separated"
                      value={q.acceptedAnswersRaw ?? (q.acceptedAnswers || []).join(', ')}
                      onChange={(e) => updateQuestion(qi, { acceptedAnswersRaw: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="pl-10 space-y-2">
                    {q.options.map((o, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input
                          type={q.type === 'multiple' ? 'checkbox' : 'radio'}
                          checked={Boolean(o.isCorrect)}
                          onChange={(e) => setCorrect(qi, oi, e.target.checked)}
                          title="Mark as correct"
                        />
                        <input
                          className={input}
                          placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                          value={o.text}
                          onChange={(e) => updateOption(qi, oi, { text: e.target.value })}
                          disabled={q.type === 'truefalse'}
                        />
                        {q.type !== 'truefalse' && q.options.length > 2 && (
                          <button
                            onClick={() => updateQuestion(qi, { options: q.options.filter((_, i) => i !== oi) })}
                            className="p-1 text-muted-foreground hover:text-red-500"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {q.type !== 'truefalse' && (
                      <button
                        onClick={() => updateQuestion(qi, { options: [...q.options, { text: '', isCorrect: false }] })}
                        className="text-xs text-orange-500 hover:underline"
                      >
                        + Add option
                      </button>
                    )}
                  </div>
                )}

                <div className="pl-10">
                  <input
                    className={input}
                    placeholder="Explanation shown in review (optional)"
                    value={q.explanation}
                    onChange={(e) => updateQuestion(qi, { explanation: e.target.value })}
                  />
                </div>
              </div>
            ))}

            {editing.questions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-xl">
                No questions yet — add your first one.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Exams</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create an exam, share its code, and students take it at <span className="font-mono">/exam</span>.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY_EXAM, questions: [newQuestion()] })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> New exam
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
      ) : exams.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border rounded-2xl">
          No exams yet. Create one and share its code with your students.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Exam</th>
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Questions</th>
                <th className="px-4 py-3 font-semibold">Duration</th>
                <th className="px-4 py-3 font-semibold">Attempts</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {exams.map((e) => (
                <tr key={e._id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{e.title}</p>
                    {e.course?.title && <p className="text-xs text-muted-foreground">{e.course.title}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => copyCode(e.examCode)} className="font-mono font-bold text-orange-500 inline-flex items-center gap-1.5 hover:underline">
                      {e.examCode} <Copy className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{e.questionCount} · {e.totalMarks} marks</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.durationMinutes} min</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.attemptCount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                      e.status === 'published' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : e.status === 'draft' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-muted text-muted-foreground'
                    }`}>{e.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => showResults(e)} className="p-2 text-muted-foreground hover:text-orange-500" title="Results"><BarChart3 className="w-4 h-4" /></button>
                      <button onClick={() => regenerate(e)} className="p-2 text-muted-foreground hover:text-orange-500" title="New code"><RefreshCw className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(e)} className="p-2 text-muted-foreground hover:text-orange-500" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => remove(e)} className="p-2 text-muted-foreground hover:text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Results modal */}
      {results && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setResults(null)}>
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-card border border-border p-6" onClick={(ev) => ev.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-bold">{results.exam.title}</h3>
                <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5 mt-1">
                  <KeyRound className="w-3 h-3" /> {results.exam.examCode}
                </p>
              </div>
              <button onClick={() => setResults(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                ['Submitted', results.stats.submitted],
                ['Passed', results.stats.passed],
                ['Failed', results.stats.failed],
                ['Average', `${results.stats.averagePercent}%`]
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-border p-3 text-center">
                  <p className="text-xl font-bold">{v}</p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{k}</p>
                </div>
              ))}
            </div>

            {results.attempts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No submissions yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-2">Student</th><th>Score</th><th>%</th><th>Result</th><th>Tab switches</th><th>Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {results.attempts.map((a) => (
                    <tr key={a._id}>
                      <td className="py-2.5">
                        <p className="font-medium">{a.user?.name || '—'}</p>
                        <p className="text-xs text-muted-foreground">{a.user?.email}</p>
                      </td>
                      <td>{a.score}/{a.totalMarks}</td>
                      <td>{a.percentage}%</td>
                      <td>
                        {a.passed ? (
                          <span className="inline-flex items-center gap-1 text-emerald-500 text-xs font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Pass</span>
                        ) : (
                          <span className="text-red-500 text-xs font-medium">Fail</span>
                        )}
                      </td>
                      <td className={a.focusLostCount > 2 ? 'text-amber-500 font-medium' : 'text-muted-foreground'}>{a.focusLostCount}</td>
                      <td className="text-muted-foreground text-xs">{a.submittedAt ? new Date(a.submittedAt).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
