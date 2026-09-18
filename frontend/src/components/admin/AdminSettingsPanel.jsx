import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Bell, Server, Save, Eye, EyeOff, CheckCircle, AlertCircle, Mail, CreditCard, Sparkles, User as UserIcon, ShieldAlert, Monitor, Smartphone, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/services/authService';
import { adminApi } from '@/services/adminService';
import { sessionApi } from '@/services/sessionService';
import apiClient from '@/services/api';

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm text-white font-medium">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full transition-colors relative shrink-0 overflow-hidden ${checked ? 'bg-orange-500' : 'bg-gray-700'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function StatusPill({ ok, trueLabel, falseLabel }) {
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ok ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
      {ok ? trueLabel : falseLabel}
    </span>
  );
}

export default function AdminSettingsPanel() {
  const { user, updateUser } = useAuth();

  // Profile
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', organization: user?.organization || '', bio: user?.bio || '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Notification preferences (admin alerts)
  const [prefs, setPrefs] = useState(user?.preferences || { emailNotifications: true, marketingEmails: false });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  // Change password
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwStatus, setPwStatus] = useState(null);
  const [pwSaving, setPwSaving] = useState(false);

  // Real system info
  const [sysInfo, setSysInfo] = useState(null);

  // Active sessions — extra important for admin accounts (high-value target)
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  useEffect(() => {
    sessionApi.getAll().then(setSessions).catch(() => setSessions([])).finally(() => setSessionsLoading(false));
  }, []);

  const revokeSession = async (id) => {
    await sessionApi.revoke(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleLogoutAll = async () => {
    if (!confirm('This will sign you out everywhere, including this device. Continue?')) return;
    setLoggingOutAll(true);
    await sessionApi.logoutAll();
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  useEffect(() => {
    adminApi.getSystemInfo().then(setSysInfo).catch(() => setSysInfo(null));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await apiClient.put('/api/users/me', profile);
      updateUser(data);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save profile');
    }
    setSavingProfile(false);
  };

  const savePrefs = async () => {
    setSavingPrefs(true);
    try {
      await authApi.updatePreferences(prefs);
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save preferences');
    }
    setSavingPrefs(false);
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwStatus(null);
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwStatus({ type: 'error', message: 'New password must be at least 8 characters' });
      return;
    }
    setPwSaving(true);
    try {
      await authApi.changePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwStatus({ type: 'success', message: 'Password updated successfully' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update password' });
    }
    setPwSaving(false);
  };

  const uptimeLabel = (secs) => {
    if (!secs && secs !== 0) return '—';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl space-y-6">
      <h2 className="text-lg font-semibold text-white">Admin Settings</h2>

      {/* Admin profile */}
      <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-6">
        <h3 className="font-medium text-white mb-1 flex items-center gap-2"><UserIcon className="w-4 h-4 text-orange-500" /> Admin Profile</h3>
        <p className="text-xs text-gray-500 mb-4">Your account details, shown as the "Authorized Signature" on issued certificates</p>
        <form onSubmit={saveProfile} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Name</label>
              <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email (read-only)</label>
              <input value={user?.email || ''} disabled className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Phone</label>
              <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Organization</label>
              <input value={profile.organization} onChange={(e) => setProfile({ ...profile, organization: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white" />
            </div>
          </div>
          <button type="submit" disabled={savingProfile} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
            {profileSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {profileSaved ? 'Saved' : savingProfile ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </div>

      {/* Admin alert preferences */}
      <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-6">
        <h3 className="font-medium text-white mb-1 flex items-center gap-2"><Bell className="w-4 h-4 text-orange-500" /> Admin Alerts</h3>
        <p className="text-xs text-gray-500 mb-2">Control which emails you receive as an administrator</p>
        <div className="divide-y divide-gray-800">
          <Toggle checked={prefs.emailNotifications} onChange={(v) => setPrefs({ ...prefs, emailNotifications: v })} label="Email me on new contact form submissions" description="Sent whenever a visitor submits the contact form" />
          <Toggle checked={prefs.marketingEmails} onChange={(v) => setPrefs({ ...prefs, marketingEmails: v })} label="Product & platform updates" />
        </div>
        <button onClick={savePrefs} disabled={savingPrefs} className="mt-4 flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
          {prefsSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {prefsSaved ? 'Saved' : savingPrefs ? 'Saving...' : 'Save preferences'}
        </button>
      </div>

      {/* Change password */}
      <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-6">
        <h3 className="font-medium text-white mb-1 flex items-center gap-2"><Lock className="w-4 h-4 text-orange-500" /> Change Password</h3>
        <p className="text-xs text-gray-500 mb-4">Admin accounts are a high-value target — use a strong, unique password</p>
        <form onSubmit={changePassword} className="space-y-3">
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="Current password"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50"
          />
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="New password (min. 8 characters)"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
            required
            minLength={8}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50"
          />
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {pwStatus && (
            <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl ${pwStatus.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {pwStatus.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {pwStatus.message}
            </div>
          )}
          <button type="submit" disabled={pwSaving} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" /> {pwSaving ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>

      {/* Real system status */}
      <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-6">
        <h3 className="font-medium text-white mb-1 flex items-center gap-2"><Server className="w-4 h-4 text-orange-500" /> System Status</h3>
        <p className="text-xs text-gray-500 mb-4">Live values read directly from the running server — not a demo</p>
        {!sysInfo ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-800/40">
              <span className="text-sm text-gray-400">Environment</span>
              <span className="text-sm text-white font-medium capitalize">{sysInfo.environment}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-800/40">
              <span className="text-sm text-gray-400">Database</span>
              <StatusPill ok={sysInfo.dbStatus === 'connected'} trueLabel="Connected" falseLabel={sysInfo.dbStatus} />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-800/40">
              <span className="text-sm text-gray-400">Server uptime</span>
              <span className="text-sm text-white font-medium">{uptimeLabel(sysInfo.serverUptimeSeconds)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-800/40">
              <span className="text-sm text-gray-400">Node version</span>
              <span className="text-sm text-white font-medium">{sysInfo.nodeVersion}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-800/40">
              <span className="text-sm text-gray-400">Access token TTL</span>
              <span className="text-sm text-white font-medium">{sysInfo.accessTokenTtl}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-800/40">
              <span className="text-sm text-gray-400">Refresh token TTL</span>
              <span className="text-sm text-white font-medium">{sysInfo.refreshTokenTtl}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-800/40">
              <span className="text-sm text-gray-400 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email (Gmail)</span>
              <StatusPill ok={sysInfo.emailConfigured} trueLabel="Configured" falseLabel="Not set" />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-800/40">
              <span className="text-sm text-gray-400 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Razorpay payments</span>
              <StatusPill ok={sysInfo.paymentsConfigured} trueLabel="Configured" falseLabel="Not set" />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-800/40">
              <span className="text-sm text-gray-400 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> AI workshop advisor</span>
              <StatusPill ok={sysInfo.aiAdvisorConfigured} trueLabel="Configured" falseLabel="Keyword fallback" />
            </div>
          </div>
        )}
      </div>

      {/* Active sessions — since admin accounts require 2FA, this is the backstop
          if a device is ever lost or a session looks unfamiliar */}
      <div className="bg-[#161616] border border-gray-800/60 rounded-2xl p-6">
        <h3 className="font-medium text-white mb-1 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-orange-500" /> Active Sessions</h3>
        <p className="text-xs text-gray-500 mb-4">Devices currently signed in — admin sessions are worth reviewing regularly</p>
        {sessionsLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-gray-500">No active sessions found.</p>
        ) : (
          <div className="divide-y divide-gray-800">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                    {/mobile|android|iphone/i.test(s.userAgent) ? <Smartphone className="w-4 h-4 text-orange-500" /> : <Monitor className="w-4 h-4 text-orange-500" />}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium truncate max-w-[220px] sm:max-w-xs">{s.userAgent}{s.isCurrent && <span className="ml-2 text-[10px] text-green-400 font-semibold">THIS DEVICE</span>}</p>
                    <p className="text-xs text-gray-500">Last used {new Date(s.lastUsedAt).toLocaleString()}</p>
                  </div>
                </div>
                {!s.isCurrent && (
                  <button onClick={() => revokeSession(s.id)} className="text-xs text-red-400 hover:text-red-300 font-medium shrink-0">Revoke</button>
                )}
              </div>
            ))}
          </div>
        )}
        <button onClick={handleLogoutAll} disabled={loggingOutAll} className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
          <LogOut className="w-4 h-4" /> {loggingOutAll ? 'Logging out...' : 'Log out of all devices'}
        </button>
      </div>
    </motion.div>
  );
}
