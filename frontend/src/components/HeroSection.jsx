import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  ArrowRight, GraduationCap, Briefcase, Award, Video, ClipboardCheck, BadgeCheck
} from 'lucide-react';
import { COMPANY } from '@/config/company';

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen pt-16 flex items-center overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.12] dark:opacity-[0.18] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?fm=jpg&q=80&w=2000&auto=format&fit=crop')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(242,114,31,0.18), transparent)' }}
        />
        <motion.div
          animate={{ opacity: [0.25, 0.45, 0.25], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ opacity: [0.25, 0.45, 0.25], scale: [1.08, 1, 1.08] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#16233D]/20 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-4rem)] py-16">
          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="space-y-7">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5"
            >
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-orange-500 text-xs font-medium tracking-wide uppercase">
                {COMPANY.tagline}
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
              <span className="text-foreground">Skills that get you</span>
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                hired, built, and
              </span>
              <br />
              <span className="text-foreground">published</span>
            </h1>

            <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
              {COMPANY.legalName} trains students and professionals across full-stack development, data analytics,
              AI/ML, and cybersecurity — with recorded courses, mentor-led internships, project support, and
              research guidance.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-200"
                >
                  Explore Courses <ArrowRight size={16} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/internships"
                  className="inline-flex items-center gap-2 bg-muted/60 hover:bg-muted border border-border hover:border-orange-500/40 text-foreground font-medium px-6 py-3 rounded-xl transition-all duration-200"
                >
                  <Briefcase size={16} /> Paid Internships
                </Link>
              </motion.div>
            </div>

            <div className="flex items-center gap-6 pt-2 flex-wrap">
              {[
                { icon: GraduationCap, text: 'Industry-aligned curriculum' },
                { icon: Briefcase, text: 'Mentor-led internships' },
                { icon: Award, text: 'Verifiable certificates' }
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <Icon className="w-3.5 h-3.5 text-orange-500" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — paid programme highlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative"
          >
            <div className="relative rounded-3xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl shadow-orange-500/10 overflow-hidden">
              <div className="relative h-40">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?fm=jpg&q=80&w=1000&auto=format&fit=crop"
                  alt="Interns working with a mentor"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest bg-orange-500 text-white px-2.5 py-1 rounded-md">
                  Paid Internship Programme
                </span>
              </div>

              <div className="p-6 pt-2 space-y-5">
                <div>
                  <h3 className="font-bold text-lg mb-1.5">Train. Build. Get certified.</h3>
                  <p className="text-sm text-muted-foreground">
                    Enrol, pay a single programme fee, and get structured training, live mentorship,
                    a real project, an assessment, and a verifiable certificate.
                  </p>
                </div>

                <ul className="space-y-2.5">
                  {[
                    { icon: Video, text: 'Live classes + recorded sessions' },
                    { icon: Briefcase, text: 'Mentor-reviewed project work' },
                    { icon: ClipboardCheck, text: 'Assessment on batch completion' },
                    { icon: Award, text: 'Performance-graded certificate' }
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-2.5 text-sm">
                      <span className="w-7 h-7 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-orange-500" />
                      </span>
                      <span className="text-foreground/80">{text}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Tracks from</p>
                    <p className="font-bold">2 weeks &middot; all domains</p>
                  </div>
                  <Link
                    href="/internships"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:gap-2.5 transition-all"
                  >
                    View programmes <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-5 -right-5 bg-card border border-border rounded-xl px-3 py-2 shadow-xl backdrop-blur-xl flex items-center gap-2"
            >
              <BadgeCheck className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-medium text-foreground">DPIIT &amp; MSME registered</span>
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl px-3 py-2 shadow-xl backdrop-blur-xl flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-medium text-foreground">Verifiable certificates</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1"
      >
        <div className="w-5 h-8 border border-border rounded-full flex items-start justify-center p-1.5">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-1 h-1.5 bg-orange-500 rounded-full" />
        </div>
        <p className="text-muted-foreground text-[10px] tracking-widest uppercase">Scroll</p>
      </motion.div>
    </section>
  );
}
