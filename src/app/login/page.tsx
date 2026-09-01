'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MS } from '@/components/gb/kit';
import GrabbitCup3D from '@/components/cup3d/GrabbitCup3D';

type Step = 'phone' | 'otp';
type Mode = 'login' | 'signup';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const item = params.get('item');
  const next = params.get('next') || '/home';

  const [mode, setMode] = useState<Mode>(params.get('mode') === 'signup' ? 'signup' : 'login');
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [timer, setTimer] = useState(0);
  // Bumped on every send. The cooldown used to key off `step`, which does not change
  // when someone taps Resend, so after the first 28s the button stayed live forever and
  // each tap bought another SMS.
  const [sends, setSends] = useState(0);
  const [showNoAccount, setShowNoAccount] = useState(false);
  // Splash first, brand-only, then auto-advances into the form - no tap required.
  const [entered, setEntered] = useState(false);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const valid = phone.length === 10;

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 1400);
    return () => clearTimeout(t);
  }, []);

  async function sendOtp() {
    setLoading(true); setError(''); setOtpError(false);
    try {
      if (mode === 'login') {
        const existsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/auth/customer-exists?phone=${phone}`);
        const existsData = await existsRes.json();
        if (existsRes.ok && !existsData.exists) {
          setLoading(false);
          setShowNoAccount(true);
          return;
        }
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/auth/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, type: 'customer' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setSends((n) => n + 1);
      setStep('otp');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      // A refused resend still has to sit out the cooldown, so the button comes back
      // after the countdown rather than instantly, inviting the same rejection.
      if (step === 'otp') setSends((n) => n + 1);
    } finally { setLoading(false); }
  }

  async function verifyOtp() {
    setLoading(true); setError(''); setOtpError(false);
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
      setOtpError(true);
      setOtp('');
      setTimeout(() => boxes.current[0]?.focus(), 50);
    } finally { setLoading(false); }
  }

  useEffect(() => {
    if (step !== 'otp') return;
    // 30s to match the server's cooldown. A shorter countdown just offers a button that
    // comes back with "please wait 4 seconds".
    setTimer(30);
    const iv = setInterval(() => setTimer((t) => (t <= 1 ? (clearInterval(iv), 0) : t - 1)), 1000);
    const f = setTimeout(() => boxes.current[0]?.focus(), 250);
    return () => { clearInterval(iv); clearTimeout(f); };
  }, [step, sends]);

  // Auto-submit once all 6 digits are in (typed or SMS-autofilled), after a brief
  // animated pause on the button so the submit doesn't feel instant/jarring. Guarded
  // by a ref (not state) so a retry after a wrong code - which clears otp back to ''
  // - can trigger this again without double-firing mid-animation.
  const autoSubmitted = useRef(false);
  useEffect(() => {
    if (otp.length !== 6) { autoSubmitted.current = false; return; }
    if (loading || otpError || autoSubmitted.current) return;
    autoSubmitted.current = true;
    const t = setTimeout(() => verifyOtp(), 550);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, loading, otpError]);

  const digits = otp.padEnd(6).slice(0, 6).split('');
  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, '').slice(-1);
    const nextD = digits.map((c) => c.trim()).join('').padEnd(6).split('');
    nextD[i] = d || ' ';
    setOtp(nextD.join('').replace(/\s/g, '').slice(0, 6));
    setOtpError(false); setError('');
    if (d && i < 5) boxes.current[i + 1]?.focus();
  };

  return (
    <>
      {/* hero — starts as a full-screen brand splash, then morphs (via layout animation)
          into the band above the form on a phone / left half of the card on a laptop.
          Solid brand blue + the same 3D cup used on the landing footer, no stock photo. */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 190, damping: 24 }}
        className="gb-login-hero"
        style={entered
          ? { position: 'relative', height: 296, flex: 'none', overflow: 'hidden', background: 'linear-gradient(155deg, #0055D4 0%, #0040A1 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }
          : { position: 'fixed', inset: 0, zIndex: 100, overflow: 'hidden', background: 'linear-gradient(155deg, #0055D4 0%, #0040A1 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      >
        <div aria-hidden="true" style={{ position: 'absolute', top: -70, left: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: -90, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />

        <div style={{ position: 'relative', width: 130, height: 130 }}>
          <GrabbitCup3D variant="spot" />
        </div>
        <div className="gb-serif" style={{ position: 'relative', fontSize: 28, fontWeight: 500, color: '#fff', lineHeight: 1.1 }}>
          Welcome to Grabbit
        </div>
        {/* Sentence-length copy, not a label - stays in the sans body face rather
            than the display font used for real headlines, same split the landing
            page itself draws between its Anton headlines and its plain-sans
            supporting lines. */}
        <div style={{ position: 'relative', fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,.85)', marginTop: 8, textAlign: 'center', maxWidth: 260 }}>
          Order ahead from cafés near you. Skip the queue.
        </div>

      </motion.div>

      {/* form sheet — mounts only once the splash has been dismissed */}
      <AnimatePresence>
        {entered && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="gb-login-form"
            style={{ flex: 1, background: 'var(--gb-surface)', padding: '14px 26px 30px', position: 'relative', zIndex: 2 }}
          >
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
                    boxShadow: mode === m ? '0 2px 6px -2px rgba(15,23,42,.3)' : 'none',
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
                ? "Enter your mobile number, we'll text you a one-time code."
                : "Enter your mobile number to get started, we'll text you a one-time code."}
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

            <div style={{ textAlign: 'center', fontSize: 11.5, color: '#A0917E', fontWeight: 500, lineHeight: 1.5, marginTop: 24 }}>
              By continuing you agree to Grabbit&apos;s<br />
              <span style={{ color: '#7A6E60', fontWeight: 700 }}>Terms of Service</span> and <span style={{ color: '#7A6E60', fontWeight: 700 }}>Privacy Policy</span>
            </div>
          </>
        ) : (
          <>
            <button onClick={() => { setStep('phone'); setOtp(''); setError(''); setOtpError(false); }} style={{ border: 'none', background: 'transparent', color: 'var(--gb-primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3, marginBottom: 10 }}>
              <MS name="chevron_left" size={18} />Edit number
            </button>
            <div className="gb-serif" style={{ fontSize: 26, fontWeight: 500 }}>Enter the code</div>
            <div style={{ fontSize: 14, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 6 }}>Sent to <b style={{ color: 'var(--gb-text)' }}>+91 {phone}</b></div>

            <div className={otpError ? 'gb-shake' : undefined} style={{ display: 'flex', gap: 9, marginTop: 22 }}>
              {digits.map((d, i) => {
                const filled = !!d.trim();
                return (
                  <input
                    key={i}
                    ref={(el) => { boxes.current[i] = el; }}
                    value={d.trim()}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Backspace' && !d.trim() && i > 0) boxes.current[i - 1]?.focus(); if (e.key === 'Enter' && otp.length === 6) verifyOtp(); }}
                    inputMode="numeric" maxLength={1} autoComplete="one-time-code"
                    style={{
                      flex: 1, minWidth: 0, height: 60, textAlign: 'center', fontSize: 24, fontWeight: 700, borderRadius: 14, outline: 'none', fontFamily: 'var(--gb-sans)',
                      border: `1.5px solid ${otpError ? 'var(--gb-danger)' : filled ? 'var(--gb-primary)' : '#E7DCCC'}`,
                      background: otpError ? '#FBEAE7' : filled ? 'var(--gb-primary-pale)' : '#fff',
                      color: otpError ? 'var(--gb-danger)' : 'var(--gb-text)',
                    }}
                  />
                );
              })}
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
                <MS name="error" size={16} fill color="var(--gb-danger)" />
                <span style={{ color: 'var(--gb-danger)', fontSize: 13.5, fontWeight: 600 }}>{error}</span>
              </div>
            )}

            <button onClick={verifyOtp} disabled={otp.length !== 6 || loading} style={{ width: '100%', marginTop: 22, background: 'var(--gb-primary)', color: '#fff', border: 'none', borderRadius: 14, height: 56, fontSize: 16, fontWeight: 800, boxShadow: '0 12px 24px -10px rgba(177,90,50,.6)', cursor: otp.length === 6 && !loading ? 'pointer' : 'not-allowed', opacity: otp.length === 6 ? 1 : 0.55, position: 'relative', overflow: 'hidden' }}>
              {otp.length === 6 && !loading && (
                <span className="gb-fill-sweep" style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,.22)' }} />
              )}
              <span style={{ position: 'relative' }}>{loading ? 'Verifying…' : 'Verify & continue'}</span>
            </button>

            <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--gb-muted)', fontWeight: 600 }}>
              {timer > 0
                ? <span>Resend code in {timer}s</span>
                : <button onClick={sendOtp} disabled={loading} style={{ border: 'none', background: 'transparent', color: 'var(--gb-primary)', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.55 : 1 }}>{loading ? 'Sending…' : 'Resend OTP'}</button>}
            </div>
          </>
        )}

        {error && step === 'phone' && <p style={{ color: 'var(--gb-danger)', fontSize: 14, marginTop: 14, textAlign: 'center' }}>{error}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {showNoAccount && (
        <div
          onClick={() => setShowNoAccount(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(20,10,5,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 340, width: '100%', textAlign: 'center', boxShadow: '0 30px 60px -20px rgba(0,0,0,.5)' }}
          >
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--gb-primary-soft)', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
              <MS name="person_off" size={26} color="var(--gb-primary)" />
            </div>
            <div className="gb-serif" style={{ fontSize: 20, fontWeight: 500, marginTop: 14 }}>No account found</div>
            <div style={{ fontSize: 13.5, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 6, lineHeight: 1.4 }}>
              We couldn&apos;t find a Grabbit account for +91 {phone}. Try signing up instead.
            </div>
            <button
              onClick={() => { setMode('signup'); setShowNoAccount(false); }}
              style={{ width: '100%', marginTop: 18, background: 'var(--gb-primary)', color: '#fff', border: 'none', borderRadius: 14, padding: 13, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}
            >
              Sign up instead
            </button>
            <button
              onClick={() => setShowNoAccount(false)}
              style={{ marginTop: 10, background: 'none', border: 'none', color: 'var(--gb-muted)', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', padding: 8 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="gb-app gb-login-page">
      <div className="gb-login-shell" style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--gb-surface)' }}>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
