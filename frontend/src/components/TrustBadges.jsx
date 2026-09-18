import { motion } from 'framer-motion';
import { BadgeCheck, ShieldCheck, Landmark } from 'lucide-react';
import { CERTIFICATIONS } from '@/config/company';

const ICONS = { dpiit: Landmark, msme: BadgeCheck, 'iso-ready': ShieldCheck };

/**
 * Government recognition strip — DPIIT, MSME, and process accreditation.
 * `variant="compact"` renders a single inline row for the footer.
 */
export default function TrustBadges({ variant = 'full', className = '' }) {
  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}>
        {CERTIFICATIONS.map((c) => {
          const Icon = ICONS[c.key] || BadgeCheck;
          return (
            <span key={c.key} className="inline-flex items-center gap-1.5 text-xs text-gray-400">
              <Icon className="w-3.5 h-3.5 text-orange-500" />
              {c.label}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <section className={`py-12 border-y border-border bg-muted/30 ${className}`}>
      <div className="container mx-auto px-4">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
          Registered &amp; Recognised
        </p>
        <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {CERTIFICATIONS.map((c, i) => {
            const Icon = ICONS[c.key] || BadgeCheck;
            return (
              <motion.div
                key={c.key}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-border bg-card p-5 text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="font-bold text-sm mb-1.5">{c.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
