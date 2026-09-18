import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, ShieldCheck, Award, Send, CheckCircle2, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import SEO from '@/components/SEO';
import { enterpriseApi } from '@/services/enterpriseService';

const PERKS = [
  { icon: Users, title: 'Bulk seats', desc: 'Register your whole team in one booking — no separate accounts needed for every employee.' },
  { icon: ShieldCheck, title: 'Custom curriculum', desc: "We tailor the curriculum to your stack, your data, and the skills your teams actually need." },
  { icon: Award, title: 'Co-branded certificates', desc: 'Certificates can carry your company name alongside ours for internal compliance records.' },
  { icon: Building2, title: 'On-site or remote', desc: 'Training delivered at your office or fully remote — whichever fits your team.' }
];

export default function EnterprisePage() {
  const [form, setForm] = useState({ companyName: '', contactName: '', email: '', phone: '', teamSize: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await enterpriseApi.submitInquiry(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong — please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Enterprise Training" description="Custom training programmes, campus bootcamps, and batch placements for teams and institutions." path="/enterprise" />
      <Navigation />
      <PageHero eyebrow="For Organizations" title="Corporate &" highlight="Institutional" description="Custom programmes for teams and colleges — bulk seats, tailored curriculum, and co-branded certificates."
        image="https://images.unsplash.com/photo-1758873268745-dd2cf0d677b5?fm=jpg&q=80&w=2000&auto=format&fit=crop" />

      <section className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-6">
        {PERKS.map((p, i) => (
          <motion.div key={p.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="bg-muted/30 border border-border rounded-2xl p-6 flex gap-4">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <p.icon className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-1">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="max-w-2xl mx-auto px-6 pb-20">
        <div className="bg-muted/30 border border-border rounded-2xl p-8">
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Thanks — we'll be in touch</h3>
              <p className="text-muted-foreground text-sm">Our team typically responds to enterprise inquiries within one business day.</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-1">Tell us about your team</h2>
              <p className="text-sm text-muted-foreground mb-6">We'll follow up with a custom quote and available dates.</p>

              {error && <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="Company name" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
                  <input required value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="Your name" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Work email" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone (optional)" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
                </div>
                <select value={form.teamSize} onChange={(e) => setForm({ ...form, teamSize: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500">
                  <option value="">Team size (optional)</option>
                  <option value="1-10">1–10</option>
                  <option value="11-50">11–50</option>
                  <option value="51-200">51–200</option>
                  <option value="200+">200+</option>
                </select>
                <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} placeholder="What are you looking to train your team on?" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
                <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-60">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Request a quote <Send className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
