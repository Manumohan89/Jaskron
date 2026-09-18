import { motion } from 'framer-motion';
import { Mail, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { teamApi } from '@/services/teamService';
const defaultTeam = [{
  name: 'M Jeethendra Reddy',
  title: 'Executive Chair',
  bio: 'Executive Chair',
  image: '',
  social: {
    github: '',
    linkedin: '',
    twitter: ''
  }
}, {
  name: 'Richard U',
  title: 'Managing Director',
  bio: 'Managing Director',
  image: '',
  social: {
    github: '',
    linkedin: '',
    twitter: ''
  }
}, {
  name: 'Nanda Kumar DS',
  title: 'Treasurer',
  bio: 'Treasurer',
  image: '',
  social: {
    github: '',
    linkedin: '',
    twitter: ''
  }
}, {
  name: 'Shashank G',
  title: 'Technical Manager',
  bio: 'Technical Manager',
  image: '',
  social: {
    github: '',
    linkedin: '',
    twitter: ''
  }
}, {
  name: 'Y Uday Kumar',
  title: 'Digital Coordinator',
  bio: 'Digital Coordinator',
  image: '',
  social: {
    github: '',
    linkedin: '',
    twitter: ''
  }
}, {
  name: 'K Mohan',
  title: 'Webmaster',
  bio: 'Webmaster',
  image: '',
  social: {
    github: '',
    linkedin: '',
    twitter: ''
  }
}, {
  name: 'Darshini N',
  title: 'Joint Secretary',
  bio: 'Joint Secretary',
  image: '',
  social: {
    github: '',
    linkedin: '',
    twitter: ''
  }
}, {
  name: 'Pavani R',
  title: 'Advisor',
  bio: 'Advisor',
  image: '',
  social: {
    github: '',
    linkedin: '',
    twitter: ''
  }
}];
export default function TeamSection() {
  const [team, setTeam] = useState(defaultTeam);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadTeam = async () => {
      try {
        const data = await teamApi.getAll();
        setTeam(data.length > 0 ? data : defaultTeam);
      } catch (error) {
        console.error('Failed to load team:', error);
        setTeam(defaultTeam);
      } finally {
        setLoading(false);
      }
    };
    loadTeam();
  }, []);
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };
  return <section id="team" className="relative py-20 md:py-32 overflow-hidden" style={{
    backgroundImage: "url('https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5?fm=jpg&q=80&w=2000&auto=format&fit=crop')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6
      }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Meet Our <span className="gradient-text">Team</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Practitioners who teach what they build — engineers, analysts, researchers, and mentors
          </p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
        once: true
      }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member, index) => <motion.div key={index} variants={itemVariants} whileHover={{
          y: -8
        }} className="group relative overflow-hidden rounded-lg">
              <div className="relative p-6 rounded-lg bg-gradient-to-br from-gray-900/80 to-black border border-border hover:border-orange-500 transition-all duration-300 h-full">
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-orange-500/0 to-orange-600/0 group-hover:from-orange-500/10 group-hover:to-orange-600/10 transition-all duration-300" />

                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-orange-500 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-orange-500 text-sm font-semibold mb-4">
                    {member.title}
                  </p>

                  {member.bio && <p className="text-muted-foreground text-sm mb-4">
                      {member.bio}
                    </p>}

                  {member.certifications?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {member.certifications.map((cert) => (
                        <span key={cert} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-orange-500/10 text-orange-500 border border-orange-500/30 px-2 py-1 rounded-full">
                          <ShieldCheck className="w-3 h-3" /> {cert}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3">
                    {member.social?.linkedin && <a href={member.social.linkedin} className="flex items-center gap-2 text-muted-foreground hover:text-orange-500 transition-colors group/link">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm truncate">LinkedIn</span>
                      </a>}
                    {member.social?.github && <a href={member.social.github} className="flex items-center gap-2 text-muted-foreground hover:text-orange-500 transition-colors group/link">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm truncate">GitHub</span>
                      </a>}
                  </div>
                </div>
              </div>
            </motion.div>)}
        </motion.div>

        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6,
        delay: 0.4
      }} className="mt-16 p-8 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/30 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Get in Touch</h3>
          <p className="text-muted-foreground mb-4">
            Have questions? Contact us directly or reach out to any team member
          </p>
          <a href="mailto:jaskronsecureops@gmail.com" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-foreground font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300">
            <Mail className="w-5 h-5" />
            Email Us
          </a>
        </motion.div>
      </div>
    </section>;
}