import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useSearch } from 'wouter';
import { MailCheck, ArrowRight, Loader2, ChevronLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';

export default function VerifyEmail() {
  const searchStr = useSearch();
  const email = new URLSearchParams(searchStr).get('email') || '';
  const [, navigate] = useLocation();
  const { verifyOtp, resendOtp } = useAuth();

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) navigate('/login');
  }, [email]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[i] = val.slice(-1);
    setDigits(next);
    setError('');
    if (val && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.split('');
    while (next.length < 6) next.push('');
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const submit = async (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length !== 6) { setError('Enter the full 6-digit code'); return; }
    setLoading(true);
    setError('');
    try {
      const user = await verifyOtp(email, otp);
      navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || 'Verification failed. Please try again.');
      if (data?.code === 'OTP_EXPIRED' || data?.code === 'OTP_LOCKED') {
        setDigits(['', '', '', '', '', '']);
      }
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    setResendMsg('');
    try {
      await resendOtp(email);
      setResendMsg('A new code has been sent to your email.');
      setCooldown(45);
      setDigits(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } catch {
      setResendMsg('Could not resend right now — please try again shortly.');
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-[0.08] dark:opacity-[0.12]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?fm=jpg&q=80&w=1600&auto=format&fit=crop')" }} />
      <div className="absolute inset-0 grid-bg opacity-10" />
      <SEO title="Verify Your Email" path="/verify-email" />
      <div className="absolute top-5 left-6">
        <Link href="/login" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-orange-500 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </div>
      <div className="absolute top-5 right-6"><ThemeToggle /></div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <Logo size={40} />
          <div className="text-left">
            <p className="font-bold text-sm leading-none">JASKRON</p>
            <p className="text-[10px] text-orange-500 uppercase tracking-widest">Secure Ops</p>
          </div>
        </div>

        <MailCheck className="w-10 h-10 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-1">Verify your email</h2>
        <p className="text-muted-foreground text-sm mb-8">
          We sent a 6-digit code to <strong className="text-foreground">{email}</strong>. Enter it below to activate your account.
        </p>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-xl px-4 py-3 mb-4 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-6">
          <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                inputMode="numeric"
                maxLength={1}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold bg-muted/50 border border-border rounded-xl focus:outline-none focus:border-orange-500 focus:bg-background transition-all"
              />
            ))}
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/25 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify & continue <ArrowRight className="w-4 h-4" /></>}
          </motion.button>
        </form>

        <div className="mt-6 text-sm text-muted-foreground">
          Didn't get a code?{' '}
          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="text-orange-500 hover:text-orange-500 font-medium inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          </button>
        </div>
        {resendMsg && <p className="text-xs text-muted-foreground mt-2">{resendMsg}</p>}
      </motion.div>
    </div>
  );
}
