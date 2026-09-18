import { useEffect, useState } from 'react';
import { Link, useRoute, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  Clock, Users, Award, CheckCircle2, ArrowRight, Loader2, IndianRupee, Calendar,
  Video, ClipboardCheck, AlertTriangle, MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { internshipApi } from '@/services/internshipService';
import { useAuth } from '@/contexts/AuthContext';

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-orange-500';

const STATUS_COPY = {
  applied: { tone: 'amber', text: 'Application received — our team is reviewing it.' },
  shortlisted: { tone: 'amber', text: "You're shortlisted — pay your programme fee to confirm your seat." },
  payment_pending: { tone: 'amber', text: 'Complete your fee payment to confirm your seat.' },
  enrolled: { tone: 'emerald', text: "You're enrolled. Your batch and classes appear in your dashboard." },
  rejected: { tone: 'red', text: 'This application was not taken forward.' },
  withdrawn: { tone: 'red', text: 'You withdrew this application.' }
};

export default function InternshipDetailPage() {
  const [, params] = useRoute('/internships/:slug');
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    college: '', course: '', yearOfStudy: '', phone: '', resumeUrl: '', motivation: '', preferredStart: ''
  });

  const load = () => {
    setLoading(true);
    internshipApi
      .getOne(params.slug)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (params?.slug) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.slug, user?.id]);

  const submit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info('Sign in first so we can track your application.');
      navigate('/login');
      return;
    }
    setSubmitting(true);
    try {
      await internshipApi.apply(params.slug, form);
      toast.success('Application submitted. Check your dashboard for next steps.');
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit your application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="container mx-auto px-4 pt-32 pb-20 space-y-4">
          <div className="h-10 w-2/3 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded-2xl animate-pulse" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!data?.internship) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="container mx-auto px-4 pt-32 pb-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Internship not found</h1>
          <Link href="/internships" className="btn-neon inline-block">See all programmes</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { internship, application, amountPayable, batches } = data;
  const statusInfo = application ? STATUS_COPY[application.status] : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title={internship.title}
        description={internship.subtitle || internship.description?.slice(0, 160)}
        path={`/internships/${internship.slug}`}
      />
      <Navigation />

      {/* Hero */}
      <section className="relative pt-28 pb-14 bg-[#101B2E] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url('${internship.thumbnail}')` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101B2E] via-[#101B2E]/95 to-[#101B2E]/70" />
        <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <Link href="/internships" className="text-orange-400 text-xs font-semibold uppercase tracking-widest">
              ← All internships
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold mt-3 mb-3 leading-tight">{internship.title}</h1>
            <p className="text-gray-300 text-lg mb-5 max-w-2xl">{internship.subtitle || internship.description}</p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-300">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-orange-400" /> {internship.durationLabel}</span>
              <span className="flex items-center gap-1.5 capitalize"><MapPin className="w-4 h-4 text-orange-400" /> {internship.mode}</span>
              <span className="flex items-center gap-1.5 capitalize"><Users className="w-4 h-4 text-orange-400" /> {String(internship.track).replace('-', ' ')}</span>
              {internship.certificateEnabled && (
                <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-orange-400" /> Certificate on completion</span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Mentored by <span className="text-white font-medium">{internship.mentorName}</span>
              {internship.mentorTitle ? ` · ${internship.mentorTitle}` : ''}
            </p>
          </div>

          {/* Enrol card */}
          <motion.aside initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl bg-card text-card-foreground border border-border shadow-2xl p-6 space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Programme fee</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold flex items-center">
                    <IndianRupee className="w-6 h-6" />
                    {amountPayable.toLocaleString('en-IN')}
                  </span>
                  {internship.discountFee > 0 && internship.fee > internship.discountFee && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{internship.fee.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">{internship.feeNote}</p>
              </div>

              {application ? (
                <div
                  className={`rounded-xl p-4 text-sm border ${
                    statusInfo?.tone === 'emerald'
                      ? 'border-emerald-500/30 bg-emerald-500/10'
                      : statusInfo?.tone === 'red'
                      ? 'border-red-500/30 bg-red-500/10'
                      : 'border-amber-500/30 bg-amber-500/10'
                  }`}
                >
                  <p className="font-semibold capitalize mb-1">{application.status.replace('_', ' ')}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{statusInfo?.text}</p>
                  {application.batch?.name && (
                    <p className="text-xs mt-2">
                      Batch: <span className="font-medium">{application.batch.name}</span>
                    </p>
                  )}
                  {application.paymentStatus === 'pending' && application.amountPayable > 0 ? (
                    <Link
                      href="/dashboard?tab=internships"
                      className="mt-3 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                    >
                      Pay ₹{application.amountPayable.toLocaleString('en-IN')} to confirm seat <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <Link href="/dashboard?tab=internships" className="text-xs font-medium text-orange-500 hover:underline inline-flex items-center gap-1 mt-3">
                      Open dashboard <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => (user ? setShowForm(true) : navigate('/login'))}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Apply &amp; reserve a seat <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <ul className="text-sm text-muted-foreground space-y-2 pt-2 border-t border-border">
                <li className="flex items-center gap-2"><Video className="w-4 h-4 text-orange-500" /> Live classes + recordings</li>
                <li className="flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-orange-500" /> Final assessment included</li>
                <li className="flex items-center gap-2"><Award className="w-4 h-4 text-orange-500" /> Performance-graded certificate</li>
                <li className="flex items-center gap-2"><Users className="w-4 h-4 text-orange-500" /> {internship.seatsPerBatch} seats per batch</li>
              </ul>
            </div>
          </motion.aside>
        </div>
      </section>

      {/* Body */}
      <section className="container mx-auto px-4 py-14 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div>
            <h2 className="text-xl font-bold mb-3">About this programme</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{internship.description}</p>
          </div>

          {internship.whatYouGet?.length > 0 && (
            <div className="rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl font-bold mb-5">What you get</h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {internship.whatYouGet.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {internship.curriculum?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-5">Programme outline</h2>
              <ol className="space-y-3">
                {internship.curriculum.map((c, i) => (
                  <li key={i} className="flex gap-4 rounded-xl border border-border p-4">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-orange-500/15 text-orange-500 font-bold text-sm flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-sm">{c.title}</p>
                      {c.detail && <p className="text-sm text-muted-foreground mt-1">{c.detail}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {internship.deliverables?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-3">What you'll submit</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-1.5 text-sm">
                {internship.deliverables.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>
          )}

          {internship.eligibility?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-3">Eligibility</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-1.5 text-sm">
                {internship.eligibility.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" /> Upcoming batches
            </h3>
            {batches?.length ? (
              <ul className="space-y-3">
                {batches.map((b) => (
                  <li key={b._id} className="rounded-xl border border-border p-4">
                    <p className="font-semibold text-sm">{b.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {b.startDate ? new Date(b.startDate).toLocaleDateString() : 'Dates TBA'}
                      {b.scheduleNote ? ` · ${b.scheduleNote}` : ''}
                    </p>
                    <p className="text-xs mt-2">
                      <span className={b.seatsLeft > 0 ? 'text-emerald-500' : 'text-red-500'}>
                        {b.seatsLeft > 0 ? `${b.seatsLeft} seats left` : 'Batch full'}
                      </span>
                      <span className="text-muted-foreground capitalize"> · {b.mode}</span>
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No dated batch yet — apply and we'll place you in the next cohort.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border p-6">
            <h3 className="font-bold mb-2">Sponsoring a college batch?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We run this programme for full college batches with institutional billing.
            </p>
            <Link href="/institutions" className="text-sm font-medium text-orange-500 hover:underline inline-flex items-center gap-1">
              Institutional enquiry <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>
      </section>

      {/* Application modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={submit} className="w-full max-w-lg my-8 rounded-2xl bg-card border border-border p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold">Apply — {internship.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Seat is confirmed after the ₹{amountPayable.toLocaleString('en-IN')} fee is paid. Once submitted,
                pay securely from your dashboard.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <input className={inputClass} placeholder="College / organisation" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
              <input className={inputClass} placeholder="Degree / branch" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} />
              <input className={inputClass} placeholder="Year of study" value={form.yearOfStudy} onChange={(e) => setForm({ ...form, yearOfStudy: e.target.value })} />
              <input className={inputClass} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <input className={inputClass} placeholder="Resume link (Drive / LinkedIn)" value={form.resumeUrl} onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })} />
            <input className={inputClass} placeholder="Preferred start (e.g. June 2026)" value={form.preferredStart} onChange={(e) => setForm({ ...form, preferredStart: e.target.value })} />
            <textarea rows={3} className={inputClass} placeholder="Why do you want this internship?" value={form.motivation} onChange={(e) => setForm({ ...form, motivation: e.target.value })} />

            <p className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-xl p-3">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-orange-500" />
              The fee covers training, mentorship, and assessment. The certificate is graded on your performance —
              enrolment alone doesn't guarantee one.
            </p>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Submit application
              </button>
            </div>
          </form>
        </div>
      )}

      <Footer />
    </div>
  );
}
