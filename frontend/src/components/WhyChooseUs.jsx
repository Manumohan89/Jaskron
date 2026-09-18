import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Target, Flag, Gem, ArrowRight, Users2, TrendingUp, BadgeCheck } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';
import { COMPANY, STATS } from '@/config/company';

export default function WhyChooseUs() {
  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <p className="text-orange-500 text-xs font-semibold uppercase tracking-[0.2em] mb-2">Why JASKRON</p>
          <h2 className="text-3xl md:text-4xl font-bold">Learning that ends in something you can show</h2>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden border border-border group min-h-[320px]"
          >
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?fm=jpg&q=80&w=1600&auto=format&fit=crop"
              alt="Learners working together on a project"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
            <div className="relative z-10 p-8 flex flex-col justify-end h-full">
              <BadgeCheck className="w-8 h-8 text-orange-400 mb-3" />
              <h3 className="text-2xl font-bold text-white mb-2">Taught by people who ship</h3>
              <p className="text-gray-300 text-sm max-w-md">
                Every track is designed and delivered by working practitioners — engineers, analysts, and
                researchers — so what you learn matches what teams actually hire for.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-border bg-muted/30 p-6 flex flex-col justify-between"
          >
            <Users2 className="w-7 h-7 text-orange-500 mb-3" />
            <div>
              <h3 className="font-bold text-foreground mb-1">Built for institutions</h3>
              <p className="text-sm text-muted-foreground">
                Bulk seats, campus bootcamps, custom curriculum, and batch-wise completion reporting.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl border border-border bg-gradient-to-br from-orange-500/10 to-transparent p-6 flex flex-col justify-between"
          >
            <TrendingUp className="w-7 h-7 text-orange-500 mb-3" />
            <div>
              <h3 className="font-bold text-foreground mb-1">Assessed, not assumed</h3>
              <p className="text-sm text-muted-foreground">
                Code-based exams, graded labs, and progress tracking — so completion means something.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <AnimatedCounter
                value={s.value}
                className="block text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent"
              />
              <p className="text-xs md:text-sm text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Vision / Mission / Values */}
        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {[
            { icon: Target, title: 'Our Vision', body: COMPANY.vision },
            { icon: Flag, title: 'Our Mission', body: COMPANY.mission },
            { icon: Gem, title: 'Our Values', body: COMPANY.values.join(' · ') }
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border p-6 bg-card"
            >
              <card.icon className="w-7 h-7 text-orange-500 mb-3" />
              <h3 className="font-bold mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.body}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <Link href="/enterprise" className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-500 hover:text-orange-500 font-medium text-sm">
            See how we work with colleges and companies <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
