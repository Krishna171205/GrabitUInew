import Link from 'next/link';
import { MS } from '@/components/gb/kit';

export default function NotFound() {
  return (
    <div className="gb-app" style={{ minHeight: '100dvh', background: 'var(--gb-surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gb-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MS name="search_off" size={30} color="var(--gb-ink)" />
      </div>
      <div className="gb-serif" style={{ fontSize: 24, fontWeight: 500, color: 'var(--gb-ink)', marginTop: 18 }}>Page not found</div>
      <p style={{ fontSize: 14, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 8, maxWidth: 280, lineHeight: 1.5 }}>
        That link is broken or the page has moved. Let&apos;s get you back to ordering.
      </p>
      <Link
        href="/home"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 22, background: 'var(--gb-primary)', color: 'var(--gb-on-primary)', fontSize: 14.5, fontWeight: 800, padding: '13px 22px', borderRadius: 13, textDecoration: 'none' }}
      >
        Go to home<MS name="arrow_forward" size={17} />
      </Link>
    </div>
  );
}
