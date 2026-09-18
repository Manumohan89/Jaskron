import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { Home, ArrowLeft, ShieldAlert } from 'lucide-react';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground relative overflow-hidden p-4">
      <SEO title="Page Not Found" path="/404" />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.08] dark:opacity-[0.12]"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?fm=jpg&q=80&w=1600&auto=format&fit=crop')" }}
      />
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-md w-full text-center"
      >
        <Link href="/" className="inline-flex items-center gap-2.5 mb-8">
          <Logo size={36} />
          <div className="text-left">
            <p className="font-bold text-sm leading-none">JASKRON</p>
            <p className="text-[10px] text-orange-500 uppercase tracking-widest">Secure Ops</p>
          </div>
        </Link>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6"
        >
          <ShieldAlert className="w-8 h-8 text-orange-500" />
        </motion.div>

        <h1 className="text-6xl font-extrabold mb-2 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">404</h1>
        <h2 className="text-xl font-semibold mb-3">This page doesn't exist</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          The page you're looking for may have been moved, renamed, or never existed. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setLocation('/')}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20"
          >
            <Home className="w-4 h-4" /> Go Home
          </button>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 bg-muted/50 hover:bg-muted border border-border text-foreground font-medium px-6 py-3 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
