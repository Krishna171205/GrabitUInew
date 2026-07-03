// grabit/src/components/landing/HowItWorks.tsx
'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { STEPS, STEP_IMAGES } from './content';

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ background: 'var(--gb-hero)', color: '#fff', padding: '88px 22px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gap: 56, gridTemplateColumns: '1fr', alignItems: 'center' }} className="gb-hiw-grid">
        <div>
          <h2 className="gb-serif" style={{ fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 600, lineHeight: 1.1, margin: '0 0 40px' }}>
            From browse to pickup<br /><span style={{ fontStyle: 'italic', color: 'var(--gb-peach)' }}>in minutes.</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
            {STEPS.map((s, i) => (
              <motion.div key={s.n} style={{ display: 'flex', gap: 20 }}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 180, damping: 22, delay: i * 0.1 }}>
                <div style={{ flex: 'none', width: 44, height: 44, borderRadius: '50%', border: '1px solid rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>{s.n}</div>
                <div>
                  <h3 className="gb-serif" style={{ fontSize: 20, fontWeight: 600, margin: '4px 0 6px' }}>{s.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 15, lineHeight: 1.5, margin: 0 }}>{s.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="gb-hiw-imgs">
          {STEP_IMAGES.map((img, i) => (
            <div key={img.src} style={{ position: 'relative', height: 260, marginTop: i === 1 ? 40 : 0, borderRadius: 20, overflow: 'hidden' }}>
              <Image src={img.src} alt={img.alt} fill loading="lazy" style={{ objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
