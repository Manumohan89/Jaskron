import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { FileCog, Cpu, Code2, FileText, MessageSquareQuote, CheckCircle2, ArrowRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import PageHero from '@/components/PageHero';

const OFFERINGS = [
  { icon: FileCog, title: 'Final-Year Projects', body: 'Topic selection, scope, build, and a report your department will accept.' },
  { icon: Cpu, title: 'AI/ML Projects', body: 'Dataset sourcing, model selection, evaluation, and an honest results write-up.' },
  { icon: Code2, title: 'Software Development Projects', body: 'Full-stack builds with proper architecture, version control, and deployment.' },
  { icon: FileText, title: 'Documentation & Presentation', body: 'Report structure, diagrams, slide decks, and demo scripts.' },
  { icon: MessageSquareQuote, title: 'Viva Preparation', body: 'Mock viva sessions on the questions examiners actually ask.' }
];

const IDEAS = [
  { domain: 'Full-Stack', items: ['Multi-tenant SaaS dashboard', 'Real-time collaboration tool', 'Role-based admin platform'] },
  { domain: 'AI / ML', items: ['Document question-answering system', 'Time-series demand forecasting', 'Computer-vision quality inspection'] },
  { domain: 'Data Analytics', items: ['Sales performance BI dashboard', 'Customer churn analysis', 'Operational KPI reporting pipeline'] },
  { domain: 'Cybersecurity', items: ['Log anomaly detection', 'Secure authentication service', 'Vulnerability triage dashboard'] }
];

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Project Development"
        description="Final-year, AI/ML, and software project development support — from topic selection to documentation and viva preparation."
        path="/projects"
      />
      <Navigation />
      <PageHero
        eyebrow="Service 03"
        title="Project"
        highlight="Development"
        description="Guidance that goes past the code — architecture, documentation, demo, and viva readiness."
        image="https://images.unsplash.com/photo-1531482615713-2afd69097998?fm=jpg&q=80&w=2000&auto=format&fit=crop"
      />

      <section className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {OFFERINGS.map((o, i) => (
            <motion.div
              key={o.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-border p-6 bg-card hover:border-orange-500/50 transition-colors"
            >
              <o.icon className="w-7 h-7 text-orange-500 mb-3" />
              <h3 className="font-bold mb-1.5">{o.title}</h3>
              <p className="text-sm text-muted-foreground">{o.body}</p>
            </motion.div>
          ))}
        </div>

        <h2 className="text-xl font-bold mb-2 text-center">Starting points, if you need one</h2>
        <p className="text-muted-foreground text-sm text-center mb-8 max-w-xl mx-auto">
          Bring your own idea or start from a brief — either way we shape it into something defensible in review.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {IDEAS.map((group) => (
            <div key={group.domain} className="rounded-2xl border border-border p-5">
              <h3 className="font-semibold text-sm mb-3 text-orange-500">{group.domain}</h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="text-xs text-muted-foreground flex gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-border bg-gradient-to-br from-orange-500/10 to-transparent p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold mb-2">Have a project deadline coming up?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Tell us the topic, the deadline, and where you're stuck. We'll tell you honestly what's achievable.
          </p>
          <Link href="/contact" className="btn-neon inline-flex items-center gap-2">
            Discuss your project <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
