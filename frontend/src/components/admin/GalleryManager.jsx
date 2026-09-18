import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Loader2, Save, X, Star, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { galleryApi } from '@/services/siteService';
import { GALLERY_CATEGORIES } from '@/config/company';

const EMPTY = {
  title: '', caption: '', imageUrl: '', category: 'batch',
  institution: '', takenOn: '', isFeatured: false, isPublished: true, order: 0
};

const input = 'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-orange-500';
const label = 'block text-xs font-medium text-muted-foreground mb-1.5';

export default function GalleryManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await galleryApi.adminGetAll());
    } catch {
      toast.error('Could not load the gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.title || !editing.imageUrl) return toast.error('Title and image URL are required');
    setSaving(true);
    try {
      const payload = { ...editing, order: Number(editing.order) || 0 };
      if (!payload.takenOn) delete payload.takenOn;
      if (editing._id) await galleryApi.update(editing._id, payload);
      else await galleryApi.create(payload);
      toast.success('Photo saved');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Remove "${item.title}" from the gallery?`)) return;
    try {
      await galleryApi.remove(item._id);
      toast.success('Photo removed');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const quickToggle = async (item, field) => {
    try {
      await galleryApi.update(item._id, { [field]: !item[field] });
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Gallery</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Batch photos, workshops, campus visits, and company pictures shown on /gallery.
          </p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add photo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border rounded-2xl">
          No photos yet. Add batch and company pictures to fill the public gallery.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item._id} className="rounded-2xl border border-border overflow-hidden bg-card group">
              <div className="relative h-40 bg-muted">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                {!item.isPublished && (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] font-semibold bg-black/70 text-white px-2 py-1 rounded">
                    <EyeOff className="w-3 h-3" /> Hidden
                  </span>
                )}
                {item.isFeatured && (
                  <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-semibold bg-orange-500 text-white px-2 py-1 rounded">
                    <Star className="w-3 h-3" /> Featured
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="font-medium text-sm truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">
                  {item.category}{item.institution ? ` · ${item.institution}` : ''}
                </p>
                <div className="flex items-center gap-1 mt-3">
                  <button onClick={() => quickToggle(item, 'isFeatured')} title="Toggle featured" className="p-1.5 text-muted-foreground hover:text-orange-500"><Star className="w-4 h-4" /></button>
                  <button onClick={() => quickToggle(item, 'isPublished')} title="Toggle visibility" className="p-1.5 text-muted-foreground hover:text-orange-500"><EyeOff className="w-4 h-4" /></button>
                  <button onClick={() => setEditing({ ...EMPTY, ...item, takenOn: item.takenOn ? new Date(item.takenOn).toISOString().slice(0, 10) : '' })} className="p-1.5 text-muted-foreground hover:text-orange-500 ml-auto"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(item)} className="p-1.5 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setEditing(null)}>
          <div className="w-full max-w-lg my-8 rounded-2xl bg-card border border-border p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold">{editing._id ? 'Edit photo' : 'Add photo'}</h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            <div><label className={label}>Image URL *</label><input className={input} placeholder="https://…" value={editing.imageUrl} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })} /></div>
            {editing.imageUrl && (
              <img src={editing.imageUrl} alt="" className="w-full h-40 object-cover rounded-xl border border-border" />
            )}
            <div><label className={label}>Title *</label><input className={input} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
            <div><label className={label}>Caption</label><textarea rows={2} className={input} value={editing.caption} onChange={(e) => setEditing({ ...editing, caption: e.target.value })} /></div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Category</label>
                <select className={input} value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                  {GALLERY_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  <option value="other">Other</option>
                </select>
              </div>
              <div><label className={label}>Institution / place</label><input className={input} value={editing.institution} onChange={(e) => setEditing({ ...editing, institution: e.target.value })} /></div>
              <div><label className={label}>Taken on</label><input type="date" className={input} value={editing.takenOn} onChange={(e) => setEditing({ ...editing, takenOn: e.target.value })} /></div>
              <div><label className={label}>Sort order</label><input type="number" className={input} value={editing.order} onChange={(e) => setEditing({ ...editing, order: e.target.value })} /></div>
            </div>

            <div className="flex flex-wrap gap-5">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.isFeatured} onChange={(e) => setEditing({ ...editing, isFeatured: e.target.checked })} /> Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.isPublished} onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })} /> Published
              </label>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
