import { useEffect, useState, useRef } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { notificationApi } from '@/services/notificationService';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

export default function NotificationBell({ dark = false }) {
  const { user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const panelRef = useRef(null);

  const loadNotifications = () => {
    notificationApi.getMine({ limit: 10 }).then((data) => {
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    }).catch(() => {});
  };

  useEffect(() => {
    if (!user || !token) return;
    loadNotifications();

    // Real-time push: when the backend issues a certificate, confirms a workshop, etc.,
    // it shows up here instantly without a page refresh.
    const socket = io(API_URL, { auth: { token } });
    socketRef.current = socket;
    socket.on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 10));
      setUnreadCount((c) => c + 1);
      toast(notification.title, { description: notification.message });
    });
    return () => socket.disconnect();
  }, [user, token]);

  useEffect(() => {
    const onClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!user) return null;

  const markRead = async (id) => {
    await notificationApi.markRead(id);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await notificationApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const remove = async (id) => {
    await notificationApi.remove(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`relative p-2 rounded-xl transition-colors ${dark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-muted hover:bg-muted/70 border border-border'}`}
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 ${dark ? 'text-gray-300' : 'text-muted-foreground'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <p className="font-semibold text-white text-sm">Notifications</p>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-orange-500 hover:text-orange-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">You're all caught up</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`px-4 py-3 border-b border-gray-800/60 flex gap-2 items-start group ${!n.read ? 'bg-orange-500/5' : ''}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-orange-500' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0" onClick={() => !n.read && markRead(n._id)}>
                      <p className="text-sm text-white font-medium truncate">{n.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-gray-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    <button onClick={() => remove(n._id)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
            <Link href="/dashboard?tab=notifications" onClick={() => setOpen(false)} className="block text-center py-2.5 text-xs text-orange-500 hover:text-orange-400 border-t border-gray-800">
              View all notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
