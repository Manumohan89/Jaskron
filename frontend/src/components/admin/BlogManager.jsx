import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Loader2, FileText } from 'lucide-react';
import { blogApi } from '@/services/blogService';

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
}

export default function BlogManager() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', status: 'draft', tags: '', coverImage: '' });

  const load = () => {
    setIsLoading(true);
    blogApi.getAllAdmin().then(setPosts).finally(() => setIsLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', slug: '', excerpt: '', content: '', status: 'draft', tags: '', coverImage: '' });
    setShowForm(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt || '', content: p.content, status: p.status, tags: (p.tags || []).join(', '), coverImage: p.coverImage || '' });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
      if (editing) {
        const updated = await blogApi.update(editing._id, payload);
        setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      } else {
        const created = await blogApi.create(payload);
        setPosts((prev) => [created, ...prev]);
      }
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save post');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    await blogApi.delete(id);
    setPosts((prev) => prev.filter((p) => p._id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-white">Blog / Knowledge Base</h2>
        <button onClick={openNew} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>
      ) : posts.length === 0 ? (
        <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-12 text-center">
          <FileText className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No posts yet. Write your first article!</p>
        </div>
      ) : (
        <div className="bg-[#161616] border border-gray-800/60 rounded-2xl overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-800/60 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p._id} className="border-b border-gray-800/40 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="text-sm text-white font-medium">{p.title}</p>
                    <p className="text-xs text-gray-500">/{p.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${p.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-300'}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
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
              <h3 className="font-semibold text-white">{editing ? 'Edit Post' : 'New Post'}</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })}
              placeholder="Title"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500"
            />
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="url-slug" required className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Short excerpt (shown on cards)" rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            <input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="Cover image URL (optional)" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            {form.coverImage && <img src={form.coverImage} alt="Preview" className="h-24 w-full object-cover rounded-lg border border-gray-800" />}
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Full content (markdown or plain text)" rows={8} required className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500 font-mono" />
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma separated)" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <button type="submit" disabled={saving} className="w-full bg-orange-500 hover:bg-orange-500 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Post'}
            </button>
          </motion.form>
        </div>
      )}
    </div>
  );
}
