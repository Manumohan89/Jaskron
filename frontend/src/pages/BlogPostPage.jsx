import { useEffect, useState } from 'react';
import { Link, useParams } from 'wouter';
import { ArrowLeft, Calendar, Tag, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { blogApi } from '@/services/blogService';

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    blogApi.getBySlug(slug).then(setPost).catch(() => setNotFound(true)).finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {post && <SEO title={post.title} description={post.excerpt} path={`/blog/${post.slug}`} />}
      <Navigation />

      <article className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-orange-600 dark:text-orange-500 hover:text-orange-500 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to blog
        </Link>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>
        ) : notFound ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">This article couldn't be found.</p>
          </div>
        ) : (
          <>
            {post.coverImage && (
              <img src={post.coverImage} alt={post.title} className="w-full h-56 sm:h-72 object-cover rounded-2xl mb-8 border border-border" />
            )}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {post.tags?.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-orange-500/10 text-orange-600 dark:text-orange-500 px-2 py-1 rounded-full">
                  <Tag className="w-3 h-3" /> {t}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 leading-tight">{post.title}</h1>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-10">
              <Calendar className="w-4 h-4" /> {new Date(post.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-foreground/90">
              {post.content}
            </div>
          </>
        )}
      </article>

      <Footer />
    </div>
  );
}
