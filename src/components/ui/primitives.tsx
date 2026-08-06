'use client';
/**
 * Grabbit: shared UI primitives. Ported from the prototype design system.
 * Style via CSS vars from globals.css (--primary, --surface-card, --r-md, ...).
 */
import { useState, type ReactNode, type CSSProperties } from 'react';
import { Icon } from './Icon';

/* ---------- Button ---------- */
export type ButtonVariant =
  | 'primary' | 'secondary' | 'tinted' | 'ghost' | 'dark' | 'success' | 'danger';
export type ButtonSize = 'lg' | 'md' | 'sm';

export function Button({
  children, variant = 'primary', size = 'lg', full, icon, onClick, disabled, type = 'button', style,
}: {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  style?: CSSProperties;
}) {
  const base: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: 'var(--font)', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none', borderRadius: 'var(--r-md)',
    transition: 'transform .12s var(--ease-out), background .15s, box-shadow .15s',
    width: full ? '100%' : 'auto', whiteSpace: 'nowrap', WebkitTapHighlightColor: 'transparent',
    opacity: disabled ? 0.45 : 1,
  };
  const sizes: Record<ButtonSize, CSSProperties> = {
    lg: { height: 50, fontSize: 16, padding: '0 22px' },
    md: { height: 42, fontSize: 15, padding: '0 18px' },
    sm: { height: 34, fontSize: 14, padding: '0 14px', borderRadius: 'var(--r-sm)' },
  };
  const variants: Record<ButtonVariant, CSSProperties> = {
    primary: { background: 'var(--primary)', color: 'var(--on-primary)', boxShadow: '0 4px 14px rgba(255,177,0,0.3)' },
    secondary: { background: 'var(--surface-card)', color: 'var(--on-surface)', border: '1px solid var(--hairline-strong)' },
    tinted: { background: 'var(--primary-tint)', color: 'var(--primary)' },
    ghost: { background: 'transparent', color: 'var(--primary)' },
    dark: { background: 'var(--inverse-surface)', color: 'var(--inverse-on-surface)' },
    success: { background: 'var(--success)', color: '#fff' },
    danger: { background: 'var(--error)', color: '#fff' },
  };
  const [press, setPress] = useState(false);
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onPointerDown={() => setPress(true)}
      onPointerUp={() => setPress(false)}
      onPointerLeave={() => setPress(false)}
      style={{ ...base, ...sizes[size], ...variants[variant], transform: press && !disabled ? 'scale(0.97)' : 'scale(1)', ...style }}
    >
      {icon}{children}
    </button>
  );
}

/* ---------- Chip ---------- */
export function Chip({
  children, active, onClick, icon, style,
}: { children?: ReactNode; active?: boolean; onClick?: () => void; icon?: ReactNode; style?: CSSProperties }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px',
        borderRadius: 'var(--r-pill)', fontFamily: 'var(--font)', fontSize: 14, fontWeight: 600,
        cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .18s var(--ease-out)', flex: 'none',
        background: active ? 'var(--primary-tint)' : 'var(--surface-card)',
        color: active ? 'var(--primary)' : 'var(--on-surface)',
        border: `1px solid ${active ? 'var(--primary)' : 'var(--hairline-strong)'}`,
        ...style,
      }}
    >{icon}{children}</button>
  );
}

/* ---------- Card ---------- */
export function Card({
  children, style, onClick, pad = 16, ...rest
}: { children?: ReactNode; style?: CSSProperties; onClick?: () => void; pad?: number } & Record<string, unknown>) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--hairline)',
        boxShadow: 'var(--shadow-card)', padding: pad, ...style,
      }}
      {...rest}
    >{children}</div>
  );
}

