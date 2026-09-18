import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Search, Clock, BarChart3, Users, Star, PlayCircle, KeyRound } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import PageHero from '@/components/PageHero';
import { courseApi } from '@/services/courseService';
import { DOMAINS } from '@/config/company';

const LEVELS = ['all', 'Beginner', 'Intermediate', 'Advanced'];

function minutesLabel(course) {
  const mins =
    course.totalMinutes ??
    (course.modules || []).reduce(
      (n, m) => n + (m.lessons || []).reduce((s, l) => s + (l.durationMinutes || 0), 0),
      0
    );
  if (!mins) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m ? `${m}m` : ''}`.trim() : `${m}m`;
}

function lessonsLabel(course) {
  const n =
    course.lessonCount ?? (course.modules || []).reduce((t, m) => t + (m.lessons?.length || 0), 0);
  return `${n} lesson${n === 1 ? '' : 's'}`;
}

export function CourseCard({ course, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link href={`/courses/${course.slug}`} className="group block h-full">
        <div className="h-full rounded-2xl border border-border bg-card overflow-hidden hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 flex flex-col">
          <div className="relative h-44 bg-muted overflow-hidden">
            <img
              src={
                course.thumbnail ||
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?fm=jpg&q=80&w=800&auto=format&fit=crop'
              }
              alt={course.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider bg-orange-500 text-white px-2 py-1 rounded-md">
              {course.level}
            </span>
            {course.isPaid ? (
              <span className="absolute top-3 right-3 text-xs font-bold bg-background/90 text-foreground px-2.5 py-1 rounded-md">
                ₹{course.discountPrice || course.price}
              </span>
            ) : (
              <span className="absolute top-3 right-3 text-xs font-bold bg-emerald-500 text-white px-2.5 py-1 rounded-md">
                Free
              </span>
            )}
          </div>

          <div className="p-5 flex flex-col flex-1">
            <h3 className="font-bold text-base leading-snug mb-1.5 group-hover:text-orange-500 transition-colors line-clamp-2">
              {course.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {course.subtitle || course.description}
            </p>

            <p className="text-xs text-muted-foreground mb-3">{course.instructorName}</p>

            <div className="mt-auto flex items-center gap-3 text-[11px] text-muted-foreground pt-3 border-t border-border">
              <span className="flex items-center gap-1">
                <PlayCircle className="w-3.5 h-3.5" /> {lessonsLabel(course)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {minutesLabel(course)}
              </span>
              {course.ratingCount > 0 && (
                <span className="flex items-center gap-1 text-amber-500 font-semibold ml-auto">
                  <Star className="w-3.5 h-3.5 fill-amber-500" /> {course.ratingAverage}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState('all');
  const [level, setLevel] = useState('all');
  const [q, setQ] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    courseApi
      .getAll()
      .then((data) => !cancelled && setCourses(Array.isArray(data) ? data : []))
      .catch(() => !cancelled && setCourses([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return courses.filter((c) => {
      if (domain !== 'all' && c.domain !== domain) return false;
      if (level !== 'all' && c.level !== level) return false;
      if (needle) {
        const hay = `${c.title} ${c.subtitle || ''} ${(c.tags || []).join(' ')}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [courses, domain, level, q]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Courses"
        description="Self-paced online courses in full-stack development, data analytics, AI/ML, and cybersecurity — with recorded sessions, labs, and certificates."
        path="/courses"
      />
      <Navigation />
      <PageHero
        eyebrow="E-Learning"
        title="Browse our"
        highlight="Courses"
        description="Recorded sessions, hands-on labs, quizzes, and a completion certificate — learn at your own pace."
        image="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?fm=jpg&q=80&w=2000&auto=format&fit=crop"
      />

      <section className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search courses, topics, or tools…"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="px-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="all">All domains</option>
            {DOMAINS.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="px-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-orange-500"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l === 'all' ? 'All levels' : l}
              </option>
            ))}
          </select>
          <Link
            href="/exam"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
          >
            <KeyRound className="w-4 h-4" /> Have an exam code?
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl border border-border bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-2xl">
            <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-1">No courses match that filter yet</h3>
            <p className="text-muted-foreground text-sm mb-6">
              New programs are published regularly — try clearing the filters or get in touch about a custom cohort.
            </p>
            <Link href="/contact" className="btn-neon inline-block">
              Request a course
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-5">
              Showing {filtered.length} course{filtered.length === 1 ? '' : 's'}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((c, i) => (
                <CourseCard key={c._id} course={c} index={i} />
              ))}
            </div>
          </>
        )}

        {/* Corporate CTA */}
        <div className="mt-16 rounded-3xl border border-border bg-gradient-to-br from-orange-500/10 to-transparent p-8 md:p-12 text-center">
          <Users className="w-10 h-10 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Training a whole team or college batch?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            We build customized tracks, run the cohort, and hand you completion reports — for institutions and
            corporate teams alike.
          </p>
          <Link href="/enterprise" className="btn-neon inline-block">
            Talk to us about a cohort
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
