// grabit/src/components/landing/TrustBand.tsx
'use client';
import { MS } from '@/components/gb/kit';

const PILLARS = [
  { icon: 'bolt', label: 'Skip the wait' },
  { icon: 'payments', label: 'Pay online or at counter' },
  { icon: 'chat', label: 'WhatsApp updates' },
];

export default function TrustBand() {
  return (
    <section style={{ background: 'var(--gb-surface)', padding: '40px 22px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center' }}>
        {PILLARS.map((p) => (
          <div key={p.label} className="gb-hover-soft" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 999 }}>
            <MS name={p.icon} size={24} fill color="var(--gb-primary)" />
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--gb-text)' }}>{p.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
