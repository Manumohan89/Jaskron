import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Shield, Plus, Edit2, Trash2, X, Loader2, Inbox, Mail, Phone } from 'lucide-react';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';
const ICONS = ['Shield', 'Lock', 'Zap', 'Eye', 'Code2', 'Users', 'AlertCircle', 'BookOpen'];
const REQUEST_STATUSES = ['pending', 'contacted', 'in-progress', 'completed', 'rejected'];

const emptyForm = {
  title: '',
  description: '',
  icon: 'Shield',
  category: 'Security',
  price: 'Custom Quote',
  image: '',
  features: ''
};

export default function ServicesManager({ headers }) {
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [view, setView] = useState('services'); // 'services' | 'requests'
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [svcRes, reqRes] = await Promise.all([
        axios.get(`${API_URL}/api/services`),
        axios.get(`${API_URL}/api/services/requests/all`, { headers }).catch(() => ({ data: [] }))
      ]);
      setServices(svcRes.data);
      setRequests(reqRes.data);
    } catch {
      setServices([]);
      setRequests([]);
    }
    setIsLoading(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (s) => {
    setEditingId(s._id);
    setForm({
      title: s.title || '',
      description: s.description || '',
      icon: s.icon || 'Shield',
      category: s.category || 'Security',
      price: s.price || 'Custom Quote',
      image: s.image || '',
      features: (s.features || []).join(', ')
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      features: form.features
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean)
    };
    try {
      if (editingId) {
        const res = await axios.put(`${API_URL}/api/services/${editingId}`, payload, { headers });
        setServices((prev) => prev.map((s) => (s._id === editingId ? res.data : s)));
      } else {
        const res = await axios.post(`${API_URL}/api/services`, payload, { headers });
        setServices((prev) => [res.data, ...prev]);
      }
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save service');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return;
    try {
      await axios.delete(`${API_URL}/api/services/${id}`, { headers });
      setServices((prev) => prev.filter((s) => s._id !== id));
    } catch {}
  };

  const updateRequestStatus = async (id, status) => {
    try {
      const res = await axios.patch(`${API_URL}/api/services/requests/${id}`, { status }, { headers });
      setRequests((prev) => prev.map((r) => (r._id === id ? res.data : r)));
    } catch {}
  };

  const statusColor = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    contacted: 'bg-orange-600/10 text-orange-500 border-orange-600/30',
    'in-progress': 'bg-orange-500/10 text-orange-500 border-orange-500/30',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/30'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex bg-gray-800/60 rounded-xl p-1">
          <button
            onClick={() => setView('services')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'services' ? 'bg-orange-500 text-white' : 'text-gray-400'}`}
          >
            Services
          </button>
          <button
            onClick={() => setView('requests')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${view === 'requests' ? 'bg-orange-500 text-white' : 'text-gray-400'}`}
          >
            Requests
            {requests.filter((r) => r.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {requests.filter((r) => r.status === 'pending').length}
              </span>
            )}
          </button>
        </div>
        {view === 'services' && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
          >
            <Plus className="w-4 h-4" /> New Service
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      ) : view === 'services' ? (
        services.length === 0 ? (
          <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-12 text-center">
            <Shield className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No services yet. Add your first offering.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s) => (
              <div key={s._id} className="bg-[#161616] border border-gray-800/60 rounded-2xl overflow-hidden flex flex-col">
                {s.image && <img src={s.image} alt={s.title} className="h-28 w-full object-cover" loading="lazy" />}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 text-gray-500 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(s._id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-white mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">{s.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{s.category}</span>
                    <span className="text-orange-500 font-semibold">{s.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : requests.length === 0 ? (
        <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-12 text-center">
          <Inbox className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No service requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r._id} className="bg-[#161616] border border-gray-800/60 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <h4 className="font-semibold text-white">{r.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${statusColor[r.status]}`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-sm text-orange-500 mb-1.5">Interested in: {r.service?.title || 'Unknown service'}</p>
                {r.message && <p className="text-sm text-gray-500 mb-2">{r.message}</p>}
                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {r.email}
                  </span>
                  {r.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {r.phone}
                    </span>
                  )}
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <select
                value={r.status}
                onChange={(e) => updateRequestStatus(r._id, e.target.value)}
                className="bg-gray-800 text-gray-300 text-xs rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-orange-500 shrink-0"
              >
                {REQUEST_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSave}
              className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-white">{editingId ? 'Edit Service' : 'New Service'}</h3>
                <button type="button" onClick={() => setShowForm(false)} className="p-1.5 text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Title</label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    placeholder="Penetration Testing"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1.5 block">Category</label>
                    <input
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1.5 block">Price</label>
                    <input
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                      placeholder="Custom Quote"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Icon</label>
                  <select
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    {ICONS.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Cover image URL (optional)</label>
                  <input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                  {form.image && (
                    <img src={form.image} alt="Preview" className="mt-2 h-24 w-full object-cover rounded-lg border border-gray-800" />
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Features (comma-separated)</label>
                  <textarea
                    rows={2}
                    value={form.features}
                    onChange={(e) => setForm({ ...form, features: e.target.value })}
                    className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 resize-none"
                    placeholder="24/7 Monitoring, Detailed Reports, Remediation Support"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Save Changes' : 'Create Service'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
