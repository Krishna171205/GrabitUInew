'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, GrabbitLogo } from '@/components/ui/kit';

type Step = 'phone' | 'otp';

export default function StaffLoginPage() {
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
        body: JSON.stringify({ phone, type: 'staff', slug }),
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
      const res = await fetch('/api/auth/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, type: 'staff', slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      router.replace(`/${slug}/manage`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: 'var(--surface)',
    }}>
      <div style={{
        width: '100%', maxWidth: 360, background: 'var(--surface-card)',
        borderRadius: 'var(--r-xl)', border: '1px solid var(--hairline)',
        boxShadow: 'var(--shadow-card)', padding: 32,
      }}>
        <div style={{ marginBottom: 22 }}><GrabbitLogo height={26} /></div>

        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--primary)', marginBottom: 8,
        }}>
          Staff access
        </p>

        <h1 className="t-title" style={{ fontSize: 24, marginBottom: 8 }}>
          {step === 'phone' ? 'Enter your number' : 'Enter OTP'}
        </h1>

        <p className="t-caption" style={{ marginBottom: 28 }}>
          {step === 'phone'
            ? "We'll send a 6-digit code to your number."
            : `Sent to +91 ${phone}`}
        </p>

        {step === 'phone' ? (
          <>
            <div style={{
              display: 'flex', border: '1px solid var(--hairline-strong)', borderRadius: 'var(--r-sm)',
              overflow: 'hidden', marginBottom: 12, background: 'var(--surface)',
            }}>
              <span style={{ padding: '14px 12px 14px 16px', fontSize: 16, color: 'var(--muted)', borderRight: '1px solid var(--hairline-strong)' }}>+91</span>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                maxLength={10}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={e => e.key === 'Enter' && phone.length === 10 && sendOtp()}
                style={{ flex: 1, padding: '14px 16px', fontSize: 16, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font)' }}
              />
            </div>
            <Button full size="lg" disabled={phone.length !== 10 || loading} onClick={sendOtp}>
              {loading ? 'Sending…' : 'Get OTP'}
            </Button>
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
              className="tabular"
              style={{
                width: '100%', padding: '14px 16px', fontSize: 20, fontWeight: 700, letterSpacing: '0.2em',
                textAlign: 'center', border: '1px solid var(--hairline-strong)', borderRadius: 'var(--r-sm)',
                background: 'var(--surface)', color: 'var(--on-surface)', outline: 'none', marginBottom: 12,
                boxSizing: 'border-box', fontFamily: 'var(--font)',
              }}
            />
            <Button full size="lg" disabled={otp.length !== 6 || loading} onClick={verifyOtp}>
              {loading ? 'Verifying…' : 'Sign in'}
            </Button>
            <button
              onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
              style={{ width: '100%', padding: 12, marginTop: 8, fontSize: 14, color: 'var(--muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}
            >
              Change number
            </button>
          </>
        )}

        {error && <p style={{ color: 'var(--error)', fontSize: 14, marginTop: 12 }}>{error}</p>}
      </div>
    </div>
  );
}
