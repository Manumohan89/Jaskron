import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Award, Plus, X, Loader2, Eye, Ban, Search } from 'lucide-react';
import CertificateModal from '../CertificateModal';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';
const GRADES = ['Pass', 'Merit', 'Distinction'];

export default function CertificatesManager({ headers, users, prefill, onPrefillConsumed }) {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [userQuery, setUserQuery] = useState('');
  const [form, setForm] = useState({
    userId: '', courseTitle: '', grade: 'Pass', issuedBy: 'JASKRON Technologies Pvt. Ltd.',
    performanceScore: '', attendancePercent: '', durationLabel: '', mentorRemarks: ''
  });

  const [certSearch, setCertSearch] = useState('');
  const [certPage, setCertPage] = useState(1);
  const [certPages, setCertPages] = useState(1);

  useEffect(() => {
    fetchCertificates(1);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchCertificates(1), 300);
    return () => clearTimeout(t);
  }, [certSearch]);

  useEffect(() => {
    if (prefill) {
      setForm({
        userId: prefill.userId || '',
        courseTitle: prefill.courseTitle || '',
        grade: 'Pass',
        issuedBy: 'JASKRON Technologies Pvt. Ltd.',
        workshop: prefill.workshopId,
        performanceScore: '', attendancePercent: '', durationLabel: '', mentorRemarks: ''
      });
      setShowForm(true);
      onPrefillConsumed?.();
    }
  }, [prefill]);

  const fetchCertificates = async (page = certPage) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/certificates`, {
        headers,
        params: { search: certSearch || undefined, page, limit: 10 }
      });
      setCertificates(res.data.certificates || []);
      setCertPage(res.data.page || 1);
      setCertPages(res.data.pages || 1);
    } catch {
      setCertificates([]);
    }
    setIsLoading(false);
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!form.userId) return alert('Please select a recipient');
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.performanceScore === '') delete payload.performanceScore;
      if (payload.attendancePercent === '') delete payload.attendancePercent;
      const res = await axios.post(`${API_URL}/api/certificates`, payload, { headers });
      fetchCertificates(1);
      setShowForm(false);
      setForm({
        userId: '', courseTitle: '', grade: 'Pass', issuedBy: 'JASKRON Technologies Pvt. Ltd.',
        performanceScore: '', attendancePercent: '', durationLabel: '', mentorRemarks: ''
      });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to issue certificate');
    }
    setSaving(false);
  };

  const handleRevoke = async (id) => {
    if (!confirm('Revoke this certificate? It will no longer verify as valid.')) return;
    try {
      await axios.patch(`${API_URL}/api/certificates/${id}/revoke`, {}, { headers });
      setCertificates((prev) => prev.filter((c) => c._id !== id));
    } catch {}
  };

  const filteredUsers = (users || []).filter(
    (u) => u.name?.toLowerCase().includes(userQuery.toLowerCase()) || u.email?.toLowerCase().includes(userQuery.toLowerCase())
  );

  const gradeColor = {
    Pass: 'bg-gray-700 text-gray-300',
    Merit: 'bg-orange-600/10 text-orange-500 border border-orange-600/30',
    Distinction: 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-white">Certificates Issued</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Issue Certificate
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={certSearch}
          onChange={(e) => setCertSearch(e.target.value)}
          placeholder="Search by name, ID, or course..."
          className="w-full bg-[#161616] border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      ) : certificates.length === 0 ? (
        <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-12 text-center">
          <Award className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No certificates issued yet.</p>
        </div>
      ) : (
        <div className="bg-[#161616] border border-gray-800/60 rounded-2xl overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-800/60 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Issued</th>
                <th className="px-4 py-3">Certificate ID</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((c) => (
                <tr key={c._id} className="border-b border-gray-800/40 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="text-sm text-white font-medium">{c.recipientName}</p>
                    <p className="text-xs text-gray-500">{c.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{c.courseTitle}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${gradeColor[c.grade]}`}>{c.grade}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(c.issueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{c.certificateId}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setPreview(c)} className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleRevoke(c._id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {certPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          {Array.from({ length: certPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => fetchCertificates(p)}
              className={`w-8 h-8 rounded-lg text-sm ${p === certPage ? 'bg-orange-500 text-white font-semibold' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Issue Certificate Modal */}
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
              onSubmit={handleIssue}
              className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-white">Issue New Certificate</h3>
                <button type="button" onClick={() => setShowForm(false)} className="p-1.5 text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Recipient</label>
                  {form.userId && (
                    <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/30 rounded-xl px-3 py-2.5 mb-2">
                      <span className="text-sm text-orange-400">
                        {users?.find((u) => u._id === form.userId)?.name || 'Selected user'}
                      </span>
                      <button type="button" onClick={() => setForm({ ...form, userId: '' })} className="text-orange-500 text-xs">
                        Change
                      </button>
                    </div>
                  )}
                  {!form.userId && (
                    <>
                      <div className="relative mb-2">
                        <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          value={userQuery}
                          onChange={(e) => setUserQuery(e.target.value)}
                          placeholder="Search by name or email..."
                          className="w-full bg-[#161616] border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div className="max-h-36 overflow-y-auto space-y-1 border border-gray-800 rounded-xl p-1.5">
                        {filteredUsers.length === 0 ? (
                          <p className="text-xs text-gray-600 px-2 py-2">No users found</p>
                        ) : (
                          filteredUsers.map((u) => (
                            <button
                              type="button"
                              key={u._id}
                              onClick={() => setForm({ ...form, userId: u._id })}
                              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-orange-500/10 transition-colors"
                            >
                              <p className="text-sm text-white">{u.name}</p>
                              <p className="text-xs text-gray-500">{u.email}</p>
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Course / Achievement Title</label>
                  <input
                    required
                    value={form.courseTitle}
                    onChange={(e) => setForm({ ...form, courseTitle: e.target.value })}
                    className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    placeholder="Ethical Hacking Fundamentals"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1.5 block">Grade</label>
                    <select
                      value={form.grade}
                      onChange={(e) => setForm({ ...form, grade: e.target.value })}
                      className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    >
                      {GRADES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1.5 block">Issued By</label>
                    <input
                      value={form.issuedBy}
                      onChange={(e) => setForm({ ...form, issuedBy: e.target.value })}
                      className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1.5 block">Performance score (0–100, optional)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.performanceScore}
                      onChange={(e) => setForm({ ...form, performanceScore: e.target.value })}
                      className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                      placeholder="e.g. 88"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1.5 block">Attendance % (optional)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.attendancePercent}
                      onChange={(e) => setForm({ ...form, attendancePercent: e.target.value })}
                      className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                      placeholder="e.g. 92"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Duration label (optional)</label>
                  <input
                    value={form.durationLabel}
                    onChange={(e) => setForm({ ...form, durationLabel: e.target.value })}
                    className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    placeholder="e.g. 8 weeks"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Mentor remarks (optional)</label>
                  <input
                    value={form.mentorRemarks}
                    onChange={(e) => setForm({ ...form, mentorRemarks: e.target.value })}
                    className="w-full bg-[#161616] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    placeholder="Shown in quotes on the certificate"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                  Issue Certificate
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

      {preview && <CertificateModal certificate={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
