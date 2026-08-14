// grabbit/src/components/landing/ProductPreview.tsx
'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, type MotionValue } from 'framer-motion';

const ITEMS = [
  { name: 'Cold Brew', desc: 'Smooth 12-hour steep', price: '₹220', img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&q=80' },
  { name: 'Flat White', desc: 'Double ristretto, silky foam', price: '₹280', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&q=80' },
  { name: 'Matcha Latte', desc: 'Ceremonial grade, oat milk', price: '₹320', img: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=200&q=80' },
];

// Coffee "orbs" that drift in from the edges on scroll (dock.cool's flying-rocks parallax).
type OrbDef = { img: string; size: number; top: string; left?: string; right?: string; from: number; to: number; blur: number; op: number };
const ORBS: OrbDef[] = [
  { img: ITEMS[0].img, size: 150, top: '10%', left: '3%', from: -70, to: 70, blur: 2, op: 0.5 },
  { img: ITEMS[2].img, size: 190, top: '52%', right: '4%', from: 90, to: -60, blur: 3, op: 0.42 },
  { img: ITEMS[1].img, size: 112, top: '80%', left: '11%', from: -40, to: 55, blur: 1, op: 0.4 },
];

function Orb({ o, p }: { o: OrbDef; p: MotionValue<number> }) {
  const y = useTransform(p, [0, 1], [o.from, o.to]);
  return (
    <motion.div
      aria-hidden
      style={{
        position: 'absolute', top: o.top, left: o.left, right: o.right, width: o.size, height: o.size, y,
        borderRadius: '50%', overflow: 'hidden', filter: `blur(${o.blur}px)`, opacity: o.op,
        zIndex: 0, pointerEvents: 'none', boxShadow: '0 24px 60px -20px rgba(120,70,0,.45)',
      }}>
      <Image src={o.img} alt="" fill loading="lazy" sizes="200px" style={{ objectFit: 'cover' }} />
    </motion.div>
  );
}

// Orbital Nodes System for smooth, perfectly circular tracks.
const OrbitNode = ({
  radius,
  baseAngle, // 0 is top (12 o'clock). Negative is left, positive is right.
  swing = 8, // how many degrees to oscillate
  duration = 20, // seconds for a full swing
  children
}: {
  radius: number;
  baseAngle: number;
  swing?: number;
  duration?: number;
  children: React.ReactNode;
}) => {
  return (
    <div
      className="absolute top-[280px] left-1/2 pointer-events-none"
      style={{
        width: radius * 2,
        height: radius * 2,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: [baseAngle, baseAngle + swing, baseAngle - swing, baseAngle] }}
        transition={{ repeat: Infinity, duration, ease: "easeInOut" }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          <motion.div
            animate={{ rotate: [-baseAngle, -(baseAngle + swing), -(baseAngle - swing), -baseAngle] }}
            transition={{ repeat: Infinity, duration, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default function ProductPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  // Card tilts back on entry, settles flat as it reaches centre (3D scroll-scrub).
  const rotateX = useTransform(scrollYProgress, [0.12, 0.5], [18, 0]);
  const cardY = useTransform(scrollYProgress, [0.12, 0.5], [80, 0]);
  const cardOpacity = useTransform(scrollYProgress, [0.12, 0.42], [0, 1]);

  // Pointer-driven tilt, spring-smoothed; layered on top of the scroll entrance tilt.
  const tiltX = useSpring(0, { stiffness: 260, damping: 18 });
  const tiltY = useSpring(0, { stiffness: 260, damping: 18 });
  const rotateXAll = useTransform([rotateX, tiltX] as MotionValue<number>[], ([a, b]: number[]) => a + b);
  const sheenX = useSpring(50, { stiffness: 200, damping: 25 });
  const sheenY = useSpring(50, { stiffness: 200, damping: 25 });
  const sheenOpacity = useSpring(0, { stiffness: 200, damping: 25 });
  const sheen = useMotionTemplate`radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255,255,255,.55), transparent 45%)`;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - r.left;
    const cy = e.clientY - r.top;
    tiltY.set((cx / r.width - 0.5) * 16);   // rotateY: left/right
    tiltX.set((0.5 - cy / r.height) * 14);  // rotateX: up/down
    sheenX.set((cx / r.width) * 100);
    sheenY.set((cy / r.height) * 100);
    sheenOpacity.set(1);
  }
  function handleLeave() { tiltX.set(0); tiltY.set(0); sheenOpacity.set(0); }

  return (
    <section ref={sectionRef} style={{ position: 'relative', background: 'var(--gb-surface)', padding: '160px 22px 88px', overflow: 'hidden' }}>
      
      {/* Orbital Tracks Background Dome */}
      <div className="absolute inset-0 mx-auto flex justify-center w-full pointer-events-none z-0 overflow-visible">
        <div className="absolute top-[280px] left-1/2 -translate-x-1/2 flex items-center justify-center">
          {/* Outer Track */}
          <div className="absolute w-[1000px] h-[1000px] rounded-full border-[1.5px] border-[#1A1311]/[0.05]" />
          {/* Middle Track */}
          <div className="absolute w-[800px] h-[800px] rounded-full border-[1.5px] border-[#1A1311]/[0.05]" />
          {/* Inner Track */}
          <div className="absolute w-[600px] h-[600px] rounded-full border-[1.5px] border-[#1A1311]/[0.05]" />
        </div>
        
        {/* Outer Track Nodes */}
        <OrbitNode radius={500} baseAngle={-40} duration={25} swing={6}>
          <div className="bg-white px-3.5 py-1.5 rounded-full shadow-sm border border-gray-100 flex items-center gap-2 text-[13px] font-semibold text-[#1A1311] whitespace-nowrap"><span className="text-lg">☕</span> 5 min prep</div>
        </OrbitNode>
        <OrbitNode radius={500} baseAngle={35} duration={22} swing={8}>
          <div className="w-10 h-10 rounded-full shadow-sm border border-gray-100 overflow-hidden"><img src="https://i.pravatar.cc/100?img=32" alt="avatar" /></div>
        </OrbitNode>
        <OrbitNode radius={500} baseAngle={-10} duration={19} swing={5}>
          <div className="bg-white w-10 h-10 rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-lg">🔥</div>
        </OrbitNode>

        {/* Middle Track Nodes */}
        <OrbitNode radius={400} baseAngle={45} duration={20} swing={7}>
          <div className="bg-white px-3.5 py-1.5 rounded-full shadow-sm border border-gray-100 flex items-center gap-1.5 text-[13px] font-semibold text-[#1A1311] whitespace-nowrap"><span className="text-[#F09819] text-base">📍</span> 200m away</div>
        </OrbitNode>
        <OrbitNode radius={400} baseAngle={-25} duration={24} swing={5}>
          <div className="w-10 h-10 rounded-full shadow-sm border border-gray-100 overflow-hidden"><img src="https://i.pravatar.cc/100?img=44" alt="avatar" /></div>
        </OrbitNode>
        <OrbitNode radius={400} baseAngle={15} duration={18} swing={6}>
          <div className="bg-white w-10 h-10 rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-lg">🤎</div>
        </OrbitNode>

        {/* Inner Track Nodes */}
        <OrbitNode radius={300} baseAngle={-45} duration={16} swing={8}>
          <div className="bg-white w-10 h-10 rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-lg">✨</div>
        </OrbitNode>
        <OrbitNode radius={300} baseAngle={25} duration={21} swing={6}>
          <div className="bg-white px-3.5 py-1.5 rounded-full shadow-sm border border-gray-100 flex items-center gap-1.5 text-[13px] font-semibold text-[#1A1311] whitespace-nowrap"><span className="text-[#F09819] text-base">⭐</span> 4.9 Rated</div>
        </OrbitNode>
      </div>

      {ORBS.map((o, i) => <Orb key={i} o={o} p={scrollYProgress} />)}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1120, margin: '0 auto', textAlign: 'center' }}>
        <h2 className="gb-serif" style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 600, letterSpacing: '-.01em', margin: '0 0 40px', color: 'var(--gb-text-strong)', position: 'relative' }}>
          Order in seconds.<br /><span style={{ fontStyle: 'italic', color: 'var(--gb-primary)' }}>Pick up in minutes.</span>
        </h2>
        <motion.div
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          style={{ rotateX: rotateXAll, rotateY: tiltY, y: cardY, opacity: cardOpacity, transformPerspective: 1200, transformStyle: 'preserve-3d', position: 'relative', cursor: 'pointer', maxWidth: 380, margin: '0 auto', background: '#fff', borderRadius: 28, overflow: 'hidden', boxShadow: 'var(--gb-shadow-pop)', border: '1px solid var(--gb-line-2)', textAlign: 'left' }}>
          <div style={{ position: 'relative', height: 130 }}>
            <Image src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=85" alt="Café" fill loading="lazy" style={{ objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.55), transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: 12, left: 16, color: '#fff' }}>
              <div className="gb-serif" style={{ fontSize: 20, fontWeight: 600 }}>The Raydee Cafe</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.75)' }}>DTU, Delhi · 15 min prep</div>
            </div>
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ITEMS.map((it) => (
              <motion.div key={it.name}
                whileHover={{ scale: 1.025, y: -2, boxShadow: '0 12px 28px -12px rgba(120,70,0,.35)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 16, background: 'var(--gb-surface)' }}>
                <div style={{ position: 'relative', width: 52, height: 52, borderRadius: 12, overflow: 'hidden', flex: 'none' }}>
                  <Image src={it.img} alt={it.name} fill loading="lazy" style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gb-text)' }}>{it.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gb-muted)' }}>{it.desc}</div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gb-text)' }}>{it.price}</span>
              </motion.div>
            ))}
          </div>
          <div style={{ padding: '12px 16px 16px' }}>
            <div className="gb-hover-btn" style={{ width: '100%', padding: '13px 0', textAlign: 'center', borderRadius: 999, color: '#fff', fontSize: 14, fontWeight: 800, background: 'var(--gb-primary)' }}>
              View cart · ₹500 → Pickup 10:30 AM
            </div>
          </div>
          {/* Cursor-follow sheen */}
          <motion.div aria-hidden style={{ position: 'absolute', inset: 0, background: sheen, opacity: sheenOpacity, mixBlendMode: 'soft-light', pointerEvents: 'none', zIndex: 2 }} />
        </motion.div>
      </div>
    </section>
  );
}
