import { useEffect, useState } from 'react';
import {
  Plus, Trash2, Pencil, Loader2, Save, X, Users, Radio, PlayCircle, Award,
  CheckCircle2, ShieldCheck, Calendar, UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { batchApi } from '@/services/batchService';
import { courseApi } from '@/services/courseService';
import { internshipApi } from '@/services/internshipService';
import { examApi } from '@/services/examService';
import { adminApi } from '@/services/adminService';

const EMPTY = {
  name: '', code: '', programType: 'internship', course: '', internship: '', exam: '',
  startDate: '', endDate: '', mode: 'online', scheduleNote: '', capacity: 30,
  mentorName: '', liveClassUrl: '', status: 'upcoming'
};

const input = 'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-orange-500';
const label = 'block text-xs font-medium text-muted-foreground mb-1.5';
const dateVal = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function BatchesManager() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [internships, setInternships] = useState([]);
  const [exams, setExams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [manage, setManage] = useState(null); // batch being managed (roster + sessions)
  const [tab, setTab] = useState('roster');

  const load = async () => {
    setLoading(true);
    try {
      const [b, c, i, e] = await Promise.all([
        batchApi.getAll(),
        courseApi.adminGetAll().catch(() => []),
        internshipApi.adminGetAll().catch(() => []),
        examApi.adminGetAll().catch(() => [])
      ]);
      setBatches(b);
      setCourses(c);
      setInternships(i);
      setExams(e);
    } catch {
      toast.error('Could not load batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reloadManaged = async (id) => {
    try {
      setManage(await batchApi.getOne(id));
      load();
    } catch {
      /* no-op */
    }
  };

  const save = async () => {
    if (!editing.name) return toast.error('Give the batch a name');
    if (editing.programType === 'course' && !editing.course) return toast.error('Pick a course');
    if (editing.programType === 'internship' && !editing.internship) return toast.error('Pick an internship');
    setSaving(true);
    try {
      const payload = { ...editing, capacity: Number(editing.capacity) || 30 };
      if (editing._id) await batchApi.update(editing._id, payload);
      else await batchApi.create(payload);
      toast.success('Batch saved');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (b) => {
    if (!window.confirm(`Delete batch "${b.name}"?`)) return;
    try {
      await batchApi.remove(b._id);
      toast.success('Batch deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const openManage = async (b) => {
    try {
      setManage(await batchApi.getOne(b._id));
      setTab('roster');
      if (users.length === 0) {
        adminApi.getUsers?.({ limit: 200 })
          .then((d) => setUsers(d?.users || d || []))
          .catch(() => setUsers([]));
      }
    } catch {
      toast.error('Could not open that batch');
    }
  };

  /* ------------------------------ member actions ----------------------------- */
  const patchMember = async (memberId, patch) => {
    try {
      await batchApi.updateMember(manage._id, memberId, patch);
      reloadManaged(manage._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const issueCert = async (member) => {
    const score = member.performanceScore;
    if (score === undefined || score === null) {
      toast.error('Record a performance score for this student first');
      return;
    }
    try {
      const res = await batchApi.issueCertificate(manage._id, member._id, {});
      toast.success(`${res.certificate.grade} certificate issued — ${res.certificate.certificateId}`);
      reloadManaged(manage._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not issue certificate');
    }
  };

  const issueAll = async () => {
    if (!window.confirm('Issue certificates to every scored member who does not already have one?')) return;
    try {
      const res = await batchApi.issueAllCertificates(manage._id);
      toast.success(res.message);
      reloadManaged(manage._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk issue failed');
    }
  };

  const approveAll = async () => {
    try {
      const res = await batchApi.approveAll(manage._id);
      toast.success(res.message);
      reloadManaged(manage._id);
    } catch {
      toast.error('Could not approve members');
    }
  };

  const addMember = async (userId) => {
    if (!userId) return;
    try {
      const res = await batchApi.addMember(manage._id, { userId });
      toast.success(res.message);
      reloadManaged(manage._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add student');
    }
  };

  /* ----------------------------- session actions ---------------------------- */
  const addSession = async () => {
    try {
      await batchApi.addSession(manage._id, { title: `Session ${(manage.sessions?.length || 0) + 1}` });
      reloadManaged(manage._id);
    } catch {
      toast.error('Could not add session');
    }
  };

  const patchSession = async (sessionId, patch) => {
    try {
      await batchApi.updateSession(manage._id, sessionId, patch);
      reloadManaged(manage._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const removeSession = async (sessionId) => {
    try {
      await batchApi.removeSession(manage._id, sessionId);
      reloadManaged(manage._id);
    } catch {
      toast.error('Could not remove session');
    }
  };

  /* --------------------------------- editor -------------------------------- */
  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-lg font-bold">{editing._id ? 'Edit batch' : 'New batch'}</h2>
          <div className="ml-auto flex gap-2">
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted">Cancel</button>
            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-5 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className={label}>Batch name *</label><input className={input} placeholder="MERN — Batch 12 (Jan 2026)" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div><label className={label}>Batch code (auto if blank)</label><input className={`${input} font-mono uppercase`} value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} /></div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={label}>Programme type *</label>
              <select className={input} value={editing.programType} onChange={(e) => setEditing({ ...editing, programType: e.target.value, course: '', internship: '' })}>
                <option value="internship">Internship</option>
                <option value="course">Course</option>
              </select>
            </div>
            {editing.programType === 'internship' ? (
              <div>
                <label className={label}>Internship *</label>
                <select className={input} value={editing.internship} onChange={(e) => setEditing({ ...editing, internship: e.target.value })}>
                  <option value="">Select…</option>
                  {internships.map((i) => <option key={i._id} value={i._id}>{i.title}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label className={label}>Course *</label>
                <select className={input} value={editing.course} onChange={(e) => setEditing({ ...editing, course: e.target.value })}>
                  <option value="">Select…</option>
                  {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className={label}>Final assessment</label>
              <select className={input} value={editing.exam} onChange={(e) => setEditing({ ...editing, exam: e.target.value })}>
                <option value="">None yet</option>
                {exams.map((e) => <option key={e._id} value={e._id}>{e.title} ({e.examCode})</option>)}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div><label className={label}>Start date</label><input type="date" className={input} value={dateVal(editing.startDate)} onChange={(e) => setEditing({ ...editing, startDate: e.target.value })} /></div>
            <div><label className={label}>End date</label><input type="date" className={input} value={dateVal(editing.endDate)} onChange={(e) => setEditing({ ...editing, endDate: e.target.value })} /></div>
            <div>
              <label className={label}>Mode</label>
              <select className={input} value={editing.mode} onChange={(e) => setEditing({ ...editing, mode: e.target.value })}>
                <option value="online">Online</option><option value="offline">Offline</option><option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div><label className={label}>Capacity</label><input type="number" className={input} value={editing.capacity} onChange={(e) => setEditing({ ...editing, capacity: e.target.value })} /></div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div><label className={label}>Schedule note</label><input className={input} placeholder="Mon/Wed/Fri 7–8:30pm IST" value={editing.scheduleNote} onChange={(e) => setEditing({ ...editing, scheduleNote: e.target.value })} /></div>
            <div><label className={label}>Mentor</label><input className={input} value={editing.mentorName} onChange={(e) => setEditing({ ...editing, mentorName: e.target.value })} /></div>
            <div>
              <label className={label}>Status</label>
              <select className={input} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                <option value="upcoming">Upcoming</option><option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option><option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className={label}>Standing live-class link (Zoom / Meet / Teams)</label>
            <input className={input} placeholder="https://…" value={editing.liveClassUrl} onChange={(e) => setEditing({ ...editing, liveClassUrl: e.target.value })} />
            <p className="text-xs text-muted-foreground mt-1.5">
              Only visible to members whose fee payment is confirmed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------- manage -------------------------------- */
  if (manage) {
    const scored = manage.members.filter((m) => m.performanceScore !== undefined && m.performanceScore !== null);
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-start gap-3">
          <div>
            <h2 className="text-lg font-bold">{manage.name}</h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {manage.code} · {manage.members.length}/{manage.capacity} members
              {manage.exam ? ` · assessment: ${manage.exam.examCode}` : ' · no assessment linked'}
            </p>
          </div>
          <button onClick={() => setManage(null)} className="ml-auto px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted">
            Back to batches
          </button>
        </div>

        <div className="flex rounded-xl border border-border overflow-hidden w-fit">
          {[['roster', `Roster (${manage.members.length})`], ['sessions', `Sessions (${manage.sessions?.length || 0})`]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 text-sm font-medium ${tab === k ? 'bg-orange-500 text-white' : 'text-muted-foreground hover:bg-muted'}`}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'roster' ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <select
                onChange={(e) => { addMember(e.target.value); e.target.value = ''; }}
                defaultValue=""
                className="px-3 py-2 rounded-xl border border-border bg-background text-sm max-w-xs"
              >
                <option value="">
                  {users.length ? 'Add a student…' : 'Loading students…'}
                </option>
                {users
                  .filter((u) => !manage.members.some((m) => String(m.user?._id || m.user) === String(u._id)))
                  .map((u) => <option key={u._id} value={u._id}>{u.name || u.email}</option>)}
              </select>
              <button onClick={approveAll} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted">
                <ShieldCheck className="w-4 h-4 text-orange-500" /> Approve all paid for assessment
              </button>
              <button onClick={issueAll} disabled={scored.length === 0} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold">
                <Award className="w-4 h-4" /> Issue certificates ({scored.length} scored)
              </button>
            </div>

            {manage.members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-14 border border-dashed border-border rounded-2xl">
                No students in this batch yet. Add them here, or assign applicants from the Internships tab.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Student</th>
                      <th className="px-4 py-3 font-semibold">Payment</th>
                      <th className="px-4 py-3 font-semibold">Attendance %</th>
                      <th className="px-4 py-3 font-semibold">Performance</th>
                      <th className="px-4 py-3 font-semibold">Assessment</th>
                      <th className="px-4 py-3 font-semibold">Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {manage.members.map((m) => (
                      <tr key={m._id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <p className="font-medium">{m.user?.name || '—'}</p>
                          <p className="text-xs text-muted-foreground">{m.user?.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={m.paymentStatus}
                            onChange={(e) => patchMember(m._id, { paymentStatus: e.target.value })}
                            className="text-xs px-2 py-1 rounded border border-border bg-background"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="waived">Waived</option>
                            <option value="not_required">Not required</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number" min={0} max={100}
                            defaultValue={m.attendancePercent}
                            onBlur={(e) => patchMember(m._id, { attendancePercent: Number(e.target.value) })}
                            className="w-20 text-xs px-2 py-1 rounded border border-border bg-background"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number" min={0} max={100} placeholder="0-100"
                            defaultValue={m.performanceScore ?? ''}
                            onBlur={(e) => patchMember(m._id, { performanceScore: e.target.value === '' ? null : Number(e.target.value) })}
                            className="w-20 text-xs px-2 py-1 rounded border border-border bg-background"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <label className="inline-flex items-center gap-1.5 text-xs">
                            <input
                              type="checkbox"
                              checked={Boolean(m.assessmentApproved)}
                              onChange={(e) => patchMember(m._id, { assessmentApproved: e.target.checked })}
                            />
                            {m.assessmentApproved ? 'Approved' : 'Locked'}
                          </label>
                        </td>
                        <td className="px-4 py-3">
                          {m.certificate ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Issued
                            </span>
                          ) : (
                            <button
                              onClick={() => issueCert(m)}
                              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-orange-500/40 text-orange-500 hover:bg-orange-500/10"
                            >
                              <Award className="w-3.5 h-3.5" /> Issue
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Grades are derived from the performance score: 85+ Distinction, 70–84 Merit, below 70 Pass.
            </p>
          </>
        ) : (
          <>
            <button onClick={addSession} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold">
              <Plus className="w-4 h-4" /> Add session
            </button>

            {(manage.sessions || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-14 border border-dashed border-border rounded-2xl">
                No sessions yet. Add the timetable so students can join live classes and find recordings.
              </p>
            ) : (
              <div className="space-y-3">
                {manage.sessions.map((s) => (
                  <div key={s._id} className="rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      {s.status === 'live' ? <Radio className="w-4 h-4 text-red-500 shrink-0" /> : <PlayCircle className="w-4 h-4 text-orange-500 shrink-0" />}
                      <input
                        defaultValue={s.title}
                        onBlur={(e) => e.target.value !== s.title && patchSession(s._id, { title: e.target.value })}
                        className="flex-1 bg-transparent text-sm font-medium focus:outline-none"
                      />
                      <select
                        value={s.status}
                        onChange={(e) => patchSession(s._id, { status: e.target.value })}
                        className="text-xs px-2 py-1 rounded border border-border bg-background"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="live">Live now</option>
                        <option value="recorded">Recorded</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button onClick={() => removeSession(s._id)} className="p-1 text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        type="datetime-local"
                        defaultValue={s.scheduledAt ? new Date(s.scheduledAt).toISOString().slice(0, 16) : ''}
                        onBlur={(e) => patchSession(s._id, { scheduledAt: e.target.value })}
                        className={input}
                      />
                      <input
                        type="number" placeholder="Duration (minutes)"
                        defaultValue={s.durationMinutes}
                        onBlur={(e) => patchSession(s._id, { durationMinutes: Number(e.target.value) })}
                        className={input}
                      />
                      <input
                        placeholder="Live class URL (shown while status is Live)"
                        defaultValue={s.liveUrl}
                        onBlur={(e) => e.target.value !== s.liveUrl && patchSession(s._id, { liveUrl: e.target.value })}
                        className={input}
                      />
                      <input
                        placeholder="Recording URL (shown when status is Recorded)"
                        defaultValue={s.recordingUrl}
                        onBlur={(e) => e.target.value !== s.recordingUrl && patchSession(s._id, { recordingUrl: e.target.value })}
                        className={input}
                      />
                      <input
                        placeholder="Notes / resource URL"
                        defaultValue={s.notesUrl}
                        onBlur={(e) => e.target.value !== s.notesUrl && patchSession(s._id, { notesUrl: e.target.value })}
                        className={`${input} md:col-span-2`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  /* ---------------------------------- list --------------------------------- */
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Batches</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cohorts for courses and internships — live classes, recordings, assessment approval, and certificates.
          </p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> New batch
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
      ) : batches.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border rounded-2xl">
          No batches yet. Create one to start scheduling classes and issuing certificates.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Batch</th>
                <th className="px-4 py-3 font-semibold">Programme</th>
                <th className="px-4 py-3 font-semibold">Starts</th>
                <th className="px-4 py-3 font-semibold">Members</th>
                <th className="px-4 py-3 font-semibold">Approved</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {batches.map((b) => {
                const approved = (b.members || []).filter((m) => m.assessmentApproved).length;
                return (
                  <tr key={b._id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{b.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{b.code}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {b.internship?.title || b.course?.title || '—'}
                      <span className="block text-xs capitalize">{b.programType}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {b.startDate ? new Date(b.startDate).toLocaleDateString() : 'TBA'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{b.members?.length || 0}/{b.capacity}</td>
                    <td className="px-4 py-3 text-muted-foreground">{approved}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-md font-medium capitalize ${
                        b.status === 'ongoing' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : b.status === 'upcoming' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>{b.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openManage(b)} title="Manage roster & sessions" className="p-2 text-muted-foreground hover:text-orange-500"><Users className="w-4 h-4" /></button>
                        <button onClick={() => setEditing({ ...EMPTY, ...b, course: b.course?._id || '', internship: b.internship?._id || '', exam: b.exam?._id || '' })} className="p-2 text-muted-foreground hover:text-orange-500"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => remove(b)} className="p-2 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
