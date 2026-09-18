import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { COMPANY, SERVICES, STATS } from '@/config/company';

export default function AboutSection() {
  const features = SERVICES.map((s) => s.title);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="about" className="relative py-20 md:py-28 bg-background overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-5" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-orange-500 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            {COMPANY.pillars.join(' · ')}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            About <span className="gradient-text">JASKRON</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{COMPANY.vision}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold mb-4 text-orange-500">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                {COMPANY.mission} {COMPANY.legalName} works across skill development, internships, project
                development, workshops, e-learning, research, and corporate training — so a learner can move from
                first lesson to shipped project to published paper without changing partners.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 text-orange-500">What We Offer</h3>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid sm:grid-cols-2 gap-x-6 gap-y-3"
              >
                {features.map((feature) => (
                  <motion.div key={feature} variants={itemVariants} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 text-orange-500">Our Values</h3>
              <div className="flex flex-wrap gap-2">
                {COMPANY.values.map((v) => (
                  <span key={v} className="text-sm border border-border rounded-full px-4 py-1.5 text-muted-foreground">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden border border-border">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?fm=jpg&q=80&w=1200&auto=format&fit=crop"
                alt="JASKRON learners and mentors collaborating"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-[-4rem] relative z-10 px-4">
              {STATS.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.04 }}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-4 text-center shadow-xl"
                >
                  <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                  <p className="text-muted-foreground text-xs">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
