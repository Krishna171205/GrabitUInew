// grabit/src/components/landing/FAQSection.tsx
'use client';
import { motion } from 'framer-motion';

const faqs: Array<{ q: string; a: string }> = [
  {
    q: 'How does Grabbit work?',
    a: 'Browse menus from cafes near you, customize your order, choose a pickup time, and pay online with UPI, card, or netbanking. Your order is ready when you arrive — no queue.',
  },
  {
    q: 'Where is Grabbit available?',
    a: 'Grabbit (also known as LetsGrabbit) is now live in Delhi NCR. Order ahead from your favourite cafes in and around Delhi.',
  },
  {
    q: 'How do I pay for my order?',
    a: 'Checkout is prepaid: pay online with UPI, card, or netbanking and your order goes straight to the cafe.',
  },
  {
    q: 'How do I get updates on my order?',
    a: 'Order status updates are sent via WhatsApp at every step — from confirmed, to prepping, to ready for pickup. No new app to install.',
  },
  {
    q: 'Can I schedule a pickup for later?',
    a: 'Yes. Set any pickup time that works — 15 minutes from now or hours ahead. No fixed slots, no limits. That is LetsGrabbit.',
  },
  {
    q: 'Is there an app to download?',
    a: 'Grabbit works in your browser — no app required. Just bookmark letsgrabbit.com and order ahead in seconds.',
  },
];

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 24 } },
};

export default function FAQSection() {
  return (
    <section style={{ background: 'var(--gb-surface)', padding: '88px 22px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <motion.div
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
          style={{ textAlign: 'center', marginBottom: 56 }}
        >
          <motion.span variants={item} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--gb-primary-soft)', color: '#0F172A', fontSize: 12, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', padding: '6px 12px', borderRadius: 999, marginBottom: 18 }}>
            FAQs
          </motion.span>
          <motion.h2 variants={item} className="gb-serif" style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 600, lineHeight: 1.1, margin: '0 0 16px', color: 'var(--gb-text-strong)' }}>
            Questions about Grabbit
          </motion.h2>
          <motion.p variants={item} style={{ color: 'var(--gb-muted)', fontSize: 16, lineHeight: 1.5, maxWidth: 560, margin: '0 auto' }}>
            Everything you need to know about ordering coffee ahead with Grabbit (LetsGrabbit).
          </motion.p>
        </motion.div>

        <div style={{ display: 'grid', gap: 12 }}>
          {faqs.map((f, i) => (
            <motion.div
              key={f.q}
              variants={item}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: 'var(--gb-card)',
                border: '1px solid var(--gb-line-2)',
                borderRadius: 16,
                padding: '20px 24px',
                boxShadow: 'var(--gb-shadow-card)',
              }}
            >
              <h3 className="gb-serif" style={{ fontSize: 17, fontWeight: 600, margin: 0, color: 'var(--gb-text-strong)', lineHeight: 1.4 }}>
                {f.q}
              </h3>
              <p style={{ color: 'var(--gb-muted)', fontSize: 14.5, lineHeight: 1.6, margin: '8px 0 0' }}>
                {f.a}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
