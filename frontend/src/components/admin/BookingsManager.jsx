import { useEffect, useState } from 'react';
import { Loader2, Trash2, X, Building2, Calendar, Users, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { bookingApi } from '@/services/siteService';

const STATUSES = ['new', 'contacted', 'proposal_sent', 'confirmed', 'delivered', 'declined'];

const STATUS_STYLE = {
  new: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  contacted: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  proposal_sent: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  confirmed: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  delivered: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  declined: 'bg-muted text-muted-foreground'
};

const input = 'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-orange-500';
const label = 'block text-xs font-medium text-muted-foreground mb-1.5';

export default function BookingsManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      setItems(await bookingApi.getAll());
    } catch {
      toast.error('Could not load booking requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const patch = async (id, body) => {
    try {
      const updated = await bookingApi.update(id, body);
      toast.success('Booking updated');
      setDetail((d) => (d && d._id === id ? updated : d));
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Remove the request from ${item.institutionName}?`)) return;
    try {
      await bookingApi.remove(item._id);
      toast.success('Request removed');
      setDetail(null);
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = filter === 'all' ? items : items.filter((i) => i.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Resource Person Bookings</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Requests from colleges and companies for workshops, bootcamps, and guest lectures.
          </p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-border bg-background text-sm">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border rounded-2xl">
          No booking requests {filter === 'all' ? 'yet' : `with status "${filter}"`}.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Institution</th>
                <th className="px-4 py-3 font-semibold">Programme</th>
                <th className="px-4 py-3 font-semibold">Skills</th>
                <th className="px-4 py-3 font-semibold">Participants</th>
                <th className="px-4 py-3 font-semibold">Dates</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((b) => (
                <tr key={b._id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{b.institutionName}</p>
                    <p className="text-xs text-muted-foreground">{b.contactName}{b.city ? ` · ${b.city}` : ''}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">
                    {String(b.programType).replace('-', ' ')}
                    <span className="block text-xs">{b.durationDays}d · {b.mode}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs max-w-[12rem] truncate">
                    {(b.skills || []).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{b.expectedParticipants}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{b.preferredDates || 'Flexible'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={b.status}
                      onChange={(e) => patch(b._id, { status: e.target.value })}
                      className={`text-xs px-2 py-1 rounded font-medium border-0 capitalize ${STATUS_STYLE[b.status] || ''}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setDetail(b)} className="text-xs text-orange-500 hover:underline">View</button>
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
                <h3 className="font-bold flex items-center gap-2"><Building2 className="w-4 h-4 text-orange-500" /> {detail.institutionName}</h3>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">{detail.institutionType}{detail.city ? ` · ${detail.city}` : ''}</p>
              </div>
              <button onClick={() => setDetail(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-2.5 text-sm mb-5">
              <p className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-muted-foreground" /> {detail.contactName}{detail.designation ? ` — ${detail.designation}` : ''}</p>
              <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-muted-foreground" /> <a href={`mailto:${detail.contactEmail}`} className="text-orange-500 hover:underline">{detail.contactEmail}</a></p>
              {detail.contactPhone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-muted-foreground" /> {detail.contactPhone}</p>}
              <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {detail.preferredDates || 'Flexible'} · {detail.durationDays} day(s) · {detail.mode}</p>
              {detail.departmentOrYear && <p className="text-muted-foreground text-xs">Department / year: {detail.departmentOrYear}</p>}
            </div>

            <div className="mb-5">
              <p className="text-xs text-muted-foreground mb-2">Skills requested</p>
              <div className="flex flex-wrap gap-1.5">
                {(detail.skills || []).map((s) => (
                  <span key={s} className="text-xs bg-muted px-2.5 py-1 rounded-md">{s}</span>
                ))}
              </div>
            </div>

            {detail.message && (
              <div className="rounded-xl bg-muted/50 p-4 mb-5">
                <p className="text-xs text-muted-foreground mb-1">Message</p>
                <p className="text-sm whitespace-pre-line">{detail.message}</p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={label}>Assigned resource person</label>
                <input
                  className={input}
                  defaultValue={detail.assignedResourcePerson}
                  onBlur={(e) => patch(detail._id, { assignedResourcePerson: e.target.value })}
                />
              </div>
              <div>
                <label className={label}>Scheduled on</label>
                <input
                  type="date"
                  className={input}
                  defaultValue={detail.scheduledOn ? new Date(detail.scheduledOn).toISOString().slice(0, 10) : ''}
                  onBlur={(e) => patch(detail._id, { scheduledOn: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className={label}>Internal notes</label>
              <textarea
                rows={3}
                className={input}
                defaultValue={detail.adminNotes}
                onBlur={(e) => patch(detail._id, { adminNotes: e.target.value })}
              />
            </div>

            <button onClick={() => remove(detail)} className="mt-5 inline-flex items-center gap-1.5 text-sm text-red-500 hover:underline">
              <Trash2 className="w-4 h-4" /> Delete request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
