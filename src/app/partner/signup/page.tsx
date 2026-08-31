'use client';
import { useState } from 'react';
import { MS } from '@/components/gb/kit';

export default function PartnerSignupPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cafeName, setCafeName] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const valid = name.trim().length > 0 && phone.length === 10 && cafeName.trim().length > 0;

  async function submit() {
    if (!valid) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/partner-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, cafeName, city, message }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError('Something went wrong, please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = { width: '100%', height: 52, padding: '0 16px', border: '1.5px solid var(--gb-line-2)', borderRadius: 14, outline: 'none', fontSize: 15, fontWeight: 500, color: 'var(--gb-text)', background: '#fff', fontFamily: 'var(--gb-sans)' } as const;
  const labelStyle = { fontSize: 13, fontWeight: 700, color: 'var(--gb-muted)', marginBottom: 6, display: 'block' } as const;

  if (sent) {
    return (
      <div className="gb-app">
        <div style={{ maxWidth: 420, margin: '0 auto', minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 26px 32px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gb-primary-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <MS name="check_circle" size={34} fill color="var(--gb-primary)" />
          </div>
          <div className="gb-serif" style={{ fontSize: 24, fontWeight: 500 }}>We&apos;ve got your details</div>
          <div style={{ fontSize: 14.5, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 8, lineHeight: 1.5 }}>
            Someone from the Grabbit team will call you within a few hours to get your café started.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gb-app">
      <div style={{ maxWidth: 420, margin: '0 auto', minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 26px 32px' }}>
        <div className="gb-serif" style={{ fontSize: 26, fontWeight: 500, textAlign: 'center' }}>
          Become a Grabbit partner
        </div>
        <div style={{ fontSize: 14, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 6, marginBottom: 26, textAlign: 'center', lineHeight: 1.4 }}>
          Tell us about your café and we&apos;ll call you back within a few hours to get you started.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Your name</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          </div>

          <div>
            <label style={labelStyle}>Mobile number</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid var(--gb-line-2)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 52, borderRight: '1px solid var(--gb-line-2)' }}>
                <span style={{ fontSize: 16 }}>🇮🇳</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--gb-text)' }}>+91</span>
              </div>
              <input
                type="tel" inputMode="numeric" placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                style={{ flex: 1, minWidth: 0, height: 52, padding: '0 14px', border: 'none', outline: 'none', fontSize: 15, fontWeight: 700, letterSpacing: '.02em', color: 'var(--gb-text)', background: 'transparent', fontFamily: 'var(--gb-sans)' }}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Café name</label>
            <input style={inputStyle} value={cafeName} onChange={(e) => setCafeName(e.target.value)} placeholder="e.g. The Corner Cafe" />
          </div>

          <div>
            <label style={labelStyle}>City</label>
            <input style={inputStyle} value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Delhi" />
          </div>

          <div>
            <label style={labelStyle}>Anything else? (optional)</label>
            <textarea
              style={{ ...inputStyle, height: 84, padding: '12px 16px', resize: 'none' }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Number of outlets, current POS, etc."
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={!valid || loading}
          style={{ width: '100%', marginTop: 22, background: 'var(--gb-primary)', color: '#fff', border: 'none', borderRadius: 14, height: 56, fontSize: 16, fontWeight: 800, boxShadow: '0 12px 24px -10px rgba(177,90,50,.6)', cursor: valid && !loading ? 'pointer' : 'not-allowed', opacity: valid ? 1 : 0.55 }}
        >
          {loading ? 'Sending…' : 'Request a callback'}
        </button>

        {error && <p style={{ color: 'var(--gb-danger)', fontSize: 14, marginTop: 14, textAlign: 'center' }}>{error}</p>}
      </div>
    </div>
  );
}
