import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import TeamSection from '@/components/TeamSection';

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Our Team" description="Meet the trainers, mentors, and engineers behind JASKRON Technologies Pvt. Ltd." path="/team" />
      <Navigation />
      <PageHero
        eyebrow="The People"
        title="Meet Our"
        highlight="Team"
        description="Practitioners who teach what they build — engineers, analysts, researchers, and programme coordinators."
        image="https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5?fm=jpg&q=80&w=2000&auto=format&fit=crop"
      />
      <TeamSection />
      <Footer />
    </div>
  );
}
