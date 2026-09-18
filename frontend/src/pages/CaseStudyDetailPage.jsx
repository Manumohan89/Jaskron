import { useEffect, useState } from 'react';
import { Link, useParams } from 'wouter';
import { ArrowLeft, Loader2, Building2, TrendingDown, TrendingUp } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { caseStudyApi } from '@/services/caseStudyService';

export default function CaseStudyDetailPage() {
  const { slug } = useParams();
  const [cs, setCs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    caseStudyApi.getBySlug(slug).then(setCs).catch(() => setNotFound(true)).finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {cs && <SEO title={cs.title} description={cs.summary} path={`/case-studies/${cs.slug}`} />}
      <Navigation />

      <article className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/case-studies" className="inline-flex items-center gap-1.5 text-sm text-orange-600 dark:text-orange-500 hover:text-orange-500 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to case studies
        </Link>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>
        ) : notFound ? (
          <p className="text-muted-foreground text-center py-16">This case study couldn't be found.</p>
        ) : (
          <>
            {cs.coverImage && (
              <img src={cs.coverImage} alt={cs.title} className="w-full h-56 sm:h-72 object-cover rounded-2xl mb-8 border border-border" />
            )}
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-500 mb-3">
              <Building2 className="w-3.5 h-3.5" /> {cs.clientName} {cs.industry ? `· ${cs.industry}` : ''}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">{cs.title}</h1>

            {cs.metrics?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                {cs.metrics.map((m, i) => (
                  <div key={i} className="bg-muted/30 border border-border rounded-2xl p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-2">{m.label}</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-red-500 font-semibold">{m.before}</span>
                      <TrendingDown className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-green-500 font-bold text-lg">{m.after}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-8 text-foreground/90 leading-relaxed">
              <div>
                <h2 className="text-lg font-bold mb-2">The Challenge</h2>
                <p className="whitespace-pre-wrap">{cs.challenge}</p>
              </div>
              <div>
                <h2 className="text-lg font-bold mb-2">Our Approach</h2>
                <p className="whitespace-pre-wrap">{cs.solution}</p>
              </div>
              <div>
                <h2 className="text-lg font-bold mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-500" /> The Results</h2>
                <p className="whitespace-pre-wrap">{cs.results}</p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-orange-500/5 border border-orange-500/20 rounded-2xl text-center">
              <p className="text-foreground font-medium mb-3">Want results like this for your team?</p>
              <Link href="/enterprise" className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm">
                Talk to us about corporate training
              </Link>
            </div>
          </>
        )}
      </article>

      <Footer />
    </div>
  );
}
