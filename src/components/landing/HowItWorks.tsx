// grabit/src/components/landing/HowItWorks.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import {
  motion, useScroll, useTransform, useMotionValue, useMotionValueEvent,
  useReducedMotion, type MotionValue,
} from 'framer-motion';
import { STEPS } from './content';

type NodeDef = { x: number; y: number; at: number; labelX: number; labelW: number; anchor: 'start' | 'end' };
type Layout = { viewBox: string; path: string; maxH: string; nodes: NodeDef[] };

// Desktop: serpentine left → right → left.
const DESKTOP: Layout = {
  viewBox: '0 0 1000 640',
  maxH: '72vh',
  path: 'M 175 135 C 520 135, 480 330, 830 330 C 480 330, 520 525, 175 525',
  nodes: [
    { x: 175, y: 135, at: 0.05, labelX: 250, labelW: 380, anchor: 'start' },
    { x: 830, y: 330, at: 0.5, labelX: 385, labelW: 390, anchor: 'end' },
    { x: 175, y: 525, at: 0.95, labelX: 250, labelW: 380, anchor: 'start' },
  ],
};

// Mobile: vertical rail, order travels top → bottom (path bows right between stops).
const MOBILE: Layout = {
  viewBox: '0 0 380 640',
  maxH: '82vh',
  path: 'M 58 90 C 210 165, 210 245, 58 320 C 210 395, 210 475, 58 550',
  nodes: [
    { x: 58, y: 90, at: 0.05, labelX: 100, labelW: 262, anchor: 'start' },
    { x: 58, y: 320, at: 0.5, labelX: 100, labelW: 262, anchor: 'start' },
    { x: 58, y: 550, at: 0.95, labelX: 100, labelW: 262, anchor: 'start' },
  ],
};

function Node({
  node, step, progress, reduced,
}: {
  node: NodeDef; step: (typeof STEPS)[number];
  progress: MotionValue<number>; reduced: boolean;
}) {
  const appear = useTransform(progress, [node.at - 0.12, node.at], [0, 1]);
  const dotScale = useTransform(progress, [node.at - 0.12, node.at], [0.7, 1]);
  const labelLeft = node.anchor === 'end';
  return (
    <g>
      <motion.circle cx={node.x} cy={node.y} r={34} fill="none" stroke="var(--gb-primary)" strokeWidth={2}
        style={{ opacity: reduced ? 1 : appear }} />
      <motion.circle cx={node.x} cy={node.y} r={26} fill="#241612" stroke="var(--gb-primary)" strokeWidth={2.5}
        style={{ scale: reduced ? 1 : dotScale, transformOrigin: `${node.x}px ${node.y}px`, opacity: reduced ? 1 : appear }} />
      <text x={node.x} y={node.y + 7} textAnchor="middle" fontSize={22} fontWeight={800}
        fill="var(--gb-primary)" fontFamily="'Plus Jakarta Sans', sans-serif">{step.n}</text>
      <motion.foreignObject x={node.labelX} y={node.y - 44} width={node.labelW} height={92}
        style={{ opacity: reduced ? 1 : appear }}>
        <div style={{ textAlign: labelLeft ? 'right' : 'left', paddingRight: labelLeft ? 8 : 0, paddingLeft: labelLeft ? 0 : 8 }}>
          <div className="gb-serif" style={{ fontSize: 21, fontWeight: 600, color: '#fff', lineHeight: 1.15 }}>{step.title}</div>
          <div style={{ fontSize: 14, lineHeight: 1.45, color: 'rgba(255,255,255,.72)', marginTop: 4 }}>{step.body}</div>
        </div>
      </motion.foreignObject>
    </g>
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
    <section id="how-it-works" ref={sectionRef} style={{ position: 'relative', height: '240vh', background: 'var(--gb-hero)', color: '#fff' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 22px', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1000, width: '100%', margin: '0 auto' }}>
          <h2 className="gb-serif" style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 600, lineHeight: 1.1, margin: '0 0 10px', textAlign: 'center' }}>
            From browse to pickup<br /><span style={{ fontStyle: 'italic', color: 'var(--gb-peach)' }}>in minutes.</span>
          </h2>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.6)', fontSize: 15, margin: '0 0 20px' }}>
            Follow an order from tap to counter.
          </p>

          <svg viewBox={L.viewBox} style={{ width: '100%', height: 'auto', maxHeight: L.maxH, display: 'block', margin: '0 auto', overflow: 'visible' }} aria-hidden>
            <path d={L.path} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth={3} strokeLinecap="round" strokeDasharray="2 10" />
            <motion.path ref={pathRef} d={L.path} fill="none" stroke="var(--gb-primary)" strokeWidth={4} strokeLinecap="round"
              pathLength={1} strokeDasharray={1} style={{ strokeDashoffset: reduced ? 0 : trail }} />

            {L.nodes.map((node, i) => (
              <Node key={`${isMobile}-${i}`} node={node} step={STEPS[i]} progress={scrollYProgress} reduced={reduced} />
            ))}

            <motion.g style={{ x: tokenX, y: tokenY }}>
              <circle r={22} fill="var(--gb-primary)" stroke="#241612" strokeWidth={2} />
              <text x={0} y={7} textAnchor="middle" fontSize={20}>☕</text>
            </motion.g>
          </svg>
        </div>
      </div>
    </section>
  );
}
