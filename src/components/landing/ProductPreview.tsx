// grabit/src/components/landing/ProductPreview.tsx
'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';

const ITEMS = [
  { name: 'Cold Brew', desc: 'Smooth 12-hour steep', price: '₹220', img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&q=80' },
  { name: 'Flat White', desc: 'Double ristretto, silky foam', price: '₹280', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&q=80' },
  { name: 'Matcha Latte', desc: 'Ceremonial grade, oat milk', price: '₹320', img: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=200&q=80' },
];

export default function ProductPreview() {
  return (
    <section style={{ background: 'var(--gb-surface)', padding: '48px 22px 88px', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', textAlign: 'center' }}>
        <h2 className="gb-serif" style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 600, letterSpacing: '-.01em', margin: '0 0 40px', color: 'var(--gb-text-strong)' }}>
          Order in seconds.<br /><span style={{ fontStyle: 'italic', color: 'var(--gb-primary)' }}>Pick up in minutes.</span>
        </h2>
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 120, damping: 22 }}
          style={{ maxWidth: 380, margin: '0 auto', background: '#fff', borderRadius: 28, overflow: 'hidden', boxShadow: 'var(--gb-shadow-pop)', border: '1px solid var(--gb-line-2)', textAlign: 'left' }}>
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
              <div key={it.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 16, background: 'var(--gb-surface)' }}>
                <div style={{ position: 'relative', width: 52, height: 52, borderRadius: 12, overflow: 'hidden', flex: 'none' }}>
                  <Image src={it.img} alt={it.name} fill loading="lazy" style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gb-text)' }}>{it.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gb-muted)' }}>{it.desc}</div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gb-text)' }}>{it.price}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 16px 16px' }}>
            <div style={{ width: '100%', padding: '13px 0', textAlign: 'center', borderRadius: 999, color: '#fff', fontSize: 14, fontWeight: 800, background: 'var(--gb-primary)' }}>
              View cart · ₹500 → Pickup 10:30 AM
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
