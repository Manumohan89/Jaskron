import { Link, useRoute } from 'wouter';
import { motion } from 'framer-motion';
import {
  GraduationCap, Users, FileCog, Presentation, Mic, MonitorPlay, Lightbulb, Building2,
  CheckCircle2, ArrowRight, Shield
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { SERVICES, SERVICE_BY_SLUG } from '@/config/company';

const iconMap = { GraduationCap, Users, FileCog, Presentation, Mic, MonitorPlay, Lightbulb, Building2, Shield };

/** Extra copy per service so each page reads as its own thing, not a template. */
const DETAIL = {
  'skill-development': {
    intro:
      'Structured learning tracks that take you from fundamentals to portfolio-ready work. Each track blends recorded lessons, hands-on labs, and graded assessments.',
    process: ['Skill assessment & track selection', 'Core concepts with guided labs', 'Build a portfolio project', 'Assessment & certification'],
    cta: { label: 'Browse learning tracks', href: '/courses' }
  },
  'internship-programs': {
    intro:
      'Work on a real brief with a mentor who reviews what you produce. You finish with a shipped deliverable, a review record, and a verifiable certificate.',
    process: ['Application & domain fit', 'Onboarding and project brief', 'Weekly mentor reviews', 'Final submission & certificate'],
    cta: { label: 'Apply for an internship', href: '/contact' }
  },
  'project-development': {
    intro:
      'For final-year students and teams who need a build that works and documentation that holds up in review. We guide the architecture, not just the code.',
    process: ['Topic finalisation & scope', 'Architecture and tech selection', 'Build with review checkpoints', 'Documentation, demo & viva prep'],
    cta: { label: 'Discuss your project', href: '/contact' }
  },
  'workshops-bootcamps': {
    intro:
      'Intensive, instructor-led sessions run on your campus or online. One day to five days, scoped to the group in front of us.',
    process: ['Requirement discussion with the department', 'Curriculum and lab setup', 'Delivery with hands-on labs', 'Feedback report & certificates'],
    cta: { label: 'Book a workshop', href: '/contact' }
  },
  'industry-guest-sessions': {
    intro:
      'Practitioners share what the work actually looks like — the tools, the trade-offs, and how hiring decisions get made.',
    process: ['Topic and speaker selection', 'Session scheduling', 'Talk, case study & Q&A', 'Resume and interview clinic'],
    cta: { label: 'Invite a speaker', href: '/contact' }
  },
  'e-learning': {
    intro:
      'Our LMS hosts recorded sessions, downloadable resources, hands-on labs, quizzes, and code-based exams — all self-paced, with lifetime access.',
    process: ['Enroll in a course', 'Work through recorded modules and labs', 'Take the exam using the code from your instructor', 'Download your certificate'],
    cta: { label: 'Go to the course catalog', href: '/courses' }
  },
  'research-innovation': {
    intro:
      'Mentorship for scholars and student researchers, from framing a question to a submission-ready manuscript.',
    process: ['Problem framing & literature review', 'Dataset selection and analysis', 'Prototype and results', 'Paper drafting & submission support'],
    cta: { label: 'Talk to a research mentor', href: '/contact' }
  },
  'corporate-training': {
    intro:
      'Customized upskilling for teams, scoped to your stack and delivered around your schedule — with attendance and assessment reporting.',
    process: ['Skills gap assessment', 'Custom curriculum design', 'Delivery (onsite / remote / hybrid)', 'Assessment & reporting'],
    cta: { label: 'Request a training plan', href: '/enterprise' }
  }
};

export default function ServiceDetailPage() {
  const [, params] = useRoute('/services/:slug');
  const service = SERVICE_BY_SLUG[params?.slug];

  if (!service) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="container mx-auto px-4 pt-32 pb-20 text-center">
          <h1 className="text-2xl font-bold mb-3">Service not found</h1>
          <Link href="/services" className="btn-neon inline-block">See all services</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const Icon = iconMap[service.icon] || Shield;
  const detail = DETAIL[service.slug] || { intro: service.summary, process: [], cta: { label: 'Get in touch', href: '/contact' } };
  const others = SERVICES.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title={service.title} description={service.summary} path={`/services/${service.slug}`} />
      <Navigation />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url('${service.image}')` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/95 to-background" />
        <div className="container mx-auto px-4 relative z-10 max-w-4xl">
          <Link href="/services" className="text-orange-500 text-xs font-semibold uppercase tracking-widest">
            ← All services
          </Link>
          <div className="flex items-start gap-5 mt-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center shrink-0">
              <Icon className="w-7 h-7 text-orange-500" />
            </div>
            <div>
              <p className="font-mono text-xs text-muted-foreground tracking-widest mb-1">SERVICE {service.number}</p>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{service.title}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">{detail.intro}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="container mx-auto px-4 pb-20 max-w-4xl grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-10">
          <div>
            <h2 className="text-xl font-bold mb-5">What's included</h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {service.features.map((f, i) => (
                <motion.li
                  key={f}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-2.5 text-sm rounded-xl border border-border p-4"
                >
                  <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  {f}
                </motion.li>
              ))}
            </ul>
          </div>

          {detail.process.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-5">How it works</h2>
              <ol className="space-y-4">
                {detail.process.map((step, i) => (
                  <li key={step} className="flex gap-4">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-orange-500/15 text-orange-500 font-bold text-sm flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-sm text-muted-foreground pt-1.5">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-border p-6 sticky top-24">
            <h3 className="font-bold mb-2">Ready to start?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Tell us about your batch, team, or timeline and we'll put together a plan.
            </p>
            <Link
              href={detail.cta.href}
              className="w-full inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              {detail.cta.label} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </aside>
      </section>

      {/* Related */}
      <section className="border-t border-border py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-lg font-bold mb-6">Other services</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {others.map((s) => {
              const OtherIcon = iconMap[s.icon] || Shield;
              return (
                <Link key={s.slug} href={`/services/${s.slug}`} className="group rounded-2xl border border-border p-5 hover:border-orange-500/50 transition-colors">
                  <OtherIcon className="w-6 h-6 text-orange-500 mb-3" />
                  <h3 className="font-semibold text-sm mb-1 group-hover:text-orange-500 transition-colors">{s.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{s.summary}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
