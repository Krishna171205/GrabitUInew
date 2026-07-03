'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MS } from '@/components/gb/kit';
import { ph } from '@/components/gb/data';

type Step = 'phone' | 'otp';
type Mode = 'login' | 'signup';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.9 6.1C12.2 13.7 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7C43.8 37.9 46.5 31.8 46.5 24.5z" />
      <path fill="#FBBC05" d="M10.4 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.9-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.7l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.3-5.6l-7.3-5.7c-2 1.4-4.7 2.3-8 2.3-6.4 0-11.8-4.2-13.6-9.9l-7.9 6.1C6.4 42.6 14.6 48 24 48z" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const item = params.get('item');
  const next = params.get('next') || '/home';

  const [mode, setMode] = useState<Mode>('login');
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState(process.env.NEXT_PUBLIC_DEV_PHONE ?? '');
  const [otp, setOtp] = useState(process.env.NEXT_PUBLIC_DEV_OTP ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const valid = phone.length === 10;

  async function sendOtp() {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/auth/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, type: 'customer' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setStep('otp');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally { setLoading(false); }
  }

  async function verifyOtp() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/customer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, type: 'customer' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      const hasProfile = !!data.customer?.name;
      router.replace(hasProfile ? next : `/complete-profile?next=${encodeURIComponent(next)}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally { setLoading(false); }
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
    const nextD = digits.map((c) => c.trim()).join('').padEnd(6).split('');
    nextD[i] = d || ' ';
    setOtp(nextD.join('').replace(/\s/g, '').slice(0, 6));
    if (d && i < 5) boxes.current[i + 1]?.focus();
  };

  return (
    <>
      {/* hero image */}
      <div style={{ position: 'relative', height: 296, flex: 'none' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ph('photo-1495474472287-4d71bcdd2085', 900, 1000)} alt="Café" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(40,24,16,.45) 0%,rgba(40,24,16,0) 26%,rgba(40,24,16,.55) 74%,#FAF6F0 100%)' }} />
        <div style={{ position: 'absolute', bottom: 30, left: 26, right: 26, color: '#fff' }}>
          <div className="gb-serif" style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-.02em', lineHeight: 1 }}>Grabit</div>
          <div className="gb-serif" style={{ fontSize: 18, fontWeight: 400, lineHeight: 1.3, marginTop: 6, maxWidth: 280 }}>
            Order ahead from cafés near you. <span style={{ fontStyle: 'italic', color: 'var(--gb-peach)' }}>Skip the queue.</span>
          </div>
        </div>
      </div>

      {/* form sheet */}
      <div style={{ flex: 1, background: 'var(--gb-surface)', padding: '14px 26px 30px', position: 'relative', zIndex: 2 }}>
        {step === 'phone' ? (
          <>
            {item && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F7ECE4', border: '1px solid #F0D9C8', borderRadius: 12, padding: '10px 12px', marginBottom: 16 }}>
                <MS name="shopping_cart" size={20} fill color="var(--gb-primary)" />
                <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: '#7A4A30', lineHeight: 1.35 }}>
                  Sign in to add <b style={{ fontWeight: 800 }}>{item}</b> to your cart & place your pickup order
                </span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 4, background: '#F1EAE0', borderRadius: 12, padding: 4, marginBottom: 16 }}>
              {(['login', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1, height: 36, border: 'none', borderRadius: 9, cursor: 'pointer',
                    fontSize: 13.5, fontWeight: 700, fontFamily: 'var(--gb-sans)',
                    background: mode === m ? '#fff' : 'transparent',
                    color: mode === m ? 'var(--gb-text)' : 'var(--gb-muted)',
                    boxShadow: mode === m ? '0 2px 6px -2px rgba(60,40,25,.3)' : 'none',
                  }}
                >
                  {m === 'login' ? 'Log in' : 'Sign up'}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--gb-primary)' }}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </div>
            <div style={{ fontSize: 14, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 6, lineHeight: 1.4 }}>
              {mode === 'login'
                ? "Enter your mobile number — we'll text you a one-time code."
                : "Enter your mobile number to get started — we'll text you a one-time code."}
            </div>

            {/* phone field */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 16, background: '#fff', border: '1.5px solid var(--gb-primary)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 0 0 4px rgba(177,90,50,.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 56, borderRight: '1px solid #EEE4D6' }}>
                <span style={{ fontSize: 16 }}>🇮🇳</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--gb-text)' }}>+91</span>
                <MS name="expand_more" size={18} color="#B0A392" />
              </div>
              <input
                autoFocus type="tel" inputMode="numeric" placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={(e) => e.key === 'Enter' && valid && sendOtp()}
                style={{ flex: 1, minWidth: 0, height: 56, padding: '0 14px', border: 'none', outline: 'none', fontSize: 17, fontWeight: 700, letterSpacing: '.02em', color: 'var(--gb-text)', background: 'transparent', fontFamily: 'var(--gb-sans)' }}
              />
              <MS name="check_circle" size={22} fill color="var(--gb-veg)" style={{ paddingRight: 14, opacity: valid ? 1 : 0.25 }} />
            </div>

            <button onClick={sendOtp} disabled={!valid || loading} style={{ width: '100%', marginTop: 16, background: 'var(--gb-primary)', color: '#fff', border: 'none', borderRadius: 14, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 12px 24px -10px rgba(177,90,50,.6)', cursor: valid && !loading ? 'pointer' : 'not-allowed', opacity: valid ? 1 : 0.55 }}>
              <span style={{ fontSize: 16, fontWeight: 800 }}>{loading ? 'Sending…' : 'Continue'}</span>
              {!loading && <MS name="arrow_forward" size={20} />}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '18px 0' }}>
              <span style={{ flex: 1, height: 1, background: '#EAE0D2' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#B0A392', letterSpacing: '.06em' }}>OR</span>
              <span style={{ flex: 1, height: 1, background: '#EAE0D2' }} />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, height: 52, background: '#fff', border: '1px solid #E7DCCC', borderRadius: 13, fontSize: 14.5, fontWeight: 700, color: 'var(--gb-text)', cursor: 'pointer' }}>
                <GoogleIcon />Google
              </button>
              <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, background: '#1A1714', border: '1px solid #1A1714', borderRadius: 13, fontSize: 14.5, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                <MS name="phone_iphone" size={19} fill />Apple
              </button>
            </div>

            <div style={{ textAlign: 'center', fontSize: 11.5, color: '#A0917E', fontWeight: 500, lineHeight: 1.5, marginTop: 18 }}>
              By continuing you agree to Grabit&apos;s<br />
              <span style={{ color: '#7A6E60', fontWeight: 700 }}>Terms of Service</span> and <span style={{ color: '#7A6E60', fontWeight: 700 }}>Privacy Policy</span>
            </div>
          </>
        ) : (
          <>
            <button onClick={() => { setStep('phone'); setOtp(''); setError(''); }} style={{ border: 'none', background: 'transparent', color: 'var(--gb-primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3, marginBottom: 10 }}>
              <MS name="chevron_left" size={18} />Edit number
            </button>
            <div className="gb-serif" style={{ fontSize: 26, fontWeight: 500 }}>Enter the code</div>
            <div style={{ fontSize: 14, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 6 }}>Sent to <b style={{ color: 'var(--gb-text)' }}>+91 {phone}</b></div>

            <div style={{ display: 'flex', gap: 9, marginTop: 22 }}>
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
                    style={{ flex: 1, height: 60, textAlign: 'center', fontSize: 24, fontWeight: 700, borderRadius: 14, outline: 'none', border: `1.5px solid ${filled ? 'var(--gb-primary)' : '#E7DCCC'}`, background: filled ? 'var(--gb-primary-pale)' : '#fff', color: 'var(--gb-text)', fontFamily: 'var(--gb-sans)' }}
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
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="gb-app">
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--gb-surface)' }}>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
