import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import AboutSection from '@/components/AboutSection';
import { motion } from 'framer-motion';
import { Target, Eye, Heart, Award } from 'lucide-react';

const values = [
  { icon: Target, title: 'Mission-Driven', desc: 'Every program we build exists to make the digital world safer for real people and organizations.' },
  { icon: Eye, title: 'Transparency', desc: 'We teach what actually works — no fear-mongering, no vague buzzwords, just practical security skills.' },
  { icon: Heart, title: 'Community First', desc: 'We invest in students and institutions, not just enterprise clients, because awareness scales from the ground up.' },
  { icon: Award, title: 'Proven Results', desc: '5,000+ learners trained across courses, internships, and campus programmes — with completion rates we publish.' }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="About Us" description="Our mission, story, and why organizations trust JASKRON Technologies Pvt. Ltd.." path="/about" />
      <Navigation />
      <PageHero
        eyebrow="Our Story"
        title="About"
        highlight="JASKRON"
        description="We build practical, industry-aligned learning — courses, internships, projects, and research mentorship that end in something you can show."
        image="https://images.unsplash.com/photo-1629904853716-f0bc54eea481?fm=jpg&q=80&w=2000&auto=format&fit=crop"
      />

      <AboutSection />

      <section className="relative py-20 md:py-28 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              What we <span className="gradient-text">stand for</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">The principles that shape every workshop, every consultation, every line of code we write.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="service-card text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="font-bold mb-2">{v.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
