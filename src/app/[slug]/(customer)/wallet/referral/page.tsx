'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPaise } from '@/lib/utils';
import { TopBar, Card } from '@/components/ui/kit';

interface ReferralData {
  referralCode: string;
  totalReferred: number;
  completedReferrals: number;
  bonusEarned: number;
  referrals: Array<{ referredAt: string; status: 'pending' | 'completed' }>;
}

export default function ReferralPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [cafeId, setCafeId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/proxy/grabit/auth/me').then(r => {
        if (r.status === 401) { router.replace(`/${slug}/login`); throw new Error('unauth'); }
        return r.json();
      }),
      (() => {
        const cached = sessionStorage.getItem(`grabit_cafe_id_${slug}`);
        if (cached) return Promise.resolve(Number(cached));
        return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/menu/${slug}`)
          .then(r => r.json())
          .then(d => {
            const id = d.cafe?.id ?? null;
            if (id) sessionStorage.setItem(`grabit_cafe_id_${slug}`, String(id));
            return id;
          });
      })(),
    ])
      .then(([me, cid]) => { setCustomerId(me.id); setCafeId(cid); })
      .catch(() => {});
  }, [slug, router]);

  const { data, isLoading } = useQuery<ReferralData>({
    queryKey: ['referral', customerId, cafeId],
    queryFn: async () => {
      const res = await fetch(`/api/proxy/grabit/wallet/referral/${customerId}?cafeId=${cafeId}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: !!(customerId && cafeId),
  });

  function copyCode() {
    if (!data?.referralCode) return;
    navigator.clipboard.writeText(data.referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareWhatsApp() {
    if (!data?.referralCode) return;
    const text = encodeURIComponent(`Use my code ${data.referralCode} on Grabit to get ₹50 bonus on your first wallet recharge!`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  if (!customerId || !cafeId || isLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--surface)' }}><p style={{ color: 'var(--muted)' }}>Loading…</p></div>;
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', background: 'var(--surface)', position: 'relative' }}>
      <TopBar title="Refer & Earn" onBack={() => router.push(`/${slug}/wallet`)} />

      <div style={{ padding: '24px 20px 20px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--tertiary-bright))', display: 'grid', placeItems: 'center', fontSize: 32, margin: '0 auto 16px' }}>🎁</div>
          <p style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>Give ₹50, Get ₹50</p>
          <p className="t-body" style={{ color: 'var(--muted)' }}>Invite friends to Grabit. When they recharge their wallet for the first time, you both get ₹50 bonus.</p>
        </div>

        {/* Code card */}
        {data && (
          <div style={{ background: 'var(--surface-card)', border: '2px dashed var(--hairline-strong)', borderRadius: 'var(--r-lg)', padding: 20, textAlign: 'center', marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10, letterSpacing: '0.05em' }}>YOUR CODE</p>
            <p className="tabular" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--on-surface)', marginBottom: 16 }}>{data.referralCode}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={copyCode} style={{ background: 'var(--primary-tint)', color: 'var(--primary)', border: 'none', borderRadius: 'var(--r-pill)', padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', minWidth: 110 }}>
                <AnimatePresence mode="wait">
                  {copied
                    ? <motion.span key="c" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}>Copied!</motion.span>
                    : <motion.span key="x" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}>Copy Code</motion.span>}
                </AnimatePresence>
              </button>
              <button onClick={shareWhatsApp} style={{ background: 'var(--g-wa-green)', color: '#fff', border: 'none', borderRadius: 'var(--r-pill)', padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Share on WhatsApp</button>
            </div>
          </div>
        )}

        {/* Stats */}
        {data && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <Card style={{ flex: 1, textAlign: 'center' }}>
              <div className="tabular" style={{ fontSize: 28, fontWeight: 700, color: 'var(--on-surface)', marginBottom: 4 }}>{data.totalReferred}</div>
              <div className="t-caption">Friends Referred</div>
            </Card>
            <Card style={{ flex: 1, textAlign: 'center' }}>
              <div className="tabular" style={{ fontSize: 28, fontWeight: 700, color: 'var(--success)', marginBottom: 4 }}>{formatPaise(data.bonusEarned)}</div>
              <div className="t-caption">Bonus Earned</div>
            </Card>
          </div>
        )}

        {/* Referrals list */}
        {data && (
          <>
            <div className="t-label" style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11, marginBottom: 12 }}>Your referrals</div>
            {data.referrals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)' }}><p style={{ fontSize: 14 }}>No referrals yet — share your code!</p></div>
            ) : (
              data.referrals.map((ref, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--hairline)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-tint)', color: 'var(--primary)', fontSize: 12, fontWeight: 800, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{String.fromCharCode(65 + i)}</div>
                  <p style={{ flex: 1, fontSize: 13, color: 'var(--on-surface)' }}>Referred on {new Date(ref.referredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  <span style={{ background: ref.status === 'completed' ? 'var(--success-tint)' : 'var(--surface-container)', color: ref.status === 'completed' ? 'var(--success)' : 'var(--muted)', borderRadius: 'var(--r-pill)', padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>{ref.status === 'completed' ? 'Completed' : 'Pending'}</span>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
