import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Loader2, Star, MessageSquareQuote } from 'lucide-react';
import { testimonialApi } from '@/services/testimonialService';

export default function TestimonialsManager() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', company: '', quote: '', rating: 5, isPublished: true });

  const load = () => {
    setIsLoading(true);
    testimonialApi.getAllAdmin().then(setItems).finally(() => setIsLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', role: '', company: '', quote: '', rating: 5, isPublished: true });
    setShowForm(true);
  };
  const openEdit = (t) => {
    setEditing(t);
    setForm({ name: t.name, role: t.role || '', company: t.company || '', quote: t.quote, rating: t.rating, isPublished: t.isPublished });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const updated = await testimonialApi.update(editing._id, form);
        setItems((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      } else {
        const created = await testimonialApi.create(form);
        setItems((prev) => [created, ...prev]);
      }
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save testimonial');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    await testimonialApi.delete(id);
    setItems((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-white">Testimonials</h2>
        <button onClick={openNew} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-12 text-center">
          <MessageSquareQuote className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No testimonials yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((t) => (
            <div key={t._id} className="bg-[#161616] border border-gray-800/60 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`} />
                  ))}
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${t.isPublished ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-300'}`}>{t.isPublished ? 'Published' : 'Hidden'}</span>
              </div>
              <p className="text-sm text-gray-300 mb-3">"{t.quote}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}{t.company ? ` · ${t.company}` : ''}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(t)} className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(t._id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <motion.form initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} onSubmit={handleSave} className="bg-[#161616] border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-white">{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" required className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            <div className="grid grid-cols-2 gap-3">
              <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Role" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            </div>
            <textarea value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} placeholder="Quote" rows={3} required className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-400">Rating</label>
              <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-sm text-white">
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
              Published on homepage
            </label>
            <button type="submit" disabled={saving} className="w-full bg-orange-500 hover:bg-orange-500 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Testimonial'}
            </button>
          </motion.form>
        </div>
      )}
    </div>
  );
}
