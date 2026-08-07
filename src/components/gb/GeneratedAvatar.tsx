/**
 * Deterministic illustrated avatar, drawn locally as an SVG.
 *
 * The same seed (name, else phone) always yields the same face, so a customer
 * without an uploaded photo still gets something recognisably theirs instead of
 * a bare initial. No dependency and no third-party avatar CDN - the palette is
 * the app's own warm range, so these sit inside the theme rather than beside it.
 */

// [background, feature] pairs, all drawn from the Grabbit warm palette.
const PALETTES: ReadonlyArray<readonly [string, string]> = [
  ['#F2C879', '#7A3B12'], // amber / cocoa
  ['#EFA98B', '#7A2E17'], // peach / rust
  ['#C7D8B8', '#31572C'], // sage / forest
  ['#E8C6CE', '#8A3450'], // rose / plum
  ['#BFD3E6', '#274C77'], // sky / ink-blue
  ['#E3D3F2', '#513B7E'], // lilac / violet
];

function hashSeed(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function GeneratedAvatar({ seed, size = 44 }: { seed: string; size?: number }) {
  const h = hashSeed(seed || '?');
  const [bg, fg] = PALETTES[h % PALETTES.length];

  // Every feature is derived from a different slice of the hash so faces vary
  // independently instead of moving together in lockstep.
  const eyeY = 34 + (h % 5);
  const eyeGap = 11 + ((h >> 3) % 5);
  const smileDepth = 6 + ((h >> 6) % 9);
  const tilt = (((h >> 9) % 17) - 8);
  const blush = ((h >> 12) % 3) === 0;

  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      role="img"
      aria-label="Profile avatar"
      style={{ display: 'block', borderRadius: '50%' }}
    >
      <rect width="80" height="80" fill={bg} />
      <g transform={`rotate(${tilt} 40 44)`}>
        {blush && (
          <>
            <circle cx={40 - eyeGap - 5} cy={eyeY + 11} r="4" fill={fg} opacity="0.18" />
            <circle cx={40 + eyeGap + 5} cy={eyeY + 11} r="4" fill={fg} opacity="0.18" />
          </>
        )}
        <circle cx={40 - eyeGap} cy={eyeY} r="3.4" fill={fg} />
        <circle cx={40 + eyeGap} cy={eyeY} r="3.4" fill={fg} />
        <path
          d={`M ${40 - eyeGap} ${eyeY + 13} Q 40 ${eyeY + 13 + smileDepth} ${40 + eyeGap} ${eyeY + 13}`}
          stroke={fg}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
