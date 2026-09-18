import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  PlayCircle, Radio, ClipboardCheck, Award, TrendingUp, CheckCircle2, KeyRound, ArrowRight
} from 'lucide-react';

const activity = [
  { label: 'Live class — Full-Stack Batch 12', meta: 'Starts 7:00 PM', live: true },
  { label: 'Recording uploaded — React Hooks', meta: '48 min', live: false },
  { label: 'Assessment approved for your batch', meta: 'Just now', live: false },
  { label: 'Certificate issued — AI & ML Foundations', meta: 'Yesterday', live: false }
];

const features = [
  { icon: Radio, title: 'Live classes', body: 'Join your batch session straight from the dashboard.' },
  { icon: PlayCircle, title: 'Recorded sessions', body: 'Miss one? Recordings land in your batch feed.' },
  { icon: ClipboardCheck, title: 'Assessments', body: 'Unlocked by your admin when your batch is ready.' },
  { icon: Award, title: 'Certificates', body: 'Graded on performance and verifiable by anyone.' }
];

/**
 * A preview of what students see after logging in. Deliberately sits further
 * down the homepage — the hero leads with programmes, not product UI.
 */
export default function LmsPreview() {
  return (
    <section className="py-20 md:py-28 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Copy */}
          <div>
            <p className="text-orange-500 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
              Student Dashboard
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything for your batch, <span className="gradient-text">in one place</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg">
              Once you're enrolled and your seat is confirmed, your dashboard carries your live class links,
              recordings, notes, assessment access, and certificates.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="rounded-2xl border border-border p-4"
                >
                  <f.icon className="w-6 h-6 text-orange-500 mb-2.5" />
                  <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.body}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="btn-neon inline-flex items-center gap-2">
                Sign in to your dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-orange-500" />
              Assessment codes are issued inside the Assessment Centre after you sign in.
            </p>
          </div>

          {/* Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-orange-500/10 overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/40">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                <span className="ml-3 text-[11px] text-muted-foreground font-mono">jaskron-lms-dashboard</span>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 shrink-0">
                    <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" className="text-muted" strokeWidth="7" />
                      <motion.circle
                        cx="40" cy="40" r="34" fill="none" stroke="url(#lmsGrad)" strokeWidth="7" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 34}
                        initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                        whileInView={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - 0.78) }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
                      />
                      <defs>
                        <linearGradient id="lmsGrad" x1="0" y1="0" x2="80" y2="80">
                          <stop offset="0%" stopColor="#F2721F" />
                          <stop offset="100%" stopColor="#C2410C" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">78%</div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Full-Stack Internship — Batch 12</p>
                    <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" /> 14 of 18 sessions attended
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {activity.map((a, i) => (
                    <motion.div
                      key={a.label}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-2 text-xs bg-muted/30 rounded-lg px-3 py-2.5"
                    >
                      {a.live ? (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                      <span className="text-foreground/80 truncate">{a.label}</span>
                      <span className="ml-auto text-muted-foreground shrink-0">{a.meta}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
