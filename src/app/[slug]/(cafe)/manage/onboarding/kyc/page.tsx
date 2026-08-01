'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { OnboardingSteps, inputStyle, labelStyle, primaryButtonStyle, fieldWrap, INDIAN_STATES } from '../shared';

const BUSINESS_TYPES = [
  { value: 'proprietorship', label: 'Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'private_limited', label: 'Private Limited' },
  { value: 'llp', label: 'LLP' },
];

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const GST_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const FSSAI_RE = /^\d{14}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PIN_RE = /^\d{6}$/;

export default function KycStep() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [legalName, setLegalName] = useState('');
  const [businessType, setBusinessType] = useState('proprietorship');
  const [pan, setPan] = useState('');
  const [gst, setGst] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [fssaiExpiry, setFssaiExpiry] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/proxy/grabit/vendor/onboarding')
      .then((r) => r.json())
      .then((d) => {
        if (d.legal_name) setLegalName(d.legal_name);
        if (d.business_type) setBusinessType(d.business_type);
        if (d.pan) setPan(d.pan);
        if (d.gst) setGst(d.gst);
        if (d.contact_email) setContactEmail(d.contact_email);
        if (d.state) setState(d.state);
        if (d.postal_code) setPostalCode(d.postal_code);
        if (d.fssai_number) setFssaiNumber(d.fssai_number);
        if (d.fssai_expiry) setFssaiExpiry(d.fssai_expiry);
      })
      .finally(() => setLoading(false));
  }, []);

  const valid =
    legalName.trim().length >= 3 &&
    PAN_RE.test(pan) &&
    (gst === '' || GST_RE.test(gst)) &&
    EMAIL_RE.test(contactEmail) &&
    !!state &&
    PIN_RE.test(postalCode) &&
    FSSAI_RE.test(fssaiNumber) &&
    !!fssaiExpiry && new Date(fssaiExpiry) > new Date();

  async function save() {
    setSaving(true);
    setError('');
    try {
      const profileRes = await fetch('/api/proxy/grabit/vendor/onboarding/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          legal_name: legalName.trim(),
          business_type: businessType,
          pan,
          gst: gst || null,
          contact_email: contactEmail.trim().toLowerCase(),
          state,
          postal_code: postalCode,
        }),
      });
      const profileData = await profileRes.json();
      if (!profileRes.ok) throw new Error(profileData.error || 'Failed to save profile');

      const fssaiRes = await fetch('/api/proxy/grabit/vendor/onboarding/fssai', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fssai_number: fssaiNumber, fssai_expiry: fssaiExpiry }),
      });
      const fssaiData = await fssaiRes.json();
      if (!fssaiRes.ok) throw new Error(fssaiData.error || 'Failed to save FSSAI details');

      router.push(`/${slug}/manage/onboarding/bank`);
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
        <OnboardingSteps current={2} />
        <div className="gb-serif" style={{ fontSize: 24, fontWeight: 500, marginTop: 18 }}>Legal &amp; food licence details</div>
        <div style={{ fontSize: 14, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 4, marginBottom: 22 }}>
          These go to our payment partner so your money reaches your bank directly. We handle
          the paperwork; you just check what we filled in.
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Legal business name</label>
          <input value={legalName} onChange={(e) => setLegalName(e.target.value)} placeholder="As on your PAN" style={inputStyle} />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Business type</label>
          <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} style={{ ...inputStyle, appearance: 'auto' }}>
            {BUSINESS_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>PAN</label>
          <input value={pan} onChange={(e) => setPan(e.target.value.toUpperCase().slice(0, 10))} placeholder="ABCDE1234F" style={inputStyle} />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>GST (optional)</label>
          <input value={gst} onChange={(e) => setGst(e.target.value.toUpperCase().slice(0, 15))} placeholder="22ABCDE1234F1Z5" style={inputStyle} />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Your email</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="you@yourcafe.com"
            autoComplete="email"
            inputMode="email"
            style={inputStyle}
          />
          <p style={{ fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 8 }}>
            Your payment account is verified against this address, so use one you actually check.
          </p>
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>State</label>
          <select value={state} onChange={(e) => setState(e.target.value)} style={{ ...inputStyle, appearance: 'auto' }}>
            <option value="">Select a state</option>
            {INDIAN_STATES.map((st) => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>PIN code</label>
          <input
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="560001"
            inputMode="numeric"
            autoComplete="postal-code"
            style={inputStyle}
          />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>FSSAI licence number</label>
          <input value={fssaiNumber} onChange={(e) => setFssaiNumber(e.target.value.replace(/\D/g, '').slice(0, 14))} placeholder="14-digit number" inputMode="numeric" style={inputStyle} />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>FSSAI expiry date</label>
          <input type="date" value={fssaiExpiry} onChange={(e) => setFssaiExpiry(e.target.value)} style={inputStyle} />
        </div>

        <button onClick={save} disabled={!valid || saving} style={{ ...primaryButtonStyle, opacity: valid ? 1 : 0.55, cursor: valid && !saving ? 'pointer' : 'not-allowed' }}>
          {saving ? 'Saving…' : 'Continue'}
        </button>
        {error && <p style={{ color: 'var(--gb-danger)', fontSize: 14, marginTop: 14, textAlign: 'center' }}>{error}</p>}
      </div>
    </div>
  );
}
