import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Loader2, Building } from 'lucide-react';
import { partnerApi } from '@/services/partnerService';

export default function PartnersManager() {
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', logo: '', website: '', order: 0, isPublished: true });

  const load = () => {
    setIsLoading(true);
    partnerApi.getAllAdmin().then(setPartners).finally(() => setIsLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', logo: '', website: '', order: partners.length, isPublished: true });
    setShowForm(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, logo: p.logo, website: p.website || '', order: p.order, isPublished: p.isPublished });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const updated = await partnerApi.update(editing._id, form);
        setPartners((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      } else {
        const created = await partnerApi.create(form);
        setPartners((prev) => [...prev, created]);
      }
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save partner');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this partner logo?')) return;
    await partnerApi.delete(id);
    setPartners((prev) => prev.filter((p) => p._id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Partner / Client Logos</h2>
          <p className="text-xs text-gray-500 mt-0.5">Shown in the "Trusted by teams at" strip on the homepage</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all">
          <Plus className="w-4 h-4" /> Add Logo
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>
      ) : partners.length === 0 ? (
        <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-12 text-center">
          <Building className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No partner logos yet — add a client's logo URL to build trust on the homepage.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((p) => (
            <div key={p._id} className="bg-[#161616] border border-gray-800/60 rounded-2xl p-4 flex items-center gap-3">
              <img src={p.logo} alt={p.name} className="h-8 w-auto object-contain bg-white/5 rounded p-1" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{p.name}</p>
                <span className={`text-[10px] font-semibold ${p.isPublished ? 'text-green-400' : 'text-gray-500'}`}>{p.isPublished ? 'Visible' : 'Hidden'}</span>
              </div>
              <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(p._id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <motion.form initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} onSubmit={handleSave} className="bg-[#161616] border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-white">{editing ? 'Edit Partner' : 'Add Partner'}</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Company name" required className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            <input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="Logo image URL" required className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="Website URL (optional)" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} placeholder="Display order" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
              Visible on homepage
            </label>
            <button type="submit" disabled={saving} className="w-full bg-orange-500 hover:bg-orange-500 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Partner'}
            </button>
          </motion.form>
        </div>
      )}
    </div>
  );
}
