import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Calendar, TrendingUp, LogOut, Settings, Bell, Search, ChevronDown, Trash2, Edit2, CheckCircle, XCircle, BarChart2, Activity, Database, Lock, Menu, X, Award, Briefcase, Building2, FileBarChart, Mail, AlertTriangle, RefreshCw, BookOpen, KeyRound, Images } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import axios from 'axios';
import WorkshopsManager from '@/components/admin/WorkshopsManager';
import CoursesManager from '@/components/admin/CoursesManager';
import InternshipsManager from '@/components/admin/InternshipsManager';
import BatchesManager from '@/components/admin/BatchesManager';
import GalleryManager from '@/components/admin/GalleryManager';
import CareersManager from '@/components/admin/CareersManager';
import BookingsManager from '@/components/admin/BookingsManager';
import ExamsManager from '@/components/admin/ExamsManager';
import ServicesManager from '@/components/admin/ServicesManager';
import CertificatesManager from '@/components/admin/CertificatesManager';
import UserDetailModal from '@/components/admin/UserDetailModal';
import ResourcesManager from '@/components/admin/ResourcesManager';
import BlogManager from '@/components/admin/BlogManager';
import TestimonialsManager from '@/components/admin/TestimonialsManager';
import CheckInPanel from '@/components/admin/CheckInPanel';
import ActivityFeed from '@/components/admin/ActivityFeed';
import AdminSettingsPanel from '@/components/admin/AdminSettingsPanel';
import TeamManager from '@/components/admin/TeamManager';
import PartnersManager from '@/components/admin/PartnersManager';
import CaseStudiesManager from '@/components/admin/CaseStudiesManager';
import NewsletterManager from '@/components/admin/NewsletterManager';
import EnterpriseInquiriesManager from '@/components/admin/EnterpriseInquiriesManager';
import SEO from '@/components/SEO';
import Logo from '@/components/Logo';
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';
export default function AdminDashboard() {
  const {
    user,
    logout,
    token
  } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPages, setUsersPages] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [contactsPage, setContactsPage] = useState(1);
  const [contactsPages, setContactsPages] = useState(1);
  const [contactSearch, setContactSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [certPrefill, setCertPrefill] = useState(null);
  const [viewUserId, setViewUserId] = useState(null);
  const headers = {
    Authorization: `Bearer ${token}`
  };
  useEffect(() => {
    fetchAll();
  }, []);

  // Debounced re-fetch of users when the search box changes (10 per page, backend-side)
  useEffect(() => {
    const t = setTimeout(() => fetchUsers(1, searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const t = setTimeout(() => fetchContacts(1, contactSearch), 300);
    return () => clearTimeout(t);
  }, [contactSearch]);

  const fetchUsers = async (page = 1, search = searchQuery) => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/users`, { headers, params: { page, limit: 10, search: search || undefined } });
      setUsers(res.data.users || []);
      setUsersPage(res.data.page || 1);
      setUsersPages(res.data.pages || 1);
      setUsersTotal(res.data.total || 0);
    } catch {
      setUsers([]);
    }
  };

  const fetchContacts = async (page = 1, search = contactSearch) => {
    try {
      const res = await axios.get(`${API_URL}/api/contacts`, { headers, params: { page, limit: 10, search: search || undefined } });
      setContacts(res.data.contacts || []);
      setContactsPage(res.data.page || 1);
      setContactsPages(res.data.pages || 1);
    } catch {
      setContacts([]);
    }
  };

  const fetchAll = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [statsRes, usersRes, contactsRes] = await Promise.all([axios.get(`${API_URL}/api/admin/stats`, {
        headers
      }), axios.get(`${API_URL}/api/admin/users`, {
        headers,
        params: { page: 1, limit: 10 }
      }), axios.get(`${API_URL}/api/contacts`, {
        headers,
        params: { page: 1, limit: 10 }
      })]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setUsersPages(usersRes.data.pages || 1);
      setUsersTotal(usersRes.data.total || 0);
      setContacts(contactsRes.data.contacts || []);
      setContactsPages(contactsRes.data.pages || 1);
    } catch (err) {
      // Previously this silently fell back to hardcoded numbers (24 users, 21
      // active, etc.) whenever the request failed for ANY reason — masking real
      // connection/auth problems behind fake-looking data. Now we surface the
      // actual failure instead of pretending everything's fine.
      setStats(null);
      setUsers([]);
      setContacts([]);
      setLoadError(
        err.response?.status === 401 || err.response?.status === 403
          ? 'Your session may have expired. Try logging out and back in.'
          : err.code === 'ERR_NETWORK' || !err.response
          ? `Couldn't reach the API at ${API_URL}. Is the backend running and is VITE_API_URL set correctly?`
          : err.response?.data?.message || 'Failed to load dashboard data.'
      );
    }
    setIsLoading(false);
  };
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const toggleUserStatus = async (id, isActive) => {
    try {
      const res = await axios.patch(`${API_URL}/api/admin/users/${id}`, {
        isActive: !isActive
      }, {
        headers
      });
      setUsers(prev => prev.map(u => u._id === id ? res.data : u));
    } catch {}
  };
  const changeUserRole = async (id, role) => {
    try {
      const res = await axios.patch(`${API_URL}/api/admin/users/${id}`, {
        role
      }, {
        headers
      });
      setUsers(prev => prev.map(u => u._id === id ? res.data : u));
    } catch {}
  };
  const deleteUser = async id => {
    if (!confirm('Are you sure?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/users/${id}`, {
        headers
      });
      fetchUsers(usersPage, searchQuery);
    } catch {}
  };
  const filteredUsers = users; // search now happens server-side via fetchUsers
  const navItems = [{
    id: 'overview',
    icon: BarChart2,
    label: 'Overview'
  }, {
    id: 'users',
    icon: Users,
    label: 'User Management'
  }, {
    id: 'contacts',
    icon: MessageSquare,
    label: 'Contacts'
  }, {
    id: 'courses',
    icon: BookOpen,
    label: 'Courses (LMS)'
  }, {
    id: 'internships',
    icon: Briefcase,
    label: 'Internships'
  }, {
    id: 'batches',
    icon: Users,
    label: 'Batches & Classes'
  }, {
    id: 'exams',
    icon: KeyRound,
    label: 'Assessments'
  }, {
    id: 'gallery',
    icon: Images,
    label: 'Gallery'
  }, {
    id: 'careers',
    icon: Briefcase,
    label: 'Careers'
  }, {
    id: 'bookings',
    icon: Building2,
    label: 'Resource Bookings'
  }, {
    id: 'workshops',
    icon: Calendar,
    label: 'Workshops'
  }, {
    id: 'services',
    icon: Briefcase,
    label: 'Services'
  }, {
    id: 'certificates',
    icon: Award,
    label: 'Certificates'
  }, {
    id: 'resources',
    icon: Database,
    label: 'Resources'
  }, {
    id: 'blog',
    icon: MessageSquare,
    label: 'Blog'
  }, {
    id: 'testimonials',
    icon: Users,
    label: 'Testimonials'
  }, {
    id: 'team',
    icon: Users,
    label: 'Team'
  }, {
    id: 'partners',
    icon: Building2,
    label: 'Partner Logos'
  }, {
    id: 'casestudies',
    icon: FileBarChart,
    label: 'Case Studies'
  }, {
    id: 'enterprise',
    icon: Briefcase,
    label: 'Enterprise Inquiries'
  }, {
    id: 'newsletter',
    icon: Mail,
    label: 'Newsletter'
  }, {
    id: 'checkin',
    icon: CheckCircle,
    label: 'QR Check-in'
  }, {
    id: 'security',
    icon: Lock,
    label: 'Activity Log'
  }, {
    id: 'settings',
    icon: Settings,
    label: 'Settings'
  }];
  const overviewCards = [{
    label: 'Total Users',
    value: stats?.totalUsers ?? '—',
    icon: Users,
    color: 'cyan',
    delta: stats?.deltas?.users ?? ''
  }, {
    label: 'Active Users',
    value: stats?.activeUsers ?? '—',
    icon: Activity,
    color: 'green',
    delta: stats?.totalUsers ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%` : ''
  }, {
    label: 'Contact Submissions',
    value: stats?.totalContacts ?? '—',
    icon: MessageSquare,
    color: 'blue',
    delta: stats?.deltas?.contacts ?? ''
  }, {
    label: 'Workshops',
    value: stats?.totalWorkshops ?? '—',
    icon: Calendar,
    color: 'purple',
    delta: ''
  }, {
    label: 'Certificates Issued',
    value: stats?.totalCertificates ?? '—',
    icon: Award,
    color: 'cyan',
    delta: stats?.deltas?.certificates ?? ''
  }, {
    label: 'Pending Requests',
    value: stats?.pendingServiceRequests ?? '—',
    icon: Briefcase,
    color: 'amber',
    delta: ''
  }];
  return <>
    <SEO title="Admin Dashboard" path="/admin" />
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Mobile backdrop */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`w-64 bg-[#111111] border-r border-gray-800/60 flex flex-col fixed h-full z-40 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-5 border-b border-gray-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <p className="font-bold text-sm">JASKRON</p>
              <p className="text-[10px] text-orange-500 font-medium tracking-widest uppercase">Admin Console</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1.5 text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${activeTab === item.id ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`}>
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>)}
        </nav>

        <div className="p-3 border-t border-gray-800/60 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xs font-bold shadow-lg">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-red-400 font-medium uppercase tracking-wide">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl text-sm transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen w-full md:ml-64">
        {/* Top Bar */}
        <header className="bg-[#111111]/80 backdrop-blur-xl border-b border-gray-800/60 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-gray-300 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white capitalize">
                {navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 bg-gray-800/60 hover:bg-gray-700/60 rounded-xl transition-colors">
              <Bell className="w-4 h-4 text-gray-300" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-gray-800/60 rounded-xl px-3 py-2 text-sm text-gray-300 border border-gray-700/50">
              <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-xs text-red-400 font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </span>
              {user?.name?.split(' ')[0]}
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-auto">
          {/* Overview */}
          {activeTab === 'overview' && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} className="space-y-6">
              {loadError && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-300">Couldn't load dashboard data</p>
                    <p className="text-xs text-red-400/80 mt-0.5">{loadError}</p>
                  </div>
                  <button onClick={fetchAll} className="flex items-center gap-1.5 text-xs font-medium text-red-300 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-3 py-1.5 rounded-lg shrink-0 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" /> Retry
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {overviewCards.map((c, i) => <motion.div key={c.label} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: i * 0.08
            }} className="bg-[#161616] border border-gray-800/60 rounded-2xl p-5 hover:border-gray-700 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-9 h-9 rounded-xl bg-${c.color}-500/10 flex items-center justify-center`}>
                        <c.icon className={`w-4 h-4 text-${c.color}-400`} />
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.delta?.startsWith('-') ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10'}`}>{c.delta}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{isLoading ? '...' : c.value}</p>
                    <p className="text-gray-500 text-xs mt-1">{c.label}</p>
                  </motion.div>)}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-[#161616] border border-gray-800/60 rounded-2xl p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-500" /> User Growth (last 12 months)
                  </h3>
                  {stats?.userGrowth?.length ? (
                    <>
                      <div className="h-40 flex items-end gap-2">
                        {(() => {
                          const max = Math.max(1, ...stats.userGrowth.map((m) => m.count));
                          return stats.userGrowth.map((m, i) => (
                            <motion.div
                              key={`${m.month}-${i}`}
                              initial={{ height: 0 }}
                              animate={{ height: `${(m.count / max) * 100}%` }}
                              transition={{ delay: i * 0.05 }}
                              title={`${m.month}: ${m.count} new users`}
                              className="flex-1 bg-gradient-to-t from-orange-500 to-orange-600 rounded-t-lg opacity-80 hover:opacity-100 transition-opacity min-h-[2px]"
                            />
                          ));
                        })()}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-600">
                        {stats.userGrowth.map((m, i) => <span key={i}>{m.month}</span>)}
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-600 text-sm text-center py-14">{isLoading ? 'Loading...' : 'No signups yet'}</p>
                  )}
                </div>

                <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Database className="w-4 h-4 text-orange-500" /> Content Overview
                  </h3>
                  <div className="space-y-4">
                    {[{
                  label: 'Published Blog Posts',
                  value: stats?.publishedPosts ?? 0,
                  color: 'cyan'
                }, {
                  label: 'Downloadable Resources',
                  value: stats?.totalResources ?? 0,
                  color: 'blue'
                }, {
                  label: 'Active Services',
                  value: stats?.totalServices ?? 0,
                  color: 'purple'
                }, {
                  label: 'Pending Service Requests',
                  value: stats?.pendingServiceRequests ?? 0,
                  color: 'amber'
                }].map(m => <div key={m.label} className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{m.label}</span>
                        <span className={`text-sm font-bold text-${m.color}-400`}>{m.value}</span>
                      </div>)}
                  </div>
                </div>
              </div>

              {/* Recent Certificates + Recent Users */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-orange-500" /> Recently Issued Certificates
                  </h3>
                  {!stats?.recentCertificates?.length ? <p className="text-gray-600 text-sm py-4 text-center">No certificates issued yet</p> : <div className="space-y-2">
                      {stats.recentCertificates.map(c => <div key={c._id} className="flex items-center justify-between py-2.5 border-b border-gray-800/50 last:border-0">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{c.recipientName}</p>
                            <p className="text-xs text-gray-500 truncate">{c.courseTitle}</p>
                          </div>
                          <span className="text-xs text-gray-600 shrink-0 ml-3">{new Date(c.issueDate).toLocaleDateString()}</span>
                        </div>)}
                    </div>}
                </div>

                <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-500" /> Newest Users
                  </h3>
                  {!stats?.recentUsers?.length ? <p className="text-gray-600 text-sm py-4 text-center">No users yet</p> : <div className="space-y-2">
                      {stats.recentUsers.map(u => <div key={u._id} className="flex items-center gap-3 py-2.5 border-b border-gray-800/50 last:border-0">
                          <div className="w-8 h-8 rounded-full bg-orange-500/15 flex items-center justify-center text-sm font-bold text-orange-500 shrink-0">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{u.name}</p>
                            <p className="text-xs text-gray-500 truncate">{u.email}</p>
                          </div>
                          <span className="text-xs text-gray-600 shrink-0">{new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>)}
                    </div>}
                </div>
              </div>

              {/* Recent Contacts */}
              <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-orange-500" /> Recent Contact Submissions
                </h3>
                {contacts.length === 0 ? <p className="text-gray-600 text-sm py-4 text-center">No contacts yet or API not connected</p> : <div className="space-y-2">
                    {contacts.slice(0, 5).map(c => <div key={c._id} className="flex items-center gap-4 py-3 border-b border-gray-800/50 last:border-0">
                        <div className="w-8 h-8 rounded-full bg-orange-600/15 flex items-center justify-center text-sm font-bold text-orange-500">
                          {c.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{c.name}</p>
                          <p className="text-xs text-gray-500">{c.email}</p>
                        </div>
                        <p className="text-xs text-gray-600 truncate max-w-xs">{c.message?.slice(0, 60)}...</p>
                        <span className="text-xs text-gray-600">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>)}
                  </div>}
              </div>
            </motion.div>}

          {/* User Management */}
          {activeTab === 'users' && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search users..." className="w-full bg-[#161616] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors" />
                </div>
                <span className="text-xs text-gray-500 bg-gray-800 px-3 py-2 rounded-xl">{usersTotal} users</span>
              </div>

              <div className="bg-[#161616] border border-gray-800/60 rounded-2xl overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-gray-800/60">
                      {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => <th key={h} className="text-left text-xs font-medium text-gray-500 px-5 py-3 uppercase tracking-wider">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? <tr>
                        <td colSpan={6} className="text-center py-12 text-gray-600 text-sm">
                          {isLoading ? 'Loading...' : 'No users found.'}
                        </td>
                      </tr> : filteredUsers.map((u, i) => <motion.tr key={u._id} initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  delay: i * 0.05
                }} className="border-b border-gray-800/30 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-xs font-bold">
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-400">{u.email}</td>
                        <td className="px-5 py-3">
                          <select value={u.role} onChange={e => changeUserRole(u._id, e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-orange-500">
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-5 py-3">
                          <button onClick={() => toggleUserStatus(u._id, u.isActive)} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all ${u.isActive ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}>
                            {u.isActive ? <><CheckCircle className="w-3 h-3" /> Active</> : <><XCircle className="w-3 h-3" /> Inactive</>}
                          </button>
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setViewUserId(u._id)} className="p-1.5 text-gray-500 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-all">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteUser(u._id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>)}
                  </tbody>
                </table>
              </div>

              {usersPages > 1 && (
                <div className="flex justify-center gap-2 pt-2">
                  {Array.from({ length: usersPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => fetchUsers(p, searchQuery)}
                      className={`w-8 h-8 rounded-lg text-sm ${p === usersPage ? 'bg-orange-500 text-white font-semibold' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>}

          {/* Contacts */}
          {activeTab === 'contacts' && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-semibold text-white">All Contact Submissions</h2>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input value={contactSearch} onChange={e => setContactSearch(e.target.value)} placeholder="Search contacts..." className="w-full bg-[#161616] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors" />
                </div>
              </div>
              <div className="bg-[#161616] border border-gray-800/60 rounded-2xl overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-gray-800/60">
                      {['Name', 'Email', 'Subject', 'Message', 'Date'].map(h => <th key={h} className="text-left text-xs font-medium text-gray-500 px-5 py-3 uppercase tracking-wider">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.length === 0 ? <tr><td colSpan={5} className="text-center py-12 text-gray-600 text-sm">No contact submissions yet</td></tr> : contacts.map((c, i) => <tr key={c._id} className="border-b border-gray-800/30 last:border-0 hover:bg-white/[0.02]">
                        <td className="px-5 py-3 text-sm font-medium text-white">{c.name}</td>
                        <td className="px-5 py-3 text-sm text-gray-400">{c.email}</td>
                        <td className="px-5 py-3 text-sm text-gray-300">{c.subject || '—'}</td>
                        <td className="px-5 py-3 text-xs text-gray-500 max-w-xs truncate">{c.message}</td>
                        <td className="px-5 py-3 text-xs text-gray-600">{new Date(c.createdAt).toLocaleDateString()}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div>

              {contactsPages > 1 && (
                <div className="flex justify-center gap-2 pt-2">
                  {Array.from({ length: contactsPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => fetchContacts(p, contactSearch)}
                      className={`w-8 h-8 rounded-lg text-sm ${p === contactsPage ? 'bg-orange-500 text-white font-semibold' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>}

          {/* Security Logs */}
          {activeTab === 'security' && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }}>
              <ActivityFeed />
            </motion.div>}

          {/* Settings */}
          {activeTab === 'settings' && <AdminSettingsPanel />}

          {activeTab === 'courses' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CoursesManager />
            </motion.div>}

          {activeTab === 'exams' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ExamsManager />
            </motion.div>}

          {activeTab === 'internships' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <InternshipsManager />
            </motion.div>}

          {activeTab === 'batches' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <BatchesManager />
            </motion.div>}

          {activeTab === 'gallery' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <GalleryManager />
            </motion.div>}

          {activeTab === 'careers' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CareersManager />
            </motion.div>}

          {activeTab === 'bookings' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <BookingsManager />
            </motion.div>}

          {/* Workshops placeholder */}
          {activeTab === 'workshops' && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }}>
              <WorkshopsManager headers={headers} onIssueCertificate={(data) => {
                setCertPrefill({ userId: data.userId, courseTitle: data.courseTitle, workshopId: data.workshopId });
                setActiveTab('certificates');
              }} />
            </motion.div>}

          {activeTab === 'services' && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }}>
              <ServicesManager headers={headers} />
            </motion.div>}

          {activeTab === 'certificates' && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }}>
              <CertificatesManager headers={headers} users={users} prefill={certPrefill} onPrefillConsumed={() => setCertPrefill(null)} />
            </motion.div>}

          {activeTab === 'resources' && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }}>
              <ResourcesManager headers={headers} />
            </motion.div>}

          {activeTab === 'blog' && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }}>
              <BlogManager headers={headers} />
            </motion.div>}

          {activeTab === 'testimonials' && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }}>
              <TestimonialsManager headers={headers} />
            </motion.div>}

          {activeTab === 'team' && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }}>
              <TeamManager />
            </motion.div>}

          {activeTab === 'partners' && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }}>
              <PartnersManager />
            </motion.div>}

          {activeTab === 'casestudies' && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }}>
              <CaseStudiesManager />
            </motion.div>}

          {activeTab === 'enterprise' && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }}>
              <EnterpriseInquiriesManager />
            </motion.div>}

          {activeTab === 'newsletter' && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }}>
              <NewsletterManager />
            </motion.div>}

          {activeTab === 'checkin' && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }}>
              <CheckInPanel headers={headers} />
            </motion.div>}
        </div>
      </main>

      {viewUserId && <UserDetailModal userId={viewUserId} headers={headers} onClose={() => setViewUserId(null)} />}
    </div>
    </>;
}