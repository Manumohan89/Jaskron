import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Link } from 'wouter';

const STORAGE_KEY = 'jaskron-cookie-consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, at: Date.now() }));
    setVisible(false);
  };

  const decline = () => {
    // We still record the choice (so we don't ask again), but note only
    // strictly-necessary cookies (login session) are used regardless — this
    // site doesn't currently run third-party tracking/ad cookies.
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: false, at: Date.now() }));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 bg-card border border-border rounded-2xl shadow-2xl p-5"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <Cookie className="w-4 h-4 text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground mb-1">We use minimal cookies</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Only what's needed to keep you signed in and remember your preferences (theme, language).
                No third-party ad or tracking cookies. See our{' '}
                <Link href="/" className="text-orange-500 hover:underline">Privacy Policy</Link> for details.
              </p>
              <div className="flex gap-2 mt-3">
                <button onClick={accept} className="flex-1 bg-orange-500 hover:bg-orange-500 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                  Accept
                </button>
                <button onClick={decline} className="flex-1 bg-muted hover:bg-muted/70 text-foreground text-xs font-medium py-2 rounded-lg transition-colors border border-border">
                  Decline
                </button>
              </div>
            </div>
            <button onClick={decline} className="text-muted-foreground hover:text-foreground shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
