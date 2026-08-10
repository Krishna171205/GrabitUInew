// grabbit/src/components/landing/LandingNav.tsx
'use client';
import Link from 'next/link';
import { MS } from '@/components/gb/kit';

export default function LandingNav() {
  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(250,246,240,.82)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--gb-line-2)',
      }}
    >
      <nav style={{ maxWidth: 1120, margin: '0 auto', height: 68, padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MS name="storefront" size={24} color="var(--gb-primary)" />
          <span className="gb-serif" style={{ fontSize: 22, fontWeight: 600, color: 'var(--gb-ink)' }}>Grabbit</span>
        </Link>
        <div className="gb-nav-center" style={{ display: 'none', alignItems: 'center', gap: 28 }}>
          <a href="#how-it-works" className="gb-hover-link" style={{ fontSize: 14, fontWeight: 700, color: 'var(--gb-muted)' }}>How it works</a>
          <Link href="/partner" className="gb-hover-link" style={{ fontSize: 14, fontWeight: 700, color: 'var(--gb-muted)' }}>For cafés</Link>
          <Link href="/faq" className="gb-hover-link" style={{ fontSize: 14, fontWeight: 700, color: 'var(--gb-muted)' }}>FAQ</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/partner" style={{ display: 'none', fontSize: 14, fontWeight: 700, color: 'var(--gb-muted)', padding: '9px 12px' }} className="gb-nav-partner gb-hover-link">
            Partner with us
          </Link>
          <Link href="/home" className="gb-hover-btn" style={{ background: 'var(--gb-ink)', color: '#fff', fontSize: 14, fontWeight: 800, padding: '10px 18px', borderRadius: 999 }}>
            Browse cafés
          </Link>
        </div>
      </nav>
    </header>
  );
}
