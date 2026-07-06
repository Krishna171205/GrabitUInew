// grabit/src/components/landing/PartnerPitch.tsx
'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MS } from '@/components/gb/kit';

const BENEFITS = [
  { icon: 'point_of_sale', title: 'Your own POS', body: 'Grabit orders land in your Omega POS at the counter, next to your walk-in orders.' },
  { icon: 'savings', title: 'Keep your margin', body: 'A direct pre-order channel, not a commission-heavy aggregator listing.' },
  { icon: 'notifications_active', title: 'Never miss an order', body: 'A tablet at the counter alerts you the moment a pickup order comes in.' },
];

// Section palette — swap this block to change the whole section's mood.
// OPTION 3 — Light cream + accents
const T = {
  bg: 'linear-gradient(180deg, #FFF7EC 0%, #FDEED6 100%)',
  label: '#E08A1E',
  text: '#241612',
  body: 'rgba(36,22,18,.66)',
  cardBg: '#ffffff',
  cardBorder: 'rgba(36,22,18,.10)',
  cardHoverBg: '#ffffff',
  cardHoverBorder: 'rgba(255,177,0,.55)',
  cardShadow: '0 22px 48px -18px rgba(120,70,0,.20)',
  icon: 'var(--gb-primary)',
  ctaBg: 'var(--gb-ink)',
  ctaText: '#fff',
};

export default function PartnerPitch() {
  return (
    <section style={{ background: T.bg, color: T.text, padding: '88px 22px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ maxWidth: 560 }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: T.label }}>For cafés</span>
          <h2 className="gb-serif" style={{ fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 600, lineHeight: 1.1, margin: '12px 0 16px' }}>
            Run a café? Own your orders.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: T.body, margin: '0 0 32px' }}>
            Take pre-orders from customers before they arrive, and manage them right at your counter.
          </p>
        </div>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr', marginBottom: 36 }} className="gb-partner-grid">
          {BENEFITS.map((b) => (
            <motion.div key={b.title}
              whileHover={{ y: -6, scale: 1.02, backgroundColor: T.cardHoverBg, borderColor: T.cardHoverBorder, boxShadow: T.cardShadow }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              style={{ backgroundColor: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: 'var(--gb-r-card)', padding: 24, cursor: 'pointer' }}>
              <MS name={b.icon} size={28} fill color={T.icon} />
              <h3 className="gb-serif" style={{ fontSize: 19, fontWeight: 600, margin: '14px 0 6px', color: T.text }}>{b.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.5, color: T.body, margin: 0 }}>{b.body}</p>
            </motion.div>
          ))}
        </div>
        <Link href="/partner" className="gb-hover-btn" style={{ display: 'inline-block', background: T.ctaBg, color: T.ctaText, fontSize: 16, fontWeight: 800, padding: '15px 28px', borderRadius: 999 }}>Partner with us</Link>
      </div>
    </section>
  );
}
