'use client';
/**
 * Grabit: phone chrome: scroll body, frosted top bar, sticky CTA dock, cart badge.
 * Presentational only; screens own routing (Next Link / router).
 */
import type { ReactNode, CSSProperties } from 'react';

/** Absolute-fill scroll body. */
export function Body({ children, pb = 96, style }: { children: ReactNode; pb?: number; style?: CSSProperties }) {
  return (
    <div
      className="noscroll"
      style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden', background: 'var(--surface)', paddingBottom: pb, scrollBehavior: 'smooth', ...style }}
    >
      {children}
    </div>
  );
}

/** Frosted sticky top bar. */
export function TopBar({
  title, onBack, right, transparent, dark,
}: { title?: ReactNode; onBack?: () => void; right?: ReactNode; transparent?: boolean; dark?: boolean }) {
  return (
    <div
      style={{
        position: 'sticky', top: 0, zIndex: 30, height: 52, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8,
        background: transparent ? 'transparent' : 'var(--glass-bg)',
        backdropFilter: transparent ? 'none' : 'blur(20px)', WebkitBackdropFilter: transparent ? 'none' : 'blur(20px)',
        borderBottom: transparent ? 'none' : '0.5px solid var(--glass-border)',
      }}
    >
      {onBack ? (
        <button
          onClick={onBack}
          aria-label="Back"
          style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', background: transparent ? 'rgba(255,255,255,0.9)' : 'transparent', color: dark ? '#fff' : 'var(--on-surface)', boxShadow: transparent ? '0 1px 4px rgba(0,0,0,.15)' : 'none' }}
        >
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
      ) : <div style={{ width: 4 }} />}
      <div className="t-headline-card" style={{ flex: 1, textAlign: 'center', color: dark ? '#fff' : 'var(--on-surface)', fontSize: 16, opacity: title ? 1 : 0 }}>{title}</div>
      <div style={{ width: 36, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
}

/** Sticky bottom CTA dock with fade. */
export function Dock({ children, offset = 0 }: { children: ReactNode; offset?: number }) {
  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: offset, zIndex: 35, padding: '12px 20px 16px', maxWidth: 480, margin: '0 auto', background: 'linear-gradient(to top, var(--surface) 62%, transparent)' }}>
      {children}
    </div>
  );
}

/** Cart count badge (absolute, over an icon). */
export function Badge({ n }: { n: number }) {
  return (
    <span
      className="tabular"
      style={{ position: 'absolute', top: 2, right: 0, minWidth: 17, height: 17, padding: '0 4px', borderRadius: 9, background: 'var(--primary)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center', boxShadow: '0 0 0 2px var(--surface)' }}
    >
      {n}
    </span>
  );
}
