import { useEffect, useMemo, useState } from 'react';
import { Link, useRoute, useLocation } from 'wouter';
import {
  PlayCircle, FileText, FlaskConical, CheckCircle2, Circle, ChevronLeft, ChevronRight,
  Menu, X, Download, Award, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import Logo from '@/components/Logo';
import { courseApi } from '@/services/courseService';
import { useAuth } from '@/contexts/AuthContext';

const LESSON_ICON = { video: PlayCircle, document: FileText, text: FileText, lab: FlaskConical };

/** Turns a YouTube/Vimeo/direct URL into something we can render in the player. */
function resolveVideo(url = '') {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { kind: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1` };
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { kind: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}` };
  if (/\.(mp4|webm|ogg|m3u8)(\?|$)/i.test(url)) return { kind: 'video', src: url };
  return { kind: 'iframe', src: url };
}

export default function LearnPage() {
  const [, params] = useRoute('/learn/:slug');
  const [, navigate] = useLocation();
  const { user, isLoading: authLoading } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!params?.slug) return;
    setLoading(true);
    courseApi
      .getOne(params.slug)
      .then((d) => {
        setData(d);
        const flat = (d.course.modules || []).flatMap((m) => m.lessons || []);
        setActiveId(String(d.enrollment?.lastLesson || flat[0]?._id || ''));
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [params?.slug]);

  const flatLessons = useMemo(
    () =>
      (data?.course?.modules || []).flatMap((m) =>
        (m.lessons || []).map((l) => ({ ...l, moduleTitle: m.title }))
      ),
    [data]
  );

  const active = flatLessons.find((l) => String(l._id) === String(activeId)) || flatLessons[0];
  const activeIndex = flatLessons.findIndex((l) => String(l._id) === String(active?._id));
  const completed = new Set((data?.enrollment?.completedLessons || []).map(String));
  const progress = data?.enrollment?.progressPercent || 0;

  const toggleComplete = async (lesson, value) => {
    setSaving(true);
    try {
      const { enrollment } = await courseApi.setLessonProgress(params.slug, lesson._id, value);
      setData((d) => ({ ...d, enrollment }));
      if (enrollment.progressPercent === 100) {
        toast.success('Course complete! Your certificate is in your dashboard.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save progress');
    } finally {
      setSaving(false);
    }
  };

  const go = (delta) => {
    const next = flatLessons[activeIndex + delta];
    if (next) {
      setActiveId(String(next._id));
      setSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!data?.course) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold">Course not available</h1>
        <Link href="/courses" className="btn-neon">Back to courses</Link>
      </div>
    );
  }

  if (!data.isEnrolled) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold">You're not enrolled in this course</h1>
        <p className="text-muted-foreground">Enrol first to unlock the recorded sessions and labs.</p>
        <Link href={`/courses/${params.slug}`} className="btn-neon">View course</Link>
      </div>
    );
  }

  const { course } = data;
  const video = active?.type === 'video' ? resolveVideo(active.videoUrl) : null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SEO title={`Learn · ${course.title}`} path={`/learn/${course.slug}`} />

      {/* Top bar */}
      <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/95 backdrop-blur flex items-center gap-3 px-4">
        <Link href="/" className="shrink-0"><Logo size={28} /></Link>
        <Link href={`/courses/${course.slug}`} className="font-semibold text-sm truncate hover:text-orange-500">
          {course.title}
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 w-40">
            <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-orange-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-muted-foreground shrink-0">{progress}%</span>
          </div>
          <button onClick={() => setSidebarOpen((s) => !s)} className="lg:hidden text-muted-foreground" aria-label="Toggle contents">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Player */}
        <main className="flex-1 min-w-0">
          <div className="bg-black aspect-video w-full">
            {video?.kind === 'iframe' && (
              <iframe
                key={video.src}
                src={video.src}
                title={active.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            )}
            {video?.kind === 'video' && (
              <video key={video.src} src={video.src} controls controlsList="nodownload" className="w-full h-full" />
            )}
            {!video && (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-3 px-6 text-center">
                <FileText className="w-10 h-10" />
                <p className="text-sm">
                  {active?.type === 'lab' ? 'Hands-on lab — instructions below.' : 'Reading material — see below.'}
                </p>
              </div>
            )}
          </div>

          <div className="p-5 md:p-8 max-w-4xl">
            <p className="text-xs uppercase tracking-widest text-orange-500 font-semibold mb-1.5">
              {active?.moduleTitle}
            </p>
            <h1 className="text-xl md:text-2xl font-bold mb-4">{active?.title}</h1>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              <button
                onClick={() => toggleComplete(active, !completed.has(String(active._id)))}
                disabled={saving}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 ${
                  completed.has(String(active._id))
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {completed.has(String(active._id)) ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                {completed.has(String(active._id)) ? 'Completed' : 'Mark as complete'}
              </button>

              {active?.resourceUrl && (
                <a
                  href={active.resourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border border-border hover:border-orange-500/50 transition-colors"
                >
                  <Download className="w-4 h-4" /> Resource
                </a>
              )}

              <div className="ml-auto flex items-center gap-2">
                <button onClick={() => go(-1)} disabled={activeIndex <= 0} className="p-2.5 rounded-xl border border-border disabled:opacity-40 hover:border-orange-500/50" aria-label="Previous lesson">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => go(1)} disabled={activeIndex >= flatLessons.length - 1} className="p-2.5 rounded-xl border border-border disabled:opacity-40 hover:border-orange-500/50" aria-label="Next lesson">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {active?.content && (
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line text-muted-foreground leading-relaxed">
                {active.content}
              </div>
            )}

            {progress === 100 && (
              <div className="mt-10 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 flex items-start gap-4">
                <Award className="w-8 h-8 text-emerald-500 shrink-0" />
                <div>
                  <h3 className="font-bold mb-1">Course complete</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your completion certificate has been issued. If your instructor has set an exam, enter the code to attempt it.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/dashboard" className="text-sm font-medium text-orange-500 hover:underline">View certificate →</Link>
                    <Link href="/exam" className="text-sm font-medium text-orange-500 hover:underline">Enter exam code →</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Curriculum sidebar */}
        <aside
          className={`${sidebarOpen ? 'fixed inset-0 top-14 z-30 bg-background' : 'hidden'} lg:static lg:block w-full lg:w-80 xl:w-96 shrink-0 border-l border-border overflow-y-auto`}
        >
          <div className="p-4 border-b border-border">
            <h2 className="font-bold text-sm">Course content</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completed.size} of {flatLessons.length} lessons complete
            </p>
          </div>

          {(course.modules || []).map((mod, mi) => (
            <div key={mod._id || mi}>
              <p className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider bg-muted/50 text-muted-foreground sticky top-0">
                {mi + 1}. {mod.title}
              </p>
              <ul>
                {(mod.lessons || []).map((l) => {
                  const Icon = LESSON_ICON[l.type] || PlayCircle;
                  const isActive = String(l._id) === String(active?._id);
                  const done = completed.has(String(l._id));
                  return (
                    <li key={l._id}>
                      <button
                        onClick={() => { setActiveId(String(l._id)); setSidebarOpen(false); }}
                        className={`w-full text-left flex items-start gap-3 px-4 py-3 text-sm border-l-2 transition-colors ${
                          isActive
                            ? 'border-orange-500 bg-orange-500/10 text-foreground'
                            : 'border-transparent hover:bg-muted/50 text-muted-foreground'
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                        )}
                        <span className="flex-1">{l.title}</span>
                        {l.durationMinutes ? <span className="text-xs shrink-0">{l.durationMinutes}m</span> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
