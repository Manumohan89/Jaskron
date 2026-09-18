import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, IndianRupee, Award, Briefcase } from 'lucide-react';
import { internshipApi } from '@/services/internshipService';

/**
 * Homepage band for the paid internship programmes.
 * Renders nothing until at least one programme is published.
 */
export default function FeaturedInternships() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    internshipApi
      .getAll()
      .then((d) => setItems((Array.isArray(d) ? d : []).slice(0, 3)))
      .catch(() => setItems([]))
      .finally(() => setLoaded(true));
  }, []);

  if (loaded && items.length === 0) return null;

  return (
    <section className="py-20 md:py-24 bg-muted/30 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-orange-500 text-xs font-semibold uppercase tracking-[0.2em] mb-2">
              Paid Internship Programmes
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Train with us, get certified</h2>
            <p className="text-muted-foreground max-w-xl">
              One programme fee covers your training, live mentorship, project reviews, the final assessment,
              and a performance-graded certificate.
            </p>
          </div>
          <Link href="/internships" className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-500 hover:gap-2.5 transition-all">
            All programmes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {!loaded ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl border border-border bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, i) => {
              const fee = item.discountFee > 0 ? item.discountFee : item.fee;
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link href={`/internships/${item.slug}`} className="group block h-full">
                    <div className="h-full rounded-2xl border border-border bg-card p-6 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all flex flex-col">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <span className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
                          <Briefcase className="w-5 h-5 text-orange-500" />
                        </span>
                        <span className="text-right">
                          <span className="flex items-center justify-end font-bold text-lg">
                            <IndianRupee className="w-4 h-4" />
                            {fee?.toLocaleString('en-IN')}
                          </span>
                          {item.discountFee > 0 && item.fee > item.discountFee && (
                            <span className="text-xs text-muted-foreground line-through">
                              ₹{item.fee.toLocaleString('en-IN')}
                            </span>
                          )}
                        </span>
                      </div>

                      <h3 className="font-bold mb-2 group-hover:text-orange-500 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {item.subtitle || item.description}
                      </p>

                      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-4 border-t border-border text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {item.durationLabel}</span>
                        <span className="capitalize">{item.mode}</span>
                        {item.certificateEnabled && (
                          <span className="flex items-center gap-1 text-orange-500 ml-auto">
                            <Award className="w-3.5 h-3.5" /> Certified
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
