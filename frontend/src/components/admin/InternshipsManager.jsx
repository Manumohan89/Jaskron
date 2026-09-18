import { useEffect, useState } from 'react';
import {
  Plus, Trash2, Pencil, Loader2, Save, IndianRupee, Users, X, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { internshipApi } from '@/services/internshipService';
import { batchApi } from '@/services/batchService';
import { DOMAINS, INTERNSHIP_TRACKS } from '@/config/company';

const EMPTY = {
  title: '', subtitle: '', description: '', thumbnail: '',
  domain: 'full-stack', track: 'short-term', durationLabel: '4 weeks', durationWeeks: 4,
  mode: 'online', fee: 4999, discountFee: 0,
  feeNote: 'Includes training, mentorship, assessment, and certification.',
  seatsPerBatch: 30, mentorName: '', mentorTitle: '',
  whatYouGet: '', deliverables: '', eligibility: '', curriculumText: '',
  certificateEnabled: true, certificateTitle: '',
  status: 'draft', isFeatured: false
};

const input = 'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-orange-500';
const label = 'block text-xs font-medium text-muted-foreground mb-1.5';

const lines = (v) => String(v || '').split('\n').map((x) => x.trim()).filter(Boolean);

function toForm(i) {
  return {
    ...EMPTY,
    ...i,
    whatYouGet: (i.whatYouGet || []).join('\n'),
    deliverables: (i.deliverables || []).join('\n'),
    eligibility: (i.eligibility || []).join('\n'),
    // "Title :: detail" per line keeps the outline editable without a nested UI
    curriculumText: (i.curriculum || []).map((c) => `${c.title} :: ${c.detail || ''}`).join('\n')
  };
}

function fromForm(f) {
  return {
    ...f,
    fee: Number(f.fee) || 0,
    discountFee: Number(f.discountFee) || 0,
    durationWeeks: Number(f.durationWeeks) || 0,
    seatsPerBatch: Number(f.seatsPerBatch) || 30,
    whatYouGet: lines(f.whatYouGet),
    deliverables: lines(f.deliverables),
    eligibility: lines(f.eligibility),
    curriculum: lines(f.curriculumText).map((row) => {
      const [title, detail = ''] = row.split('::');
      return { title: title.trim(), detail: detail.trim() };
    })
  };
}

const APP_STATUSES = ['applied', 'shortlisted', 'payment_pending', 'enrolled', 'rejected', 'withdrawn'];

export default function InternshipsManager() {
  const [view, setView] = useState('programmes'); // programmes | applications
  const [items, setItems] = useState([]);
  const [apps, setApps] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [i, a, b] = await Promise.all([
        internshipApi.adminGetAll(),
        internshipApi.adminApplications().catch(() => []),
        batchApi.getAll({ programType: 'internship' }).catch(() => [])
      ]);
      setItems(i);
      setApps(a);
      setBatches(b);
    } catch {
      toast.error('Could not load internships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing.title || !editing.description) return toast.error('Title and description are required');
    setSaving(true);
    try {
      const payload = fromForm(editing);
      if (editing._id) await internshipApi.update(editing._id, payload);
      else await internshipApi.create(payload);
      toast.success('Internship saved');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.title}" and all its applications?`)) return;
    try {
      await internshipApi.remove(item._id);
      toast.success('Internship deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const patchApp = async (id, patch) => {
    try {
      await internshipApi.updateApplication(id, patch);
      toast.success('Application updated');
      load();
      setDetail(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  /* ---------------------------------- editor -------------------------------- */
  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-lg font-bold">{editing._id ? 'Edit internship' : 'New internship'}</h2>
          <div className="ml-auto flex gap-2">
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted">Cancel</button>
            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-5 space-y-4">
          <h3 className="font-semibold text-sm">Programme details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className={label}>Title *</label><input className={input} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
            <div><label className={label}>Subtitle</label><input className={input} value={editing.subtitle} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} /></div>
          </div>
          <div><label className={label}>Description *</label><textarea rows={4} className={input} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className={label}>Domain</label>
              <select className={input} value={editing.domain} onChange={(e) => setEditing({ ...editing, domain: e.target.value })}>
                {DOMAINS.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Track</label>
              <select className={input} value={editing.track} onChange={(e) => setEditing({ ...editing, track: e.target.value })}>
                {INTERNSHIP_TRACKS.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>
            <div><label className={label}>Duration label</label><input className={input} placeholder="4 weeks" value={editing.durationLabel} onChange={(e) => setEditing({ ...editing, durationLabel: e.target.value })} /></div>
            <div>
              <label className={label}>Mode</label>
              <select className={input} value={editing.mode} onChange={(e) => setEditing({ ...editing, mode: e.target.value })}>
                <option value="online">Online</option><option value="offline">Offline</option><option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
          <div><label className={label}>Thumbnail URL</label><input className={input} value={editing.thumbnail} onChange={(e) => setEditing({ ...editing, thumbnail: e.target.value })} /></div>
        </div>

        <div className="rounded-2xl border border-border p-5 space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2"><IndianRupee className="w-4 h-4 text-orange-500" /> Fee &amp; seats</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div><label className={label}>Fee (₹)</label><input type="number" className={input} value={editing.fee} onChange={(e) => setEditing({ ...editing, fee: e.target.value })} /></div>
            <div><label className={label}>Discounted fee (₹)</label><input type="number" className={input} value={editing.discountFee} onChange={(e) => setEditing({ ...editing, discountFee: e.target.value })} /></div>
            <div><label className={label}>Seats per batch</label><input type="number" className={input} value={editing.seatsPerBatch} onChange={(e) => setEditing({ ...editing, seatsPerBatch: e.target.value })} /></div>
            <div>
              <label className={label}>Status</label>
              <select className={input} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div><label className={label}>Fee note</label><input className={input} value={editing.feeNote} onChange={(e) => setEditing({ ...editing, feeNote: e.target.value })} /></div>
        </div>

        <div className="rounded-2xl border border-border p-5 space-y-4">
          <h3 className="font-semibold text-sm">Content</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className={label}>What you get (one per line)</label><textarea rows={5} className={input} value={editing.whatYouGet} onChange={(e) => setEditing({ ...editing, whatYouGet: e.target.value })} /></div>
            <div><label className={label}>Outline — "Title :: detail" per line</label><textarea rows={5} className={input} value={editing.curriculumText} onChange={(e) => setEditing({ ...editing, curriculumText: e.target.value })} /></div>
            <div><label className={label}>Deliverables (one per line)</label><textarea rows={4} className={input} value={editing.deliverables} onChange={(e) => setEditing({ ...editing, deliverables: e.target.value })} /></div>
            <div><label className={label}>Eligibility (one per line)</label><textarea rows={4} className={input} value={editing.eligibility} onChange={(e) => setEditing({ ...editing, eligibility: e.target.value })} /></div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div><label className={label}>Mentor name</label><input className={input} value={editing.mentorName} onChange={(e) => setEditing({ ...editing, mentorName: e.target.value })} /></div>
            <div><label className={label}>Mentor title</label><input className={input} value={editing.mentorTitle} onChange={(e) => setEditing({ ...editing, mentorTitle: e.target.value })} /></div>
            <div><label className={label}>Certificate title (optional)</label><input className={input} placeholder="Defaults to the programme title" value={editing.certificateTitle} onChange={(e) => setEditing({ ...editing, certificateTitle: e.target.value })} /></div>
          </div>
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.certificateEnabled} onChange={(e) => setEditing({ ...editing, certificateEnabled: e.target.checked })} /> Certificate on completion
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.isFeatured} onChange={(e) => setEditing({ ...editing, isFeatured: e.target.checked })} /> Feature on homepage
            </label>
          </div>
        </div>
      </div>
    );
  }

  /* ----------------------------------- list -------------------------------- */
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-border overflow-hidden">
          {[['programmes', 'Programmes'], ['applications', `Applications (${apps.length})`]].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setView(k)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${view === k ? 'bg-orange-500 text-white' : 'text-muted-foreground hover:bg-muted'}`}
            >
              {l}
            </button>
          ))}
        </div>
        {view === 'programmes' && (
          <button onClick={() => setEditing({ ...EMPTY })} className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold">
            <Plus className="w-4 h-4" /> New internship
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
      ) : view === 'programmes' ? (
        items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border rounded-2xl">
            No internships yet. Create a paid programme to start taking applications.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Programme</th>
                  <th className="px-4 py-3 font-semibold">Track</th>
                  <th className="px-4 py-3 font-semibold">Fee</th>
                  <th className="px-4 py-3 font-semibold">Applications</th>
                  <th className="px-4 py-3 font-semibold">Batches</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((i) => (
                  <tr key={i._id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{i.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">/internships/{i.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{String(i.track).replace('-', ' ')}</td>
                    <td className="px-4 py-3 font-medium">₹{(i.discountFee > 0 ? i.discountFee : i.fee)?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-muted-foreground">{i.applicationCount}</td>
                    <td className="px-4 py-3 text-muted-foreground">{i.batchCount}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                        i.status === 'published' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : i.status === 'draft' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>{i.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditing(toForm(i))} className="p-2 text-muted-foreground hover:text-orange-500"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => remove(i)} className="p-2 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : apps.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border rounded-2xl">
          No applications yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Applicant</th>
                <th className="px-4 py-3 font-semibold">Programme</th>
                <th className="px-4 py-3 font-semibold">Fee</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Batch</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {apps.map((a) => (
                <tr key={a._id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{a.user?.name || '—'}</p>
                    <p className="text-xs text-muted-foreground">{a.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.internship?.title}</td>
                  <td className="px-4 py-3">₹{(a.amountPayable || 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <select
                      value={a.paymentStatus}
                      onChange={(e) => patchApp(a._id, { paymentStatus: e.target.value })}
                      className="text-xs px-2 py-1 rounded border border-border bg-background"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="waived">Waived</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={a.batch?._id || ''}
                      onChange={(e) => patchApp(a._id, { batch: e.target.value, status: e.target.value ? 'enrolled' : a.status })}
                      className="text-xs px-2 py-1 rounded border border-border bg-background max-w-[10rem]"
                    >
                      <option value="">Unassigned</option>
                      {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={a.status}
                      onChange={(e) => patchApp(a._id, { status: e.target.value })}
                      className="text-xs px-2 py-1 rounded border border-border bg-background capitalize"
                    >
                      {APP_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setDetail(a)} className="text-xs text-orange-500 hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Applicant detail */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-card border border-border p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold">{detail.user?.name}</h3>
                <p className="text-xs text-muted-foreground">{detail.user?.email}</p>
              </div>
              <button onClick={() => setDetail(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            <dl className="space-y-2.5 text-sm">
              {[
                ['Programme', detail.internship?.title],
                ['College', detail.college],
                ['Degree / branch', detail.course],
                ['Year', detail.yearOfStudy],
                ['Phone', detail.phone],
                ['Preferred start', detail.preferredStart],
                ['Applied on', new Date(detail.createdAt).toLocaleString()]
              ].map(([k, v]) => v ? (
                <div key={k} className="flex gap-3">
                  <dt className="w-32 shrink-0 text-muted-foreground text-xs pt-0.5">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ) : null)}
              {detail.resumeUrl && (
                <div className="flex gap-3">
                  <dt className="w-32 shrink-0 text-muted-foreground text-xs pt-0.5">Resume</dt>
                  <dd><a href={detail.resumeUrl} target="_blank" rel="noreferrer" className="text-orange-500 hover:underline break-all">{detail.resumeUrl}</a></dd>
                </div>
              )}
            </dl>

            {detail.motivation && (
              <div className="mt-4 rounded-xl bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground mb-1">Motivation</p>
                <p className="text-sm">{detail.motivation}</p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => patchApp(detail._id, { status: 'shortlisted' })}
                className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted"
              >
                Shortlist
              </button>
              <button
                onClick={() => patchApp(detail._id, { paymentStatus: 'paid', status: 'enrolled' })}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark paid &amp; enrol
              </button>
              <button
                onClick={() => patchApp(detail._id, { status: 'rejected' })}
                className="px-4 py-2 rounded-xl border border-red-500/40 text-red-500 text-sm hover:bg-red-500/10"
              >
                Reject
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-4 flex items-start gap-1.5">
              <Users className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Assign a batch from the applications table to add this student to a cohort roster.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
