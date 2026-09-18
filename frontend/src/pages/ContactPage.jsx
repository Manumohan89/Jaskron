import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ChevronDown, Briefcase, Building2 } from 'lucide-react';
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import ContactSection from '@/components/ContactSection';
import TrustBadges from '@/components/TrustBadges';

const FAQS = [
  {
    q: 'How fast do you reply?',
    a: 'Within one to two working days for email and the contact form. WhatsApp and calls during business hours usually get a faster response.'
  },
  {
    q: 'I want to apply for a paid internship — should I use this form?',
    a: "Apply directly from the internship's page instead — it captures the details we need (college, resume, preferred start) and puts you straight into our review queue. This form is for questions before you apply."
  },
  {
    q: 'Can my college book a workshop or a resource person?',
    a: 'Yes — use the dedicated institutions form, which is built for that: programme type, skills, dates, and participant count. It reaches our training team directly.'
  },
  {
    q: 'Do you take corporate training enquiries?',
    a: 'Yes. Select "Corporate / Institutional Training" in the topic dropdown, or use the institutions form if you already know the skills and dates.'
  }
];

function FaqItem({ item, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-medium text-sm">{item.q}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
      )}
    </motion.div>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Contact Us"
        description="Get in touch with JASKRON Technologies Pvt. Ltd. about courses, paid internships, projects, corporate training, or research mentorship."
        path="/contact"
      />
      <Navigation />
      <PageHero
        eyebrow="Let's Talk"
        title="Get in"
        highlight="Touch"
        description="Course enquiries, internship questions, campus programmes, or partnership ideas — we'd love to hear from you."
        image="https://images.unsplash.com/photo-1483817101829-339b08e8d83f?fm=jpg&q=80&w=2000&auto=format&fit=crop"
      />

      <ContactSection />

      {/* Redirect banners for the two dedicated forms */}
      <section className="container mx-auto px-4 pb-6">
        <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <Link
            href="/internships"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 hover:border-orange-500/50 transition-colors group"
          >
            <Briefcase className="w-6 h-6 text-orange-500 shrink-0" />
            <div>
              <p className="font-semibold text-sm group-hover:text-orange-500 transition-colors">Applying for an internship?</p>
              <p className="text-xs text-muted-foreground mt-0.5">Use the dedicated application form on the programme page.</p>
            </div>
          </Link>
          <Link
            href="/institutions"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 hover:border-orange-500/50 transition-colors group"
          >
            <Building2 className="w-6 h-6 text-orange-500 shrink-0" />
            <div>
              <p className="font-semibold text-sm group-hover:text-orange-500 transition-colors">Booking for your college?</p>
              <p className="text-xs text-muted-foreground mt-0.5">Use the institutions form to request a resource person.</p>
            </div>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <h2 className="text-2xl font-bold mb-8 text-center">Common questions</h2>
        <div className="space-y-3">
          {FAQS.map((item, i) => <FaqItem key={item.q} item={item} index={i} />)}
        </div>
      </section>

      <TrustBadges />
      <Footer />
    </div>
  );
}
