// grabbit/src/components/landing/WhyGrabbit.tsx
'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import { MS } from '@/components/gb/kit';
import { FEATURES } from './content';

const shell = { marginTop: 20, borderRadius: 18, border: '1px solid var(--gb-line-2)', padding: 14 } as const;

// Live pickup-time demo — self-cycles when in view, shows a real "ready by" clock. The lead value prop.
const READY_OPTS = [
  { label: 'ASAP', mins: 8 },
  { label: '15 min', mins: 15 },
  { label: '30 min', mins: 30 },
  { label: '1 hr', mins: 60 },
];

function readyBy(mins: number) {
  const d = new Date(Date.now() + mins * 60000);
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ap}`;
}

function SlotDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const reduced = !!useReducedMotion();
  const [sel, setSel] = useState(1);
  const [custom, setCustom] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!inView || paused || custom || reduced) return;
    const id = setInterval(() => setSel((s) => (s + 1) % READY_OPTS.length), 1900);
    return () => clearInterval(id);
  }, [inView, paused, custom, reduced]);

  const chip = (selected: boolean, dashed = false): CSSProperties => ({
    position: 'relative', overflow: 'hidden', cursor: 'pointer', fontFamily: 'inherit',
    fontSize: 13, fontWeight: 700, padding: '7px 13px', borderRadius: 999,
    background: dashed ? 'transparent' : '#fff',
    border: `1px ${dashed ? 'dashed' : 'solid'} var(--gb-line-2)`,
    color: selected ? '#0F172A' : dashed ? 'var(--gb-muted)' : 'var(--gb-text)',
  });
  const label = custom ? 'your time' : (mounted ? readyBy(READY_OPTS[sel].mins) : '—');

  return (
    <div ref={ref} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      style={{ ...shell, background: 'var(--gb-surface)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--gb-muted)', marginBottom: 10 }}>Ready in</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {READY_OPTS.map((o, i) => {
          const on = !custom && sel === i;
          return (
            <button key={o.label} type="button" onClick={() => { setCustom(false); setSel(i); }} style={chip(on)}>
              {on && <motion.span layoutId="slotpill" transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'var(--gb-primary)', zIndex: 0 }} />}
              <span style={{ position: 'relative', zIndex: 1 }}>{o.label}</span>
            </button>
          );
        })}
        <button type="button" onClick={() => setCustom(true)} style={chip(custom, true)}>
          {custom && <motion.span layoutId="slotpill" transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'var(--gb-primary)', zIndex: 0 }} />}
          <span style={{ position: 'relative', zIndex: 1 }}>Custom +</span>
        </button>
      </div>
      <div style={{ marginTop: 12, fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ color: 'var(--gb-muted)' }}>Ready by</span>
        <span style={{ position: 'relative', minWidth: 78, height: 18, display: 'inline-block' }}>
          <AnimatePresence initial={false}>
            <motion.span key={label} initial={{ y: 9, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -9, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'absolute', left: 0, fontWeight: 800, color: 'var(--gb-text-strong)' }}>{label}</motion.span>
          </AnimatePresence>
        </span>
      </div>
    </div>
  );
}

// Mini grabit app-UI mocks — one per feature (dock.cool-style product render).
function FeatureMock({ kind }: { kind: 'slot' | 'pay' | 'chat' }) {
  if (kind === 'slot') return <SlotDemo />;
  if (kind === 'pay') {
    const methods = [{ n: 'UPI', on: true }, { n: 'Card ••4291', on: false }, { n: 'Pay at counter', on: false }];
    return (
      <div style={{ ...shell, background: 'var(--gb-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gb-muted)' }}>Total</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--gb-text-strong)' }}>₹500</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {methods.map((m) => (
            <div key={m.n} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: 'var(--gb-text)' }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', flex: 'none', border: `2px solid ${m.on ? 'var(--gb-primary)' : 'var(--gb-line-2)'}`, background: m.on ? 'var(--gb-primary)' : 'transparent' }} />
              {m.n}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div style={{ ...shell, background: 'linear-gradient(180deg, #ece5db, #f3ede4)' }}>
      <div style={{ maxWidth: '92%', background: '#fff', borderRadius: '14px 14px 14px 4px', padding: '10px 12px', boxShadow: '0 1px 2px rgba(0,0,0,.08)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', lineHeight: 1.4 }}>Order #GB204 is ready ☕<br />Collect at the counter.</div>
        <div style={{ fontSize: 10, color: 'var(--gb-muted)', textAlign: 'right', marginTop: 4 }}>10:28 AM <span style={{ color: '#34b7f1' }}>✓✓</span></div>
      </div>
    </div>
  );
}

const MOCK_KINDS = ['slot', 'pay', 'chat'] as const;

export default function WhyGrabbit() {
  return (
    <section style={{ background: 'var(--gb-surface)', padding: '88px 22px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <h2 className="gb-serif" style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 600, letterSpacing: '-.01em', margin: '0 0 40px', color: 'var(--gb-text-strong)' }}>
          Why Grabbit
        </h2>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr' }} className="gb-why-grid">
          {FEATURES.map((f, i) => (
            <motion.div key={f.n}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              whileHover={{ y: -4, boxShadow: '0 22px 48px -18px rgba(0, 85, 212,.32)' }}
              transition={{ type: 'spring', stiffness: 200, damping: 22, delay: i * 0.08 }}
              style={{ position: 'relative', background: 'var(--gb-card)', border: '1px solid var(--gb-line-2)', borderRadius: 'var(--gb-r-card)', padding: 28, overflow: 'hidden', boxShadow: 'var(--gb-shadow-card)', gridColumn: i === 0 ? 'span 1' : 'auto', cursor: 'pointer' }}
              className={i === 0 ? 'gb-why-lead' : undefined}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--gb-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <MS name={f.icon} size={28} fill color="var(--gb-primary)" />
              </div>
              <h3 className="gb-serif" style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px', color: 'var(--gb-text-strong)' }}>{f.title}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--gb-muted)', margin: 0 }}>{f.body}</p>
              <FeatureMock kind={MOCK_KINDS[i] ?? 'slot'} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
