import { motion } from 'framer-motion';

export default function PageHero({ eyebrow, title, highlight, description, image }) {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden bg-background">
      {image && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.14] dark:opacity-[0.2]"
            style={{ backgroundImage: `url('${image}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background to-background" />
        </>
      )}
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div className="absolute top-0 left-1/3 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        {eyebrow && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-5"
          >
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-orange-500 text-xs font-medium tracking-wide uppercase">{eyebrow}</span>
          </motion.div>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4"
        >
          {title} {highlight && <span className="gradient-text">{highlight}</span>}
        </motion.h1>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            {description}
          </motion.p>
        )}
      </div>
    </section>
  );
}
