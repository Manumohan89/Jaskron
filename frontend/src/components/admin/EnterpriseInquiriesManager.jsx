import { useEffect, useState } from 'react';
import { Loader2, Building2, Mail, Phone } from 'lucide-react';
import { enterpriseApi } from '@/services/enterpriseService';

const STATUS_COLORS = { new: 'bg-orange-500/10 text-orange-500', contacted: 'bg-amber-500/10 text-amber-400', closed: 'bg-gray-700 text-gray-300' };

export default function EnterpriseInquiriesManager() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = (p = 1) => {
    setLoading(true);
    enterpriseApi.getAllAdmin({ page: p, limit: 10 }).then((data) => {
      setInquiries(data.inquiries || []);
      setPage(data.page || 1);
      setPages(data.pages || 1);
    }).finally(() => setLoading(false));
  };
  useEffect(() => { load(1); }, []);

  const updateStatus = async (id, status) => {
    const updated = await enterpriseApi.updateStatus(id, status);
    setInquiries((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Enterprise Inquiries</h2>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>
      ) : inquiries.length === 0 ? (
        <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No enterprise inquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div key={inq._id} className="bg-[#161616] border border-gray-800/60 rounded-2xl p-5">
              <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                <div>
                  <p className="font-semibold text-white">{inq.companyName}</p>
                  <p className="text-xs text-gray-500">{inq.contactName} · {inq.teamSize || 'team size n/a'}</p>
                </div>
                <select value={inq.status} onChange={(e) => updateStatus(inq._id, e.target.value)} className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 ${STATUS_COLORS[inq.status]}`}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <p className="text-sm text-gray-300 mb-3">{inq.message}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <a href={`mailto:${inq.email}`} className="flex items-center gap-1 hover:text-orange-500"><Mail className="w-3.5 h-3.5" /> {inq.email}</a>
                {inq.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {inq.phone}</span>}
                <span className="ml-auto">{new Date(inq.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
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
