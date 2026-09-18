import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, TrendingDown, Building2 } from 'lucide-react';
import { caseStudyApi } from '@/services/caseStudyService';

export default function CaseStudyTeaser() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    caseStudyApi.getAll({ limit: 3 }).then((data) => setItems(data.caseStudies || [])).catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-3">
          <div>
            <p className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-2">Proven results</p>
            <h2 className="text-2xl md:text-3xl font-bold">Real numbers, real organizations</h2>
          </div>
          <Link href="/case-studies" className="text-sm text-orange-600 dark:text-orange-500 hover:text-orange-500 font-medium flex items-center gap-1">
            View all case studies <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <Link href={`/case-studies/${c.slug}`} className="block bg-muted/30 border border-border rounded-2xl overflow-hidden hover:border-orange-500/40 transition-all h-full">
                {c.coverImage && (
                  <div className="h-36 overflow-hidden">
                    <img src={c.coverImage} alt={c.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-6">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-500 mb-3">
                  <Building2 className="w-3.5 h-3.5" /> {c.clientName}
                </span>
                <h3 className="font-bold mb-2">{c.title}</h3>
                {c.metrics?.[0] && (
                  <div className="flex items-center gap-2 text-sm bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-xl w-fit">
                    <TrendingDown className="w-3.5 h-3.5" /> {c.metrics[0].label}: {c.metrics[0].before} → {c.metrics[0].after}
                  </div>
                )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
