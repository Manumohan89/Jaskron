import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  ArrowRight, Info, Users, Sparkles, GraduationCap, Briefcase, FileCog, Microscope, Images
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import PartnerLogos from '@/components/PartnerLogos';
import WhyChooseUs from '@/components/WhyChooseUs';
import TrustBadges from '@/components/TrustBadges';
import LmsPreview from '@/components/LmsPreview';
import FeaturedInternships from '@/components/FeaturedInternships';
import ServicesSection from '@/components/ServicesSection';
import SEO from '@/components/SEO';
import { CourseCard } from '@/pages/CoursesPage';
import { courseApi } from '@/services/courseService';
import { COMPANY } from '@/config/company';

const exploreCards = [
  { title: 'Courses', desc: 'Self-paced tracks with recorded sessions, labs, and certificates.', icon: GraduationCap, href: '/courses' },
  { title: 'Paid Internships', desc: 'Fee-based programmes with training, assessment, and certification.', icon: Briefcase, href: '/internships' },
  { title: 'Projects', desc: 'Final-year and AI/ML project support, documentation to viva.', icon: FileCog, href: '/projects' },
  { title: 'Research', desc: 'Literature review to journal submission, with a mentor.', icon: Microscope, href: '/research' },
  { title: 'About Us', desc: 'Our vision, mission, and the people behind JASKRON.', icon: Info, href: '/about' },
  { title: 'For Institutions', desc: 'Book a resource person for campus workshops and bootcamps.', icon: Users, href: '/institutions' },
  { title: 'Gallery', desc: 'Photos from our batches, workshops, and campus programmes.', icon: Images, href: '/gallery' },
  { title: 'Careers', desc: 'Open roles on our engineering and training teams.', icon: Briefcase, href: '/careers' }
];

function FeaturedCourses() {
  const [courses, setCourses] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    courseApi
      .getAll()
      .then((data) => setCourses((Array.isArray(data) ? data : []).slice(0, 4)))
      .catch(() => setCourses([]))
      .finally(() => setLoaded(true));
  }, []);

  // Nothing published yet — don't render an empty band on the homepage.
  if (loaded && courses.length === 0) return null;

  return (
    <section className="py-20 md:py-24 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-orange-500 text-xs font-semibold uppercase tracking-[0.2em] mb-2">E-Learning</p>
            <h2 className="text-3xl md:text-4xl font-bold">Popular courses right now</h2>
          </div>
          <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-500 hover:gap-2.5 transition-all">
            View all courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {!loaded ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl border border-border bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((c, i) => <CourseCard key={c._id} course={c} index={i} />)}
          </div>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <SEO path="/" />
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <Navigation />
        <HeroSection />
        <TrustBadges />
        <FeaturedInternships />
        <WhyChooseUs />
        <ServicesSection />
        <FeaturedCourses />
        <LmsPreview />
        <PartnerLogos />
        <TestimonialsCarousel />

        {/* Explore */}
        <section className="relative py-20 md:py-28 bg-background overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-5" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-orange-500 text-xs font-medium tracking-wide uppercase">Explore JASKRON</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Everything you need, <span className="gradient-text">one click away</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Whether you're learning, building, hiring, or researching — there's a track here for it.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {exploreCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link href={card.href} className="group block h-full">
                    <div className="relative h-full p-6 rounded-2xl border border-border bg-card hover:border-orange-500/40 hover:shadow-lg transition-all duration-300 overflow-hidden">
                      <card.icon className="w-9 h-9 text-orange-500 mb-4 transition-transform group-hover:-translate-y-1 group-hover:scale-110 duration-300" />
                      <h3 className="text-lg font-bold mb-1.5 group-hover:text-orange-500 transition-colors">{card.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">{card.desc}</p>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-orange-500 group-hover:gap-2 transition-all">
                        Explore <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-24 border-t border-border overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?fm=jpg&q=80&w=2000&auto=format&fit=crop')" }}
          />
          <div className="absolute inset-0 bg-background/92 dark:bg-background/90" />
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-[#16233D]/10" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold mb-4">
              {COMPANY.mission}
            </motion.h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Create a free account to enroll in courses, track your progress, take exams, and collect your certificates.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/login" className="btn-neon inline-flex items-center gap-2">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/internships" className="inline-flex items-center gap-2 bg-muted/60 hover:bg-muted border border-border hover:border-orange-500/40 text-foreground font-medium px-6 py-3 rounded-xl transition-all duration-200">
                <Briefcase className="w-4 h-4" /> Explore paid internships
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
