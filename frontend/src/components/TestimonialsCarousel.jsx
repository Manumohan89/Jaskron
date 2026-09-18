import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { testimonialApi } from '@/services/testimonialService';

export default function TestimonialsCarousel() {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    testimonialApi.getAll().then(setItems).catch(() => setItems([]));
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % items.length), 6000);
    return () => clearInterval(timerRef.current);
  }, [items]);

  if (items.length === 0) return null;

  const current = items[index];
  const prev = () => { clearInterval(timerRef.current); setIndex((i) => (i - 1 + items.length) % items.length); };
  const next = () => { clearInterval(timerRef.current); setIndex((i) => (i + 1) % items.length); };

  return (
    <section className="relative py-20 bg-background border-t border-border overflow-hidden">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-2">
          Trusted by professionals
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }} className="text-2xl md:text-3xl font-bold mb-10">
          What our participants say
        </motion.h2>

        <div className="relative min-h-[220px] flex items-center justify-center">
          <motion.div
            key={current._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto"
          >
            <Quote className="w-8 h-8 text-orange-500/40 mx-auto mb-4" />
            <p className="text-lg md:text-xl text-foreground/90 leading-relaxed mb-6">"{current.quote}"</p>
            <div className="flex items-center justify-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < current.rating ? 'text-amber-400 fill-amber-400' : 'text-muted'}`} />
              ))}
            </div>
            <p className="font-semibold text-foreground">{current.name}</p>
            <p className="text-sm text-muted-foreground">{current.role}{current.company ? ` · ${current.company}` : ''}</p>
          </motion.div>
        </div>

        {items.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={prev} className="p-2 rounded-full border border-border hover:border-orange-500/40 text-muted-foreground hover:text-orange-500 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5">
              {items.map((_, i) => (
                <button key={i} onClick={() => { clearInterval(timerRef.current); setIndex(i); }} className={`w-1.5 h-1.5 rounded-full transition-all ${i === index ? 'bg-orange-500 w-4' : 'bg-muted'}`} />
              ))}
            </div>
            <button onClick={next} className="p-2 rounded-full border border-border hover:border-orange-500/40 text-muted-foreground hover:text-orange-500 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
