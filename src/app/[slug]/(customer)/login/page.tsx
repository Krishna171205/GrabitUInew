'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, GrabitLogo, Icon } from '@/components/ui/kit';

type Step = 'phone' | 'otp';

export default function LoginPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState(process.env.NEXT_PUBLIC_DEV_PHONE ?? '');
  const [otp, setOtp] = useState(process.env.NEXT_PUBLIC_DEV_OTP ?? '');
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

  // Resend countdown + focus first box when OTP step opens.
  useEffect(() => {
    if (step !== 'otp') return;
    setTimer(28);
    const iv = setInterval(() => setTimer(t => (t <= 1 ? (clearInterval(iv), 0) : t - 1)), 1000);
    const f = setTimeout(() => boxes.current[0]?.focus(), 250);
    return () => { clearInterval(iv); clearTimeout(f); };
  }, [step]);

  const digits = otp.padEnd(6).slice(0, 6).split('');
  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, '').slice(-1);
    const next = (digits.map(c => c.trim()).join('').padEnd(6).split(''));
    next[i] = d || ' ';
    const joined = next.join('').replace(/\s/g, '');
    setOtp(joined.slice(0, 6));
    if (d && i < 5) boxes.current[i + 1]?.focus();
  };
  const onKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i]?.trim() && i > 0) boxes.current[i - 1]?.focus();
    if (e.key === 'Enter' && otp.length === 6) verifyOtp();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
      {/* top bar with close */}
      <div style={{ flex: 'none', height: 56, display: 'flex', alignItems: 'center', padding: '0 14px' }}>
        <Link href="/" aria-label="Back to cafes" style={{ width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--surface-container)', color: 'var(--on-surface)' }}>
          {Icon.close({ size: 20 })}
        </Link>
      </div>

      {/* content */}
      <div className="noscroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px 32px', maxWidth: 420, width: '100%', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}><GrabitLogo height={30} /></div>

        {step === 'phone' ? (
          <>
            <div className="t-title" style={{ textAlign: 'center' }}>Log in to continue</div>
            <div className="t-caption" style={{ textAlign: 'center', marginTop: 6, marginBottom: 26 }}>
              We&apos;ll send a one-time code to confirm your number.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1.5px solid var(--hairline-strong)', borderRadius: 'var(--r-md)', padding: '0 16px', height: 58, marginBottom: 16, background: 'var(--surface-card)' }}>
              <span className="t-label" style={{ fontSize: 16 }}>🇮🇳 +91</span>
              <div style={{ width: 1, height: 24, background: 'var(--hairline)' }} />
              <input
                autoFocus
                type="tel"
                inputMode="numeric"
                placeholder="98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={e => e.key === 'Enter' && phone.length === 10 && sendOtp()}
                className="tabular"
                style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'var(--font)', fontSize: 18, fontWeight: 600, letterSpacing: '0.04em', background: 'transparent', color: 'var(--on-surface)' }}
              />
            </div>
            <Button full disabled={phone.length !== 10 || loading} onClick={sendOtp}>
              {loading ? 'Sending…' : 'Send OTP'}
            </Button>
            <div className="t-caption" style={{ textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
              By continuing you agree to Grabit&apos;s Terms &amp; Privacy Policy.
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
              style={{ border: 'none', background: 'transparent', color: 'var(--primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3, marginBottom: 8, alignSelf: 'center' }}
            >
              {Icon.chevL({ size: 16 })} Edit number
            </button>
            <div className="t-title" style={{ textAlign: 'center' }}>Enter the code</div>
            <div className="t-caption" style={{ textAlign: 'center', marginTop: 6, marginBottom: 26 }}>
              Sent to <b className="tabular">+91 {phone}</b>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 22 }}>
              {digits.map((d, i) => {
                const filled = !!d.trim();
                return (
                  <input
                    key={i}
                    ref={el => { boxes.current[i] = el; }}
                    value={d.trim()}
                    onChange={e => setDigit(i, e.target.value)}
                    onKeyDown={e => onKey(i, e)}
                    inputMode="numeric"
                    maxLength={1}
                    className="tabular"
                    style={{
                      width: 46, height: 58, textAlign: 'center', fontSize: 24, fontWeight: 700,
                      borderRadius: 'var(--r-md)', outline: 'none',
                      border: `1.5px solid ${filled ? 'var(--primary)' : 'var(--hairline-strong)'}`,
                      background: filled ? 'var(--primary-tint)' : 'var(--surface-card)',
                      color: 'var(--on-surface)',
                    }}
                  />
                );
              })}
            </div>
            <Button full disabled={otp.length !== 6 || loading} onClick={verifyOtp}>
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </Button>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 18 }}>
              {timer > 0
                ? <span className="t-caption tabular">Resend code in {timer}s</span>
                : <button onClick={sendOtp} style={{ border: 'none', background: 'transparent', color: 'var(--primary)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Resend OTP</button>}
            </div>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <button style={{ border: 'none', background: 'transparent', color: 'var(--muted)', fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                {Icon.phone({ size: 14 })} Get code by voice call
              </button>
            </div>
          </>
        )}

        {error && (
          <p style={{ color: 'var(--error)', fontSize: 14, marginTop: 14, textAlign: 'center' }}>{error}</p>
        )}
      </div>
    </div>
  );
}
