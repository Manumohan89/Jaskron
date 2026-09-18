import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { User, Mail, Phone, Building2, Calendar, Award, BookOpen, Briefcase, Loader2, CheckCircle, Save } from 'lucide-react';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

export default function ProfileCard({ user, headers, onUpdated }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    organization: user?.organization || '',
    bio: user?.bio || ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [counts, setCounts] = useState({ workshops: null, certificates: null, requests: null });

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/workshops/mine/registrations`, { headers }).catch(() => ({ data: [] })),
      axios.get(`${API_URL}/api/certificates/mine`, { headers }).catch(() => ({ data: [] })),
      axios.get(`${API_URL}/api/services/requests/mine`, { headers }).catch(() => ({ data: [] }))
    ]).then(([w, c, r]) => {
      setCounts({ workshops: w.data.length, certificates: c.data.length, requests: r.data.length });
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await axios.put(`${API_URL}/api/users/me`, form, { headers });
      onUpdated?.(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  const statCards = [
    { label: 'Workshops Registered', value: counts.workshops, icon: BookOpen, bg: 'bg-orange-500/10', text: 'text-orange-500' },
    { label: 'Certificates Earned', value: counts.certificates, icon: Award, bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
    { label: 'Service Requests', value: counts.requests, icon: Briefcase, bg: 'bg-orange-600/10', text: 'text-orange-500' }
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-xl font-bold text-white">My Profile</h2>

      {/* Cover + avatar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-orange-600/40 via-orange-700/40 to-purple-700/40 relative">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        </div>
        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-3xl font-bold border-4 border-gray-900 shadow-xl">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="pb-1">
              <h3 className="text-lg font-semibold text-white">{user?.name}</h3>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
            <span className="ml-auto mb-2 text-xs px-2.5 py-1 bg-orange-500/15 text-orange-500 rounded-full capitalize font-medium">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4"
          >
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.text}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{s.value === null ? <Loader2 className="w-4 h-4 animate-spin" /> : s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Editable details */}
      <form onSubmit={handleSave} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2">Account Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Full Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email (read-only)
            </label>
            <input
              disabled
              value={user?.email || ''}
              className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Phone
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Organization
            </label>
            <input
              value={form.organization}
              onChange={(e) => setForm({ ...form, organization: e.target.value })}
              placeholder="Company / School"
              className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-400 mb-1.5 block">Bio</label>
          <textarea
            rows={3}
            maxLength={500}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell us a bit about yourself..."
            className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 resize-none"
          />
          <p className="text-[11px] text-gray-600 mt-1 text-right">{form.bio.length}/500</p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-400">
              <CheckCircle className="w-4 h-4" /> Saved
            </span>
          )}
        </div>
      </form>

      <div className="flex items-center gap-2 text-xs text-gray-600">
        <Calendar className="w-3.5 h-3.5" />
        Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
      </div>
    </div>
  );
}
