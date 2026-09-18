import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { X, Loader2, Calendar, Award, Briefcase, Mail, Phone, Building2 } from 'lucide-react';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

export default function UserDetailModal({ userId, headers, onClose }) {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    axios
      .get(`${API_URL}/api/admin/users/${userId}/detail`, { headers })
      .then((res) => setDetail(res.data))
      .catch(() => setDetail(null))
      .finally(() => setIsLoading(false));
  }, [userId]);

  if (!userId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-white">User Profile</h3>
            <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
            </div>
          ) : !detail ? (
            <p className="text-gray-500 text-center py-10">Failed to load user details.</p>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-xl font-bold text-white shrink-0">
                  {detail.user.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white text-lg">{detail.user.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{detail.user.role} · {detail.user.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-4 h-4 text-gray-600" /> {detail.user.email}
                </div>
                {detail.user.phone && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone className="w-4 h-4 text-gray-600" /> {detail.user.phone}
                  </div>
                )}
                {detail.user.organization && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Building2 className="w-4 h-4 text-gray-600" /> {detail.user.organization}
                  </div>
                )}
              </div>

              {detail.user.bio && <p className="text-sm text-gray-400 bg-[#161616] border border-gray-800/60 rounded-xl p-3">{detail.user.bio}</p>}

              {/* Workshops */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Workshops ({detail.workshops.length})
                </p>
                {detail.workshops.length === 0 ? (
                  <p className="text-sm text-gray-600">No workshop registrations.</p>
                ) : (
                  <div className="space-y-1.5">
                    {detail.workshops.map((w) => (
                      <div key={w._id} className="flex items-center justify-between bg-[#161616] border border-gray-800/50 rounded-xl px-3 py-2 text-sm">
                        <span className="text-white">{w.title}</span>
                        <span className="text-xs text-gray-500 capitalize">{w.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Certificates */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Certificates ({detail.certificates.length})
                </p>
                {detail.certificates.length === 0 ? (
                  <p className="text-sm text-gray-600">No certificates issued.</p>
                ) : (
                  <div className="space-y-1.5">
                    {detail.certificates.map((c) => (
                      <div key={c._id} className="flex items-center justify-between bg-[#161616] border border-gray-800/50 rounded-xl px-3 py-2 text-sm">
                        <span className="text-white">{c.courseTitle}</span>
                        <span className="text-xs font-mono text-gray-500">{c.certificateId}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Service Requests */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Service Requests ({detail.serviceRequests.length})
                </p>
                {detail.serviceRequests.length === 0 ? (
                  <p className="text-sm text-gray-600">No service requests.</p>
                ) : (
                  <div className="space-y-1.5">
                    {detail.serviceRequests.map((r) => (
                      <div key={r._id} className="flex items-center justify-between bg-[#161616] border border-gray-800/50 rounded-xl px-3 py-2 text-sm">
                        <span className="text-white">{r.service?.title}</span>
                        <span className="text-xs text-gray-500 capitalize">{r.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
