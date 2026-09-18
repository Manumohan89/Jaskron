import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Presentation, Mic, FlaskConical, Users, CalendarCheck, Loader2,
  CheckCircle2, GraduationCap, Award, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import PageHero from '@/components/PageHero';
import TrustBadges from '@/components/TrustBadges';
import { bookingApi } from '@/services/siteService';
import { COMPANY } from '@/config/company';

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-orange-500';
const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5';

const PROGRAM_TYPES = [
  { key: 'workshop', label: 'Technical Workshop', icon: Presentation, body: '1–5 day hands-on workshop for a department or year.' },
  { key: 'bootcamp', label: 'Bootcamp', icon: FlaskConical, body: 'Intensive multi-day programme with labs and a capstone.' },
  { key: 'guest-lecture', label: 'Guest Lecture', icon: Mic, body: 'An industry practitioner on trends, careers, or a case study.' },
  { key: 'fdp', label: 'Faculty Development', icon: GraduationCap, body: 'Upskilling sessions built for teaching staff.' },
  { key: 'seminar', label: 'Seminar / Symposium', icon: Users, body: 'Panel or seminar sessions for larger audiences.' },
  { key: 'hackathon', label: 'Hackathon Support', icon: Award, body: 'Judging, mentoring, and problem statements for your event.' }
];

const SKILL_SUGGESTIONS = [
  'Full-Stack Development', 'React', 'Node.js', 'Python', 'Data Analytics',
  'Power BI', 'AI & Machine Learning', 'Generative AI', 'Cybersecurity',
  'Secure Coding', 'Cloud & DevOps', 'Git & GitHub'
];

export default function InstitutionsPage() {
  const [form, setForm] = useState({
    institutionName: '', institutionType: 'college', contactName: '', designation: '',
    contactEmail: '', contactPhone: '', city: '', programType: 'workshop',
    skills: [], preferredDates: '', durationDays: 1, mode: 'offline',
    expectedParticipants: 60, departmentOrYear: '', budgetNote: '', message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const toggleSkill = (skill) =>
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter((s) => s !== skill) : [...f.skills, skill]
    }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.skills.length === 0) {
      toast.error('Pick at least one skill you want covered');
      return;
    }
    setSubmitting(true);
    try {
      const res = await bookingApi.create(form);
      toast.success(res.message || 'Request received');
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit your request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="For Institutions"
        description="Book a JASKRON resource person for campus workshops, bootcamps, guest lectures, and faculty development programmes."
        path="/institutions"
      />
      <Navigation />
      <PageHero
        eyebrow="For Colleges & Companies"
        title="Book a"
        highlight="Resource Person"
        description="We send practitioners to your campus — for workshops, bootcamps, guest lectures, and faculty development, in the skills you choose."
        image="https://images.unsplash.com/photo-1540575467063-178a50c2df87?fm=jpg&q=80&w=2000&auto=format&fit=crop"
      />

      {/* Programme types */}
      <section className="container mx-auto px-4 py-14 max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">What we can run for you</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every programme is scoped to your department, your year group, and the skills you want covered.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {PROGRAM_TYPES.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-card p-6 hover:border-orange-500/50 transition-colors"
            >
              <p.icon className="w-7 h-7 text-orange-500 mb-3" />
              <h3 className="font-bold mb-1.5">{p.label}</h3>
              <p className="text-sm text-muted-foreground">{p.body}</p>
            </motion.div>
          ))}
        </div>

        {/* What you get */}
        <div className="rounded-3xl border border-border bg-gradient-to-br from-orange-500/10 to-transparent p-7 md:p-10 mb-16">
          <h2 className="text-xl font-bold mb-5">What's included for your institution</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'A named resource person with industry experience',
              'Curriculum tailored to your syllabus and year group',
              'Hands-on labs with setup instructions shared in advance',
              'Attendance and participation report after delivery',
              'Participation certificates for attending students',
              'Optional follow-on internship or LMS access for the batch'
            ].map((item) => (
              <div key={item} className="flex gap-2.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Booking form */}
        <div id="book" className="max-w-3xl mx-auto">
          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-10 text-center"
            >
              <CalendarCheck className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Request received</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Our team will contact you within two working days with resource person availability and a proposal.
                For anything urgent, reach us at {COMPANY.phone}.
              </p>
              <button
                onClick={() => { setDone(false); setForm((f) => ({ ...f, skills: [], message: '' })); }}
                className="text-sm font-medium text-orange-500 hover:underline inline-flex items-center gap-1"
              >
                Submit another request <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-7 md:p-9 space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-orange-500" /> Booking request
                </h2>
                <p className="text-sm text-muted-foreground">
                  Tell us what you need. No payment at this stage — we'll send a proposal first.
                </p>
              </div>

              {/* Institution */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Institution name *</label>
                  <input required className={inputClass} value={form.institutionName} onChange={(e) => setForm({ ...form, institutionName: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Type</label>
                  <select className={inputClass} value={form.institutionType} onChange={(e) => setForm({ ...form, institutionType: e.target.value })}>
                    <option value="college">College</option>
                    <option value="university">University</option>
                    <option value="school">School</option>
                    <option value="company">Company</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Your name *</label>
                  <input required className={inputClass} value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Designation</label>
                  <input className={inputClass} placeholder="HoD / TPO / Faculty" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <input required type="email" className={inputClass} value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input className={inputClass} value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input className={inputClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Department / year</label>
                  <input className={inputClass} placeholder="CSE, 3rd year" value={form.departmentOrYear} onChange={(e) => setForm({ ...form, departmentOrYear: e.target.value })} />
                </div>
              </div>

              {/* Programme */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Programme type</label>
                  <select className={inputClass} value={form.programType} onChange={(e) => setForm({ ...form, programType: e.target.value })}>
                    {PROGRAM_TYPES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Mode</label>
                  <select className={inputClass} value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                    <option value="offline">On campus</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Duration (days)</label>
                  <input type="number" min={1} className={inputClass} value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })} />
                </div>
                <div>
                  <label className={labelClass}>Expected participants</label>
                  <input type="number" min={1} className={inputClass} value={form.expectedParticipants} onChange={(e) => setForm({ ...form, expectedParticipants: Number(e.target.value) })} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Preferred dates</label>
                  <input className={inputClass} placeholder="e.g. second week of March, or 12–14 March" value={form.preferredDates} onChange={(e) => setForm({ ...form, preferredDates: e.target.value })} />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className={labelClass}>Skills to cover * (pick as many as you need)</label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_SUGGESTIONS.map((s) => {
                    const on = form.skills.includes(s);
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => toggleSkill(s)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          on
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'border-border text-muted-foreground hover:border-orange-500/50'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelClass}>Budget note / anything else</label>
                <textarea rows={3} className={inputClass} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Submit booking request
              </button>
            </form>
          )}
        </div>
      </section>

      <TrustBadges />
      <Footer />
    </div>
  );
}
