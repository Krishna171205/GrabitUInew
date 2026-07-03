import Link from 'next/link';
import { MS } from './kit';
import { ph } from './data';

/** Soft scroll-gate teaser shown to guests after the first few café cards. */
export function CafeGate({ next, coverHeight = 158 }: { next: string; coverHeight?: number }) {
  return (
    <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', marginTop: 16, boxShadow: 'var(--gb-shadow-card)' }}>
      <div style={{ position: 'relative', height: coverHeight, filter: 'blur(6px) saturate(0.8)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ph('photo-1521017432531-fbd92d768814', 900, 560)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,10,5,.55)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '0 24px', textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,.16)', display: 'grid', placeItems: 'center' }}>
          <MS name="storefront" size={24} color="#fff" />
        </div>
        <div className="gb-serif" style={{ fontSize: 17, fontWeight: 500, color: '#fff' }}>Log in to see all cafés near you</div>
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          style={{ background: 'var(--gb-primary)', color: '#fff', fontSize: 13.5, fontWeight: 800, padding: '10px 20px', borderRadius: 999 }}
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
