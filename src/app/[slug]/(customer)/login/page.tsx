'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

type Step = 'phone' | 'otp';

export default function LoginPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function sendOtp() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, type: 'customer' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setStep('otp');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, type: 'customer' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      router.replace(`/${slug}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--g-white)'
    }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <img src="/grabit-logo.svg" alt="Grabit" style={{ height: '28px', marginBottom: '8px', display: 'block' }} />
        <h1 style={{
          fontSize: '28px', fontWeight: 900,
          letterSpacing: '-0.03em', marginBottom: '8px'
        }}>
          {step === 'phone' ? 'Enter your number' : 'Enter OTP'}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--g-muted)', marginBottom: '32px' }}>
          {step === 'phone'
            ? "We'll send a 6-digit code to confirm it's you."
            : `Sent to +91 ${phone}`}
        </p>

        {step === 'phone' ? (
          <>
            <div style={{
              display: 'flex',
              border: '1px solid var(--g-border)',
              borderRadius: '10px',
              overflow: 'hidden',
              marginBottom: '12px',
              background: 'var(--g-surface)'
            }}>
              <span style={{
                padding: '14px 12px 14px 16px',
                fontSize: '16px',
                color: 'var(--g-muted)',
                borderRight: '1px solid var(--g-border)'
              }}>+91</span>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={e => e.key === 'Enter' && phone.length === 10 && sendOtp()}
                style={{
                  flex: 1, padding: '14px 16px', fontSize: '16px',
                  border: 'none', background: 'transparent', outline: 'none'
                }}
              />
            </div>
            <button
              onClick={sendOtp}
              disabled={phone.length !== 10 || loading}
              style={btnStyle(phone.length === 10 && !loading)}
            >
              {loading ? 'Sending…' : 'Get OTP'}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              inputMode="numeric"
              placeholder="6-digit OTP"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && otp.length === 6 && verifyOtp()}
              style={{
                width: '100%', padding: '14px 16px', fontSize: '20px',
                fontWeight: 700, letterSpacing: '0.2em', textAlign: 'center',
                border: '1px solid var(--g-border)', borderRadius: '10px',
                background: 'var(--g-surface)', outline: 'none', marginBottom: '12px'
              }}
            />
            <button
              onClick={verifyOtp}
              disabled={otp.length !== 6 || loading}
              style={btnStyle(otp.length === 6 && !loading)}
            >
              {loading ? 'Verifying…' : 'Confirm'}
            </button>
            <button
              onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
              style={{
                width: '100%', padding: '12px', marginTop: '8px',
                fontSize: '14px', color: 'var(--g-muted)',
                background: 'transparent', border: 'none', cursor: 'pointer'
              }}
            >
              Change number
            </button>
          </>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: '13px', color: 'var(--g-muted)', textDecoration: 'none', fontWeight: 600 }}>
            ← Back to cafes
          </Link>
        </div>

        {error && (
          <p style={{ color: '#ff3b30', fontSize: '14px', marginTop: '12px' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

function btnStyle(active: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: 600,
    background: active ? 'var(--g-amber)' : 'var(--g-surface)',
    color: active ? '#fff' : 'var(--g-muted)',
    border: 'none',
    borderRadius: '980px',
    cursor: active ? 'pointer' : 'not-allowed',
    transition: 'background 0.15s, color 0.15s'
  };
}