/* ---------- Qty stepper ---------- */
export function QtyStepper({
  value, onChange, size = 'md',
}: { value: number; onChange: (n: number) => void; size?: 'sm' | 'md' }) {
  const h = size === 'sm' ? 30 : 34;
  const btn: CSSProperties = {
    width: h, height: h, display: 'grid', placeItems: 'center', border: 'none', cursor: 'pointer',
    background: 'transparent', color: 'var(--primary)',
  };
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', height: h, borderRadius: 'var(--r-pill)',
      border: '1px solid var(--primary)', background: 'var(--primary-tint)', overflow: 'hidden',
    }}>
      <button style={btn} onClick={() => onChange(Math.max(0, value - 1))}>{Icon.minus({ size: 16 })}</button>
      <span className="tabular" style={{ minWidth: 22, textAlign: 'center', fontWeight: 700, fontSize: 15, color: 'var(--primary)' }}>{value}</span>
      <button style={btn} onClick={() => onChange(value + 1)}>{Icon.plus({ size: 16 })}</button>
    </div>
  );
}

/* ---------- Add button (circular -> inline stepper) ---------- */
export function AddButton({
  qty = 0, onAdd, onChange,
}: { qty?: number; onAdd?: () => void; onChange?: (n: number) => void }) {
  if (qty > 0) {
    const sb: CSSProperties = { width: 32, height: 34, display: 'grid', placeItems: 'center', border: 'none', background: 'transparent', color: 'var(--on-primary)', cursor: 'pointer' };
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', height: 34, borderRadius: 'var(--r-pill)', background: 'var(--primary)', boxShadow: '0 3px 10px rgba(255,177,0,0.35)', overflow: 'hidden' }}>
        <button style={sb} onClick={() => onChange?.(qty - 1)}>{Icon.minus({ size: 15 })}</button>
        <span className="tabular" style={{ minWidth: 18, textAlign: 'center', fontWeight: 700, fontSize: 14, color: 'var(--on-primary)' }}>{qty}</span>
        <button style={sb} onClick={() => onChange?.(qty + 1)}>{Icon.plus({ size: 15 })}</button>
      </div>
    );
  }
  return (
    <button
      onClick={onAdd}
      style={{
        width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer',
        background: 'var(--surface-card)', color: 'var(--primary)', border: '1.5px solid var(--primary)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'transform .12s',
      }}
    >{Icon.plus({ size: 18 })}</button>
  );
}

