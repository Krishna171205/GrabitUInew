'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { OnboardingSteps, inputStyle, labelStyle, primaryButtonStyle, fieldWrap } from '../shared';

const ACCOUNT_RE = /^\d{9,18}$/;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export default function BankStep() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const valid = ACCOUNT_RE.test(accountNumber) && IFSC_RE.test(ifsc) && accountHolder.trim().length > 0 && bankName.trim().length > 0;

  async function save() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/proxy/grabit/vendor/onboarding/bank', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_number: accountNumber, ifsc, account_holder: accountHolder.trim(), bank_name: bankName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save bank details');
      router.push(`/${slug}/manage/onboarding/review`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="gb-app">
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', padding: '32px 26px 40px' }}>
        <OnboardingSteps current={3} />
        <div className="gb-serif" style={{ fontSize: 24, fontWeight: 500, marginTop: 18 }}>Where should we send your payouts?</div>
        <div style={{ fontSize: 14, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 4, marginBottom: 22 }}>
          Every order's payout lands here, automatically.
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Account number</label>
          <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 18))} inputMode="numeric" placeholder="1234567890" style={inputStyle} />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>IFSC code</label>
          <input value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase().slice(0, 11))} placeholder="HDFC0001234" style={inputStyle} />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Account holder name</label>
          <input value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} placeholder="As on your bank passbook" style={inputStyle} />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Bank name</label>
          <input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="HDFC Bank" style={inputStyle} />
        </div>

        <button onClick={save} disabled={!valid || saving} style={{ ...primaryButtonStyle, opacity: valid ? 1 : 0.55, cursor: valid && !saving ? 'pointer' : 'not-allowed' }}>
          {saving ? 'Saving…' : 'Continue'}
        </button>
        {error && <p style={{ color: 'var(--gb-danger)', fontSize: 14, marginTop: 14, textAlign: 'center' }}>{error}</p>}
      </div>
    </div>
  );
}
