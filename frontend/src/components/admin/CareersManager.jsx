import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Loader2, Save, X, Users } from 'lucide-react';
import { toast } from 'sonner';
import { careerApi } from '@/services/siteService';

const EMPTY = {
  title: '', department: 'Engineering', location: 'Bengaluru, India',
  employmentType: 'full-time', experience: '0–2 years', salaryRange: '',
  summary: '', description: '', responsibilities: '', requirements: '', niceToHave: '',
  openings: 1, applyEmail: '', status: 'draft'
};

const input = 'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-orange-500';
const label = 'block text-xs font-medium text-muted-foreground mb-1.5';
const lines = (v) => String(v || '').split('\n').map((x) => x.trim()).filter(Boolean);

const APP_STATUSES = ['new', 'reviewing', 'interview', 'offered', 'hired', 'rejected'];

export default function CareersManager() {
  const [view, setView] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [j, a] = await Promise.all([careerApi.adminGetAll(), careerApi.applications().catch(() => [])]);
      setJobs(j);
      setApps(a);
    } catch {
      toast.error('Could not load openings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.title || !editing.description) return toast.error('Title and description are required');
    setSaving(true);
    try {
      const payload = {
        ...editing,
        openings: Number(editing.openings) || 1,
        responsibilities: lines(editing.responsibilities),
        requirements: lines(editing.requirements),
        niceToHave: lines(editing.niceToHave)
      };
      if (editing._id) await careerApi.update(editing._id, payload);
      else await careerApi.create(payload);
      toast.success('Opening saved');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (job) => {
    if (!window.confirm(`Delete "${job.title}" and its applications?`)) return;
    try {
      await careerApi.remove(job._id);
      toast.success('Opening deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const patchApp = async (id, patch) => {
    try {
      await careerApi.updateApplication(id, patch);
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-lg font-bold">{editing._id ? 'Edit opening' : 'New opening'}</h2>
          <div className="ml-auto flex gap-2">
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted">Cancel</button>
            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-5 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className={label}>Job title *</label><input className={input} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
            <div><label className={label}>Department</label><input className={input} value={editing.department} onChange={(e) => setEditing({ ...editing, department: e.target.value })} /></div>
            <div><label className={label}>Location</label><input className={input} value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} /></div>
            <div>
              <label className={label}>Employment type</label>
              <select className={input} value={editing.employmentType} onChange={(e) => setEditing({ ...editing, employmentType: e.target.value })}>
                {['full-time', 'part-time', 'contract', 'internship', 'freelance'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><label className={label}>Experience</label><input className={input} value={editing.experience} onChange={(e) => setEditing({ ...editing, experience: e.target.value })} /></div>
            <div><label className={label}>Salary range (optional)</label><input className={input} value={editing.salaryRange} onChange={(e) => setEditing({ ...editing, salaryRange: e.target.value })} /></div>
            <div><label className={label}>Openings</label><input type="number" className={input} value={editing.openings} onChange={(e) => setEditing({ ...editing, openings: e.target.value })} /></div>
            <div>
              <label className={label}>Status</label>
              <select className={input} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                <option value="draft">Draft</option><option value="open">Open</option><option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div><label className={label}>One-line summary</label><input className={input} value={editing.summary} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} /></div>
          <div><label className={label}>Description *</label><textarea rows={4} className={input} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>

          <div className="grid md:grid-cols-3 gap-4">
            <div><label className={label}>Responsibilities (one per line)</label><textarea rows={5} className={input} value={editing.responsibilities} onChange={(e) => setEditing({ ...editing, responsibilities: e.target.value })} /></div>
            <div><label className={label}>Requirements (one per line)</label><textarea rows={5} className={input} value={editing.requirements} onChange={(e) => setEditing({ ...editing, requirements: e.target.value })} /></div>
            <div><label className={label}>Nice to have (one per line)</label><textarea rows={5} className={input} value={editing.niceToHave} onChange={(e) => setEditing({ ...editing, niceToHave: e.target.value })} /></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-border overflow-hidden">
          {[['jobs', 'Openings'], ['apps', `Applications (${apps.length})`]].map(([k, l]) => (
            <button key={k} onClick={() => setView(k)} className={`px-4 py-2 text-sm font-medium ${view === k ? 'bg-orange-500 text-white' : 'text-muted-foreground hover:bg-muted'}`}>{l}</button>
          ))}
        </div>
        {view === 'jobs' && (
          <button onClick={() => setEditing({ ...EMPTY })} className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold">
            <Plus className="w-4 h-4" /> New opening
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
      ) : view === 'jobs' ? (
        jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border rounded-2xl">
            No openings yet. The public careers page shows an open-application prompt until you add one.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Department</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Applications</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map((j) => (
                  <tr key={j._id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{j.title}</p>
                      <p className="text-xs text-muted-foreground">{j.location}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{j.department}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{j.employmentType}</td>
                    <td className="px-4 py-3 text-muted-foreground">{j.applicationCount}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-md font-medium capitalize ${
                        j.status === 'open' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : j.status === 'draft' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>{j.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditing({
                          ...EMPTY, ...j,
                          responsibilities: (j.responsibilities || []).join('\n'),
                          requirements: (j.requirements || []).join('\n'),
                          niceToHave: (j.niceToHave || []).join('\n')
                        })} className="p-2 text-muted-foreground hover:text-orange-500"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => remove(j)} className="p-2 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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
                <th className="px-4 py-3 font-semibold">Candidate</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Experience</th>
                <th className="px-4 py-3 font-semibold">Applied</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {apps.map((a) => (
                <tr key={a._id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.job?.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.experience || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <select
                      value={a.status}
                      onChange={(e) => patchApp(a._id, { status: e.target.value })}
                      className="text-xs px-2 py-1 rounded border border-border bg-background capitalize"
                    >
                      {APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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

      {detail && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-card border border-border p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold">{detail.name}</h3>
                <p className="text-xs text-muted-foreground">{detail.email}{detail.phone ? ` · ${detail.phone}` : ''}</p>
              </div>
              <button onClick={() => setDetail(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            <dl className="space-y-2.5 text-sm">
              {[['Role', detail.job?.title], ['Experience', detail.experience]].map(([k, v]) => v ? (
                <div key={k} className="flex gap-3">
                  <dt className="w-28 shrink-0 text-muted-foreground text-xs pt-0.5">{k}</dt><dd>{v}</dd>
                </div>
              ) : null)}
              {[['Resume', detail.resumeUrl], ['Portfolio', detail.portfolioUrl]].map(([k, v]) => v ? (
                <div key={k} className="flex gap-3">
                  <dt className="w-28 shrink-0 text-muted-foreground text-xs pt-0.5">{k}</dt>
                  <dd><a href={v} target="_blank" rel="noreferrer" className="text-orange-500 hover:underline break-all">{v}</a></dd>
                </div>
              ) : null)}
            </dl>

            {detail.coverNote && (
              <div className="mt-4 rounded-xl bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground mb-1">Cover note</p>
                <p className="text-sm whitespace-pre-line">{detail.coverNote}</p>
              </div>
            )}

            <div className="mt-5">
              <label className={label}>Internal notes</label>
              <textarea
                rows={3}
                defaultValue={detail.adminNotes}
                onBlur={(e) => patchApp(detail._id, { status: detail.status, adminNotes: e.target.value })}
                className={input}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
