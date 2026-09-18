import { useEffect, useState } from 'react';
import { partnerApi } from '@/services/partnerService';

export default function PartnerLogos() {
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    partnerApi.getAll().then(setPartners).catch(() => setPartners([]));
  }, []);

  if (partners.length === 0) return null;

  // Duplicate the list so the CSS marquee loop is seamless
  const track = [...partners, ...partners];

  return (
    <section className="py-12 border-y border-border bg-muted/20 overflow-hidden">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8">
          Trusted by teams at
        </p>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        <div className="flex gap-16 w-max animate-marquee">
          {track.map((p, i) => (
            <a
              key={`${p._id}-${i}`}
              href={p.website || '#'}
              target={p.website ? '_blank' : undefined}
              rel="noreferrer"
              className="grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all shrink-0 flex items-center"
              title={p.name}
            >
              <img src={p.logo} alt={p.name} className="h-8 md:h-10 w-auto object-contain" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