/* ---------- Food photo placeholder (gradient + fork-knife glyph) ---------- */
const PHOTO_COMBOS = [
  ['#f3a05a', '#d8642b'], ['#e07a4f', '#b8412a'], ['#f0b24a', '#dd7e1f'],
  ['#d96b6b', '#a83232'], ['#e8a96b', '#c06a2e'], ['#c98b5a', '#8f5524'],
];
export function Photo({
  label, ratio = '1', radius = 'var(--r-lg)', seed = 0, src, style, children,
}: {
  label?: string; ratio?: string; radius?: string; seed?: number; src?: string;
  style?: CSSProperties; children?: ReactNode;
}) {
  const [a, b] = PHOTO_COMBOS[seed % PHOTO_COMBOS.length];
  const wrap: CSSProperties = { aspectRatio: ratio, borderRadius: radius, overflow: 'hidden', position: 'relative', display: 'block', ...style };
  if (src) {
    return (
      <div style={wrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {children}
      </div>
    );
  }
  return (
    <div style={{ ...wrap, background: `linear-gradient(140deg, ${a}, ${b})`, display: 'grid', placeItems: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 28% 22%, rgba(255,255,255,0.4), transparent 52%), radial-gradient(circle at 80% 85%, rgba(0,0,0,0.18), transparent 50%)' }} />
      <svg viewBox="0 0 24 24" style={{ position: 'absolute', width: '34%', height: '34%', opacity: 0.22, color: '#fff' }} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 3v7M8 3v7M5 10h3a0 0 0 0 1 0 0M6.5 3v18" /><circle cx="16.5" cy="8" r="5" /><path d="M16.5 13v8" />
      </svg>
      {label && (
        <span style={{ position: 'relative', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.03em', color: 'rgba(255,255,255,0.92)', textAlign: 'center', padding: '0 8px', textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}>{label}</span>
      )}
      {children}
    </div>
  );
}

/* ---------- Bottom sheet ---------- */
export function BottomSheet({
  open, onClose, children, height = 'auto', title, instant,
}: { open: boolean; onClose?: () => void; children?: ReactNode; height?: string | number; title?: ReactNode; instant?: boolean }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', pointerEvents: open ? 'auto' : 'none' }}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', opacity: open ? 1 : 0, transition: 'opacity .25s', pointerEvents: open ? 'auto' : 'none' }}
      />
      <div
        className="noscroll"
        style={{
          position: 'relative', background: 'var(--surface-card)', borderRadius: '20px 20px 0 0',
          boxShadow: 'var(--shadow-sheet)', padding: '10px 20px calc(20px + env(safe-area-inset-bottom))',
          maxHeight: '92%', height, overflowY: 'auto',
          transform: open ? 'translateY(0)' : 'translateY(110%)',
          transition: 'transform var(--dur-sheet) var(--ease-spring)',
          animation: open && !instant ? 'gb-sheet-up var(--dur-sheet) var(--ease-spring)' : 'none',
        }}
      >
        <div style={{ width: 38, height: 5, borderRadius: 3, background: 'var(--surface-dim)', margin: '0 auto 14px' }} />
        {title && <div className="t-title" style={{ marginBottom: 14 }}>{title}</div>}
        {children}
      </div>
    </div>
  );
}

/* ---------- Status pill ---------- */
export type OrderStatus = 'pending' | 'confirmed' | 'new' | 'prepping' | 'ready' | 'done' | 'handed' | 'cancelled';
export function StatusPill({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, [string, string, string]> = {
    pending: ['Pending', 'var(--warning)', 'var(--warning-tint)'],
    confirmed: ['Confirmed', 'var(--info)', '#e7f0fb'],
    new: ['New', 'var(--info)', '#e7f0fb'],
    prepping: ['Prepping', 'var(--tertiary)', 'var(--warning-tint)'],
    ready: ['Ready', 'var(--success)', 'var(--success-tint)'],
    done: ['Done', 'var(--success)', 'var(--success-tint)'],
    handed: ['Handed over', 'var(--secondary)', 'var(--surface-container)'],
    cancelled: ['Cancelled', 'var(--error)', 'var(--error-tint)'],
  };
  const [label, color, bg] = map[status] || map.pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 24, padding: '0 10px', borderRadius: 'var(--r-pill)', background: bg, color, fontSize: 12, fontWeight: 700 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />{label}
    </span>
  );
}

/* ---------- Toggle ---------- */
export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{ width: 50, height: 30, borderRadius: 'var(--r-pill)', border: 'none', cursor: 'pointer', padding: 2, background: on ? 'var(--success)' : 'var(--surface-dim)', transition: 'background .2s', position: 'relative', flex: 'none' }}
    >
      <span style={{ display: 'block', width: 26, height: 26, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', transform: `translateX(${on ? 20 : 0}px)`, transition: 'transform .22s var(--ease-spring)' }} />
    </button>
  );
}

/* ---------- Segmented control ---------- */
type SegOption = string | { v: string; l: string };
export function Segmented({
  options, value, onChange,
}: { options: SegOption[]; value: string; onChange: (v: string) => void }) {
  const valOf = (o: SegOption) => (typeof o === 'string' ? o : o.v);
  const labOf = (o: SegOption) => (typeof o === 'string' ? o : o.l);
  return (
    <div style={{ display: 'inline-flex', background: 'var(--surface-container)', borderRadius: 'var(--r-sm)', padding: 3, gap: 2 }}>
      {options.map((o) => {
        const v = valOf(o);
        const sel = v === value;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            style={{
              border: 'none', cursor: 'pointer', padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600,
              fontFamily: 'var(--font)', transition: 'all .15s',
              background: sel ? 'var(--surface-card)' : 'transparent',
              color: sel ? 'var(--on-surface)' : 'var(--muted)',
              boxShadow: sel ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
            }}
          >{labOf(o)}</button>
        );
      })}
    </div>
  );
}
