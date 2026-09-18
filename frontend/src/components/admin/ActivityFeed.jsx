import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Award, Calendar, Mail, Loader2, Activity } from 'lucide-react';
import { adminApi } from '@/services/adminService';

const ICONS = {
  user_registered: UserPlus,
  certificate_issued: Award,
  workshop_created: Calendar,
  contact_submitted: Mail
};

const COLORS = {
  user_registered: 'text-orange-500 bg-orange-500/10',
  certificate_issued: 'text-green-400 bg-green-500/10',
  workshop_created: 'text-purple-400 bg-purple-500/10',
  contact_submitted: 'text-orange-500 bg-orange-600/10'
};

export default function ActivityFeed() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getActivity(30).then(setEvents).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <Activity className="w-5 h-5 text-orange-500" /> Activity Log
      </h2>
      <p className="text-xs text-gray-500 -mt-2">Real events pulled from the database — new signups, certificates issued, workshops created, and contact submissions.</p>

      <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-6">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 text-orange-500 animate-spin" /></div>
        ) : events.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-8">No activity yet</p>
        ) : (
          <div className="space-y-1">
            {events.map((e, i) => {
              const Icon = ICONS[e.type] || Activity;
              const colorClass = COLORS[e.type] || 'text-gray-400 bg-gray-700';
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-start gap-3 py-2.5 border-b border-gray-800/40 last:border-0"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-sm text-gray-300 flex-1">{e.message}</p>
                  <span className="text-xs text-gray-600 shrink-0">{new Date(e.time).toLocaleString()}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
