import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Search, FileText, FileArchive, FileImage, File, Loader2, Lock } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import SEO from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { resourceApi } from '@/services/resourceService';

const CATEGORY_ICONS = {
  Guide: FileText, Checklist: FileText, Template: File, Whitepaper: FileText, Slides: FileImage, Other: FileArchive
};
const CATEGORIES = ['all', 'Guide', 'Checklist', 'Template', 'Whitepaper', 'Slides', 'Other'];

function formatSize(bytes) {
  if (!bytes) return '';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    resourceApi.getAll({ search: search || undefined, category }).then(setResources).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [category]);
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Free Resources" description="Download free guides, checklists, cheat sheets, and templates from JASKRON Technologies Pvt. Ltd." path="/resources" />
      <Navigation />
      <PageHero eyebrow="Free Downloads" title="Security" highlight="Resources" description="Guides, checklists, and templates to help you build a stronger security posture — free to download."
        image="https://images.unsplash.com/photo-1608452964553-9b4d97b2752f?fm=jpg&q=80&w=2000&auto=format&fit=crop" />

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${category === c ? 'bg-orange-500/15 border-orange-500/40 text-orange-600 dark:text-orange-500' : 'border-border text-muted-foreground hover:border-orange-500/30'}`}
              >
                {c === 'all' ? 'All' : c}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="w-full bg-muted/50 border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-orange-500/50"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>
        ) : resources.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm bg-muted/30 border border-border rounded-2xl">No resources found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resources.map((r, i) => {
              const Icon = CATEGORY_ICONS[r.category] || File;
              const locked = !r.isPublic && !user;
              return (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-muted/30 border border-border rounded-2xl p-6 hover:border-orange-500/40 transition-all flex flex-col"
                >
                  <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-sm font-semibold text-foreground line-clamp-1">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 flex-1">{r.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{r.category} · {formatSize(r.fileSize)}</span>
                    {locked ? (
                      <span className="flex items-center gap-1 text-xs text-amber-500 font-medium"><Lock className="w-3.5 h-3.5" /> Sign in</span>
                    ) : (
                      <a
                        href={resourceApi.downloadUrl(r._id)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-500 hover:text-orange-500 font-medium"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
