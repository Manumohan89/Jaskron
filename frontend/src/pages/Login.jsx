import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/Logo';

const FEATURES = [
  'Enroll in self-paced courses and live cohorts',
  'Download verified completion certificates',
  'Take exams with the code from your instructor',
  'Track your learning progress over time'
];

const inputClass =
  'w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-orange-500 focus:bg-background transition-all pr-10';

export default function Login() {
  const [tab, setTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', organization: '', agreeTerms: false });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();
  const [, navigate] = useLocation();

  const field = (key) => ({
    value: form[key],
    onChange: (e) => { setForm({ ...form, [key]: e.target.value }); setError(''); }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      if (tab === 'login') {
        const result = await login(form.email, form.password);
        if (result?.role === 'admin') navigate('/admin');
        else navigate('/dashboard');
        setIsSubmitting(false);
        return;
      }

      // Registration
      if (!form.name.trim()) { setError('Name is required'); setIsSubmitting(false); return; }
      if (form.password.length < 8) { setError('Password must be at least 8 characters'); setIsSubmitting(false); return; }
      if (form.password !== form.confirmPassword) { setError('Passwords do not match'); setIsSubmitting(false); return; }
      if (!form.agreeTerms) { setError('Please agree to the Terms & Privacy Policy to continue'); setIsSubmitting(false); return; }

      const registeredUser = await register(form.name, form.email, form.password, { phone: form.phone, organization: form.organization });
      if (registeredUser?.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || data?.error || 'Something went wrong');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden">

      {/* ── LEFT PANEL (branding) ── */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex flex-col w-[55%] relative overflow-hidden bg-gradient-to-br from-[#020b14] via-[#061222] to-[#020b14]"
      >
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1629904853716-f0bc54eea481?fm=jpg&q=80&w=1600&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#020b14]/95 via-[#061222]/90 to-[#020b14]/95" />
        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(rgba(242,114,31,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(242,114,31,0.18) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />
        {/* Glow orbs */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl"
        />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-auto">
            <Logo size={40} />
            <div>
              <p className="font-bold text-white text-sm leading-none">JASKRON</p>
              <p className="text-[10px] text-orange-500 uppercase tracking-widest">Jaskron Technologies PVT LTD</p>
            </div>
          </Link>

          {/* Main copy */}
          <div className="my-auto">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 rounded-full px-4 py-1.5 text-xs font-medium text-orange-500 uppercase tracking-wide mb-6">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                Learn · Build · Innovate
              </span>
              <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
                Build skills that <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                  future today
                </span>
              </h1>
              <p className="text-slate-400 text-base mb-8 max-w-md leading-relaxed">
                Join thousands of learners building real-world skills in full-stack development, data analytics, AI/ML, and cybersecurity — with recorded courses, mentor-led internships, and verified certificates.
              </p>
            </motion.div>

            {/* Feature list */}
            <motion.ul
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="space-y-3"
            >
              {FEATURES.map((f, i) => (
                <motion.li
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3 text-slate-300 text-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
                  {f}
                </motion.li>
              ))}
            </motion.ul>
          </div>

          {/* Bottom badges */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-auto flex items-center gap-4 text-xs text-slate-500"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              500+ professionals trained
            </div>
            <div className="w-px h-3 bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
              Certificates with QR verification
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── RIGHT PANEL (form) ── */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex-1 flex flex-col"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-orange-500 transition-colors lg:hidden">
            <ChevronLeft className="w-4 h-4" /> Home
          </Link>
          <div className="lg:hidden flex items-center gap-2 ml-auto">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold">JASKRON</span>
          </div>
          <div className="hidden lg:block ml-auto">
          </div>
          <ThemeToggle className="ml-3" />
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="w-full max-w-md"
          >
            {/* Tab switcher */}
            <div className="flex bg-muted rounded-xl p-1 mb-8">
              {['login', 'register'].map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize ${
                    tab === t
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-1">
                    {tab === 'login' ? 'Welcome back' : 'Join JASKRON'}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {tab === 'login'
                      ? 'Sign in to access your dashboard and certificates.'
                      : 'Create your account to start your security journey.'}
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-xl px-4 py-3 mb-4"
                  >
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {tab === 'register' && (
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        {...field('name')}
                        required
                        placeholder="Full Name"
                        className={inputClass + ' !pl-10'}
                      />
                    </div>
                  )}

                  {tab === 'register' && (
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        {...field('phone')}
                        type="tel"
                        placeholder="Phone (optional)"
                        className={inputClass.replace(' pr-10', '')}
                      />
                      <input
                        {...field('organization')}
                        placeholder="Organization (optional)"
                        className={inputClass.replace(' pr-10', '')}
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      {...field('email')}
                      type="email"
                      required
                      placeholder="Email address"
                      className={inputClass + ' !pl-10'}
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      {...field('password')}
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="Password"
                      className={inputClass + ' !pl-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {tab === 'register' && (
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        {...field('confirmPassword')}
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Confirm Password"
                        className={inputClass + ' !pl-10'}
                      />
                    </div>
                  )}

                  {tab === 'login' && (
                    <div className="text-right -mt-1">
                      <Link href="/forgot-password" className="text-xs text-orange-500 hover:text-orange-500 font-medium">
                        Forgot password?
                      </Link>
                    </div>
                  )}

                  {tab === 'register' && form.password.length > 0 && (
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: form.password.length >= 10 ? '100%' : form.password.length >= 7 ? '66%' : '33%' }}
                        className={`h-full rounded-full transition-colors ${
                          form.password.length >= 10 ? 'bg-emerald-500' : form.password.length >= 7 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                  )}

                  {tab === 'register' && (
                    <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.agreeTerms}
                        onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })}
                        className="mt-0.5 accent-orange-500"
                      />
                      <span>
                        I agree to the <Link href="/" className="text-orange-500 hover:underline">Terms</Link> and{' '}
                        <Link href="/" className="text-orange-500 hover:underline">Privacy Policy</Link>, and consent to receive an email verification code.
                      </span>
                    </label>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/25 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {tab === 'login' ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }}
                    className="text-orange-500 hover:text-orange-500 font-medium transition-colors"
                  >
                    {tab === 'login' ? 'Create one' : 'Sign in'}
                  </button>
                </p>
              </motion.div>
            </AnimatePresence>

            {tab === 'login' && (
              <p className="text-center text-xs text-muted-foreground mt-8">
                By continuing you agree to JASKRON's{' '}
                <Link href="/" className="text-orange-500 hover:underline">Terms</Link> &{' '}
                <Link href="/" className="text-orange-500 hover:underline">Privacy Policy</Link>
              </p>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
