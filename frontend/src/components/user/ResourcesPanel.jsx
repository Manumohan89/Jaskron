import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Search, FileArchive, FileImage, File } from 'lucide-react';
import { resourceApi } from '@/services/resourceService';

const CATEGORY_ICONS = {
  Guide: FileText, Checklist: FileText, Template: File, Whitepaper: FileText, Slides: FileImage, Other: FileArchive
};

function formatSize(bytes) {
  if (!bytes) return '';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function ResourcesPanel() {
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

  const categories = ['all', 'Guide', 'Checklist', 'Template', 'Whitepaper', 'Slides', 'Other'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white">Resources</h2>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50"
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${category === c ? 'bg-orange-500/15 border-orange-500/40 text-orange-500' : 'border-gray-800 text-gray-400 hover:border-gray-700'}`}
          >
            {c === 'all' ? 'All' : c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-gray-900 border border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16 text-gray-500 text-sm bg-gray-900 border border-gray-800 rounded-2xl">No resources found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((r) => {
            const Icon = CATEGORY_ICONS[r.category] || File;
            return (
              <div key={r._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-orange-500/30 transition-all flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-sm font-semibold text-white line-clamp-1">{r.title}</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2 flex-1">{r.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] uppercase tracking-wide text-gray-500">{r.category} · {formatSize(r.fileSize)}</span>
                  <a
                    href={resourceApi.downloadUrl(r._id)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-400 font-medium"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
