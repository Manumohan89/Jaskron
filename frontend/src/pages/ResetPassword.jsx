import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useLocation } from 'wouter';
import { Lock, Eye, EyeOff, ArrowRight, Loader2, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { authApi } from '@/services/authService';
import ThemeToggle from '@/components/ThemeToggle';
import SEO from '@/components/SEO';
import Logo from '@/components/Logo';

export default function ResetPassword() {
  const { token } = useParams();
  const [, navigate] = useLocation();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset link is invalid or has expired');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-[0.08] dark:opacity-[0.12]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1608452964553-9b4d97b2752f?fm=jpg&q=80&w=1600&auto=format&fit=crop')" }} />
      <div className="absolute inset-0 grid-bg opacity-10" />
      <SEO title="Reset Password" path="/reset-password" />
      <div className="absolute top-5 left-6">
        <Link href="/login" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-orange-500 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </div>
      <div className="absolute top-5 right-6"><ThemeToggle /></div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <Logo size={40} />
          <div>
            <p className="font-bold text-sm leading-none">JASKRON</p>
            <p className="text-[10px] text-orange-500 uppercase tracking-widest">Jaskron Technologies PVT LTD</p>
          </div>
        </div>

        {success ? (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-muted/40 border border-border rounded-2xl p-8">
            <CheckCircle2 className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Password updated!</h2>
            <p className="text-muted-foreground text-sm">Redirecting you to sign in...</p>
          </motion.div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-1 text-center">Set a new password</h2>
            <p className="text-muted-foreground text-sm mb-6 text-center">Choose a strong password you haven't used before.</p>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-xl px-4 py-3 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="New password (min. 8 characters)"
                  className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-orange-500 focus:bg-background transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <input
                type={showPw ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Confirm new password"
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-orange-500 focus:bg-background transition-all"
              />
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/25 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Reset password <ArrowRight className="w-4 h-4" /></>}
              </motion.button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
