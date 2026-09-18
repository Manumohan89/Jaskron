import { useEffect, useState } from 'react';
import { QrCode, CheckCircle, RefreshCw, Search, Loader2 } from 'lucide-react';
import { workshopApi } from '@/services/workshopService';
import { checkinApi } from '@/services/checkinService';
import apiClient from '@/services/api';

export default function CheckInPanel() {
  const [workshops, setWorkshops] = useState([]);
  const [selected, setSelected] = useState('');
  const [qr, setQr] = useState(null);
  const [checkInCode, setCheckInCode] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loadingQr, setLoadingQr] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    workshopApi.getAll().then(setWorkshops).catch(() => setWorkshops([]));
  }, []);

  const loadWorkshop = async (id) => {
    setSelected(id);
    setQr(null);
    if (!id) return;
    setLoadingQr(true);
    try {
      const [qrData, regs] = await Promise.all([
        checkinApi.getQr(id),
        apiClient.get(`/api/workshops/${id}/registrations`).then((r) => r.data)
      ]);
      setQr(qrData.qrDataUrl);
      setCheckInCode(qrData.checkInCode);
      setRegistrations(regs);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load check-in data');
    }
    setLoadingQr(false);
  };

  const manualCheckIn = async (userId) => {
    try {
      await checkinApi.checkIn(selected, { userId, code: checkInCode });
      setRegistrations((prev) => prev.map((r) => (r.user._id === userId ? { ...r, status: 'attended' } : r)));
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    }
  };

  const filtered = registrations.filter((r) =>
    r.user?.name?.toLowerCase().includes(search.toLowerCase()) || r.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2"><QrCode className="w-5 h-5 text-orange-500" /> Workshop QR Check-in</h2>

      <select
        value={selected}
        onChange={(e) => loadWorkshop(e.target.value)}
        className="w-full max-w-md bg-[#161616] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50"
      >
        <option value="">Select a workshop...</option>
        {workshops.map((w) => (
          <option key={w._id} value={w._id}>{w.title} — {new Date(w.date).toLocaleDateString()}</option>
        ))}
      </select>

      {loadingQr && <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>}

      {qr && !loadingQr && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-6 flex flex-col items-center text-center">
            <img src={qr} alt="Check-in QR" className="w-48 h-48 rounded-xl bg-white p-2" />
            <p className="text-xs text-gray-500 mt-3">Participants scan this on arrival to check in.</p>
            <button onClick={() => loadWorkshop(selected)} className="mt-3 flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-400">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          <div className="lg:col-span-2 bg-[#161616] border border-gray-800/60 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-800/60">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search participant to manually check in..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-500"
                />
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-10">No participants found</p>
              ) : (
                filtered.map((r) => (
                  <div key={r._id} className="flex items-center justify-between px-4 py-3 border-b border-gray-800/40 last:border-0">
                    <div>
                      <p className="text-sm text-white font-medium">{r.user?.name}</p>
                      <p className="text-xs text-gray-500">{r.user?.email}</p>
                    </div>
                    {r.status === 'attended' ? (
                      <span className="flex items-center gap-1 text-xs text-green-400 font-medium"><CheckCircle className="w-3.5 h-3.5" /> Checked in</span>
                    ) : (
                      <button onClick={() => manualCheckIn(r.user._id)} className="text-xs bg-orange-500/15 text-orange-500 hover:bg-orange-500/25 px-3 py-1.5 rounded-lg font-medium">
                        Check in
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
