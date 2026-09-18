import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';

// Animates a number counting up when it scrolls into view. Accepts values like
// "500+", "99.9%", "24/7" — parses out the numeric part and animates that,
// keeping any prefix/suffix (like "+" or "%") intact.
export default function AnimatedCounter({ value, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [display, setDisplay] = useState('0');

  const match = String(value).match(/^([^\d]*)([\d.]+)(.*)$/);
  const prefix = match?.[1] ?? '';
  const numeric = match ? parseFloat(match[2]) : 0;
  const suffix = match?.[3] ?? '';
  const decimals = match?.[2]?.includes('.') ? match[2].split('.')[1].length : 0;

  useEffect(() => {
    if (!isInView || !match) {
      if (!match) setDisplay(String(value));
      return;
    }
    const controls = animate(0, numeric, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v.toFixed(decimals))
    });
    return () => controls.stop();
  }, [isInView]);

  return (
    <span ref={ref} className={className}>
      {prefix}{display}{suffix}
    </span>
  );
}
