import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Loader2, Users, ShieldCheck } from 'lucide-react';
import { teamApi } from '@/services/teamService';

export default function TeamManager() {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', title: '', bio: '', image: '', certifications: '', linkedin: '', github: '', twitter: '' });

  const load = () => {
    setIsLoading(true);
    teamApi.getAll().then(setMembers).finally(() => setIsLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', title: '', bio: '', image: '', certifications: '', linkedin: '', github: '', twitter: '' });
    setShowForm(true);
  };
  const openEdit = (m) => {
    setEditing(m);
    setForm({
      name: m.name, title: m.title, bio: m.bio || '', image: m.image || '',
      certifications: (m.certifications || []).join(', '),
      linkedin: m.social?.linkedin || '', github: m.social?.github || '', twitter: m.social?.twitter || ''
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        title: form.title,
        bio: form.bio,
        image: form.image,
        certifications: form.certifications.split(',').map((c) => c.trim()).filter(Boolean),
        social: { linkedin: form.linkedin, github: form.github, twitter: form.twitter }
      };
      if (editing) {
        const updated = await teamApi.update(editing._id, payload);
        setMembers((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
      } else {
        const created = await teamApi.create(payload);
        setMembers((prev) => [...prev, created]);
      }
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save team member');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this team member?')) return;
    await teamApi.delete(id);
    setMembers((prev) => prev.filter((m) => m._id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-white">Team Members</h2>
        <button onClick={openNew} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all">
          <Plus className="w-4 h-4" /> Add Team Member
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>
      ) : members.length === 0 ? (
        <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No team members yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((m) => (
            <div key={m._id} className="bg-[#161616] border border-gray-800/60 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-white">{m.name}</p>
                  <p className="text-xs text-orange-500">{m.title}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(m)} className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(m._id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {m.certifications?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {m.certifications.map((c) => (
                    <span key={c} className="inline-flex items-center gap-1 text-[10px] font-semibold bg-orange-500/10 text-orange-500 border border-orange-500/30 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-2.5 h-2.5" /> {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <motion.form initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} onSubmit={handleSave} className="bg-[#161616] border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-3 my-8">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-white">{editing ? 'Edit Team Member' : 'Add Team Member'}</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" required className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title / Role" required className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Short bio" rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Photo URL (optional)" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            <input value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} placeholder="Certifications, comma separated (e.g. CEH, OSCP, CISSP)" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            <div className="grid grid-cols-3 gap-2">
              <input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="LinkedIn URL" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-gray-500" />
              <input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} placeholder="GitHub URL" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-gray-500" />
              <input value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} placeholder="Twitter URL" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-gray-500" />
            </div>
            <button type="submit" disabled={saving} className="w-full bg-orange-500 hover:bg-orange-500 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Member'}
            </button>
          </motion.form>
        </div>
      )}
    </div>
  );
}
