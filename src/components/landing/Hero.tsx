// grabit/src/components/landing/Hero.tsx
'use client';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

// Poster served through the Next image optimizer (same-origin, CSP-safe) for instant first paint.
const POSTER = `/_next/image?url=${encodeURIComponent('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=90')}&w=1920&q=80`;

const item = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 220, damping: 24 } },
};

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  // Scroll-linked parallax depth (dock.cool style): image drifts + zooms slower than the page.
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.16]);
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);

  return (
    <section ref={sectionRef} style={{ position: 'relative', minHeight: '92dvh', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
      <motion.div style={{ position: 'absolute', inset: '-14% 0', scale: imgScale, y: imgY, willChange: 'transform' }}>
        <video
          autoPlay={!reduced} muted loop playsInline preload="metadata" poster={POSTER}
          aria-label="Man grabbing coffee from a cafe counter"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        >
          <source src="/hero-cafe.mp4" type="video/mp4" />
        </video>
      </motion.div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(30,18,12,.35) 0%, rgba(30,18,12,0) 30%, rgba(30,18,12,.88) 100%)' }} />
      {/* Marigold wash — ties the hero to the footer's brand grade */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,177,0,.14) 0%, transparent 45%)', mixBlendMode: 'soft-light', pointerEvents: 'none' }} />
      <motion.div
        style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 1120, margin: '0 auto', padding: '0 22px 64px' }}
        initial="hidden" animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }}
      >
        <motion.span variants={item} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--gb-primary)', color: '#fff', fontSize: 12, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', padding: '6px 12px', borderRadius: 999, marginBottom: 18 }}>
          Now in Delhi
        </motion.span>
        <motion.h1 variants={item} className="gb-serif" style={{ color: '#fff', fontSize: 'clamp(40px, 8vw, 76px)', fontWeight: 600, lineHeight: 1.05, letterSpacing: '-.02em', maxWidth: 680, margin: 0 }}>
          Order ahead.<br /><span style={{ fontStyle: 'italic', color: 'var(--gb-peach)' }}>Skip the queue.</span>
        </motion.h1>
        <motion.p variants={item} style={{ color: 'rgba(255,255,255,.85)', fontSize: 18, lineHeight: 1.5, maxWidth: 460, margin: '18px 0 0' }}>
          Pre-order from cafés near you. It is ready when you arrive.
        </motion.p>
        <motion.div variants={item} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 30 }}>
          <Link href="/home" className="gb-hover-btn" style={{ background: 'var(--gb-primary)', color: '#fff', fontSize: 16, fontWeight: 800, padding: '15px 26px', borderRadius: 999 }}>Browse cafés</Link>
          <Link href="/partner" className="gb-hover-btn" style={{ background: 'rgba(255,255,255,.14)', color: '#fff', fontSize: 16, fontWeight: 700, padding: '15px 26px', borderRadius: 999, backdropFilter: 'blur(8px)' }}>Partner with us</Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
