import type { Metadata } from 'next';
import { Baloo_2, Poppins, Mukta } from 'next/font/google';
import localFont from 'next/font/local';

export const metadata: Metadata = { title: 'Grabbit — Type Specimen' };

/* ── Google (self-hosted at build) ── */
const baloo = Baloo_2({ subsets: ['latin', 'devanagari'], weight: ['500', '700', '800'], variable: '--f-baloo', display: 'swap' });
const poppins = Poppins({ subsets: ['latin', 'devanagari'], weight: ['400', '500', '600', '700'], variable: '--f-poppins', display: 'swap' });
const mukta = Mukta({ subsets: ['latin', 'devanagari'], weight: ['400', '500', '700'], variable: '--f-mukta', display: 'swap' });

/* ── Fontshare (self-hosted local woff2) ── */
const satoshi = localFont({
  variable: '--f-satoshi', display: 'swap',
  src: [
    { path: '../../fonts/Satoshi-500.woff2', weight: '500', style: 'normal' },
    { path: '../../fonts/Satoshi-700.woff2', weight: '700', style: 'normal' },
    { path: '../../fonts/Satoshi-900.woff2', weight: '900', style: 'normal' },
  ],
});
const clash = localFont({
  variable: '--f-clash', display: 'swap',
  src: [
    { path: '../../fonts/ClashDisplay-600.woff2', weight: '600', style: 'normal' },
    { path: '../../fonts/ClashDisplay-700.woff2', weight: '700', style: 'normal' },
  ],
});
const general = localFont({
  variable: '--f-general', display: 'swap',
  src: [
    { path: '../../fonts/GeneralSans-400.woff2', weight: '400', style: 'normal' },
    { path: '../../fonts/GeneralSans-500.woff2', weight: '500', style: 'normal' },
    { path: '../../fonts/GeneralSans-600.woff2', weight: '600', style: 'normal' },
  ],
});

type Sys = { id: string; name: string; tag: string; display: string; body: string; deva: string; rec?: boolean };
const SYSTEMS: Sys[] = [
  { id: 's1', name: 'System 1 — Bounce', tag: 'Baloo 2 + Satoshi · Mukta (Hindi)', display: 'var(--f-baloo)', body: 'var(--f-satoshi)', deva: 'var(--f-mukta)', rec: true },
  { id: 's2', name: 'System 2 — Okra route', tag: 'Poppins (one family, both scripts)', display: 'var(--f-poppins)', body: 'var(--f-poppins)', deva: 'var(--f-poppins)' },
  { id: 's3', name: 'System 3 — Premium-playful', tag: 'Clash Display + General Sans · Mukta (Hindi)', display: 'var(--f-clash)', body: 'var(--f-general)', deva: 'var(--f-mukta)' },
];

