'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingSteps, inputStyle, labelStyle, primaryButtonStyle, fieldWrap } from '../shared';

export default function BusinessStep() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [urlSlug, setUrlSlug] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/proxy/grabit/vendor/onboarding')
      .then((r) => r.json())
      .then((d) => {
        if (d.cafe_name && d.cafe_name !== 'New Café') setName(d.cafe_name);
        if (d.cafe_slug && !d.cafe_slug.startsWith('draft-')) setUrlSlug(d.cafe_slug);
        if (d.cafe_address) setAddress(d.cafe_address);
        if (d.cafe_city) setCity(d.cafe_city);
      })
      .finally(() => setLoading(false));
  }, []);

  // Address and city are no longer optional: they go on the business address your
  // payment account is registered against, and KYC fails without them.
  const valid =
    name.trim().length > 0 &&
    /^[a-z0-9]+(-[a-z0-9]+)*$/.test(urlSlug) &&
    address.trim().length > 4 &&
    city.trim().length > 1;

  async function save() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/proxy/grabit/vendor/onboarding/business', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), slug: urlSlug, address, city }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      router.push(`/${data.cafe_slug}/manage/onboarding/kyc`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  return (
    <div className="gb-app">
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', padding: '32px 26px 40px' }}>
        <OnboardingSteps current={1} />
        <div className="gb-serif" style={{ fontSize: 24, fontWeight: 500, marginTop: 18 }}>Tell us about your café</div>
        <div style={{ fontSize: 14, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 4, marginBottom: 22 }}>
          This is what customers see, and the address your payouts are registered to.
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Café name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="The Roastery" style={inputStyle} />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Grabit URL</label>
          <div style={{ display: 'flex', alignItems: 'center', ...inputStyle, padding: '0 16px' }}>
            <span style={{ color: 'var(--gb-muted)', fontSize: 14 }}>grabit365.com/</span>
            <input
              value={urlSlug}
              onChange={(e) => setUrlSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="the-roastery"
              style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: 15, fontWeight: 600, fontFamily: 'var(--gb-sans)', color: 'var(--gb-text)' }}
            />
          </div>
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Address</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Shop 4, MG Road" style={inputStyle} />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>City</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Bengaluru" style={inputStyle} />
        </div>

        <button onClick={save} disabled={!valid || saving} style={{ ...primaryButtonStyle, opacity: valid ? 1 : 0.55, cursor: valid && !saving ? 'pointer' : 'not-allowed' }}>
          {saving ? 'Saving…' : 'Continue'}
        </button>
        {error && <p style={{ color: 'var(--gb-danger)', fontSize: 14, marginTop: 14, textAlign: 'center' }}>{error}</p>}
      </div>
    </div>
  );
}
