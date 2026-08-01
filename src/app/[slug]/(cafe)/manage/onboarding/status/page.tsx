'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { MS } from '@/components/gb/kit';
import { primaryButtonStyle, secondaryButtonStyle } from '../shared';

type Status =
  | 'not_started' | 'in_progress' | 'submitted'
  | 'vendor_pending' | 'merchant_pending' | 'active' | 'rejected';

interface View {
  status: Status;
  rejection_reason: string | null;
  onboarding_link: string | null;
  onboarding_link_expires_at: string | null;
}

const CONTENT: Record<Status, { icon: string; color: string; title: string; body: string }> = {
  not_started: { icon: 'hourglass_empty', color: 'var(--gb-muted)', title: 'Not started', body: 'Complete the earlier steps first.' },
  in_progress: { icon: 'hourglass_empty', color: 'var(--gb-muted)', title: 'Still in progress', body: 'Finish the remaining steps to submit.' },
  submitted: { icon: 'schedule', color: 'var(--gb-gold)', title: 'Almost there', body: 'One last step to confirm it’s really you.' },
  merchant_pending: { icon: 'schedule', color: 'var(--gb-gold)', title: 'Almost there', body: 'One last step to confirm it’s really you.' },
  // Retired Easy Split state. Older rows can still land here.
  vendor_pending: { icon: 'schedule', color: 'var(--gb-gold)', title: "You're under review", body: "We're verifying your payout details." },
  active: { icon: 'check_circle', color: 'var(--gb-green)', title: "You're live!", body: 'Customers can now find and order from your café on Grabit.' },
  rejected: { icon: 'error', color: 'var(--gb-danger)', title: 'Needs another look', body: 'Something didn’t verify, fix it and resubmit.' },
};

const WAITING = {
  icon: 'schedule',
  color: 'var(--gb-gold)',
  title: 'Under review',
  body: 'Your details are with our payment partner. Approval usually lands within two working days, and we’ll text you the moment you’re live. Nothing else for you to do.',
};

export default function StatusStep() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  // Cashfree returns the owner here with ?done=1 once they finish the hosted step.
  const [justFinished, setJustFinished] = useState(false);
  useEffect(() => {
    setJustFinished(new URLSearchParams(window.location.search).get('done') === '1');
  }, []);

  const [view, setView] = useState<View | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    () => fetch('/api/proxy/grabit/vendor/onboarding').then((r) => r.json()) as Promise<View>,
    [],
  );

  useEffect(() => {
    let stop = false;
    const tick = () => load().then((d) => { if (!stop) setView(d); }).catch(() => {});
    tick();
    const poll = setInterval(tick, 6000);
    return () => { stop = true; clearInterval(poll); };
  }, [load]);

  async function getFreshLink() {
    setRefreshing(true);
    setError('');
    try {
      const res = await fetch('/api/proxy/grabit/vendor/onboarding/link', { method: 'POST' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Could not get a new link');
      setView(d);
      if (d.onboarding_link) window.location.href = d.onboarding_link;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setRefreshing(false);
    }
  }

  if (!view) return null;

  const awaitingKyc = view.status === 'submitted' || view.status === 'merchant_pending';
  const linkExpired =
    !!view.onboarding_link_expires_at && new Date(view.onboarding_link_expires_at) <= new Date();
  // Only push them into the hosted step if they have not already been through it.
  const needsHostedStep = awaitingKyc && !justFinished;

  const c = needsHostedStep ? CONTENT[view.status] : awaitingKyc ? WAITING : CONTENT[view.status];

  return (
    <div className="gb-app">
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', padding: '80px 26px 40px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gb-primary-soft)', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
          <MS name={c.icon} size={32} fill color={c.color} />
        </div>
        <div className="gb-serif" style={{ fontSize: 26, fontWeight: 500, marginTop: 18 }}>{c.title}</div>
        <div style={{ fontSize: 14.5, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 8, lineHeight: 1.5 }}>{c.body}</div>

        {needsHostedStep && (
          <>
            <div style={{ marginTop: 16, background: 'var(--gb-primary-soft)', border: '1px solid #EAD6C4', borderRadius: 14, padding: 14, fontSize: 13, color: 'var(--gb-text)', fontWeight: 600, textAlign: 'left', lineHeight: 1.5 }}>
              We’ve already sent your documents across. All that’s left is a one-time OTP to your
              registered number. Takes about a minute, and there’s no account to create.
            </div>
            {view.onboarding_link && !linkExpired ? (
              <a href={view.onboarding_link} style={{ ...primaryButtonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                Finish verification
              </a>
            ) : (
              <button onClick={getFreshLink} disabled={refreshing} style={primaryButtonStyle}>
                {refreshing ? 'Getting your link…' : 'Get a fresh link'}
              </button>
            )}
            <p style={{ fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 10 }}>
              Links stay valid for an hour. If yours has expired, grab a fresh one above.
            </p>
          </>
        )}

        {view.status === 'rejected' && view.rejection_reason && (
          <div style={{ marginTop: 14, background: '#FBEAE8', border: '1px solid #F3CFC9', borderRadius: 12, padding: 14, fontSize: 13, color: 'var(--gb-danger)', fontWeight: 600, textAlign: 'left' }}>
            {view.rejection_reason}
          </div>
        )}

        {view.status === 'active' && (
          <Link href={`/${slug}/manage`} style={{ ...primaryButtonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Go to dashboard
          </Link>
        )}
        {view.status === 'rejected' && (
          <button onClick={() => router.push(`/${slug}/manage/onboarding/kyc`)} style={primaryButtonStyle}>
            Fix &amp; resubmit
          </button>
        )}
        {(view.status === 'in_progress' || view.status === 'not_started') && (
          <button onClick={() => router.push(`/${slug}/manage/onboarding/business`)} style={secondaryButtonStyle}>
            Continue onboarding
          </button>
        )}

        {awaitingKyc && (
          <button onClick={() => router.push(`/${slug}/manage/menu`)} style={secondaryButtonStyle}>
            Set up your menu meanwhile
          </button>
        )}

        {error && <p style={{ color: 'var(--gb-danger)', fontSize: 14, marginTop: 12 }}>{error}</p>}
      </div>
    </div>
  );
}
