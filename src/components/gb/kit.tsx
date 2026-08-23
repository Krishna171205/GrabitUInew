'use client';
/**
 * Grabbit consumer app, shared UI kit for the warm editorial theme.
 * Faithful to Design References/grabbit-designs. Style via --gb-* vars
 * (globals.css, scoped to .gb-app). Icons = Material Symbols Rounded.
 */
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';

/* ---------- Material Symbol ---------- */
export function MS({
  name, size = 22, fill, color, className, style,
}: {
  name: string; size?: number; fill?: boolean; color?: string;
  className?: string; style?: CSSProperties;
}) {
  return (
    <span
      className={`gb-ms${fill ? ' gb-fill' : ''}${className ? ' ' + className : ''}`}
      style={{ fontSize: size, color, ...style }}
    >
      {name}
    </span>
  );
}

/* ---------- Bottom tab nav ---------- */
const TABS = [
  { href: '/home', icon: 'home', label: 'Home' },
  { href: '/explore', icon: 'search', label: 'Explore' },
  { href: '/orders', icon: 'receipt_long', label: 'Orders' },
  { href: '/profile', icon: 'person', label: 'Profile' },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="gb-bottomnav gb-glass"
      style={{ padding: '11px 14px calc(26px + env(safe-area-inset-bottom))' }}
    >
      {TABS.map((t) => {
        const active = pathname === t.href || pathname.startsWith(t.href + '/');
        const color = active ? 'var(--gb-primary)' : 'var(--gb-nav-inactive)';
        return (
          <Link
            key={t.href}
            href={t.href}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
          >
            <MS name={t.icon} size={25} fill={active} color={color} />
            <span style={{ fontSize: 10.5, fontWeight: 700, color }}>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Spacer so scrollable content clears the fixed BottomNav (mobile only, desktop uses DesktopTopNav). */
export function NavSpacer() {
  return <div className="gb-nav-spacer" style={{ height: 'calc(var(--gb-bottomnav-h, 84px) + 12px + env(safe-area-inset-bottom))' }} />;
}

/* ---------- Desktop top nav (replaces BottomNav ≥860px, signed-in only) ---------- */
export function DesktopTopNav() {
  const pathname = usePathname();
  return (
    <nav className="gb-topnav">
      <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <MS name="storefront" size={24} color="var(--gb-primary)" />
        <span className="gb-serif" style={{ fontSize: 20, fontWeight: 600, color: 'var(--gb-ink)' }}>Grabbit</span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        {TABS.map((t) => {
          const active = pathname === t.href || pathname.startsWith(t.href + '/');
          return (
            <Link
              key={t.href}
              href={t.href}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14.5, fontWeight: 700, color: active ? 'var(--gb-primary)' : 'var(--gb-muted)' }}
            >
              <MS name={t.icon} size={19} fill={active} />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* ---------- Sub-screen top bar (back button + title) ---------- */
export function TopBar({
  title, right, onBack, border = true,
}: { title: ReactNode; right?: ReactNode; onBack?: () => void; border?: boolean }) {
  const router = useRouter();
  return (
    <div
      style={{
        padding: 'calc(14px + env(safe-area-inset-top)) 18px 14px', display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--gb-surface)', borderBottom: border ? '1px solid var(--gb-line)' : 'none',
      }}
    >
      <button
        onClick={onBack ?? (() => router.back())}
        style={{
          width: 38, height: 38, borderRadius: '50%', border: '1px solid #EEE5D8', background: 'var(--gb-card)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flex: 'none',
        }}
        aria-label="Back"
      >
        <MS name="arrow_back" size={22} color="var(--gb-ink)" />
      </button>
      <div className="gb-serif" style={{ fontSize: 22, fontWeight: 500, flex: 1 }}>{title}</div>
      {right}
    </div>
  );
}

/* ---------- Section eyebrow label ---------- */
export function Eyebrow({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gb-faint)', ...style }}>
      {children}
    </div>
  );
}

/* ---------- Veg / non-veg mark (square outline + dot), only when the status is known ---------- */
export function Veg({ veg }: { veg?: boolean | null }) {
  if (veg == null) return null;
  const c = veg ? '#3E8E4E' : '#9E2A2B';
  return (
    <span style={{ width: 14, height: 14, border: `1.5px solid ${c}`, borderRadius: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
    </span>
  );
}
