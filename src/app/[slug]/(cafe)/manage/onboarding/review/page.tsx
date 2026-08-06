'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { MS } from '@/components/gb/kit';
import { OnboardingSteps, primaryButtonStyle, secondaryButtonStyle } from '../shared';

interface OnboardingView {
  cafe_name: string; cafe_slug: string; cafe_address: string | null; cafe_city: string | null;
  legal_name: string; business_type: string; pan: string; gst: string | null;
  contact_email: string; state: string; postal_code: string;
  fssai_number: string; fssai_expiry: string; bank_account_number_masked: string; bank_ifsc: string; bank_account_holder: string; bank_name: string;
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--gb-line)' }}>
      <span style={{ fontSize: 13.5, color: 'var(--gb-muted)', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 13.5, color: 'var(--gb-text)', fontWeight: 700, textAlign: 'right' }}>{value || '-'}</span>
    </div>
  );
}

export default function ReviewStep() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [data, setData] = useState<OnboardingView | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/proxy/grabit/vendor/onboarding').then((r) => r.json()).then(setData);
  }, []);

  async function submit() {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/proxy/grabit/vendor/submit', { method: 'POST' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to submit');
      router.push(`/${slug}/manage/onboarding/status`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (!data) return null;

  return (
    <div className="gb-app">
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', padding: '32px 26px 40px' }}>
        <OnboardingSteps current={5} />
        <div className="gb-serif" style={{ fontSize: 24, fontWeight: 500, marginTop: 18 }}>Review &amp; submit</div>
        <div style={{ fontSize: 14, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 4, marginBottom: 22 }}>
          We send this to our payment partner so your money settles straight to your bank.
          Check it over — a typo here costs you a couple of days.
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--gb-line-2)', borderRadius: 18, padding: '4px 16px', marginBottom: 16 }}>
          <Row label="Café name" value={data.cafe_name} />
          <Row label="Grabbit URL" value={`grabit365.com/${data.cafe_slug}`} />
          <Row label="Address" value={[data.cafe_address, data.cafe_city, data.state, data.postal_code].filter(Boolean).join(', ')} />
          <Row label="Legal name" value={data.legal_name} />
          <Row label="Business type" value={data.business_type?.replace('_', ' ')} />
          <Row label="PAN" value={data.pan} />
          <Row label="GST" value={data.gst} />
          <Row label="Email" value={data.contact_email} />
          <Row label="FSSAI" value={data.fssai_number} />
          <Row label="Bank account" value={data.bank_account_number_masked} />
          <Row label="IFSC" value={data.bank_ifsc} />
        </div>

        <Link
          href={`/${slug}/manage/menu`}
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--gb-primary-soft)', border: '1px solid #EAD6C4', borderRadius: 14, padding: '14px 16px', marginBottom: 16, color: 'var(--gb-primary)', fontWeight: 700, fontSize: 13.5 }}
        >
          <MS name="restaurant_menu" size={20} />
          Add your menu now (optional, you can do this later too)
          <MS name="arrow_forward" size={18} style={{ marginLeft: 'auto' }} />
        </Link>

        <button onClick={submit} disabled={submitting} style={primaryButtonStyle}>
          {submitting ? 'Submitting…' : 'Submit for verification'}
        </button>
        <button onClick={() => router.push(`/${slug}/manage/onboarding/documents`)} style={secondaryButtonStyle}>
          Back to edit
        </button>
        {error && <p style={{ color: 'var(--gb-danger)', fontSize: 14, marginTop: 4, textAlign: 'center' }}>{error}</p>}
      </div>
    </div>
  );
}
