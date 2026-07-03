'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MS } from '@/components/gb/kit';

type Step = 'phone' | 'otp';

export default function PartnerSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  async function sendOtp() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, type: 'vendor_signup' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setStep('otp');
    } catch (e) {
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
        body: JSON.stringify({ phone, otp, type: 'vendor_signup' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      router.push(`/${data.staff.cafe_slug}/manage/onboarding/business`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (step !== 'otp') return;
    setTimer(28);
    const iv = setInterval(() => setTimer((t) => (t <= 1 ? (clearInterval(iv), 0) : t - 1)), 1000);
    const f = setTimeout(() => boxes.current[0]?.focus(), 250);
    return () => { clearInterval(iv); clearTimeout(f); };
  }, [step]);

  const digits = otp.padEnd(6).slice(0, 6).split('');
  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, '').slice(-1);
    const next = digits.map((c) => c.trim()).join('').padEnd(6).split('');
    next[i] = d || ' ';
    const joined = next.join('').replace(/\s/g, '');
    setOtp(joined.slice(0, 6));
    if (d && i < 5) boxes.current[i + 1]?.focus();
  };

  return (
    <div className="gb-app">
      <div style={{ maxWidth: 420, margin: '0 auto', minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 26px 32px' }}>
        <div className="gb-serif" style={{ fontSize: 26, fontWeight: 500, textAlign: 'center' }}>
          {step === 'phone' ? 'Become a Grabit partner' : 'Enter the code'}
        </div>

        {step === 'phone' ? (
          <>
            <div style={{ fontSize: 14, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 6, marginBottom: 26, textAlign: 'center', lineHeight: 1.4 }}>
              Enter your mobile number — we&apos;ll text you a one-time code to get your café started.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 0, background: '#fff', border: '1.5px solid var(--gb-primary)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 0 0 4px rgba(177,90,50,.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 56, borderRight: '1px solid #EEE4D6' }}>
                <span style={{ fontSize: 16 }}>🇮🇳</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--gb-text)' }}>+91</span>
              </div>
              <input
                autoFocus type="tel" inputMode="numeric" placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={(e) => e.key === 'Enter' && phone.length === 10 && sendOtp()}
                style={{ flex: 1, minWidth: 0, height: 56, padding: '0 14px', border: 'none', outline: 'none', fontSize: 17, fontWeight: 700, letterSpacing: '.02em', color: 'var(--gb-text)', background: 'transparent', fontFamily: 'var(--gb-sans)' }}
              />
            </div>
            <button onClick={sendOtp} disabled={phone.length !== 10 || loading} style={{ width: '100%', marginTop: 16, background: 'var(--gb-primary)', color: '#fff', border: 'none', borderRadius: 14, height: 56, fontSize: 16, fontWeight: 800, boxShadow: '0 12px 24px -10px rgba(177,90,50,.6)', cursor: phone.length === 10 && !loading ? 'pointer' : 'not-allowed', opacity: phone.length === 10 ? 1 : 0.55 }}>
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
              style={{ border: 'none', background: 'transparent', color: 'var(--gb-primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, margin: '10px auto 0' }}
            >
              <MS name="chevron_left" size={18} />Edit number
            </button>
            <div style={{ fontSize: 14, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 10, marginBottom: 22, textAlign: 'center' }}>
              Sent to <b style={{ color: 'var(--gb-text)' }}>+91 {phone}</b>
            </div>
            <div style={{ display: 'flex', gap: 9, justifyContent: 'center' }}>
              {digits.map((d, i) => {
                const filled = !!d.trim();
                return (
                  <input
                    key={i}
                    ref={(el) => { boxes.current[i] = el; }}
                    value={d.trim()}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Backspace' && !d.trim() && i > 0) boxes.current[i - 1]?.focus(); if (e.key === 'Enter' && otp.length === 6) verifyOtp(); }}
                    inputMode="numeric" maxLength={1}
                    style={{ width: 46, height: 58, textAlign: 'center', fontSize: 24, fontWeight: 700, borderRadius: 14, outline: 'none', border: `1.5px solid ${filled ? 'var(--gb-primary)' : '#E7DCCC'}`, background: filled ? 'var(--gb-primary-pale)' : '#fff', color: 'var(--gb-text)', fontFamily: 'var(--gb-sans)' }}
                  />
                );
              })}
            </div>
            <button onClick={verifyOtp} disabled={otp.length !== 6 || loading} style={{ width: '100%', marginTop: 22, background: 'var(--gb-primary)', color: '#fff', border: 'none', borderRadius: 14, height: 56, fontSize: 16, fontWeight: 800, boxShadow: '0 12px 24px -10px rgba(177,90,50,.6)', cursor: otp.length === 6 && !loading ? 'pointer' : 'not-allowed', opacity: otp.length === 6 ? 1 : 0.55 }}>
              {loading ? 'Verifying…' : 'Verify & continue'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--gb-muted)', fontWeight: 600 }}>
              {timer > 0 ? <span>Resend code in {timer}s</span> : <button onClick={sendOtp} style={{ border: 'none', background: 'transparent', color: 'var(--gb-primary)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Resend OTP</button>}
            </div>
          </>
        )}

        {error && <p style={{ color: 'var(--gb-danger)', fontSize: 14, marginTop: 14, textAlign: 'center' }}>{error}</p>}
      </div>
    </div>
  );
}
