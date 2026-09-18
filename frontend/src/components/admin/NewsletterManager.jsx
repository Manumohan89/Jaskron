import { useEffect, useState } from 'react';
import { Download, Loader2, Mail } from 'lucide-react';
import { newsletterApi } from '@/services/newsletterService';

export default function NewsletterManager() {
  const [subscribers, setSubscribers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = (p = 1) => {
    setLoading(true);
    newsletterApi.getAllAdmin({ page: p, limit: 50 }).then((data) => {
      setSubscribers(data.subscribers || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setPages(data.pages || 1);
    }).finally(() => setLoading(false));
  };
  useEffect(() => { load(1); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Newsletter Subscribers</h2>
          <p className="text-xs text-gray-500 mt-0.5">{total} active subscriber{total === 1 ? '' : 's'}</p>
        </div>
        <a href={newsletterApi.exportCsvUrl()} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all">
          <Download className="w-4 h-4" /> Export CSV
        </a>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>
      ) : subscribers.length === 0 ? (
        <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-12 text-center">
          <Mail className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No subscribers yet.</p>
        </div>
      ) : (
        <div className="bg-[#161616] border border-gray-800/60 rounded-2xl overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-gray-800/60 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s._id} className="border-b border-gray-800/40 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-sm text-white">{s.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-400 capitalize">{s.source}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => load(p)} className={`w-8 h-8 rounded-lg text-sm ${p === page ? 'bg-orange-500 text-white font-semibold' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
