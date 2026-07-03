'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { MS } from '@/components/gb/kit';
import { primaryButtonStyle, secondaryButtonStyle } from '../shared';

type Status = 'not_started' | 'in_progress' | 'submitted' | 'vendor_pending' | 'active' | 'rejected';

const CONTENT: Record<Status, { icon: string; color: string; title: string; body: string }> = {
  not_started: { icon: 'hourglass_empty', color: 'var(--gb-muted)', title: 'Not started', body: 'Complete the earlier steps first.' },
  in_progress: { icon: 'hourglass_empty', color: 'var(--gb-muted)', title: 'Still in progress', body: 'Finish the remaining steps to submit.' },
  submitted: { icon: 'schedule', color: 'var(--gb-gold)', title: "You're under review", body: "We're verifying your details. This usually takes a day or two." },
  vendor_pending: { icon: 'schedule', color: 'var(--gb-gold)', title: "You're under review", body: "We're verifying your payout details. This usually takes a day or two." },
  active: { icon: 'check_circle', color: 'var(--gb-green)', title: "You're live!", body: 'Customers can now find and order from your café on Grabit.' },
  rejected: { icon: 'error', color: 'var(--gb-danger)', title: 'Needs another look', body: 'Something didn’t verify — fix it and resubmit.' },
};

export default function StatusStep() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<Status | null>(null);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    let stop = false;
    const load = () =>
      fetch('/api/proxy/grabit/vendor/onboarding')
        .then((r) => r.json())
        .then((d) => { if (!stop) { setStatus(d.status); setReason(d.rejection_reason); } });
    load();
    const poll = setInterval(load, 6000);
    return () => { stop = true; clearInterval(poll); };
  }, []);

  if (!status) return null;
  const c = CONTENT[status];

  return (
    <div className="gb-app">
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', padding: '80px 26px 40px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gb-primary-soft)', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
          <MS name={c.icon} size={32} fill color={c.color} />
        </div>
        <div className="gb-serif" style={{ fontSize: 26, fontWeight: 500, marginTop: 18 }}>{c.title}</div>
        <div style={{ fontSize: 14.5, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 8, lineHeight: 1.5 }}>{c.body}</div>
        {status === 'rejected' && reason && (
          <div style={{ marginTop: 14, background: '#FBEAE8', border: '1px solid #F3CFC9', borderRadius: 12, padding: 14, fontSize: 13, color: 'var(--gb-danger)', fontWeight: 600, textAlign: 'left' }}>
            {reason}
          </div>
        )}

        {status === 'active' && (
          <Link href={`/${slug}/manage`} style={{ ...primaryButtonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Go to dashboard
          </Link>
        )}
        {status === 'rejected' && (
          <button onClick={() => router.push(`/${slug}/manage/onboarding/bank`)} style={primaryButtonStyle}>
            Fix &amp; resubmit
          </button>
        )}
        {(status === 'in_progress' || status === 'not_started') && (
          <button onClick={() => router.push(`/${slug}/manage/onboarding/business`)} style={secondaryButtonStyle}>
            Continue onboarding
          </button>
        )}
      </div>
    </div>
  );
}
