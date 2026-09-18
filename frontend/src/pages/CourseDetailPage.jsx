import { useEffect, useState } from 'react';
import { Link, useRoute, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  Clock, PlayCircle, FileText, FlaskConical, Lock, CheckCircle2, ChevronDown,
  BarChart3, Globe, Award, Users, Star, ArrowRight, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { courseApi } from '@/services/courseService';
import { paymentApi, loadRazorpayScript } from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';

const LESSON_ICON = { video: PlayCircle, document: FileText, text: FileText, lab: FlaskConical };

export default function CourseDetailPage() {
  const [, params] = useRoute('/courses/:slug');
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [openModule, setOpenModule] = useState(0);

  const load = () => {
    setLoading(true);
    courseApi
      .getOne(params.slug)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (params?.slug) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.slug, user?.id]);

  const enroll = async () => {
    if (!user) {
      toast.info('Sign in to enroll — it takes a minute.');
      navigate('/login');
      return;
    }

    const amount = course.discountPrice > 0 ? course.discountPrice : course.price;
    if (course.isPaid && amount > 0) {
      setEnrolling(true);
      try {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          toast.error('Could not load the payment gateway. Check your connection and try again.');
          setEnrolling(false);
          return;
        }
        const order = await paymentApi.createCourseOrder(course._id);
        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          order_id: order.orderId,
          name: 'JASKRON Technologies Pvt. Ltd.',
          description: order.courseTitle || course.title,
          prefill: { name: user.name, email: user.email },
          handler: async (response) => {
            try {
              await paymentApi.verifyCoursePayment(course._id, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
              toast.success('Payment confirmed — you are enrolled. Happy learning!');
              load();
            } catch (err) {
              toast.error(err.response?.data?.message || 'Payment verification failed');
            }
            setEnrolling(false);
          },
          modal: { ondismiss: () => setEnrolling(false) },
          theme: { color: '#EA580C' }
        });
        rzp.open();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not start payment');
        setEnrolling(false);
      }
      return;
    }

    setEnrolling(true);
    try {
      await courseApi.enroll(params.slug);
      toast.success('You are enrolled. Happy learning!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="container mx-auto px-4 pt-32 pb-20 space-y-4">
          <div className="h-10 w-2/3 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded-2xl animate-pulse" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!data?.course) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="container mx-auto px-4 pt-32 pb-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Course not found</h1>
          <p className="text-muted-foreground mb-6">It may have been unpublished or the link is wrong.</p>
          <Link href="/courses" className="btn-neon inline-block">Back to all courses</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { course, enrollment, isEnrolled } = data;
  const lessonCount = (course.modules || []).reduce((n, m) => n + (m.lessons?.length || 0), 0);
  const totalMinutes = (course.modules || []).reduce(
    (n, m) => n + (m.lessons || []).reduce((s, l) => s + (l.durationMinutes || 0), 0), 0
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title={course.title}
        description={course.subtitle || course.description?.slice(0, 160)}
        path={`/courses/${course.slug}`}
        courseSchema={{ name: course.title, description: course.description }}
      />
      <Navigation />

      {/* Hero */}
      <section className="relative pt-28 pb-14 bg-[#101B2E] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url('${course.thumbnail}')` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101B2E] via-[#101B2E]/95 to-[#101B2E]/70" />
        <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <Link href="/courses" className="text-orange-400 text-xs font-semibold uppercase tracking-widest">
              ← All courses
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold mt-3 mb-3 leading-tight">{course.title}</h1>
            <p className="text-gray-300 text-lg mb-5 max-w-2xl">{course.subtitle || course.description}</p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-300">
              <span className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-orange-400" /> {course.level}</span>
              <span className="flex items-center gap-1.5"><PlayCircle className="w-4 h-4 text-orange-400" /> {lessonCount} lessons</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-orange-400" /> {Math.round(totalMinutes / 60) || '<1'}h of content</span>
              <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-orange-400" /> {course.language}</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-orange-400" /> {course.enrolledCount || 0} enrolled</span>
              {course.ratingCount > 0 && (
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Star className="w-4 h-4 fill-amber-400" /> {course.ratingAverage} ({course.ratingCount})
                </span>
              )}
            </div>

            <p className="text-sm text-gray-400 mt-4">
              Taught by <span className="text-white font-medium">{course.instructorName}</span>
              {course.instructorTitle ? ` · ${course.instructorTitle}` : ''}
            </p>
          </div>

          {/* Enroll card */}
          <motion.aside initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl bg-card text-card-foreground border border-border shadow-2xl overflow-hidden">
              <img
                src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?fm=jpg&q=80&w=800&auto=format&fit=crop'}
                alt={course.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-6 space-y-4">
                <div className="flex items-baseline gap-2">
                  {course.isPaid ? (
                    <>
                      <span className="text-3xl font-extrabold">₹{course.discountPrice || course.price}</span>
                      {course.discountPrice > 0 && course.price > course.discountPrice && (
                        <span className="text-sm text-muted-foreground line-through">₹{course.price}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-3xl font-extrabold text-emerald-500">Free</span>
                  )}
                </div>

                {isEnrolled ? (
                  <>
                    {enrollment && (
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                          <span>Your progress</span>
                          <span>{enrollment.progressPercent}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${enrollment.progressPercent}%` }} />
                        </div>
                      </div>
                    )}
                    <Link href={`/learn/${course.slug}`} className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors">
                      {enrollment?.progressPercent > 0 ? 'Continue learning' : 'Start learning'} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={enroll}
                    disabled={enrolling}
                    className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {course.isPaid ? 'Enroll now' : 'Enroll for free'}
                  </button>
                )}

                <ul className="text-sm text-muted-foreground space-y-2 pt-2">
                  <li className="flex items-center gap-2"><PlayCircle className="w-4 h-4 text-orange-500" /> {lessonCount} recorded lessons</li>
                  <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" /> Lifetime access</li>
                  {course.certificateEnabled && (
                    <li className="flex items-center gap-2"><Award className="w-4 h-4 text-orange-500" /> Certificate of completion</li>
                  )}
                </ul>
              </div>
            </div>
          </motion.aside>
        </div>
      </section>

      {/* Body */}
      <section className="container mx-auto px-4 py-14 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {course.whatYouWillLearn?.length > 0 && (
            <div className="rounded-2xl border border-border p-6 md:p-8">
              <h2 className="text-xl font-bold mb-5">What you'll learn</h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {course.whatYouWillLearn.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Curriculum */}
          <div>
            <h2 className="text-xl font-bold mb-1">Course content</h2>
            <p className="text-sm text-muted-foreground mb-5">
              {course.modules?.length || 0} modules · {lessonCount} lessons
            </p>

            <div className="space-y-3">
              {(course.modules || []).map((mod, mi) => {
                const open = openModule === mi;
                return (
                  <div key={mod._id || mi} className="rounded-xl border border-border overflow-hidden">
                    <button
                      onClick={() => setOpenModule(open ? -1 : mi)}
                      className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-muted/40 hover:bg-muted/70 transition-colors text-left"
                    >
                      <span className="font-semibold text-sm">
                        <span className="text-orange-500 mr-2">{String(mi + 1).padStart(2, '0')}</span>
                        {mod.title}
                      </span>
                      <span className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground">{mod.lessons?.length || 0} lessons</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                      </span>
                    </button>

                    {open && (
                      <ul className="divide-y divide-border">
                        {(mod.lessons || []).map((l) => {
                          const Icon = LESSON_ICON[l.type] || PlayCircle;
                          const locked = l.locked && !isEnrolled;
                          return (
                            <li key={l._id} className="flex items-center gap-3 px-5 py-3 text-sm">
                              <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                              <span className={locked ? 'text-muted-foreground' : ''}>{l.title}</span>
                              {l.isPreview && !isEnrolled && (
                                <span className="text-[10px] uppercase font-semibold text-orange-500 border border-orange-500/40 rounded px-1.5 py-0.5">
                                  Preview
                                </span>
                              )}
                              <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                                {l.durationMinutes ? `${l.durationMinutes}m` : ''}
                                {locked && <Lock className="w-3.5 h-3.5" />}
                              </span>
                            </li>
                          );
                        })}
                        {(mod.lessons || []).length === 0 && (
                          <li className="px-5 py-3 text-sm text-muted-foreground">Content coming soon.</li>
                        )}
                      </ul>
                    )}
                  </div>
                );
              })}
              {(course.modules || []).length === 0 && (
                <p className="text-sm text-muted-foreground border border-dashed border-border rounded-xl p-6 text-center">
                  The curriculum for this course is being finalised.
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">About this course</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{course.description}</p>
          </div>

          {course.requirements?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-3">Requirements</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-1.5 text-sm">
                {course.requirements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border p-6">
            <h3 className="font-bold mb-3">Assessments</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Exams for this course are released with a code by your instructor. Enter it to begin your attempt.
            </p>
            <Link href="/exam" className="w-full inline-flex items-center justify-center gap-2 border border-orange-500/50 text-orange-500 hover:bg-orange-500/10 font-medium py-2.5 rounded-xl text-sm transition-colors">
              Enter exam code
            </Link>
          </div>

          {course.tags?.length > 0 && (
            <div className="rounded-2xl border border-border p-6">
              <h3 className="font-bold mb-3">Topics</h3>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((t) => (
                  <span key={t} className="text-xs bg-muted px-2.5 py-1 rounded-md text-muted-foreground">{t}</span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>

      <Footer />
    </div>
  );
}
