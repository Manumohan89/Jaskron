import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Loader2, FileBarChart, PlusCircle, MinusCircle } from 'lucide-react';
import { caseStudyApi } from '@/services/caseStudyService';

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
}

const emptyForm = {
  title: '', slug: '', clientName: '', industry: '', summary: '',
  challenge: '', solution: '', results: '', status: 'draft',
  metrics: [{ label: '', before: '', after: '' }]
};

export default function CaseStudiesManager() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setIsLoading(true);
    caseStudyApi.getAllAdmin().then(setItems).finally(() => setIsLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      title: c.title, slug: c.slug, clientName: c.clientName, industry: c.industry || '',
      summary: c.summary || '', challenge: c.challenge, solution: c.solution, results: c.results,
      status: c.status, metrics: c.metrics?.length ? c.metrics : [{ label: '', before: '', after: '' }]
    });
    setShowForm(true);
  };

  const updateMetric = (i, field, value) => {
    const next = [...form.metrics];
    next[i] = { ...next[i], [field]: value };
    setForm({ ...form, metrics: next });
  };
  const addMetric = () => setForm({ ...form, metrics: [...form.metrics, { label: '', before: '', after: '' }] });
  const removeMetric = (i) => setForm({ ...form, metrics: form.metrics.filter((_, idx) => idx !== i) });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, metrics: form.metrics.filter((m) => m.label.trim()) };
      if (editing) {
        const updated = await caseStudyApi.update(editing._id, payload);
        setItems((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      } else {
        const created = await caseStudyApi.create(payload);
        setItems((prev) => [created, ...prev]);
      }
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save case study');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this case study?')) return;
    await caseStudyApi.delete(id);
    setItems((prev) => prev.filter((c) => c._id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-white">Case Studies</h2>
        <button onClick={openNew} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all">
          <Plus className="w-4 h-4" /> New Case Study
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-12 text-center">
          <FileBarChart className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No case studies yet.</p>
        </div>
      ) : (
        <div className="bg-[#161616] border border-gray-800/60 rounded-2xl overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-800/60 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id} className="border-b border-gray-800/40 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-sm text-white font-medium">{c.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{c.clientName}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${c.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-300'}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(c._id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <motion.form initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} onSubmit={handleSave} className="bg-[#161616] border border-gray-800 rounded-2xl p-6 w-full max-w-xl space-y-3 my-8">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-white">{editing ? 'Edit Case Study' : 'New Case Study'}</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} placeholder="Title" required className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="url-slug" required className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            <div className="grid grid-cols-2 gap-3">
              <input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder="Client name" required className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
              <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="Industry" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            </div>
            <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="One-line summary (shown on cards)" rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            <textarea value={form.challenge} onChange={(e) => setForm({ ...form, challenge: e.target.value })} placeholder="The challenge" rows={3} required className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            <textarea value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })} placeholder="Our approach / solution" rows={3} required className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            <textarea value={form.results} onChange={(e) => setForm({ ...form, results: e.target.value })} placeholder="Results achieved" rows={3} required className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />

            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400">Headline metrics (before → after)</p>
              {form.metrics.map((m, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
                  <input value={m.label} onChange={(e) => updateMetric(i, 'label', e.target.value)} placeholder="Metric label" className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-gray-500" />
                  <input value={m.before} onChange={(e) => updateMetric(i, 'before', e.target.value)} placeholder="Before" className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-gray-500" />
                  <input value={m.after} onChange={(e) => updateMetric(i, 'after', e.target.value)} placeholder="After" className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-gray-500" />
                  <button type="button" onClick={() => removeMetric(i)} className="text-gray-500 hover:text-red-400"><MinusCircle className="w-4 h-4" /></button>
                </div>
              ))}
              <button type="button" onClick={addMetric} className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-400"><PlusCircle className="w-3.5 h-3.5" /> Add metric</button>
            </div>

            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <button type="submit" disabled={saving} className="w-full bg-orange-500 hover:bg-orange-500 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Case Study'}
            </button>
          </motion.form>
        </div>
      )}
    </div>
  );
}
