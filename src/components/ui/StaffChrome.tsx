'use client';
/**
 * Grabit staff chrome, responsive.
 *  >= 1024px: prototype desktop shell (sidebar + top bar).
 *  < 1024px:  mobile header + bottom tab bar (legacy layout).
 * Presentational; routing via slug-aware Next Links.
 */
import type { ReactNode } from 'react';
import Link from 'next/link';
import { GrabitLogo, Icon } from './Icon';

export type StaffTab = 'queue' | 'history' | 'menumgmt' | 'slots' | 'analytics';

const NAV: { k: StaffTab; label: string; short: string; icon: (typeof Icon)[string]; path: string }[] = [
  { k: 'queue',     label: 'Live Queue', short: 'Queue',  icon: Icon.grid,    path: '' },
  { k: 'history',   label: 'Orders',     short: 'Orders', icon: Icon.receipt, path: '/orders' },
  { k: 'menumgmt',  label: 'Menu',       short: 'Menu',   icon: Icon.menu,    path: '/menu' },
  { k: 'slots',     label: 'Slots',      short: 'Slots',  icon: Icon.slots,   path: '/slots' },
  { k: 'analytics', label: 'Analytics',  short: 'Stats',  icon: Icon.chart,   path: '/analytics' },
];

export function StaffChrome({
  slug, active, cafeName, title, sub, right, children, newCount = 0,
}: {
  slug: string;
  active: StaffTab;
  cafeName?: string;
  title?: ReactNode;
  sub?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  newCount?: number;
}) {
  const href = (t: typeof NAV[number]) => `/${slug}/manage${t.path}`;
  return (
    <div className="gb-staff">
      <style>{`
        .gb-staff { min-height: 100dvh; background: var(--surface); display: flex; flex-direction: column; }
        .gb-staff-sidebar { display: none; }
        .gb-staff-mobtop { display: flex; }
        .gb-staff-tabs { display: flex; }
        .gb-staff-desktoptop { display: none; }
        @media (min-width: 1024px) {
          .gb-staff { flex-direction: row; height: 100dvh; overflow: hidden; }
          .gb-staff-sidebar { display: flex; }
          .gb-staff-mobtop, .gb-staff-tabs { display: none; }
          .gb-staff-desktoptop { display: flex; }
          .gb-staff-main { height: 100dvh; }
        }
      `}</style>

      {/* Desktop sidebar */}
      <aside className="gb-staff-sidebar" style={{ width: 236, flex: 'none', background: 'var(--surface-card)', borderRight: '1px solid var(--hairline)', flexDirection: 'column', padding: '20px 16px' }}>
        <div style={{ padding: '4px 8px 22px' }}><GrabitLogo height={26} /></div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(n => {
            const on = active === n.k;
            return (
              <Link key={n.k} href={href(n)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 'var(--r-md)', background: on ? 'var(--primary-tint)' : 'transparent', color: on ? 'var(--primary)' : 'var(--on-surface-variant)', fontWeight: on ? 700 : 600, fontSize: 14.5 }}>
                {n.icon({ size: 21, sw: on ? 2 : 1.7 })}
                <span style={{ flex: 1 }}>{n.label}</span>
                {n.k === 'queue' && newCount > 0 && <span className="tabular" style={{ minWidth: 20, height: 20, padding: '0 5px', borderRadius: 10, background: 'var(--primary)', color: '#fff', fontSize: 11.5, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{newCount}</span>}
              </Link>
            );
          })}
        </nav>
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--hairline)', paddingTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--primary-tint)', display: 'grid', placeItems: 'center', color: 'var(--primary)' }}>{Icon.flame({ size: 20 })}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t-label" style={{ fontSize: 13.5 }}>{cafeName || 'Cafe'}</div>
            <div className="t-caption" style={{ fontSize: 11.5 }}>Staff console</div>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="gb-staff-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile header */}
        <header className="gb-staff-mobtop" style={{ alignItems: 'center', gap: 10, height: 56, padding: '0 16px', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '0.5px solid var(--glass-border)', flex: 'none' }}>
          <GrabitLogo height={22} />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>{right}</div>
        </header>

        {/* Desktop top bar */}
        <header className="gb-staff-desktoptop" style={{ height: 68, flex: 'none', alignItems: 'center', padding: '0 28px', borderBottom: '1px solid var(--hairline)', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          <div>
            {title && <div className="t-title" style={{ fontSize: 21 }}>{title}</div>}
            {sub && <div className="t-caption" style={{ marginTop: 1 }}>{sub}</div>}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>{right}</div>
        </header>

        {/* Content */}
        <div className="noscroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>{children}</div>

        {/* Mobile bottom tabs */}
        <nav className="gb-staff-tabs" style={{ background: 'var(--inverse-surface)', borderTop: '1px solid rgba(255,255,255,0.07)', flex: 'none' }}>
          {NAV.map(n => {
            const on = active === n.k;
            return (
              <Link key={n.k} href={href(n)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '9px 2px', color: on ? 'var(--inverse-primary)' : 'rgba(255,255,255,0.4)' }}>
                {n.icon({ size: 21, sw: on ? 2 : 1.6 })}
                <span style={{ fontSize: 9.5, fontWeight: on ? 700 : 500, letterSpacing: '0.03em' }}>{n.short}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
