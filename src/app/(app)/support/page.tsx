'use client';
import { useState } from 'react';
import { MS, TopBar, Eyebrow } from '@/components/gb/kit';

const SUPPORT_EMAIL = 'support@grabit.app';

const FAQ: { q: string; a: string }[] = [
  { q: 'How do I get a refund?', a: 'If your order was cancelled or not handed over, the amount is auto-refunded to your original payment method within 3–5 business days. Reach out above if it hasn’t arrived.' },
  { q: 'Can I change my pickup time?', a: 'Before the café starts preparing, you can update the pickup slot from the order screen. Once it’s being prepared, message the café directly.' },
  { q: 'What if the café is closed?', a: 'You’ll only see cafés that are open and accepting pre-orders. If a café closes after you order, you’re fully refunded automatically.' },
];

const field = { border: '1px solid #E7DCCC', borderRadius: 11, padding: '12px 13px', fontSize: 14, fontWeight: 500, color: 'var(--gb-text)', width: '100%', background: '#fff', outline: 'none', fontFamily: 'var(--gb-sans)' } as const;

export default function SupportPage() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject || 'Grabbit support')}&body=${encodeURIComponent(body)}`;

  return (
    <div className="gb-shell gb-shell-read">
      <TopBar title="Help & support" />
      <div style={{ padding: '18px 16px 30px' }}>
        <div className="gb-serif" style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.3, padding: '0 4px' }}>How can we help?</div>

        {/* email our team */}
        <a href={`mailto:${SUPPORT_EMAIL}`} style={{ marginTop: 14, background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 18, padding: 16, display: 'flex', alignItems: 'center', gap: 13 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: '#EDE4D6', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <MS name="mail" size={24} fill color="var(--gb-gold)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--gb-text)' }}>Email our team</div>
            <div style={{ fontSize: 12.5, color: 'var(--gb-primary)', fontWeight: 700, marginTop: 1 }}>{SUPPORT_EMAIL}</div>
            <div style={{ fontSize: 11.5, color: 'var(--gb-muted-2)', fontWeight: 600, marginTop: 2 }}>We reply within 24 hours</div>
          </div>
          <MS name="chevron_right" size={20} color="var(--gb-icon)" />
        </a>

        {/* problem form */}
        <Eyebrow style={{ padding: '22px 4px 8px' }}>Send us your problem</Eyebrow>
        <div style={{ background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 18, padding: 16 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#6E6155', marginBottom: 6 }}>Subject</div>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Issue with my order…" style={{ ...field, marginBottom: 14 }} />
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#6E6155', marginBottom: 6 }}>Describe the issue</div>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Tell us what went wrong and we'll get back to you at your registered email…" style={{ ...field, minHeight: 90, lineHeight: 1.5, resize: 'vertical' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, color: 'var(--gb-muted)', fontSize: 12, fontWeight: 600 }}>
            <MS name="attach_file" size={18} color="var(--gb-primary)" />Attach a photo (optional)
          </div>
          <a href={mailto} style={{ display: 'block', marginTop: 14, background: 'var(--gb-primary)', color: '#fff', borderRadius: 13, padding: 14, textAlign: 'center', fontSize: 15, fontWeight: 800, boxShadow: '0 12px 24px -10px rgba(177,90,50,.6)' }}>
            Send to {SUPPORT_EMAIL}
          </a>
        </div>

        {/* faq */}
        <Eyebrow style={{ padding: '22px 4px 8px' }}>Common questions</Eyebrow>
        <div style={{ background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 18, overflow: 'hidden' }}>
          {FAQ.map((f, i) => (
            <details key={f.q} style={{ borderBottom: i < FAQ.length - 1 ? '1px solid #F5EFE6' : 'none' }}>
              <summary style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '15px 16px', cursor: 'pointer', listStyle: 'none' }}>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--gb-text)' }}>{f.q}</span>
                <MS name="expand_more" size={20} color="var(--gb-icon)" />
              </summary>
              <div style={{ padding: '0 16px 15px', fontSize: 13, color: 'var(--gb-muted)', fontWeight: 500, lineHeight: 1.5 }}>{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
