// grabbit/src/components/landing/PartnerPitch.tsx
'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useMotionTemplate, useReducedMotion, type MotionValue } from 'framer-motion';
import { MS } from '@/components/gb/kit';

// Each card: front = a third of the cafe image, back = the benefit. Scroll splits the image, then flips the panels into the cards.
// Native replication of the Framer "3D Image Split → Flip" effect (Framer projects aren't importable as code).
const SPLIT_IMG = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1600&q=80';

const BENEFITS = [
  { icon: 'point_of_sale', title: 'Your own POS', body: 'Grabbit orders land in your Omega POS at the counter, next to your walk-in orders.', tint: { bg: '#efe9df', fg: '#241612', sub: 'rgba(36,22,18,.62)', icon: '#241612' } },
  { icon: 'savings', title: 'Keep your margin', body: 'A direct pre-order channel, not a commission-heavy aggregator listing.', tint: { bg: 'linear-gradient(160deg,#FFC24B,#FFB100)', fg: '#241612', sub: 'rgba(36,22,18,.72)', icon: '#241612' } },
  { icon: 'notifications_active', title: 'Never miss an order', body: 'A tablet at the counter alerts you the moment a pickup order comes in.', tint: { bg: '#171310', fg: '#ffffff', sub: 'rgba(255,255,255,.66)', icon: 'var(--gb-primary)' } },
];

const T = {
  bg: 'linear-gradient(180deg, #FFF7EC 0%, #FDEED6 100%)',
  label: '#E08A1E',
  text: '#241612',
  body: 'rgba(36,22,18,.66)',
  cardBorder: 'rgba(36,22,18,.10)',
  ctaBg: 'var(--gb-ink)',
  ctaText: '#fff',
};

const N = 3;

