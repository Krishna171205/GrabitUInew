// grabit/src/components/landing/WhyGrabit.tsx
'use client';
import { motion } from 'framer-motion';
import { MS } from '@/components/gb/kit';
import { FEATURES } from './content';

export default function WhyGrabit() {
  return (
    <section style={{ background: 'var(--gb-surface)', padding: '88px 22px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <h2 className="gb-serif" style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 600, letterSpacing: '-.01em', margin: '0 0 40px', color: 'var(--gb-text-strong)' }}>
          Why Grabit
        </h2>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr' }} className="gb-why-grid">
          {FEATURES.map((f, i) => (
            <motion.div key={f.n}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200, damping: 22, delay: i * 0.08 }}
              style={{ position: 'relative', background: 'var(--gb-card)', border: '1px solid var(--gb-line-2)', borderRadius: 'var(--gb-r-card)', padding: 28, overflow: 'hidden', boxShadow: 'var(--gb-shadow-card)', gridColumn: i === 0 ? 'span 1' : 'auto' }}
              className={i === 0 ? 'gb-why-lead' : undefined}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--gb-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <MS name={f.icon} size={28} fill color="var(--gb-primary)" />
              </div>
              <h3 className="gb-serif" style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px', color: 'var(--gb-text-strong)' }}>{f.title}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--gb-muted)', margin: 0 }}>{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
