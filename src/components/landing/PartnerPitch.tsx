// grabit/src/components/landing/PartnerPitch.tsx
'use client';
import Link from 'next/link';
import { MS } from '@/components/gb/kit';

const BENEFITS = [
  { icon: 'point_of_sale', title: 'Your own POS', body: 'Grabit orders land in your Omega POS at the counter, next to your walk-in orders.' },
  { icon: 'savings', title: 'Keep your margin', body: 'A direct pre-order channel, not a commission-heavy aggregator listing.' },
  { icon: 'notifications_active', title: 'Never miss an order', body: 'A tablet at the counter alerts you the moment a pickup order comes in.' },
];

export default function PartnerPitch() {
  return (
    <section style={{ background: 'var(--gb-hero)', color: '#fff', padding: '88px 22px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ maxWidth: 560 }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gb-peach)' }}>For cafés</span>
          <h2 className="gb-serif" style={{ fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 600, lineHeight: 1.1, margin: '12px 0 16px' }}>
            Run a café? Own your orders.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: 'rgba(255,255,255,.78)', margin: '0 0 32px' }}>
            Take pre-orders from customers before they arrive, and manage them right at your counter.
          </p>
        </div>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr', marginBottom: 36 }} className="gb-partner-grid">
          {BENEFITS.map((b) => (
            <div key={b.title} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 'var(--gb-r-card)', padding: 24 }}>
              <MS name={b.icon} size={28} fill color="var(--gb-peach)" />
              <h3 className="gb-serif" style={{ fontSize: 19, fontWeight: 600, margin: '14px 0 6px' }}>{b.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.5, color: 'rgba(255,255,255,.7)', margin: 0 }}>{b.body}</p>
            </div>
          ))}
        </div>
        <Link href="/partner" style={{ display: 'inline-block', background: '#fff', color: 'var(--gb-ink)', fontSize: 16, fontWeight: 800, padding: '15px 28px', borderRadius: 999 }}>Partner with us</Link>
      </div>
    </section>
  );
}
