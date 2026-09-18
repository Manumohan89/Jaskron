import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  GraduationCap, Users, FileCog, Presentation, Mic, MonitorPlay, Lightbulb, Building2,
  ArrowRight, Shield
} from 'lucide-react';
import { SERVICES } from '@/config/company';

const iconMap = {
  GraduationCap, Users, FileCog, Presentation, Mic, MonitorPlay, Lightbulb, Building2, Shield
};

const accentClasses = {
  sky: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
  orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  violet: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
  rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  green: 'text-green-600 bg-green-500/10 border-green-500/20'
};

export default function ServicesSection({ showHeading = true, limit }) {
  const items = limit ? SERVICES.slice(0, limit) : SERVICES;

  return (
    <section id="services" className="relative py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {showHeading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-orange-500 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
              Service Catalog
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Everything we do, under <span className="gradient-text">one roof</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Eight service lines spanning learning, building, and research — for students, institutions, and
              companies.
            </p>
          </motion.div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((service, index) => {
            const Icon = iconMap[service.icon] || Shield;
            const accent = accentClasses[service.accent] || accentClasses.orange;
            return (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(index * 0.06, 0.4) }}
              >
                <Link href={`/services/${service.slug}`} className="group block h-full">
                  <div className="h-full rounded-2xl border border-border bg-card overflow-hidden hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 flex flex-col">
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10" />
                      <span className="absolute top-3 left-3 text-white/90 font-mono text-xs font-bold tracking-widest">
                        {service.number}
                      </span>
                      <div className={`absolute -bottom-5 left-4 w-11 h-11 rounded-xl border backdrop-blur-md flex items-center justify-center ${accent}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="p-5 pt-8 flex flex-col flex-1">
                      <h3 className="font-bold text-base mb-2 group-hover:text-orange-500 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{service.summary}</p>

                      <ul className="space-y-1.5 mb-4">
                        {service.features.slice(0, 3).map((f) => (
                          <li key={f} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                        {service.features.length > 3 && (
                          <li className="text-xs text-muted-foreground/70 pl-3">
                            +{service.features.length - 3} more
                          </li>
                        )}
                      </ul>

                      <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-orange-500 group-hover:gap-2 transition-all">
                        Learn more <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 text-center"
        >
          <Link href="/contact" className="btn-neon inline-block">
            Request a custom program
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
