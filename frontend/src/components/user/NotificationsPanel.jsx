import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, Award, Calendar, Briefcase, Mail, Info } from 'lucide-react';
import { notificationApi } from '@/services/notificationService';

const ICONS = { certificate: Award, workshop: Calendar, service: Briefcase, contact: Mail, system: Info };

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = (p = 1) => {
    setLoading(true);
    notificationApi.getMine({ page: p, limit: 15 }).then((data) => {
      setNotifications(data.notifications || []);
      setPages(data.pages || 1);
      setPage(p);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);

  const markRead = async (id) => {
    await notificationApi.markRead(id);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
  };
  const markAllRead = async () => {
    await notificationApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  const remove = async (id) => {
    await notificationApi.remove(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Bell className="w-5 h-5 text-orange-500" /> Notifications</h2>
        <button onClick={markAllRead} className="text-xs text-orange-500 hover:text-orange-400 flex items-center gap-1">
          <Check className="w-3.5 h-3.5" /> Mark all as read
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 text-sm">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">No notifications yet</div>
        ) : (
          notifications.map((n) => {
            const Icon = ICONS[n.type] || Info;
            return (
              <div key={n._id} className={`px-5 py-4 border-b border-gray-800/60 last:border-0 flex gap-3 items-start group ${!n.read ? 'bg-orange-500/5' : ''}`}>
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{n.title}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.read && (
                    <button onClick={() => markRead(n._id)} className="p-1.5 text-gray-500 hover:text-orange-500" title="Mark as read">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => remove(n._id)} className="p-1.5 text-gray-500 hover:text-red-400" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => load(p)} className={`w-8 h-8 rounded-lg text-sm ${p === page ? 'bg-orange-500 text-white font-semibold' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
