import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import ServicesSection from '@/components/ServicesSection';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Services" description="Skill development, internships, projects, workshops, guest sessions, e-learning, research, and corporate training." path="/services" />
      <Navigation />
      <PageHero
        eyebrow="What We Offer"
        title="Our"
        highlight="Services"
        description="Eight service lines across learning, building, and research — for students, institutions, and companies."
        image="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?fm=jpg&q=80&w=2000&auto=format&fit=crop"
      />
      <ServicesSection />
      <Footer />
    </div>
  );
}
