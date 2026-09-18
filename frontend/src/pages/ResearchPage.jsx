import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Lightbulb, BookOpen, Database, FlaskConical, FileText, Send, ArrowRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import PageHero from '@/components/PageHero';

const STAGES = [
  { icon: Lightbulb, title: 'Research Mentorship', body: 'A mentor who works with you through the whole arc, not just the final draft.' },
  { icon: BookOpen, title: 'Literature Review', body: 'Finding the right papers, mapping the gap, and positioning your contribution.' },
  { icon: Database, title: 'Dataset Selection & Analysis', body: 'Sourcing credible data, cleaning it, and choosing defensible methods.' },
  { icon: FlaskConical, title: 'Prototype Development', body: 'Building the implementation that produces your results.' },
  { icon: FileText, title: 'Research Paper Guidance', body: 'Structure, framing, figures, and the writing standards reviewers expect.' },
  { icon: Send, title: 'Conference / Journal Support', body: 'Venue selection, formatting, submission, and responding to reviewer comments.' }
];

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Research & Innovation"
        description="Research mentorship for students and scholars — literature review, dataset analysis, prototyping, paper writing, and journal submission support."
        path="/research"
      />
      <Navigation />
      <PageHero
        eyebrow="Service 07"
        title="Research &"
        highlight="Innovation"
        description="From a vague question to a submission-ready paper, with a mentor at every stage."
        image="https://images.unsplash.com/photo-1532094349884-543bc11b234d?fm=jpg&q=80&w=2000&auto=format&fit=crop"
      />

      <section className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {STAGES.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-border p-6 bg-card hover:border-orange-500/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                <s.icon className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-bold mb-1.5">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl border border-border p-8 mb-16">
          <h2 className="text-xl font-bold mb-3">A note on academic integrity</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We mentor, review, and teach method — the research is yours. We won't ghost-write a paper or fabricate
            results, and we'll always tell you when a claim isn't supported by your data. That's what makes the work
            hold up in review.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-gradient-to-br from-orange-500/10 to-transparent p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold mb-2">Working on a paper?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Share your topic and target venue — we'll map out the stages and a realistic timeline.
          </p>
          <Link href="/contact" className="btn-neon inline-flex items-center gap-2">
            Talk to a research mentor <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
