import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, Loader2, Building2, TrendingDown } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import SEO from '@/components/SEO';
import { caseStudyApi } from '@/services/caseStudyService';

export default function CaseStudiesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    caseStudyApi.getAll({ limit: 20 }).then((data) => setItems(data.caseStudies || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Case Studies" description="Real results from organizations we've trained — see the before-and-after numbers." path="/case-studies" />
      <Navigation />
      <PageHero eyebrow="Proven Results" title="Case" highlight="Studies" description="Real engagements, real numbers — how organizations improved their security posture after training with us."
        image="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?fm=jpg&q=80&w=2000&auto=format&fit=crop" />

      <section className="max-w-6xl mx-auto px-6 py-16">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-muted/30 border border-border rounded-2xl">Case studies coming soon.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((c, i) => (
              <motion.div key={c._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/case-studies/${c.slug}`} className="block bg-muted/30 border border-border rounded-2xl overflow-hidden hover:border-orange-500/40 transition-all h-full flex flex-col">
                  {c.coverImage && (
                    <div className="h-40 overflow-hidden">
                      <img src={c.coverImage} alt={c.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-500 mb-3">
                    <Building2 className="w-3.5 h-3.5" /> {c.clientName} {c.industry ? `· ${c.industry}` : ''}
                  </span>
                  <h3 className="font-bold text-foreground mb-2 text-lg">{c.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{c.summary}</p>
                  {c.metrics?.[0] && (
                    <div className="flex items-center gap-2 mt-4 text-sm bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-2 rounded-xl w-fit">
                      <TrendingDown className="w-4 h-4" />
                      {c.metrics[0].label}: {c.metrics[0].before} → {c.metrics[0].after}
                    </div>
                  )}
                  <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-500 font-medium mt-4">
                    Read the full story <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
