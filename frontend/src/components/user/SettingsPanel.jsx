import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Bell, Globe, Save, Eye, EyeOff, CheckCircle, AlertCircle, Sun, Moon, Palette, Monitor, Smartphone, ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { authApi } from '@/services/authService';
import { sessionApi } from '@/services/sessionService';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' }
];

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

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h3 className="font-semibold text-white mb-1 flex items-center gap-2"><Icon className="w-4 h-4 text-orange-500" /> {title}</h3>
      {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
      {children}
    </div>
  );
}

export default function SettingsPanel() {
  const { user } = useAuth();
  const { theme, toggleTheme, switchable } = useTheme();
  const [prefs, setPrefs] = useState(user?.preferences || {
    emailNotifications: true, workshopReminders: true, marketingEmails: false, theme: 'system', language: 'en'
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwStatus, setPwStatus] = useState(null);
  const [pwSaving, setPwSaving] = useState(false);

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
    if (!confirm("This will sign you out everywhere, including this device. Continue?")) return;
    setLoggingOutAll(true);
    await sessionApi.logoutAll();
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage how JASKRON Technologies Pvt. Ltd. looks, notifies you, and keeps your account secure.</p>
      </div>

      {/* Appearance */}
      {switchable && (
        <SectionCard icon={Palette} title="Appearance" description="Choose how the interface looks">
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-orange-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
              </div>
              <div>
                <p className="text-sm text-white font-medium capitalize">{theme} mode</p>
                <p className="text-xs text-gray-500">Applies across the whole site</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm font-medium text-white transition-colors"
            >
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </SectionCard>
      )}

      {/* Notification preferences */}
      <SectionCard icon={Bell} title="Notification Preferences" description="Control which emails and alerts you receive">
        <div className="divide-y divide-gray-800">
          <Toggle checked={prefs.emailNotifications} onChange={(v) => setPrefs({ ...prefs, emailNotifications: v })} label="Email notifications" description="Certificate issued, contact replies, etc." />
          <Toggle checked={prefs.workshopReminders} onChange={(v) => setPrefs({ ...prefs, workshopReminders: v })} label="Workshop reminders" description="Get reminded before workshops you've registered for" />
          <Toggle checked={prefs.marketingEmails} onChange={(v) => setPrefs({ ...prefs, marketingEmails: v })} label="Marketing emails" description="News, new workshops, and offers" />
        </div>
        <button onClick={savePrefs} disabled={savingPrefs} className="mt-4 flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
          {prefsSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {prefsSaved ? 'Saved' : savingPrefs ? 'Saving...' : 'Save preferences'}
        </button>
      </SectionCard>

      {/* Language */}
      <SectionCard icon={Globe} title="Language" description="Choose your preferred language for the interface">
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setPrefs({ ...prefs, language: l.code })}
              className={`px-4 py-2 rounded-xl text-sm border transition-colors ${prefs.language === l.code ? 'bg-orange-500/15 border-orange-500/40 text-orange-500' : 'border-gray-800 text-gray-400 hover:border-gray-700'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
        {prefs.language !== (user?.preferences?.language || 'en') && (
          <button onClick={savePrefs} disabled={savingPrefs} className="mt-4 flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" /> {savingPrefs ? 'Saving...' : 'Save language'}
          </button>
        )}
      </SectionCard>

      {/* Change password */}
      <SectionCard icon={Lock} title="Change Password" description="Use a strong password you don't use elsewhere">
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
      </SectionCard>

      {/* Sessions / devices */}
      <SectionCard icon={ShieldAlert} title="Active Sessions" description="Devices currently signed in to your account">
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
                  <button onClick={() => revokeSession(s.id)} className="text-xs text-red-400 hover:text-red-300 font-medium shrink-0">
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        <button onClick={handleLogoutAll} disabled={loggingOutAll} className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
          <LogOut className="w-4 h-4" /> {loggingOutAll ? 'Logging out...' : 'Log out of all devices'}
        </button>
      </SectionCard>
    </motion.div>
  );
}
