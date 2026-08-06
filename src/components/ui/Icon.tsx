/**
 * Grabbit: SF-Symbols-style icon set. Thin, rounded, 1.5px stroke.
 * All icons inherit currentColor. Ported from the prototype.
 */
import type { ReactNode } from 'react';

export interface IconProps {
  size?: number;
  sw?: number;
  fill?: string;
  vb?: number;
  className?: string;
  style?: React.CSSProperties;
}

function Svg({
  children,
  size = 24,
  sw = 1.6,
  fill = 'none',
  vb = 24,
  ...p
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${vb} ${vb}`}
      fill={fill}
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      {children}
    </svg>
  );
}

type IconFn = (p?: IconProps) => ReactNode;

export const Icon: Record<string, IconFn> = {
  home: (p) => <Svg {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" /><path d="M9.5 21v-6h5v6" /></Svg>,
  menu: (p) => <Svg {...p}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h10" /></Svg>,
  bag: (p) => <Svg {...p}><path d="M6 8h12l-1 12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></Svg>,
  receipt: (p) => <Svg {...p}><path d="M6 3h12v18l-3-1.6L12 21l-3-1.6L6 21V3Z" /><path d="M9.5 8h5" /><path d="M9.5 12h5" /></Svg>,
  user: (p) => <Svg {...p}><circle cx="12" cy="8" r="3.4" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></Svg>,
  plus: (p) => <Svg {...p}><path d="M12 5v14" /><path d="M5 12h14" /></Svg>,
  minus: (p) => <Svg {...p}><path d="M5 12h14" /></Svg>,
  chevR: (p) => <Svg {...p}><path d="M9 5l7 7-7 7" /></Svg>,
  chevL: (p) => <Svg {...p}><path d="M15 5l-7 7 7 7" /></Svg>,
  chevD: (p) => <Svg {...p}><path d="M5 9l7 7 7-7" /></Svg>,
  back: (p) => <Svg {...p}><path d="M15 5l-7 7 7 7" /></Svg>,
  close: (p) => <Svg {...p}><path d="M6 6l12 12" /><path d="M18 6 6 18" /></Svg>,
  check: (p) => <Svg {...p}><path d="M5 12.5l4.5 4.5L19 7" /></Svg>,
  clock: (p) => <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Svg>,
  pin: (p) => <Svg {...p}><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></Svg>,
  search: (p) => <Svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.5-3.5" /></Svg>,
  star: (p) => <Svg {...p} fill="currentColor" sw={0}><path d="M12 3.5l2.6 5.3 5.9.86-4.25 4.14 1 5.85L12 17l-5.25 2.76 1-5.85L3.5 9.66l5.9-.86L12 3.5Z" /></Svg>,
  heart: (p) => <Svg {...p}><path d="M12 20s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7-1.5C19 11 12 20 12 20Z" /></Svg>,
  heartFill: (p) => <Svg {...p} fill="currentColor" sw={0}><path d="M12 20.5s-7.5-4.7-7.5-10.2A4 4 0 0 1 12 6.8a4 4 0 0 1 7.5 1.5c0 5.5-7.5 10.2-7.5 10.2Z" /></Svg>,
  bell: (p) => <Svg {...p}><path d="M6 9a6 6 0 0 1 12 0c0 5 1.5 6.5 1.5 6.5h-15S6 14 6 9Z" /><path d="M10 19a2 2 0 0 0 4 0" /></Svg>,
  qr: (p) => <Svg {...p} sw={1.4}><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M14 14h2v2M20 14v6M14 20h2M18 18v2" /></Svg>,
  whatsapp: (p) => <Svg {...p}><path d="M4 20l1.3-4A8 8 0 1 1 9 19.5L4 20Z" /><path d="M9 10c.5 2.5 2.5 4.5 5 5l1.3-1.3 1.7.8M9 10l-.8-1.7L9.5 7" /></Svg>,
  card: (p) => <Svg {...p}><rect x="3" y="6" width="18" height="12" rx="2.5" /><path d="M3 10h18" /></Svg>,
  counter: (p) => <Svg {...p}><path d="M4 9h16l-1 4H5L4 9Z" /><path d="M4 9 3 6" /><path d="M7 13v6M17 13v6M5.5 19h13" /></Svg>,
  edit: (p) => <Svg {...p}><path d="M4 16.5 15 5.5l3.5 3.5L7.5 20 4 20Z" /><path d="M13 7.5 16.5 11" /></Svg>,
  grid: (p) => <Svg {...p}><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></Svg>,
  list: (p) => <Svg {...p}><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" /></Svg>,
  chart: (p) => <Svg {...p}><path d="M4 20V4" /><path d="M4 20h16" /><path d="M8 16v-3M12 16v-7M16 16v-5" /></Svg>,
  slots: (p) => <Svg {...p}><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 9h17M8 3v4M16 3v4" /></Svg>,
  power: (p) => <Svg {...p}><path d="M12 4v8" /><path d="M7.5 7a7 7 0 1 0 9 0" /></Svg>,
  logout: (p) => <Svg {...p}><path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3" /><path d="M10 12h9M16 8l3 4-3 4" /></Svg>,
  filter: (p) => <Svg {...p}><path d="M4 6h16M7 12h10M10 18h4" /></Svg>,
  phone: (p) => <Svg {...p}><path d="M6 3h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 4 5a2 2 0 0 1 2-2Z" /></Svg>,
  camera: (p) => <Svg {...p}><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13" r="3.2" /></Svg>,
  sound: (p) => <Svg {...p}><path d="M5 9v6h3l4 3.5v-13L8 9H5Z" /><path d="M16 9a4 4 0 0 1 0 6" /></Svg>,
  rupee: (p) => <Svg {...p}><path d="M7 5h10M7 9h10M16 5c0 4-3.5 4-6 4l6 8M7 9h3" /></Svg>,
  trend: (p) => <Svg {...p}><path d="M4 15l5-5 3 3 7-7" /><path d="M15 6h5v5" /></Svg>,
  refresh: (p) => <Svg {...p}><path d="M4 12a8 8 0 0 1 13.5-5.8L20 8" /><path d="M20 4v4h-4" /><path d="M20 12a8 8 0 0 1-13.5 5.8L4 16" /><path d="M4 20v-4h4" /></Svg>,
  flame: (p) => <Svg {...p}><path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s0 2 1.5 2.5C9 11 9 7 12 3Z" /></Svg>,
  trash: (p) => <Svg {...p}><path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" /></Svg>,
  arrowR: (p) => <Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>,
};

/** Grabbit logo: fork glyph + charcoal wordmark, crimson dot on the "i". */
export function GrabbitLogo({
  height = 26,
  mono = false,
  color = '#3d3d3d',
  dot = '#FFB100',
}: {
  height?: number;
  mono?: boolean;
  color?: string;
  dot?: string;
}) {
  const c = mono ? 'currentColor' : color;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: height * 0.34, height }}>
      <svg height={height} viewBox="0 0 24 28" fill="none" style={{ display: 'block' }}>
        <g stroke={c} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 3v7M11 3v7M15 3v7" />
          <path d="M5 10h12a0 0 0 0 1 0 0 6 6 0 0 1-6 6h0a6 6 0 0 1-6-6Z" fill={mono ? 'none' : c} />
          <path d="M11 16v9" />
        </g>
      </svg>
      <span
        style={{
          fontWeight: 800,
          fontSize: height * 0.92,
          letterSpacing: '-0.03em',
          color: c,
          lineHeight: 1,
          fontFamily: 'var(--font)',
          position: 'relative',
        }}
      >
        Grab
        <span style={{ position: 'relative' }}>
          i
          <span
            style={{
              position: 'absolute',
              top: height * -0.04,
              left: '50%',
              transform: 'translateX(-50%)',
              width: height * 0.17,
              height: height * 0.17,
              borderRadius: '50%',
              background: dot,
            }}
          />
        </span>
        t
      </span>
    </span>
  );
}

/** Veg / non-veg badge (industry standard square mark). */
export function FoodMark({ veg = true, size = 16 }: { veg?: boolean; size?: number }) {
  const c = veg ? 'var(--veg)' : 'var(--nonveg)';
  return (
    <span
      style={{
        width: size,
        height: size,
        border: `1.6px solid ${c}`,
        borderRadius: 3,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
      }}
      aria-label={veg ? 'Veg' : 'Non-veg'}
    >
      {veg ? (
        <span style={{ width: size * 0.42, height: size * 0.42, borderRadius: '50%', background: c }} />
      ) : (
        <span
          style={{
            width: 0,
            height: 0,
            borderLeft: `${size * 0.26}px solid transparent`,
            borderRight: `${size * 0.26}px solid transparent`,
            borderBottom: `${size * 0.44}px solid ${c}`,
          }}
        />
      )}
    </span>
  );
}
