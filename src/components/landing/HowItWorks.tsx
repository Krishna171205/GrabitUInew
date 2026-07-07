// grabit/src/components/landing/HowItWorks.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import {
  motion, useScroll, useTransform, useMotionValue, useMotionValueEvent,
  useReducedMotion, type MotionValue,
} from 'framer-motion';
import { STEPS } from './content';

type NodeDef = { x: number; y: number; at: number; side: 'left' | 'right' };
type Layout = { viewBox: string; path: string; maxH: string; cardW: number; nodes: NodeDef[] };

// Clean espresso base with a warm top glow — replaces the muddy olive-transition
// gradient. Marigold pop comes from the journey path/token, not the backdrop.
const SECTION_BG = 'radial-gradient(125% 95% at 50% 6%, #3A2512 0%, #22140B 52%, #150C05 100%)';

// Desktop: serpentine left → right → left. Station cards sit ON the path (line routes behind them).
const DESKTOP: Layout = {
  viewBox: '0 0 1000 720',
  maxH: '58vh',
  cardW: 400,
  path: 'M 180 130 C 545 150, 415 360, 760 360 C 415 360, 545 570, 180 590',
  nodes: [
    { x: 180, y: 130, at: 0.06, side: 'left' },
    { x: 760, y: 360, at: 0.5, side: 'right' },
    { x: 180, y: 590, at: 0.94, side: 'left' },
  ],
};

// Mobile: vertical rail, cards stacked, line bows right between stops.
const MOBILE: Layout = {
  viewBox: '0 0 400 760',
  maxH: '64vh',
  cardW: 332,
  path: 'M 54 90 C 265 175, 265 295, 54 380 C 265 465, 265 585, 54 670',
  nodes: [
    { x: 54, y: 90, at: 0.06, side: 'left' },
    { x: 54, y: 380, at: 0.5, side: 'left' },
    { x: 54, y: 670, at: 0.94, side: 'left' },
  ],
};

function Station({
  node, step, cardW, progress, reduced,
}: {
  node: NodeDef; step: (typeof STEPS)[number]; cardW: number;
  progress: MotionValue<number>; reduced: boolean;
}) {
  const a0 = node.at - 0.16;
  const opacity = useTransform(progress, [a0, node.at], [0.4, 1]);
  const lift = useTransform(progress, [a0, node.at], [16, 0]);
  const ring = useTransform(progress, [a0, node.at], [0, 1]);
  const right = node.side === 'right';
  const foX = right ? node.x + 46 - cardW : node.x - 46;

  const badge = (
    <div style={{ position: 'relative', width: 48, height: 48, flex: 'none' }}>
      <motion.div style={{ position: 'absolute', inset: -7, borderRadius: 999, border: '2px solid var(--gb-primary)', opacity: reduced ? 1 : ring }} />
      <div style={{ width: 48, height: 48, borderRadius: 999, background: 'var(--gb-primary)', color: '#241612', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{step.n}</div>
    </div>
  );

  return (
    <motion.foreignObject x={foX} y={node.y - 78} width={cardW} height={156}
      style={{ opacity: reduced ? 1 : opacity, y: reduced ? 0 : lift, overflow: 'visible' }}>
      <div style={{ borderRadius: 24, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', padding: 6, boxShadow: '0 18px 46px -26px rgba(0,0,0,.6)' }}>
        <div style={{ display: 'flex', flexDirection: right ? 'row-reverse' : 'row', alignItems: 'center', gap: 14, borderRadius: 18, background: 'rgba(24,14,9,.92)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08)', padding: '14px 16px', textAlign: right ? 'right' : 'left' }}>
          {badge}
          <div>
            <div className="gb-serif" style={{ fontSize: 30, fontWeight: 600, color: '#fff', lineHeight: 1.12 }}>{step.title}</div>
            <div style={{ fontSize: 21, lineHeight: 1.38, color: 'rgba(255,255,255,.85)', marginTop: 5 }}>{step.body}</div>
          </div>
        </div>
      </div>
    </motion.foreignObject>
  );
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const lenRef = useRef(0);
  const reduced = !!useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const L = isMobile ? MOBILE : DESKTOP;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const on = () => setIsMobile(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const trail = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const tokenX = useMotionValue(L.nodes[0].x);
  const tokenY = useMotionValue(L.nodes[0].y);

  useEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    lenRef.current = p.getTotalLength();
    const prog = reduced ? 1 : scrollYProgress.get();
    const pt = p.getPointAtLength(prog * lenRef.current);
    tokenX.set(pt.x); tokenY.set(pt.y);
  }, [reduced, isMobile, tokenX, tokenY, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const p = pathRef.current; if (!p || reduced) return;
    const len = lenRef.current || p.getTotalLength();
    const pt = p.getPointAtLength(Math.max(0, Math.min(1, v)) * len);
    tokenX.set(pt.x); tokenY.set(pt.y);
  });

  return (
    <section id="how-it-works" ref={sectionRef} style={{ position: 'relative', height: '240vh', background: SECTION_BG, color: '#fff' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 22px', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1000, width: '100%', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--gb-peach)', border: '1px solid rgba(255,255,255,.16)', borderRadius: 999, padding: '5px 12px' }}>How it works</span>
          </div>
          <h2 className="gb-serif" style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 600, lineHeight: 1.1, margin: '0 0 8px', textAlign: 'center' }}>
            From browse to pickup<br /><span style={{ fontStyle: 'italic', color: 'var(--gb-peach)' }}>in minutes.</span>
          </h2>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.6)', fontSize: 15, margin: '0 0 10px' }}>
            Follow an order from tap to counter.
          </p>

          <svg viewBox={L.viewBox} style={{ width: '100%', height: 'auto', maxHeight: L.maxH, display: 'block', margin: '0 auto', overflow: 'visible' }} aria-hidden>
            {/* ambient glow under the route */}
            <path d={L.path} fill="none" stroke="var(--gb-primary)" strokeWidth={9} strokeLinecap="round" style={{ filter: 'blur(7px)', opacity: 0.16 }} />
            {/* dotted full track */}
            <path d={L.path} fill="none" stroke="rgba(255,255,255,.16)" strokeWidth={2.5} strokeLinecap="round" strokeDasharray="1 12" />
            {/* trail drawn in on scroll */}
            <motion.path ref={pathRef} d={L.path} fill="none" stroke="var(--gb-primary)" strokeWidth={4} strokeLinecap="round"
              pathLength={1} strokeDasharray={1} style={{ strokeDashoffset: reduced ? 0 : trail }} />

            {/* station cards render after the path, so the line routes behind them */}
            {L.nodes.map((node, i) => (
              <Station key={`${isMobile}-${i}`} node={node} step={STEPS[i]} cardW={L.cardW} progress={scrollYProgress} reduced={reduced} />
            ))}

            {/* travelling order token, on top */}
            <motion.g style={{ x: tokenX, y: tokenY }}>
              <circle r={23} fill="var(--gb-primary)" style={{ filter: 'drop-shadow(0 0 11px rgba(255,177,0,.75))' }} />
              <circle r={23} fill="none" stroke="#241612" strokeWidth={2} />
              <text y={7} textAnchor="middle" fontSize={20}>☕</text>
            </motion.g>
          </svg>
        </div>
      </div>
    </section>
  );
}
