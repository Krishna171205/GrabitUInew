// grabit/src/components/landing/Hero.tsx
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const item = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 220, damping: 24 } },
};

export default function Hero() {
  return (
    <section style={{ position: 'relative', minHeight: '92dvh', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
      <Image
        src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=90"
        alt="Café counter with fresh coffee"
        fill priority className="object-cover" style={{ objectFit: 'cover' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(30,18,12,.35) 0%, rgba(30,18,12,0) 30%, rgba(30,18,12,.88) 100%)' }} />
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
          <Link href="/home" style={{ background: 'var(--gb-primary)', color: '#fff', fontSize: 16, fontWeight: 800, padding: '15px 26px', borderRadius: 999 }}>Browse cafés</Link>
          <Link href="/partner" style={{ background: 'rgba(255,255,255,.14)', color: '#fff', fontSize: 16, fontWeight: 700, padding: '15px 26px', borderRadius: 999, backdropFilter: 'blur(8px)' }}>Partner with us</Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
