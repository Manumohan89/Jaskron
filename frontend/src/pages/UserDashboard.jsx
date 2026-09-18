import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Calendar, BookOpen, PlayCircle, Radio, KeyRound, Briefcase, Bell, User, LogOut, ChevronRight, CheckCircle, Clock, Star, Award, TrendingUp, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useSearch } from 'wouter';
import axios from 'axios';
import MyWorkshops from '@/components/user/MyWorkshops';
import MyLearning from '@/components/user/MyLearning';
import MyClasses from '@/components/user/MyClasses';
import AssessmentCentre from '@/components/user/AssessmentCentre';
import MyInternships from '@/components/user/MyInternships';
import MyServices from '@/components/user/MyServices';
import MyCertificates from '@/components/user/MyCertificates';
import ProfileCard from '@/components/user/ProfileCard';
import SettingsPanel from '@/components/user/SettingsPanel';
import NotificationsPanel from '@/components/user/NotificationsPanel';
import ResourcesPanel from '@/components/user/ResourcesPanel';
import SEO from '@/components/SEO';
import Logo from '@/components/Logo';
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';
export default function UserDashboard() {
  const {
    user,
    logout,
    token,
    updateUser
  } = useAuth();
  const [, navigate] = useLocation();
  const searchStr = useSearch();
  const initialTab = new URLSearchParams(searchStr).get('tab');
  const [workshops, setWorkshops] = useState([]);
  const [services, setServices] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab && ['overview','learning','classes','assessments','internships','workshops','services','profile','certificates','resources','notifications','settings'].includes(initialTab) ? initialTab : 'overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [myCounts, setMyCounts] = useState({ workshops: 0, certificates: 0, requests: 0 });
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [myCertificates, setMyCertificates] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const headers = { Authorization: `Bearer ${token}` };
  useEffect(() => {
    Promise.all([axios.get(`${API_URL}/api/workshops`, {
      headers
    }), axios.get(`${API_URL}/api/services`, {
      headers
    }), axios.get(`${API_URL}/api/workshops/mine/registrations`, {
      headers
    }).catch(() => ({
      data: []
    })), axios.get(`${API_URL}/api/certificates/mine`, {
      headers
    }).catch(() => ({
      data: []
    })), axios.get(`${API_URL}/api/services/requests/mine`, {
      headers
    }).catch(() => ({
      data: []
    })), axios.get(`${API_URL}/api/notifications`, {
      headers,
      params: { limit: 1 }
    }).catch(() => ({
      data: { unreadCount: 0 }
    }))]).then(([ws, sv, myWs, myCerts, myReqs, notifs]) => {
      setWorkshops(ws.data);
      setServices(sv.data);
      setMyRegistrations(myWs.data);
      setMyCertificates(myCerts.data);
      setUnreadNotifications(notifs.data?.unreadCount || 0);
      setMyCounts({
        workshops: myWs.data.length,
        certificates: myCerts.data.length,
        requests: myReqs.data.length
      });
    }).catch(() => {});
  }, [token]);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Real "attendance" progress — checked-in / completed workshops vs total registrations
  const attendedCount = myRegistrations.filter((r) => ['attended', 'completed'].includes(r.myRegistrationStatus)).length;
  const attendanceRate = myRegistrations.length > 0 ? Math.round((attendedCount / myRegistrations.length) * 100) : 0;

  // Real recent activity — merges actual registration + certificate timestamps, newest first
  const recentActivity = [
    ...myRegistrations.map((r) => ({
      text: ['attended', 'completed'].includes(r.myRegistrationStatus)
        ? `Attended "${r.title || 'a workshop'}"`
        : `Registered for "${r.title || 'a workshop'}"`,
      time: r.registeredAt,
      color: ['attended', 'completed'].includes(r.myRegistrationStatus) ? 'green' : 'cyan'
    })),
    ...myCertificates.map((c) => ({
      text: `Certificate earned: ${c.courseTitle}`,
      time: c.issueDate,
      color: 'yellow'
    }))
  ]
    .filter((a) => a.time)
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 5);

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const stats = [{
    label: 'Workshops Enrolled',
    value: String(myCounts.workshops),
    icon: BookOpen,
    color: 'cyan'
  }, {
    label: 'Service Requests',
    value: String(myCounts.requests),
    icon: CheckCircle,
    color: 'green'
  }, {
    label: 'Certifications',
    value: String(myCounts.certificates),
    icon: Award,
    color: 'yellow'
  }, {
    label: 'Unread Notifications',
    value: String(unreadNotifications),
    icon: Bell,
    color: 'blue'
  }];
  return <>
    <SEO title="My Dashboard" path="/dashboard" />
    <div className="min-h-screen bg-[#0F0F0F] text-white flex">
      {/* Mobile backdrop */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`w-64 bg-[#141414] border-r border-gray-800 flex flex-col fixed h-full z-40 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <p className="font-bold text-sm text-white">JASKRON</p>
              <p className="text-xs text-gray-400">Secure Ops</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1.5 text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[{
          id: 'overview',
          icon: TrendingUp,
          label: 'Overview'
        }, {
          id: 'learning',
          icon: PlayCircle,
          label: 'My Learning'
        }, {
          id: 'classes',
          icon: Radio,
          label: 'Live & Recorded'
        }, {
          id: 'assessments',
          icon: KeyRound,
          label: 'Assessment Centre'
        }, {
          id: 'internships',
          icon: Briefcase,
          label: 'My Internships'
        }, {
          id: 'workshops',
          icon: Calendar,
          label: 'Workshops'
        }, {
          id: 'services',
          icon: Shield,
          label: 'Services'
        }, {
          id: 'profile',
          icon: User,
          label: 'My Profile'
        }, {
          id: 'certificates',
          icon: Award,
          label: 'Certificates'
        }, {
          id: 'resources',
          icon: BookOpen,
          label: 'Resources'
        }, {
          id: 'notifications',
          icon: Bell,
          label: 'Notifications'
        }, {
          id: 'settings',
          icon: Settings,
          label: 'Settings'
        }].map(item => <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? 'bg-orange-500/15 text-orange-500 border border-orange-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>)}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-xs font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-xl text-sm transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 w-full md:ml-64">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-gray-300 hover:text-white shrink-0">
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-white truncate">
                Welcome back, <span className="text-orange-500">{user?.name?.split(' ')[0]}</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1 hidden sm:block">Continue your cybersecurity journey</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => setActiveTab('notifications')} className="relative p-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
              <Bell className="w-5 h-5 text-gray-300" />
            </button>
            <button onClick={() => setActiveTab('settings')} className="p-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
              <Settings className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s, i) => <motion.div key={s.label} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: i * 0.1
          }} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-orange-500/30 transition-all">
                  <div className={`w-10 h-10 rounded-xl bg-${s.color}-500/15 flex items-center justify-center mb-3`}>
                    <s.icon className={`w-5 h-5 text-${s.color}-400`} />
                  </div>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-gray-400 text-xs mt-1">{s.label}</p>
                </motion.div>)}
            </div>

            {/* Progress Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-orange-500" /> Upcoming Workshops
                </h2>
                {workshops.length === 0 ? <p className="text-gray-500 text-sm">No workshops yet</p> : <div className="space-y-3">
                    {workshops.slice(0, 3).map(w => <div key={w._id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{w.title}</p>
                          <p className="text-xs text-gray-400">{w.instructor}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${w.status === 'upcoming' ? 'bg-orange-500/15 text-orange-500' : 'bg-green-500/15 text-green-400'}`}>
                          {w.status}
                        </span>
                      </div>)}
                  </div>}
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" /> Recent Activity
                </h2>
                {recentActivity.length === 0 ? <p className="text-gray-500 text-sm">No activity yet — register for a workshop to get started.</p> : <div className="space-y-3">
                    {recentActivity.map((a, i) => <div key={i} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full bg-${a.color}-400 mt-1.5 shrink-0`} />
                        <div>
                          <p className="text-sm text-gray-300">{a.text}</p>
                          <p className="text-xs text-gray-500">{timeAgo(a.time)}</p>
                        </div>
                      </div>)}
                  </div>}
              </div>
            </div>

            {/* Learning Progress Card — real numbers, not a fabricated score */}
            <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white">Your Learning Progress</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {attendedCount} of {myRegistrations.length} registered workshop{myRegistrations.length === 1 ? '' : 's'} attended · {myCounts.certificates} certificate{myCounts.certificates === 1 ? '' : 's'} earned
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-orange-500">{attendanceRate}<span className="text-xl text-gray-400">%</span></p>
                  <p className="text-sm text-gray-400">attendance rate</p>
                </div>
              </div>
              <div className="mt-4 bg-gray-800 rounded-full h-2">
                <motion.div initial={{ width: 0 }} animate={{ width: `${attendanceRate}%` }} className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full" />
              </div>
            </div>
          </motion.div>}

        {/* Workshops Tab */}
        {activeTab === 'learning' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <MyLearning />
          </motion.div>}

        {activeTab === 'classes' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <MyClasses />
          </motion.div>}

        {activeTab === 'assessments' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AssessmentCentre />
          </motion.div>}

        {activeTab === 'internships' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <MyInternships />
          </motion.div>}

        {activeTab === 'workshops' && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }}>
            <MyWorkshops headers={headers} />
          </motion.div>}

        {/* Services Tab */}
        {activeTab === 'services' && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }}>
            <MyServices headers={headers} user={user} />
          </motion.div>}

        {/* Profile Tab */}
        {activeTab === 'profile' && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }}>
            <ProfileCard user={user} headers={headers} onUpdated={updateUser} />
          </motion.div>}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }}>
            <MyCertificates headers={headers} />
          </motion.div>}

        {/* Resources Tab */}
        {activeTab === 'resources' && <ResourcesPanel />}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && <NotificationsPanel />}

        {/* Settings Tab */}
        {activeTab === 'settings' && <SettingsPanel />}

      </main>
    </div>
    </>;
}