function FlipCard({ i, b, bg, progress, vertical = false }: { i: number; b: (typeof BENEFITS)[number]; bg: string; progress: MotionValue<number>; vertical?: boolean }) {
  const dir = i === 0 ? -1 : i === N - 1 ? 1 : 0;
  const split = useTransform(progress, [0.16, 0.44], [0, dir * (vertical ? 40 : 64)]); // part into three
  const flip = useTransform(progress, [0.48, 0.84], [0, 180]);                          // flip to cards
  const tilt = useTransform(progress, [0.48, 0.95], [0, vertical ? 0 : dir * 4]);       // gentle fan (desktop only)
  // Inner edges start square (seamless whole), round out as the panels part; outer edges stay round.
  const r = useTransform(progress, [0.16, 0.44], [2, 20]);
  const brL = useMotionTemplate`20px ${r}px ${r}px 20px`;   // desktop first (round left)
  const brR = useMotionTemplate`${r}px 20px 20px ${r}px`;   // desktop last  (round right)
  const brT = useMotionTemplate`20px 20px ${r}px ${r}px`;   // mobile first  (round top)
  const brB = useMotionTemplate`${r}px ${r}px 20px 20px`;   // mobile last   (round bottom)
  const brM = useMotionTemplate`${r}px ${r}px ${r}px ${r}px`;
  const br = vertical ? (dir < 0 ? brT : dir > 0 ? brB : brM) : (dir < 0 ? brL : dir > 0 ? brR : brM);
  const face: CSSProperties = { position: 'absolute', inset: 0, overflow: 'hidden', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' };
  const shape = vertical
    ? { width: '100%', maxWidth: 380, aspectRatio: '2 / 1', y: split, rotateX: flip }
    : { width: `${100 / N}%`, maxWidth: 300, flex: 'none', aspectRatio: '4 / 5', x: split, rotateY: flip, rotateZ: tilt };
  const slice = vertical
    ? { backgroundSize: `100% ${N * 100}%`, backgroundPositionY: `${(i / (N - 1)) * 100}%` }
    : { backgroundSize: `${N * 100}% 100%`, backgroundPositionX: `${(i / (N - 1)) * 100}%` };
  return (
    <motion.div style={{ position: 'relative', transformStyle: 'preserve-3d', transformOrigin: 'center', ...shape }}>
      {/* front — image slice */}
      <motion.div style={{ ...face, borderRadius: br, backgroundImage: `url("${bg}")`, backgroundRepeat: 'no-repeat', ...slice }} />
      {/* back — benefit card: icon top, headline centred, body at bottom */}
      <motion.div style={{ ...face, borderRadius: br, transform: vertical ? 'rotateX(180deg)' : 'rotateY(180deg)', background: b.tint.bg, padding: vertical ? '16px 20px' : '24px 22px', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px -30px rgba(0,0,0,.5)' }}>
        <MS name={b.icon} size={24} fill color={b.tint.icon} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <h3 className="gb-serif" style={{ fontSize: vertical ? 22 : 27, fontWeight: 600, lineHeight: 1.14, color: b.tint.fg, margin: 0 }}>{b.title}</h3>
        </div>
        <p style={{ fontSize: vertical ? 13.5 : 15, lineHeight: 1.45, color: b.tint.sub, margin: 0 }}>{b.body}</p>
      </motion.div>
    </motion.div>
  );
}

const DECK_W = 980;   // design width of the card row
const DECK_EXTENT = 1140; // width the parted + fanned deck needs; used to scale-to-fit

function FlipDeck() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const bg = `/_next/image?url=${encodeURIComponent(SPLIT_IMG)}&w=1920&q=80`;
  const hint = useTransform(scrollYProgress, [0, 0.12, 0.42, 0.55], [1, 1, 0, 0]);
  // Whole image starts full-bleed, then zooms out / back as it splits.
  const zoom = useTransform(scrollYProgress, [0, 0.44], [1.12, 0.94]);

  // Scale the whole deck down to fit narrow viewports so the parted/fanned cards never clip.
  const [vw, setVw] = useState(1280);
  useEffect(() => {
    const on = () => setVw(window.innerWidth);
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  const fit = Math.min(1, (vw - 32) / DECK_EXTENT);

  return (
    <div ref={ref} style={{ position: 'relative', height: '260vh' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ width: DECK_W, transform: `scale(${fit})`, transformOrigin: 'center' }}>
          <motion.div style={{ display: 'flex', gap: 0, justifyContent: 'center', perspective: 1600, scale: zoom, transformOrigin: 'center' }}>
            {BENEFITS.map((b, i) => <FlipCard key={i} i={i} b={b} bg={bg} progress={scrollYProgress} />)}
          </motion.div>
          <motion.p style={{ opacity: hint, textAlign: 'center', marginTop: 22, fontSize: 12, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(36,22,18,.4)' }}>
            Scroll to flip
          </motion.p>
        </div>
      </div>
    </div>
  );
}

function MobileFlipDeck() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const bg = `/_next/image?url=${encodeURIComponent(SPLIT_IMG)}&w=1200&q=80`;
  const hint = useTransform(scrollYProgress, [0, 0.12, 0.42, 0.55], [1, 1, 0, 0]);
  return (
    <div ref={ref} style={{ position: 'relative', height: '260vh' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, perspective: 1400 }}>
          {BENEFITS.map((b, i) => <FlipCard key={i} i={i} b={b} bg={bg} progress={scrollYProgress} vertical />)}
        </div>
        <motion.p style={{ opacity: hint, marginTop: 20, fontSize: 12, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(36,22,18,.4)' }}>
          Scroll to flip
        </motion.p>
      </div>
    </div>
  );
}

function StackedCards() {
  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr' }} className="gb-partner-grid">
      {BENEFITS.map((b) => (
        <motion.div key={b.title}
          whileHover={{ y: -6, scale: 1.02, borderColor: 'rgba(255,177,0,.55)', boxShadow: '0 22px 48px -18px rgba(120,70,0,.2)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          style={{ background: '#fff', border: `1px solid ${T.cardBorder}`, borderRadius: 'var(--gb-r-card)', padding: 24, cursor: 'pointer' }}>
          <MS name={b.icon} size={28} fill color="var(--gb-primary)" />
          <h3 className="gb-serif" style={{ fontSize: 19, fontWeight: 600, margin: '14px 0 6px', color: T.text }}>{b.title}</h3>
          <p style={{ fontSize: 14, lineHeight: 1.5, color: T.body, margin: 0 }}>{b.body}</p>
        </motion.div>
      ))}
    </div>
  );
}

export default function PartnerPitch() {
  const reduced = !!useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const on = () => setIsMobile(window.matchMedia('(max-width: 720px)').matches);
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  return (
    <section style={{ background: T.bg, color: T.text, padding: '88px 22px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ maxWidth: 560 }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: T.label }}>For cafés</span>
          <h2 className="gb-serif" style={{ fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 600, lineHeight: 1.1, margin: '12px 0 16px' }}>
            Run a café? Own your orders.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: T.body, margin: '0 0 32px' }}>
            Take pre-orders from customers before they arrive, and manage them right at your counter.
          </p>
        </div>

        {reduced ? <StackedCards /> : isMobile ? <MobileFlipDeck /> : <FlipDeck />}

        <div style={{ marginTop: 36 }}>
          <Link href="/partner" className="gb-hover-btn" style={{ display: 'inline-block', background: T.ctaBg, color: T.ctaText, fontSize: 16, fontWeight: 800, padding: '15px 28px', borderRadius: 999 }}>Partner with us</Link>
        </div>
      </div>
    </section>
  );
}