function Specimen({ s }: { s: Sys }) {
  return (
    <section style={{ borderTop: '1px solid #EDE2CE', padding: '40px 0' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <h2 style={{ fontFamily: s.display, fontWeight: 800, fontSize: 22, color: '#0F172A', margin: 0, letterSpacing: '-.01em' }}>{s.name}</h2>
        {s.rec && <span style={{ fontFamily: s.body, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#0F172A', background: '#0055D4', padding: '3px 9px', borderRadius: 999 }}>Recommended</span>}
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#64748B' }}>{s.tag}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 22 }}>

        {/* Hero + wordmark */}
        <div>
          <div style={{ fontFamily: s.display, fontWeight: 800, fontSize: 15, color: '#64748B', letterSpacing: '-.01em' }}>Wordmark</div>
          <div style={{ fontFamily: s.display, fontWeight: 800, fontSize: 46, letterSpacing: '-.04em', color: '#0F172A', lineHeight: 1 }}>grab<span style={{ color: '#0055D4' }}>it</span></div>
          <div style={{ fontFamily: s.display, fontWeight: 800, fontSize: 40, letterSpacing: '-.03em', color: '#0F172A', lineHeight: 1.02, marginTop: 18 }}>Skip the queue.</div>
          <p style={{ fontFamily: s.body, fontWeight: 400, fontSize: 15.5, color: '#334155', lineHeight: 1.5, marginTop: 10, maxWidth: '40ch' }}>Pre-order from cafés near you. Ready when you arrive, no waiting. Pick a slot, pay, and grab it.</p>
        </div>

        {/* Numerals + menu row */}
        <div>
          <div style={{ fontFamily: s.display, fontWeight: 800, fontSize: 15, color: '#64748B' }}>Numerals (tabular)</div>
          <div style={{ fontFamily: s.body, fontWeight: 700, fontSize: 28, color: '#0F172A', fontVariantNumeric: 'tabular-nums', letterSpacing: '.01em', marginTop: 4 }}>₹1,299 · 10:30 · 04:59</div>
          <div style={{ marginTop: 16, background: '#F8FAFC', border: '1px solid #EDE2CE', borderRadius: 16, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#CCE0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>☕</div>
              <div>
                <div style={{ fontFamily: s.display, fontWeight: 700, fontSize: 16, color: '#0F172A' }}>Cold Brew</div>
                <div style={{ fontFamily: s.body, fontSize: 12.5, color: '#334155' }}>Smooth 12-hour steep</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontFamily: s.body, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: '#0F172A' }}>₹220</span>
              <button style={{ fontFamily: s.display, fontWeight: 700, border: 'none', background: '#0055D4', color: '#0F172A', borderRadius: 999, padding: '8px 14px', fontSize: 14 }}>Add +</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            {[['Pending', '#CCE0FF', '#003380'], ['Confirmed', '#D7ECFB', '#215C88'], ['Ready', '#D8F1E4', '#1E7A50'], ['Done', '#EDE2CE', '#334155']].map(([t, bg, fg]) => (
              <span key={t} style={{ fontFamily: s.body, fontWeight: 700, fontSize: 12, padding: '5px 12px', borderRadius: 999, background: bg, color: fg }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Hindi / Devanagari */}
        <div>
          <div style={{ fontFamily: s.display, fontWeight: 800, fontSize: 15, color: '#64748B' }}>Hindi (Devanagari)</div>
          <div style={{ fontFamily: s.deva, fontWeight: 700, fontSize: 30, color: '#0F172A', lineHeight: 1.2, marginTop: 4 }}>कतार छोड़ो,<br />कॉफ़ी पाओ।</div>
          <p style={{ fontFamily: s.deva, fontWeight: 400, fontSize: 15.5, color: '#334155', lineHeight: 1.5, marginTop: 10, maxWidth: '34ch' }}>अपने पसंदीदा कैफ़े से पहले से ऑर्डर करें। पहुँचते ही तैयार, कोई इंतज़ार नहीं। ₹220 में।</p>
          <div style={{ fontFamily: s.deva, fontWeight: 700, fontSize: 22, color: '#0F172A', fontVariantNumeric: 'tabular-nums', marginTop: 8 }}>ऑर्डर #4821 · 10:30 बजे</div>
        </div>
      </div>
    </section>
  );
}

export default function TypeSpecimen() {
  return (
    <div className={`${baloo.variable} ${poppins.variable} ${mukta.variable} ${satoshi.variable} ${clash.variable} ${general.variable}`}
      style={{ background: '#E6F0FF', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: '#64748B' }}>Grabbit · Marigold · Type comparison</div>
        <h1 style={{ fontFamily: 'var(--f-baloo)', fontWeight: 800, fontSize: 40, color: '#0F172A', letterSpacing: '-.03em', margin: '10px 0 6px' }}>Three type systems, same brand</h1>
        <p style={{ fontFamily: 'var(--f-satoshi)', fontSize: 16, color: '#334155', maxWidth: '60ch' }}>All rendered with the real self-hosted fonts on the Marigold palette. Compare the wordmark, small UI, tabular numerals (prices/timers), and Hindi. Then pick one.</p>
        {SYSTEMS.map((s) => <Specimen key={s.id} s={s} />)}
      </div>
    </div>
  );
}
