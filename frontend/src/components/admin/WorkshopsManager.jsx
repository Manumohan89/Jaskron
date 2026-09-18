import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  X,
  Users,
  Loader2,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const STATUSES = ['upcoming', 'ongoing', 'completed'];

const emptyForm = {
  title: '',
  description: '',
  date: '',
  instructor: '',
  capacity: 30,
  level: 'Beginner',
  category: 'Cybersecurity',
  duration: '2 hours',
  status: 'upcoming',
  isPaid: false,
  price: 0,
  image: ''
};

export default function WorkshopsManager({ headers, onIssueCertificate }) {
  const [workshops, setWorkshops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [registrations, setRegistrations] = useState({});

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/workshops`);
      setWorkshops(res.data);
    } catch {
      setWorkshops([]);
    }
    setIsLoading(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (w) => {
    setEditingId(w._id);
    setForm({
      title: w.title || '',
      description: w.description || '',
      date: w.date ? new Date(w.date).toISOString().slice(0, 16) : '',
      instructor: w.instructor || '',
      capacity: w.capacity || 30,
      level: w.level || 'Beginner',
      category: w.category || 'Cybersecurity',
      duration: w.duration || '2 hours',
      status: w.status || 'upcoming',
      isPaid: w.isPaid || false,
      price: w.price || 0,
      image: w.image || ''
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const res = await axios.put(`${API_URL}/api/workshops/${editingId}`, form, { headers });
        setWorkshops((prev) => prev.map((w) => (w._id === editingId ? res.data : w)));
      } else {
        const res = await axios.post(`${API_URL}/api/workshops`, form, { headers });
        setWorkshops((prev) => [res.data, ...prev]);
      }
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save workshop');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this workshop? This cannot be undone.')) return;
    try {
      await axios.delete(`${API_URL}/api/workshops/${id}`, { headers });
      setWorkshops((prev) => prev.filter((w) => w._id !== id));
    } catch {}
  };

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!registrations[id]) {
      try {
        const res = await axios.get(`${API_URL}/api/workshops/${id}/registrations`, { headers });
        setRegistrations((prev) => ({ ...prev, [id]: res.data }));
      } catch {
        setRegistrations((prev) => ({ ...prev, [id]: [] }));
      }
    }
  };

  const updateRegStatus = async (workshopId, regId, status) => {
    try {
      await axios.patch(`${API_URL}/api/workshops/${workshopId}/registrations/${regId}`, { status }, { headers });
      setRegistrations((prev) => ({
        ...prev,
        [workshopId]: prev[workshopId].map((r) => (r._id === regId ? { ...r, status } : r))
      }));
    } catch {}
  };

  const levelColor = {
    Beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Advanced: 'bg-red-500/10 text-red-400 border-red-500/30'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-white">Workshop Management</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
        >
          <Plus className="w-4 h-4" /> New Workshop
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      ) : workshops.length === 0 ? (
        <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No workshops yet. Create your first one.</p>
          <button onClick={openCreate} className="text-orange-500 text-sm font-medium hover:underline">
            + Add Workshop
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {workshops.map((w) => (
            <motion.div
              key={w._id}
              layout
              className="bg-[#161616] border border-gray-800/60 rounded-2xl overflow-hidden"
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <h3 className="font-semibold text-white">{w.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${levelColor[w.level] || levelColor.Beginner}`}>
                        {w.level}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 capitalize">
                        {w.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{w.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {w.date ? new Date(w.date).toLocaleDateString() : '—'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {w.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {w.instructor}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {w.enrolledCount}/{w.capacity}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleExpand(w._id)}
                      className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors"
                      title="View registrations"
                    >
                      {expandedId === w._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openEdit(w)}
                      className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(w._id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === w._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-800/60 bg-black/20"
                  >
                    <div className="p-4 sm:p-5">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                        Registered Participants ({registrations[w._id]?.length ?? '…'})
                      </p>
                      {!registrations[w._id] ? (
                        <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                      ) : registrations[w._id].length === 0 ? (
                        <p className="text-sm text-gray-600">No registrations yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {registrations[w._id].map((r) => (
                            <div
                              key={r._id}
                              className="flex items-center justify-between gap-3 bg-[#101010] border border-gray-800/50 rounded-xl px-3 py-2.5 flex-wrap"
                            >
                              <div className="min-w-0">
                                <p className="text-sm text-white font-medium truncate">{r.user?.name || 'Unknown'}</p>
                                <p className="text-xs text-gray-500 truncate">{r.user?.email}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <select
                                  value={r.status}
                                  onChange={(e) => updateRegStatus(w._id, r._id, e.target.value)}
                                  className="bg-gray-800 text-gray-300 text-xs rounded-lg px-2 py-1.5 border border-gray-700 focus:outline-none focus:border-orange-500"
                                >
                                  {['registered', 'attended', 'completed', 'cancelled'].map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                                {r.status === 'completed' && (
                                  <button
                                    onClick={() =>
                                      onIssueCertificate?.({
                                        userId: r.user?._id,
                                        userName: r.user?.name,
                                        courseTitle: w.title,
                                        workshopId: w._id
                                      })
                                    }
                                    className="flex items-center gap-1 text-[11px] font-semibold bg-orange-500/10 text-orange-500 border border-orange-500/30 px-2.5 py-1.5 rounded-lg hover:bg-orange-500/20 transition-colors"
                                  >
                                    <Award className="w-3.5 h-3.5" /> Issue Certificate
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
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
                <h3 className="text-lg font-semibold text-white">{editingId ? 'Edit Workshop' : 'New Workshop'}</h3>
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
                    placeholder="Ethical Hacking Fundamentals"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Cover image URL (optional)</label>
                  <input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    placeholder="https://images.unsplash.com/..."
                  />
                  {form.image && (
                    <img src={form.image} alt="Preview" className="mt-2 h-24 w-full object-cover rounded-lg border border-gray-800" />
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 resize-none"
                    placeholder="What will participants learn?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1.5 block">Date & Time</label>
                    <input
                      required
                      type="datetime-local"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1.5 block">Duration</label>
                    <input
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                      placeholder="2 hours"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Instructor</label>
                  <input
                    required
                    value={form.instructor}
                    onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                    className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    placeholder="Instructor name"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1.5 block">Capacity</label>
                    <input
                      type="number"
                      min={1}
                      value={form.capacity}
                      onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                      className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1.5 block">Level</label>
                    <select
                      value={form.level}
                      onChange={(e) => setForm({ ...form, level: e.target.value })}
                      className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    >
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1.5 block">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Category</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    placeholder="Cybersecurity"
                  />
                </div>

                <div className="bg-[#161616] border border-gray-800 rounded-xl p-4">
                  <label className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                    <input
                      type="checkbox"
                      checked={form.isPaid}
                      onChange={(e) => setForm({ ...form, isPaid: e.target.checked })}
                    />
                    This is a paid workshop (Razorpay)
                  </label>
                  {form.isPaid && (
                    <div>
                      <label className="text-xs font-medium text-gray-400 mb-1.5 block">Price (INR)</label>
                      <input
                        type="number"
                        min={1}
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                        placeholder="e.g. 999"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Save Changes' : 'Create Workshop'}
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
