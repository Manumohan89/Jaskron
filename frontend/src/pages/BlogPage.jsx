import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, Loader2, Calendar, Tag } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import SEO from '@/components/SEO';
import { blogApi } from '@/services/blogService';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = (p = 1) => {
    setLoading(true);
    blogApi.getAll({ page: p, limit: 9 }).then((data) => {
      setPosts(data.posts || []);
      setPage(data.page || 1);
      setPages(data.pages || 1);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Blog" description="Engineering, data, AI, and career insights from the JASKRON Technologies Pvt. Ltd. team." path="/blog" />
      <Navigation />
      <PageHero eyebrow="Knowledge Base" title="JASKRON" highlight="Blog" description="Practical write-ups on development, data, AI, security, and career paths from our trainers and mentors."
        image="https://images.unsplash.com/photo-1590065707046-4fde65275b2e?fm=jpg&q=80&w=2000&auto=format&fit=crop" />

      <section className="max-w-6xl mx-auto px-6 py-16">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-muted/30 border border-border rounded-2xl">No articles published yet — check back soon.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/blog/${p.slug}`} className="block bg-muted/30 border border-border rounded-2xl overflow-hidden hover:border-orange-500/40 transition-all h-full flex flex-col">
                  {p.coverImage && (
                    <div className="h-40 overflow-hidden">
                      <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                  {p.tags?.[0] && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-500 mb-3">
                      <Tag className="w-3 h-3" /> {p.tags[0]}
                    </span>
                  )}
                  <h3 className="font-bold text-foreground mb-2 line-clamp-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{p.excerpt}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" /> {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : ''}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-500 font-medium">
                      Read <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => load(p)} className={`w-9 h-9 rounded-lg text-sm ${p === page ? 'bg-orange-500 text-white font-semibold' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
