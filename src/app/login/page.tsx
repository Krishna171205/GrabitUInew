'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const OTP_LEN = 6;
const RESEND_SEC = 30;

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') ?? '/';

  const [phone, setPhone] = useState('');
  const [digits, setDigits] = useState<string[]>(Array(OTP_LEN).fill(''));
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otp = digits.join('');

  // Derive a human-readable cafe name from the ?next param
  const cafeLabel =
    nextPath && nextPath !== '/'
      ? nextPath
          .replace(/^\//, '')
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : null;

  // Countdown after OTP sent
  useEffect(() => {
    if (step !== 'otp') return;
    setTimer(RESEND_SEC);
    const id = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [step]);

  async function sendOtp() {
    if (phone.length !== 10 || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/grabit/auth/send-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, type: 'customer' }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setStep('otp');
      setTimeout(() => inputRefs.current[0]?.focus(), 80);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(code?: string) {
    const finalOtp = code ?? otp;
    if (finalOtp.length !== OTP_LEN || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: finalOtp, type: 'customer' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      router.replace(nextPath);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  function handleDigit(index: number, value: string) {
    const d = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = d;
    setDigits(next);
    if (d && index < OTP_LEN - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-verify when last box filled
    if (d && index === OTP_LEN - 1) {
      const full = next.join('');
      if (full.length === OTP_LEN) verifyOtp(full);
    }
  }

  function handleKey(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  }

  function resetToPhone() {
    setStep('phone');
    setDigits(Array(OTP_LEN).fill(''));
    setError('');
  }

  const phoneReady = phone.length === 10 && !loading;
  const otpReady = otp.length === OTP_LEN && !loading;

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.03em', color: '#1a1a1a', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Grab<span style={{ color: '#FF6B00' }}>it</span>
          </span>
        </Link>
        {cafeLabel && (
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#5a5c5e' }}>
            {cafeLabel}
          </span>
        )}
      </header>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '28px 24px 40px',
          maxWidth: '420px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        {/* Icon */}
        <div style={{ fontSize: '44px', marginBottom: '20px' }}>☕</div>

        {/* Headline */}
        <h1
          style={{
            fontSize: '34px',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '10px',
            color: '#1a1a1a',
          }}
        >
          Order ahead.<br />Skip the queue.
        </h1>
        <p style={{ fontSize: '15px', color: '#5a5c5e', marginBottom: '32px', lineHeight: 1.6 }}>
          Enter your mobile number to get started. We&apos;ll send a one-time code.
        </p>

        {/* ── Phone input ──────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            border: '2px solid #FF6B00',
            borderRadius: '14px',
            background: '#fff8f4',
            overflow: 'hidden',
            marginBottom: '14px',
            transition: 'border-color 0.2s',
          }}
        >
          <span
            style={{
              padding: '0 14px',
              fontSize: '15px',
              fontWeight: 700,
              color: '#2d2f31',
              borderRight: '1px solid rgba(255,107,0,0.18)',
              height: '54px',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            +91
          </span>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="98765 43210"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
            style={{
              flex: 1,
              padding: '0 16px',
              fontSize: '17px',
              fontWeight: 600,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              height: '54px',
              color: '#1a1a1a',
            }}
          />
        </div>

        {/* ── Send OTP button ──────────────────────────────────────────── */}
        <button
          onClick={sendOtp}
          disabled={!phoneReady}
          style={{
            width: '100%',
            height: '54px',
            borderRadius: '980px',
            border: 'none',
            background: '#FF6B00',
            color: '#fff',
            opacity: phoneReady ? 1 : 0.35,
            fontSize: '17px',
            fontWeight: 700,
            cursor: phoneReady ? 'pointer' : 'not-allowed',
            transition: 'opacity 0.2s',
            marginBottom: '28px',
            boxShadow: phoneReady ? '0 8px 24px rgba(255,107,0,0.28)' : 'none',
            letterSpacing: '-0.01em',
          }}
        >
          {loading && step === 'phone' ? 'Sending…' : 'Send OTP →'}
        </button>

        {/* ── OTP section (shown after SMS sent) ───────────────────────── */}
        {step === 'otp' && (
          <>
            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '22px',
              }}
            >
              <div style={{ flex: 1, height: '1px', background: '#ebebeb' }} />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#b0b0b0',
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                }}
              >
                — OR ENTER OTP —
              </span>
              <div style={{ flex: 1, height: '1px', background: '#ebebeb' }} />
            </div>

            {/* Digit boxes */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'center',
                marginBottom: '18px',
              }}
            >
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigit(i, e.target.value)}
                  onKeyDown={(e) => handleKey(i, e)}
                  style={{
                    width: '48px',
                    height: '56px',
                    borderRadius: '14px',
                    border: d ? '2.5px solid #FF6B00' : '2px solid #e0e0e0',
                    background: d ? '#fff8f4' : '#fafafa',
                    textAlign: 'center',
                    fontSize: '22px',
                    fontWeight: 800,
                    color: '#FF6B00',
                    outline: 'none',
                    transition: 'border 0.15s, background 0.15s',
                    cursor: 'text',
                  }}
                />
              ))}
            </div>

            {/* Resend timer */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              {timer > 0 ? (
                <p style={{ fontSize: '13px', color: '#aaa', fontWeight: 600 }}>
                  Resend in 0:{timer.toString().padStart(2, '0')}
                </p>
              ) : (
                <button
                  onClick={() => {
                    setDigits(Array(OTP_LEN).fill(''));
                    sendOtp();
                  }}
                  style={{
                    fontSize: '13px',
                    color: '#FF6B00',
                    fontWeight: 700,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* Confirm button — appears when all digits filled */}
            {otpReady && (
              <button
                onClick={() => verifyOtp()}
                style={{
                  width: '100%',
                  height: '54px',
                  borderRadius: '980px',
                  border: 'none',
                  background: '#FF6B00',
                  color: '#fff',
                  fontSize: '17px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(255,107,0,0.28)',
                  marginBottom: '12px',
                  letterSpacing: '-0.01em',
                }}
              >
                {loading ? 'Verifying…' : 'Confirm →'}
              </button>
            )}

            <button
              onClick={resetToPhone}
              style={{
                width: '100%',
                textAlign: 'center',
                fontSize: '13px',
                color: '#aaa',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                padding: '8px 0',
              }}
            >
              Change number
            </button>
          </>
        )}

        {/* Error */}
        {error && (
          <p style={{ color: '#b02500', fontSize: '14px', marginTop: '12px', fontWeight: 600 }}>
            {error}
          </p>
        )}

        {/* Legal */}
        <p
          style={{
            fontSize: '12px',
            color: '#b0b0b0',
            marginTop: 'auto',
            paddingTop: '36px',
            textAlign: 'center',
            lineHeight: 1.7,
          }}
        >
          By continuing you agree to our{' '}
          <Link href="/terms" style={{ color: '#FF6B00', fontWeight: 600, textDecoration: 'none' }}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" style={{ color: '#FF6B00', fontWeight: 600, textDecoration: 'none' }}>
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      {/* ── Bottom accent bar ─────────────────────────────────────────── */}
      <div
        style={{
          height: '4px',
          background: 'linear-gradient(to right, #FF6B00, #ff8533, #ffc69f)',
        }}
      />
    </div>
  );
}

// useSearchParams requires Suspense in Next.js 15
export default function LoginPageWrapper() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}
