// grabit/src/components/landing/LandingFooter.tsx
'use client';
import Link from 'next/link';
import { MS } from '@/components/gb/kit';

export default function LandingFooter() {
  return (
    <footer style={{ background: 'var(--gb-ink)', color: 'rgba(255,255,255,.7)', padding: '48px 22px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MS name="storefront" size={22} color="var(--gb-peach)" />
          <span className="gb-serif" style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>Grabit</span>
        </div>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 20, fontSize: 14, fontWeight: 600 }}>
          <Link href="/home" style={{ color: 'rgba(255,255,255,.7)' }}>Browse cafés</Link>
          <Link href="/partner" style={{ color: 'rgba(255,255,255,.7)' }}>Partner with us</Link>
        </nav>
      </div>
      <div style={{ maxWidth: 1120, margin: '24px auto 0', fontSize: 12.5, color: 'rgba(255,255,255,.45)' }}>© 2026 Grabit. Now in Delhi. Grabit is a product of Unified Nexgrade Private Limited.</div>
    </footer>
  );
}
