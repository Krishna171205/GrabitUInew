import { ImageResponse } from 'next/og';

/**
 * Social preview card, generated as a real PNG at build time.
 *
 * This replaces the hand-written public/og-image.svg: WhatsApp, X, LinkedIn,
 * Slack and iMessage all refuse SVG for og:image, so every share of the site
 * was previewing with no image at all. Because it uses the file convention,
 * Next wires it into og:image *and* twitter:image for every route that doesn't
 * override them, one file instead of an images[] block per page.
 */
export const alt = 'Grabbit: order coffee ahead from cafes in Delhi, skip the queue';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const INK = '#241612';
const MARIGOLD = '#FFB100';
const CREAM = '#FFFDF8';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: CREAM,
          padding: '0 96px',
          position: 'relative',
        }}
      >
        {/* Marigold bar, the one piece of brand colour that survives a thumbnail. */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 14, background: MARIGOLD }} />

        <div style={{ display: 'flex', fontSize: 30, fontWeight: 600, color: MARIGOLD, letterSpacing: '0.14em' }}>
          ORDER AHEAD
        </div>
        <div style={{ display: 'flex', fontSize: 104, fontWeight: 800, color: INK, letterSpacing: '-0.04em', marginTop: 12 }}>
          Grabbit
        </div>
        <div style={{ display: 'flex', fontSize: 40, fontWeight: 500, color: INK, opacity: 0.78, marginTop: 20, lineHeight: 1.25 }}>
          Coffee and snacks from cafes in Delhi,
        </div>
        <div style={{ display: 'flex', fontSize: 40, fontWeight: 500, color: INK, opacity: 0.78, lineHeight: 1.25 }}>
          ready when you walk in. No queue.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 52, gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: MARIGOLD }} />
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, color: INK }}>letsgrabbit.com</div>
        </div>
      </div>
    ),
    size,
  );
}
