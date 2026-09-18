import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Award, Loader2, Eye, Download } from 'lucide-react';
import CertificateModal from '../CertificateModal';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

export default function MyCertificates({ headers }) {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/certificates/mine`, { headers })
      .then((res) => setCertificates(res.data))
      .catch(() => setCertificates([]))
      .finally(() => setIsLoading(false));
  }, []);

  const gradeColor = {
    Pass: 'bg-gray-700 text-gray-300',
    Merit: 'bg-orange-600/15 text-orange-500',
    Distinction: 'bg-yellow-500/15 text-yellow-400'
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">My Certificates</h2>
      {certificates.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No certificates yet — complete a workshop to earn one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certificates.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6 flex items-center justify-between gap-4 hover:border-yellow-500/30 transition-all flex-wrap"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/15 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-white truncate">{c.courseTitle}</h3>
                  <p className="text-gray-400 text-sm">{new Date(c.issueDate).toLocaleDateString()}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${gradeColor[c.grade]}`}>{c.grade}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setViewing(c)}
                  className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-orange-500 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl transition-colors"
                >
                  <Eye className="w-4 h-4" /> View
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {viewing && <CertificateModal certificate={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
