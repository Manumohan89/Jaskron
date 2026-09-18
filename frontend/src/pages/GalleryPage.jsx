import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Images, X, ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import PageHero from '@/components/PageHero';
import { galleryApi } from '@/services/siteService';
import { GALLERY_CATEGORIES } from '@/config/company';

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [lightbox, setLightbox] = useState(-1);

  useEffect(() => {
    galleryApi
      .getAll()
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => (category === 'all' ? items : items.filter((i) => i.category === category)),
    [items, category]
  );

  // Only show tabs for categories that actually have photos.
  const availableCategories = useMemo(
    () => GALLERY_CATEGORIES.filter((c) => items.some((i) => i.category === c.key)),
    [items]
  );

  const move = (delta) => {
    setLightbox((n) => {
      const next = n + delta;
      if (next < 0) return filtered.length - 1;
      if (next >= filtered.length) return 0;
      return next;
    });
  };

  useEffect(() => {
    if (lightbox < 0) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(-1);
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, filtered.length]);

  const active = lightbox >= 0 ? filtered[lightbox] : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Gallery"
        description="Photos from JASKRON batches, workshops, campus programmes, and life at the company."
        path="/gallery"
      />
      <Navigation />
      <PageHero
        eyebrow="Life at JASKRON"
        title="Our"
        highlight="Gallery"
        description="Batches, campus workshops, guest sessions, and the team behind them."
        image="https://images.unsplash.com/photo-1540575467063-178a50c2df87?fm=jpg&q=80&w=2000&auto=format&fit=crop"
      />

      <section className="container mx-auto px-4 py-14">
        {availableCategories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => setCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                category === 'all'
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'border-border text-muted-foreground hover:border-orange-500/50'
              }`}
            >
              All
            </button>
            {availableCategories.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  category === c.key
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'border-border text-muted-foreground hover:border-orange-500/50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-56 rounded-2xl bg-muted/50 animate-pulse break-inside-avoid" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-2xl">
            <Images className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-1">No photos here yet</h3>
            <p className="text-muted-foreground text-sm">
              Batch and event photos are added by our team as programmes run.
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
            {filtered.map((item, i) => (
              <motion.button
                key={item._id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
                onClick={() => setLightbox(i)}
                className="group relative w-full mb-4 break-inside-avoid rounded-2xl overflow-hidden border border-border block text-left"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                  <p className="text-white font-semibold text-sm">{item.title}</p>
                  {item.caption && <p className="text-gray-300 text-xs mt-0.5 line-clamp-2">{item.caption}</p>}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(-1)}
          >
            <button
              onClick={() => setLightbox(-1)}
              className="absolute top-5 right-5 text-white/70 hover:text-white p-2"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); move(-1); }}
              className="absolute left-3 md:left-8 text-white/70 hover:text-white p-3"
              aria-label="Previous"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); move(1); }}
              className="absolute right-3 md:right-8 text-white/70 hover:text-white p-3"
              aria-label="Next"
            >
              <ChevronRight className="w-7 h-7" />
            </button>

            <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <img src={active.imageUrl} alt={active.title} className="w-full max-h-[75vh] object-contain rounded-xl" />
              <div className="mt-4 text-center">
                <p className="text-white font-semibold">{active.title}</p>
                {active.caption && <p className="text-gray-400 text-sm mt-1">{active.caption}</p>}
                <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
                  {active.institution && (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {active.institution}</span>
                  )}
                  {active.takenOn && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(active.takenOn).toLocaleDateString()}
                    </span>
                  )}
                  <span className="text-gray-600">{lightbox + 1} / {filtered.length}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
