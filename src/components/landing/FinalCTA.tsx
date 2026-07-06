// grabit/src/components/landing/FinalCTA.tsx
'use client';
import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section style={{ background: 'var(--gb-surface)', padding: '88px 22px', textAlign: 'center' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h2 className="gb-serif" style={{ fontSize: 'clamp(30px, 6vw, 52px)', fontWeight: 600, letterSpacing: '-.015em', margin: '0 0 24px', color: 'var(--gb-text-strong)' }}>
          Your coffee, ready when you are.
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          <Link href="/home" className="gb-hover-btn" style={{ background: 'var(--gb-primary)', color: '#fff', fontSize: 16, fontWeight: 800, padding: '15px 28px', borderRadius: 999 }}>Start ordering</Link>
          <Link href="/partner" className="gb-hover-btn" style={{ background: 'var(--gb-card)', color: 'var(--gb-text)', border: '1px solid var(--gb-line-3)', fontSize: 16, fontWeight: 700, padding: '15px 28px', borderRadius: 999 }}>Partner with us</Link>
        </div>
      </div>
    </section>
  );
}
