import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2, Download, FileText, Loader2, X } from 'lucide-react';
import { resourceApi } from '@/services/resourceService';

const CATEGORIES = ['Guide', 'Checklist', 'Template', 'Whitepaper', 'Slides', 'Other'];

export default function ResourcesManager() {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'Guide', isPublic: 'true' });

  const load = () => {
    setIsLoading(true);
    resourceApi.getAll().then(setResources).finally(() => setIsLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please choose a file');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', form.title || file.name);
      fd.append('description', form.description);
      fd.append('category', form.category);
      fd.append('isPublic', form.isPublic);
      const created = await resourceApi.upload(fd);
      setResources((prev) => [created, ...prev]);
      setShowForm(false);
      setFile(null);
      setForm({ title: '', description: '', category: 'Guide', isPublic: 'true' });
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resource?')) return;
    await resourceApi.delete(id);
    setResources((prev) => prev.filter((r) => r._id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-white">Downloadable Resources</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all">
          <Upload className="w-4 h-4" /> Upload Resource
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>
      ) : resources.length === 0 ? (
        <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-12 text-center">
          <FileText className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No resources uploaded yet.</p>
        </div>
      ) : (
        <div className="bg-[#161616] border border-gray-800/60 rounded-2xl overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-800/60 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Visibility</th>
                <th className="px-4 py-3">Downloads</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r._id} className="border-b border-gray-800/40 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="text-sm text-white font-medium">{r.title}</p>
                    <p className="text-xs text-gray-500">{r.fileName}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{r.category}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${r.isPublic ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {r.isPublic ? 'Public' : 'Members only'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{r.downloadCount}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a href={resourceApi.downloadUrl(r._id)} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg"><Download className="w-3.5 h-3.5" /></a>
                      <button onClick={() => handleDelete(r._id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <motion.form initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} onSubmit={handleUpload} className="bg-[#161616] border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-white">Upload Resource</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} required className="w-full text-sm text-gray-300 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-orange-500/15 file:text-orange-500 file:text-xs" />
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={form.isPublic === 'true'} onChange={(e) => setForm({ ...form, isPublic: e.target.checked ? 'true' : 'false' })} />
              Visible to everyone (uncheck to require login)
            </label>
            <button type="submit" disabled={uploading} className="w-full bg-orange-500 hover:bg-orange-500 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50">
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </motion.form>
        </div>
      )}
    </div>
  );
}
