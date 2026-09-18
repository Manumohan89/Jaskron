import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase, MapPin, Clock, Loader2, ArrowRight, X, Heart, Rocket, GraduationCap, Users
} from 'lucide-react';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import PageHero from '@/components/PageHero';
import TrustBadges from '@/components/TrustBadges';
import { careerApi } from '@/services/siteService';
import { COMPANY } from '@/config/company';

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-orange-500';

const PERKS = [
  { icon: Rocket, title: 'Real ownership', body: 'Small team, wide scope — you own outcomes, not tickets.' },
  { icon: GraduationCap, title: 'Teach and learn', body: 'Everyone here mentors. It sharpens your own craft.' },
  { icon: Users, title: 'Direct impact', body: 'Your work reaches thousands of learners every cohort.' },
  { icon: Heart, title: 'Flexible working', body: 'Hybrid by default, with sensible hours and real leave.' }
];

function ApplyModal({ job, onClose }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', resumeUrl: '', portfolioUrl: '', experience: '', coverNote: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await careerApi.apply(job._id, form);
      toast.success('Application received — we will be in touch.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit your application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <form onSubmit={submit} className="w-full max-w-lg my-8 rounded-2xl bg-card border border-border p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Apply — {job.title}</h3>
            <p className="text-sm text-muted-foreground">{job.location} · {job.employmentType}</p>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <input required className={inputClass} placeholder="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required type="email" className={inputClass} placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className={inputClass} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className={inputClass} placeholder="Years of experience" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
        </div>
        <input className={inputClass} placeholder="Resume link (Drive / LinkedIn)" value={form.resumeUrl} onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })} />
        <input className={inputClass} placeholder="Portfolio / GitHub" value={form.portfolioUrl} onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })} />
        <textarea rows={4} className={inputClass} placeholder="Anything you'd like us to know" value={form.coverNote} onChange={(e) => setForm({ ...form, coverNote: e.target.value })} />

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CareersPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    careerApi
      .getAll()
      .then((d) => setJobs(Array.isArray(d) ? d : []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Careers"
        description={`Open roles at ${COMPANY.legalName} — engineering, training, and operations in Bengaluru.`}
        path="/careers"
      />
      <Navigation />
      <PageHero
        eyebrow="Join Us"
        title="Build careers,"
        highlight="including yours"
        description="We're a small team teaching and building at the same time. If that sounds like your kind of work, come talk to us."
        image="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?fm=jpg&q=80&w=2000&auto=format&fit=crop"
      />

      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {PERKS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-border p-5 bg-card"
            >
              <p.icon className="w-6 h-6 text-orange-500 mb-3" />
              <h3 className="font-semibold text-sm mb-1">{p.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-6">Open positions</h2>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold mb-1">No open roles right now</h3>
            <p className="text-muted-foreground text-sm mb-5">
              We still like meeting good people. Send us your profile and we'll reach out when something opens.
            </p>
            <a href={`mailto:${COMPANY.email}?subject=Open application`} className="btn-neon inline-block">
              Send an open application
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => {
              const open = expanded === job._id;
              return (
                <div key={job._id} className="rounded-2xl border border-border overflow-hidden">
                  <button
                    onClick={() => setExpanded(open ? null : job._id)}
                    className="w-full text-left p-5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1.5">
                          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.department}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                          <span className="flex items-center gap-1 capitalize"><Clock className="w-3 h-3" /> {job.employmentType}</span>
                          {job.experience && <span>{job.experience}</span>}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-orange-500 shrink-0">
                        {open ? 'Hide' : 'View role'}
                      </span>
                    </div>
                    {job.summary && !open && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{job.summary}</p>
                    )}
                  </button>

                  {open && (
                    <div className="px-5 pb-5 space-y-5 border-t border-border pt-5">
                      <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                        {job.description}
                      </p>

                      {job.responsibilities?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">What you'll do</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        </div>
                      )}

                      {job.requirements?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">What we're looking for</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        </div>
                      )}

                      {job.niceToHave?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Nice to have</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {job.niceToHave.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        </div>
                      )}

                      <button
                        onClick={() => setApplying(job)}
                        className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
                      >
                        Apply for this role <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <TrustBadges />
      {applying && <ApplyModal job={applying} onClose={() => setApplying(null)} />}
      <Footer />
    </div>
  );
}
