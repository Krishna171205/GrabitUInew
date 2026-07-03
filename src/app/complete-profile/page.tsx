'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CompleteProfileForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/home';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  const valid = name.trim().length > 0 && isValidEmail(email);

  async function save() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/proxy/grabit/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      if (!res.ok) throw new Error('Failed to save profile');
      router.replace(next);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 56, padding: '0 16px', border: '1.5px solid var(--gb-line-2)', borderRadius: 14,
    fontSize: 15, fontWeight: 600, fontFamily: 'var(--gb-sans)', color: 'var(--gb-text)', background: '#fff',
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12.5, fontWeight: 700, color: 'var(--gb-muted)', marginBottom: 8, display: 'block',
  };

  return (
    <div style={{ padding: '48px 26px 30px' }}>
      <div className="gb-serif" style={{ fontSize: 28, fontWeight: 500 }}>Almost there</div>
      <div style={{ fontSize: 14, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 6, lineHeight: 1.4 }}>
        Tell us who you are so cafés can find your orders.
      </div>

      <div style={{ marginTop: 26 }}>
        <label style={labelStyle}>Full name</label>
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
      </div>
      <div style={{ marginTop: 16 }}>
        <label style={labelStyle}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
      </div>

      <button
        onClick={save}
        disabled={!valid || saving}
        style={{
          width: '100%', marginTop: 22, background: 'var(--gb-primary)', color: '#fff', border: 'none', borderRadius: 14, height: 56,
          fontSize: 16, fontWeight: 800, boxShadow: '0 12px 24px -10px rgba(177,90,50,.6)',
          cursor: valid && !saving ? 'pointer' : 'not-allowed', opacity: valid ? 1 : 0.55,
        }}
      >
        {saving ? 'Saving…' : 'Save & continue'}
      </button>

      {error && <p style={{ color: 'var(--gb-danger)', fontSize: 14, marginTop: 14, textAlign: 'center' }}>{error}</p>}
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <div className="gb-app">
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', background: 'var(--gb-surface)' }}>
        <Suspense fallback={null}>
          <CompleteProfileForm />
        </Suspense>
      </div>
    </div>
  );
}
