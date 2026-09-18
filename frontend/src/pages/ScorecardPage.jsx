import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2, Lock, CheckCircle2, XCircle, AlertTriangle, Search } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import SEO from '@/components/SEO';
import { scorecardApi } from '@/services/scorecardService';

function scoreColor(score) {
  if (score >= 80) return 'text-green-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

export default function ScorecardPage() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await scorecardApi.scan(domain);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Scan failed — please check the domain and try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Free Security Scorecard" description="Check your website's public-facing security posture — free, instant, no signup." path="/security-scorecard" />
      <Navigation />
      <PageHero eyebrow="Free Tool" title="Security" highlight="Scorecard" description="Enter a domain to check its TLS certificate health and security headers — instantly, for free."
        image="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?fm=jpg&q=80&w=2000&auto=format&fit=crop" />

      <section className="max-w-2xl mx-auto px-6 py-12">
        <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
              placeholder="example.com"
              className="w-full bg-muted/50 border border-border rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
          <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-6 py-3.5 rounded-xl text-sm disabled:opacity-60 shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Scan <ShieldCheck className="w-4 h-4" /></>}
          </button>
        </form>

        {error && (
          <div className="mt-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
            <div className="bg-muted/30 border border-border rounded-2xl p-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">{result.domain}</p>
              <p className={`text-6xl font-extrabold ${scoreColor(result.score)}`}>{result.score}<span className="text-2xl text-muted-foreground">/100</span></p>
            </div>

            <div className="bg-muted/30 border border-border rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-orange-500" /> TLS Certificate</h3>
              {result.tls.ok ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Protocol</span><span className="font-medium">{result.tls.protocol}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Issuer</span><span className="font-medium">{result.tls.issuer}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Expires in</span><span className="font-medium">{result.tls.daysRemaining} days</span></div>
                </div>
              ) : (
                <p className="text-sm text-red-500 flex items-center gap-2"><XCircle className="w-4 h-4" /> Could not establish a secure (HTTPS) connection</p>
              )}
            </div>

            <div className="bg-muted/30 border border-border rounded-2xl p-6">
              <h3 className="font-bold mb-4">Security Headers</h3>
              <div className="space-y-2">
                {result.headers.map((h) => (
                  <div key={h.label} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{h.label}</span>
                    {h.present ? (
                      <span className="flex items-center gap-1 text-green-500 font-medium"><CheckCircle2 className="w-4 h-4" /> Present</span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 font-medium"><XCircle className="w-4 h-4" /> Missing</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">{result.breachCheckNote}</p>
          </motion.div>
        )}
      </section>

      <Footer />
    </div>
  );
}
