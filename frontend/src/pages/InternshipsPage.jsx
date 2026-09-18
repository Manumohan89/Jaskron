import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  Clock, Layers, Cpu, Microscope, CheckCircle2, ArrowRight, Users, Award,
  Video, ClipboardCheck, IndianRupee, Search
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import PageHero from '@/components/PageHero';
import TrustBadges from '@/components/TrustBadges';
import { internshipApi } from '@/services/internshipService';
import { INTERNSHIP_TRACKS, DOMAINS } from '@/config/company';

const TRACK_ICON = {
  'short-term': Clock,
  'long-term': Layers,
  'project-based': Cpu,
  research: Microscope
};

const INCLUDED = [
  { icon: Video, title: 'Live + recorded training', body: 'Scheduled live classes with recordings you keep.' },
  { icon: Users, title: 'Mentor reviews', body: 'Weekly feedback on your work from a practitioner.' },
  { icon: ClipboardCheck, title: 'Final assessment', body: 'Unlocked once your batch completes the training.' },
  { icon: Award, title: 'Graded certificate', body: 'Issued on performance — Pass, Merit, or Distinction.' }
];

function feeOf(i) {
  return i.discountFee > 0 ? i.discountFee : i.fee;
}

function InternshipCard({ item, index }) {
  const Icon = TRACK_ICON[item.track] || Clock;
  const fee = feeOf(item);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.06, 0.3) }}
    >
      <Link href={`/internships/${item.slug}`} className="group block h-full">
        <div className="h-full rounded-2xl border border-border bg-card overflow-hidden hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all flex flex-col">
          <div className="relative h-40 overflow-hidden">
            <img
              src={item.thumbnail || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?fm=jpg&q=80&w=800&auto=format&fit=crop'}
              alt={item.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider bg-orange-500 text-white px-2 py-1 rounded-md">
              <Icon className="w-3 h-3" /> {item.durationLabel}
            </span>
            <span className="absolute top-3 right-3 text-xs font-bold bg-background/90 text-foreground px-2.5 py-1 rounded-md">
              {fee > 0 ? `₹${fee.toLocaleString('en-IN')}` : 'Sponsored'}
            </span>
          </div>

          <div className="p-5 flex flex-col flex-1">
            <h3 className="font-bold text-base mb-1.5 group-hover:text-orange-500 transition-colors line-clamp-2">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {item.subtitle || item.description}
            </p>

            <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
              <span className="text-[11px] text-muted-foreground capitalize">
                {item.mode} · {String(item.track).replace('-', ' ')}
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-orange-500 group-hover:gap-2 transition-all">
                Details <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function InternshipsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState('all');
  const [domain, setDomain] = useState('all');
  const [q, setQ] = useState('');

  useEffect(() => {
    internshipApi
      .getAll()
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((i) => {
      if (track !== 'all' && i.track !== track) return false;
      if (domain !== 'all' && i.domain !== domain) return false;
      if (needle && !`${i.title} ${i.subtitle || ''}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [items, track, domain, q]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Paid Internship Programs"
        description="Paid, mentor-led internships in software, AI/ML, data analytics, and cybersecurity — training, live classes, assessment, and a performance-graded certificate."
        path="/internships"
      />
      <Navigation />
      <PageHero
        eyebrow="Service 02 · Paid Programmes"
        title="Internship"
        highlight="Programs"
        description="Enrol, pay one programme fee, and get structured training, live mentorship, a real project, an assessment, and a verifiable certificate."
        image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?fm=jpg&q=80&w=2000&auto=format&fit=crop"
      />

      {/* What the fee covers */}
      <section className="container mx-auto px-4 py-14 max-w-6xl">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-orange-500/10 to-transparent p-7 md:p-10 mb-14">
          <div className="flex items-start gap-3 mb-6">
            <IndianRupee className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-bold mb-1">What your programme fee covers</h2>
              <p className="text-sm text-muted-foreground">
                One fee, paid at enrolment. No separate charges for the assessment or the certificate.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INCLUDED.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-5">
                <f.icon className="w-6 h-6 text-orange-500 mb-3" />
                <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search internships…"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
          <select
            value={track}
            onChange={(e) => setTrack(e.target.value)}
            className="px-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="all">All tracks</option>
            {INTERNSHIP_TRACKS.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="px-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="all">All domains</option>
            {DOMAINS.map((d) => (
              <option key={d.key} value={d.key}>{d.label}</option>
            ))}
          </select>
        </div>

        {/* Listing */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl border border-border bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-1">No programmes match that filter</h3>
            <p className="text-muted-foreground text-sm mb-6">
              New cohorts open every month — tell us what you're looking for and we'll let you know.
            </p>
            <Link href="/contact" className="btn-neon inline-block">Register your interest</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, i) => <InternshipCard key={item._id} item={item} index={i} />)}
          </div>
        )}
      </section>

      <TrustBadges />

      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <h2 className="text-xl font-bold mb-8 text-center">How enrolment works</h2>
        <div className="grid md:grid-cols-5 gap-4">
          {[
            { t: 'Apply', b: 'Submit your details and preferred track.' },
            { t: 'Pay the fee', b: 'Confirm your seat with the programme fee.' },
            { t: 'Join a batch', b: 'Get placed in a cohort with a start date.' },
            { t: 'Train & build', b: 'Live classes, recordings, and project reviews.' },
            { t: 'Assess & certify', b: 'Sit the assessment, receive a graded certificate.' }
          ].map((s, i) => (
            <motion.div
              key={s.t}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-border p-5"
            >
              <span className="text-orange-500 font-mono text-xs font-bold">0{i + 1}</span>
              <h3 className="font-semibold text-sm mt-2 mb-1.5">{s.t}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.b}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-border p-6">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-orange-500" /> Certificates are earned, not bought
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The fee covers your training and assessment — not the result. Certificates are graded on your
            performance score and attendance, and every one carries a verification ID anyone can check.
            If you don't complete the programme, we'll tell you what's missing rather than issue a certificate anyway.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
